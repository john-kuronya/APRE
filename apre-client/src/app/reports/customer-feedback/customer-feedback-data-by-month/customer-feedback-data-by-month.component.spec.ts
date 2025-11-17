import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CustomerFeedbackDataByMonthComponent } from './customer-feedback-data-by-month.component';
import { environment } from '../../../../environments/environment';

describe('CustomerFeedbackDataByMonthComponent', () => {
  let component: CustomerFeedbackDataByMonthComponent;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerFeedbackDataByMonthComponent, HttpClientTestingModule]
    }).compileComponents();

    const fixture = TestBed.createComponent(CustomerFeedbackDataByMonthComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create and load 12 months', () => {
    expect(component).toBeTruthy();
    expect(component.months.length).toBe(12);
  });

  it('should show error when form is invalid on submit', () => {
    component.monthForm.controls['month'].setValue(null);
    component.onSubmit();
    expect(component.errorMessage).toBe('Please select a month');
    expect(component.channels.length).toBe(0);
    expect(component.ratingAvg.length).toBe(0);
  });

  it('should populate channels and ratingAvg on successful API response', () => {
    component.monthForm.controls['month'].setValue(1 as any);
    component.onSubmit();

    const req = httpMock.expectOne(
      `${environment.apiBaseUrl}/reports/customer-feedback/channel-rating-by-month?month=1`
    );
    expect(req.request.method).toBe('GET');

    req.flush([
      {
        channels: ['Email', 'Phone'],
        ratingAvg: [[4.5], [3.8]]
      }
    ]);

    expect(component.errorMessage).toBe('');
    expect(component.channels).toEqual(['Email', 'Phone']);
    expect(component.ratingAvg).toEqual([[4.5], [3.8]] as any);
  });
});
