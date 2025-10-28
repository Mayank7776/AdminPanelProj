import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CmsDialog } from './cms-dialog';

describe('CmsDialog', () => {
  let component: CmsDialog;
  let fixture: ComponentFixture<CmsDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CmsDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CmsDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
