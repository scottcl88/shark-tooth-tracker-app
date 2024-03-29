/**
Copyright 2024 Scott Lewis, All rights reserved.
**/
import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, ModalController, ToastController } from '@ionic/angular';
import { LoggerService } from '../logger.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { environment } from 'src/environments/environment';
import { CoordinatesPositionModel } from '../_models';

@Component({
  selector: 'app-modal-map',
  templateUrl: './modal-map.page.html',
  styleUrls: ['./modal-map.page.scss'],
})
export class ModalMapPage implements OnInit {

  @ViewChild(IonInput) inputText: IonInput;

  public location: CoordinatesPositionModel;
  public disabled: boolean = false;
  public markerId: string;

  public markerOptions: any;
  public mapOptions: any;
  public markerPosition: any = { lat: 20, lng: 20 };

  constructor(private logger: LoggerService, private modalController: ModalController,
    private firebaseAuthService: FirebaseAuthService, public toastController: ToastController) {
  }

  async ngOnInit() {
    console.log("Location for onMap: ", this.location);
    let zoom = this.location ? 15 : 4;

    if (!this.location) {
      this.location = new CoordinatesPositionModel();
    }

    this.markerPosition = {
      lat: this.location?.latitude ?? 0,
      lng: this.location?.longitude ?? 0,
    };
    this.markerOptions = {
      draggable: true,
    };
    this.mapOptions = {
      center: this.markerPosition,
      zoom: zoom
    };

    // const newMap = await GoogleMap.create({
    //   id: 'my-map', // Unique identifier for this map instance
    //   element: mapRef, // reference to the capacitor-google-map element
    //   apiKey: environment.googleApiKey, // Your Google Maps API Key
    //   config: {
    //     center: {
    //       // The initial position to be rendered by the map
    //       lat: this.location?.latitude ?? 0,//33.6,
    //       lng: this.location?.longitude ?? 0,//-117.9,          
    //     },        
    //     zoom: zoom, // The initial zoom level to be rendered by the map
    //   },

    // });

    //newMap.enableCurrentLocation(true);
    //newMap.enableTouch();

    // Add a marker to the map
    // this.markerId = await newMap.addMarker({
    //   coordinate: {
    //     lat: this.location?.latitude ?? 0,//33.6,
    //     lng: this.location?.longitude ?? 0,//-117.9,
    //   }
    // });
    //console.log("markerId: ", this.markerId);

    // await newMap.setOnMapClickListener(async (event) => {
    //   console.log("OnMapClick: ", event);
    //   this.location.latitude = event.latitude;
    //   this.location.longitude = event.longitude;
    //   await newMap.removeMarker(this.markerId);
    //   this.markerId = await newMap.addMarker({
    //     coordinate: {
    //       lat: this.location?.latitude ?? 0,//33.6,
    //       lng: this.location?.longitude ?? 0,//-117.9,
    //     }
    //   });
    // });
  }

  async mapClick(event: any) {
    console.log("OnMapClick: ", event, event.latLng, event.latLng.lat(), event.latLng.lng());
    this.location.latitude = event.latLng.lat();
    this.location.longitude = event.latLng.lng();

    this.markerPosition = {
      lat: this.location?.latitude ?? 0,
      lng: this.location?.longitude ?? 0,
    }
    // await newMap.removeMarker(this.markerId);
    // this.markerId = await newMap.addMarker({
    //   coordinate: {
    //     lat: this.location?.latitude ?? 0,//33.6,
    //     lng: this.location?.longitude ?? 0,//-117.9,
    //   }
    // });
  }

  dismiss(saved: boolean) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      saved: saved,
      location: this.location
    });
  }
}
