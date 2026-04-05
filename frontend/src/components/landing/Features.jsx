import React from 'react';
import { MapPin, Shield, Zap, BarChart3, Truck, Box } from 'lucide-react';
import FeatureCard from './FeatureCard';

const Features = () => {
  const features = [
    {
      icon: <MapPin />,
      title: "Real-time GPS Tracking",
      description: "High-precision telemetry from every vehicle in your fleet, updated every second with centimeter-level accuracy."
    },
    {
      icon: <Shield />,
      title: "OSRM Route Validation",
      description: "Automated polyline verification using advanced Open Source Routing Machine algorithms for optimal pathing."
    },
    {
      icon: <Zap />,
      title: "Automatic Deviation Alerts",
      description: "Instant administrative flags and push notifications when any vehicle drifts beyond the designated safety corridor."
    },
    {
      icon: <BarChart3 />,
      title: "Analytics Dashboard",
      description: "Comprehensive performance insights, trip history trends, and deep fleet efficiency metrics at your fingertips."
    },
    {
      icon: <Truck />,
      title: "Fleet Monitoring Overview",
      description: "A centralized command center visualizing your entire operational footprint in one intuitive interface."
    }
  ];

  return (
    <section id="features" className="py-32 px-6 bg-white relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-brand-lightest/40 rounded-full blur-[100px] -z-10 translate-x-1/3 -translate-y-1/3" />

      <div className="max-w-7xl mx-auto">
        <header className="max-w-3xl mb-20 space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-0.5 bg-brand-deep"></div>
            <span className="text-xs uppercase tracking-[0.4em] font-black text-brand-deep">Capabilities</span>
          </div>
          <h2 className="text-4xl lg:text-6xl font-black text-brand-darkest leading-tight tracking-tighter">
            Optimizing Global Logistics <br />
            through <span className="text-brand-steel/70 italic">Next-Gen Intelligence</span>
          </h2>
        </header>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => (
            <FeatureCard 
              key={index}
              icon={React.cloneElement(feat.icon, { className: "w-7 h-7" })}
              title={feat.title}
              description={feat.description}
            />
          ))}

          {/* Special CTA Card */}
          <div className="p-10 rounded-3xl bg-[#01161E] text-white flex flex-col justify-center border border-white/5 relative overflow-hidden group">
            <div className="absolute -top-10 -right-10 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-500">
              <Box size={200} />
            </div>
            
            <div className="relative z-10 space-y-6">
              <h4 className="text-2xl font-black tracking-tight leading-tight">Ready to optimize your fleet?</h4>
              <p className="text-brand-sage/60 text-sm leading-relaxed">
                Experience precision monitoring that scales with your global operations.
              </p>
              <button onClick={() => window.location.href = "/dashboard"} className="w-full py-4 bg-brand-sage text-brand-darkest font-black rounded-xl text-xs uppercase tracking-widest hover:bg-white transition-colors">
                Get Started Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;