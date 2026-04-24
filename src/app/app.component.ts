import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MerchantCatalogComponent } from './merchant-catalog/merchant-catalog.component';

type OnboardingTab = 'profile' | 'legal' | 'banking' | 'risk';
type TrafficPeriod = 'Day' | 'Month' | 'Year';
type MainSection = 'dashboard' | 'onboarding' | 'verification' | 'settlement' | 'merchantCatalog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, MerchantCatalogComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {
  activeSection: MainSection = 'dashboard';
  activeTab: OnboardingTab = 'profile';
  activeTrafficPeriod: TrafficPeriod = 'Month';
  complianceExpanded = true;
  riskExpanded = true;
  sidebarCollapsed = false;
  chatOpen = false;
  profileMenuOpen = false;

  readonly topMetrics = [
    { title: 'Users', value: '26K', change: '-12.4%', changeClass: 'text-danger', toneClass: 'metric-card-primary', progress: 72 },
    { title: 'Income', value: '$6.200', change: '40.9%', changeClass: 'text-success', toneClass: 'metric-card-info', progress: 58 },
    { title: 'Conversion Rate', value: '2.49%', change: '84.7%', changeClass: 'text-success', toneClass: 'metric-card-warning', progress: 81 },
    { title: 'Sessions', value: '44K', change: '-23.6%', changeClass: 'text-danger', toneClass: 'metric-card-danger', progress: 43 }
  ];

  readonly trafficSummary = [
    { label: 'Visits', value: '29.703 Users', ratio: '40%', color: 'success', progress: 40 },
    { label: 'Unique', value: '24.093 Users', ratio: '20%', color: 'info', progress: 20 },
    { label: 'Page Views', value: '78.706 Views', ratio: '60%', color: 'warning', progress: 60 },
    { label: 'New Users', value: '22.123 Users', ratio: '80%', color: 'danger', progress: 80 },
    { label: 'Bounce Rate', value: '40.15%', ratio: 'Average', color: 'secondary', progress: 40 }
  ];

  readonly weeklyTraffic = [
    { day: 'Monday', first: 34, second: 78 },
    { day: 'Tuesday', first: 56, second: 94 },
    { day: 'Wednesday', first: 12, second: 67 },
    { day: 'Thursday', first: 43, second: 91 },
    { day: 'Friday', first: 22, second: 73 },
    { day: 'Saturday', first: 53, second: 82 },
    { day: 'Sunday', first: 9, second: 69 }
  ];

  readonly acquisitionSources = [
    { label: 'Male', value: '43%', progress: 43, colorClass: 'bg-warning' },
    { label: 'Female', value: '37%', progress: 37, colorClass: 'bg-warning' },
    { label: 'Organic Search', value: '191,235', detail: '(56%)', progress: 56, colorClass: 'bg-success' },
    { label: 'Facebook', value: '51,223', detail: '(15%)', progress: 15, colorClass: 'bg-success' },
    { label: 'Twitter', value: '37,564', detail: '(11%)', progress: 11, colorClass: 'bg-success' },
    { label: 'LinkedIn', value: '27,319', detail: '(8%)', progress: 8, colorClass: 'bg-success' }
  ];

  readonly customers = [
    { initials: 'YA', name: 'Yiorgos Avraamu', state: 'New', registered: 'Jan 1, 2023', country: 'USA', usage: 50, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'Mastercard', activity: '10 sec ago', statusClass: 'bg-success' },
    { initials: 'AT', name: 'Avram Tarasios', state: 'Recurring', registered: 'Jan 1, 2023', country: 'Brazil', usage: 10, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'Visa', activity: '5 minutes ago', statusClass: 'bg-info' },
    { initials: 'QE', name: 'Quintin Ed', state: 'New', registered: 'Jan 1, 2023', country: 'India', usage: 74, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'Stripe', activity: '1 hour ago', statusClass: 'bg-warning' },
    { initials: 'EK', name: 'Eneas Kwadwo', state: 'New', registered: 'Jan 1, 2023', country: 'France', usage: 98, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'PayPal', activity: 'Last month', statusClass: 'bg-danger' }
  ];

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
    'Lock Account',
    'Logout'
  ];

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

  selectTrafficPeriod(period: TrafficPeriod): void {
    this.activeTrafficPeriod = period;
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
}
