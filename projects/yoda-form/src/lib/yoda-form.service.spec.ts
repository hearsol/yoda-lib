import { TestBed } from '@angular/core/testing';

import { YodaFormService } from './yoda-form.service';

describe('YodaFormService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YodaFormService = TestBed.get(YodaFormService);
    expect(service).toBeTruthy();
  });
});
