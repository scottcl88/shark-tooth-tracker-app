/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2024 Scott Lewis, All rights reserved.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { StorageService } from '../storage.service';
import { AlertController, ModalController, Platform, PopoverController } from '@ionic/angular';
import { CoreUtilService } from '../core-utils';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { Account } from '../_models';
import { LoggerService } from '../logger.service';
import { Location } from '@angular/common';
import { CollectionService } from '../collection.service';
import { ModalEmailPage } from '../modal-email/modal-email.page';
import { EmailGameDataRequest, GameClient } from '../api';

@Component({
  selector: 'app-data',
  templateUrl: './data.page.html',
  styleUrls: ['./data.page.scss'],
})
export class DataPage implements OnInit, OnDestroy {

  public uid: string;
  public name: string;
  public imageUrl: string;
  public tenantName: string;
  public isAuthenticated: boolean = false;

  public isLoading: boolean = false;

  private ngUnsubscribe = new Subject();

  public recordLocationOption: string;
  public recordLocationOptionText: string;

  public account: Account;

  public disableOfflineAlert: boolean;

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
    private location: Location
  ) { }

  async ngOnInit() {
    await this.coreUtilService.presentLoading();


    this.isLoading = true;

    this.isAuthenticated = (await this.firebaseAuthService.isAuthenticated());

    this.account = await this.storageService.getAccount() ?? new Account();

    if (this.isAuthenticated) {
      this.isLoading = true;
      await this.loadPlayer();
    } else {
      this.disableOfflineAlert = this.account.disableOfflineAlert;
      this.coreUtilService.dismissLoading();
      this.isLoading = false;
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
  goBack() {
    this.location.back();
  }
  disableOfflineAlertChange(e: any) {
    if (this.disableOfflineAlert != e.detail.checked) {
      this.disableOfflineAlert = e.detail.checked;
      this.account.disableOfflineAlert = this.disableOfflineAlert;
      this.storageService.setAccount(this.account);
    }
  }

  async recordLocation() {
    if (this.isAuthenticated) {
      await this.firebaseAuthService.doSaveProfileToFirebase(this.account);
    }
    this.recordLocationOption = this.account.recordLocationOption;
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
      this.imageUrl = user?.photoUrl ?? "";
    } catch (err: any) {
      this.logger.error("loadPlayer error getCurrentUser: ", err);
    }
  }

  async signIn() {
    await this.coreUtilService.presentLoading();
    try {
      await this.firebaseAuthService.signIn();
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
      header: 'Confirm!',
      message: 'Are you sure you want to log out?<br><br>You will remain logged out and all games will be saved to your phone.',
      buttons: [
        {
          role: "confirm",
          text: 'Yes, Log out',
          cssClass: 'danger',
          handler: () => {
            this.doLogout();
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

  async showEmailModal() {
    const modal = await this.modalController.create({
      component: ModalEmailPage,
      componentProps: {
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data && data.saved && data.email) {
      this.exportData(data.email);
    }
  }

  async exportData(email: string) {
    this.logger.info(`ExportData called for email: ${email}`);
    let gameClient = new GameClient(this.httpClient, environment.API_BASE_URL);
    let request = new EmailGameDataRequest();
    request.email = email;
    let account = await this.storageService.getAccount();
    let allTeeth = await this.collectionService.getTeeth();
    let exportData = { profile: account, collection: allTeeth };
    request.jsonData = JSON.stringify(exportData);
    gameClient.emailGameData(request).subscribe({
      next: (res: any) => {
        console.debug("Sent email", res);
        if (res) {
          this.coreUtilService.presentToastSuccess("Email sent");
        } else {
          this.coreUtilService.presentToastError();
          this.logger.errorWithContext(`profile-exportData-emailGameData res error: `, request);
        }
      }, error: (err: any) => {
        this.logger.error(`profile-exportData-retrieved emailGameData error: ` + JSON.stringify(err), err);
        this.coreUtilService.presentToastError();
      }
    });
  }
}
