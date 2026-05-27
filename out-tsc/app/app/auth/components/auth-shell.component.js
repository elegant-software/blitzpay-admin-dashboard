import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MerchantCatalogComponent } from '../../merchant-catalog/merchant-catalog.component';
import * as i0 from "@angular/core";
import * as i1 from "../services/auth.service";
import * as i2 from "../services/auth-state.service";
import * as i3 from "@angular/common";
const _c0 = () => [0, 1, 2, 3, 4];
const _c1 = () => [40, 52, 48, 66, 74, 58, 82, 69, 73, 61, 54, 88];
function AuthShellComponent_span_61_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "span", 82);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const session_r1 = ctx.ngIf;
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(session_r1.displayName || session_r1.email || "Authenticated User");
} }
function AuthShellComponent_button_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 83)(1, "span", 84);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 15);
    i0.ɵɵelement(3, "path", 85);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "span", 86);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r2 = ctx.$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r2.label);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(item_r2.badgeClass);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(item_r2.badge);
} }
function AuthShellComponent_button_71_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "button", 83)(1, "span", 84);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 15);
    i0.ɵɵelement(3, "path", 87);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r3 = ctx.$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r3);
} }
function AuthShellComponent_button_73_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "button", 88);
    i0.ɵɵlistener("click", function AuthShellComponent_button_73_Template_button_click_0_listener() { const item_r5 = i0.ɵɵrestoreView(_r4).$implicit; const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.handleProfileAction(item_r5)); });
    i0.ɵɵelementStart(1, "span", 84);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(2, "svg", 15);
    i0.ɵɵelement(3, "path", 89);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(4, "span");
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r5 = ctx.$implicit;
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(item_r5);
} }
function AuthShellComponent_div_83_div_2_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 142)(1, "div", 143)(2, "div", 144)(3, "div")(4, "div", 145);
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div");
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "button", 146);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(9, "svg", 23);
    i0.ɵɵelement(10, "path", 147);
    i0.ɵɵelementEnd()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(11, "div", 148)(12, "span");
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "span", 149);
    i0.ɵɵtext(15, "since last week");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(16, "div", 150);
    i0.ɵɵelement(17, "div", 151);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const metric_r8 = ctx.$implicit;
    i0.ɵɵadvance();
    i0.ɵɵclassMap(metric_r8.toneClass);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(metric_r8.value);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(metric_r8.title);
    i0.ɵɵadvance(5);
    i0.ɵɵclassMap(metric_r8.changeClass);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(metric_r8.change);
    i0.ɵɵadvance(4);
    i0.ɵɵstyleProp("width", metric_r8.progress, "%");
} }
function AuthShellComponent_div_83_div_24_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 152);
} }
function AuthShellComponent_div_83_span_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "span", 153);
} if (rf & 2) {
    const value_r9 = ctx.$implicit;
    i0.ɵɵstyleProp("height", value_r9, "%");
} }
function AuthShellComponent_div_83_div_29_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 154)(1, "div", 64);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 155);
    i0.ɵɵtext(4);
    i0.ɵɵelementStart(5, "span", 64);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(7, "div", 156);
    i0.ɵɵelement(8, "div", 157);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r10 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r10.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1("", item_r10.value, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r10.ratio);
    i0.ɵɵadvance(2);
    i0.ɵɵclassMap("bg-" + item_r10.color);
    i0.ɵɵstyleProp("width", item_r10.progress, "%");
} }
function AuthShellComponent_div_83_div_52_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 158)(1, "div", 159)(2, "span", 120);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "div", 160)(5, "div", 161);
    i0.ɵɵelement(6, "div", 162);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 163);
    i0.ɵɵelement(8, "div", 164);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const day_r11 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(day_r11.day);
    i0.ɵɵadvance(3);
    i0.ɵɵstyleProp("width", day_r11.first, "%");
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("width", day_r11.second, "%");
} }
function AuthShellComponent_div_83_div_68_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 165)(1, "div", 166)(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "span", 167);
    i0.ɵɵtext(5);
    i0.ɵɵelementStart(6, "span", 120);
    i0.ɵɵtext(7);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(8, "div", 160)(9, "div", 163);
    i0.ɵɵelement(10, "div", 157);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const source_r12 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(source_r12.label);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", source_r12.value, " ");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(source_r12.detail);
    i0.ɵɵadvance(3);
    i0.ɵɵclassMap(source_r12.colorClass);
    i0.ɵɵstyleProp("width", source_r12.progress, "%");
} }
function AuthShellComponent_div_83_div_77_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 168)(1, "div", 169)(2, "div", 94)(3, "h2", 170);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 171);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 172);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const step_r13 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(step_r13.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(step_r13.description);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(step_r13.badge);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(step_r13.state);
} }
function AuthShellComponent_div_83_div_92_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 173)(2, "label", 174);
    i0.ɵɵtext(3, "Legal Business Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 116)(6, "label", 174);
    i0.ɵɵtext(7, "Country");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "select", 176)(9, "option");
    i0.ɵɵtext(10, "United States");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option");
    i0.ɵɵtext(12, "United Kingdom");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option");
    i0.ɵɵtext(14, "Canada");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "div", 116)(16, "label", 174);
    i0.ɵɵtext(17, "Business Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "select", 176)(19, "option");
    i0.ɵɵtext(20, "Corporation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "option");
    i0.ɵɵtext(22, "LLC");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "option");
    i0.ɵɵtext(24, "Sole Proprietorship");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(25, "div", 116)(26, "label", 174);
    i0.ɵɵtext(27, "Monthly Volume");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(28, "input", 177);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 116)(30, "label", 174);
    i0.ɵɵtext(31, "Average Ticket");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(32, "input", 177);
    i0.ɵɵelementEnd()();
} }
function AuthShellComponent_div_83_div_93_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 116)(2, "label", 174);
    i0.ɵɵtext(3, "Registration Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 116)(6, "label", 174);
    i0.ɵɵtext(7, "Tax ID / EIN");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(8, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 178)(10, "label", 174);
    i0.ɵɵtext(11, "UBO Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(12, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 179)(14, "label", 174);
    i0.ɵɵtext(15, "Ownership %");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(16, "input", 177);
    i0.ɵɵelementEnd()();
} }
function AuthShellComponent_div_83_div_94_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 116)(2, "label", 174);
    i0.ɵɵtext(3, "Bank Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 116)(6, "label", 174);
    i0.ɵɵtext(7, "Account Holder");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(8, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 116)(10, "label", 174);
    i0.ɵɵtext(11, "Settlement Currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "select", 176)(13, "option");
    i0.ɵɵtext(14, "USD");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "option");
    i0.ɵɵtext(16, "EUR");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "option");
    i0.ɵɵtext(18, "GBP");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(19, "div", 116)(20, "label", 174);
    i0.ɵɵtext(21, "Payout Schedule");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "select", 176)(23, "option");
    i0.ɵɵtext(24, "T+1");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option");
    i0.ɵɵtext(26, "T+2");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "option");
    i0.ɵɵtext(28, "Weekly");
    i0.ɵɵelementEnd()()()();
} }
function AuthShellComponent_div_83_div_95_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 173)(2, "label", 174);
    i0.ɵɵtext(3, "Risk Rating");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 180)(5, "span", 181);
    i0.ɵɵtext(6, "Low");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 182);
    i0.ɵɵtext(8, "Medium");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 183);
    i0.ɵɵtext(10, "High");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(11, "div", 173)(12, "label", 174);
    i0.ɵɵtext(13, "Chargeback Threshold");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(14, "input", 184);
    i0.ɵɵelementEnd()();
} }
function AuthShellComponent_div_83_tr_115_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 140)(2, "div", 185);
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(4, "td")(5, "div");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 98);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "td", 140);
    i0.ɵɵtext(10);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "td")(12, "div", 186)(13, "strong");
    i0.ɵɵtext(14);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(15, "small", 64);
    i0.ɵɵtext(16);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "div", 156);
    i0.ɵɵelement(18, "div", 187);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "td", 140)(20, "span", 188);
    i0.ɵɵtext(21);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(22, "td")(23, "div", 98);
    i0.ɵɵtext(24, "Last login");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "div", 189);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const customer_r14 = ctx.$implicit;
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(customer_r14.initials);
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(customer_r14.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate2("", customer_r14.state, " | Registered: ", customer_r14.registered);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(customer_r14.country);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1("", customer_r14.usage, "%");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(customer_r14.period);
    i0.ɵɵadvance(2);
    i0.ɵɵstyleProp("width", customer_r14.usage, "%");
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(customer_r14.payment);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate(customer_r14.activity);
} }
function AuthShellComponent_div_83_Template(rf, ctx) { if (rf & 1) {
    const _r7 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 90)(1, "div", 91);
    i0.ɵɵtemplate(2, AuthShellComponent_div_83_div_2_Template, 18, 9, "div", 92);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 93)(4, "div", 94)(5, "div", 95)(6, "div", 96)(7, "h4", 97);
    i0.ɵɵtext(8, "Traffic");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 98);
    i0.ɵɵtext(10, "January - December 2023");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "div", 99)(12, "div", 100)(13, "button", 101);
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(14, "svg", 15);
    i0.ɵɵelement(15, "path", 102);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(16, "div", 103)(17, "button", 104);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_17_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTrafficPeriod("Day")); });
    i0.ɵɵtext(18, "Day");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "button", 104);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTrafficPeriod("Month")); });
    i0.ɵɵtext(20, "Month");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "button", 104);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_21_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTrafficPeriod("Year")); });
    i0.ɵɵtext(22, "Year");
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(23, "div", 105);
    i0.ɵɵtemplate(24, AuthShellComponent_div_83_div_24_Template, 1, 0, "div", 106);
    i0.ɵɵelementStart(25, "div", 107);
    i0.ɵɵtemplate(26, AuthShellComponent_div_83_span_26_Template, 1, 2, "span", 108);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "div", 109)(28, "div", 110);
    i0.ɵɵtemplate(29, AuthShellComponent_div_83_div_29_Template, 9, 7, "div", 111);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(30, "div", 112)(31, "div", 113)(32, "div", 114)(33, "div", 115);
    i0.ɵɵtext(34, "Traffic & Sales");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "div", 94)(36, "div", 95)(37, "div", 116)(38, "div", 117)(39, "div", 118)(40, "div", 119)(41, "div", 120);
    i0.ɵɵtext(42, "New Clients");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(43, "div", 121);
    i0.ɵɵtext(44, "9,123");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(45, "div", 118)(46, "div", 122)(47, "div", 120);
    i0.ɵɵtext(48, "Recurring Clients");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(49, "div", 121);
    i0.ɵɵtext(50, "22,643");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelement(51, "hr");
    i0.ɵɵtemplate(52, AuthShellComponent_div_83_div_52_Template, 9, 5, "div", 123);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "div", 116)(54, "div", 117)(55, "div", 118)(56, "div", 124)(57, "div", 120);
    i0.ɵɵtext(58, "Page views");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(59, "div", 121);
    i0.ɵɵtext(60, "78,623");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(61, "div", 118)(62, "div", 125)(63, "div", 120);
    i0.ɵɵtext(64, "Organic");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(65, "div", 121);
    i0.ɵɵtext(66, "49,123");
    i0.ɵɵelementEnd()()()();
    i0.ɵɵelement(67, "hr");
    i0.ɵɵtemplate(68, AuthShellComponent_div_83_div_68_Template, 11, 7, "div", 126);
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(69, "div", 127)(70, "div", 114)(71, "div", 115);
    i0.ɵɵtext(72, "Merchant Onboarding Workspace");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(73, "div", 94)(74, "div", 128);
    i0.ɵɵtext(75, " Suggested flow: Business Profile \u2192 Legal Entity & UBO \u2192 KYC/KYB Documents \u2192 Bank Settlement \u2192 Processing Configuration \u2192 Risk & Compliance Approval. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(76, "div", 129);
    i0.ɵɵtemplate(77, AuthShellComponent_div_83_div_77_Template, 9, 5, "div", 130);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(78, "ul", 131)(79, "li", 12)(80, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_80_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("profile")); });
    i0.ɵɵtext(81, "Business Profile");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(82, "li", 12)(83, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_83_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("legal")); });
    i0.ɵɵtext(84, "Legal");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(85, "li", 12)(86, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_86_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("banking")); });
    i0.ɵɵtext(87, "Banking");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(88, "li", 12)(89, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_83_Template_button_click_89_listener() { i0.ɵɵrestoreView(_r7); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("risk")); });
    i0.ɵɵtext(90, "Risk");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(91, "div", 133);
    i0.ɵɵtemplate(92, AuthShellComponent_div_83_div_92_Template, 33, 0, "div", 134)(93, AuthShellComponent_div_83_div_93_Template, 17, 0, "div", 134)(94, AuthShellComponent_div_83_div_94_Template, 29, 0, "div", 134)(95, AuthShellComponent_div_83_div_95_Template, 15, 0, "div", 134);
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(96, "div", 135)(97, "div", 136)(98, "div", 137)(99, "table", 138)(100, "thead", 139)(101, "tr")(102, "th", 140);
    i0.ɵɵtext(103, "User");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(104, "th");
    i0.ɵɵtext(105, "Customer");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(106, "th", 140);
    i0.ɵɵtext(107, "Country");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(108, "th");
    i0.ɵɵtext(109, "Usage");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(110, "th", 140);
    i0.ɵɵtext(111, "Payment");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(112, "th");
    i0.ɵɵtext(113, "Activity");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(114, "tbody");
    i0.ɵɵtemplate(115, AuthShellComponent_div_83_tr_115_Template, 27, 11, "tr", 141);
    i0.ɵɵelementEnd()()()()()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", ctx_r5.topMetrics);
    i0.ɵɵadvance(15);
    i0.ɵɵclassProp("btn-outline-secondary", ctx_r5.activeTrafficPeriod !== "Day")("btn-secondary", ctx_r5.activeTrafficPeriod === "Day");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("btn-outline-secondary", ctx_r5.activeTrafficPeriod !== "Month")("btn-secondary", ctx_r5.activeTrafficPeriod === "Month");
    i0.ɵɵadvance(2);
    i0.ɵɵclassProp("btn-outline-secondary", ctx_r5.activeTrafficPeriod !== "Year")("btn-secondary", ctx_r5.activeTrafficPeriod === "Year");
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", i0.ɵɵpureFunction0(33, _c0));
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngForOf", i0.ɵɵpureFunction0(34, _c1));
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r5.trafficSummary);
    i0.ɵɵadvance(23);
    i0.ɵɵproperty("ngForOf", ctx_r5.weeklyTraffic);
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("ngForOf", ctx_r5.acquisitionSources);
    i0.ɵɵadvance(9);
    i0.ɵɵproperty("ngForOf", ctx_r5.onboardingSteps);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "profile");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "legal");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "banking");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "risk");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngSwitch", ctx_r5.activeTab);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "profile");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "legal");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "banking");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "risk");
    i0.ɵɵadvance(20);
    i0.ɵɵproperty("ngForOf", ctx_r5.customers);
} }
function AuthShellComponent_div_84_div_10_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 196)(1, "div", 169)(2, "div", 94)(3, "h2", 170);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "p", 171);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 172);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const step_r16 = ctx.$implicit;
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate(step_r16.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(step_r16.description);
    i0.ɵɵadvance();
    i0.ɵɵclassMap(step_r16.badge);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(step_r16.state);
} }
function AuthShellComponent_div_84_div_25_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 116)(2, "label", 174);
    i0.ɵɵtext(3, "Legal Business Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 197)(6, "label", 174);
    i0.ɵɵtext(7, "Country");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(8, "select", 176)(9, "option");
    i0.ɵɵtext(10, "United States");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "option");
    i0.ɵɵtext(12, "United Kingdom");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "option");
    i0.ɵɵtext(14, "Canada");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(15, "div", 197)(16, "label", 174);
    i0.ɵɵtext(17, "Business Type");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "select", 176)(19, "option");
    i0.ɵɵtext(20, "Corporation");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "option");
    i0.ɵɵtext(22, "LLC");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "option");
    i0.ɵɵtext(24, "Sole Proprietorship");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(25, "div", 179)(26, "label", 174);
    i0.ɵɵtext(27, "Merchant Category Code (MCC)");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(28, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 179)(30, "label", 174);
    i0.ɵɵtext(31, "Monthly Volume");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(32, "input", 177);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "div", 179)(34, "label", 174);
    i0.ɵɵtext(35, "Average Ticket");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(36, "input", 177);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "div", 116)(38, "label", 198);
    i0.ɵɵtext(39, "Website URL");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(40, "input", 199);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "div", 116)(42, "label", 198);
    i0.ɵɵtext(43, "Support Email");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(44, "input", 200);
    i0.ɵɵelementEnd()();
} }
function AuthShellComponent_div_84_div_26_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 179)(2, "label", 174);
    i0.ɵɵtext(3, "Registration Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 179)(6, "label", 174);
    i0.ɵɵtext(7, "Tax ID / EIN");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(8, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 179)(10, "label", 174);
    i0.ɵɵtext(11, "Date of Incorporation");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(12, "input", 201);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 116)(14, "label", 174);
    i0.ɵɵtext(15, "UBO Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(16, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 197)(18, "label", 174);
    i0.ɵɵtext(19, "Ownership %");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(20, "input", 177);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(21, "div", 197)(22, "label", 174);
    i0.ɵɵtext(23, "Verification Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "select", 176)(25, "option");
    i0.ɵɵtext(26, "Not started");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "option");
    i0.ɵɵtext(28, "Submitted");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "option");
    i0.ɵɵtext(30, "Verified");
    i0.ɵɵelementEnd()()()();
} }
function AuthShellComponent_div_84_div_27_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 179)(2, "label", 174);
    i0.ɵɵtext(3, "Bank Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(4, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 179)(6, "label", 174);
    i0.ɵɵtext(7, "Account Holder");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(8, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 179)(10, "label", 174);
    i0.ɵɵtext(11, "Account Number");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(12, "input", 202);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(13, "div", 179)(14, "label", 174);
    i0.ɵɵtext(15, "Routing / Sort Code");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(16, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 179)(18, "label", 174);
    i0.ɵɵtext(19, "Settlement Currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "select", 176)(21, "option");
    i0.ɵɵtext(22, "USD");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "option");
    i0.ɵɵtext(24, "EUR");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "option");
    i0.ɵɵtext(26, "GBP");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "div", 179)(28, "label", 174);
    i0.ɵɵtext(29, "Payout Schedule");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(30, "select", 176)(31, "option");
    i0.ɵɵtext(32, "T+1");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "option");
    i0.ɵɵtext(34, "T+2");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "option");
    i0.ɵɵtext(36, "Weekly");
    i0.ɵɵelementEnd()()()();
} }
function AuthShellComponent_div_84_div_28_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 117)(1, "div", 116)(2, "label", 174);
    i0.ɵɵtext(3, "Risk Rating");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 180)(5, "span", 181);
    i0.ɵɵtext(6, "Low");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 182);
    i0.ɵɵtext(8, "Medium");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "span", 183);
    i0.ɵɵtext(10, "High");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(11, "label", 174);
    i0.ɵɵtext(12, "Chargeback Threshold");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(13, "input", 184);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div", 116)(15, "label", 174);
    i0.ɵɵtext(16, "Enabled Controls");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(17, "div", 203);
    i0.ɵɵelement(18, "input", 204);
    i0.ɵɵelementStart(19, "label", 205);
    i0.ɵɵtext(20, "Velocity limits");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "div", 203);
    i0.ɵɵelement(22, "input", 206);
    i0.ɵɵelementStart(23, "label", 207);
    i0.ɵɵtext(24, "Geo restrictions");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(25, "div", 203);
    i0.ɵɵelement(26, "input", 208);
    i0.ɵɵelementStart(27, "label", 209);
    i0.ɵɵtext(28, "Force 3DS for high-risk cards");
    i0.ɵɵelementEnd()()()();
} }
function AuthShellComponent_div_84_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 190)(1, "div", 112)(2, "div", 191)(3, "div", 192)(4, "div", 115);
    i0.ɵɵtext(5, "Merchant Onboarding Workspace");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div", 94)(7, "div", 128);
    i0.ɵɵtext(8, " Suggested flow: Business Profile \u2192 Legal Entity & UBO \u2192 KYC/KYB Documents \u2192 Bank Settlement \u2192 Processing Configuration \u2192 Risk & Compliance Approval. ");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "div", 129);
    i0.ɵɵtemplate(10, AuthShellComponent_div_84_div_10_Template, 9, 5, "div", 193);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(11, "ul", 131)(12, "li", 12)(13, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_84_Template_button_click_13_listener() { i0.ɵɵrestoreView(_r15); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("profile")); });
    i0.ɵɵtext(14, "Business Profile");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "li", 12)(16, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_84_Template_button_click_16_listener() { i0.ɵɵrestoreView(_r15); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("legal")); });
    i0.ɵɵtext(17, "Legal");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "li", 12)(19, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_84_Template_button_click_19_listener() { i0.ɵɵrestoreView(_r15); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("banking")); });
    i0.ɵɵtext(20, "Banking");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "li", 12)(22, "button", 132);
    i0.ɵɵlistener("click", function AuthShellComponent_div_84_Template_button_click_22_listener() { i0.ɵɵrestoreView(_r15); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.selectTab("risk")); });
    i0.ɵɵtext(23, "Risk");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(24, "div", 133);
    i0.ɵɵtemplate(25, AuthShellComponent_div_84_div_25_Template, 45, 0, "div", 134)(26, AuthShellComponent_div_84_div_26_Template, 31, 0, "div", 134)(27, AuthShellComponent_div_84_div_27_Template, 37, 0, "div", 134)(28, AuthShellComponent_div_84_div_28_Template, 29, 0, "div", 134);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "div", 194)(30, "button", 195);
    i0.ɵɵtext(31, "Save Draft");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "button", 81);
    i0.ɵɵtext(33, "Submit for Review");
    i0.ɵɵelementEnd()()()()()()();
} if (rf & 2) {
    const ctx_r5 = i0.ɵɵnextContext();
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("ngForOf", ctx_r5.onboardingSteps);
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "profile");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "legal");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "banking");
    i0.ɵɵadvance(3);
    i0.ɵɵclassProp("active", ctx_r5.activeTab === "risk");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngSwitch", ctx_r5.activeTab);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "profile");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "legal");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "banking");
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngSwitchCase", "risk");
} }
function AuthShellComponent_div_85_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 190)(1, "div", 192)(2, "div", 115);
    i0.ɵɵtext(3, "Verification Queue");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 94)(5, "div", 210)(6, "div", 211);
    i0.ɵɵtext(7, "58% complete");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(8, "ul", 212)(9, "li", 213);
    i0.ɵɵtext(10, "Certificate of Incorporation ");
    i0.ɵɵelementStart(11, "span", 214);
    i0.ɵɵtext(12, "Received");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "li", 213);
    i0.ɵɵtext(14, "UBO Identity Document ");
    i0.ɵɵelementStart(15, "span", 215);
    i0.ɵɵtext(16, "Pending Review");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(17, "li", 213);
    i0.ɵɵtext(18, "Proof of Business Address ");
    i0.ɵɵelementStart(19, "span", 215);
    i0.ɵɵtext(20, "Pending Upload");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(21, "li", 213);
    i0.ɵɵtext(22, "Bank Account Verification Letter ");
    i0.ɵɵelementStart(23, "span", 216);
    i0.ɵɵtext(24, "Not Started");
    i0.ɵɵelementEnd()()()()()();
} }
function AuthShellComponent_div_86_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 190)(1, "div", 192)(2, "div", 115);
    i0.ɵɵtext(3, "Settlement Setup");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "div", 94)(5, "div", 117)(6, "div", 179)(7, "label", 174);
    i0.ɵɵtext(8, "Settlement Currency");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(9, "select", 176)(10, "option");
    i0.ɵɵtext(11, "USD");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(12, "option");
    i0.ɵɵtext(13, "EUR");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "option");
    i0.ɵɵtext(15, "GBP");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(16, "div", 179)(17, "label", 174);
    i0.ɵɵtext(18, "Payout Schedule");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "select", 176)(20, "option");
    i0.ɵɵtext(21, "T+1");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "option");
    i0.ɵɵtext(23, "T+2");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(24, "option");
    i0.ɵɵtext(25, "Weekly");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(26, "div", 179)(27, "label", 174);
    i0.ɵɵtext(28, "Reserve Policy");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "select", 176)(30, "option");
    i0.ɵɵtext(31, "Standard");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(32, "option");
    i0.ɵɵtext(33, "Rolling Reserve");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(34, "option");
    i0.ɵɵtext(35, "Custom");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(36, "div", 116)(37, "label", 174);
    i0.ɵɵtext(38, "Bank Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(39, "input", 175);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "div", 116)(41, "label", 174);
    i0.ɵɵtext(42, "Account Holder");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(43, "input", 175);
    i0.ɵɵelementEnd()()()()();
} }
function AuthShellComponent_div_87_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 217);
    i0.ɵɵelement(1, "app-merchant-catalog");
    i0.ɵɵelementEnd();
} }
function AuthShellComponent_div_95_Template(rf, ctx) { if (rf & 1) {
    const _r17 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 218);
    i0.ɵɵlistener("click", function AuthShellComponent_div_95_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r17); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.closeChat()); });
    i0.ɵɵelementEnd();
} }
function AuthShellComponent_div_96_Template(rf, ctx) { if (rf & 1) {
    const _r18 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 219);
    i0.ɵɵlistener("click", function AuthShellComponent_div_96_Template_div_click_0_listener() { i0.ɵɵrestoreView(_r18); const ctx_r5 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r5.closeProfileMenu()); });
    i0.ɵɵelementEnd();
} }
function AuthShellComponent_div_111_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 220)(1, "div", 221);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 222);
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "div", 223);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const item_r19 = ctx.$implicit;
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r19.title);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r19.detail);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(item_r19.time);
} }
export class AuthShellComponent {
    authService;
    authState;
    activeSection = 'dashboard';
    activeTab = 'profile';
    activeTrafficPeriod = 'Month';
    complianceExpanded = true;
    riskExpanded = true;
    sidebarCollapsed = false;
    chatOpen = false;
    profileMenuOpen = false;
    session$;
    constructor(authService, authState) {
        this.authService = authService;
        this.authState = authState;
        this.session$ = this.authState.session$;
    }
    topMetrics = [
        { title: 'Users', value: '26K', change: '-12.4%', changeClass: 'text-danger', toneClass: 'metric-card-primary', progress: 72 },
        { title: 'Income', value: '$6.200', change: '40.9%', changeClass: 'text-success', toneClass: 'metric-card-info', progress: 58 },
        { title: 'Conversion Rate', value: '2.49%', change: '84.7%', changeClass: 'text-success', toneClass: 'metric-card-warning', progress: 81 },
        { title: 'Sessions', value: '44K', change: '-23.6%', changeClass: 'text-danger', toneClass: 'metric-card-danger', progress: 43 }
    ];
    trafficSummary = [
        { label: 'Visits', value: '29.703 Users', ratio: '40%', color: 'success', progress: 40 },
        { label: 'Unique', value: '24.093 Users', ratio: '20%', color: 'info', progress: 20 },
        { label: 'Page Views', value: '78.706 Views', ratio: '60%', color: 'warning', progress: 60 },
        { label: 'New Users', value: '22.123 Users', ratio: '80%', color: 'danger', progress: 80 },
        { label: 'Bounce Rate', value: '40.15%', ratio: 'Average', color: 'secondary', progress: 40 }
    ];
    weeklyTraffic = [
        { day: 'Monday', first: 34, second: 78 },
        { day: 'Tuesday', first: 56, second: 94 },
        { day: 'Wednesday', first: 12, second: 67 },
        { day: 'Thursday', first: 43, second: 91 },
        { day: 'Friday', first: 22, second: 73 },
        { day: 'Saturday', first: 53, second: 82 },
        { day: 'Sunday', first: 9, second: 69 }
    ];
    acquisitionSources = [
        { label: 'Male', value: '43%', progress: 43, colorClass: 'bg-warning' },
        { label: 'Female', value: '37%', progress: 37, colorClass: 'bg-warning' },
        { label: 'Organic Search', value: '191,235', detail: '(56%)', progress: 56, colorClass: 'bg-success' },
        { label: 'Facebook', value: '51,223', detail: '(15%)', progress: 15, colorClass: 'bg-success' },
        { label: 'Twitter', value: '37,564', detail: '(11%)', progress: 11, colorClass: 'bg-success' },
        { label: 'LinkedIn', value: '27,319', detail: '(8%)', progress: 8, colorClass: 'bg-success' }
    ];
    customers = [
        { initials: 'YA', name: 'Yiorgos Avraamu', state: 'New', registered: 'Jan 1, 2023', country: 'USA', usage: 50, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'Mastercard', activity: '10 sec ago', statusClass: 'bg-success' },
        { initials: 'AT', name: 'Avram Tarasios', state: 'Recurring', registered: 'Jan 1, 2023', country: 'Brazil', usage: 10, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'Visa', activity: '5 minutes ago', statusClass: 'bg-info' },
        { initials: 'QE', name: 'Quintin Ed', state: 'New', registered: 'Jan 1, 2023', country: 'India', usage: 74, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'Stripe', activity: '1 hour ago', statusClass: 'bg-warning' },
        { initials: 'EK', name: 'Eneas Kwadwo', state: 'New', registered: 'Jan 1, 2023', country: 'France', usage: 98, period: 'Jun 11, 2023 - Jul 10, 2023', payment: 'PayPal', activity: 'Last month', statusClass: 'bg-danger' }
    ];
    onboardingSteps = [
        { title: '1. Intake', description: 'Collect legal, business, and contact data.', state: 'Complete', badge: 'bg-success' },
        { title: '2. Verification', description: 'Review business registration and owner identity.', state: 'In progress', badge: 'bg-warning text-dark' },
        { title: '3. Risk Setup', description: 'Assign MCC, limits, and reserve policy.', state: 'Pending', badge: 'bg-light text-dark' },
        { title: '4. Go-live', description: 'Enable processing and monitor first transactions.', state: 'Pending', badge: 'bg-light text-dark' }
    ];
    supportTimeline = [
        { title: 'Verification queue updated', detail: '3 merchant files were approved in the last 15 minutes.', time: 'Just now' },
        { title: 'Banking checklist changed', detail: 'Settlement account proof is required before activation.', time: '12 min ago' },
        { title: 'Risk review assigned', detail: 'Reserve policy and MCC review were routed to Operations.', time: '42 min ago' }
    ];
    profileMenuPrimary = [
        { label: 'Updates', badge: '42', badgeClass: 'bg-info' },
        { label: 'Messages', badge: '42', badgeClass: 'bg-success' },
        { label: 'Tasks', badge: '42', badgeClass: 'bg-danger' },
        { label: 'Comments', badge: '42', badgeClass: 'bg-warning text-dark' }
    ];
    profileMenuSecondary = [
        'Profile',
        'Settings',
        'Payments',
        'Projects'
    ];
    profileMenuTertiary = [
        'Lock Account',
        'Logout'
    ];
    sectionLabels = {
        dashboard: 'Dashboard',
        onboarding: 'Merchant Onboarding',
        verification: 'Verification Queue',
        settlement: 'Settlement Setup',
        merchantCatalog: 'Merchant Catalog'
    };
    selectTab(tab) {
        this.activeTab = tab;
    }
    selectTrafficPeriod(period) {
        this.activeTrafficPeriod = period;
    }
    selectSection(section) {
        this.activeSection = section;
    }
    toggleSidebar() {
        this.sidebarCollapsed = !this.sidebarCollapsed;
    }
    toggleChat() {
        this.chatOpen = !this.chatOpen;
    }
    closeChat() {
        this.chatOpen = false;
    }
    toggleProfileMenu() {
        this.profileMenuOpen = !this.profileMenuOpen;
    }
    closeProfileMenu() {
        this.profileMenuOpen = false;
    }
    async handleProfileAction(item) {
        this.closeProfileMenu();
        if (item === 'Logout') {
            await this.authService.logout();
        }
    }
    static ɵfac = function AuthShellComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || AuthShellComponent)(i0.ɵɵdirectiveInject(i1.AuthService), i0.ɵɵdirectiveInject(i2.AuthStateService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: AuthShellComponent, selectors: [["app-auth-shell"]], decls: 125, vars: 28, consts: [[1, "app-layout"], ["id", "sidebar", 1, "sidebar", "sidebar-dark", "sidebar-fixed", "border-end", "app-sidebar"], [1, "sidebar-header", "border-bottom", "px-3", "py-3", "d-flex", "align-items-center"], [1, "sidebar-brand-wrap"], ["viewBox", "0 0 312 115", "aria-label", "BlitzPay Logo", "role", "img", 1, "sidebar-brand-logo"], ["href", "assets/coreui-logo.svg#full"], [1, "sidebar-brand-sub"], [1, "sidebar-brand-mark"], ["viewBox", "0 0 102 115", "aria-label", "BlitzPay Mark", "role", "img"], ["href", "assets/coreui-logo.svg#signet"], [1, "sidebar-nav"], [1, "nav-title"], [1, "nav-item"], ["href", "javascript:void(0)", 1, "nav-link", 3, "click"], ["aria-hidden", "true", 1, "nav-icon"], ["viewBox", "0 0 24 24", "width", "16", "height", "16"], ["fill", "currentColor", "d", "M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-10h8V3h-8v8z"], [1, "badge", "bg-info", "ms-auto"], [1, "nav-title", "mt-2"], ["fill", "currentColor", "d", "M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 10H4v-2h11v2zm3-4H4V8h14v2z"], [1, "badge", "bg-light", "text-dark", "ms-auto"], [1, "sidebar-footer", "border-top", "p-2", "d-flex", "justify-content-end"], ["type", "button", "aria-label", "Collapse sidebar", 1, "sidebar-fold-toggle", 3, "click"], ["viewBox", "0 0 24 24", "width", "18", "height", "18"], ["fill", "currentColor", "d", "M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"], [1, "wrapper", "d-flex", "flex-column", "min-vh-100", "app-main"], [1, "header", "header-sticky", "p-0", "shadow-sm", "topbar-fixed"], [1, "container-fluid", "px-4", "py-2", "d-flex", "justify-content-between", "align-items-center", "bg-white"], [1, "d-flex", "align-items-center", "gap-3"], ["type", "button", "aria-label", "Toggle sidebar", 1, "header-toggle", 3, "click"], ["fill", "currentColor", "d", "M4 6h16v2H4zm4 5h12v2H8zm-4 5h16v2H4z"], [1, "h5", "mb-0"], [1, "d-flex", "align-items-center", "gap-2", "header-right-tools"], ["type", "button", "aria-label", "Open notifications", 1, "icon-btn", "topbar-icon"], ["fill", "currentColor", "d", "M13 3a9 9 0 0 0-9 9v1.59l-1.7 1.7A1 1 0 0 0 3 17h20a1 1 0 0 0 .7-1.71L22 13.59V12a9 9 0 0 0-9-9zm0 18a3 3 0 0 0 2.83-2h-5.66A3 3 0 0 0 13 21z"], [1, "topbar-badge", "bg-danger"], ["type", "button", "aria-label", "Open list menu", 1, "icon-btn", "topbar-icon"], ["fill", "currentColor", "d", "M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"], ["type", "button", "aria-label", "Open chat", 1, "icon-btn", "topbar-icon", 3, "click"], ["fill", "currentColor", "d", "M4 4h16v12H7l-3 3V4zm2 2v8.17L6.17 14H18V6H6z"], [1, "topbar-badge", "bg-warning"], ["aria-label", "Settings", 1, "icon-btn", "topbar-icon"], ["fill", "currentColor", "d", "M19.14 12.94a7.95 7.95 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a8.3 8.3 0 00-1.63-.94L14.4 2.8a.5.5 0 00-.5-.4h-3.8a.5.5 0 00-.5.4l-.36 2.52c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.7 8.84a.5.5 0 00.12.64l2.03 1.58a7.95 7.95 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32a.5.5 0 00.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.52a.5.5 0 00.5.4h3.8a.5.5 0 00.5-.4l.36-2.52c.58-.23 1.12-.54 1.63-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15a3 3 0 110-6 3 3 0 010 6z"], [1, "header-profile"], ["class", "auth-user-name", 4, "ngIf"], ["type", "button", "aria-label", "Open user menu", 1, "profile-trigger", 3, "click"], ["src", "assets/avatar-coreui.jpg", "alt", "Mehdi Admin profile", 1, "profile-avatar"], [1, "profile-menu"], [1, "profile-menu-header"], ["class", "profile-item", "type", "button", 4, "ngFor", "ngForOf"], [1, "profile-divider"], ["class", "profile-item", "type", "button", 3, "click", 4, "ngFor", "ngForOf"], [1, "container-fluid", "px-4", "py-2", "bg-white", "border-top"], ["aria-label", "breadcrumb"], [1, "breadcrumb", "mb-0"], [1, "breadcrumb-item"], ["href", "javascript:void(0)"], ["aria-current", "page", 1, "breadcrumb-item", "active"], [1, "body", "flex-grow-1"], ["class", "container-fluid px-4", 4, "ngIf"], ["class", "container-fluid px-4 py-4", 4, "ngIf"], ["class", "container-fluid px-4 pt-2 pb-4", 4, "ngIf"], [1, "footer", "px-4", "py-3", "bg-white", "border-top", "d-flex", "justify-content-between", "align-items-center"], ["href", "https://coreui.io", "target", "_blank", "rel", "noreferrer"], [1, "text-body-secondary"], ["class", "chat-backdrop", 3, "click", 4, "ngIf"], ["class", "profile-backdrop", 3, "click", 4, "ngIf"], ["aria-label", "Support chat", 1, "chat-panel"], [1, "chat-panel-header"], [1, "chat-panel-title"], [1, "chat-panel-subtitle"], ["type", "button", "aria-label", "Close chat", 1, "icon-btn", 3, "click"], ["fill", "currentColor", "d", "M18.3 5.71L12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.29z"], [1, "chat-panel-body"], [1, "aside-section"], [1, "aside-section-title"], ["class", "aside-event", 4, "ngFor", "ngForOf"], [1, "chat-bubble", "chat-bubble-support"], [1, "chat-bubble", "chat-bubble-user"], [1, "chat-panel-footer"], ["type", "text", "placeholder", "Type a message...", 1, "form-control"], ["type", "button", 1, "btn", "btn-primary"], [1, "auth-user-name"], ["type", "button", 1, "profile-item"], ["aria-hidden", "true", 1, "profile-item-icon"], ["fill", "currentColor", "d", "M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm1 14h-2v-2h2zm0-4h-2V7h2z"], [1, "badge", "ms-auto"], ["fill", "currentColor", "d", "M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 11a3 3 0 1 1 3-3 3 3 0 0 1-3 3z"], ["type", "button", 1, "profile-item", 3, "click"], ["fill", "currentColor", "d", "M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z"], [1, "container-fluid", "px-4"], [1, "row", "g-4", "my-4"], ["class", "col-sm-6 col-xl-3", 4, "ngFor", "ngForOf"], [1, "card", "mb-4"], [1, "card-body"], [1, "row"], [1, "col-sm-5"], [1, "card-title", "mb-0"], [1, "small", "text-body-secondary"], [1, "col-sm-7", "d-none", "d-md-block"], [1, "d-flex", "justify-content-end", "align-items-center", "gap-2"], ["type", "button", "aria-label", "Download report", 1, "btn", "btn-primary", "btn-sm"], ["fill", "currentColor", "d", "M5 20h14v-2H5v2zM11 4h2v8h3l-4 4-4-4h3V4z"], ["role", "group", "aria-label", "Traffic period", 1, "btn-group", "btn-group-sm"], ["type", "button", 1, "btn", 3, "click"], [1, "traffic-chart", "mt-4"], ["class", "traffic-grid-line", 4, "ngFor", "ngForOf"], [1, "traffic-bars"], ["class", "traffic-bar", 3, "height", 4, "ngFor", "ngForOf"], [1, "card-footer"], [1, "row", "text-center", "mb-2", "g-4"], ["class", "col-6 col-xl", 4, "ngFor", "ngForOf"], [1, "row", "g-4"], [1, "col-xl-7"], [1, "card", "h-100"], [1, "card-header"], [1, "col-md-6"], [1, "row", "g-3"], [1, "col-6"], [1, "stat-border", "stat-border-info"], [1, "text-body-secondary", "small"], [1, "fs-5", "fw-semibold"], [1, "stat-border", "stat-border-danger"], ["class", "progress-group mb-4", 4, "ngFor", "ngForOf"], [1, "stat-border", "stat-border-warning"], [1, "stat-border", "stat-border-success"], ["class", "progress-group source-group", 4, "ngFor", "ngForOf"], [1, "col-xl-5"], ["role", "alert", 1, "alert", "alert-info"], [1, "row", "g-3", "mb-4"], ["class", "col-sm-6", 4, "ngFor", "ngForOf"], ["role", "tablist", 1, "nav", "nav-tabs", "onboarding-tabs"], [1, "nav-link", 3, "click"], [1, "pt-4", 3, "ngSwitch"], ["class", "row g-3", 4, "ngSwitchCase"], [1, "card", "my-4"], [1, "card-body", "p-0"], [1, "table-responsive"], [1, "table", "table-hover", "align-middle", "mb-0", "border-top"], [1, "table-light"], [1, "text-center"], [4, "ngFor", "ngForOf"], [1, "col-sm-6", "col-xl-3"], [1, "card", "text-white", "metric-card", "h-100"], [1, "card-body", "pb-2", "d-flex", "justify-content-between", "align-items-start"], [1, "fs-4", "fw-semibold"], ["type", "button", "aria-label", "Actions", 1, "metric-action"], ["fill", "currentColor", "d", "M12 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z"], [1, "metric-meta", "px-3", "pb-3"], [1, "text-white-50", "ms-1"], [1, "metric-progress"], [1, "metric-progress-bar"], [1, "traffic-grid-line"], [1, "traffic-bar"], [1, "col-6", "col-xl"], [1, "fw-semibold", "text-truncate"], [1, "progress", "progress-thin", "mt-2"], [1, "progress-bar"], [1, "progress-group", "mb-4"], [1, "progress-group-prepend"], [1, "progress-group-bars"], [1, "progress", "progress-thin", "mb-1"], [1, "progress-bar", "bg-info"], [1, "progress", "progress-thin"], [1, "progress-bar", "bg-danger"], [1, "progress-group", "source-group"], [1, "progress-group-header"], [1, "ms-auto", "fw-semibold"], [1, "col-sm-6"], [1, "card", "step-card", "h-100"], [1, "h6"], [1, "mb-2", "text-body-secondary"], [1, "badge"], [1, "col-md-12"], [1, "form-label", "required"], ["type", "text", 1, "form-control"], [1, "form-select"], ["type", "number", 1, "form-control"], [1, "col-md-8"], [1, "col-md-4"], [1, "d-flex", "gap-2", "mb-3"], [1, "badge", "bg-success", "risk-tag"], [1, "badge", "bg-warning", "text-dark", "risk-tag"], [1, "badge", "bg-danger", "risk-tag"], ["type", "range", "min", "0", "max", "3", "step", "0.1", "value", "1.2", 1, "form-range"], [1, "user-avatar"], [1, "d-flex", "justify-content-between"], [1, "progress-bar", "bg-success"], [1, "payment-pill"], [1, "fw-semibold"], [1, "container-fluid", "px-4", "py-4"], [1, "col-12"], [1, "card"], ["class", "col-md-3 col-sm-6", 4, "ngFor", "ngForOf"], [1, "d-flex", "justify-content-end", "gap-2", "mt-4"], ["type", "button", 1, "btn", "btn-light"], [1, "col-md-3", "col-sm-6"], [1, "col-md-3"], [1, "form-label"], ["type", "url", 1, "form-control"], ["type", "email", 1, "form-control"], ["type", "date", 1, "form-control"], ["type", "password", "value", "************", 1, "form-control"], [1, "form-check"], ["type", "checkbox", "checked", "", "id", "velocity", 1, "form-check-input"], ["for", "velocity", 1, "form-check-label"], ["type", "checkbox", "checked", "", "id", "geo", 1, "form-check-input"], ["for", "geo", 1, "form-check-label"], ["type", "checkbox", "id", "threeds", 1, "form-check-input"], ["for", "threeds", 1, "form-check-label"], ["aria-valuenow", "58", "aria-valuemin", "0", "aria-valuemax", "100", 1, "progress", "mb-4"], [1, "progress-bar", 2, "width", "58%"], [1, "list-group"], [1, "list-group-item", "d-flex", "justify-content-between", "align-items-center"], [1, "badge", "bg-success"], [1, "badge", "bg-warning", "text-dark"], [1, "badge", "bg-light", "text-dark"], [1, "container-fluid", "px-4", "pt-2", "pb-4"], [1, "chat-backdrop", 3, "click"], [1, "profile-backdrop", 3, "click"], [1, "aside-event"], [1, "aside-event-title"], [1, "aside-event-detail"], [1, "aside-event-time"]], template: function AuthShellComponent_Template(rf, ctx) { if (rf & 1) {
            i0.ɵɵelementStart(0, "div", 0)(1, "aside", 1)(2, "div", 2)(3, "div", 3);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(4, "svg", 4);
            i0.ɵɵelement(5, "use", 5);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(6, "div", 6);
            i0.ɵɵtext(7, "BlitzPay Admin Panel");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(8, "div", 7);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(9, "svg", 8);
            i0.ɵɵelement(10, "use", 9);
            i0.ɵɵelementEnd()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(11, "ul", 10)(12, "li", 11);
            i0.ɵɵtext(13, "Dashboard");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "li", 12)(15, "a", 13);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_a_click_15_listener() { return ctx.selectSection("dashboard"); });
            i0.ɵɵelementStart(16, "span", 14);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(17, "svg", 15);
            i0.ɵɵelement(18, "path", 16);
            i0.ɵɵelementEnd()();
            i0.ɵɵtext(19, " Dashboard ");
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(20, "span", 17);
            i0.ɵɵtext(21, "NEW");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(22, "li", 18);
            i0.ɵɵtext(23, "Operations");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(24, "li", 12)(25, "a", 13);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_a_click_25_listener() { return ctx.selectSection("merchantCatalog"); });
            i0.ɵɵelementStart(26, "span", 14);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(27, "svg", 15);
            i0.ɵɵelement(28, "path", 19);
            i0.ɵɵelementEnd()();
            i0.ɵɵtext(29, " Merchants ");
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(30, "span", 20);
            i0.ɵɵtext(31, "LIVE");
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(32, "div", 21)(33, "button", 22);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_button_click_33_listener() { return ctx.toggleSidebar(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(34, "svg", 23);
            i0.ɵɵelement(35, "path", 24);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(36, "div", 25)(37, "header", 26)(38, "div", 27)(39, "div", 28)(40, "button", 29);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_button_click_40_listener() { return ctx.toggleSidebar(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(41, "svg", 23);
            i0.ɵɵelement(42, "path", 30);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(43, "h1", 31);
            i0.ɵɵtext(44);
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(45, "div", 32)(46, "button", 33);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(47, "svg", 23);
            i0.ɵɵelement(48, "path", 34);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelement(49, "span", 35);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(50, "button", 36);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(51, "svg", 23);
            i0.ɵɵelement(52, "path", 37);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(53, "button", 38);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_button_click_53_listener() { return ctx.toggleChat(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(54, "svg", 23);
            i0.ɵɵelement(55, "path", 39);
            i0.ɵɵelementEnd();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelement(56, "span", 40);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(57, "button", 41);
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(58, "svg", 23);
            i0.ɵɵelement(59, "path", 42);
            i0.ɵɵelementEnd()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(60, "div", 43);
            i0.ɵɵtemplate(61, AuthShellComponent_span_61_Template, 2, 1, "span", 44);
            i0.ɵɵpipe(62, "async");
            i0.ɵɵelementStart(63, "button", 45);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_button_click_63_listener() { return ctx.toggleProfileMenu(); });
            i0.ɵɵelement(64, "img", 46);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(65, "div", 47)(66, "div", 48);
            i0.ɵɵtext(67, "Account");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(68, AuthShellComponent_button_68_Template, 8, 4, "button", 49);
            i0.ɵɵelementStart(69, "div", 48);
            i0.ɵɵtext(70, "Settings");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(71, AuthShellComponent_button_71_Template, 6, 1, "button", 49);
            i0.ɵɵelement(72, "div", 50);
            i0.ɵɵtemplate(73, AuthShellComponent_button_73_Template, 6, 1, "button", 51);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵelementStart(74, "div", 52)(75, "nav", 53)(76, "ol", 54)(77, "li", 55)(78, "a", 56);
            i0.ɵɵtext(79, "Home");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(80, "li", 57);
            i0.ɵɵtext(81);
            i0.ɵɵelementEnd()()()()();
            i0.ɵɵelementStart(82, "div", 58);
            i0.ɵɵtemplate(83, AuthShellComponent_div_83_Template, 116, 35, "div", 59)(84, AuthShellComponent_div_84_Template, 34, 14, "div", 60)(85, AuthShellComponent_div_85_Template, 25, 0, "div", 60)(86, AuthShellComponent_div_86_Template, 44, 0, "div", 60)(87, AuthShellComponent_div_87_Template, 2, 0, "div", 61);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(88, "footer", 62)(89, "div")(90, "a", 63);
            i0.ɵɵtext(91, "CoreUI");
            i0.ɵɵelementEnd();
            i0.ɵɵtext(92, " inspired admin shell for BlitzPay.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(93, "div", 64);
            i0.ɵɵtext(94, "Powered by CoreUI styling");
            i0.ɵɵelementEnd()()();
            i0.ɵɵtemplate(95, AuthShellComponent_div_95_Template, 1, 0, "div", 65)(96, AuthShellComponent_div_96_Template, 1, 0, "div", 66);
            i0.ɵɵelementStart(97, "aside", 67)(98, "div", 68)(99, "div")(100, "div", 69);
            i0.ɵɵtext(101, "Messages");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(102, "div", 70);
            i0.ɵɵtext(103, "CoreUI-style right aside");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(104, "button", 71);
            i0.ɵɵlistener("click", function AuthShellComponent_Template_button_click_104_listener() { return ctx.closeChat(); });
            i0.ɵɵnamespaceSVG();
            i0.ɵɵelementStart(105, "svg", 23);
            i0.ɵɵelement(106, "path", 72);
            i0.ɵɵelementEnd()()();
            i0.ɵɵnamespaceHTML();
            i0.ɵɵelementStart(107, "div", 73)(108, "div", 74)(109, "div", 75);
            i0.ɵɵtext(110, "Activity");
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(111, AuthShellComponent_div_111_Template, 7, 3, "div", 76);
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(112, "div", 74)(113, "div", 75);
            i0.ɵɵtext(114, "Quick Chat");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(115, "div", 77);
            i0.ɵɵtext(116, "Merchant onboarding support is online.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(117, "div", 78);
            i0.ɵɵtext(118, "Review settlement configuration for the new merchant.");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(119, "div", 77);
            i0.ɵɵtext(120, "Banking requirements are complete. Risk review is still pending approval.");
            i0.ɵɵelementEnd()()();
            i0.ɵɵelementStart(121, "div", 79);
            i0.ɵɵelement(122, "input", 80);
            i0.ɵɵelementStart(123, "button", 81);
            i0.ɵɵtext(124, "Send");
            i0.ɵɵelementEnd()()()();
        } if (rf & 2) {
            i0.ɵɵadvance();
            i0.ɵɵclassProp("sidebar-narrow", ctx.sidebarCollapsed);
            i0.ɵɵadvance(14);
            i0.ɵɵclassProp("active", ctx.activeSection === "dashboard");
            i0.ɵɵadvance(10);
            i0.ɵɵclassProp("active", ctx.activeSection === "merchantCatalog");
            i0.ɵɵadvance(11);
            i0.ɵɵclassProp("app-main-collapsed", ctx.sidebarCollapsed);
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.sectionLabels[ctx.activeSection]);
            i0.ɵɵadvance(17);
            i0.ɵɵproperty("ngIf", i0.ɵɵpipeBind1(62, 26, ctx.session$));
            i0.ɵɵadvance(4);
            i0.ɵɵclassProp("profile-menu-open", ctx.profileMenuOpen);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngForOf", ctx.profileMenuPrimary);
            i0.ɵɵadvance(3);
            i0.ɵɵproperty("ngForOf", ctx.profileMenuSecondary);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngForOf", ctx.profileMenuTertiary);
            i0.ɵɵadvance(8);
            i0.ɵɵtextInterpolate(ctx.sectionLabels[ctx.activeSection]);
            i0.ɵɵadvance(2);
            i0.ɵɵproperty("ngIf", ctx.activeSection === "dashboard");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.activeSection === "onboarding");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.activeSection === "verification");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.activeSection === "settlement");
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.activeSection === "merchantCatalog");
            i0.ɵɵadvance(8);
            i0.ɵɵproperty("ngIf", ctx.chatOpen);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.profileMenuOpen);
            i0.ɵɵadvance();
            i0.ɵɵclassProp("chat-panel-open", ctx.chatOpen);
            i0.ɵɵadvance(14);
            i0.ɵɵproperty("ngForOf", ctx.supportTimeline);
        } }, dependencies: [CommonModule, i3.NgForOf, i3.NgIf, i3.NgSwitch, i3.NgSwitchCase, MerchantCatalogComponent, i3.AsyncPipe], styles: [".auth-user-name[_ngcontent-%COMP%] {\n  font-size: 0.875rem;\n  color: var(--cui-secondary-color, #6b7280);\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(AuthShellComponent, [{
        type: Component,
        args: [{ selector: 'app-auth-shell', standalone: true, imports: [CommonModule, MerchantCatalogComponent], template: "<div class=\"app-layout\">\n  <aside class=\"sidebar sidebar-dark sidebar-fixed border-end app-sidebar\" id=\"sidebar\" [class.sidebar-narrow]=\"sidebarCollapsed\">\n    <div class=\"sidebar-header border-bottom px-3 py-3 d-flex align-items-center\">\n      <div class=\"sidebar-brand-wrap\">\n        <svg class=\"sidebar-brand-logo\" viewBox=\"0 0 312 115\" aria-label=\"BlitzPay Logo\" role=\"img\">\n          <use href=\"assets/coreui-logo.svg#full\"></use>\n        </svg>\n        <div class=\"sidebar-brand-sub\">BlitzPay Admin Panel</div>\n      </div>\n      <div class=\"sidebar-brand-mark\">\n        <svg viewBox=\"0 0 102 115\" aria-label=\"BlitzPay Mark\" role=\"img\">\n          <use href=\"assets/coreui-logo.svg#signet\"></use>\n        </svg>\n      </div>\n    </div>\n\n    <ul class=\"sidebar-nav\">\n      <li class=\"nav-title\">Dashboard</li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [class.active]=\"activeSection === 'dashboard'\" href=\"javascript:void(0)\" (click)=\"selectSection('dashboard')\">\n          <span class=\"nav-icon\" aria-hidden=\"true\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M3 13h8V3H3v10zm10 8h8V11h-8v10zM3 21h8v-6H3v6zm10-10h8V3h-8v8z\"/></svg>\n          </span>\n          Dashboard\n          <span class=\"badge bg-info ms-auto\">NEW</span>\n        </a>\n      </li>\n\n      <li class=\"nav-title mt-2\">Operations</li>\n      <li class=\"nav-item\">\n        <a class=\"nav-link\" [class.active]=\"activeSection === 'merchantCatalog'\" href=\"javascript:void(0)\" (click)=\"selectSection('merchantCatalog')\">\n          <span class=\"nav-icon\" aria-hidden=\"true\">\n            <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm-5 10H4v-2h11v2zm3-4H4V8h14v2z\"/></svg>\n          </span>\n          Merchants\n          <span class=\"badge bg-light text-dark ms-auto\">LIVE</span>\n        </a>\n      </li>\n    </ul>\n\n    <div class=\"sidebar-footer border-top p-2 d-flex justify-content-end\">\n      <button class=\"sidebar-fold-toggle\" type=\"button\" aria-label=\"Collapse sidebar\" (click)=\"toggleSidebar()\">\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/></svg>\n      </button>\n    </div>\n  </aside>\n\n  <div class=\"wrapper d-flex flex-column min-vh-100 app-main\" [class.app-main-collapsed]=\"sidebarCollapsed\">\n    <header class=\"header header-sticky p-0 shadow-sm topbar-fixed\">\n      <div class=\"container-fluid px-4 py-2 d-flex justify-content-between align-items-center bg-white\">\n        <div class=\"d-flex align-items-center gap-3\">\n          <button class=\"header-toggle\" type=\"button\" aria-label=\"Toggle sidebar\" (click)=\"toggleSidebar()\">\n            <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M4 6h16v2H4zm4 5h12v2H8zm-4 5h16v2H4z\"/></svg>\n          </button>\n          <h1 class=\"h5 mb-0\">{{ sectionLabels[activeSection] }}</h1>\n        </div>\n\n        <div class=\"d-flex align-items-center gap-2 header-right-tools\">\n          <button class=\"icon-btn topbar-icon\" type=\"button\" aria-label=\"Open notifications\">\n            <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M13 3a9 9 0 0 0-9 9v1.59l-1.7 1.7A1 1 0 0 0 3 17h20a1 1 0 0 0 .7-1.71L22 13.59V12a9 9 0 0 0-9-9zm0 18a3 3 0 0 0 2.83-2h-5.66A3 3 0 0 0 13 21z\"/></svg>\n            <span class=\"topbar-badge bg-danger\"></span>\n          </button>\n          <button class=\"icon-btn topbar-icon\" type=\"button\" aria-label=\"Open list menu\">\n            <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z\"/></svg>\n          </button>\n          <button class=\"icon-btn topbar-icon\" type=\"button\" aria-label=\"Open chat\" (click)=\"toggleChat()\">\n            <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M4 4h16v12H7l-3 3V4zm2 2v8.17L6.17 14H18V6H6z\"/></svg>\n            <span class=\"topbar-badge bg-warning\"></span>\n          </button>\n          <button class=\"icon-btn topbar-icon\" aria-label=\"Settings\">\n            <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M19.14 12.94a7.95 7.95 0 000-1.88l2.03-1.58a.5.5 0 00.12-.64l-1.92-3.32a.5.5 0 00-.6-.22l-2.39.96a8.3 8.3 0 00-1.63-.94L14.4 2.8a.5.5 0 00-.5-.4h-3.8a.5.5 0 00-.5.4l-.36 2.52c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 00-.6.22L2.7 8.84a.5.5 0 00.12.64l2.03 1.58a7.95 7.95 0 000 1.88l-2.03 1.58a.5.5 0 00-.12.64l1.92 3.32a.5.5 0 00.6.22l2.39-.96c.51.4 1.05.71 1.63.94l.36 2.52a.5.5 0 00.5.4h3.8a.5.5 0 00.5-.4l.36-2.52c.58-.23 1.12-.54 1.63-.94l2.39.96a.5.5 0 00.6-.22l1.92-3.32a.5.5 0 00-.12-.64l-2.03-1.58zM12 15a3 3 0 110-6 3 3 0 010 6z\"/></svg>\n          </button>\n          <div class=\"header-profile\">\n            <span class=\"auth-user-name\" *ngIf=\"session$ | async as session\">{{ session.displayName || session.email || 'Authenticated User' }}</span>\n            <button class=\"profile-trigger\" type=\"button\" aria-label=\"Open user menu\" (click)=\"toggleProfileMenu()\">\n              <img class=\"profile-avatar\" src=\"assets/avatar-coreui.jpg\" alt=\"Mehdi Admin profile\" />\n            </button>\n            <div class=\"profile-menu\" [class.profile-menu-open]=\"profileMenuOpen\">\n              <div class=\"profile-menu-header\">Account</div>\n              <button class=\"profile-item\" type=\"button\" *ngFor=\"let item of profileMenuPrimary\">\n                <span class=\"profile-item-icon\" aria-hidden=\"true\">\n                  <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M12 3a9 9 0 1 0 9 9 9 9 0 0 0-9-9zm1 14h-2v-2h2zm0-4h-2V7h2z\"/></svg>\n                </span>\n                <span>{{ item.label }}</span>\n                <span class=\"badge ms-auto\" [class]=\"item.badgeClass\">{{ item.badge }}</span>\n              </button>\n              <div class=\"profile-menu-header\">Settings</div>\n              <button class=\"profile-item\" type=\"button\" *ngFor=\"let item of profileMenuSecondary\">\n                <span class=\"profile-item-icon\" aria-hidden=\"true\">\n                  <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M12 4a8 8 0 1 0 8 8 8 8 0 0 0-8-8zm0 11a3 3 0 1 1 3-3 3 3 0 0 1-3 3z\"/></svg>\n                </span>\n                <span>{{ item }}</span>\n              </button>\n              <div class=\"profile-divider\"></div>\n              <button class=\"profile-item\" type=\"button\" *ngFor=\"let item of profileMenuTertiary\" (click)=\"handleProfileAction(item)\">\n                <span class=\"profile-item-icon\" aria-hidden=\"true\">\n                  <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14h-2v-2h2zm0-4h-2V7h2z\"/></svg>\n                </span>\n                <span>{{ item }}</span>\n              </button>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class=\"container-fluid px-4 py-2 bg-white border-top\">\n        <nav aria-label=\"breadcrumb\">\n          <ol class=\"breadcrumb mb-0\">\n            <li class=\"breadcrumb-item\"><a href=\"javascript:void(0)\">Home</a></li>\n            <li class=\"breadcrumb-item active\" aria-current=\"page\">{{ sectionLabels[activeSection] }}</li>\n          </ol>\n        </nav>\n      </div>\n    </header>\n\n    <div class=\"body flex-grow-1\">\n      <div class=\"container-fluid px-4\" *ngIf=\"activeSection === 'dashboard'\">\n        <div class=\"row g-4 my-4\">\n          <div class=\"col-sm-6 col-xl-3\" *ngFor=\"let metric of topMetrics\">\n            <div class=\"card text-white metric-card h-100\" [class]=\"metric.toneClass\">\n              <div class=\"card-body pb-2 d-flex justify-content-between align-items-start\">\n                <div>\n                  <div class=\"fs-4 fw-semibold\">{{ metric.value }}</div>\n                  <div>{{ metric.title }}</div>\n                </div>\n                <button class=\"metric-action\" type=\"button\" aria-label=\"Actions\">\n                  <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M12 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4zm0 7a2 2 0 110-4 2 2 0 010 4z\"/></svg>\n                </button>\n              </div>\n              <div class=\"metric-meta px-3 pb-3\">\n                <span [class]=\"metric.changeClass\">{{ metric.change }}</span>\n                <span class=\"text-white-50 ms-1\">since last week</span>\n              </div>\n              <div class=\"metric-progress\">\n                <div class=\"metric-progress-bar\" [style.width.%]=\"metric.progress\"></div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"card mb-4\">\n          <div class=\"card-body\">\n            <div class=\"row\">\n              <div class=\"col-sm-5\">\n                <h4 class=\"card-title mb-0\">Traffic</h4>\n                <div class=\"small text-body-secondary\">January - December 2023</div>\n              </div>\n              <div class=\"col-sm-7 d-none d-md-block\">\n                <div class=\"d-flex justify-content-end align-items-center gap-2\">\n                  <button class=\"btn btn-primary btn-sm\" type=\"button\" aria-label=\"Download report\">\n                    <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M5 20h14v-2H5v2zM11 4h2v8h3l-4 4-4-4h3V4z\"/></svg>\n                  </button>\n                  <div class=\"btn-group btn-group-sm\" role=\"group\" aria-label=\"Traffic period\">\n                    <button class=\"btn\" type=\"button\" [class.btn-outline-secondary]=\"activeTrafficPeriod !== 'Day'\" [class.btn-secondary]=\"activeTrafficPeriod === 'Day'\" (click)=\"selectTrafficPeriod('Day')\">Day</button>\n                    <button class=\"btn\" type=\"button\" [class.btn-outline-secondary]=\"activeTrafficPeriod !== 'Month'\" [class.btn-secondary]=\"activeTrafficPeriod === 'Month'\" (click)=\"selectTrafficPeriod('Month')\">Month</button>\n                    <button class=\"btn\" type=\"button\" [class.btn-outline-secondary]=\"activeTrafficPeriod !== 'Year'\" [class.btn-secondary]=\"activeTrafficPeriod === 'Year'\" (click)=\"selectTrafficPeriod('Year')\">Year</button>\n                  </div>\n                </div>\n              </div>\n            </div>\n\n            <div class=\"traffic-chart mt-4\">\n              <div class=\"traffic-grid-line\" *ngFor=\"let _ of [0,1,2,3,4]\"></div>\n              <div class=\"traffic-bars\">\n                <span *ngFor=\"let value of [40,52,48,66,74,58,82,69,73,61,54,88]\" class=\"traffic-bar\" [style.height.%]=\"value\"></span>\n              </div>\n            </div>\n          </div>\n          <div class=\"card-footer\">\n            <div class=\"row text-center mb-2 g-4\">\n              <div class=\"col-6 col-xl\" *ngFor=\"let item of trafficSummary\">\n                <div class=\"text-body-secondary\">{{ item.label }}</div>\n                <div class=\"fw-semibold text-truncate\">{{ item.value }} <span class=\"text-body-secondary\">{{ item.ratio }}</span></div>\n                <div class=\"progress progress-thin mt-2\">\n                  <div class=\"progress-bar\" [class]=\"'bg-' + item.color\" [style.width.%]=\"item.progress\"></div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"row g-4\">\n          <div class=\"col-xl-7\">\n            <div class=\"card h-100\">\n              <div class=\"card-header\">Traffic &amp; Sales</div>\n              <div class=\"card-body\">\n                <div class=\"row\">\n                  <div class=\"col-md-6\">\n                    <div class=\"row g-3\">\n                      <div class=\"col-6\">\n                        <div class=\"stat-border stat-border-info\">\n                          <div class=\"text-body-secondary small\">New Clients</div>\n                          <div class=\"fs-5 fw-semibold\">9,123</div>\n                        </div>\n                      </div>\n                      <div class=\"col-6\">\n                        <div class=\"stat-border stat-border-danger\">\n                          <div class=\"text-body-secondary small\">Recurring Clients</div>\n                          <div class=\"fs-5 fw-semibold\">22,643</div>\n                        </div>\n                      </div>\n                    </div>\n                    <hr />\n                    <div class=\"progress-group mb-4\" *ngFor=\"let day of weeklyTraffic\">\n                      <div class=\"progress-group-prepend\">\n                        <span class=\"text-body-secondary small\">{{ day.day }}</span>\n                      </div>\n                      <div class=\"progress-group-bars\">\n                        <div class=\"progress progress-thin mb-1\"><div class=\"progress-bar bg-info\" [style.width.%]=\"day.first\"></div></div>\n                        <div class=\"progress progress-thin\"><div class=\"progress-bar bg-danger\" [style.width.%]=\"day.second\"></div></div>\n                      </div>\n                    </div>\n                  </div>\n                  <div class=\"col-md-6\">\n                    <div class=\"row g-3\">\n                      <div class=\"col-6\">\n                        <div class=\"stat-border stat-border-warning\">\n                          <div class=\"text-body-secondary small\">Page views</div>\n                          <div class=\"fs-5 fw-semibold\">78,623</div>\n                        </div>\n                      </div>\n                      <div class=\"col-6\">\n                        <div class=\"stat-border stat-border-success\">\n                          <div class=\"text-body-secondary small\">Organic</div>\n                          <div class=\"fs-5 fw-semibold\">49,123</div>\n                        </div>\n                      </div>\n                    </div>\n                    <hr />\n                    <div class=\"progress-group source-group\" *ngFor=\"let source of acquisitionSources\">\n                      <div class=\"progress-group-header\">\n                        <span>{{ source.label }}</span>\n                        <span class=\"ms-auto fw-semibold\">\n                          {{ source.value }} <span class=\"text-body-secondary small\">{{ source.detail }}</span>\n                        </span>\n                      </div>\n                      <div class=\"progress-group-bars\">\n                        <div class=\"progress progress-thin\">\n                          <div class=\"progress-bar\" [class]=\"source.colorClass\" [style.width.%]=\"source.progress\"></div>\n                        </div>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n\n          <div class=\"col-xl-5\">\n            <div class=\"card h-100\">\n              <div class=\"card-header\">Merchant Onboarding Workspace</div>\n              <div class=\"card-body\">\n                <div class=\"alert alert-info\" role=\"alert\">\n                  Suggested flow: Business Profile \u2192 Legal Entity &amp; UBO \u2192 KYC/KYB Documents \u2192 Bank Settlement \u2192 Processing Configuration \u2192 Risk &amp; Compliance Approval.\n                </div>\n\n                <div class=\"row g-3 mb-4\">\n                  <div class=\"col-sm-6\" *ngFor=\"let step of onboardingSteps\">\n                    <div class=\"card step-card h-100\">\n                      <div class=\"card-body\">\n                        <h2 class=\"h6\">{{ step.title }}</h2>\n                        <p class=\"mb-2 text-body-secondary\">{{ step.description }}</p>\n                        <span class=\"badge\" [class]=\"step.badge\">{{ step.state }}</span>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n\n                <ul class=\"nav nav-tabs onboarding-tabs\" role=\"tablist\">\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'profile'\" (click)=\"selectTab('profile')\">Business Profile</button></li>\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'legal'\" (click)=\"selectTab('legal')\">Legal</button></li>\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'banking'\" (click)=\"selectTab('banking')\">Banking</button></li>\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'risk'\" (click)=\"selectTab('risk')\">Risk</button></li>\n                </ul>\n\n                <div class=\"pt-4\" [ngSwitch]=\"activeTab\">\n                  <div *ngSwitchCase=\"'profile'\" class=\"row g-3\">\n                    <div class=\"col-md-12\"><label class=\"form-label required\">Legal Business Name</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Country</label><select class=\"form-select\"><option>United States</option><option>United Kingdom</option><option>Canada</option></select></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Business Type</label><select class=\"form-select\"><option>Corporation</option><option>LLC</option><option>Sole Proprietorship</option></select></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Monthly Volume</label><input class=\"form-control\" type=\"number\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Average Ticket</label><input class=\"form-control\" type=\"number\" /></div>\n                  </div>\n\n                  <div *ngSwitchCase=\"'legal'\" class=\"row g-3\">\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Registration Number</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Tax ID / EIN</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-8\"><label class=\"form-label required\">UBO Name</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Ownership %</label><input class=\"form-control\" type=\"number\" /></div>\n                  </div>\n\n                  <div *ngSwitchCase=\"'banking'\" class=\"row g-3\">\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Bank Name</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Account Holder</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Settlement Currency</label><select class=\"form-select\"><option>USD</option><option>EUR</option><option>GBP</option></select></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Payout Schedule</label><select class=\"form-select\"><option>T+1</option><option>T+2</option><option>Weekly</option></select></div>\n                  </div>\n\n                  <div *ngSwitchCase=\"'risk'\" class=\"row g-3\">\n                    <div class=\"col-md-12\">\n                      <label class=\"form-label required\">Risk Rating</label>\n                      <div class=\"d-flex gap-2 mb-3\">\n                        <span class=\"badge bg-success risk-tag\">Low</span>\n                        <span class=\"badge bg-warning text-dark risk-tag\">Medium</span>\n                        <span class=\"badge bg-danger risk-tag\">High</span>\n                      </div>\n                    </div>\n                    <div class=\"col-md-12\"><label class=\"form-label required\">Chargeback Threshold</label><input class=\"form-range\" type=\"range\" min=\"0\" max=\"3\" step=\"0.1\" value=\"1.2\" /></div>\n                  </div>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n\n        <div class=\"card my-4\">\n          <div class=\"card-body p-0\">\n            <div class=\"table-responsive\">\n              <table class=\"table table-hover align-middle mb-0 border-top\">\n                <thead class=\"table-light\">\n                  <tr>\n                    <th class=\"text-center\">User</th>\n                    <th>Customer</th>\n                    <th class=\"text-center\">Country</th>\n                    <th>Usage</th>\n                    <th class=\"text-center\">Payment</th>\n                    <th>Activity</th>\n                  </tr>\n                </thead>\n                <tbody>\n                  <tr *ngFor=\"let customer of customers\">\n                    <td class=\"text-center\">\n                      <div class=\"user-avatar\">{{ customer.initials }}</div>\n                    </td>\n                    <td>\n                      <div>{{ customer.name }}</div>\n                      <div class=\"small text-body-secondary\">{{ customer.state }} | Registered: {{ customer.registered }}</div>\n                    </td>\n                    <td class=\"text-center\">{{ customer.country }}</td>\n                    <td>\n                      <div class=\"d-flex justify-content-between\">\n                        <strong>{{ customer.usage }}%</strong>\n                        <small class=\"text-body-secondary\">{{ customer.period }}</small>\n                      </div>\n                      <div class=\"progress progress-thin mt-2\"><div class=\"progress-bar bg-success\" [style.width.%]=\"customer.usage\"></div></div>\n                    </td>\n                    <td class=\"text-center\"><span class=\"payment-pill\">{{ customer.payment }}</span></td>\n                    <td>\n                      <div class=\"small text-body-secondary\">Last login</div>\n                      <div class=\"fw-semibold\">{{ customer.activity }}</div>\n                    </td>\n                  </tr>\n                </tbody>\n              </table>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"container-fluid px-4 py-4\" *ngIf=\"activeSection === 'onboarding'\">\n        <div class=\"row g-4\">\n          <div class=\"col-12\">\n            <div class=\"card\">\n              <div class=\"card-header\">Merchant Onboarding Workspace</div>\n              <div class=\"card-body\">\n                <div class=\"alert alert-info\" role=\"alert\">\n                  Suggested flow: Business Profile \u2192 Legal Entity &amp; UBO \u2192 KYC/KYB Documents \u2192 Bank Settlement \u2192 Processing Configuration \u2192 Risk &amp; Compliance Approval.\n                </div>\n\n                <div class=\"row g-3 mb-4\">\n                  <div class=\"col-md-3 col-sm-6\" *ngFor=\"let step of onboardingSteps\">\n                    <div class=\"card step-card h-100\">\n                      <div class=\"card-body\">\n                        <h2 class=\"h6\">{{ step.title }}</h2>\n                        <p class=\"mb-2 text-body-secondary\">{{ step.description }}</p>\n                        <span class=\"badge\" [class]=\"step.badge\">{{ step.state }}</span>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n\n                <ul class=\"nav nav-tabs onboarding-tabs\" role=\"tablist\">\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'profile'\" (click)=\"selectTab('profile')\">Business Profile</button></li>\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'legal'\" (click)=\"selectTab('legal')\">Legal</button></li>\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'banking'\" (click)=\"selectTab('banking')\">Banking</button></li>\n                  <li class=\"nav-item\"><button class=\"nav-link\" [class.active]=\"activeTab === 'risk'\" (click)=\"selectTab('risk')\">Risk</button></li>\n                </ul>\n\n                <div class=\"pt-4\" [ngSwitch]=\"activeTab\">\n                  <div *ngSwitchCase=\"'profile'\" class=\"row g-3\">\n                    <div class=\"col-md-6\"><label class=\"form-label required\">Legal Business Name</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-3\"><label class=\"form-label required\">Country</label><select class=\"form-select\"><option>United States</option><option>United Kingdom</option><option>Canada</option></select></div>\n                    <div class=\"col-md-3\"><label class=\"form-label required\">Business Type</label><select class=\"form-select\"><option>Corporation</option><option>LLC</option><option>Sole Proprietorship</option></select></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Merchant Category Code (MCC)</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Monthly Volume</label><input class=\"form-control\" type=\"number\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Average Ticket</label><input class=\"form-control\" type=\"number\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label\">Website URL</label><input class=\"form-control\" type=\"url\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label\">Support Email</label><input class=\"form-control\" type=\"email\" /></div>\n                  </div>\n\n                  <div *ngSwitchCase=\"'legal'\" class=\"row g-3\">\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Registration Number</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Tax ID / EIN</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Date of Incorporation</label><input class=\"form-control\" type=\"date\" /></div>\n                    <div class=\"col-md-6\"><label class=\"form-label required\">UBO Name</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-3\"><label class=\"form-label required\">Ownership %</label><input class=\"form-control\" type=\"number\" /></div>\n                    <div class=\"col-md-3\"><label class=\"form-label required\">Verification Status</label><select class=\"form-select\"><option>Not started</option><option>Submitted</option><option>Verified</option></select></div>\n                  </div>\n\n                  <div *ngSwitchCase=\"'banking'\" class=\"row g-3\">\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Bank Name</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Account Holder</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Account Number</label><input class=\"form-control\" type=\"password\" value=\"************\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Routing / Sort Code</label><input class=\"form-control\" type=\"text\" /></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Settlement Currency</label><select class=\"form-select\"><option>USD</option><option>EUR</option><option>GBP</option></select></div>\n                    <div class=\"col-md-4\"><label class=\"form-label required\">Payout Schedule</label><select class=\"form-select\"><option>T+1</option><option>T+2</option><option>Weekly</option></select></div>\n                  </div>\n\n                  <div *ngSwitchCase=\"'risk'\" class=\"row g-3\">\n                    <div class=\"col-md-6\">\n                      <label class=\"form-label required\">Risk Rating</label>\n                      <div class=\"d-flex gap-2 mb-3\">\n                        <span class=\"badge bg-success risk-tag\">Low</span>\n                        <span class=\"badge bg-warning text-dark risk-tag\">Medium</span>\n                        <span class=\"badge bg-danger risk-tag\">High</span>\n                      </div>\n                      <label class=\"form-label required\">Chargeback Threshold</label>\n                      <input class=\"form-range\" type=\"range\" min=\"0\" max=\"3\" step=\"0.1\" value=\"1.2\" />\n                    </div>\n                    <div class=\"col-md-6\">\n                      <label class=\"form-label required\">Enabled Controls</label>\n                      <div class=\"form-check\"><input class=\"form-check-input\" type=\"checkbox\" checked id=\"velocity\" /><label class=\"form-check-label\" for=\"velocity\">Velocity limits</label></div>\n                      <div class=\"form-check\"><input class=\"form-check-input\" type=\"checkbox\" checked id=\"geo\" /><label class=\"form-check-label\" for=\"geo\">Geo restrictions</label></div>\n                      <div class=\"form-check\"><input class=\"form-check-input\" type=\"checkbox\" id=\"threeds\" /><label class=\"form-check-label\" for=\"threeds\">Force 3DS for high-risk cards</label></div>\n                    </div>\n                  </div>\n                </div>\n\n                <div class=\"d-flex justify-content-end gap-2 mt-4\">\n                  <button class=\"btn btn-light\" type=\"button\">Save Draft</button>\n                  <button class=\"btn btn-primary\" type=\"button\">Submit for Review</button>\n                </div>\n              </div>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"container-fluid px-4 py-4\" *ngIf=\"activeSection === 'verification'\">\n        <div class=\"card\">\n          <div class=\"card-header\">Verification Queue</div>\n          <div class=\"card-body\">\n            <div class=\"progress mb-4\" aria-valuenow=\"58\" aria-valuemin=\"0\" aria-valuemax=\"100\">\n              <div class=\"progress-bar\" style=\"width: 58%\">58% complete</div>\n            </div>\n            <ul class=\"list-group\">\n              <li class=\"list-group-item d-flex justify-content-between align-items-center\">Certificate of Incorporation <span class=\"badge bg-success\">Received</span></li>\n              <li class=\"list-group-item d-flex justify-content-between align-items-center\">UBO Identity Document <span class=\"badge bg-warning text-dark\">Pending Review</span></li>\n              <li class=\"list-group-item d-flex justify-content-between align-items-center\">Proof of Business Address <span class=\"badge bg-warning text-dark\">Pending Upload</span></li>\n              <li class=\"list-group-item d-flex justify-content-between align-items-center\">Bank Account Verification Letter <span class=\"badge bg-light text-dark\">Not Started</span></li>\n            </ul>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"container-fluid px-4 py-4\" *ngIf=\"activeSection === 'settlement'\">\n        <div class=\"card\">\n          <div class=\"card-header\">Settlement Setup</div>\n          <div class=\"card-body\">\n            <div class=\"row g-3\">\n              <div class=\"col-md-4\"><label class=\"form-label required\">Settlement Currency</label><select class=\"form-select\"><option>USD</option><option>EUR</option><option>GBP</option></select></div>\n              <div class=\"col-md-4\"><label class=\"form-label required\">Payout Schedule</label><select class=\"form-select\"><option>T+1</option><option>T+2</option><option>Weekly</option></select></div>\n              <div class=\"col-md-4\"><label class=\"form-label required\">Reserve Policy</label><select class=\"form-select\"><option>Standard</option><option>Rolling Reserve</option><option>Custom</option></select></div>\n              <div class=\"col-md-6\"><label class=\"form-label required\">Bank Name</label><input class=\"form-control\" type=\"text\" /></div>\n              <div class=\"col-md-6\"><label class=\"form-label required\">Account Holder</label><input class=\"form-control\" type=\"text\" /></div>\n            </div>\n          </div>\n        </div>\n      </div>\n      <div class=\"container-fluid px-4 pt-2 pb-4\" *ngIf=\"activeSection === 'merchantCatalog'\">\n        <app-merchant-catalog></app-merchant-catalog>\n      </div>\n    </div>\n\n    <footer class=\"footer px-4 py-3 bg-white border-top d-flex justify-content-between align-items-center\">\n      <div><a href=\"https://coreui.io\" target=\"_blank\" rel=\"noreferrer\">CoreUI</a> inspired admin shell for BlitzPay.</div>\n      <div class=\"text-body-secondary\">Powered by CoreUI styling</div>\n    </footer>\n  </div>\n\n  <div class=\"chat-backdrop\" *ngIf=\"chatOpen\" (click)=\"closeChat()\"></div>\n  <div class=\"profile-backdrop\" *ngIf=\"profileMenuOpen\" (click)=\"closeProfileMenu()\"></div>\n  <aside class=\"chat-panel\" [class.chat-panel-open]=\"chatOpen\" aria-label=\"Support chat\">\n    <div class=\"chat-panel-header\">\n      <div>\n        <div class=\"chat-panel-title\">Messages</div>\n        <div class=\"chat-panel-subtitle\">CoreUI-style right aside</div>\n      </div>\n      <button class=\"icon-btn\" type=\"button\" aria-label=\"Close chat\" (click)=\"closeChat()\">\n        <svg viewBox=\"0 0 24 24\" width=\"18\" height=\"18\"><path fill=\"currentColor\" d=\"M18.3 5.71L12 12l6.3 6.29-1.41 1.41L10.59 13.41 4.29 19.7 2.88 18.29 9.17 12 2.88 5.71 4.29 4.3l6.3 6.29 6.29-6.29z\" /></svg>\n      </button>\n    </div>\n\n    <div class=\"chat-panel-body\">\n      <div class=\"aside-section\">\n        <div class=\"aside-section-title\">Activity</div>\n        <div class=\"aside-event\" *ngFor=\"let item of supportTimeline\">\n          <div class=\"aside-event-title\">{{ item.title }}</div>\n          <div class=\"aside-event-detail\">{{ item.detail }}</div>\n          <div class=\"aside-event-time\">{{ item.time }}</div>\n        </div>\n      </div>\n\n      <div class=\"aside-section\">\n        <div class=\"aside-section-title\">Quick Chat</div>\n        <div class=\"chat-bubble chat-bubble-support\">Merchant onboarding support is online.</div>\n        <div class=\"chat-bubble chat-bubble-user\">Review settlement configuration for the new merchant.</div>\n        <div class=\"chat-bubble chat-bubble-support\">Banking requirements are complete. Risk review is still pending approval.</div>\n      </div>\n    </div>\n\n    <div class=\"chat-panel-footer\">\n      <input class=\"form-control\" type=\"text\" placeholder=\"Type a message...\" />\n      <button class=\"btn btn-primary\" type=\"button\">Send</button>\n    </div>\n  </aside>\n</div>\n", styles: [".auth-user-name {\n  font-size: 0.875rem;\n  color: var(--cui-secondary-color, #6b7280);\n}\n"] }]
    }], () => [{ type: i1.AuthService }, { type: i2.AuthStateService }], null); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(AuthShellComponent, { className: "AuthShellComponent", filePath: "src/app/auth/components/auth-shell.component.ts", lineNumber: 18 }); })();
