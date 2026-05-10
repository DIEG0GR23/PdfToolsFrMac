import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeMenu } from './home-menu';

describe('HomeMenu', () => {
  let component: HomeMenu;
  let fixture: ComponentFixture<HomeMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeMenu);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
