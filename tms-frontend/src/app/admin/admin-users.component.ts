import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseService } from '../services/course.service';
import { BatchService } from '../services/batch.service';
import { Course } from '../models/domain.models';
import { FormsModule } from '@angular/forms';
import { UserService, ManagerDto, CreateUserDto, EmployeeDto} from '../services/user.service';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Batch, EnrollmentDto } from '../models/domain.models';
import { EnrollmentService } from '../services/enrollment.service';
@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <h2>Admin — User Management</h2>

    <!-- Manager creation -->
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

    <!-- Manager list -->
    <section class="panel">
      <h3>Managers</h3>
      <div *ngIf="loading">Loading managers...</div>
      <div *ngFor="let m of managers" class="manager-card">
        <div class="mgr-header">
          <strong>{{m.username}}</strong> (ID: {{m.userId}})
          <small *ngIf="m.email">({{m.email}})</small>
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
              ID: {{e.userId}}
              <button (click)="unassignEmployee(e.userId)">Unassign</button>
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Employee list -->
    <section class="panel">
      <h3>Employees</h3>

      <div>
        <input type="number" [(ngModel)]="searchId" placeholder="Search by ID">
        <button (click)="searchEmployee()">Search</button>
        <button (click)="loadEmployees()">Clear</button>
      </div>

      <div>
        <form [formGroup]="unassignedForm" (ngSubmit)="createUnassignedEmployee()">
          <input formControlName="username" placeholder="username">
          <input formControlName="firstName" placeholder="first name">
          <input formControlName="lastName" placeholder="last name">
          <input formControlName="email" placeholder="email">
          <input formControlName="password" type="password" placeholder="password">
          <button [disabled]="unassignedForm.invalid">Create Unassigned Employee</button>
        </form>
      </div>

      <ul>
        <li *ngFor="let e of employees">
          <div>
            <strong>ID: {{e.userId}} - {{e.firstName}} {{e.lastName}}</strong>
            <span *ngIf="e.manager"> (Manager: {{e.manager.username}})</span>
            <span *ngIf="!e.manager"> (Unassigned)</span>
            <button (click)="deleteEmployee(e.userId)">Delete</button>
            <button *ngIf="!e.manager" (click)="startAssign(e.userId)">Assign</button>
          </div>

          <!-- Assign manager -->
          <div *ngIf="assigningId === e.userId">
            <select [(ngModel)]="selectedManagerId">
              <option *ngFor="let m of managers" [value]="m.userId">{{m.username}}</option>
            </select>
            <button (click)="assignEmployee(e.userId, selectedManagerId)">Confirm</button>
            <button (click)="cancelAssign()">Cancel</button>
          </div>

          <!-- Enrollments -->
          <div class="enrollments" *ngIf="e.enrollments?.length">
            <em>Enrollments:</em>
            <ul>
              <li *ngFor="let en of e.enrollments">
                {{en.courseName}} - {{en.batchName}} → <strong>{{en.status}}</strong>
                <span *ngIf="en.approvedBy"> (Approved by: {{en.approvedBy}})</span>
              </li>
            </ul>
          </div>

          <!-- Enroll new -->
          <div>
            <button (click)="toggleEnroll(e.userId)">Enroll</button>
            <div *ngIf="enrollingId === e.userId">
              <select [(ngModel)]="selectedBatchId">
                <option *ngFor="let b of batches" [value]="b.batchId">
                  {{b.batchName}} ({{b.calendar?.course?.courseName}})
                </option>
              </select>
              <button (click)="enrollEmployee(e.userId)">Confirm</button>
              <button (click)="cancelEnroll()">Cancel</button>
            </div>
          </div>

        </li>
      </ul>
    </section>
  `,
  styles: [`
    .panel{border:1px solid #eee;padding:12px;margin-bottom:14px}
    input{display:inline-block;margin:6px 6px 6px 0;padding:6px}
    .manager-card{border-top:1px dashed #ddd;padding:8px 0}
    .mgr-header{display:flex;gap:10px;align-items:center}
    .msg{color:green;margin-top:6px}
    .enrollments{margin-top:6px;font-size:0.9em;color:#444}
  `]
})
export class AdminUsersComponent implements OnInit {
  managers: ManagerDto[] = [];
  employees: EmployeeDto[] = [];
  batches: Batch[] = [];
  loading = false;

  enrollingId: number | null = null;
  selectedBatchId: number | null = null;

  managerForm = new FormGroup({
    username: new FormControl('', Validators.required),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('', Validators.required)
  });

  unassignedForm = new FormGroup({
    username: new FormControl('', Validators.required),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl('', Validators.required)
  });

  managerMsg = '';
  showCreateFor: Record<number, boolean> = {};
  employeeForms: Record<number, FormGroup> = {};
  msgMap: Record<number, string> = {};
  searchId: number | null = null;

  assigningId: number | null = null;
  selectedManagerId: number | null = null;

  constructor(
    private userSvc: UserService,
    private enrollmentSvc: EnrollmentService,
    private batchSvc: BatchService
  ) {}

  ngOnInit() {
    this.loadManagers();
    this.loadEmployees();
    this.loadBatches();
  }

  // --- Managers ---
  loadManagers() {
    this.loading = true;
    this.userSvc.getManagers().subscribe({
      next: list => { this.managers = list || []; this.loading = false; },
      error: err => { console.error(err); this.loading = false; }
    });
  }

  createManager() {
    const val = this.managerForm.value;
    const dto: CreateUserDto = {
      username: val.username!,
      password: val.password!,
      email: val.email ?? '',
      firstName: val.firstName ?? '',
      lastName: val.lastName ?? '',
      roleName: 'Manager'
    };
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
        firstName: new FormControl(''),
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
      username: val.username!,
      password: val.password!,
      email: val.email ?? '',
      firstName: val.firstName ?? '',
      lastName: val.lastName ?? '',
      roleName: 'Employee',
      managerId
    };
    this.userSvc.createUser(dto).subscribe({
      next: () => {
        this.msgMap[managerId] = 'Employee created';
        this.employeeForms[managerId].reset();
        this.loadManagers();
        this.loadEmployees();
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

  // --- Employees ---
  loadEmployees() {
    this.userSvc.getEmployees().subscribe({
      next: list => {
        this.employees = list;
        this.employees.forEach(e => {
          this.enrollmentSvc.getByEmployee(e.userId).subscribe({
            next: ens => e.enrollments = ens,
            error: err => console.error(err)
          });
        });
      },
      error: err => console.error(err)
    });
  }

  searchEmployee() {
    if (!this.searchId) { this.loadEmployees(); return; }
    this.userSvc.getEmployeeById(this.searchId).subscribe({
      next: e => {
        if (e) {
          this.enrollmentSvc.getByEmployee(e.userId).subscribe({
            next: ens => e.enrollments = ens,
            error: err => console.error(err)
          });
          this.employees = [e];
        } else {
          this.employees = [];
        }
      },
      error: _ => this.employees = []
    });
  }

  createUnassignedEmployee() {
    const val = this.unassignedForm.value;
    const dto: CreateUserDto = {
      username: val.username!,
      password: val.password!,
      email: val.email ?? '',
      firstName: val.firstName ?? '',
      lastName: val.lastName ?? '',
      roleName: 'Employee',
      managerId: null
    };
    this.userSvc.createUser(dto).subscribe({
      next: () => {
        this.unassignedForm.reset();
        this.loadEmployees();
      },
      error: e => alert('Create failed: ' + (e?.error ?? JSON.stringify(e)))
    });
  }

  deleteEmployee(employeeId: number) {
    if (!confirm('Are you sure you want to delete this employee?')) return;
    this.userSvc.deleteUser(employeeId).subscribe({
      next: () => this.loadEmployees(),
      error: e => alert('Delete failed: ' + (e?.error ?? JSON.stringify(e)))
    });
  }

  startAssign(employeeId: number) {
    this.assigningId = employeeId;
  }

  cancelAssign() {
    this.assigningId = null;
    this.selectedManagerId = null;
  }

  assignEmployee(employeeId: number, managerId: number | null) {
    if (!managerId) return;
    this.userSvc.assignEmployee(employeeId, managerId).subscribe({
      next: () => {
        this.cancelAssign();
        this.loadEmployees();
        this.loadManagers();
      },
      error: err => alert('Assign failed: ' + JSON.stringify(err))
    });
  }

  unassignEmployee(employeeId: number) {
    this.userSvc.unassignEmployee(employeeId).subscribe({
      next: () => {
        this.loadEmployees();
        this.loadManagers();
      },
      error: err => alert('Unassign failed: ' + JSON.stringify(err))
    });
  }

  // --- Enrollments ---
  loadBatches() {
    this.batchSvc.getAll().subscribe({
      next: list => this.batches = list,
      error: err => console.error(err)
    });
  }

  toggleEnroll(employeeId: number) {
    this.enrollingId = employeeId;
  }

  cancelEnroll() {
    this.enrollingId = null;
    this.selectedBatchId = null;
  }

  enrollEmployee(employeeId: number) {
    if (!this.selectedBatchId) return;
    this.enrollmentSvc.enrollEmployee(employeeId, this.selectedBatchId).subscribe({
      next: () => {
        alert('Enrollment successful');
        this.cancelEnroll();
        this.loadEmployees();
      },
      error: e => alert('Enroll failed: ' + (e?.error ?? JSON.stringify(e)))
    });
  }
}