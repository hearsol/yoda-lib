import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { YodaPaginationComponent } from './yoda-pagination.component';

describe('YodaPaginationComponent', () => {
  let component: YodaPaginationComponent;
  let fixture: ComponentFixture<YodaPaginationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ YodaPaginationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(YodaPaginationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
