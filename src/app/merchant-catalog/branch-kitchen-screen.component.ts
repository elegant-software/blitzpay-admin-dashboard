import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { environment } from '../../environments/environment';
import { KitchenLogin } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';

type CopyTarget = 'password' | 'settings';

/**
 * Kitchen Screen switch of a Branch (issue zack-pay#184). The Kitchen Login password comes back once from `enable`
 * and lives only in this component's state: it is never stored, logged or put in a URL, and it is dropped on destroy.
 */
@Component({
  selector: 'app-branch-kitchen-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './branch-kitchen-screen.component.html',
  styleUrl: './merchant-catalog.component.css'
})
export class BranchKitchenScreenComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) branchId = '';

  readonly apiVersion = 'v1';

  loading = false;
  busy = false;
  enabled = false;
  username: string | null = null;
  /** Only a Merchant Manager of the Branch's Merchant may manage the Kitchen Screen; the backend answers 403 otherwise. */
  forbidden = false;
  error = '';

  /** The Kitchen Login from the last enable/reset. Holds the password: component state only. */
  login: KitchenLogin | null = null;
  passwordRevealed = false;
  copied: CopyTarget | null = null;
  copyFailed = false;

  private request?: Subscription;

  constructor(private readonly merchantApi: MerchantApiService) {}

  private get selectedEnvironment() { return getEnvironmentByKey(environment.defaultEnvironmentKey); }

  ngOnChanges(): void {
    this.clearLogin();
    this.load();
  }

  ngOnDestroy(): void {
    this.request?.unsubscribe();
    this.clearLogin();
  }

  get runSettings(): string {
    if (!this.login) return '';
    return [
      `KITCHEN_API_URL=${this.login.apiBaseUrl}`,
      `KITCHEN_BRANCH_ID=${this.login.branchId}`,
      `KEYCLOAK_URL=${this.login.keycloakUrl}`,
      `KEYCLOAK_REALM=${this.login.realm}`,
      `KEYCLOAK_CLIENT_ID=${this.login.clientId}`,
    ].join('\n');
  }

  onToggle(event: Event): void {
    const input = event.target as HTMLInputElement;
    const wantEnabled = input.checked;
    // The switch shows the backend state; it changes only when the request succeeds.
    input.checked = this.enabled;
    if (this.busy || wantEnabled === this.enabled) return;
    if (wantEnabled) {
      this.enable();
    } else if (confirm('Disable the Kitchen Screen? All kitchen screens of this branch will be logged out.')) {
      this.disable();
    }
  }

  resetPassword(): void {
    if (this.busy) return;
    if (!confirm('Reset the Kitchen Screen password? Kitchen screens that are already logged in keep working. New logins need the new password.')) return;
    this.enable();
  }

  togglePasswordReveal(): void { this.passwordRevealed = !this.passwordRevealed; }

  copy(target: CopyTarget): void {
    if (!this.login) return;
    const value = target === 'password' ? this.login.password : this.runSettings;
    this.copied = null;
    this.copyFailed = false;
    navigator.clipboard.writeText(value).then(
      () => this.copied = target,
      () => this.copyFailed = true
    );
  }

  private load(): void {
    this.request?.unsubscribe();
    this.enabled = false;
    this.username = null;
    this.forbidden = false;
    this.error = '';
    if (!this.branchId) return;
    this.loading = true;
    this.request = this.merchantApi.getKitchenAccess(this.selectedEnvironment, this.apiVersion, this.branchId).subscribe({
      next: (status) => { this.loading = false; this.enabled = status.enabled; this.username = status.username; },
      error: (err) => { this.loading = false; this.handleError(err, 'Failed to load the Kitchen Screen status.'); }
    });
  }

  private enable(): void {
    this.run(this.merchantApi.enableKitchenAccess(this.selectedEnvironment, this.apiVersion, this.branchId), 'Failed to enable the Kitchen Screen.', (login) => {
      this.enabled = true;
      this.username = login.username;
      this.passwordRevealed = false;
      this.copied = null;
      this.copyFailed = false;
      this.login = login;
    });
  }

  private disable(): void {
    this.run(this.merchantApi.disableKitchenAccess(this.selectedEnvironment, this.apiVersion, this.branchId), 'Failed to disable the Kitchen Screen.', (status) => {
      this.clearLogin();
      this.enabled = status.enabled;
      this.username = status.username;
    });
  }

  private run<T>(call$: Observable<T>, fallback: string, onSuccess: (result: T) => void): void {
    this.busy = true;
    this.error = '';
    this.request?.unsubscribe();
    this.request = call$.subscribe({
      next: (result) => { this.busy = false; onSuccess(result); },
      error: (err) => { this.busy = false; this.handleError(err, fallback); }
    });
  }

  private clearLogin(): void {
    this.login = null;
    this.passwordRevealed = false;
    this.copied = null;
    this.copyFailed = false;
  }

  private handleError(error: unknown, fallback: string): void {
    const status = error instanceof HttpErrorResponse ? error.status : undefined;
    if (status === 403) {
      this.clearLogin();
      this.forbidden = true;
      return;
    }
    this.error = this.toMessage(error, fallback);
  }

  /** Server detail first (CONSTITUTION §VIII), except where the server message carries the branch UUID (404). */
  private toMessage(error: unknown, fallback: string): string {
    const httpError = error as HttpErrorResponse;
    if (httpError?.status === 0) return 'Could not reach the server. Check your connection and try again.';
    if (httpError?.status === 404) return 'Branch not found.';
    const body = httpError?.error as { detail?: string; message?: string; error?: string } | null | undefined;
    const serverMessage = body?.detail || body?.message || body?.error;
    if (serverMessage) return serverMessage;
    if (httpError?.status === 409) return 'The kitchen username is already used by another branch.';
    return fallback;
  }
}
