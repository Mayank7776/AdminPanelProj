import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FaqService } from '../../../core/service/faq/faq';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-faq-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule ],
  templateUrl: './faq-dialog.html',
})
export class FaqDialog implements OnInit {
  faqForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private faqService: FaqService,
    private dialogRef: MatDialogRef<FaqDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any // if data exists → edit mode
  ) {}

  ngOnInit() {
    this.isEditMode = !!this.data;

    // Initialize form
    this.faqForm = this.fb.group({
      Question: [
        this.data?.question || '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(200)],
      ],
      Answer: [
        this.data?.answer || '',
        [Validators.required, Validators.minLength(5), Validators.maxLength(1000)],
      ],
      IsActive: [this.data?.isActive ?? true],
    });
  }

  // Save or update FAQ
  save() {
    if (!this.faqForm.valid) {
      this.faqForm.markAllAsTouched();
      return;
    }

    const payload = this.faqForm.value;

    if (this.isEditMode) {
      // Update existing FAQ
      this.faqService.editFaq(this.data.id, payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating FAQ:', err),
      });
    } else {
      // Add new FAQ
      this.faqService.addFaq(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating FAQ:', err),
      });
    }
  }

  // Close dialog
  close() {
    this.dialogRef.close();
  }
}

