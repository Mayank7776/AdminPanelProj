import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../../../core/service/user/user';
import { RoleService } from '../../../core/service/role/role';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { API_CONFIG } from '../../../core/service/config/api.config';
import { CountryISO, NgxIntlTelInputModule, SearchCountryField } from 'ngx-intl-tel-input';

@Component({
  selector: 'app-user-dialog',
  standalone: true,
  imports: [
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule
  ],
  templateUrl: './user-dialog.html',
})
export class UserDialog implements OnInit {
  userForm!: FormGroup;
  roles: any[] = [];
  countries: any[] = [];
  states: any[] = [];
  cities: any[] = [];
  maxDate: string = '';
  isEditMode: boolean = false;
  showPassword: boolean = false;

  roleSearchTerm: string = '';
  showRoleDropdown: boolean = false;
  filteredRoles: any[] = [];

  countrySearchTerm: string = '';
  stateSearchTerm: string = '';
  citySearchTerm: string = '';

  showCountryDropdown: boolean = false;
  showStateDropdown: boolean = false;
  showCityDropdown: boolean = false;

  filteredCountries: any[] = [];
  filteredStates: any[] = [];
  filteredCities: any[] = [];

  selectedFile: File | null = null;
  previewUrl: string | ArrayBuffer | null = null;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;

  constructor(
    private fb: FormBuilder,
    private roleService: RoleService,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserDialog>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    this.isEditMode = !!this.data;

    this.userForm = this.fb.group({
      FullName: [this.data?.fullName || '', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      Email: [this.data?.email || '', [Validators.required, Validators.email, Validators.maxLength(100)]],
      Password: [
        '',
        this.data ? [] : [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}[\]|\\:;"'<>,.?/]).{8,}$/)
        ]
      ],
      PhoneNumber: [this.isEditMode ? this.parsePhoneNumber(this.data.phoneNumber) : '', [Validators.required, this.phoneValidator]],
      DateOfbirth: [this.formatDate(this.data?.dateOfBirth) || null, Validators.required],
      Role: [this.data?.roles[0] || '', Validators.required],
      CountryId: [this.data?.countryId || '', Validators.required],
      StateId: [this.data?.stateId || '', Validators.required],
      CityId: [this.data?.cityId || '', Validators.required],
      isActive: [this.data?.isActive ?? true],
    });

    this.loadRoles();
    this.loadCountries();

    if (this.data?.countryId) this.onCountryChange(this.data.countryId, true);
    if (this.data?.stateId) this.onStateChange(this.data.stateId, true);

    if (this.data?.profileImageUrl) {
      this.previewUrl = `${API_CONFIG.BASE_URL}${this.data.profileImageUrl}`;
    }

    const today = new Date();
    this.maxDate = today.toISOString().split('T')[0];
  }

  // Custom validator for phone object
  phoneValidator(control: AbstractControl) {
    const value = control.value;
    if (!value || !value.e164Number) {
      return { invalidPhone: true };
    }
    return null;
  }

  // Parse phone number for ngx-intl-tel-input
  private parsePhoneNumber(phone: string | null): any {
    if (!phone) return null;

    // Extract dial code and national number
    const match = phone.match(/^\+(\d{1,2})(\d+)$/);
    if (!match) return null;

    const dialCode = match[1];             // e.g., '91'
    const nationalNumber = match[2];       // e.g., '9876543210'
    const countryCode = this.getCountryIsoFromDialCode(dialCode);

    return {
      number: nationalNumber,              // only the national number
      internationalNumber: phone,
      nationalNumber: nationalNumber,
      e164Number: phone,                   // full number for backend
      countryCode: countryCode,            // ISO code
      dialCode: dialCode                   // prefix
    };
  }

// helper to map dial code to ISO code
private getCountryIsoFromDialCode(dialCode: string): string {
  const map: any = { '91': 'IN', '1': 'US', '44': 'GB' }; // add more as needed
  return map[dialCode] || 'IN';
}


  loadRoles() {
    const payload = { page: 1, pageSize: 100, sortColumn: 'CreatedAt', sortDirection: 'desc', filters: {} };
    this.roleService.getRolesList(payload).subscribe({
      next: (res: any) => {
        this.roles = res?.data?.data?.data || [];
        this.filteredRoles = [...this.roles];

        if (this.data?.roles && this.data.roles.length > 0) {
          const roleName = this.data.roles[0];
          this.userForm.patchValue({ Role: roleName });
          this.roleSearchTerm = roleName;
        }
      },
      error: (err) => console.error('Error fetching roles:', err),
    });
  }

  filterRoles() {
    const searchTerm = this.roleSearchTerm.toLowerCase().trim();
    this.filteredRoles = searchTerm
      ? this.roles.filter(role => role.name.toLowerCase().includes(searchTerm))
      : [...this.roles];
  }

  selectRole(role: any) {
    this.roleSearchTerm = role.name;
    this.userForm.patchValue({ Role: role.name });
    this.showRoleDropdown = false;
  }

  onRoleBlur() {
    setTimeout(() => { this.showRoleDropdown = false; }, 200);
  }

  loadCountries() {
    this.userService.getCountries().subscribe({
      next: (res: any) => {
        this.countries = res;
        this.filteredCountries = [...this.countries];

        if (this.data?.countryId) {
          const country = this.countries.find(c => c.id === this.data.countryId);
          if (country) this.countrySearchTerm = country.name;
        }
      },
      error: (err) => console.error('Error fetching countries:', err),
    });
  }

  onCountryChange(countryId?: number, isPrefill = false) {
    const selectedCountryId = countryId || this.userForm.get('CountryId')?.value;
    if (!isPrefill) this.userForm.patchValue({ StateId: '', CityId: '' });
    this.states = [];
    this.cities = [];
    this.filteredStates = [];
    this.filteredCities = [];
    if (!selectedCountryId) return;

    this.userService.getStates(selectedCountryId).subscribe({
      next: (res: any) => {
        this.states = res;
        this.filteredStates = [...this.states];
        if (isPrefill && this.data?.stateId) {
          this.userForm.patchValue({ StateId: this.data.stateId });
          const state = this.states.find(s => s.id === this.data.stateId);
          if (state) this.stateSearchTerm = state.name;
        }
      },
      error: (err) => console.error('Error fetching states:', err),
    });
  }

  onStateChange(stateId?: number, isPrefill = false) {
    const selectedStateId = stateId || this.userForm.get('StateId')?.value;
    if (!isPrefill) this.userForm.patchValue({ CityId: '' });
    this.cities = [];
    this.filteredCities = [];
    if (!selectedStateId) return;

    this.userService.getCities(selectedStateId).subscribe({
      next: (res: any) => {
        this.cities = res;
        this.filteredCities = [...this.cities];
        if (isPrefill && this.data?.cityId) {
          this.userForm.patchValue({ CityId: this.data.cityId });
          const city = this.cities.find(c => c.id === this.data.cityId);
          if (city) this.citySearchTerm = city.name;
        }
      },
      error: (err) => console.error('Error fetching cities:', err),
    });
  }

  selectCountry(country: any) { this.countrySearchTerm = country.name; this.userForm.patchValue({ CountryId: country.id }); this.showCountryDropdown = false; this.onCountryChange(); }
  selectState(state: any) { this.stateSearchTerm = state.name; this.userForm.patchValue({ StateId: state.id }); this.showStateDropdown = false; this.onStateChange(); }
  selectCity(city: any) { this.citySearchTerm = city.name; this.userForm.patchValue({ CityId: city.id }); this.showCityDropdown = false; }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result);
      reader.readAsDataURL(file);
    }
  }

  removePreview() {
    this.previewUrl = null;
    this.selectedFile = null;
    const fileInput = document.querySelector<HTMLInputElement>('input[type="file"]');
    if (fileInput) fileInput.value = '';
  }

  save() {
    if (!this.userForm.valid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    const phoneObj = this.userForm.get('PhoneNumber')?.value;

    formData.append('FullName', this.userForm.get('FullName')?.value);
    formData.append('Email', this.userForm.get('Email')?.value);
    formData.append('PhoneNumber', phoneObj?.e164Number || '');
    formData.append('isActive', this.userForm.get('isActive')?.value);
    formData.append('DateOfbirth', this.userForm.get('DateOfbirth')?.value);
    formData.append('Role', this.userForm.get('Role')?.value);
    formData.append('CountryId', this.userForm.get('CountryId')?.value);
    formData.append('StateId', this.userForm.get('StateId')?.value);
    formData.append('CityId', this.userForm.get('CityId')?.value);

    if (this.selectedFile) formData.append('ProfileImage', this.selectedFile);
    if (!this.data && this.userForm.get('Password')?.value) formData.append('Password', this.userForm.get('Password')?.value);

    if (this.data) {
      this.userService.editUser(formData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error updating user:', err),
      });
    } else {
      this.userService.createUser(formData).subscribe({
        next: () => this.dialogRef.close(true),
        error: (err) => console.error('Error creating user:', err),
      });
    }
  }

  close() { this.dialogRef.close(); }

  private formatDate(date: string | Date | null | undefined): string {
    if (!date) return '';
    const d = new Date(date);
    return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0];
  }
}
