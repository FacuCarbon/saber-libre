import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LibroCatalogoItemComponent } from './libro-catalogo-item.component';

describe('LibroCatalogoItemComponent', () => {
  let component: LibroCatalogoItemComponent;
  let fixture: ComponentFixture<LibroCatalogoItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [LibroCatalogoItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LibroCatalogoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
