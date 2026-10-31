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

  async function setup(layout: string | null, productList: Product[] = products) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', ['getMerchant', 'getBranch', 'getProducts']);
    merchantApi.getMerchant.and.returnValue(of(merchant));
    merchantApi.getBranch.and.returnValue(of(branch));
    merchantApi.getProducts.and.returnValue(of(productList));
    queryParams = new BehaviorSubject(convertToParamMap(layout ? { layout } : {}));

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
    expect(merchantApi.getProducts).toHaveBeenCalledWith(jasmine.anything(), 'v1', 'm-1', 'b-1', false);
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

  it('waits for images before opening the browser print dialog', async () => {
    await setup('full');
    const printSpy = spyOn(window, 'print');
    await component.print();
    expect(printSpy).toHaveBeenCalled();
  });
});
