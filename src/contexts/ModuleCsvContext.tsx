import { TFunction } from 'i18next';
import { createContext, useContext, useState } from 'react';
import * as XLSX from 'xlsx-js-style';

interface ModuleCsvContextType {
    data: any[];
    setData: (data: any[]) => void;
    originalData: any[];
    setOriginalData: (data: any[]) => void;
    slicedData: any[];
    setSlicedData: (data: any[]) => void;
    alasqlQuery: string;
    setAlasqlQuery: (query: string) => void;
    alasqlQueryBefore: string;
    setAlasqlQueryBefore: (query: string) => void;
    alasqlQuerySource: string;
    setAlasqlQuerySource: (query: string) => void;
    alasqlQueryAfter: string;
    setAlasqlQueryAfter: (query: string) => void;
    inputFileValue: string;
    setInputFileValue: (value: string) => void;
    currentWorkbook: string;
    setCurrentWorkbook: (value: string) => void;
    availableWorkSheets: string[];
    setAvailableWorkSheets: (value: string[]) => void;
    currentWorksheet: string;
    setCurrentWorksheet: (value: string) => void;
    availableColumns: string[];
    setAvailableColumns: (value: string[]) => void;
    currentGroupByColumn: string;
    setCurrentGroupByColumn: (value: string) => void;
    useGroupBy: boolean;
    setUseGroupBy: (value: boolean) => void;
    erasmusCodes: any[];
    setErasmusCodes: (value: any[]) => void;
    institutionNames: any[];
    setInstitutionNames: (value: any[]) => void;
    selectedErasmusCode: any;
    setSelectedErasmusCode: (value: any) => void;
    selectedInstitutionName: any;
    setSelectedInstitutionName: (value: any) => void;
    dataFiltered: any[];
    setDataFiltered: (value: any[]) => void;
    lastUpdate: string;
    setLastUpdate: (value: string) => void;
    alasqlRemoveDataAfterFirstEmptyRow: (rows: any[]) => any[];
    handleDownloadXLSX: (data: any, t: TFunction) => void;
}

const ModuleCsvContext = createContext<ModuleCsvContextType | undefined>(undefined);

//Export IIAs to XLSX
const handleDownloadXLSX = (data, t) => {
  if (!data || !Array.isArray(data)) {
    console.error('XLSX Download failed: no data');
    return;
  }
  // Translate XLSX data
  const translatedData = data.map(row => {
    const newRow = {};
    Object.entries(row).forEach(([key, value]) => {
      let newKey = key;

      // translate headers if they start with CSVTH_
      if (key.startsWith('CSVTH_')) newKey = t(key);

      // translate values if they start with CSVTD_
      if (typeof value === 'string' && value.startsWith('CSVTD_')) {
        newRow[newKey] = t(value);
      } else {
        newRow[newKey] = value;
      }
    });
    return newRow;
  });

  // create worksheet directly from JSON
  const ws = XLSX.utils.json_to_sheet(translatedData);

  // apply styling
  const headerStyle = {
    font: { bold: true },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    fill: { fgColor: { rgb: 'CCCCCC' } }
  };

  const cellStyle = {
    alignment: { wrapText: true, vertical: 'top' }
  };

  // determine worksheet range
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r; R <= range.e.r; ++R) {
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
      if (!ws[cellRef]) continue;

      if (R === 0) ws[cellRef].s = headerStyle; // header row
      else ws[cellRef].s = cellStyle; // data rows
    }
  }

  // set row heights (roughly doubled)
  const totalRows = range.e.r + 1;
  ws['!rows'] = Array(totalRows).fill({ hpt: 30 });

  // set column widths
  const widths = [5, 14, 36, 36, 15, 15, 10, 32, 16, 28, 13, 12, 12];
  ws['!cols'] = widths.map(w => ({ wch: w }));

  // enable auto-filter for all columns (in metadata)
  // the user still has to click on the filter icon after opening the file (impossible to activate the arrows by default with pure-JS)
  const filterRef = XLSX.utils.encode_range({
    s: { r: range.s.r, c: range.s.c },
    e: { r: range.s.r, c: range.e.c }
  });
  ws['!autofilter'] = { ref: filterRef };

  // freeze header row (needs xlsx-js-style Pro version)
  ws['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft' };

  // create workbook and export
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'IIAs (PL LUBLIN02)');

  const filename = t('SQL_XLSX_FILENAME') || 'iias.xlsx';
  XLSX.writeFile(wb, filename);
};

  //remove data after empty rows - fix for group by
  const alasqlRemoveDataAfterFirstEmptyRow = function (rows) {
    // Find the index of the first empty row
    const emptyRowIndex = rows.findIndex(row =>
        Object.values(row).every(value => value === null || value === undefined || value === "")
    );
    // Return rows up to the first empty row
    return emptyRowIndex === -1 ? rows : rows.slice(0, emptyRowIndex);
  };

const ModuleCsvContextProvider = ({ children }: { children: React.ReactNode }) => {

  const [data, setData] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [slicedData, setSlicedData] = useState([]);

  const [alasqlQuery, setAlasqlQuery] = useState('');
  const [alasqlQueryBefore, setAlasqlQueryBefore] = useState('');
  const [alasqlQuerySource, setAlasqlQuerySource] = useState('');
  const [alasqlQueryAfter, setAlasqlQueryAfter] = useState('');

  const [inputFileValue, setInputFileValue] = useState('');
  const [currentWorkbook, setCurrentWorkbook] = useState('');
  const [availableWorkSheets, setAvailableWorkSheets] = useState([]);
  const [currentWorksheet, setCurrentWorksheet] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [currentGroupByColumn, setCurrentGroupByColumn] = useState('');

  const [useGroupBy, setUseGroupBy] = useState(false);

  const [erasmusCodes, setErasmusCodes] = useState([]);
  const [institutionNames, setInstitutionNames] = useState([]);

  const [selectedErasmusCode, setSelectedErasmusCode] = useState(null);
  const [selectedInstitutionName, setSelectedInstitutionName] = useState(null);
  const [dataFiltered, setDataFiltered] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  return (
    <ModuleCsvContext.Provider value={{ data, setData, originalData, setOriginalData, slicedData, setSlicedData, alasqlQuery, setAlasqlQuery, alasqlQueryBefore, setAlasqlQueryBefore, alasqlQuerySource, setAlasqlQuerySource, alasqlQueryAfter, setAlasqlQueryAfter, inputFileValue, setInputFileValue, currentWorkbook, setCurrentWorkbook, availableWorkSheets, setAvailableWorkSheets, currentWorksheet, setCurrentWorksheet, availableColumns, setAvailableColumns, currentGroupByColumn, setCurrentGroupByColumn, useGroupBy, setUseGroupBy, erasmusCodes, setErasmusCodes, institutionNames, setInstitutionNames, selectedErasmusCode, setSelectedErasmusCode, selectedInstitutionName, setSelectedInstitutionName, dataFiltered, setDataFiltered, lastUpdate, setLastUpdate, alasqlRemoveDataAfterFirstEmptyRow, handleDownloadXLSX }}>
      {children}
    </ModuleCsvContext.Provider>
  );
};

const useModuleCsvContext = () => {
  const context = useContext(ModuleCsvContext);
  if (!context) {
    throw new Error('useModuleCsvContext must be used within a ModuleCsvContextProvider');
  }
  return context;
};

export { ModuleCsvContextProvider, useModuleCsvContext };
