import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import {
  CatalogTranslation,
  MenuLanguage,
  ProductCategory,
} from "../models/merchant-catalog.models";
import { MerchantApiService } from "../services/merchant-api.service";
import { CategoryTranslationsDialogComponent } from "./category-translations-dialog.component";
import { NotificationService } from "../notifications/notification.service";

describe("CategoryTranslationsDialogComponent", () => {
  let fixture: ComponentFixture<CategoryTranslationsDialogComponent>;
  let component: CategoryTranslationsDialogComponent;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const category: ProductCategory = {
    id: "c-1",
    name: "Hauptgerichte",
    createdAt: "2026-10-31T12:00:00Z",
    updatedAt: "2026-10-31T12:00:00Z",
  };
  const catalogue: MenuLanguage[] = [
    { code: "en", displayName: "English", nativeName: "English" },
    { code: "tr", displayName: "Turkish", nativeName: "Türkçe" },
  ];
  const english: CatalogTranslation = {
    language: "en",
    name: "Main dishes",
    origin: "MACHINE",
    stale: false,
    updatedAt: "2026-10-31T12:00:00Z",
  };

  async function setup() {
    merchantApi = jasmine.createSpyObj<MerchantApiService>(
      "MerchantApiService",
      [
        "getCategoryTranslations",
        "saveCategoryTranslation",
        "deleteCategoryTranslation",
      ],
    );
    merchantApi.getCategoryTranslations.and.returnValue(of([english]));

    await TestBed.configureTestingModule({
      imports: [CategoryTranslationsDialogComponent],
      providers: [{ provide: MerchantApiService, useValue: merchantApi }],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryTranslationsDialogComponent);
    component = fixture.componentInstance;
    component.merchantId = "m-1";
    component.category = category;
    component.supportedLanguages = ["en", "tr"];
    component.menuLanguages = catalogue;
    fixture.detectChanges();
  }

  const text = () => (fixture.nativeElement as HTMLElement).textContent ?? "";

  it("shows the original name and one row per supported language", async () => {
    await setup();
    expect(merchantApi.getCategoryTranslations).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "c-1",
    );
    expect(text()).toContain("Hauptgerichte");
    expect(component.rows.map((r) => [r.language, r.name])).toEqual([
      ["en", "Main dishes"],
      ["tr", ""],
    ]);
    expect(text()).toContain("Turkish — Türkçe");
  });

  it("saves a translation as the merchant", async () => {
    await setup();
    const tr = component.rows[1];
    tr.name = "Ana yemekler";
    merchantApi.saveCategoryTranslation.and.returnValue(
      of({
        ...english,
        language: "tr",
        name: "Ana yemekler",
        origin: "MERCHANT",
      }),
    );

    component.save(tr);

    expect(merchantApi.saveCategoryTranslation).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "c-1",
      "tr",
      { name: "Ana yemekler" },
    );
    expect(tr.exists).toBeTrue();
    expect(tr.origin).toBe("MERCHANT");
  });

  it("shows an API error toast when saving a translation fails", async () => {
    await setup();

    const notifications = TestBed.inject(NotificationService);
    const apiErrorSpy = spyOn(notifications, "apiError");

    const tr = component.rows[1];
    tr.name = "Ana yemekler";

    const failure = {
      error: {
        error: "Translated name must be <= 100 characters",
      },
    };

    merchantApi.saveCategoryTranslation.and.returnValue(
      throwError(() => failure),
    );

    component.save(tr);
    fixture.detectChanges();

    expect(merchantApi.saveCategoryTranslation).toHaveBeenCalledTimes(1);

    expect(apiErrorSpy).toHaveBeenCalledOnceWith(failure, jasmine.any(String));

    // Preserve the entered value so the merchant can correct and retry.
    expect(tr.name).toBe("Ana yemekler");

    // General API errors should not be duplicated inside the dialog.
    expect(text()).not.toContain("Translated name must be <= 100 characters");
  });

  it("deletes a translation", async () => {
    await setup();
    spyOn(window, "confirm").and.returnValue(true);
    merchantApi.deleteCategoryTranslation.and.returnValue(of(undefined));

    component.delete(component.rows[0]);

    expect(merchantApi.deleteCategoryTranslation).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "c-1",
      "en",
    );
    expect(component.rows[0].exists).toBeFalse();
  });

  it("shows an error toast when loading category translations fails", async () => {
    await setup();

    const notifications = TestBed.inject(NotificationService);
    const apiErrorSpy = spyOn(notifications, "apiError");

    const failure = {
      error: {
        detail: "Category not found",
      },
    };

    merchantApi.getCategoryTranslations.and.returnValue(
      throwError(() => failure),
    );

    component.load();
    fixture.detectChanges();

    expect(merchantApi.getCategoryTranslations).toHaveBeenCalledTimes(2);

    expect(apiErrorSpy).toHaveBeenCalledOnceWith(failure, jasmine.any(String));

    expect(text()).not.toContain("Category not found");
  });

  it("emits closed", async () => {
    await setup();
    let closed = false;
    component.closed.subscribe(() => (closed = true));
    component.close();
    expect(closed).toBeTrue();
  });
});
