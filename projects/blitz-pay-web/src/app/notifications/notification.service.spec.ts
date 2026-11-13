import { HttpErrorResponse } from "@angular/common/http";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ToastMessageOptions } from "primeng/api";
import { NotificationService } from "./notification.service";

describe("NotificationService", () => {
  let notifications: NotificationService;
  let messages: ToastMessageOptions[];

  beforeEach(() => {
    sessionStorage.clear(); // other specs leave a saved UI language behind
    notifications = TestBed.inject(NotificationService);
    messages = [];
    notifications.messageObserver.subscribe((message) =>
      messages.push(...(Array.isArray(message) ? message : [message])),
    );
  });

  it("provides four distinguishable variants with longer error durations", fakeAsync(() => {
    notifications.success("Order added successfully");
    notifications.info("Export is being prepared");
    notifications.warning("Some settlements could not be refreshed");
    notifications.error("Could not add order. Please try again.");
    expect(messages.map((message) => message.severity)).toEqual([
      "success",
      "info",
      "warn",
      "error",
    ]);
    expect(new Set(messages.map((message) => message.summary)).size).toBe(4);
    expect(messages[3].life!).toBeGreaterThan(messages[0].life!);
    tick(12000);
  }));

  it("uses useful validation detail and falls back for network and technical errors", fakeAsync(() => {
    notifications.apiError(
      new HttpErrorResponse({
        status: 422,
        error: {
          detail: "This branch is not accepting orders.",
          message: "Other message",
        },
      }),
      "Could not add order. Please try again.",
    );
    notifications.apiError(
      new HttpErrorResponse({ status: 0 }),
      "Could not add order. Please try again.",
    );
    notifications.apiError(
      new HttpErrorResponse({
        status: 500,
        error: { detail: "SQLException: secret database host" },
      }),
      "Could not save changes. Please try again.",
    );
    notifications.apiError(
      new HttpErrorResponse({
        status: 400,
        error: {
          detail: { invalid: true },
          message: "<html>Proxy error</html>",
        },
      }),
      "Could not load data. Please try again.",
    );
    expect(messages.map((message) => message.detail)).toEqual([
      "This branch is not accepting orders.",
      "Could not reach the server. Check your connection and try again.",
      "Could not save changes. Please try again.",
      "Could not load data. Please try again.",
    ]);
    tick(12000);
  }));

  it("reports one failure once even if two handlers report the same response", fakeAsync(() => {
    const error = new HttpErrorResponse({
      status: 400,
      error: { detail: "Branch is closed." },
    });
    notifications.apiError(error, "Could not add order.");
    notifications.apiError(error, "Could not save changes.");
    notifications.error("Branch is closed.");
    expect(messages.length).toBe(1);
    tick(12000);
    notifications.error("Branch is closed.");
    expect(messages.length).toBe(2);
    tick(12000);
  }));
});
