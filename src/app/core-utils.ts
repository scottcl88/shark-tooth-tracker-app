/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Injectable, inject } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController, LoadingController, ToastController } from "@ionic/angular";
import { StorageService } from "./storage.service";
import { Account } from "./_models";
import { Geolocation } from "@capacitor/geolocation";

@Injectable({
  providedIn: 'root',
})
export class CoreUtilService {
  private loadingElement: any;
  private isLoadingShown: boolean = false;

  constructor(private router: Router, private alertController: AlertController, private storageService: StorageService,
    private loadingController: LoadingController, private toastController: ToastController) {

  }

  async hasLocationPermission(): Promise<boolean> {
    return new Promise(async (resolve: any) => {
      try {
        let permissionStatus = await Geolocation.checkPermissions();
        if (permissionStatus.coarseLocation == "granted" || permissionStatus.location == "granted") {
          resolve(true);
        }
        resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  async requestLocationPermission(): Promise<boolean> {
    return new Promise(async (resolve: any) => {
      try {
        let permissionStatus = await Geolocation.requestPermissions();
        if (permissionStatus.coarseLocation == "granted" || permissionStatus.location == "granted") {
          resolve(true);
        }
        resolve(false);
      } catch (err) {
        resolve(false);
      }
    });
  }

  async presentLoading(message: string = "Loading") {
    if (this.isLoadingShown) {
      return;
    }
    this.loadingElement = await this.loadingController.create({
      message: message,
      cssClass: '',
      showBackdrop: true
    });
    await this.loadingElement.present();
    this.isLoadingShown = true;
  }

  async presentDisclaimerAlert() {
    const alert = await this.alertController.create({
      header: 'Disclaimer',
      message: `The user assumes all responsibility and liability for any and
      all consequences resulting from the use of this app or its features while operating a motor vehicle.`,
      buttons: ['OK'],
      cssClass: "topZindex"
    });

    await alert.present();
  }

  dismissLoading() {
    this.loadingElement?.dismiss();
    this.isLoadingShown = false;
  }
  async presentToastError(message: string = 'Error occurred') {
    const toast = await this.toastController.create({
      message: message,
      duration: 5000,
      color: 'danger',
      position: 'middle',
    });
    await toast.present();
  }
  async presentOfflineAlert() {
    const toast = await this.toastController.create({
      message: "You are offline. Changes you make will be stored on your phone until you are back online.",
      duration: 5000,
      color: 'dark',
      position: 'bottom',
    });
    await toast.present();
  }
  async presentToastSuccess(message: string = 'Success', duration: number = 1500) {
    const toast = await this.toastController.create({
      message: message,
      duration: duration,
      color: 'success',
      position: 'middle',
    });
    await toast.present();
  }
}
