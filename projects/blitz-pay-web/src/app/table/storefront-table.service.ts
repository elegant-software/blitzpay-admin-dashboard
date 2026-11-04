import { Injectable } from '@angular/core';
import { StorefrontTableResolution } from '../models/storefront.models';

/**
 * The Table a guest checked in at by opening its Table Link, for one Branch and this browser tab.
 * A deactivated Table checks the guest in at the counter: no Table, and a note that orders are collected there.
 */
export interface TableCheckIn {
  merchantId: string;
  branchId: string;
  /** Null when the Table is deactivated; the order is then collected at the counter. */
  tableCode: string | null;
  tableName: string | null;
  /** True when the Table already had guests; the guest is then not asked how many people they are. */
  occupied: boolean;
}

@Injectable({ providedIn: 'root' })
export class StorefrontTableService {
  private readonly storageKey = 'blitzpay.table-check-in';
  private state: TableCheckIn | null = this.read();

  checkIn(tableCode: string, resolution: StorefrontTableResolution): TableCheckIn {
    const active = resolution.active && !!resolution.tableId;
    this.state = {
      merchantId: resolution.merchantId,
      branchId: resolution.branchId,
      tableCode: active ? tableCode : null,
      tableName: active ? resolution.tableName : null,
      occupied: !!resolution.occupied
    };
    this.write();
    return this.state;
  }

  /** The check-in for this Branch, or null when the guest did not arrive through a Table Link of it. */
  forBranch(merchantId: string, branchId: string): TableCheckIn | null {
    return this.state?.merchantId === merchantId && this.state.branchId === branchId ? this.state : null;
  }

  /** After this guest's first order the Table has a Guest Count, so "How many people?" is asked only once. */
  markOccupied(): void {
    if (!this.state || this.state.occupied) return;
    this.state = { ...this.state, occupied: true };
    this.write();
  }

  clear(): void {
    this.state = null;
    try {
      sessionStorage.removeItem(this.storageKey);
    } catch { /* storage may be unavailable in private mode */ }
  }

  private read(): TableCheckIn | null {
    try {
      const value = sessionStorage.getItem(this.storageKey);
      const parsed = value ? JSON.parse(value) as TableCheckIn : null;
      return parsed && typeof parsed.merchantId === 'string' && typeof parsed.branchId === 'string' ? parsed : null;
    } catch {
      return null;
    }
  }

  private write(): void {
    try {
      if (this.state) sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch { /* the check-in still applies for this page view */ }
  }
}
