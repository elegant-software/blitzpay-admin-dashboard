import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BackendEnvironment, Branch, MerchantSearchResultItem } from '../models/merchant-catalog.models';
import { CreateAssignmentRequest, MerchantOperationsRole, MerchantUserAssignment, UserSearchResult } from '../models/user-management.models';
import { UserManagementApiService } from '../services/user-management-api.service';
import { MerchantApiService } from '../services/merchant-api.service';

interface AssignDialogState {
  open: boolean;
  merchantQuery: string;
  merchantResults: MerchantSearchResultItem[];
  selectedMerchant: MerchantSearchResultItem | null;
  branches: Branch[];
  branchQuery: string;
  branchId: string | null;
  role: MerchantOperationsRole;
  employeeId: string | null;
  loadingBranches: boolean;
  saving: boolean;
  error: string | null;
}

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-detail.component.html',
})
export class UserDetailComponent implements OnChanges {
  @Input() user!: UserSearchResult;
  @Input() assignments: MerchantUserAssignment[] = [];
  @Input() loading = false;
  @Input() environment!: BackendEnvironment;
  @Input() apiVersion = 'v1';
  @Output() assignmentsChanged = new EventEmitter<void>();

  revoking: string | null = null;
  revokeError: string | null = null;

  dialog: AssignDialogState = this.freshDialog();

  constructor(
    private readonly api: UserManagementApiService,
    private readonly merchantApi: MerchantApiService,
  ) {}

  ngOnChanges(): void {
    this.revokeError = null;
    this.revoking = null;
  }

  openDialog(): void {
    this.dialog = this.freshDialog();
    this.dialog.open = true;
  }

  closeDialog(): void {
    this.dialog.open = false;
  }

  searchMerchants(): void {
    const q = this.dialog.merchantQuery.trim();
    if (!q) return;
    this.dialog.error = null;
    this.merchantApi.searchMerchants(this.environment, this.apiVersion, { q, page: 0 }).subscribe({
      next: response => { this.dialog.merchantResults = response.results; },
      error: () => { this.dialog.error = 'Merchant search failed.'; }
    });
  }

  selectMerchant(m: MerchantSearchResultItem): void {
    this.dialog.selectedMerchant = m;
    this.dialog.branches = [];
    this.dialog.branchId = null;
    this.loadBranches(m.applicationId);
  }

  onRoleChanged(role: MerchantOperationsRole): void {
    this.dialog.role = role;
  }

  saveAssignment(): void {
    if (!this.dialog.selectedMerchant) return;
    this.dialog.saving = true;
    this.dialog.error = null;

    const request: CreateAssignmentRequest = {
      merchantId: this.dialog.selectedMerchant.applicationId,
      branchId: this.dialog.branchId || null,
      role: this.dialog.role,
      employeeId: this.dialog.employeeId || null,
    };

    this.api.createAssignment(this.environment, this.apiVersion, this.user.id, request).subscribe({
      next: () => {
        this.dialog.saving = false;
        this.dialog.open = false;
        this.assignmentsChanged.emit();
      },
      error: (err) => {
        this.dialog.saving = false;
        this.dialog.error = err?.error?.message ?? 'Failed to create assignment.';
      }
    });
  }

  revoke(assignment: MerchantUserAssignment): void {
    this.revoking = assignment.id;
    this.revokeError = null;
    this.api.revokeAssignment(this.environment, this.apiVersion, this.user.id, assignment.id).subscribe({
      next: () => {
        this.revoking = null;
        this.assignmentsChanged.emit();
      },
      error: () => {
        this.revoking = null;
        this.revokeError = 'Failed to revoke assignment. Please try again.';
      }
    });
  }

  get roleLabel(): Record<MerchantOperationsRole, string> {
    return {
      MERCHANT_MANAGER: 'Merchant Manager',
      MERCHANT_EMPLOYEE: 'Merchant Employee',
    };
  }

  get filteredBranches(): Branch[] {
    const query = this.dialog.branchQuery.trim().toLowerCase();
    if (!query) return this.dialog.branches;
    const normalizedQuery = query.replace(/-/g, '');
    return this.dialog.branches.filter(branch => {
      const code = (branch.branchCode ?? '').toLowerCase();
      const normalizedCode = code.replace(/-/g, '');
      const name = branch.name.toLowerCase();
      return code.includes(query) || normalizedCode.includes(normalizedQuery) || name.includes(query);
    });
  }

  branchIdentity(branch: Branch): string {
    return branch.branchId ?? branch.id ?? '';
  }

  private loadBranches(merchantId: string): void {
    this.dialog.loadingBranches = true;
    this.dialog.error = null;
    this.dialog.branchQuery = '';
    this.merchantApi.getBranches(this.environment, this.apiVersion, merchantId).subscribe({
      next: branches => {
        this.dialog.branches = branches.filter(branch => branch.active !== false && this.branchIdentity(branch));
        this.dialog.loadingBranches = false;
      },
      error: () => {
        this.dialog.loadingBranches = false;
        this.dialog.error = 'Branch list failed to load.';
      }
    });
  }

  private freshDialog(): AssignDialogState {
    return {
      open: false,
      merchantQuery: '',
      merchantResults: [],
      selectedMerchant: null,
      branches: [],
      branchQuery: '',
      branchId: null,
      role: 'MERCHANT_MANAGER',
      employeeId: null,
      loadingBranches: false,
      saving: false,
      error: null,
    };
  }
}
