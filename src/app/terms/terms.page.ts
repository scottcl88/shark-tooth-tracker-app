/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
/**
 * Copyright 2025 Scott Lewis, All rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-terms',
  templateUrl: './terms.page.html',
  styleUrls: ['./terms.page.scss'],
})
export class TermsPage implements OnInit{

  constructor(private router: Router){}

  async ngOnInit() {
    //window.open("https://app.termly.io/document/terms-of-service/dbc767f1-cfaf-4bf2-b023-0edd89489b11", "_self");
  }
  async goToProfile() {
    await this.router.navigate(['/tabs/profile']);
  }
}
