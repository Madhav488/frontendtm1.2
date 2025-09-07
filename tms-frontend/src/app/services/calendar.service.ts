import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Course } from '../models/domain.models';
import { CourseCalendar } from '../models/domain.models';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class CalendarService {
  private baseUrl = `${environment.apiUrl}/calendars`;
  constructor(private http: HttpClient) {}

  getAll() { return this.http.get<CourseCalendar[]>(this.baseUrl); }
  create(calendar: Partial<CourseCalendar>) {
    return this.http.post<CourseCalendar>(this.baseUrl, calendar);
  }
  update(id: number, cal: CourseCalendar) {
  return this.http.put(`${this.baseUrl}/${id}`, cal);
}
delete(id: number) {
  return this.http.delete(`${this.baseUrl}/${id}`);
}

}
