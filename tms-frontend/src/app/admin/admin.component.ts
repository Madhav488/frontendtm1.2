import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminUsersComponent } from './admin-users.component';
import { AdminCoursesComponent } from './admin-courses.component';
import { AdminCalendarComponent } from './admin-calendar.component';
@Component({
  
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, AdminUsersComponent, AdminCoursesComponent,  AdminCalendarComponent],
  template: `
    <h1>Admin Panel</h1>
    <nav>
      <button (click)="tab='users'">Users</button>
      <button (click)="tab='courses'">Courses & Batches</button>
      <button (click)="tab='calendar'">Course Calendar</button> 
    </nav>

    <div [ngSwitch]="tab">
      <app-admin-users *ngSwitchCase="'users'"></app-admin-users>
      <app-admin-courses *ngSwitchCase="'courses'"></app-admin-courses>
      <app-admin-calendar *ngSwitchCase="'calendar'"></app-admin-calendar>
    </div>
  `
})
export class AdminComponent {
  tab: 'users' | 'courses' | 'calendar' = 'users';
}
