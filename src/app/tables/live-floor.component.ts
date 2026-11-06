import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription, defer, repeat, retry, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { BranchFloor, TableLive, TableOrderSummary } from '../models/merchant-catalog.models';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { TableQrCardComponent } from './table-qr-card.component';
import { TableTone, exceedsCapacity, isUnpaid, paymentLabel, preparationLabel, tableTone } from './floor-plan';

/** Wait before reconnecting after the stream drops; the floor is reloaded on every reconnect. */
const RECONNECT_MS = 3000;

/**
 * Live floor of a Branch for a Platform Admin: every Table's status, Guest Count and open orders. Loads `/floor` once,
 * then applies `table` events from `/floor/events`; a dropped stream reconnects and reloads `/floor`.
 * Read-only by design: clearing Tables, setting guests and taking or confirming payments happen in the merchant app.
 */
@Component({
  selector: 'app-live-floor',
  standalone: true,
  imports: [CommonModule, FormsModule, DisplayDatePipe, TableQrCardComponent],
  templateUrl: './live-floor.component.html',
  styleUrls: ['../merchant-catalog/merchant-catalog.component.css', './branch-tables.component.css', './live-floor.component.css']
})
export class LiveFloorComponent implements OnChanges, OnDestroy {
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';

  readonly apiVersion = 'v1';
  readonly paymentLabel = paymentLabel;
  readonly preparationLabel = preparationLabel;
  readonly isUnpaid = isUnpaid;

  floor: BranchFloor | null = null;
  floorPlanId: string | null = null;
  query = '';
  statusFilter: 'all' | 'free' | 'occupied' | 'unpaid' | 'reserved' = 'all';
  selectedTableId: string | null = null;
  loading = false;
  error = '';
  lastUpdated: Date | null = null;

  private live?: Subscription;
  @ViewChild('detailDialog') private detailDialog?: ElementRef<HTMLDialogElement>;

  constructor(private readonly merchantApi: MerchantApiService) {}

  ngOnChanges(): void {
    this.live?.unsubscribe();
    this.closeDetails();
    this.floor = null;
    this.selectedTableId = null;
    if (!this.merchantId || !this.branchId) return;
    this.loading = true;
    const env = getEnvironmentByKey(environment.defaultEnvironmentKey);
    this.live = defer(() => this.merchantApi.getFloor(env, this.apiVersion, this.merchantId, this.branchId)).pipe(
      tap((floor) => this.applyFloor(floor)),
      switchMap(() => this.merchantApi.floorEvents(env, this.apiVersion, this.merchantId, this.branchId)),
      tap((live) => this.applyTable(live)),
      retry({ delay: (error: unknown) => {
        this.loading = false;
        this.error = this.toMessage(error);
        return new Promise((resolve) => setTimeout(resolve, RECONNECT_MS));
      } }),
      repeat({ delay: RECONNECT_MS })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.live?.unsubscribe();
  }

  private applyFloor(floor: BranchFloor): void {
    this.loading = false;
    this.error = '';
    this.floor = floor;
    this.lastUpdated = new Date();
    if (this.floorPlanId !== 'unassigned' && !floor.floorPlans.some(plan => plan.id === this.floorPlanId)) this.floorPlanId = null;
    if (this.selectedTableId && !floor.tables.some(live => live.table.id === this.selectedTableId)) this.closeDetails();
  }

  /** One Table changed: replace it, add it, or drop it when it was deactivated. */
  applyTable(live: TableLive): void {
    if (!this.floor) return;
    const others = this.floor.tables.filter((candidate) => candidate.table.id !== live.table.id);
    const index = this.floor.tables.findIndex((candidate) => candidate.table.id === live.table.id);
    let tables = others;
    if (live.table.active) {
      tables = [...others];
      tables.splice(index === -1 ? tables.length : index, 0, live);
    }
    this.floor = { ...this.floor, tables };
    if (!live.table.active && live.table.id === this.selectedTableId) this.closeDetails();
    this.lastUpdated = new Date();
  }

  get groups(): { id: string; name: string; tables: TableLive[] }[] {
    const query = this.query.trim().toLocaleLowerCase();
    const plans = this.floor?.floorPlans ?? [];
    const groups = [...plans.map(plan => ({ id: plan.id, name: plan.name })), { id: 'unassigned', name: 'Unassigned' }];
    return groups.filter(group => !this.floorPlanId || group.id === this.floorPlanId).map(group => ({
      ...group,
      tables: (this.floor?.tables ?? []).filter(live => {
        const area = plans.some(plan => plan.id === live.table.placement?.floorPlanId) ? live.table.placement!.floorPlanId : 'unassigned';
        return area === group.id &&
          (!query || `${live.table.name} ${live.table.code} ${group.name}`.toLocaleLowerCase().includes(query)) &&
          (this.statusFilter === 'all' || (this.statusFilter === 'occupied' ? live.status === 'OCCUPIED' : this.tone(live) === this.statusFilter));
      }).sort((a, b) => a.table.name.localeCompare(b.table.name, undefined, { numeric: true, sensitivity: 'base' }))
    })).filter(group => group.tables.length > 0);
  }

  get availableCount(): number { return this.floor?.tables.filter(live => live.status === 'FREE').length ?? 0; }
  get occupiedCount(): number { return this.floor?.tables.filter(live => live.status === 'OCCUPIED').length ?? 0; }
  get unpaidCount(): number { return this.floor?.tables.filter(live => this.tone(live) === 'unpaid').length ?? 0; }
  get guestCount(): number { return this.floor?.tables.reduce((sum, live) => sum + (live.status === 'OCCUPIED' ? live.guestCount ?? 0 : 0), 0) ?? 0; }

  clearFilters(): void { this.query = ''; this.floorPlanId = null; this.statusFilter = 'all'; }

  trackGroup(_index: number, group: { id: string }): string { return group.id; }
  trackTable(_index: number, live: TableLive): string { return live.table.id; }

  /** Draw individual chairs only for small tables; capacity remains explicit for larger ones. */
  chairs(live: TableLive): { x: number; y: number; rotation: number; occupied: boolean }[] {
    const seats = live.table.seats;
    if (seats == null || seats < 1 || seats > 8) return [];
    return Array.from({ length: seats }, (_, index) => {
      const angle = (index * 360 / seats) - 90;
      return {
        x: 50 + 42 * Math.cos(angle * Math.PI / 180),
        y: 50 + 40 * Math.sin(angle * Math.PI / 180),
        rotation: angle + 90,
        occupied: live.status === 'OCCUPIED' && index < (live.guestCount ?? 0)
      };
    });
  }

  seatingLabel(live: TableLive): string {
    const seats = live.table.seats == null ? 'Seats not set' : `${live.table.seats} ${live.table.seats === 1 ? 'seat' : 'seats'}`;
    if (live.status !== 'OCCUPIED') return seats;
    const guests = live.guestCount == null ? 'Guest count not set' : `${live.guestCount} ${live.guestCount === 1 ? 'guest' : 'guests'}`;
    return `${guests} · ${seats.toLowerCase()}`;
  }

  statusLabel(live: TableLive): string {
    if (live.status === 'FREE') return 'Available';
    if (live.status === 'RESERVED') return 'Reserved';
    if (this.tone(live) === 'unpaid') return 'To pay';
    return live.orders.length ? 'Occupied · Paid' : 'Occupied';
  }

  unpaidAmounts(live: TableLive): string[] {
    const totals = new Map<string, number>();
    live.orders.filter(isUnpaid).forEach(order => {
      const currency = order.currency || 'EUR';
      totals.set(currency, (totals.get(currency) ?? 0) + order.totalAmountMinor);
    });
    return [...totals].map(([currency, total]) => this.formatAmount(total, currency));
  }

  get selected(): TableLive | null {
    return this.floor?.tables.find((live) => live.table.id === this.selectedTableId) ?? null;
  }

  /**
   * "x/y tables occupied · n guests · a/b seats in occupied tables · Branch Capacity c". Counted from the Tables, so it
   * stays right as `table` events arrive (the server's totals are only as fresh as the last `/floor` load).
   */
  get summary(): string {
    const floor = this.floor;
    if (!floor) return '';
    const occupied = floor.tables.filter((live) => live.status === 'OCCUPIED');
    const seats = (lives: TableLive[]) => lives.reduce((sum, live) => sum + (live.table.seats ?? 0), 0);
    const guests = occupied.reduce((sum, live) => sum + (live.guestCount ?? 0), 0);
    const capacity = floor.branchCapacity != null ? floor.branchCapacity : 'not set';
    return `${occupied.length}/${floor.tables.length} tables occupied · ${guests} ${guests === 1 ? 'guest' : 'guests'}`
      + ` · ${seats(occupied)}/${seats(floor.tables)} seats in occupied tables · Branch Capacity ${capacity}`;
  }

  get overCapacity(): boolean {
    if (!this.floor) return false;
    const seated = this.floor.tables.reduce((sum, live) => sum + (live.table.seats ?? 0), 0);
    return exceedsCapacity(seated, this.floor.branchCapacity);
  }

  tone(live: TableLive): TableTone { return tableTone(live); }

  select(live: TableLive): void {
    this.selectedTableId = live.table.id;
    this.detailDialog?.nativeElement.showModal();
  }

  closeDetails(): void {
    this.detailDialog?.nativeElement.close();
    this.selectedTableId = null;
  }

  amount(order: TableOrderSummary): string {
    return this.formatAmount(order.totalAmountMinor, order.currency || 'EUR');
  }

  private formatAmount(totalMinor: number, currency: string): string {
    try {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency }).format(totalMinor / 100);
    } catch {
      return `${(totalMinor / 100).toFixed(2)} ${currency}`;
    }
  }

  private toMessage(error: unknown): string {
    const httpError = error as HttpErrorResponse;
    if (httpError?.status === 0) return 'Could not reach the server. Retrying…';
    if (httpError?.status === 404) return 'Branch not found.';
    const body = httpError?.error as { detail?: string; message?: string } | null | undefined;
    return body?.detail || body?.message || 'Failed to load the live floor. Retrying…';
  }
}
