export interface Guest {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  group: string;
  delivered: boolean;
  notes: string;
  linkedIds: string[];
}

export type DeliveryFilter = 'ALL' | 'DELIVERED' | 'PENDING';

export interface GuestKpis {
  totalGuests: number;
  totalInvitations: number;
  deliveredInvitations: number;
  pendingInvitations: number;
  percentage: number;
}

export const GUESTS_STORAGE_KEY = 'wedding_guests_app_data_v1';

export const INITIAL_GUESTS: readonly Guest[] = [
  { id: '1', firstName: 'Laura', lastName: 'García Fernández', phone: '611 223 344', group: 'Amigos Novia', delivered: true, notes: 'Menú celíaco', linkedIds: ['2'] },
  { id: '2', firstName: 'Carlos', lastName: 'Mendoza Ruiz', phone: '622 334 455', group: 'Amigos Novia', delivered: true, notes: '', linkedIds: ['1'] },
  { id: '3', firstName: 'Familia', lastName: 'López Gómez', phone: '912 345 678', group: 'Familia Novio', delivered: false, notes: 'Entregar en mano en la cena de Navidad', linkedIds: ['4', '5'] },
  { id: '4', firstName: 'Roberto', lastName: 'López', phone: '633 445 566', group: 'Familia Novio', delivered: false, notes: '', linkedIds: ['3', '5'] },
  { id: '5', firstName: 'Elena', lastName: 'Gómez', phone: '', group: 'Familia Novio', delivered: false, notes: '', linkedIds: ['3', '4'] },
  { id: '6', firstName: 'Javier', lastName: 'Sánchez', phone: '655 667 788', group: 'Trabajo', delivered: false, notes: 'Confirmar si viene con acompañante', linkedIds: [] },
  { id: '7', firstName: 'Marta', lastName: 'Rios', phone: '677 889 900', group: 'Amigos Novio', delivered: true, notes: '', linkedIds: [] },
];
