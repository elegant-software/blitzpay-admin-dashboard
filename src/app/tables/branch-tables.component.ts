import { inject as injectAdminLocale } from '@angular/core';
import { AdminLocaleService } from '../i18n/admin-locale.service';
import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { BranchCatalogQrComponent } from '../merchant-catalog/branch-catalog-qr.component';
import { Branch, BranchTable, EnvironmentKey, FloorArea, FloorPlan, Merchant } from '../models/merchant-catalog.models';
import { MerchantApiService } from '../services/merchant-api.service';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { FloorPlanEditorComponent, TablePlacementChange } from './floor-plan-editor.component';
import { exceedsCapacity, parseSeats, parseTableNames, seatedCapacity, seatsLabel } from './floor-plan';
import { LiveFloorComponent } from './live-floor.component';
import { TableQrCardComponent } from './table-qr-card.component';

export type BranchTablesView = 'tables' | 'floor-plans' | 'live';

type NameDialog =
  | { kind: 'edit-table'; table: BranchTable }
  | { kind: 'create-floor-plan' }
  | { kind: 'rename-floor-plan'; floorPlan: FloorPlan };

const byName = (left: { name: string }, right: { name: string }) =>
  left.name.localeCompare(right.name, undefined, { numeric: true, sensitivity: 'base' });

/**
 * Tables of one Branch (zack-pay#195): set up Tables and their QR codes, lay them out on Floor Plans, and watch the
 * live floor. Setup is for Merchant Managers and Platform Admins; the live floor is read-only here.
 */
@Component({
  selector: 'app-branch-tables',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule, RouterModule, BranchCatalogQrComponent, TableQrCardComponent, FloorPlanEditorComponent, LiveFloorComponent],
  templateUrl: './branch-tables.component.html',
  styleUrls: ['../merchant-catalog/merchant-catalog.component.css', './branch-tables.component.css']
})
export class BranchTablesComponent implements OnInit {
  readonly adminLocale = injectAdminLocale(AdminLocaleService);
  private readonly notifications = inject(NotificationService);
  private readonly merchantApi = inject(MerchantApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly selectedEnvironmentKey: EnvironmentKey = environment.defaultEnvironmentKey;
  readonly apiVersion = 'v1';
  readonly views: { key: BranchTablesView; label: string }[] = [
    { key: 'tables', label: 'Tables' },
    { key: 'floor-plans', label: 'Floor Plans' },
    { key: 'live', label: 'Live floor' }
  ];

  merchantId = '';
  branchId = '';
  view: BranchTablesView = 'tables';

  merchant: Merchant | null = null;
  branch: Branch | null = null;
  tables: BranchTable[] = [];
  floorPlans: FloorPlan[] = [];
  floorPlanId: string | null = null;

  loading = false;
  busy = false;
  uploading = false;
  errorMessage = '';


  newTableNames = '';
  newTableSeats = '';
  nameDialog: NameDialog | null = null;
  nameValue = '';
  seatsValue = '';
  readonly seatsLabel = seatsLabel;
  qrTable: BranchTable | null = null;

  @ViewChild('nameDialogElement') private nameDialogElement?: ElementRef<HTMLDialogElement>;
  @ViewChild('qrDialogElement') private qrDialogElement?: ElementRef<HTMLDialogElement>;

  get env() { return getEnvironmentByKey(this.selectedEnvironmentKey); }

  /** The Branch Link: the Branch's storefront without a Table, for a standee at the counter or entrance. */
  get branchLink(): string {
    return `${this.env.storefrontUrl}/m/${encodeURIComponent(this.merchantId)}/b/${encodeURIComponent(this.branchId)}`;
  }

  get sortedTables(): BranchTable[] { return [...this.tables].sort(byName); }

  get activeTables(): BranchTable[] { return this.sortedTables.filter((table) => table.active); }

  get namesToAdd(): string[] { return parseTableNames(this.newTableNames); }

  /** Sum of the seats of active Tables. */
  get seatedCapacity(): number { return seatedCapacity(this.tables); }

  get branchCapacity(): number | null { return this.branch?.capacity ?? null; }

  /** Warn, never block: the Tables seat more guests than the Branch Capacity. */
  get overCapacity(): boolean { return exceedsCapacity(this.seatedCapacity, this.branchCapacity); }

  get floorPlan(): FloorPlan | null { return this.floorPlans.find((plan) => plan.id === this.floorPlanId) ?? null; }

  get merchantName(): string { return this.merchant?.merchantName || 'Merchant'; }

  ngOnInit(): void {
    this.merchantId = this.route.snapshot.paramMap.get('id') ?? '';
    this.branchId = this.route.snapshot.paramMap.get('branchId') ?? '';
    const view = this.route.snapshot.queryParamMap.get('view') as BranchTablesView | null;
    if (view && this.views.some((option) => option.key === view)) this.view = view;
    if (!this.merchantId || !this.branchId) {
      this.errorMessage = 'Missing route parameters.';
      return;
    }
    this.load();
  }

  selectView(view: BranchTablesView): void {
    this.view = view;
    void this.router.navigate([], { relativeTo: this.route, queryParams: { view }, replaceUrl: true });
  }

  floorPlanName(table: BranchTable): string {
    if (!table.placement) return '—';
    return this.floorPlans.find((plan) => plan.id === table.placement?.floorPlanId)?.name ?? '—';
  }

  // ── Tables ────────────────────────────────────────────────────────────

  addTables(): void {
    const names = this.namesToAdd;
    if (!names.length || this.busy) return;
    const seats = parseSeats(this.newTableSeats);
    if (seats === undefined) {
      this.errorMessage = 'Seats must be a whole number from 1 to 50.';
      return;
    }
    this.run(this.merchantApi.createTables(this.env, this.apiVersion, this.merchantId, this.branchId, names, seats), 'Failed to add tables.', (created) => {
      this.tables = [...this.tables, ...created];
      this.newTableNames = '';
      this.newTableSeats = '';
      this.notifications.success(created.length === 1 ? `Added table ${created[0].name}.` : `Added ${created.length} tables.`);
    });
  }

  setActive(table: BranchTable, active: boolean): void {
    if (this.busy) return;
    if (!active && !confirm(this.adminLocale.text(`Deactivate table ${table.name}? Guests who open its link will order for collection at the counter.`))) return;
    this.run(this.merchantApi.updateTable(this.env, this.apiVersion, this.merchantId, this.branchId, table.id, { active }),
      'Failed to update the table.', (updated) => this.replaceTable(updated));
  }

  deleteTable(table: BranchTable): void {
    if (this.busy || !confirm(this.adminLocale.text(`Delete table ${table.name}? Its QR code and NFC tag stop working.`))) return;
    this.run(this.merchantApi.deleteTable(this.env, this.apiVersion, this.merchantId, this.branchId, table.id), 'Failed to delete the table.', () => {
      this.tables = this.tables.filter((candidate) => candidate.id !== table.id);
      this.notifications.success(`Deleted table ${table.name}.`);
    }, (error) => error instanceof HttpErrorResponse && error.status === 409
      ? `Table ${table.name} has orders, so it cannot be deleted. Deactivate it instead.`
      : null);
  }

  showQr(table: BranchTable): void {
    this.qrTable = table;
    this.qrDialogElement?.nativeElement.showModal();
  }

  closeQr(): void {
    this.qrDialogElement?.nativeElement.close();
    this.qrTable = null;
  }

  /** Prints the Branch Link and every active Table's QR card (the print sheet is only visible when printing). */
  printQrCodes(): void {
    window.print();
  }

  // ── Floor Plans ───────────────────────────────────────────────────────

  uploadImage(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    const floorPlan = this.floorPlan;
    if (!file || !floorPlan || this.uploading) return;
    if (!file.type.startsWith('image/')) {
      this.errorMessage = 'Choose an image file (JPEG, PNG or WebP).';
      return;
    }
    this.uploading = true;
    this.errorMessage = '';
    this.merchantApi.createFloorPlanImageUploadUrl(this.env, this.apiVersion, this.merchantId, this.branchId, floorPlan.id, file.type).pipe(
      switchMap((upload) => this.merchantApi.uploadMerchantLogo(upload.uploadUrl, file)),
      switchMap(() => this.merchantApi.getFloorPlans(this.env, this.apiVersion, this.merchantId, this.branchId))
    ).subscribe({
      next: (floorPlans) => { this.uploading = false; this.floorPlans = floorPlans; this.notifications.success(`Picture of ${floorPlan.name} updated.`); },
      error: (error) => { this.uploading = false; this.notifications.apiError(error, 'Failed to upload the picture.'); }
    });
  }

  deleteFloorPlan(): void {
    const floorPlan = this.floorPlan;
    if (!floorPlan || this.busy) return;
    if (!confirm(this.adminLocale.text(`Delete floor plan ${floorPlan.name}? Its tables are kept but no longer placed.`))) return;
    this.run(this.merchantApi.deleteFloorPlan(this.env, this.apiVersion, this.merchantId, this.branchId, floorPlan.id), 'Failed to delete the floor plan.', () => {
      this.floorPlans = this.floorPlans.filter((plan) => plan.id !== floorPlan.id);
      this.tables = this.tables.map((table) => table.placement?.floorPlanId === floorPlan.id ? { ...table, placement: null } : table);
      this.floorPlanId = this.floorPlans[0]?.id ?? null;
    });
  }

  place(change: TablePlacementChange): void {
    if (this.busy) return;
    const previous = change.table;
    // Show the move at once; put it back if the server refuses it.
    this.replaceTable({ ...previous, placement: change.placement });
    this.run(this.merchantApi.placeTable(this.env, this.apiVersion, this.merchantId, this.branchId, previous.id, change.placement),
      'Failed to place the table.', (updated) => this.replaceTable(updated), undefined, () => this.replaceTable(previous));
  }

  saveAreas(areas: FloorArea[]): void {
    if (this.busy || !this.floorPlanId) return;
    this.run(this.merchantApi.updateFloorAreas(this.env, this.apiVersion, this.merchantId, this.branchId, this.floorPlanId, areas),
      'Failed to save the areas.', (updated) => {
        this.floorPlans = this.floorPlans.map((plan) => plan.id === updated.id ? updated : plan);
        this.notifications.success(updated.areas?.length ? 'Areas saved.' : 'Areas removed. The live floor shows the picture again.');
      });
  }

  unplace(table: BranchTable): void {
    if (this.busy) return;
    this.run(this.merchantApi.unplaceTable(this.env, this.apiVersion, this.merchantId, this.branchId, table.id),
      'Failed to remove the table from the floor plan.', () => this.replaceTable({ ...table, placement: null }));
  }

  // ── Name dialog (rename table, create or rename floor plan) ───────────

  openNameDialog(dialog: NameDialog): void {
    this.nameDialog = dialog;
    this.nameValue = dialog.kind === 'edit-table' ? dialog.table.name : dialog.kind === 'rename-floor-plan' ? dialog.floorPlan.name : '';
    this.seatsValue = dialog.kind === 'edit-table' && dialog.table.seats != null ? String(dialog.table.seats) : '';
    this.nameDialogElement?.nativeElement.showModal();
  }

  get nameDialogTitle(): string {
    switch (this.nameDialog?.kind) {
      case 'edit-table': return `Edit table ${this.nameDialog.table.name}`;
      case 'rename-floor-plan': return `Rename floor plan ${this.nameDialog.floorPlan.name}`;
      default: return 'New floor plan';
    }
  }

  closeNameDialog(): void {
    this.nameDialogElement?.nativeElement.close();
    this.nameDialog = null;
  }

  saveName(): void {
    const dialog = this.nameDialog;
    const name = this.nameValue.trim();
    if (!dialog || !name || this.busy) return;
    if (dialog.kind === 'edit-table') {
      const seats = parseSeats(this.seatsValue);
      if (seats === undefined) {
        this.errorMessage = 'Seats must be a whole number from 1 to 50.';
        return;
      }
      this.run(this.merchantApi.updateTable(this.env, this.apiVersion, this.merchantId, this.branchId, dialog.table.id, { name, seats }),
        'Failed to update the table.', (updated) => { this.replaceTable(updated); this.closeNameDialog(); });
    } else if (dialog.kind === 'rename-floor-plan') {
      this.run(this.merchantApi.renameFloorPlan(this.env, this.apiVersion, this.merchantId, this.branchId, dialog.floorPlan.id, name),
        'Failed to rename the floor plan.', (updated) => {
          this.floorPlans = this.floorPlans.map((plan) => plan.id === updated.id ? updated : plan);
          this.closeNameDialog();
        });
    } else {
      this.run(this.merchantApi.createFloorPlan(this.env, this.apiVersion, this.merchantId, this.branchId, name),
        'Failed to create the floor plan.', (created) => {
          this.floorPlans = [...this.floorPlans, created];
          this.floorPlanId = created.id;
          this.closeNameDialog();
        });
    }
  }

  // ── Plumbing ──────────────────────────────────────────────────────────

  private load(): void {
    this.loading = true;
    this.errorMessage = '';
    forkJoin({
      merchant: this.merchantApi.getMerchant(this.env, this.apiVersion, this.merchantId).pipe(catchError(() => of(null))),
      branch: this.merchantApi.getBranch(this.env, this.apiVersion, this.merchantId, this.branchId),
      tables: this.merchantApi.getTables(this.env, this.apiVersion, this.merchantId, this.branchId),
      floorPlans: this.merchantApi.getFloorPlans(this.env, this.apiVersion, this.merchantId, this.branchId)
    }).subscribe({
      next: ({ merchant, branch, tables, floorPlans }) => {
        this.loading = false;
        this.merchant = merchant;
        this.branch = branch;
        this.tables = tables;
        this.floorPlans = floorPlans;
        this.floorPlanId = floorPlans[0]?.id ?? null;
      },
      error: (error) => {
        this.loading = false;
        this.notifications.apiError(error, 'Failed to load the tables of this branch.');
      }
    });
  }

  private replaceTable(updated: BranchTable): void {
    this.tables = this.tables.map((table) => table.id === updated.id ? updated : table);
  }

  private run<T>(
    call$: import('rxjs').Observable<T>,
    fallback: string,
    onSuccess: (result: T) => void,
    specialMessage?: (error: unknown) => string | null,
    onError?: () => void
  ): void {
    this.busy = true;
    this.errorMessage = '';

    call$.subscribe({
      next: (result) => { this.busy = false; onSuccess(result); },
      error: (error) => {
        this.busy = false;
        onError?.();
        this.notifications.apiError(error, specialMessage?.(error) ?? fallback);
      }
    });
  }

  /** Server detail first (CONSTITUTION §VIII); a 404 message would carry an ID, so it gets a plain sentence instead. */
}
