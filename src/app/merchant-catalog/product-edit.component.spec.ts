import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CatalogTranslation, MenuLanguage, Merchant, Product } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { ProductEditComponent } from './product-edit.component';

describe('ProductEditComponent translations', () => {
  let fixture: ComponentFixture<ProductEditComponent>;
  let component: ProductEditComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const merchant: Merchant = {
    merchantId: 'm-1', merchantCode: 'MRC-1', merchantName: 'Café Lena', merchantStatus: 'ACTIVE',
    offerings: ['INTERNATIONAL_MENU'], lastUpdatedAt: '2026-10-31T12:00:00Z',
    originalMenuLanguage: 'de', supportedMenuLanguages: ['en', 'fr'],
  };
  const product: Product = {
    productId: 'p-1', merchantId: 'm-1', branchId: 'b-1', name: 'Leberkäse', description: 'Mit süßem Senf',
    unitPrice: 6.5, active: true, status: 'ACTIVE', createdAt: '2026-10-31T12:00:00Z', updatedAt: '2026-10-31T12:00:00Z',
    language: 'de',
  };
  const catalogue: MenuLanguage[] = [
    { code: 'en', displayName: 'English', nativeName: 'English' },
    { code: 'fr', displayName: 'French', nativeName: 'Français' },
  ];
  const english: CatalogTranslation = {
    language: 'en', name: 'Liver cheese', description: 'With sweet mustard', origin: 'MACHINE', stale: true, updatedAt: '2026-10-31T12:00:00Z',
  };

  async function setup(loadedMerchant: Merchant = merchant) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', [
      'getMerchant', 'getProduct', 'getProductCategories', 'getMenuLanguages', 'getProductTranslations',
      'saveProductTranslation', 'deleteProductTranslation', 'updateProduct',
    ]);
    merchantApi.getMerchant.and.returnValue(of(loadedMerchant));
    merchantApi.getProduct.and.returnValue(of(product));
    merchantApi.getProductCategories.and.returnValue(of([]));
    merchantApi.getMenuLanguages.and.returnValue(of(catalogue));
    merchantApi.getProductTranslations.and.returnValue(of([english]));

    await TestBed.configureTestingModule({
      imports: [ProductEditComponent],
      providers: [
        provideRouter([{ path: '**', children: [] }]),
        { provide: MerchantApiService, useValue: merchantApi },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: 'm-1', productId: 'p-1' }) } } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';

  it('loads the product and categories in the Original Menu Language so saves never store a translation', async () => {
    await setup();
    expect(merchantApi.getProduct).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'p-1', undefined, 'de');
    expect(merchantApi.getProductCategories).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'de');
    expect(component.form.name).toBe('Leberkäse');
  });

  it('shows one translation row per Supported Menu Language', async () => {
    await setup();
    expect(component.translations.map((row) => row.language)).toEqual(['en', 'fr']);
    const en = component.translations[0];
    expect(en.name).toBe('Liver cheese');
    expect(en.exists).toBeTrue();
    expect(en.stale).toBeTrue();
    expect(component.translations[1].exists).toBeFalse();
    expect(text()).toContain('Needs re-translation');
    expect(text()).toContain('Machine');
  });

  it('saves a translation as the merchant', async () => {
    await setup();
    const row = component.translations[0];
    row.name = 'Bavarian meatloaf';
    merchantApi.saveProductTranslation.and.returnValue(of({ ...english, name: 'Bavarian meatloaf', origin: 'MERCHANT', stale: false }));

    component.saveTranslation(row);

    expect(merchantApi.saveProductTranslation).toHaveBeenCalledWith(
      jasmine.anything(), 'v1', 'm-1', 'p-1', 'en', { name: 'Bavarian meatloaf', description: 'With sweet mustard' }
    );
    expect(row.origin).toBe('MERCHANT');
    expect(row.stale).toBeFalse();
  });

  it('shows the API error inside the translation row', async () => {
    await setup();
    const row = component.translations[1];
    row.name = 'Fromage';
    merchantApi.saveProductTranslation.and.returnValue(throwError(() => ({ error: { error: 'Menu language not supported' } })));

    component.saveTranslation(row);

    expect(row.error).toBe('Menu language not supported');
  });

  it('requires a translated name', async () => {
    await setup();
    component.saveTranslation(component.translations[1]);
    expect(merchantApi.saveProductTranslation).not.toHaveBeenCalled();
    expect(component.translations[1].error).toContain('name');
  });

  it('deletes a translation', async () => {
    await setup();
    spyOn(window, 'confirm').and.returnValue(true);
    merchantApi.deleteProductTranslation.and.returnValue(of(undefined));

    component.deleteTranslation(component.translations[0]);

    expect(merchantApi.deleteProductTranslation).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'p-1', 'en');
    expect(component.translations[0].exists).toBeFalse();
    expect(component.translations[0].name).toBe('');
  });

  it('skips translations when the merchant has no supported languages', async () => {
    await setup({ ...merchant, supportedMenuLanguages: [] });
    expect(merchantApi.getProductTranslations).not.toHaveBeenCalled();
    expect(component.translations).toEqual([]);
  });
});
