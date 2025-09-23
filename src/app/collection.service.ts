/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { EventEmitter, Injectable } from "@angular/core";
import { CoreUtilService } from "./core-utils";
import { StorageService } from "./storage.service";
import { FirebaseAuthService } from "src/firebaseAuth.service";
import { Account } from "./_models";
import { ModalController } from "@ionic/angular";
import { environment } from "src/environments/environment";
import { LoggerService } from "./logger.service";
import { Device } from "@capacitor/device";
import { ModalSignInPage } from "./modal-signin/modal-signin.page";
import { ModalSignInEncouragementPage } from "./modal-signin-encouragement/modal-signin-encouragement.page";
import { ToothModel } from "./_models/toothModel";
import { Subject } from "rxjs";
import { FirestoreService } from "src/firestore.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root',
})
export class CollectionService {

  private allTeeth: ToothModel[] = [];

  private readonly allTeethSubject = new Subject<Array<any>>();
  public allTeeth$ = this.allTeethSubject.asObservable();

  private hasLoaded: boolean = false;
  private isAuthenticated: boolean = false;
  private retryAuth: boolean = false;

  private readonly doSaveAfterInit: boolean = false;

  private readonly useFirestore: boolean = true;

  // Routes where auth prompts should be suppressed
  private readonly legalRoutes = new Set<string>([
    '/cookie-policy',
    '/privacy-policy',
    '/terms-of-use',
  ]);

  public currentToothChanged = new EventEmitter<void>();

  constructor(private readonly storageService: StorageService, private readonly coreUtilService: CoreUtilService,
    private readonly firebaseAuthService: FirebaseAuthService, private readonly firestoreService: FirestoreService,
    private readonly logger: LoggerService, private readonly modalController: ModalController, private readonly router: Router) { }

  // Helper: determine if current URL path is one of the legal routes
  private isOnLegalRoute(): boolean {
    try {
      const currentUrl = this.router?.url ?? '';
      console.debug("Current URL for legal route check: ", currentUrl);
      const pathOnly = currentUrl.split('?')[0].split('#')[0];
      console.debug("Path only for legal route check: ", pathOnly, this.legalRoutes, this.legalRoutes.has(pathOnly));
      return this.legalRoutes.has(pathOnly);
    } catch {
      return false;
    }
  }
  async init() {
    let isAccountNull = false;
    let accountStorage: Account = await this.storageService.get("account");
    if (accountStorage == null) {
      accountStorage = new Account();
      isAccountNull = true;
    }

    let disabledLogin = await this.storageService.getDisableLogin();

    // Always check for existing authentication first
    this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();

    if (!this.isAuthenticated && !disabledLogin) {
      // Only show sign-in modal if not authenticated and login not disabled
      if (isAccountNull) {
        await this.doSignInEncouragement();
      } else {
        // Try silent sign-in first for existing users
        try {
          await this.firebaseAuthService.signIn();
          this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();
        } catch (err: any) {
          this.logger.error("Silent sign-in failed, will show encouragement modal later", err);
        }
      }
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
      if (this.useFirestore) {
        await this.firestoreService.doSaveProfileToFirebase(accountStorage);
      } else {
        await this.firebaseAuthService.doSaveProfileToFirebase(accountStorage);
      }
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
      if (g?.toothId && g.toothId > largestToothId) {
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
    // Check current URL directly (don't rely on router event timing)
    if (this.isOnLegalRoute()) {
      console.debug("On legal page (by URL), skipping login");
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
    if (data?.continueAsGuest) {
      await this.storageService.setDisableLogin(true);
    }
  }

  async doSignInEncouragement() {
    this.hasLoaded = false;
    if (!environment.enableAuth) {
      console.debug("environment enableAuth is false");
      return;
    }
    // Check current URL directly (don't rely on router event timing)
    if (this.isOnLegalRoute()) {
      console.debug("On legal page (by URL), skipping login encouragement");
      return;
    }
    console.log("Tooth Service: doSignInEncouragement called");
    const modal = await this.modalController.create({
      component: ModalSignInEncouragementPage,
      componentProps: {
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();

    if (data?.continueAsGuest) {
      await this.storageService.setDisableLogin(true);
    } else if (data?.signedIn) {
      this.isAuthenticated = true;
    } else if (data?.remindLater) {
      // Set a reminder to show again later
      this.storageService.set('remindSignInLater', Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
    }
  }

  async migrateGuestDataToAccount(): Promise<boolean> {
    try {
      if (!this.isAuthenticated) {
        this.logger.warn("Cannot migrate data - user not authenticated");
        return false;
      }

      // Get local data
      const localTeeth = await this.storageService.get("teeth");
      if (localTeeth && this.allTeeth.length > 0) {
        console.log("Migrating guest data to authenticated account...");
        await this.saveAllTeethToBackend();
        await this.migrateAllImagesIfAny();

        this.logger.debug("Successfully migrated guest data to account");
        return true;
      }
      return false;
    } catch (err: any) {
      this.logger.error("Error migrating guest data:", err);
      return false;
    }
  }

  private async saveAllTeethToBackend(): Promise<void> {
    if (this.useFirestore) {
      await this.firestoreService.doSaveTeethToFirebase(this.allTeeth);
    } else {
      await this.firebaseAuthService.doSaveTeethToFirebase(this.allTeeth);
    }
  }

  private async migrateAllImagesIfAny(): Promise<void> {
    for (const tooth of this.allTeeth) {
      if (tooth.imageData) {
        try {
          await this.saveImage(tooth);
        } catch (err: any) {
          this.logger.warn(`Failed to migrate image for tooth ${tooth.toothId}:`, err);
        }
      }
    }
  }

  async shouldShowSignInReminder(): Promise<boolean> {
    const remindTime = await this.storageService.get('remindSignInLater');
    const guestStartTime = await this.storageService.get('guestModeStartTime');
    const remindSignIn = await this.storageService.get('remindSignIn');
    const disabledLogin = await this.storageService.getDisableLogin();

    if (disabledLogin || this.isAuthenticated) {
      return false;
    }

    // Show reminder if user has been using guest mode for a while
    if (guestStartTime) {
      const daysSinceStart = (Date.now() - new Date(guestStartTime).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceStart >= 3) { // Show after 3 days of guest usage
        return true;
      }
    }

    // Show if remind time has passed
    if (remindTime && Date.now() > remindTime) {
      return true;
    }

    // Show if remind flag is set
    return !!remindSignIn;
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
        if (this.useFirestore) {
          await this.firestoreService.doSaveTeethToFirebase(this.allTeeth);
        } else {
          await this.firebaseAuthService.doSaveTeethToFirebase(this.allTeeth);
        }
        this.logger.debug("Successfully saved teeth to Firebase");
        // Also persist a local cache to ensure availability if Firebase load fails
        this.storageService.set("teeth", dataObj);
      } catch (err: any) {
        this.logger.error("collectionService-doSave - Failed to saveTooth to firebase: ", err);
        this.storageService.set("teeth", dataObj);
        this.retryAuth = true;
      }
    } else {
      this.storageService.set("teeth", dataObj);
      this.logger.debug("Saved teeth to local storage (not authenticated)");
    }

    // Always backup data to ensure persistence
    await this.storageService.ensureDataPersistence();

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
      if (this.hasLoaded && this.allTeeth.length > 0) {
        resolve();
        return;
      }

      await this.ensureAuthIfRetry();

      this.allTeeth = [];
      if (this.isAuthenticated) {
        await this.loadFromRemoteOrFallback();
      } else {
        await this.doLoadFromStorage();
      }

      this.hasLoaded = true;
      resolve();
    });
  }

  private async ensureAuthIfRetry(): Promise<void> {
    if (!this.retryAuth) return;
    try {
      await this.doSignIn();
      this.isAuthenticated = await this.firebaseAuthService.isAuthenticated();
      this.retryAuth = false;
    } catch (err: any) {
      this.logger.error("collectionService-loadCollectionData - Failed to called isAuthenticated: " + JSON.stringify(err), err);
    }
  }

  private async loadFromRemoteOrFallback(): Promise<void> {
    try {
      const collectionData = this.useFirestore
        ? await this.firestoreService.loadCollection()
        : await this.firebaseAuthService.loadCollection();
      console.log("collectionData loaded: ", collectionData);
      await this.populateTeethFromCollection(collectionData);
    } catch (err: any) {
      this.logger.error("collectionService-loadCollectionData - Failed to load from google: " + JSON.stringify(err), err);
      this.retryAuth = true;
      await this.doLoadFromStorage();
    }
  }

  private async populateTeethFromCollection(collectionData: any): Promise<void> {
    if (!collectionData?.teeth) return;

    const teethContainer = collectionData.teeth;
    if (teethContainer.data && (typeof teethContainer.data === 'string' || teethContainer.data instanceof String)) {
      const parseObj = JSON.parse(teethContainer.data as string);
      await this.addTeethFromArray(parseObj);
      return;
    }

    // Firebase RTDB may return arrays as objects keyed by indices; normalize to array
    const rawTeeth = teethContainer;
    const items: any[] = Array.isArray(rawTeeth) ? rawTeeth : Object.values(rawTeeth);
    await this.addTeethFromArray(items);
  }

  private async addTeethFromArray(items: any[]): Promise<void> {
    for (const g of items) {
      const newTooth = new ToothModel(g);
      newTooth.init(g);
      const downloadUrl = await this.firebaseAuthService.getToothImage(newTooth);
      newTooth.photoUrl = downloadUrl;
      this.allTeeth.push(newTooth);
      this.updateTeethSubject();
    }
  }

}
