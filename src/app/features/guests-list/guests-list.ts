import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DeliveryFilter, Guest } from './models/guest.model';
import { GuestsService } from './services/guests.service';

type ToastType = 'info' | 'success' | 'error';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
  visible: boolean;
}

@Component({
  selector: 'app-guests-list',
  imports: [ReactiveFormsModule],
  templateUrl: './guests-list.html',
  styleUrl: './guests-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestsList {
  private readonly service = inject(GuestsService);
  private toastSeq = 0;

  protected readonly guests = this.service.guests;
  protected readonly groups = this.service.groups;
  protected readonly kpis = this.service.kpis;

  protected readonly search = signal('');
  protected readonly statusFilter = signal<DeliveryFilter>('ALL');
  protected readonly groupFilter = signal('ALL');

  protected readonly guestModalOpen = signal(false);
  protected readonly editingId = signal<string | null>(null);
  protected readonly detailsId = signal<string | null>(null);
  protected readonly linkTarget = signal('');
  protected readonly toasts = signal<Toast[]>([]);

  protected readonly guestForm = new FormGroup({
    firstName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    lastName: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    group: new FormControl('', { nonNullable: true }),
    delivered: new FormControl(false, { nonNullable: true }),
    notes: new FormControl('', { nonNullable: true }),
  });

  protected readonly filteredGuests = computed(() => {
    const term = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    const group = this.groupFilter();
    return this.guests().filter((g) => {
      const fullName = `${g.firstName} ${g.lastName}`.toLowerCase();
      const matchesSearch = fullName.includes(term) || (!!g.phone && g.phone.includes(term));
      const matchesStatus =
        status === 'ALL' || (status === 'DELIVERED' ? g.delivered : !g.delivered);
      const matchesGroup = group === 'ALL' || g.group === group;
      return matchesSearch && matchesStatus && matchesGroup;
    });
  });

  protected readonly detailsGuest = computed(
    () => this.guests().find((g) => g.id === this.detailsId()) ?? null,
  );

  protected readonly detailsLinked = computed(() => {
    const guest = this.detailsGuest();
    return guest ? this.linkedGuests(guest) : [];
  });

  protected readonly linkableGuests = computed(() => {
    const guest = this.detailsGuest();
    return guest
      ? this.guests().filter((g) => g.id !== guest.id && !guest.linkedIds.includes(g.id))
      : [];
  });

  protected readonly modalTitle = computed(() =>
    this.editingId() ? 'Editar Invitado' : 'Nuevo Invitado',
  );

  protected linkedGuests(guest: Guest): Guest[] {
    return guest.linkedIds
      .map((id) => this.guests().find((g) => g.id === id))
      .filter((g): g is Guest => !!g);
  }

  protected initials(guest: Guest): string {
    return `${guest.firstName.charAt(0)}${guest.lastName.charAt(0)}`;
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onStatusFilter(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as DeliveryFilter);
  }

  protected onGroupFilter(event: Event): void {
    this.groupFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onLinkTarget(event: Event): void {
    this.linkTarget.set((event.target as HTMLSelectElement).value);
  }

  protected toggleDelivered(guest: Guest): void {
    this.setDelivered(guest.id, !guest.delivered);
  }

  protected setDelivered(id: string, delivered: boolean): void {
    const count = this.service.setDelivered(id, delivered);
    this.showToast(
      count > 1
        ? `Se ha actualizado el estado de ${count} invitados vinculados.`
        : 'Estado actualizado correctamente.',
      count > 1 ? 'success' : 'info',
    );
  }

  protected openGuestModal(guestId: string | null = null): void {
    const guest = guestId ? this.guests().find((g) => g.id === guestId) : undefined;
    this.editingId.set(guest?.id ?? null);
    this.guestForm.reset({
      firstName: guest?.firstName ?? '',
      lastName: guest?.lastName ?? '',
      phone: guest?.phone ?? '',
      group: guest?.group ?? '',
      delivered: guest?.delivered ?? false,
      notes: guest?.notes ?? '',
    });
    this.guestModalOpen.set(true);
  }

  protected closeGuestModal(): void {
    this.guestModalOpen.set(false);
  }

  protected saveGuest(): void {
    if (this.guestForm.invalid) {
      this.guestForm.markAllAsTouched();
      return;
    }
    const raw = this.guestForm.getRawValue();
    const data = {
      firstName: raw.firstName.trim(),
      lastName: raw.lastName.trim(),
      phone: raw.phone.trim(),
      group: raw.group.trim(),
      delivered: raw.delivered,
      notes: raw.notes.trim(),
    };
    const id = this.editingId();
    if (id) {
      const count = this.service.edit(id, data);
      if (count > 1) {
        this.showToast(`Se ha actualizado el estado de ${count} invitados vinculados.`, 'success');
      }
    } else {
      this.service.add(data);
      this.showToast('Nuevo invitado añadido correctamente.', 'success');
    }
    this.closeGuestModal();
  }

  protected openDetails(id: string): void {
    this.linkTarget.set('');
    this.detailsId.set(id);
  }

  protected closeDetails(): void {
    this.detailsId.set(null);
  }

  protected editFromDetails(): void {
    const id = this.detailsId();
    if (!id) return;
    this.closeDetails();
    this.openGuestModal(id);
  }

  protected addLink(): void {
    const id = this.detailsId();
    const target = this.guests().find((g) => g.id === this.linkTarget());
    if (!id || !target) return;
    this.service.link(id, target.id);
    this.linkTarget.set('');
    this.showToast(`Invitación vinculada con ${target.firstName}`, 'success');
  }

  protected removeLink(id1: string, id2: string): void {
    this.service.unlink(id1, id2);
    this.showToast('Acompañante desvinculado de la invitación.', 'info');
  }

  protected deleteGuest(guest: Guest): void {
    if (!confirm(`¿Estás seguro de que quieres eliminar a ${guest.firstName} ${guest.lastName}?`)) {
      return;
    }
    if (this.detailsId() === guest.id) this.closeDetails();
    this.service.remove(guest.id);
    this.showToast('Invitado eliminado de la lista.', 'info');
  }

  protected exportJSON(): void {
    const blob = new Blob([this.service.export()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `invitados_boda_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    this.showToast('Lista exportada con éxito.', 'success');
  }

  protected importJSON(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        if (this.service.import(String(reader.result))) {
          this.showToast('Datos importados correctamente.', 'success');
        } else {
          this.showToast('El archivo no contiene un formato de lista válido.', 'error');
        }
      } catch {
        this.showToast('Error al leer el archivo JSON.', 'error');
      }
    };
    reader.readAsText(file);
    input.value = '';
  }

  protected resetData(): void {
    if (
      confirm(
        '¿Quieres reiniciar la lista de invitados con los datos de ejemplo iniciales? Perderás los cambios actuales.',
      )
    ) {
      this.service.reset();
      this.showToast('Se han restaurado los datos iniciales de prueba.', 'info');
    }
  }

  protected toastClass(type: ToastType): string {
    return type === 'success'
      ? 'bg-eucalyptus-700 text-white'
      : type === 'error'
        ? 'bg-red-600 text-white'
        : 'bg-slate-800 text-white';
  }

  private showToast(message: string, type: ToastType = 'info'): void {
    const id = ++this.toastSeq;
    this.toasts.update((t) => [...t, { id, message, type, visible: true }]);
    setTimeout(() => {
      this.toasts.update((t) => t.map((x) => (x.id === id ? { ...x, visible: false } : x)));
      setTimeout(() => this.toasts.update((t) => t.filter((x) => x.id !== id)), 300);
    }, 3000);
  }
}
