import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ManagerDto {
  userId: number;
  username: string;
  email?: string;
  firstName?: string;   // 👈 add
  lastName?: string; 
  employees?: { userId: number; username: string }[];
}

export interface CreateUserDto {
  username: string;
  password: string;
  email?: string;
  firstName?: string;   // 👈 add
  lastName?: string; 
  roleName: string; // "Manager" | "Employee" | "Administrator"
  managerId?: number | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private apiUrl = environment.apiUrl; // 👈 base URL

  constructor(private http: HttpClient) {}

  // GET list of managers
  getManagers(): Observable<ManagerDto[]> {
    return this.http.get<ManagerDto[]>(`${this.apiUrl}/users/managers`);
  }

  // Create user
    createUser(dto: CreateUserDto): Observable<any> {
    // HttpClient will automatically set Content-Type: application/json
    return this.http.post<any>(`${this.apiUrl}/users/create`, dto);
  }

  // Delete user
  deleteUser(userId: number) {
    return this.http.delete(`${this.apiUrl}/users/${userId}`);
  }
}
