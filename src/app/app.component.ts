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
import { ToothModel } from './_models/toothModel';
import { CollectionService } from './collection.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public showPhotoFab: boolean = true;
  public routerEventSubscription: Subscription;
  public isAuthenticated: boolean = false;
  constructor(public router: Router, private firebaseAuthService: FirebaseAuthService, private collectionService: CollectionService, private storageService: StorageService, private modalController: ModalController) { }
  async ngOnInit() {
    this.routerEventSubscription = this.router.events.subscribe(async (event) => {
      if (event instanceof NavigationEnd) {
        if (event.url == "/tabs/home" || event.url == "/tabs/profile" || event.url == "/tabs" || event.url == "/" || event.url == "") {
          this.showPhotoFab = true;
        } else {
          this.showPhotoFab = false;
        }
        if (event.url != "/cookie-policy" && event.url != "/privacy-policy" && event.url != "/terms-of-use") {
          await this.doSignIn();
        }
      }
    });
  }
  async doSignIn() {
    if (!environment.enableAuth) {
      console.debug("environment enableAuth is false");
      return;
    }
    let disableLogin = await this.storageService.getDisableLogin();
    if (disableLogin) {
      console.debug("disableLogin is true, skipping login");
      return;
    }
    this.isAuthenticated = (await this.firebaseAuthService.isAuthenticated());
    if (this.isAuthenticated) {
      console.debug("already authenticated, skipping login");
      return;
    }
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
      if (data && data.saved) {
        console.log("App component adding tooth: ", data);
        await this.addTooth(data);
        await this.router.navigate(['/tabs/home']);
      }
    } catch (err) {
      console.error("takePicture error: ", err);
    }
  }
  public async addTooth(data: any) {
    let newTooth = new ToothModel();
    newTooth.createdDate = new Date();
    newTooth.photoUrl = data.imageUrl;
    newTooth.imageData = data.imageData;
    newTooth.description = data.description;
    newTooth.foundDate = data.foundDate;
    newTooth.location = data.location;
    newTooth.locationText = data.locationText;    
    newTooth.showEditLocation = data.showEditLocation;
    newTooth.toothId = this.collectionService.getNewToothId();
    await this.collectionService.addTooth(newTooth, data.doSaveImage);
    //this.allTeeth = await this.collectionService.getTeeth();
    //console.log("AllTeeth: ", this.allTeeth);
  }
}
