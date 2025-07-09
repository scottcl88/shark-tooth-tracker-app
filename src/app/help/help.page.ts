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
  selector: 'app-help',
  templateUrl: './help.page.html',
  styleUrls: ['./help.page.scss'],
})
export class HelpPage {
  public account: Account;

  constructor(private coreUtilService: CoreUtilService, private router: Router, private storageService: StorageService, 
    private location: Location){}

  async startTutorial() {    
    this.account = await this.storageService.getAccount() ?? new Account();
    // this.coreUtilService.showTour();
  }

  async goToTips() {
    console.log("goToTips");
    this.router.navigate(['/tips']);
  }
  goBack() {
    this.location.back();
  }
  contact(){
    window.open("mailto:support@sharktoothtracker.com", "_blank");
  }
}
