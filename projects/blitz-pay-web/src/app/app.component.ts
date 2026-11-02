import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, ViewChild, inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { StorefrontPwaService } from './services/storefront-pwa.service';
import { RouterOutlet } from '@angular/router';
import { StorefrontThemeService } from './services/storefront-theme.service';
import { environment } from '../environments/environment';

@Component({
  selector: 'web-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements AfterViewInit, OnDestroy {
  readonly pwa = inject(StorefrontPwaService);
  readonly theme = inject(StorefrontThemeService);
  readonly environment = environment;
  private readonly document = inject(DOCUMENT);
  @ViewChild('downloadShell', { static: true }) private downloadShell!: ElementRef<HTMLElement>;
  private shellObserver?: ResizeObserver;
  scrolled = window.scrollY > 160;
  downloadsExpanded = false;

  @HostListener('window:scroll')
  onScroll(): void { this.scrolled = window.scrollY > 160; }

  ngAfterViewInit(): void {
    this.shellObserver = new ResizeObserver(entries => {
      const height = entries[0]?.target.getBoundingClientRect().height ?? 0;
      this.document.documentElement.style.setProperty('--storefront-download-height', `${height}px`);
    });
    this.shellObserver.observe(this.downloadShell.nativeElement);
  }

  ngOnDestroy(): void {
    this.shellObserver?.disconnect();
    this.document.documentElement.style.removeProperty('--storefront-download-height');
  }

  reconnect(): void { window.location.reload(); }
}
