import React from 'react';

const InfoRow = ({ label, value }) => (
    <div className="flex items-center justify-between text-xs">
        <span className="text-brand-sage/50 font-medium">{label}</span>
        <span className="text-white font-bold tracking-tight">{value}</span>
    </div>
);

export default InfoRow;
