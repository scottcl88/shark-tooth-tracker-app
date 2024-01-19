/**
Copyright 2023 Scott Lewis, All rights reserved.
**/
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import * as CordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Account } from './_models';
import { Preferences } from '@capacitor/preferences';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private _storage: Storage | null = null;

  constructor(private storage: Storage, private loggerService: LoggerService) {

  }

  async init() {
    await this.storage.defineDriver(CordovaSQLiteDriver);

    const storage = await this.storage.create();
    this._storage = storage;
  }

  public async clearData() {
    console.debug("clearData storage called, clearing storage");

    localStorage.clear();
    await this.storage.set('isLoggedIn', false);
    await this.storage.remove('userPhoneNumber');
    await this.storage.remove('account');
    await this.storage.remove("games");
    this.deleteAllCookies();
  }

  public async logout() {
    await this.storage.set('isLoggedIn', false);
    await this.storage.remove('userPhoneNumber');
    await this.storage.remove('account');
  }

  public async setDisableSpaceAlert(value: boolean) {
    await this.storage.set('disableSpaceAlert', value);
    await Preferences.set({ key: "disableSpaceAlert", value: value + "" });

    let account = await this.getAccount() ?? new Account();
    account.disableSpaceAlert = true;
    await this.setAccount(account);
  }
  public async getDisableSpaceAlert() {
    let disableSpaceAlert = await this.storage.get('disableSpaceAlert');
    if (!disableSpaceAlert) {
      let preferenceValue = (await Preferences.get({ key: "disableSpaceAlert" })).value;
      if (preferenceValue == "true") {
        disableSpaceAlert = true;
      }
    }
    return disableSpaceAlert;
  }

  public async setDisableSignInAlert(value: boolean) {
    await this.storage.set('disableSignInAlert', value);
    await Preferences.set({ key: "disableSignInAlert", value: value + "" });

    let account = await this.getAccount() ?? new Account();
    account.disableSignInAlert = true;
    await this.setAccount(account);
  }
  public async getDisableSignInAlert() {
    let disableSignInAlert = await this.storage.get('disableSignInAlert');
    if (!disableSignInAlert) {
      let preferenceValue = (await Preferences.get({ key: "disableSignInAlert" })).value;
      if (preferenceValue == "true") {
        disableSignInAlert = true;
      }
    }
    return disableSignInAlert;
  }

  public async setDisableLogin(value: boolean) {
    await this.storage.set('disableLogin', value);
    await Preferences.set({ key: "disableLogin", value: value + "" });
  }
  public async getDisableLogin() {
    let disableLogin = await this.storage.get('disableLogin');
    if (!disableLogin) {
      let preferenceValue = (await Preferences.get({ key: "disableLogin" })).value;
      if (preferenceValue == "true") {
        disableLogin = true;
      }
    }
    return disableLogin;
  }

  public async setHasTriedRestorePlayGame(value: boolean) {
    await this.storage.set('hasTriedRestorePlayGame', value);
    await Preferences.set({ key: "hasTriedRestorePlayGame", value: value + "" });

    let account = await this.getAccount() ?? new Account();
    account.hasTriedRestorePlayGame = true;
    await this.setAccount(account);
  }
  public async getHasTriedRestorePlayGame() {
    let hasTriedRestorePlayGame = await this.storage.get('hasTriedRestorePlayGame');
    if (!hasTriedRestorePlayGame) {
      let preferenceValue = (await Preferences.get({ key: "hasTriedRestorePlayGame" })).value;
      if (preferenceValue == "true") {
        hasTriedRestorePlayGame = true;
      }
    }
    return hasTriedRestorePlayGame;
  }

  public deleteAllCookies() {
    let cookies = document.cookie.split(";");

    for (const element of cookies) {
      let cookie = element;
      let eqPos = cookie.indexOf("=");
      let name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
  }

  public async setDeviceToken(token: string) {
    await this.storage.set('deviceToken', token);
  }

  public async getDeviceToken() {
    return this._storage?.get('deviceToken');
  }

  public async setAccount(account: Account) {
    account.modifiedDate = new Date();
    await this.storage.set('account', account);
    this.loggerService.setAccount(account);
  }

  public async getAccount(): Promise<Account> {
    return await this.storage.get('account');
  }

  public set(key: string, value: any) {
    this._storage!.set(key, value);
  }

  public get(key: string) {
    return this._storage!.get(key);
  }
}
