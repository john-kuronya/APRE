import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../../../..//environments/environment';
import { AgentPerformanceByYearComponent } from './agent-performance-by-year.component';

describe('AgentPerformanceByYearComponent', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentPerformanceByYearComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()]
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  it('loads default 2024 on init and binds labels/data', () => {
    const fixture = TestBed.createComponent(AgentPerformanceByYearComponent);
    fixture.detectChanges();

    const req = http.expectOne(`${environment.apiBaseUrl}/agent-performance/by-year?year=2024`);
    expect(req.request.method).toBe('GET');
    req.flush({ labels: ['Q1','Q2','Q3','Q4'], data: [160,155,170,180] });

    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    // crude check: expect the chart to be present; if the ChartComponent renders canvas/svg
    expect(html.textContent).toContain('Agent Performance (Total Tickets Resolved)');
  });

  it('updates when Get Data is clicked', () => {
    const fixture = TestBed.createComponent(AgentPerformanceByYearComponent);
    fixture.detectChanges();
    // initial
    http.expectOne(`${environment.apiBaseUrl}/agent-performance/by-year?year=2024`)
        .flush({ labels: ['Q1','Q2','Q3','Q4'], data: [160,155,170,180] });

    // set year to 2025 and submit
    const comp = fixture.componentInstance;
    comp.form.setValue({ year: 2025 });
    comp.load();

    const req2 = http.expectOne(`${environment.apiBaseUrl}/agent-performance/by-year?year=2025`);
    expect(req2.request.method).toBe('GET');
    req2.flush({ labels: ['Q1','Q2','Q3','Q4'], data: [175,182,190,205] });

    fixture.detectChanges();
    // expect updated data in component signals
    expect(comp['barData']()).toEqual([175,182,190,205]);
  });

  it('shows error and resets to zeros when API fails', () => {
    const fixture = TestBed.createComponent(AgentPerformanceByYearComponent);
    fixture.detectChanges();
    const req = http.expectOne(`${environment.apiBaseUrl}/agent-performance/by-year?year=2024`);
    req.flush({ error: 'No data' }, { status: 404, statusText: 'Not Found' });

    fixture.detectChanges();
    const comp = fixture.componentInstance;
    expect(comp.error()).toBeTruthy();
    expect(comp['barData']()).toEqual([0,0,0,0]);
  });
});

