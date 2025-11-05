import { useState } from 'react';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import '../App.css';
import { Box, FormControl, InputLabel, Select, MenuItem, Typography, Link } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import * as alasql from 'alasql';
import * as XLSX from 'xlsx';
import { useThemeContext } from '../contexts/ThemeContext';
import { useModalContext } from '../contexts/ModalContext';
import kulLogoBlack from '../assets/kul_logo-black.jpg';
import LinkIcon from '@mui/icons-material/Link';
import ReactCountryFlag from "react-country-flag"
import FilterListIcon from '@mui/icons-material/FilterList';
import FilterListOffIcon from '@mui/icons-material/FilterListOff';
import ModalFilterSelector from './ModalFilterSelector';

import ModalWindow from './ModalWindow';
import newModalContent from '../utils/newModalContent';

import ModuleCsv from './ModuleCsv';
import ModuleEwp from './ModuleEwp';
import { useTranslation } from 'react-i18next';

alasql.utils.isBrowserify = false;
alasql.utils.global.XLSX = XLSX;

function SqlApp() {

  const { t } = useTranslation();
  const { currentAppLanguage, setCurrentAppLanguage, changeAppLanguage, mode, setMode } = useThemeContext();
  const { modalOpen } = useModalContext();

  const [currentModule, setCurrentModule] = useState('CSV');

  const localisationMenuItemHeight = 32;

    return ( 
        <>
      {/* Page Wrapper */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'space-between', flexDirection: 'column', height: '100%', p:2.5, overflow: 'auto' }}>

      <ModalWindow />

      {/* Page Header */}
      <Box sx={{ maxHeight: 70, position: 'relative', top: 0, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box sx={{ width: 225, height: '100%' }}>
          {/* LOGO */}
          <img
            src={kulLogoBlack}
            style={{ position: 'relative', top: '0px', left: '0px', width: 105, height: 32, cursor: 'pointer' }}
            onClick={() => window.location.reload()}
            />
        {/* I18N LANGUAGE SELECTOR */}
        <FormControl sx={{ minWidth: 105 }}>
          <Select
            value={currentAppLanguage}
            sx={{ mx: 1, height: 32, fontSize: "0.9rem", ".MuiOutlinedInput-notchedOutline": { border: 0 } }}
            onChange={(e) => changeAppLanguage(e.target.value)}
          >
            <MenuItem value={"pl"} sx={{ height: localisationMenuItemHeight }}>
              <ReactCountryFlag countryCode="PL" svg style={{ marginRight: 8 }} />
              PL
            </MenuItem>
            <MenuItem value={"en"} sx={{ height: localisationMenuItemHeight }}>
              <ReactCountryFlag countryCode="GB" svg style={{ marginRight: 8 }} />
              EN
            </MenuItem>
            <MenuItem value={"tr"} sx={{ height: localisationMenuItemHeight }}>
              <ReactCountryFlag countryCode="TR" svg style={{ marginRight: 8 }} />
              TR
            </MenuItem>
          </Select>
        </FormControl>

        </Box>

        {/* FILTERS SELECTOR */}
        <Tooltip title={
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: 13 }}>
              {t('SQL_SELECT_FILTERS')}
            </Typography>
          </Box>
        }>
          <IconButton sx={{ mt: 0.3 }} onClick={() => {modalOpen({ title: t('SQL_FILTER_BY'), content: <ModalFilterSelector /> })}}>
            <FilterListOffIcon />
            <Typography variant="body2" sx={{ fontSize: 13, ml: 0.3, mt: 0.4 }}>
              {t('SQL_FILTER')}
            </Typography>
          </IconButton>
        </Tooltip>

        {/* TOP RIGHT PANEL */}
        <Box sx={{ width: 236 }}>
          {/* MODULE SELECTOR */}
          <FormControl sx={{ minWidth: 156 }}>
            <InputLabel id="module-label">{t('SQL_IIA_DATABASE')}</InputLabel>
            <Select
              labelId="module-label"
              id="module-select"
              value={currentModule}
              label={t('SQL_IIA_DATABASE')}
              sx={{ height: 42 }}
              onChange={(e) => setCurrentModule(e.target.value)}
            >
              <MenuItem value={'CSV'}>{t('SQL_IIA_DATABASE_LOCAL')}</MenuItem>
              <MenuItem value={'EWP'}>{t('SQL_IIA_DATABASE_REMOTE')}</MenuItem>
            </Select>
          </FormControl>

          {/* THEME SWITCH */}
          <DarkModeSwitch checked={mode === 'dark'} onChange={() => setMode(mode === 'dark' ? 'light' : 'dark')} size={24} sunColor='currentColor' moonColor='currentColor'
          style={{position: 'absolute', top: '0px', right: '0px'}}/>
        </Box>

      {/* End Page Header */}
      </Box>

      {/* MODULE App */}
      <Box>
            {currentModule === 'CSV' && <ModuleCsv />}
            {currentModule === 'EWP' && <ModuleEwp />}
      </Box>

      
      {/* Page Footer */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1.2, fontSize: 12 }}>
          <Typography variant="div" sx={{ fontSize: 10, textAlign: 'center', mt: 1.2, mb: 0.5 }}>
            <Link href="https://www.kul.pl/uczelnie-partnerskie-kul,art_90613.html" target="_blank" rel="noopener noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontSize: 12, '&:hover': { color: 'primary.light', textDecoration: 'underline' }, cursor: 'pointer' }}>
              <LinkIcon sx={{ mr: 0.7, fontSize: 16 }} />
              {t('SQL_REDIRECT_TO_BILATERAL')}
            </Link>
          </Typography>
        </Box>
        <Box>
          <Typography variant="div" sx={{ fontSize: 10, textAlign: 'center', my: 1 }}>
            {t('SQL_IRO')} &copy; 2024-2025 <Link href="https://github.com/hanz94" rel="noopener noreferrer" target="_blank" sx={{ textDecoration: 'none', color: 'inherit', '&:hover': { textDecoration: 'underline', color: 'inherit' }, cursor: 'pointer' }}>Bartłomiej Pawłowski</Link>
          </Typography>
        </Box>
      </Box>

      {/* End Page Wrapper */}
      </Box>

      </>
     )
}

export default SqlApp;