import { Injectable } from '@angular/core';
import { StorefrontProduct } from '../models/storefront.models';

export interface StorefrontCartLine {
  product: StorefrontProduct;
  quantity: number;
}

interface StorefrontSessionState {
  merchantId: string;
  branchId: string;
  lines: StorefrontCartLine[];
  query: string;
  category: string;
}

@Injectable({ providedIn: 'root' })
export class StorefrontSessionService {
  private readonly storageKey = 'blitzpay.web-cart';
  private state: StorefrontSessionState | null = this.read();

  get scope(): { merchantId: string; branchId: string } | null {
    return this.state ? { merchantId: this.state.merchantId, branchId: this.state.branchId } : null;
  }

  get lines(): StorefrontCartLine[] {
    return this.state?.lines ?? [];
  }

  get itemCount(): number {
    return this.lines.reduce((total, line) => total + line.quantity, 0);
  }

  get subtotal(): number {
    return this.lines.reduce((total, line) => total + line.quantity * line.product.unitPrice, 0);
  }

  get query(): string {
    return this.state?.query ?? '';
  }

  get category(): string {
    return this.state?.category ?? '';
  }

  useScope(merchantId: string, branchId: string, confirmReplace = this.confirmReplacement): boolean {
    if (this.state?.merchantId === merchantId && this.state.branchId === branchId) return true;
    if (this.state?.lines.length && !confirmReplace()) return false;
    this.state = { merchantId, branchId, lines: [], query: '', category: '' };
    this.write();
    return true;
  }

  add(product: StorefrontProduct, quantity = 1): void {
    if (!this.state || quantity < 1) return;
    const existing = this.state.lines.find((line) => line.product.productId === product.productId);
    if (existing) {
      existing.product = product;
      existing.quantity += quantity;
    } else {
      this.state.lines.push({ product, quantity });
    }
    this.write();
  }

  decrease(productId: string): void {
    if (!this.state) return;
    const existing = this.state.lines.find((line) => line.product.productId === productId);
    if (!existing) return;
    existing.quantity -= 1;
    this.state.lines = this.state.lines.filter((line) => line.quantity > 0);
    this.write();
  }

  setBrowseState(query: string, category: string): void {
    if (!this.state) return;
    this.state.query = query;
    this.state.category = category;
    this.write();
  }

  /** Refresh localized text only; price and availability changes still require checkout review. */
  updateCatalogText(products: StorefrontProduct[], merchantId: string, branchId: string): void {
    if (this.state?.merchantId !== merchantId || this.state.branchId !== branchId) return;
    const current = new Map(products.map(product => [product.productId, product]));
    for (const line of this.state.lines) {
      const product = current.get(line.product.productId);
      if (!product) continue;
      line.product = {
        ...line.product, name: product.name, description: product.description,
        categoryName: product.categoryName, language: product.language
      };
    }
    this.write();
  }

  reconcile(products: StorefrontProduct[], commit: boolean): boolean {
    if (!this.state) return false;
    const current = new Map(products.map((product) => [product.productId, product]));
    const updated = this.state.lines
      .filter((line) => current.has(line.product.productId))
      .map((line) => ({ product: current.get(line.product.productId)!, quantity: line.quantity }));
    const changed = updated.length !== this.state.lines.length || updated.some((line, index) =>
      line.product.unitPrice !== this.state!.lines[index]?.product.unitPrice
    );
    if (commit && changed) {
      this.state.lines = updated;
      this.write();
    }
    return changed;
  }

  private confirmReplacement(): boolean {
    return window.confirm('Your cart contains items from another location.');
  }

  private read(): StorefrontSessionState | null {
    try {
      const value = sessionStorage.getItem(this.storageKey);
      return value ? JSON.parse(value) as StorefrontSessionState : null;
    } catch {
      return null;
    }
  }

  private write(): void {
    try {
      if (this.state) sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch { /* Browsing remains available when private-mode storage is restricted. */ }
  }

  savePaymentReturn(orderId: string): void {
    if (!this.state?.lines.length) return;
    try {
      localStorage.setItem(`${this.storageKey}.payment.${orderId}`, JSON.stringify({
        expires: Date.now() + 2 * 60 * 60 * 1000, state: this.state
      }));
    } catch { /* The live Order remains the source of truth if recovery is unavailable. */ }
  }

  restorePaymentReturn(orderId: string): void {
    const key = `${this.storageKey}.payment.${orderId}`;
    try {
      const value = localStorage.getItem(key);
      if (!value) return;
      const backup = JSON.parse(value);
      localStorage.removeItem(key);
      if (this.state?.lines.length || backup.expires <= Date.now()) return;
      const state = backup.state as StorefrontSessionState;
      if (typeof state?.merchantId !== 'string' || typeof state.branchId !== 'string' || !Array.isArray(state.lines)) return;
      if (!state.lines.every(line => line.product && typeof line.product.productId === 'string' && Number.isFinite(line.product.unitPrice) && Number.isInteger(line.quantity) && line.quantity > 0)) return;
      this.state = state;
      this.write();
    } catch { /* Ignore malformed or unavailable recovery storage. */ }
  }
}
