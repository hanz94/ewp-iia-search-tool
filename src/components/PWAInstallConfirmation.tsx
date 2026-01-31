import { Button, Box, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { useModalContext } from '../contexts/ModalContext';
import { usePWAContext } from '../contexts/PWAContext';
import { useTranslation } from 'react-i18next';

const PWAInstallConfirmation = () => {
    const { modalClose } = useModalContext();
    const { handleInstallPWA, isInstallable, isPwaMode, isInstalled } = usePWAContext();
    const { t } = useTranslation();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
            {isInstalled ? (
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                    {t('PWA_APP_HAS_BEEN_INSTALLED')}
                </Typography>
            ) : isPwaMode ? (
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                    {t('PWA_APP_ALREADY_INSTALLED_AND_RUNNING')}
                </Typography>
            ) : isInstallable ? (
                <>
                    <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                        {t('PWA_INSTALL_PROMPT', { appName: 'KUL IIAs Search' })}
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '2rem', alignSelf: 'flex-start' }}>
                        <li>{t('PWA_LI_ASSET_1')}</li>
                        <li>{t('PWA_LI_ASSET_2')}</li>
                        <li>{t('PWA_LI_ASSET_3')}</li>
                    </ul>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" startIcon={<CheckIcon />} onClick={handleInstallPWA}>
                            {t('PWA_BUTTON_INSTALL')}
                        </Button>
                        <Button variant="outlined" onClick={modalClose}>
                            {t('PWA_BUTTON_NOT_NOW')}
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                    {t('PWA_INSTALLATION_NOT_SUPPORTED')}
                </Typography>
            )}
        </Box>
    );
};

export default PWAInstallConfirmation;
