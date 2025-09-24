/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { AlertController, IonDatetime, ModalController, Platform, ToastController } from '@ionic/angular';
import { CoreUtilService } from '../core-utils';
import { Account, CoordinatesPositionModel } from '../_models';
import { StorageService } from '../storage.service';
import { LoggerService } from '../logger.service';
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { GeocodeService } from '../geocode.service';
import { format } from 'date-fns';
import { Device } from '@capacitor/device';
import { NgxGpAutocompleteDirective } from '@angular-magic/ngx-gp-autocomplete';
import { FirebaseAuthService } from 'src/firebaseAuth.service';

@Component({
  selector: 'app-modal-view-tooth',
  templateUrl: './modal-view-tooth.page.html',
  styleUrls: ['./modal-view-tooth.page.scss'],
})
export class ModalViewToothPage implements OnInit, AfterViewInit {

  @ViewChild(IonDatetime) datetime: IonDatetime;

  public isNew: boolean = true;
  public imageUrl: string;
  public imageData: any;
  public imageFailed: boolean = false;
  public isoDate: string;
  public description: string;
  public teethCount: number;
  public locationText: string;
  public location?: CoordinatesPositionModel | null;
  public foundDate: Date = new Date();
  public isDirty: boolean = false;
  public isLoaded: boolean = false;
  public autoTakePic: boolean = false;
  public toothId: number;
  public showEditLocation: boolean = false;
  public searchMinutes: number;
  public beachName: string;
  public beachAccess: string;
  private doSaveImage: boolean = false;

  public theme: string = "dark";

  public account: Account;
  public isAuthenticated: boolean;

  public connectedNetwork: boolean = false;

  public distanceColor: string = "black";

  @ViewChild('ngxPlaces') placesRef: NgxGpAutocompleteDirective;

  constructor(private readonly logger: LoggerService, private readonly modalController: ModalController, private readonly alertController: AlertController,
    public readonly toastController: ToastController, private readonly geocodeService: GeocodeService, private readonly platform: Platform, private readonly firebaseAuthService: FirebaseAuthService,
    private readonly coreUtilService: CoreUtilService, private readonly storageService: StorageService) {
  }
  async ngOnInit() {
    this.account = await this.storageService.getAccount() ?? new Account();
    this.isAuthenticated = (await this.firebaseAuthService.isAuthenticated());

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark?.matches) {
      this.distanceColor = "white";
    }

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => {
      if (mediaQuery.matches) {
        this.applyDarkTheme();
      } else {
        this.applyLightTheme();
      }
    });

    if (prefersDark.matches) {
      this.applyDarkTheme();
    } else {
      this.applyLightTheme();
    }

    let options: any = { timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
    const formattedDate = format(this.foundDate, "yyyy-MM-dd'T'HH:mm:ssXXX", options);
    console.log("formattedDate: ", formattedDate);
    this.isoDate = formattedDate;

    if (this.isNew) {
      await this.recordLocation();
      this.showEditLocation = !this.location;
      this.teethCount = 1;
    }
    if (this.autoTakePic) {
      await this.takePicture();
    }

    if (!this.teethCount || this.teethCount < 1) {
      this.teethCount = 1;
    }

    if (!this.showEditLocation && !this.location) {
      this.showEditLocation = true;
    }
  }

  async ngAfterViewInit() {
    this.isLoaded = true;
  }

  async handleAddressChange(placeResult: google.maps.places.PlaceResult) {
    console.log("handleAddressChange: ", placeResult);
    // Extract the city name, state name, latitude, and longitude
    const addressComponents = placeResult.address_components || [];

    let city = '';
    let state = '';
    let latitude = 0;
    let longitude = 0;

    for (const component of addressComponents) {
      const types = component.types || [];

      if (types.includes('locality')) {
        // City name
        city = component.long_name;
      } else if (types.includes('administrative_area_level_1')) {
        // State name
        state = component.long_name;
      }
    }

    // Latitude and Longitude
    if (placeResult.geometry?.location) {
      latitude = placeResult.geometry.location.lat();
      longitude = placeResult.geometry.location.lng();
    }

    // Now you can use the extracted values
    console.log('City:', city);
    console.log('State:', state);
    console.log('Latitude:', latitude);
    console.log('Longitude:', longitude);

    this.location = new CoordinatesPositionModel();
    this.location.state = state;
    this.location.city = city;
    this.location.latitude = latitude ?? 0;
    this.location.longitude = longitude ?? 0;
    this.location.latitudeText = latitude?.toPrecision(5) ?? "";
    this.location.longitudeText = longitude?.toPrecision(5) ?? "";
    this.location.locationHref = `https://www.google.com/maps?q=${this.location.latitudeText},${this.location.longitudeText}`;
    this.showEditLocation = false;
  }

  async recordLocation(doRequestLocation: boolean = false) {
    let hasLocationPermission = await this.coreUtilService.hasLocationPermission();
    if (doRequestLocation && !hasLocationPermission) {
      let requestLocationPermission = await this.coreUtilService.requestLocationPermission();
      if (!requestLocationPermission) {
        this.coreUtilService.presentToastError("Please enable location services to record current location");
        return;
      }
      hasLocationPermission = await this.coreUtilService.hasLocationPermission();
    }
    if (hasLocationPermission && this.account.recordLocationOption != "neverAllow") {
      try {
        const coordinates = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
        let model = new CoordinatesPositionModel();
        model.init(coordinates.coords);
        console.debug("coordinates set: ", JSON.stringify(model));
        if (coordinates) {
          this.location = (coordinates as any) ?? new CoordinatesPositionModel();
          if (this.location) {
            this.location.latitude = model.latitude;
            this.location.longitude = model.longitude;

            this.location.latitudeText = model.latitude?.toPrecision(5) ?? "";
            this.location.longitudeText = model.longitude?.toPrecision(5) ?? "";
            this.location.locationHref = `https://www.google.com/maps?q=${this.location.latitudeText},${this.location.longitudeText}`;

            let geocodeResult = await this.geocodeService.getStateName(model.latitude ?? 0, model.longitude ?? 0);
            this.location.city = geocodeResult.city ?? "Unknown";
            this.location.state = geocodeResult.state ?? "Unknown";
          }
        } else {
          this.location = null;
          this.logger.error(`recordLocation-getCurrentPosition 2 error. Coordinates are null`);
        }
        this.showEditLocation = !this.location;
      } catch (err: any) {
        this.logger.error(`recordLocation-getCurrentPosition 1 err`, err);
        await this.coreUtilService.presentToastError("Please enable location services");
      }
    }
    else {
      console.debug("Location not recorded since its not allowed by user in settings. ", hasLocationPermission, this.account.recordLocationOption);
    }
  }

  private applyDarkTheme() {
    this.theme = "dark";
    this.distanceColor = "white";
  }

  private applyLightTheme() {
    this.theme = "light";
    this.distanceColor = "black";
  }

  onImageError(e: any) {
    console.log("onImageError: ", e);
    this.imageFailed = true;
  }

  async takePicture() {
    if (this.isAuthenticated) {
      try {
        const image = await Camera.getPhoto({
          quality: 100,
          resultType: CameraResultType.Uri,
          direction: CameraDirection.Rear,
        });

        this.imageData = image;
        let deviceInfo = await Device.getInfo();
        if (deviceInfo.platform == "web") {
          let photoPath: any = image.webPath;
          const response = await fetch(photoPath);
          const blob = await response.blob();
          this.imageData = blob;
        } else {
          this.imageData = image.path ?? "";
        }
        this.imageUrl = image.webPath ?? "";
        this.imageFailed = false;
        this.doSaveImage = true;
      } catch (err: any) {
        this.logger.error("takePicture error: ", err);
        this.coreUtilService.presentToastError("Error taking picture");
      }
    } else {
      try {
        const image = await Camera.getPhoto({
          quality: 100,
          resultType: CameraResultType.DataUrl,
          direction: CameraDirection.Rear,
        });

        this.imageData = image;

        console.log("Image result with base64 as not authenticated: ", image);
        this.imageData = image.dataUrl ?? "";
        this.imageUrl = image.dataUrl ?? "";
        this.imageFailed = false;
        this.doSaveImage = true;
      } catch (err: any) {
        this.logger.error("takePicture error: ", err);
        this.coreUtilService.presentToastError("Error taking picture");
      }
    }
  }

  editLocation() {
    this.showEditLocation = true;
  }

  undoLocation() {
    this.showEditLocation = false;
  }

  teethCountChange(e: any) {
    let value = e.detail.value;
    this.teethCount = value;
  }

  searchMinutesChange(e: any) {
    let value = e.detail.value;
    this.searchMinutes = value;
  }

  beachAccessChange(e: any) {
    let value = e.detail.value;
    this.beachAccess = value;
  }

  beachNameChange(e: any) {
    let value = e.detail.value;
    this.beachName = value;
  }

  descriptionChange(e: any) {
    let value = e.detail.value;
    this.description = value;
  }

  locationChange(e: any) {
    let value = e.target.value;
    this.locationText = value;
    this.showEditLocation = true;
    console.log("locationChange locationText: ", this.locationText);
  }

  foundDateChange(e: any) {
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
    this.isDirty = false;
  }

  async dismiss(removed: boolean, saved: boolean) {
    await this.modalController.dismiss({
      removed: removed,
      saved: saved,
      toothId: this.toothId,
      imageUrl: this.imageUrl,
      imageData: this.imageData,
      description: this.description ?? "",
      teethCount: this.teethCount,
      foundDate: this.foundDate,
      location: this.location,
      locationText: this.locationText,
      showEditLocation: this.showEditLocation,
      searchMinutes: this.searchMinutes,
      beachName: this.beachName,
      beachAccess: this.beachAccess,
      doSaveImage: this.doSaveImage
    });
  }
}
