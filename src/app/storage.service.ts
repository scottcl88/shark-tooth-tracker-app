/**
Copyright 2024 Scott Lewis, All rights reserved.
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
    await this.storage.remove("teeth");
    this.deleteAllCookies();
  }

  public async logout() {
    await this.storage.set('isLoggedIn', false);
    await this.storage.remove('userPhoneNumber');
    await this.storage.remove('account');
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
