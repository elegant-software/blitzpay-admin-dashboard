import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnChanges, OnDestroy, SimpleChanges, inject } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { Observable, Subscription, forkJoin } from "rxjs";

import { environment } from "../../environments/environment";
import { AdminLocaleService } from "../i18n/admin-locale.service";
import { AdminTranslatePipe } from "../i18n/admin-translate.pipe";
import { languageLabel } from "../menu-language/menu-language";
import {
  Kiosk,
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

type CopyTarget = "password" | "settings";

const BRANCH_NOT_FOUND = "Branch not found.";
const KIOSK_NOT_FOUND = "Kiosk not found. Reload the page.";

/**
 * The Kiosks of a Branch, each with its own Kiosk Login, and the Kiosk Settings they share.
 *
 * Mirrors the Kitchen Screen switch: a Kiosk Login password comes back once from
 * add, enable or reset and lives only in this component's state. It is never
 * stored, logged, or put in a URL, and it is dropped when the component is destroyed.
 * Kiosk ids travel only as hidden values; the UI shows names and usernames.
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
  forbidden = false;

  kiosks: Kiosk[] = [];
  newKioskName = "";

  /** The Kiosk Login from the last add/enable/reset. Holds the password in component state only. */
  login: KioskLogin | null = null;
  passwordRevealed = false;
  copied: CopyTarget | null = null;
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

  get runSettings(): string {
    if (!this.login) return "";
    return [
      `KIOSK_API_URL=${this.login.apiBaseUrl}`,
      `KIOSK_BRANCH_ID=${this.login.branchId}`,
      `KEYCLOAK_URL=${this.login.keycloakUrl}`,
      `KEYCLOAK_REALM=${this.login.realm}`,
      `KEYCLOAK_CLIENT_ID=${this.login.clientId}`,
    ].join("\n");
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

  addKiosk(): void {
    if (this.busy) return;
    this.run(
      this.kioskApi.addKiosk(this.selectedEnvironment, this.apiVersion, this.branchId, this.newKioskName),
      "Could not add the Kiosk. Please try again.",
      (login) => {
        this.newKioskName = "";
        this.showLogin(login);
        this.notifications.success("Kiosk added successfully.");
        this.reloadKiosks();
      },
    );
  }

  /** Re-enables a disabled Kiosk, or resets the password of an enabled one after confirmation. */
  enableKiosk(kiosk: Kiosk): void {
    if (this.busy) return;
    const isPasswordReset = kiosk.enabled;
    if (
      isPasswordReset &&
      !confirm(this.locale.text("Reset the password of {0}? A Kiosk that is already logged in keeps working. A new login needs the new password.", [kiosk.name]))
    ) {
      return;
    }
    this.run(
      this.kioskApi.enableKiosk(this.selectedEnvironment, this.apiVersion, this.branchId, kiosk.id),
      isPasswordReset ? "Could not reset the Kiosk password. Please try again." : "Could not enable the Kiosk. Please try again.",
      (login) => {
        this.replaceKiosk({ ...kiosk, name: login.name ?? kiosk.name, username: login.username ?? kiosk.username, enabled: true });
        this.showLogin(login);
        this.notifications.success(isPasswordReset ? "Kiosk password reset successfully." : "Kiosk enabled successfully.");
      },
      KIOSK_NOT_FOUND,
    );
  }

  disableKiosk(kiosk: Kiosk): void {
    if (this.busy) return;
    if (!confirm(this.locale.text("Disable {0}? It will be logged out.", [kiosk.name]))) return;
    this.run(
      this.kioskApi.disableKiosk(this.selectedEnvironment, this.apiVersion, this.branchId, kiosk.id),
      "Could not disable the Kiosk. Please try again.",
      (updated) => {
        if (this.login?.kioskId === kiosk.id) this.clearLogin();
        this.replaceKiosk(updated ?? { ...kiosk, enabled: false });
        this.notifications.success("Kiosk disabled successfully.");
      },
      KIOSK_NOT_FOUND,
    );
  }

  removeKiosk(kiosk: Kiosk): void {
    if (this.busy) return;
    if (!confirm(this.locale.text("Remove {0}? Its Kiosk Login is deleted and it can no longer sign in. This cannot be undone.", [kiosk.name]))) return;
    this.run(
      this.kioskApi.removeKiosk(this.selectedEnvironment, this.apiVersion, this.branchId, kiosk.id),
      "Could not remove the Kiosk. Please try again.",
      () => {
        if (this.login?.kioskId === kiosk.id) this.clearLogin();
        this.kiosks = this.kiosks.filter((k) => k.id !== kiosk.id);
        this.notifications.success("Kiosk removed successfully.");
      },
      KIOSK_NOT_FOUND,
    );
  }

  togglePasswordReveal(): void {
    this.passwordRevealed = !this.passwordRevealed;
  }

  copy(target: CopyTarget): void {
    if (!this.login) return;
    const value = target === "password" ? this.login.password : this.runSettings;
    this.copied = null;
    this.copyFailed = false;
    navigator.clipboard.writeText(value).then(
      () => (this.copied = target),
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
        next: (saved) => {
          this.saving = false;
          this.settings = this.copySettings(saved ?? body);
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
    return this.copySettings(DEFAULT_KIOSK_SETTINGS);
  }

  private copySettings(settings: Partial<KioskSettings> | null | undefined): KioskSettings {
    return {
      paymentChoices: [...(settings?.paymentChoices ?? DEFAULT_KIOSK_SETTINGS.paymentChoices)],
      resetSeconds: settings?.resetSeconds ?? DEFAULT_KIOSK_SETTINGS.resetSeconds,
      languages: [...(settings?.languages ?? [])],
      advertisedProductIds: [...(settings?.advertisedProductIds ?? [])],
    };
  }

  private load(): void {
    this.request?.unsubscribe();
    this.kiosks = [];
    this.forbidden = false;
    this.settings = this.freshSettings();
    this.submitted = false;
    this.errors = {};
    if (!this.branchId) return;

    this.loading = true;
    this.request = forkJoin({
      kiosks: this.kioskApi.listKiosks(this.selectedEnvironment, this.apiVersion, this.branchId),
      settings: this.kioskApi.getSettings(this.selectedEnvironment, this.apiVersion, this.branchId),
    }).subscribe({
      next: ({ kiosks, settings }) => {
        this.loading = false;
        this.kiosks = kiosks ?? [];
        this.settings = this.copySettings(settings);
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error, "Could not load the Kiosks. Please try again.");
      },
    });
  }

  /** Refreshes the list after an add, so the new Kiosk shows with its number and in order. Keeps the shown credentials. */
  private reloadKiosks(): void {
    this.request = this.kioskApi.listKiosks(this.selectedEnvironment, this.apiVersion, this.branchId).subscribe({
      next: (kiosks) => (this.kiosks = kiosks ?? []),
      error: (error) => this.handleError(error, "Could not load the Kiosks. Please try again."),
    });
  }

  private replaceKiosk(updated: Kiosk): void {
    this.kiosks = this.kiosks.map((k) => (k.id === updated.id ? updated : k));
  }

  private showLogin(login: KioskLogin): void {
    this.clearLogin();
    this.login = login;
  }

  private run<T>(call$: Observable<T>, fallback: string, onSuccess: (result: T) => void, notFound = BRANCH_NOT_FOUND): void {
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
        this.handleError(error, fallback, notFound);
      },
    });
  }

  private clearLogin(): void {
    this.login = null;
    this.passwordRevealed = false;
    this.copied = null;
    this.copyFailed = false;
  }

  /** 403 keeps the access-denied note; 404 never exposes the raw message (it may contain a UUID); the rest go through the error-code handling of NotificationService. */
  private handleError(error: unknown, fallback: string, notFound = BRANCH_NOT_FOUND): void {
    const status = error instanceof HttpErrorResponse ? error.status : undefined;
    if (status === 403) {
      this.clearLogin();
      this.forbidden = true;
      return;
    }
    if (status === 404) {
      this.notifications.error(notFound);
      return;
    }
    this.notifications.apiError(error, fallback);
  }
}
