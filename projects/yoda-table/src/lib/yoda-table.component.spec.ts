import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaTableComponent } from './yoda-table.component';

describe('YodaTableComponent', () => {
  let component: YodaTableComponent;
  let fixture: ComponentFixture<YodaTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
