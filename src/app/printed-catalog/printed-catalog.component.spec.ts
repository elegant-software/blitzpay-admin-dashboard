import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { Branch, Merchant, Product } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { PrintedCatalogComponent } from './printed-catalog.component';

describe('PrintedCatalogComponent', () => {
  let fixture: ComponentFixture<PrintedCatalogComponent>;
  let component: PrintedCatalogComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;
  let queryParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  const merchant: Merchant = {
    merchantId: 'm-1',
    merchantCode: 'MRC-1',
    merchantName: 'Café Blitz',
    merchantStatus: 'ACTIVE',
    offerings: [],
    lastUpdatedAt: '2026-10-01T00:00:00Z',
    logoUrl: 'https://cdn.example/logo.png',
    website: 'https://cafe-blitz.example',
    contactInfo: { phoneNumber: '+49 30 123', instagramHandle: 'cafeblitz' }
  };

  const branch: Branch = {
    branchId: 'b-1',
    merchantId: 'm-1',
    branchCode: 'BR-1',
    name: 'Mitte',
    status: 'ACTIVE',
    addressLine1: 'Torstraße 1',
    postalCode: '10119',
    city: 'Berlin'
  };

  const product = (overrides: Partial<Product>): Product => ({
    productId: overrides.name ?? 'p',
    merchantId: 'm-1',
    branchId: 'b-1',
    name: 'Product',
    unitPrice: 1,
    active: true,
    status: 'ACTIVE',
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
    ...overrides
  });

  const products: Product[] = [
    product({ name: 'Latte', unitPrice: 4.5, categoryId: 'c1', categoryName: 'Kaffee', description: 'Mit Hafermilch' }),
    product({ name: 'Cappuccino', unitPrice: 3.9, categoryId: 'c1', categoryName: 'Kaffee', imageUrl: 'https://cdn.example/cap.jpg' }),
    product({ name: 'Brownie', unitPrice: 2.5, categoryId: 'c2', categoryName: 'Kuchen' }),
    product({ name: 'Mocha', unitPrice: 5, categoryId: 'c1', categoryName: 'Kaffee', active: false })
  ];

  async function setup(layout: string | null, productList: Product[] = products, loadedMerchant: Merchant = merchant, language?: string) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', ['getMerchant', 'getBranch', 'getProducts', 'getMenuLanguages']);
    merchantApi.getMerchant.and.returnValue(of(loadedMerchant));
    merchantApi.getMenuLanguages.and.returnValue(of([
      { code: 'de', displayName: 'German', nativeName: 'Deutsch' },
      { code: 'en', displayName: 'English', nativeName: 'English' },
      { code: 'ar', displayName: 'Arabic', nativeName: 'العربية' }
    ]));
    merchantApi.getBranch.and.returnValue(of(branch));
    merchantApi.getProducts.and.returnValue(of(productList));
    queryParams = new BehaviorSubject(convertToParamMap({ ...(layout ? { layout } : {}), ...(language ? { language } : {}) }));

    await TestBed.configureTestingModule({
      imports: [PrintedCatalogComponent],
      providers: [
        provideRouter([]),
        { provide: MerchantApiService, useValue: merchantApi },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: convertToParamMap({ id: 'm-1', branchId: 'b-1' }) },
            queryParamMap: queryParams.asObservable()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PrintedCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? '';
  const query = (selector: string) => (fixture.nativeElement as HTMLElement).querySelectorAll(selector);

  it('loads only active branch products and renders the Full Catalog by default', async () => {
    await setup(null);
    expect(merchantApi.getProducts).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'b-1', false, undefined);
    expect(component.layout).toBe('full');
    expect(Array.from(query('.pc-section-title')).map((e) => e.textContent?.trim())).toEqual(['Kaffee', 'Kuchen']);
    expect(text()).toContain('Latte');
    expect(text()).toContain('Mit Hafermilch');
    expect(text()).not.toContain('Mocha');
  });

  it('formats prices as German EUR', async () => {
    await setup('full');
    expect(text().replace(/ /g, ' ')).toContain('4,50 €');
  });

  it('shows merchant identity, branch address and contact info', async () => {
    await setup('full');
    expect(text()).toContain('Café Blitz');
    expect(text()).toContain('Mitte');
    expect(text()).toContain('Torstraße 1');
    expect(text()).toContain('10119 Berlin');
    expect(text()).toContain('cafe-blitz.example');
    expect(text()).toContain('+49 30 123');
    expect(text()).toContain('@cafeblitz');
    expect((query('img.pc-logo')[0] as HTMLImageElement).src).toBe('https://cdn.example/logo.png');
  });

  it('builds the storefront Web Catalog URL for the QR', async () => {
    await setup('full');
    expect(component.webCatalogUrl).toMatch(/\/m\/m-1\/b\/b-1$/);
  });

  it('renders the Category Showcase with one representative per category', async () => {
    await setup('showcase');
    expect(component.layout).toBe('showcase');
    const entries = Array.from(query('.pc-showcase-entry')).map((e) => e.textContent ?? '');
    expect(entries.length).toBe(2);
    expect(entries[0]).toContain('Kaffee');
    expect(entries[0]).toContain('Cappuccino');
    expect(entries[1]).toContain('Brownie');
  });

  it('switches layout through the URL', async () => {
    await setup('full');
    const router = TestBed.inject(Router);
    spyOn(router, 'navigate');
    component.setLayout('showcase');
    expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { layout: 'showcase' } }));

    queryParams.next(convertToParamMap({ layout: 'showcase' }));
    fixture.detectChanges();
    expect(query('.pc-showcase-entry').length).toBe(2);
  });

  it('shows an empty state and disables printing when the branch has no active products', async () => {
    await setup('full', [product({ name: 'Mocha', active: false })]);
    expect(text()).toContain('keine aktiven Produkte');
    expect((query('button.pc-print')[0] as HTMLButtonElement).disabled).toBeTrue();
  });

  it('shows the API error message when loading fails', async () => {
    await setup('full');
    merchantApi.getProducts.and.returnValue(throwError(() => ({ error: { detail: 'Branch not found' } })));
    component.load();
    fixture.detectChanges();
    expect(text()).toContain('Branch not found');
  });

  describe('Catalog Language', () => {
    const international: Merchant = { ...merchant, originalMenuLanguage: 'de', supportedMenuLanguages: ['en', 'ar'] };
    const english: Product[] = [
      product({ name: 'Latte', categoryName: 'Coffee', language: 'en' }),
      product({ name: 'Brezel', categoryName: 'Coffee', language: 'de' }),
      product({ name: 'Water', language: 'en' })
    ];

    it('defaults to the Original Menu Language', async () => {
      await setup('full', products, international);
      expect(component.catalogLanguage).toBe('de');
      expect(merchantApi.getProducts).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'b-1', false, 'de');
      expect(text()).toContain('Scannen & bestellen');
    });

    it('renders the chosen language with its printed labels', async () => {
      await setup('full', english, international, 'en');
      expect(merchantApi.getProducts).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'b-1', false, 'en');
      expect(text()).toContain('Scan & order');
      expect(Array.from(query('.pc-section-title')).map((e) => e.textContent?.trim())).toEqual(['Coffee', 'Other']);
      expect(query('.pc-sheet[lang="en"]').length).toBeGreaterThan(0);
    });

    it('flags items that fell back to the original language on screen only', async () => {
      await setup('full', english, international, 'en');
      expect(component.fallbackCount).toBe(1);
      const flagged = Array.from(query('.pc-item.pc-fallback')).map((e) => e.textContent ?? '');
      expect(flagged.length).toBe(1);
      expect(flagged[0]).toContain('Brezel');
      expect(text()).toContain('1 item not translated');
    });

    it('offers the merchant languages in the picker', async () => {
      await setup('full', products, international);
      const options = Array.from(query('select.pc-language option')).map((o) => o.textContent?.trim());
      expect(options).toEqual(['German — Deutsch', 'English', 'Arabic — العربية']);
    });

    it('switches language through the URL', async () => {
      await setup('full', products, international);
      const router = TestBed.inject(Router);
      spyOn(router, 'navigate');
      component.setCatalogLanguage('en');
      expect(router.navigate).toHaveBeenCalledWith([], jasmine.objectContaining({ queryParams: { language: 'en' } }));
    });

    it('lays out right-to-left languages right-to-left', async () => {
      await setup('full', english, international, 'ar');
      expect((query('.pc-sheet')[0] as HTMLElement).getAttribute('dir')).toBe('rtl');
    });

    it('hides the picker when the merchant has a single language', async () => {
      await setup('full');
      expect(query('select.pc-language').length).toBe(0);
    });
  });

  it('waits for images before opening the browser print dialog', async () => {
    await setup('full');
    const printSpy = spyOn(window, 'print');
    await component.print();
    expect(printSpy).toHaveBeenCalled();
  });
});
