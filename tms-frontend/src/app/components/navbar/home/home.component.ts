import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h1>Welcome to the Training Management System</h1>
    <p>Use the navigation to access your dashboard. Login or register to get started.</p>
    <p><a routerLink="/login">Login</a> | <a routerLink="/register">Register</a></p>
  `,
  styles: [`
    h1 { margin-top: 0; }
  `]
})
export class HomeComponent {}
