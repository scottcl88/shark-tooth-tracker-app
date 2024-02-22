import { ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';
import { HomePage } from './home.page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HomePage],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize allTeeth array', () => {
    expect(component.allTeeth).toBeDefined();
    expect(component.allTeeth.length).toBe(0);
  });

  it('should initialize sortArray array', () => {
    expect(component.sortArray).toBeDefined();
    expect(component.sortArray.length).toBeGreaterThan(0);
  });

  it('should initialize currentSort number', () => {
    expect(component.currentSort).toBeDefined();
    expect(component.currentSort).toBe(0);
  });

  it('should initialize listSortType string', () => {
    expect(component.listSortType).toBeDefined();
    expect(component.listSortType).toBe('dateFound');
  });

  it('should initialize teethCount number', () => {
    expect(component.teethCount).toBeDefined();
    expect(component.teethCount).toBe(0);
  });

  it('should call ngOnInit on component initialization', () => {
    spyOn(component, 'ngOnInit');
    fixture.detectChanges();
    expect(component.ngOnInit).toHaveBeenCalled();
  });

  it('should call ngOnDestroy on component destruction', () => {
    spyOn(component, 'ngOnDestroy');
    fixture.destroy();
    expect(component.ngOnDestroy).toHaveBeenCalled();
  });
});