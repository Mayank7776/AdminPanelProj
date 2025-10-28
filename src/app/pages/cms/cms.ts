import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { CmsService } from '../../core/service/cms/cms';
import { Pagination, ICms } from '../../models/DataType';
import { CmsDialog } from './cms-dialog/cms-dialog';
import { PermissionService } from '../../core/service/permission/permission';
import { PermissionBits } from '../../core/service/permission/permission.constant';

@Component({
  selector: 'app-cms',
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
    MatSortModule,
  ],
  templateUrl: './cms.html',
  styleUrls: ['./cms.scss'],
})
export class Cms implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<ICms>();
  displayedColumns: string[] = ['title', 'key', 'metaKeyword', 'isActive', 'actions'];
  filterHeaderColumns: string[] = [];

  totalRecords = 0;

  filterValues: any = {
    title: '',
    key: '',
    metaKeyword: '',
    isActive: '',
  };

  pagination: Pagination = {
    page: 1,
    pageSize: 10,
    SortColumn: 'createdAt',
    SortDirection: 'desc',
    Search: '',
  };

  private filterSubject = new Subject<void>();
  private subs: Subscription[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private cmsService: CmsService, private dialog: MatDialog, private permission: PermissionService) { }

  ngOnInit(): void {
    this.filterHeaderColumns = this.displayedColumns.map((c) => 'f-' + c);

    // Debounce filtering
    const filterSub = this.filterSubject.pipe(debounceTime(400)).subscribe(() => {
      this.pagination.page = 1;
      if (this.paginator) this.paginator.firstPage();
      this.loadCms();
    });
    this.subs.push(filterSub);

    this.loadCms();

    // permission 
    const storedRole = localStorage.getItem('user_role');
    const roleName = storedRole ? JSON.parse(storedRole)[0] : '';
    if (roleName) {
      this.permission.loadUserPermissions(roleName);
    }
  }
    //  getter to check FAQ edit permission
    get canAdd(): boolean {
      return this.permission.hasPermission(PermissionBits.ADD_CMS);
    }
    get canEdit(): boolean {
      return this.permission.hasPermission(PermissionBits.EDIT_CMS);
    }
    get canDelete(): boolean {
      return this.permission.hasPermission(PermissionBits.DELETE_CMS);
    }


  ngAfterViewInit(): void {
    // Paginator change
    if (this.paginator) {
      const pSub = this.paginator.page.subscribe((pe: PageEvent) => {
        this.pagination.page = pe.pageIndex + 1;
        this.pagination.pageSize = pe.pageSize;
        this.loadCms();
      });
      this.subs.push(pSub);
    }

    // Sort change
    if (this.sort) {
      const sortSub = this.sort.sortChange.subscribe((s: Sort) => {
        this.pagination.SortColumn = s.active || 'createdAt';
        this.pagination.SortDirection = s.direction || 'asc';
        this.pagination.page = 1;
        if (this.paginator) this.paginator.firstPage();
        this.loadCms();
      });
      this.subs.push(sortSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  /** ============================
   * 🔹 Load CMS Records
   * ============================ */
  loadCms() {
    const params = {
      ...this.pagination,
      filters: this.filterValues, // pass column filters to backend
    };

    this.cmsService.getCmsList(params).subscribe({
      next: (res: any) => {
        this.dataSource.data = res.data?.data || [];
        this.totalRecords = res.data?.totalItems || 0;
      },
      error: (err) => console.error('Error fetching CMS data:', err),
    });
  }

  /** ============================
   * 🔎 Column Filters
   * ============================ */
  onFilterChange(columnName: string, event: any) {
    const value = event?.target?.value ?? '';
    this.filterValues[columnName] = value;
    this.filterSubject.next(); // trigger debounced reload
  }

  clearColumnFilter() {
    Object.keys(this.filterValues).forEach((k) => (this.filterValues[k] = ''));
    this.pagination.page = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadCms();
  }

  openAddCmsDialog() {
    const dialogRef = this.dialog.open(CmsDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadCms();
    });
  }

  openEditCmsDialog(cms: any) {
    const dialogRef = this.dialog.open(CmsDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: cms,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadCms();
    });
  }
  /** ============================
   * 🗑️ Delete CMS Record
   * ============================ */
  deleteCms(id: number) {
    if (confirm('Are you sure you want to delete this CMS record?')) {
      this.cmsService.deleteCms(id).subscribe({
        next: () => this.loadCms(),
        error: (err) => console.error(err),
      });
    }
  }
}
