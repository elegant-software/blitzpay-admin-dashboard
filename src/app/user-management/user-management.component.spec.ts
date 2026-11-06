import { ComponentFixture, TestBed } from "@angular/core/testing";
import { of, throwError } from "rxjs";
import { NotificationService } from "../notifications/notification.service";
import { MerchantApiService } from "../services/merchant-api.service";
import { UserManagementApiService } from "../services/user-management-api.service";
import { UserManagementComponent } from "./user-management.component";

describe("UserManagementComponent", () => {
  let fixture: ComponentFixture<UserManagementComponent>;
  let component: UserManagementComponent;
  let api: jasmine.SpyObj<UserManagementApiService>;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const user = {
    id: "user-1",
    displayName: "Alex Morgan",
    email: "alex@example.com",
    enabled: true,
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<UserManagementApiService>(
      "UserManagementApiService",
      ["searchUsers", "getAssignments"],
    );
    merchantApi = jasmine.createSpyObj<MerchantApiService>(
      "MerchantApiService",
      ["searchMerchants", "getBranches"],
    );
    api.searchUsers.and.returnValue(of([user]));
    api.getAssignments.and.returnValue(of([]));
    merchantApi.searchMerchants.and.returnValue(
      of({ results: [], page: 0, size: 50, totalElements: 0, totalPages: 0 }),
    );
    merchantApi.getBranches.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        { provide: UserManagementApiService, useValue: api },
        { provide: MerchantApiService, useValue: merchantApi },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("presents the user search and selection workspace", () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector("h1")?.textContent).toContain("User management");
    expect(root.querySelector(".user-search-input")).not.toBeNull();
    expect(root.querySelector(".user-results-panel")?.textContent).toContain(
      "Search for a user",
    );
    expect(root.querySelector(".user-detail-empty")?.textContent).toContain(
      "Select a user",
    );
  });

  it("searches users and displays selectable result cards", () => {
    component.searchQuery = "  alex@example.com  ";
    component.search();
    fixture.detectChanges();

    expect(api.searchUsers).toHaveBeenCalledWith(
      component.environment,
      component.apiVersion,
      "alex@example.com",
    );
    expect(
      fixture.nativeElement.querySelector(".user-result-name")?.textContent,
    ).toContain("Alex Morgan");
    expect(
      fixture.nativeElement.querySelector(".user-result-status")?.textContent,
    ).toContain("Active");
  });

  it("loads assignments when a user is selected", () => {
    component.searchResults = [user];
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>(".user-result")!.click();
    fixture.detectChanges();

    expect(api.getAssignments).toHaveBeenCalledWith(
      component.environment,
      component.apiVersion,
      user.id,
    );
    expect(component.selectedUser).toEqual(user);
    expect(root.querySelector("app-user-detail")).not.toBeNull();
  });

  it("emits one toast when user search fails and does not claim no users match", () => {
    const notifications = TestBed.inject(NotificationService);
    const reportError = spyOn(notifications, "apiError");
    const failure = new Error("network");
    api.searchUsers.and.returnValue(throwError(() => failure));
    component.searchQuery = "alex";
    component.search();
    fixture.detectChanges();

    expect(reportError).toHaveBeenCalledOnceWith(
      failure,
      "Could not search users. Please try again.",
    );
    expect(component.searching).toBeFalse();
    expect(
      fixture.nativeElement.querySelector(".user-results-empty"),
    ).toBeNull();
  });
  it("emits one toast on assignment retrieval failure and clears loading", () => {
    const notifications = TestBed.inject(NotificationService);
    const reportError = spyOn(notifications, "apiError");
    const failure = new Error("offline");
    api.getAssignments.and.returnValue(throwError(() => failure));

    component.selectUser(user);

    expect(reportError).toHaveBeenCalledOnceWith(
      failure,
      "Could not load assignments. Please try again.",
    );
    expect(component.loading).toBeFalse();
    expect(component.assignments).toEqual([]);
  });
});
