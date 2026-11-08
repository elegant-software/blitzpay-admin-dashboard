import { TestBed } from '@angular/core/testing';
import { MerchantSearchComponent } from '../shared/merchant-search.component';
import { FloorPlanEditorComponent } from '../tables/floor-plan-editor.component';

describe('Admin RTL component layout', () => {
  it('mirrors search icons and input spacing and restores LTR without stale styles', async () => {
    await TestBed.configureTestingModule({ imports: [MerchantSearchComponent] }).compileComponents();
    const fixture = TestBed.createComponent(MerchantSearchComponent);
    fixture.componentInstance.variant = 'orders'; fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const input = host.querySelector('input')!;
    const icon = host.querySelector('.merchant-search-icon')!;
    host.dir = 'rtl';
    expect(getComputedStyle(icon).right).not.toBe('auto');
    expect(parseFloat(getComputedStyle(input).paddingRight)).toBeGreaterThan(30);
    expect(parseFloat(getComputedStyle(input).borderTopRightRadius)).toBeGreaterThan(0);
    host.dir = 'ltr';
    expect(getComputedStyle(icon).left).not.toBe('auto');
    expect(parseFloat(getComputedStyle(input).paddingLeft)).toBeGreaterThan(30);
    fixture.destroy();
  });

  it('keeps floor-plan coordinates physical inside the RTL interface', async () => {
    await TestBed.configureTestingModule({ imports: [FloorPlanEditorComponent] }).compileComponents();
    const fixture = TestBed.createComponent(FloorPlanEditorComponent);
    fixture.componentRef.setInput('floorPlan', { id: 'p1', name: 'Terrace', areas: [] });
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    host.dir = 'rtl';
    const canvas = host.querySelector<HTMLElement>('.floor-canvas')!;
    expect(getComputedStyle(canvas).direction).toBe('ltr');
    const pin = document.createElement('span');
    pin.style.cssText = 'position:absolute;left:25%;top:50%'; canvas.appendChild(pin);
    const left = getComputedStyle(pin).left;
    host.dir = 'ltr';
    expect(getComputedStyle(pin).left).toBe(left);
    fixture.destroy();
  });
});
