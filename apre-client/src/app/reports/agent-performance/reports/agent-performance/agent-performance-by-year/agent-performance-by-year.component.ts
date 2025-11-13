import { Component, computed, effect, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AgentPerformanceService } from '../../../../../shared/services/agent-performance.service';
import { ChartComponent } from '../../../../../shared/chart/chart.component';

@Component({
  selector: 'app-agent-performance-by-year',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChartComponent],
  template: `
    <div class="card">
      <h2>Agent Performance by Year</h2>

      <form [formGroup]="form" (ngSubmit)="load()" class="form">
        <div class="form__group">
          <label class="label" for="year">Year</label>
          <input class="input" id="year" type="number" formControlName="year" placeholder="e.g., 2024" />
        </div>
        <div class="form__actions">
          <button type="submit" class="button button--primary" [disabled]="form.invalid">Get Data</button>
        </div>
      </form>

      <div class="charts-container">
        <div class="card">
          <app-chart
            [type]="'bar'"
            [label]="'Agent Performance (Total Tickets Resolved)'"
            [data]="barData()"
            [labels]="barLabels()">
          </app-chart>
        </div>
      </div>

      <div class="message message--error" *ngIf="error()">{{ error() }}</div>
    </div>
  `,
  styles: [`
    .form { display: flex; gap: 12px; align-items: end; margin-bottom: 16px; flex-wrap: wrap; }
    .form__group { display: flex; flex-direction: column; }
    .charts-container { display: grid; gap: 16px; }
  `]
})
export class AgentPerformanceByYearComponent {
  private svc = inject(AgentPerformanceService);
  private fb = inject(FormBuilder);

  form = this.fb.group({
    year: [2024, [Validators.required, Validators.min(2000), Validators.max(2100)]]
  });

  // signals feeding ChartComponent
  private _labels = signal<string[]>(['Q1', 'Q2', 'Q3', 'Q4']);
  private _data = signal<number[]>([0, 0, 0, 0]);
  error = signal<string | null>(null);

  barLabels = computed(() => this._labels());
  barData = computed(() => this._data());

  load(): void {
    this.error.set(null);
    const year = this.form.value.year!;
    this.svc.getByYear(Number(year)).subscribe({
      next: res => {
        this._labels.set(res.labels);
        this._data.set(res.data);
      },
      error: err => {
        this.error.set(err?.error?.error || 'Unable to load data.');
        this._labels.set(['Q1','Q2','Q3','Q4']);
        this._data.set([0,0,0,0]);
      }
    });
  }

  // Optional: auto-load default on init
  constructor() {
    // initial sample load
    this.load();
  }
}

