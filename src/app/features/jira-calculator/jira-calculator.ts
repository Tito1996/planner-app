import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { CalculationResult, HOURS_PER_DAY } from './models/jira-calculator.model';
import { JiraCalculatorService } from './services/jira-calculator.service';

export function totalPercentageValidator(control: AbstractControl): ValidationErrors | null {
  const projects = (control.get('projects') as FormArray | null)?.controls ?? [];
  const total = projects.reduce((sum, p) => sum + (Number(p.get('percentage')?.value) || 0), 0);
  return total > 0 ? null : { totalPercentageZero: true };
}

@Component({
  selector: 'app-jira-calculator',
  imports: [
    DecimalPipe,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatTableModule,
  ],
  templateUrl: './jira-calculator.html',
  styleUrl: './jira-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JiraCalculator {
  private readonly calculator = inject(JiraCalculatorService);

  protected readonly hoursPerDay = HOURS_PER_DAY;
  protected readonly displayedColumns = ['name', 'percentage', 'hours', 'days', 'remainingHours'];

  protected readonly form = new FormGroup(
    {
      totalHours: new FormControl<number | null>(160, [Validators.required, Validators.min(0)]),
      vacationDays: new FormControl<number | null>(0, [Validators.required, Validators.min(0)]),
      projects: new FormArray([
        this.createProject('MAX WIDGET', 30),
        this.createProject('MAX SENIORS', 40),
        this.createProject('MAX OPEX', 26),
        this.createProject('IA', 4),
      ]),
    },
    { validators: totalPercentageValidator },
  );

  protected readonly result = signal<CalculationResult | null>(null);
  protected readonly error = signal<string | null>(null);

  protected get projects(): FormArray<FormGroup> {
    return this.form.controls.projects as unknown as FormArray<FormGroup>;
  }

  protected calculate(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.result.set(null);
      this.error.set(null);
      return;
    }

    const value = this.form.getRawValue();
    const result = this.calculator.calculate(
      Number(value.totalHours),
      Number(value.vacationDays),
      value.projects.map((p) => ({ name: String(p.name).trim(), percentage: Number(p.percentage) })),
    );

    if (!result) {
      this.result.set(null);
      this.error.set('Las vacaciones superan las horas totales.');
      return;
    }

    this.error.set(null);
    this.result.set(result);
  }

  private createProject(name: string, percentage: number) {
    return new FormGroup({
      name: new FormControl(name, [
        Validators.required,
        (c: AbstractControl): ValidationErrors | null =>
          String(c.value ?? '').trim() ? null : { required: true },
      ]),
      percentage: new FormControl<number | null>(percentage, [
        Validators.required,
        Validators.min(0),
      ]),
    });
  }
}
