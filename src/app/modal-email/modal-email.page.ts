/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, ToastController } from '@ionic/angular';
import { environment } from 'src/environments/environment';
import { LoggerService } from '../logger.service';

@Component({
  selector: 'app-modal-email',
  templateUrl: './modal-email.page.html',
  styleUrls: ['./modal-email.page.scss'],
})
export class ModalEmailPage {

  @ViewChild(IonInput) inputText: IonInput;

  public email: string = "";
  public disabled: boolean = false;

  constructor(private logger: LoggerService, private modalController: ModalController, public toastController: ToastController) {
  }

  async ionViewDidEnter() {
    this.inputText.setFocus();
  }

  inputOnChange(e: any) {
    let text = e.detail.value.toLocaleLowerCase();
    this.email = e.detail.value;
    if (text) {
      this.disabled = false;
    } else {
      this.disabled = true;
    }
  }


  dismiss(saved: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      saved: saved,
      email: this.email
    });
  }
}
