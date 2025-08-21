import { createContext, useContext, useRef, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useLocalStorageState } from '@toolpad/core';
import { lighten, darken } from '@mui/material';
import { light } from '@mui/material/styles/createPalette';

type ModeType = "light" | "dark" | null;
interface ThemeContextType {
    currentAppLanguage: string;
    setCurrentAppLanguage: (lang: string) => void;
    mode: ModeType;
    setMode: (mode: ModeType) => void;
    toggleTheme: () => void;
    dataGridTableHeight: number;
    setDataGridTableHeight: (height: number) => void;
    dataGridColumnWidth: number;
    setDataGridColumnWidth: (width: number) => void;
    rowWithColumnNames: number;
    setRowWithColumnNames: (rows: number) => void;
    trimRows: boolean;
    setTrimRows: (trim: boolean) => void;
    optionsLastActiveTextFieldId: React.MutableRefObject<string>;
  }

  const ThemeContext = createContext<ThemeContextType | null>(null);

  const ThemeContextProvider = ({ children }: { children: React.ReactNode }) => {

    const [currentAppLanguage, setCurrentAppLanguage] = useLocalStorageState<string>('currentAppLanguage', 'PL');

    // const prefersDarkMode = useMediaQuery<boolean>('(prefers-color-scheme: dark)');
    const [mode, setMode] = useLocalStorageState<ModeType>('selectedMode', 'light');

    //Data Grid / Table - Height (manageable in Options, default 490px)
    const [dataGridTableHeight, setDataGridTableHeight] = useState<number>(590);

    //Data Grid - Column Width (manageable in Options, default 100px, minimum 100px)
    const [dataGridColumnWidth, setDataGridColumnWidth] = useLocalStorageState<number>('dataGridColumnWidth', 100);

    //Data Grid / Table - Row with Column Names (column offset) (manageable in Options, default 1)
    const [rowWithColumnNames, setRowWithColumnNames] = useLocalStorageState<number>('rowWithColumnNames', 1);
    
    //the boolean value below (trimRows) is always converted to string because of the localStorage
    const [trimRows, setTrimRows] = useLocalStorageState<boolean>('trimRows', true);

    const optionsLastActiveTextFieldId = useRef<string>("");

    const appTheme = createTheme({
        palette: {
            mode: mode ?? 'light', // Dynamically sets mode to light or dark
            primary: {
            main: mode === 'dark' ? lighten('#1976d2', 0.25) : '#1976d2',
            },
            secondary: {
            main: '#dc004e',
            },
            background: {
            default: mode === 'dark' ? lighten('#121212', 0.12) : darken('#ffffff', 0.1), // Background color based on mode
            },
            text: {
            primary: mode === 'dark' ? '#ffffff' : '#000000', // Text color based on mode
            },
        },
        components: {
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundColor: mode === 'dark' ? lighten('#121212', 0.23) : '#ffffff', // Background adapts to mode
                borderRadius: '4px',
              },
            },
          },
            MuiInputBase: {
            styleOverrides: {
                input: {
                color: mode === 'dark' ? 'white' : 'black', // Font color adapts to mode
                },
            },
            },
            MuiInputAdornment: {
            styleOverrides: {
                root: {
                color: mode === 'dark' ? 'white' : 'black', // Adornment color adapts to mode
                },
            },
            },
            MuiOutlinedInput: {
            styleOverrides: {
                root: {
                '& fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black', // Border color adapts to mode
                },
                '&:hover fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black', // Hover border color adapts to mode
                },
                '&.Mui-focused fieldset': {
                    borderColor: mode === 'dark' ? 'white' : 'black', // Focused border color adapts to mode
                },
                },
            },
            },
            MuiInputLabel: {
                styleOverrides: {
                  root: {
                    color: mode === 'dark' ? 'white' : 'black', // Default label color
                    '&.Mui-focused': {
                      color: mode === 'dark' ? 'white' : 'black', // Label color when focused
                    },
                  },
                },
              },
            MuiTextField: {
            styleOverrides: {
                root: {
                marginBottom: '16px',
                '& .MuiInputBase-input': {
                    color: mode === 'dark' ? 'white' : 'black', // Font color adapts to mode
                },
                },
            },
            },
            MuiFileInput: {
            styleOverrides: {
                root: {
                marginBottom: '16px',
                '& .MuiInputBase-input': {
                    color: mode === 'dark' ? 'white' : 'black', // File input text color adapts to mode
                },
                },
            },
            },
            MuiDataGrid: {
              styleOverrides: {
                columnHeader: {
                  backgroundColor: mode === 'dark' ? lighten('#121212', 0.14) : darken('#ffffff', 0.12),
                },
                cell: {
                  backgroundColor: mode === 'dark' ? lighten('#121212', 0.04) : 'white',
                },
                footerContainer: {
                  backgroundColor: mode === 'dark' ? lighten('#121212', 0.14) : darken('#ffffff', 0.12),
                }
              },
            },
        },
    });

        const toggleTheme = () => {
            setMode(mode === 'light' ? 'dark' : 'light');
          };

return (
    <ThemeContext.Provider value={{ currentAppLanguage, setCurrentAppLanguage, mode, setMode, toggleTheme, dataGridTableHeight, setDataGridTableHeight, dataGridColumnWidth, setDataGridColumnWidth, rowWithColumnNames, setRowWithColumnNames, trimRows, setTrimRows, optionsLastActiveTextFieldId }}>
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};


const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
      throw new Error('useThemeContext must be used within a ThemeContextProvider');
    }
    return context;
  };
  
  export { ThemeContextProvider, useThemeContext };