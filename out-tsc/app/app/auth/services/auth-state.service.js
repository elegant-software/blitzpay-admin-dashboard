import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DEFAULT_AUTH_SESSION } from '../models/auth.models';
import * as i0 from "@angular/core";
export class AuthStateService {
    sessionSubject = new BehaviorSubject(DEFAULT_AUTH_SESSION);
    session$ = this.sessionSubject.asObservable();
    get snapshot() {
        return this.sessionSubject.value;
    }
    patch(patch) {
        this.sessionSubject.next({
            ...this.sessionSubject.value,
            ...patch
        });
    }
    replace(session) {
        this.sessionSubject.next(session);
    }
    reset() {
        this.sessionSubject.next(DEFAULT_AUTH_SESSION);
    }
    static ɵfac = function AuthStateService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthStateService)(); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: AuthStateService, factory: AuthStateService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthStateService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], null, null); })();
