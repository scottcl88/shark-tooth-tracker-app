import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { ModalSignInPage } from './modal-signin/modal-signin.page';
import { ModalSignInEncouragementPage } from './modal-signin-encouragement/modal-signin-encouragement.page';
import { StorageService } from './storage.service';
import { ModalController } from '@ionic/angular';
// Removed unused Camera imports
import { ModalViewToothPage } from './modal-view-tooth/modal-view-tooth.page';
import { Subscription } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { ToothModel } from './_models/toothModel';
import { CollectionService } from './collection.service';
import { LoggerService } from './logger.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent implements OnInit {
  public showPhotoFab: boolean = true;
  public routerEventSubscription: Subscription;
  public isAuthenticated: boolean = false;
  // Routes where auth prompts should be suppressed
  private readonly legalRoutes = new Set<string>([
    '/cookie-policy',
    '/privacy-policy',
    '/terms-of-use',
  ]);
  constructor(public router: Router, private readonly firebaseAuthService: FirebaseAuthService, private readonly collectionService: CollectionService,
    private readonly storageService: StorageService, private readonly modalController: ModalController, private readonly logger: LoggerService) { }
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
    // Do not rely on router events timing; check current URL directly
    if (this.isOnLegalRoute()) {
      console.debug("On legal page (by URL), skipping login");
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

    // Check if we should show sign-in encouragement
    const shouldShowReminder = await this.collectionService.shouldShowSignInReminder();
    if (shouldShowReminder) {
      const modal = await this.modalController.create({
        component: ModalSignInEncouragementPage,
        componentProps: {
        },
      });
      await modal.present();
      const { data } = await modal.onDidDismiss();

      if (data?.continueAsGuest) {
        await this.storageService.setDisableLogin(true);
      } else if (data?.signedIn) {
        this.isAuthenticated = true;
      } else if (data?.remindLater) {
        // Set a reminder to show again later
        this.storageService.set('remindSignInLater', Date.now() + (24 * 60 * 60 * 1000)); // 24 hours
      }
    } else {
      // Show regular sign-in modal for first-time users
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
  }

  // Helper: determine if current URL path is one of the legal routes
  private isOnLegalRoute(): boolean {
    try {
      const currentUrl = this.router?.url ?? '';
      const pathOnly = currentUrl.split('?')[0].split('#')[0];
      return this.legalRoutes.has(pathOnly);
    } catch {
      return false;
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
      if (data?.saved) {
        console.log("App component adding tooth: ", data);
        await this.addTooth(data);
        await this.router.navigate(['/tabs/home']);
      }
    } catch (err: any) {
      this.logger.error("takePicture error: ", err);
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
  }
}
