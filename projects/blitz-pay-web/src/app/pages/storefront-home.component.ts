import { StorefrontTranslatePipe } from '../i18n/storefront-translate.pipe';
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { StorefrontSessionService } from '../services/storefront-session.service';
import { TableCodeFormComponent } from '../table/table-code-form.component';

@Component({
  standalone: true,
  imports: [StorefrontTranslatePipe, CommonModule, RouterLink, TableCodeFormComponent],
  templateUrl: './storefront-home.component.html',
  styleUrl: './storefront-home.component.css'
})
export class StorefrontHomeComponent { readonly cart = inject(StorefrontSessionService); }
