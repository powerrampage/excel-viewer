export interface Root {
  packages: Package[];
}

export interface Package {
  listName: string;
  cells: Cell[];
}

export interface Cell {
  rowIndex: number;
  columnIndex: number;
  value: string;
  fontName: string | null;
  fontSize: number;
  backgroundColor: string | null;
  textColor: string;
  formula?: string | null;
  width: number;
  height: number;
  bold: boolean;
  italic: boolean;
  borderBottom: string | null;
  borderTop: string | null;
  borderLeft: string | null;
  borderRight: string | null;
  textAlign: string;
  columnSpan: number;
  rowSpan: number;
}

export type BorderType =
  | "DASHED"
  | "DOTTED"
  | "DOUBLE"
  | "HAIR"
  | "THICK"
  | "MEDIUM"
  | "THIN";
