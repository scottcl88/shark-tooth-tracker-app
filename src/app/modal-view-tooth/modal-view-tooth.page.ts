/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, ModalController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { CoreUtilService } from '../core-utils';
import { Account, CoordinatesPositionModel } from '../_models';
import { StorageService } from '../storage.service';
import { LoggerService } from '../logger.service';
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { GeocodeService } from '../geocode.service';
import { GoogleMap } from '@capacitor/google-maps';
import { ModalMapPage } from '../modal-map/modal-map.page';
import { format } from 'date-fns';

@Component({
  selector: 'app-modal-view-tooth',
  templateUrl: './modal-view-tooth.page.html',
  styleUrls: ['./modal-view-tooth.page.scss'],
})
export class ModalViewToothPage implements OnInit {

  @ViewChild(IonDatetime) datetime: IonDatetime;

  public isNew: boolean = true;
  public imageUrl: string;
  public imageFailed: boolean = false;
  public isoDate: string;
  public description: string;
  public location?: CoordinatesPositionModel | null;
  public foundDate: Date = new Date();
  public isDirty: boolean = false;
  public isLoaded: boolean = false;
  public autoTakePic: boolean = false;
  public toothId: number;

  public theme: string = "dark";

  public account: Account;

  public connectedNetwork: boolean = false;

  public distanceColor: string = "black";


  constructor(private logger: LoggerService, private modalController: ModalController, private alertController: AlertController,
    public toastController: ToastController, private geocodeService: GeocodeService,
    private coreUtilService: CoreUtilService, private storageService: StorageService) {
  }

  async ngOnInit() {
    console.log("")
    this.account = await this.storageService.getAccount() ?? new Account();

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark && prefersDark.matches) {
      this.distanceColor = "white";
    }

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));

    this.toggleDarkTheme(prefersDark.matches);

    // this.isoDate = this.foundDate.toISOString();

    let options: any = { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    const formattedDate = format(this.foundDate, "yyyy-MM-dd'T'HH:mm:ssXXX", options);
    console.log("formattedDate: ", formattedDate);
    this.isoDate = formattedDate;

    if (this.isNew) {
      await this.recordLocation();
    }

    if (this.autoTakePic) {
      await this.takePicture();
    }
  }

  async ngAfterViewInit() {
    this.isLoaded = true;
  }

  async openMap() {
    console.log("openMap: ", this.location);
    const modal = await this.modalController.create({
      component: ModalMapPage,
      componentProps: {
        location: this.location
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    console.log("openMap closed: ", data)
    if (data && data.saved && data.location) {
      if (this.location == null) {
        //same location, ignore
        return;
      }
      this.location.latitude = data.location.latitude;
      this.location.longitude = data.location.longitude;

      this.location.latitudeText = data.location.latitude?.toPrecision(5) ?? "";
      this.location.longitudeText = data.location.longitude?.toPrecision(5) ?? "";
      this.location.locationHref = `https://www.google.com/maps?q=${this.location.latitudeText},${this.location.longitudeText}`;

      let geocodeResult = await this.geocodeService.getStateName(data.location.latitude ?? 0, data.location.longitude ?? 0);
      this.location.city = geocodeResult.city;
      this.location.state = geocodeResult.state;
    }
  }

  async recordLocation() {
    console.log("RecordLocation started");
    let hasLocationPermission = await this.coreUtilService.hasLocationPermission();
    if (hasLocationPermission && this.account.recordLocationOption != "neverAllow") {
      try {
        const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        let model = new CoordinatesPositionModel();
        model.init(coordinates.coords);
        if (coordinates) {
          this.location = (coordinates as any) ?? new CoordinatesPositionModel();
          if (this.location) {
            this.location.latitude = model.latitude;
            this.location.longitude = model.longitude;

            this.location.latitudeText = model.latitude?.toPrecision(5) ?? "";
            this.location.longitudeText = model.longitude?.toPrecision(5) ?? "";
            this.location.locationHref = `https://www.google.com/maps?q=${this.location.latitudeText},${this.location.longitudeText}`;

            let geocodeResult = await this.geocodeService.getStateName(model.latitude ?? 0, model.longitude ?? 0);
            this.location.city = geocodeResult.city;
            this.location.state = geocodeResult.state;
          }
        } else {
          this.location = null;
        }
      } catch (err: any) {
        this.logger.error(`recordLocation-getCurrentPosition 1 err`, err);
        await this.coreUtilService.presentToastError("Please enable location services");
      }
    }
  }

  // Add or remove the "dark" class on the document body
  toggleDarkTheme(isDark: boolean) {
    if (isDark) {
      this.theme = "dark";
      this.distanceColor = "white";
    } else {
      this.theme = "light";
      this.distanceColor = "black";
    }
  }

  onImageError() {
    this.imageFailed = true;
  }

  async takePicture() {
    try {
      const image = await Camera.getPhoto({
        quality: 100,
        resultType: CameraResultType.DataUrl,
        // height: 150,
        // width: 350,
        direction: CameraDirection.Rear,
      });

      // image.webPath will contain a path that can be set as an image src.
      // You can access the original file using image.path, which can be
      // passed to the Filesystem API to read the raw data of the image,
      // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      var imageUrl = image.dataUrl;

      // Can be set to the src of an image now
      this.imageUrl = imageUrl ?? "";
    } catch (err) {
      console.error("takePicture error: ", err);
    }
  }

  descriptionChange(e: any) {
    let value = e.detail.value;
    this.description = value;
  }

  foundDateChange(e: any) {
    console.log("foundDateChange: ", e);
    let value = e.detail.value;
    this.foundDate = new Date(value);
    console.log("new foundDate: ", this.foundDate);
  }

  async confirmDeleteState() {
    const alert = await this.alertController.create({
      header: 'Delete Plate',
      subHeader: 'Do you want to delete this plate?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {

          },
        },
        {
          text: 'Delete',
          role: 'confirm',
          cssClass: 'alert-button-danger',
          handler: () => {
            this.dismiss(true, false);
          },
        },
      ],
    });

    await alert.present();
  }

  cancel() {
    // this.isoDate = formatISO(this.glp.createdDateTime);
    this.isDirty = false;
  }

  async dismiss(removed: boolean, saved: boolean) {
    await this.modalController.dismiss({
      removed: removed,
      saved: saved,
      toothId: this.toothId,
      imageUrl: this.imageUrl,
      description: this.description ?? "",
      foundDate: this.foundDate,
      location: this.location,
    });
  }
}
