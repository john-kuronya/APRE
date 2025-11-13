/**
 * Author: John Kuronya
 * Date: 11/3/2024
 * File: agent-performance.service.ts
 * Description: Service for fetching agent performance data by year
 */

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface AgentPerfByYear {
  labels: string[];
  data: number[];
}

@Injectable({ providedIn: 'root' })
export class AgentPerformanceService {
  private http = inject(HttpClient);

  // app.js mounts: app.use('/api/reports/agent-performance', agentPerformanceReportsRouter)
  private base = `${environment.apiBaseUrl}/reports/agent-performance`;

  getByYear(year: number): Observable<AgentPerfByYear> {
    const url = `${this.base}/by-year?year=${encodeURIComponent(year)}`;
    console.log('[AgentPerformanceService] GET', url);
    return this.http.get<AgentPerfByYear>(url).pipe(
      catchError(err => {
        console.error('[AgentPerformanceService] error', err);
        return throwError(() => err);
      })
    );
  }
}
