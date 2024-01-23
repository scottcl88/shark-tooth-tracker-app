/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2024 Scott Lewis, All rights reserved.
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cookie-policy',
  templateUrl: './cookie-policy.page.html',
  styleUrls: ['./cookie-policy.page.scss'],
})
export class CookiePolicyPage {

  constructor(private router: Router){}

  async goToProfile() {
    await this.router.navigate(['/tabs/profile']);
  }
}
