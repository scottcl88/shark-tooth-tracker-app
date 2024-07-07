/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, OnInit } from '@angular/core';
import { ModalController, PopoverController, ToastController } from '@ionic/angular';
import { LoggerService } from '../logger.service';
import { CoreUtilService } from '../core-utils';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Account } from '../_models';
import { StorageService } from '../storage.service';
import { Device } from '@capacitor/device';
import { Router } from '@angular/router';

@Component({
  selector: 'app-modal-feedback',
  templateUrl: './modal-feedback.page.html',
  styleUrls: ['./modal-feedback.page.scss'],
})
export class ModalFeedbackPage implements OnInit {

  public isComplete: boolean = false;
  public submitDisabled: boolean = true;

  public comments: string = "";
  public rating: number = 0;
  public showContactCheck: boolean = false;
  public contactCheck: boolean = true;
  public account: Account;
  public platform: string = "";

  constructor(private logger: LoggerService, private coreUtilService: CoreUtilService, private modalController: ModalController, private popoverController: PopoverController,
    public toastController: ToastController, private httpClient: HttpClient, private storageService: StorageService, private router: Router) {
  }

  async ngOnInit() {
    console.log("ngOnInit feedback");
    this.account = await this.storageService.getAccount() ?? new Account();
    if (this.account && this.account.userId) {
      if (this.account.canContact) {
        this.showContactCheck = false;
      } else {
        this.showContactCheck = true;
        this.contactCheck = false;
      }
    } else {
      this.contactCheck = false;
    }
    const info = await Device.getInfo();
    this.platform = info.platform;
  }
  commentsOnChange(e: any) {
    this.comments = e.detail.value;
    if (this.comments) {
      this.submitDisabled = false;
    } else {
      this.submitDisabled = true;
    }
  }
  contactCheckOnChange(e: any) {
    this.contactCheck = e.detail.checked;
  }
  onRateChange(ratingNumber: any) {
    console.log("onRateChange:", ratingNumber);
    this.rating = ratingNumber;
  }
  openGoogleStore() {
    window.open("https://play.google.com/store/apps/details?id=com.lewis.sharktoothtracker", "_blank");
  }
  openAppStore() {
    window.open("https://apps.apple.com/us/app/shark-tooth-tracker/id6476787130", "_blank");
  }
  async goToHelp() {
    await this.router.navigate(['/help']);
    await this.dismiss();
  }
  async submitFeedback() {
    if (this.submitDisabled) {
      return;
    }
    this.submitDisabled = true;
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'x-functions-key': 'DU1yc4gh7eArMqNLFZhthjd0ovaUrs9bTDP2tUR3YZJgAzFuNGZkMg=='
    });
    let options = { headers: headers };
    let body = { comments: this.comments, rating: this.rating, userId: this.account.userId, canContact: this.contactCheck };
    this.httpClient.post("https://shark-tooth-tracker-email-functions.azurewebsites.net/api/FeedbackEmail", body, options).subscribe({
      next: (res) => {
        console.log("Successfully submitted feedback", res);
        this.submitDisabled = true;
        this.isComplete = true;
      }, error: (err) => {
        console.error("Failed on submitted feedback", err);
        this.submitDisabled = true;
        this.isComplete = true;
      },
      complete: () => {
        console.log("completed send feedback");
        this.submitDisabled = true;
        this.isComplete = true;
      }
    });
  }

  async dismiss() {
    await this.modalController.dismiss({
    });
  }
}
