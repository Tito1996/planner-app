import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import {
  RoutineFormMode,
  RutineConfiguration,
} from '../rutine-configuration/rutine-configuration';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface RoutineRow {
  id: number;
  name: string;
  days: Record<DayKey, boolean>;
}

@Component({
  selector: 'app-rutine-week-control',
  imports: [MatTableModule, MatCheckboxModule, MatButtonModule, MatIconModule, RutineConfiguration],
  templateUrl: './rutine-week-control.html',
  styleUrl: './rutine-week-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutineWeekControl {
  readonly weekDays: Array<{ key: DayKey; label: string }> = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miercoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sabado' },
    { key: 'sunday', label: 'Domingo' },
  ];

  readonly displayedColumns = ['name', ...this.weekDays.map((day) => day.key), 'actions'];

  readonly routines = signal<RoutineRow[]>([
    this.createRoutine(1, 'Pecho y triceps'),
    this.createRoutine(2, 'Espalda y biceps'),
    this.createRoutine(3, 'Pierna y core'),
  ]);

  readonly activeFormMode = signal<RoutineFormMode | null>(null);
  readonly editingRoutineId = signal<number | null>(null);
  readonly nextRoutineId = signal(4);

  readonly isConfigurationVisible = computed(() => this.activeFormMode() !== null);
  readonly editingRoutineName = computed(() => {
    const editingId = this.editingRoutineId();
    if (editingId === null) {
      return '';
    }

    const routine = this.routines().find((item) => item.id === editingId);
    return routine?.name ?? '';
  });

  isChecked(routineId: number, day: DayKey): boolean {
    const routine = this.routines().find((item) => item.id === routineId);
    return routine?.days[day] ?? false;
  }

  toggleDay(routineId: number, day: DayKey, checked: boolean): void {
    this.routines.update((rows) =>
      rows.map((row) =>
        row.id === routineId
          ? {
              ...row,
              days: {
                ...row.days,
                [day]: checked,
              },
            }
          : row,
      ),
    );
  }

  openCreateRoutineForm(): void {
    this.activeFormMode.set('create');
    this.editingRoutineId.set(null);
  }

  startEdit(routineId: number): void {
    const routine = this.routines().find((item) => item.id === routineId);
    if (!routine) {
      return;
    }

    this.activeFormMode.set('edit');
    this.editingRoutineId.set(routine.id);
  }

  onRoutineSaved(name: string): void {
    if (this.activeFormMode() === 'create') {
      const newId = this.nextRoutineId();
      this.routines.update((rows) => [...rows, this.createRoutine(newId, name)]);
      this.nextRoutineId.update((value) => value + 1);
      this.closeForm();
      return;
    }

    const editingId = this.editingRoutineId();
    if (editingId === null) {
      this.closeForm();
      return;
    }

    this.routines.update((rows) =>
      rows.map((row) => (row.id === editingId ? { ...row, name } : row)),
    );
    this.closeForm();
  }

  closeForm(): void {
    this.activeFormMode.set(null);
    this.editingRoutineId.set(null);
  }

  removeRoutine(routineId: number): void {
    this.routines.update((rows) => rows.filter((row) => row.id !== routineId));

    if (this.editingRoutineId() === routineId) {
      this.closeForm();
    }
  }

  private createRoutine(id: number, name: string): RoutineRow {
    return {
      id,
      name,
      days: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false,
      },
    };
  }
}
