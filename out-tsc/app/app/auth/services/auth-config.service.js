import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import * as i0 from "@angular/core";
export class AuthConfigService {
    config = this.createRuntimeConfig(environment.auth);
    get runtimeConfig() {
        return this.config;
    }
    isProtectedApiRequest(url) {
        return this.config.apiBaseUrls.some((baseUrl) => url.startsWith(baseUrl));
    }
    toAbsoluteUrl(path) {
        return new URL(path, window.location.origin).toString();
    }
    createRuntimeConfig(config) {
        const authorityUrl = this.normalizeAuthority(config.authorityUrl);
        return {
            ...config,
            authorityUrl,
            redirectUri: this.toAbsoluteUrl(config.redirectPath),
            postLogoutRedirectUri: this.toAbsoluteUrl(config.postLogoutRedirectPath),
            silentCheckSsoRedirectUri: this.toAbsoluteUrl(config.silentCheckSsoPath),
            apiBaseUrls: config.apiBaseUrls.map((apiBaseUrl) => apiBaseUrl.replace(/\/+$/g, ''))
        };
    }
    normalizeAuthority(authorityUrl) {
        const trimmed = authorityUrl.trim().replace(/\/+$/g, '');
        if (!trimmed) {
            throw new Error('Missing Keycloak authorityUrl');
        }
        return trimmed;
    }
    static ɵfac = function AuthConfigService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthConfigService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthConfigService, factory: AuthConfigService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthConfigService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
