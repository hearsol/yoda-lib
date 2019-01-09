import { TestBed } from '@angular/core/testing';

import { YodaFloatService } from './yoda-float.service';

describe('YodaFloatService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YodaFloatService = TestBed.get(YodaFloatService);
    expect(service).toBeTruthy();
  });
});
