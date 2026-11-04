import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { BranchFloor, TableLive } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { LiveFloorComponent } from './live-floor.component';

describe('LiveFloorComponent', () => {
  const table = (id: string, name: string, seats: number | null, x = 0.5) =>
    ({ id, code: `CODE${id}`, name, active: true, link: '', seats, placement: { floorPlanId: 'plan-inside', x, y: 0.5 } });
  const free = (id: string, name: string, seats: number | null): TableLive =>
    ({ table: table(id, name, seats), status: 'FREE', occupiedSince: null, orders: [], guestCount: null });
  const floor: BranchFloor = {
    floorPlans: [{ id: 'plan-inside', name: 'Inside', imageUrl: null }],
    tables: [free('t1', '5', 4), free('t2', '6', null)],
    branchCapacity: 6
  };
  let events: Subject<TableLive>;
  let api: jasmine.SpyObj<MerchantApiService>;

  function create() {
    events = new Subject<TableLive>();
    api = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', ['getFloor', 'floorEvents']);
    api.getFloor.and.returnValue(of(structuredClone(floor)));
    api.floorEvents.and.returnValue(events);
    TestBed.configureTestingModule({ providers: [{ provide: MerchantApiService, useValue: api }] });
    const fixture = TestBed.createComponent(LiveFloorComponent);
    fixture.componentRef.setInput('merchantId', 'm-1');
    fixture.componentRef.setInput('branchId', 'b-1');
    fixture.detectChanges();
    return fixture;
  }

  it('always shows guests over seats on every pin', () => {
    const fixture = create();
    const pins = [...fixture.nativeElement.querySelectorAll('.floor-pin')].map((pin: HTMLElement) => pin.textContent?.trim());
    expect(pins).toEqual(['5 · –/4 seats', '6 · –/? seats']);
  });

  it('applies table events without reloading the floor', () => {
    const fixture = create();
    events.next({
      table: table('t1', '5', 4), status: 'OCCUPIED', occupiedSince: '2026-11-04T10:00:00Z', guestCount: 3,
      orders: [{ orderId: 'o-1', pickupNumber: 12, totalAmountMinor: 1250, currency: 'EUR', paymentStatus: 'CREATED', preparationStatus: 'PREPARING', createdAt: '2026-11-04T10:00:00Z' }]
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('5 · 3/4 seats');
    expect(text).toContain('1/2 tables occupied · 3 guests · 4/4 seats in occupied tables · Branch Capacity 6');
    expect(api.getFloor).toHaveBeenCalledTimes(1);

    fixture.nativeElement.querySelector('[data-test="live-pin-CODEt1"]').click();
    fixture.detectChanges();
    const detail = fixture.nativeElement.querySelector('[data-test="table-detail"]').textContent;
    expect(detail).toContain('Pickup 12');
    expect(detail).toContain('Unpaid');
    expect(detail).toContain('Preparing');
    expect(detail).not.toContain('o-1');
  });

  it('is read-only: no clear, guest or payment actions', () => {
    const fixture = create();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('View only');
    const buttons = [...fixture.nativeElement.querySelectorAll('button')].map((button: HTMLElement) => button.textContent ?? '');
    expect(buttons.some((label) => /clear|settle|pay|guests/i.test(label))).toBeFalse();
  });
});
