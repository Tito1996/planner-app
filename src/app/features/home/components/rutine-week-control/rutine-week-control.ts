import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import {
  RoutineFormMode,
  RutineConfiguration,
} from '../rutine-configuration/rutine-configuration';
import { DayKey, WEEK_DAYS } from '../../models/routine.model';
import { RoutineStateService } from '../../services/routine-state.service';

@Component({
  selector: 'app-rutine-week-control',
  imports: [MatTableModule, MatCheckboxModule, MatButtonModule, MatIconModule, RutineConfiguration],
  templateUrl: './rutine-week-control.html',
  styleUrl: './rutine-week-control.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RutineWeekControl {
  private readonly state = inject(RoutineStateService);

  readonly weekDays = WEEK_DAYS;
  readonly displayedColumns = ['name', ...WEEK_DAYS.map((day) => day.key), 'actions'];
  readonly routines = this.state.routines;

  readonly activeFormMode = signal<RoutineFormMode | null>(null);
  readonly editingRoutineId = signal<number | null>(null);

  readonly isConfigurationVisible = computed(() => this.activeFormMode() !== null);
  readonly editingRoutineName = computed(() => {
    const editingId = this.editingRoutineId();
    if (editingId === null) return '';
    return this.routines().find((r) => r.id === editingId)?.name ?? '';
  });

  isChecked(routineId: number, day: DayKey): boolean {
    return this.routines().find((r) => r.id === routineId)?.days[day] ?? false;
  }

  toggleDay(routineId: number, day: DayKey, checked: boolean): void {
    this.state.toggleDay(routineId, day, checked);
  }

  openCreateRoutineForm(): void {
    this.activeFormMode.set('create');
    this.editingRoutineId.set(null);
  }

  startEdit(routineId: number): void {
    const routine = this.routines().find((r) => r.id === routineId);
    if (!routine) return;
    this.activeFormMode.set('edit');
    this.editingRoutineId.set(routine.id);
  }

  onRoutineSaved(name: string): void {
    if (this.activeFormMode() === 'create') {
      this.state.addRoutine(name);
    } else {
      const editingId = this.editingRoutineId();
      if (editingId !== null) {
        this.state.updateRoutineName(editingId, name);
      }
    }
    this.closeForm();
  }

  closeForm(): void {
    this.activeFormMode.set(null);
    this.editingRoutineId.set(null);
  }

  removeRoutine(routineId: number): void {
    this.state.removeRoutine(routineId);
    if (this.editingRoutineId() === routineId) {
      this.closeForm();
    }
  }

}
