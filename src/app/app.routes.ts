import { Routes } from '@angular/router';
import { Home } from './features/home/home';
import { JiraCalculator } from './features/jira-calculator/jira-calculator';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', component: Home },
  { path: 'jira-calculator', component: JiraCalculator },
];
