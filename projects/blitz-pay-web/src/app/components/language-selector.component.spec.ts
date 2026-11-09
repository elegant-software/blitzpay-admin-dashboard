import { TestBed } from '@angular/core/testing';
import { LanguageSelectorComponent } from './language-selector.component';
import { StorefrontLanguageService } from '../services/storefront-language.service';

describe('LanguageSelectorComponent', () => {
  beforeEach(() => sessionStorage.clear());

  function render(languages: string[]) {
    const fixture = TestBed.createComponent(LanguageSelectorComponent);
    fixture.componentRef.setInput('languages', languages);
    fixture.detectChanges();
    document.body.appendChild(fixture.nativeElement);
    return fixture;
  }

  it('shows the original language flag, lists native names with flags, and emits the pick', () => {
    const fixture = render(['de', 'ar', 'en', 'tr']);
    const host: HTMLElement = fixture.nativeElement;
    const trigger = host.querySelector<HTMLButtonElement>('[data-testid="catalog-language"]')!;
    expect(trigger.textContent).toContain('DE');
    expect(trigger.querySelector('img')!.getAttribute('src')).toBe('/flags/de.svg');

    trigger.click();
    fixture.detectChanges();
    const items = Array.from(host.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'));
    expect(items.map(item => item.textContent?.replace('✓', '').trim())).toEqual(['Deutsch', 'العربية', 'English', 'Türkçe']);
    expect(items.map(item => item.querySelector('img')!.getAttribute('src'))).toEqual(['/flags/de.svg', '/flags/sa.svg', '/flags/gb.svg', '/flags/tr.svg']);

    const picks: string[] = [];
    TestBed.inject(StorefrontLanguageService).changes.subscribe(code => picks.push(code));
    host.querySelector<HTMLButtonElement>('[data-language="en"]')!.click();
    fixture.detectChanges();
    expect(picks).toEqual(['en']);
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBe('en');
    expect(trigger.textContent).toContain('EN');
    expect(host.querySelector('[role="menu"]')).toBeNull();
    fixture.nativeElement.remove();
  });

  it('supports arrow navigation and Escape without choosing', async () => {
    const fixture = render(['de', 'en', 'ar']);
    const trigger = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[data-testid="catalog-language"]')!;
    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    await new Promise(resolve => setTimeout(resolve));
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent).toContain('Deutsch');

    document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement?.textContent).toContain('English');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger);
    expect(sessionStorage.getItem('blitzpay.storefront-language')).toBeNull();
    fixture.nativeElement.remove();
  });
});
