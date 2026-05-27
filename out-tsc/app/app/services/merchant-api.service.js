import { HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { buildApiBaseUrl } from './merchant-environment.service';
import * as i0 from "@angular/core";
import * as i1 from "@angular/common/http";
export class MerchantApiService {
    http;
    constructor(http) {
        this.http = http;
    }
    getMerchant(environment, apiVersion, merchantId) {
        // Bearer credentials are injected centrally by the auth interceptor.
        return this.http.get(`${this.base(environment, apiVersion)}/merchants/${merchantId}`);
    }
    updateMerchant(environment, apiVersion, merchantId, payload) {
        return this.http.put(`${this.base(environment, apiVersion)}/merchants/${merchantId}`, payload);
    }
    getLocation(environment, apiVersion, merchantId) {
        return this.http.get(`${this.base(environment, apiVersion)}/merchants/${merchantId}/location`);
    }
    saveLocation(environment, apiVersion, merchantId, payload) {
        return this.http.put(`${this.base(environment, apiVersion)}/merchants/${merchantId}/location`, payload);
    }
    removeLocation(environment, apiVersion, merchantId) {
        return this.http.delete(`${this.base(environment, apiVersion)}/merchants/${merchantId}/location`);
    }
    getBranches(environment, apiVersion, merchantId) {
        return this.http.get(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches`);
    }
    createBranch(environment, apiVersion, merchantId, payload) {
        return this.http.post(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches`, payload);
    }
    getBranch(environment, apiVersion, merchantId, branchId) {
        return this.http.get(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}`);
    }
    updateBranch(environment, apiVersion, merchantId, branchId, payload) {
        return this.http.put(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}`, payload);
    }
    deleteBranch(environment, apiVersion, merchantId, branchId) {
        return this.http.delete(`${this.base(environment, apiVersion)}/merchants/${merchantId}/branches/${branchId}`);
    }
    getProducts(environment, apiVersion, merchantId, branchId) {
        const params = new HttpParams().set('branchId', branchId);
        return this.http
            .get(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products`, { params })
            .pipe(map((response) => Array.isArray(response) ? response : (response.products ?? [])));
    }
    createProduct(environment, apiVersion, merchantId, payload) {
        return this.http.post(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products`, payload);
    }
    getProduct(environment, apiVersion, merchantId, productId, branchId) {
        const params = branchId ? new HttpParams().set('branchId', branchId) : undefined;
        return this.http.get(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}`, { params });
    }
    updateProduct(environment, apiVersion, merchantId, productId, payload) {
        return this.http.put(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}`, payload);
    }
    removeProduct(environment, apiVersion, merchantId, productId, branchId) {
        const params = branchId ? new HttpParams().set('branchId', branchId) : undefined;
        return this.http.delete(`${this.base(environment, apiVersion)}/merchants/${merchantId}/products/${productId}`, { params });
    }
    updateLogo(environment, apiVersion, merchantId, payload) {
        return this.http.put(`${this.base(environment, apiVersion)}/merchants/${merchantId}/logo`, payload);
    }
    createLogoUploadUrl(environment, apiVersion, merchantId, contentType) {
        return this.http.post(`${this.base(environment, apiVersion)}/merchants/${merchantId}/logo/upload-url`, {
            contentType
        });
    }
    uploadMerchantLogo(uploadUrl, file) {
        return this.http.put(uploadUrl, file, {
            headers: new HttpHeaders({ 'Content-Type': file.type || 'application/octet-stream' }),
            responseType: 'text'
        });
    }
    base(environment, apiVersion) {
        return buildApiBaseUrl(environment, apiVersion);
    }
    static ɵfac = function MerchantApiService_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || MerchantApiService)(i0.ɵɵinject(i1.HttpClient)); };
    static ɵprov = /*@__PURE__*/ i0.ɵɵdefineInjectable({ token: MerchantApiService, factory: MerchantApiService.ɵfac, providedIn: 'root' });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(MerchantApiService, [{
        type: Injectable,
        args: [{ providedIn: 'root' }]
    }], () => [{ type: i1.HttpClient }], null); })();
