import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material";
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';
import Filter4Icon from '@mui/icons-material/Filter4';
import { useTranslation } from 'react-i18next';
import { useModuleCsvContext } from "../contexts/ModuleCsvContext";
import { useEffect } from "react";

function ModalFilterSelector() {

    const { t } = useTranslation();
    // filters {active: BOOLEAN, value: STRING, ordinalCounter: int}
    // handleFilterChange {index: NUMBER, newValue: STRING, newOrdinalCounter: int}
    const { data, filters, handleFilterChange, handleFilterOptionsChange, resetAllFilters, resetOrdinalFilters, iscedFCodes, setAlasqlQueryAfter, originalData } = useModuleCsvContext();

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

    // custom order of statuses in 1st useEffect below (Filter 3)
    const statusOrder = [
        "CSVTD_APPROVED_BY_ALL",
        "CSVTD_WAITING_FOR_THEIR_SIGNATURE",
        "CSVTD_WAITING_FOR_OUR_SIGNATURE",
        "CSVTD_BEING_VERIFIED_BY_THEM",
        "CSVTD_BEING_VERIFIED_BY_US",
        "CSVTD_DRAFT"
    ];

    //translation of i18n keys to alasqlQueryAfter in 2nd useEffect below (Filter 1)
    const csvMobilityTypes = {
        "CSVTD_OUTGOING_STA": `WHERE [coop_cond_type] = "staff_teachers" AND [coop_cond_sending_hei_id] = "kul.pl"`,
        "CSVTD_INCOMING_STA": `WHERE [coop_cond_type] = "staff_teachers" AND [coop_cond_sending_hei_id] != "kul.pl"`,
        "CSVTD_OUTGOING_STT": `WHERE [coop_cond_type] = "staff_training" AND [coop_cond_sending_hei_id] = "kul.pl"`,
        "CSVTD_INCOMING_STT": `WHERE [coop_cond_type] = "staff_training" AND [coop_cond_sending_hei_id] != "kul.pl"`,
        "CSVTD_OUTGOING_SMS": `WHERE [coop_cond_type] = "student_studies" AND [coop_cond_sending_hei_id] = "kul.pl"`,
        "CSVTD_INCOMING_SMS": `WHERE [coop_cond_type] = "student_studies" AND [coop_cond_sending_hei_id] != "kul.pl"`,
        "CSVTD_OUTGOING_SMT": `WHERE [coop_cond_type] = "student_traineeship" AND [coop_cond_sending_hei_id] = "kul.pl"`,
        "CSVTD_INCOMING_SMT": `WHERE [coop_cond_type] = "student_traineeship" AND [coop_cond_sending_hei_id] != "kul.pl"`,
    }

    //translation of i18n keys to alasqlQueryAfter in 2nd useEffect below (Filter 3)
    const csvStatuses = {
        "CSVTD_APPROVED_BY_ALL": `WHERE [iia_status] = "approved-by-all"`,
        "CSVTD_WAITING_FOR_THEIR_SIGNATURE": `WHERE [iia_status] = "approved" AND [partner_1_hei_id] = "kul.pl"`,
        "CSVTD_WAITING_FOR_OUR_SIGNATURE": `WHERE [iia_status] = "approved" AND [partner_1_hei_id] != "kul.pl"`,
        "CSVTD_BEING_VERIFIED_BY_THEM": `WHERE [iia_status] = "submitted" AND [partner_1_hei_id] = "kul.pl"`,
        "CSVTD_BEING_VERIFIED_BY_US": `WHERE [iia_status] = "submitted" AND [partner_1_hei_id] != "kul.pl"`,
        "CSVTD_DRAFT": `WHERE [iia_status] = "draft"`,
    };

    //watch for data (filtered) to change options for every filter
    useEffect(() => {

        // Filter 1 options - CSVTH_MOBILITY_TYPE - Z -> A
        handleFilterOptionsChange(
            0,
            [...new Set(
                ((filters[0].active && filters[0].ordinalCounter === 0) ? originalData : data)
                .map(d => d.CSVTH_MOBILITY_TYPE)
            )]
                .map(key => ({ key, label: t(key) })) // store i18n key + label
                .sort((a, b) => b.label.localeCompare(a.label))
        );

        // Filter 2 options - CSVTH_NUMBER_OF_MOBILITIES - ASC
        handleFilterOptionsChange(
            1,
            [...new Set(((filters[1].active && filters[1].ordinalCounter === 0 ? originalData : data)
            .map(d => String(d.CSVTH_NUMBER_OF_MOBILITIES))))]
            .sort((a, b) => Number(a) - Number(b))
        );

        // Filter 3 options - CSVTH_STATUS
        handleFilterOptionsChange(
            2,
            [...new Set(
                ((filters[2].active && filters[2].ordinalCounter === 0 ? originalData : data)
                .map(d => d.CSVTH_STATUS))
            )]
                .sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b))  // sort by custom order
                .map(key => ({ key, label: t(key) }))  // store i18n key + label
        );

        // Filter 4 options - CSVTH_SUBJECT_AREA
        handleFilterOptionsChange(3, [...new Set(iscedFCodes.map(codeObj => `${codeObj.code}: ${codeObj.name}`))].sort());
        
    }, [data]);

    //update alasqlQueryAfter based on selected filters
    useEffect(() => {
        //sort filters by ordinalCounter, so they’re applied in the order the user activated them
        const activeFilters = filters
            .filter(f => f.active && f.value)
            .sort((a, b) => a.ordinalCounter - b.ordinalCounter);

        let whereClauses = [];

        activeFilters.forEach(f => {
            const i = filters.indexOf(f);

            // Filter 1 – CSVTH_MOBILITY_TYPE
            if (i === 0) {
            const clause = csvMobilityTypes[f.value.key || f.value];
            if (clause) whereClauses.push(clause.replace(/^WHERE\s+/i, ''));
            }

            // Filter 2 – CSVTH_NUMBER_OF_MOBILITIES
            if (i === 1) {
            whereClauses.push(`[coop_cond_total_people] = ${f.value}`);
            }

            // Filter 3 – CSVTH_STATUS
            if (i === 2) {
            const clause = csvStatuses[f.value.key || f.value];
            if (clause) whereClauses.push(clause.replace(/^WHERE\s+/i, ''));
            }
        });

        const newAlasqlQueryAfter = whereClauses.length
            ? `WHERE ${whereClauses.join(' AND ')} ORDER BY CSVTH_ERASMUS_CODE`
            : `ORDER BY CSVTH_ERASMUS_CODE`;

        setAlasqlQueryAfter(newAlasqlQueryAfter);

        // console.log('ALASQL QUERY AFTER:', newAlasqlQueryAfter);
    }, [filters]);

    return ( 
        <>
            {/* FILTER 1 - CSVTH_MOBILITY_TYPE */}
            <Box sx={filterBoxSx}>
                {filters[0].active
                    ? ordinalCounterIconMap[filters[0].ordinalCounter]
                    : <FilterAltOffIcon />
                }

                <Autocomplete
                    disablePortal
                    value={
                    filters[0].options.find(opt => opt.key === filters[0].value) || null
                    }
                    options={filters[0].options}
                    getOptionLabel={(option) => option?.label || ''}
                    isOptionEqualToValue={(opt, val) => opt.key === val.key}
                    sx={autocompleteSx}
                    renderInput={(params) => (
                    <TextField {...params} label={t("CSVTH_MOBILITY_TYPE")} />
                    )}
                    onChange={(e, value) => {
                    const newValue = value ? value.key : '';
                    const newActiveFiltersCount = value
                        ? filters[0].ordinalCounter || activeFiltersCount
                        : 0;

                    if (!value) {
                        resetOrdinalFilters(0);
                        setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');
                    }
                    handleFilterChange(0, newValue, newActiveFiltersCount);
                    }}
                />
            </Box>

            {/* FILTER 2 - CSVTH_NUMBER_OF_MOBILITIES */}
            <Box sx={filterBoxSx}>
                {filters[1].active ? ordinalCounterIconMap[filters[1].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[1].value}
                    options={filters[1].options}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_NUMBER_OF_MOBILITIES")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(1);
                            newActiveFiltersCount = 0;
                            setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');
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
                {filters[2].active
                    ? ordinalCounterIconMap[filters[2].ordinalCounter]
                    : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[2].value}
                    options={filters[2].options}
                    getOptionLabel={(option) => option.label || ''}  // use translated label
                    isOptionEqualToValue={(opt, val) => opt.key === val?.key}
                    sx={autocompleteSx}
                    renderInput={(params) => (
                    <TextField {...params} label={t("CSVTH_STATUS")} />
                    )}
                    onChange={(e, value) => {
                    let newActiveFiltersCount = activeFiltersCount;
                    if (!value) {
                        resetOrdinalFilters(2);
                        newActiveFiltersCount = 0;
                        setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');
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
                    options={filters[3].options}
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