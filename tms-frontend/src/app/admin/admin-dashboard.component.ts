import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../services/course.service';
import { BatchService } from '../services/batch.service';
import { Course } from '../models/domain.models';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  template: `
    <h2>Admin - Courses</h2>
    <div>
      <input placeholder="Course name" [(ngModel)]="courseName">
      <button (click)="createCourse()">Create course</button>
    </div>
    <div *ngFor="let c of courses" class="card">
      <div><strong>{{c.courseName}}</strong> — {{c.description}}</div>
    </div>
  `,
  styles: [`.card {border:1px solid #eee; padding:8px; margin:8px 0;} input{padding:6px; margin-right:8px;}`]
})
export class AdminDashboardComponent implements OnInit {
  courses: Course[] = [];
  courseName = '';

  constructor(private courseSvc: CourseService) {}

  ngOnInit() {
    this.courseSvc.getAll().subscribe(list => this.courses = list || []);
  }

  createCourse() {
    if (!this.courseName.trim()) return;
    this.courseSvc.create({ courseName: this.courseName }).subscribe({
      next: c => { this.courses.push(c as Course); this.courseName = ''; },
      error: e => alert('Create failed: ' + JSON.stringify(e))
    });
  }
}
