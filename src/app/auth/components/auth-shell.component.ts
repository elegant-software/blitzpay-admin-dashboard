import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthStateService } from '../services/auth-state.service';

@Component({
  selector: 'app-auth-shell',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './auth-shell.component.html',
  styleUrl: './auth-shell.component.css'
})
export class AuthShellComponent {
  sidebarCollapsed = false;
  readonly session$;

  constructor(
    private readonly authService: AuthService,
    private readonly authState: AuthStateService
  ) {
    this.session$ = this.authState.session$;
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  async logout(): Promise<void> {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('[auth] logout failed', error);
    }
  }
}
