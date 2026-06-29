import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HeaderPageComponent } from './header-page.component';

describe('HeaderPageComponent', () => {
  let component: HeaderPageComponent;
  let fixture: ComponentFixture<HeaderPageComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [HeaderPageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
