import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalViewToothPageModule } from '../modal-view-tooth/modal-view-tooth.module';
import { ModalViewToothPage } from '../modal-view-tooth/modal-view-tooth.page';
import { CollectionService } from '../collection.service';
import { ToothModel } from '../_models/toothModel';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage implements OnInit {

  public allTeeth: ToothModel[] = [];

  constructor(private modalController: ModalController, private collectionService: CollectionService) { }

  async ngOnInit() {
    this.allTeeth = await this.collectionService.getTeeth();
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
        isNew: false
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
        isNew: true
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
    if(data.removed){
      newTooth.deletedDate = new Date();
    }
    if (data.toothId && data.toothId > 0) {
      newTooth.toothId = data.toothId;
      await this.collectionService.saveTooth(newTooth);
    } else {
      newTooth.toothId = this.collectionService.getNewToothId();
      await this.collectionService.addTooth(newTooth);
    }
    this.allTeeth = await this.collectionService.getTeeth();
    console.log("AllTeeth: ", this.allTeeth);
  }
}
