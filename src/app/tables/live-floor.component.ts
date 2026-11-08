import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnChanges, OnDestroy, inject } from '@angular/core';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { FormsModule } from '@angular/forms';
import { Subscription, defer, repeat, retry, switchMap, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { BranchFloor, FloorPlan, TableLive, TableOrderSummary } from '../models/merchant-catalog.models';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { TableQrCardComponent } from './table-qr-card.component';
import {
  TableTone, areaStyle, exceedsCapacity, isUnpaid, livePinLabel, paymentLabel, pinPosition, preparationLabel, seatedFor, tableChairs, tableTone
} from './floor-plan';
import { apiErrorMessage } from '../notifications/notification.service';

/** Wait before reconnecting after the stream drops; the floor is reloaded on every reconnect. */
const RECONNECT_MS = 3000;

const TONE_LABELS: Record<TableTone, string> = {
  free: 'Free',
  paid: 'Occupied, paid',
  unpaid: 'Occupied, to pay',
  reserved: 'Reserved'
};

/**
 * Live floor of a Branch for a Platform Admin: every Table's status, Guest Count and open orders. Loads `/floor` once,
 * then applies `table` events from `/floor/events`; a dropped stream reconnects and reloads `/floor`.
 * Read-only by design: clearing Tables, setting guests and taking or confirming payments happen in the merchant app.
 */
@Component({
  selector: 'app-live-floor',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule, DisplayDatePipe, TableQrCardComponent],
  templateUrl: './live-floor.component.html',
  styleUrls: ['../merchant-catalog/merchant-catalog.component.css', './branch-tables.component.css']
})
export class LiveFloorComponent implements OnChanges, OnDestroy {
  private readonly locale = inject(AdminLocaleService);
  @Input({ required: true }) merchantId = '';
  @Input({ required: true }) branchId = '';

  readonly apiVersion = 'v1';
  readonly toneLabel = (tone: TableTone) => TONE_LABELS[tone];
  readonly pinPosition = pinPosition;
  readonly areaStyle = areaStyle;
  readonly seatedFor = seatedFor;
  readonly pinLabel = livePinLabel;
  readonly paymentLabel = paymentLabel;
  readonly preparationLabel = preparationLabel;
  readonly isUnpaid = isUnpaid;

  floor: BranchFloor | null = null;
  floorPlanId: string | null = null;
  selectedTableId: string | null = null;
  loading = false;
  error = '';
  lastUpdated: Date | null = null;
  /** Ticks every minute so "seated for" stays current between table events. */
  now = new Date();

  private live?: Subscription;
  private readonly clock = setInterval(() => (this.now = new Date()), 60_000);

  constructor(private readonly merchantApi: MerchantApiService) {}

  ngOnChanges(): void {
    this.live?.unsubscribe();
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
    clearInterval(this.clock);
  }

  private applyFloor(floor: BranchFloor): void {
    this.loading = false;
    this.error = '';
    this.floor = floor;
    this.lastUpdated = new Date();
    if (!floor.floorPlans.some((plan) => plan.id === this.floorPlanId)) this.floorPlanId = floor.floorPlans[0]?.id ?? null;
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
    this.lastUpdated = new Date();
  }

  get floorPlan(): FloorPlan | null {
    return this.floor?.floorPlans.find((plan) => plan.id === this.floorPlanId) ?? null;
  }

  get placed(): TableLive[] {
    return (this.floor?.tables ?? []).filter((live) => !!this.floorPlanId && live.table.placement?.floorPlanId === this.floorPlanId);
  }

  /** Active Tables that are on no Floor Plan; shown as a list so their status is still visible. */
  get unplaced(): TableLive[] {
    return (this.floor?.tables ?? []).filter((live) => !live.table.placement);
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
    return this.locale.text(guests === 1
      ? '{0}/{1} tables occupied · {2} guest · {3}/{4} seats in occupied tables · Branch Capacity {5}'
      : '{0}/{1} tables occupied · {2} guests · {3}/{4} seats in occupied tables · Branch Capacity {5}',
      [occupied.length, floor.tables.length, guests, seats(occupied), seats(floor.tables), this.locale.text(String(capacity))]);
  }

  get overCapacity(): boolean {
    if (!this.floor) return false;
    const seated = this.floor.tables.reduce((sum, live) => sum + (live.table.seats ?? 0), 0);
    return exceedsCapacity(seated, this.floor.branchCapacity);
  }

  tone(live: TableLive): TableTone { return tableTone(live); }

  chairs(live: TableLive) { return tableChairs(live.table.seats, live.guestCount); }

  select(live: TableLive): void {
    this.selectedTableId = this.selectedTableId === live.table.id ? null : live.table.id;
  }

  amount(order: TableOrderSummary): string {
    try {
      return new Intl.NumberFormat('de-DE', { style: 'currency', currency: order.currency || 'EUR' }).format(order.totalAmountMinor / 100);
    } catch {
      return `${(order.totalAmountMinor / 100).toFixed(2)} ${order.currency}`;
    }
  }

  private toMessage(error: unknown): string {
    const httpError = error as HttpErrorResponse;
    if (httpError?.status === 0) return 'Could not reach the server. Retrying…';
    if (httpError?.status === 404) return 'Branch not found.';
    return apiErrorMessage(error, 'Failed to load the live floor. Retrying…');
  }
}
