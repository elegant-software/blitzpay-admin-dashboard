import { inject as injectAdminLocale } from '@angular/core';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { CommonModule } from "@angular/common";
import { HttpErrorResponse } from "@angular/common/http";
import { Component, Input, OnChanges, OnDestroy, inject } from "@angular/core";
import { Observable, Subscription } from "rxjs";

import { environment } from "../../environments/environment";
import { KitchenLogin } from "../models/merchant-catalog.models";
import { NotificationService } from "../notifications/notification.service";
import { MerchantApiService } from "../services/merchant-api.service";
import { getEnvironmentByKey } from "../services/merchant-environment.service";

type CopyTarget = "password" | "settings";

/**
 * Kitchen Screen switch of a Branch (issue zack-pay#184).
 *
 * The Kitchen Login password comes back once from `enable`
 * and lives only in this component's state.
 *
 * It is never stored, logged, or put in a URL,
 * and it is dropped when the component is destroyed.
 */
@Component({
  selector: "app-branch-kitchen-screen",
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule],
  templateUrl: "./branch-kitchen-screen.component.html",
  styleUrl: "./merchant-catalog.component.css",
})
export class BranchKitchenScreenComponent implements OnChanges, OnDestroy {
  readonly adminLocale = injectAdminLocale(AdminLocaleService);
  private readonly notifications = inject(NotificationService);

  @Input({ required: true }) branchId = "";

  readonly apiVersion = "v1";

  loading = false;
  busy = false;
  enabled = false;

  username: string | null = null;

  /**
   * Only a Merchant Manager of the Branch's Merchant may manage
   * the Kitchen Screen. The backend answers 403 otherwise.
   */
  forbidden = false;

  /**
   * The Kitchen Login from the last enable/reset.
   * Holds the password in component state only.
   */
  login: KitchenLogin | null = null;

  passwordRevealed = false;
  copied: CopyTarget | null = null;
  copyFailed = false;

  private request?: Subscription;

  constructor(private readonly merchantApi: MerchantApiService) {}

  private get selectedEnvironment() {
    return getEnvironmentByKey(environment.defaultEnvironmentKey);
  }

  ngOnChanges(): void {
    this.clearLogin();
    this.load();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.clearLogin();
  }

  get runSettings(): string {
    if (!this.login) return "";

    return [
      `KITCHEN_API_URL=${this.login.apiBaseUrl}`,
      `KITCHEN_BRANCH_ID=${this.login.branchId}`,
      `KEYCLOAK_URL=${this.login.keycloakUrl}`,
      `KEYCLOAK_REALM=${this.login.realm}`,
      `KEYCLOAK_CLIENT_ID=${this.login.clientId}`,
    ].join("\n");
  }

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const wantEnabled = input.checked;

    // The switch reflects backend state.
    // It changes only when the API request succeeds.
    input.checked = this.enabled;

    if (this.busy || wantEnabled === this.enabled) {
      return;
    }

    if (wantEnabled) {
      this.enable(false);
      return;
    }

    if (
      confirm(
        this.adminLocale.text("Disable the Kitchen Screen? All kitchen screens of this branch will be logged out."),
      )
    ) {
      this.disable();
    }
  }

  resetPassword(): void {
    if (this.busy) return;

    const confirmed = confirm(
      this.adminLocale.text("Reset the Kitchen Screen password? Kitchen screens that are already logged in keep working. New logins need the new password."),
    );

    if (!confirmed) return;

    this.enable(true);
  }

  togglePasswordReveal(): void {
    this.passwordRevealed = !this.passwordRevealed;
  }

  copy(target: CopyTarget): void {
    if (!this.login) return;

    const value =
      target === "password" ? this.login.password : this.runSettings;

    this.copied = null;
    this.copyFailed = false;

    navigator.clipboard.writeText(value).then(
      () => {
        this.copied = target;
      },
      () => {
        this.copyFailed = true;
      },
    );
  }

  private load(): void {
    this.request?.unsubscribe();

    this.enabled = false;
    this.username = null;
    this.forbidden = false;

    if (!this.branchId) return;

    this.loading = true;

    this.request = this.merchantApi
      .getKitchenAccess(
        this.selectedEnvironment,
        this.apiVersion,
        this.branchId,
      )
      .subscribe({
        next: (status) => {
          this.loading = false;
          this.enabled = status.enabled;
          this.username = status.username;
        },

        error: (error) => {
          this.loading = false;

          this.handleError(
            error,
            "Could not load Kitchen Screen status. Please try again.",
          );
        },
      });
  }

  private enable(isPasswordReset: boolean): void {
    this.run(
      this.merchantApi.enableKitchenAccess(
        this.selectedEnvironment,
        this.apiVersion,
        this.branchId,
      ),
      isPasswordReset
        ? "Could not reset the Kitchen Screen password. Please try again."
        : "Could not enable the Kitchen Screen. Please try again.",
      (login) => {
        this.enabled = true;
        this.username = login.username;

        this.passwordRevealed = false;
        this.copied = null;
        this.copyFailed = false;

        this.login = login;

        this.notifications.success(
          isPasswordReset
            ? "Kitchen Screen password reset successfully."
            : "Kitchen Screen enabled successfully.",
        );
      },
    );
  }

  private disable(): void {
    this.run(
      this.merchantApi.disableKitchenAccess(
        this.selectedEnvironment,
        this.apiVersion,
        this.branchId,
      ),
      "Could not disable the Kitchen Screen. Please try again.",
      (status) => {
        this.clearLogin();

        this.enabled = status.enabled;
        this.username = status.username;

        this.notifications.success("Kitchen Screen disabled successfully.");
      },
    );
  }

  private run<T>(
    call$: Observable<T>,
    fallback: string,
    onSuccess: (result: T) => void,
  ): void {
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
    this.copied = null;
    this.copyFailed = false;
  }

  /**
   * Convert feature-specific API failures into safe notifications.
   *
   * HTTP 403:
   *   Preserve the existing access-denied UI.
   *
   * HTTP 404:
   *   Never expose the raw backend message because it may
   *   contain the branch UUID.
   *
   * HTTP 409:
   *   Preserve useful conflict details when safe.
   *
   * Other errors:
   *   Delegate to NotificationService for sanitization,
   *   network fallbacks, and duplicate prevention.
   */
  private handleError(error: unknown, fallback: string): void {
    const status =
      error instanceof HttpErrorResponse ? error.status : undefined;

    if (status === 403) {
      this.clearLogin();
      this.forbidden = true;
      return;
    }

    if (status === 404) {
      this.notifications.error("Branch not found.");
      return;
    }

    if (status === 409) {
      this.notifications.apiError(
        error,
        "The kitchen username is already used by another branch.",
      );
      return;
    }

    this.notifications.apiError(error, fallback);
  }
}
