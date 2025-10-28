import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import { UserService } from '../../core/service/user/user';
import { Pagination, IUser } from '../../models/DataType';
import {
  MatDialog,
  MatDialogModule,
} from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { UserDialog } from './user-dialog/user-dialog';
import { PermissionService } from '../../core/service/permission/permission';
import { PermissionBits } from '../../core/service/permission/permission.constant';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    FormsModule,
    MatPaginator,
    MatTableModule,
    MatInputModule,
    CommonModule,
    MatDialogModule,
    MatSortHeader,
    MatSortModule,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.scss'],
})
export class Users implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<IUser>();
  displayedColumns: string[] = [
    'fullName',
    'email',
    'phoneNumber',
    'roles',
    'isActive',
    'actions',
  ];
  filterHeaderColumns: string[] = [];
  totalRecords = 0;

  // For per-column filters
  filterValues: any = {
    fullName: '',
    email: '',
    phoneNumber: '',
    roles: '',
    isActive: '',
  };

  // Pagination model
  pagination: Pagination = {
    page: 1,
    pageSize: 10,
    SortColumn: 'CreatedAt',
    SortDirection: 'desc',
    Search: '',
  };

  private filterSubject = new Subject<void>();
  private subs: Subscription[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private userService: UserService, private dialog: MatDialog, private permission: PermissionService) { }

  ngOnInit(): void {
    this.filterHeaderColumns = this.displayedColumns.map((c) => 'f-' + c);

    // Debounce input for better performance
    const s = this.filterSubject.pipe(debounceTime(400)).subscribe(() => {
      this.pagination.page = 1;
      if (this.paginator) this.paginator.firstPage();
      this.loadUsers();
    });
    this.subs.push(s);

    this.loadUsers();

    // permission 
    const storedRole = localStorage.getItem('user_role');
    const roleName = storedRole ? JSON.parse(storedRole)[0] : '';
    if (roleName) {
      this.permission.loadUserPermissions(roleName);
    }
  }
  //  getter to check FAQ edit permission
  get canAdd(): boolean {
    return this.permission.hasPermission(PermissionBits.ADD_USERS);
  }
  get canEdit(): boolean {
    return this.permission.hasPermission(PermissionBits.EDIT_USERS);
  }
  get canDelete(): boolean {
    return this.permission.hasPermission(PermissionBits.DELETE_USERS);
  }

  ngAfterViewInit(): void {
    // Pagination change listener
    if (this.paginator) {
      const pSub = this.paginator.page.subscribe((pe: PageEvent) => {
        this.pagination.page = pe.pageIndex + 1;
        this.pagination.pageSize = pe.pageSize;
        this.loadUsers();
      });
      this.subs.push(pSub);
    }

    // Sorting change listener
    if (this.sort) {
      const sortSub = this.sort.sortChange.subscribe((s: Sort) => {
        this.pagination.SortColumn = s.active || 'CreatedAt';
        this.pagination.SortDirection = s.direction || 'asc';
        this.pagination.page = 1;
        if (this.paginator) this.paginator.firstPage();
        this.loadUsers();
      });
      this.subs.push(sortSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  /** ============================
   * 🔹 Load Users with Filters
   * ============================ */
  loadUsers() {

    const payload = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      sortColumn: this.pagination.SortColumn,
      sortDirection: this.pagination.SortDirection,
      filters: {
        fullName: this.filterValues.fullName.trim(),
        email: this.filterValues.email.trim(),
        phoneNumber: this.filterValues.phoneNumber.trim(),
        roles: this.filterValues.roles.trim(),
        isActive: this.filterValues.isActive === '' ? undefined : this.filterValues.isActive,
      },
    };

    this.userService.getUsers(payload).subscribe({
      next: (res: any) => {
        const pageData = res.data;
        this.dataSource.data = pageData?.data || [];
        this.totalRecords = pageData?.totalItems || 0;
      },
      error: (err) => console.error('Error fetching users', err),
    });
  }

  onFilterChange(columnName: string, event: any) {
    const value = event?.target?.value ?? '';
    this.filterValues[columnName] = value;
    this.filterSubject.next();
  }

  clearColumnFilter() {
    Object.keys(this.filterValues).forEach((k) => (this.filterValues[k] = ''));
    this.pagination.page = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadUsers();
  }


  /** ============================
   * 🗑️ Delete User
   * ============================ */
  deleteUser(id: string) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (err) => console.error(err),
      });
    }
  }

  /** ============================
   * ➕ Add User Dialog
   * ============================ */
  openAddUserDialog() {
    const dialogRef = this.dialog.open(UserDialog, {
      width: '800px',
      height: '600px',
      maxWidth: '95vw',
      data: null, // empty data for Add mode
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers(); // refresh after save
      }
    });
  }

  /** ============================
   * ✏️ Edit User Dialog
   * ============================ */
  openEditUserDialog(user: IUser) {
    const dialogRef = this.dialog.open(UserDialog, {
      width: '800px',
      height: '600px',
      maxWidth: '95vw',
      data: user, // pass selected user to dialog
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.loadUsers(); // refresh after update
      }
    });
  }
}
