import { Autocomplete, Box, Button, TextField, Typography } from "@mui/material";
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';
import Filter4Icon from '@mui/icons-material/Filter4';
import Filter5Icon from '@mui/icons-material/Filter5';
import { useTranslation } from 'react-i18next';
import { useThemeContext } from "../contexts/ThemeContext";
import { useModuleCsvContext } from "../contexts/ModuleCsvContext";
import { useEffect } from "react";

function ModalFilterSelector() {

    const { t } = useTranslation();
    const { mode } = useThemeContext();
    // filters {active: BOOLEAN, value: STRING, ordinalCounter: int}
    // handleFilterChange {index: NUMBER, newValue: STRING, newOrdinalCounter: int}
    const { data, erasmusCodes, filters, handleFilterChange, handleFilterOptionsChange, resetAllFilters, resetOrdinalFilters, iscedFCodes, setAlasqlQueryAfter, originalData } = useModuleCsvContext();

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
        4: <Filter5Icon />,
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
        //utility: pick data source for a given filter index (originalData: base, f1, f2, f3, f4, f5)
        const getSourceDataForFilter = (filterIndex) => {
            const currentFilter = filters[filterIndex];

            //no active filters at all
            if (filters.every(f => !f.active)) {
                return originalData.base || [];
            }

            //filter is active
            if (currentFilter.active) {
                if (currentFilter.ordinalCounter === 0) {
                    return originalData.base || [];
                } else {
                    // ordinalCounter > 0 -> use the previous stage
                    const prevStageKey = `f${currentFilter.ordinalCounter}`;
                    return originalData[prevStageKey] || [];
                }
            }

            //filter is inactive -> use data from the latest active stage
            if (!currentFilter.active && activeFiltersCount > 0) {
                return originalData[`f${activeFiltersCount}`] || [];
            }

            return originalData.base || [];
        };

        // Filter 1 options - CSVTH_MOBILITY_TYPE - Z -> A
        handleFilterOptionsChange(
            0,
            [...new Set(
                getSourceDataForFilter(0).map(d => d.CSVTH_MOBILITY_TYPE)
            )]
                .map(key => ({ key, label: t(key) }))
                .sort((a, b) => b.label.localeCompare(a.label))
        );

        // Filter 2 options - CSVTH_NUMBER_OF_MOBILITIES - ASC
        handleFilterOptionsChange(
            1,
            [...new Set(
                getSourceDataForFilter(1).map(d => String(d.CSVTH_NUMBER_OF_MOBILITIES))
            )]
                .sort((a, b) => Number(a) - Number(b))
        );

        // Filter 3 options - CSVTH_STATUS
        // handleFilterOptionsChange(
        //     2,
        //     [...new Set(
        //         getSourceDataForFilter(2).map(d => d.CSVTH_STATUS)
        //     )]
        //         .sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b))
        //         .map(key => ({ key, label: t(key) }))
        // );

        // Filter 4 options - CSVTH_PARTNER_WWW
        handleFilterOptionsChange(
            3,
            [...new Set(
                getSourceDataForFilter(3).map(d => d.CSVTH_PARTNER_WWW)
            )]
                .sort((a, b) => a.localeCompare(b))
                .map(key => ({ key, label: key }))
        );

        // Filter 5 options - CSVTH_SUBJECT_AREA
        handleFilterOptionsChange(
            4,
            (() => {
                const source = getSourceDataForFilter(4);

                //extract all raw, split codes
                const rawCodes = new Set(
                    source.flatMap(d => {
                        const parts = String(d.CSVTH_SUBJECT_AREA || "")
                            .split(",")
                            .map(v => v.trim())
                            .filter(v => v && v !== "CSVTD_NULL");

                        const mapped = [];

                        parts.forEach(code => {
                            mapped.push(code); // always include original

                            //if 3-digit code -> also include padded 4-digit (version with 0 as the last digit)
                            if (/^\d{3}$/.test(code)) {
                                mapped.push(code + "0");
                            }
                        });

                        return mapped;
                    })
                );

                //build a set containing both original codes and their inferred 2-digit prefixes.
                const expandedCodes = new Set(rawCodes);

                rawCodes.forEach(code => {
                    if (code.length === 4) {
                        //"0421" → add "04"
                        expandedCodes.add(code.slice(0, 2));
                    }
                    if (code.length === 3) {
                        // Rare but safe: "421" → "42"
                        expandedCodes.add(code.slice(0, 2));
                    }
                });

                //filter ISCED table to keep only codes that appear (either directly or as inferred 2-digit prefixes).
                const filteredIscedCodes = iscedFCodes.filter(c =>
                    expandedCodes.has(c.code)
                );

                return filteredIscedCodes
                    .map(c => ({
                        key: c.code,
                        label: `${c.code}: ${c.name}`,
                    }))
                    .sort((a, b) => a.key.localeCompare(b.key));
            })()
        );
        // console.log(originalData);
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
            // if (i === 2) {
            //     const clause = csvStatuses[f.value.key || f.value];
            //     if (clause) whereClauses.push(clause.replace(/^WHERE\s+/i, ''));
            // }

            // Filter 4 – CSVTH_PARTNER_WWW
            if (i === 3) {
                whereClauses.push(`([partner_1_hei_id] = "${f.value.key}" OR [partner_2_hei_id] = "${f.value.key}")`);
            }

            // Filter 5 – CSVTH_SUBJECT_AREA
            if (i === 4) {
                const code = f.value?.key || f.value;
                if (!code) return;

                const rawNoZero = code.startsWith("0") ? code.slice(1) : code;
                const len = code.length;
                const variants = new Set();

                // 4-digit selected
                if (len === 4) {
                    // always match exact + raw form
                    variants.add(code);      // "0110"
                    variants.add(rawNoZero); // "110"

                    // if ends with 0 → also match parent 3-digit
                    if (code.endsWith("0")) {
                        const parent3 = code.slice(0, 3);                  // "011"
                        const parent3Raw = parent3.replace(/^0+/, "");     // "11"
                        variants.add(parent3);                             // "011"
                        variants.add(parent3Raw);                          // "11"
                    }
                }

                // 3-digit selected (fallback, even if not used by UI)
                else if (len === 3) {
                    variants.add(code);
                    variants.add(rawNoZero);
                    variants.add(code + "0");      // "023" → "0230"
                    variants.add(rawNoZero + "0"); // "23" → "230"
                }

                // 2-digit selected
                else if (len === 2) {
                    variants.add(code);      // "02"
                    variants.add(rawNoZero); // "2"
                    // also match padded 3-digit ("11" → "011")
                    variants.add(code.padStart(3, "0"));
                }

                const clauses = [];

                // 2-digit: broad prefix searching
                if (len === 2) {
                    const padded = code.padStart(3, "0"); // "02" → "002" (safe)

                    const twoDigitPatterns = [code, rawNoZero, padded];

                    twoDigitPatterns.forEach(v => {
                        clauses.push(
                            `(CAST([coop_cond_subject_area] AS STRING) LIKE "${v}%" ` +
                            `OR CAST([coop_cond_subject_area] AS STRING) LIKE "%,${v}%")`
                        );
                    });
                }

                // 3- and 4-digit: exact + comma-aware matching
                else {
                    variants.forEach(v => {
                        if (!v) return;
                        clauses.push(
                            `(` +
                            `CAST([coop_cond_subject_area] AS STRING) = "${v}" ` +
                            `OR CAST([coop_cond_subject_area] AS STRING) LIKE "${v},%" ` +
                            `OR CAST([coop_cond_subject_area] AS STRING) LIKE "%,${v},%" ` +
                            `OR CAST([coop_cond_subject_area] AS STRING) LIKE "%,${v}"` +
                            `)`
                        );
                    });
                }

                if (clauses.length) {
                    whereClauses.push(`(${clauses.join(" OR ")})`);
                }
            }
        });

        const newAlasqlQueryAfter = whereClauses.length
            ? `WHERE ${whereClauses.join(' AND ')} ORDER BY CSVTH_ERASMUS_CODE`
            : `ORDER BY CSVTH_ERASMUS_CODE`;

        setAlasqlQueryAfter(newAlasqlQueryAfter);

        // console.log('ALASQL QUERY AFTER:', newAlasqlQueryAfter);
    }, [filters]);

    // Filtering - partners counter helper function (sg, paucal, plural)
    const getPartnerUniversityLabel = (count) => {
        if (count === 1) return t('MFS_PARTNER_UNIVERSITY_SINGULAR');
        const lastDigit = count % 10;
        const lastTwoDigits = count % 100;
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 12 || lastTwoDigits > 14))
            return t('MFS_PARTNER_UNIVERSITIES_PAUCAL_2_4');
        return t('MFS_PARTNER_UNIVERSITIES_PLURAL_5');
    };

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
                        let newActiveFiltersCount = value
                            ? filters[0].ordinalCounter || activeFiltersCount
                            : 0;

                        if (!value) {
                            resetOrdinalFilters(0);
                            setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');
                        }
                        if (filters[0].value && value) {
                            resetOrdinalFilters(0);
                            newActiveFiltersCount = filters[0].ordinalCounter;
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
            {/* TEMPORARILY HIDDEN */}
            {/* <Box sx={filterBoxSx}>
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
            </Box> */}

            {/* FILTER 4 - CSVTH_PARTNER_WWW */}
            <Box sx={filterBoxSx}>
                {filters[3].active ? ordinalCounterIconMap[filters[3].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[3].value}
                    options={filters[3].options}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_PARTNER_WWW")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(3);
                            newActiveFiltersCount = 0;
                            setAlasqlQueryAfter('ORDER BY CSVTH_ERASMUS_CODE');
                        }
                        if (filters[3].value && value) {
                            resetOrdinalFilters(3);
                            newActiveFiltersCount = filters[3].ordinalCounter;
                        }
                        handleFilterChange(3, value, newActiveFiltersCount);
                    }}
                />
            </Box>


            {/* FILTER 5 - CSVTH_SUBJECT_AREA */}
            <Box sx={filterBoxSx}>
                {filters[4].active ? ordinalCounterIconMap[filters[4].ordinalCounter] : <FilterAltOffIcon />}
                <Autocomplete
                    disablePortal
                    value={filters[4].value}
                    options={filters[4].options}
                    sx={autocompleteSx}
                    renderInput={(params) => <TextField {...params} label={t("CSVTH_SUBJECT_AREA")} />}
                    onChange={(e, value) => {
                        let newActiveFiltersCount = activeFiltersCount;
                        if (!value) {
                            resetOrdinalFilters(4);
                            newActiveFiltersCount = 0;
                        }
                        if (filters[4].value && value) {
                            resetOrdinalFilters(4);
                            newActiveFiltersCount = filters[4].ordinalCounter;
                        }
                        handleFilterChange(4, value, newActiveFiltersCount);
                    }}
                />
            </Box>

            {/* FILTERS - SUMMARY */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {/* FILTERING - ON/OFF */}
                <Typography sx={{ my: 0.2, fontSize: '0.9rem' }}>
                    {t('MFS_FILTERING')}:{' '}
                    <Box
                        component="span"
                        sx={{
                            color:
                                activeFiltersCount > 0
                                    ? mode === 'light'
                                        ? 'green'
                                        : 'lightgreen'
                                    : mode === 'light'
                                        ? 'red'
                                        : '#f28b82',
                            fontWeight: 500,
                        }}
                    >
                        {activeFiltersCount > 0 ? t('MFS_FILTERING_ON') : t('MFS_FILTERING_OFF')}
                    </Box>
                </Typography>
                {/* FILTERING - PARTNERS COUNTER */}
                <Typography sx={{ my: 0.2, fontSize: '0.9rem' }}>
                    {t('MFS_FOUND')} {erasmusCodes.length} {getPartnerUniversityLabel(erasmusCodes.length)}
                </Typography>
            </Box>


            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    disabled={activeFiltersCount === 0}
                    sx={{ mt: 1.5, mb: 0.3 }}
                    onClick={resetAllFilters}
                >
                    {t('MFS_RESET_FILTERS')}
                </Button>
            </Box>
        </>
    );
}

export default ModalFilterSelector;