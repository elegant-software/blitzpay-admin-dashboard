import { Injectable } from '@angular/core';
import Keycloak from 'keycloak-js';
import * as i0 from "@angular/core";
import * as i1 from "./auth-config.service";
import * as i2 from "./auth-state.service";
import * as i3 from "@angular/router";
export class AuthService {
    authConfig;
    authState;
    router;
    keycloak = null;
    initialized = false;
    initializationPromise = null;
    constructor(authConfig, authState, router) {
        this.authConfig = authConfig;
        this.authState = authState;
        this.router = router;
    }
    initialize() {
        if (this.initializationPromise) {
            return this.initializationPromise;
        }
        this.initializationPromise = this.initializeInternal();
        return this.initializationPromise;
    }
    get snapshot() {
        return this.authState.snapshot;
    }
    async login(returnUrl) {
        const keycloak = await this.ensureKeycloak();
        const redirectUri = this.buildRedirectUri(returnUrl);
        this.authState.patch({
            returnUrl: this.normalizeReturnUrl(returnUrl)
        });
        await keycloak.login({
            redirectUri
        });
    }
    async register(returnUrl) {
        const keycloak = await this.ensureKeycloak();
        const redirectUri = this.buildRedirectUri(returnUrl);
        this.authState.patch({
            returnUrl: this.normalizeReturnUrl(returnUrl)
        });
        await keycloak.register({
            redirectUri
        });
    }
    async logout() {
        const keycloak = await this.ensureKeycloak();
        this.authState.reset();
        this.authState.patch({
            status: 'anonymous',
            accessResolution: 'provider-error'
        });
        await keycloak.logout({
            redirectUri: this.authConfig.runtimeConfig.postLogoutRedirectUri
        });
    }
    async ensureValidToken() {
        const keycloak = await this.ensureKeycloak();
        if (!keycloak.authenticated || !keycloak.token) {
            return null;
        }
        try {
            await keycloak.updateToken(30);
            this.applyAuthenticatedState(keycloak);
            return keycloak.token ?? null;
        }
        catch (error) {
            this.handleProviderError('token_refresh_failed');
            throw error;
        }
    }
    async handleUnauthorizedResponse() {
        this.authState.patch({
            status: 'anonymous',
            accessResolution: 'provider-error',
            accessToken: null,
            accessTokenExpiresAt: null,
            lastErrorCode: 'api_unauthorized'
        });
        await this.router.navigate(['/auth/login'], {
            queryParams: {
                returnUrl: this.normalizeReturnUrl(this.router.url),
                error: 'session-expired'
            }
        });
    }
    async handleForbiddenResponse() {
        this.authState.patch({
            status: 'accessDenied',
            accessResolution: 'role-missing',
            lastErrorCode: 'api_forbidden'
        });
        await this.router.navigate(['/auth/access-denied'], {
            queryParams: {
                reason: 'role-missing'
            }
        });
    }
    navigationForProtectedRoute(url) {
        return {
            queryParams: {
                returnUrl: this.normalizeReturnUrl(url)
            }
        };
    }
    resolveAccessDeniedReason() {
        const session = this.authState.snapshot;
        switch (session.accessResolution) {
            case 'pending':
                return 'registration-pending';
            case 'social-unlinked':
                return 'social-unlinked';
            case 'account-conflict':
                return 'account-conflict';
            case 'config-error':
                return 'config-error';
            case 'provider-error':
                return 'provider-error';
            case 'role-missing':
            default:
                return 'role-missing';
        }
    }
    async initializeInternal() {
        this.authState.patch({
            status: 'initializing',
            accessResolution: 'provider-error',
            lastErrorCode: null
        });
        try {
            const keycloak = this.createKeycloak(this.authConfig.runtimeConfig);
            this.bindCallbacks(keycloak);
            await keycloak.init({
                onLoad: 'check-sso',
                pkceMethod: 'S256',
                silentCheckSsoRedirectUri: this.authConfig.runtimeConfig.silentCheckSsoRedirectUri,
                redirectUri: window.location.href,
                checkLoginIframe: true,
                scope: this.authConfig.runtimeConfig.scopes.join(' ')
            });
            this.keycloak = keycloak;
            this.initialized = true;
            if (!keycloak.authenticated) {
                this.authState.patch({
                    status: 'anonymous',
                    accessResolution: 'provider-error',
                    accessToken: null,
                    accessTokenExpiresAt: null,
                    refreshEligible: false,
                    roles: []
                });
                return;
            }
            this.applyAuthenticatedState(keycloak);
        }
        catch (error) {
            console.error('Keycloak initialization failed', error);
            this.handleConfigError('keycloak_init_failed');
        }
    }
    createKeycloak(config) {
        return new Keycloak({
            url: config.authorityUrl,
            realm: config.realm,
            clientId: config.clientId
        });
    }
    bindCallbacks(keycloak) {
        keycloak.onAuthLogout = () => {
            this.authState.patch({
                status: 'anonymous',
                accessResolution: 'provider-error',
                accessToken: null,
                accessTokenExpiresAt: null,
                refreshEligible: false,
                roles: []
            });
        };
        keycloak.onAuthError = () => this.handleProviderError('auth_error');
        keycloak.onAuthRefreshError = () => this.handleProviderError('auth_refresh_error');
        keycloak.onTokenExpired = () => {
            void this.ensureValidToken().catch(() => undefined);
        };
    }
    applyAuthenticatedState(keycloak) {
        const claims = (keycloak.tokenParsed ?? {});
        const roles = this.collectRoles(claims);
        const accessResolution = this.resolveAccessResolution(claims, roles);
        const displayName = this.resolveDisplayName(claims);
        const email = this.readStringClaim(claims, 'email');
        const emailVerified = Boolean(claims['email_verified']);
        const identityProvider = this.resolveIdentityProvider(claims);
        const linkedProviders = this.resolveLinkedProviders(claims, identityProvider);
        const profilePromise = keycloak.loadUserProfile().catch(() => null);
        void profilePromise.then((profile) => {
            const resolvedDisplayName = profile ? this.profileDisplayName(profile) : displayName;
            this.authState.patch({
                displayName: resolvedDisplayName
            });
        });
        this.authState.patch({
            status: accessResolution === 'authorized' ? 'authenticated' : 'accessDenied',
            accessResolution,
            subjectId: keycloak.subject ?? null,
            displayName,
            email,
            emailVerified,
            identityProvider,
            linkedProviders,
            roles,
            requiredRoles: [...this.authConfig.runtimeConfig.requiredRoles],
            accessToken: keycloak.token ?? null,
            accessTokenExpiresAt: this.resolveTokenExpiry(claims),
            refreshEligible: Boolean(keycloak.refreshToken),
            returnUrl: this.authState.snapshot.returnUrl,
            lastErrorCode: accessResolution === 'authorized' ? null : this.reasonToErrorCode(accessResolution),
            registrationStatus: this.resolveRegistrationStatus(claims)
        });
    }
    resolveAccessResolution(claims, roles) {
        const requiredRoles = this.authConfig.runtimeConfig.requiredRoles;
        const registrationStatus = this.resolveRegistrationStatus(claims);
        const identityProvider = this.resolveIdentityProvider(claims);
        const accountConflict = Boolean(claims['account_conflict'] || claims['account_match_conflict']);
        const socialUnlinked = Boolean(claims['social_unlinked'] || claims['link_required']);
        if (!requiredRoles.length || requiredRoles.some((role) => roles.includes(role))) {
            return 'authorized';
        }
        if (accountConflict) {
            return 'account-conflict';
        }
        if (socialUnlinked) {
            return 'social-unlinked';
        }
        if (registrationStatus && ['draft', 'submitted', 'pending', 'pendingreview', 'pending_review'].includes(registrationStatus)) {
            return 'pending';
        }
        if (identityProvider && identityProvider !== 'keycloak' && identityProvider !== 'local') {
            return 'social-unlinked';
        }
        return 'role-missing';
    }
    collectRoles(claims) {
        const realmRoles = Array.isArray(claims.realm_access?.roles) ? claims.realm_access.roles : [];
        const resourceAccess = claims.resource_access;
        const clientRoles = resourceAccess
            ? Object.values(resourceAccess).flatMap((entry) => entry.roles ?? [])
            : [];
        return Array.from(new Set([...realmRoles, ...clientRoles]));
    }
    resolveRegistrationStatus(claims) {
        const raw = this.readStringClaim(claims, 'registration_status')
            ?? this.readStringClaim(claims, 'registrationStatus')
            ?? this.readStringClaim(claims, 'access_status');
        return raw ? raw.toLowerCase().replace(/\s+/g, '') : null;
    }
    resolveDisplayName(claims) {
        return (this.readStringClaim(claims, 'name')
            ?? this.readStringClaim(claims, 'preferred_username')
            ?? ([this.readStringClaim(claims, 'given_name'), this.readStringClaim(claims, 'family_name')].filter(Boolean).join(' ') || null));
    }
    resolveIdentityProvider(claims) {
        return this.readStringClaim(claims, 'identity_provider')
            ?? this.readStringClaim(claims, 'idp')
            ?? (claims.azp ? 'keycloak' : null);
    }
    resolveLinkedProviders(claims, identityProvider) {
        const linked = claims['linked_identity_providers'];
        if (Array.isArray(linked)) {
            return linked.filter((value) => typeof value === 'string');
        }
        return identityProvider ? [identityProvider] : [];
    }
    resolveTokenExpiry(claims) {
        if (typeof claims.exp !== 'number') {
            return null;
        }
        return new Date(claims.exp * 1000).toISOString();
    }
    profileDisplayName(profile) {
        const parts = [profile.firstName, profile.lastName].filter(Boolean);
        return parts.join(' ') || profile.username || profile.email || null;
    }
    readStringClaim(claims, key) {
        const value = claims[key];
        return typeof value === 'string' && value.trim() ? value.trim() : null;
    }
    async ensureKeycloak() {
        await this.initialize();
        if (!this.keycloak || !this.initialized) {
            throw new Error('Keycloak is not initialized');
        }
        return this.keycloak;
    }
    buildRedirectUri(returnUrl) {
        return this.authConfig.toAbsoluteUrl(this.normalizeReturnUrl(returnUrl));
    }
    normalizeReturnUrl(returnUrl) {
        if (!returnUrl || !returnUrl.startsWith('/')) {
            return '/';
        }
        if (returnUrl.startsWith('/auth/')) {
            return '/';
        }
        return returnUrl;
    }
    handleProviderError(errorCode) {
        this.authState.patch({
            status: 'error',
            accessResolution: 'provider-error',
            lastErrorCode: errorCode,
            accessToken: null,
            accessTokenExpiresAt: null
        });
    }
    handleConfigError(errorCode) {
        this.authState.patch({
            status: 'error',
            accessResolution: 'config-error',
            lastErrorCode: errorCode,
            accessToken: null,
            accessTokenExpiresAt: null
        });
    }
    reasonToErrorCode(reason) {
        switch (reason) {
            case 'pending':
                return 'registration_pending';
            case 'social-unlinked':
                return 'social_account_link_required';
            case 'account-conflict':
                return 'account_match_conflict';
            case 'config-error':
                return 'auth_config_invalid';
            case 'provider-error':
                return 'identity_provider_unavailable';
            case 'role-missing':
            default:
                return 'role_missing';
        }
    }
    static ɵfac = function AuthService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthService)(i0.ɵɵinject(i1.AuthConfigService), i0.ɵɵinject(i2.AuthStateService), i0.ɵɵinject(i3.Router)); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthService, factory: AuthService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.AuthConfigService }, { type: i2.AuthStateService }, { type: i3.Router }], null); })();
