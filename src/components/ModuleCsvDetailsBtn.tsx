import { Box, Button, Tooltip, Typography } from "@mui/material";
import { useTranslation } from 'react-i18next';
import { useModalContext } from '../contexts/ModalContext';
import ContentPasteSearchIcon from '@mui/icons-material/ContentPasteSearch';
import alasql from 'alasql';

interface ModuleCsvDetailsBtnProps {
  data: any[];
  rowId: number;
}

function ModuleCsvDetailsBtn({ data, rowId }: ModuleCsvDetailsBtnProps) {
  const { t } = useTranslation();
  const { modalOpen } = useModalContext();

  const handleOpenModal = () => {
    // Query the row by id
    const selectedRow = alasql('SELECT * FROM ? WHERE id = ?', [data, rowId])[0];

    if (!selectedRow) return;

    // XLSX COLUMNS FOR DETAILED VIEW GO HERE (except id, which is defined as rowId)
    const {
        CSVTH_ERASMUS_CODE,
        CSVTH_INSTITUTION_NAME,
        CSVTH_MOBILITY_TYPE,
        CSVTH_EQF,
        CSVTH_BLENDED,
        CSVTH_LANGUAGE_REQUIREMENTS,
        CSVTH_FROM,
        CSVTH_TO,
    } = selectedRow;

    const content = (
        
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>

        {/* HEADER - MOBILITY TYPE */}
        <Typography sx={{ mb: 1, textDecoration: 'underline', textAlign: 'center', fontSize: '0.95em' }}>
            {t(CSVTH_MOBILITY_TYPE)}
        </Typography>

        {/* SENDING INSTITUTION */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '0.95em', fontWeight: 'bold' }}>
            {t('EWP_SENDING_INSTITUTION')}:
        </Typography>
        <Typography sx={{ fontSize: '0.95em' }}>
            {CSVTH_MOBILITY_TYPE?.includes('OUTGOING')
            ? `${t('THIS_INSTITUTION_NAME').replace(/ /g, '\u00A0')} (${t('THIS_INSTITUTION_EC').replace(/ /g, '\u00A0')})`
            : CSVTH_MOBILITY_TYPE?.includes('INCOMING')
            ? `${CSVTH_INSTITUTION_NAME.replace(/ /g, '\u00A0')} (${CSVTH_ERASMUS_CODE.replace(/ /g, '\u00A0')})`
            : '-'}
        </Typography>
        </Box>

        {/* RECEIVING INSTITUTION */}
        <Box sx={{ textAlign: 'center', mb: 1 }}>
        <Typography sx={{ fontSize: '0.95em', fontWeight: 'bold' }}>
            {t('EWP_RECEIVING_INSTITUTION')}:
        </Typography>
        <Typography sx={{ fontSize: '0.95em' }}>
            {CSVTH_MOBILITY_TYPE?.includes('OUTGOING')
            ? `${CSVTH_INSTITUTION_NAME.replace(/ /g, '\u00A0')} (${CSVTH_ERASMUS_CODE.replace(/ /g, '\u00A0')})`
            : CSVTH_MOBILITY_TYPE?.includes('INCOMING')
            ? `${t('THIS_INSTITUTION_NAME').replace(/ /g, '\u00A0')} (${t('THIS_INSTITUTION_EC').replace(/ /g, '\u00A0')})`
            : '-'}
        </Typography>
        </Box>


        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
            {t('CSVTH_EQF')}:
        </Typography>
        <Typography variant="body2">{CSVTH_EQF ?? '-'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
            {t('CSVTH_BLENDED')}:
        </Typography>
        <Typography variant="body2">{CSVTH_BLENDED ?? '-'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
            {t('CSVTH_LANGUAGE_REQUIREMENTS')}:
        </Typography>
        <Typography variant="body2">{CSVTH_LANGUAGE_REQUIREMENTS ?? '-'}</Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
            {t('CSVTH_FROM')}:
        </Typography>
        <Typography variant="body2">
            {CSVTH_FROM instanceof Date ? CSVTH_FROM.toLocaleDateString() : CSVTH_FROM ?? '-'}
        </Typography>
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
            {t('CSVTH_TO')}:
        </Typography>
        <Typography variant="body2">
            {CSVTH_TO instanceof Date ? CSVTH_TO.toLocaleDateString() : CSVTH_TO ?? '-'}
        </Typography>
        </Box>
    </Box>

    );

    modalOpen({ title: `${t('CSVTHD_SHOW_DETAILS')} (${rowId})`, content });
  };

  return (
    <Tooltip
      arrow
      title={
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ fontSize: 10 }}>
            {t('CSVTHD_SHOW_DETAILS')}
          </Typography>
        </Box>
      }
      slotProps={{
        popper: {
          modifiers: [
            {
              name: 'offset',
              options: { offset: [0, -8] },
            },
          ],
        },
      }}
    >
      <Button
        sx={{
          p: 0.5,
          minWidth: 'auto',
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mx: 'auto',
          '&:hover': { backgroundColor: 'transparent' },
        }}
        onClick={handleOpenModal}
      >
        <ContentPasteSearchIcon />
      </Button>
    </Tooltip>
  );
}

export default ModuleCsvDetailsBtn;
