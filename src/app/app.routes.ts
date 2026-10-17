import { Routes } from '@angular/router';
import { GuestsList } from './features/guests-list/guests-list';
import { Home } from './features/home/home';
import { JiraCalculator } from './features/jira-calculator/jira-calculator';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'guests-list', component: GuestsList },
  { path: 'jira-calculator', component: JiraCalculator },
];
