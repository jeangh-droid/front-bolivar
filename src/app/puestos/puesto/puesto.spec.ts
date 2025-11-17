import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Puesto } from './puesto';

describe('Puesto', () => {
  let component: Puesto;
  let fixture: ComponentFixture<Puesto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Puesto]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Puesto);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
