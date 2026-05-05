import { TablePaginationState, TableSortDirection, TableSortState } from '../models/merchant-catalog.models';

type Searchable = string | number | null | undefined;

export interface ClientTableResult<T> {
  filteredRows: T[];
  pageRows: T[];
  totalRecords: number;
  normalizedFirst: number;
}

export function hasActiveQuery(query: string): boolean {
  return normalizeQuery(query).length > 0;
}

export function filterRowsByFields<T>(
  rows: T[],
  query: string,
  resolver: (row: T) => Searchable[]
): T[] {
  const normalizedQuery = normalizeQuery(query);
  if (!normalizedQuery) {
    return rows;
  }

  return rows.filter((row) => resolver(row).some((field) => normalizeQuery(String(field ?? '')).includes(normalizedQuery)));
}

export function paginateRows<T>(rows: T[], pagination: TablePaginationState): ClientTableResult<T> {
  const totalRecords = rows.length;
  const rowsPerPage = Math.max(pagination.rows, 1);
  const lastPageStart = totalRecords > 0 ? Math.floor((totalRecords - 1) / rowsPerPage) * rowsPerPage : 0;
  const normalizedFirst = Math.min(Math.max(pagination.first, 0), lastPageStart);

  return {
    filteredRows: rows,
    pageRows: rows.slice(normalizedFirst, normalizedFirst + rowsPerPage),
    totalRecords,
    normalizedFirst
  };
}

export function sortRows<T, TField extends string>(
  rows: T[],
  sort: TableSortState<TField>,
  resolver: (row: T, field: TField) => Searchable
): T[] {
  if (!sort.field || !sort.direction) {
    return rows;
  }

  const direction = sort.direction === 'asc' ? 1 : -1;
  return [...rows].sort((left, right) => compareValues(resolver(left, sort.field as TField), resolver(right, sort.field as TField), direction));
}

export function nextSortDirection(currentDirection: TableSortDirection | null, isSameField: boolean): TableSortDirection {
  if (!isSameField || currentDirection == null) {
    return 'asc';
  }

  return currentDirection === 'asc' ? 'desc' : 'asc';
}

function normalizeQuery(value: string): string {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function compareValues(left: Searchable, right: Searchable, direction: number): number {
  if (left == null && right == null) {
    return 0;
  }
  if (left == null) {
    return 1;
  }
  if (right == null) {
    return -1;
  }

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * direction;
  }

  const normalizedLeft = normalizeQuery(String(left));
  const normalizedRight = normalizeQuery(String(right));
  return normalizedLeft.localeCompare(normalizedRight, undefined, { numeric: true, sensitivity: 'base' }) * direction;
}
