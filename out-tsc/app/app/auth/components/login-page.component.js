import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import * as i0 from "@angular/core";
import * as i1 from "@angular/router";
import * as i2 from "../services/auth.service";
import * as i3 from "../services/auth-state.service";
import * as i4 from "@angular/common";
function LoginPageComponent_div_9_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 12);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r0 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r0.errorMessage);
} }
export class LoginPageComponent {
    route;
    router;
    authService;
    authState;
    session$;
    returnUrl = '/';
    errorMessage = null;
    constructor(route, router, authService, authState) {
        this.route = route;
        this.router = router;
        this.authService = authService;
        this.authState = authState;
        this.session$ = this.authState.session$;
    }
    ngOnInit() {
        this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/';
        this.errorMessage = this.resolveErrorMessage(this.route.snapshot.queryParamMap.get('error'));
        const session = this.authState.snapshot;
        if (session.status === 'authenticated' && session.accessResolution === 'authorized') {
            void this.router.navigateByUrl(this.returnUrl);
        }
    }
    async signIn() {
        await this.authService.login(this.returnUrl);
    }
    async register() {
        await this.authService.register(this.returnUrl);
    }
    resolveErrorMessage(errorCode) {
        switch (errorCode) {
            case 'session-expired':
                return 'Your session expired. Sign in again to continue.';
            case 'keycloak_init_failed':
            case 'auth_config_invalid':
                return 'Authentication is not configured correctly yet. Update the Keycloak realm and client settings for this environment.';
            case 'auth_error':
            case 'auth_refresh_error':
            case 'token_refresh_failed':
                return 'The identity provider could not complete sign-in. Try again in a moment.';
            default:
                return null;
        }
    }
    static ɵfac = function LoginPageComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || LoginPageComponent)(i0.ɵɵdirectiveInject(i1.ActivatedRoute), i0.ɵɵdirectiveInject(i1.Router), i0.ɵɵdirectiveInject(i2.AuthService), i0.ɵɵdirectiveInject(i3.AuthStateService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: LoginPageComponent, selectors: [["app-login-page"]], decls: 19, vars: 1, consts: [[1, "auth-page"], [1, "auth-card", "card", "shadow-sm", "border-0"], [1, "card-body", "p-4", "p-lg-5"], [1, "auth-brand-eyebrow"], [1, "auth-title"], [1, "auth-copy"], ["class", "alert alert-danger", 4, "ngIf"], [1, "auth-actions"], ["type", "button", 1, "btn", "btn-primary", "btn-lg", 3, "click"], ["type", "button", 1, "btn", "btn-outline-primary", "btn-lg", 3, "click"], [1, "auth-note"], [1, "auth-support"], [1, "alert", "alert-danger"]], template: function LoginPageComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "div", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵtext(4, "BlitzPay Admin Dashboard");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(5, "h1", 4);
            i0.ɵɵtext(6, "Single sign-on access");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(7, "p", 5);
            i0.ɵɵtext(8, " Sign in with the organization's hosted identity experience. New users can start registration here, and approved social providers are available during the hosted flow. ");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(9, LoginPageComponent_div_9_Template, 2, 1, "div", 6);
            i0.ɵɵelementStart(10, "div", 7)(11, "button", 8);
            i0.ɵɵlistener("click", function LoginPageComponent_Template_button_click_11_listener() { return ctx.signIn(); });
            i0.ɵɵtext(12, "Sign in");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(13, "button", 9);
            i0.ɵɵlistener("click", function LoginPageComponent_Template_button_click_13_listener() { return ctx.register(); });
            i0.ɵɵtext(14, "Register");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(15, "div", 10);
            i0.ɵɵtext(16, " Social sign-in is configured centrally in Keycloak. If your account already exists, use the same verified identity to avoid duplicate access records. ");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(17, "div", 11);
            i0.ɵɵtext(18, " Need access approval? Complete registration first, then contact the BlitzPay operations team if your role is still pending. ");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance(9);
            i0.ɵɵproperty("ngIf", ctx.errorMessage);
        } }, dependencies: [CommonModule, i4.NgIf], styles: [".auth-page[_ngcontent-%COMP%] {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 2rem;\n  background:\n    radial-gradient(circle at top right, rgba(13, 110, 253, 0.16), transparent 28%),\n    linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%);\n}\n\n.auth-card[_ngcontent-%COMP%] {\n  width: min(100%, 34rem);\n  border-radius: 1.25rem;\n}\n\n.auth-brand-eyebrow[_ngcontent-%COMP%] {\n  font-size: 0.8rem;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: #0d6efd;\n  font-weight: 700;\n  margin-bottom: 1rem;\n}\n\n.auth-title[_ngcontent-%COMP%] {\n  font-size: clamp(2rem, 4vw, 2.75rem);\n  margin-bottom: 0.75rem;\n}\n\n.auth-copy[_ngcontent-%COMP%], \n.auth-note[_ngcontent-%COMP%], \n.auth-support[_ngcontent-%COMP%] {\n  color: #526071;\n}\n\n.auth-actions[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin: 1.5rem 0 1rem;\n}\n\n.auth-support[_ngcontent-%COMP%] {\n  font-size: 0.95rem;\n  margin-top: 1rem;\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(LoginPageComponent, [{
        type: Component,
        args: [{ selector: 'app-login-page', standalone: true, imports: [CommonModule], template: "<div class=\"auth-page\">\n  <div class=\"auth-card card shadow-sm border-0\">\n    <div class=\"card-body p-4 p-lg-5\">\n      <div class=\"auth-brand-eyebrow\">BlitzPay Admin Dashboard</div>\n      <h1 class=\"auth-title\">Single sign-on access</h1>\n      <p class=\"auth-copy\">\n        Sign in with the organization's hosted identity experience. New users can start registration here, and approved social providers are available during the hosted flow.\n      </p>\n\n      <div class=\"alert alert-danger\" *ngIf=\"errorMessage\">{{ errorMessage }}</div>\n\n      <div class=\"auth-actions\">\n        <button class=\"btn btn-primary btn-lg\" type=\"button\" (click)=\"signIn()\">Sign in</button>\n        <button class=\"btn btn-outline-primary btn-lg\" type=\"button\" (click)=\"register()\">Register</button>\n      </div>\n\n      <div class=\"auth-note\">\n        Social sign-in is configured centrally in Keycloak. If your account already exists, use the same verified identity to avoid duplicate access records.\n      </div>\n\n      <div class=\"auth-support\">\n        Need access approval? Complete registration first, then contact the BlitzPay operations team if your role is still pending.\n      </div>\n    </div>\n  </div>\n</div>\n", styles: [".auth-page {\n  min-height: 100vh;\n  display: grid;\n  place-items: center;\n  padding: 2rem;\n  background:\n    radial-gradient(circle at top right, rgba(13, 110, 253, 0.16), transparent 28%),\n    linear-gradient(180deg, #f7f9fc 0%, #eef3f9 100%);\n}\n\n.auth-card {\n  width: min(100%, 34rem);\n  border-radius: 1.25rem;\n}\n\n.auth-brand-eyebrow {\n  font-size: 0.8rem;\n  letter-spacing: 0.12em;\n  text-transform: uppercase;\n  color: #0d6efd;\n  font-weight: 700;\n  margin-bottom: 1rem;\n}\n\n.auth-title {\n  font-size: clamp(2rem, 4vw, 2.75rem);\n  margin-bottom: 0.75rem;\n}\n\n.auth-copy,\n.auth-note,\n.auth-support {\n  color: #526071;\n}\n\n.auth-actions {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem;\n  margin: 1.5rem 0 1rem;\n}\n\n.auth-support {\n  font-size: 0.95rem;\n  margin-top: 1rem;\n}\n"] }]
    }], () => [{ type: i1.ActivatedRoute }, { type: i1.Router }, { type: i2.AuthService }, { type: i3.AuthStateService }], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(LoginPageComponent, { className: "LoginPageComponent", filePath: "src/app/auth/components/login-page.component.ts", lineNumber: 14 }); })();
