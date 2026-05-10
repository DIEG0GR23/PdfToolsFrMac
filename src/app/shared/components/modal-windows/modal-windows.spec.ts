import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalWindows } from './modal-windows';

describe('ModalWindows', () => {
  let component: ModalWindows;
  let fixture: ComponentFixture<ModalWindows>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalWindows]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalWindows);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
