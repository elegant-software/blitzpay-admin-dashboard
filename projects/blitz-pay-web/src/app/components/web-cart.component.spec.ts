import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { WebCartComponent } from './web-cart.component';
import { StorefrontSessionService } from '../services/storefront-session.service';

describe('WebCartComponent mobile dialog', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ imports: [WebCartComponent], providers: [provideRouter([])] });
  });

  async function setup() {
    const fixture = TestBed.createComponent(WebCartComponent);
    fixture.componentRef.setInput('merchantId', 'm1');
    fixture.componentRef.setInput('branchId', 'b1');
    const cart = TestBed.inject(StorefrontSessionService);
    cart.useScope('m1', 'b1');
    cart.add({ productId: 'p1', branchId: 'b1', name: 'Coffee', unitPrice: 3.5, active: true });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector<HTMLButtonElement>('.mobile-cart-summary')!;
    trigger.focus();
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();
    return { fixture, root, trigger, cart, dialog: root.querySelector<HTMLDialogElement>('dialog')! };
  }

  it('opens a modal cart, focuses close, and restores focus and scrolling on close', async () => {
    const { fixture, root, trigger, dialog } = await setup();
    expect(dialog.open).toBeTrue();
    expect(dialog.getAttribute('aria-labelledby')).toBe('mobile-cart-title');
    expect(document.activeElement).toBe(dialog.querySelector('[autofocus]'));
    expect(document.body.style.overflow).toBe('hidden');
    root.querySelector<HTMLButtonElement>('[aria-label="Close cart"]')!.click();
    fixture.detectChanges();
    expect(dialog.open).toBeFalse();
    expect(document.activeElement).toBe(trigger);
    expect(document.body.style.overflow).not.toBe('hidden');
  });

  it('updates quantities and shows a continue shopping action when the last item is removed', async () => {
    const { fixture, dialog, cart } = await setup();
    dialog.querySelector<HTMLButtonElement>('[aria-label="Add one Coffee"]')!.click();
    fixture.detectChanges();
    expect(cart.itemCount).toBe(2);
    expect(dialog.querySelector('.cart-total')?.textContent).toContain('7.00');
    const remove = () => dialog.querySelector<HTMLButtonElement>('[aria-label="Remove one Coffee"]')!.click();
    remove();
    remove();
    fixture.detectChanges();
    expect(dialog.textContent).toContain('Your cart is empty');
    expect(dialog.querySelector('[data-testid="checkout"]')).toBeNull();
    dialog.querySelector<HTMLButtonElement>('.continue-shopping')!.click();
    fixture.detectChanges();
    expect(dialog.open).toBeFalse();
  });

  it('handles Escape cancellation and cleans up scrolling when destroyed', async () => {
    const { fixture, trigger, dialog } = await setup();
    dialog.dispatchEvent(new Event('cancel', { cancelable: true }));
    fixture.detectChanges();
    expect(dialog.open).toBeFalse();
    trigger.click();
    fixture.detectChanges();
    expect(dialog.open).toBeTrue();
    fixture.destroy();
    expect(document.body.style.overflow).not.toBe('hidden');
  });
});
