import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';

export enum PermissionEnum {
  None = 0,
  ViewUsers = 1,
  AddUsers = 2,
  EditUsers = 4,
  DeleteUsers = 8,
  ViewRoles = 16,
  AddRoles = 32,
  EditRoles = 64,
  DeleteRoles = 128,
  ViewFaqs = 256,
  AddFaqs = 512,
  EditFaqs = 1024,
  DeleteFaqs = 2048,
  ViewCms = 4096,
  AddCms = 8192,
  EditCms = 16384,
  DeleteCms = 32768
}

@Component({
  selector: 'app-role-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    MatDialogModule,
    MatInputModule,
    MatCheckboxModule,
    MatSelectModule
  ],
  templateUrl: './role-dialog.html',
  styleUrls: ['./role-dialog.scss']
})
export class RoleDialog implements OnInit {
  roleForm!: FormGroup;
  isEditMode = false;

  pages = ['Users', 'Roles', 'Faqs', 'Cms'];
  actions = ['View', 'Add', 'Edit', 'Delete'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<RoleDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit(): void {
    this.isEditMode = !!this.data?.role;

    this.roleForm = this.fb.group({
      id: [this.data?.role?.id || null],
      name: [this.data?.role?.name || '', Validators.required],
      description: [this.data?.role?.description || ''],
      isActive: [this.data?.role?.isActive === true || this.data?.role?.isActive === 'true'],
      permissions: this.fb.group({})
    });

    // Build nested permission groups
    this.pages.forEach(page => {
      const group = this.fb.group({});
      this.actions.forEach(action => {
        group.addControl(action.toLowerCase(), this.fb.control(false));
      });
      (this.roleForm.get('permissions') as FormGroup).addControl(page.toLowerCase(), group);
    });

    // If editing, populate permissions
if (this.isEditMode && this.data?.role?.permissions != null) {
  this.populatePermissions(this.data.role.permissions);
}

  }

  // ✅ Works for both combined numeric or array of permissions
  populatePermissions(permissionValue: number | string | number[]): void {
    let combinedValue = 0;

    if (Array.isArray(permissionValue)) {
      combinedValue = permissionValue.reduce((sum, val) => sum | Number(val), 0);
    } else {
      combinedValue = Number(permissionValue) || 0;
    }

    Object.entries(PermissionEnum)
      .filter(([_, value]) => !isNaN(Number(value)))
      .forEach(([key, value]) => {
        const numericValue = value as number;

        if ((combinedValue & numericValue) === numericValue) {
          const [action, page] = this.extractActionPage(key);
          if (action && page) {
            this.roleForm.get('permissions')?.get(page)?.get(action)?.setValue(true);
          }
        }
      });

    console.log('🟢 populatePermissions input:', permissionValue);
    console.log('🟢 combined bitmask:', combinedValue);
  }


  extractActionPage(key: string): [string, string] | [] {
  const pages = ['Users', 'Roles', 'Faqs', 'Cms'];
  for (const page of pages) {
    if (key.endsWith(page)) {
      const action = key.replace(page, '').toLowerCase(); // matches formControlName
      return [action, page.toLowerCase()]; // matches FormGroup key
    }
  }
  return [];
}


  getPermissionGroup(page: string): FormGroup {
    return this.roleForm.get('permissions')?.get(page.toLowerCase()) as FormGroup;
  }

  // ✅ Changed: Build permission list as an array of numbers
  buildPermissionListAsNumbers(): number[] {
    const permissionValues: number[] = [];

    this.pages.forEach(page => {
      this.actions.forEach(action => {
        const control = this.roleForm
          .get('permissions')
          ?.get(page.toLowerCase())
          ?.get(action.toLowerCase());

        if (control?.value) {
          const enumKey = `${action}${page}` as keyof typeof PermissionEnum;
          const enumValue = PermissionEnum[enumKey];
          if (typeof enumValue === 'number') {
            permissionValues.push(enumValue);
          }
        }
      });
    });

    return permissionValues;
  }

  // ✅ Updated submit() to send permissions as array
  submit(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const formValue = this.roleForm.value;
    const permissionsArray = this.buildPermissionListAsNumbers();

    const payload = {
      id: formValue.id,
      name: formValue.name,
      description: formValue.description,
      isActive: formValue.isActive,
      permissions: permissionsArray
    };

    console.log('Submitting payload:', payload);
    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
