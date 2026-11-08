import { TestBed } from '@angular/core/testing';
import { FloorPlanEditorComponent } from './floor-plan-editor.component';

describe('FloorPlanEditorComponent', () => {
  it('does not stretch the canvas to the height of the list beside it, so Placements match the picture', () => {
    const fixture = TestBed.createComponent(FloorPlanEditorComponent);
    fixture.componentRef.setInput('floorPlan', { id: 'plan-1', name: 'Inside', imageUrl: null, areas: [] });
    fixture.componentRef.setInput('tables', []);
    fixture.detectChanges();

    // ponytail: checks the rule, not geometry; Karma's window is under the 992px breakpoint where the grid is 1 column.
    const layout = fixture.nativeElement.querySelector('.floor-layout') as HTMLElement;
    expect(getComputedStyle(layout).alignItems).toBe('start');
  });
});
