import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { ModalSignInPage } from './modal-signin/modal-signin.page';
import { StorageService } from './storage.service';
import { ModalController } from '@ionic/angular';
import { Camera, CameraDirection, CameraResultType } from '@capacitor/camera';
import { ModalViewToothPage } from './modal-view-tooth/modal-view-tooth.page';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public showPhotoFab: boolean = true;
  public routerEventSubscription: Subscription;
  constructor(public router: Router, private firebaseAuthService: FirebaseAuthService, private storageService: StorageService, private modalController: ModalController) { }
  async ngOnInit() {
    this.routerEventSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == "/tabs/home" || event.url == "/tabs/profile" || event.url == "/tabs" || event.url == "/" || event.url == "") {
          this.showPhotoFab = true;
        } else {
          this.showPhotoFab = false;
        }
      }
    });
    await this.doSignIn();
  }
  async doSignIn() {
    if (!environment.enableAuth) {
      console.debug("environment enableAuth is false");
      return;
    }
    console.log("doSignIn called");
    const modal = await this.modalController.create({
      component: ModalSignInPage,
      componentProps: {
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data.continueAsGuest) {
      await this.storageService.setDisableLogin(true);
    }
  }

  async takePicture() {
    try {
      const modal = await this.modalController.create({
        component: ModalViewToothPage,
        componentProps: {
          autoTakePic: true
        },
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();

    } catch (err) {
      console.error("takePicture error: ", err);
    }
  }
}
