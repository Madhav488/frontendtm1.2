import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchService } from '../../../services/batch.service';
import { EnrollmentService } from '../../../services/enrollment.service';
import { Batch } from '../../../models/domain.models';
import { AuthService } from '../../../core/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-employee-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Course Calendar & Active Batches</h2>
    <div *ngIf="warning" class="warning">{{warning}}</div>
    <div *ngIf="loading">Loading batches...</div>
    <div *ngFor="let b of batches" class="batch-card">
      <div class="title">{{b.batchName}}</div>
      <div>Course: {{b.calendar?.course?.courseName ?? '—'}}</div>
      <div>Start: {{b.calendar?.startDate | date}} | End: {{b.calendar?.endDate | date}}</div>
      <div>Status: <strong>{{getStatus(b.batchId)}}</strong></div>
      <div>
        <button (click)="request(b.batchId)" [disabled]="getStatus(b.batchId) !== 'Not Enrolled'">Request Enrollment</button>
      </div>
    </div>
    <p><a routerLink="/my-enrollments">View my enrollments & feedback</a></p>
  `,
  styles: [`
    .batch-card { border:1px solid #eee; padding:12px; margin:10px 0; border-radius:6px; }
    .title { font-weight:700; }
    .warning { color:darkorange; }
    button { margin-top:8px; padding:6px 10px; }
  `]
})
export class EmployeeDashboardComponent implements OnInit {
  batches: Batch[] = [];
  loading = false;
  // local status map fallback when backend doesn't provide "my enrollments"
  statusByBatch = new Map<number, string>();
  warning?: string;

  constructor(
    private batchSvc: BatchService,
    private enrollSvc: EnrollmentService,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.batchSvc.getAll().subscribe({
      next: data => {
        this.batches = data;
        this.loading = false;
        // try to fetch my enrollments (may return [] if backend missing endpoint)
        this.enrollSvc.getMyEnrollments().subscribe(list => {
          if (!list || list.length === 0) {
            // if empty, we warn the user that server-side "my enrollments" is missing OR user has none
            this.warning = 'If you see "Not Enrolled" for everything after you enrolled — please add the backend endpoint GET /api/enrollments/mine. The frontend will still let you request enrollment.';
          }
          (list || []).forEach(e => {
            // map course/batch name is present in EnrollmentDto
            // We don't have batchId in DTO. Backend should return BatchId in the mine endpoint (recommended).
            // Fallback: mark 'Requested' statuses by comparing names (best-effort)
            const s = e.status;
            // -> naive: if batch names match, set status register (best-effort)
            const matchingBatch = this.batches.find(b => b.batchName === e.batchName);
            if (matchingBatch) this.statusByBatch.set(matchingBatch.batchId, s);
          });
        });
      },
      error: err => { this.loading = false; console.error(err); }
    });
  }

  getStatus(batchId: number) {
    return this.statusByBatch.get(batchId) ?? 'Not Enrolled';
  }

  request(batchId: number) {
    this.enrollSvc.requestEnrollment(batchId).subscribe({
      next: dto => {
        // optimistic update
        this.statusByBatch.set(batchId, dto.status);
        alert('Enrollment requested.');
      },
      error: err => alert('Request failed: ' + (err?.error ?? JSON.stringify(err)))
    });
  }
}
