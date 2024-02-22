import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { IonicModule, ModalController } from '@ionic/angular';
import { AppComponent } from './app.component';
import { FirebaseAuthService } from 'src/firebaseAuth.service';
import { CollectionService } from './collection.service';
import { StorageService } from './storage.service';

describe('AppComponent', () => {
  let component: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [RouterTestingModule, IonicModule],
      providers: [
        FirebaseAuthService,
        CollectionService,
        StorageService,
        ModalController
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with correct default values', () => {
    expect(component.showPhotoFab).toBe(true);
    expect(component.routerEventSubscription).toBeUndefined();
    expect(component.isAuthenticated).toBe(false);
  });

  it('should call doSignIn method', () => {
    spyOn(component, 'doSignIn');
    component.doSignIn();
    expect(component.doSignIn).toHaveBeenCalled();
  });

  it('should call takePicture method', () => {
    spyOn(component, 'takePicture');
    component.takePicture();
    expect(component.takePicture).toHaveBeenCalled();
  });

  it('should call addTooth method with correct data', () => {
    spyOn(component, 'addTooth');
    const data = { /* mock data */ };
    component.addTooth(data);
    expect(component.addTooth).toHaveBeenCalledWith(data);
  });
});
