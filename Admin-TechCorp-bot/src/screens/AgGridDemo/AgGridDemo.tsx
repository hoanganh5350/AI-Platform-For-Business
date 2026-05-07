/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AllCommunityModule,
  ColDef,
  colorSchemeDarkBlue,
  ModuleRegistry,
  SizeColumnsToFitGridStrategy,
  themeQuartz,
} from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useState } from "react";
import "./index.css";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);
const themeDarkBlue = themeQuartz.withPart(colorSchemeDarkBlue);

const defaultValue = [
  {
    symbol: "BTCUSD",
    state: "Active",
    price: 64950,
    volumeBuy: 1200,
    volumeSell: 980,
    bidPrice: 64948,
    askPrice: 64952,
    volatility: 4.2,
  },
  {
    symbol: "ETHUSD",
    state: "Active",
    price: 3250,
    volumeBuy: 850,
    volumeSell: 730,
    bidPrice: 3249,
    askPrice: 3251,
    volatility: 3.9,
  },
  {
    symbol: "XAUUSD",
    state: "Active",
    price: 23850,
    volumeBuy: 540,
    volumeSell: 460,
    bidPrice: 23848,
    askPrice: 23852,
    volatility: 2.1,
  },
  {
    symbol: "XAGUSD",
    state: "Inactive",
    price: 28.3,
    volumeBuy: 210,
    volumeSell: 190,
    bidPrice: 28.29,
    askPrice: 28.31,
    volatility: 1.4,
  },
  {
    symbol: "EURUSD",
    state: "Active",
    price: 1.085,
    volumeBuy: 1800,
    volumeSell: 1750,
    bidPrice: 1.0849,
    askPrice: 1.0851,
    volatility: 0.9,
  },
  {
    symbol: "GBPUSD",
    state: "Active",
    price: 1.255,
    volumeBuy: 1450,
    volumeSell: 1320,
    bidPrice: 1.2549,
    askPrice: 1.2551,
    volatility: 1.3,
  },
  {
    symbol: "USDJPY",
    state: "Active",
    price: 156.3,
    volumeBuy: 2300,
    volumeSell: 2210,
    bidPrice: 156.29,
    askPrice: 156.31,
    volatility: 0.7,
  },
  {
    symbol: "AUDUSD",
    state: "Inactive",
    price: 0.665,
    volumeBuy: 950,
    volumeSell: 880,
    bidPrice: 0.6649,
    askPrice: 0.6651,
    volatility: 0.6,
  },
  {
    symbol: "USDCAD",
    state: "Active",
    price: 1.355,
    volumeBuy: 1110,
    volumeSell: 1040,
    bidPrice: 1.3549,
    askPrice: 1.3551,
    volatility: 0.8,
  },
  {
    symbol: "NZDUSD",
    state: "Active",
    price: 0.605,
    volumeBuy: 700,
    volumeSell: 650,
    bidPrice: 0.6049,
    askPrice: 0.6051,
    volatility: 0.5,
  },

  // 10 more for total 20
  {
    symbol: "SPX500",
    state: "Active",
    price: 5290,
    volumeBuy: 180,
    volumeSell: 150,
    bidPrice: 5289.5,
    askPrice: 5290.5,
    volatility: 2.7,
  },
  {
    symbol: "NAS100",
    state: "Active",
    price: 18750,
    volumeBuy: 220,
    volumeSell: 210,
    bidPrice: 18749,
    askPrice: 18751,
    volatility: 2.9,
  },
  {
    symbol: "DJI30",
    state: "Inactive",
    price: 39650,
    volumeBuy: 155,
    volumeSell: 140,
    bidPrice: 39649,
    askPrice: 39651,
    volatility: 1.6,
  },
  {
    symbol: "DXY",
    state: "Active",
    price: 104.75,
    volumeBuy: 500,
    volumeSell: 460,
    bidPrice: 104.74,
    askPrice: 104.76,
    volatility: 0.4,
  },
  {
    symbol: "OILWTI",
    state: "Active",
    price: 82.5,
    volumeBuy: 620,
    volumeSell: 580,
    bidPrice: 82.49,
    askPrice: 82.51,
    volatility: 1.8,
  },
  {
    symbol: "OILBRENT",
    state: "Inactive",
    price: 86.3,
    volumeBuy: 510,
    volumeSell: 470,
    bidPrice: 86.29,
    askPrice: 86.31,
    volatility: 1.7,
  },
  {
    symbol: "USDCHF",
    state: "Active",
    price: 0.903,
    volumeBuy: 1030,
    volumeSell: 980,
    bidPrice: 0.9029,
    askPrice: 0.9031,
    volatility: 0.6,
  },
  {
    symbol: "USDCNH",
    state: "Active",
    price: 7.245,
    volumeBuy: 890,
    volumeSell: 820,
    bidPrice: 7.2449,
    askPrice: 7.2451,
    volatility: 0.9,
  },
  {
    symbol: "VIX",
    state: "Active",
    price: 14.7,
    volumeBuy: 300,
    volumeSell: 320,
    bidPrice: 14.69,
    askPrice: 14.71,
    volatility: 5.5,
  },
  {
    symbol: "ADAUSD",
    state: "Inactive",
    price: 0.455,
    volumeBuy: 5100,
    volumeSell: 4800,
    bidPrice: 0.454,
    askPrice: 0.456,
    volatility: 6.8,
  },
];

export const AgGridDemo = () => {
  const [rowData] = useState(defaultValue);

  // Column Definitions: Defines the columns to be displayed.
  const [colDefs] = useState([
    { field: "symbol", minWidth: 150 },
    { field: "state", minWidth: 150 },
    {
      field: "price",
      minWidth: 150,
      enableCellChangeFlash: true,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      field: "volumeBuy",
      minWidth: 150,
      enableCellChangeFlash: true,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      field: "volumeSell",
      minWidth: 150,
      enableCellChangeFlash: true,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      field: "bidPrice",
      minWidth: 150,
      enableCellChangeFlash: true,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      field: "askPrice",
      minWidth: 150,
      enableCellChangeFlash: true,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
    {
      field: "volatility",
      minWidth: 150,
      enableCellChangeFlash: true,
      cellRenderer: "agAnimateShowChangeCellRenderer",
    },
  ]);

  const autoSizeStrategy = useMemo(() => {
    return {
      type: "fitCellContents",
    };
  }, []);

  const onGridReady = useCallback(
    (params: {
      api: {
        getDisplayedRowCount: () => any;
        getDisplayedRowAtIndex: (arg0: number) => any;
      };
    }) => {
      const updateValues = () => {
        const rowCount = params.api.getDisplayedRowCount();
        // pick 2 cells at random to update
        for (let i = 0; i < 2; i++) {
          const row = Math.floor(Math.random() * rowCount);
          const rowNode = params.api.getDisplayedRowAtIndex(row);
          rowNode.setDataValue("price", Math.floor(Math.random() * 10000));
          rowNode.setDataValue("volumeBuy", Math.floor(Math.random() * 1000));
          rowNode.setDataValue("volumeSell", Math.floor(Math.random() * 1000));
          rowNode.setDataValue("bidPrice", Math.floor(Math.random() * 1000));
          rowNode.setDataValue("askPrice", Math.floor(Math.random() * 1000));
          rowNode.setDataValue("volatility", Math.floor(Math.random() * 100));
        }
      };
      setInterval(updateValues, 1000);
    },
    []
  );
  return (
    <div className="ag-theme-alpine-dark" style={{ height: "100%" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={colDefs as ColDef[]}
        theme={themeDarkBlue}
        autoSizeStrategy={autoSizeStrategy as SizeColumnsToFitGridStrategy}
        onGridReady={onGridReady}
      />
    </div>
  );
};
