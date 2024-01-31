import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalViewToothPageModule } from '../modal-view-tooth/modal-view-tooth.module';
import { ModalViewToothPage } from '../modal-view-tooth/modal-view-tooth.page';
import { CollectionService } from '../collection.service';
import { ToothModel } from '../_models/toothModel';
import { Subscription } from 'rxjs';

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

  constructor(private modalController: ModalController, private collectionService: CollectionService) { }

  async ngOnInit() {
    this.allTeeth = await this.collectionService.getTeeth();
    this.teethSubscription = this.collectionService.allTeeth$.subscribe((updatedTeeth) => {
      this.allTeeth = updatedTeeth;
    });
    this.reorderList();
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

  async editTooth(tooth: ToothModel) {
    console.log("editTooth: ", tooth);
    const modal = await this.modalController.create({
      component: ModalViewToothPage,
      componentProps: {
        toothId: tooth.toothId,
        createdDate: tooth.createdDate,
        imageUrl: tooth.photoUrl,
        description: tooth.description,
        foundDate: tooth.foundDate,
        location: tooth.location,
        isNew: false,
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.saveTooth(data);
    }
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
    newTooth.foundDate = data.foundDate;
    newTooth.location = data.location;
    newTooth.imageData = data.imageData;
    if (data.removed) {
      newTooth.deletedDate = new Date();
    }
    if (data.toothId && data.toothId > 0) {
      newTooth.toothId = data.toothId;
      await this.collectionService.saveTooth(newTooth);
    } else {
      newTooth.toothId = this.collectionService.getNewToothId();
      await this.collectionService.addTooth(newTooth);
    }
  }
}
