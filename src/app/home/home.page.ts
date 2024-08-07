import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalViewToothPageModule } from '../modal-view-tooth/modal-view-tooth.module';
import { ModalViewToothPage } from '../modal-view-tooth/modal-view-tooth.page';
import { CollectionService } from '../collection.service';
import { ToothModel } from '../_models/toothModel';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { ModalFeedbackPage } from '../modal-feedback/modal-feedback.page';
import { RateApp } from 'capacitor-rate-app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit, OnDestroy {

  private teethSubscription: Subscription;
  public allTeeth: ToothModel[] = [];
  public sortArray: string[] = ["Date Found"];
  public currentSort: number = 0;
  public listSortType: string = "dateFound";
  public teethCount: number = 0;
  public showFeedbackButton: boolean = false;

  constructor(private modalController: ModalController, private router: Router, private collectionService: CollectionService) { }

  async ngOnInit() {
    this.allTeeth = await this.collectionService.getTeeth();
    this.allTeeth.forEach(tooth => {
      this.teethCount += Number(tooth.teethCount);
    });
    this.teethSubscription = this.collectionService.allTeeth$.subscribe((updatedTeeth) => {
      this.allTeeth = updatedTeeth;
      this.teethCount = 0;
      this.allTeeth.forEach(tooth => {
        if (tooth.teethCount && tooth.teethCount > 0) {
          this.teethCount += Number(tooth.teethCount);
        } else {
          this.teethCount += 1;
        }
      });
      this.showFeedbackButton = this.teethCount >= 2;
    });
    this.reorderList(false);
    
    this.showFeedbackButton = this.teethCount >= 2;
  }

  ngOnDestroy() {
    this.teethSubscription.unsubscribe();
  }

  reorderList(doNext: boolean = true) {
    console.log("reorder list")
    if (doNext) {
      this.currentSort++;
    }
    if (this.currentSort >= this.sortArray.length + 1) {
      this.currentSort = 0;
    }
    this.sortList();
  }

  listSortTypeChange(e: any) {
    let type = e.detail.value;
    this.listSortType = type;
    this.sortList();
  }

  sortList(doNext: boolean = true) {
    if (this.listSortType == "dateFound" && this.currentSort == 0) {
      this.allTeeth.sort((a, b) => (new Date(a.foundDate).getTime()) - (new Date(b.foundDate).getTime()));
    }
    else if (this.listSortType == "dateFound" && this.currentSort == 1) {
      this.allTeeth.sort((a, b) => (new Date(b.foundDate).getTime()) - (new Date(a.foundDate).getTime()));
    }
  }

  async imageError(e: any, tooth: ToothModel) {
    console.log("ImageError: ", e, tooth);
    tooth.hasImageError = true;
  }

  async showFeedbackModal() {
    const modal = await this.modalController.create({
      component: ModalFeedbackPage,
      componentProps: {
      },
      id: "feedback-modal",
      showBackdrop: true,
      backdropDismiss: false,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
  }

  async editTooth(tooth: ToothModel) {
    console.log("editTooth: ", tooth);
    const modal = await this.modalController.create({
      component: ModalViewToothPage,
      componentProps: {
        toothId: tooth.toothId,
        createdDate: tooth.createdDate,
        imageUrl: tooth.photoUrl,
        description: tooth.description,
        teethCount: tooth.teethCount,
        foundDate: tooth.foundDate,
        location: tooth.location,
        locationText: tooth.locationText,
        showEditLocation: tooth.showEditLocation,
        isNew: false,
        searchMinutes: tooth.searchMinutes,
        beachName: tooth.beachName,
        beachAccess: tooth.beachAccess,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.saveTooth(data);
    }
  }

  async goToTips() {
    this.router.navigate(['/tips']);
  }

  async goToStats() {
    this.router.navigate(['/stats']);
  }

  async addTooth() {
    const modal = await this.modalController.create({
      component: ModalViewToothPage,
      componentProps: {
        isNew: true,
        autoTakePic: true,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data && data.saved) {
      await this.saveTooth(data);
    }
  }

  private async saveTooth(data: any) {
    let newTooth = new ToothModel();
    newTooth.createdDate = new Date();
    newTooth.photoUrl = data.imageUrl;
    newTooth.description = data.description;
    newTooth.teethCount = data.teethCount;
    newTooth.foundDate = data.foundDate;
    newTooth.location = data.location;
    newTooth.locationText = data.locationText;
    newTooth.showEditLocation = data.showEditLocation;
    newTooth.imageData = data.imageData;
    newTooth.searchMinutes = data.searchMinutes;
    newTooth.beachName = data.beachName;
    newTooth.beachAccess = data.beachAccess;
    if (data.removed) {
      newTooth.deletedDate = new Date();
    }
    if (data.toothId && data.toothId > 0) {
      newTooth.toothId = data.toothId;
      await this.collectionService.saveTooth(newTooth, data.doSaveImage);
    } else {
      newTooth.toothId = this.collectionService.getNewToothId();
      await this.collectionService.addTooth(newTooth, data.doSaveImage);
    }
    
    setTimeout(() => {
      if (this.teethCount >= 3) {
        RateApp.requestReview();
      }
    }, 3000);
  }
}
