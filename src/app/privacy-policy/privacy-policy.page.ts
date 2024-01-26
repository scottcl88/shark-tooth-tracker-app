/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2024 Scott Lewis, All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage implements OnInit{

  constructor(private router: Router){}
  async ngOnInit() {
    //window.open("https://app.termly.io/document/privacy-policy/245c3211-d4cd-449f-920a-54e76ff2367b", "_self");
  }

  async goToProfile() {
    await this.router.navigate(['/tabs/profile']);
  }
}
