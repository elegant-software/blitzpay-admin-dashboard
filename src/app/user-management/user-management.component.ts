import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { environment as appEnv } from '../../environments/environment';
import { BackendEnvironment } from '../models/merchant-catalog.models';
import { MerchantUserAssignment, UserSearchResult } from '../models/user-management.models';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { UserManagementApiService } from '../services/user-management-api.service';
import { UserDetailComponent } from './user-detail.component';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, UserDetailComponent],
  templateUrl: './user-management.component.html',
})
export class UserManagementComponent implements OnInit {
  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  selectedUser: UserSearchResult | null = null;
  assignments: MerchantUserAssignment[] = [];
  loading = false;
  searching = false;
  errorMessage: string | null = null;

  readonly environment: BackendEnvironment;
  readonly apiVersion = 'v1';
  constructor(private readonly api: UserManagementApiService) {
    this.environment = getEnvironmentByKey(appEnv.defaultEnvironmentKey);
  }

  ngOnInit(): void {}

  search(): void {
    const query = this.searchQuery.trim();
    if (!query) return;
    this.searching = true;
    this.errorMessage = null;
    this.selectedUser = null;
    this.assignments = [];
    this.api.searchUsers(this.environment, this.apiVersion, query).subscribe({
      next: results => {
        this.searchResults = results;
        this.searching = false;
      },
      error: () => {
        this.errorMessage = 'User search failed. Please try again.';
        this.searching = false;
      }
    });
  }

  selectUser(user: UserSearchResult): void {
    this.selectedUser = user;
    this.loadAssignments(user.id);
  }

  loadAssignments(userId: string): void {
    this.loading = true;
    this.errorMessage = null;
    this.api.getAssignments(this.environment, this.apiVersion, userId).subscribe({
      next: assignments => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Failed to load assignments.';
        this.loading = false;
      }
    });
  }

  onAssignmentsChanged(): void {
    if (this.selectedUser) {
      this.loadAssignments(this.selectedUser.id);
    }
  }
}
