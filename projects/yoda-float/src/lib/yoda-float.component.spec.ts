import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaFloatComponent } from './yoda-float.component';

describe('YodaFloatComponent', () => {
  let component: YodaFloatComponent;
  let fixture: ComponentFixture<YodaFloatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaFloatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaFloatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
