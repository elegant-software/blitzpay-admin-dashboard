import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
import * as i2 from "../services/auth.service";
import * as i3 from "../services/auth-state.service";
import * as i4 from "@angular/common";
function AccessDeniedComponent_div_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 13)(1, "div", 14)(2, "span", 15);
    i0.ɵɵtext(3, "Signed-in identity");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "strong");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(6, "div", 14)(7, "span", 15);
    i0.ɵɵtext(8, "Provider");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "strong");
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const session_r1 = ctx.ngIf;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(session_r1.displayName || session_r1.email || "Authenticated user");
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(session_r1.identityProvider || "Keycloak");
} }
export class AccessDeniedComponent {
    route;
    router;
    authService;
    authState;
    session$;
    reason = 'role-missing';
    constructor(route, router, authService, authState) {
        this.route = route;
        this.router = router;
        this.authService = authService;
        this.authState = authState;
        this.session$ = this.authState.session$;
    }
    ngOnInit() {
        this.reason = this.route.snapshot.queryParamMap.get('reason') || this.authService.resolveAccessDeniedReason();
    }
    get title() {
        switch (this.reason) {
            case 'registration-pending':
                return 'Registration submitted';
            case 'social-unlinked':
                return 'Social identity needs review';
            case 'account-conflict':
                return 'Account match needs support';
            case 'config-error':
                return 'Authentication configuration incomplete';
            case 'provider-error':
                return 'Identity provider unavailable';
            default:
                return 'Access not yet granted';
        }
    }
    get description() {
        switch (this.reason) {
            case 'registration-pending':
                return 'Your identity is valid, but admin access is still pending approval. Check with the operations team before retrying.';
            case 'social-unlinked':
                return 'Your social account signed in successfully, but it is not linked to an approved admin record yet.';
            case 'account-conflict':
                return 'Multiple admin records match this verified identity. Support review is required before access can be granted.';
            case 'config-error':
                return 'The dashboard is missing required Keycloak realm or client settings for this environment.';
            case 'provider-error':
                return 'The hosted sign-in service is temporarily unavailable. Retry shortly.';
            default:
                return 'You signed in successfully, but your account does not have the required admin role for this dashboard.';
        }
    }
    async signOut() {
        await this.authService.logout();
    }
    async retrySignIn() {
        await this.authService.login('/');
    }
    async continueRegistration() {
        await this.authService.register('/');
    }
    backToLogin() {
        void this.router.navigate(['/auth/login']);
    }
    static ɵfac = function AccessDeniedComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AccessDeniedComponent)(i0.ɵɵdirectiveInject(i1.ActivatedRoute), i0.ɵɵdirectiveInject(i1.Router), i0.ɵɵdirectiveInject(i2.AuthService), i0.ɵɵdirectiveInject(i3.AuthStateService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AccessDeniedComponent, selectors: [["app-access-denied"]], decls: 21, vars: 5, consts: [[1, "auth-page"], [1, "auth-card", "card", "shadow-sm", "border-0"], [1, "card-body", "p-4", "p-lg-5"], [1, "auth-brand-eyebrow"], [1, "auth-title"], [1, "auth-copy"], ["class", "auth-status-grid", 4, "ngIf"], [1, "auth-actions"], ["type", "button", 1, "btn", "btn-primary", "btn-lg", 3, "click"], ["type", "button", 1, "btn", "btn-outline-primary", "btn-lg", 3, "click"], [1, "auth-secondary-actions"], ["type", "button", 1, "btn", "btn-link", "ps-0", 3, "click"], ["type", "button", 1, "btn", "btn-link", "text-danger", 3, "click"], [1, "auth-status-grid"], [1, "auth-status-item"], [1, "auth-status-label"]], template: function AccessDeniedComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵtext(4, "BlitzPay Admin Dashboard");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1", 4);
            i0.ɵɵtext(6);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 5);
            i0.ɵɵtext(8);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(9, AccessDeniedComponent_div_9_Template, 11, 2, "div", 6);
            i0.ɵɵpipe(10, "async");
            i0.ɵɵelementStart(11, "div", 7)(12, "button", 8);
            i0.ɵɵlistener("click", function AccessDeniedComponent_Template_button_click_12_listener() { return ctx.retrySignIn(); });
            i0.ɵɵtext(13, "Retry sign in");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "button", 9);
            i0.ɵɵlistener("click", function AccessDeniedComponent_Template_button_click_14_listener() { return ctx.continueRegistration(); });
            i0.ɵɵtext(15, "Continue registration");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "div", 10)(17, "button", 11);
            i0.ɵɵlistener("click", function AccessDeniedComponent_Template_button_click_17_listener() { return ctx.backToLogin(); });
            i0.ɵɵtext(18, "Back to login");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(19, "button", 12);
            i0.ɵɵlistener("click", function AccessDeniedComponent_Template_button_click_19_listener() { return ctx.signOut(); });
            i0.ɵɵtext(20, "Sign out");
            i0.ɵɵelementEnd()()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.title);
            i0.ɵɵadvance(2);
            i0.ɵɵtextInterpolate(ctx.description);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", i0.ɵɵpipeBind1(10, 3, ctx.session$));
        } }, dependencies: [CommonModule, i4.NgIf, i4.AsyncPipe], styles: [".auth-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 2rem;\n  background:\n    radial-gradient(circle at top right, rgba(220, 53, 69, 0.14), transparent 28%),\n    linear-gradient(180deg, #f8f9fb 0%, #eef2f7 100%);\n}\n\n.auth-card[_ngcontent-%COMP%] {\n  width: min(100%, 36rem);\n  border-radius: 1.25rem;\n}\n\n.auth-brand-eyebrow[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: #0d6efd;\n  font-weight: 700;\n  margin-bottom: 1rem;\n}\n\n.auth-title[_ngcontent-%COMP%] {\n  font-size: clamp(2rem, 4vw, 2.6rem);\n  margin-bottom: 0.75rem;\n}\n\n.auth-copy[_ngcontent-%COMP%] {\n  color: #526071;\n}\n\n.auth-status-grid[_ngcontent-%COMP%] {\n  display: grid;\n  gap: 1rem;\n  margin: 1.5rem 0;\n}\n\n.auth-status-item[_ngcontent-%COMP%] {\n  padding: 1rem;\n  border-radius: 0.875rem;\n  background: #f6f8fb;\n}\n\n.auth-status-label[_ngcontent-%COMP%] {\n  display: block;\n  font-size: 0.8rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: #6c7b8a;\n  margin-bottom: 0.35rem;\n}\n\n.auth-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin: 1rem 0 0.25rem;\n}\n\n.auth-secondary-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 1rem;\n  margin-top: 1rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AccessDeniedComponent, [{
        type: Component,
        args: [{ selector: 'app-access-denied', standalone: true, imports: [CommonModule], template: "<div class=\"auth-page\">\n  <div class=\"auth-card card shadow-sm border-0\">\n    <div class=\"card-body p-4 p-lg-5\">\n      <div class=\"auth-brand-eyebrow\">BlitzPay Admin Dashboard</div>\n      <h1 class=\"auth-title\">{{ title }}</h1>\n      <p class=\"auth-copy\">{{ description }}</p>\n\n      <div class=\"auth-status-grid\" *ngIf=\"session$ | async as session\">\n        <div class=\"auth-status-item\">\n          <span class=\"auth-status-label\">Signed-in identity</span>\n          <strong>{{ session.displayName || session.email || 'Authenticated user' }}</strong>\n        </div>\n        <div class=\"auth-status-item\">\n          <span class=\"auth-status-label\">Provider</span>\n          <strong>{{ session.identityProvider || 'Keycloak' }}</strong>\n        </div>\n      </div>\n\n      <div class=\"auth-actions\">\n        <button class=\"btn btn-primary btn-lg\" type=\"button\" (click)=\"retrySignIn()\">Retry sign in</button>\n        <button class=\"btn btn-outline-primary btn-lg\" type=\"button\" (click)=\"continueRegistration()\">Continue registration</button>\n      </div>\n\n      <div class=\"auth-secondary-actions\">\n        <button class=\"btn btn-link ps-0\" type=\"button\" (click)=\"backToLogin()\">Back to login</button>\n        <button class=\"btn btn-link text-danger\" type=\"button\" (click)=\"signOut()\">Sign out</button>\n      </div>\n    </div>\n  </div>\n</div>\n", styles: [".auth-page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 2rem;\n  background:\n    radial-gradient(circle at top right, rgba(220, 53, 69, 0.14), transparent 28%),\n    linear-gradient(180deg, #f8f9fb 0%, #eef2f7 100%);\n}\n\n.auth-card {\n  width: min(100%, 36rem);\n  border-radius: 1.25rem;\n}\n\n.auth-brand-eyebrow {\n  font-size: 0.8rem;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: #0d6efd;\n  font-weight: 700;\n  margin-bottom: 1rem;\n}\n\n.auth-title {\n  font-size: clamp(2rem, 4vw, 2.6rem);\n  margin-bottom: 0.75rem;\n}\n\n.auth-copy {\n  color: #526071;\n}\n\n.auth-status-grid {\n  display: grid;\n  gap: 1rem;\n  margin: 1.5rem 0;\n}\n\n.auth-status-item {\n  padding: 1rem;\n  border-radius: 0.875rem;\n  background: #f6f8fb;\n}\n\n.auth-status-label {\n  display: block;\n  font-size: 0.8rem;\n  text-transform: uppercase;\n  letter-spacing: 0.08em;\n  color: #6c7b8a;\n  margin-bottom: 0.35rem;\n}\n\n.auth-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin: 1rem 0 0.25rem;\n}\n\n.auth-secondary-actions {\n  display: flex;\n  gap: 1rem;\n  margin-top: 1rem;\n}\n"] }]
    }], () => [{ type: i1.ActivatedRoute }, { type: i1.Router }, { type: i2.AuthService }, { type: i3.AuthStateService }], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AccessDeniedComponent, { className: "AccessDeniedComponent", filePath: "src/app/auth/components/access-denied.component.ts", lineNumber: 14 }); })();
