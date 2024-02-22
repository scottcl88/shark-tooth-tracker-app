import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatsPage } from './stats.page';
import { CoreUtilService } from '../core-utils';
import { StorageService } from '../storage.service';
import { Location } from '@angular/common';
import { CollectionService } from '../collection.service';
import { ToothModel } from '../_models/toothModel';
import { Account } from '../_models';
import { of } from 'rxjs';

describe('StatsPage', () => {
  let component: StatsPage;
  let fixture: ComponentFixture<StatsPage>;
  let coreUtilService: CoreUtilService;
  let storageService: StorageService;
  let location: Location;
  let collectionService: CollectionService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StatsPage],
      providers: [
        { provide: CoreUtilService, useValue: {} },
        { provide: StorageService, useValue: {} },
        { provide: Location, useValue: {} },
        { provide: CollectionService, useValue: {} },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatsPage);
    component = fixture.componentInstance;
    coreUtilService = TestBed.inject(CoreUtilService);
    storageService = TestBed.inject(StorageService);
    location = TestBed.inject(Location);
    collectionService = TestBed.inject(CollectionService);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call updateStats', async () => {
      spyOn(component, 'updateStats');
      await component.ngOnInit();
      expect(component.updateStats).toHaveBeenCalled();
    });
  });

  describe('updateStats', () => {
    it('should call calculateMinutes, calculateAverageTeethPerFind, and findLocationWithMostTeeth', () => {
      spyOn(component, 'calculateMinutes');
      spyOn(component, 'calculateAverageTeethPerFind');
      spyOn(component, 'findLocationWithMostTeeth');
      component.updateStats();
      expect(component.calculateMinutes).toHaveBeenCalled();
      expect(component.calculateAverageTeethPerFind).toHaveBeenCalled();
      expect(component.findLocationWithMostTeeth).toHaveBeenCalled();
    });
  });

  describe('calculateMinutes', () => {
    it('should calculate minMinutes, maxMinutes, and averageMinutes', () => {
      // Mock data
      let tooth1 = new ToothModel();
      tooth1.searchMinutes = 10;
      let tooth2 = new ToothModel();
      tooth2.searchMinutes = 20;
      let tooth3 = new ToothModel();
      tooth3.searchMinutes = 30;
      const teeth: ToothModel[] = [ tooth1, tooth2, tooth3];
      component.allTeeth = teeth;

      component.calculateMinutes();

      expect(component.minMinutes).toBe(10);
      expect(component.maxMinutes).toBe(30);
      expect(component.averageMinutes).toBe(20);
    });
  });

  describe('calculateAverageTeethPerFind', () => {
    it('should calculate averageTeethPerFind', () => {
      // Mock data
      let tooth1 = new ToothModel();
      tooth1.teethCount = 2;
      let tooth2 = new ToothModel();
      tooth2.teethCount = 3;
      let tooth3 = new ToothModel();
      tooth3.teethCount = 4;
      const teeth: ToothModel[] = [tooth1, tooth2, tooth3];
      component.allTeeth = teeth;

      component.calculateAverageTeethPerFind();

      expect(component.averageTeethPerFind).toBe(3);
    });
  });

  describe('findLocationWithMostTeeth', () => {
    it('should find the location with the most teeth', () => {
      // Mock data
      let tooth1 = new ToothModel();
      tooth1.locationText = "Location A";
      let tooth2 = new ToothModel();
      tooth2.locationText = "Location B";
      let tooth3 = new ToothModel();
      tooth3.locationText = "Location A";
      let tooth4 = new ToothModel();
      tooth4.locationText = "Location C";
      let tooth5 = new ToothModel();
      tooth5.locationText = "Location B";
      let tooth6 = new ToothModel();
      tooth6.locationText = "Location B";
      const teeth: ToothModel[] = [tooth1, tooth2, tooth3, tooth4, tooth5, tooth6];
      component.allTeeth = teeth;

      component.findLocationWithMostTeeth();

      expect(component.locationWithMostTeeth).toBe('Location B');
    });
  });

  describe('ngOnDestroy', () => {
    it('should unsubscribe from teethSubscription', () => {
      component.teethSubscription = of().subscribe();
      spyOn(component.teethSubscription, 'unsubscribe');
      component.ngOnDestroy();
      expect(component.teethSubscription.unsubscribe).toHaveBeenCalled();
    });
  });

  describe('startTutorial', () => {
    it('should navigate to the tutorial page', () => {
      spyOn(location, 'back');
      component.startTutorial();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('goBack', () => {
    it('should navigate back', () => {
      spyOn(location, 'back');
      component.goBack();
      expect(location.back).toHaveBeenCalled();
    });
  });

  describe('contact', () => {
    it('should navigate to the contact page', () => {
      spyOn(location, 'back');
      component.contact();
      expect(location.back).toHaveBeenCalled();
    });
  });
});
