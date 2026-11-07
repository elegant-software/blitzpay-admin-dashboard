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

  it('shows table icons with capacity and unknown seats without a floor-plan image', () => {
    const fixture = create();
    const cards = fixture.nativeElement.querySelectorAll('.live-table-card');
    expect(cards.length).toBe(2);
    expect(cards[0].textContent).toContain('4 seats');
    expect(cards[0].querySelectorAll('.live-chair').length).toBe(4);
    expect(cards[1].textContent).toContain('Seats not set');
    expect(fixture.nativeElement.querySelector('[data-test="live-floor-canvas"]')).toBeNull();
  });

  it('applies table events without reloading the floor', () => {
    const fixture = create();
    events.next({
      table: table('t1', '5', 4), status: 'OCCUPIED', occupiedSince: '2026-11-04T10:00:00Z', guestCount: 3,
      orders: [{ orderId: 'o-1', pickupNumber: 12, totalAmountMinor: 1250, currency: 'EUR', paymentStatus: 'CREATED', preparationStatus: 'PREPARING', createdAt: '2026-11-04T10:00:00Z' }]
    });
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('3 guests · 4 seats');
    expect(text).toContain('1/2 tables occupied · 3 guests · 4/4 seats in occupied tables · Branch Capacity 6');
    expect(api.getFloor).toHaveBeenCalledTimes(1);

    const card = fixture.nativeElement.querySelector('[data-test="live-card-CODEt1"]');
    expect(card.querySelectorAll('.live-chair.occupied').length).toBe(3);
    expect(card.textContent).toContain('12,50');
    card.click();
    fixture.detectChanges();
    const detail = fixture.nativeElement.querySelector('[data-test="table-detail"]').textContent;
    expect(detail).toContain('Pickup 12');
    expect(detail).toContain('Unpaid');
    expect(detail).toContain('Preparing');
    expect(detail).not.toContain('o-1');
  });

  it('shows the Table QR code and whether an NFC tag was written', () => {
    const fixture = create();
    fixture.nativeElement.querySelector('[data-test="live-card-CODEt1"]').click();
    fixture.detectChanges();
    const detail = fixture.nativeElement.querySelector('[data-test="table-detail"]');
    expect(detail.querySelector('app-table-qr-card')).not.toBeNull();
    expect(detail.textContent).toContain('Table code CODEt1');
    expect(detail.querySelector('[data-test="nfc-status"]').textContent).toContain('No NFC tag written yet');

    events.next({ ...free('t1', '5', 4), table: { ...table('t1', '5', 4), nfcTagWrittenAt: '2026-11-05T09:30:00Z' } });
    fixture.detectChanges();
    expect(detail.querySelector('[data-test="nfc-status"]').textContent).toContain('NFC tag written');
    expect(detail.querySelector('[data-test="nfc-status"]').textContent).not.toContain('yet');
  });

  it('is read-only: no clear, guest or payment actions', () => {
    const fixture = create();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('View only');
    expect(fixture.nativeElement.querySelector('[data-test="read-only-note"]')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('form')).toBeNull();
  });

  it('includes unassigned tables in the grid and combines search, area and live status filters', () => {
    const fixture = create();
    const unassigned = { ...free('t3', 'Terrace 10', 4), table: { ...table('t3', 'Terrace 10', 4), placement: null } };
    events.next(unassigned);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.live-table-card').length).toBe(3);
    const component = fixture.componentInstance;
    component.floorPlanId = 'unassigned';
    component.query = ' terrace ';
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.live-table-card').length).toBe(1);
    component.statusFilter = 'occupied';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No matching tables');
    events.next({ ...unassigned, status: 'OCCUPIED', guestCount: 2 });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.live-table-card').length).toBe(1);
    expect(api.getFloor).toHaveBeenCalledTimes(1);
  });

  it('uses compact capacity icons for large tables and closes details when a table is deactivated', () => {
    const fixture = create();
    events.next(free('t3', 'Banquet', 20));
    fixture.detectChanges();
    const card = fixture.nativeElement.querySelector('[data-test="live-card-CODEt3"]');
    expect(card.textContent).toContain('20 seats');
    expect(card.querySelectorAll('.live-chair').length).toBe(0);
    card.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dialog').open).toBeTrue();
    events.next({ ...free('t3', 'Banquet', 20), table: { ...table('t3', 'Banquet', 20), active: false } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('dialog').open).toBeFalse();
    expect(fixture.nativeElement.querySelector('[data-test="live-card-CODEt3"]')).toBeNull();
  });

  it('preserves the focused card as live updates arrive and keeps unpaid currencies separate', () => {
    const fixture = create();
    const card = fixture.nativeElement.querySelector('[data-test="live-card-CODEt1"]') as HTMLButtonElement;
    card.focus();
    const order = { orderId: 'o1', pickupNumber: 1, totalAmountMinor: 1000, currency: 'EUR', paymentStatus: 'CREATED', preparationStatus: 'PREPARING', createdAt: '2026-11-06T10:00:00Z' };
    events.next({ ...free('t1', '5', 4), status: 'OCCUPIED', guestCount: 2,
      orders: [order, { ...order, orderId: 'o2', currency: 'USD', totalAmountMinor: 500 }, { ...order, orderId: 'o3', paymentStatus: 'CANCELLED', totalAmountMinor: 9000 }] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-test="live-card-CODEt1"]')).toBe(card);
    expect(document.activeElement).toBe(card);
    const unpaid = card.querySelectorAll('.live-card-footer strong');
    expect(unpaid.length).toBe(2);
    expect(unpaid[0].textContent).toContain('10,00');
    expect(unpaid[1].textContent).toContain('5,00');
  });
});
