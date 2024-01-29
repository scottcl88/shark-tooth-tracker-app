/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, ToastController } from '@ionic/angular';
import { LoggerService } from '../logger.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { Device, DeviceInfo } from '@capacitor/device';

@Component({
  selector: 'app-modal-signin',
  templateUrl: './modal-signin.page.html',
  styleUrls: ['./modal-signin.page.scss'],
})
export class ModalSignInPage implements OnInit {

  @ViewChild(IonInput) inputText: IonInput;

  public email: string = "";
  public disabled: boolean = false;
  public platform: string;

  constructor(private logger: LoggerService, private modalController: ModalController,
    private firebaseAuthService: FirebaseAuthService, public toastController: ToastController) {
  }

  async ngOnInit() {
    const info = await Device.getInfo();
    this.platform = info.platform;
  }

  async signInWithGoogle() {
    let result = await this.firebaseAuthService.signIn("android");
    console.debug("SignInResult signInWithGoogle: ", result, JSON.stringify(result));
    this.dismiss(false);
  }

  async signInWithApple() {
    let result = await this.firebaseAuthService.signIn("ios");
    console.debug("SignInResult signInWithApple: ", result, JSON.stringify(result));
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
