import { HttpErrorResponse } from "@angular/common/http";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Observable, Subject, of, throwError } from "rxjs";
import {
  KitchenAccessStatus,
  KitchenLogin,
} from "../models/merchant-catalog.models";
import { MerchantApiService } from "../services/merchant-api.service";
import { BranchKitchenScreenComponent } from "./branch-kitchen-screen.component";
import { NotificationService } from "../notifications/notification.service";

describe("BranchKitchenScreenComponent", () => {
  let fixture: ComponentFixture<BranchKitchenScreenComponent>;
  let component: BranchKitchenScreenComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const login: KitchenLogin = {
    username: "kitchen-br-1",
    password: "Pa55-word_xyz",
    keycloakUrl: "https://auth.test",
    realm: "blitzpay",
    clientId: "blitzpay-kitchen",
    apiBaseUrl: "https://api.test",
    branchId: "0b6c1d7e-1111-2222-3333-444455556666",
  };

  function httpError(status: number, error: unknown = null): Observable<never> {
    return throwError(() => new HttpErrorResponse({ status, error }));
  }

  async function setup(
    status: Observable<KitchenAccessStatus> = of({
      enabled: false,
      username: null,
    }),
  ) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>(
      "MerchantApiService",
      ["getKitchenAccess", "enableKitchenAccess", "disableKitchenAccess"],
    );
    merchantApi.getKitchenAccess.and.returnValue(status);
    await TestBed.configureTestingModule({
      imports: [BranchKitchenScreenComponent],
      providers: [{ provide: MerchantApiService, useValue: merchantApi }],
    }).compileComponents();
    fixture = TestBed.createComponent(BranchKitchenScreenComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput("branchId", "b-1");
    fixture.detectChanges();
  }

  const el = () => fixture.nativeElement as HTMLElement;
  const text = () => el().textContent ?? "";
  const toggle = () =>
    el().querySelector<HTMLInputElement>("#kitchen-screen-switch")!;
  const button = (label: string) =>
    Array.from(el().querySelectorAll("button")).find(
      (b) =>
        b.textContent?.includes(label) ||
        b.getAttribute("aria-label") === label,
    )!;

  function flip(checked: boolean): void {
    toggle().checked = checked;
    toggle().dispatchEvent(new Event("change"));
    fixture.detectChanges();
  }

  it("loads the status, sets the switch and shows the username without a password", async () => {
    await setup(of({ enabled: true, username: "kitchen-br-1" }));
    expect(merchantApi.getKitchenAccess).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "b-1",
    );
    expect(toggle().checked).toBeTrue();
    expect(text()).toContain("kitchen-br-1");
    expect(el().querySelector('[data-test="kitchen-password"]')).toBeNull();
    expect(button("Reset password")).toBeTruthy();
  });

  it("switching on enables the Kitchen Screen and shows the masked password with a reveal toggle", async () => {
    await setup();
    merchantApi.enableKitchenAccess.and.returnValue(of(login));
    flip(true);

    expect(merchantApi.enableKitchenAccess).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "b-1",
    );
    expect(toggle().checked).toBeTrue();
    const password = el().querySelector('[data-test="kitchen-password"]')!;
    expect(password.textContent).not.toContain(login.password);
    expect(text()).toContain(
      "This password is shown only now. Use Reset password to get a new one.",
    );

    button("Show password").click();
    fixture.detectChanges();
    expect(password.textContent).toContain(login.password);
    button("Hide password").click();
    fixture.detectChanges();
    expect(password.textContent).not.toContain(login.password);
  });

  it("shows the run settings as env lines, the branch id only there", async () => {
    await setup();
    merchantApi.enableKitchenAccess.and.returnValue(of(login));
    flip(true);
    expect(component.runSettings).toBe(
      [
        "KITCHEN_API_URL=https://api.test",
        `KITCHEN_BRANCH_ID=${login.branchId}`,
        "KEYCLOAK_URL=https://auth.test",
        "KEYCLOAK_REALM=blitzpay",
        "KEYCLOAK_CLIENT_ID=blitzpay-kitchen",
      ].join("\n"),
    );
    const settings = el().querySelector('[data-test="kitchen-run-settings"]')!;
    expect(settings.textContent).toContain(
      `KITCHEN_BRANCH_ID=${login.branchId}`,
    );
    expect(text().split(login.branchId).length - 1).toBe(1);
  });

  it("copies the password and the run settings to the clipboard", async () => {
    await setup();

    merchantApi.enableKitchenAccess.and.returnValue(of(login));

    const writeText = spyOn(navigator.clipboard, "writeText").and.returnValue(
      Promise.resolve(),
    );

    flip(true);

    // Copy password.
    button("Copy password").click();

    expect(writeText).toHaveBeenCalledWith(login.password);

    // Wait for the clipboard promise callback.
    await Promise.resolve();

    fixture.detectChanges();

    expect(component.copied).toBe("password");
    expect(text()).toContain("Copied");

    // Copy run settings.
    button("Copy run settings").click();

    expect(writeText).toHaveBeenCalledWith(component.runSettings);

    await Promise.resolve();

    fixture.detectChanges();

    expect(component.copied).toBe("settings");
  });

  it("switching off asks for confirmation, then disables and drops the login panel", async () => {
    await setup(of({ enabled: true, username: "kitchen-br-1" }));
    const confirmSpy = spyOn(window, "confirm").and.returnValue(true);
    merchantApi.disableKitchenAccess.and.returnValue(
      of({ enabled: false, username: "kitchen-br-1" }),
    );
    flip(false);

    expect(confirmSpy.calls.mostRecent().args[0]).toContain(
      "All kitchen screens of this branch will be logged out",
    );
    expect(merchantApi.disableKitchenAccess).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "b-1",
    );
    expect(toggle().checked).toBeFalse();
    expect(el().querySelector('[data-test="kitchen-password"]')).toBeNull();
  });

  it("cancelling the switch-off confirmation reverts the switch", async () => {
    await setup(of({ enabled: true, username: "kitchen-br-1" }));
    spyOn(window, "confirm").and.returnValue(false);
    flip(false);
    expect(merchantApi.disableKitchenAccess).not.toHaveBeenCalled();
    expect(toggle().checked).toBeTrue();
  });

  it("reset password confirms, calls enable again and shows the new password", async () => {
    await setup(of({ enabled: true, username: "kitchen-br-1" }));
    spyOn(window, "confirm").and.returnValue(true);
    merchantApi.enableKitchenAccess.and.returnValue(
      of({ ...login, password: "new-one" }),
    );
    button("Reset password").click();
    fixture.detectChanges();
    expect(merchantApi.enableKitchenAccess).toHaveBeenCalledTimes(1);
    button("Show password").click();
    fixture.detectChanges();
    expect(
      el().querySelector('[data-test="kitchen-password"]')!.textContent,
    ).toContain("new-one");
  });

  it("a cancelled reset does not call the backend", async () => {
    await setup(of({ enabled: true, username: "kitchen-br-1" }));
    spyOn(window, "confirm").and.returnValue(false);
    button("Reset password").click();
    expect(merchantApi.enableKitchenAccess).not.toHaveBeenCalled();
  });

  it("keeps the switch busy while a request runs", async () => {
    await setup();
    const pending = new Subject<KitchenLogin>();
    merchantApi.enableKitchenAccess.and.returnValue(pending);
    flip(true);
    expect(toggle().disabled).toBeTrue();
    pending.next(login);
    pending.complete();
    fixture.detectChanges();
    expect(toggle().disabled).toBeFalse();
  });

  it("clears the password on destroy and ignores a response that arrives after it", async () => {
    await setup();
    merchantApi.enableKitchenAccess.and.returnValue(of(login));
    flip(true);
    expect(component.login).not.toBeNull();
    fixture.destroy();
    expect(component.login).toBeNull();
  });

  it("ignores an enable response that arrives after the page was left", async () => {
    await setup();
    const pending = new Subject<KitchenLogin>();
    merchantApi.enableKitchenAccess.and.returnValue(pending);
    flip(true);
    fixture.destroy();
    pending.next(login);
    expect(component.login).toBeNull();
  });

  it("never writes the password to web storage", async () => {
    await setup();
    const setItem = spyOn(Storage.prototype, "setItem").and.callThrough();
    merchantApi.enableKitchenAccess.and.returnValue(of(login));
    flip(true);
    expect(
      setItem.calls
        .allArgs()
        .some((args) => args.join(" ").includes(login.password)),
    ).toBeFalse();
  });

 it("hides the switch for a user who is not a Merchant Manager", async () => {
   await setup();

   const notifications = TestBed.inject(NotificationService);
   const apiErrorSpy = spyOn(notifications, "apiError");
   const errorSpy = spyOn(notifications, "error");

   merchantApi.getKitchenAccess.and.returnValue(
     httpError(403, {
       error: "Caller is not a Merchant Manager",
     }),
   );

   fixture.componentRef.setInput("branchId", "forbidden-branch");
   fixture.detectChanges();

   expect(component.forbidden).toBeTrue();

   expect(el().querySelector("#kitchen-screen-switch")).toBeNull();

   expect(text()).toContain(
     "Only a Merchant Manager of this merchant can manage the Kitchen Screen.",
   );

   expect(apiErrorSpy).not.toHaveBeenCalled();
   expect(errorSpy).not.toHaveBeenCalled();
 });

  it("a failed enable reverts the switch and shows one conflict toast", async () => {
    await setup();

    const notifications = TestBed.inject(NotificationService);
    const apiErrorSpy = spyOn(notifications, "apiError");

    const failure = new HttpErrorResponse({
      status: 409,
      error: {
        error:
          "Username kitchen-br-1 is already used by another Branch's Kitchen Login",
      },
    });

    merchantApi.enableKitchenAccess.and.returnValue(throwError(() => failure));

    flip(true);

    expect(toggle().checked).toBeFalse();
    expect(component.enabled).toBeFalse();
    expect(component.busy).toBeFalse();

    expect(apiErrorSpy).toHaveBeenCalledOnceWith(
      failure,
      "The kitchen username is already used by another branch.",
    );
  });

  it("shows a safe error toast for an unknown branch without exposing its ID", async () => {
    const failure = new HttpErrorResponse({
      status: 404,
      error: {
        error: "Branch not found: 0b6c1d7e-1111-2222-3333-444455556666",
      },
    });

    // Configure TestBed first, without triggering the request.
    await setup();

    const notifications = TestBed.inject(NotificationService);
    const errorSpy = spyOn(notifications, "error");

    // Trigger the failing request after installing the spy.
    merchantApi.getKitchenAccess.and.returnValue(throwError(() => failure));

    fixture.componentRef.setInput("branchId", "unknown-branch");
    fixture.detectChanges();

    expect(errorSpy).toHaveBeenCalledOnceWith("Branch not found.");
    expect(component.loading).toBeFalse();
    expect(component.forbidden).toBeFalse();

    expect(errorSpy.calls.mostRecent().args[0]).not.toContain("0b6c1d7e");
  });

  it("shows one network error toast and reverts the switch", async () => {
    await setup();

    const notifications = TestBed.inject(NotificationService);
    const apiErrorSpy = spyOn(notifications, "apiError");

    const failure = new HttpErrorResponse({ status: 0 });

    merchantApi.enableKitchenAccess.and.returnValue(throwError(() => failure));

    flip(true);

    expect(toggle().checked).toBeFalse();
    expect(component.enabled).toBeFalse();
    expect(component.busy).toBeFalse();

    expect(apiErrorSpy).toHaveBeenCalledOnceWith(
      failure,
      "Could not enable the Kitchen Screen. Please try again.",
    );
  });
});
