import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ModalViewToothPageModule } from '../modal-view-tooth/modal-view-tooth.module';
import { ModalViewToothPage } from '../modal-view-tooth/modal-view-tooth.page';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss']
})
export class HomePage {

  constructor(private modalController: ModalController) {}

  async addTooth(){
    const modal = await this.modalController.create({
      component: ModalViewToothPage,
      componentProps: {
      },
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
  }
}
