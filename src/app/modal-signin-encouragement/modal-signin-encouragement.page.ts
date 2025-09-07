/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { Device } from '@capacitor/device';
import { StorageService } from '../storage.service';
import { CollectionService } from '../collection.service';

@Component({
  selector: 'app-modal-signin-encouragement',
  templateUrl: './modal-signin-encouragement.page.html',
  styleUrls: ['./modal-signin-encouragement.page.scss'],
})
export class ModalSignInEncouragementPage implements OnInit {
  public platform: string = '';
  
  constructor(
    private modalController: ModalController,
    private firebaseAuthService: FirebaseAuthService,
    private storageService: StorageService,
    private collectionService: CollectionService
  ) { }

  async ngOnInit() {
    const info = await Device.getInfo();
    this.platform = info.platform;
  }

  async signInWithGoogle() {
    try {
      let result = await this.firebaseAuthService.signIn("android");
      console.debug("SignInResult signInWithGoogle: ", result, JSON.stringify(result));
      
      // Migrate any guest data
      const migrated = await this.collectionService.migrateGuestDataToAccount();
      if (migrated) {
        console.log("Successfully migrated guest data to account");
      }
      
      this.dismiss({ signedIn: true, continueAsGuest: false, dataMigrated: migrated });
    } catch (error) {
      console.error('Google sign-in error:', error);
      // Still dismiss but indicate sign-in failed
      this.dismiss({ signedIn: false, continueAsGuest: false });
    }
  }

  async signInWithApple() {
    try {
      let result = await this.firebaseAuthService.signIn("ios");
      console.debug("SignInResult signInWithApple: ", result, JSON.stringify(result));
      
      // Migrate any guest data
      const migrated = await this.collectionService.migrateGuestDataToAccount();
      if (migrated) {
        console.log("Successfully migrated guest data to account");
      }
      
      this.dismiss({ signedIn: true, continueAsGuest: false, dataMigrated: migrated });
    } catch (error) {
      console.error('Apple sign-in error:', error);
      // Still dismiss but indicate sign-in failed
      this.dismiss({ signedIn: false, continueAsGuest: false });
    }
  }

  async continueAsGuest() {
    // Set a flag to remind user about signing in later
    this.storageService.set('remindSignIn', true);
    this.storageService.set('guestModeStartTime', new Date().toISOString());
    this.dismiss({ signedIn: false, continueAsGuest: true });
  }

  async maybeLater() {
    // Don't disable login permanently, just dismiss for now
    this.dismiss({ signedIn: false, continueAsGuest: false, remindLater: true });
  }

  private dismiss(data: any) {
    this.modalController.dismiss(data);
  }
}
