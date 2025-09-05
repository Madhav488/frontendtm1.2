import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Login</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div><input formControlName="username" placeholder="Username"></div>
      <div><input formControlName="password" placeholder="Password" type="password"></div>
      <div><button [disabled]="form.invalid">Login</button></div>
      <div *ngIf="error" class="error">{{error}}</div>
    </form>
  `,
  styles: [`.error { color: red; margin-top:8px; } input { display:block; margin:6px 0; padding:8px; width: 280px; }`]
})
export class LoginComponent {
  form = new FormGroup({
    username: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required)
  });
  error?: string;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = undefined;
    const val = this.form.value;
    this.auth.login({ username: val.username!, password: val.password! }).subscribe({
      next: () => {
        const role = this.auth.getRole();
        if (role === 'Administrator') this.router.navigate(['/admin']);
        else if (role === 'Manager') this.router.navigate(['/manager']);
        else this.router.navigate(['/employee']);
      },
      error: err => this.error = err?.error ?? 'Login failed'
    });
  }
}
