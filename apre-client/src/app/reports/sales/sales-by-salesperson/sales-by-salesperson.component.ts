import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { SalesService } from '../../../shared/services/sales.service';

@Component({
  selector: 'app-sales-by-salesperson',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ChartComponent],
  template: `
    <div class="toolbar">
      <label for="sp">Salesperson:</label>
      <input id="sp" class="input" [formControl]="salesperson" placeholder="e.g., Alice, Bob, Cara" />
      <button class="btn" (click)="load()">Get Data</button>
    </div>

    <div class="charts-container">
      <div class="card">
        <app-chart
          [type]="'bar'"
          [label]="'Revenue by Timeframe'"
          [data]="barData()"
          [labels]="barLabels()">
        </app-chart>
      </div>
      <div class="card">
        <app-chart
          [type]="'pie'"
          [label]="'Sales by Region'"
          [data]="pieData()"
          [labels]="pieLabels()">
        </app-chart>
      </div>
    </div>
  `,
  styles: [`
    .toolbar { display:flex; gap:8px; align-items:center; margin-bottom:16px; }
    .input { padding:6px 10px; }
    .btn { padding:6px 10px; }
    .charts-container { display:grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap:16px; }
    .card { padding:12px; border:1px solid #e5e7eb; border-radius:8px; background:#fff; }
  `]
})
export class SalesBySalespersonComponent implements OnInit {
  private sales = inject(SalesService);

  salesperson = new FormControl<string>('', { nonNullable: true });

  private _barLabels = signal<string[]>(['Monthly','Quarterly','Yearly']);
  private _barData   = signal<number[]>([0,0,0]);

  private _pieLabels = signal<string[]>(['North','South','East','West']);
  private _pieData   = signal<number[]>([0,0,0,0]);

  barLabels = computed(() => this._barLabels());
  barData   = computed(() => this._barData());
  pieLabels = computed(() => this._pieLabels());
  pieData   = computed(() => this._pieData());

  ngOnInit(): void {
    this.load(); // initial fetch (all salespeople)
  }

  load(): void {
    const sp = this.salesperson.value?.trim() || undefined;
    this.sales.getBySalesperson(sp).subscribe(res => {
      this._barLabels.set(res.labels);
      this._barData.set(res.data);
      this._pieLabels.set(res.region.labels);
      this._pieData.set(res.region.data);
    });
  }
}
