import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';

type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

interface RoutineRow {
  id: number;
  name: string;
  days: Record<DayKey, boolean>;
}

@Component({
  selector: 'app-rutine-week-control',
  imports: [MatTableModule, MatCheckboxModule],
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

  readonly displayedColumns = ['name', ...this.weekDays.map((day) => day.key)];

  readonly routines = signal<RoutineRow[]>([
    this.createRoutine(1, 'Pecho y triceps'),
    this.createRoutine(2, 'Espalda y biceps'),
    this.createRoutine(3, 'Pierna y core'),
  ]);

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
