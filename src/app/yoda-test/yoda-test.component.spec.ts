import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaTestComponent } from './yoda-test.component';

describe('YodaTestComponent', () => {
  let component: YodaTestComponent;
  let fixture: ComponentFixture<YodaTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
