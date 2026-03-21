import { Component, effect, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

export type RoutineFormMode = 'create' | 'edit';

@Component({
  selector: 'app-rutine-configuration',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './rutine-configuration.html',
  styleUrl: './rutine-configuration.scss',
})
export class RutineConfiguration {
  readonly mode = input.required<RoutineFormMode>();
  readonly initialName = input('');

  readonly routineSaved = output<string>();
  readonly formCancelled = output<void>();

  readonly nameControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(60)],
  });

  constructor() {
    effect(() => {
      this.nameControl.setValue(this.initialName(), { emitEvent: false });
    });
  }

  submit(): void {
    const routineName = this.nameControl.value.trim();
    if (!routineName) {
      this.nameControl.markAsTouched();
      return;
    }

    this.routineSaved.emit(routineName);
  }

  cancel(): void {
    this.formCancelled.emit();
  }
}
