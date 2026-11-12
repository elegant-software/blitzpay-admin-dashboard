import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable, Subscription } from "rxjs";

import { environment } from "../../environments/environment";
import { AdminLocaleService } from "../i18n/admin-locale.service";
import { AdminTranslatePipe } from "../i18n/admin-translate.pipe";
import { languageLabel } from "../menu-language/menu-language";
import {
  KioskLogin,
  KioskPaymentChoice,
  KioskSettings,
  MenuLanguage,
  Product,
} from "../models/merchant-catalog.models";
import { NotificationService } from "../notifications/notification.service";
import { KioskApiService } from "../services/kiosk-api.service";
import { getEnvironmentByKey } from "../services/merchant-environment.service";
import {
  DEFAULT_KIOSK_SETTINGS,
  KIOSK_PAYMENT_CHOICES,
  KIOSK_RESET_MAX_SECONDS,
  KIOSK_RESET_MIN_SECONDS,
  KioskSettingsErrors,
  validateKioskSettings,
} from "./kiosk-settings.validation";

/**
 * Kiosk Login and Kiosk Settings of a Branch.
 *
 * Mirrors the Kitchen Screen switch: the Kiosk Login password comes back once
 * from `enable` and lives only in this component's state. It is never stored,
 * logged, or put in a URL, and it is dropped when the component is destroyed.
 */
@Component({
  selector: "app-branch-kiosk",
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule],
  templateUrl: "./branch-kiosk.component.html",
  styleUrl: "./merchant-catalog.component.css",
})
export class BranchKioskComponent implements OnChanges, OnDestroy {
  private readonly locale = inject(AdminLocaleService);
  private readonly notifications = inject(NotificationService);
  private readonly kioskApi = inject(KioskApiService);

  @Input({ required: true }) branchId = "";
  /** The Branch's Products; only the active ones can be Advertised Products. */
  @Input() products: Product[] = [];
  /** The Merchant's Supported Menu Languages (codes). */
  @Input() supportedLanguages: string[] = [];
  @Input() menuLanguages: MenuLanguage[] = [];

  readonly apiVersion = "v1";
  readonly paymentChoices = KIOSK_PAYMENT_CHOICES;
  readonly resetMin = KIOSK_RESET_MIN_SECONDS;
  readonly resetMax = KIOSK_RESET_MAX_SECONDS;

  loading = false;
  busy = false;
  saving = false;
  enabled = false;
  forbidden = false;
  loginName: string | null = null;

  /** The Kiosk Login from the last enable/reset. Holds the password in component state only. */
  login: KioskLogin | null = null;
  passwordRevealed = false;
  copied = false;
  copyFailed = false;

  settings: KioskSettings = this.freshSettings();
  submitted = false;
  errors: KioskSettingsErrors = {};

  private request?: Subscription;
  private saveRequest?: Subscription;

  private get selectedEnvironment() {
    return getEnvironmentByKey(environment.defaultEnvironmentKey);
  }

  get activeProducts(): Product[] {
    return this.products.filter((product) => product.active);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["branchId"]) {
      this.clearLogin();
      this.load();
    }
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.saveRequest?.unsubscribe();
    this.clearLogin();
  }

  languageName(code: string): string {
    return languageLabel(code, this.menuLanguages);
  }

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const wantEnabled = input.checked;

    // The switch reflects backend state and changes only when the API request succeeds.
    input.checked = this.enabled;
    if (this.busy || wantEnabled === this.enabled) return;

    if (wantEnabled) {
      this.enable(false);
    } else if (confirm(this.locale.text("Disable the Kiosk? The Kiosk of this branch will be logged out."))) {
      this.disable();
    }
  }

  resetPassword(): void {
    if (this.busy) return;
    if (!confirm(this.locale.text("Reset the Kiosk password? A Kiosk that is already logged in keeps working. A new login needs the new password."))) return;
    this.enable(true);
  }

  togglePasswordReveal(): void {
    this.passwordRevealed = !this.passwordRevealed;
  }

  copyPassword(): void {
    if (!this.login) return;
    this.copied = false;
    this.copyFailed = false;
    navigator.clipboard.writeText(this.login.password).then(
      () => (this.copied = true),
      () => (this.copyFailed = true),
    );
  }

  hasPaymentChoice(choice: KioskPaymentChoice): boolean {
    return this.settings.paymentChoices.includes(choice);
  }

  togglePaymentChoice(choice: KioskPaymentChoice, checked: boolean): void {
    const others = this.settings.paymentChoices.filter((c) => c !== choice);
    this.settings.paymentChoices = checked ? this.paymentChoices.filter((c) => c === choice || others.includes(c)) : others;
    this.revalidate();
  }

  toggleLanguage(code: string, checked: boolean): void {
    const others = this.settings.languages.filter((c) => c !== code);
    this.settings.languages = checked ? [...others, code] : others;
  }

  toggleAdvertised(productId: string, checked: boolean): void {
    const others = this.settings.advertisedProductIds.filter((id) => id !== productId);
    this.settings.advertisedProductIds = checked ? [...others, productId] : others;
  }

  onResetSecondsChange(value: number | null): void {
    this.settings.resetSeconds = value === null ? NaN : value;
    this.revalidate();
  }

  save(): void {
    if (this.saving) return;
    this.submitted = true;
    this.revalidate();
    if (this.errors.paymentChoices || this.errors.resetSeconds) return;

    this.saving = true;
    this.saveRequest?.unsubscribe();
    const body = this.cleanSettings();
    this.saveRequest = this.kioskApi
      .saveSettings(this.selectedEnvironment, this.apiVersion, this.branchId, body)
      .subscribe({
        next: () => {
          this.saving = false;
          this.settings = body;
          this.notifications.success("Kiosk Settings saved.");
        },
        error: (error) => {
          this.saving = false;
          this.handleError(error, "Could not save the Kiosk Settings. Please try again.");
        },
      });
  }

  /** Drops languages and Products that are no longer offered by the Merchant or Branch. */
  private cleanSettings(): KioskSettings {
    const activeIds = new Set(this.activeProducts.map((p) => p.productId));
    const hasProducts = this.products.length > 0;
    return {
      paymentChoices: [...this.settings.paymentChoices],
      resetSeconds: this.settings.resetSeconds,
      languages: this.settings.languages.filter((code) => this.supportedLanguages.includes(code)),
      advertisedProductIds: hasProducts
        ? this.settings.advertisedProductIds.filter((id) => activeIds.has(id))
        : [...this.settings.advertisedProductIds],
    };
  }

  private revalidate(): void {
    this.errors = this.submitted ? validateKioskSettings(this.settings) : {};
  }

  private freshSettings(): KioskSettings {
    return { ...DEFAULT_KIOSK_SETTINGS, paymentChoices: [...DEFAULT_KIOSK_SETTINGS.paymentChoices] };
  }

  private load(): void {
    this.request?.unsubscribe();
    this.enabled = false;
    this.loginName = null;
    this.forbidden = false;
    this.settings = this.freshSettings();
    this.submitted = false;
    this.errors = {};
    if (!this.branchId) return;

    this.loading = true;
    this.request = this.kioskApi.getKiosk(this.selectedEnvironment, this.apiVersion, this.branchId).subscribe({
      next: (status) => {
        this.loading = false;
        this.enabled = status.enabled;
        this.loginName = status.login;
        this.settings = {
          paymentChoices: [...(status.settings?.paymentChoices ?? DEFAULT_KIOSK_SETTINGS.paymentChoices)],
          resetSeconds: status.settings?.resetSeconds ?? DEFAULT_KIOSK_SETTINGS.resetSeconds,
          languages: [...(status.settings?.languages ?? [])],
          advertisedProductIds: [...(status.settings?.advertisedProductIds ?? [])],
        };
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error, "Could not load Kiosk status. Please try again.");
      },
    });
  }

  private enable(isPasswordReset: boolean): void {
    this.run(
      this.kioskApi.enableKiosk(this.selectedEnvironment, this.apiVersion, this.branchId),
      isPasswordReset
        ? "Could not reset the Kiosk password. Please try again."
        : "Could not enable the Kiosk. Please try again.",
      (login) => {
        this.enabled = true;
        this.loginName = login.login;
        this.clearLogin();
        this.login = login;
        this.notifications.success(isPasswordReset ? "Kiosk password reset successfully." : "Kiosk enabled successfully.");
      },
    );
  }

  private disable(): void {
    this.run(
      this.kioskApi.disableKiosk(this.selectedEnvironment, this.apiVersion, this.branchId),
      "Could not disable the Kiosk. Please try again.",
      () => {
        this.clearLogin();
        this.enabled = false;
        this.notifications.success("Kiosk disabled successfully.");
      },
    );
  }

  private run<T>(call$: Observable<T>, fallback: string, onSuccess: (result: T) => void): void {
    if (this.busy) return;
    this.busy = true;
    this.request?.unsubscribe();
    this.request = call$.subscribe({
      next: (result) => {
        this.busy = false;
        onSuccess(result);
      },
      error: (error) => {
        this.busy = false;
        this.handleError(error, fallback);
      },
    });
  }

  private clearLogin(): void {
    this.login = null;
    this.passwordRevealed = false;
    this.copied = false;
    this.copyFailed = false;
  }

  /** 403 keeps the access-denied note; 404 never exposes the raw message (it may contain the branch UUID); the rest go through the error-code handling of NotificationService. */
  private handleError(error: unknown, fallback: string): void {
    const status = error instanceof HttpErrorResponse ? error.status : undefined;
    if (status === 403) {
      this.clearLogin();
      this.forbidden = true;
      return;
    }
    if (status === 404) {
      this.notifications.error("Branch not found.");
      return;
    }
    this.notifications.apiError(error, fallback);
  }
}
