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
    const modal = await this.modalController.create({
      component: ModalViewToothPage,
      componentProps: {
        toothId: tooth.toothId,
        createdDate: tooth.createdDate,
        imageUrl: tooth.photoUrl,
        description: tooth.description,
        foundDate: tooth.foundDate,
        location: tooth.location
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data && data.saved) {
      let newTooth = new ToothModel(tooth);
      newTooth.photoUrl = data.imageUrl;
      newTooth.description = data.description;
      newTooth.foundDate = data.foundDateTime;
      newTooth.location = data.location;
      newTooth.modifiedDate = new Date();
      await this.collectionService.saveTooth(newTooth);
      this.allTeeth = await this.collectionService.getTeeth();
      console.log("AllTeeth: ", this.allTeeth)
    }
  }

  async addTooth() {
    const modal = await this.modalController.create({
      component: ModalViewToothPage,
      componentProps: {
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data && data.saved) {
      let newTooth = new ToothModel();
      newTooth.toothId = this.collectionService.getNewToothId();
      newTooth.createdDate = new Date();
      newTooth.photoUrl = data.imageUrl;
      newTooth.description = data.description;
      newTooth.foundDate = data.foundDateTime;
      newTooth.location = data.location;
      await this.collectionService.addTooth(newTooth);
      this.allTeeth = await this.collectionService.getTeeth();
      console.log("AllTeeth: ", this.allTeeth)
    }
  }
}
