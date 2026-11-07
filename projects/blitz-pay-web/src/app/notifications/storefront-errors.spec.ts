import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './notification.service';

describe('Storefront API feedback', () => {
  it('explains table location rejections in customer language', () => {
    const message = (code: string) =>
      apiErrorMessage(new HttpErrorResponse({ status: 400, error: { detail: 'customerLocation check failed', code } }), 'Unable to place your order.');
    expect(message('LOCATION_REQUIRED')).toContain('Allow location access');
    expect(message('LOCATION_INACCURATE')).toContain('precise location');
    expect(message('LOCATION_EXPIRED')).toContain('expired');
    expect(message('OUTSIDE_GEOFENCE')).toContain('at the restaurant');
  });

  it('shows a plain-language detail but hides diagnostic identifiers', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { detail: 'This table is unavailable.', code: 'CONFLICT' } }), 'Unable to order.')).toBe('This table is unavailable.');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { detail: 'Unknown merchant d15fecee-5c5c-4d5d-9b68-12b159c55ce1', code: 'NOT_FOUND' } }), 'Unable to order.')).toBe('Unable to order.');
  });
});
