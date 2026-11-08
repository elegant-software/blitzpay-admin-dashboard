import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { MerchantDetailComponent } from './merchant-detail.component';

describe('Product language HTTP reload', () => {
  it('issues fresh requests even when two UI languages use the same original fallback', async () => {
    await TestBed.configureTestingModule({
      imports: [MerchantDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])]
    }).overrideComponent(MerchantDetailComponent, { set: { template: '' } }).compileComponents();
    const fixture = TestBed.createComponent(MerchantDetailComponent);
    const component = fixture.componentInstance;
    component.selectedMerchant = {
      merchantId: 'm1', merchantName: 'Cafe', merchantCode: 'M1', merchantStatus: 'ACTIVE',
      offerings: [], lastUpdatedAt: '', originalMenuLanguage: 'de', supportedMenuLanguages: ['ar']
    };
    component.selectedBranch = { merchantId: 'm1', branchId: 'b1', branchCode: 'B1', name: 'Central', status: 'ACTIVE' };
    component.catalogLanguage = 'de';
    fixture.detectChanges();
    const locale = TestBed.inject(AdminLocaleService);
    const http = TestBed.inject(HttpTestingController);
    http.expectOne(req => req.url.endsWith('/merchants/verticals')).flush([]);
    for (const [ui, expected] of [['ar', 'ar'], ['fr', 'de'], ['it', 'de']]) {
      locale.use(ui);
      fixture.detectChanges();
      const request = http.expectOne(req => req.url.endsWith('/merchants/m1/products'));
      expect(request.request.method).toBe('GET');
      expect(request.request.params.get('language')).toBe(expected);
      expect(request.request.params.get('branchId')).toBe('b1');
      request.flush([]);
    }
    http.verify();
    fixture.destroy();
  });
});
