import { Injectable, signal } from '@angular/core';
import { DayKey, emptyDays, RoutineRow } from '../models/routine.model';

@Injectable({ providedIn: 'root' })
export class RoutineStateService {
  private nextId = 4;

  readonly routines = signal<RoutineRow[]>([
    { id: 1, name: 'Pecho y triceps', days: emptyDays() },
    { id: 2, name: 'Espalda y biceps', days: emptyDays() },
    { id: 3, name: 'Pierna y core', days: emptyDays() },
  ]);

  addRoutine(name: string): void {
    this.routines.update((rows) => [
      ...rows,
      { id: this.nextId++, name, days: emptyDays() },
    ]);
  }

  updateRoutineName(id: number, name: string): void {
    this.routines.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, name } : row)),
    );
  }

  removeRoutine(id: number): void {
    this.routines.update((rows) => rows.filter((row) => row.id !== id));
  }

  toggleDay(routineId: number, day: DayKey, checked: boolean): void {
    this.routines.update((rows) =>
      rows.map((row) =>
        row.id === routineId
          ? { ...row, days: { ...row.days, [day]: checked } }
          : row,
      ),
    );
  }
}
