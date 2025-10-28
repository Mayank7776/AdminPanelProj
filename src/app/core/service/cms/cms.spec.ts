import { TestBed } from '@angular/core/testing';

import { CmsService } from './cms';

describe('Cms', () => {
  let service: CmsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CmsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
