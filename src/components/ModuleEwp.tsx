import { useState, useEffect, useCallback, useRef } from 'react';
import '../App.css';
import { Button, TextField, Typography, Box, FormControl, FormControlLabel, RadioGroup, Radio} from '@mui/material';

import Autocomplete from '@mui/material/Autocomplete';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgressWithLabel from './LinearProgressWithLabel';

import { useModuleEwpContext } from '../contexts/ModuleEwpContext';
import { useThemeContext } from '../contexts/ThemeContext';



function ModuleEwp() {

  const { getAgreementLabel, formatTimeHeader, formatTimeBody } = useModuleEwpContext();
  const { fetchError, setFetchError, fetchErrorMessage, setFetchErrorMessage, data, setData, erasmusCodes, setErasmusCodes, institutionNames, setInstitutionNames, partnersTimestamp, setPartnersTimestamp, selectedErasmusCode, setSelectedErasmusCode, selectedInstitutionName, setSelectedInstitutionName, selectedHeiID, setSelectedHeiID, selectedHeiTimestamp, setSelectedHeiTimestamp, dataFiltered, setDataFiltered, dataFilteredDetails, setDataFilteredDetails, connected, setConnected } = useThemeContext();

//   const [data, setData] = useState([]);

//   const [erasmusCodes, setErasmusCodes] = useState([]);
//   const [institutionNames, setInstitutionNames] = useState([]);

//   const [selectedErasmusCode, setSelectedErasmusCode] = useState(null);
//   const [selectedInstitutionName, setSelectedInstitutionName] = useState(null);
//   const [selectedHeiID, setSelectedHeiID] = useState(null);
//   const [selectedHeiTimestamp, setSelectedHeiTimestamp] = useState(null);
//   const [dataFiltered, setDataFiltered] = useState([]);
//   const [dataFilteredDetails, setDataFilteredDetails] = useState([]);

//   const [connected, setConnected] = useState(false);

    const [expandedAccordion, setExpandedAccordion] = useState(-1);

    const [selectedCoopCondValue, setSelectedCoopCondValue] = useState('');
    const [selectedCoopCondObject, setSelectedCoopCondObject] = useState(null);

    const [progress, setProgress] = useState(0);
    const hasMounted = useRef(false);


    function getSelectedCoopCondObject(selectedValue, data, index) {
      if (!selectedValue || !data || typeof index !== 'number') return null;
    
      const [prefix, positionStr] = selectedValue.split('-');
      const position = parseInt(positionStr, 10);
    
      if (isNaN(position)) return null;
    
      const map = {
        sta: 'staff_teachers',
        stt: 'staff_trainings',
        sms: 'student_studies',
        smt: 'student_traineeships',
      };
    
      const arrayName = map[prefix];
      if (!arrayName) return null;
    
      const targetArray = data[index]?.cooperation_conditions?.[arrayName];
      if (!Array.isArray(targetArray) || position >= targetArray.length) return null;
    
      return targetArray[position];
    }  
    
  function getMobilityType(radioValue) {
    const prefix = radioValue.split('-')[0];
    const map = {
      sta: 'Mobilność pracowników w celu prowadzenia zajęć dydaktycznych',
      stt: 'Mobilność pracowników w celach szkoleniowych',
      sms: 'Mobilność studentów w celu studiowania',
      smt: 'Mobilność studentów w ramach praktyk',
    }
    return map[prefix];
  }

  const handleInitialFetch = useCallback(() => {
    fetch('http://localhost:10300/status')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    })
    .then((data) => {
      if (data?.connection && data?.token) {
        setConnected(true);
  
  //start of all partners fetch
        const eventSource = new EventSource('http://localhost:10300/stream/partners');

        eventSource.onmessage = (event) => {
          const message = JSON.parse(event.data);
      
          if (message.error) {
            console.error('Error from server:', message.error);
            eventSource.close();
            return;
          }
      
          if (message.progress && !message.done) {
            // Update a progress bar
            setProgress(parseInt(message.progress));
          }
      
          if (message.done) {
            const data = message.data;
      
            setData(() => data);
      
            // Parse erasmus codes and institution names
            setErasmusCodes(() => data.map((item) => item.partnerErasmusCode).filter(Boolean).sort());
            setInstitutionNames(() => data.map((item) => item.partnerName).filter(Boolean).sort());
      
            eventSource.close();
            setPartnersTimestamp(Date.now());
          }
        };
      
        eventSource.onerror = (err) => {
          console.error('SSE connection error:', err);
          eventSource.close();
        };
  //end of all partners fetch
      } 
      else if (data?.connection && !data?.token) {
        setConnected(false);
        setFetchError(true);
        setFetchErrorMessage('invalid token');
      }
      else {
        setConnected(false);
        setFetchError(true);
        setFetchErrorMessage('status error');
      }
    })
    .catch((err) => {
      console.error('Status check failed:', err);
      setConnected(false);
      setFetchError(true);
      setFetchErrorMessage('initial fetch error');
    });
  
  }, []);

  //fetch info on first load
  useEffect(() => {
    if (erasmusCodes.length > 0 || institutionNames.length > 0 || data.length > 0) return;
    handleInitialFetch();
  }, []);
  
  //watch for changes: selectedErasmusCode, selectedInstitutionName
  useEffect(() => {
    //prevent fetching on mount when dataFiltered (IIA details) was fetched previously
    if (!hasMounted.current) return;
    hasMounted.current = true;

    //fetch dataFiltered on every Autocomplete change
    setDataFiltered([]);
    setDataFilteredDetails([]);
    setSelectedCoopCondValue('');
    setSelectedCoopCondObject(null);
    if (selectedErasmusCode && selectedInstitutionName) {
      fetch(`http://localhost:10300/partners/partner/${selectedHeiID}`)
        .then((res) => res.json())
        .then((data) => {
          setDataFiltered(data);
          setSelectedHeiTimestamp(Date.now());
  
          const detailPromises = data.map((item) =>
            fetch(`http://localhost:10300/iia/details/${item.id}`)
              .then((res) => res.json())
              .catch((err) => {
                console.error(`Error loading iia-details for IIA: ${item.id}`, err);
                return null; // keep array index alignment
              })
          );
  
          Promise.all(detailPromises).then((details) => {
            setDataFilteredDetails(details);
          });
        })
        .catch((err) =>
          console.error(`Error loading iia-details for HEI: ${selectedHeiID}`, err)
        );
    }
  }, [selectedErasmusCode, selectedInstitutionName]);

    return ( 
    <Box>

    {connected && erasmusCodes.length > 0 && institutionNames.length > 0 && data.length > 0 ? (
        <>

        {/* {console.log(institutionNames)} */}

        <Autocomplete
        disablePortal
        value={selectedErasmusCode}
        options={erasmusCodes}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label="Kod Erasmus+" />}
        onChange={(e, value) => {
            hasMounted.current = true;
            setSelectedErasmusCode(value ? value : null)

            if (value) {
            const matchedInstitution = data.find(
                (item) => item.partnerErasmusCode === value
            );
        
            if (matchedInstitution) {
                setSelectedInstitutionName(matchedInstitution.partnerName);
                setSelectedHeiID(matchedInstitution.heiID);
            } else {
                setSelectedInstitutionName(null);
                setSelectedHeiID(null);
            }
            } else {
            setSelectedInstitutionName(null);
            setSelectedHeiID(null);
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
            hasMounted.current = true;
            setSelectedInstitutionName(() => value ? value : null)

            if (value) {
            const matchedInstitution = data.find(
                (item) => item.partnerName === value
            );
        
            if (matchedInstitution) {
                setSelectedErasmusCode(matchedInstitution.partnerErasmusCode);
                setSelectedHeiID(matchedInstitution.heiID);
            } else {
                setSelectedInstitutionName(null);
                setSelectedHeiID(null);
            }
            } else {
            setSelectedInstitutionName(null);
            setSelectedHeiID(null);
            }
        }}
        />
        {(!selectedErasmusCode || !selectedInstitutionName) && (
          <>
            <Typography sx={{ fontSize: 13, textAlign: 'center', mt: 0.4 }}>EWP Dashboard</Typography>
            <Typography sx={{ fontSize: 12, textAlign: 'center' }}>Ostatnia aktualizacja: {new Date(partnersTimestamp).toLocaleString()} </Typography>
          </>
        )}
    </>
    )
    : (!connected && erasmusCodes.length === 0 && institutionNames.length === 0 && data.length === 0 && !fetchError) ?
    (
    <>
    <CircularProgress />
    <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>Łączenie z EWP Dashboard...</Typography>
    </>
    )
    : (!connected && erasmusCodes.length === 0 && institutionNames.length === 0 && data.length === 0 && fetchError) ?
    (
    <>
    <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>Błąd łączenia z serwerem ({fetchErrorMessage})</Typography>
    <Button
        variant="contained"
        size="small"
        onClick={() => {
          setFetchError(false);
          handleInitialFetch();
        }}
        sx={{ display: 'block', mx: 'auto', mt: 1 }}
      >
        Odśwież
    </Button>
    </>
    )
    : (connected && erasmusCodes.length === 0 && institutionNames.length === 0 && data.length === 0) &&
    (
    <>
    <CircularProgress />
    <Typography sx={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', mt: 1, ml: -1 }}>✅ Połączono z EWP Dashboard</Typography>
    <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>Przygotowuję listę uczelni partnerskich...</Typography>
    <LinearProgressWithLabel value={progress} />
    </>
    )}

    {/* {selectedErasmusCode && selectedInstitutionName && selectedHeiID &&
        <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>{selectedHeiID}</Typography>
    } */}

    {(selectedErasmusCode && selectedInstitutionName && selectedHeiID && dataFiltered.length > 0) ? (
        <>
        {/* <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>{JSON.stringify(dataFiltered, null, 2)}</Typography> */}

        <Typography sx={{ fontSize: 12, textAlign: 'center' }}>
            <b>Katolicki&nbsp;Uniwersytet&nbsp;Lubelski&nbsp;Jana&nbsp;Pawła&nbsp;II&nbsp;(PL&nbsp;LUBLIN02)</b> posiada {dataFiltered.length} {getAgreementLabel(dataFiltered.length)} z <b>{selectedInstitutionName.replace(/ /g, '\u00A0')} ({selectedErasmusCode.replace(/ /g, '\u00A0')})</b>:
        </Typography>
        <Typography sx={{ fontSize: 12, textAlign: 'center', mb: 2 }}>
            Stan na {new Date(selectedHeiTimestamp).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '').replace(/\./g, '-')}
        </Typography>

        {dataFiltered.map((item, index) => {
          const isExpanded = expandedAccordion === index; 
    
          return (
            <Accordion key={index} sx={{ mt: 1.1 }} expanded={isExpanded}
              onChange={(e, newExpanded) => {
                // Toggle logic
                setExpandedAccordion(newExpanded ? index : null);

                //reset selected cooperation condition on every open/close
                setSelectedCoopCondValue('');
                setSelectedCoopCondObject(null);
              }}
            >
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
                sx={{ userSelect: 'none' }}
            >
                <Box component="span" sx={{ width: '50%' }}>
                <Typography sx={{ mb: 0.3 }}>
                    Umowa z {selectedHeiID.toUpperCase()} ({index+1})
                </Typography>
                {dataFilteredDetails.length > 0 && (
                    <>
                    <Typography sx={{ fontSize: '0.8em'}}>
                        Ostatnia modyfikacja:
                    </Typography>
                    <Typography sx={{ fontSize: '0.75em'}}>
                        {formatTimeHeader(dataFilteredDetails[index]?.changed_time)}
                    </Typography>
                    </>
                )}
                </Box>
                <Box component="span" sx={{ width: '50%', }}>
                {dataFilteredDetails.length > 0 && (
                <>
                    <Typography sx={{ fontSize: '0.95em', mt: 0.15 }}>
                    {
                        item.iia_status === 'approved-by-all'
                        ? 'Podpisana przez obie strony'
                        : item.iia_status === 'approved' && dataFilteredDetails[index]?.last_author ==='kul.pl'
                        ? `Oczekuje na podpis ${selectedHeiID.toUpperCase()}`
                        : item.iia_status === 'approved' && dataFilteredDetails[index]?.last_author !='kul.pl'
                        ? 'Oczekuje na podpis KUL'
                        : item.iia_status === 'submitted' && dataFilteredDetails[index]?.last_author ==='kul.pl'
                        ? `Weryfikowana przez ${selectedHeiID.toUpperCase()}`
                        : item.iia_status === 'submitted' && dataFilteredDetails[index]?.last_author !='kul.pl'
                        ? 'Weryfikowana przez KUL'
                        : item.iia_status
                    }
                </Typography>
                </>
                )}
                </Box>
            </AccordionSummary>
            <AccordionDetails>
            {dataFilteredDetails.length > 0 ? (
                <>

                {/* IIA Details - All Partners signature status */}

                {dataFilteredDetails[index].partner.map((partner, i) => (
                  partner.signing_date || item.iia_status == 'approved-by-all' ? (
                    <>
                    <Typography sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', mt: i === 0 ? 0 : 1.5 }}>
                      Umowa podpisana przez {partner.institution.name}
                    </Typography>
                    {partner.signing_date && (
                      <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 0.5 }}>
                      Data: {formatTimeBody(partner.signing_date)}
                    </Typography>
                    )}
                    {partner.signing_contact && (
                      <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 0.5 }}>
                      Podpis: {partner.signing_contact?.contact_names}
                      {partner.signing_contact?.emails.length > 0 && ` (${partner.signing_contact?.emails.join('; ')})`}
                    </Typography>
                    )}
                  </>
                  ) : (
                    <Typography
                      key={`not-signed-${i}`}
                      sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', mt: i === 0 ? 0 : 1.5 }}
                    >
                      Umowa nie została podpisana przez {partner.institution.name}
                    </Typography>
                  )
                ))}

                {/* IIA Details - Cooperation conditions */}
                {dataFilteredDetails[index].cooperation_conditions && (
                  <>
                    <Typography
                    sx={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', mt: 3 }}
                    >
                      WARUNKI WSPÓŁPRACY
                    </Typography>
                    
                    <FormControl>
                      <RadioGroup             aria-labelledby="cooperation-conditions-radio-group-label"
                      name="cooperation-conditions-radio-group"
                      value={selectedCoopCondValue}
                      sx={{ userSelect: 'none' }}
                      >

                        {/* STAFF TEACHERS */}
                        {dataFilteredDetails[index].cooperation_conditions.staff_teachers.length > 0 &&
                          dataFilteredDetails[index].cooperation_conditions.staff_teachers.map((staff_teacher, i) => {
                            const radioValue = `sta-${i}`;
                            return (
                              <FormControlLabel
                                key={`staff-teacher-${i}`}
                                value={radioValue}
                                control={
                                  <Radio
                                    sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                                    onClick={() => {
                                      if (selectedCoopCondValue === radioValue) {
                                        setSelectedCoopCondValue('');
                                        setSelectedCoopCondObject(null);
                                      } else {
                                        setSelectedCoopCondValue(radioValue);
                                        setSelectedCoopCondObject(getSelectedCoopCondObject(radioValue, dataFilteredDetails, index));
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {staff_teacher.sending_institution.heiID === "kul.pl"
                                        ? "Wyjazdy pracowników w celu prowadzenia zajęć dydaktycznych"
                                        : "Przyjazdy pracowników w celu prowadzenia zajęć dydaktycznych"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      Kod ISCED-F: {staff_teacher.subject_area[0].isced_f_code} {staff_teacher.subject_area[0].isced_clarification && `(${staff_teacher.subject_area[0].isced_clarification})`}
                                    </Typography>
                                  </Box>
                                }
                                sx={{
                                  alignItems: 'flex-start',
                                  display: 'flex',
                                  width: '100%',
                                  '& .MuiFormControlLabel-label': {
                                    flex: 1,
                                  },
                                }}
                              />
                            );
                          })}

                        {/* STAFF TRAINING */}
                        {dataFilteredDetails[index].cooperation_conditions.staff_trainings.length > 0 &&
                          dataFilteredDetails[index].cooperation_conditions.staff_trainings.map((staff_training, i) => {
                            const radioValue = `stt-${i}`;
                            return (
                              <FormControlLabel
                                key={`staff-training-${i}`}
                                value={radioValue}
                                control={
                                  <Radio
                                    sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                                    onClick={() => {
                                      if (selectedCoopCondValue === radioValue) {
                                        setSelectedCoopCondValue('');
                                        setSelectedCoopCondObject(null);
                                      } else {
                                        setSelectedCoopCondValue(radioValue);
                                        setSelectedCoopCondObject(getSelectedCoopCondObject(radioValue, dataFilteredDetails, index));
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {staff_training.sending_institution.heiID === "kul.pl"
                                        ? "Wyjazdy pracowników w celach szkoleniowych"
                                        : "Przyjazdy pracowników w celach szkoleniowych"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      Kod ISCED-F: {staff_training.subject_area[0].isced_f_code} {staff_training.subject_area[0].isced_clarification && `(${staff_training.subject_area[0].isced_clarification})`}
                                    </Typography>
                                  </Box>
                                }
                                sx={{
                                  alignItems: 'flex-start',
                                  display: 'flex',
                                  width: '100%',
                                  '& .MuiFormControlLabel-label': {
                                    flex: 1,
                                  },
                                }}
                              />
                            );
                          })}

                        {/* STUDENT STUDIES */}
                        {dataFilteredDetails[index].cooperation_conditions.student_studies.length > 0 &&
                          dataFilteredDetails[index].cooperation_conditions.student_studies.map((student_study, i) => {
                            const radioValue = `sms-${i}`;
                            return (
                              <FormControlLabel
                                key={`student-study-${i}`}
                                value={radioValue}
                                control={
                                  <Radio
                                    sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                                    onClick={() => {
                                      if (selectedCoopCondValue === radioValue) {
                                        setSelectedCoopCondValue('');
                                        setSelectedCoopCondObject(null);
                                      } else {
                                        setSelectedCoopCondValue(radioValue);
                                        setSelectedCoopCondObject(getSelectedCoopCondObject(radioValue, dataFilteredDetails, index));
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {student_study.sending_institution.heiID === "kul.pl"
                                        ? "Wyjazdy studentów w celu studiowania"
                                        : "Przyjazdy studentów w celu studiowania"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      Kod ISCED-F: {student_study.subject_area[0].isced_f_code} {student_study.subject_area[0].isced_clarification && `(${student_study.subject_area[0].isced_clarification})`} {student_study.eqf_level && `(EQF ${student_study.eqf_level.join(', ')})`}
                                    </Typography>
                                  </Box>
                                }
                                sx={{
                                  alignItems: 'flex-start',
                                  display: 'flex',
                                  width: '100%',
                                  '& .MuiFormControlLabel-label': {
                                    flex: 1,
                                  },
                                }}
                              />
                            );
                          })}

                        {/* STUDENT TRAINEESHIPS */}
                        {dataFilteredDetails[index].cooperation_conditions.student_traineeships.length > 0 &&
                          dataFilteredDetails[index].cooperation_conditions.student_traineeships.map((student_traineeship, i) => {
                            const radioValue = `smt-${i}`;
                            return (
                              <FormControlLabel
                                key={`student-traineeship-${i}`}
                                value={radioValue}
                                control={
                                  <Radio
                                    sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                                    onClick={() => {
                                      if (selectedCoopCondValue === radioValue) {
                                        setSelectedCoopCondValue('');
                                        setSelectedCoopCondObject(null);
                                      } else {
                                        setSelectedCoopCondValue(radioValue);
                                        setSelectedCoopCondObject(getSelectedCoopCondObject(radioValue, dataFilteredDetails, index));
                                      }
                                    }}
                                  />
                                }
                                label={
                                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {student_traineeship.sending_institution.heiID === "kul.pl"
                                        ? "Wyjazdy studentów na praktyki"
                                        : "Przyjazdy studentów na praktyki"}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      Kod ISCED-F: {student_traineeship.subject_area[0].isced_f_code} {student_traineeship.subject_area[0].isced_clarification && `(${student_traineeship.subject_area[0].isced_clarification})`}
                                      {student_traineeship.eqf_level && `(EQF ${student_traineeship.eqf_level.join(', ')})`}
                                    </Typography>
                                  </Box>
                                }
                                sx={{
                                  alignItems: 'flex-start',
                                  display: 'flex',
                                  width: '100%',
                                  '& .MuiFormControlLabel-label': {
                                    flex: 1,
                                  },
                                }}
                              />
                            );
                          })}


                      </RadioGroup>
                    </FormControl>

                  </>
                )}

                {/* IIA Details - Cooperation condition details (based on selectedCoopCondValue) */}
                {selectedCoopCondValue && selectedCoopCondObject && (
                  <>
                  <Typography
                    sx={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', mt: 3 }}
                  >
                      SZCZEGÓŁY
                  </Typography>

                  <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                      {getMobilityType(selectedCoopCondValue)}
                  </Typography>

                  {/* SENDING INSTITUTION */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.3 }}>
                    <Box sx={{ width: '45%' }}>
                      <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                          Jednostka wysyłająca
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          {selectedCoopCondObject.sending_institution.name} ({selectedCoopCondObject.sending_institution.heiID})
                      </Typography>
                    </Box>

                    {/* ARROW RIGHT */}
                    <Typography variant="body2" sx={{ textAlign: 'center', width: '10%' }}>
                      →
                    </Typography>

                    {/* RECEIVING INSTITUTION */}
                    <Box sx={{ width: '45%' }}>
                      <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                          Jednostka przyjmująca
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          {selectedCoopCondObject.receiving_institution.name} ({selectedCoopCondObject.receiving_institution.heiID})
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ my: 1.3 }}>
                    <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                        Zakres współpracy
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', my: 0.5 }}>
                        ISCED-F: {selectedCoopCondObject.subject_area[0].isced_f_code} {selectedCoopCondObject.subject_area[0].isced_clarification && `(${selectedCoopCondObject.subject_area[0].isced_clarification})`}
                    </Typography>
                    {selectedCoopCondObject?.eqf_level?.length > 0 && (
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        EQF: {selectedCoopCondObject.eqf_level.join(', ')}
                      </Typography>
                    )}
                  </Box>

                  <Box>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Liczba mobilności: {selectedCoopCondObject.mobilities_per_year}
                    </Typography>
                    {(selectedCoopCondObject?.total_days_per_year || selectedCoopCondObject?.total_months_per_year) && (
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Maksymalny czas trwania mobilności:{" "}
                        {selectedCoopCondObject.total_days_per_year
                          ? `${selectedCoopCondObject.total_days_per_year} dni`
                          : `${selectedCoopCondObject.total_months_per_year} miesięcy`}{" "}
                        / rok akademicki
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Początek: {selectedCoopCondObject.receiving_acad_year[0]}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        Koniec: {selectedCoopCondObject.receiving_acad_year[1]}
                    </Typography>
                  </Box>

                  <Typography sx={{ fontSize: 12, textAlign: 'left', mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {selectedCoopCondValue}
                  </Typography>
                  <Typography sx={{ fontSize: 12, textAlign: 'left', mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(selectedCoopCondObject, null, 2)}
                  </Typography>
                  </>
                )}

                {/* IIA Details - Other details */}
                {/* <Typography sx={{ fontSize: 12, textAlign: 'left', mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    <pre style={{ margin: 0 }}>
                    <code>
                        {JSON.stringify(dataFilteredDetails[index], null, 2)}
                    </code>
                    </pre>
                </Typography> */}

              </>
            )
            :
                <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>Ładowanie...</Typography>
            }
            </AccordionDetails>
            </Accordion>
        )
        })}

        </>
    ) : (selectedErasmusCode && selectedInstitutionName && selectedHeiID) && (
        <>
        <CircularProgress />
        <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>Przygotowuję szczegóły współpracy...</Typography>
        </>
    )
    }

    </Box>
    );
}

export default ModuleEwp;