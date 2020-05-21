import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { SolicitudRechazadaViewPage } from './solicitud-rechazada-view.page';

describe('SolicitudRechazadaViewPage', () => {
  let component: SolicitudRechazadaViewPage;
  let fixture: ComponentFixture<SolicitudRechazadaViewPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolicitudRechazadaViewPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(SolicitudRechazadaViewPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
