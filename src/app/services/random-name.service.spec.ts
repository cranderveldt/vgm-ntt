import { TestBed } from '@angular/core/testing';

import { RandomNameService } from './random-name.service';

describe('RandomNameService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RandomNameService = TestBed.get(RandomNameService);
    expect(service).toBeTruthy();
  });
});
