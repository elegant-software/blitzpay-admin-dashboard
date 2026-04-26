import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'displayDate',
  standalone: true
})
export class DisplayDatePipe implements PipeTransform {
  private readonly datePipe = new DatePipe('en-GB');

  transform(value: string | Date | null | undefined): string {
    if (value == null || value === '') {
      return '—';
    }
    return this.datePipe.transform(value, 'd MMM y, HH:mm') ?? '—';
  }
}
