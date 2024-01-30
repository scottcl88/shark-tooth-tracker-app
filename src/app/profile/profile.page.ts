import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { Account } from '../_models';
import { CoreUtilService } from '../core-utils';
import { AlertController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { StorageService } from '../storage.service';
import { HttpClient } from '@angular/common/http';
import { CollectionService } from '../collection.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { LoggerService } from '../logger.service';
import { Router } from '@angular/router';
import { Geolocation } from '@capacitor/geolocation';

@Component({
  selector: 'app-profile',
  templateUrl: 'profile.page.html',
  styleUrls: ['profile.page.scss']
})
export class ProfilePage implements OnInit, OnDestroy {

  public package: any = require('../../../package.json');

  public uid: string;
  public name: string;
  public email: string;
  public imageUrl: string;
  public tenantName: string;
  public isAuthenticated: boolean = false;

  public isLoading: boolean = false;

  private ngUnsubscribe = new Subject();

  public recordLocationOption: string;
  public recordLocationOptionText: string;

  public account: Account;

  public disableOfflineAlert: boolean;

  public invalidLocation: boolean = false;
  public hasValidLocation: boolean = false;
  public homeLocationString: string = "";

  public showContactCheck: boolean = false;
  public contactCheck: boolean = true;

  constructor(
    private coreUtilService: CoreUtilService,
    public popoverController: PopoverController,
    private storageService: StorageService,
    public modalController: ModalController,
    public alertController: AlertController,
    private httpClient: HttpClient,
    private collectionService: CollectionService,
    private firebaseAuthService: FirebaseAuthService,
    private logger: LoggerService,
    private platform: Platform,
    private router: Router
  ) { }

  async ngOnInit() {
    await this.coreUtilService.presentLoading();


    this.isLoading = true;

    this.isAuthenticated = (await this.firebaseAuthService.isAuthenticated());

    this.account = await this.storageService.getAccount() ?? new Account();

    if (this.isAuthenticated) {
      this.isLoading = true;
      await this.loadPlayer();
      this.showContactCheck = true;
    } else {
      this.disableOfflineAlert = this.account.disableOfflineAlert;
      this.coreUtilService.dismissLoading();
      this.isLoading = false;
      this.contactCheck = false;
    }

    this.recordLocationOption = this.account?.recordLocationOption;
    //this.recordLocationOption = await (await Preferences.get({ key: "RecordLocationOption" })).value ?? "";
    switch (this.recordLocationOption) {
      case "alwaysAllow": {
        this.recordLocationOptionText = "Always Allow";
        break;
      } case "allowNow": {
        this.recordLocationOptionText = "Ask";
        break;
      } case "denyNow": {
        this.recordLocationOptionText = "Ask";
        break;
      } case "neverAllow": {
        this.recordLocationOptionText = "Never Allow";
        break;
      }
      default: {
        this.recordLocationOptionText = "Ask";
      }
    }

    this.coreUtilService.dismissLoading();
  }
  async goToHelp() {
    await this.router.navigate(['/help']);
  }
  async goToPrivacyPolicy() {
    await this.router.navigate(['/privacy-policy']);
  }
  async goToTermsOfUse() {
    await this.router.navigate(['/terms-of-use']);
  }
  async goToCookiePolicy() {
    await this.router.navigate(['/cookie-policy']);
  }
  async goToCredits() {
    await this.router.navigate(['/credits']);
  }
  async goToData() {
    await this.router.navigate(['/data']);
  }

  disableOfflineAlertChange(e: any) {
    if (this.disableOfflineAlert != e.detail.checked) {
      this.disableOfflineAlert = e.detail.checked;
      this.account.disableOfflineAlert = this.disableOfflineAlert;
      this.storageService.setAccount(this.account);
    }
  }

  async handleAddressChange(placeResult: google.maps.places.PlaceResult) {
    this.invalidLocation = false;
    console.log("handleAddressChange: ", placeResult);
    // Extract the city name, state name, latitude, and longitude
    const addressComponents = placeResult.address_components || [];

    let city = '';
    let state = '';
    let latitude = 0;
    let longitude = 0;

    for (const component of addressComponents) {
      const types = component.types || [];

      if (types.includes('locality')) {
        // City name
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        // State name
        state = component.long_name;
      }
    }

    // Latitude and Longitude
    if (placeResult.geometry && placeResult.geometry.location) {
      latitude = placeResult.geometry.location.lat();
      longitude = placeResult.geometry.location.lng();
    }

    if (!city || !state) {
      this.invalidLocation = true;
    } else {
      this.hasValidLocation = true;
    }

    this.storageService.setAccount(this.account);
    if (this.isAuthenticated) {
      await this.firebaseAuthService.doSaveProfileToFirebase(this.account);
    }
  }

  async recordLocationChange(e: any) {
    if (e.detail.value == "alwaysAllow") {
      let hasLocationPermission = await this.coreUtilService.hasLocationPermission();
      if (!hasLocationPermission) {
        let permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.coarseLocation != "granted" && permissionStatus.location != "granted") {
          await this.coreUtilService.presentToastError("Please allow location permissions to enable this feature");
          return;
        }
      }
    }
    this.account.recordLocationOption = e.detail.value;
    await this.storageService.setAccount(this.account);
    if (this.isAuthenticated) {
      await this.firebaseAuthService.doSaveProfileToFirebase(this.account);
    }
    this.recordLocationOption = e.detail.value;
  }

  async contactCheckOnChange(e: any) {
    this.contactCheck = e.detail.checked;

    this.account.canContact = this.contactCheck;
    this.storageService.setAccount(this.account);
    if (this.isAuthenticated) {
      await this.firebaseAuthService.doSaveProfileToFirebase(this.account);
    }
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }

  async loadPlayer() {
    try {
      let user = await this.firebaseAuthService.getCurrentUser();
      this.uid = user?.uid ?? "";
      this.name = user?.displayName ?? "";
      this.email = user?.email ?? "";
      this.imageUrl = user?.photoUrl ?? "";
    } catch (err: any) {
      this.logger.error("loadPlayer error getCurrentUser: ", err);
    }
  }

  async signIn() {
    await this.coreUtilService.presentLoading();
    try {
      let signInResult = await this.firebaseAuthService.signIn();
      console.log("signInResult: ", signInResult);
      this.collectionService.setHasLoaded(false);
      this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();
      this.tenantName = "Google";
      this.collectionService.setIsAuthenticated();
      this.collectionService.init();
      this.collectionService.setHasLoaded(false);
      await this.storageService.setDisableLogin(false);
      await this.loadPlayer();
    } catch (err: any) {
      this.logger.error("profile-signIn failed: " + JSON.stringify(err), err);
      this.coreUtilService.presentToastError();
    }
    this.coreUtilService.dismissLoading();
  }

  async doDelete() {
    let success = true;
    await this.storageService.clearData();
    this.collectionService.resetHasLoaded();
    if (this.isAuthenticated) {
      try {
        await this.firebaseAuthService.doSaveTeethToFirebase(null);
        await this.firebaseAuthService.doSaveProfileToFirebase({});
        await this.firebaseAuthService.deleteUser();
      } catch (err: any) {
        this.logger.error("profile-doDelete failed err1: " + err + " | " + JSON.stringify(err), err);
      }
    }
    try {
      await this.doLogout();
    } catch (err2: any) {
      await this.coreUtilService.presentToastError("Could not delete, please contact support");
      this.logger.error("profile-doDelete failed err2: " + err2 + " | " + JSON.stringify(err2), err2);
      success = false;
    }
    if (success) {
      await this.coreUtilService.presentToastSuccess('Deleted successfully!');
    }
  }

  async confirmDelete() {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Confirm!',
      message: 'Are you sure you want to delete your account?<br><br>All games and account information will be <b>permanently</b> deleted.<br><br><b><u>This cannot be reversed.</u></b>',
      buttons: [
        {
          text: 'Yes, Delete',
          cssClass: 'danger',
          handler: () => {
            this.doDelete();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'secondary',
          handler: (blah) => {
            //ignore
          },
        }
      ],
    });

    await alert.present();
  }

  async showDisclaimer() {
    await this.coreUtilService.presentDisclaimerAlert();
  }

  async doLogout() {
    this.logger.info("User logged out");
    await this.storageService.setDisableLogin(true);
    await this.storageService.logout();
    try {
      await this.firebaseAuthService.signOut();
    } catch (err: any) {
      this.logger.error("profile-doLogout failed err: " + err + " | " + JSON.stringify(err), err);
    }
    this.isAuthenticated = false;
    await this.coreUtilService.presentToastSuccess('Logged out successfully!');
  }

  async confirmLogout() {
    const alert = await this.alertController.create({
      cssClass: '',
      header: 'Are you sure you want to sign out?',
      message: 'Your games will be saved to your phone.',
      buttons: [
        {
          role: "confirm",
          text: 'Sign Out',
          cssClass: 'danger',
          handler: () => {
            this.doLogout();
          },
        },
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'primary',
          handler: (blah) => {
            //ignore
          },
        }
      ],
    });

    await alert.present();
  }
}
