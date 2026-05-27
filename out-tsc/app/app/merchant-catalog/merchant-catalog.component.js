import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DisplayDatePipe } from '../pipes/display-date.pipe';
import * as L from 'leaflet';
import { forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { getEnvironmentByKey } from '../services/merchant-environment.service';
import { environment } from '../../environments/environment';
import * as i0 from "@angular/core";
import * as i1 from "../services/merchant-api.service";
import * as i2 from "@angular/common";
import * as i3 from "@angular/forms";
const _c0 = ["leafletBranchMap"];
function MerchantCatalogComponent_div_4_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 19);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.errorMessage);
} }
function MerchantCatalogComponent_div_5_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 20);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.statusMessage);
} }
function MerchantCatalogComponent_div_18_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 21);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.catalogSearchSummary);
} }
function MerchantCatalogComponent_ng_container_19_img_33_Template(rf, ctx) { if (rf & 1) {
    const _r4 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 47);
    i0.ɵɵlistener("error", function MerchantCatalogComponent_ng_container_19_img_33_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r4); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onMerchantTableLogoError()); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const merchant_r5 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵproperty("src", merchant_r5.logoUrl, i0.ɵɵsanitizeUrl)("alt", merchant_r5.legalBusinessName || merchant_r5.applicationReference);
} }
function MerchantCatalogComponent_ng_container_19_div_34_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 48);
} }
function MerchantCatalogComponent_ng_container_19_tr_61_Template(rf, ctx) { if (rf & 1) {
    const _r6 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr", 49);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_ng_container_19_tr_61_Template_tr_click_0_listener() { const branch_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.selectBranch(branch_r7)); });
    i0.ɵɵelementStart(1, "td");
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "td");
    i0.ɵɵtext(4);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "td");
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "td")(8, "span", 29);
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(10, "td", 33)(11, "button", 50);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_ng_container_19_tr_61_Template_button_click_11_listener($event) { const branch_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.openBranchDialog(branch_r7); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(12, "svg", 35);
    i0.ɵɵelement(13, "path", 36);
    i0.ɵɵelementEnd()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(14, "button", 51);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_ng_container_19_tr_61_Template_button_click_14_listener($event) { const branch_r7 = i0.ɵɵrestoreView(_r6).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.removeBranch(branch_r7); return i0.ɵɵresetView($event.stopPropagation()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(15, "svg", 35);
    i0.ɵɵelement(16, "path", 52);
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const branch_r7 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵclassProp("row-selected", (ctx_r1.selectedBranch == null ? null : ctx_r1.selectedBranch.branchId) === branch_r7.branchId);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(branch_r7.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(branch_r7.city || "\u2014");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(branch_r7.addressLine1 || branch_r7.addressLine2 || "\u2014");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", ctx_r1.branchStatusTone(branch_r7));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.branchStatusLabel(branch_r7));
} }
function MerchantCatalogComponent_ng_container_19_tr_62_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 53);
    i0.ɵɵtext(2, "No branches for this merchant.");
    i0.ɵɵelementEnd()();
} }
function MerchantCatalogComponent_ng_container_19_tr_94_img_2_Template(rf, ctx) { if (rf & 1) {
    const _r9 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "img", 47);
    i0.ɵɵlistener("error", function MerchantCatalogComponent_ng_container_19_tr_94_img_2_Template_img_error_0_listener() { i0.ɵɵrestoreView(_r9); const product_r10 = i0.ɵɵnextContext().$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onProductImageError(product_r10.productId)); });
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const product_r10 = i0.ɵɵnextContext().$implicit;
    i0.ɵɵproperty("src", product_r10.imageUrl, i0.ɵɵsanitizeUrl)("alt", product_r10.name);
} }
function MerchantCatalogComponent_ng_container_19_tr_94_div_3_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelement(0, "div", 48);
} }
function MerchantCatalogComponent_ng_container_19_tr_94_Template(rf, ctx) { if (rf & 1) {
    const _r8 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "tr")(1, "td", 30);
    i0.ɵɵtemplate(2, MerchantCatalogComponent_ng_container_19_tr_94_img_2_Template, 1, 2, "img", 31)(3, MerchantCatalogComponent_ng_container_19_tr_94_div_3_Template, 1, 0, "div", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(4, "td")(5, "div", 54);
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div", 55);
    i0.ɵɵtext(8);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "td")(10, "span", 29);
    i0.ɵɵtext(11);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(12, "td", 56)(13, "button", 57);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_ng_container_19_tr_94_Template_button_click_13_listener() { const product_r10 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.openProduct(product_r10)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(14, "svg", 35);
    i0.ɵɵelement(15, "path", 36);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(16, "span", 58);
    i0.ɵɵtext(17, "Edit");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "button", 59);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_ng_container_19_tr_94_Template_button_click_18_listener() { const product_r10 = i0.ɵɵrestoreView(_r8).$implicit; const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.removeProduct(product_r10)); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(19, "svg", 35);
    i0.ɵɵelement(20, "path", 52);
    i0.ɵɵelementEnd();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(21, "span", 58);
    i0.ɵɵtext(22, "Delete");
    i0.ɵɵelementEnd()()()();
} if (rf & 2) {
    const product_r10 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", product_r10.imageUrl && !ctx_r1.failedProductImages.has(product_r10.productId));
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", !product_r10.imageUrl || ctx_r1.failedProductImages.has(product_r10.productId));
    i0.ɵɵadvance(3);
    i0.ɵɵtextInterpolate(product_r10.name);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(product_r10.description || "No description");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", ctx_r1.productStatusTone(product_r10));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(ctx_r1.productStatusLabel(product_r10));
} }
function MerchantCatalogComponent_ng_container_19_tr_95_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "tr")(1, "td", 60);
    i0.ɵɵtext(2);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(ctx_r1.selectedBranch ? "No products for the selected branch." : "Select a branch to load products.");
} }
function MerchantCatalogComponent_ng_container_19_Template(rf, ctx) { if (rf & 1) {
    const _r3 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "div", 22)(2, "div", 23)(3, "div", 24)(4, "div", 25)(5, "span");
    i0.ɵɵtext(6, "Merchant");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "span", 26);
    i0.ɵɵtext(8, "1 row");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(9, "div", 6)(10, "div", 27)(11, "table", 28)(12, "thead")(13, "tr")(14, "th");
    i0.ɵɵtext(15, "Merchant Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(16, "th");
    i0.ɵɵtext(17, "City");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(18, "th");
    i0.ɵɵtext(19, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(20, "th");
    i0.ɵɵtext(21, "Logo");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(22, "th");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "tbody")(24, "tr")(25, "td");
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "td");
    i0.ɵɵtext(28);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "td")(30, "span", 29);
    i0.ɵɵtext(31);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(32, "td", 30);
    i0.ɵɵtemplate(33, MerchantCatalogComponent_ng_container_19_img_33_Template, 1, 2, "img", 31)(34, MerchantCatalogComponent_ng_container_19_div_34_Template, 1, 0, "div", 32);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(35, "td", 33)(36, "button", 34);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_ng_container_19_Template_button_click_36_listener() { i0.ɵɵrestoreView(_r3); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.openMerchantDialog()); });
    i0.ɵɵnamespaceSVG();
    i0.ɵɵelementStart(37, "svg", 35);
    i0.ɵɵelement(38, "path", 36);
    i0.ɵɵelementEnd()()()()()()()()()();
    i0.ɵɵnamespaceHTML();
    i0.ɵɵelementStart(39, "div", 37)(40, "div", 38)(41, "div", 25)(42, "span");
    i0.ɵɵtext(43, "Branches");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "span", 26);
    i0.ɵɵtext(45);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(46, "div", 6)(47, "div", 27)(48, "table", 28)(49, "thead")(50, "tr")(51, "th");
    i0.ɵɵtext(52, "Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(53, "th");
    i0.ɵɵtext(54, "City");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "th");
    i0.ɵɵtext(56, "Address");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(57, "th");
    i0.ɵɵtext(58, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelement(59, "th");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(60, "tbody");
    i0.ɵɵtemplate(61, MerchantCatalogComponent_ng_container_19_tr_61_Template, 17, 7, "tr", 39)(62, MerchantCatalogComponent_ng_container_19_tr_62_Template, 3, 0, "tr", 40);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(63, "div", 41)(64, "span");
    i0.ɵɵtext(65, "Click a branch row to drive the product table.");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(66, "span");
    i0.ɵɵtext(67);
    i0.ɵɵelementEnd()()()()();
    i0.ɵɵelementStart(68, "div", 42)(69, "div", 38)(70, "div", 25)(71, "span");
    i0.ɵɵtext(72, "Products");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(73, "span", 26);
    i0.ɵɵtext(74);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(75, "div", 6)(76, "div", 43)(77, "div")(78, "div", 44);
    i0.ɵɵtext(79, "Branch Scope");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(80, "div", 45);
    i0.ɵɵtext(81);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(82, "div", 27)(83, "table", 28)(84, "thead")(85, "tr");
    i0.ɵɵelement(86, "th", 30);
    i0.ɵɵelementStart(87, "th");
    i0.ɵɵtext(88, "Product");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(89, "th");
    i0.ɵɵtext(90, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(91, "th", 33);
    i0.ɵɵtext(92, "Actions");
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(93, "tbody");
    i0.ɵɵtemplate(94, MerchantCatalogComponent_ng_container_19_tr_94_Template, 23, 6, "tr", 46)(95, MerchantCatalogComponent_ng_container_19_tr_95_Template, 3, 1, "tr", 40);
    i0.ɵɵelementEnd()()()()()()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const merchant_r5 = ctx.ngIf;
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(26);
    i0.ɵɵtextInterpolate(merchant_r5.legalBusinessName || merchant_r5.applicationReference);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate((ctx_r1.merchantLocation == null ? null : ctx_r1.merchantLocation.city) || "\u2014");
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngClass", ctx_r1.merchantStatusTone(merchant_r5.status));
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(merchant_r5.status);
    i0.ɵɵadvance(2);
    i0.ɵɵproperty("ngIf", merchant_r5.logoUrl && !ctx_r1.merchantTableLogoFailed);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", !merchant_r5.logoUrl || ctx_r1.merchantTableLogoFailed);
    i0.ɵɵadvance(11);
    i0.ɵɵtextInterpolate1("", ctx_r1.branches.length, " rows");
    i0.ɵɵadvance(16);
    i0.ɵɵproperty("ngForOf", ctx_r1.branches);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", !ctx_r1.branches.length);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate((ctx_r1.selectedBranch == null ? null : ctx_r1.selectedBranch.name) || "No branch selected");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate1("", ctx_r1.visibleProductRows.length, " rows");
    i0.ɵɵadvance(7);
    i0.ɵɵtextInterpolate((ctx_r1.selectedBranch == null ? null : ctx_r1.selectedBranch.name) || "Select a branch");
    i0.ɵɵadvance(13);
    i0.ɵɵproperty("ngForOf", ctx_r1.visibleProductRows);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", !ctx_r1.visibleProductRows.length);
} }
function MerchantCatalogComponent_div_20_div_7_label_56_Template(rf, ctx) { if (rf & 1) {
    const _r13 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 87)(1, "input", 88);
    i0.ɵɵlistener("change", function MerchantCatalogComponent_div_20_div_7_label_56_Template_input_change_1_listener($event) { const channel_r14 = i0.ɵɵrestoreView(_r13).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleMerchantChannel(channel_r14, $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const channel_r14 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("checked", ctx_r1.hasChannel(ctx_r1.merchantForm.activePaymentChannels, channel_r14));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(channel_r14);
} }
function MerchantCatalogComponent_div_20_div_7_div_64_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 89);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate1(" Selected file: ", ctx_r1.merchantLogoSelectedFileName, " ");
} }
function MerchantCatalogComponent_div_20_div_7_ng_container_69_Template(rf, ctx) { if (rf & 1) {
    const _r15 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "a", 90)(2, "img", 91);
    i0.ɵɵlistener("error", function MerchantCatalogComponent_div_20_div_7_ng_container_69_Template_img_error_2_listener() { i0.ɵɵrestoreView(_r15); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onMerchantLogoError()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const imageUrl_r16 = ctx.ngIf;
    const merchant_r17 = i0.ɵɵnextContext().ngIf;
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", imageUrl_r16, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", imageUrl_r16, i0.ɵɵsanitizeUrl)("alt", merchant_r17.legalBusinessName || merchant_r17.applicationReference);
} }
function MerchantCatalogComponent_div_20_div_7_ng_template_70_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 92);
    i0.ɵɵtext(1, "No logo available");
    i0.ɵɵelementEnd();
} }
function MerchantCatalogComponent_div_20_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r12 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "div", 66)(2, "div")(3, "strong");
    i0.ɵɵtext(4, "Merchant:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div")(7, "strong");
    i0.ɵɵtext(8, "Merchant ID:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div")(11, "strong");
    i0.ɵɵtext(12, "Updated:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13);
    i0.ɵɵpipe(14, "displayDate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(15, "div", 67)(16, "div", 68)(17, "label", 69);
    i0.ɵɵtext(18, "Merchant Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(19, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_19_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.merchantForm.legalBusinessName, $event) || (ctx_r1.merchantForm.legalBusinessName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_19_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.merchant = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(20, "div", 68)(21, "label", 71);
    i0.ɵɵtext(22, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "div", 72)(24, "input", 73);
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_24_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onMerchantActiveToggle($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(25, "label", 74);
    i0.ɵɵtext(26);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(27, "div", 23)(28, "div", 75);
    i0.ɵɵtext(29, "Address");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(30, "div", 23)(31, "label", 69);
    i0.ɵɵtext(32, "Primary Business Address");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(33, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_33_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.merchantForm.primaryBusinessAddress, $event) || (ctx_r1.merchantForm.primaryBusinessAddress = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_33_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.merchant = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 23)(35, "div", 75);
    i0.ɵɵtext(36, "Contact");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div", 76)(38, "label", 69);
    i0.ɵɵtext(39, "Contact Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_40_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.merchantForm.contactFullName, $event) || (ctx_r1.merchantForm.contactFullName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_40_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.merchant = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(41, "div", 76)(42, "label", 69);
    i0.ɵɵtext(43, "Contact Email");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_44_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.merchantForm.contactEmail, $event) || (ctx_r1.merchantForm.contactEmail = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_44_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.merchant = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 76)(46, "label", 69);
    i0.ɵɵtext(47, "Contact Phone");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_48_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.merchantForm.contactPhoneNumber, $event) || (ctx_r1.merchantForm.contactPhoneNumber = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_20_div_7_Template_input_ngModelChange_48_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.merchant = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "div", 23)(50, "div", 75);
    i0.ɵɵtext(51, "Payment");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(52, "div", 23)(53, "label", 77);
    i0.ɵɵtext(54, "Active Payment Channels");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(55, "div", 78);
    i0.ɵɵtemplate(56, MerchantCatalogComponent_div_20_div_7_label_56_Template, 4, 2, "label", 79);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "div", 23)(58, "div", 75);
    i0.ɵɵtext(59, "Logo");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(60, "div", 80)(61, "label", 77);
    i0.ɵɵtext(62, "Logo File");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "input", 81);
    i0.ɵɵlistener("change", function MerchantCatalogComponent_div_20_div_7_Template_input_change_63_listener($event) { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onMerchantLogoFileSelected($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(64, MerchantCatalogComponent_div_20_div_7_div_64_Template, 2, 1, "div", 82);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(65, "div", 83)(66, "div", 84)(67, "div", 85);
    i0.ɵɵtext(68, "Logo preview");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(69, MerchantCatalogComponent_div_20_div_7_ng_container_69_Template, 3, 3, "ng-container", 17)(70, MerchantCatalogComponent_div_20_div_7_ng_template_70_Template, 2, 0, "ng-template", null, 1, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(72, "div", 86)(73, "button", 13);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_20_div_7_Template_button_click_73_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.saveMerchant()); });
    i0.ɵɵtext(74, "Save changes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(75, "button", 14);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_20_div_7_Template_button_click_75_listener() { i0.ɵɵrestoreView(_r12); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeMerchantDialog()); });
    i0.ɵɵtext(76, "Cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const merchant_r17 = ctx.ngIf;
    const emptyMerchantLogoImage_r18 = i0.ɵɵreference(71);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", merchant_r17.legalBusinessName || merchant_r17.applicationReference);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", merchant_r17.applicationId);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(14, 14, merchant_r17.lastUpdatedAt));
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.merchantForm.legalBusinessName);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngModel", ctx_r1.merchantForm.status === "ACTIVE");
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.merchantForm.status === "ACTIVE" ? "Active" : "Inactive", " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.merchantForm.primaryBusinessAddress);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.merchantForm.contactFullName);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.merchantForm.contactEmail);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.merchantForm.contactPhoneNumber);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("ngForOf", ctx_r1.paymentChannelOptions);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("ngIf", ctx_r1.merchantLogoSelectedFileName);
    i0.ɵɵadvance(5);
    i0.ɵɵproperty("ngIf", ctx_r1.merchantLogoImageUrl)("ngIfElse", emptyMerchantLogoImage_r18);
} }
function MerchantCatalogComponent_div_20_Template(rf, ctx) { if (rf & 1) {
    const _r11 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 61)(1, "div", 62)(2, "div", 25)(3, "h5", 63);
    i0.ɵɵtext(4, "Edit Merchant");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 64);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_20_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r11); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeMerchantDialog()); });
    i0.ɵɵtext(6, "Close");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(7, MerchantCatalogComponent_div_20_div_7_Template, 77, 16, "div", 65);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r1.selectedMerchant);
} }
function MerchantCatalogComponent_div_21_div_7_div_87_div_16_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 105)(1, "a", 106);
    i0.ɵɵtext(2, "Open full map");
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(4);
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", ctx_r1.branchMapLink, i0.ɵɵsanitizeUrl);
} }
function MerchantCatalogComponent_div_21_div_7_div_87_Template(rf, ctx) { if (rf & 1) {
    const _r21 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 23)(1, "label", 77);
    i0.ɵɵtext(2, "Map Preview");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(3, "div", 99)(4, "strong");
    i0.ɵɵtext(5, "Overlay:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(6);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(7, "div")(8, "div", 100);
    i0.ɵɵtext(9, "Leaflet + OpenStreetMap");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div", 101);
    i0.ɵɵelement(11, "div", 102, 2);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(13, "div", 103)(14, "button", 64);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_21_div_7_div_87_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r21); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.refreshBranchMapPreview()); });
    i0.ɵɵtext(15, "Refresh interactive map");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(16, MerchantCatalogComponent_div_21_div_7_div_87_div_16_Template, 3, 1, "div", 104);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance(6);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.branchGeofenceRadius && ctx_r1.branchGeofenceRadius > 0 ? "Geofence circle at " + ctx_r1.branchGeofenceRadius + " meters" : "No geofence radius set, so only the branch marker is shown.", " ");
    i0.ɵɵadvance(10);
    i0.ɵɵproperty("ngIf", ctx_r1.branchMapLink);
} }
function MerchantCatalogComponent_div_21_div_7_label_95_Template(rf, ctx) { if (rf & 1) {
    const _r22 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "label", 87)(1, "input", 88);
    i0.ɵɵlistener("change", function MerchantCatalogComponent_div_21_div_7_label_95_Template_input_change_1_listener($event) { const channel_r23 = i0.ɵɵrestoreView(_r22).$implicit; const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.toggleBranchChannel(channel_r23, $event.target.checked)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(2, "span");
    i0.ɵɵtext(3);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const channel_r23 = ctx.$implicit;
    const ctx_r1 = i0.ɵɵnextContext(3);
    i0.ɵɵadvance();
    i0.ɵɵproperty("checked", ctx_r1.hasChannel(ctx_r1.branchForm.activePaymentChannels, channel_r23));
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate(channel_r23);
} }
function MerchantCatalogComponent_div_21_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r20 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "div", 66)(2, "div")(3, "strong");
    i0.ɵɵtext(4, "Branch:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div")(7, "strong");
    i0.ɵɵtext(8, "Branch ID:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div")(11, "strong");
    i0.ɵɵtext(12, "Merchant ID:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div")(15, "strong");
    i0.ɵɵtext(16, "City:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(17);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(18, "div", 67)(19, "div", 68)(20, "label", 77);
    i0.ɵɵtext(21, "Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(22, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_22_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.name, $event) || (ctx_r1.branchForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_22_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(23, "div", 68)(24, "label", 71);
    i0.ɵɵtext(25, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(26, "div", 72)(27, "input", 95);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_27_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.active, $event) || (ctx_r1.branchForm.active = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_27_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(28, "label", 96);
    i0.ɵɵtext(29);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(30, "div", 23)(31, "div", 75);
    i0.ɵɵtext(32, "Address");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(33, "div", 68)(34, "label", 77);
    i0.ɵɵtext(35, "Address 1");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(36, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_36_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.addressLine1, $event) || (ctx_r1.branchForm.addressLine1 = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_36_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(37, "div", 68)(38, "label", 77);
    i0.ɵɵtext(39, "Address 2");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(40, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_40_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.addressLine2, $event) || (ctx_r1.branchForm.addressLine2 = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_40_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(41, "div", 97)(42, "label", 77);
    i0.ɵɵtext(43, "Post Code");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(44, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_44_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.postalCode, $event) || (ctx_r1.branchForm.postalCode = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_44_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 97)(46, "label", 77);
    i0.ɵɵtext(47, "City");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(48, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_48_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.city, $event) || (ctx_r1.branchForm.city = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_48_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(49, "div", 97)(50, "label", 77);
    i0.ɵɵtext(51, "Country");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(52, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_52_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.country, $event) || (ctx_r1.branchForm.country = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_52_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(53, "div", 97)(54, "label", 77);
    i0.ɵɵtext(55, "Google Place ID");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(56, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_56_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.googlePlaceId, $event) || (ctx_r1.branchForm.googlePlaceId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_56_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(57, "div", 23)(58, "div", 75);
    i0.ɵɵtext(59, "Contact");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(60, "div", 76)(61, "label", 77);
    i0.ɵɵtext(62, "Contact Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(63, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_63_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.contactFullName, $event) || (ctx_r1.branchForm.contactFullName = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_63_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(64, "div", 76)(65, "label", 77);
    i0.ɵɵtext(66, "Contact Email");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(67, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_67_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.contactEmail, $event) || (ctx_r1.branchForm.contactEmail = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_67_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(68, "div", 76)(69, "label", 77);
    i0.ɵɵtext(70, "Contact Phone");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(71, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_71_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.contactPhoneNumber, $event) || (ctx_r1.branchForm.contactPhoneNumber = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_71_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.branch = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(72, "div", 23)(73, "div", 75);
    i0.ɵɵtext(74, "Location");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(75, "div", 76)(76, "label", 77);
    i0.ɵɵtext(77, "Latitude");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(78, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_78_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.latitude, $event) || (ctx_r1.branchForm.latitude = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_78_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.dirtyForms.branch = true; return i0.ɵɵresetView(ctx_r1.refreshBranchMapPreview()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(79, "div", 76)(80, "label", 77);
    i0.ɵɵtext(81, "Longitude");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(82, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_82_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.longitude, $event) || (ctx_r1.branchForm.longitude = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_82_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.dirtyForms.branch = true; return i0.ɵɵresetView(ctx_r1.refreshBranchMapPreview()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(83, "div", 76)(84, "label", 77);
    i0.ɵɵtext(85, "Geofence");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(86, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_86_listener($event) { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.branchForm.geofenceRadiusMeters, $event) || (ctx_r1.branchForm.geofenceRadiusMeters = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_21_div_7_Template_input_ngModelChange_86_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); ctx_r1.dirtyForms.branch = true; return i0.ɵɵresetView(ctx_r1.refreshBranchMapPreview()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(87, MerchantCatalogComponent_div_21_div_7_div_87_Template, 17, 2, "div", 98);
    i0.ɵɵelementStart(88, "div", 23)(89, "div", 75);
    i0.ɵɵtext(90, "Payment");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(91, "div", 23)(92, "label", 77);
    i0.ɵɵtext(93, "Active Payment Channels");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(94, "div", 78);
    i0.ɵɵtemplate(95, MerchantCatalogComponent_div_21_div_7_label_95_Template, 4, 2, "label", 79);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(96, "div", 86)(97, "button", 13);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_21_div_7_Template_button_click_97_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.saveBranch()); });
    i0.ɵɵtext(98, "Save branch");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(99, "button", 14);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_21_div_7_Template_button_click_99_listener() { i0.ɵɵrestoreView(_r20); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeBranchDialog()); });
    i0.ɵɵtext(100, "Cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const branch_r24 = ctx.ngIf;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", branch_r24.name);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", branch_r24.branchId || branch_r24.id || "\u2014");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", branch_r24.merchantId);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", branch_r24.city || "\u2014");
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.name);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.active);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.branchForm.active ? "Active" : "Inactive", " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.addressLine1);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.addressLine2);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.postalCode);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.city);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.country);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.googlePlaceId);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.contactFullName);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.contactEmail);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.contactPhoneNumber);
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.latitude);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.longitude);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.branchForm.geofenceRadiusMeters);
    i0.ɵɵadvance();
    i0.ɵɵproperty("ngIf", ctx_r1.hasBranchCoordinates);
    i0.ɵɵadvance(8);
    i0.ɵɵproperty("ngForOf", ctx_r1.paymentChannelOptions);
} }
function MerchantCatalogComponent_div_21_Template(rf, ctx) { if (rf & 1) {
    const _r19 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 61)(1, "div", 93)(2, "div", 25)(3, "h5", 94);
    i0.ɵɵtext(4, "Edit Branch");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 64);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_21_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r19); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeBranchDialog()); });
    i0.ɵɵtext(6, "Close");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(7, MerchantCatalogComponent_div_21_div_7_Template, 101, 21, "div", 65);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r1.selectedBranch);
} }
function MerchantCatalogComponent_div_22_div_7_option_44_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "option", 115);
    i0.ɵɵtext(1);
    i0.ɵɵelementEnd();
} if (rf & 2) {
    const branch_r27 = ctx.$implicit;
    i0.ɵɵproperty("value", branch_r27.branchId);
    i0.ɵɵadvance();
    i0.ɵɵtextInterpolate(branch_r27.name);
} }
function MerchantCatalogComponent_div_22_div_7_ng_container_56_Template(rf, ctx) { if (rf & 1) {
    const _r28 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementContainerStart(0);
    i0.ɵɵelementStart(1, "a", 90)(2, "img", 91);
    i0.ɵɵlistener("error", function MerchantCatalogComponent_div_22_div_7_ng_container_56_Template_img_error_2_listener() { i0.ɵɵrestoreView(_r28); const ctx_r1 = i0.ɵɵnextContext(3); return i0.ɵɵresetView(ctx_r1.onProductDialogImageError()); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementContainerEnd();
} if (rf & 2) {
    const imageUrl_r29 = ctx.ngIf;
    const product_r30 = i0.ɵɵnextContext().ngIf;
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance();
    i0.ɵɵproperty("href", imageUrl_r29, i0.ɵɵsanitizeUrl);
    i0.ɵɵadvance();
    i0.ɵɵproperty("src", imageUrl_r29, i0.ɵɵsanitizeUrl)("alt", ctx_r1.productEditForm.name || product_r30.name);
} }
function MerchantCatalogComponent_div_22_div_7_ng_template_57_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 92);
    i0.ɵɵtext(1, "No image available");
    i0.ɵɵelementEnd();
} }
function MerchantCatalogComponent_div_22_div_7_Template(rf, ctx) { if (rf & 1) {
    const _r26 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 6)(1, "div", 66)(2, "div")(3, "strong");
    i0.ɵɵtext(4, "Product ID:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(5);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(6, "div")(7, "strong");
    i0.ɵɵtext(8, "Merchant ID:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(9);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(10, "div")(11, "strong");
    i0.ɵɵtext(12, "Current branch:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(13);
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(14, "div")(15, "strong");
    i0.ɵɵtext(16, "Updated:");
    i0.ɵɵelementEnd();
    i0.ɵɵtext(17);
    i0.ɵɵpipe(18, "displayDate");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(19, "div", 67)(20, "div", 68)(21, "label", 69);
    i0.ɵɵtext(22, "Name");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(23, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_input_ngModelChange_23_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.productEditForm.name, $event) || (ctx_r1.productEditForm.name = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_input_ngModelChange_23_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.editProduct = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(24, "div", 68)(25, "label", 71);
    i0.ɵɵtext(26, "Status");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(27, "div", 72)(28, "input", 109);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_input_ngModelChange_28_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.productEditForm.active, $event) || (ctx_r1.productEditForm.active = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_input_ngModelChange_28_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onProductStatusToggle($event)); });
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(29, "label", 110);
    i0.ɵɵtext(30);
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(31, "div", 23)(32, "div", 75);
    i0.ɵɵtext(33, "Pricing");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(34, "div", 68)(35, "label", 69);
    i0.ɵɵtext(36, "Unit Price");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(37, "input", 70);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_input_ngModelChange_37_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.productEditForm.unitPrice, $event) || (ctx_r1.productEditForm.unitPrice = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_input_ngModelChange_37_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.editProduct = true); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(38, "div", 68)(39, "label", 77);
    i0.ɵɵtext(40, "Branch");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(41, "select", 111);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_select_ngModelChange_41_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.productEditForm.branchId, $event) || (ctx_r1.productEditForm.branchId = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_select_ngModelChange_41_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.editProduct = true); });
    i0.ɵɵelementStart(42, "option", 112);
    i0.ɵɵtext(43, "No branch");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(44, MerchantCatalogComponent_div_22_div_7_option_44_Template, 2, 2, "option", 113);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(45, "div", 23)(46, "div", 75);
    i0.ɵɵtext(47, "Media");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(48, "div", 80)(49, "label", 77);
    i0.ɵɵtext(50, "Image");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(51, "input", 81);
    i0.ɵɵlistener("change", function MerchantCatalogComponent_div_22_div_7_Template_input_change_51_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.onFileSelected($event)); });
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(52, "div", 83)(53, "div", 84)(54, "div", 85);
    i0.ɵɵtext(55, "Current image");
    i0.ɵɵelementEnd();
    i0.ɵɵtemplate(56, MerchantCatalogComponent_div_22_div_7_ng_container_56_Template, 3, 3, "ng-container", 17)(57, MerchantCatalogComponent_div_22_div_7_ng_template_57_Template, 2, 0, "ng-template", null, 3, i0.ɵɵtemplateRefExtractor);
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(59, "div", 23)(60, "div", 75);
    i0.ɵɵtext(61, "Details");
    i0.ɵɵelementEnd()();
    i0.ɵɵelementStart(62, "div", 23)(63, "label", 77);
    i0.ɵɵtext(64, "Description");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(65, "textarea", 114);
    i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_textarea_ngModelChange_65_listener($event) { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); i0.ɵɵtwoWayBindingSet(ctx_r1.productEditForm.description, $event) || (ctx_r1.productEditForm.description = $event); return i0.ɵɵresetView($event); });
    i0.ɵɵlistener("ngModelChange", function MerchantCatalogComponent_div_22_div_7_Template_textarea_ngModelChange_65_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.dirtyForms.editProduct = true); });
    i0.ɵɵelementEnd()()();
    i0.ɵɵelementStart(66, "div", 86)(67, "button", 13);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_22_div_7_Template_button_click_67_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.updateProduct()); });
    i0.ɵɵtext(68, "Save changes");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(69, "button", 14);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_22_div_7_Template_button_click_69_listener() { i0.ɵɵrestoreView(_r26); const ctx_r1 = i0.ɵɵnextContext(2); return i0.ɵɵresetView(ctx_r1.closeProductDialog()); });
    i0.ɵɵtext(70, "Cancel");
    i0.ɵɵelementEnd()()();
} if (rf & 2) {
    const product_r30 = ctx.ngIf;
    const emptyProductDialogImage_r31 = i0.ɵɵreference(58);
    const ctx_r1 = i0.ɵɵnextContext(2);
    i0.ɵɵadvance(5);
    i0.ɵɵtextInterpolate1(" ", product_r30.productId);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", product_r30.merchantId);
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", product_r30.branchId || "Merchant-level product");
    i0.ɵɵadvance(4);
    i0.ɵɵtextInterpolate1(" ", i0.ɵɵpipeBind1(18, 13, product_r30.updatedAt));
    i0.ɵɵadvance(6);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.productEditForm.name);
    i0.ɵɵadvance(5);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.productEditForm.active);
    i0.ɵɵadvance(2);
    i0.ɵɵtextInterpolate1(" ", ctx_r1.productEditForm.active ? "Active" : "Inactive", " ");
    i0.ɵɵadvance(7);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.productEditForm.unitPrice);
    i0.ɵɵadvance(4);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.productEditForm.branchId);
    i0.ɵɵadvance(3);
    i0.ɵɵproperty("ngForOf", ctx_r1.branches);
    i0.ɵɵadvance(12);
    i0.ɵɵproperty("ngIf", ctx_r1.productDialogImageUrl)("ngIfElse", emptyProductDialogImage_r31);
    i0.ɵɵadvance(9);
    i0.ɵɵtwoWayProperty("ngModel", ctx_r1.productEditForm.description);
} }
function MerchantCatalogComponent_div_22_Template(rf, ctx) { if (rf & 1) {
    const _r25 = i0.ɵɵgetCurrentView();
    i0.ɵɵelementStart(0, "div", 61)(1, "div", 107)(2, "div", 25)(3, "h5", 108);
    i0.ɵɵtext(4, "Edit Product");
    i0.ɵɵelementEnd();
    i0.ɵɵelementStart(5, "button", 64);
    i0.ɵɵlistener("click", function MerchantCatalogComponent_div_22_Template_button_click_5_listener() { i0.ɵɵrestoreView(_r25); const ctx_r1 = i0.ɵɵnextContext(); return i0.ɵɵresetView(ctx_r1.closeProductDialog()); });
    i0.ɵɵtext(6, "Close");
    i0.ɵɵelementEnd()();
    i0.ɵɵtemplate(7, MerchantCatalogComponent_div_22_div_7_Template, 71, 15, "div", 65);
    i0.ɵɵelementEnd()();
} if (rf & 2) {
    const ctx_r1 = i0.ɵɵnextContext();
    i0.ɵɵadvance(7);
    i0.ɵɵproperty("ngIf", ctx_r1.selectedProduct);
} }
function MerchantCatalogComponent_ng_template_23_Template(rf, ctx) { if (rf & 1) {
    i0.ɵɵelementStart(0, "div", 116);
    i0.ɵɵtext(1, "Search for a merchant to load the merchant, branch, and product tables.");
    i0.ɵɵelementEnd();
} }
export class MerchantCatalogComponent {
    merchantApi;
    leafletBranchMapElement;
    selectedEnvironmentKey = environment.defaultEnvironmentKey;
    apiVersion = 'v1';
    catalogSearchTerm = '';
    catalogSearchSummary = '';
    selectedMerchant = null;
    merchantLocation = null;
    branches = [];
    selectedBranch = null;
    products = [];
    selectedProduct = null;
    productDialogOpen = false;
    merchantDialogOpen = false;
    branchDialogOpen = false;
    merchantTableLogoFailed = false;
    failedProductImages = new Set();
    productDialogPreviewUrl = null;
    productDialogImageLoadFailed = false;
    merchantLogoPreviewUrl = null;
    merchantLogoImageLoadFailed = false;
    merchantLogoSelectedFileName = '';
    merchantLogoSelectedFile = null;
    locationForm = this.emptyLocationForm();
    merchantForm = this.emptyMerchantForm();
    branchForm = this.emptyBranchForm();
    productEditForm = this.emptyProductForm();
    logoForm = { storageKey: '' };
    statusMessage = '';
    errorMessage = '';
    loading = false;
    dirtyForms = {
        location: false,
        merchant: false,
        branch: false,
        editProduct: false,
        logo: false
    };
    paymentChannelOptions = ['PAYPAL', 'STRIPE', 'TRUELAYER'];
    merchantStatusOptions = [
        'DRAFT',
        'SUBMITTED',
        'VERIFICATION',
        'SCREENING',
        'RISK_REVIEW',
        'DECISION_PENDING',
        'SETUP',
        'ACTIVE',
        'MONITORING',
        'ACTION_REQUIRED',
        'REJECTED'
    ];
    leafletMap = null;
    leafletMarker = null;
    leafletCircle = null;
    leafletRenderTimer = null;
    constructor(merchantApi) {
        this.merchantApi = merchantApi;
    }
    ngAfterViewInit() {
        this.scheduleLeafletRender();
    }
    ngOnDestroy() {
        this.clearLeafletTimer();
        this.destroyLeafletMap();
        this.clearProductDialogPreviewUrl();
        this.clearMerchantLogoPreviewUrl();
    }
    get hasUnsavedChanges() {
        return Object.values(this.dirtyForms).some(Boolean);
    }
    get selectedEnvironment() {
        return getEnvironmentByKey(this.selectedEnvironmentKey);
    }
    get activeSearchHint() {
        return 'Search by merchant ID.';
    }
    get hasLocalCatalogQuery() {
        return false;
    }
    get visibleBranchGroups() {
        return this.buildVisibleGroups();
    }
    get visibleProductCount() {
        return this.visibleBranchGroups.reduce((count, group) => count + group.products.length, 0);
    }
    get visibleTableRows() {
        const merchant = this.selectedMerchant;
        if (!merchant) {
            return [];
        }
        return this.visibleBranchGroups.flatMap((group) => {
            if (!group.products.length) {
                return [
                    {
                        merchantId: merchant.applicationId,
                        merchantReference: merchant.applicationReference,
                        branchId: group.branchId,
                        branchName: group.branchLabel,
                        product: null
                    }
                ];
            }
            return group.products.map((product) => ({
                merchantId: merchant.applicationId,
                merchantReference: merchant.applicationReference,
                branchId: group.branchId,
                branchName: group.branchLabel,
                product
            }));
        });
    }
    get visibleProductRows() {
        if (!this.selectedBranch?.branchId) {
            return [];
        }
        return this.products;
    }
    get branchProductCountMap() {
        return this.visibleBranchGroups.reduce((acc, group) => {
            if (group.branchId) {
                acc[group.branchId] = group.products.length;
            }
            return acc;
        }, {});
    }
    merchantStatusTone(status) {
        const normalized = status.toLowerCase();
        if (normalized === 'active') {
            return 'status-tag-success';
        }
        if (normalized.includes('review') || normalized.includes('pending') || normalized.includes('screening')) {
            return 'status-tag-warning';
        }
        if (normalized.includes('rejected') || normalized.includes('action_required')) {
            return 'status-tag-danger';
        }
        return 'status-tag-neutral';
    }
    productStatusTone(product) {
        return product.active ? 'status-tag-success' : 'status-tag-neutral';
    }
    productStatusLabel(product) {
        return product.active ? 'Active' : 'Inactive';
    }
    branchStatusTone(branch) {
        return branch.active === false ? 'status-tag-neutral' : 'status-tag-success';
    }
    branchStatusLabel(branch) {
        return branch.active === false ? 'Inactive' : 'Active';
    }
    get hasBranchCoordinates() {
        const latitude = this.toOptionalNumber(this.branchForm.latitude);
        const longitude = this.toOptionalNumber(this.branchForm.longitude);
        return latitude != null && longitude != null;
    }
    get branchMapLink() {
        const latitude = this.toOptionalNumber(this.branchForm.latitude);
        const longitude = this.toOptionalNumber(this.branchForm.longitude);
        if (latitude == null || longitude == null) {
            return null;
        }
        return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
    }
    get branchGeofenceRadius() {
        return this.toOptionalNumber(this.branchForm.geofenceRadiusMeters) ?? null;
    }
    onMerchantActiveToggle(active) {
        if (active) {
            this.merchantForm.status = 'ACTIVE';
        }
        else if (this.merchantForm.status === 'ACTIVE') {
            this.merchantForm.status = 'SETUP';
        }
        this.dirtyForms.merchant = true;
    }
    onProductStatusToggle(active) {
        if (!this.selectedProduct) {
            return;
        }
        this.productEditForm.active = active;
        this.selectedProduct = { ...this.selectedProduct, active };
        this.dirtyForms.editProduct = true;
    }
    refreshBranchMapPreview() {
        this.scheduleLeafletRender();
    }
    hasChannel(selected, channel) {
        return selected.includes(channel);
    }
    toggleMerchantChannel(channel, checked) {
        this.merchantForm.activePaymentChannels = checked
            ? [...new Set([...this.merchantForm.activePaymentChannels, channel])]
            : this.merchantForm.activePaymentChannels.filter((value) => value !== channel);
        this.dirtyForms.merchant = true;
    }
    toggleBranchChannel(channel, checked) {
        this.branchForm.activePaymentChannels = checked
            ? [...new Set([...this.branchForm.activePaymentChannels, channel])]
            : this.branchForm.activePaymentChannels.filter((value) => value !== channel);
        this.dirtyForms.branch = true;
    }
    runCatalogSearch() {
        this.errorMessage = '';
        this.statusMessage = '';
        const searchTerm = this.catalogSearchTerm.trim();
        if (!searchTerm) {
            this.errorMessage = 'Enter a search value before searching.';
            return;
        }
        this.loadMerchantById(searchTerm, 'Unable to find merchant by ID.');
    }
    clearCatalogSearch() {
        this.catalogSearchTerm = '';
        this.catalogSearchSummary = '';
        this.errorMessage = '';
        this.statusMessage = '';
        this.selectedMerchant = null;
        this.merchantLocation = null;
        this.branches = [];
        this.products = [];
        this.selectedBranch = null;
        this.merchantForm = this.emptyMerchantForm();
        this.branchForm = this.emptyBranchForm();
        this.closeMerchantDialog();
        this.closeBranchDialog();
        this.closeProductDialog(true);
    }
    openMerchantDialog() {
        if (!this.selectedMerchant) {
            return;
        }
        this.clearMerchantLogoPreviewUrl();
        this.merchantLogoImageLoadFailed = false;
        this.merchantLogoSelectedFileName = '';
        this.merchantLogoSelectedFile = null;
        this.merchantForm = this.merchantFormFromEntity(this.selectedMerchant);
        this.logoForm.storageKey = this.selectedMerchant.logoStorageKey ?? '';
        this.merchantDialogOpen = true;
        this.dirtyForms.merchant = false;
        this.dirtyForms.logo = false;
    }
    closeMerchantDialog() {
        this.clearMerchantLogoPreviewUrl();
        this.merchantLogoImageLoadFailed = false;
        this.merchantLogoSelectedFileName = '';
        this.merchantLogoSelectedFile = null;
        this.merchantDialogOpen = false;
    }
    saveMerchant() {
        if (!this.selectedMerchant) {
            return;
        }
        if (!this.merchantForm.legalBusinessName.trim() ||
            !this.merchantForm.primaryBusinessAddress.trim() ||
            !this.merchantForm.contactFullName.trim() ||
            !this.merchantForm.contactEmail.trim() ||
            !this.merchantForm.contactPhoneNumber.trim()) {
            this.errorMessage = 'Merchant name, address, contact name, email, and phone are required.';
            return;
        }
        const payload = {
            legalBusinessName: this.merchantForm.legalBusinessName.trim(),
            primaryBusinessAddress: this.merchantForm.primaryBusinessAddress.trim(),
            contactFullName: this.merchantForm.contactFullName.trim(),
            contactEmail: this.merchantForm.contactEmail.trim(),
            contactPhoneNumber: this.merchantForm.contactPhoneNumber.trim(),
            activePaymentChannels: [...this.merchantForm.activePaymentChannels],
            status: this.merchantForm.status
        };
        const merchantId = this.selectedMerchant.applicationId;
        const shouldSaveLogo = this.dirtyForms.logo ||
            this.merchantLogoSelectedFile !== null ||
            this.logoForm.storageKey.trim() !== (this.selectedMerchant.logoStorageKey ?? '');
        this.loading = true;
        this.merchantApi.updateMerchant(this.selectedEnvironment, this.apiVersion, merchantId, payload).subscribe({
            next: (merchant) => {
                this.selectedMerchant = merchant;
                this.merchantForm = this.merchantFormFromEntity(merchant);
                this.dirtyForms.merchant = false;
                if (!shouldSaveLogo) {
                    this.loading = false;
                    this.statusMessage = 'Merchant updated.';
                    this.closeMerchantDialog();
                    return;
                }
                this.saveMerchantLogoAfterMerchantUpdate(merchantId);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to update merchant.');
            }
        });
    }
    saveLocation() {
        if (!this.selectedMerchant) {
            return;
        }
        const latitude = Number(this.locationForm.latitude);
        const longitude = Number(this.locationForm.longitude);
        const geofenceRadiusMeters = Number(this.locationForm.geofenceRadiusMeters);
        if (Number.isNaN(latitude) || Number.isNaN(longitude) || Number.isNaN(geofenceRadiusMeters) || geofenceRadiusMeters <= 0) {
            this.errorMessage = 'Valid latitude, longitude, and positive geofence radius are required.';
            return;
        }
        this.loading = true;
        this.merchantApi
            .saveLocation(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, {
            latitude,
            longitude,
            geofenceRadiusMeters,
            googlePlaceId: this.locationForm.googlePlaceId,
            addressLine1: this.locationForm.addressLine1,
            addressLine2: this.locationForm.addressLine2,
            city: this.locationForm.city,
            postalCode: this.locationForm.postalCode,
            country: this.locationForm.country
        })
            .subscribe({
            next: (location) => {
                this.loading = false;
                this.merchantLocation = location;
                this.locationForm = this.locationFromEntity(location);
                this.dirtyForms.location = false;
                this.statusMessage = 'Merchant location saved.';
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to save merchant location.');
            }
        });
    }
    removeLocation() {
        if (!this.selectedMerchant || !confirm('Remove merchant location?')) {
            return;
        }
        this.loading = true;
        this.merchantApi.removeLocation(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId).subscribe({
            next: () => {
                this.loading = false;
                this.merchantLocation = null;
                this.locationForm = this.emptyLocationForm();
                this.dirtyForms.location = false;
                this.statusMessage = 'Merchant location removed.';
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to remove merchant location.');
            }
        });
    }
    selectBranch(branch) {
        if (!this.selectedMerchant) {
            return;
        }
        const branchId = branch.branchId ?? branch.id;
        if (!branchId) {
            this.selectedBranch = this.normalizeBranch(branch);
            return;
        }
        this.loading = true;
        this.merchantApi.getBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branchId).subscribe({
            next: (detail) => {
                this.selectedBranch = this.normalizeBranch(detail);
                this.loadProductsForSelectedBranch();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to load branch details.');
            }
        });
    }
    openBranchDialog(branch) {
        if (!this.selectedMerchant) {
            return;
        }
        const branchId = branch.branchId ?? branch.id;
        if (!branchId) {
            this.selectedBranch = this.normalizeBranch(branch);
            this.branchForm = this.branchFormFromEntity(this.selectedBranch);
            this.branchDialogOpen = true;
            this.dirtyForms.branch = false;
            return;
        }
        this.loading = true;
        this.merchantApi.getBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branchId).subscribe({
            next: (detail) => {
                this.loading = false;
                this.selectedBranch = this.normalizeBranch(detail);
                this.branchForm = this.branchFormFromEntity(this.selectedBranch);
                this.branchDialogOpen = true;
                this.dirtyForms.branch = false;
                this.scheduleLeafletRender();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to load branch details.');
            }
        });
    }
    closeBranchDialog() {
        this.branchDialogOpen = false;
        this.destroyLeafletMap();
    }
    saveBranch() {
        if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
            return;
        }
        if (!this.branchForm.name.trim()) {
            this.errorMessage = 'Branch name is required.';
            return;
        }
        const payload = {
            name: this.branchForm.name.trim(),
            active: this.branchForm.active,
            addressLine1: this.branchForm.addressLine1.trim() || undefined,
            addressLine2: this.branchForm.addressLine2.trim() || undefined,
            city: this.branchForm.city.trim() || undefined,
            postalCode: this.branchForm.postalCode.trim() || undefined,
            country: this.branchForm.country.trim() || undefined,
            contactFullName: this.branchForm.contactFullName.trim() || undefined,
            contactEmail: this.branchForm.contactEmail.trim() || undefined,
            contactPhoneNumber: this.branchForm.contactPhoneNumber.trim() || undefined,
            activePaymentChannels: [...this.branchForm.activePaymentChannels],
            latitude: this.toOptionalNumber(this.branchForm.latitude),
            longitude: this.toOptionalNumber(this.branchForm.longitude),
            geofenceRadiusMeters: this.toOptionalNumber(this.branchForm.geofenceRadiusMeters),
            googlePlaceId: this.branchForm.googlePlaceId.trim() || undefined
        };
        this.loading = true;
        this.merchantApi
            .updateBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedBranch.branchId, payload)
            .subscribe({
            next: (branch) => {
                this.loading = false;
                this.selectedBranch = this.normalizeBranch(branch);
                this.branchForm = this.branchFormFromEntity(this.selectedBranch);
                this.dirtyForms.branch = false;
                this.statusMessage = 'Branch updated.';
                this.scheduleLeafletRender();
                this.closeBranchDialog();
                this.refreshBranches();
                this.loadProductsForSelectedBranch();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to update branch.');
            }
        });
    }
    removeBranch(branch) {
        if (!this.selectedMerchant || !branch.branchId) {
            return;
        }
        if (!confirm(`Deactivate branch "${branch.name}"?`)) {
            return;
        }
        this.loading = true;
        this.merchantApi.deleteBranch(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, branch.branchId).subscribe({
            next: () => {
                this.loading = false;
                this.statusMessage = `Branch "${branch.name}" deactivated.`;
                this.branches = this.branches.map((b) => b.branchId === branch.branchId ? { ...b, active: false } : b);
                if (this.selectedBranch?.branchId === branch.branchId) {
                    this.selectedBranch = null;
                    this.products = [];
                    this.syncCatalogSearchSummary();
                }
                this.closeBranchDialog();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to deactivate branch.');
            }
        });
    }
    openProduct(product) {
        if (!this.selectedMerchant) {
            return;
        }
        this.loading = true;
        this.merchantApi
            .getProduct(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, product.productId, product.branchId ?? undefined)
            .subscribe({
            next: (detail) => {
                this.loading = false;
                this.clearProductDialogPreviewUrl();
                this.productDialogImageLoadFailed = false;
                this.selectedProduct = detail;
                this.productEditForm = {
                    name: detail.name,
                    active: detail.active,
                    unitPrice: String(detail.unitPrice),
                    branchId: detail.branchId ?? '',
                    description: detail.description ?? '',
                    imageFile: null
                };
                this.productDialogOpen = true;
                this.dirtyForms.editProduct = false;
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to load product details.');
            }
        });
    }
    closeProductDialog(force = false) {
        if (!force && this.dirtyForms.editProduct && !confirm('Close the product editor and discard unsaved changes?')) {
            return;
        }
        this.productDialogOpen = false;
        this.clearProductDialogPreviewUrl();
        this.productDialogImageLoadFailed = false;
        this.selectedProduct = null;
        this.productEditForm = this.emptyProductForm();
        this.dirtyForms.editProduct = false;
    }
    updateProduct() {
        if (!this.selectedMerchant || !this.selectedProduct) {
            return;
        }
        if (!this.productEditForm.name.trim() || !this.productEditForm.unitPrice.trim()) {
            this.errorMessage = 'Product name and unit price are required.';
            return;
        }
        const merchantId = this.selectedMerchant.applicationId;
        const productId = this.selectedProduct.productId;
        const branchId = this.selectedProduct.branchId ?? undefined;
        const wasActive = this.selectedProduct.active;
        const willBeActive = this.productEditForm.active;
        const shouldDeactivate = wasActive && !willBeActive;
        const payload = this.buildProductPayload(this.productEditForm);
        this.loading = true;
        this.merchantApi
            .updateProduct(this.selectedEnvironment, this.apiVersion, merchantId, productId, payload)
            .pipe(switchMap((updatedProduct) => {
            if (!shouldDeactivate) {
                return of({ ...updatedProduct, active: willBeActive });
            }
            return this.merchantApi
                .removeProduct(this.selectedEnvironment, this.apiVersion, merchantId, productId, branchId)
                .pipe(map(() => ({ ...updatedProduct, active: false })));
        }))
            .subscribe({
            next: (result) => {
                this.products = this.products.map((item) => item.productId === result.productId ? result : item);
                this.selectedProduct = result;
                this.syncCatalogSearchSummary();
                this.statusMessage = 'Product updated.';
                this.closeProductDialog(true);
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to update product.');
            }
        });
    }
    removeProduct(product) {
        if (!this.selectedMerchant || !confirm(`Soft-remove product "${product.name}"?`)) {
            return;
        }
        this.loading = true;
        this.merchantApi
            .removeProduct(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, product.productId, product.branchId ?? undefined)
            .subscribe({
            next: () => {
                this.loading = false;
                this.statusMessage = 'Product marked inactive.';
                this.products = this.products.map((item) => item.productId === product.productId ? { ...item, active: false } : item);
                if (this.selectedProduct?.productId === product.productId) {
                    this.selectedProduct = { ...this.selectedProduct, active: false };
                }
                this.syncCatalogSearchSummary();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to mark product inactive.');
            }
        });
    }
    saveLogo() {
        if (!this.selectedMerchant) {
            return;
        }
        this.loading = true;
        this.saveMerchantLogoAfterMerchantUpdate(this.selectedMerchant.applicationId);
    }
    onProductImageError(productId) {
        this.failedProductImages.add(productId);
    }
    onMerchantLogoError() {
        this.merchantLogoImageLoadFailed = true;
    }
    onMerchantTableLogoError() {
        this.merchantTableLogoFailed = true;
    }
    onMerchantLogoFileSelected(event) {
        if (!this.selectedMerchant) {
            return;
        }
        const input = event.target;
        const file = input.files?.item(0) ?? null;
        this.clearMerchantLogoPreviewUrl();
        this.merchantLogoImageLoadFailed = false;
        this.merchantLogoSelectedFile = file;
        this.merchantLogoSelectedFileName = file?.name ?? '';
        if (!file) {
            this.dirtyForms.logo = true;
            return;
        }
        this.merchantLogoPreviewUrl = URL.createObjectURL(file);
        const extension = this.fileExtension(file.name);
        this.logoForm.storageKey = `merchants/${this.selectedMerchant.applicationId}/logo.${extension}`;
        this.dirtyForms.logo = true;
    }
    onProductDialogImageError() {
        this.productDialogImageLoadFailed = true;
    }
    onFileSelected(event) {
        const input = event.target;
        const file = input.files?.item(0) ?? null;
        this.clearProductDialogPreviewUrl();
        this.productDialogImageLoadFailed = false;
        if (file) {
            this.productDialogPreviewUrl = URL.createObjectURL(file);
        }
        this.productEditForm.imageFile = file;
        this.dirtyForms.editProduct = true;
    }
    get productDialogImageUrl() {
        if (this.productDialogImageLoadFailed) {
            return null;
        }
        return this.productDialogPreviewUrl || this.selectedProduct?.imageUrl || null;
    }
    get merchantLogoImageUrl() {
        if (this.merchantLogoImageLoadFailed) {
            return null;
        }
        return this.merchantLogoPreviewUrl || this.selectedMerchant?.logoUrl || null;
    }
    loadMerchantById(merchantId, fallbackMessage) {
        if (this.selectedMerchant && !this.confirmDirty('Open another merchant and discard unsaved form edits?')) {
            return;
        }
        this.loading = true;
        this.merchantApi.getMerchant(this.selectedEnvironment, this.apiVersion, merchantId).subscribe({
            next: (merchant) => this.selectMerchant(merchant),
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, fallbackMessage);
            }
        });
    }
    selectMerchant(merchant) {
        this.selectedMerchant = merchant;
        this.merchantForm = this.merchantFormFromEntity(merchant);
        this.logoForm.storageKey = merchant.logoStorageKey ?? '';
        this.selectedBranch = null;
        this.merchantTableLogoFailed = false;
        this.failedProductImages.clear();
        this.closeMerchantDialog();
        this.closeBranchDialog();
        this.closeProductDialog(true);
        forkJoin({
            location: this.merchantApi
                .getLocation(this.selectedEnvironment, this.apiVersion, merchant.applicationId)
                .pipe(catchError(() => of(null))),
            branches: this.merchantApi
                .getBranches(this.selectedEnvironment, this.apiVersion, merchant.applicationId)
                .pipe(catchError(() => of([])))
        }).subscribe({
            next: ({ location, branches }) => {
                this.merchantLocation = location;
                this.locationForm = location ? this.locationFromEntity(location) : this.emptyLocationForm();
                this.branches = branches.map((branch) => this.normalizeBranch(branch));
                this.selectedBranch = this.branches[0] ?? null;
                this.products = [];
                this.resetDirtyForms();
                this.syncCatalogSearchSummary();
                this.statusMessage = `Loaded merchant ${merchant.applicationReference}.`;
                if (this.selectedBranch?.branchId) {
                    this.loadProductsForSelectedBranch();
                    return;
                }
                this.loading = false;
            },
            error: () => {
                this.loading = false;
                this.errorMessage = 'Merchant loaded but one or more related sections failed to load.';
            }
        });
    }
    refreshBranches() {
        if (!this.selectedMerchant) {
            return;
        }
        this.merchantApi.getBranches(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId).subscribe({
            next: (branches) => {
                this.loading = false;
                this.branches = branches.map((branch) => this.normalizeBranch(branch));
                this.syncCatalogSearchSummary();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to refresh branches.');
            }
        });
    }
    refreshProducts() {
        if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
            this.products = [];
            return;
        }
        this.merchantApi
            .getProducts(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedBranch.branchId)
            .subscribe({
            next: (products) => {
                this.loading = false;
                this.products = products;
                this.syncCatalogSearchSummary();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Unable to refresh products.');
            }
        });
    }
    syncCatalogSearchSummary() {
        if (!this.selectedMerchant) {
            this.catalogSearchSummary = '';
            return;
        }
        this.catalogSearchSummary = `Showing ${this.branches.length} branches and ${this.products.length} products for ${this.selectedMerchant.applicationReference}.`;
    }
    loadProductsForSelectedBranch() {
        if (!this.selectedMerchant || !this.selectedBranch?.branchId) {
            this.loading = false;
            this.products = [];
            this.syncCatalogSearchSummary();
            return;
        }
        this.loading = true;
        this.merchantApi
            .getProducts(this.selectedEnvironment, this.apiVersion, this.selectedMerchant.applicationId, this.selectedBranch.branchId)
            .subscribe({
            next: (products) => {
                this.loading = false;
                this.products = products;
                this.syncCatalogSearchSummary();
            },
            error: (error) => {
                this.loading = false;
                this.products = [];
                this.errorMessage = this.toMessage(error, 'Unable to load products for the selected branch.');
            }
        });
    }
    scheduleLeafletRender() {
        if (!this.branchDialogOpen) {
            return;
        }
        this.clearLeafletTimer();
        this.leafletRenderTimer = setTimeout(() => this.renderLeafletBranchMap(), 0);
    }
    clearLeafletTimer() {
        if (this.leafletRenderTimer) {
            clearTimeout(this.leafletRenderTimer);
            this.leafletRenderTimer = null;
        }
    }
    renderLeafletBranchMap() {
        const container = this.leafletBranchMapElement?.nativeElement;
        const latitude = this.toOptionalNumber(this.branchForm.latitude);
        const longitude = this.toOptionalNumber(this.branchForm.longitude);
        if (!container || latitude == null || longitude == null) {
            this.destroyLeafletMap();
            return;
        }
        if (!this.leafletMap) {
            this.leafletMap = L.map(container, {
                center: [latitude, longitude],
                zoom: 16,
                zoomControl: true
            });
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap contributors'
            }).addTo(this.leafletMap);
        }
        if (!this.leafletMarker) {
            this.leafletMarker = L.circleMarker([latitude, longitude], {
                radius: 8,
                color: '#1d4ed8',
                weight: 2,
                fillColor: '#3b82f6',
                fillOpacity: 0.9
            }).addTo(this.leafletMap);
        }
        else {
            this.leafletMarker.setLatLng([latitude, longitude]);
        }
        const radius = this.toOptionalNumber(this.branchForm.geofenceRadiusMeters);
        if (radius != null && radius > 0) {
            if (!this.leafletCircle) {
                this.leafletCircle = L.circle([latitude, longitude], {
                    radius,
                    color: '#1d4ed8',
                    weight: 3,
                    fillColor: '#60a5fa',
                    fillOpacity: 0.22
                }).addTo(this.leafletMap);
            }
            else {
                this.leafletCircle.setLatLng([latitude, longitude]);
                this.leafletCircle.setRadius(radius);
            }
            this.leafletMap.fitBounds(this.leafletCircle.getBounds(), { padding: [24, 24] });
        }
        else if (this.leafletCircle) {
            this.leafletCircle.remove();
            this.leafletCircle = null;
        }
        if (radius == null || radius <= 0) {
            this.leafletMap.setView([latitude, longitude], 16);
        }
        setTimeout(() => this.leafletMap?.invalidateSize(), 0);
    }
    destroyLeafletMap() {
        this.clearLeafletTimer();
        if (this.leafletCircle) {
            this.leafletCircle.remove();
            this.leafletCircle = null;
        }
        if (this.leafletMarker) {
            this.leafletMarker.remove();
            this.leafletMarker = null;
        }
        if (this.leafletMap) {
            this.leafletMap.remove();
            this.leafletMap = null;
        }
    }
    buildVisibleGroups() {
        return this.buildBranchGroups();
    }
    buildBranchGroups() {
        const groups = this.branches.map((branch) => ({
            branchId: branch.branchId ?? null,
            branchLabel: branch.name,
            branch,
            products: []
        }));
        const groupsByBranchId = new Map(groups.filter((group) => !!group.branchId).map((group) => [group.branchId, group]));
        let unassignedGroup = null;
        for (const product of this.products) {
            if (product.branchId) {
                let group = groupsByBranchId.get(product.branchId);
                if (!group) {
                    group = {
                        branchId: product.branchId,
                        branchLabel: `Branch ${product.branchId}`,
                        branch: null,
                        products: []
                    };
                    groups.push(group);
                    groupsByBranchId.set(product.branchId, group);
                }
                group.products.push(product);
                continue;
            }
            if (!unassignedGroup) {
                unassignedGroup = {
                    branchId: null,
                    branchLabel: 'Merchant-level products',
                    branch: null,
                    products: []
                };
            }
            unassignedGroup.products.push(product);
        }
        if (unassignedGroup) {
            groups.push(unassignedGroup);
        }
        return groups;
    }
    emptyLocationForm() {
        return {
            latitude: '',
            longitude: '',
            geofenceRadiusMeters: '',
            googlePlaceId: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            country: ''
        };
    }
    emptyBranchForm() {
        return {
            name: '',
            active: true,
            addressLine1: '',
            addressLine2: '',
            city: '',
            postalCode: '',
            country: '',
            contactFullName: '',
            contactEmail: '',
            contactPhoneNumber: '',
            activePaymentChannels: [],
            latitude: '',
            longitude: '',
            geofenceRadiusMeters: '',
            googlePlaceId: ''
        };
    }
    emptyProductForm() {
        return {
            name: '',
            active: true,
            unitPrice: '',
            branchId: '',
            description: '',
            imageFile: null
        };
    }
    emptyMerchantForm() {
        return {
            legalBusinessName: '',
            primaryBusinessAddress: '',
            contactFullName: '',
            contactEmail: '',
            contactPhoneNumber: '',
            activePaymentChannels: [],
            status: 'DRAFT'
        };
    }
    locationFromEntity(location) {
        return {
            latitude: String(location.latitude),
            longitude: String(location.longitude),
            geofenceRadiusMeters: String(location.geofenceRadiusMeters),
            googlePlaceId: location.googlePlaceId ?? '',
            addressLine1: location.addressLine1 ?? '',
            addressLine2: location.addressLine2 ?? '',
            city: location.city ?? '',
            postalCode: location.postalCode ?? '',
            country: location.country ?? ''
        };
    }
    merchantFormFromEntity(merchant) {
        return {
            legalBusinessName: merchant.legalBusinessName ?? '',
            primaryBusinessAddress: merchant.primaryBusinessAddress ?? '',
            contactFullName: merchant.contactFullName ?? '',
            contactEmail: merchant.contactEmail ?? '',
            contactPhoneNumber: merchant.contactPhoneNumber ?? '',
            activePaymentChannels: [...(merchant.activePaymentChannels ?? [])],
            status: merchant.status
        };
    }
    branchFormFromEntity(branch) {
        return {
            name: branch.name ?? '',
            active: branch.active ?? true,
            addressLine1: branch.addressLine1 ?? '',
            addressLine2: branch.addressLine2 ?? '',
            city: branch.city ?? '',
            postalCode: branch.postalCode ?? '',
            country: branch.country ?? '',
            contactFullName: branch.contactFullName ?? '',
            contactEmail: branch.contactEmail ?? '',
            contactPhoneNumber: branch.contactPhoneNumber ?? '',
            activePaymentChannels: [...(branch.activePaymentChannels ?? [])],
            latitude: branch.latitude != null ? String(branch.latitude) : '',
            longitude: branch.longitude != null ? String(branch.longitude) : '',
            geofenceRadiusMeters: branch.geofenceRadiusMeters != null ? String(branch.geofenceRadiusMeters) : '',
            googlePlaceId: branch.googlePlaceId ?? ''
        };
    }
    normalizeBranch(branch) {
        return {
            ...branch,
            branchId: branch.branchId ?? branch.id
        };
    }
    toOptionalNumber(value) {
        const parsed = value.trim() ? Number(value) : undefined;
        return parsed === undefined || Number.isNaN(parsed) ? undefined : parsed;
    }
    buildProductPayload(form) {
        const payload = new FormData();
        payload.set('name', form.name.trim());
        payload.set('unitPrice', form.unitPrice.trim());
        payload.set('active', String(form.active));
        if (form.branchId.trim()) {
            payload.set('branchId', form.branchId.trim());
        }
        if (form.description.trim()) {
            payload.set('description', form.description.trim());
        }
        if (form.imageFile) {
            payload.set('image', form.imageFile);
        }
        return payload;
    }
    saveMerchantLogoAfterMerchantUpdate(merchantId) {
        const storageKey = this.logoForm.storageKey.trim();
        if (this.merchantLogoSelectedFile) {
            this.merchantApi
                .createLogoUploadUrl(this.selectedEnvironment, this.apiVersion, merchantId, this.merchantLogoSelectedFile.type || 'application/octet-stream')
                .pipe(switchMap((uploadTarget) => {
                this.logoForm.storageKey = uploadTarget.storageKey;
                return this.merchantApi.uploadMerchantLogo(uploadTarget.uploadUrl, this.merchantLogoSelectedFile).pipe(switchMap(() => this.merchantApi.updateLogo(this.selectedEnvironment, this.apiVersion, merchantId, {
                    storageKey: uploadTarget.storageKey
                })));
            }))
                .subscribe({
                next: (merchant) => {
                    this.loading = false;
                    this.applySavedMerchantLogo(merchant);
                    this.statusMessage = 'Merchant and logo updated.';
                    this.closeMerchantDialog();
                },
                error: (error) => {
                    this.loading = false;
                    this.errorMessage = this.toMessage(error, 'Merchant details were saved, but the logo upload failed.');
                }
            });
            return;
        }
        if (!storageKey) {
            this.loading = false;
            this.errorMessage = 'Merchant details were saved, but logo storage key is required to save the logo.';
            return;
        }
        this.merchantApi
            .updateLogo(this.selectedEnvironment, this.apiVersion, merchantId, {
            storageKey
        })
            .subscribe({
            next: (merchant) => {
                this.loading = false;
                this.applySavedMerchantLogo(merchant);
                this.statusMessage = 'Merchant and logo updated.';
                this.closeMerchantDialog();
            },
            error: (error) => {
                this.loading = false;
                this.errorMessage = this.toMessage(error, 'Merchant details were saved, but the logo update failed.');
            }
        });
    }
    applySavedMerchantLogo(merchant) {
        this.selectedMerchant = {
            ...this.selectedMerchant,
            ...merchant
        };
        this.clearMerchantLogoPreviewUrl();
        this.merchantLogoImageLoadFailed = false;
        this.merchantLogoSelectedFileName = '';
        this.merchantLogoSelectedFile = null;
        this.logoForm.storageKey = merchant.logoStorageKey ?? '';
        this.dirtyForms.logo = false;
    }
    clearProductDialogPreviewUrl() {
        if (this.productDialogPreviewUrl) {
            URL.revokeObjectURL(this.productDialogPreviewUrl);
            this.productDialogPreviewUrl = null;
        }
    }
    clearMerchantLogoPreviewUrl() {
        if (this.merchantLogoPreviewUrl) {
            URL.revokeObjectURL(this.merchantLogoPreviewUrl);
            this.merchantLogoPreviewUrl = null;
        }
    }
    fileExtension(fileName) {
        const extension = fileName.split('.').pop()?.trim().toLowerCase();
        return extension || 'png';
    }
    resetDirtyForms() {
        this.dirtyForms = {
            location: false,
            merchant: false,
            branch: false,
            editProduct: false,
            logo: false
        };
    }
    confirmDirty(message) {
        return !this.hasUnsavedChanges || confirm(message);
    }
    toMessage(error, fallback) {
        const maybeMessage = error?.error?.message;
        return maybeMessage || fallback;
    }
    static ɵfac = function MerchantCatalogComponent_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MerchantCatalogComponent)(i0.ɵɵdirectiveInject(i1.MerchantApiService)); };
    static ɵcmp = /*@__PURE__*/ i0.ɵɵdefineComponent({ type: MerchantCatalogComponent, selectors: [["app-merchant-catalog"]], viewQuery: function MerchantCatalogComponent_Query(rf, ctx) { if (rf & 1) {
            i0.ɵɵviewQuery(_c0, 5);
        } if (rf & 2) {
            let _t;
            i0.ɵɵqueryRefresh(_t = i0.ɵɵloadQuery()) && (ctx.leafletBranchMapElement = _t.first);
        } }, decls: 25, vars: 10, consts: [["emptyState", ""], ["emptyMerchantLogoImage", ""], ["leafletBranchMap", ""], ["emptyProductDialogImage", ""], [1, "card", "mb-4"], [1, "card-header"], [1, "card-body"], ["class", "alert alert-danger mb-3", 4, "ngIf"], ["class", "alert alert-success mb-3", 4, "ngIf"], [1, "row", "g-3", "align-items-start"], [1, "col-xl-8"], [1, "catalog-search-grid", "datatable-toolbar"], ["placeholder", "Enter merchant ID", 1, "form-control", 3, "ngModelChange", "ngModel"], ["type", "button", 1, "btn", "btn-primary", 3, "click"], ["type", "button", 1, "btn", "btn-outline-secondary", 3, "click"], [1, "form-text"], ["class", "catalog-search-summary mt-2", 4, "ngIf"], [4, "ngIf", "ngIfElse"], ["class", "product-dialog-backdrop", 4, "ngIf"], [1, "alert", "alert-danger", "mb-3"], [1, "alert", "alert-success", "mb-3"], [1, "catalog-search-summary", "mt-2"], [1, "row", "g-4"], [1, "col-12"], [1, "card"], [1, "card-header", "d-flex", "justify-content-between", "align-items-center"], [1, "badge", "text-bg-light"], [1, "table-responsive", "datatable-shell"], [1, "table", "table-sm", "align-middle", "mb-0", "merchant-results-table"], [1, "status-tag", 3, "ngClass"], [1, "product-thumb-col"], ["class", "product-thumb", 3, "src", "alt", "error", 4, "ngIf"], ["class", "product-thumb-empty", 4, "ngIf"], [1, "text-end"], ["type", "button", "aria-label", "Edit merchant", 1, "icon-action-btn", 3, "click"], ["viewBox", "0 0 24 24", "width", "16", "height", "16"], ["fill", "currentColor", "d", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z"], [1, "col-lg-5"], [1, "card", "h-100"], [3, "row-selected", "click", 4, "ngFor", "ngForOf"], [4, "ngIf"], [1, "table-footer"], [1, "col-lg-7"], [1, "table-card-toolbar", "mb-3"], [1, "table-card-label"], [1, "table-card-value"], [4, "ngFor", "ngForOf"], [1, "product-thumb", 3, "error", "src", "alt"], [1, "product-thumb-empty"], [3, "click"], ["type", "button", "aria-label", "Edit branch", 1, "icon-action-btn", "me-1", 3, "click"], ["type", "button", "aria-label", "Delete branch", 1, "icon-action-btn", "icon-action-btn-danger", 3, "click"], ["fill", "currentColor", "d", "M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"], ["colspan", "5", 1, "text-center", "text-body-secondary"], [1, "product-cell-title"], [1, "product-cell-subtitle"], [1, "text-end", "action-cell"], ["type", "button", "aria-label", "Edit product", 1, "btn", "btn-sm", "btn-outline-primary", "me-2", 3, "click"], [1, "ms-1"], ["type", "button", "aria-label", "Delete product", 1, "btn", "btn-sm", "btn-outline-danger", 3, "click"], ["colspan", "3", 1, "text-center", "text-body-secondary"], [1, "product-dialog-backdrop"], ["role", "dialog", "aria-modal", "true", "aria-labelledby", "merchant-dialog-title", 1, "product-dialog", "card"], ["id", "merchant-dialog-title", 1, "mb-0"], ["type", "button", 1, "btn", "btn-sm", "btn-outline-secondary", 3, "click"], ["class", "card-body", 4, "ngIf"], [1, "dialog-meta"], [1, "row", "g-3", "mt-1"], [1, "col-md-6"], [1, "form-label", "required"], [1, "form-control", 3, "ngModelChange", "ngModel"], [1, "form-label", "d-block"], [1, "form-check", "form-switch", "status-switch"], ["id", "merchant-active-toggle", "type", "checkbox", 1, "form-check-input", 3, "ngModelChange", "ngModel"], ["for", "merchant-active-toggle", 1, "form-check-label"], [1, "dialog-section"], [1, "col-md-4"], [1, "form-label"], [1, "channel-list"], ["class", "channel-option", 4, "ngFor", "ngForOf"], [1, "col-md-7"], ["type", "file", "accept", "image/*", 1, "form-control", 3, "change"], ["class", "form-text mt-2", 4, "ngIf"], [1, "col-md-5"], [1, "product-dialog-image-panel"], [1, "product-dialog-image-label"], [1, "dialog-actions", "mt-3"], [1, "channel-option"], ["type", "checkbox", 3, "change", "checked"], [1, "form-text", "mt-2"], ["target", "_blank", "rel", "noreferrer", 1, "product-dialog-image-link", 3, "href"], [1, "product-dialog-image-preview", 3, "error", "src", "alt"], [1, "product-dialog-image-empty"], ["role", "dialog", "aria-modal", "true", "aria-labelledby", "branch-dialog-title", 1, "product-dialog", "card"], ["id", "branch-dialog-title", 1, "mb-0"], ["id", "branch-active-toggle", "type", "checkbox", 1, "form-check-input", 3, "ngModelChange", "ngModel"], ["for", "branch-active-toggle", 1, "form-check-label"], [1, "col-md-3"], ["class", "col-12", 4, "ngIf"], [1, "map-overlay-note"], [1, "map-preview-label"], [1, "branch-map-card"], [1, "branch-map-frame", "branch-leaflet-map"], [1, "d-flex", "flex-wrap", "gap-3", "align-items-center", "mt-2"], ["class", "form-text m-0", 4, "ngIf"], [1, "form-text", "m-0"], ["target", "_blank", "rel", "noreferrer", 3, "href"], ["role", "dialog", "aria-modal", "true", "aria-labelledby", "product-dialog-title", 1, "product-dialog", "card"], ["id", "product-dialog-title", 1, "mb-0"], ["id", "product-active-toggle", "type", "checkbox", 1, "form-check-input", 3, "ngModelChange", "ngModel"], ["for", "product-active-toggle", 1, "form-check-label"], [1, "form-select", 3, "ngModelChange", "ngModel"], ["value", ""], [3, "value", 4, "ngFor", "ngForOf"], ["rows", "4", 1, "form-control", 3, "ngModelChange", "ngModel"], [3, "value"], [1, "empty-state", "mt-3"]], template: function MerchantCatalogComponent_Template(rf, ctx) { if (rf & 1) {
            const _r1 = i0.ɵɵgetCurrentView();
            i0.ɵɵelementStart(0, "div", 4)(1, "div", 5);
            i0.ɵɵtext(2, "Merchant Catalog");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(3, "div", 6);
            i0.ɵɵtemplate(4, MerchantCatalogComponent_div_4_Template, 2, 1, "div", 7)(5, MerchantCatalogComponent_div_5_Template, 2, 1, "div", 8);
            i0.ɵɵelementStart(6, "div", 9)(7, "div", 10)(8, "h6");
            i0.ɵɵtext(9, "Search");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(10, "div", 11)(11, "input", 12);
            i0.ɵɵtwoWayListener("ngModelChange", function MerchantCatalogComponent_Template_input_ngModelChange_11_listener($event) { i0.ɵɵrestoreView(_r1); i0.ɵɵtwoWayBindingSet(ctx.catalogSearchTerm, $event) || (ctx.catalogSearchTerm = $event); return i0.ɵɵresetView($event); });
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(12, "button", 13);
            i0.ɵɵlistener("click", function MerchantCatalogComponent_Template_button_click_12_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.runCatalogSearch()); });
            i0.ɵɵtext(13, "Search");
            i0.ɵɵelementEnd();
            i0.ɵɵelementStart(14, "button", 14);
            i0.ɵɵlistener("click", function MerchantCatalogComponent_Template_button_click_14_listener() { i0.ɵɵrestoreView(_r1); return i0.ɵɵresetView(ctx.clearCatalogSearch()); });
            i0.ɵɵtext(15, "Clear");
            i0.ɵɵelementEnd()();
            i0.ɵɵelementStart(16, "div", 15);
            i0.ɵɵtext(17);
            i0.ɵɵelementEnd();
            i0.ɵɵtemplate(18, MerchantCatalogComponent_div_18_Template, 2, 1, "div", 16);
            i0.ɵɵelementEnd()()()();
            i0.ɵɵtemplate(19, MerchantCatalogComponent_ng_container_19_Template, 96, 14, "ng-container", 17)(20, MerchantCatalogComponent_div_20_Template, 8, 1, "div", 18)(21, MerchantCatalogComponent_div_21_Template, 8, 1, "div", 18)(22, MerchantCatalogComponent_div_22_Template, 8, 1, "div", 18)(23, MerchantCatalogComponent_ng_template_23_Template, 2, 0, "ng-template", null, 0, i0.ɵɵtemplateRefExtractor);
        } if (rf & 2) {
            const emptyState_r32 = i0.ɵɵreference(24);
            i0.ɵɵadvance(4);
            i0.ɵɵproperty("ngIf", ctx.errorMessage);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.statusMessage);
            i0.ɵɵadvance(6);
            i0.ɵɵtwoWayProperty("ngModel", ctx.catalogSearchTerm);
            i0.ɵɵadvance(6);
            i0.ɵɵtextInterpolate(ctx.activeSearchHint);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.catalogSearchSummary);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.selectedMerchant)("ngIfElse", emptyState_r32);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.merchantDialogOpen);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.branchDialogOpen);
            i0.ɵɵadvance();
            i0.ɵɵproperty("ngIf", ctx.productDialogOpen);
        } }, dependencies: [CommonModule, i2.NgClass, i2.NgForOf, i2.NgIf, FormsModule, i3.NgSelectOption, i3.ɵNgSelectMultipleOption, i3.DefaultValueAccessor, i3.CheckboxControlValueAccessor, i3.SelectControlValueAccessor, i3.NgControlStatus, i3.NgModel, DisplayDatePipe], styles: [".catalog-search-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  gap: 0.75rem;\n}\n\n.datatable-toolbar[_ngcontent-%COMP%] {\n  padding: 0.75rem;\n  border: 1px solid #e6e8ef;\n  border-radius: 0.85rem;\n  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);\n}\n\n.catalog-search-summary[_ngcontent-%COMP%] {\n  font-size: 0.9rem;\n  color: #4f5d73;\n}\n\n.table-card-toolbar[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n  padding: 0.9rem 1rem;\n  border: 1px solid #eef1f6;\n  border-radius: 0.85rem;\n  background: #fafbfd;\n}\n\n.table-card-label[_ngcontent-%COMP%] {\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #8a93a5;\n}\n\n.table-card-value[_ngcontent-%COMP%] {\n  margin-top: 0.2rem;\n  font-weight: 600;\n  color: #1f2937;\n}\n\n.group-header[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 1rem;\n  padding: 0.75rem 0;\n}\n\n.group-title[_ngcontent-%COMP%] {\n  font-weight: 700;\n  color: #2f353a;\n}\n\n.group-meta[_ngcontent-%COMP%] {\n  font-size: 0.85rem;\n  color: #768192;\n}\n\n.datatable-shell[_ngcontent-%COMP%] {\n  border: 1px solid #eef1f6;\n  border-radius: 0.9rem;\n  overflow: hidden;\n}\n\n.merchant-results-table[_ngcontent-%COMP%]   thead[_ngcontent-%COMP%]   th[_ngcontent-%COMP%] {\n  border-bottom: 1px solid #eef1f6;\n  background: #f9fafb;\n  color: #6b7280;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n\n.merchant-results-table[_ngcontent-%COMP%]   tbody[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  padding-top: 0.9rem;\n  padding-bottom: 0.9rem;\n  border-color: #f1f5f9;\n}\n\n.product-thumb-col[_ngcontent-%COMP%] {\n  width: 52px;\n  padding-right: 0.25rem !important;\n}\n\n.product-thumb[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  object-fit: cover;\n  border-radius: 6px;\n  border: 1px solid #e6e8ef;\n  display: block;\n}\n\n.product-thumb-empty[_ngcontent-%COMP%] {\n  width: 40px;\n  height: 40px;\n  border-radius: 6px;\n  border: 1px dashed #d1d5db;\n  background: #f9fafb;\n}\n\n.product-cell-title[_ngcontent-%COMP%] {\n  font-weight: 700;\n  color: #111827;\n}\n\n.product-cell-subtitle[_ngcontent-%COMP%] {\n  margin-top: 0.2rem;\n  font-size: 0.82rem;\n  color: #6b7280;\n}\n\n.status-tag[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.28rem 0.7rem;\n  border-radius: 999px;\n  font-size: 0.78rem;\n  font-weight: 700;\n  line-height: 1;\n}\n\n.status-tag-success[_ngcontent-%COMP%] {\n  background: #dcfce7;\n  color: #166534;\n}\n\n.status-tag-warning[_ngcontent-%COMP%] {\n  background: #fef3c7;\n  color: #92400e;\n}\n\n.status-tag-danger[_ngcontent-%COMP%] {\n  background: #fee2e2;\n  color: #991b1b;\n}\n\n.status-tag-neutral[_ngcontent-%COMP%] {\n  background: #e5e7eb;\n  color: #374151;\n}\n\n.result-status[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.22rem 0.55rem;\n  border-radius: 999px;\n  background: #f3f4f6;\n  color: #6b7280;\n  font-size: 0.78rem;\n  font-weight: 700;\n}\n\n.result-status-active[_ngcontent-%COMP%] {\n  background: #dcfce7;\n  color: #166534;\n}\n\n.table-footer[_ngcontent-%COMP%] {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 0.75rem 0.1rem 0;\n  color: #6b7280;\n  font-size: 0.82rem;\n}\n\n.row-selected[_ngcontent-%COMP%]   td[_ngcontent-%COMP%] {\n  background: #eef6ff;\n}\n\n.action-cell[_ngcontent-%COMP%] {\n  white-space: nowrap;\n}\n\n.icon-action-btn[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 2rem;\n  height: 2rem;\n  border: 1px solid #dbe2ea;\n  border-radius: 0.6rem;\n  background: #fff;\n  color: #4b5563;\n}\n\n.icon-action-btn[_ngcontent-%COMP%]:hover {\n  background: #f8fafc;\n}\n\n.icon-action-btn-danger[_ngcontent-%COMP%] {\n  color: #b91c1c;\n  border-color: #fecaca;\n}\n\n.empty-state[_ngcontent-%COMP%] {\n  border: 1px dashed #cfd5df;\n  border-radius: 0.5rem;\n  padding: 0.75rem;\n  color: #768192;\n  background: #f8f9fa;\n}\n\n.product-dialog-backdrop[_ngcontent-%COMP%] {\n  position: fixed;\n  inset: 0;\n  z-index: 1050;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  background: rgba(15, 23, 42, 0.45);\n}\n\n.product-dialog[_ngcontent-%COMP%] {\n  width: min(52rem, 100%);\n  max-height: calc(100vh - 3rem);\n  overflow: auto;\n  box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, 0.2);\n  border-radius: 1rem;\n}\n\n.dialog-meta[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.5rem 1rem;\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #f3f4f7;\n  font-size: 0.9rem;\n}\n\n.dialog-actions[_ngcontent-%COMP%] {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n\n.product-dialog-image-panel[_ngcontent-%COMP%] {\n  height: 100%;\n  padding: 0.85rem;\n  border: 1px solid #e6e8ef;\n  border-radius: 0.85rem;\n  background: #fafbfd;\n}\n\n.product-dialog-image-label[_ngcontent-%COMP%] {\n  margin-bottom: 0.55rem;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #8a93a5;\n}\n\n.product-dialog-image-link[_ngcontent-%COMP%] {\n  display: block;\n}\n\n.product-dialog-image-preview[_ngcontent-%COMP%] {\n  width: 100%;\n  max-height: 12rem;\n  object-fit: contain;\n  border-radius: 0.7rem;\n  border: 1px solid #dde3ec;\n  background: #fff;\n}\n\n.product-dialog-image-empty[_ngcontent-%COMP%] {\n  display: grid;\n  place-items: center;\n  min-height: 12rem;\n  padding: 1rem;\n  border: 1px dashed #d1d5db;\n  border-radius: 0.7rem;\n  background: #f8fafc;\n  color: #768192;\n  text-align: center;\n}\n\n.status-switch[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  min-height: 2rem;\n  padding: 0;\n  border: 0;\n  background: transparent;\n}\n\n.status-switch[_ngcontent-%COMP%]   .form-check-input[_ngcontent-%COMP%] {\n  margin-top: 0;\n  margin-left: 0;\n  float: none;\n}\n\n.channel-list[_ngcontent-%COMP%] {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem 1rem;\n  padding-top: 0.35rem;\n}\n\n.channel-option[_ngcontent-%COMP%] {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.45rem;\n  font-size: 0.9rem;\n  color: #374151;\n}\n\n.dialog-note[_ngcontent-%COMP%] {\n  padding: 0.85rem 1rem;\n  border: 1px solid #fde68a;\n  border-radius: 0.75rem;\n  background: #fffbeb;\n  color: #92400e;\n  font-size: 0.9rem;\n}\n\n.branch-map-card[_ngcontent-%COMP%] {\n  overflow: hidden;\n  border: 1px solid #e5e7eb;\n  border-radius: 0.9rem;\n  background: #fff;\n}\n\n.branch-map-grid[_ngcontent-%COMP%] {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n\n.map-preview-label[_ngcontent-%COMP%] {\n  margin-bottom: 0.45rem;\n  font-size: 0.78rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #6b7280;\n}\n\n.map-overlay-note[_ngcontent-%COMP%] {\n  margin-bottom: 0.75rem;\n  padding: 0.75rem 0.9rem;\n  border: 1px solid #dbeafe;\n  border-radius: 0.85rem;\n  background: #eff6ff;\n  color: #1e3a8a;\n  font-size: 0.9rem;\n}\n\n.branch-map-frame[_ngcontent-%COMP%] {\n  display: block;\n  width: 100%;\n  height: 18rem;\n  border: 0;\n}\n\n.branch-leaflet-map[_ngcontent-%COMP%] {\n  min-height: 18rem;\n}\n\n.dialog-section[_ngcontent-%COMP%] {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #8a93a5;\n}\n\n.dialog-section[_ngcontent-%COMP%]::after {\n  content: '';\n  flex: 1;\n  height: 1px;\n  background: #e6e8ef;\n}\n\n.required[_ngcontent-%COMP%]::after {\n  content: ' *';\n  color: #e55353;\n}\n\n@media (max-width: 991.98px) {\n  .dialog-meta[_ngcontent-%COMP%], \n   .catalog-search-grid[_ngcontent-%COMP%], \n   .table-card-toolbar[_ngcontent-%COMP%], \n   .branch-map-grid[_ngcontent-%COMP%] {\n    grid-template-columns: 1fr;\n  }\n\n  .group-header[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n\n  .table-footer[_ngcontent-%COMP%] {\n    flex-direction: column;\n  }\n}"] });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MerchantCatalogComponent, [{
        type: Component,
        args: [{ selector: 'app-merchant-catalog', standalone: true, imports: [CommonModule, FormsModule, DisplayDatePipe], template: "<div class=\"card mb-4\">\n  <div class=\"card-header\">Merchant Catalog</div>\n  <div class=\"card-body\">\n    <div class=\"alert alert-danger mb-3\" *ngIf=\"errorMessage\">{{ errorMessage }}</div>\n    <div class=\"alert alert-success mb-3\" *ngIf=\"statusMessage\">{{ statusMessage }}</div>\n\n    <div class=\"row g-3 align-items-start\">\n      <div class=\"col-xl-8\">\n        <h6>Search</h6>\n        <div class=\"catalog-search-grid datatable-toolbar\">\n          <input\n            class=\"form-control\"\n            [(ngModel)]=\"catalogSearchTerm\"\n            placeholder=\"Enter merchant ID\"\n          />\n          <button class=\"btn btn-primary\" type=\"button\" (click)=\"runCatalogSearch()\">Search</button>\n          <button class=\"btn btn-outline-secondary\" type=\"button\" (click)=\"clearCatalogSearch()\">Clear</button>\n        </div>\n        <div class=\"form-text\">{{ activeSearchHint }}</div>\n        <div class=\"catalog-search-summary mt-2\" *ngIf=\"catalogSearchSummary\">{{ catalogSearchSummary }}</div>\n      </div>\n    </div>\n  </div>\n</div>\n\n<ng-container *ngIf=\"selectedMerchant as merchant; else emptyState\">\n  <div class=\"row g-4\">\n    <div class=\"col-12\">\n      <div class=\"card\">\n        <div class=\"card-header d-flex justify-content-between align-items-center\">\n          <span>Merchant</span>\n          <span class=\"badge text-bg-light\">1 row</span>\n        </div>\n        <div class=\"card-body\">\n          <div class=\"table-responsive datatable-shell\">\n            <table class=\"table table-sm align-middle mb-0 merchant-results-table\">\n              <thead>\n                <tr>\n                  <th>Merchant Name</th>\n                  <th>City</th>\n                  <th>Status</th>\n                  <th>Logo</th>\n                  <th></th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr>\n                  <td>{{ merchant.legalBusinessName || merchant.applicationReference }}</td>\n                  <td>{{ merchantLocation?.city || '\u2014' }}</td>\n                  <td>\n                    <span class=\"status-tag\" [ngClass]=\"merchantStatusTone(merchant.status)\">{{ merchant.status }}</span>\n                  </td>\n                  <td class=\"product-thumb-col\">\n                    <img\n                      *ngIf=\"merchant.logoUrl && !merchantTableLogoFailed\"\n                      [src]=\"merchant.logoUrl\"\n                      [alt]=\"merchant.legalBusinessName || merchant.applicationReference\"\n                      class=\"product-thumb\"\n                      (error)=\"onMerchantTableLogoError()\"\n                    />\n                    <div *ngIf=\"!merchant.logoUrl || merchantTableLogoFailed\" class=\"product-thumb-empty\"></div>\n                  </td>\n                  <td class=\"text-end\">\n                    <button class=\"icon-action-btn\" type=\"button\" aria-label=\"Edit merchant\" (click)=\"openMerchantDialog()\">\n                      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z\"/></svg>\n                    </button>\n                  </td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-lg-5\">\n      <div class=\"card h-100\">\n        <div class=\"card-header d-flex justify-content-between align-items-center\">\n          <span>Branches</span>\n          <span class=\"badge text-bg-light\">{{ branches.length }} rows</span>\n        </div>\n        <div class=\"card-body\">\n          <div class=\"table-responsive datatable-shell\">\n            <table class=\"table table-sm align-middle mb-0 merchant-results-table\">\n              <thead>\n                <tr>\n                  <th>Name</th>\n                  <th>City</th>\n                  <th>Address</th>\n                  <th>Status</th>\n                  <th></th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr\n                  *ngFor=\"let branch of branches\"\n                  [class.row-selected]=\"selectedBranch?.branchId === branch.branchId\"\n                  (click)=\"selectBranch(branch)\"\n                >\n                  <td>{{ branch.name }}</td>\n                  <td>{{ branch.city || '\u2014' }}</td>\n                  <td>{{ branch.addressLine1 || branch.addressLine2 || '\u2014' }}</td>\n                  <td>\n                    <span class=\"status-tag\" [ngClass]=\"branchStatusTone(branch)\">{{ branchStatusLabel(branch) }}</span>\n                  </td>\n                  <td class=\"text-end\">\n                    <button class=\"icon-action-btn me-1\" type=\"button\" aria-label=\"Edit branch\" (click)=\"openBranchDialog(branch); $event.stopPropagation()\">\n                      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z\"/></svg>\n                    </button>\n                    <button class=\"icon-action-btn icon-action-btn-danger\" type=\"button\" aria-label=\"Delete branch\" (click)=\"removeBranch(branch); $event.stopPropagation()\">\n                      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>\n                    </button>\n                  </td>\n                </tr>\n                <tr *ngIf=\"!branches.length\">\n                  <td colspan=\"5\" class=\"text-center text-body-secondary\">No branches for this merchant.</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n          <div class=\"table-footer\">\n            <span>Click a branch row to drive the product table.</span>\n            <span>{{ selectedBranch?.name || 'No branch selected' }}</span>\n          </div>\n        </div>\n      </div>\n    </div>\n\n    <div class=\"col-lg-7\">\n      <div class=\"card h-100\">\n        <div class=\"card-header d-flex justify-content-between align-items-center\">\n          <span>Products</span>\n          <span class=\"badge text-bg-light\">{{ visibleProductRows.length }} rows</span>\n        </div>\n        <div class=\"card-body\">\n          <div class=\"table-card-toolbar mb-3\">\n            <div>\n              <div class=\"table-card-label\">Branch Scope</div>\n              <div class=\"table-card-value\">{{ selectedBranch?.name || 'Select a branch' }}</div>\n            </div>\n          </div>\n\n          <div class=\"table-responsive datatable-shell\">\n            <table class=\"table table-sm align-middle mb-0 merchant-results-table\">\n              <thead>\n                <tr>\n                  <th class=\"product-thumb-col\"></th>\n                  <th>Product</th>\n                  <th>Status</th>\n                  <th class=\"text-end\">Actions</th>\n                </tr>\n              </thead>\n              <tbody>\n                <tr *ngFor=\"let product of visibleProductRows\">\n                  <td class=\"product-thumb-col\">\n                    <img\n                      *ngIf=\"product.imageUrl && !failedProductImages.has(product.productId)\"\n                      [src]=\"product.imageUrl\"\n                      [alt]=\"product.name\"\n                      class=\"product-thumb\"\n                      (error)=\"onProductImageError(product.productId)\"\n                    />\n                    <div *ngIf=\"!product.imageUrl || failedProductImages.has(product.productId)\" class=\"product-thumb-empty\"></div>\n                  </td>\n                  <td>\n                    <div class=\"product-cell-title\">{{ product.name }}</div>\n                    <div class=\"product-cell-subtitle\">{{ product.description || 'No description' }}</div>\n                  </td>\n                  <td>\n                    <span class=\"status-tag\" [ngClass]=\"productStatusTone(product)\">{{ productStatusLabel(product) }}</span>\n                  </td>\n                  <td class=\"text-end action-cell\">\n                    <button class=\"btn btn-sm btn-outline-primary me-2\" type=\"button\" aria-label=\"Edit product\" (click)=\"openProduct(product)\">\n                      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zm14.71-9.04a1.003 1.003 0 0 0 0-1.42l-2.5-2.5a1.003 1.003 0 0 0-1.42 0l-1.96 1.96 3.75 3.75 2.13-1.79z\"/></svg>\n                      <span class=\"ms-1\">Edit</span>\n                    </button>\n                    <button class=\"btn btn-sm btn-outline-danger\" type=\"button\" aria-label=\"Delete product\" (click)=\"removeProduct(product)\">\n                      <svg viewBox=\"0 0 24 24\" width=\"16\" height=\"16\"><path fill=\"currentColor\" d=\"M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z\"/></svg>\n                      <span class=\"ms-1\">Delete</span>\n                    </button>\n                  </td>\n                </tr>\n                <tr *ngIf=\"!visibleProductRows.length\">\n                  <td colspan=\"3\" class=\"text-center text-body-secondary\">{{ selectedBranch ? 'No products for the selected branch.' : 'Select a branch to load products.' }}</td>\n                </tr>\n              </tbody>\n            </table>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</ng-container>\n\n<div class=\"product-dialog-backdrop\" *ngIf=\"merchantDialogOpen\">\n  <div class=\"product-dialog card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"merchant-dialog-title\">\n    <div class=\"card-header d-flex justify-content-between align-items-center\">\n      <h5 id=\"merchant-dialog-title\" class=\"mb-0\">Edit Merchant</h5>\n      <button class=\"btn btn-sm btn-outline-secondary\" type=\"button\" (click)=\"closeMerchantDialog()\">Close</button>\n    </div>\n    <div class=\"card-body\" *ngIf=\"selectedMerchant as merchant\">\n      <div class=\"dialog-meta\">\n        <div><strong>Merchant:</strong> {{ merchant.legalBusinessName || merchant.applicationReference }}</div>\n        <div><strong>Merchant ID:</strong> {{ merchant.applicationId }}</div>\n        <div><strong>Updated:</strong> {{ merchant.lastUpdatedAt | displayDate }}</div>\n      </div>\n\n      <div class=\"row g-3 mt-1\">\n        <div class=\"col-md-6\">\n          <label class=\"form-label required\">Merchant Name</label>\n          <input class=\"form-control\" [(ngModel)]=\"merchantForm.legalBusinessName\" (ngModelChange)=\"dirtyForms.merchant = true\" />\n        </div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label d-block\">Status</label>\n          <div class=\"form-check form-switch status-switch\">\n            <input\n              id=\"merchant-active-toggle\"\n              class=\"form-check-input\"\n              type=\"checkbox\"\n              [ngModel]=\"merchantForm.status === 'ACTIVE'\"\n              (ngModelChange)=\"onMerchantActiveToggle($event)\"\n            />\n            <label class=\"form-check-label\" for=\"merchant-active-toggle\">\n              {{ merchantForm.status === 'ACTIVE' ? 'Active' : 'Inactive' }}\n            </label>\n          </div>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Address</div></div>\n        <div class=\"col-12\">\n          <label class=\"form-label required\">Primary Business Address</label>\n          <input class=\"form-control\" [(ngModel)]=\"merchantForm.primaryBusinessAddress\" (ngModelChange)=\"dirtyForms.merchant = true\" />\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Contact</div></div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label required\">Contact Name</label>\n          <input class=\"form-control\" [(ngModel)]=\"merchantForm.contactFullName\" (ngModelChange)=\"dirtyForms.merchant = true\" />\n        </div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label required\">Contact Email</label>\n          <input class=\"form-control\" [(ngModel)]=\"merchantForm.contactEmail\" (ngModelChange)=\"dirtyForms.merchant = true\" />\n        </div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label required\">Contact Phone</label>\n          <input class=\"form-control\" [(ngModel)]=\"merchantForm.contactPhoneNumber\" (ngModelChange)=\"dirtyForms.merchant = true\" />\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Payment</div></div>\n        <div class=\"col-12\">\n          <label class=\"form-label\">Active Payment Channels</label>\n          <div class=\"channel-list\">\n            <label class=\"channel-option\" *ngFor=\"let channel of paymentChannelOptions\">\n              <input\n                type=\"checkbox\"\n                [checked]=\"hasChannel(merchantForm.activePaymentChannels, channel)\"\n                (change)=\"toggleMerchantChannel(channel, $any($event.target).checked)\"\n              />\n              <span>{{ channel }}</span>\n            </label>\n          </div>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Logo</div></div>\n        <div class=\"col-md-7\">\n          <label class=\"form-label\">Logo File</label>\n          <input class=\"form-control\" type=\"file\" accept=\"image/*\" (change)=\"onMerchantLogoFileSelected($event)\" />\n          <div class=\"form-text mt-2\" *ngIf=\"merchantLogoSelectedFileName\">\n            Selected file: {{ merchantLogoSelectedFileName }}\n          </div>\n        </div>\n        <div class=\"col-md-5\">\n          <div class=\"product-dialog-image-panel\">\n            <div class=\"product-dialog-image-label\">Logo preview</div>\n            <ng-container *ngIf=\"merchantLogoImageUrl as imageUrl; else emptyMerchantLogoImage\">\n              <a class=\"product-dialog-image-link\" [href]=\"imageUrl\" target=\"_blank\" rel=\"noreferrer\">\n                <img\n                  class=\"product-dialog-image-preview\"\n                  [src]=\"imageUrl\"\n                  [alt]=\"merchant.legalBusinessName || merchant.applicationReference\"\n                  (error)=\"onMerchantLogoError()\"\n                />\n              </a>\n            </ng-container>\n            <ng-template #emptyMerchantLogoImage>\n              <div class=\"product-dialog-image-empty\">No logo available</div>\n            </ng-template>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"dialog-actions mt-3\">\n        <button class=\"btn btn-primary\" type=\"button\" (click)=\"saveMerchant()\">Save changes</button>\n        <button class=\"btn btn-outline-secondary\" type=\"button\" (click)=\"closeMerchantDialog()\">Cancel</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"product-dialog-backdrop\" *ngIf=\"branchDialogOpen\">\n  <div class=\"product-dialog card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"branch-dialog-title\">\n    <div class=\"card-header d-flex justify-content-between align-items-center\">\n      <h5 id=\"branch-dialog-title\" class=\"mb-0\">Edit Branch</h5>\n      <button class=\"btn btn-sm btn-outline-secondary\" type=\"button\" (click)=\"closeBranchDialog()\">Close</button>\n    </div>\n    <div class=\"card-body\" *ngIf=\"selectedBranch as branch\">\n      <div class=\"dialog-meta\">\n        <div><strong>Branch:</strong> {{ branch.name }}</div>\n        <div><strong>Branch ID:</strong> {{ branch.branchId || branch.id || '\u2014' }}</div>\n        <div><strong>Merchant ID:</strong> {{ branch.merchantId }}</div>\n        <div><strong>City:</strong> {{ branch.city || '\u2014' }}</div>\n      </div>\n\n      <div class=\"row g-3 mt-1\">\n        <div class=\"col-md-6\">\n          <label class=\"form-label\">Name</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.name\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label d-block\">Status</label>\n          <div class=\"form-check form-switch status-switch\">\n            <input\n              id=\"branch-active-toggle\"\n              class=\"form-check-input\"\n              type=\"checkbox\"\n              [(ngModel)]=\"branchForm.active\"\n              (ngModelChange)=\"dirtyForms.branch = true\"\n            />\n            <label class=\"form-check-label\" for=\"branch-active-toggle\">\n              {{ branchForm.active ? 'Active' : 'Inactive' }}\n            </label>\n          </div>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Address</div></div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label\">Address 1</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.addressLine1\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label\">Address 2</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.addressLine2\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-3\">\n          <label class=\"form-label\">Post Code</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.postalCode\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-3\">\n          <label class=\"form-label\">City</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.city\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-3\">\n          <label class=\"form-label\">Country</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.country\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-3\">\n          <label class=\"form-label\">Google Place ID</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.googlePlaceId\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Contact</div></div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label\">Contact Name</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.contactFullName\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label\">Contact Email</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.contactEmail\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label\">Contact Phone</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.contactPhoneNumber\" (ngModelChange)=\"dirtyForms.branch = true\" />\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Location</div></div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label\">Latitude</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.latitude\" (ngModelChange)=\"dirtyForms.branch = true; refreshBranchMapPreview()\" />\n        </div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label\">Longitude</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.longitude\" (ngModelChange)=\"dirtyForms.branch = true; refreshBranchMapPreview()\" />\n        </div>\n        <div class=\"col-md-4\">\n          <label class=\"form-label\">Geofence</label>\n          <input class=\"form-control\" [(ngModel)]=\"branchForm.geofenceRadiusMeters\" (ngModelChange)=\"dirtyForms.branch = true; refreshBranchMapPreview()\" />\n        </div>\n        <div class=\"col-12\" *ngIf=\"hasBranchCoordinates\">\n          <label class=\"form-label\">Map Preview</label>\n          <div class=\"map-overlay-note\">\n            <strong>Overlay:</strong>\n            {{ branchGeofenceRadius && branchGeofenceRadius > 0 ? ('Geofence circle at ' + branchGeofenceRadius + ' meters') : 'No geofence radius set, so only the branch marker is shown.' }}\n          </div>\n          <div>\n            <div class=\"map-preview-label\">Leaflet + OpenStreetMap</div>\n            <div class=\"branch-map-card\">\n              <div #leafletBranchMap class=\"branch-map-frame branch-leaflet-map\"></div>\n            </div>\n          </div>\n          <div class=\"d-flex flex-wrap gap-3 align-items-center mt-2\">\n            <button class=\"btn btn-sm btn-outline-secondary\" type=\"button\" (click)=\"refreshBranchMapPreview()\">Refresh interactive map</button>\n            <div class=\"form-text m-0\" *ngIf=\"branchMapLink\">\n              <a [href]=\"branchMapLink\" target=\"_blank\" rel=\"noreferrer\">Open full map</a>\n            </div>\n          </div>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Payment</div></div>\n        <div class=\"col-12\">\n          <label class=\"form-label\">Active Payment Channels</label>\n          <div class=\"channel-list\">\n            <label class=\"channel-option\" *ngFor=\"let channel of paymentChannelOptions\">\n              <input\n                type=\"checkbox\"\n                [checked]=\"hasChannel(branchForm.activePaymentChannels, channel)\"\n                (change)=\"toggleBranchChannel(channel, $any($event.target).checked)\"\n              />\n              <span>{{ channel }}</span>\n            </label>\n          </div>\n        </div>\n      </div>\n\n      <div class=\"dialog-actions mt-3\">\n        <button class=\"btn btn-primary\" type=\"button\" (click)=\"saveBranch()\">Save branch</button>\n        <button class=\"btn btn-outline-secondary\" type=\"button\" (click)=\"closeBranchDialog()\">Cancel</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<div class=\"product-dialog-backdrop\" *ngIf=\"productDialogOpen\">\n  <div class=\"product-dialog card\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"product-dialog-title\">\n    <div class=\"card-header d-flex justify-content-between align-items-center\">\n      <h5 id=\"product-dialog-title\" class=\"mb-0\">Edit Product</h5>\n      <button class=\"btn btn-sm btn-outline-secondary\" type=\"button\" (click)=\"closeProductDialog()\">Close</button>\n    </div>\n    <div class=\"card-body\" *ngIf=\"selectedProduct as product\">\n      <div class=\"dialog-meta\">\n        <div><strong>Product ID:</strong> {{ product.productId }}</div>\n        <div><strong>Merchant ID:</strong> {{ product.merchantId }}</div>\n        <div><strong>Current branch:</strong> {{ product.branchId || 'Merchant-level product' }}</div>\n        <div><strong>Updated:</strong> {{ product.updatedAt | displayDate }}</div>\n      </div>\n\n      <div class=\"row g-3 mt-1\">\n        <div class=\"col-md-6\">\n          <label class=\"form-label required\">Name</label>\n          <input class=\"form-control\" [(ngModel)]=\"productEditForm.name\" (ngModelChange)=\"dirtyForms.editProduct = true\" />\n        </div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label d-block\">Status</label>\n          <div class=\"form-check form-switch status-switch\">\n            <input\n              id=\"product-active-toggle\"\n              class=\"form-check-input\"\n              type=\"checkbox\"\n              [(ngModel)]=\"productEditForm.active\"\n              (ngModelChange)=\"onProductStatusToggle($event)\"\n            />\n            <label class=\"form-check-label\" for=\"product-active-toggle\">\n              {{ productEditForm.active ? 'Active' : 'Inactive' }}\n            </label>\n          </div>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Pricing</div></div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label required\">Unit Price</label>\n          <input class=\"form-control\" [(ngModel)]=\"productEditForm.unitPrice\" (ngModelChange)=\"dirtyForms.editProduct = true\" />\n        </div>\n        <div class=\"col-md-6\">\n          <label class=\"form-label\">Branch</label>\n          <select class=\"form-select\" [(ngModel)]=\"productEditForm.branchId\" (ngModelChange)=\"dirtyForms.editProduct = true\">\n            <option value=\"\">No branch</option>\n            <option *ngFor=\"let branch of branches\" [value]=\"branch.branchId\">{{ branch.name }}</option>\n          </select>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Media</div></div>\n        <div class=\"col-md-7\">\n          <label class=\"form-label\">Image</label>\n          <input class=\"form-control\" type=\"file\" accept=\"image/*\" (change)=\"onFileSelected($event)\" />\n        </div>\n        <div class=\"col-md-5\">\n          <div class=\"product-dialog-image-panel\">\n            <div class=\"product-dialog-image-label\">Current image</div>\n            <ng-container *ngIf=\"productDialogImageUrl as imageUrl; else emptyProductDialogImage\">\n              <a class=\"product-dialog-image-link\" [href]=\"imageUrl\" target=\"_blank\" rel=\"noreferrer\">\n                <img\n                  class=\"product-dialog-image-preview\"\n                  [src]=\"imageUrl\"\n                  [alt]=\"productEditForm.name || product.name\"\n                  (error)=\"onProductDialogImageError()\"\n                />\n              </a>\n            </ng-container>\n            <ng-template #emptyProductDialogImage>\n              <div class=\"product-dialog-image-empty\">No image available</div>\n            </ng-template>\n          </div>\n        </div>\n        <div class=\"col-12\"><div class=\"dialog-section\">Details</div></div>\n        <div class=\"col-12\">\n          <label class=\"form-label\">Description</label>\n          <textarea class=\"form-control\" rows=\"4\" [(ngModel)]=\"productEditForm.description\" (ngModelChange)=\"dirtyForms.editProduct = true\"></textarea>\n        </div>\n      </div>\n\n      <div class=\"dialog-actions mt-3\">\n        <button class=\"btn btn-primary\" type=\"button\" (click)=\"updateProduct()\">Save changes</button>\n        <button class=\"btn btn-outline-secondary\" type=\"button\" (click)=\"closeProductDialog()\">Cancel</button>\n      </div>\n    </div>\n  </div>\n</div>\n\n<ng-template #emptyState>\n  <div class=\"empty-state mt-3\">Search for a merchant to load the merchant, branch, and product tables.</div>\n</ng-template>\n", styles: [".catalog-search-grid {\n  display: grid;\n  grid-template-columns: minmax(0, 1fr) auto auto;\n  gap: 0.75rem;\n}\n\n.datatable-toolbar {\n  padding: 0.75rem;\n  border: 1px solid #e6e8ef;\n  border-radius: 0.85rem;\n  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);\n}\n\n.catalog-search-summary {\n  font-size: 0.9rem;\n  color: #4f5d73;\n}\n\n.table-card-toolbar {\n  display: grid;\n  grid-template-columns: repeat(3, minmax(0, 1fr));\n  gap: 0.75rem;\n  margin-bottom: 1rem;\n  padding: 0.9rem 1rem;\n  border: 1px solid #eef1f6;\n  border-radius: 0.85rem;\n  background: #fafbfd;\n}\n\n.table-card-label {\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #8a93a5;\n}\n\n.table-card-value {\n  margin-top: 0.2rem;\n  font-weight: 600;\n  color: #1f2937;\n}\n\n.group-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: flex-start;\n  gap: 1rem;\n  padding: 0.75rem 0;\n}\n\n.group-title {\n  font-weight: 700;\n  color: #2f353a;\n}\n\n.group-meta {\n  font-size: 0.85rem;\n  color: #768192;\n}\n\n.datatable-shell {\n  border: 1px solid #eef1f6;\n  border-radius: 0.9rem;\n  overflow: hidden;\n}\n\n.merchant-results-table thead th {\n  border-bottom: 1px solid #eef1f6;\n  background: #f9fafb;\n  color: #6b7280;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n}\n\n.merchant-results-table tbody td {\n  padding-top: 0.9rem;\n  padding-bottom: 0.9rem;\n  border-color: #f1f5f9;\n}\n\n.product-thumb-col {\n  width: 52px;\n  padding-right: 0.25rem !important;\n}\n\n.product-thumb {\n  width: 40px;\n  height: 40px;\n  object-fit: cover;\n  border-radius: 6px;\n  border: 1px solid #e6e8ef;\n  display: block;\n}\n\n.product-thumb-empty {\n  width: 40px;\n  height: 40px;\n  border-radius: 6px;\n  border: 1px dashed #d1d5db;\n  background: #f9fafb;\n}\n\n.product-cell-title {\n  font-weight: 700;\n  color: #111827;\n}\n\n.product-cell-subtitle {\n  margin-top: 0.2rem;\n  font-size: 0.82rem;\n  color: #6b7280;\n}\n\n.status-tag {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.28rem 0.7rem;\n  border-radius: 999px;\n  font-size: 0.78rem;\n  font-weight: 700;\n  line-height: 1;\n}\n\n.status-tag-success {\n  background: #dcfce7;\n  color: #166534;\n}\n\n.status-tag-warning {\n  background: #fef3c7;\n  color: #92400e;\n}\n\n.status-tag-danger {\n  background: #fee2e2;\n  color: #991b1b;\n}\n\n.status-tag-neutral {\n  background: #e5e7eb;\n  color: #374151;\n}\n\n.result-status {\n  display: inline-flex;\n  align-items: center;\n  padding: 0.22rem 0.55rem;\n  border-radius: 999px;\n  background: #f3f4f6;\n  color: #6b7280;\n  font-size: 0.78rem;\n  font-weight: 700;\n}\n\n.result-status-active {\n  background: #dcfce7;\n  color: #166534;\n}\n\n.table-footer {\n  display: flex;\n  justify-content: space-between;\n  gap: 1rem;\n  padding: 0.75rem 0.1rem 0;\n  color: #6b7280;\n  font-size: 0.82rem;\n}\n\n.row-selected td {\n  background: #eef6ff;\n}\n\n.action-cell {\n  white-space: nowrap;\n}\n\n.icon-action-btn {\n  display: inline-flex;\n  align-items: center;\n  justify-content: center;\n  width: 2rem;\n  height: 2rem;\n  border: 1px solid #dbe2ea;\n  border-radius: 0.6rem;\n  background: #fff;\n  color: #4b5563;\n}\n\n.icon-action-btn:hover {\n  background: #f8fafc;\n}\n\n.icon-action-btn-danger {\n  color: #b91c1c;\n  border-color: #fecaca;\n}\n\n.empty-state {\n  border: 1px dashed #cfd5df;\n  border-radius: 0.5rem;\n  padding: 0.75rem;\n  color: #768192;\n  background: #f8f9fa;\n}\n\n.product-dialog-backdrop {\n  position: fixed;\n  inset: 0;\n  z-index: 1050;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  padding: 1.5rem;\n  background: rgba(15, 23, 42, 0.45);\n}\n\n.product-dialog {\n  width: min(52rem, 100%);\n  max-height: calc(100vh - 3rem);\n  overflow: auto;\n  box-shadow: 0 1rem 2.5rem rgba(15, 23, 42, 0.2);\n  border-radius: 1rem;\n}\n\n.dialog-meta {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 0.5rem 1rem;\n  padding: 0.75rem;\n  border-radius: 0.5rem;\n  background: #f3f4f7;\n  font-size: 0.9rem;\n}\n\n.dialog-actions {\n  display: flex;\n  gap: 0.75rem;\n  flex-wrap: wrap;\n}\n\n.product-dialog-image-panel {\n  height: 100%;\n  padding: 0.85rem;\n  border: 1px solid #e6e8ef;\n  border-radius: 0.85rem;\n  background: #fafbfd;\n}\n\n.product-dialog-image-label {\n  margin-bottom: 0.55rem;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #8a93a5;\n}\n\n.product-dialog-image-link {\n  display: block;\n}\n\n.product-dialog-image-preview {\n  width: 100%;\n  max-height: 12rem;\n  object-fit: contain;\n  border-radius: 0.7rem;\n  border: 1px solid #dde3ec;\n  background: #fff;\n}\n\n.product-dialog-image-empty {\n  display: grid;\n  place-items: center;\n  min-height: 12rem;\n  padding: 1rem;\n  border: 1px dashed #d1d5db;\n  border-radius: 0.7rem;\n  background: #f8fafc;\n  color: #768192;\n  text-align: center;\n}\n\n.status-switch {\n  display: flex;\n  align-items: center;\n  min-height: 2rem;\n  padding: 0;\n  border: 0;\n  background: transparent;\n}\n\n.status-switch .form-check-input {\n  margin-top: 0;\n  margin-left: 0;\n  float: none;\n}\n\n.channel-list {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 0.75rem 1rem;\n  padding-top: 0.35rem;\n}\n\n.channel-option {\n  display: inline-flex;\n  align-items: center;\n  gap: 0.45rem;\n  font-size: 0.9rem;\n  color: #374151;\n}\n\n.dialog-note {\n  padding: 0.85rem 1rem;\n  border: 1px solid #fde68a;\n  border-radius: 0.75rem;\n  background: #fffbeb;\n  color: #92400e;\n  font-size: 0.9rem;\n}\n\n.branch-map-card {\n  overflow: hidden;\n  border: 1px solid #e5e7eb;\n  border-radius: 0.9rem;\n  background: #fff;\n}\n\n.branch-map-grid {\n  display: grid;\n  grid-template-columns: repeat(2, minmax(0, 1fr));\n  gap: 1rem;\n}\n\n.map-preview-label {\n  margin-bottom: 0.45rem;\n  font-size: 0.78rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #6b7280;\n}\n\n.map-overlay-note {\n  margin-bottom: 0.75rem;\n  padding: 0.75rem 0.9rem;\n  border: 1px solid #dbeafe;\n  border-radius: 0.85rem;\n  background: #eff6ff;\n  color: #1e3a8a;\n  font-size: 0.9rem;\n}\n\n.branch-map-frame {\n  display: block;\n  width: 100%;\n  height: 18rem;\n  border: 0;\n}\n\n.branch-leaflet-map {\n  min-height: 18rem;\n}\n\n.dialog-section {\n  display: flex;\n  align-items: center;\n  gap: 0.75rem;\n  font-size: 0.72rem;\n  font-weight: 700;\n  letter-spacing: 0.04em;\n  text-transform: uppercase;\n  color: #8a93a5;\n}\n\n.dialog-section::after {\n  content: '';\n  flex: 1;\n  height: 1px;\n  background: #e6e8ef;\n}\n\n.required::after {\n  content: ' *';\n  color: #e55353;\n}\n\n@media (max-width: 991.98px) {\n  .dialog-meta,\n  .catalog-search-grid,\n  .table-card-toolbar,\n  .branch-map-grid {\n    grid-template-columns: 1fr;\n  }\n\n  .group-header {\n    flex-direction: column;\n  }\n\n  .table-footer {\n    flex-direction: column;\n  }\n}\n"] }]
    }], () => [{ type: i1.MerchantApiService }], { leafletBranchMapElement: [{
            type: ViewChild,
            args: ['leafletBranchMap']
        }] }); })();
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassDebugInfo(MerchantCatalogComponent, { className: "MerchantCatalogComponent", filePath: "src/app/merchant-catalog/merchant-catalog.component.ts", lineNumber: 33 }); })();
