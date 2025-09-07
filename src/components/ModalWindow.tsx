import { Modal, Box, Typography, IconButton, styled, useTheme } from '@mui/material';
import { useModalContext } from '../contexts/ModalContext';
import { lighten } from '@mui/system';
import CloseIcon from '@mui/icons-material/Close';
function ModalWindow() {

    const { isModalOpen, setIsModalOpen, currentModalContent } = useModalContext();

    const theme = useTheme();

    const ModalHeader = styled(Box)(({ theme }) => ({
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing(2),
    }));

    const ModalContent = styled(Box)(({ theme }) => ({
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: 525,
      maxWidth: '85%',
      backgroundColor: lighten(theme.palette.background.paper, 0.125),
      boxShadow: theme.shadows[24],
      borderRadius: theme.shape.borderRadius,
      padding: theme.spacing(2.5),
      outline: 'none',
    }));

    return ( 
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <ModalContent>
          <ModalHeader>
            <Typography variant="h6" component="h2" id="theme-aware-modal-title">
              {currentModalContent.title}
            </Typography>
            <IconButton
              aria-label="close"
              onClick={() => setIsModalOpen(false)}
              sx={{
                color: theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          </ModalHeader>
          <Typography id="theme-aware-modal-description" sx={{ mt: 2, mb: 0.5 }}>
          {currentModalContent.content}
          </Typography>
        </ModalContent>
      </Modal>
     );
}

export default ModalWindow;