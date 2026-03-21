import { Component } from '@angular/core';
import { GraphicsPanel } from './components/graphics-panel/graphics-panel';
import { RutineConfiguration } from './components/rutine-configuration/rutine-configuration';
import { RutineWeekControl } from './components/rutine-week-control/rutine-week-control';

@Component({
  selector: 'app-home',
  imports: [GraphicsPanel, RutineConfiguration, RutineWeekControl],
  templateUrl: './home.html',
  styleUrl: './home.scss',
  standalone: true,
})
export class Home {}
