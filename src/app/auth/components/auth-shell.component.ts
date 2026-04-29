import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MerchantCatalogComponent } from '../../merchant-catalog/merchant-catalog.component';
import { PaymentOpsDashboardComponent } from '../../payment-ops-dashboard/payment-ops-dashboard.component';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';

type OnboardingTab = 'profile' | 'legal' | 'banking' | 'risk';
type MainSection = 'dashboard' | 'onboarding' | 'verification' | 'settlement' | 'merchantCatalog';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, MerchantCatalogComponent, PaymentOpsDashboardComponent],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css'
})
export class AuthShellComponent {
  activeSection: MainSection = 'dashboard';
  activeTab: OnboardingTab = 'profile';
  sidebarCollapsed = false;
  chatOpen = false;
  profileMenuOpen = false;
  readonly session$;

  constructor(
    private readonly authService: AuthService,
    private readonly authState: AuthStateService
  ) {
    this.session$ = this.authState.session$;
  }

  readonly onboardingSteps = [
    { title: '1. Intake', description: 'Collect legal, business, and contact data.', state: 'Complete', badge: 'bg-success' },
    { title: '2. Verification', description: 'Review business registration and owner identity.', state: 'In progress', badge: 'bg-warning text-dark' },
    { title: '3. Risk Setup', description: 'Assign MCC, limits, and reserve policy.', state: 'Pending', badge: 'bg-light text-dark' },
    { title: '4. Go-live', description: 'Enable processing and monitor first transactions.', state: 'Pending', badge: 'bg-light text-dark' }
  ];

  readonly supportTimeline = [
    { title: 'Verification queue updated', detail: '3 merchant files were approved in the last 15 minutes.', time: 'Just now' },
    { title: 'Banking checklist changed', detail: 'Settlement account proof is required before activation.', time: '12 min ago' },
    { title: 'Risk review assigned', detail: 'Reserve policy and MCC review were routed to Operations.', time: '42 min ago' }
  ];

  readonly profileMenuPrimary = [
    { label: 'Updates', badge: '42', badgeClass: 'bg-info' },
    { label: 'Messages', badge: '42', badgeClass: 'bg-success' },
    { label: 'Tasks', badge: '42', badgeClass: 'bg-danger' },
    { label: 'Comments', badge: '42', badgeClass: 'bg-warning text-dark' }
  ];

  readonly profileMenuSecondary = [
    'Profile',
    'Settings',
    'Payments',
    'Projects'
  ];

  readonly profileMenuTertiary = [
    { label: 'Lock Account', action: 'lock' },
    { label: 'Logout', action: 'logout' }
  ] as const;

  readonly sectionLabels: Record<MainSection, string> = {
    dashboard: 'Dashboard',
    onboarding: 'Merchant Onboarding',
    verification: 'Verification Queue',
    settlement: 'Settlement Setup',
    merchantCatalog: 'Merchant Catalog'
  };

  selectTab(tab: OnboardingTab): void {
    this.activeTab = tab;
  }

  selectSection(section: MainSection): void {
    this.activeSection = section;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
  }

  closeChat(): void {
    this.chatOpen = false;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  async handleProfileAction(action: 'lock' | 'logout'): Promise<void> {
    this.closeProfileMenu();

    if (action === 'logout') {
      console.log('[auth] profile menu logout clicked');
      try {
        await this.authService.logout();
      } catch (error) {
        console.error('[auth] profile menu logout failed', error);
      }
    }
  }
}
