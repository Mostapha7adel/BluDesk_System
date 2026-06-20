import { useCallback } from 'react';
import ar from './translations';

export function useTranslate() {
  const t = useCallback((key) => {
    const keys = key.split('.');
    let val = ar;
    for (const k of keys) val = val?.[k];
    return val || key;
  }, []);
  return t;
}

export default useTranslate;
