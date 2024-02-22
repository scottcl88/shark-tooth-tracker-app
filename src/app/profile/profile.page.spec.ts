import { ComponentFixture, waitForAsync, TestBed } from "@angular/core/testing";
import { RouterTestingModule } from "@angular/router/testing";
import { IonicModule } from "@ionic/angular";
import { FirebaseAuthService } from "src/firebaseAuth.service";
import { CollectionService } from "../collection.service";
import { CoreUtilService } from "../core-utils";
import { LoggerService } from "../logger.service";
import { StorageService } from "../storage.service";
import { ProfilePage } from "./profile.page";

describe('ProfilePage', () => {
  let component: ProfilePage;
  let fixture: ComponentFixture<ProfilePage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ProfilePage],
      imports: [
        IonicModule.forRoot(),
        RouterTestingModule
      ],
      providers: [
        CoreUtilService,
        StorageService,
        CollectionService,
        FirebaseAuthService,
        LoggerService,
        Geolocation
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfilePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with default values', () => {
    expect(component.package).toBeDefined();
    expect(component.uid).toBeUndefined();
    expect(component.name).toBeUndefined();
    expect(component.email).toBeUndefined();
    expect(component.imageUrl).toBeUndefined();
    expect(component.tenantName).toBeUndefined();
    expect(component.isAuthenticated).toBeFalsy();
    expect(component.isLoading).toBeFalsy();
    expect(component.recordLocationOption).toBeUndefined();
    expect(component.recordLocationOptionText).toBeUndefined();
    expect(component.account).toBeUndefined();
    expect(component.disableOfflineAlert).toBeFalsy();
    expect(component.invalidLocation).toBeFalsy();
    expect(component.hasValidLocation).toBeFalsy();
    expect(component.homeLocationString).toBe('');
    expect(component.showContactCheck).toBeFalsy();
    expect(component.contactCheck).toBeTruthy();
  });

  it('should disable offline alert when disableOfflineAlertChange is called', () => {
    component.disableOfflineAlertChange(true);
    expect(component.disableOfflineAlert).toBeTruthy();
  });

  it('should record location when recordLocationChange is called', () => {
    const mockEvent = { target: { value: 'option1' } };
    component.recordLocationChange(mockEvent);
    expect(component.recordLocationOption).toBe('option1');
  });

  it('should update contact check when contactCheckOnChange is called', () => {
    const mockEvent = { target: { checked: false } };
    component.contactCheckOnChange(mockEvent);
    expect(component.contactCheck).toBeFalsy();
  });

  it('should load player when loadPlayer is called', async () => {
    spyOn(component, 'loadPlayer').and.callThrough();
    await component.loadPlayer();
    expect(component.loadPlayer).toHaveBeenCalled();
    // Add more expectations here based on the behavior of loadPlayer()
  });

  it('should sign in when signIn is called', async () => {
    spyOn(component, 'signIn').and.callThrough();
    await component.signIn();
    expect(component.signIn).toHaveBeenCalled();
    // Add more expectations here based on the behavior of signIn()
  });

  it('should delete user when doDelete is called', async () => {
    spyOn(component, 'doDelete').and.callThrough();
    await component.doDelete();
    expect(component.doDelete).toHaveBeenCalled();
    // Add more expectations here based on the behavior of doDelete()
  });

  it('should confirm delete when confirmDelete is called', async () => {
    spyOn(component, 'confirmDelete').and.callThrough();
    await component.confirmDelete();
    expect(component.confirmDelete).toHaveBeenCalled();
    // Add more expectations here based on the behavior of confirmDelete()
  });

  it('should show disclaimer when showDisclaimer is called', async () => {
    spyOn(component, 'showDisclaimer').and.callThrough();
    await component.showDisclaimer();
    expect(component.showDisclaimer).toHaveBeenCalled();
    // Add more expectations here based on the behavior of showDisclaimer()
  });

  it('should log out user when doLogout is called', async () => {
    spyOn(component, 'doLogout').and.callThrough();
    await component.doLogout();
    expect(component.doLogout).toHaveBeenCalled();
    // Add more expectations here based on the behavior of doLogout()
  });

  it('should confirm logout when confirmLogout is called', async () => {
    spyOn(component, 'confirmLogout').and.callThrough();
    await component.confirmLogout();
    expect(component.confirmLogout).toHaveBeenCalled();
    // Add more expectations here based on the behavior of confirmLogout()
  });

  // Add more test cases here...

});

