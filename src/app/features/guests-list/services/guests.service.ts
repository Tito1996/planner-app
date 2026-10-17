import { Injectable, computed, signal } from '@angular/core';
import { GUESTS_STORAGE_KEY, Guest, GuestKpis, INITIAL_GUESTS } from '../models/guest.model';

type GuestData = Omit<Guest, 'id' | 'linkedIds'>;

@Injectable({ providedIn: 'root' })
export class GuestsService {
  private readonly _guests = signal<Guest[]>(this.load());

  readonly guests = this._guests.asReadonly();

  readonly groups = computed(() => [
    ...new Set(this._guests().map((g) => g.group).filter(Boolean)),
  ]);

  readonly kpis = computed<GuestKpis>(() => {
    const guests = this._guests();
    const visited = new Set<string>();
    let totalInvitations = 0;
    let deliveredInvitations = 0;

    for (const guest of guests) {
      if (visited.has(guest.id)) continue;
      totalInvitations++;
      const cluster = this.getConnectedCluster(guest.id, guests);
      cluster.forEach((id) => visited.add(id));
      if (cluster.some((id) => guests.find((g) => g.id === id)?.delivered)) {
        deliveredInvitations++;
      }
    }

    return {
      totalGuests: guests.length,
      totalInvitations,
      deliveredInvitations,
      pendingInvitations: totalInvitations - deliveredInvitations,
      percentage:
        totalInvitations > 0 ? Math.round((deliveredInvitations / totalInvitations) * 100) : 0,
    };
  });

  /** Sets delivery status on the guest and every guest sharing its invitation. Returns the cluster size. */
  setDelivered(guestId: string, delivered: boolean): number {
    const cluster = this.getConnectedCluster(guestId, this._guests());
    this.update((guests) => guests.map((g) => (cluster.includes(g.id) ? { ...g, delivered } : g)));
    return cluster.length;
  }

  add(data: GuestData): Guest {
    const guest: Guest = {
      ...data,
      group: data.group || 'General',
      id: Date.now().toString(),
      linkedIds: [],
    };
    this.update((guests) => [...guests, guest]);
    return guest;
  }

  /** Edits guest data; a delivery status change is propagated to linked guests. Returns affected guests. */
  edit(id: string, data: GuestData): number {
    const current = this._guests().find((g) => g.id === id);
    if (!current) return 0;
    this.update((guests) =>
      guests.map((g) => (g.id === id ? { ...g, ...data, delivered: current.delivered } : g)),
    );
    return current.delivered !== data.delivered ? this.setDelivered(id, data.delivered) : 1;
  }

  remove(id: string): void {
    this.update((guests) =>
      guests
        .filter((g) => g.id !== id)
        .map((g) => ({ ...g, linkedIds: g.linkedIds.filter((l) => l !== id) })),
    );
  }

  link(id1: string, id2: string): void {
    const guests = this._guests();
    const g1 = guests.find((g) => g.id === id1);
    const g2 = guests.find((g) => g.id === id2);
    if (!g1 || !g2 || id1 === id2) return;
    const delivered = g1.delivered || g2.delivered;
    this.update((all) =>
      all.map((g) => {
        if (g.id === id1 && !g.linkedIds.includes(id2)) return { ...g, linkedIds: [...g.linkedIds, id2] };
        if (g.id === id2 && !g.linkedIds.includes(id1)) return { ...g, linkedIds: [...g.linkedIds, id1] };
        return g;
      }),
    );
    this.setDelivered(id1, delivered);
  }

  unlink(id1: string, id2: string): void {
    this.update((guests) =>
      guests.map((g) => {
        if (g.id === id1) return { ...g, linkedIds: g.linkedIds.filter((l) => l !== id2) };
        if (g.id === id2) return { ...g, linkedIds: g.linkedIds.filter((l) => l !== id1) };
        return g;
      }),
    );
  }

  reset(): void {
    this.update(() => this.initial());
  }

  export(): string {
    return JSON.stringify(this._guests(), null, 2);
  }

  /** Replaces the list with the imported JSON. Returns false when the format is invalid; throws on bad JSON. */
  import(json: string): boolean {
    const data: unknown = JSON.parse(json);
    if (!Array.isArray(data)) return false;
    this.update(() => (data as Partial<Guest>[]).map((g) => this.normalize(g)));
    return true;
  }

  private getConnectedCluster(startId: string, guests: Guest[]): string[] {
    const visited = new Set<string>([startId]);
    const queue = [startId];
    while (queue.length > 0) {
      const currentId = queue.shift();
      const current = guests.find((g) => g.id === currentId);
      for (const neighbor of current?.linkedIds ?? []) {
        if (!visited.has(neighbor) && guests.some((g) => g.id === neighbor)) {
          visited.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    return [...visited];
  }

  private normalize(g: Partial<Guest>): Guest {
    return {
      id: String(g.id ?? Date.now() + Math.random()),
      firstName: g.firstName ?? '',
      lastName: g.lastName ?? '',
      phone: g.phone ?? '',
      group: g.group ?? '',
      delivered: !!g.delivered,
      notes: g.notes ?? '',
      linkedIds: Array.isArray(g.linkedIds) ? g.linkedIds : [],
    };
  }

  private initial(): Guest[] {
    return INITIAL_GUESTS.map((g) => ({ ...g, linkedIds: [...g.linkedIds] }));
  }

  private update(fn: (guests: Guest[]) => Guest[]): void {
    this._guests.update(fn);
    localStorage.setItem(GUESTS_STORAGE_KEY, JSON.stringify(this._guests()));
  }

  private load(): Guest[] {
    try {
      const stored = localStorage.getItem(GUESTS_STORAGE_KEY);
      if (stored) {
        const data: unknown = JSON.parse(stored);
        if (Array.isArray(data)) return (data as Partial<Guest>[]).map((g) => this.normalize(g));
      }
    } catch {
      // fall back to initial data
    }
    return this.initial();
  }
}
