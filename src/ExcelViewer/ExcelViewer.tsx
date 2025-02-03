import React, { useEffect, useState, useTransition } from "react";
import demoJson from "./demo-data.json";
import { groupCells, indexToReference, spreadsheetMapper } from "./utils";
import { Root } from "./types";
import CellBox from "./CellBox";
import { useSpreadsheetStore } from "./store";

const ExcelViewer: React.FC<{ jsonData: Root }> = ({ jsonData: data }) => {
  const [isPending, startTransition] = useTransition();
  const [sheetIndex, setSheetIndex] = useState(0);
  const setSpreadsheet = useSpreadsheetStore((state) => state.setSpreadsheet);
  const setDependencies = useSpreadsheetStore((state) => state.setDependencies);
  const currentSheetKey = useSpreadsheetStore(
    (state) => state.setCurrentSheetKey
  );
  const currentSheet = data.packages[sheetIndex];

  const state = useSpreadsheetStore((state) => state);

  useEffect(() => {
    currentSheetKey(currentSheet.listName);
  }, [currentSheet, currentSheetKey]);

  useEffect(() => {
    startTransition(() => {
      const spreadsheet = spreadsheetMapper(data.packages);
      setSpreadsheet(spreadsheet);
      setDependencies(spreadsheet);
    });
  }, [data, setSpreadsheet, setDependencies]);

  return (
    <div>
      {isPending && <h1>Loading....</h1>}
      <select
        style={{ width: 500, height: 50 }}
        onChange={(event) => {
          const selectedIndex = event.target.selectedIndex;
          setSheetIndex(selectedIndex);
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
            {groupCells(currentSheet.cells).map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const cellReference = indexToReference(rowIndex, colIndex);

                    return (
                      <CellBox
                        key={colIndex}
                        cell={cell}
                        cellKey={cellReference}
                        sheetKey={currentSheet.listName}
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

const demoJsonData = demoJson as any;

export default function Excel() {
  return <ExcelViewer jsonData={demoJsonData} />;
}
