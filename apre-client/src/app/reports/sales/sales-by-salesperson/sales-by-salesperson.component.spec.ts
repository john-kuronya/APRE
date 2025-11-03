import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { SalesBySalespersonComponent } from './sales-by-salesperson.component';
import { SalesService } from '../../../shared/services/sales.service';

describe('SalesBySalespersonComponent', () => {
  let getSpy: jasmine.Spy;

  beforeEach(async () => {
    const mock = {
      getBySalesperson: () => of({
        labels: ['Monthly','Quarterly','Yearly'],
        data: [10000, 20000, 30000],
        region: { labels: ['North','South','East','West'], data: [3000,2000,1000,4000] }
      })
    } as Partial<SalesService>;

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, SalesBySalespersonComponent],
      providers: [{ provide: SalesService, useValue: mock }]
    }).compileComponents();

    getSpy = spyOn(TestBed.inject(SalesService), 'getBySalesperson').and.callThrough();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(SalesBySalespersonComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    expect(cmp).toBeTruthy();
  });

  it('calls service without salesperson on init', () => {
    const fixture = TestBed.createComponent(SalesBySalespersonComponent);
    fixture.detectChanges();
    expect(getSpy).toHaveBeenCalledWith(undefined);
  });

  it('populates chart inputs from response', () => {
    const fixture = TestBed.createComponent(SalesBySalespersonComponent);
    const cmp = fixture.componentInstance;
    fixture.detectChanges();
    expect(cmp.barData()).toEqual([10000,20000,30000]);
    expect(cmp.pieData()).toEqual([3000,2000,1000,4000]);
  });
});
