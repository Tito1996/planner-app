import { Injectable } from '@angular/core';
import {
  CalculationResult,
  HOURS_PER_DAY,
  ProjectAllocation,
  ProjectInput,
} from '../models/jira-calculator.model';

@Injectable({ providedIn: 'root' })
export class JiraCalculatorService {
  /**
   * Distributes the effective hours among projects by percentage.
   * Uses the largest remainder method so the sum matches exactly.
   * Returns null if vacations exceed total hours.
   */
  calculate(
    totalHours: number,
    vacationDays: number,
    projects: ProjectInput[],
  ): CalculationResult | null {
    const vacationHours = vacationDays * HOURS_PER_DAY;
    const effectiveHours = totalHours - vacationHours;

    if (effectiveHours < 0) {
      return null;
    }

    const drafts = projects.map((project, index) => {
      const exact = (effectiveHours * project.percentage) / 100;
      const hours = Math.floor(exact);
      return { index, hours, decimal: exact - hours };
    });

    let difference = effectiveHours - drafts.reduce((sum, d) => sum + d.hours, 0);

    [...drafts]
      .sort((a, b) => b.decimal - a.decimal)
      .forEach((draft) => {
        if (difference > 0) {
          draft.hours++;
          difference--;
        }
      });

    const allocations: ProjectAllocation[] = projects.map((project, i) => {
      const hours = drafts[i].hours;
      return {
        ...project,
        hours,
        days: Math.floor(hours / HOURS_PER_DAY),
        remainingHours: hours % HOURS_PER_DAY,
      };
    });

    return {
      totalHours,
      vacationDays,
      vacationHours,
      effectiveHours,
      allocations,
      projectsHours: allocations.reduce((sum, a) => sum + a.hours, 0),
    };
  }
}
