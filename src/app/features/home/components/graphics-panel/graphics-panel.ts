import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DayKey, WEEK_DAYS } from '../../models/routine.model';
import { RoutineStateService } from '../../services/routine-state.service';

const PAD_LEFT = 50;
const PAD_TOP = 20;
const CHART_HEIGHT = 160;
const CHART_WIDTH = 490;
const SLOT_WIDTH = CHART_WIDTH / 7; // 70
const BAR_WIDTH = 46;

interface DayBar {
  key: DayKey;
  label: string;
  count: number;
  x: number;
  y: number;
  height: number;
  centerX: number;
}

interface YTick {
  value: number;
  y: number;
}

@Component({
  selector: 'app-graphics-panel',
  imports: [],
  templateUrl: './graphics-panel.html',
  styleUrl: './graphics-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GraphicsPanel {
  private readonly state = inject(RoutineStateService);

  readonly routines = this.state.routines;

  readonly chartBars = computed<DayBar[]>(() => {
    const routines = this.routines();
    const maxCount = Math.max(routines.length, 1);

    return WEEK_DAYS.map((day, index) => {
      const count = routines.filter((r) => r.days[day.key]).length;
      const height = (count / maxCount) * CHART_HEIGHT;
      const x = PAD_LEFT + index * SLOT_WIDTH + (SLOT_WIDTH - BAR_WIDTH) / 2;
      const y = PAD_TOP + CHART_HEIGHT - height;
      return { key: day.key, label: day.label, count, x, y, height, centerX: x + BAR_WIDTH / 2 };
    });
  });

  readonly yTicks = computed<YTick[]>(() => {
    const maxCount = this.routines().length;
    if (maxCount === 0) return [{ value: 0, y: PAD_TOP + CHART_HEIGHT }];
    return Array.from({ length: maxCount + 1 }, (_, i) => ({
      value: i,
      y: PAD_TOP + CHART_HEIGHT - (i / maxCount) * CHART_HEIGHT,
    }));
  });

  readonly layout = {
    padLeft: PAD_LEFT,
    padTop: PAD_TOP,
    xAxisY: PAD_TOP + CHART_HEIGHT,
    chartEndX: PAD_LEFT + CHART_WIDTH,
    barWidth: BAR_WIDTH,
    labelY: PAD_TOP + CHART_HEIGHT + 18,
    countOffsetY: 5,
  };
}
