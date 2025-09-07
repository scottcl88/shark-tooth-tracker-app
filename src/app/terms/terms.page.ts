/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage {

  constructor(private router: Router) { }

  async goToProfile() {
    await this.router.navigate(['/tabs/profile']);
  }
}
