import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontSessionService } from '../services/storefront-session.service';

@Component({
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './storefront-home.component.html',
  styleUrl: './storefront-home.component.css'
})
export class StorefrontHomeComponent { readonly cart = inject(StorefrontSessionService); }
