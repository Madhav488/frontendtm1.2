import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Batch } from '../models/domain.models';
import { Observable } from 'rxjs';
import { EnrollmentDto } from '../models/domain.models';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class BatchService {
    private baseUrl = `${environment.apiUrl}/batches`;
  constructor(private http: HttpClient) {}

  getAll(): Observable<Batch[]> {
    return this.http.get<Batch[]>(this.baseUrl);
  }

  get(id: number) {
    return this.http.get<Batch>(`${this.baseUrl}/${id}`);
  }

  create(batch: Partial<Batch>) {
    return this.http.post<Batch>(this.baseUrl, batch);
  }
  update(id: number, batch: Batch) {
  return this.http.put(`${this.baseUrl}/${id}`, batch);
}
delete(id: number) {
  return this.http.delete(`${this.baseUrl}/${id}`);
}
getInactive() {
  return this.http.get<Batch[]>(`${this.baseUrl}/inactive`);
}

getEnrollments(batchId: number) {
  return this.http.get<EnrollmentDto[]>(`${this.baseUrl}/${batchId}/enrollments`);
}
getDeleted() {
  return this.http.get<Batch[]>(`${this.baseUrl}/inactive`);
}

}
