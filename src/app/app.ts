import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { EventsCalendar } from './components/events-calendar/events-calendar';
import { ItemDetail } from './components/item-detail/item-detail';
import { Notes } from './components/notes/notes';
import { ShoppingList } from './components/shopping-list/shopping-list';
import { ToDoList } from './components/to-do-list/to-do-list';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    EventsCalendar,
    ItemDetail,
    Notes,
    ShoppingList,
    ToDoList
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'planner-app';
}
