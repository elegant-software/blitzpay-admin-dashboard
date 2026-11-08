import { inject, Pipe, PipeTransform } from '@angular/core';
import { AdminLocaleService } from './admin-locale.service';

@Pipe({ name: 'adminTranslate', standalone: true, pure: false })
export class AdminTranslatePipe implements PipeTransform {
  private readonly locale = inject(AdminLocaleService);
  transform(source: string | null | undefined, values: readonly unknown[] = []): string {
    return this.locale.text(source, values);
  }
}
