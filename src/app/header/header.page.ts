/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.page.html',
  styleUrls: ['./header.page.scss'],
})
export class HeaderPage implements OnInit, OnDestroy {

  @Input() title: string;
  @Input() closeToProfileButton: boolean = true;
  @Input() menuButton: boolean = true;
  @Input() titleStyle: string;
  @Input() titleMarginLeft: string;

  constructor(private router: Router){}

  async goToProfile() {
    await this.router.navigate(['/profile']);
  }

  async ngOnInit() {
    if(!this.titleStyle){
      this.titleStyle = "font-weight: 400;";
    }
    if(this.titleMarginLeft){
      this.titleStyle += "margin-left: " + this.titleMarginLeft;
    }
  }
  async ngOnDestroy() {
  }
}
