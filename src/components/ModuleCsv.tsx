import { useState, useEffect } from 'react';
import '../App.css';
import { Box, Button, TextField, Typography } from '@mui/material';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { useThemeContext } from '../contexts/ThemeContext';
import { useModalContext } from '../contexts/ModalContext';

import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { useModuleCsvContext } from '../contexts/ModuleCsvContext';
import { useTranslation } from 'react-i18next';
import ModuleCsvDetailsBtn from './ModuleCsvDetailsBtn';


alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;

function ModuleCsv() {

    const { t } = useTranslation();
    const { dataGridTableHeight, trimRows, rowWithColumnNames } = useThemeContext();
    const { modalOpen } = useModalContext();

    const  { data, setData, originalData, setOriginalData, slicedData, setSlicedData, alasqlQuery, setAlasqlQuery, alasqlQueryBefore, setAlasqlQueryBefore, alasqlQuerySource, setAlasqlQuerySource, alasqlQueryAfter, setAlasqlQueryAfter, inputFileValue, setInputFileValue, currentWorkbook, setCurrentWorkbook, availableWorkSheets, setAvailableWorkSheets, currentWorksheet, setCurrentWorksheet, availableColumns, setAvailableColumns, currentGroupByColumn, setCurrentGroupByColumn, useGroupBy, setUseGroupBy, erasmusCodes, setErasmusCodes, institutionNames, setInstitutionNames, selectedErasmusCode, setSelectedErasmusCode, selectedInstitutionName, setSelectedInstitutionName, dataFiltered, setDataFiltered, lastUpdate, setLastUpdate, alasqlRemoveDataAfterFirstEmptyRow } = useModuleCsvContext();

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
      let newCurrentWorksheetRange = currentWorkbook.Sheets[currentWorksheet]["!ref"];

      //Replace A1 with A + rowWithColumnNames
      newCurrentWorksheetRange = newCurrentWorksheetRange.replace(/A(.*?):/, `A${rowWithColumnNames}:`);

      // Use RegExp to find and replace the sheetid value
      let updatedSource = alasqlQuerySource.replace(
        /{sheetid: "(.*?)", autoExt: false/,
        `{sheetid: "${currentWorksheet}", autoExt: false`
      );

      // Use RegExp to find and replace the range value
      updatedSource = updatedSource.replace(
        /range: "(.*?)"/,
        `range: "${newCurrentWorksheetRange}"`
      );

      updateAvailableColumns(currentWorkbook, currentWorksheet, newCurrentWorksheetRange);
      setAlasqlQuerySource(updatedSource);
      // setCurrentWorksheetRange(newCurrentWorksheetRange);
    }
  }, [currentWorksheet, rowWithColumnNames]);

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
  // fetch('./umowy.xlsx')
  //   .then((response) => response.blob())
  //   .then((blob) => {
  //     const file = new File([blob], 'umowy.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //     handleFileChange(file);
  //   })
  //   .catch((error) => console.error("Error loading file:", error));

   fetch('./iias.csv')
  .then((response) => response.text())
  .then((csvText) => {
    // Remove first line if it declares separator (sep=;)
    const cleanedCsv = csvText.replace(/^sep=.*\r?\n/, "");

    const file = new File([cleanedCsv], 'iias.csv', { type: 'text/csv' });
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
  alasql.promise('SELECT DISTINCT [CSVTH_ERASMUS_CODE] FROM ? WHERE [CSVTH_STATUS] != "CSVTD_DRAFT" ORDER BY [CSVTH_ERASMUS_CODE]', [data]).then((codes) => {
    const newErasmusCodes = codes.map((item) => item["CSVTH_ERASMUS_CODE"]);
    setErasmusCodes(() => newErasmusCodes);
  });

  alasql.promise('SELECT DISTINCT [CSVTH_INSTITUTION_NAME] FROM ? WHERE [CSVTH_STATUS] != "CSVTD_DRAFT" ORDER BY [CSVTH_INSTITUTION_NAME]', [data]).then((institutions) => {
    const newInstitutionNames = institutions.map((item) => item["CSVTH_INSTITUTION_NAME"]);
    setInstitutionNames(() => newInstitutionNames);
  });
}, [data])

//CSV TABLE - COLUMNS VISIBLE IN TABLE
const visibleColumns = ['CSVTH_MOBILITY_TYPE', 'CSVTH_NUMBER_OF_MOBILITIES', 'CSVTH_STATUS', 'CSVTH_SUBJECT_AREA', 'CSVTH_SUBJECT_AREA_DESCRIPTION', 'CSVTH_OPTIONS'];

//watch for changes: selectedErasmusCode, selectedInstitutionName
useEffect(() => {
  if (selectedErasmusCode && selectedInstitutionName) {
    alasql.promise(
      'SELECT *, CSVTH_OPTIONS FROM ? WHERE [CSVTH_ERASMUS_CODE] = ? AND [CSVTH_STATUS] != "CSVTD_DRAFT"',
      [data, selectedErasmusCode]
    ).then((result) => {
      // Reorder keys so CSVTH_OPTIONS is last
      const reordered = result.map(row => {
        const { CSVTH_OPTIONS, ...rest } = row;
        return { ...rest, CSVTH_OPTIONS }; // put it at the end
      });
      setDataFiltered(() => reordered);
    });

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
      setAlasqlQueryBefore('SELECT ROWNUM() AS id, CASE WHEN [partner_1_ec] = "PL LUBLIN02" THEN [partner_2_ec] ELSE [partner_1_ec] END AS CSVTH_ERASMUS_CODE, CASE WHEN [partner_1_hei_name] = "KATOLICKI UNIWERSYTET LUBELSKI JANA PAWLA II" THEN [partner_2_hei_name] ELSE [partner_1_hei_name] END AS CSVTH_INSTITUTION_NAME, CASE WHEN [coop_cond_type] = "staff_teachers" AND [coop_cond_sending_hei_id] = "kul.pl" THEN "CSVTD_OUTGOING_STA" WHEN [coop_cond_type] = "staff_teachers" AND [coop_cond_sending_hei_id] != "kul.pl" THEN "CSVTD_INCOMING_STA" WHEN [coop_cond_type] = "staff_training" AND [coop_cond_sending_hei_id] = "kul.pl" THEN "CSVTD_OUTGOING_STT" WHEN [coop_cond_type] = "staff_training" AND [coop_cond_sending_hei_id] != "kul.pl" THEN "CSVTD_INCOMING_STT" WHEN [coop_cond_type] = "student_studies" AND [coop_cond_sending_hei_id] = "kul.pl" THEN "CSVTD_OUTGOING_SMS" WHEN [coop_cond_type] = "student_studies" AND [coop_cond_sending_hei_id] != "kul.pl" THEN "CSVTD_INCOMING_SMS" WHEN [coop_cond_type] = "student_traineeship" AND [coop_cond_sending_hei_id] = "kul.pl" THEN "CSVTD_OUTGOING_SMT" WHEN [coop_cond_type] = "student_traineeship" AND [coop_cond_sending_hei_id] != "kul.pl" THEN "CSVTD_INCOMING_SMT" END AS CSVTH_MOBILITY_TYPE, CASE WHEN [coop_cond_eqf] IS NOT NULL AND [coop_cond_eqf] != "" THEN CAST([coop_cond_eqf] AS STRING) WHEN ([coop_cond_eqf] IS NULL OR [coop_cond_eqf] = "") AND [coop_cond_type] LIKE "staff%" THEN "CSVTD_NOT_APPLICABLE" ELSE "CSVTD_NULL" END AS CSVTH_EQF, CASE WHEN [coop_cond_blended_mobility] = "YES" THEN "CSVTD_YES" WHEN [coop_cond_blended_mobility] = "NO" THEN "CSVTD_NO" ELSE "CSVTD_NOT_APPLICABLE" END AS CSVTH_BLENDED, [coop_cond_total_people] AS CSVTH_NUMBER_OF_MOBILITIES, CASE WHEN [iia_status] = "approved-by-all" THEN "CSVTD_APPROVED_BY_ALL" WHEN [iia_status] = "approved" AND [partner_1_hei_id] = "kul.pl" THEN "CSVTD_WAITING_FOR_THEIR_SIGNATURE" WHEN [iia_status] = "approved" AND [partner_1_hei_id] != "kul.pl" THEN "CSVTD_WAITING_FOR_OUR_SIGNATURE" WHEN [iia_status] = "submitted" AND [partner_1_hei_id] = "kul.pl" THEN "CSVTD_BEING_VERIFIED_BY_THEM" WHEN [iia_status] = "submitted" AND [partner_1_hei_id] != "kul.pl" THEN "CSVTD_BEING_VERIFIED_BY_US" WHEN [iia_status] = "draft" THEN "CSVTD_DRAFT" END AS CSVTH_STATUS, CASE WHEN [coop_cond_subject_area] IS NULL OR [coop_cond_subject_area] = "" THEN "CSVTD_NULL" WHEN [coop_cond_subject_area] LIKE "%,%" OR [coop_cond_subject_area] LIKE "0%" THEN [coop_cond_subject_area] ELSE "0" + [coop_cond_subject_area] END AS CSVTH_SUBJECT_AREA, CASE WHEN [coop_cond_subject_area_clarification] IS NULL OR [coop_cond_subject_area_clarification] = "" THEN "CSVTD_NULL" ELSE [coop_cond_subject_area_clarification] END AS CSVTH_SUBJECT_AREA_DESCRIPTION, CASE WHEN [coop_cond_language] IS NULL OR [coop_cond_language] = "" THEN "CSVTD_NULL" ELSE [coop_cond_language] END AS CSVTH_LANGUAGE_REQUIREMENTS, [coop_cond_academic_year_start] AS CSVTH_FROM, [coop_cond_academic_year_end] AS CSVTH_TO');
      setAlasqlQuerySource(`FROM ${fileExtension}("${tmppath}", {separator: ";", sheetid: "${defaultSheetName}", autoExt: false, range: "${defaultWorksheetRange}"})`);
      setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');

      // Load data into AlaSQL and set state
      alasql.promise(`SELECT * ${alasqlQuerySource}`).then((result) => {
        setData(() => result);
        setOriginalData(() => result);
        let firstEmptyRowIndex = result.findIndex(obj => Object.keys(obj).length === 0);
        setSlicedData(() => result.slice(0, firstEmptyRowIndex));
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
    <Box>

      {erasmusCodes.length > 0 && institutionNames.length > 0 && data.length > 0 && (
        <>
          <Autocomplete
          disablePortal
          value={selectedErasmusCode}
          options={erasmusCodes}
          sx={{ width: 300 }}
          renderInput={(params) => <TextField {...params} label={t('ERASMUS_CODE')} />}
          onChange={(e, value) => {
            setSelectedErasmusCode(value ? value : null)
            if (value) {
              //find matching institution name
              alasql.promise(`SELECT DISTINCT [CSVTH_INSTITUTION_NAME] FROM ? WHERE [CSVTH_ERASMUS_CODE] = ?`, [data, value]).then((result) => {
                if (result.length > 0) {
                  setSelectedInstitutionName(() => result[0]['CSVTH_INSTITUTION_NAME']);
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
          renderInput={(params) => <TextField {...params} label={t('INSTITUTION_NAME')} />}
          onChange={(e, value) => {
            setSelectedInstitutionName(value ? value : null);
            if (value) {
              // find matching Erasmus code
              alasql.promise(`SELECT DISTINCT [CSVTH_ERASMUS_CODE] FROM ? WHERE [CSVTH_INSTITUTION_NAME] = ?`, [data, value]).then((result) => {
                if (result.length > 0) {
                  setSelectedErasmusCode(() => result[0]['CSVTH_ERASMUS_CODE']);
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
            <b>{t('THIS_INSTITUTION_NAME')}&nbsp;({t('THIS_INSTITUTION_EC')})&nbsp;</b>{t('CSV_INSTITUTION_HAS_IIA_WITH_PARTNER')} <b>{selectedInstitutionName && selectedInstitutionName.replace(/ /g, '\u00A0')}&nbsp;({selectedErasmusCode && selectedErasmusCode.replace(/ /g, '\u00A0')})</b> {t('CSV_IN_SCOPE')}:
          </Typography>

          <Typography sx={{ fontSize: 12, textAlign: 'center', mb: 2 }}>
            ({t('AS_OF')}&nbsp;{lastUpdate})
          </Typography>
          <TableContainer
            component={Paper}
            sx={{ maxHeight: dataGridTableHeight + 'px', overflow: 'auto' }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  {visibleColumns.map((key) => (
                    <TableCell
                      sx={{ fontWeight: 'bold', textAlign: 'center' }}
                      key={key}
                    >
                      {t(key)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {dataFiltered.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {visibleColumns.map((key, colIndex) => (
                      <TableCell key={colIndex}>
                        {row[key] instanceof Date
                          ? row[key].toLocaleDateString()
                          : row[key]
                          ? String(row[key]).startsWith('CSVTD_')
                            ? t(String(row[key]))
                            : String(row[key])
                          : <ModuleCsvDetailsBtn data={data} rowId={row.id} />}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}

      </Box>
     );
}

export default ModuleCsv;