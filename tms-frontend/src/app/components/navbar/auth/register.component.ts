import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2>Register (creates Employee)</h2>
    <form [formGroup]="form" (ngSubmit)="submit()">
      <div><input formControlName="username" placeholder="Username"></div>
      <div><input formControlName="email" placeholder="Email"></div>
      <div><input formControlName="password" placeholder="Password" type="password"></div>
      <div><button [disabled]="form.invalid">Register</button></div>
      <div *ngIf="error" class="error">{{error}}</div>
    </form>
  `,
  styles: [`.error { color: red; margin-top:8px; } input { display:block; margin:6px 0; padding:8px; width: 320px; }`]
})
export class RegisterComponent {
  form = new FormGroup({
    username: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.email]),
    password: new FormControl('', Validators.required)
  });
  error?: string;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
  this.error = undefined;

  if (this.form.invalid) {
    this.error = 'Please fill out all fields correctly.';
    return;
  }

  const registerRequest = {
    username: this.form.value.username!,
    email: this.form.value.email!,
    password: this.form.value.password!
  };

  this.auth.register(registerRequest).subscribe({
    next: () => this.router.navigate(['/employee']),
    error: err => this.error = err?.error ?? 'Register failed'
  });
}
}
