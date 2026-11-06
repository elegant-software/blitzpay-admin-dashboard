import { TestBed } from '@angular/core/testing';
import { MerchantLogoComponent } from './merchant-logo.component';

describe('Storefront merchant logo', () => {
  it('uses the supplied official logo for the approved bona-me merchant', () => {
    const fixture = TestBed.createComponent(MerchantLogoComponent);
    fixture.componentRef.setInput('merchantId', '8ff7bcf5-e52c-4c25-877e-a32cfc81ea46');
    fixture.componentRef.setInput('merchant', { merchantName: 'Bona-me', logoUrl: 'https://example.test/old.png' });
    fixture.detectChanges();
    const logo: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(logo.getAttribute('src')).toBe('/bona-me-logo.png');
    expect(logo.alt).toBe('Bona-me logo');
  });

  it('preserves other merchant logos and falls back when an image fails', () => {
    const fixture = TestBed.createComponent(MerchantLogoComponent);
    fixture.componentRef.setInput('merchantId', 'another-merchant');
    fixture.componentRef.setInput('merchant', { merchantName: 'Cafe', logoUrl: 'https://example.test/cafe.png' });
    fixture.detectChanges();
    const logo: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(logo.getAttribute('src')).toBe('https://example.test/cafe.png');
    logo.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('C');
  });
});
