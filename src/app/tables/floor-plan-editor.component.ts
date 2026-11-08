import { AdminTranslatePipe } from '../i18n/admin-translate.pipe';
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BranchTable, FloorArea, FloorPlan, TablePlacement } from '../models/merchant-catalog.models';
import { areaBetween, areaStyle, pinLabel, pinPosition, placementFromPoint, tablesOffPlan, tablesOnPlan } from './floor-plan';

/** Drags smaller than this (fraction of the picture) are clicks, not Floor Areas. */
const MIN_AREA = 0.02;

export interface TablePlacementChange {
  table: BranchTable;
  placement: TablePlacement;
}

/**
 * Floor Plan setup: the picture with its Tables, dragged into place. Tables not on this plan are listed beside it and
 * dragged onto the picture (or placed in the middle with a button). Positions are fractions of the picture.
 * In "Areas" mode the picture is traced once into named Floor Areas, which the live floor draws instead of the picture.
 */
@Component({
  selector: 'app-floor-plan-editor',
  standalone: true,
  imports: [AdminTranslatePipe, CommonModule, FormsModule],
  templateUrl: './floor-plan-editor.component.html',
  styleUrls: ['../merchant-catalog/merchant-catalog.component.css', './branch-tables.component.css']
})
export class FloorPlanEditorComponent implements OnChanges {
  @Input({ required: true }) floorPlan!: FloorPlan;
  @Input({ required: true }) tables: BranchTable[] = [];
  @Input() floorPlans: FloorPlan[] = [];
  @Input() busy = false;
  @Output() readonly place = new EventEmitter<TablePlacementChange>();
  @Output() readonly unplace = new EventEmitter<BranchTable>();
  @Output() readonly saveAreas = new EventEmitter<FloorArea[]>();

  @ViewChild('canvas') private canvas?: ElementRef<HTMLElement>;
  private draggingId: string | null = null;
  dropActive = false;

  mode: 'tables' | 'areas' = 'tables';
  /** Floor Areas being edited; saved together with "Save areas". */
  areas: FloorArea[] = [];
  /** Rectangle being dragged out, as fractions of the picture. */
  draft: Omit<FloorArea, 'name'> | null = null;
  private draftStart: { x: number; y: number } | null = null;

  readonly pinPosition = pinPosition;
  readonly areaStyle = areaStyle;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['floorPlan']) this.areas = (this.floorPlan.areas ?? []).map((area) => ({ ...area }));
  }

  get areasChanged(): boolean {
    return JSON.stringify(this.areas) !== JSON.stringify(this.floorPlan.areas ?? []);
  }

  // ── Areas mode: drag a rectangle over the picture ─────────────────────

  areaStart(event: PointerEvent): void {
    if (this.mode !== 'areas' || !this.canvas) return;
    event.preventDefault();
    (event.target as Element).setPointerCapture?.(event.pointerId);
    this.draftStart = this.point(event);
    this.draft = areaBetween(this.draftStart, this.draftStart);
  }

  areaMove(event: PointerEvent): void {
    if (!this.draftStart) return;
    this.draft = areaBetween(this.draftStart, this.point(event));
  }

  areaEnd(): void {
    const draft = this.draft;
    this.draft = null;
    this.draftStart = null;
    if (!draft || draft.width < MIN_AREA || draft.height < MIN_AREA) return;
    this.areas = [...this.areas, { name: `Area ${this.areas.length + 1}`, ...draft }];
  }

  removeArea(index: number): void {
    this.areas = this.areas.filter((_, candidate) => candidate !== index);
  }

  resetAreas(): void {
    this.areas = (this.floorPlan.areas ?? []).map((area) => ({ ...area }));
  }

  submitAreas(): void {
    this.saveAreas.emit(this.areas.map((area) => ({ ...area, name: area.name.trim() || 'Area' })));
  }

  private point(event: PointerEvent): { x: number; y: number } {
    return placementFromPoint(event.clientX, event.clientY, this.canvas!.nativeElement.getBoundingClientRect());
  }
  readonly pinLabel = pinLabel;

  get placed(): BranchTable[] { return tablesOnPlan(this.tables, this.floorPlan.id); }

  get offPlan(): BranchTable[] { return tablesOffPlan(this.tables, this.floorPlan.id); }

  whereIs(table: BranchTable): string {
    if (!table.placement) return 'Not placed';
    const plan = this.floorPlans.find((candidate) => candidate.id === table.placement?.floorPlanId);
    return plan ? `On ${plan.name}` : 'On another floor plan';
  }

  dragStart(event: DragEvent, table: BranchTable): void {
    this.draggingId = table.id;
    event.dataTransfer?.setData('text/plain', table.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  dragEnd(): void {
    this.draggingId = null;
    this.dropActive = false;
  }

  allowDrop(event: DragEvent): void {
    if (!this.draggingId) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    this.dropActive = true;
  }

  drop(event: DragEvent): void {
    event.preventDefault();
    const id = event.dataTransfer?.getData('text/plain') || this.draggingId;
    const table = this.tables.find((candidate) => candidate.id === id);
    this.dragEnd();
    if (!table || !this.canvas) return;
    const { x, y } = placementFromPoint(event.clientX, event.clientY, this.canvas.nativeElement.getBoundingClientRect());
    this.place.emit({ table, placement: { floorPlanId: this.floorPlan.id, x, y } });
  }

  /** Keyboard and touch alternative to dragging: puts the Table in the middle of the picture. */
  placeInMiddle(table: BranchTable): void {
    this.place.emit({ table, placement: { floorPlanId: this.floorPlan.id, x: 0.5, y: 0.5 } });
  }
}
