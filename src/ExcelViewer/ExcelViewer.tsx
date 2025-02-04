import React, { useEffect, useTransition } from "react";
import demoJson from "./demo-data.json";
import { getCellKey, groupCells, spreadsheetMapper } from "./utils";
import { Root } from "./types";
import CellBox from "./CellBox";
import { useSpreadsheetStore } from "./store";

const ExcelViewer: React.FC<{ jsonData: Root }> = ({ jsonData: data }) => {
  const [isPending, startTransition] = useTransition();
  const setSpreadsheet = useSpreadsheetStore((state) => state.setSpreadsheet);
  const setDependencies = useSpreadsheetStore((state) => state.setDependencies);
  const setCurrentSheetKey = useSpreadsheetStore(
    (state) => state.setCurrentSheetKey
  );
  const currentSheetKey = useSpreadsheetStore((state) => state.currentSheetKey);

  const state = useSpreadsheetStore((state) => state);
  console.log("state:", state);

  useEffect(() => {
    startTransition(() => {
      setCurrentSheetKey(data.packages[0].listName);
    });
  }, [data, setCurrentSheetKey]);

  useEffect(() => {
    startTransition(() => {
      const spreadsheet = spreadsheetMapper(data.packages);
      setSpreadsheet(spreadsheet);
      setDependencies(spreadsheet);
    });
  }, [data, setSpreadsheet, setDependencies]);

  if (!currentSheetKey || isPending) return <h1>Loading....</h1>;

  const currentSheet = data.packages.find(
    ({ listName }) => listName === currentSheetKey
  )!;

  return (
    <div>
      <select
        style={{ width: 500, height: 50 }}
        onChange={(event) => {
          const sheetKey = event.target.value;
          console.log({ event, sheetKey });
          setCurrentSheetKey(sheetKey);
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
            // tableLayout: "fixed",
            width: "100%",
          }}
        >
          <tbody key={currentSheet.listName}>
            {groupCells(currentSheet.cells).map((row, rowIndex) => {
              return (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => {
                    const cellReference = getCellKey({
                      row: rowIndex,
                      col: colIndex,
                    });
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
