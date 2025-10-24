import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material";
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';
import Filter4Icon from '@mui/icons-material/Filter4';
import { useTranslation } from 'react-i18next';
import { useModuleCsvContext } from "../contexts/ModuleCsvContext";

function ModalFilterSelector() {

    const { t } = useTranslation();
    // filters {active: BOOLEAN, value: STRING, ordinalCounter: int}
    // handleFilterChange {index: NUMBER, newValue: STRING, newOrdinalCounter: int}
    const { filters, handleFilterChange, resetAllFilters, resetOrdinalFilters } = useModuleCsvContext();

    // SX for Filters and Autocomplete
    const filterBoxSx = { my: 1.9, display: 'flex', alignItems: 'center', gap: 1.9 };
    const autocompleteSx = { width: 409, '& .MuiFormControl-root': { marginBottom: 0 } };

    // count active filters
    const activeFiltersCount = filters.filter(f => f.active).length;

    // map ordinal counter to icon
    const ordinalCounterIconMap = {
        0: <Filter1Icon />,
        1: <Filter2Icon />,
        2: <Filter3Icon />,
        3: <Filter4Icon />,
    };

    return ( 
        <>
            {/* FILTER 1 - CSVTH_MOBILITY_TYPE */}
            <Box sx={filterBoxSx}>
                {filters[0].active ? ordinalCounterIconMap[filters[0].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[0].value}
                    options={['Opcja1', 'Opcja2', 'Opcja3']}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_MOBILITY_TYPE")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(0);
                            newActiveFiltersCount = 0;
                        }
                        if (filters[0].value && value) {
                            resetOrdinalFilters(0);
                            newActiveFiltersCount = filters[0].ordinalCounter;
                        }
                        handleFilterChange(0, value, newActiveFiltersCount);
                    }}
                />
            </Box>

            {/* FILTER 2 - CSVTH_NUMBER_OF_MOBILITIES */}
            <Box sx={filterBoxSx}>
                {filters[1].active ? ordinalCounterIconMap[filters[1].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[1].value}
                    options={['Opcja1', 'Opcja2', 'Opcja3']}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_NUMBER_OF_MOBILITIES")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(1);
                            newActiveFiltersCount = 0;
                        }
                        if (filters[1].value && value) {
                            resetOrdinalFilters(1);
                            newActiveFiltersCount = filters[1].ordinalCounter;
                        }
                        handleFilterChange(1, value, newActiveFiltersCount);
                    }}
                />
            </Box>

            {/* FILTER 3 - CSVTH_STATUS */}
            <Box sx={filterBoxSx}>
                {filters[2].active ? ordinalCounterIconMap[filters[2].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[2].value}
                    options={['Opcja1', 'Opcja2', 'Opcja3']}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_STATUS")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(2);
                            newActiveFiltersCount = 0;
                        }
                        if (filters[2].value && value) {
                            resetOrdinalFilters(2);
                            newActiveFiltersCount = filters[2].ordinalCounter;
                        }
                        handleFilterChange(2, value, newActiveFiltersCount);
                    }}
                />
            </Box>

            {/* FILTER 4 - CSVTH_SUBJECT_AREA */}
            <Box sx={filterBoxSx}>
                {filters[3].active ? ordinalCounterIconMap[filters[3].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[3].value}
                    options={['Opcja1', 'Opcja2', 'Opcja3']}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_SUBJECT_AREA")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(3);
                            newActiveFiltersCount = 0;
                        }
                        if (filters[3].value && value) {
                            resetOrdinalFilters(3);
                            newActiveFiltersCount = filters[3].ordinalCounter;
                        }
                        handleFilterChange(3, value, newActiveFiltersCount);
                    }}
                />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    disabled={activeFiltersCount === 0}
                    sx={{ mt: 1, mb: 0.3 }}
                    onClick={resetAllFilters}
                >
                    Resetuj filtry
                </Button>
            </Box>
        </>
     );
}

export default ModalFilterSelector;