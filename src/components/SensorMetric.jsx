import React from 'react';

const SensorMetric = ({ icon: Icon, value, unit, label, tone, percent = 65 }) => (
  <div className={`m-metric m-metric--${tone}`}>
    <div className="m-metric__top">
      <span className="m-metric__icon"><Icon /></span>
      <span className="m-metric__value">
        {value}
        {unit && <small>{unit}</small>}
      </span>
    </div>
    <div className="m-metric__bar" aria-hidden>
      <span style={{ width: `${Math.min(100, percent)}%` }} />
    </div>
    <span className="m-metric__label">{label}</span>
  </div>
);

export default SensorMetric;
