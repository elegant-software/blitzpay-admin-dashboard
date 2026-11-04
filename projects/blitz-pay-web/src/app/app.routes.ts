import { Routes } from '@angular/router';

export const storefrontRoutes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./pages/storefront-home.component').then(module => module.StorefrontHomeComponent) },
  {
    path: 't/:code',
    loadComponent: () => import('./table/table-check-in.component').then((module) => module.TableCheckInComponent)
  },
  {
    path: 'm/:merchantId/b/:branchId/p/:productId',
    loadComponent: () => import('./pages/product-overview.component').then((module) => module.ProductOverviewComponent)
  },
  {
    path: 'm/:merchantId/b/:branchId/checkout',
    loadComponent: () => import('./pages/guest-checkout.component').then((module) => module.GuestCheckoutComponent)
  },
  {
    path: 'm/:merchantId/b/:branchId',
    loadComponent: () => import('./pages/web-catalog.component').then((module) => module.WebCatalogComponent)
  },
  {
    path: 'order/:orderId/confirmation',
    loadComponent: () => import('./pages/order-confirmation.component').then((module) => module.OrderConfirmationComponent)
  },
  {
    path: 'order/:orderId',
    loadComponent: () => import('./pages/qr-order-landing.component').then((module) => module.QrOrderLandingComponent)
  },
  {
    path: '**',
    loadComponent: () => import('./pages/storefront-not-found.component').then((module) => module.StorefrontNotFoundComponent)
  }
];
