import { TestBed } from '@angular/core/testing';

import { YodaTableService } from './yoda-table.service';

describe('YodaTableService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: YodaTableService = TestBed.get(YodaTableService);
    expect(service).toBeTruthy();
  });
});
