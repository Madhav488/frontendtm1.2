import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FeedbackCreateDto } from '../models/domain.models';
import { environment } from '../../environments/environment';
@Injectable({ providedIn: 'root' })
export class FeedbackService {
    private baseUrl = `${environment.apiUrl}/feedback`;
  constructor(private http: HttpClient) {}

  submit(batchId: number, dto: FeedbackCreateDto) {
    return this.http.post(`${this.baseUrl}/${batchId}`, dto);
  }

  getForBatch(batchId: number) {
    return this.http.get(`${this.baseUrl}/batch/${batchId}`);
  }
}
