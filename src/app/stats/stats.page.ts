/**
Copyright 2025 Scott Lewis, All rights reserved.
**/
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoreUtilService } from '../core-utils';
import { Account } from '../_models';
import { StorageService } from '../storage.service';
import { Location } from '@angular/common';
import { ToothModel } from '../_models/toothModel';
import { Subscription } from 'rxjs';
import { CollectionService } from '../collection.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.page.html',
  styleUrls: ['./stats.page.scss'],
})
export class StatsPage implements OnInit, OnDestroy {
  public teethSubscription: Subscription;
  public allTeeth: ToothModel[] = [];
  public account: Account;

  public totalTeeth: number;
  public averageTeethPerFind: number;
  public averageMinutes: number;
  public minMinutes: number;
  public maxMinutes: number;
  public locationWithMostTeeth: string;

  constructor(private coreUtilService: CoreUtilService, private storageService: StorageService,
    private location: Location, private collectionService: CollectionService) { }

  async ngOnInit() {
    this.allTeeth = await this.collectionService.getTeeth();
    this.updateStats();
    this.teethSubscription = this.collectionService.allTeeth$.subscribe(async (updatedTeeth) => {
      this.allTeeth = updatedTeeth;
      this.updateStats();
    });
  }

  async updateStats() {
    await this.coreUtilService.presentLoading();
    this.calculateMinutes();
    this.calculateAverageTeethPerFind();
    this.findLocationWithMostTeeth();
    this.coreUtilService.dismissLoading();
  }

  //method that calculates minMinutes, maxMinutes, averageMinutes
  calculateMinutes() {
    let totalMinutes = 0;
    this.allTeeth.forEach(tooth => {
      totalMinutes += tooth.searchMinutes;
    });
    this.averageMinutes = totalMinutes / this.allTeeth.length;
    this.minMinutes = Math.min(...this.allTeeth.map(o => o.searchMinutes));
    this.maxMinutes = Math.max(...this.allTeeth.map(o => o.searchMinutes));
  }

  //method that calculates averageTeethPerFind
  calculateAverageTeethPerFind() {
    this.totalTeeth = 0;
    this.allTeeth.forEach(tooth => {
      this.totalTeeth += tooth.teethCount;
    });
    this.averageTeethPerFind = this.totalTeeth / this.allTeeth.length;
  }

  //method that finds the location with the most teeth
  findLocationWithMostTeeth() {
    let locationMap = new Map<string, number>();
    this.allTeeth.forEach(tooth => {
      if (tooth.showEditLocation && tooth.locationText) {
        if (locationMap.has(tooth.locationText)) {
          locationMap.set(tooth.locationText, locationMap.get(tooth.locationText) ?? 0 + tooth.teethCount);
        } else {
          locationMap.set(tooth.locationText, tooth.teethCount);
        }
      } else if (tooth.location) {
        let locationText = tooth.location.city + ", " + tooth.location.state;
        if (locationMap.has(locationText)) {
          locationMap.set(locationText, locationMap.get(locationText) ?? 0 + tooth.teethCount);
        } else {
          locationMap.set(locationText, tooth.teethCount);
        }
      }

    });
    let maxLocation = "";
    let maxCount = 0;
    locationMap.forEach((value, key) => {
      if (value > maxCount) {
        maxCount = value;
        maxLocation = key;
      }
    });
    this.locationWithMostTeeth = maxLocation;
  }


  ngOnDestroy() {
    this.teethSubscription.unsubscribe();
  }

  async startTutorial() {
    this.account = await this.storageService.getAccount() ?? new Account();
    // this.coreUtilService.showTour();
  }

  goBack() {
    this.location.back();
  }
  contact() {
    window.open("mailto:support@sharktoothtracker.com", "_blank");
  }
}
