import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeedbackCreateDto } from '../models/domain.models';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs'; 
@Injectable({ providedIn: 'root' })
export class FeedbackService {
    private baseUrl = `${environment.apiUrl}/feedback`;
  constructor(private http: HttpClient) {}

  submit(batchId: number, dto: FeedbackCreateDto) {
    return this.http.post(`${this.baseUrl}/${batchId}`, dto);
  }

 getAll(): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}`);
}

getForBatch(batchId: number): Observable<any[]> {
  return this.http.get<any[]>(`${this.baseUrl}/batch/${batchId}`);
}

}
