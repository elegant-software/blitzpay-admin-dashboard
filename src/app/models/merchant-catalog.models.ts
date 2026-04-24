export type EnvironmentKey = 'local' | 'staging';
export type CatalogSearchMode = 'merchantId' | 'branchId' | 'productId' | 'productName';

export interface BackendEnvironment {
  key: EnvironmentKey;
  label: string;
  baseUrl: string;
}

export interface Merchant {
  applicationId: string;
  applicationReference: string;
  registrationNumber: string;
  businessType?: string | null;
  operatingCountry?: string | null;
  legalBusinessName?: string | null;
  primaryBusinessAddress?: string | null;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhoneNumber?: string | null;
  activePaymentChannels?: string[] | null;
  status: string;
  submittedAt?: string | null;
  lastUpdatedAt: string;
  logoStorageKey?: string | null;
}

export interface MerchantLocation {
  merchantId: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  googlePlaceId?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  placeFormattedAddress?: string | null;
  placeRating?: number | null;
  placeReviewCount?: number | null;
  placeEnrichmentStatus?: string | null;
  placeEnrichedAt?: string | null;
}

export interface NearbyMerchantResult {
  merchantId: string;
  legalBusinessName: string;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  googlePlaceId?: string | null;
  distanceMeters: number;
}

export interface Branch {
  id?: string;
  branchId?: string;
  merchantId: string;
  name: string;
  active?: boolean | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  postalCode?: string | null;
  country?: string | null;
  contactFullName?: string | null;
  contactEmail?: string | null;
  contactPhoneNumber?: string | null;
  activePaymentChannels?: string[] | null;
  latitude?: number | null;
  longitude?: number | null;
  geofenceRadiusMeters?: number | null;
  googlePlaceId?: string | null;
  placeFormattedAddress?: string | null;
  placeRating?: number | null;
  placeReviewCount?: number | null;
  placeEnrichmentStatus?: string | null;
  placeEnrichedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface Product {
  productId: string;
  merchantId: string;
  branchId?: string | null;
  name: string;
  description?: string | null;
  unitPrice: number;
  imageUrl?: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  merchantId: string;
  products: Product[];
}

export interface ProductBranchGroup {
  branchId: string | null;
  branchLabel: string;
  branch: Branch | null;
  products: Product[];
}

export interface UpdateMerchantLocationRequest {
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
  googlePlaceId?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
}

export interface CreateBranchRequest {
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  googlePlaceId?: string;
  stripeSecretKey?: string;
  stripePublishableKey?: string;
  braintreeMerchantId?: string;
  braintreePublicKey?: string;
  braintreePrivateKey?: string;
  braintreeEnvironment?: string;
}

export interface UpdateMerchantRequest {
  legalBusinessName: string;
  primaryBusinessAddress: string;
  contactFullName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  activePaymentChannels: string[];
  status?: string;
}

export interface UpdateBranchRequest {
  name: string;
  active: boolean;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  contactFullName?: string;
  contactEmail?: string;
  contactPhoneNumber?: string;
  activePaymentChannels: string[];
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
  googlePlaceId?: string;
}

export interface UpdateMerchantLogoRequest {
  storageKey: string;
}

export interface ImageAssetReference {
  kind: 'merchant-logo' | 'product-image';
  storageKey?: string;
  file?: File | null;
  imageUrl?: string | null;
  previewState: 'available' | 'unavailable' | 'loading' | 'failed';
}

export interface LocationFormModel {
  latitude: string;
  longitude: string;
  geofenceRadiusMeters: string;
  googlePlaceId: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface BranchFormModel {
  name: string;
  active: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postalCode: string;
  country: string;
  contactFullName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  activePaymentChannels: string[];
  latitude: string;
  longitude: string;
  geofenceRadiusMeters: string;
  googlePlaceId: string;
}

export interface MerchantFormModel {
  legalBusinessName: string;
  primaryBusinessAddress: string;
  contactFullName: string;
  contactEmail: string;
  contactPhoneNumber: string;
  activePaymentChannels: string[];
  status: string;
}

export interface ProductFormModel {
  name: string;
  active: boolean;
  unitPrice: string;
  branchId: string;
  description: string;
  imageFile: File | null;
}

export interface LogoFormModel {
  storageKey: string;
}
