import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Observable, of, throwError } from "rxjs";
import { KioskAccessStatus, KioskSettings, Product } from "../models/merchant-catalog.models";
import { NotificationService } from "../notifications/notification.service";
import { KioskApiService } from "../services/kiosk-api.service";
import { BranchKioskComponent } from "./branch-kiosk.component";

describe("BranchKioskComponent", () => {
  let fixture: ComponentFixture<BranchKioskComponent>;
  let component: BranchKioskComponent;
  let api: jasmine.SpyObj<KioskApiService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  const settings: KioskSettings = { paymentChoices: ["CARD", "CASH"], resetSeconds: 45, languages: ["de"], advertisedProductIds: ["p-1", "gone"] };
  const product = (id: string, active: boolean): Product => ({
    productId: id, merchantId: "m", branchId: "b-1", name: `Name ${id}`, unitPrice: 1, active, status: "ACTIVE",
    createdAt: "", updatedAt: "", thumbnailUrl: id === "p-1" ? "http://img/p1.png" : null,
  });
  const products = [product("p-1", true), product("p-2", true), product("p-3", false)];

  async function setup(status: Observable<KioskAccessStatus> = of({ enabled: true, login: "kiosk-1", settings }), languages = ["de", "ar"]) {
    api = jasmine.createSpyObj<KioskApiService>("KioskApiService", ["getKiosk", "enableKiosk", "disableKiosk", "saveSettings"]);
    api.getKiosk.and.returnValue(status);
    notifications = jasmine.createSpyObj<NotificationService>("NotificationService", ["success", "error", "apiError"]);
    await TestBed.configureTestingModule({
      imports: [BranchKioskComponent],
      providers: [{ provide: KioskApiService, useValue: api }, { provide: NotificationService, useValue: notifications }],
    }).compileComponents();
    fixture = TestBed.createComponent(BranchKioskComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("branchId", "b-1");
    fixture.componentRef.setInput("products", products);
    fixture.componentRef.setInput("supportedLanguages", languages);
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const q = (selector: string) => el().querySelector<HTMLInputElement>(selector)!;

  it("loads status and settings and shows the settings form when enabled", async () => {
    await setup();
    expect(q("#kiosk-switch").checked).toBeTrue();
    expect(q("#kiosk-pay-CASH").checked).toBeTrue();
    expect(q("#kiosk-pay-SCAN_TO_PAY").checked).toBeFalse();
    expect(q("#kiosk-reset-seconds").value).toBe("45");
    expect(q("#kiosk-lang-de").checked).toBeTrue();
    expect(el().textContent).toContain("Name p-2");
    expect(el().textContent).not.toContain("Name p-3");
    expect(el().querySelector("img")!.getAttribute("src")).toBe("http://img/p1.png");
    expect(el().querySelector('[data-test="kiosk-password"]')).toBeNull();
  });

  it("hides the settings when disabled and the languages when the Merchant has none", async () => {
    await setup(of({ enabled: false, login: null, settings }));
    expect(el().querySelector('[data-test="kiosk-settings"]')).toBeNull();
    TestBed.resetTestingModule();
    await setup(undefined, []);
    expect(el().querySelector("#kiosk-lang-de")).toBeNull();
  });

  it("shows the new password once on enable and drops it on disable", async () => {
    await setup(of({ enabled: false, login: null, settings }));
    api.enableKiosk.and.returnValue(of({ login: "kiosk-1", password: "Pa55" }));
    q("#kiosk-switch").checked = true;
    q("#kiosk-switch").dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(component.enabled).toBeTrue();
    expect(component.login?.password).toBe("Pa55");
    expect(el().querySelector('[data-test="kiosk-password"]')!.textContent).not.toContain("Pa55");
    component.togglePasswordReveal();
    fixture.detectChanges();
    expect(el().querySelector('[data-test="kiosk-password"]')!.textContent).toContain("Pa55");
    expect(notifications.success).toHaveBeenCalledWith("Kiosk enabled successfully.");

    spyOn(window, "confirm").and.returnValue(true);
    api.disableKiosk.and.returnValue(of(undefined));
    q("#kiosk-switch").checked = false;
    q("#kiosk-switch").dispatchEvent(new Event("change"));
    fixture.detectChanges();
    expect(component.enabled).toBeFalse();
    expect(component.login).toBeNull();
  });

  it("resets the password after confirmation", async () => {
    await setup();
    spyOn(window, "confirm").and.returnValue(true);
    api.enableKiosk.and.returnValue(of({ login: "kiosk-1", password: "New1" }));
    component.resetPassword();
    expect(component.login?.password).toBe("New1");
    expect(notifications.success).toHaveBeenCalledWith("Kiosk password reset successfully.");
  });

  it("blocks saving with no payment choice or a timeout outside 5-300", async () => {
    await setup();
    component.togglePaymentChoice("CARD", false);
    component.togglePaymentChoice("CASH", false);
    component.save();
    expect(api.saveSettings).not.toHaveBeenCalled();
    expect(component.errors.paymentChoices).toBeDefined();

    component.togglePaymentChoice("CARD", true);
    component.onResetSecondsChange(301);
    component.save();
    expect(api.saveSettings).not.toHaveBeenCalled();
    expect(component.errors.resetSeconds).toBeDefined();
  });

  it("saves cleaned settings and confirms", async () => {
    await setup();
    api.saveSettings.and.returnValue(of(undefined));
    component.togglePaymentChoice("SCAN_TO_PAY", true);
    component.onResetSecondsChange(60);
    component.save();
    expect(api.saveSettings).toHaveBeenCalledWith(jasmine.anything(), "v1", "b-1", {
      paymentChoices: ["CARD", "CASH", "SCAN_TO_PAY"], resetSeconds: 60, languages: ["de"], advertisedProductIds: ["p-1"],
    });
    expect(notifications.success).toHaveBeenCalledWith("Kiosk Settings saved.");
  });

  it("reports a failed save through the notification service", async () => {
    await setup();
    const error = new HttpErrorResponse({ status: 400, error: { code: "KIOSK_INVALID" } });
    api.saveSettings.and.returnValue(throwError(() => error));
    component.save();
    expect(notifications.apiError).toHaveBeenCalledWith(error, "Could not save the Kiosk Settings. Please try again.");
    expect(component.saving).toBeFalse();
  });

  it("shows the access-denied note on 403", async () => {
    await setup(throwError(() => new HttpErrorResponse({ status: 403 })));
    expect(component.forbidden).toBeTrue();
    expect(el().textContent).toContain("Only a Merchant Manager");
  });
});
