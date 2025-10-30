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
    filters: any[];
    setFilters: (value: any[]) => void;
    handleFilterChange: (index: number, newValue: string, newOrdinalCounter: number) => void;
    handleFilterOptionsChange: (index: number, newOptions: any[]) => void;
    resetAllFilters: () => void;
    resetOrdinalFilters: (index: number) => void;
    alasqlRemoveDataAfterFirstEmptyRow: (rows: any[]) => any[];
    handleDownloadXLSX: (data: any, t: TFunction) => void;
    iscedFCodes: any[];
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

  // create state for each filter {active: BOOLEAN, value: STRING, ordinalCounter: int, options: ARRAY}
  const [filters, setFilters] = useState(
  Array(4).fill({ active: false, value: '', ordinalCounter: 0, options: [] })
  );

  // handle filter change {index: NUMBER, newValue: STRING, newOrdinalCounter: int}
  const handleFilterChange = (index, newValue, newOrdinalCounter) => {
  setFilters((prev) =>
      prev.map((f, i) =>
      i === index ? { ...f, value: newValue, active: Boolean(newValue), ordinalCounter: newOrdinalCounter } : f
      )
  );
  };

  // handle filter options change {index: NUMBER, newOptions: ARRAY}
  const handleFilterOptionsChange = (index, newOptions) => {
  setFilters((prev) =>
      prev.map((f, i) =>
      i === index ? { ...f, options: newOptions } : f
      )
  );
  };

  //reset all filters
const resetAllFilters = () => {
  setFilters((prev) =>
    prev.map((f) => ({ ...f, active: false, value: '', ordinalCounter: 0 }))
  );
  setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');
};
  //reset all filters with higher ordinal counter than filter with this index (without touching this filter)
  const resetOrdinalFilters = (index) => {
  setFilters((prev) => {
    // get the reference ordinalCounter for the clicked filter
    const targetCounter = prev[index].ordinalCounter;

    // return a new array with all filters reset
    return prev.map((f) =>
      f.ordinalCounter > targetCounter
        ? { ...f, value: '', active: false, ordinalCounter: 0 }
        : f
    );
  });
};

const iscedFCodes = [
      {
          "name": "Education, not further defined",
          "code": "0110"
      },
      {
          "name": "Education science",
          "code": "0111"
      },
      {
          "name": "Training for pre-school teachers",
          "code": "0112"
      },
      {
          "name": "Teacher training without subject specialisation",
          "code": "0113"
      },
      {
          "name": "Teacher training with subject specialisation",
          "code": "0114"
      },
      {
          "name": "Education, not elsewhere classified",
          "code": "0119"
      },
      {
          "name": "Education, inter-disciplinary programmes",
          "code": "0188"
      },
      {
          "name": "Arts, not further defined",
          "code": "0210"
      },
      {
          "name": "Audio-visual techniques and media production",
          "code": "0211"
      },
      {
          "name": "Fashion, interior and industrial design",
          "code": "0212"
      },
      {
          "name": "Fine arts",
          "code": "0213"
      },
      {
          "name": "Handicrafts",
          "code": "0214"
      },
      {
          "name": "Music and performing arts",
          "code": "0215"
      },
      {
          "name": "Arts, not elsewhere classified",
          "code": "0219"
      },
      {
          "name": "Humanities (except languages), not further defined",
          "code": "0220"
      },
      {
          "name": "Religion and theology",
          "code": "0221"
      },
      {
          "name": "History and archaeology",
          "code": "0222"
      },
      {
          "name": "Philosophy and ethics",
          "code": "0223"
      },
      {
          "name": "Humanities (except languages), not elsewhere classified",
          "code": "0229"
      },
      {
          "name": "Languages, not further defined",
          "code": "0230"
      },
      {
          "name": "Language acquisition",
          "code": "0231"
      },
      {
          "name": "Literature and linguistics",
          "code": "0232"
      },
      {
          "name": "Languages, not elsewhere classified",
          "code": "0239"
      },
      {
          "name": "Arts and humanities, interdisciplinary programmes",
          "code": "0288"
      },
      {
          "name": "Social and behavioural sciences, not further defined",
          "code": "0310"
      },
      {
          "name": "Economics",
          "code": "0311"
      },
      {
          "name": "Political sciences and civics",
          "code": "0312"
      },
      {
          "name": "Psychology",
          "code": "0313"
      },
      {
          "name": "Sociology and cultural studies",
          "code": "0314"
      },
      {
          "name": "Social and behavioural sciences, not elsewhere classified",
          "code": "0319"
      },
      {
          "name": "Journalism and information, not further defined",
          "code": "0320"
      },
      {
          "name": "Journalism and reporting",
          "code": "0321"
      },
      {
          "name": "Library, information and archival studies",
          "code": "0322"
      },
      {
          "name": "Journalism and information, not elsewhere classified",
          "code": "0329"
      },
      {
          "name": "Social sciences, journalism and information, inter-disciplinary programmes",
          "code": "0388"
      },
      {
          "name": "Business and administration, not further defined",
          "code": "0410"
      },
      {
          "name": "Accounting and taxation",
          "code": "0411"
      },
      {
          "name": "Finance, banking and insurance",
          "code": "0412"
      },
      {
          "name": "Management and administration",
          "code": "0413"
      },
      {
          "name": "Marketing and advertising",
          "code": "0414"
      },
      {
          "name": "Secretarial and office work",
          "code": "0415"
      },
      {
          "name": "Wholesale and retail sales",
          "code": "0416"
      },
      {
          "name": "Work skills",
          "code": "0417"
      },
      {
          "name": "Business and administration, not elsewhere classified",
          "code": "0419"
      },
      {
          "name": "Law, not further defined",
          "code": "0420"
      },
      {
          "name": "Law",
          "code": "0421"
      },
      {
          "name": "Law, not elsewhere classified",
          "code": "0429"
      },
      {
          "name": "Business, administration and law, interdisciplinary programmes",
          "code": "0488"
      },
      {
          "name": "Biological and related sciences, not further defined",
          "code": "0510"
      },
      {
          "name": "Biology",
          "code": "0511"
      },
      {
          "name": "Biochemistry",
          "code": "0512"
      },
      {
          "name": "Biological and related sciences, not elsewhere classifed",
          "code": "0519"
      },
      {
          "name": "Environment, not further defined",
          "code": "0520"
      },
      {
          "name": "Environmental sciences",
          "code": "0521"
      },
      {
          "name": "Natural environments and wildlife",
          "code": "0522"
      },
      {
          "name": "Environment, not elsewhere classified",
          "code": "0529"
      },
      {
          "name": "Physical sciences, not further defined",
          "code": "0530"
      },
      {
          "name": "Chemistry",
          "code": "0531"
      },
      {
          "name": "Earth sciences",
          "code": "0532"
      },
      {
          "name": "Physics",
          "code": "0533"
      },
      {
          "name": "Physical sciences, not elsewhere classified",
          "code": "0539"
      },
      {
          "name": "Mathematics and statistics, not further define",
          "code": "0540"
      },
      {
          "name": "Mathematics",
          "code": "0541"
      },
      {
          "name": "Statistics",
          "code": "0542"
      },
      {
          "name": "Mathematics and statistics, not elsewhere classified",
          "code": "0549"
      },
      {
          "name": "Natural sciences, mathematics and statistics, inter-disciplinary programmes",
          "code": "0588"
      },
      {
          "name": "Information and Communication Technologies (ICTs), not further defined",
          "code": "0610"
      },
      {
          "name": "Computer use",
          "code": "0611"
      },
      {
          "name": "Database and network design and administration",
          "code": "0612"
      },
      {
          "name": "Software and applications development and analysis",
          "code": "0613"
      },
      {
          "name": "Information and Communication Technologies (ICTs), not elsewhere classified",
          "code": "0619"
      },
      {
          "name": "Information and Communication Technologies (ICTs), inter-disciplinary programmes",
          "code": "0688"
      },
      {
          "name": "Engineering and engineering trades, not further defined",
          "code": "0710"
      },
      {
          "name": "Chemical engineering and processes",
          "code": "0711"
      },
      {
          "name": "Environmental protection technology",
          "code": "0712"
      },
      {
          "name": "Electricity and energy",
          "code": "0713"
      },
      {
          "name": "Electronics and automation",
          "code": "0714"
      },
      {
          "name": "Mechanics and metal trades",
          "code": "0715"
      },
      {
          "name": "Motor vehicles, ships and aircraft",
          "code": "0716"
      },
      {
          "name": "Engineering and engineering trades, not elsewhere classified",
          "code": "0719"
      },
      {
          "name": "Manufacturing and processing, not further defined",
          "code": "0720"
      },
      {
          "name": "Food processing",
          "code": "0721"
      },
      {
          "name": "Materials (glass, paper, plastic and wood)",
          "code": "0722"
      },
      {
          "name": "Textiles (clothes, footwear and leather)",
          "code": "0723"
      },
      {
          "name": "Mining and extraction",
          "code": "0724"
      },
      {
          "name": "Manufacturing and processing, not elsewhere classified",
          "code": "0729"
      },
      {
          "name": "Architecture and construction, not further defined",
          "code": "0730"
      },
      {
          "name": "Architecture and town planning",
          "code": "0731"
      },
      {
          "name": "Building and civil engineering",
          "code": "0732"
      },
      {
          "name": "Architecture and construction, not elsewhere classified",
          "code": "0739"
      },
      {
          "name": "Engineering, manufacturing and construction, inter-disciplinary programmes",
          "code": "0788"
      },
      {
          "name": "Agriculture, not further defined",
          "code": "0810"
      },
      {
          "name": "Crop and livestock production",
          "code": "0811"
      },
      {
          "name": "Horticulture",
          "code": "0812"
      },
      {
          "name": "Agriculture, not elsewhere classified",
          "code": "0819"
      },
      {
          "name": "Forestry, not further defined",
          "code": "0820"
      },
      {
          "name": "Forestry",
          "code": "0821"
      },
      {
          "name": "Forestry, not elsewhere classified",
          "code": "0829"
      },
      {
          "name": "Fisheries, not further defined",
          "code": "0830"
      },
      {
          "name": "Fisheries",
          "code": "0831"
      },
      {
          "name": "Fisheries, not elsewhere classified",
          "code": "0839"
      },
      {
          "name": "Veterinary, not further defined",
          "code": "0840"
      },
      {
          "name": "Veterinary",
          "code": "0841"
      },
      {
          "name": "Veterinary, not elsewhere classified",
          "code": "0849"
      },
      {
          "name": "Agriculture, forestry, fisheries, veterinary, inter-disciplinary programmes",
          "code": "0888"
      },
      {
          "name": "Health, not further define",
          "code": "0910"
      },
      {
          "name": "Dental studies",
          "code": "0911"
      },
      {
          "name": "Medicine",
          "code": "0912"
      },
      {
          "name": "Nursing and midwifery",
          "code": "0913"
      },
      {
          "name": "Medical diagnostic and treatment technology",
          "code": "0914"
      },
      {
          "name": "Therapy and rehabilitation",
          "code": "0915"
      },
      {
          "name": "Pharmacy",
          "code": "0916"
      },
      {
          "name": "Traditional and complementary medicine and therapy",
          "code": "0917"
      },
      {
          "name": "Health, not elsewhere classified",
          "code": "0919"
      },
      {
          "name": "Welfare, not further defined",
          "code": "0920"
      },
      {
          "name": "Care of the elderly and of disabled adults",
          "code": "0921"
      },
      {
          "name": "Child care and youth services",
          "code": "0922"
      },
      {
          "name": "Social work and counselling",
          "code": "0923"
      },
      {
          "name": "Welfare, not elsewhere classified",
          "code": "0929"
      },
      {
          "name": "Health and Welfare, inter-disciplinary programmes",
          "code": "0988"
      },
      {
          "name": "Services not further defined",
          "code": "1000"
      },
      {
          "name": "Personal services, not further defined",
          "code": "1010"
      },
      {
          "name": "Domestic services",
          "code": "1011"
      },
      {
          "name": "Hair and beauty services",
          "code": "1012"
      },
      {
          "name": "Hotel, restaurants and catering",
          "code": "1013"
      },
      {
          "name": "Sports",
          "code": "1014"
      },
      {
          "name": "Travel, tourism and leisure",
          "code": "1015"
      },
      {
          "name": "Personal services, not elsewhere classified",
          "code": "1019"
      },
      {
          "name": "Hygiene and occupational health services, not further defined",
          "code": "1020"
      },
      {
          "name": "Community sanitation",
          "code": "1021"
      },
      {
          "name": "Occupational health and safety",
          "code": "1022"
      },
      {
          "name": "Hygiene and occupational health services, not elsewhere classified",
          "code": "1029"
      },
      {
          "name": "Security services, not further defined",
          "code": "1030"
      },
      {
          "name": "Military and defence",
          "code": "1031"
      },
      {
          "name": "Protection of persons and property",
          "code": "1032"
      },
      {
          "name": "Security services, not elsewhere classified",
          "code": "1039"
      },
      {
          "name": "Transport services, not further defined",
          "code": "1040"
      },
      {
          "name": "Transport services",
          "code": "1041"
      },
      {
          "name": "Transport services, not elsewhere classified",
          "code": "1049"
      },
      {
          "name": "Services, inter-disciplinary programmes",
          "code": "1088"
      }
  ]


  return (
    <ModuleCsvContext.Provider value={{ data, setData, originalData, setOriginalData, slicedData, setSlicedData, alasqlQuery, setAlasqlQuery, alasqlQueryBefore, setAlasqlQueryBefore, alasqlQuerySource, setAlasqlQuerySource, alasqlQueryAfter, setAlasqlQueryAfter, inputFileValue, setInputFileValue, currentWorkbook, setCurrentWorkbook, availableWorkSheets, setAvailableWorkSheets, currentWorksheet, setCurrentWorksheet, availableColumns, setAvailableColumns, currentGroupByColumn, setCurrentGroupByColumn, useGroupBy, setUseGroupBy, erasmusCodes, setErasmusCodes, institutionNames, setInstitutionNames, selectedErasmusCode, setSelectedErasmusCode, selectedInstitutionName, setSelectedInstitutionName, dataFiltered, setDataFiltered, lastUpdate, setLastUpdate, filters, setFilters, handleFilterChange, handleFilterOptionsChange, resetAllFilters, resetOrdinalFilters, alasqlRemoveDataAfterFirstEmptyRow, handleDownloadXLSX, iscedFCodes }}>
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
