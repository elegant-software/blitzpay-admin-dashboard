import { HttpErrorResponse } from "@angular/common/http";
import { TestBed } from "@angular/core/testing";
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from "@angular/router";
import { NEVER, of, throwError } from "rxjs";
import { BranchTable, Merchant } from "../models/merchant-catalog.models";
import { MerchantApiService } from "../services/merchant-api.service";
import { BranchTablesComponent } from "./branch-tables.component";
import { NotificationService } from "../notifications/notification.service";

describe("BranchTablesComponent", () => {
  const uuid = "7f9c2b1e-0d4a-4c1b-9a77-3c2e5d6f8a90";
  const table = (
    name: string,
    seats: number | null,
    overrides: Partial<BranchTable> = {},
  ): BranchTable => ({
    id: `${uuid}-${name}`,
    code: `AB3K7${name}`,
    name,
    active: true,
    link: `https://storefront.test/t/AB3K7${name}`,
    placement: null,
    seats,
    ...overrides,
  });
  let api: jasmine.SpyObj<MerchantApiService>;

  function create(
    tables: BranchTable[],
    capacity: number | null = null,
    view = "tables",
  ) {
    api = jasmine.createSpyObj<MerchantApiService>("MerchantApiService", [
      "getMerchant",
      "getBranch",
      "getTables",
      "getFloorPlans",
      "createTables",
      "deleteTable",
      "updateTable",
      "placeTable",
      "getFloor",
      "floorEvents",
    ]);
    api.getMerchant.and.returnValue(
      of({ merchantId: "m-1", merchantName: "Café Blitz" } as Merchant),
    );
    api.getBranch.and.returnValue(
      of({
        branchId: "b-1",
        merchantId: "m-1",
        branchCode: "BR-1",
        name: "Mitte",
        status: "ACTIVE",
        capacity,
      }),
    );
    api.getTables.and.returnValue(of(tables));
    api.getFloor.and.returnValue(of({ floorPlans: [], tables: [], branchCapacity: capacity }));
    api.floorEvents.and.returnValue(NEVER);
    api.getFloorPlans.and.returnValue(
      of([{ id: `${uuid}-plan`, name: "Terrace", imageUrl: null }]),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: MerchantApiService, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: "m-1", branchId: "b-1" }),
              queryParamMap: convertToParamMap({ view }),
            },
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(BranchTablesComponent);
    fixture.detectChanges();
    return fixture;
  }

  it("lists Tables by name with seats and code, never their IDs", () => {
    const fixture = create([table("Q", 4), table("R", null)]);
    const text: string = fixture.nativeElement.textContent;
    expect(text).toContain("AB3K7Q");
    expect(text).toContain("2 tables · 4 seats");
    expect(text).not.toContain(uuid);
  });

  it('presents branch context and fully connected keyboard-accessible tabs', () => {
    const fixture = create([table('Q', 4)]);
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('h1')?.textContent).toContain('Tables & seats');
    expect(root.textContent).toContain('Mitte');
    const tabs = root.querySelectorAll<HTMLButtonElement>('[role="tab"]');
    expect(tabs[0].getAttribute('tabindex')).toBe('0');
    expect(tabs[1].getAttribute('tabindex')).toBe('-1');
    tabs[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.view).toBe('floor-plans');
    expect(document.activeElement).toBe(tabs[1]);
    const panel = root.querySelector('[role="tabpanel"]');
    expect(panel?.id).toBe(tabs[1].getAttribute('aria-controls')!);
    expect(panel?.getAttribute('aria-labelledby')).toBe(tabs[1].id);
  });

  it('filters locally by table name or code and active state without reloading data', () => {
    const fixture = create([table('Terrace 1', 4), table('Bar', 2, { active: false })]);
    const component = fixture.componentInstance;
    component.tableQuery = ' terrace ';
    component.filterTables();
    expect(component.filteredTables.map(row => row.name)).toEqual(['Terrace 1']);
    component.tableQuery = 'AB3K7Bar';
    component.tableStatus = 'inactive';
    component.filterTables();
    expect(component.filteredTables.map(row => row.name)).toEqual(['Bar']);
    expect(api.getTables).toHaveBeenCalledTimes(1);
    component.clearTableFilters();
    expect(component.filteredTables.length).toBe(2);
  });

  it('changes page size locally and returns to a valid page after filtering', () => {
    const fixture = create(Array.from({ length: 25 }, (_, index) => table(String(index + 1), 4)));
    const component = fixture.componentInstance;
    component.onTablePageChange({ first: 20, rows: 10 });
    expect(component.visibleTables.map(row => row.name)).toEqual(['21', '22', '23', '24', '25']);
    component.onTablePageChange({ first: 0, rows: 20 });
    expect(component.visibleTables.length).toBe(20);
    component.tableQuery = 'AB3K725';
    component.filterTables();
    expect(component.tableFirst).toBe(0);
    expect(component.visibleTables.map(row => row.name)).toEqual(['25']);
    expect(api.getTables).toHaveBeenCalledTimes(1);
  });

  it("bulk-creates Tables from a range with one seats value", () => {
    const fixture = create([]);
    api.createTables.and.returnValue(of([table("1", 4), table("2", 4)]));
    fixture.componentInstance.newTableNames = "Terrace 1-2";
    fixture.componentInstance.newTableSeats = "4";
    fixture.componentInstance.addTables();
    expect(api.createTables).toHaveBeenCalledWith(
      jasmine.anything(),
      "v1",
      "m-1",
      "b-1",
      ["Terrace 1", "Terrace 2"],
      4,
    );
    expect(fixture.componentInstance.tables.length).toBe(2);
  });

  it('keeps every active QR card available for printing while the directory is filtered', () => {
    const fixture = create([table('1', 4), table('2', 2), table('3', 4, { active: false })]);
    fixture.componentInstance.tableQuery = 'AB3K71';
    fixture.componentInstance.filterTables();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-test^="table-row-"]').length).toBe(1);
    const cards = fixture.nativeElement.querySelectorAll('.table-qr-print-sheet app-table-qr-card');
    expect(cards.length).toBe(3); // Branch counter card and both active tables.
    expect(fixture.componentInstance.seatedCapacity).toBe(6);
  });

  it('keeps update errors inside the dialog and clears them when reopening', () => {
    const fixture = create([table('1', 4)]);
    const component = fixture.componentInstance;
    component.openNameDialog({ kind: 'edit-table', table: component.tables[0] });
    api.updateTable.and.returnValue(throwError(() => new HttpErrorResponse({
      status: 409, error: { detail: 'A table with this name already exists.' }
    })));
    component.saveName();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tables-name-dialog [role="alert"]').textContent)
      .toContain('A table with this name already exists.');
    expect(component.nameDialog).not.toBeNull();
    component.closeNameDialog();
    component.openNameDialog({ kind: 'edit-table', table: component.tables[0] });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.tables-name-dialog [role="alert"]')).toBeNull();
  });

  it("warns, without blocking, when the Tables seat more than the Branch Capacity", () => {
    const fixture = create([table("Q", 4), table("R", 4)], 6);
    expect(
      fixture.nativeElement.querySelector('[data-test="capacity-warning"]')
        ?.textContent,
    ).toContain("seat 8 guests");
  });

  it("explains that a Table with orders must be deactivated instead of deleted", () => {
    const fixture = create([table("Q", 4)]);

    const notifications = TestBed.inject(NotificationService);
    const errorSpy = spyOn(notifications, "error");

    spyOn(window, "confirm").and.returnValue(true);

    const failure = new HttpErrorResponse({ status: 409 });

    api.deleteTable.and.returnValue(throwError(() => failure));

    const originalTable = fixture.componentInstance.tables[0];

    fixture.componentInstance.deleteTable(originalTable);

    expect(api.deleteTable).toHaveBeenCalledTimes(1);

    expect(errorSpy).toHaveBeenCalledOnceWith(
      "Table Q has orders, so it cannot be deleted. Deactivate it instead.",
    );

    // The failed deletion must not remove the table.
    expect(fixture.componentInstance.tables.length).toBe(1);
    expect(fixture.componentInstance.tables[0].id).toBe(originalTable.id);
  });

  it('shows the seats on every Floor Plan pin, "? seats" when not set', () => {
    const placed = { floorPlanId: `${uuid}-plan`, x: 0.2, y: 0.4 };
    const fixture = create(
      [
        table("Q", 4, { placement: placed }),
        table("R", null, { placement: placed }),
      ],
      null,
      "floor-plans",
    );
    const pins = [...fixture.nativeElement.querySelectorAll(".floor-pin")].map(
      (pin: HTMLElement) => pin.textContent?.trim(),
    );
    expect(pins).toEqual(["Q · 4 seats", "R · ? seats"]);
    expect(
      fixture.nativeElement.querySelector(
        '[data-test="floor-plan-select"] option',
      ).textContent,
    ).toContain("Terrace");
  });

  it("keeps a dragged Table where it was when the server refuses the move", () => {
    const fixture = create([table("Q", 4)]);
    api.placeTable.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 })),
    );
    const original = fixture.componentInstance.tables[0];
    fixture.componentInstance.place({
      table: original,
      placement: { floorPlanId: `${uuid}-plan`, x: 0.5, y: 0.5 },
    });
    expect(fixture.componentInstance.tables[0].placement).toBeNull();
  });
});
