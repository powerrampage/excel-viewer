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
  fontName: string;
  fontSize: number;
  backgroundColor: string;
  textColor: string;
  border: ("noBorder" | "allSides") | ({} & string);
  formula?: string | null;
  width: number;
  height: number;
  bold: boolean;
  italic: boolean;
}
