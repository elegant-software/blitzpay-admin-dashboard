import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StorefrontPwaService } from './services/storefront-pwa.service';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'web-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  readonly pwa = inject(StorefrontPwaService);
  reconnect(): void { window.location.reload(); }
}
