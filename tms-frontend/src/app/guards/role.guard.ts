import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}
  canActivate(route: ActivatedRouteSnapshot): boolean {
    const roles: string[] = route.data['roles'] ?? [];
    const userRole = this.auth.getRole();
    if (!roles || roles.length === 0) return true;
    if (userRole && roles.includes(userRole)) return true;
    // unauthorized - send to home
    this.router.navigate(['/']);
    return false;
  }
}
