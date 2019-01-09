import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaFormComponent } from './yoda-form.component';

describe('YodaFormComponent', () => {
  let component: YodaFormComponent;
  let fixture: ComponentFixture<YodaFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
