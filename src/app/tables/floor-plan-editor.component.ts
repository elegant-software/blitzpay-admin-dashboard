import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { BranchTable, FloorPlan, TablePlacement } from '../models/merchant-catalog.models';
import { pinLabel, pinPosition, placementFromPoint, tablesOffPlan, tablesOnPlan } from './floor-plan';

export interface TablePlacementChange {
  table: BranchTable;
  placement: TablePlacement;
}

/**
 * Floor Plan setup: the picture with its Tables, dragged into place. Tables not on this plan are listed beside it and
 * dragged onto the picture (or placed in the middle with a button). Positions are fractions of the picture.
 */
@Component({
  selector: 'app-floor-plan-editor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './floor-plan-editor.component.html',
  styleUrls: ['../merchant-catalog/merchant-catalog.component.css', './branch-tables.component.css']
})
export class FloorPlanEditorComponent {
  @Input({ required: true }) floorPlan!: FloorPlan;
  @Input({ required: true }) tables: BranchTable[] = [];
  @Input() floorPlans: FloorPlan[] = [];
  @Input() busy = false;
  @Output() readonly place = new EventEmitter<TablePlacementChange>();
  @Output() readonly unplace = new EventEmitter<BranchTable>();

  @ViewChild('canvas') private canvas?: ElementRef<HTMLElement>;
  private draggingId: string | null = null;
  dropActive = false;

  readonly pinPosition = pinPosition;
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
