import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MultasPage } from './multas.page';

describe('MultasPage', () => {
  let component: MultasPage;
  let fixture: ComponentFixture<MultasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MultasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
