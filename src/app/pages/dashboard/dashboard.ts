import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { UserService } from '../../core/service/user/user';
import { FaqService } from '../../core/service/faq/faq';
import { CmsService } from '../../core/service/cms/cms';
import { CommonModule } from '@angular/common';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class Dashboard implements OnInit, AfterViewInit {
  totalUsers = 0;
  totalFaq = 0;
  totalCms = 0;
  roleName = '';

  loading = true;

  pieChartInstance: Chart | null = null;
  barChartInstance: Chart | null = null;

  constructor(
    private userService: UserService,
    private faqService: FaqService,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    const storedRole = localStorage.getItem('user_role');
    const role = storedRole ? JSON.parse(storedRole)[0] : '';
    this.roleName = role.toLowerCase();

    this.loadCounts();
  }

  ngAfterViewInit() {
    // Don't render charts immediately - wait for data to load
  }

  // Check if user is admin or manager
  isAdminOrManager(): boolean {
    return this.roleName === 'admin' || this.roleName === 'manager';
  }

  // Check if user is developer
  isDeveloper(): boolean {
    return this.roleName === 'developer';
  }

  loadCounts() {
    this.loading = true;

    const promises: Promise<any>[] = [];

    // Load users only for admin/manager
    if (this.isAdminOrManager()) {
      promises.push(
        this.userService.getUsers({ page: 1, pageSize: 1, filters: { isActive: 'true' } }).toPromise()
      );
    } else {
      promises.push(Promise.resolve(null));
    }

    // Load FAQ and CMS for all roles
    promises.push(
      this.faqService.getFaqList({ page: 1, pageSize: 1, filters: { isActive: 'true' } }).toPromise(),
      this.cmsService.getCmsList({ page: 1, pageSize: 1, filters: { isActive: 'true' } }).toPromise()
    );

    Promise.all(promises)
      .then(([userRes, faqRes, cmsRes]: any) => {
        this.totalUsers = userRes?.totalItems || userRes?.data?.length || 0;
        this.totalFaq = faqRes?.totalItems || faqRes?.data?.length || 0;
        this.totalCms = cmsRes?.data?.totalItems || cmsRes?.data?.length || 0;

        this.loading = false;
        
        // Render charts after data is loaded and DOM is updated
        setTimeout(() => this.renderCharts(), 100);
      })
      .catch((err) => {
        console.error('Error fetching dashboard data:', err);
        this.loading = false;
      });
  }

  renderCharts() {
    const pieCanvas = document.getElementById('pieChart') as HTMLCanvasElement;
    const barCanvas = document.getElementById('barChart') as HTMLCanvasElement;

    if (!pieCanvas) {
      console.warn('Pie chart canvas not found in DOM');
      return;
    }

    // Destroy existing charts before creating new ones
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
      this.pieChartInstance = null;
    }
    
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
      this.barChartInstance = null;
    }

    // PIE CHART - Different data based on role
    if (this.isAdminOrManager()) {
      this.pieChartInstance = new Chart(pieCanvas, {
        type: 'pie',
        data: {
          labels: ['Users', 'FAQs', 'CMS'],
          datasets: [
            {
              data: [this.totalUsers, this.totalFaq, this.totalCms],
              backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'Entity Distribution' },
          },
        },
      });

      // BAR CHART for Admin/Manager
      if (barCanvas) {
        this.barChartInstance = new Chart(barCanvas, {
          type: 'bar',
          data: {
            labels: ['Users', 'FAQs', 'CMS'],
            datasets: [
              {
                label: 'Total Count',
                data: [this.totalUsers, this.totalFaq, this.totalCms],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            plugins: {
              legend: { display: false },
              title: { display: true, text: 'Overview Bar Chart' },
            },
            scales: {
              y: { beginAtZero: true },
            },
          },
        });
      }
    } else if (this.isDeveloper()) {
      // PIE CHART for Developer (only FAQ and CMS)
      this.pieChartInstance = new Chart(pieCanvas, {
        type: 'pie',
        data: {
          labels: ['FAQs', 'CMS'],
          datasets: [
            {
              data: [this.totalFaq, this.totalCms],
              backgroundColor: ['#10b981', '#f59e0b'],
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            title: { display: true, text: 'FAQ & CMS Distribution' },
          },
        },
      });
    }
  }
}