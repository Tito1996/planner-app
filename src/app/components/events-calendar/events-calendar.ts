import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CalendarView, CalendarEvent, CalendarModule } from 'angular-calendar';
import { startOfDay } from 'date-fns';

import { CustomCalendarModule } from '../../shared/modules/calendar.module';
import { Reminders } from '../reminders/reminders';

@Component({
  selector: 'app-events-calendar',
  imports: [Reminders, CommonModule, CalendarModule, CustomCalendarModule],
  templateUrl: './events-calendar.html',
  styleUrl: './events-calendar.css',
})
export class EventsCalendar {
  view: CalendarView = CalendarView.Month;
  CalendarView = CalendarView;
  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    {
      start: startOfDay(new Date()),
      title: 'Evento de ejemplo',
    },
  ];

  handleDayClick(date: Date) {
    const title = prompt('Título del evento:');
    if (title) {
      this.events = [
        ...this.events,
        {
          start: startOfDay(date),
          title,
        },
      ];
    }
  }

  handleEventClick(event: CalendarEvent) {
    const action = confirm(`¿Eliminar "${event.title}"?`) ? 'delete' : 'edit';

    if (action === 'delete') {
      this.events = this.events.filter((e) => e !== event);
    } else {
      const newTitle = prompt('Nuevo título:', event.title);
      if (newTitle) {
        event.title = newTitle;
        this.events = [...this.events]; // fuerza actualización
      }
    }
  }
}
