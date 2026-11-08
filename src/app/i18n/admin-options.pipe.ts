import { inject, Pipe, PipeTransform } from '@angular/core';
import { AdminLocaleService } from './admin-locale.service';

/** Translate UI option labels, preserving values and avoiding API response mutation. */
@Pipe({ name: 'adminOptions', standalone: true, pure: false })
export class AdminOptionsPipe implements PipeTransform {
  private readonly locale = inject(AdminLocaleService);
  private previous?: readonly object[];
  private field = '';
  private code = '';
  private result: object[] = [];
  transform<T extends object>(options: readonly T[], field = 'label'): T[] {
    if (this.previous !== options || this.field !== field || this.code !== this.locale.code()) {
      this.previous = options; this.field = field; this.code = this.locale.code();
      this.result = options.map(option => ({ ...option,
        [field]: this.locale.text((option as Record<string, string>)[field]) }));
    }
    return this.result as T[];
  }
}
