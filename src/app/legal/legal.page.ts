/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreUtilService } from '../core-utils';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-legal',
  templateUrl: './legal.page.html',
  styleUrls: ['./legal.page.scss'],
})
export class LegalPage implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  constructor(
    private coreUtilService: CoreUtilService,
    private router: Router,
  ) { }

  async ngOnInit() {
  }

  ngOnDestroy(): void {
    this.ngUnsubscribe.next(null);
    this.ngUnsubscribe.complete();
  }
}
