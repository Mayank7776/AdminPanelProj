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
import { MatPaginator, PageEvent, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, Sort, MatSortHeader, MatSortModule } from '@angular/material/sort';
import { RoleService } from '../../core/service/role/role';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { Pagination } from '../../models/DataType';
import { RoleDialog } from './role-dialog/role-dialog';
import { PermissionService } from '../../core/service/permission/permission';
import { PermissionBits } from '../../core/service/permission/permission.constant';

interface IRole {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    FormsModule,
    MatPaginatorModule,
    MatTableModule,
    MatInputModule,
    CommonModule,
    MatDialogModule,
    MatSortHeader,
    MatSortModule,
  ],
  templateUrl: './role.html',
  styleUrls: ['./role.scss'],
})
export class Role implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<IRole>();
  displayedColumns: string[] = ['name', 'description', 'isActive', 'actions'];
  filterHeaderColumns: string[] = [];
  totalRecords = 0;

  filterValues: any = {
    name: '',
    description: '',
    isActive: '',
  };

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

  constructor(private roleService: RoleService, private dialog: MatDialog, private permission: PermissionService) { }

  ngOnInit(): void {
    this.filterHeaderColumns = this.displayedColumns.map((c) => 'f-' + c);

    // Debounce per-column filters
    const s = this.filterSubject.pipe(debounceTime(400)).subscribe(() => {
      this.pagination.page = 1;
      if (this.paginator) this.paginator.firstPage();
      this.loadRoles();
    });
    this.subs.push(s);

    this.loadRoles();

    // permission 
    const storedRole = localStorage.getItem('user_role');
    const roleName = storedRole ? JSON.parse(storedRole)[0] : '';
    if (roleName) {
      this.permission.loadUserPermissions(roleName);
    }
  }
  //  getter to check FAQ edit permission
  get canAdd(): boolean {
    return this.permission.hasPermission(PermissionBits.ADD_ROLES);
  }
  get canEdit(): boolean {
    return this.permission.hasPermission(PermissionBits.EDIT_ROLES);
  }
  get canDelete(): boolean {
    return this.permission.hasPermission(PermissionBits.DELETE_ROLES);
  }

  ngAfterViewInit(): void {
    if (this.paginator) {
      const pSub = this.paginator.page.subscribe((pe: PageEvent) => {
        this.pagination.page = pe.pageIndex + 1;
        this.pagination.pageSize = pe.pageSize;
        this.loadRoles();
      });
      this.subs.push(pSub);
    }

    if (this.sort) {
      const sortSub = this.sort.sortChange.subscribe((s: Sort) => {
        this.pagination.SortColumn = s.active || 'CreatedAt';
        this.pagination.SortDirection = s.direction || 'asc';
        this.pagination.page = 1;
        if (this.paginator) this.paginator.firstPage();
        this.loadRoles();
      });
      this.subs.push(sortSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  loadRoles() {
    const payload = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      sortColumn: this.pagination.SortColumn,
      sortDirection: this.pagination.SortDirection,
      filters: {
        name: this.filterValues.name.trim(),
        description: this.filterValues.description.trim(),
        isActive:
          this.filterValues.isActive === '' ? undefined : this.filterValues.isActive,
      },
    };

    this.roleService.getRolesList(payload).subscribe({
      next: (res: any) => {
        // 🟢 Correct extraction based on actual response shape
        const pageData = res?.data?.data;
        this.dataSource.data = pageData?.data || [];
        this.totalRecords = pageData?.totalItems || 0;


      },
      error: (err) => console.error('Error fetching roles', err),
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
    this.loadRoles();
  }

  deleteRole(id: string) {
    console.log('deleteRole called with:', id);
    if (confirm('Are you sure you want to delete this role?')) {
      this.roleService.deleteRole(id).subscribe({
        next: () => this.loadRoles(),
        error: (err) => console.error(err),
      });
    }
  }

  openRoleDialog(role?: any): void {
    const dialogRef = this.dialog.open(RoleDialog, {
      width: '700px',
      height: '600px',
      maxWidth: '95vw',
      data: { role }
    });

    dialogRef.afterClosed().subscribe((payload) => {
      if (!payload) return;

      if (role) {
        // Edit mode
        this.roleService.editRole(payload).subscribe({
          next: () => {
            console.log('Role updated');
            this.loadRoles(); // ✅ Refresh table
          },
          error: err => console.error('Update failed', err)
        });
      } else {
        // Add mode
        this.roleService.addRole(payload).subscribe({
          next: () => {
            console.log('Role added');
            this.loadRoles(); // ✅ Refresh table
          },
          error: err => console.error('Add failed', err)
        });
      }
    });
  }

}
