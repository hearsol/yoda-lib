import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaListComponent } from './yoda-list.component';

describe('YodaListComponent', () => {
  let component: YodaListComponent;
  let fixture: ComponentFixture<YodaListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
