import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { MerchantApiService } from '../services/merchant-api.service';
import { UserManagementApiService } from '../services/user-management-api.service';
import { UserManagementComponent } from './user-management.component';

describe('UserManagementComponent', () => {
  let fixture: ComponentFixture<UserManagementComponent>;
  let component: UserManagementComponent;
  let api: jasmine.SpyObj<UserManagementApiService>;
  let merchantApi: jasmine.SpyObj<MerchantApiService>;

  const user = {
    id: 'user-1',
    displayName: 'Alex Morgan',
    email: 'alex@example.com',
    enabled: true
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<UserManagementApiService>('UserManagementApiService', ['searchUsers', 'getAssignments']);
    merchantApi = jasmine.createSpyObj<MerchantApiService>('MerchantApiService', ['searchMerchants', 'getBranches']);
    api.searchUsers.and.returnValue(of([user]));
    api.getAssignments.and.returnValue(of([]));
    merchantApi.searchMerchants.and.returnValue(of({ results: [], page: 0, size: 50, totalElements: 0, totalPages: 0 }));
    merchantApi.getBranches.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserManagementComponent],
      providers: [
        { provide: UserManagementApiService, useValue: api },
        { provide: MerchantApiService, useValue: merchantApi }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('presents the user search and selection workspace', () => {
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('h1')?.textContent).toContain('User management');
    expect(root.querySelector('.user-search-input')).not.toBeNull();
    expect(root.querySelector('.user-results-panel')?.textContent).toContain('Search for a user');
    expect(root.querySelector('.user-detail-empty')?.textContent).toContain('Select a user');
  });

  it('searches users and displays selectable result cards', () => {
    component.searchQuery = '  alex@example.com  ';
    component.search();
    fixture.detectChanges();

    expect(api.searchUsers).toHaveBeenCalledWith(component.environment, component.apiVersion, 'alex@example.com');
    expect(fixture.nativeElement.querySelector('.user-result-name')?.textContent).toContain('Alex Morgan');
    expect(fixture.nativeElement.querySelector('.user-result-status')?.textContent).toContain('Active');
  });

  it('loads assignments when a user is selected', () => {
    component.searchResults = [user];
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    root.querySelector<HTMLButtonElement>('.user-result')!.click();
    fixture.detectChanges();

    expect(api.getAssignments).toHaveBeenCalledWith(component.environment, component.apiVersion, user.id);
    expect(component.selectedUser).toEqual(user);
    expect(root.querySelector('app-user-detail')).not.toBeNull();
  });

  it('shows a visible error when user search fails', () => {
    api.searchUsers.and.returnValue(throwError(() => new Error('network')));
    component.searchQuery = 'alex';
    component.search();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('[role="alert"]')?.textContent).toContain('User search failed');
  });
});
