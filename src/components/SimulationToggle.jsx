import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPlay, FaStop, FaSatelliteDish } from 'react-icons/fa';
import { useAnomalySimulation } from '../hooks/useAnomalySimulation';
import { useModernTheme } from '../hooks/useModernTheme';

const SimulationToggle = ({ className = '' }) => {
  const [enabled, toggle] = useAnomalySimulation();
  const [isModern] = useModernTheme();

  if (isModern) {
    return (
      <button
        type="button"
        onClick={toggle}
        className={`m-iot-toggle ${enabled ? 'is-active' : ''} ${className}`}
      >
        <FaSatelliteDish />
        {enabled ? 'IoT активний' : 'Увімкнути IoT'}
        <span className="m-iot-toggle__dot" />
      </button>
    );
  }

  return (
    <Button
      variant={enabled ? 'danger' : 'warning'}
      onClick={toggle}
      className={`d-flex align-items-center gap-2 ${className}`}
    >
      {enabled ? <FaStop /> : <FaPlay />}
      {enabled ? 'Зупинити IoT-моніторинг' : 'Увімкнути IoT-моніторинг'}
    </Button>
  );
};

export default SimulationToggle;
