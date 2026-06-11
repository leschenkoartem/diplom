import React from 'react';
import { Button } from 'react-bootstrap';
import { FaPlay, FaStop } from 'react-icons/fa';
import { useAnomalySimulation } from '../hooks/useAnomalySimulation';

const SimulationToggle = ({ className = '' }) => {
  const [enabled, toggle] = useAnomalySimulation();

  return (
    <Button
      variant={enabled ? 'danger' : 'warning'}
      onClick={toggle}
      className={`d-flex align-items-center gap-2 ${className}`}
    >
      {enabled ? <FaStop /> : <FaPlay />}
      {enabled ? 'Зупинити симуляцію аномалій' : 'Запустити симуляцію аномалій'}
    </Button>
  );
};

export default SimulationToggle;
