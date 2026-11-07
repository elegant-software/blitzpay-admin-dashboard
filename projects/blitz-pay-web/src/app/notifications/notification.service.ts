import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, NgZone, OnDestroy, inject } from "@angular/core";
import { MessageService, ToastMessageOptions } from "primeng/api";
import { LocationUnavailableError } from '../table/storefront-location.service';

type Severity = "success" | "info" | "warn" | "error";

/** Feature handlers own API feedback; HTTP interceptors must not emit a second notification. */
@Injectable({ providedIn: "root" })
export class NotificationService extends MessageService implements OnDestroy {
  private readonly zone = inject(NgZone);
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

  apiError(error: unknown, fallback: string, byCode?: Readonly<Record<string, string>>): string {
    const message = apiErrorMessage(error, fallback, byCode);
    if (error !== null && typeof error === "object") {
      if (this.reportedErrors.has(error)) return message;
      this.reportedErrors.add(error);
    }
    this.error(message);
    return message;
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
    const detail = message.trim();
    const key = `${severity}:${detail}`;
    if (!detail || this.active.has(key)) return;

    const life =
      severity === "error" ? 12000 : severity === "warn" ? 8000 : 6000;
    this.active.set(
      key,
      this.zone.runOutsideAngular(() => setTimeout(() => this.active.delete(key), life)),
    );
    this.add({
      severity,
      summary: {
        success: "Success",
        info: "Information",
        warn: "Warning",
        error: "Error",
      }[severity],
      detail,
      life,
      closable: true,
    });
  }
}

/** Customer wording for backend error codes (ProblemDetail `code`). Branch on codes, never on `detail` text. */
const MESSAGES_BY_CODE: Readonly<Record<string, string>> = {
  LOCATION_REQUIRED: "Allow location access to confirm you are at the restaurant, then try again.",
  LOCATION_INACCURATE:
    "Your location is too approximate to confirm you are at the restaurant. Enable precise location and try again.",
  LOCATION_EXPIRED: "Your location has expired. Please try again so we can check your current location.",
  OUTSIDE_GEOFENCE: "You need to be at the restaurant to order at this table. Check your location and try again.",
  TOO_MANY_REQUESTS: "Too many payment attempts for this order. Please ask a member of staff for help.",
};

/** Backend errors are ProblemDetail bodies: `{ status, detail, code }`. Branch on `code`, never on `detail` text. */
export function apiErrorCode(error: unknown): string | undefined {
  if (!(error instanceof HttpErrorResponse)) return undefined;
  const code = error.error?.code;
  return typeof code === "string" ? code : undefined;
}

/**
 * Text for an API failure: the caller's `byCode` wording, then the storefront's `MESSAGES_BY_CODE`,
 * else a short, plain-language 4xx `detail`; never raw diagnostics.
 */
export function apiErrorMessage(
  error: unknown,
  fallback: string,
  byCode: Readonly<Record<string, string>> = {},
): string {
  if (error instanceof LocationUnavailableError) return error.message;
  if (!(error instanceof HttpErrorResponse)) return fallback;
  const code = apiErrorCode(error);
  if (code && Object.hasOwn(byCode, code)) return byCode[code];
  if (code && Object.hasOwn(MESSAGES_BY_CODE, code)) return MESSAGES_BY_CODE[code];
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
    !/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b|\b[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+\b/i.test(detail) &&
    !/[<>\r\n]|https?:\/\/|\b(?:exception|stacktrace|traceback|SQL|syntax|java\.|org\.|password|secret|token|authorization|bearer|database|localhost)\b|(?:\b(?:SELECT|INSERT|UPDATE|DELETE)\b\s+\w+)/i.test(
      detail,
    );
  return safe ? detail.trim() : fallback;
}
