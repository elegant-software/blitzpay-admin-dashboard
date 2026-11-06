import { HttpErrorResponse } from '@angular/common/http';
import { apiErrorMessage } from './notification.service';

describe('Storefront API feedback', () => {
  it('explains table location rejections in customer language', () => {
    const message = (error: string) => apiErrorMessage(new HttpErrorResponse({ status: 400, error: { error } }), 'Unable to place your order.');
    expect(message('customerLocation accuracy is insufficient for WALK_IN_ORDERING')).toContain('precise location');
    expect(message('customerLocation is too old for WALK_IN_ORDERING')).toContain('try again');
    expect(message('Customer is outside the branch geofence')).toContain('at the restaurant');
  });

  it('accepts plain-language error fields but hides diagnostic identifiers', () => {
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { error: 'This table is unavailable.' } }), 'Unable to order.')).toBe('This table is unavailable.');
    expect(apiErrorMessage(new HttpErrorResponse({ status: 400, error: { error: 'Unknown merchant d15fecee-5c5c-4d5d-9b68-12b159c55ce1' } }), 'Unable to order.')).toBe('Unable to order.');
  });
});
