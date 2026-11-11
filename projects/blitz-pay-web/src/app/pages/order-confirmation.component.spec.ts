import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { provideRouter } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { StorefrontOrder } from '../models/storefront.models';
import { StorefrontApiService } from '../services/storefront-api.service';
import { OrderConfirmationComponent } from './order-confirmation.component';

describe('Payment return', () => {
  let events: Subject<StorefrontOrder>;
  let unsubscribed: boolean;
  let initial: StorefrontOrder;
  let getGuestOrder: jasmine.Spy;
  let guestOrderEvents: jasmine.Spy;

  function create() {
    TestBed.configureTestingModule({ providers: [provideRouter([]),
      { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ orderId: 'o1' }) } } },
      { provide: StorefrontApiService, useValue: { getGuestOrder, guestOrderEvents, getGuestInvoice: () => of({ url: "https://example.com/invoice.pdf", filename: "invoice.pdf" }) } }
    ] });
    const fixture = TestBed.createComponent(OrderConfirmationComponent);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    sessionStorage.clear();
    events = new Subject<StorefrontOrder>();
    unsubscribed = false;
    initial = { orderId: 'o1', status: 'CREATED' };
    getGuestOrder = jasmine.createSpy('getGuestOrder').and.callFake(() => of(initial));
    guestOrderEvents = jasmine.createSpy('guestOrderEvents').and.callFake(() =>
      new Observable<StorefrontOrder>(subscriber => {
        const inner = events.subscribe(subscriber);
        return () => { unsubscribed = true; inner.unsubscribe(); };
      }));
  });

  it('does not claim success based on the return URL alone', () => {
    const fixture = create();
    expect(fixture.nativeElement.textContent).not.toContain('Payment confirmed');
    expect(fixture.nativeElement.textContent).toContain('Checking your payment');
    expect(fixture.nativeElement.querySelector('web-app-download')).toBeNull();
    expect(fixture.nativeElement.querySelector('web-order-invoice')).toBeNull();
  });

  it('shows non-sticky store links only after the backend confirms payment', () => {
    const fixture = create();
    expect(fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]')).toBeNull();
    events.next({ orderId: 'o1', status: 'PAID' }); fixture.detectChanges();
    const invitation = fixture.nativeElement.querySelector('[data-testid="app-install-prompt"]') as HTMLElement;
    expect(invitation.querySelectorAll('a').length).toBe(2);
    expect(getComputedStyle(invitation).position).not.toBe('fixed');
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Payment confirmed');
  });

  it('shows the Pickup Number and Preparation Status and updates them live', () => {
    initial = { orderId: 'o1', status: 'CREATED', preparationStatus: 'RECEIVED', pickupNumber: 17 };
    const fixture = create();
    const text = () => fixture.nativeElement.textContent as string;
    expect(guestOrderEvents).toHaveBeenCalledWith('o1');
    expect(fixture.nativeElement.querySelector('.pickup-number').textContent).toBe('17');
    expect(text()).toContain('Received');

    events.next({ orderId: 'o1', status: 'PAID', preparationStatus: 'PREPARING', pickupNumber: 17 });
    fixture.detectChanges();
    expect(text()).toContain('Payment confirmed');
    expect(text()).toContain('Preparing');
    expect(unsubscribed).toBeFalse();

    events.next({ orderId: 'o1', status: 'PAID', preparationStatus: 'READY', pickupNumber: 17 });
    fixture.detectChanges();
    expect(text()).toContain('Ready for pickup');
    expect(unsubscribed).toBeTrue();
  });

  it('hides the Pickup Number when the order has none', () => {
    initial = { orderId: 'o1', status: 'PAID', preparationStatus: 'RECEIVED', pickupNumber: null };
    const fixture = create();
    expect(fixture.nativeElement.querySelector('.pickup-number')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Received');
  });

  it('does not open the stream for an order that is already ready', () => {
    initial = { orderId: 'o1', status: 'PAID', preparationStatus: 'READY', pickupNumber: 3 };
    create();
    expect(guestOrderEvents).not.toHaveBeenCalled();
  });

  it('closes the stream when the page is destroyed', () => {
    const fixture = create();
    fixture.destroy();
    expect(unsubscribed).toBeTrue();
  });

  it('falls back to the manual refresh button when the stream fails', () => {
    const fixture = create();
    events.error(new Error('closed'));
    fixture.detectChanges();
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.checkout-button');
    expect(button.textContent).toContain('Check payment status');
    expect(fixture.nativeElement.querySelector('.storefront-alert')).toBeNull();

    initial = { orderId: 'o1', status: 'PAID' };
    events = new Subject<StorefrontOrder>();
    button.click();
    fixture.detectChanges();
    expect(getGuestOrder).toHaveBeenCalledTimes(2);
    expect(guestOrderEvents).toHaveBeenCalledTimes(2);
    expect(fixture.nativeElement.textContent).toContain('Payment confirmed');
  });
});
