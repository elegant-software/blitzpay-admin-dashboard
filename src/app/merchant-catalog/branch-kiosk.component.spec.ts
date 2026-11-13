import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Observable, of, throwError } from "rxjs";
import { Kiosk, KioskLogin, KioskSettings, Product } from "../models/merchant-catalog.models";
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
  const front: Kiosk = { id: "11111111-1111-1111-1111-111111111111", number: 1, name: "Front", username: "kiosk-br-1-1", enabled: true };
  const back: Kiosk = { id: "22222222-2222-2222-2222-222222222222", number: 2, name: "Kiosk 2", username: "kiosk-br-1-2", enabled: false };
  const loginFor = (kiosk: Kiosk, password: string): KioskLogin => ({
    kioskId: kiosk.id, name: kiosk.name, username: kiosk.username, password, keycloakUrl: "http://kc", realm: "blitzpay",
    clientId: "kiosk", apiBaseUrl: "http://api/v1", branchId: "b-1",
  });

  async function setup(kiosks: Observable<Kiosk[]> = of([front, back]), languages = ["de", "ar"]) {
    api = jasmine.createSpyObj<KioskApiService>("KioskApiService", [
      "listKiosks", "addKiosk", "enableKiosk", "disableKiosk", "removeKiosk", "getSettings", "saveSettings",
    ]);
    api.listKiosks.and.returnValue(kiosks);
    api.getSettings.and.returnValue(of(settings));
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
  const row = (n: number) => el().querySelector<HTMLElement>(`[data-test="kiosk-row-${n}"]`)!;

  it("lists the Kiosks by name and username without showing their ids", async () => {
    await setup();
    expect(row(1).textContent).toContain("Front");
    expect(row(1).textContent).toContain("kiosk-br-1-1");
    expect(row(1).textContent).toContain("Enabled");
    expect(row(1).querySelector('[data-test="kiosk-enable"]')!.textContent).toContain("Reset password");
    expect(row(1).querySelector('[data-test="kiosk-disable"]')).not.toBeNull();
    expect(row(2).textContent).toContain("Disabled");
    expect(row(2).querySelector('[data-test="kiosk-enable"]')!.textContent).toContain("Enable");
    expect(row(2).querySelector('[data-test="kiosk-disable"]')).toBeNull();
    expect(el().textContent).not.toContain(front.id);
    expect(el().textContent).not.toContain(back.id);
    expect(el().querySelector('[data-test="kiosk-password"]')).toBeNull();
  });

  it("loads the shared Kiosk Settings into the form", async () => {
    await setup();
    expect(q("#kiosk-pay-CASH").checked).toBeTrue();
    expect(q("#kiosk-pay-SCAN_TO_PAY").checked).toBeFalse();
    expect(q("#kiosk-reset-seconds").value).toBe("45");
    expect(q("#kiosk-lang-de").checked).toBeTrue();
    expect(el().textContent).toContain("Name p-2");
    expect(el().textContent).not.toContain("Name p-3");
    expect(el().querySelector("img")!.getAttribute("src")).toBe("http://img/p1.png");
  });

  it("shows the empty state and still the settings form when the Branch has no Kiosks", async () => {
    await setup(of([]), []);
    expect(el().querySelector('[data-test="kiosk-empty"]')).not.toBeNull();
    expect(el().querySelector('[data-test="kiosk-settings"]')).not.toBeNull();
    expect(el().querySelector("#kiosk-lang-de")).toBeNull();
  });

  it("adds a Kiosk, shows its password once with the run settings, and reloads the list", async () => {
    await setup(of([]));
    const added: Kiosk = { ...front, name: "Bar" };
    api.addKiosk.and.returnValue(of(loginFor(added, "Pa55")));
    api.listKiosks.and.returnValue(of([added]));
    component.newKioskName = "Bar";
    component.addKiosk();
    fixture.detectChanges();

    expect(api.addKiosk).toHaveBeenCalledWith(jasmine.anything(), "v1", "b-1", "Bar");
    expect(component.newKioskName).toBe("");
    expect(component.kiosks).toEqual([added]);
    expect(el().querySelector('[data-test="kiosk-username"]')!.textContent).toContain("kiosk-br-1-1");
    expect(el().querySelector('[data-test="kiosk-password"]')!.textContent).not.toContain("Pa55");
    component.togglePasswordReveal();
    fixture.detectChanges();
    expect(el().querySelector('[data-test="kiosk-password"]')!.textContent).toContain("Pa55");
    const runSettings = el().querySelector('[data-test="kiosk-run-settings"]')!.textContent!;
    expect(runSettings).toContain("KIOSK_API_URL=http://api/v1");
    expect(runSettings).toContain("KEYCLOAK_REALM=blitzpay");
    expect(runSettings).toContain("KEYCLOAK_CLIENT_ID=kiosk");
    expect(notifications.success).toHaveBeenCalledWith("Kiosk added successfully.");
  });

  it("resets the password of an enabled Kiosk after confirmation", async () => {
    await setup();
    const confirmSpy = spyOn(window, "confirm").and.returnValue(true);
    api.enableKiosk.and.returnValue(of(loginFor(front, "New1")));
    component.enableKiosk(front);
    expect(confirmSpy).toHaveBeenCalled();
    expect(api.enableKiosk).toHaveBeenCalledWith(jasmine.anything(), "v1", "b-1", front.id);
    expect(component.login?.password).toBe("New1");
    expect(notifications.success).toHaveBeenCalledWith("Kiosk password reset successfully.");
  });

  it("enables a disabled Kiosk without confirmation and marks it enabled", async () => {
    await setup();
    const confirmSpy = spyOn(window, "confirm");
    api.enableKiosk.and.returnValue(of(loginFor(back, "Back1")));
    component.enableKiosk(back);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(component.kiosks.find((k) => k.id === back.id)!.enabled).toBeTrue();
    expect(component.login?.password).toBe("Back1");
    expect(notifications.success).toHaveBeenCalledWith("Kiosk enabled successfully.");
  });

  it("disables a Kiosk after confirmation and drops its shown password", async () => {
    await setup();
    spyOn(window, "confirm").and.returnValue(true);
    api.enableKiosk.and.returnValue(of(loginFor(front, "New1")));
    component.enableKiosk(front);
    api.disableKiosk.and.returnValue(of({ ...front, enabled: false }));
    component.disableKiosk(front);
    expect(api.disableKiosk).toHaveBeenCalledWith(jasmine.anything(), "v1", "b-1", front.id);
    expect(component.kiosks.find((k) => k.id === front.id)!.enabled).toBeFalse();
    expect(component.login).toBeNull();
    expect(notifications.success).toHaveBeenCalledWith("Kiosk disabled successfully.");
  });

  it("removes a Kiosk only after confirmation", async () => {
    await setup();
    const confirmSpy = spyOn(window, "confirm").and.returnValue(false);
    component.removeKiosk(back);
    expect(api.removeKiosk).not.toHaveBeenCalled();

    confirmSpy.and.returnValue(true);
    api.removeKiosk.and.returnValue(of(undefined));
    component.removeKiosk(back);
    expect(api.removeKiosk).toHaveBeenCalledWith(jasmine.anything(), "v1", "b-1", back.id);
    expect(component.kiosks).toEqual([front]);
    expect(notifications.success).toHaveBeenCalledWith("Kiosk removed successfully.");
  });

  it("reports an unknown Kiosk without exposing the raw message", async () => {
    await setup();
    spyOn(window, "confirm").and.returnValue(true);
    api.removeKiosk.and.returnValue(throwError(() => new HttpErrorResponse({ status: 404, error: { message: `Kiosk ${back.id} not found` } })));
    component.removeKiosk(back);
    expect(notifications.error).toHaveBeenCalledWith("Kiosk not found. Reload the page.");
    expect(component.busy).toBeFalse();
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
    api.saveSettings.and.callFake((_e, _v, _b, body) => of(body));
    component.togglePaymentChoice("SCAN_TO_PAY", true);
    component.onResetSecondsChange(60);
    component.save();
    expect(api.saveSettings).toHaveBeenCalledWith(jasmine.anything(), "v1", "b-1", {
      paymentChoices: ["CARD", "CASH", "SCAN_TO_PAY"], resetSeconds: 60, languages: ["de"], advertisedProductIds: ["p-1"],
    });
    expect(component.settings.resetSeconds).toBe(60);
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
