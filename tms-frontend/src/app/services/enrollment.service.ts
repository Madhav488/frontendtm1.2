import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EnrollmentDto } from '../models/domain.models';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class EnrollmentService {
    private baseUrl = `${environment.apiUrl}/enrollments`;
  constructor(private http: HttpClient) {}

  requestEnrollment(batchId: number) {
    return this.http.post<EnrollmentDto>(`${this.baseUrl}/request/${batchId}`, {});
  }

  // Expected by frontend: get my enrollments.
  // NOTE: this endpoint does NOT exist in your backend by default.
  // See backend fix at the bottom (Add GET api/enrollments/mine).
  getMyEnrollments() {
    return this.http.get<EnrollmentDto[]>(`${this.baseUrl}/mine`).pipe(
      catchError(err => {
        // if backend missing, return empty array so UI still works but shows a warning
        return of([]);
      })
    );
  }

  approve(id: number) {
    return this.http.post(`${this.baseUrl}/${id}/approve`, null);
  }

  reject(id: number) {
    return this.http.post(`${this.baseUrl}/${id}/reject`, null);
  }

  getPending() {
    return this.http.get<EnrollmentDto[]>(`${this.baseUrl}/pending`);
  }
}
