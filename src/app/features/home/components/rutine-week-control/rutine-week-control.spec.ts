import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutineWeekControl } from './rutine-week-control';

describe('RutineWeekControl', () => {
  let component: RutineWeekControl;
  let fixture: ComponentFixture<RutineWeekControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutineWeekControl],
    }).compileComponents();

    fixture = TestBed.createComponent(RutineWeekControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
