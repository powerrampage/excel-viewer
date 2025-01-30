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
  border: ("noBorder" | "allSides") | ({} & string);
  formula?: string | null;
  width: number;
  height: number;
  bold: boolean;
  italic: boolean;
}
