import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'anomalySimulationEnabled';
const EVENT_NAME = 'anomaly-simulation-toggle';

const readEnabled = () => localStorage.getItem(STORAGE_KEY) === 'true';

export const useAnomalySimulation = () => {
  const [enabled, setEnabled] = useState(readEnabled);

  useEffect(() => {
    const handler = (e) => setEnabled(e.detail);
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const toggle = useCallback(() => {
    const next = !readEnabled();
    localStorage.setItem(STORAGE_KEY, next ? 'true' : 'false');
    setEnabled(next);
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: next }));
  }, []);

  return [enabled, toggle];
};
