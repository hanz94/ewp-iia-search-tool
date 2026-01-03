import { Button, Box, Typography } from "@mui/material";
import CheckIcon from '@mui/icons-material/Check';
import { useModalContext } from '../contexts/ModalContext';
import { usePWAContext } from '../contexts/PWAContext';

const PWAInstallConfirmation = () => {
    const { modalClose } = useModalContext();
    const { handleInstallPWA, isInstallable, isPwaMode, isInstalled } = usePWAContext();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, py: 1 }}>
            {isInstalled ? (
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                    Aplikacja została zainstalowana.
                </Typography>
            ) : isPwaMode ? (
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                    Aplikacja jest już zainstalowana i uruchomiona.
                </Typography>
            ) : isInstallable ? (
                <>
                    <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                        Czy chcesz zainstalować aplikację "KUL IIAs Search"?
                    </Typography>
                    <ul style={{ margin: 0, paddingLeft: '2rem', alignSelf: 'flex-start' }}>
                        <li>szybszy dostęp do umów</li>
                        <li>ikona na ekranie głównym</li>
                        <li>automatyczne aktualizacje</li>
                    </ul>
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        <Button variant="contained" startIcon={<CheckIcon />} onClick={handleInstallPWA}>
                            Zainstaluj
                        </Button>
                        <Button variant="outlined" onClick={modalClose}>
                            Nie teraz
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="h6" sx={{ textAlign: 'center', fontSize: '1.1rem' }}>
                    Aplikacja jest już zainstalowana lub Twoja przeglądarka nie wspiera instalacji.
                </Typography>
            )}
        </Box>
    );
};

export default PWAInstallConfirmation;
