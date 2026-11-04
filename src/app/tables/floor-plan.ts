import { BranchTable, TableLive, TableOrderSummary } from '../models/merchant-catalog.models';

export interface PictureBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * Table Placement for a point on the Floor Plan picture (e.g. where a Table was dropped): fractions 0..1 of the
 * picture's width and height, so the position is the same on every screen size. Points outside are pulled to the edge.
 */
export function placementFromPoint(clientX: number, clientY: number, picture: PictureBox): { x: number; y: number } {
  return {
    x: fraction(clientX - picture.left, picture.width),
    y: fraction(clientY - picture.top, picture.height)
  };
}

/** CSS position of a Table pin on the picture for a stored placement. */
export function pinPosition(placement: { x: number; y: number }): { left: string; top: string } {
  return { left: `${clamp(placement.x) * 100}%`, top: `${clamp(placement.y) * 100}%` };
}

/** Seats as always shown on a Table pin: "4 seats", "1 seat", or "? seats" when not set so the gap is visible. */
export function seatsLabel(seats: number | null | undefined): string {
  if (seats == null) return '? seats';
  return seats === 1 ? '1 seat' : `${seats} seats`;
}

/** Text on a Table pin: its name and seats, e.g. "5 · 4 seats". */
export function pinLabel(table: { name: string; seats?: number | null }): string {
  return `${table.name} · ${seatsLabel(table.seats)}`;
}

/**
 * Text on a live floor pin: name, Guest Count and seats, e.g. "5 · 3/4 seats"; "–" for no guests and "?" for unknown
 * seats, so seats are always visible ("5 · –/? seats").
 */
export function livePinLabel(live: { table: { name: string; seats?: number | null }; guestCount?: number | null }): string {
  const guests = live.guestCount ?? '–';
  const seats = live.table.seats ?? '?';
  return `${live.table.name} · ${guests}/${seats} ${live.table.seats === 1 ? 'seat' : 'seats'}`;
}

/** Sum of the seats of the active Tables (Tables without seats count as 0). */
export function seatedCapacity(tables: { active: boolean; seats?: number | null }[]): number {
  return tables.reduce((sum, table) => sum + (table.active ? table.seats ?? 0 : 0), 0);
}

/** True when the Tables seat more guests than the Branch Capacity. A warning only; it never blocks anything. */
export function exceedsCapacity(seated: number, branchCapacity: number | null | undefined): boolean {
  return branchCapacity != null && seated > branchCapacity;
}

/** Seats from a form field: a whole number 1–50, null when empty, undefined when invalid. */
export function parseSeats(value: string | number | null | undefined): number | null | undefined {
  if (value == null || String(value).trim() === '') return null;
  const seats = Number(value);
  return Number.isInteger(seats) && seats >= 1 && seats <= 50 ? seats : undefined;
}

/** Tables shown on this Floor Plan. */
export function tablesOnPlan(tables: BranchTable[], floorPlanId: string | null): BranchTable[] {
  return floorPlanId ? tables.filter((table) => table.placement?.floorPlanId === floorPlanId) : [];
}

/** Tables that can still be dragged onto this Floor Plan: unplaced ones first, then those on another plan. */
export function tablesOffPlan(tables: BranchTable[], floorPlanId: string | null): BranchTable[] {
  const off = tables.filter((table) => table.active && table.placement?.floorPlanId !== floorPlanId);
  return [...off.filter((table) => !table.placement), ...off.filter((table) => !!table.placement)];
}

/**
 * Names for "Add tables": one per line or comma. "1-10" adds 1 to 10; "Terrace 1-4" adds Terrace 1 to Terrace 4.
 * Empty entries and repeats (ignoring case) are dropped. Ranges over 100 Tables are kept as a literal name.
 */
export function parseTableNames(input: string): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  for (const entry of input.split(/[\n,]/)) {
    for (const name of expandRange(entry.trim())) {
      const key = name.toLocaleLowerCase();
      if (!name || seen.has(key)) continue;
      seen.add(key);
      names.push(name);
    }
  }
  return names;
}

const MAX_RANGE = 100;

function expandRange(entry: string): string[] {
  const range = /^(.*?)(\d+)\s*-\s*(\d+)$/.exec(entry);
  if (!range) return [entry];
  const [, prefix, from, to] = range;
  const start = Number(from);
  const end = Number(to);
  if (end < start || end - start + 1 > MAX_RANGE) return [entry];
  return Array.from({ length: end - start + 1 }, (_, index) => `${prefix}${start + index}`);
}

/** Colour of a Table pin on the live floor. */
export type TableTone = 'free' | 'paid' | 'unpaid' | 'reserved';

const SETTLED_PAYMENT = new Set(['PAID', 'CANCELLED']);

/** True for an order that still has to be paid. */
export function isUnpaid(order: TableOrderSummary): boolean {
  return !SETTLED_PAYMENT.has(order.paymentStatus);
}

/** Occupied takes precedence over Reserved; an Occupied Table with any order still to pay shows as unpaid. */
export function tableTone(live: TableLive): TableTone {
  if (live.status === 'OCCUPIED') return live.orders.some(isUnpaid) ? 'unpaid' : 'paid';
  if (live.status === 'RESERVED') return 'reserved';
  return 'free';
}

const PAYMENT_LABELS: Record<string, string> = {
  CREATED: 'Unpaid',
  PAYMENT_INITIATED: 'Payment started',
  PAID: 'Paid',
  FAILED: 'Payment failed',
  CANCELLED: 'Cancelled'
};

const PREPARATION_LABELS: Record<string, string> = {
  RECEIVED: 'Received',
  PREPARING: 'Preparing',
  READY: 'Ready'
};

export function paymentLabel(status: string): string {
  return PAYMENT_LABELS[status] ?? humanize(status);
}

export function preparationLabel(status: string | null): string {
  return status ? PREPARATION_LABELS[status] ?? humanize(status) : '—';
}

function humanize(value: string): string {
  const text = value.replace(/_/g, ' ').toLowerCase();
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function fraction(offset: number, size: number): number {
  if (!(size > 0)) return 0;
  return Math.round(clamp(offset / size) * 10000) / 10000;
}

function clamp(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}
