import { Injectable } from '@angular/core';
import { StorefrontCustomerLocation } from '../models/storefront.models';

/** Thrown with a message the guest can act on. [denied] means the browser or the guest refused location access. */
export class LocationUnavailableError extends Error {
  constructor(message: string, readonly denied: boolean) {
    super(message);
  }
}

/**
 * The guest's current position from the browser, needed for every order at a Table (ADR-0023: a Table Link
 * does not prove presence). Always a fresh fix: the backend rejects positions older than a few minutes.
 */
@Injectable({ providedIn: 'root' })
export class StorefrontLocationService {
  current(): Promise<StorefrontCustomerLocation> {
    const geolocation = typeof navigator !== 'undefined' ? navigator.geolocation : undefined;
    if (!geolocation) {
      return Promise.reject(new LocationUnavailableError('Your browser cannot share your location, so you cannot order at this table.', false));
    }
    return new Promise((resolve, reject) => geolocation.getCurrentPosition(
      (position) => resolve({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        capturedAt: new Date(position.timestamp || Date.now()).toISOString()
      }),
      (error) => reject(error.code === error.PERMISSION_DENIED
        ? new LocationUnavailableError('Allow location access to order at your table. We use it only to check that you are at the restaurant.', true)
        : new LocationUnavailableError('We could not find your location. Check that location services are on and try again.', false)),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    ));
  }
}
