import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, FormsModule } from '@angular/forms';
import { CourseService } from '../services/course.service';
import { BatchService } from '../services/batch.service';
import { CalendarService } from '../services/calendar.service';
import { Course, CourseCalendar } from '../models/domain.models';

@Component({
  selector: 'app-admin-courses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <h2>Admin — Course, Calendar & Batch Management</h2>

    <!-- Search -->
    <input [(ngModel)]="searchTerm" placeholder="Search courses..." class="search"/>

    <!-- Create Course -->
    <section class="panel">
      <h3>Create Course</h3>
      <form [formGroup]="courseForm" (ngSubmit)="createCourse()">
        <input formControlName="courseName" placeholder="Course Name">
        <input formControlName="description" placeholder="Description">
        <input formControlName="durationDays" type="number" placeholder="Duration (days)">
        <input formControlName="startDate" type="date" placeholder="Start Date">
        <input formControlName="endDate" type="date" placeholder="End Date">
        <button [disabled]="courseForm.invalid">Create Course</button>
      </form>
      <div *ngIf="courseMsg">{{courseMsg}}</div>
    </section>

    <!-- Course List -->
    <section class="panel">
      <h3>Courses</h3>
      <div *ngFor="let c of filteredCourses()" class="course-card">
        <div>
          <strong>{{c.courseName}}</strong> (ID: {{c.courseId}})
          <small *ngIf="c.description"> — {{c.description}}</small>
          <div>Duration: {{c.durationDays}} days</div>

          <!-- Calendar Info -->
          <div *ngIf="c.calendars?.length">
            <em>Calendars:</em>
            <ul>
              <li *ngFor="let cal of c.calendars">
                {{cal.startDate | date}} - {{cal.endDate | date}}
              </li>
            </ul>
          </div>
        </div>

        <!-- Update Course -->
        <button (click)="toggleUpdateForm(c.courseId)">Update Course</button>
        <div *ngIf="showUpdateForm[c.courseId]">
          <form [formGroup]="updateForms[c.courseId]" (ngSubmit)="updateCourse(c.courseId)">
            <input formControlName="courseName" placeholder="Name">
            <input formControlName="description" placeholder="Description">
            <input formControlName="durationDays" type="number" placeholder="Duration">
            <input formControlName="startDate" type="date">
            <input formControlName="endDate" type="date">
            <button [disabled]="updateForms[c.courseId].invalid">Save</button>
          </form>
        </div>

        <button (click)="deleteCourse(c.courseId)">Delete Course</button>

        <!-- Batches -->
        <div *ngIf="c.calendars?.length">
          <em>Batches:</em>
          <ul>
            <li *ngFor="let cal of c.calendars">
              <div *ngFor="let b of cal.batches">
                {{b.batchName}} (ID: {{b.batchId}})
                <button (click)="deleteBatch(b.batchId)">Delete</button>
                <button (click)="deactivateBatch(b.batchId)">Deactivate</button>
              </div>
            </li>
          </ul>

          <!-- Add Batch -->
          <form [formGroup]="batchForms[c.courseId]" (ngSubmit)="createBatch(c.courseId)">
            <input formControlName="batchName" placeholder="New Batch Name">
            <button [disabled]="batchForms[c.courseId].invalid">Create Batch</button>
          </form>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .panel { border:1px solid #eee;padding:12px;margin-bottom:14px }
    .course-card { border-top:1px dashed #ddd;padding:8px 0 }
    .search { margin: 10px 0; padding: 6px; width: 300px; }
  `]
})
export class AdminCoursesComponent implements OnInit {
  courses: Course[] = [];
  searchTerm = '';

  courseForm = new FormGroup({
    courseName: new FormControl('', Validators.required),
    description: new FormControl(''),
    durationDays: new FormControl(0),
    startDate: new FormControl('', Validators.required),
    endDate: new FormControl('', Validators.required)
  });
  courseMsg = '';

  showUpdateForm: Record<number, boolean> = {};
  updateForms: Record<number, FormGroup> = {};
  batchForms: Record<number, FormGroup> = {};

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

  filteredCourses() {
    if (!this.searchTerm) return this.courses;
    const term = this.searchTerm.toLowerCase();
    return this.courses.filter(c =>
      c.courseName.toLowerCase().includes(term) ||
      (c.description?.toLowerCase().includes(term)) ||
      c.courseId.toString().includes(term)
    );
  }

  createCourse() {
    const val = this.courseForm.value;
    this.courseSvc.create({
      courseName: val.courseName!,
      description: val.description!,
      durationDays: val.durationDays ?? 0 
    }).subscribe({
      next: course => {
        // create calendar immediately
        this.calendarSvc.create({
          courseId: course.courseId,
          startDate: val.startDate!,
          endDate: val.endDate!
        }).subscribe(() => {
          this.courseMsg = 'Course + Calendar created';
          this.courseForm.reset();
          this.loadCourses();
        });
      },
      error: err => this.courseMsg = 'Create failed: ' + JSON.stringify(err)
    });
  }

  toggleUpdateForm(courseId: number) {
    this.showUpdateForm[courseId] = !this.showUpdateForm[courseId];
    if (!this.updateForms[courseId]) {
      const c = this.courses.find(x => x.courseId === courseId)!;
      this.updateForms[courseId] = new FormGroup({
        courseName: new FormControl(c.courseName, Validators.required),
        description: new FormControl(c.description ?? ''),
        durationDays: new FormControl(c.durationDays ?? 0),
        startDate: new FormControl(c.calendars?.[0]?.startDate ?? ''),
        endDate: new FormControl(c.calendars?.[0]?.endDate ?? '')
      });
    }
  }

  updateCourse(courseId: number) {
    const val = this.updateForms[courseId].value;
    this.courseSvc.update(courseId, {
      courseId,
      courseName: val.courseName!,
      description: val.description!,
      durationDays: val.durationDays
    }).subscribe({
      next: () => {
        if (val.startDate && val.endDate) {
          const cal = this.courses.find(c => c.courseId === courseId)?.calendars?.[0];
          if (cal) {
            this.calendarSvc.update(cal.calendarId, {
              calendarId: cal.calendarId,
              courseId,
              startDate: val.startDate!,
              endDate: val.endDate!
            }).subscribe(() => this.loadCourses());
          }
        }
        this.showUpdateForm[courseId] = false;
        this.loadCourses();
      }
    });
  }

  deleteCourse(courseId: number) {
    if (!confirm('Delete this course?')) return;
    this.courseSvc.delete(courseId).subscribe(() => this.loadCourses());
  }

  createBatch(courseId: number) {
    const form = this.batchForms[courseId];
    const course = this.courses.find(c => c.courseId === courseId);
    const cal = course?.calendars?.[0];
    if (!cal) return;
    this.batchSvc.create({
      batchName: form.value.batchName,
      calendarId: cal.calendarId
    }).subscribe(() => {
      form.reset();
      this.loadCourses();
    });
  }

  deleteBatch(batchId: number) {
    if (!confirm('Delete batch?')) return;
    this.batchSvc.delete(batchId).subscribe(() => this.loadCourses());
  }

  deactivateBatch(batchId: number) {
    if (!confirm('Deactivate batch?')) return;
    this.batchSvc.delete(batchId).subscribe(() => this.loadCourses());
  }
}