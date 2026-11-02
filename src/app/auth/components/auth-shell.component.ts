import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';

type ThemeMode = 'light' | 'dark';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css'
})
export class AuthShellComponent {
  sidebarCollapsed = false;
  theme: ThemeMode;
  readonly session$;

  constructor(
    private readonly authService: AuthService,
    private readonly authState: AuthStateService,
    @Inject(DOCUMENT) private readonly document: Document
  ) {
    this.session$ = this.authState.session$;
    const savedTheme = this.document.defaultView?.localStorage.getItem('zackpay-admin-theme');
    this.theme = savedTheme === 'dark' ? 'dark' : 'light';
    this.applyTheme();
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  closeMobileSidebar(): void {
    if (this.document.defaultView?.matchMedia('(max-width: 991.98px)').matches) {
      this.sidebarCollapsed = false;
    }
  }

  toggleTheme(): void {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme();
    this.document.defaultView?.localStorage.setItem('zackpay-admin-theme', this.theme);
  }

  @HostListener('document:keydown.escape')
  closeSidebarOnEscape(): void {
    this.closeMobileSidebar();
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('[auth] logout failed', error);
    }
  }

  private applyTheme(): void {
    this.document.documentElement.setAttribute('data-coreui-theme', this.theme);
  }
}
