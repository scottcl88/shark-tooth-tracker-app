/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CoreUtilService } from '../core-utils';
import { Account } from '../_models';
import { StorageService } from '../storage.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-tips',
  templateUrl: './tips.page.html',
  styleUrls: ['./tips.page.scss'],
})
export class TipsPage {
  public account: Account;

  constructor(private coreUtilService: CoreUtilService, private storageService: StorageService, 
    private location: Location){}

  async startTutorial() {    
    this.account = await this.storageService.getAccount() ?? new Account();
    // this.coreUtilService.showTour();
  }

  goBack() {
    this.location.back();
  }
  contact(){
    window.open("mailto:support@sharktoothtracker.com", "_blank");
  }
}
