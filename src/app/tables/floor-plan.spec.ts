import { BranchTable, TableLive, TableOrderSummary } from '../models/merchant-catalog.models';
import {
  exceedsCapacity,
  parseSeats,
  parseTableNames,
  areaBetween,
  livePinLabel,
  seatedFor,
  tableChairs,
  pinLabel,
  seatedCapacity,
  pinPosition,
  placementFromPoint,
  tableTone,
  tablesOffPlan,
  tablesOnPlan
} from './floor-plan';

describe('Floor Plan placement maths', () => {
  const picture = { left: 100, top: 50, width: 400, height: 200 };

  it('turns a drop point into fractions of the picture', () => {
    expect(placementFromPoint(300, 150, picture)).toEqual({ x: 0.5, y: 0.5 });
    expect(placementFromPoint(100, 50, picture)).toEqual({ x: 0, y: 0 });
    expect(placementFromPoint(500, 250, picture)).toEqual({ x: 1, y: 1 });
    expect(placementFromPoint(200, 100, picture)).toEqual({ x: 0.25, y: 0.25 });
  });

  it('pulls a point outside the picture to its edge', () => {
    expect(placementFromPoint(40, 400, picture)).toEqual({ x: 0, y: 1 });
    expect(placementFromPoint(900, -10, picture)).toEqual({ x: 1, y: 0 });
  });

  it('rounds to four decimals so stored positions stay tidy', () => {
    expect(placementFromPoint(100 + 400 / 3, 50 + 200 / 3, picture)).toEqual({ x: 0.3333, y: 0.3333 });
  });

  it('is independent of the size the picture is shown at', () => {
    const small = { left: 0, top: 0, width: 200, height: 100 };
    const large = { left: 0, top: 0, width: 1600, height: 800 };
    expect(placementFromPoint(50, 75, small)).toEqual(placementFromPoint(400, 600, large));
  });

  it('does not divide by zero before the picture has a size', () => {
    expect(placementFromPoint(10, 10, { left: 0, top: 0, width: 0, height: 0 })).toEqual({ x: 0, y: 0 });
  });

  it('positions a pin back on the picture in percent', () => {
    expect(pinPosition({ x: 0.25, y: 0.75 })).toEqual({ left: '25%', top: '75%' });
    expect(pinPosition({ x: 1.4, y: -0.2 })).toEqual({ left: '100%', top: '0%' });
  });

  it('round-trips a drop point through the stored placement', () => {
    const placement = placementFromPoint(300, 100, picture);
    expect(pinPosition(placement)).toEqual({ left: '50%', top: '25%' });
  });
});

describe('Tables on and off a Floor Plan', () => {
  const table = (name: string, placement: BranchTable['placement'], active = true): BranchTable =>
    ({ id: name, code: 'AB3K7Q', name, active, link: '', placement });
  const tables = [
    table('1', { floorPlanId: 'inside', x: 0.1, y: 0.1 }),
    table('2', { floorPlanId: 'terrace', x: 0.5, y: 0.5 }),
    table('3', null),
    table('4', null, false)
  ];

  it('shows only the Tables placed on this plan', () => {
    expect(tablesOnPlan(tables, 'inside').map((t) => t.name)).toEqual(['1']);
    expect(tablesOnPlan(tables, null)).toEqual([]);
  });

  it('lists unplaced active Tables first, then those on other plans', () => {
    expect(tablesOffPlan(tables, 'inside').map((t) => t.name)).toEqual(['3', '2']);
  });
});

describe('parseTableNames', () => {
  it('reads one name per line or comma, trimmed', () => {
    expect(parseTableNames(' Bar \nWindow, Corner\n\n')).toEqual(['Bar', 'Window', 'Corner']);
  });

  it('expands number ranges, with or without a prefix', () => {
    expect(parseTableNames('1-3')).toEqual(['1', '2', '3']);
    expect(parseTableNames('Terrace 1-2')).toEqual(['Terrace 1', 'Terrace 2']);
  });

  it('drops repeats ignoring case', () => {
    expect(parseTableNames('1-3\n2\nbar\nBar')).toEqual(['1', '2', '3', 'bar']);
  });

  it('keeps a backwards or huge range as a literal name', () => {
    expect(parseTableNames('5-1')).toEqual(['5-1']);
    expect(parseTableNames('1-500')).toEqual(['1-500']);
  });
});

describe('tableTone', () => {
  const order = (paymentStatus: string): TableOrderSummary => ({
    orderId: 'o', pickupNumber: 1, totalAmountMinor: 500, currency: 'EUR', paymentStatus, preparationStatus: 'RECEIVED', createdAt: ''
  });
  const live = (status: TableLive['status'], orders: TableOrderSummary[] = []): TableLive =>
    ({ table: { id: 't', code: 'AB3K7Q', name: '5', active: true, link: '', placement: null }, status, occupiedSince: null, orders });

  it('is free for a free Table', () => expect(tableTone(live('FREE'))).toBe('free'));
  it('is unpaid while any order is still to pay', () => expect(tableTone(live('OCCUPIED', [order('PAID'), order('CREATED')]))).toBe('unpaid'));
  it('is paid when every order is paid', () => expect(tableTone(live('OCCUPIED', [order('PAID')]))).toBe('paid'));
  it('is reserved for a reserved Table', () => expect(tableTone(live('RESERVED'))).toBe('reserved'));
});

describe('Seats and capacity', () => {
  it('always shows seats on a pin, and "? seats" when unknown', () => {
    expect(pinLabel({ name: '5', seats: 4 })).toBe('5 · 4 seats');
    expect(pinLabel({ name: 'Bar', seats: 1 })).toBe('Bar · 1 seat');
    expect(pinLabel({ name: '7', seats: null })).toBe('7 · ? seats');
    expect(pinLabel({ name: '8' })).toBe('8 · ? seats');
  });

  it('shows guests over seats on a live pin', () => {
    const table = (seats: number | null) => ({ name: '5', seats });
    expect(livePinLabel({ table: table(4), guestCount: 3 })).toBe('5 · 3/4 seats');
    expect(livePinLabel({ table: table(4), guestCount: null })).toBe('5 · –/4 seats');
    expect(livePinLabel({ table: table(null), guestCount: 2 })).toBe('5 · 2/? seats');
  });

  it('adds up the seats of active Tables only', () => {
    expect(seatedCapacity([{ active: true, seats: 4 }, { active: true, seats: null }, { active: false, seats: 6 }, { active: true, seats: 2 }])).toBe(6);
  });

  it('warns only when seats exceed a set Branch Capacity', () => {
    expect(exceedsCapacity(41, 40)).toBeTrue();
    expect(exceedsCapacity(40, 40)).toBeFalse();
    expect(exceedsCapacity(100, null)).toBeFalse();
  });

  it('reads seats from a form field', () => {
    expect(parseSeats('4')).toBe(4);
    expect(parseSeats(' ')).toBeNull();
    expect(parseSeats(null)).toBeNull();
    expect(parseSeats('0')).toBeUndefined();
    expect(parseSeats('51')).toBeUndefined();
    expect(parseSeats('2.5')).toBeUndefined();
  });
});

describe('Drawn live floor', () => {
  it('puts one chair per seat round the table, seated guests first', () => {
    const chairs = tableChairs(4, 3);
    expect(chairs.map((chair) => [chair.cx, chair.cy])).toEqual([[30, 6], [54, 30], [30, 54], [6, 30]]);
    expect(chairs.map((chair) => chair.seated)).toEqual([true, true, true, false]);
    expect(tableChairs(null, 2)).toEqual([]);
    expect(tableChairs(40, 0).length).toBe(12);
  });

  it('says how long guests have been seated', () => {
    const now = new Date('2026-11-08T12:00:00Z');
    expect(seatedFor('2026-11-08T11:52:00Z', now)).toBe('8 min');
    expect(seatedFor('2026-11-08T10:50:00Z', now)).toBe('1 h 10');
    expect(seatedFor(null, now)).toBe('');
  });

  it('builds an area from two corners dragged either way', () => {
    expect(areaBetween({ x: 0.5, y: 0.6 }, { x: 0.2, y: 0.1 })).toEqual({ x: 0.2, y: 0.1, width: 0.3, height: 0.5 });
  });
});
