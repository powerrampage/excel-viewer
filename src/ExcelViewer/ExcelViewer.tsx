import React, { useEffect, useState } from "react";
import demoJson from "./demo-data.json";
import { fillMissingCells, indexToReference } from "./utils";
import { Root } from "./types";
import CellBox from "./CellBox";
import { CellStore, useCellStore } from "./store";

const ExcelViewer: React.FC<{ jsonData: Root }> = ({ jsonData }) => {
  const [data, _setData] = useState(jsonData);
  const [listIndex, setListIndex] = useState(0);
  const setAllCells = useCellStore((state) => state.setAllCells);
  const setDependencies = useCellStore((state) => state.setDependencies);
  const currentSheet = data.packages[listIndex];

  useEffect(() => {
    const cells = currentSheet.cells.reduce(
      (prev, { formula, value, rowIndex, columnIndex }) => {
        const cellKey = indexToReference(rowIndex, columnIndex);
        prev[cellKey] = { formula, value };
        return prev;
      },
      {} as CellStore["cells"]
    );
    setAllCells(cells);
    setDependencies(cells);
  }, [currentSheet, setAllCells, setDependencies]);

  return (
    <div>
      <select
        style={{ width: 500, height: 50 }}
        onChange={(event) => {
          const selectedIndex = event.target.selectedIndex;
          setListIndex(selectedIndex);
        }}
      >
        {data.packages.map(({ listName }, index) => {
          return (
            <option key={index} value={listName}>
              {listName}
            </option>
          );
        })}
      </select>

      <div style={{ marginBottom: "20px" }}>
        <h3>{currentSheet.listName}</h3>
        <table
          style={{
            borderCollapse: "collapse",
            tableLayout: "fixed",
            width: "100%",
          }}
        >
          <tbody>
            {fillMissingCells(currentSheet.cells).map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const cellReference = indexToReference(rowIndex, colIndex);

                    return (
                      <CellBox
                        key={colIndex}
                        cell={cell}
                        cellRef={cellReference}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const demoJsonData: any = demoJson;

export default function Excel() {
  return <ExcelViewer jsonData={demoJsonData} />;
}
