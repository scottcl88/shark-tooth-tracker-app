/**
Copyright 2025 Scott Lewis, All rights reserved.
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
    
    // Restore data from backup if needed
    await this.restoreFromBackup();
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
      if (preferenceValue == "true" || preferenceValue?.toLocaleLowerCase() == "true") {
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
    if (this._storage) {
      this._storage.set(key, value);
    } else {
      console.warn('Storage not initialized, falling back to localStorage');
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (err) {
        console.error('Failed to save to localStorage:', err);
      }
    }
  }

  public async get(key: string) {
    if (this._storage) {
      return await this._storage.get(key);
    } else {
      console.warn('Storage not initialized, falling back to localStorage');
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (err) {
        console.error('Failed to read from localStorage:', err);
        return null;
      }
    }
  }

  public async ensureDataPersistence() {
    // Ensure critical data is backed up to both Ionic Storage and localStorage
    if (this._storage) {
      try {
        const account = await this._storage.get('account');
        const teeth = await this._storage.get('teeth');
        const disableLogin = await this._storage.get('disableLogin');
        
        if (account) {
          localStorage.setItem('backup_account', JSON.stringify(account));
        }
        if (teeth) {
          localStorage.setItem('backup_teeth', JSON.stringify(teeth));
        }
        if (disableLogin !== null) {
          localStorage.setItem('backup_disableLogin', JSON.stringify(disableLogin));
        }
        
        console.debug('Data backup to localStorage completed');
      } catch (err) {
        console.error('Failed to backup data:', err);
      }
    }
  }

  public async restoreFromBackup() {
    // Restore data from localStorage backup if Ionic Storage is empty
    if (this._storage) {
      try {
        const account = await this._storage.get('account');
        const teeth = await this._storage.get('teeth');
        
        if (!account) {
          const backupAccount = localStorage.getItem('backup_account');
          if (backupAccount) {
            await this._storage.set('account', JSON.parse(backupAccount));
            console.debug('Restored account from backup');
          }
        }
        
        if (!teeth) {
          const backupTeeth = localStorage.getItem('backup_teeth');
          if (backupTeeth) {
            await this._storage.set('teeth', JSON.parse(backupTeeth));
            console.debug('Restored teeth from backup');
          }
        }
      } catch (err) {
        console.error('Failed to restore from backup:', err);
      }
    }
  }
}
