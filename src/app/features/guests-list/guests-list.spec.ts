import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GUESTS_STORAGE_KEY } from './models/guest.model';
import { GuestsList } from './guests-list';
import { GuestsService } from './services/guests.service';

describe('GuestsList', () => {
  let component: GuestsList;
  let fixture: ComponentFixture<GuestsList>;

  beforeEach(async () => {
    localStorage.removeItem(GUESTS_STORAGE_KEY);
    await TestBed.configureTestingModule({ imports: [GuestsList] }).compileComponents();
    fixture = TestBed.createComponent(GuestsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create and render initial guests', () => {
    expect(component).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Laura');
  });

  it('filters by search term and status', () => {
    component['search'].set('laura');
    expect(component['filteredGuests']().length).toBe(1);
    component['search'].set('');
    component['statusFilter'].set('PENDING');
    expect(component['filteredGuests']().every((g) => !g.delivered)).toBe(true);
  });
});

describe('GuestsService', () => {
  let service: GuestsService;

  beforeEach(() => {
    localStorage.removeItem(GUESTS_STORAGE_KEY);
    service = new GuestsService();
  });

  it('computes invitation KPIs from linked clusters', () => {
    expect(service.kpis()).toEqual({
      totalGuests: 7,
      totalInvitations: 4,
      deliveredInvitations: 2,
      pendingInvitations: 2,
      percentage: 50,
    });
  });

  it('propagates delivery status to linked guests', () => {
    expect(service.setDelivered('3', true)).toBe(3);
    expect(
      service.guests().filter((g) => ['3', '4', '5'].includes(g.id)).every((g) => g.delivered),
    ).toBe(true);
  });

  it('removes links when deleting a guest', () => {
    service.remove('2');
    expect(service.guests().find((g) => g.id === '1')?.linkedIds).toEqual([]);
  });

  it('links and unlinks guests bidirectionally', () => {
    service.link('6', '7');
    expect(service.guests().find((g) => g.id === '6')?.delivered).toBe(true);
    service.unlink('6', '7');
    expect(service.guests().find((g) => g.id === '7')?.linkedIds).toEqual([]);
  });

  it('rejects invalid imports', () => {
    expect(service.import('{}')).toBe(false);
  });
});
