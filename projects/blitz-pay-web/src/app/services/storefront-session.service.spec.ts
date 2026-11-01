import { TestBed } from '@angular/core/testing';
import { StorefrontProduct } from '../models/storefront.models';
import { StorefrontSessionService } from './storefront-session.service';

describe('StorefrontSessionService', () => {
  const coffee: StorefrontProduct = {
    productId: 'p1',
    branchId: 'branch-12',
    name: 'Coffee',
    unitPrice: 3.5,
    active: true
  };

  beforeEach(() => {
    sessionStorage.clear();
    localStorage.clear();
    TestBed.configureTestingModule({});
  });

  it('recovers only the matching payment return after tab storage is lost', () => {
    const service = TestBed.inject(StorefrontSessionService);
    service.useScope('merchant-44', 'branch-12');
    service.add(coffee);
    service.savePaymentReturn('order-1');
    sessionStorage.clear();
    const restored = new StorefrontSessionService();
    restored.restorePaymentReturn('order-other');
    expect(restored.itemCount).toBe(0);
    restored.restorePaymentReturn('order-1');
    expect(restored.itemCount).toBe(1);
    expect(restored.scope?.branchId).toBe('branch-12');
  });

  it('ignores expired payment recovery and survives unavailable storage', () => {
    const service = TestBed.inject(StorefrontSessionService);
    service.useScope('merchant-44', 'branch-12');
    service.add(coffee);
    service.savePaymentReturn('order-1');
    sessionStorage.clear();
    const clock = jasmine.clock();
    clock.install();
    try {
      clock.mockDate(new Date(Date.now() + 3 * 60 * 60 * 1000));
      const restored = new StorefrontSessionService();
      restored.restorePaymentReturn('order-1');
      expect(restored.itemCount).toBe(0);
    } finally { clock.uninstall(); }
    spyOn(Storage.prototype, 'setItem').and.throwError('Storage unavailable');
    expect(() => service.add(coffee)).not.toThrow();
  });

  it('persists a branch-scoped web cart through a service reload', () => {
    const service = TestBed.inject(StorefrontSessionService);
    service.useScope('merchant-44', 'branch-12');
    service.add(coffee);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({});
    const restored = TestBed.inject(StorefrontSessionService);

    expect(restored.lines).toEqual([{ product: coffee, quantity: 1 }]);
    expect(restored.scope).toEqual({ merchantId: 'merchant-44', branchId: 'branch-12' });
  });

  it('requires confirmation before replacing a cart from another branch', () => {
    const service = TestBed.inject(StorefrontSessionService);
    service.useScope('merchant-44', 'branch-12');
    service.add(coffee);

    const switched = service.useScope('merchant-44', 'branch-99', () => false);

    expect(switched).toBeFalse();
    expect(service.scope?.branchId).toBe('branch-12');
    expect(service.lines.length).toBe(1);
  });
});
