import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  CalculationResult,
  HOURS_PER_DAY,
  ProjectInput,
} from './models/jira-calculator.model';
import { JiraCalculatorService } from './services/jira-calculator.service';

@Component({
  selector: 'app-jira-calculator',
  imports: [FormsModule],
  templateUrl: './jira-calculator.html',
  styleUrl: './jira-calculator.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JiraCalculator {
  private readonly calculator = inject(JiraCalculatorService);

  protected readonly hoursPerDay = HOURS_PER_DAY;

  protected readonly totalHours = signal(160);
  protected readonly vacationDays = signal(0);
  protected readonly projects = signal<ProjectInput[]>([
    { name: 'MAX WIDGET', percentage: 30 },
    { name: 'MAX SENIORS', percentage: 40 },
    { name: 'MAX OPEX', percentage: 26 },
    { name: 'IA', percentage: 4 },
  ]);

  protected readonly result = signal<CalculationResult | null>(null);
  protected readonly error = signal<string | null>(null);

  protected updateProject(index: number, changes: Partial<ProjectInput>): void {
    this.projects.update((list) =>
      list.map((project, i) => (i === index ? { ...project, ...changes } : project)),
    );
  }

  protected calculate(): void {
    const result = this.calculator.calculate(
      Number(this.totalHours()) || 0,
      Number(this.vacationDays()) || 0,
      this.projects().map((p) => ({ ...p, percentage: Number(p.percentage) || 0 })),
    );

    if (!result) {
      this.result.set(null);
      this.error.set('Las vacaciones superan las horas totales.');
      return;
    }

    this.error.set(null);
    this.result.set(result);
  }
}
