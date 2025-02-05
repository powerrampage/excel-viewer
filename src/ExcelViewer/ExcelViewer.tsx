import { FC, useEffect } from "react";
import demoJson from "./demo-data.json";
import { getCellKey, groupCells, spreadsheetMapper } from "./utils";
import { Root } from "./types";
import CellBox from "./CellBox";
import { useSpreadsheetStore } from "./store";

const ExcelViewer: FC<{ jsonData: Root }> = ({ jsonData: data }) => {
  const { setSpreadsheet, setDependencies, setCurrentSheetKey } =
    useSpreadsheetStore((state) => ({
      setSpreadsheet: state.setSpreadsheet,
      setDependencies: state.setDependencies,
      setCurrentSheetKey: state.setCurrentSheetKey,
    }));
  const currentSheetKey = useSpreadsheetStore((state) => state.currentSheetKey);

  const state = useSpreadsheetStore((state) => state);
  console.log("state:", state);

  useEffect(() => {
    setCurrentSheetKey(data.packages[0].listName);
    const spreadsheet = spreadsheetMapper(data.packages);
    setSpreadsheet(spreadsheet);
    setDependencies(spreadsheet);
  }, [data, setCurrentSheetKey, setDependencies, setSpreadsheet]);

  if (!currentSheetKey) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1>Loading....</h1>
      </div>
    );
  }

  const currentSheet = data.packages.find(
    ({ listName }) => listName === currentSheetKey
  )!;

  return (
    <div>
      <select
        style={{ width: 200, height: 30 }}
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
            tableLayout: "fixed",
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
