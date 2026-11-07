import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WhiteLabelComponent } from './white-label.component';
import { MerchantApiService } from '../services/merchant-api.service';
import { defaultPalette } from './white-label.models';

describe('White-label settings page', () => {
  beforeEach(async () => {
    const api = jasmine.createSpyObj('MerchantApiService', ['getWhiteLabel', 'getBranches', 'getMerchant', 'listWhiteLabelThemes']);
    api.getWhiteLabel.and.returnValue(of({settings: {enabled: true, displayName: 'North', hiddenFeatures: []}, revision: 2,
      effective: {enabled: true, displayName: 'North', title: 'North', logoUrl: null, darkLogoUrl: null,
        themeMode: 'SYSTEM', light: defaultPalette(false), dark: defaultPalette(true), features: []},
      availableFeatures: [], inherited: false}));
    api.getBranches.and.returnValue(of([])); api.getMerchant.and.returnValue(of({merchantName: 'North'}));
    api.listWhiteLabelThemes.and.returnValue(of([]));
    await TestBed.configureTestingModule({imports: [WhiteLabelComponent], providers: [provideRouter([]),
      {provide: MerchantApiService, useValue: api},
      {provide: ActivatedRoute, useValue: {snapshot: {paramMap: new Map([['id', 'merchant-1']]), queryParamMap: new Map()}}}
    ]}).compileComponents();
  });
  it('renders the editor directly as a page without modal semantics or an entry button', async () => {
    const fixture = TestBed.createComponent(WhiteLabelComponent); fixture.detectChanges(); await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('main #white-label-form')).not.toBeNull();
    expect(page.querySelector('[role="dialog"], [aria-modal], .product-dialog-backdrop')).toBeNull();
    expect(page.querySelector('h1')?.textContent).toContain('White label');
    expect(Array.from(page.querySelectorAll('button')).some(b => b.textContent?.trim() === 'Edit white label')).toBeFalse();
  });
  it('discards edits while keeping the page editor visible', async () => {
    const fixture = TestBed.createComponent(WhiteLabelComponent); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance;
    component.settings.displayName = 'Draft'; component.markDirty();
    spyOn(window, 'confirm').and.returnValue(true);
    component.cancel(); fixture.detectChanges(); await fixture.whenStable();
    expect(component.settings.displayName).toBe('North');
    expect(component.dirty).toBeFalse();
    expect(fixture.nativeElement.querySelector('#white-label-form')).not.toBeNull();
  });
  it('scrolls each section without document navigation, reloading configuration or discarding edits', async () => {
    const fixture = TestBed.createComponent(WhiteLabelComponent); fixture.detectChanges(); await fixture.whenStable();
    const component = fixture.componentInstance;
    component.settings.displayName = 'Unsaved brand'; component.markDirty();
    const api = TestBed.inject(MerchantApiService) as jasmine.SpyObj<MerchantApiService>;
    const requestCount = api.getWhiteLabel.calls.count();
    const currentUrl = window.location.href;
    const confirm = spyOn(window, 'confirm');
    const page: HTMLElement = fixture.nativeElement;
    const links = page.querySelectorAll<HTMLAnchorElement>('.section-nav a');
    expect(links.length).toBe(5);
    for (const link of Array.from(links)) {
      const section = page.querySelector<HTMLElement>(link.getAttribute('href')!)!;
      const scroll = spyOn(section, 'scrollIntoView');
      let navigationPrevented = false;
      // Cancel in the test too, so the unfixed link cannot reload the Karma runner.
      link.addEventListener('click', event => {
        navigationPrevented = event.defaultPrevented;
        event.preventDefault();
      }, {once: true});
      link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}));
      expect(navigationPrevented).withContext(link.textContent || '').toBeTrue();
      expect(scroll).withContext(link.textContent || '').toHaveBeenCalledWith({block: 'start'});
      expect(document.activeElement).toBe(section);
    }
    expect(component.settings.displayName).toBe('Unsaved brand');
    expect(component.dirty).toBeTrue();
    expect(window.location.href).toBe(currentUrl);
    expect(api.getWhiteLabel.calls.count()).toBe(requestCount);
    expect(confirm).not.toHaveBeenCalled();
  });
  it('prevents native section navigation while settings are still loading', async () => {
    const fixture = TestBed.createComponent(WhiteLabelComponent); fixture.detectChanges(); await fixture.whenStable();
    fixture.componentInstance.loading = true; fixture.detectChanges();
    const link: HTMLAnchorElement = fixture.nativeElement.querySelector('.section-nav a');
    let navigationPrevented = false;
    link.addEventListener('click', event => {
      navigationPrevented = event.defaultPrevented; event.preventDefault();
    }, {once: true});
    expect(() => link.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true}))).not.toThrow();
    expect(navigationPrevented).toBeTrue();
  });
  it('provides section links and keeps publishing actions on the page', async () => {
    const fixture = TestBed.createComponent(WhiteLabelComponent); fixture.detectChanges(); await fixture.whenStable();
    const page: HTMLElement = fixture.nativeElement;
    expect(page.querySelector('nav[aria-label="White-label sections"]')).not.toBeNull();
    expect(page.querySelector('#brand-identity')).not.toBeNull();
    expect(page.querySelector('#brand-colors')).not.toBeNull();
    expect(page.querySelector('button[form="white-label-form"]')?.textContent).toContain('Publish changes');
  });
});
