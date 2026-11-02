import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-appointments-shell',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="container-fluid appointments-shell px-4 pt-2 pb-4">
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
    .appointments-shell {
      --appointments-tab-text: #788397;
      --appointments-tab-border: #e4e8f0;
      --appointments-tab-accent: #6959d7;
    }

    .appointments-sub-nav {
      display: flex;
      gap: 0.35rem;
      overflow-x: auto;
      border: 0;
      border-bottom: 1px solid var(--appointments-tab-border);
      scrollbar-width: thin;
    }

    .appointments-sub-nav .nav-link {
      display: inline-flex;
      white-space: nowrap;
      align-items: center;
      gap: 0.3rem;
      border: 1px solid transparent;
      border-bottom: 2px solid transparent;
      border-radius: 0.65rem 0.65rem 0 0;
      margin-bottom: -1px;
      color: var(--appointments-tab-text);
      font-size: 0.76rem;
      font-weight: 620;
      padding: 0.68rem 0.9rem;
      background: none;
      cursor: pointer;
      transition: color 0.15s, border-color 0.15s, background 0.15s;
      text-decoration: none;
    }

    .appointments-sub-nav .nav-link:hover {
      color: #4237a1;
      background: #f7f6ff;
      border-bottom-color: #c9c4fa;
    }

    .appointments-sub-nav .nav-link.active {
      color: #5143bd;
      border-color: var(--appointments-tab-border);
      border-bottom-color: var(--appointments-tab-accent);
      background: #fff;
      font-weight: 720;
    }

    .appointments-sub-nav .nav-link:focus-visible {
      outline: 2px solid var(--appointments-tab-accent);
      outline-offset: 2px;
    }

    :host-context(html[data-coreui-theme='dark']) .appointments-shell {
      --appointments-tab-text: #a5b0c1;
      --appointments-tab-border: #354154;
      --appointments-tab-accent: #b7adff;
    }

    :host-context(html[data-coreui-theme='dark']) .appointments-sub-nav .nav-link:hover {
      color: #e4e0ff;
      background: #252d40;
    }

    :host-context(html[data-coreui-theme='dark']) .appointments-sub-nav .nav-link.active {
      color: #e4e0ff;
      background: #1b2535;
    }

    @media (max-width: 575.98px) {
      .appointments-shell {
        padding-inline: 0.75rem !important;
      }

      .appointments-sub-nav .nav-link {
        padding-inline: 0.7rem;
      }
    }
  `]
})
export class AppointmentsShellComponent {}
