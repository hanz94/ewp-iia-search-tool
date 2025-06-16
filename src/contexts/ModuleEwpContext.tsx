import { createContext, useContext } from 'react';

interface ModuleEwpContextType {
  getAgreementLabel: (count: number) => string;
  formatTimeHeader: (raw: string) => string;
  formatTimeBody: (raw: string) => string;
}

const ModuleEwpContext = createContext<ModuleEwpContextType | undefined>(undefined);

function getAgreementLabel(count: number): string {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (count === 1) {
    return 'umowę międzyinstytucjonalną';
  }

  if (
    lastDigit >= 2 &&
    lastDigit <= 4 &&
    !(lastTwoDigits >= 12 && lastTwoDigits <= 14)
  ) {
    return 'umowy międzyinstytucjonalne';
  }

  return 'umów międzyinstytucjonalnych';
}

function formatTimeHeader(raw: string): string {
  if (!raw) return 'brak danych';

  const [, datePart, timePart] = raw.split(/,\s*|\s*-\s*/); // ["Tue", "04/02/2024", "15:09"]
  const [month, day, year] = datePart.split('/');
  const [hour, minute] = timePart.split(':');

  const date = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute));

  const pad = (n: number) => String(n).padStart(2, '0');

  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatTimeBody(raw: string): string {
  const date = new Date(raw);

  // Add 1 hour (3600000 milliseconds) -> timezone offset +1
  const offsetDate = new Date(date.getTime() + 3600000);

  const day = String(offsetDate.getDate()).padStart(2, '0');
  const month = String(offsetDate.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = offsetDate.getFullYear();

  // Check if input contains time part (has "T" and "Z" or "T" and time)
  const hasTime = raw.includes('T');

  if (hasTime) {
    const hours = String(offsetDate.getHours()).padStart(2, '0');
    const minutes = String(offsetDate.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  } else {
    return `${day}-${month}-${year}`;
  }
}

const ModuleEwpContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ModuleEwpContext.Provider value={{ getAgreementLabel, formatTimeHeader, formatTimeBody }}>
      {children}
    </ModuleEwpContext.Provider>
  );
};

const useModuleEwpContext = () => {
  const context = useContext(ModuleEwpContext);
  if (!context) {
    throw new Error('useModuleEwpContext must be used within a ModuleEwpContextProvider');
  }
  return context;
};

export { ModuleEwpContextProvider, useModuleEwpContext };
