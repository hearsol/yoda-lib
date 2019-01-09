import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaFloatTestComponent } from './yoda-float-test.component';

describe('YodaFloatTestComponent', () => {
  let component: YodaFloatTestComponent;
  let fixture: ComponentFixture<YodaFloatTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaFloatTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaFloatTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
