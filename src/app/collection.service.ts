/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { EventEmitter, Injectable } from "@angular/core";
import { CoreUtilService } from "./core-utils";
import { StorageService } from "./storage.service";
import { FirebaseAuthService } from "src/firebaseAuth.service";
import { Account } from "./_models";
import { ModalController, Platform } from "@ionic/angular";
import { formatISO, min } from "date-fns";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { LoggerService } from "./logger.service";
import { Device } from "@capacitor/device";
import { ModalSignInPage } from "./modal-signin/modal-signin.page";
import { GeocodeService } from "./geocode.service";
import { ToothModel } from "./_models/toothModel";
import { Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class CollectionService {

  private allTeeth: ToothModel[] = [];

  private allTeethSubject = new Subject<Array<any>>();
  public allTeeth$ = this.allTeethSubject.asObservable();

  private hasLoaded: boolean = false;
  private isAuthenticated: boolean = false;
  private retryAuth: boolean = false;

  private doSaveAfterInit: boolean = false;


  public currentToothChanged = new EventEmitter<void>();

  constructor(private storageService: StorageService, private coreUtilService: CoreUtilService, private firebaseAuthService: FirebaseAuthService,
    private platform: Platform, private logger: LoggerService, private httpClient: HttpClient, private modalController: ModalController, private geocodeService: GeocodeService) {

  }
  async init() {
    let isAccountNull = false;
    let accountStorage: Account = await this.storageService.get("account");
    if (accountStorage == null) {
      accountStorage = new Account();
      isAccountNull = true;
    }

    let disabledLogin = await this.storageService.getDisableLogin();

    this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();

    if (!this.isAuthenticated && !disabledLogin) {
      if (isAccountNull) {
        await this.doSignIn();
      } else {
        await this.firebaseAuthService.signIn();
      }
      this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();
    }

    let currentUser = await this.firebaseAuthService.getCurrentUser();
    if (currentUser) {
      accountStorage.email = currentUser?.email ?? "";
      accountStorage.isVerified = currentUser?.emailVerified ?? false;
      accountStorage.name = currentUser?.displayName ?? "";
      accountStorage.isAnonymous = currentUser?.isAnonymous ?? false;
      accountStorage.providerId = currentUser?.providerId ?? "";
      accountStorage.tenantId = currentUser?.tenantId ?? "";
      accountStorage.userId = currentUser?.uid ?? "";
      accountStorage.photoUrl = currentUser?.photoUrl ?? "";
      await this.firebaseAuthService.doSaveProfileToFirebase(accountStorage);
    }
    await this.storageService.setAccount(accountStorage);

    if (this.doSaveAfterInit) {
      await this.doSave();
    }
  }

  getIsAuthenticated() {
    return this.isAuthenticated;
  }

  resetHasLoaded() {
    this.hasLoaded = false;
    this.retryAuth = false;
    this.allTeeth = [];
  }

  setIsAuthenticated() {
    this.isAuthenticated = true;
  }

  setHasLoaded(value: boolean) {
    this.hasLoaded = value;
  }

  async getTeeth(): Promise<ToothModel[]> {
    return new Promise(async (resolve: any) => {
      if (!this.hasLoaded) {
        await this.loadCollectionData();
      }
      let result = this.allTeeth.filter(x => x.deletedDate == null);
      resolve(result);
    });
  }

  updateTeethSubject() {
    let result = this.allTeeth.filter(x => x.deletedDate == null);
    this.allTeethSubject.next(result);
  }

  getNewToothId() {
    let largestToothId = 0;
    this.allTeeth?.forEach(g => {
      if (g && g.toothId && g.toothId > largestToothId) {
        largestToothId = g.toothId;
      }
    });
    return largestToothId + 1;
  }

  async addTooth(orgTooth: ToothModel, doSaveImage: boolean) {
    let tooth = new ToothModel(orgTooth);
    if (!tooth || (tooth.toothId ?? 0) <= 0) {
      this.logger.error("Invalid tooth or invalid toothId");
      return;
    }
    let foundToothIndex = this.allTeeth.findIndex(x => x.toothId == tooth.toothId);
    if (foundToothIndex >= 0) {
      this.logger.error("ToothId already exists");
      return;
    }

    console.debug("Adding tooth: ", tooth);
    this.allTeeth.push(tooth);
    this.updateTeethSubject();

    if (doSaveImage) {
      await this.saveImage(tooth);
    }
    await this.doSave();
  }

  async doSignIn() {
    this.hasLoaded = false;
    if (!environment.enableAuth) {
      console.debug("environment enableAuth is false");
      return;
    }
    console.log("Tooth Service: doSignIn called");
    const modal = await this.modalController.create({
      component: ModalSignInPage,
      componentProps: {
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data.continueAsGuest) {
      await this.storageService.setDisableLogin(true);
    }
  }

  async saveTooth(orgTooth: ToothModel, doSaveImage: boolean, doDismissLoading: boolean = true) {
    let tooth = new ToothModel(orgTooth);
    let foundToothIndex = this.allTeeth.findIndex(x => x.toothId == tooth.toothId);
    if (foundToothIndex < 0) {
      this.logger.error("Could not find tooth");
      return;
    }
    await this.coreUtilService.presentLoading("Saving");

    this.allTeeth[foundToothIndex] = tooth;
    this.updateTeethSubject();

    if (doSaveImage) {
      await this.saveImage(tooth);
    }
    await this.doSave(doDismissLoading);
  }

  async saveImage(tooth: ToothModel) {
    if (this.isAuthenticated) {
      let deviceInfo = await Device.getInfo();
      console.log("saveImage called on platform: ", deviceInfo.platform);
      try {
        if (deviceInfo.platform == "ios" || deviceInfo.platform == "android") {
          await this.firebaseAuthService.uploadToothImage(tooth);
        } else {
          await this.firebaseAuthService.uploadToothImage_Web(tooth);
        }
        let downloadUrl = await this.firebaseAuthService.getToothImage(tooth);
        let foundTooth = this.allTeeth.find(x => x.toothId == tooth.toothId);
        if (foundTooth) {
          foundTooth.photoUrl = downloadUrl;
        }
        console.log("Done saving image. DownloadUrl: ", downloadUrl);
      } catch (err: any) {
        this.logger.error("Error saving image: ", err);
      }
    }
  }

  private async doSave(doDismissLoading: boolean = true) {
    console.log("doSave called");
    let teethJson: any[] = [];
    // this.allTeeth.forEach(x => teethJson.push(x.toJSON()));
    let dataStr = JSON.stringify(this.allTeeth);
    let dataObj = { title: "teeth", data: dataStr };

    if (this.retryAuth) {
      try {
        await this.doSignIn();
        this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();
        this.retryAuth = false;
      } catch (err: any) {
        this.logger.error("collectionService-doSave - Failed to called isAuthenticated: ", err);
      }
    }

    if (this.isAuthenticated) {
      try {
        await this.firebaseAuthService.doSaveTeethToFirebase(this.allTeeth);
      } catch (err: any) {
        this.logger.error("collectionService-doSave - Failed to saveTooth to firebase: ", err);
        this.storageService.set("teeth", dataObj);
        this.retryAuth = true;
      }
    } else {
      this.storageService.set("teeth", dataObj);
    }
    this.hasLoaded = false;
    if (doDismissLoading) {
      this.coreUtilService.dismissLoading();
    }
  }

  private async doLoadFromStorage() {
    let collectionData = await this.storageService.get("teeth");
    if (collectionData) {
      let teethArr: any[] = JSON.parse(collectionData?.data);
      teethArr.forEach(g => {
        let newTooth = new ToothModel(g);
        newTooth.init(g);
        this.allTeeth.push(newTooth);
        this.updateTeethSubject();
      });
    }
  }

  async loadCollectionData(): Promise<void> {
    return new Promise(async (resolve: any) => {
      if (this.hasLoaded) {
        if (this.allTeeth.length > 0) {
          resolve();
          return;
        }
      }
      if (this.retryAuth) {
        try {
          await this.doSignIn();
          this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();
          this.retryAuth = false;
        } catch (err: any) {
          this.logger.error("collectionService-loadCollectionData - Failed to called isAuthenticated: " + JSON.stringify(err), err);
        }
      }
      this.allTeeth = [];
      if (this.isAuthenticated) {
        try {
          let collectionData = await this.firebaseAuthService.loadCollection();
          console.log("collectionData loaded: ", collectionData);
          if (collectionData && collectionData.teeth) {
            if (collectionData.teeth.data && (typeof collectionData.teeth.data === 'string' || collectionData.teeth.data instanceof String)) {
              let parseObj = JSON.parse(collectionData.teeth.data);
              parseObj.forEach(async (g: any) => {
                let newTooth = new ToothModel(g);
                newTooth.init(g);
                let downloadUrl = await this.firebaseAuthService.getToothImage(newTooth);
                newTooth.photoUrl = downloadUrl;
                this.allTeeth.push(newTooth);
                this.updateTeethSubject();
              });
            } else {
              collectionData.teeth.forEach(async (g: any) => {
                let newTooth = new ToothModel(g);
                newTooth.init(g);
                let downloadUrl = await this.firebaseAuthService.getToothImage(newTooth);
                newTooth.photoUrl = downloadUrl;
                this.allTeeth.push(newTooth);
                this.updateTeethSubject();
              });
            }
          }
        } catch (err: any) {
          this.logger.error("collectionService-loadCollectionData - Failed to load from google: " + JSON.stringify(err), err);
          this.retryAuth = true;
          await this.doLoadFromStorage();
        }
      } else {
        await this.doLoadFromStorage();
      }
      this.hasLoaded = true;
      resolve();
    });
  }

}
