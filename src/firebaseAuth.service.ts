/**
Copyright 2023 Scott Lewis, All rights reserved.
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
import { initializeApp } from 'firebase/app';
import { lastValueFrom, Observable, ReplaySubject, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { getDatabase, ref, set, child, get, update, onValue, push, DatabaseReference } from "firebase/database";
import { RemoteConfig, fetchAndActivate, getRemoteConfig, getValue } from "firebase/remote-config";
import { StorageService } from './app/storage.service';
import { getAuth, indexedDBLocalPersistence, initializeAuth, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";
import { Account } from './app/_models';
import { LoggerService } from './app/logger.service';
import { getAnalytics, setUserId, setUserProperties } from "firebase/analytics";
import { Device } from '@capacitor/device';

@Injectable({
  providedIn: 'root',
})
export class FirebaseAuthService {
  private currentUser?: User | null;
  private currentUserSubject = new ReplaySubject<User | null>(1);
  private loadedData: any = {};

  public remoteConfig: RemoteConfig;

  constructor(
    private readonly platform: Platform,
    private readonly ngZone: NgZone,
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
        const appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider('6Le0RvUmAAAAANtROg21O8U5uIcmPWsph0HuNLqw'),
          isTokenAutoRefreshEnabled: true
        });
      }

      if (Capacitor.isNativePlatform()) {
        initializeAuth(app, {
          persistence: indexedDBLocalPersistence
        });
      } else {
        getAuth();
      }

      this.remoteConfig = getRemoteConfig(app);
      this.remoteConfig.settings.minimumFetchIntervalMillis = 3600000;
      this.remoteConfig.defaultConfig = {
        "RestoreGooglePlaySaveFlag": true,
        "MinLogLevel": 1,
        "ForwardConsoleLogsEnabled": false
      };

      fetchAndActivate(this.remoteConfig)
        .then(() => {
          console.debug("fetchAndActivate finished");
        })
        .catch((err) => {
          this.logger.error("Error on firebase fetchAndActivate: " + err + " ||| " + JSON.stringify(err), err);
        });
    } catch (err: any) {
      this.logger.error("Error on firebase initialize: " + err + " ||| " + JSON.stringify(err), err);
    }
  }

  public async getRestoreGooglePlaySaveFlag() {
    const restoreGooglePlaySaveFlag = getValue(this.remoteConfig, "RestoreGooglePlaySaveFlag").asBoolean();
    return restoreGooglePlaySaveFlag;
  }

  public async getMinLogLevel() {
    const minLogLevel = getValue(this.remoteConfig, "MinLogLevel").asNumber();
    return minLogLevel;
  }

  public async getForwardConsoleLogsEnabled() {
    const forwardConsoleLogsEnabled = getValue(this.remoteConfig, "ForwardConsoleLogsEnabled").asBoolean();
    return forwardConsoleLogsEnabled;
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
        this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
        if (this.currentUser) {
          resolve(true);
        } else {
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
      }
      if (accountStorage) {
        accountStorage.email = currentUser?.email ?? "";
        accountStorage.isVerified = currentUser?.emailVerified ?? false;
        accountStorage.name = currentUser?.displayName ?? "";
        accountStorage.isAnonymous = currentUser?.isAnonymous ?? false;
        accountStorage.providerId = currentUser?.providerId ?? "";
        accountStorage.tenantId = currentUser?.tenantId ?? "";
        accountStorage.userId = currentUser?.uid ?? "";
        accountStorage.photoUrl = currentUser?.photoUrl ?? "";
        await this.storageService.setAccount(accountStorage);

        if (currentUser?.uid) {
          const analytics = getAnalytics();
          setUserId(analytics, currentUser.uid);
        }
      }

      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      return result;

    } catch (err: any) {
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

  public async doSaveGamesToFirebase(dataObj: any) {
    try {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const db = getDatabase();
      const updates: any = {};
      updates[`users/${this.currentUser?.uid}/games`] = dataObj;
      await update(ref(db), updates);
    } catch (err) {
      console.error("doSaveGamesToFirebase in firebaseAuth: ", err);
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

  public async doUpdateGroupToFirebase(groupId: string, group: any) {
    const db = getDatabase();
    const updates: any = {};
    updates[`groups/${groupId}`] = group;
    await update(ref(db), updates);
  }

  public async doAddGroupToFirebase(group: any): Promise<string | null> {
    this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
    const db = getDatabase();

    // Get a key for a new Group.
    const newGroupKey = push(child(ref(db), 'groups')).key;

    // Write the new Group's data
    const updates: any = {};
    updates[`groups/${newGroupKey}`] = group;
    updates[`users/${this.currentUser?.uid}/groups/${newGroupKey}`] = true;

    update(ref(db), updates);

    return newGroupKey;
  }

  public async deleteUser() {
    await FirebaseAuthentication.deleteUser();
  }

  public async loadGame() {
    return new Promise<any>(async (resolve: any) => {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const dbRef = ref(getDatabase());
      get(child(dbRef, `users/${this.currentUser?.uid}`)).then((snapshot) => {
        if (snapshot.exists()) {
          this.loadedData = snapshot.val();
        }
        resolve(this.loadedData);
      }).catch((error) => {
        this.logger.error("Error on firebase loadGame: " + error + " ||| " + JSON.stringify(error), error);
        resolve(this.loadedData);
      });
    });
  }

  public async loadGroups() {
    return new Promise<any>(async (resolve: any) => {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const dbRef = ref(getDatabase());
      get(child(dbRef, `users/${this.currentUser?.uid}/groups`)).then((snapshot) => {
        if (snapshot.exists()) {
          this.loadedData = snapshot.val();
        }
        resolve(this.loadedData);
      }).catch((error) => {
        this.logger.error("Error on firebase loadGame: " + error + " ||| " + JSON.stringify(error), error);
        resolve(this.loadedData);
      });
    });
  }

  public async loadGroup(groupId: string) {
    return new Promise<any>(async (resolve: any) => {
      this.currentUser = (await FirebaseAuthentication.getCurrentUser()).user;
      const dbRef = ref(getDatabase());
      get(child(dbRef, `groups/${groupId}`)).then((snapshot) => {
        if (snapshot.exists()) {
          this.loadedData = snapshot.val();
        }
        resolve(this.loadedData);
      }).catch((error) => {
        this.logger.error("Error on firebase loadGame: " + error + " ||| " + JSON.stringify(error), error);
        resolve(this.loadedData);
      });
    });
  }

  public async listenToChanges() {
    const starCountRef = ref(getDatabase(), `groups/${this.currentUser?.uid}`);
    onValue(starCountRef, (snapshot) => {
      const data = snapshot.val();
    });
  }
}