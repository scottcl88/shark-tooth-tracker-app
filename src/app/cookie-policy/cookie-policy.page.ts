/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2024 Scott Lewis, All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.page.html',
  styleUrls: ['./cookie-policy.page.scss'],
})
export class CookiePolicyPage implements OnInit {

  constructor(private router: Router) { }

  async ngOnInit() {
    window.open("https://app.termly.io/document/cookie-policy/986e0fc9-2bc1-4b41-8856-9f2e24a9e10b");
  }

  async goToProfile() {
    await this.router.navigate(['/tabs/profile']);
  }
}
