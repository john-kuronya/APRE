/**
 * Author: John Kuronya
 * Date: 10/27/2025
 * File: sales.service.ts
 * Description: Service for fetching sales data by salesperson
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface SalesBySalespersonResponse {
  labels: string[];
  data: number[];
  region: { labels: string[]; data: number[] };
}

// ---- Mock dataset (used as automatic fallback) ----
const MOCK: Record<string, SalesBySalespersonResponse> = {
  Alice: {
    labels: ['Monthly', 'Quarterly', 'Yearly'],
    data:   [12000, 34000, 130000],
    region: { labels: ['North', 'South', 'East', 'West'], data: [3000, 2000, 1000, 4000] }
  },
  Bob: {
    labels: ['Monthly', 'Quarterly', 'Yearly'],
    data:   [9000, 26000, 110000],
    region: { labels: ['North', 'South', 'East', 'West'], data: [1500, 2500, 3500, 4500] }
  },
  Cara: {
    labels: ['Monthly', 'Quarterly', 'Yearly'],
    data:   [15000, 39000, 144000],
    region: { labels: ['North', 'South', 'East', 'West'], data: [2200, 1800, 2400, 5600] }
  }
};

function aggregateAll(): SalesBySalespersonResponse {
  const agg: SalesBySalespersonResponse = {
    labels: ['Monthly', 'Quarterly', 'Yearly'],
    data: [0, 0, 0],
    region: { labels: ['North', 'South', 'East', 'West'], data: [0, 0, 0, 0] }
  };
  for (const key of Object.keys(MOCK)) {
    const item = MOCK[key];
    agg.data = agg.data.map((n, i) => n + item.data[i]);
    agg.region.data = agg.region.data.map((n, i) => n + item.region.data[i]);
  }
  return agg;
}

function mockFor(salesperson?: string): SalesBySalespersonResponse {
  const sp = (salesperson || '').trim();
  if (!sp) return aggregateAll();
  return MOCK[sp] ?? {
    labels: ['Monthly', 'Quarterly', 'Yearly'],
    data: [0, 0, 0],
    region: { labels: ['North', 'South', 'East', 'West'], data: [0, 0, 0, 0] }
  };
}

@Injectable({ providedIn: 'root' })
export class SalesService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}/sales`;

  getBySalesperson(salesperson?: string): Observable<SalesBySalespersonResponse> {
    const url = `${this.base}/by-salesperson${salesperson ? `?salesperson=${encodeURIComponent(salesperson)}` : ''}`;

    return this.http.get<SalesBySalespersonResponse>(url).pipe(
      // Prevent the UI from hanging if the server isn't up
      timeout(2000),
      // On any error (404, network, CORS, timeout), return mock data
      catchError(() => of(mockFor(salesperson)))
    );
  }
}
