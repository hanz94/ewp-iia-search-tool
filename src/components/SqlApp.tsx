import { useState, useEffect } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import '../App.css';
import { FormGroup, FormControl, InputLabel, Select, MenuItem, TextField, Typography, Checkbox, Box, FormControlLabel } from '@mui/material';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { MuiFileInput } from 'mui-file-input';
import { useThemeContext } from '../contexts/ThemeContext';
import { useModalContext } from '../contexts/ModalContext';
import kulLogoBlack from '../assets/kul_logo-black.jpg';

import Switch from '@mui/material/Switch';

import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import SettingsIcon from '@mui/icons-material/Settings';
import { DataGrid } from '@mui/x-data-grid';
import { plPL } from '@mui/x-data-grid/locales';
import ModalWindow from './ModalWindow';
import newModalContent from '../utils/newModalContent';


alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;


function SqlApp() {

  const { mode, setMode, dataGridTableHeight, dataGridColumnWidth, trimRows, rowWithColumnNames } = useThemeContext();
  const { modalOpen } = useModalContext();

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
  const [currrentWorksheet, setCurrentWorksheet] = useState('');
  // const [currentWorksheetRange, setCurrentWorksheetRange] = useState('');
  const [availableColumns, setAvailableColumns] = useState([]);
  const [currentGroupByColumn, setCurrentGroupByColumn] = useState('');

  const [useDataGrid, setUseDataGrid] = useState(true);  // true - render DataGrid (with filters), false - render Table (without filters)
  const [useGroupBy, setUseGroupBy] = useState(false);

  const [erasmusCodes, setErasmusCodes] = useState([]);
  const [institutionNames, setInstitutionNames] = useState([]);

  const [selectedErasmusCode, setSelectedErasmusCode] = useState(null);
  const [selectedInstitutionName, setSelectedInstitutionName] = useState(null);
  const [dataFiltered, setDataFiltered] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  //remove data after empty rows - fix for group by
const alasqlRemoveDataAfterFirstEmptyRow = function (rows) {
  // Find the index of the first empty row
  const emptyRowIndex = rows.findIndex(row =>
      Object.values(row).every(value => value === null || value === undefined || value === "")
  );
  // Return rows up to the first empty row
  return emptyRowIndex === -1 ? rows : rows.slice(0, emptyRowIndex);
};

  //execute AlaSQL query
  useEffect(() => {
    if (inputFileValue && alasqlQuery && useGroupBy && trimRows === 'true') {
        alasql.promise('SELECT * ' + alasqlQuerySource)
        .then((result) => {
          let tmpData = result;
          tmpData = alasqlRemoveDataAfterFirstEmptyRow(tmpData);

          alasql.promise(alasqlQueryBefore + ' FROM ? ' + alasqlQueryAfter, [tmpData])
          .then((result) => {
            setData(() => result);
            setOriginalData(() => result);
            setSlicedData(() => result);
          })
          .catch((error) => {
            console.error('Error fetching data:', error);
            setData([]);
          });
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setData([]);
        });
      }
      else if (inputFileValue && alasqlQuery) {
        alasql.promise(alasqlQuery)
        .then((result) => {
          setData(result);
          setOriginalData(result);
          let firstEmptyRowIndex = result.findIndex(obj => Object.keys(obj).length === 0);
          setSlicedData(result.slice(0,firstEmptyRowIndex));
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          setData([]);
        });
      }
  }, [alasqlQuery, useGroupBy, trimRows]);

  //merge AlaSQL query
  useEffect(() => {
    if (alasqlQueryBefore || alasqlQuerySource || alasqlQueryAfter) {
      setAlasqlQuery(alasqlQueryBefore + ' ' + alasqlQuerySource + ' ' + alasqlQueryAfter);
    } else {
      setAlasqlQuery(''); // Reset alasqlQuery when all inputs are empty
    }
  }, [alasqlQueryBefore, alasqlQuerySource, alasqlQueryAfter]);

  //Change current worksheet
  useEffect(() => {
    if (inputFileValue && alasqlQuerySource) {

      // Get the current worksheet range
      let newCurrentWorksheetRange = currentWorkbook.Sheets[currrentWorksheet]["!ref"];

      //Replace A1 with A + rowWithColumnNames
      newCurrentWorksheetRange = newCurrentWorksheetRange.replace(/A(.*?):/, `A${rowWithColumnNames}:`);

      // Use RegExp to find and replace the sheetid value
      let updatedSource = alasqlQuerySource.replace(
        /{sheetid: "(.*?)", autoExt: false/,
        `{sheetid: "${currrentWorksheet}", autoExt: false`
      );

      // Use RegExp to find and replace the range value
      updatedSource = updatedSource.replace(
        /range: "(.*?)"/,
        `range: "${newCurrentWorksheetRange}"`
      );

      updateAvailableColumns(currentWorkbook, currrentWorksheet, newCurrentWorksheetRange);
      setAlasqlQuerySource(updatedSource);
      // setCurrentWorksheetRange(newCurrentWorksheetRange);
    }
  }, [currrentWorksheet, rowWithColumnNames]);


  //Group by
  useEffect(() => {
    if (!inputFileValue) {
      return;
    }
    if (inputFileValue && useGroupBy && currentGroupByColumn) {
      setAlasqlQueryBefore(`SELECT [${currentGroupByColumn}], COUNT(*)`);
      setAlasqlQueryAfter(`WHERE [${currentGroupByColumn}] IS NOT NULL GROUP BY [${currentGroupByColumn}]`);
    }
    else {
      setAlasqlQueryBefore('SELECT *');
      setAlasqlQueryAfter('');
    }
}, [useGroupBy, currentGroupByColumn]);

//Trim the first empty row and all rows below
useEffect(() => {

  if (inputFileValue && trimRows === 'true') {
    setData(slicedData);
  }
  else if (inputFileValue && trimRows !== 'true') {
    setData(originalData);
  }

}, [originalData, slicedData, trimRows]);

//fetch file on load
useEffect(() => {
  fetch('./umowy.xlsx')
    .then((response) => response.blob())
    .then((blob) => {
      const file = new File([blob], 'umowy.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      handleFileChange(file);
    })
    .catch((error) => console.error("Error loading file:", error));

  //fetch last update
  fetch('./lastupdate.txt')
    .then((response) => response.text())
    .then((text) => {
      setLastUpdate(text);
    })
    .catch((error) => console.error("Error loading last update:", error));
}, []);

//watch for data to update erasmuscodes and institutionnames
useEffect(() => {
  alasql.promise('SELECT DISTINCT [KOD ERASMUS] FROM ? WHERE [STATUS] != "Szkic" ORDER BY [KOD ERASMUS]', [data]).then((codes) => {
    const newErasmusCodes = codes.map((item) => item["KOD ERASMUS"]);
    setErasmusCodes(() => newErasmusCodes);
  });

  alasql.promise('SELECT DISTINCT [NAZWA UCZELNI] FROM ? WHERE [STATUS] != "Szkic" ORDER BY [NAZWA UCZELNI]', [data]).then((institutions) => {
    const newInstitutionNames = institutions.map((item) => item["NAZWA UCZELNI"]);
    setInstitutionNames(() => newInstitutionNames);
  });
}, [data])


//watch for changes: selectedErasmusCode, selectedInstitutionName
useEffect(() => {
  if (selectedErasmusCode && selectedInstitutionName) {
    alasql.promise('SELECT [TYP MOBILNOŚCI], [WYJAZD LUB PRZYJAZD], [LICZBA MOBILNOŚCI], [EQF], [STATUS], [OD], [DO], [ZAKRES WSPÓŁPRACY], [OPIS] FROM ? WHERE [KOD ERASMUS] = ? AND [STATUS] != "Szkic"', [data, selectedErasmusCode]).then((result) => {
      setDataFiltered(() => result);
    })
  }
}, [selectedErasmusCode, selectedInstitutionName]);

const handleFileChange = (newInputValue) => {
  const file = newInputValue;
  const fileName = file.name;
  const fileExtension = fileName.split('.').pop()?.toLowerCase();

  if (fileExtension === 'csv' || fileExtension === 'xls' || fileExtension === 'xlsx') {
    const reader = new FileReader();

    reader.onload = (e) => {
      let data = e.target.result; // Binary string or array buffer
      let workbook = XLSX.read(data, { type: 'binary' });

      setCurrentWorkbook(() => workbook);
      setAvailableWorkSheets(() => workbook.SheetNames);

      const defaultSheetName = workbook.SheetNames[workbook.SheetNames.length - 1];
      setCurrentWorksheet(() => defaultSheetName);

      let defaultWorksheetRange = workbook.Sheets[defaultSheetName]["!ref"];
      defaultWorksheetRange = defaultWorksheetRange.replace('A1', `A${rowWithColumnNames}`);

      updateAvailableColumns(workbook, defaultSheetName, defaultWorksheetRange);

      let tmppath = URL.createObjectURL(file);

      setInputFileValue(() => file);
      setAlasqlQueryBefore('SELECT *');
      setAlasqlQuerySource(`FROM ${fileExtension}("${tmppath}", {sheetid: "${defaultSheetName}", autoExt: false, range: "${defaultWorksheetRange}"})`);
      setAlasqlQueryAfter('');

      // Load data into AlaSQL and set state
      alasql.promise(`SELECT * ${alasqlQuerySource}`).then((result) => {
        setData(() => result);
        setOriginalData(() => result);
        let firstEmptyRowIndex = result.findIndex(obj => Object.keys(obj).length === 0);
        setSlicedData(() => result.slice(0, firstEmptyRowIndex));

        // console.log(result);

        // // Populate Erasmus codes and institution names after data is loaded
        // alasql.promise('SELECT DISTINCT [KOD ERASMUS] FROM ? ORDER BY [KOD ERASMUS]', [result]).then((codes) => {
        //   const newErasmusCodes = codes.map((item) => item["KOD ERASMUS"]);
        //   setErasmusCodes(() => newErasmusCodes);
        // });

        // alasql.promise('SELECT DISTINCT [NAZWA UCZELNI] FROM ? ORDER BY [NAZWA UCZELNI]', [result]).then((institutions) => {
        //   const newInstitutionNames = institutions.map((item) => item["NAZWA UCZELNI"]);
        //   setInstitutionNames(() => newInstitutionNames);
        // });
      });
    };

    reader.readAsBinaryString(file);
  } else {
    setInputFileValue('');
    alert('Invalid file type! Please upload a CSV, XLS, or XLSX file.');
  }
};


const updateAvailableColumns = (workbook, sheetName, range) => {
  const worksheet = workbook.Sheets[sheetName];
  const sheetRange = XLSX.utils.decode_range(range);
  // const sheetRange = XLSX.utils.decode_range(worksheet["!ref"]);

  // Extract column headers (first row values)
  const columnHeaders = [];
  for (let colIndex = sheetRange.s.c; colIndex <= sheetRange.e.c; colIndex++) {
    const cellAddress = XLSX.utils.encode_cell({ r: rowWithColumnNames - 1, c: colIndex }); // Get the cell address in the first row
    const cellValue = worksheet[cellAddress]?.v; // Retrieve the cell's value
    if (cellValue) columnHeaders.push(cellValue);
  }

  setAvailableColumns(columnHeaders); // Set the available columns
  setCurrentGroupByColumn(columnHeaders[0]); // Default group by column - first column
};



    return ( 
        <>
      {/* Page Wrapper */}
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'space-between', flexDirection: 'column', height: '100%', p:2.5, overflow: 'auto'}}>

      <ModalWindow />

      {/* Page Header */}
      <Box sx={{ position: 'relative', top: 0, mb: 1, display: 'flex', justifyContent: 'space-between'}}>
        <Box>
          <img
            src={kulLogoBlack}
            style={{position: 'relative', top: '0px', left: '-31px', width: 105, height: 32, cursor: 'pointer'}}
            onClick={() => window.location.reload()}
            />

          <FormGroup>
            <FormControlLabel control={<Switch />} label="EWP Dashboard" />
          </FormGroup>

        </Box>
        <Box sx={{width: 116}}>
          {/* <SettingsIcon sx={{cursor: 'pointer'}} onClick={() => modalOpen(newModalContent.options)} /> */}
          <DarkModeSwitch checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} size={24} sunColor='currentColor' moonColor='currentColor'
          style={{position: 'absolute', top: '0px', right: '0px'}}/>
        </Box>

      {/* End Page Header */}
      </Box>


      {/* Page App */}
      <Box>

      {erasmusCodes.length > 0 && institutionNames.length > 0 && data.length > 0 && (
        <>

        {/* {console.log(institutionNames)} */}

          <Autocomplete
          disablePortal
          value={selectedErasmusCode}
          options={erasmusCodes}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label="Kod Erasmus+" />}
          onChange={(e, value) => {
            setSelectedErasmusCode(value ? value : null)
            if (value) {
              //find matching institution name
              alasql.promise(`SELECT DISTINCT [NAZWA UCZELNI] FROM ? WHERE [KOD ERASMUS] = ?`, [data, value]).then((result) => {
                if (result.length > 0) {
                  setSelectedInstitutionName(() => result[0]['NAZWA UCZELNI']);
                }
                else {
                  setSelectedInstitutionName(() => null);
                }
              })
            }
            else {
              setSelectedInstitutionName(() => null);
            }
          }}
        />

        <Autocomplete
          disablePortal
          value={selectedInstitutionName}
          options={institutionNames}
          sx={{ minWidth: 500 }}
          renderInput={(params) => <TextField {...params} label="Nazwa instytucji" />}
          onChange={(e, value) => {
            setSelectedInstitutionName(value ? value : null);
            if (value) {
              // find matching Erasmus code
              alasql.promise(`SELECT DISTINCT [KOD ERASMUS] FROM ? WHERE [NAZWA UCZELNI] = ?`, [data, value]).then((result) => {
                if (result.length > 0) {
                  setSelectedErasmusCode(() => result[0]['KOD ERASMUS']);
                } else {
                  setSelectedErasmusCode(() => null);
                }
              });
            } else {
              setSelectedErasmusCode(() => null);
            }
          }}
        />
      </>
      )}

      {(selectedErasmusCode || selectedInstitutionName) && dataFiltered.length > 0 && (
        <>
          <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>
            <b>Katolicki&nbsp;Uniwersytet&nbsp;Lubelski&nbsp;Jana&nbsp;Pawła&nbsp;II&nbsp;(PL&nbsp;LUBLIN02)</b> posiada umowę międzyinstytucjonalną z <b>{selectedInstitutionName && selectedInstitutionName.replace(/ /g, '\u00A0')} ({selectedErasmusCode && selectedErasmusCode.replace(/ /g, '\u00A0')})</b> w podanym zakresie:
          </Typography>

          <Typography sx={{ fontSize: 12, textAlign: 'center', mb: 2 }}>
            (Stan&nbsp;na&nbsp;{lastUpdate})
          </Typography>
          <TableContainer component={Paper} sx={{ maxHeight: dataGridTableHeight + 'px', overflow: 'auto' }}>
            <Table size="small">
                  <TableHead>
                    <TableRow>
                      {Object.keys(dataFiltered[0]).map((key) => (
                        <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }} key={key}>
                          {key}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataFiltered.map((row, rowIndex) => (
                      <TableRow key={rowIndex}>
                        {Object.values(row).map((value, colIndex) => (
                          <TableCell key={colIndex}>
                            {value instanceof Date ? value.toLocaleDateString() : value ? String(value) : "(Brak)"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
        </>
      )}

      {/* End Page App */}
      </Box>
      
      {/* Page Footer */}
      <Box>
      <Typography variant="div" sx={{ fontSize: 10, textAlign: 'center', my: 1 }}>
        Dział Współpracy Międzynarodowej &copy; 2024-2025 Bartłomiej Pawłowski - ExcelSQL v1.4.3
      </Typography>
      </Box>

      {/* End Page Wrapper */}
      </Box>

      </>
     )
}

export default SqlApp;