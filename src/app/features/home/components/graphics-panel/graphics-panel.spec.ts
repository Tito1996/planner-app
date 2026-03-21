import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicsPanel } from './graphics-panel';

describe('GraphicsPanel', () => {
  let component: GraphicsPanel;
  let fixture: ComponentFixture<GraphicsPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GraphicsPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(GraphicsPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
