import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../services/enrollment.service';

@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Pending Enrollment Requests</h2>
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="!loading && requests.length===0">No pending requests.</div>
    <div *ngFor="let r of requests" class="card">
      <div><strong>{{r.employeeName}}</strong> requested <em>{{r.courseName}} / {{r.batchName}}</em></div>
      <div>Status: {{r.status}}</div>
      <div>
        <button (click)="approve(r.enrollmentId)">Approve</button>
        <button (click)="reject(r.enrollmentId)">Reject</button>
      </div>
    </div>
  `,
  styles: [`.card {border:1px solid #eee; padding:10px; margin:10px 0;}`]
})
export class ManagerDashboardComponent implements OnInit {
  requests: any[] = [];
  loading = false;

  constructor(private enrollSvc: EnrollmentService) {}

  ngOnInit() {
    this.loading = true;
    this.enrollSvc.getPending().subscribe({
      next: data => { this.requests = data; this.loading = false; },
      error: () => { this.requests = []; this.loading = false; }
    });
  }

  approve(id: number) {
    this.enrollSvc.approve(id).subscribe({
      next: () => { this.requests = this.requests.filter(r => r.enrollmentId !== id); },
      error: e => alert('Approve failed: ' + JSON.stringify(e))
    });
  }

  reject(id: number) {
    this.enrollSvc.reject(id).subscribe({
      next: () => { this.requests = this.requests.filter(r => r.enrollmentId !== id); },
      error: e => alert('Reject failed: ' + JSON.stringify(e))
    });
  }
}
