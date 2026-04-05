import React from 'react';
import { Navigation, Radio, ShieldCheck } from 'lucide-react';

const HowItWorks = () => {
  return (
    <section className="py-32 px-6 bg-brand-lightest/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-24 space-y-4">
          <h3 className="text-xs uppercase tracking-[0.5em] font-black text-brand-steel">Streamlined Process</h3>
          <h2 className="text-4xl md:text-5xl font-black text-brand-darkest tracking-tighter">How RouteGuard Secures Your Chain</h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-16 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[60px] left-[10%] right-[10%] h-[1px] bg-brand-sage/30" />

          <Step
            number="01"
            title="Assign Route"
            description="Input destination coordinates. Our system generates a high-precision OSRM polyline path with optimal transit buffer zones."
            icon={<Navigation className="w-8 h-8" />}
          />
          <Step
            number="02"
            title="Track Truck"
            description="Continuous comparison between real-time GPS telemetry and the assigned OSRM route model every millisecond."
            icon={<Radio className="w-8 h-8" />}
          />
          <Step
            number="03"
            title="Detect Deviation"
            description="Administrative flags are instantly triggered if the vehicle breaches its designated route corridor."
            icon={<ShieldCheck className="w-8 h-8" />}
          />
        </div>
      </div>
    </section>
  );
};

const Step = ({ number, title, description, icon }) => (
  <div className="flex flex-col items-center text-center group">
    <div className="relative mb-10">
      {/* Icon Container */}
      <div className="w-20 h-20 bg-white rounded-[2rem] border border-brand-sage/20 flex items-center justify-center shadow-xl z-10 relative group-hover:-translate-y-2 transition-transform duration-500">
        <div className="text-brand-deep">{icon}</div>
      </div>
      
      {/* Step Number Badge */}
      <div className="absolute -top-3 -right-3 w-10 h-10 bg-brand-darkest text-brand-sage rounded-xl flex items-center justify-center font-black text-xs border border-white/10 shadow-lg z-20">
        {number}
      </div>

      {/* Decorative Map Placeholder */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-20 bg-brand-sage/5 border border-brand-sage/10 rounded-xl -z-10 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[grid] bg-[size:10px_10px]" 
             style={{ backgroundImage: 'radial-gradient(#000 0.5px, transparent 0.5px)' }} />
      </div>
    </div>

    <div className="space-y-4">
      <h4 className="text-2xl font-black text-brand-darkest tracking-tight">{title}</h4>
      <p className="text-brand-steel text-sm leading-relaxed font-medium max-w-[280px]">
        {description}
      </p>
    </div>
  </div>
);

export default HowItWorks;