import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { IonicStorageModule } from '@ionic/storage-angular';
import cordovaSQLiteDriver from 'localforage-cordovasqlitedriver';
import { Drivers, Storage } from '@ionic/storage';
import { ModalSignInPageModule } from './modal-signin/modal-signin.module';
import { CommonModule } from '@angular/common';
import { StorageService } from './storage.service';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { LoggerService } from './logger.service';
import { appInitializer } from './_helpers';
import { DateFnsModule } from 'ngx-date-fns';
import { GeocodeService } from './geocode.service';
import { HttpClientModule } from '@angular/common/http';
import { CollectionService } from './collection.service';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getFunctions, provideFunctions } from '@angular/fire/functions';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot({ innerHTMLTemplatesEnabled: true }),
    DateFnsModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    IonicStorageModule.forRoot({
      driverOrder: [cordovaSQLiteDriver._driver, Drivers.IndexedDB, Drivers.LocalStorage]
    }),
    CommonModule,
    ModalSignInPageModule,
    RouterModule,
    provideFirebaseApp(() => initializeApp(
      { "projectId": "shark-tooth-tracker", "appId": "1:403064580432:web:40288c628e26a1e8a8a455", "databaseURL": "https://shark-tooth-tracker-default-rtdb.firebaseio.com", "storageBucket": "shark-tooth-tracker.appspot.com", "apiKey": "AIzaSyBRDTBIiPMYYBvp6bIOsPXf-Id9uXkLh4M", "authDomain": "shark-tooth-tracker.firebaseapp.com", "messagingSenderId": "403064580432", "measurementId": "G-C5TN65XBDG" }
    )),
    provideFunctions(() => getFunctions()),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    { provide: APP_INITIALIZER, useFactory: appInitializer, multi: true, deps: [StorageService, FirebaseAuthService, CollectionService, LoggerService, GeocodeService] },
  ],
  bootstrap: [AppComponent],
})
export class AppModule { }
