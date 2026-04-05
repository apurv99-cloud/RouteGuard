import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap } from 'lucide-react';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <section className="relative min-h-[calc(100dvh-80px)] flex items-center justify-center px-6 lg:px-12 bg-[#01161E] overflow-hidden ">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brand-sage/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 mt-10 max-w-5xl text-center space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-brand-sage/30 bg-brand-sage/5 text-brand-sage text-xs font-black uppercase tracking-[0.2em]">
                    <Zap className="w-3.5 h-3.5 fill-brand-sage" />
                    <span>Intelligence Powered by OSRM</span>
                </div>

                <div className="space-y-6">
                    <h1 className="text-2xl md:text-4xl lg:text-5xl font-black text-white leading-[1.1] tracking-tighter">
                        Intelligent <br />
                        <span className="text-brand-sage">Route Monitoring</span> <br />
                        <span className="text-white/90">for Smart Supply Chains</span>
                    </h1>

                    <p className="text-md md:text-lg text-brand-sage/70 max-w-2xl mx-auto leading-relaxed font-medium">
                        Track, validate, and optimize truck routes in real-time using high-precision telemetry and proactive deviation alerts.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="w-full sm:w-auto px-8 py-4 bg-brand-sage text-brand-darkest font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-brand-sage/10"
                    >
                        View Live Dashboard
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    <button className="w-full sm:w-auto px-8 py-4 border border-brand-sage/30 text-white font-bold rounded-2xl hover:bg-white/5 transition-all duration-300">
                        Track a Vehicle
                    </button>
                </div>

                {/* Trust Indicators */}
                <div className="flex justify-center gap-12 pt-8 border-t border-brand-sage/10 w-fit mx-auto mb-10">
                    <div className="text-center">
                        <p className="text-white font-black text-2xl">99.8%</p>
                        <p className="text-[10px] text-brand-sage/50 uppercase font-black tracking-widest mt-1">Route Accuracy</p>
                    </div>
                    <div className="text-center">
                        <p className="text-white font-black text-2xl">24/7</p>
                        <p className="text-[10px] text-brand-sage/50 uppercase font-black tracking-widest mt-1">Live Monitoring</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;