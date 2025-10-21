import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';            
import { ApiService } from '../api.service';
import { ToastrService } from 'ngx-toastr';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule                                   
  ],
  templateUrl: './order-history-component.component.html',
  styleUrls: ['./order-history-component.component.css']
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  selectedStatus = '';
  sortDirection: 'asc' | 'desc' = 'desc';

  constructor(
    private apiService: ApiService,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    history.pushState(null, '', location.href);
    window.onpopstate = () => history.pushState(null, '', location.href);

    const userId = localStorage.getItem('userId');
    if (!userId) {
      this.toastr.error('You must be logged in to view order history.');
      this.router.navigate(['/login']);
      return;
    }

    this.apiService.getUserOrders(userId).subscribe({
      next: (orders) => {
        this.orders = orders;
        this.applyFilters();
        if (orders.length === 0) {
          this.toastr.info('No orders found.');
        }
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
        const errorMsg = err?.error?.message || 'An unexpected error occurred.';
        this.toastr.error('Failed to load order history: ' + errorMsg);
      }
    });
  }

  logout(): void {
    localStorage.clear();
    this.toastr.info('Logged out successfully.');
    this.router.navigate(['/login']);
  }

  applyFilters(): void {
    this.filteredOrders = [...this.orders];

    if (this.selectedStatus) {
      this.filteredOrders = this.filteredOrders.filter(
        order => order.status === this.selectedStatus
      );
    }

    this.filteredOrders.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return this.sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
    });
  }

  downloadInvoice(order: any): void {
    const el = document.getElementById(`invoice-${order.orderNumber}`);
    if (!el) return;
    html2canvas(el).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const props = pdf.getImageProperties(img);
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (props.height * pdfW) / props.width;
      pdf.addImage(img, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`invoice_${order.orderNumber}.pdf`);
    });
  }

  exportAllToPDF(): void {
    const el = document.getElementById('order-summary');
    if (!el) return;
    html2canvas(el).then(canvas => {
      const img = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const props = pdf.getImageProperties(img);
      const pdfW = pdf.internal.pageSize.getWidth();
      const pdfH = (props.height * pdfW) / props.width;
      pdf.addImage(img, 'PNG', 0, 0, pdfW, pdfH);
      pdf.save(`full_order_history.pdf`);
    });
  }
}
