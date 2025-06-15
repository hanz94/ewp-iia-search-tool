import { createContext, useContext, useState } from 'react';

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
}

const ModuleCsvContext = createContext<ModuleCsvContextType | undefined>(undefined);

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
    <ModuleCsvContext.Provider value={{ data, setData, originalData, setOriginalData, slicedData, setSlicedData, alasqlQuery, setAlasqlQuery, alasqlQueryBefore, setAlasqlQueryBefore, alasqlQuerySource, setAlasqlQuerySource, alasqlQueryAfter, setAlasqlQueryAfter, inputFileValue, setInputFileValue, currentWorkbook, setCurrentWorkbook, availableWorkSheets, setAvailableWorkSheets, currentWorksheet, setCurrentWorksheet, availableColumns, setAvailableColumns, currentGroupByColumn, setCurrentGroupByColumn, useGroupBy, setUseGroupBy, erasmusCodes, setErasmusCodes, institutionNames, setInstitutionNames, selectedErasmusCode, setSelectedErasmusCode, selectedInstitutionName, setSelectedInstitutionName, dataFiltered, setDataFiltered, lastUpdate, setLastUpdate, alasqlRemoveDataAfterFirstEmptyRow }}>
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
