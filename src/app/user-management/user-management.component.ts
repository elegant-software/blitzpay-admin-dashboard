import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { NotificationService } from '../notifications/notification.service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
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
  imports: [AdminTranslatePipe, CommonModule, FormsModule, UserDetailComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.css',
})
export class UserManagementComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  searchQuery = '';
  searchResults: UserSearchResult[] = [];
  selectedUser: UserSearchResult | null = null;
  assignments: MerchantUserAssignment[] = [];
  loading = false;
  searching = false;
  loadFailedMessage = false;

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
    this.loadFailedMessage = false;
    this.selectedUser = null;
    this.assignments = [];
    this.api.searchUsers(this.environment, this.apiVersion, query).subscribe({
      next: results => {
        this.searchResults = results;
        this.searching = false;
      },
      error: (error) => {
        this.loadFailedMessage = true;
        this.searchResults = [];
        this.notifications.apiError(error, 'Could not search users. Please try again.');
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
    this.api.getAssignments(this.environment, this.apiVersion, userId).subscribe({
      next: assignments => {
        this.assignments = assignments;
        this.loading = false;
      },
      error: (error) => {
        this.assignments = [];
        this.notifications.apiError(error, 'Could not load assignments. Please try again.');
        this.loading = false;
      }
    });
  }

  onAssignmentsChanged(): void {
    if (this.selectedUser) {
      this.loadAssignments(this.selectedUser.id);
    }
  }

  userInitials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0))
      .join('')
      .toLocaleUpperCase();
  }
}
