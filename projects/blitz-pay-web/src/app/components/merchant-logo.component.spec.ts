import { TestBed } from '@angular/core/testing';
import { MerchantLogoComponent } from './merchant-logo.component';

describe('Storefront merchant logo', () => {
  it('shows the merchant logo and falls back to its initial when the image fails', () => {
    const fixture = TestBed.createComponent(MerchantLogoComponent);
    fixture.componentRef.setInput('merchant', { merchantName: 'Cafe', logoUrl: 'https://example.test/cafe.png' });
    fixture.detectChanges();
    const logo: HTMLImageElement = fixture.nativeElement.querySelector('img');
    expect(logo.getAttribute('src')).toBe('https://example.test/cafe.png');
    expect(logo.alt).toBe('Cafe logo');
    logo.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('C');
  });
});
