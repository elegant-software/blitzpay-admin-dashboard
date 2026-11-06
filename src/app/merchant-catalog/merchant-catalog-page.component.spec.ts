import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { MultiSelect } from "primeng/multiselect";
import { provideRouter } from "@angular/router";
import { of, Subject, throwError } from "rxjs";
import {
  MerchantSearchRequest,
  MerchantSearchResponse,
} from "../models/merchant-catalog.models";
import { MerchantApiService } from "../services/merchant-api.service";
import { MerchantCatalogComponent } from "./merchant-catalog.component";
import { NotificationService } from "../notifications/notification.service";

describe("MerchantCatalogComponent", () => {
  let fixture: ComponentFixture<MerchantCatalogComponent>;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const merchant = {
    merchantId: "merchant-123",
    merchantName: "Northstar Coffee",
    merchantCode: "NS-001",
    city: "Berlin",
    country: "DE",
    businessType: "FOOD_AND_BEVERAGE",
    merchantMobility: "BRICK_AND_MORTAR",
    merchantStatus: "ACTIVE",
    lastUpdatedAt: "2026-11-01T10:30:00.000Z",
  };

  beforeEach(async () => {
    merchantApi = jasmine.createSpyObj<MerchantApiService>(
      "MerchantApiService",
      ["getVerticals", "searchMerchants"],
    );
    merchantApi.getVerticals.and.returnValue(
      of([{ code: "FOOD_AND_BEVERAGE", displayName: "Food & Beverage" }]),
    );
    merchantApi.searchMerchants.and.returnValue(
      of({
        results: [merchant],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      }),
    );

    await TestBed.configureTestingModule({
      imports: [MerchantCatalogComponent],
      providers: [
        { provide: MerchantApiService, useValue: merchantApi },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MerchantCatalogComponent);
    fixture.detectChanges();
  });

  it("loads recently updated merchants on entry with the default page size", () => {
    expect(merchantApi.searchMerchants).toHaveBeenCalledWith(
      fixture.componentInstance.selectedEnvironment,
      "v1",
      {
        q: undefined,
        businessTypes: undefined,
        merchantMobilities: undefined,
        statuses: undefined,
        page: 0,
        size: 50,
      },
    );
    expect(
      fixture.nativeElement.querySelector(".merchant-result-row"),
    ).not.toBeNull();
  });

  it("presents merchant search and filters with clear accessible labels", () => {
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector("h1")?.textContent).toContain("Merchants");
    expect(
      element.querySelector('label[for="merchant-search-query"]'),
    ).not.toBeNull();
    expect(
      element.querySelector('details[aria-label="Merchant filters"]'),
    ).not.toBeNull();
    expect(
      element.querySelector('table[aria-label="Merchant search results"]'),
    ).not.toBeNull();
  });

  it("submits the selected search filters and displays readable merchant details", () => {
    const component = fixture.componentInstance;
    component.searchQuery = "Northstar";
    component.searchFilterBusinessTypes = ["FOOD_AND_BEVERAGE"];
    component.searchFilterMobilities = ["BRICK_AND_MORTAR"];
    component.searchFilterStatuses = ["ACTIVE"];
    component.runCatalogSearch();
    fixture.detectChanges();

    const request = merchantApi.searchMerchants.calls.mostRecent()
      .args[2] as MerchantSearchRequest;
    expect(request).toEqual({
      q: "Northstar",
      businessTypes: ["FOOD_AND_BEVERAGE"],
      merchantMobilities: ["BRICK_AND_MORTAR"],
      statuses: ["ACTIVE"],
      page: 0,
      size: 50,
    });

    const element = fixture.nativeElement as HTMLElement;
    expect(
      element.querySelector(".merchant-result-name")?.textContent,
    ).toContain("Northstar Coffee");
    expect(
      element.querySelector(".merchant-result-location")?.textContent,
    ).toContain("Berlin");
    expect(
      element.querySelector(".merchant-result-status")?.textContent,
    ).toContain("Active");
    expect(
      element.querySelector(".merchant-result-updated")?.textContent,
    ).not.toContain("2026-11-01T");
    expect(
      element.querySelector(".merchant-result-row a")?.getAttribute("href"),
    ).toBe("/merchants/merchant-123");
  });

  it("renders searchable dropdowns for each multi-select filter group", () => {
    const element = fixture.nativeElement as HTMLElement;
    element.querySelector<HTMLDetailsElement>(
      'details[aria-label="Merchant filters"]',
    )!.open = true;
    fixture.detectChanges();

    const dropdowns = fixture.debugElement.queryAll(By.directive(MultiSelect));
    expect(dropdowns.length).toBe(3);
    expect(element.querySelector("#merchant-status-ACTIVE")).toBeNull();
    expect(
      dropdowns.map((dropdown) => dropdown.componentInstance.ariaLabel),
    ).toEqual(["Business type", "Merchant type", "Status"]);
    expect(
      dropdowns.every((dropdown) => dropdown.componentInstance.filter),
    ).toBeTrue();
  });

  it("keeps each dropdown label and arrow aligned on one row", () => {
    const element = fixture.nativeElement as HTMLElement;
    const dropdown = element.querySelector<HTMLElement>(
      ".merchant-filter-group .p-multiselect",
    );
    const label = dropdown?.querySelector<HTMLElement>(
      ".p-multiselect-label-container",
    );
    const arrow = dropdown?.querySelector<HTMLElement>(
      ".p-multiselect-dropdown",
    );

    expect(dropdown).not.toBeNull();
    expect(getComputedStyle(dropdown!).display).toBe("flex");
    expect(getComputedStyle(dropdown!).flexDirection).toBe("row");
    expect(label).not.toBeNull();
    expect(arrow).not.toBeNull();
    expect(label!.getBoundingClientRect().top).toBe(
      arrow!.getBoundingClientRect().top,
    );
  });

  it("updates the active filter count and selected values from dropdown changes", () => {
    const dropdown = fixture.debugElement.queryAll(By.directive(MultiSelect))[2]
      .componentInstance as MultiSelect;
    dropdown.updateModel(["ACTIVE", "SETUP"], new Event("change"));
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance.searchFilterStatuses).toEqual([
      "ACTIVE",
      "SETUP",
    ]);
    expect(
      element.querySelector(".active-filter-count")?.textContent,
    ).toContain("2");
    expect(dropdown.display).toBe("chip");
    expect(dropdown.label()).toContain("Active");
    expect(dropdown.label()).toContain("Setup");
  });

  it("shows a useful empty state when a search has no matches", () => {
    merchantApi.searchMerchants.and.returnValue(
      of({
        results: [],
        page: 0,
        size: 50,
        totalElements: 0,
        totalPages: 0,
      }),
    );
    fixture.componentInstance.runCatalogSearch();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector(".merchant-empty-state")?.textContent,
    ).toContain("No merchants found");
  });

  it("clears the current query and filters then refreshes recent merchants", () => {
    const component = fixture.componentInstance;
    component.searchQuery = "Northstar";
    component.searchFilterStatuses = ["ACTIVE"];

    component.clearCatalogSearch();

    expect(component.searchQuery).toBe("");
    expect(component.searchFilterStatuses).toEqual([]);
    expect(merchantApi.searchMerchants.calls.mostRecent().args[2]).toEqual({
      q: undefined,
      businessTypes: undefined,
      merchantMobilities: undefined,
      statuses: undefined,
      page: 0,
      size: 50,
    });
  });

  it("shows an API error toast without presenting a failed search as empty results", () => {
    const component = fixture.componentInstance;

    const notifications = TestBed.inject(NotificationService);
    const apiErrorSpy = spyOn(notifications, "apiError");

    const failure = {
      error: {
        message: "Merchant service is unavailable.",
      },
    };

    merchantApi.searchMerchants.and.returnValue(throwError(() => failure));

    component.runCatalogSearch();
    fixture.detectChanges();

    // Verify the search request failed and was handled.
    expect(merchantApi.searchMerchants).toHaveBeenCalled();

    // General API failures should be displayed through the global toast.
    expect(apiErrorSpy).toHaveBeenCalledOnceWith(failure, jasmine.any(String));

    // The loading state must always finish.
    expect(component.searchLoading).toBeFalse();

    // A failed search must not be presented as "No merchants found".
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector(".merchant-empty-state")).toBeNull();
  });

  it("does not let an older search response replace newer results", () => {
    const component = fixture.componentInstance;
    const staleResponse = new Subject<MerchantSearchResponse>();
    const newerMerchant = {
      ...merchant,
      merchantId: "merchant-456",
      merchantName: "Newer Result",
    };
    merchantApi.searchMerchants.and.returnValues(
      staleResponse,
      of({
        results: [newerMerchant],
        page: 0,
        size: 50,
        totalElements: 1,
        totalPages: 1,
      }),
    );

    component.searchQuery = "old query";
    component.runCatalogSearch();
    component.searchQuery = "new query";
    component.runCatalogSearch();
    staleResponse.next({
      results: [merchant],
      page: 0,
      size: 50,
      totalElements: 1,
      totalPages: 1,
    });

    expect(component.searchResults).toEqual([newerMerchant]);
    expect(component.searchLoading).toBeFalse();
  });

  it("adapts the merchant search surfaces for dark mode", () => {
    const element = fixture.nativeElement as HTMLElement;
    const searchCard = element.querySelector<HTMLElement>(
      ".merchant-search-card",
    )!;
    const lightBackground = getComputedStyle(searchCard).backgroundColor;

    document.documentElement.setAttribute("data-coreui-theme", "dark");
    fixture.detectChanges();

    expect(getComputedStyle(searchCard).backgroundColor).not.toBe(
      lightBackground,
    );
    document.documentElement.setAttribute("data-coreui-theme", "light");
  });
});
