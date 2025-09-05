import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BatchService } from '../services/batch.service';
import { Batch } from '../models/domain.models';
import { CourseCalendar } from '../models/domain.models';
import { Course } from '../models/domain.models';
@Component({
  selector: 'app-admin-calendar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <h2>Course Calendar</h2>

    <section class="panel">
      <h3>Active Batches</h3>
      <ul *ngIf="activeBatches.length; else noActive">
        <li *ngFor="let b of activeBatches">
          <strong>{{b.batchName}}</strong> 
          <span *ngIf="b.calendar?.course"> ({{ b.calendar?.course?.courseName }})</span>
          <small>Started: {{b.createdOn | date}}</small>
        </li>
      </ul>
      <ng-template #noActive><em>No active batches</em></ng-template>
    </section>

    <section class="panel">
      <h3>Inactive Batches</h3>
      <ul *ngIf="inactiveBatches.length; else noInactive">
        <li *ngFor="let b of inactiveBatches">
          <strong>{{b.batchName}}</strong> 
          <span *ngIf="b.calendar?.course"> ({{b.calendar?.course?.courseName}})</span>
          <small>Started: {{b.createdOn | date}}</small>
        </li>
      </ul>
      <ng-template #noInactive><em>No inactive batches</em></ng-template>
    </section>
  `,
  styles: [`
    .panel { border:1px solid #eee; padding:12px; margin-bottom:14px; }
    ul { list-style: none; padding:0; }
    li { margin-bottom: 6px; }
  `]
})
export class AdminCalendarComponent implements OnInit {
  activeBatches: Batch[] = [];
  inactiveBatches: Batch[] = [];

  constructor(private batchSvc: BatchService) {}

  ngOnInit() {
    this.batchSvc.getAll().subscribe(batches => {
      this.activeBatches = batches.filter(b => b.isActive);
      this.inactiveBatches = batches.filter(b => !b.isActive);
    });
  }
}
