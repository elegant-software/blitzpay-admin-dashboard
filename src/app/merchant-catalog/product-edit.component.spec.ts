import { ComponentFixture, TestBed } from "@angular/core/testing";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from "@angular/router";
import { of, throwError } from "rxjs";
import {
  CatalogTranslation,
  MenuLanguage,
  Merchant,
  Product,
} from "../models/merchant-catalog.models";
import { MerchantApiService } from "../services/merchant-api.service";
import { ProductEditComponent } from "./product-edit.component";
import { NotificationService } from "../notifications/notification.service";

describe("ProductEditComponent translations", () => {
  let fixture: ComponentFixture<ProductEditComponent>;
  let component: ProductEditComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const merchant: Merchant = {
    merchantId: "m-1",
    merchantCode: "MRC-1",
    merchantName: "Café Lena",
    merchantStatus: "ACTIVE",
    offerings: ["INTERNATIONAL_MENU"],
    lastUpdatedAt: "2026-10-31T12:00:00Z",
    originalMenuLanguage: "de",
    supportedMenuLanguages: ["en", "fr"],
  };
  const product: Product = {
    productId: "p-1",
    merchantId: "m-1",
    branchId: "b-1",
    name: "Leberkäse",
    description: "Mit süßem Senf",
    unitPrice: 6.5,
    active: true,
    status: "ACTIVE",
    createdAt: "2026-10-31T12:00:00Z",
    updatedAt: "2026-10-31T12:00:00Z",
    language: "de",
  };
  const catalogue: MenuLanguage[] = [
    { code: "en", displayName: "English", nativeName: "English" },
    { code: "fr", displayName: "French", nativeName: "Français" },
  ];
  const english: CatalogTranslation = {
    language: "en",
    name: "Liver cheese",
    description: "With sweet mustard",
    origin: "MACHINE",
    stale: true,
    updatedAt: "2026-10-31T12:00:00Z",
  };

  const routing = {
    stations: [{ id: "s-food", name: "Food Kitchen" }, { id: "s-bar", name: "Drinks Bar" }],
    categoryDefaults: {},
    productOverrides: { "p-other": "s-food" },
  };

  async function setup(loadedMerchant: Merchant = merchant) {
    merchantApi = jasmine.createSpyObj<MerchantApiService>(
      "MerchantApiService",
      [
        "getMerchant",
        "getProduct",
        "getProductCategories",
        "getMenuLanguages",
        "getProductTranslations",
        "saveProductTranslation",
        "deleteProductTranslation",
        "updateProduct",
        "getPreparationConfiguration",
        "savePreparationConfiguration",
      ],
    );
    merchantApi.getPreparationConfiguration.and.returnValue(of(routing));
    merchantApi.getMerchant.and.returnValue(of(loadedMerchant));
    merchantApi.getProduct.and.returnValue(of(product));
    merchantApi.getProductCategories.and.returnValue(of([]));
    merchantApi.getMenuLanguages.and.returnValue(of(catalogue));
    merchantApi.getProductTranslations.and.returnValue(of([english]));

    await TestBed.configureTestingModule({
      imports: [ProductEditComponent],
      providers: [
        provideRouter([{ path: "**", children: [] }]),
        { provide: MerchantApiService, useValue: merchantApi },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: "m-1", productId: "p-1" }),
            },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? "";

  it("loads the product and categories in the Original Menu Language so saves never store a translation", async () => {
    await setup();
    expect(merchantApi.getProduct).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "p-1",
      undefined,
      "de",
    );
    expect(merchantApi.getProductCategories).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "de",
    );
    expect(component.form.name).toBe("Leberkäse");
  });

  it("shows one translation row per Supported Menu Language", async () => {
    await setup();
    expect(component.translations.map((row) => row.language)).toEqual([
      "en",
      "fr",
    ]);
    const en = component.translations[0];
    expect(en.name).toBe("Liver cheese");
    expect(en.exists).toBeTrue();
    expect(en.stale).toBeTrue();
    expect(component.translations[1].exists).toBeFalse();
    expect(text()).toContain("Needs re-translation");
    expect(text()).toContain("Machine");
  });

  it("saves a translation as the merchant", async () => {
    await setup();
    const row = component.translations[0];
    row.name = "Bavarian meatloaf";
    merchantApi.saveProductTranslation.and.returnValue(
      of({
        ...english,
        name: "Bavarian meatloaf",
        origin: "MERCHANT",
        stale: false,
      }),
    );

    component.saveTranslation(row);

    expect(merchantApi.saveProductTranslation).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "p-1",
      "en",
      { name: "Bavarian meatloaf", description: "With sweet mustard" },
    );
    expect(row.origin).toBe("MERCHANT");
    expect(row.stale).toBeFalse();
  });

  it("shows an API error toast when saving a translation fails", async () => {
    await setup();

    const notifications = TestBed.inject(NotificationService);
    const apiErrorSpy = spyOn(notifications, "apiError");

    const row = component.translations[1];
    row.name = "Fromage";

    const failure = {
      error: {
        error: "Menu language not supported",
      },
    };

    merchantApi.saveProductTranslation.and.returnValue(
      throwError(() => failure),
    );

    component.saveTranslation(row);

    expect(merchantApi.saveProductTranslation).toHaveBeenCalledTimes(1);

    expect(apiErrorSpy).toHaveBeenCalledTimes(1);

    expect(apiErrorSpy).toHaveBeenCalledWith(failure, jasmine.any(String));

    // The user's translation must remain available for retry.
    expect(row.name).toBe("Fromage");

    // General API errors are no longer displayed inline.
    expect(row.error).toBe("");
  });

  it("requires a translated name", async () => {
    await setup();
    component.saveTranslation(component.translations[1]);
    expect(merchantApi.saveProductTranslation).not.toHaveBeenCalled();
    expect(component.translations[1].error).toContain("name");
  });

  it("deletes a translation", async () => {
    await setup();
    spyOn(window, "confirm").and.returnValue(true);
    merchantApi.deleteProductTranslation.and.returnValue(of(undefined));

    component.deleteTranslation(component.translations[0]);

    expect(merchantApi.deleteProductTranslation).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "p-1",
      "en",
    );
    expect(component.translations[0].exists).toBeFalse();
    expect(component.translations[0].name).toBe("");
  });

  it("skips translations when the merchant has no supported languages", async () => {
    await setup({ ...merchant, supportedMenuLanguages: [] });
    expect(merchantApi.getProductTranslations).not.toHaveBeenCalled();
    expect(component.translations).toEqual([]);
  });

  it("saves a kitchen station override onto the latest Branch routing after the product", async () => {
    await setup();
    merchantApi.updateProduct.and.returnValue(of(product));
    const latest = { ...routing, categoryDefaults: { "c-drinks": "s-bar" } };
    merchantApi.getPreparationConfiguration.and.returnValue(of(latest));
    merchantApi.savePreparationConfiguration.and.callFake((_e, _v, _m, _b, body) => of(body));

    expect(text()).toContain("Kitchen station");
    component.stationOverride = "s-bar";
    component.save();

    const body = merchantApi.savePreparationConfiguration.calls.mostRecent().args[4];
    expect(merchantApi.savePreparationConfiguration.calls.mostRecent().args[3]).toBe("b-1");
    expect(body.productOverrides).toEqual({ "p-other": "s-food", "p-1": "s-bar" });
    expect(body.categoryDefaults).toEqual({ "c-drinks": "s-bar" });
  });

  it("does not touch Branch routing when the override is unchanged", async () => {
    await setup();
    merchantApi.updateProduct.and.returnValue(of(product));
    component.save();
    expect(merchantApi.savePreparationConfiguration).not.toHaveBeenCalled();
  });
});
