// InfoCol.jsx
import React from 'react';

const InfoStatCard = ({ value, label, color = '#0369a1', bgColor = '#f0f9ff' }) => {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '15px',
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${color}33`, // légère transparence
      }}
    >
      <div style={{ fontSize: '24px', fontWeight: '700', color }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color, fontWeight: '500' }}>
        {label}
      </div>
    </div>
  );
};

export default InfoStatCard;
