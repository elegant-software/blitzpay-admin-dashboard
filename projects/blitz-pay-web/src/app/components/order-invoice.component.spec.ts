import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../environments/environment';
import { OrderInvoiceComponent } from './order-invoice.component';

describe('Paid order invoice', () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  function create() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const fixture = TestBed.createComponent(OrderInvoiceComponent);
    fixture.componentRef.setInput('orderId', 'ORD-PAID001');
    fixture.detectChanges();
    return fixture;
  }

  it('offers the paid invoice and a scannable QR after the backend returns the link', async () => {
    const fixture = create();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/${environment.apiVersion}/storefront/orders/ORD-PAID001/invoice`)
      .flush({ url: 'https://storage.example/invoices/ORD-PAID001.pdf?signature=test', filename: 'invoice-ORD-PAID001.pdf' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-download"]').href)
      .toContain('/invoices/ORD-PAID001.pdf?signature=test');
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-qr"]').src).toMatch(/^data:image\/png;base64,/);
  });
  it('shows invoice availability feedback and lets the shopper retry', async () => {
    const fixture = create();
    const http = TestBed.inject(HttpTestingController);
    const path = `${environment.apiBaseUrl}/${environment.apiVersion}/storefront/orders/ORD-PAID001/invoice`;
    http.expectOne(path).flush({ detail: 'Not ready' }, { status: 404, statusText: 'Not Found' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-download"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('not ready yet');
    fixture.nativeElement.querySelector('button').click();
    http.expectOne(path).flush({ url: 'https://storage.example/invoice.pdf', filename: 'invoice.pdf' });
    await fixture.whenStable(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-download"]')).not.toBeNull();
  });

  it('shows safe feedback for server failures rather than claiming the invoice was sent', () => {
    const fixture = create();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/${environment.apiVersion}/storefront/orders/ORD-PAID001/invoice`)
      .flush({ detail: 'Invoice storage is unavailable' }, { status: 503, statusText: 'Unavailable' });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Unable to load your invoice. Please try again.');
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-qr"]')).toBeNull();
  });

  it('retires the download and QR when the signed link expires', fakeAsync(() => {
    const fixture = create();
    TestBed.inject(HttpTestingController).expectOne(`${environment.apiBaseUrl}/${environment.apiVersion}/storefront/orders/ORD-PAID001/invoice`)
      .flush({ url: 'https://storage.example/invoices/ORD-PAID001.pdf', filename: 'invoice.pdf' });
    tick(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-download"]')).not.toBeNull();
    tick(30 * 60_000); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-download"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-testid="invoice-qr"]')).toBeNull();
    fixture.destroy();
  }));

});
