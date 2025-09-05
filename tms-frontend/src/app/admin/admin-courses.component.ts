import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CourseService } from '../services/course.service';
import { BatchService } from '../services/batch.service';
import { CalendarService } from '../services/calendar.service';
import { Course, CourseCalendar } from '../models/domain.models';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Admin — Course, Calendar & Batch Management</h2>

    <!-- Create Course -->
    <section class="panel">
      <h3>Create Course</h3>
      <form [formGroup]="courseForm" (ngSubmit)="createCourse()">
        <input formControlName="courseName" placeholder="Course Name">
        <input formControlName="description" placeholder="Description">
        <input formControlName="durationDays" type="number" placeholder="Duration (days)">
        <button [disabled]="courseForm.invalid">Create Course</button>
      </form>
      <div *ngIf="courseMsg">{{courseMsg}}</div>
    </section>

    <!-- Course List -->
    <section class="panel">
      <h3>Courses</h3>
      <div *ngFor="let c of courses" class="course-card">
        <strong>{{c.courseName}}</strong>
        <small *ngIf="c.description"> — {{c.description}}</small>

        <!-- Toggle Calendar Form -->
        <button (click)="toggleCalendarForm(c.courseId)">+ Add Calendar</button>
        <div *ngIf="showCalendarForm[c.courseId]">
          <form [formGroup]="calendarForms[c.courseId]" (ngSubmit)="createCalendar(c.courseId)">
            <input type="date" formControlName="startDate">
            <input type="date" formControlName="endDate">
            <button [disabled]="calendarForms[c.courseId].invalid">Create Calendar</button>
          </form>
          <div *ngIf="calendarMsgMap[c.courseId]">{{calendarMsgMap[c.courseId]}}</div>
        </div>

        <!-- Toggle Batch Form -->
        <button (click)="toggleBatchForm(c.courseId)">+ Add Batch</button>
        <div *ngIf="showBatchForm[c.courseId]">
          <form [formGroup]="batchForms[c.courseId]" (ngSubmit)="createBatch(c.courseId)">
            <input formControlName="batchName" placeholder="Batch Name">
            <button [disabled]="batchForms[c.courseId].invalid">Create Batch</button>
          </form>
          <div *ngIf="batchMsgMap[c.courseId]">{{batchMsgMap[c.courseId]}}</div>
        </div>
      </div>
    </section>
  `,
  styles: [`.panel{border:1px solid #eee;padding:12px;margin-bottom:14px}`]
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  courseForm = new FormGroup({
    courseName: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    durationDays: new FormControl(0, { nonNullable: true })
  });
  courseMsg = '';

  // Calendar
  showCalendarForm: Record<number, boolean> = {};
  calendarForms: Record<number, FormGroup> = {};
  calendarMsgMap: Record<number, string> = {};
  courseCalendars: Record<number, CourseCalendar> = {};

  // Batch
  showBatchForm: Record<number, boolean> = {};
  batchForms: Record<number, FormGroup> = {};
  batchMsgMap: Record<number, string> = {};

  constructor(
    private courseSvc: CourseService,
    private batchSvc: BatchService,
    private calendarSvc: CalendarService
  ) {}

  ngOnInit() {
    this.loadCourses();
  }

  loadCourses() {
    this.courseSvc.getAll().subscribe(c => this.courses = c);
  }

  createCourse() {
    this.courseSvc.create(this.courseForm.value).subscribe({
      next: () => {
        this.courseMsg = 'Course created';
        this.courseForm.reset();
        this.loadCourses();
      },
      error: err => this.courseMsg = 'Create failed: ' + JSON.stringify(err)
    });
  }

  // CALENDAR HANDLERS
  toggleCalendarForm(courseId: number) {
    if (!this.calendarForms[courseId]) {
      this.calendarForms[courseId] = new FormGroup({
        startDate: new FormControl('', Validators.required),
        endDate: new FormControl('', Validators.required),
      });
    }
    this.showCalendarForm[courseId] = !this.showCalendarForm[courseId];
  }

  createCalendar(courseId: number) {
    const form = this.calendarForms[courseId];
    this.calendarSvc.create({
      courseId,
      startDate: form.value.startDate,
      endDate: form.value.endDate,
    }).subscribe({
      next: (cal: CourseCalendar) => {
        this.calendarMsgMap[courseId] = 'Calendar created';
        this.courseCalendars[courseId] = cal; // save calendar for later
        form.reset();
      },
      error: err => this.calendarMsgMap[courseId] = 'Create failed: ' + JSON.stringify(err)
    });
  }

  // BATCH HANDLERS
  toggleBatchForm(courseId: number) {
    if (!this.batchForms[courseId]) {
      this.batchForms[courseId] = new FormGroup({
        batchName: new FormControl('', Validators.required),
      });
    }
    this.showBatchForm[courseId] = !this.showBatchForm[courseId];
  }

  createBatch(courseId: number) {
    const form = this.batchForms[courseId];
    const cal = this.courseCalendars[courseId];
    if (!cal) {
      this.batchMsgMap[courseId] = 'No calendar found for this course';
      return;
    }

    this.batchSvc.create({
      batchName: form.value.batchName,
      calendarId: cal.calendarId
    }).subscribe({
      next: () => {
        this.batchMsgMap[courseId] = 'Batch created';
        form.reset();
      },
      error: err => this.batchMsgMap[courseId] = 'Create failed: ' + JSON.stringify(err)
    });
  }
}
