/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, ToastController } from '@ionic/angular';
import { LoggerService } from '../logger.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';

@Component({
  selector: 'app-modal-signin',
  templateUrl: './modal-signin.page.html',
  styleUrls: ['./modal-signin.page.scss'],
})
export class ModalSignInPage {

  @ViewChild(IonInput) inputText: IonInput;

  public email: string = "";
  public disabled: boolean = false;

  constructor(private logger: LoggerService, private modalController: ModalController,
    private firebaseAuthService: FirebaseAuthService, public toastController: ToastController) {
  }

  async signInWithGoogle() {
    await this.firebaseAuthService.signIn("android");
    this.dismiss(false);
  }

  async signInWithApple() {
    await this.firebaseAuthService.signIn("ios");
    this.dismiss(false);
  }

  dismiss(continueAsGuest: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      continueAsGuest: continueAsGuest
    });
  }
}
