import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { LanguageSelectorComponent } from './language-selector.component';
import { AdminLanguageService } from './admin-language.service';

describe('LanguageSelectorComponent', () => {
  const entries = [
    { code: 'en', nativeName: 'English', flagCode: 'GB', direction: 'ltr' },
    { code: 'ar', nativeName: 'العربية', flagCode: 'SA', direction: 'rtl' }
  ];
  const selected = signal(entries[0]);
  const language = {
    selected, languages: signal(entries), loading: signal(false), error: signal(''),
    load: jasmine.createSpy('load'), select: jasmine.createSpy('select'), text: (text: string) => text
  };

  beforeEach(() => {
    selected.set(entries[0]); language.error.set(''); language.load.calls.reset(); language.select.calls.reset();
    TestBed.configureTestingModule({ imports: [LanguageSelectorComponent], providers: [{ provide: AdminLanguageService, useValue: language }] });
  });

  it('keeps the trigger compact while exposing the full selected language accessibly', () => {
    selected.set({ code: 'de', nativeName: 'Deutsch', flagCode: 'DE', direction: 'ltr' });
    const fixture = TestBed.createComponent(LanguageSelectorComponent); fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const trigger = page.querySelector<HTMLButtonElement>('.language-trigger')!;
    expect(trigger.textContent?.trim()).toBe('DE');
    expect(trigger.getAttribute('aria-label')).toBe('Language: Deutsch');
    expect(trigger.getAttribute('title')).toBe('Deutsch');
    expect(trigger.querySelector('img')?.getAttribute('src')).toBe('/flags/de.svg');
    expect(trigger.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(trigger.getBoundingClientRect().width).toBeLessThan(100);
    trigger.click(); fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(page.querySelector('[role="menu"]')?.textContent).toContain('English');
    expect(page.querySelector('[role="menu"]')?.textContent).toContain('العربية');
  });

  it('loads choices, shows flags, and selects the chosen language', () => {
    const fixture = TestBed.createComponent(LanguageSelectorComponent); fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    expect(language.load).toHaveBeenCalled();
    page.querySelector<HTMLButtonElement>('.language-trigger')!.click(); fixture.detectChanges();
    const options = page.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
    expect(options.length).toBe(2);
    expect(options[1].querySelector('img')?.getAttribute('src')).toBe('/flags/sa.svg');
    expect(options[0].getAttribute('aria-checked')).toBe('true');
    options[1].click(); fixture.detectChanges();
    expect(language.select).toHaveBeenCalledWith('ar');
    expect(page.querySelector('[role="menu"]')).toBeNull();
  });

  it('keeps flag, code, chevron and menu rows LTR inside an RTL page', () => {
    const fixture = TestBed.createComponent(LanguageSelectorComponent); fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const parent = document.createElement('div'); parent.dir = 'rtl';
    host.parentNode!.insertBefore(parent, host); parent.appendChild(host);
    try {
      const trigger = host.querySelector<HTMLButtonElement>('.language-trigger')!;
      expect(getComputedStyle(trigger).direction).toBe('ltr');
      expect(trigger.querySelector('img')!.getBoundingClientRect().left)
        .toBeLessThan(trigger.querySelector('svg')!.getBoundingClientRect().left);
      trigger.click(); fixture.detectChanges();
      const menu = host.querySelector<HTMLElement>('.language-menu')!;
      expect(getComputedStyle(menu).direction).toBe('ltr');
      const option = menu.querySelector<HTMLButtonElement>('[role="menuitemradio"]')!;
      expect(getComputedStyle(option).direction).toBe('ltr');
      expect(option.querySelector('img')!.getBoundingClientRect().left)
        .toBeLessThan(option.querySelector('span')!.getBoundingClientRect().left);
    } finally { parent.parentNode!.insertBefore(host, parent); parent.remove(); }
  });

  it('supports keyboard navigation and Escape with focus restoration', () => {
    const fixture = TestBed.createComponent(LanguageSelectorComponent); fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    const trigger = page.querySelector<HTMLButtonElement>('.language-trigger')!;
    trigger.click(); fixture.detectChanges();
    const options = page.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]');
    options[0].focus();
    options[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(options[1]);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); fixture.detectChanges();
    expect(page.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('shows load errors and allows retrying', () => {
    language.error.set('Could not load languages. English is being used.');
    const fixture = TestBed.createComponent(LanguageSelectorComponent); fixture.detectChanges();
    const page = fixture.nativeElement as HTMLElement;
    page.querySelector<HTMLButtonElement>('.language-trigger')!.click(); fixture.detectChanges();
    expect(page.querySelector('[role="alert"]')?.textContent).toContain('Could not load languages');
    page.querySelector<HTMLButtonElement>('.language-error button')!.click();
    expect(language.load).toHaveBeenCalledTimes(2);
  });
});
