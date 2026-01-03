import { ThemeContextProvider } from './contexts/ThemeContext';
import { ModalContextProvider } from './contexts/ModalContext';
import { ModuleCsvContextProvider } from './contexts/ModuleCsvContext';
import { ModuleEwpContextProvider } from './contexts/ModuleEwpContext';
import { PWAContextProvider } from './contexts/PWAContext';
import SqlApp from './components/SqlApp';

function App() {

  return (
    <ThemeContextProvider>
      <ModalContextProvider>
        <ModuleCsvContextProvider>
          <ModuleEwpContextProvider>
            <PWAContextProvider>
              <SqlApp />
            </PWAContextProvider>
          </ModuleEwpContextProvider>
        </ModuleCsvContextProvider>
      </ModalContextProvider>
    </ThemeContextProvider>
  );
}

export default App;