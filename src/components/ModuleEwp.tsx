import { useState, useEffect, useCallback, useRef } from 'react';
import '../App.css';
import { Button, TextField, Typography, Box } from '@mui/material';

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

    const [progress, setProgress] = useState(0);
    const hasMounted = useRef(false);

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

        {console.log(institutionNames)}

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

        {dataFiltered.map((item, index) => (
            <Accordion key={index} sx={{ mt: 1.1 }}>
            <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel${index}-content`}
                id={`panel${index}-header`}
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

                {/* IIA Details - Other details */}
                <Typography sx={{ fontSize: 12, textAlign: 'left', mt: 1, whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    <pre style={{ margin: 0 }}>
                    <code>
                        {JSON.stringify(dataFilteredDetails[index], null, 2)}
                    </code>
                    </pre>
                </Typography>
                </>
            )
            :
                <Typography sx={{ fontSize: 12, textAlign: 'center', mt: 1 }}>Ładowanie...</Typography>
            }
            </AccordionDetails>
            </Accordion>
        ))}

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