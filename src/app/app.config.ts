import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { EventsCalendar } from './components/events-calendar/events-calendar';
import { ItemDetail } from './components/item-detail/item-detail';
import { Notes } from './components/notes/notes';
import { Reminders } from './components/reminders/reminders';
import { ShoppingList } from './components/shopping-list/shopping-list';
import { ToDoList } from './components/to-do-list/to-do-list';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
  ],
};
