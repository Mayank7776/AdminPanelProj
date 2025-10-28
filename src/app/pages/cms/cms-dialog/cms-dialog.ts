import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CmsService } from '../../../core/service/cms/cms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-cms-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule, ReactiveFormsModule, FormsModule,CommonModule ],
  templateUrl: './cms-dialog.html',
})
export class CmsDialog implements OnInit {
  cmsForm!: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private cmsService: CmsService,
    private dialogRef: MatDialogRef<CmsDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any // edit mode if data exists
  ) {}

  ngOnInit() {
    this.isEditMode = !!this.data;

    // Initialize form
    this.cmsForm = this.fb.group({
      Title: [
        this.data?.title || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(200)],
      ],
      Key: [
        this.data?.key || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(100)],
      ],
      MetaKeyword: [
        this.data?.metaKeyword || '',
        [Validators.required, Validators.minLength(3), Validators.maxLength(500)],
      ],
      IsActive: [this.data?.isActive ?? true],
    });
  }

  // Save or update CMS
  save() {
    if (!this.cmsForm.valid) {
      this.cmsForm.markAllAsTouched();
      return;
    }

    const payload = this.cmsForm.value;

    if (this.isEditMode) {
      // Update existing CMS record
      this.cmsService.editCms(this.data.id,payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating CMS:', err),
      });
    } else {
      // Add new CMS record
      this.cmsService.addCms(payload).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating CMS:', err),
      });
    }
  }

  // Close dialog
  close() {
    this.dialogRef.close();
  }
}
