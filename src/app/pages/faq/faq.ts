import {
  Component,
  OnInit,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import {
  MatTableDataSource, MatTableModule
} from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { FaqService } from '../../core/service/faq/faq';
import { Pagination } from '../../models/DataType';
import { MatDialog } from '@angular/material/dialog';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MatIcon } from '@angular/material/icon';
import { MatFormField } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';
import { FaqDialog } from './faq-dialog/faq-dialog';
import { PermissionService } from '../../core/service/permission/permission';
import { PermissionBits } from '../../core/service/permission/permission.constant';

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [
    MatIcon,
    MatFormField,
    FormsModule,
    MatPaginator,
    MatInputModule,
    MatTableModule,
    MatSortModule,
    CommonModule,
    // MatDialog,
  ],
  templateUrl: './faq.html',
  styleUrls: ['./faq.scss'],
})
export class Faq implements OnInit, AfterViewInit, OnDestroy {
  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'question',
    'answer',
    'isActive',
    'actions',
  ];
  filterHeaderColumns: string[] = [];
  totalRecords = 0;

  filterValues: any = {
    question: '',
    answer: '',
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

  constructor(private faqService: FaqService, private dialog: MatDialog, private permission: PermissionService) { }

  ngOnInit(): void {
    this.filterHeaderColumns = this.displayedColumns.map((c) => 'f-' + c);

    const s = this.filterSubject.pipe(debounceTime(400)).subscribe(() => {
      this.pagination.page = 1;
      if (this.paginator) this.paginator.firstPage();
      this.loadFaqs();
    });
    this.subs.push(s);

    this.loadFaqs();

    // permission 
    const storedRole = localStorage.getItem('user_role');
    const roleName = storedRole ? JSON.parse(storedRole)[0] : ''; 
    if (roleName) {
      this.permission.loadUserPermissions(roleName);
    }
  }

  //  getter to check FAQ edit permission
  get canAdd(): boolean {
    return this.permission.hasPermission(PermissionBits.ADD_FAQS);
  }
  get canEdit(): boolean {
    return this.permission.hasPermission(PermissionBits.EDIT_FAQS);
  }
  get canDelete(): boolean {
    return this.permission.hasPermission(PermissionBits.DELETE_FAQS);
  }


  ngAfterViewInit(): void {
    if (this.paginator) {
      const pSub = this.paginator.page.subscribe((pe: PageEvent) => {
        this.pagination.page = pe.pageIndex + 1;
        this.pagination.pageSize = pe.pageSize;
        this.loadFaqs();
      });
      this.subs.push(pSub);
    }

    if (this.sort) {
      const sortSub = this.sort.sortChange.subscribe((s: Sort) => {
        this.pagination.SortColumn = s.active || 'CreatedAt';
        this.pagination.SortDirection = s.direction || 'asc';
        this.pagination.page = 1;
        if (this.paginator) this.paginator.firstPage();
        this.loadFaqs();
      });
      this.subs.push(sortSub);
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }

  /** Load FAQs */
  loadFaqs() {
    const payload = {
      page: this.pagination.page,
      pageSize: this.pagination.pageSize,
      SortColumn: this.pagination.SortColumn,
      SortDirection: this.pagination.SortDirection,
      Search: this.pagination.Search,
      filters: this.filterValues
    };

    this.faqService.getFaqList(payload).subscribe({
      next: (res: any) => {
        this.dataSource.data = res.data || [];       // ✅ FAQ list
        this.totalRecords = res.totalItems || 0;     // ✅ total count
      },
      error: (err) => console.error('Error fetching FAQ data:', err),
    });
  }

  onFilterChange(columnName: string, event: any) {
    const value = event?.target?.value ?? '';
    this.filterValues[columnName] = value;
    this.pagination.Search = Object.values(this.filterValues).join(' ');
    this.filterSubject.next();
  }

  clearColumnFilter() {
    Object.keys(this.filterValues).forEach((k) => (this.filterValues[k] = ''));
    this.pagination.Search = '';
    this.pagination.page = 1;
    if (this.paginator) this.paginator.firstPage();
    this.loadFaqs();
  }

  deleteFaq(id: number) {
    if (confirm('Are you sure you want to delete this CMS record?')) {
      this.faqService.deleteFaq(id).subscribe({
        next: () => this.loadFaqs(),
        error: (err) => console.error(err),
      });
    }
  }

  openAddFaqDialog() {
    const dialogRef = this.dialog.open(FaqDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: null,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadFaqs();
    });
  }

  openEditFaqDialog(faq: any) {
    const dialogRef = this.dialog.open(FaqDialog, {
      width: '800px',
      maxWidth: '95vw',
      data: faq,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) this.loadFaqs();
    });
  }
}
