import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../auth/services/auth.service';
import { MerchantApiService } from '../services/merchant-api.service';
import { merchantWhiteLabelGuard } from './white-label.guard';
describe('Merchant white-label access', () => {
  let auth: any; let api: any; let router: any;
  const route: any = {paramMap: new Map([['id', 'own-merchant']]), queryParamMap: new Map()};
  const state: any = {url: '/merchant-branding/own-merchant'};
  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['initialize', 'ensureValidToken', 'navigationForProtectedRoute']);
    auth.initialize.and.resolveTo(); auth.ensureValidToken.and.resolveTo('token');
    api = jasmine.createSpyObj('MerchantApiService', ['getWhiteLabel']);
    api.getWhiteLabel.and.returnValue(of({}));
    router = jasmine.createSpyObj('Router', ['createUrlTree']);
    router.createUrlTree.and.callFake((commands: string[]) => commands[0]);
    TestBed.configureTestingModule({providers: [{provide: AuthService, useValue: auth},
      {provide: MerchantApiService, useValue: api}, {provide: Router, useValue: router}]});
  });
  it('admits a signed-in manager only after backend merchant authorization', async () => {
    expect(await TestBed.runInInjectionContext(() => merchantWhiteLabelGuard(route, state))).toBeTrue();
    expect(api.getWhiteLabel.calls.mostRecent().args[2]).toBe('own-merchant');
  });
  it('denies another merchants manager or an unassigned shopper', async () => {
    api.getWhiteLabel.and.returnValue(throwError(() => ({status: 403})));
    const result = await TestBed.runInInjectionContext(() => merchantWhiteLabelGuard(route, state));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/access-denied'], jasmine.anything());
    expect(result).toBe(router.createUrlTree.calls.mostRecent().returnValue);
  });
  it('requires sign-in for an anonymous visitor', async () => {
    auth.ensureValidToken.and.resolveTo(null);
    const result = await TestBed.runInInjectionContext(() => merchantWhiteLabelGuard(route, state));
    expect(router.createUrlTree).toHaveBeenCalledWith(['/auth/login'], undefined);
    expect(result).toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(api.getWhiteLabel).not.toHaveBeenCalled();
  });
});
