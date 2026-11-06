import { HttpErrorResponse } from "@angular/common/http";
import { Injectable, OnDestroy } from "@angular/core";
import { MessageService, ToastMessageOptions } from "primeng/api";

type Severity = "success" | "info" | "warn" | "error";

/** Feature handlers own API feedback; HTTP interceptors must not emit a second notification. */
@Injectable({ providedIn: "root" })
export class NotificationService extends MessageService implements OnDestroy {
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

  apiError(error: unknown, fallback: string): void {
    if (error !== null && typeof error === "object") {
      if (this.reportedErrors.has(error)) return;
      this.reportedErrors.add(error);
    }
    this.error(apiErrorMessage(error, fallback));
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
      setTimeout(() => this.active.delete(key), life),
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

/** Show only short, plain-language 4xx API details; never render raw diagnostics. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;
  if (error.status === 0)
    return "Could not reach the server. Check your connection and try again.";
  // Authentication/authorization and server failures are handled with a friendly fallback.
  if (![400, 409, 422].includes(error.status)) return fallback;

  const body = error.error;
  if (!body || typeof body !== "object" || Array.isArray(body)) return fallback;
  const candidates: unknown[] = [
    body.detail,
    body.message,
    body.error?.detail,
    body.error?.message,
  ];
  const safe = candidates.find(
    (value): value is string =>
      typeof value === "string" &&
      value.trim().length > 0 &&
      value.length <= 300 &&
      !/[<>\r\n]|https?:\/\/|\b(?:exception|stacktrace|traceback|SQL|syntax|java\.|org\.|password|secret|token|authorization|bearer|database|localhost)\b|(?:\b(?:SELECT|INSERT|UPDATE|DELETE)\b\s+\w+)/i.test(
        value,
      ),
  );
  return safe?.trim() || fallback;
}
