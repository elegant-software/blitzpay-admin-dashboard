import { NotificationService } from "../notifications/notification.service";
import { CommonModule } from "@angular/common";
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  BackendEnvironment,
  Branch,
  MerchantSearchResultItem,
} from "../models/merchant-catalog.models";
import {
  CreateAssignmentRequest,
  MerchantOperationsRole,
  MerchantUserAssignment,
  UserSearchResult,
} from "../models/user-management.models";
import { UserManagementApiService } from "../services/user-management-api.service";
import { MerchantApiService } from "../services/merchant-api.service";
import { MerchantSearchComponent } from "../shared/merchant-search.component";

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
}

@Component({
  selector: "app-user-detail",
  standalone: true,
  imports: [CommonModule, FormsModule, MerchantSearchComponent],
  templateUrl: "./user-detail.component.html",
  styleUrl: "./user-detail.component.css",
})
export class UserDetailComponent implements OnChanges {
  private readonly notifications = inject(NotificationService);
  @Input() user!: UserSearchResult;
  @Input() assignments: MerchantUserAssignment[] = [];
  @Input() loading = false;
  @Input() environment!: BackendEnvironment;
  @Input() apiVersion = "v1";
  @Output() assignmentsChanged = new EventEmitter<void>();

  revoking: string | null = null;

  dialog: AssignDialogState = this.freshDialog();

  constructor(
    private readonly api: UserManagementApiService,
    private readonly merchantApi: MerchantApiService,
  ) {}

  ngOnChanges(): void {
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
    this.merchantApi
      .searchMerchants(this.environment, this.apiVersion, { q, page: 0 })
      .subscribe({
        next: (response) => {
          this.dialog.merchantResults = response.results;
        },
        error: (error) => {
          this.notifications.apiError(
            error,
            "Could not search merchants. Please try again.",
          );
        },
      });
  }

  selectMerchant(m: MerchantSearchResultItem): void {
    this.dialog.selectedMerchant = m;
    this.dialog.branches = [];
    this.dialog.branchId = null;
    this.loadBranches(m.merchantId);
  }

  onRoleChanged(role: MerchantOperationsRole): void {
    this.dialog.role = role;
  }

  saveAssignment(): void {
    if (!this.dialog.selectedMerchant) return;
    this.dialog.saving = true;

    const request: CreateAssignmentRequest = {
      merchantId: this.dialog.selectedMerchant.merchantId,
      branchId: this.dialog.branchId || null,
      role: this.dialog.role,
      employeeId: this.dialog.employeeId || null,
    };

    this.api
      .createAssignment(
        this.environment,
        this.apiVersion,
        this.user.id,
        request,
      )
      .subscribe({
        next: () => {
          this.dialog.saving = false;
          this.dialog.open = false;
          this.notifications.success("Assignment added successfully");
          this.assignmentsChanged.emit();
        },
        error: (err) => {
          this.dialog.saving = false;
          this.notifications.apiError(
            err,
            "Could not add assignment. Please try again.",
          );
        },
      });
  }

  revoke(assignment: MerchantUserAssignment): void {
    this.revoking = assignment.id;

    this.api
      .revokeAssignment(
        this.environment,
        this.apiVersion,
        this.user.id,
        assignment.id,
      )
      .subscribe({
        next: () => {
          this.revoking = null;
          this.notifications.success("Assignment revoked successfully");
          this.assignmentsChanged.emit();
        },
        error: (error) => {
          this.revoking = null;
          this.notifications.apiError(
            error,
            "Could not revoke assignment. Please try again.",
          );
        },
      });
  }

  get roleLabel(): Record<MerchantOperationsRole, string> {
    return {
      MERCHANT_MANAGER: "Merchant Manager",
      MERCHANT_EMPLOYEE: "Merchant Employee",
    };
  }

  get filteredBranches(): Branch[] {
    const query = this.dialog.branchQuery.trim().toLowerCase();
    if (!query) return this.dialog.branches;
    const normalizedQuery = query.replace(/-/g, "");
    return this.dialog.branches.filter((branch) => {
      const code = (branch.branchCode ?? "").toLowerCase();
      const normalizedCode = code.replace(/-/g, "");
      const name = branch.name.toLowerCase();
      return (
        code.includes(query) ||
        normalizedCode.includes(normalizedQuery) ||
        name.includes(query)
      );
    });
  }

  branchIdentity(branch: Branch): string {
    return branch.branchId ?? branch.id ?? "";
  }

  private loadBranches(merchantId: string): void {
    this.dialog.loadingBranches = true;
    this.dialog.branchQuery = "";
    this.merchantApi
      .getBranches(this.environment, this.apiVersion, merchantId)
      .subscribe({
        next: (branches) => {
          this.dialog.branches = branches.filter(
            (branch) => branch.active !== false && this.branchIdentity(branch),
          );
          this.dialog.loadingBranches = false;
        },
        error: (error) => {
          this.dialog.loadingBranches = false;
          this.notifications.apiError(
            error,
            "Could not load branches. Please try again.",
          );
        },
      });
  }

  private freshDialog(): AssignDialogState {
    return {
      open: false,
      merchantQuery: "",
      merchantResults: [],
      selectedMerchant: null,
      branches: [],
      branchQuery: "",
      branchId: null,
      role: "MERCHANT_MANAGER",
      employeeId: null,
      loadingBranches: false,
      saving: false,
    };
  }
}
