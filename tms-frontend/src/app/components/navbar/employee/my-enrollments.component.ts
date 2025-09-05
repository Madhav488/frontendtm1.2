import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EnrollmentService } from '../../../services/enrollment.service';
import { FeedbackService } from '../../../services/feedback.service';
import { EnrollmentDto } from '../../../models/domain.models';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-enrollments',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>My Enrollments</h2>
    <div *ngIf="enrollments.length===0">No enrollments found (or the backend endpoint is missing).</div>
    <div *ngFor="let e of enrollments" class="card">
      <div><strong>{{e.courseName}}</strong> — {{e.batchName}}</div>
      <div>Status: {{e.status}} | Approved By: {{e.approvedBy ?? '—'}}</div>

      <div *ngIf="canGiveFeedback(e)">
        <h4>Give feedback</h4>
        <textarea [formControl]="feedbackText" placeholder="Feedback"></textarea>
        <div>
          Rating:
          <select [formControl]="rating">
            <option *ngFor="let r of [1,2,3,4,5]" [value]="r">{{r}}</option>
          </select>
        </div>
        <button (click)="submitFeedback(e)">Submit feedback</button>
      </div>
    </div>
  `,
  styles: [`.card { border:1px solid #eee; padding:12px; margin:8px 0; } textarea{ width:100%; min-height:70px; }`]
})
export class MyEnrollmentsComponent implements OnInit {
  enrollments: EnrollmentDto[] = [];
  feedbackText = new FormControl('');
  rating = new FormControl(5);

  constructor(private enrollSvc: EnrollmentService, private fbSvc: FeedbackService) {}

  ngOnInit() {
    this.enrollSvc.getMyEnrollments().subscribe(list => this.enrollments = list || []);
  }

  canGiveFeedback(e: EnrollmentDto) {
    // Frontend can't know batch end-date without the full batch details.
    // We assume the backend will only allow POST feedback if finished; UI always shows feedback box for Approved enrollments as a convenience.
    return e.status === 'Approved';
  }

  submitFeedback(e: EnrollmentDto) {
  const dto = {
    text: this.feedbackText.value ?? '',
    rating: this.rating.value ?? 5
  };

  this.fbSvc.submit(e.batchId, dto).subscribe({
    next: () => {
      alert('Feedback submitted successfully!');
      this.feedbackText.reset('');
      this.rating.setValue(5);
    },
    error: err => {
      console.error(err);
      alert('Failed to submit feedback: ' + (err?.error ?? 'Unknown error'));
    }
  });
}
}
