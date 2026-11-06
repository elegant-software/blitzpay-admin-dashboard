import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { NotificationComponent } from './notification.component';
import { NotificationService } from './notification.service';

describe('NotificationComponent', () => {
  let fixture: ComponentFixture<NotificationComponent>;
  let notifications: NotificationService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [NotificationComponent], providers: [provideNoopAnimations()] }).compileComponents();
    fixture = TestBed.createComponent(NotificationComponent);
    notifications = TestBed.inject(NotificationService);
    fixture.detectChanges();
  });

  it('stacks accessible notifications at the top center without taking focus and supports dismissal', fakeAsync(() => {
    const button = document.createElement('button');
    document.body.appendChild(button);
    button.focus();
    notifications.success('Order added successfully');
    notifications.error('Could not save changes. Please try again.');
    fixture.detectChanges();
    tick();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.p-toast-top-center')).not.toBeNull();
    expect(root.querySelectorAll('[role="alert"]').length).toBe(2);
    expect(document.activeElement).toBe(button);
    expect(root.textContent).toContain('Order added successfully');
    const close = root.querySelector<HTMLButtonElement>('.p-toast-close-button')!;
    expect(close.getAttribute('aria-label')).toBeTruthy();
    close.click();
    fixture.detectChanges();
    tick();
    expect(root.querySelectorAll('[role="alert"]').length).toBe(1);
    button.remove();
    tick(12000);
  }));

  it('keeps notifications usable above native modal dialogs', async () => {
    const dialog = document.createElement('dialog');
    document.body.appendChild(dialog);
    try {
      dialog.showModal();
      notifications.error('Could not rename the table. Please try again.');
      fixture.detectChanges();
      await fixture.whenStable();
      expect(dialog.querySelector('p-toast')).not.toBeNull();
      dialog.close();
      await new Promise(resolve => setTimeout(resolve));
      expect(fixture.nativeElement.querySelector('p-toast')).not.toBeNull();
    } finally {
      dialog.remove();
    }
  });
});
