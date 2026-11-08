import { Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AdminLocaleService } from './admin-locale.service';
import { PlatformKpiDashboardComponent } from '../platform-kpi-dashboard/platform-kpi-dashboard.component';
import { MerchantCatalogComponent } from '../merchant-catalog/merchant-catalog.component';
import { MerchantDetailComponent } from '../merchant-catalog/merchant-detail.component';
import { MerchantEditComponent } from '../merchant-catalog/merchant-edit.component';
import { BranchEditComponent } from '../merchant-catalog/branch-edit.component';
import { ProductEditComponent } from '../merchant-catalog/product-edit.component';
import { BranchKitchenRoutingComponent } from '../merchant-catalog/branch-kitchen-routing.component';
import { BranchKitchenScreenComponent } from '../merchant-catalog/branch-kitchen-screen.component';
import { BranchPreparationComponent } from '../merchant-catalog/branch-preparation.component';
import { CategoryTranslationsDialogComponent } from '../merchant-catalog/category-translations-dialog.component';
import { OrderManagementComponent } from '../orders/order-management.component';
import { AppointmentManagementComponent } from '../appointments/appointment-management.component';
import { AppointmentPolicyComponent } from '../appointments/appointment-policy.component';
import { AppointmentsShellComponent } from '../appointments/appointments-shell.component';
import { BranchCalendarComponent } from '../appointments/branch-calendar.component';
import { SettlementReportingComponent } from '../settlements/settlement-reporting.component';
import { UserManagementComponent } from '../user-management/user-management.component';
import { UserDetailComponent } from '../user-management/user-detail.component';
import { BranchTablesComponent } from '../tables/branch-tables.component';
import { FloorPlanEditorComponent } from '../tables/floor-plan-editor.component';
import { LiveFloorComponent } from '../tables/live-floor.component';
import { TableQrCardComponent } from '../tables/table-qr-card.component';
import { MerchantSearchComponent } from '../shared/merchant-search.component';
import { PrintedCatalogComponent } from '../printed-catalog/printed-catalog.component';
import { StripeConnectReturnComponent } from '../stripe-connect/stripe-connect-return.component';
import { BranchCatalogQrComponent } from '../merchant-catalog/branch-catalog-qr.component';

interface PageCase { component: Type<unknown>; expected: string; inputs?: Record<string, unknown>; }
const pages: PageCase[] = [
  { component: PlatformKpiDashboardComponent, expected: 'لوحة تحكم المنصة' },
  { component: MerchantCatalogComponent, expected: 'البحث عن تاجر' },
  { component: MerchantDetailComponent, expected: 'التجار' },
  { component: MerchantEditComponent, expected: 'التجار' },
  { component: BranchEditComponent, expected: 'العودة إلى التاجر' },
  { component: ProductEditComponent, expected: 'العودة إلى التاجر' },
  { component: BranchKitchenRoutingComponent, expected: 'المطبخ' },
  { component: BranchKitchenScreenComponent, expected: 'شاشة المطبخ' },
  { component: BranchPreparationComponent, expected: 'إدارة المحطات' },
  { component: CategoryTranslationsDialogComponent, expected: 'الترجمات', inputs: { category: { id: 'c1', name: 'Custom product category' } } },
  { component: OrderManagementComponent, expected: 'الطلبات' },
  { component: AppointmentManagementComponent, expected: 'المواعيد' },
  { component: AppointmentPolicyComponent, expected: 'سياسة المواعيد' },
  { component: AppointmentsShellComponent, expected: 'مواعيد التاجر' },
  { component: BranchCalendarComponent, expected: 'تقويم الفرع' },
  { component: SettlementReportingComponent, expected: 'تقرير التسويات' },
  { component: UserManagementComponent, expected: 'إدارة المستخدمين' },
  { component: UserDetailComponent, expected: 'الوصول إلى التاجر', inputs: { user: { id: 'u1', displayName: 'Custom user', enabled: true } } },
  { component: BranchTablesComponent, expected: 'الطاولات' },
  { component: FloorPlanEditorComponent, expected: 'الطاولات', inputs: { floorPlan: { id: 'p1', name: 'Custom room', areas: [] } } },
  { component: LiveFloorComponent, expected: 'للعرض فقط' },
  { component: TableQrCardComponent, expected: 'رمز الطاولة', inputs: { title: 'Custom table', code: 'ABC123' } },
  { component: MerchantSearchComponent, expected: 'بحث' },
  { component: PrintedCatalogComponent, expected: 'طباعة' },
  { component: StripeConnectReturnComponent, expected: 'التاجر' },
];

describe('Admin page localization', () => {
  it('translates QR image alternative text without changing the catalog link', async () => {
    await TestBed.configureTestingModule({ imports: [BranchCatalogQrComponent] }).compileComponents();
    const fixture = TestBed.createComponent(BranchCatalogQrComponent);
    fixture.componentInstance.url = 'https://catalog.example/branch/abc';
    fixture.componentInstance.imageUrl = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"/>';
    TestBed.inject(AdminLocaleService).use('ar'); fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('img')?.alt).toBe('رمز QR لكتالوج الفرع');
    expect(host.querySelector('p')?.textContent).toBe('https://catalog.example/branch/abc');
    fixture.destroy();
  });
  for (const page of pages) {
    it(`renders Arabic UI in ${page.component.name}`, async () => {
      const params = convertToParamMap({});
      await TestBed.configureTestingModule({
        imports: [page.component],
        providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]),
          { provide: ActivatedRoute, useValue: {
            snapshot: { paramMap: params, queryParamMap: params, params: {}, queryParams: {} },
            paramMap: of(params), queryParamMap: of(params), params: of({}), queryParams: of({}),
          } }
        ]
      }).compileComponents();
      TestBed.inject(AdminLocaleService).use('ar');
      const fixture = TestBed.createComponent(page.component);
      for (const [name, value] of Object.entries(page.inputs ?? {})) fixture.componentRef.setInput(name, value);
      fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain(page.expected);
      // Switching on an already rendered page must update text without a route reload.
      TestBed.inject(AdminLocaleService).use('de'); fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toMatch(/[\u0600-\u06ff]/);
      TestBed.inject(AdminLocaleService).use('en'); fixture.detectChanges();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toMatch(/[\u0600-\u06ff]/);
      fixture.destroy();
    });
  }
});
