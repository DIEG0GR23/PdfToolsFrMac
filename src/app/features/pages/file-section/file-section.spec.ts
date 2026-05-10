import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSection } from './file-section';

describe('FileSection', () => {
  let component: FileSection;
  let fixture: ComponentFixture<FileSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
