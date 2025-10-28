import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqDialog } from './faq-dialog';

describe('FaqDialog', () => {
  let component: FaqDialog;
  let fixture: ComponentFixture<FaqDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
