import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JiraCalculator } from './jira-calculator';
import { JiraCalculatorService } from './services/jira-calculator.service';

describe('JiraCalculator', () => {
  let component: JiraCalculator;
  let fixture: ComponentFixture<JiraCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JiraCalculator],
    }).compileComponents();

    fixture = TestBed.createComponent(JiraCalculator);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('JiraCalculatorService', () => {
  const service = new JiraCalculatorService();
  const projects = [
    { name: 'A', percentage: 30 },
    { name: 'B', percentage: 40 },
    { name: 'C', percentage: 26 },
    { name: 'D', percentage: 4 },
  ];

  it('distributes exactly the effective hours', () => {
    const result = service.calculate(160, 1, projects);
    expect(result?.effectiveHours).toBe(152);
    expect(result?.projectsHours).toBe(152);
  });

  it('returns null when vacations exceed total hours', () => {
    expect(service.calculate(8, 2, projects)).toBeNull();
  });
});
