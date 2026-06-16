import React from 'react';

const StatCard = ({ icon: Icon, value, label, tag, tone = 'indigo' }) => (
  <article className={`m-stat m-stat--${tone}`}>
    <div className="m-stat__glow" aria-hidden />
    <div className="m-stat__icon">
      <Icon />
    </div>
    <div className="m-stat__body">
      <div className="m-stat__value">{value}</div>
      <div className="m-stat__label">{label}</div>
      {tag && <span className="m-stat__tag">{tag}</span>}
    </div>
  </article>
);

export default StatCard;
