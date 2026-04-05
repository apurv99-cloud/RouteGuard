import React from 'react';

const FeatureCard = ({ icon, title, description }) => (
  <div className="p-8 rounded-3xl bg-white border border-slate-100 hover:border-brand-sage/40 hover:shadow-2xl hover:shadow-brand-sage/5 transition-all duration-300 group">
    <div className="p-4 bg-brand-lightest rounded-2xl text-brand-deep w-fit mb-6 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h4 className="text-xl font-black text-brand-darkest mb-3 tracking-tight">{title}</h4>
    <p className="text-slate-500 leading-relaxed text-sm font-medium">{description}</p>
  </div>
);

export default FeatureCard;