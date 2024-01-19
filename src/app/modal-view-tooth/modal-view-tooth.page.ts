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
import { Camera, CameraResultType } from '@capacitor/camera';


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
  public notes: string;
  public description: string;
  public location?: CoordinatesPositionModel | null;
  public foundDateTime?: Date;
  public isDirty: boolean = false;
  public isLoaded: boolean = false;

  public theme: string = "dark";

  public account: Account;

  public connectedNetwork: boolean = false;

  public distanceColor: string = "black";


  constructor(private logger: LoggerService, private modalController: ModalController, private alertController: AlertController,
    public toastController: ToastController,
    private coreUtilService: CoreUtilService, private storageService: StorageService) {
  }

  async ngOnInit() {
    this.account = await this.storageService.getAccount() ?? new Account();

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    if (prefersDark && prefersDark.matches) {
      this.distanceColor = "white";
    }

    // Listen for changes to the prefers-color-scheme media query
    prefersDark.addEventListener('change', (mediaQuery) => this.toggleDarkTheme(mediaQuery.matches));

    this.toggleDarkTheme(prefersDark.matches);
  }

  async ngAfterViewInit() {
    this.isLoaded = true;
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

  takePicture(){
    const takePicture = async () => {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
    
      // image.webPath will contain a path that can be set as an image src.
      // You can access the original file using image.path, which can be
      // passed to the Filesystem API to read the raw data of the image,
      // if desired (or pass resultType: CameraResultType.Base64 to getPhoto)
      var imageUrl = image.webPath;
    
      // Can be set to the src of an image now
      this.imageUrl = imageUrl ?? "";
    };
  }

  descriptionChange(e: any) {
    let value = e.detail.value;
    this.description = value;
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
      saved: saved
    });
  }
}
