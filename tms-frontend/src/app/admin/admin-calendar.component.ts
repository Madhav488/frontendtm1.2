import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CourseService } from '../services/course.service';
import { BatchService } from '../services/batch.service';
import { CalendarService } from '../services/calendar.service';
import { FeedbackService } from '../services/feedback.service';
import { Course, CourseCalendar, Batch, EnrollmentDto } from '../models/domain.models';

@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './admin-calendar.component.html',
  
})
export class AdminCalendarComponent implements OnInit {
  courses: Course[] = [];
  calendars: CourseCalendar[] = [];
  activeBatches: any[] = [];
  inactiveBatches: Batch[] = [];
  feedbacks: any[] = [];
  selectedEnrollments: EnrollmentDto[] = [];
  selectedBatchId: number | null = null;

  searchId: string = '';
  showCreateForm = false;
  batchForm!: FormGroup;

  constructor(
    private batchSvc: BatchService,
    private feedbackSvc: FeedbackService,
    private courseSvc: CourseService,
    private calSvc: CalendarService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.batchForm = this.fb.group({
      calendarId: ['', Validators.required],  // ✅ FIX: backend expects CalendarId
      batchName: ['', Validators.required]
    });

    this.loadData();
  }

  loadData() {
    this.batchSvc.getAll().subscribe(batches => {
      this.activeBatches = batches.filter(b => b.isActive);
    });
    this.batchSvc.getInactive().subscribe(data => this.inactiveBatches = data);
    this.feedbackSvc.getAll().subscribe(data => this.feedbacks = data);

    this.courseSvc.getAll().subscribe(c => this.courses = c);
    this.calSvc.getAll().subscribe(cals => this.calendars = cals);
  }

  toggleCreateForm() {
    this.showCreateForm = !this.showCreateForm;
  }

  submitBatch() {
    if (this.batchForm.invalid) return;
    const newBatch = this.batchForm.value;
    this.batchSvc.create(newBatch).subscribe(() => {
      this.loadData();
      this.batchForm.reset();
      this.showCreateForm = false;
    });
  }

  deleteBatch(batchId: number) {
    if (!confirm("Delete this batch?")) return;
    this.batchSvc.delete(batchId).subscribe(() => this.loadData());
  }

  deleteCourse(courseId: number) {
    if (!confirm("Delete this course?")) return;
    this.courseSvc.delete(courseId).subscribe(() => this.loadData());
  }

  showEnrollments(batchId: number) {
    this.selectedBatchId = batchId;
    this.batchSvc.getEnrollments(batchId).subscribe(data => this.selectedEnrollments = data);
  }

  searchFeedbackByBatch(batchId: number) {
    this.feedbackSvc.getForBatch(batchId).subscribe(data => this.feedbacks = data);
  }

  onSearch() {
    const id = Number(this.searchId);
    if (!id) return;
    this.batchSvc.get(id).subscribe(batch => this.activeBatches = batch ? [batch] : []);
  }
}
