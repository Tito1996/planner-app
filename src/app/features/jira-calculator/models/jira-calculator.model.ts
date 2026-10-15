export const HOURS_PER_DAY = 8;

export interface ProjectInput {
  name: string;
  percentage: number;
}

export interface ProjectAllocation extends ProjectInput {
  hours: number;
  days: number;
  remainingHours: number;
}

export interface CalculationResult {
  totalHours: number;
  vacationDays: number;
  vacationHours: number;
  effectiveHours: number;
  allocations: ProjectAllocation[];
  projectsHours: number;
}
