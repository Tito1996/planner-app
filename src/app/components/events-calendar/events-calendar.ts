import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { CalendarView, CalendarEvent, CalendarModule } from 'angular-calendar';
import { startOfDay } from 'date-fns';

import { CustomCalendarModule } from '../../shared/modules/calendar.module';

@Component({
  selector: 'app-events-calendar',
  imports: [FormsModule, CommonModule, CalendarModule, CustomCalendarModule],
  templateUrl: './events-calendar.html',
  styleUrl: './events-calendar.css',
})
export class EventsCalendar {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  selectedDate: Date | null = null;
  selectedDayEvents: CalendarEvent[] = [];

  events: CalendarEvent[] = [
    {
      start: startOfDay(new Date()),
      title: 'Evento de ejemplo',
      color: { primary: '#1e90ff', secondary: '#D1E8FF' },
    },
  ];

  newEvent = { title: '', time: '' };

  selectedEvent: boolean = false;
  showForm = false;

  onDayClick(day: any) {
    this.selectedDate = day.date;
    this.selectedDayEvents = this.events.filter(
      (e) => e.start.toDateString() === day.date.toDateString()
    );
    this.newEvent = { title: '', time: '' };
    this.showForm = !this.selectedDayEvents.length;
  }

  addEvent() {
    const [hours, minutes] = this.newEvent.time.split(':').map(Number);
    const start = new Date(this.selectedDate!);
    start.setHours(hours, minutes);

    this.events = [
      ...this.events,
      {
        title: this.newEvent.title,
        start,
        color: { primary: '#66bb6a', secondary: '#C8E6C9' },
      },
    ];

    this.onDayClick({ date: this.selectedDate }); // Recarga lista
  }
}
