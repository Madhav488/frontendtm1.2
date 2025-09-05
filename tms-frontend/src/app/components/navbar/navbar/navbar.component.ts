import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
  <nav class="nav">
    <a routerLink="/" class="brand">TMS</a>

    <div class="links">
      <a routerLink="/">Home</a>
      <a *ngIf="isEmployee" routerLink="/employee">Calendar</a>
      <a *ngIf="isEmployee" routerLink="/my-enrollments">My Enrollments</a>
      <a *ngIf="isManager" routerLink="/manager">Manager</a>
      <a *ngIf="isAdmin" routerLink="/admin">Admin</a>
      <a *ngIf="!isLoggedIn" routerLink="/login">Login</a>
      <!-- register removed -->
      <a *ngIf="isLoggedIn" (click)="logout()" class="link-button">Logout</a>
    </div>
  </nav>
`  ,
  styles: [`
    .nav { display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #eee; }
    .brand { font-weight:700; font-size:18px; margin-right:20px; text-decoration:none; color:#333; }
    .links a { margin-left:12px; text-decoration:none; color:#007bff; cursor:pointer; }
    .link-button { cursor:pointer; color:#dc3545; }
  `]
})
export class NavbarComponent {
  constructor(public auth: AuthService, private router: Router) {}

  get isLoggedIn() { return this.auth.isLoggedIn(); }
  get role() { return this.auth.getRole(); }
  get isEmployee() { return this.role === 'Employee'; }
  get isManager() { return this.role === 'Manager'; }
  get isAdmin() { return this.role === 'Administrator'; }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
