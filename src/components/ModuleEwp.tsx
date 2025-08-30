import { useState, useEffect, useCallback, useRef } from 'react';
import '../App.css';
import { Button, TextField, Typography, Box, FormControl, FormControlLabel, RadioGroup, Radio } from '@mui/material';

import Autocomplete from '@mui/material/Autocomplete';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CircularProgress from '@mui/material/CircularProgress';
import LinearProgressWithLabel from './LinearProgressWithLabel';

import { useTranslation } from 'react-i18next';
import { useModuleEwpContext } from '../contexts/ModuleEwpContext';
import { REVERSE_PROXY_URL } from './ReverseProxyConfig';

function ModuleEwp() {

  const srvUrl = REVERSE_PROXY_URL;

  const { getAgreementLabel, formatTimeHeader, formatTimeBody, fetchError, setFetchError, fetchErrorMessage, setFetchErrorMessage, data, setData, erasmusCodes, setErasmusCodes, institutionNames, setInstitutionNames, partnersTimestamp, setPartnersTimestamp, selectedErasmusCode, setSelectedErasmusCode, selectedInstitutionName, setSelectedInstitutionName, selectedHeiID, setSelectedHeiID, selectedHeiTimestamp, setSelectedHeiTimestamp, dataFiltered, setDataFiltered, dataFilteredDetails, setDataFilteredDetails, connected, setConnected } = useModuleEwpContext();

  const { t } = useTranslation();

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
      sta: t('EWP_STAFF_MOBILITY_FOR_TEACHING'),
      stt: t('EWP_STAFF_MOBILITY_FOR_TRAINING'),
      sms: t('EWP_STUDENT_MOBILITY_FOR_STUDIES'),
      smt: t('EWP_STUDENT_MOBILITY_FOR_TRAINEESHIPS'),
    }
    return map[prefix];
  }

  const handleInitialFetch = useCallback(() => {
    fetch(srvUrl + '/status')
    .then((res) => {
      if (!res.ok) throw new Error('Failed to fetch status');
      return res.json();
    })
    .then((data) => {
      if (data?.connection && data?.token) {
        setConnected(true);
  
    //start of all partners fetch
        const eventSource = new EventSource(srvUrl + '/stream/partners');

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
    setExpandedAccordion(-1);
    setSelectedCoopCondValue('');
    setSelectedCoopCondObject(null);
    if (selectedErasmusCode && selectedInstitutionName) {
      fetch(srvUrl + `/partners/partner/${selectedHeiID}`)
        .then((res) => res.json())
        .then((data) => {
          setDataFiltered(data);
          setSelectedHeiTimestamp(Date.now());
  
          const detailPromises = data.map((item) =>
            fetch(srvUrl + `/iia/details/${item.id}`)
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

        <Autocomplete
        disablePortal
        value={selectedErasmusCode}
        options={erasmusCodes}
        sx={{ width: 300 }}
        renderInput={(params) => <TextField {...params} label={t('ERASMUS_CODE')} />}
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
        renderInput={(params) => <TextField {...params} label={t('INSTITUTION_NAME')} />}
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
            <Typography sx={{ fontSize: 12, textAlign: 'center' }}>{t('LAST_UPDATE')}: {new Date(partnersTimestamp).toLocaleString()} </Typography>
          </>
        )}
    </>
    )
    : (!connected && erasmusCodes.length === 0 && institutionNames.length === 0 && data.length === 0 && !fetchError) ?
    (
    <>
    <CircularProgress />
    <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>{t('EWP_CONNECTING_TO_EWP_DASHBOARD')}</Typography>
    </>
    )
    : (!connected && erasmusCodes.length === 0 && institutionNames.length === 0 && data.length === 0 && fetchError) ?
    (
    <>
    <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>{t('EWP_ERROR_CONNECTING_TO_SERVER')} ({fetchErrorMessage})</Typography>
    <Button
        variant="contained"
        size="small"
        onClick={() => {
          setFetchError(false);
          handleInitialFetch();
        }}
        sx={{ display: 'block', mx: 'auto', mt: 1 }}
      >
        {t('EWP_REFRESH')}
    </Button>
    </>
    )
    : (connected && erasmusCodes.length === 0 && institutionNames.length === 0 && data.length === 0) &&
    (
    <>
    <CircularProgress />
    <Typography sx={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', mt: 1, ml: -1 }}>✅ {t('EWP_CONNECTED_TO_EWP_DASHBOARD')}</Typography>
    <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>{t('EWP_PREPARING_PARTNERS_LIST')}</Typography>
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
            <b>{t('THIS_INSTITUTION_NAME')}&nbsp;({t('THIS_INSTITUTION_EC')})</b> {t('EWP_HAS')} {dataFiltered.length} {getAgreementLabel(t, dataFiltered.length)} {t('EWP_WITH')} <b>{selectedInstitutionName.replace(/ /g, '\u00A0')} ({selectedErasmusCode.replace(/ /g, '\u00A0')})</b>:
        </Typography>
        <Typography sx={{ fontSize: 12, textAlign: 'center', mb: 2 }}>
            {t('AS_OF')} {new Date(selectedHeiTimestamp).toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(',', '').replace(/\./g, '-')}
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
                    {t('EWP_AGREEMENT_WITH')} {selectedHeiID.toUpperCase()} ({index+1})
                </Typography>
                {dataFilteredDetails.length > 0 && (
                    <>
                    <Typography sx={{ fontSize: '0.8em'}}>
                        {t('EWP_LAST_MODIFICATION')}:
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
                        ? t('EWP_APPROVED_BY_ALL')
                        : item.iia_status === 'approved' && dataFilteredDetails[index]?.last_author ==='kul.pl'
                        ? `${t('EWP_WAITING_FOR_SIGNATURE_FROM', {hei: selectedHeiID.toUpperCase()})}`
                        : item.iia_status === 'approved' && dataFilteredDetails[index]?.last_author !='kul.pl'
                        ? `${t('EWP_WAITING_FOR_SIGNATURE_FROM'), {hei: 'KUL'}}`
                        : item.iia_status === 'submitted' && dataFilteredDetails[index]?.last_author ==='kul.pl'
                        ? `${t('EWP_BEING_VERIFIED_BY')} ${selectedHeiID.toUpperCase()}`
                        : item.iia_status === 'submitted' && dataFilteredDetails[index]?.last_author !='kul.pl'
                        ? `${t('EWP_BEING_VERIFIED_BY')} KUL`
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
                      {t('EWP_AGREEMENT_HAS_BEEN_SIGNED_BY')} {partner.institution.name}
                    </Typography>
                    {partner.signing_date && (
                      <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 0.5 }}>
                      {t('EWP_DATE')}: {formatTimeBody(partner.signing_date)}
                    </Typography>
                    )}
                    {partner.signing_contact && (
                      <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 0.5 }}>
                      {t('EWP_SIGNATURE')}: {partner.signing_contact?.contact_names}
                      {partner.signing_contact?.emails.length > 0 && ` (${partner.signing_contact?.emails.join('; ')})`}
                    </Typography>
                    )}
                  </>
                  ) : (
                    <Typography
                      key={`not-signed-${i}`}
                      sx={{ fontSize: 12, fontWeight: 'bold', textAlign: 'center', mt: i === 0 ? 0 : 1.5 }}
                    >
                      {t('EWP_AGREEMENT_HAS_NOT_BEEN_SIGNED_BY')} {partner.institution.name}
                    </Typography>
                  )
                ))}

                {/* IIA Details - Cooperation conditions */}
                {dataFilteredDetails[index].cooperation_conditions && (
                  <>
                    <Typography
                    sx={{ fontSize: 14, fontWeight: 'bold', textAlign: 'center', mt: 3 }}
                    >
                      {t('EWP_COOPERATION_CONDITIONS')}
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
                                        ? t('EWP_OUTGOING_STAFF_MOBILITY_FOR_TEACHING')
                                        : t('EWP_INCOMING_STAFF_MOBILITY_FOR_TEACHING')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {t('EWP_ISCED_F_CODE')}: {staff_teacher?.subject_area
                                        .map(
                                          (item) =>
                                            `${item?.isced_f_code}${item?.isced_clarification ? ` (${item?.isced_clarification})` : ''}`
                                        )
                                        .join(', ')}
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
                                        ? t('EWP_OUTGOING_STAFF_MOBILITY_FOR_TRAINING')
                                        : t('EWP_INCOMING_STAFF_MOBILITY_FOR_TRAINING')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {t('EWP_ISCED_F_CODE')}: {staff_training?.subject_area
                                        .map(
                                          (item) =>
                                            `${item?.isced_f_code}${item?.isced_clarification ? ` (${item?.isced_clarification})` : ''}`
                                        )
                                        .join(', ')}
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
                                        ? t('EWP_OUTGOING_STUDENT_MOBILITY_FOR_STUDIES')
                                        : t('EWP_INCOMING_STUDENT_MOBILITY_FOR_STUDIES')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {t('EWP_ISCED_F_CODE')}: {student_study?.subject_area
                                        .map(
                                          (item) =>
                                            `${item?.isced_f_code}${item?.isced_clarification ? ` (${item?.isced_clarification})` : ''}`
                                        )
                                        .join(', ')}{' '}
                                      {student_study?.eqf_level && `(EQF ${student_study.eqf_level.join(', ')})`}
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
                                        ? t('EWP_OUTGOING_STUDENT_MOBILITY_FOR_TRAINEESHIPS')
                                        : t('EWP_INCOMING_STUDENT_MOBILITY_FOR_TRAINEESHIPS')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                                      {t('EWP_ISCED_F_CODE')}: {student_traineeship?.subject_area
                                        .map(
                                          (item) =>
                                            `${item?.isced_f_code}${item?.isced_clarification ? ` (${item?.isced_clarification})` : ''}`
                                        )
                                        .join(', ')}{' '}
                                      {student_traineeship?.eqf_level && `(EQF ${student_traineeship.eqf_level.join(', ')})`}
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
                      {t('EWP_DETAILS')}
                  </Typography>

                  <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                      {getMobilityType(selectedCoopCondValue)}
                  </Typography>

                  {/* SENDING INSTITUTION */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 1.3 }}>
                    <Box sx={{ width: '45%' }}>
                      <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                          {t('EWP_SENDING_INSTITUTION')}
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
                          {t('EWP_RECEIVING_INSTITUTION')}
                      </Typography>
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                          {selectedCoopCondObject.receiving_institution.name} ({selectedCoopCondObject.receiving_institution.heiID})
                      </Typography>
                    </Box>
                  </Box>

                  {/* ISCED-F INFO */}
                  <Box sx={{ my: 1.3 }}>
                    <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                        {t('EWP_SUBJECT_AREA')}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center', my: 0.5 }}>
                      ISCED-F: {selectedCoopCondObject?.subject_area
                        .map(
                          (item) =>
                            `${item?.isced_f_code}${item?.isced_clarification ? ` (${item?.isced_clarification})` : ''}`
                        )
                        .join(', ')}
                    </Typography>
                    {selectedCoopCondObject?.eqf_level?.length > 0 && (
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        EQF: {selectedCoopCondObject.eqf_level.join(', ')}
                      </Typography>
                    )}
                  </Box>
                  
                  {/* ISCED-F INFO - more details */}
                  <Box>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        {t('EWP_NUMBER_OF_MOBILITIES')}: {selectedCoopCondObject.mobilities_per_year}
                    </Typography>
                    {(selectedCoopCondObject?.total_days_per_year || selectedCoopCondObject?.total_months_per_year) && (
                      <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        {t('EWP_MAX_DURATION_OF_MOBILITY')}:{" "}
                        {selectedCoopCondObject.total_days_per_year
                          ? `${selectedCoopCondObject.total_days_per_year} ${t('EWP_DAYS')}`
                          : `${selectedCoopCondObject.total_months_per_year} ${t('EWP_MONTHS')}`}{" "}
                        / {t('EWP_ACADEMIC_YEAR')}
                      </Typography>
                    )}
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        {t('EWP_START')}: {selectedCoopCondObject.receiving_acad_year[0]}
                    </Typography>
                    <Typography variant="body2" sx={{ textAlign: 'center' }}>
                        {t('EWP_END')}: {selectedCoopCondObject.receiving_acad_year[1]}
                    </Typography>
                  </Box>

                  {/* LANGUAGE REQUIREMENTS */}
                  {selectedCoopCondObject.language_skill.length > 0 && (
                  <Box sx={{ my: 1.8 }}>
                    <Typography variant="body2" sx={{ textAlign: 'center', textDecoration: 'underline' }}>
                        {t('EWP_LANGUAGE_REQUIREMENTS')}
                    </Typography>
                    {/* Language requirements list - ul, li */}
                    <Box
                      component="ul"
                      sx={{
                        p: 0,
                        m: 0,
                        listStyle: 'none',
                      }}
                    >
                      {selectedCoopCondObject.language_skill.map((languageRequirement, i) => (
                        <Box
                          component="li"
                          key={`language-requirement-${i}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            gap: 1, // space between dot and text
                            my: 0.5,
                          }}
                        >
                          {/* Custom bullet */}
                          <Box
                            component="span"
                            sx={{
                              fontSize: '1.2em', // larger bullet
                              lineHeight: 1,
                            }}
                          >
                            •
                          </Box>

                          {/* Text content */}
                          <Typography
                            variant="body2"
                            sx={{ textAlign: 'left', whiteSpace: 'pre-wrap', textTransform: 'uppercase' }}
                          >
                            {languageRequirement?.language} {languageRequirement?.cefr_level}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                  </Box>
                  )}

                  {/* <Typography sx={{ fontSize: 12, textAlign: 'left', mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {selectedCoopCondValue}
                  </Typography>
                  <Typography sx={{ fontSize: 12, textAlign: 'left', mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {JSON.stringify(selectedCoopCondObject, null, 2)}
                  </Typography> */}
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
        <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>{t('EWP_PREPARING_COOPERATION_DETAILS')}</Typography>
        </>
    )
    }

    </Box>
    );
}

export default ModuleEwp;