import { getEnvironmentByKey } from './merchant-environment.service';

describe('merchant storefront environments', () => {
  it('keeps local and staging catalog QR links paired with their backend environment', () => {
    expect(getEnvironmentByKey('local').storefrontUrl).toBe('http://localhost:4201');
    expect(getEnvironmentByKey('staging').storefrontUrl).toBe('https://blitz-pay-web.elegantsoftware.de');
  });
});
