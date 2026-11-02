import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MerchantSearchResultItem } from '../models/merchant-catalog.models';
import { MerchantSearchComponent } from './merchant-search.component';

describe('MerchantSearchComponent', () => {
  let fixture: ComponentFixture<MerchantSearchComponent>;
  let component: MerchantSearchComponent;

  const merchant: MerchantSearchResultItem = {
    merchantId: 'merchant-1',
    merchantName: 'Northstar Cafe',
    merchantCode: 'NS-01',
    city: 'Berlin',
    country: 'Germany',
    businessType: 'CAFE',
    merchantMobility: 'BRICK_AND_MORTAR',
    merchantStatus: 'ACTIVE',
    lastUpdatedAt: ''
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantSearchComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MerchantSearchComponent);
    component = fixture.componentInstance;
    component.inputId = 'merchant-picker';
    component.results = [merchant];
    fixture.detectChanges();
  });

  it('emits query changes and search requests from the input', () => {
    const queryChange = jasmine.createSpy('queryChange');
    const search = jasmine.createSpy('search');
    component.queryChange.subscribe(queryChange);
    component.search.subscribe(search);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = 'North';
    input.dispatchEvent(new Event('input'));
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(queryChange).toHaveBeenCalledWith('North');
    expect(search).toHaveBeenCalled();
  });

  it('emits the selected merchant from a keyboard-operable result button', () => {
    const selected = jasmine.createSpy('merchantSelected');
    component.merchantSelected.subscribe(selected);
    fixture.detectChanges();

    const option = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>('[role="option"]');
    expect(option?.tagName).toBe('BUTTON');
    option?.click();
    expect(selected).toHaveBeenCalledWith(merchant);
  });

  it('preserves host-specific appearance and assignment status details', () => {
    component.variant = 'assignment';
    component.locationMode = 'city-country';
    component.showMerchantStatus = true;
    component.selectedMerchantId = merchant.merchantId;
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.merchant-search--assignment')).not.toBeNull();
    expect(root.querySelector('[aria-selected="true"]')).not.toBeNull();
    expect(root.querySelector('.merchant-search-status')?.textContent).toContain('ACTIVE');
    expect(root.querySelector('.merchant-search-result-copy small')?.textContent).toContain('Berlin, Germany');
    expect(getComputedStyle(root.querySelector('.merchant-search-results')!).position).toBe('static');
  });

  it('keeps the catalog browse search style distinct from picker variants', () => {
    component.variant = 'catalog';
    component.results = [];
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('.merchant-search--catalog')).not.toBeNull();
    expect(root.querySelector('.input-group > .btn-primary')).not.toBeNull();
    expect(root.querySelector('.merchant-search-results')).toBeNull();
  });
});
