import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../services/course.service';
import { BatchService } from '../services/batch.service';
import { Course } from '../models/domain.models';
import { FormsModule } from '@angular/forms';
import { UserService, ManagerDto, CreateUserDto } from '../services/user.service';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <h2>Admin — User Management</h2>

    <section class="panel">
      <h3>Register a new Manager</h3>
      <form [formGroup]="managerForm" (ngSubmit)="createManager()">
        <input formControlName="username" placeholder="username">
        <input formControlName="firstName" placeholder="first name">   
        <input formControlName="lastName" placeholder="last name">
        <input formControlName="email" placeholder="email">
        <input formControlName="password" placeholder="password" type="password">
        <button [disabled]="managerForm.invalid">Create Manager</button>
      </form>
      <div *ngIf="managerMsg" class="msg">{{managerMsg}}</div>
    </section>

    <section class="panel">
      <h3>Managers</h3>
      <div *ngIf="loading">Loading managers...</div>
      <div *ngFor="let m of managers" class="manager-card">
        <div class="mgr-header">
          <strong>{{m.username}}</strong> <small *ngIf="m.email">({{m.email}})</small>
          <button (click)="toggleCreateFor(m.userId)">Create employee</button>
           <button (click)="deleteManager(m.userId)">Delete</button> 
        </div>

        <div *ngIf="showCreateFor[m.userId]" class="create-employee-form">
          <form [formGroup]="employeeForms[m.userId]" (ngSubmit)="createEmployee(m.userId)">
            <input formControlName="username" placeholder="employee username">
            <input formControlName="firstName" placeholder="first name">  
            <input formControlName="lastName" placeholder="last name">
            <input formControlName="email" placeholder="employee email">
            <input formControlName="password" placeholder="password" type="password">
            <button [disabled]="employeeForms[m.userId].invalid">Create Employee</button>
            <button type="button" (click)="cancelCreate(m.userId)">Cancel</button>
          </form>
          <div *ngIf="msgMap[m.userId]" class="msg">{{msgMap[m.userId]}}</div>
        </div>

      <div class="employees-list" *ngIf="m.employees?.length">
        <em>Employees:</em>
        <ul>
        <li *ngFor="let e of m.employees">
          {{e.username}}
          <button (click)="deleteEmployee(e.userId)">Delete</button>
         </li>
        </ul>
      </div>
      </div>
    </section>
  `,
  styles: [`
    .panel{border:1px solid #eee;padding:12px;margin-bottom:14px}
    input{display:inline-block;margin:6px 6px 6px 0;padding:6px}
    .manager-card{border-top:1px dashed #ddd;padding:8px 0}
    .mgr-header{display:flex;gap:10px;align-items:center}
    .msg{color:green;margin-top:6px}
  `]
})
export class AdminUsersComponent implements OnInit {
  managers: ManagerDto[] = [];
  loading = false;

  managerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    firstName: new FormControl(''),   // 👈
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('', Validators.required)
  });
  managerMsg = '';

  // per-manager create employee forms & UI state
  showCreateFor: Record<number, boolean> = {};
  employeeForms: Record<number, FormGroup> = {};
  msgMap: Record<number, string> = {};

  constructor(private userSvc: UserService) {}

  ngOnInit() {
    this.loadManagers();
  }

  loadManagers() {
    this.loading = true;
    this.userSvc.getManagers().subscribe({
      next: list => { this.managers = list || []; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  createManager() {
    const val = this.managerForm.value;
    const dto = { username: val.username, password: val.password, email: val.email, firstName: val.firstName ?? '',lastName: val.lastName ?? '',roleName: 'Manager' } as CreateUserDto;
    this.userSvc.createUser(dto).subscribe({
      next: () => {
        this.managerMsg = 'Manager created';
        this.managerForm.reset();
        this.loadManagers();
      },
      error: e => this.managerMsg = 'Create failed: ' + (e?.error ?? JSON.stringify(e))
    });
  }

  toggleCreateFor(managerId: number) {
    this.showCreateFor[managerId] = !this.showCreateFor[managerId];
    if (this.showCreateFor[managerId] && !this.employeeForms[managerId]) {
      this.employeeForms[managerId] = new FormGroup({
        username: new FormControl('', Validators.required),
        firstName: new FormControl(''),   // 👈
        lastName: new FormControl(''),
        email: new FormControl(''),
        password: new FormControl('', Validators.required)
      });
    }
  }

  cancelCreate(managerId: number) {
    this.showCreateFor[managerId] = false;
  }

  createEmployee(managerId: number) {
    const form = this.employeeForms[managerId];
    const val = form.value;
    const dto: CreateUserDto = {
      username: val.username,
      password: val.password,
      email: val.email,
      firstName: val.firstName ?? '',
      lastName: val.lastName ?? '',
      roleName: 'Employee',
      managerId
    };
    this.userSvc.createUser(dto).subscribe({
      next: () => {
        this.msgMap[managerId] = 'Employee created';
        this.employeeForms[managerId].reset();
        this.loadManagers(); // refresh to show new employee
      },
      error: e => this.msgMap[managerId] = 'Create failed: ' + (e?.error ?? JSON.stringify(e))
    });
  }
  deleteManager(managerId: number) {
  if (!confirm('Are you sure you want to delete this manager?')) return;
  this.userSvc.deleteUser(managerId).subscribe({
    next: () => this.loadManagers(),
    error: e => alert('Delete failed: ' + (e?.error ?? JSON.stringify(e)))
  });
 }
 deleteEmployee(employeeId: number) {
  if (!confirm('Are you sure you want to delete this employee?')) return;
  this.userSvc.deleteUser(employeeId).subscribe({
    next: () => this.loadManagers(), // refresh list
    error: e => alert('Delete failed: ' + (e?.error ?? JSON.stringify(e)))
  });
}

  
}