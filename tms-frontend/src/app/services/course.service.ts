import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Course } from '../models/domain.models';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class CourseService {
    private baseUrl = `${environment.apiUrl}/batches`;
  constructor(private http: HttpClient) {}
  getAll() { return this.http.get<Course[]>(this.baseUrl); }
  create(course: Partial<Course>) { return this.http.post<Course>(this.baseUrl, course);}
}
