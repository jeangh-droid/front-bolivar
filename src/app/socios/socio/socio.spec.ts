import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Socio } from './socio';

describe('Socio', () => {
  let component: Socio;
  let fixture: ComponentFixture<Socio>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Socio]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Socio);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
