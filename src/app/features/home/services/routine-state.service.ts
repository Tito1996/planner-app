import { Injectable, signal } from '@angular/core';
import { DayKey, emptyDays, RoutineRow } from '../models/routine.model';

@Injectable({ providedIn: 'root' })
export class RoutineStateService {
  private static readonly API_URL = 'http://localhost:3001/api/routines';
  private nextId = 1;
  private persistTimer: ReturnType<typeof setTimeout> | null = null;

  readonly routines = signal<RoutineRow[]>([]);

  constructor() {
    void this.loadRoutines();
  }

  addRoutine(name: string): void {
    this.routines.update((rows) => [
      ...rows,
      { id: this.nextId++, name, days: emptyDays() },
    ]);
    this.schedulePersist();
  }

  updateRoutineName(id: number, name: string): void {
    this.routines.update((rows) =>
      rows.map((row) => (row.id === id ? { ...row, name } : row)),
    );
    this.schedulePersist();
  }

  removeRoutine(id: number): void {
    this.routines.update((rows) => rows.filter((row) => row.id !== id));
    this.schedulePersist();
  }

  toggleDay(routineId: number, day: DayKey, checked: boolean): void {
    this.routines.update((rows) =>
      rows.map((row) =>
        row.id === routineId
          ? { ...row, days: { ...row.days, [day]: checked } }
          : row,
      ),
    );
    this.schedulePersist();
  }

  private async loadRoutines(): Promise<void> {
    try {
      const response = await fetch(RoutineStateService.API_URL);
      if (!response.ok) {
        throw new Error(`No se pudo cargar rutinas (${response.status})`);
      }

      const data = (await response.json()) as unknown;
      const routines = this.normalizeRoutines(data);
      this.routines.set(routines);
      this.nextId = this.computeNextId(routines);
    } catch (error) {
      console.error('No se pudieron cargar las rutinas desde el JSON.', error);
    }
  }

  private schedulePersist(): void {
    if (this.persistTimer) {
      clearTimeout(this.persistTimer);
    }

    this.persistTimer = setTimeout(() => {
      void this.persistRoutines();
    }, 250);
  }

  private async persistRoutines(): Promise<void> {
    try {
      const response = await fetch(RoutineStateService.API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(this.routines()),
      });

      if (!response.ok) {
        throw new Error(`No se pudo guardar rutinas (${response.status})`);
      }
    } catch (error) {
      console.error('No se pudieron guardar las rutinas en el JSON.', error);
    }
  }

  private normalizeRoutines(data: unknown): RoutineRow[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data
      .map((item, index) => this.normalizeRoutine(item, index + 1))
      .filter((item): item is RoutineRow => item !== null);
  }

  private normalizeRoutine(value: unknown, fallbackId: number): RoutineRow | null {
    if (!value || typeof value !== 'object') {
      return null;
    }

    const candidate = value as Partial<RoutineRow>;
    const id = typeof candidate.id === 'number' ? candidate.id : fallbackId;
    const name = typeof candidate.name === 'string' ? candidate.name : `Rutina ${fallbackId}`;
    const days = { ...emptyDays(), ...(candidate.days ?? {}) };

    return { id, name, days };
  }

  private computeNextId(routines: RoutineRow[]): number {
    return routines.reduce((max, row) => Math.max(max, row.id), 0) + 1;
  }
}
