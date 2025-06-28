import { useState } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import '../App.css';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Link } from '@mui/material';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { useThemeContext } from '../contexts/ThemeContext';
import { useModalContext } from '../contexts/ModalContext';
import kulLogoBlack from '../assets/kul_logo-black.jpg';

import ModalWindow from './ModalWindow';
import newModalContent from '../utils/newModalContent';

import ModuleCsv from './ModuleCsv';
import ModuleEwp from './ModuleEwp';
import { useModuleCsvContext } from '../contexts/ModuleCsvContext';


alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;


function SqlApp() {

  const { mode, setMode } = useThemeContext();
  const { modalOpen } = useModalContext();
  const { erasmusCodes, selectedErasmusCode } = useModuleCsvContext();

  const [currentModule, setCurrentModule] = useState('CSV');

    return ( 
        <>
      {/* Page Wrapper */}
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'space-between', flexDirection: 'column', height: '100%', p:2.5, overflow: 'auto'}}>

      <ModalWindow />

      {/* Page Header */}
      <Box sx={{height: '48px', position: 'relative', top: 0, mb: 1, display: 'flex', justifyContent: 'space-between'}}>
        <Box>
          <img
            src={kulLogoBlack}
            style={{position: 'relative', top: '0px', left: '0px', width: 105, height: 32, cursor: 'pointer'}}
            onClick={() => window.location.reload()}
            />
        </Box>
        <Box sx={{ width: 250 }}>

        <FormControl sx={{ minWidth: 156 }}>
          <InputLabel id="module-label">Baza umów</InputLabel>
          <Select
            labelId="module-label"
            id="module-select"
            value={currentModule}
            label="Baza umów"
            sx={{ height: 42 }}
            onChange={(e) => setCurrentModule(e.target.value)}
          >
            <MenuItem value={'CSV'}>Lokalna (CSV)</MenuItem>
            <MenuItem value={'EWP'}>Zdalna (EWP)</MenuItem>
          </Select>
        </FormControl>


          {/* <SettingsIcon sx={{cursor: 'pointer'}} onClick={() => modalOpen(newModalContent.options)} /> */}
          <DarkModeSwitch checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} size={24} sunColor='currentColor' moonColor='currentColor'
          style={{position: 'absolute', top: '0px', right: '0px'}}/>
        </Box>

      {/* End Page Header */}
      </Box>


      <Box>
        {/* Page App */}
            {currentModule === 'CSV' && <ModuleCsv />}
            {currentModule === 'EWP' && <ModuleEwp />}
        {/* End Page App */}
        {currentModule === 'CSV' && erasmusCodes.length > 0 && !selectedErasmusCode && (
          <>
          <Typography variant="div" sx={{ fontSize: 12, textAlign: 'center' }}>
            Liczba uczelni partnerskich: {erasmusCodes.length}
          </Typography>
          </>
        )}
      </Box>

      
      {/* Page Footer */}
      <Box>
        <Box>
          <Typography variant="div" sx={{ fontSize: 10, textAlign: 'center', my: 1 }}>
            <Link href="https://www.kul.pl/uczelnie-partnerskie-kul,art_90613.html" target="_blank" rel="noopener noreferrer">Przejdź do: Umowy bilateralne</Link>
          </Typography>
        </Box>
        <Box>
          <Typography variant="div" sx={{ fontSize: 10, textAlign: 'center', my: 1 }}>
            Dział Współpracy Międzynarodowej &copy; 2024-2025 Bartłomiej Pawłowski - ExcelSQL v1.4.3
          </Typography>
        </Box>
      </Box>

      {/* End Page Wrapper */}
      </Box>

      </>
     )
}

export default SqlApp;