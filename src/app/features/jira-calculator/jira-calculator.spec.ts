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

  it('is valid by default and calculates', () => {
    expect(component['form'].valid).toBe(true);
    component['calculate']();
    expect(component['result']()?.projectsHours).toBe(160);
  });

  it('blocks calculation for invalid inputs', () => {
    const form = component['form'];
    form.controls.totalHours.setValue(-1);
    component['calculate']();
    expect(form.controls.totalHours.hasError('min')).toBe(true);
    expect(component['result']()).toBeNull();

    form.controls.totalHours.setValue(160);
    form.controls.vacationDays.setValue(-2);
    expect(form.controls.vacationDays.hasError('min')).toBe(true);

    form.controls.vacationDays.setValue(0);
    component['projects'].at(0).controls['name'].setValue('  ');
    expect(form.invalid).toBe(true);
    component['projects'].at(0).controls['name'].setValue('A');

    component['projects'].at(0).controls['percentage'].setValue(-5);
    expect(form.invalid).toBe(true);
  });

  it('flags a zero total percentage', () => {
    component['projects'].controls.forEach((p) => p.controls['percentage'].setValue(0));
    component['calculate']();
    expect(component['form'].hasError('totalPercentageZero')).toBe(true);
    expect(component['result']()).toBeNull();
  });

  it('shows error when vacations exceed total hours', () => {
    component['form'].controls.totalHours.setValue(8);
    component['form'].controls.vacationDays.setValue(2);
    component['calculate']();
    expect(component['error']()).toBeTruthy();
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
