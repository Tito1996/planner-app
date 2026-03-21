import { Component } from '@angular/core';
import { GraphicsPanel } from './components/graphics-panel/graphics-panel';
import { RutineWeekControl } from './components/rutine-week-control/rutine-week-control';

@Component({
  selector: 'app-home',
  imports: [GraphicsPanel, RutineWeekControl],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {}
