import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy, inject } from "@angular/core";
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { MessageService, ToastMessageOptions } from "primeng/api";

type Severity = "success" | "info" | "warn" | "error";

/** Feature handlers own API feedback; HTTP interceptors must not emit a second notification. */
@Injectable({ providedIn: "root" })
export class NotificationService extends MessageService implements OnDestroy {
  private readonly locale = inject(AdminLocaleService);
  private readonly reportedErrors = new WeakSet<object>();
  private readonly active = new Map<string, ReturnType<typeof setTimeout>>();

  success(message: string): void {
    this.notify("success", message);
  }
  info(message: string): void {
    this.notify("info", message);
  }
  warning(message: string): void {
    this.notify("warn", message);
  }
  error(message: string): void {
    this.notify("error", message);
  }

  apiError(error: unknown, fallback: string, byCode?: Readonly<Record<string, string>>): void {
    if (error !== null && typeof error === "object") {
      if (this.reportedErrors.has(error)) return;
      this.reportedErrors.add(error);
    }
    this.error(apiErrorMessage(error, fallback, byCode));
  }

  dismissed(message: ToastMessageOptions): void {
    const key = `${message.severity}:${message.detail}`;
    clearTimeout(this.active.get(key));
    this.active.delete(key);
  }

  ngOnDestroy(): void {
    this.active.forEach((timer) => clearTimeout(timer));
    this.active.clear();
    super.clear();
  }

  private notify(severity: Severity, message: string): void {
    const detail = this.locale.text(message).trim();
    const key = `${severity}:${detail}`;
    if (!detail || this.active.has(key)) return;

    const life =
      severity === "error" ? 12000 : severity === "warn" ? 8000 : 6000;
    this.active.set(
      key,
      setTimeout(() => this.active.delete(key), life),
    );
    this.add({
      severity,
      summary: this.locale.text({
        success: "Success",
        info: "Information",
        warn: "Warning",
        error: "Error",
      }[severity]),
      detail,
      life,
      closable: true,
    });
  }
}

/** Backend errors are ProblemDetail bodies: `{ status, detail, code }`. Branch on `code`, never on `detail` text. */
export function apiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse)) return undefined;
  const code = error.error?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Text for an API failure: `byCode[code]` when the caller has its own wording for that code,
 * else a short, plain-language 4xx `detail`; never raw diagnostics.
 */
export function apiErrorMessage(
  error: unknown,
  fallback: string,
  byCode: Readonly<Record<string, string>> = {},
): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  const code = apiErrorCode(error);
  if (code && Object.hasOwn(byCode, code)) return byCode[code];
  if (error.status === 0)
    return "Could not reach the server. Check your connection and try again.";
  // Authentication/authorization and server failures are handled with a friendly fallback.
  if (![400, 409, 422].includes(error.status)) return fallback;

  const body = error.error;
  if (!body || typeof body !== "object" || Array.isArray(body)) return fallback;
  const detail: unknown = body.detail;
  const safe =
    typeof detail === "string" &&
    detail.trim().length > 0 &&
    detail.length <= 300 &&
    !/[<>\r\n]|https?:\/\/|\b(?:exception|stacktrace|traceback|SQL|syntax|java\.|org\.|password|secret|token|authorization|bearer|database|localhost)\b|(?:\b(?:SELECT|INSERT|UPDATE|DELETE)\b\s+\w+)/i.test(
      detail,
    );
  return safe ? detail.trim() : fallback;
}
