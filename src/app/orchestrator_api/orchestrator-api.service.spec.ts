import {TestBed} from '@angular/core/testing';

import {OrchestratorApiService} from './orchestrator-api.service';

describe('OrchestratorApiService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OrchestratorApiService = TestBed.get(OrchestratorApiService);
    expect(service).toBeTruthy();
  });
});
