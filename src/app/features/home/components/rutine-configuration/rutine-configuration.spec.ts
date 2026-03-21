import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RutineConfiguration } from './rutine-configuration';

describe('RutineConfiguration', () => {
  let component: RutineConfiguration;
  let fixture: ComponentFixture<RutineConfiguration>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RutineConfiguration],
    }).compileComponents();

    fixture = TestBed.createComponent(RutineConfiguration);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
