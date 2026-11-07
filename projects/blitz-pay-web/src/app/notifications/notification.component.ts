import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  inject,
} from "@angular/core";
import { DOCUMENT } from "@angular/common";
import { MessageService } from "primeng/api";
import { ToastModule } from "primeng/toast";
import { Subscription } from "rxjs";

import { NotificationService } from "./notification.service";

@Component({
  selector: "app-notifications",
  standalone: true,
  imports: [ToastModule],
  providers: [
    {
      provide: MessageService,
      useExisting: NotificationService,
    },
  ],
  template: `
    <p-toast
      position="top-center"
      styleClass="app-toast"
      [baseZIndex]="10000"
      [preventOpenDuplicates]="true"
      (onClose)="notifications.dismissed($event.message)"
    />
  `,
})
export class NotificationComponent implements OnInit, OnDestroy {
  readonly notifications = inject(NotificationService);

  private readonly element = inject(ElementRef<HTMLElement>);

  private readonly document = inject(DOCUMENT);

  private subscription?: Subscription;

  private originalParent: Node | null = null;
  private originalNextSibling: Node | null = null;

  private activeDialog: HTMLDialogElement | null = null;

  ngOnInit(): void {
    const host = this.element.nativeElement;

    this.originalParent = host.parentNode;
    this.originalNextSibling = host.nextSibling;

    this.subscription = this.notifications.messageObserver.subscribe(() => {
      this.syncToastContainer();
    });
  }

  private syncToastContainer(): void {
    const dialogs = Array.from(
      this.document.querySelectorAll<HTMLDialogElement>("dialog:modal"),
    );

    const dialog = dialogs.at(-1) ?? null;

    if (!dialog) {
      this.restoreToastContainer();
      return;
    }

    if (this.activeDialog === dialog) {
      return;
    }

    this.activeDialog?.removeEventListener("close", this.onDialogClose);

    this.activeDialog = dialog;

    dialog.appendChild(this.element.nativeElement);

    dialog.addEventListener("close", this.onDialogClose);
  }

  private readonly onDialogClose = (): void => {
    this.restoreToastContainer();
  };

  private restoreToastContainer(): void {
    this.activeDialog?.removeEventListener("close", this.onDialogClose);

    this.activeDialog = null;

    if (!this.originalParent) {
      return;
    }

    const host = this.element.nativeElement;

    if (this.originalNextSibling?.parentNode === this.originalParent) {
      this.originalParent.insertBefore(host, this.originalNextSibling);
    } else {
      this.originalParent.appendChild(host);
    }
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();

    this.restoreToastContainer();
  }
}
