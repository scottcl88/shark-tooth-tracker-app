/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2024 Scott Lewis, All rights reserved.
 */
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.page.html',
  styleUrls: ['./privacy-policy.page.scss'],
})
export class PrivacyPolicyPage {

  constructor(private router: Router){}

  async goToProfile() {
    await this.router.navigate(['/profile']);
  }
}
