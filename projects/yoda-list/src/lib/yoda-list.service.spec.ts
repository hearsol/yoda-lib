import { TestBed } from '@angular/core/testing';

import { YodaListService } from './yoda-list.service';

describe('YodaListService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YodaListService = TestBed.get(YodaListService);
    expect(service).toBeTruthy();
  });
});
