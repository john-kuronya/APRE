import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartComponent } from '../../../shared/chart/chart.component';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-customer-feedback-data-by-month',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, ChartComponent],
  template: `
    <h1>Customer Feedback by Month</h1>

    <div class="charts-container">

      <!-- Card 1: month selection -->
      <div class="card">
        <form class="form" [formGroup]="monthForm" (ngSubmit)="onSubmit()">

          @if (errorMessage) {
            <div class="message message--error">
              {{ errorMessage }}
            </div>
          }

          <div class="form__group">
            <label class="label" for="month">Month</label>
            <select
              class="select"
              id="month"
              name="month"
              formControlName="month">
              <!-- Placeholder option to prompt user to select a month -->
              <option value="" disabled>Select month</option>
              @for (month of months; track month.value) {
                <option [value]="month.value">{{ month.name }}</option>
              }
            </select>
          </div>

          <div class="form__actions">
            <button class="button button--primary" type="submit">
              Submit
            </button>
          </div>
        </form>
      </div>

      <!-- Card 2: chart (only when data is available) -->
      @if (channels.length && ratingAvg.length) {
        <div class="card">
          <app-chart
            [type]="'bar'"
            [label]="'Customer Feedback by Channel'"
            [data]="ratingAvg"
            [labels]="channels">
          </app-chart>
        </div>
      }
    </div>
  `,
  styles: `
    .charts-container {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .card {
      width: 50%;
      margin: 20px 0;
    }
  `
})
export class CustomerFeedbackDataByMonthComponent {
  channels: string[] = [];
  ratingAvg: number[] = [];
  months: { value: number; name: string }[] = [];
  errorMessage = '';

  monthForm = this.fb.group({
    month: [null, Validators.required]
  });

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.months = this.loadMonths();
  }

  loadMonths() {
    return [
      { value: 1, name: 'January' },
      { value: 2, name: 'February' },
      { value: 3, name: 'March' },
      { value: 4, name: 'April' },
      { value: 5, name: 'May' },
      { value: 6, name: 'June' },
      { value: 7, name: 'July' },
      { value: 8, name: 'August' },
      { value: 9, name: 'September' },
      { value: 10, name: 'October' },
      { value: 11, name: 'November' },
      { value: 12, name: 'December' }
    ];
  }

  onSubmit() {
    if (this.monthForm.invalid) {
      this.errorMessage = 'Please select a month';
      this.channels = [];
      this.ratingAvg = [];
      return;
    }

    const month = this.monthForm.controls['month'].value;

    // IMPORTANT: This path matches your existing route + typical API base:
    // environment.apiBaseUrl is usually "http://localhost:3000/api"
    this.http
      .get<any[]>(`${environment.apiBaseUrl}/reports/customer-feedback/channel-rating-by-month?month=${month}`)
      .subscribe({
        next: (data) => {
          if (!data.length) {
            const selectedMonth = this.months.find(m => m.value === Number(month));
            this.errorMessage = `No data found for ${selectedMonth?.name ?? 'selected month'}`;
            this.channels = [];
            this.ratingAvg = [];
            return;
          }

          this.channels = data[0].channels;
          this.ratingAvg = data[0].ratingAvg;

          this.errorMessage = '';
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error fetching customer feedback data by month:', err);
          this.errorMessage = 'An error occurred while fetching data.';
          this.channels = [];
          this.ratingAvg = [];
        }
      });
  }
}
