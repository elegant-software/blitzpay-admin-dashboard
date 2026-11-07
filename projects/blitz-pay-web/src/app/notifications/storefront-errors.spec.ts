import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorCode, apiErrorMessage } from './notification.service';

describe('Storefront API feedback', () => {
  it('explains table location rejections in customer language', () => {
    const message = (code: string) =>
      apiErrorMessage(new HttpErrorResponse({ status: 400, error: { detail: 'customerLocation check failed', code } }), 'Unable to place your order.');
    expect(message('LOCATION_REQUIRED')).toContain('Allow location access');
    expect(message('LOCATION_INACCURATE')).toContain('precise location');
    expect(message('LOCATION_EXPIRED')).toContain('expired');
    expect(message('OUTSIDE_GEOFENCE')).toContain('at the restaurant');
  });

  it('uses code wording at any status, and caller wording first', () => {
    const tooMany = new HttpErrorResponse({ status: 429, error: { status: 429, detail: 'Too many payment attempts for this order', code: 'TOO_MANY_REQUESTS' } });
    expect(apiErrorCode(tooMany)).toBe('TOO_MANY_REQUESTS');
    expect(apiErrorMessage(tooMany, 'Unable to start payment.')).toContain('Too many payment attempts');
    expect(apiErrorMessage(tooMany, 'Unable to start payment.', { TOO_MANY_REQUESTS: 'Slow down.' })).toBe('Slow down.');
  });

  it('shows a plain-language detail but hides diagnostic identifiers', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { detail: 'This table is unavailable.', code: 'CONFLICT' } }), 'Unable to order.')).toBe('This table is unavailable.');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { detail: 'Unknown merchant d15fecee-5c5c-4d5d-9b68-12b159c55ce1', code: 'NOT_FOUND' } }), 'Unable to order.')).toBe('Unable to order.');
  });
});
