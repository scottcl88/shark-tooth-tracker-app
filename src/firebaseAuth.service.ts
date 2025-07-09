/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Injectable, NgZone } from '@angular/core';
import {
  FirebaseAuthentication,
  GetIdTokenOptions,
  SignInResult,
  User,
} from '@capacitor-firebase/authentication';
import { Capacitor } from '@capacitor/core';
import { Platform } from '@ionic/angular';
import { initializeApp, getApp } from 'firebase/app';
import { Observable, ReplaySubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getDatabase, ref, child, get, update } from "firebase/database";
import { RemoteConfig } from "firebase/remote-config";
import { StorageService } from './app/storage.service';
import { getAuth, indexedDBLocalPersistence, initializeAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { Account } from './app/_models';
import { LoggerService } from './app/logger.service';
import { Device } from '@capacitor/device';
import { FirebaseStorage } from '@capacitor-firebase/storage';
import { ToothModel } from './app/_models/toothModel';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { EmailGameDataRequest } from './app/data/data.page';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private currentUser?: User | null;
  private currentUserSubject = new ReplaySubject<User | null>(1);
  private loadedData: any = {};

  public remoteConfig: RemoteConfig;

  constructor(
    private storageService: StorageService,
    private logger: LoggerService
  ) {
  }

  public get currentUser$(): Observable<User | null> {
    return this.currentUserSubject.asObservable();
  }

  public async initialize(): Promise<void> {
    try {
      const app = initializeApp(environment.firebaseConfig);

      if (environment.production) {
        initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider('6LeOZ2ApAAAAACGGMZ-HOdIhrftZuB23M90b93s8'),
          isTokenAutoRefreshEnabled: true
        });
      }

      if (Capacitor.isNativePlatform()) {
        console.log("capacitor is native platform")
        initializeAuth(app, {
          persistence: indexedDBLocalPersistence
        });
      } else {
        console.log("capacitor is not native, getAuth")
        getAuth();
      }
      console.log("Firebase service finished initializing");
    } catch (err: any) {
      this.logger.error("Error on firebase initialize: " + err + " ||| " + JSON.stringify(err), err);
    }
  }

  public async checkRedirectResult(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      return;
    }
    await FirebaseAuthentication.getRedirectResult();
  }

  public getCurrentUser(): Promise<User | null> {
    return new Promise<User | null>(async (resolve: any) => {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      resolve(this.currentUser);
    });
  }

  public async isAuthenticated(): Promise<boolean> {
    return new Promise<boolean>(async (resolve: any) => {
      if (this.currentUser) {
        try {
          let currentUserResult = await FirebaseAuthentication.getCurrentUser();
          console.log("Firebase isAuthenticated currentUserResult: ", JSON.stringify(currentUserResult));
          this.currentUser = currentUserResult.user;
          console.log("Firebase isAuthenticated current user set: ", JSON.stringify(this.currentUser));
          if (this.currentUser) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (err) {
          console.log("Firebase isAuthenticated getCurrentUser error: ", err, JSON.stringify(err));
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

  public async getIdToken(options?: GetIdTokenOptions): Promise<string> {
    const result = await FirebaseAuthentication.getIdToken(options);
    return result.token;
  }
  private initializeAppIfNecessary() {
    try {
      return getApp();
    } catch {
      return initializeApp(environment.firebaseConfig);
    }
  }
  public async signIn(platform: string = ""): Promise<SignInResult> {
    if (!environment.enableAuth) {
      console.debug("environment enableAuth is false");
      return {} as SignInResult;
    }
    try {
      this.currentUser = null;
      this.loadedData = false;

      if (!platform?.trim()) {
        const info = await Device.getInfo();
        platform = info.platform;
      }

      let result: SignInResult;
      if (platform == "ios") {
        result = await this.signInWithApple();
      } else {
        result = await this.signInWithGoogle();
      }

      const credential = GoogleAuthProvider.credential(result.credential?.idToken);
      const auth = getAuth();
      await signInWithCredential(auth, credential);
      this.currentUserSubject.next(result.user);

      let currentUser = result.user;
      let accountStorage: Account = await this.storageService.get("account");
      if (accountStorage == null) {
        accountStorage = new Account();
        console.log("accountStorage is being created new from signin in firebase");
      }
      if (accountStorage) {
        console.log("accountStorage is being set from signin in firebase");
        accountStorage.email = currentUser?.email ?? "";
        accountStorage.isVerified = currentUser?.emailVerified ?? false;
        accountStorage.name = currentUser?.displayName ?? "";
        accountStorage.isAnonymous = currentUser?.isAnonymous ?? false;
        accountStorage.providerId = currentUser?.providerId ?? "";
        accountStorage.tenantId = currentUser?.tenantId ?? "";
        accountStorage.userId = currentUser?.uid ?? "";
        accountStorage.photoUrl = currentUser?.photoUrl ?? "";
        await this.storageService.setAccount(accountStorage);
      }

      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      console.log("Firebase Signin current user set: ", JSON.stringify(this.currentUser));
      return result;

    } catch (err: any) {
      console.log("Error on firebase signIn: ", err);
      this.logger.error("Error on firebase signIn: " + err + " ||| " + JSON.stringify(err), err);
    }
    return {} as SignInResult;
  }

  private async signInWithGoogle(): Promise<SignInResult> {
    try {
      const result = await FirebaseAuthentication.signInWithGoogle({
        mode: 'popup',
      });
      return result;
    } catch (err: any) {
      this.logger.error("Error on firebase signInWithGoogle: " + err + " ||| " + JSON.stringify(err), err);
    }
    return {} as SignInResult;
  }

  private async signInWithApple(): Promise<SignInResult> {
    try {
      const result = await FirebaseAuthentication.signInWithApple({
        mode: 'popup',
      });
      return result;
    } catch (err: any) {
      this.logger.error("Error on firebase signInWithApple: " + err + " ||| " + JSON.stringify(err), err);
    }
    return {} as SignInResult;
  }


  public async signOut(): Promise<void> {
    await FirebaseAuthentication.signOut();
  }

  public async getToothImage(tooth: ToothModel): Promise<string> {
    return new Promise(async (resolve, reject) => {
      let result = await FirebaseStorage.getDownloadUrl(
        {
          path: `users/${this.currentUser?.uid}/teeth/${tooth.toothId}`,
        }
      );
      resolve(result.downloadUrl);
    });
  }

  public async uploadToothImage_Web(tooth: ToothModel): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await FirebaseStorage.uploadFile(
          {
            path: `users/${this.currentUser?.uid}/teeth/${tooth.toothId}`,
            blob: tooth.imageData,
            // metadata: {
            //   contentType: tooth.imageData.format
            // }
          },
          (event, error) => {
            console.log("FirebaseStorage uploadFile result: ", event, error);
            if (error) {
              reject(error);
            } else if (event?.completed) {
              resolve();
            }
          }
        );
      } catch (err) {
        console.error("Error with uploadToothImage_Web: ", err);
        reject(err);
      }
    });
  }

  public async uploadToothImage(tooth: ToothModel): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        await FirebaseStorage.uploadFile(
          {
            path: `users/${this.currentUser?.uid}/teeth/${tooth.toothId}`,
            uri: tooth.imageData,
            metadata: {
              contentType: "image/png",
              customMetadata: {
                foo: 'bar',
              },
            }
          },
          (event, error) => {
            console.log("FirebaseStorage uploadFile result: ", event, error);
            if (error) {
              reject(error);
            } else if (event?.completed) {
              resolve();
            }
          }
        );
      } catch (err) {
        console.error("Error with uploadFile: ", err);
        reject(err);
      }
    });
  }

  public async callEmailDataFunction(request: EmailGameDataRequest): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const functions = getFunctions(getApp(), "us-central1");
        const sendExportDataEmail = httpsCallable(functions, 'sendExportDataEmail', { limitedUseAppCheckTokens: true });
        await sendExportDataEmail(request);
        resolve();
      } catch (err) {
        console.error("Error with callEmailDataFunction 2: ", err);
        reject(err);
      }
    });
  }

  public async doSaveTeethToFirebase(dataObj: any) {
    try {
      //remove all undefined and replace with null; stringify and parse does this
      let goodJsonObj = JSON.parse(JSON.stringify(dataObj));
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const db = getDatabase();
      const updates: any = {};
      updates[`users/${this.currentUser?.uid}/teeth`] = goodJsonObj;
      await update(ref(db), updates);
    } catch (err) {
      console.error("doSaveTeethToFirebase in firebaseAuth: ", err);
    }
  }

  public async doSaveProfileToFirebase(dataObj: any) {
    try {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const db = getDatabase();
      const updates: any = {};
      updates[`users/${this.currentUser?.uid}/profile`] = dataObj;
      await update(ref(db), updates);
    } catch (err) {
      console.error("doSaveProfileToFirebase in firebaseAuth: ", err);
    }
  }

  public async deleteUser() {
    await FirebaseAuthentication.deleteUser();
  }

  public async loadCollection() {
    return new Promise<any>(async (resolve: any) => {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const dbRef = ref(getDatabase());
      get(child(dbRef, `users/${this.currentUser?.uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
          this.loadedData = snapshot.val();
        }
        resolve(this.loadedData);
      }).catch((error) => {
        this.logger.error("Error on firebase loadCollection: " + error + " ||| " + JSON.stringify(error), error);
        resolve(this.loadedData);
      });
    });
  }
}