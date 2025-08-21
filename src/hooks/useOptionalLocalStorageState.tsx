import { useLocalStorageState } from '@toolpad/core';

function useOptionalLocalStorageState<T>(key: string, defaultValue: T) {
  const [storedValue, setStoredValue] = useLocalStorageState<T | undefined>(key, undefined);

  // if nothing in localStorage, return defaultValue but don't persist it in localStorage
  const value = storedValue ?? defaultValue;

  const setValue = (newValue: T) => {
    setStoredValue(newValue); // now it will be written to localStorage (e.g. if user selects the app language manually)
  };

  return [value, setValue] as const;
}

export default useOptionalLocalStorageState;