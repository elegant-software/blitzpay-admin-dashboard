import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointments-shell',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container-fluid px-4 pt-2 pb-4">
      <ul class="nav nav-tabs appointments-sub-nav mb-4">
        <li class="nav-item">
          <a class="nav-link" routerLink="/appointments" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">
            <svg viewBox="0 0 24 24" width="14" height="14" class="me-1"><path fill="currentColor" d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM7 11h5v5H7z"/></svg>
            Merchant Appointments
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/appointments/calendar" routerLinkActive="active">
            <svg viewBox="0 0 24 24" width="14" height="14" class="me-1"><path fill="currentColor" d="M17 12h-5v5h5v-5zM16 1v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2h-1V1h-2zm3 18H5V8h14v11z"/></svg>
            Branch Calendar
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/appointments/policy" routerLinkActive="active">
            <svg viewBox="0 0 24 24" width="14" height="14" class="me-1"><path fill="currentColor" d="M19.14 12.94a7.95 7.95 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a8.3 8.3 0 00-1.63-.94L14.4 2.8a.5.5 0 00-.5-.4h-3.8a.5.5 0 00-.5.4l-.36 2.52c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.7 8.84a.5.5 0 00.12.64l2.03 1.58a7.95 7.95 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32a.5.5 0 00.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.52a.5.5 0 00.5.4h3.8a.5.5 0 00.5-.4l.36-2.52c.58-.23 1.12-.54 1.63-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15a3 3 0 110-6 3 3 0 010 6z"/></svg>
            Appointment Policy
          </a>
        </li>
      </ul>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .appointments-sub-nav {
      border-bottom: 2px solid #e5e7eb;
    }
    .appointments-sub-nav .nav-link {
      display: inline-flex;
      align-items: center;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      color: #6b7280;
      font-size: 0.88rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      background: none;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s;
      text-decoration: none;
    }
    .appointments-sub-nav .nav-link:hover {
      color: #374151;
      border-bottom-color: #d1d5db;
    }
    .appointments-sub-nav .nav-link.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
      font-weight: 600;
    }
  `]
})
export class AppointmentsShellComponent {}
