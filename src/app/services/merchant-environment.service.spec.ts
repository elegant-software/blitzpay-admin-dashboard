import { getEnvironmentByKey } from './merchant-environment.service';

describe('merchant storefront environments', () => {
  it('keeps local and staging catalog QR links paired with their backend environment', () => {
    expect(getEnvironmentByKey('local').storefrontUrl).toBe('http://localhost:4201');
    expect(getEnvironmentByKey('k8s-staging').storefrontUrl).toBe('https://storefront.zackpay.de');
    expect(getEnvironmentByKey('aws-staging').storefrontUrl).toBe('https://storefront.zackpay.de');
  });
});
