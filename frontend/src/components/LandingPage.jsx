import React from 'react';
import { Truck, Github, Linkedin, Twitter } from 'lucide-react';
import Navbar from './Navbar';
import Hero from './landing/Hero';
import Features from './landing/Features';
import HowItWorks from './landing/HowItWorks';

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-white selection:bg-brand-sage selection:text-brand-darkest overflow-x-hidden">
            {/* Navigation Header */}
            <Navbar />

            {/* Main Content Area */}
            <main className="flex-grow">
                <Hero />
                <Features />
                <HowItWorks />
            </main>

            {/* Industrial Minimalist Footer */}
            <footer className="py-20 px-8 border-t border-slate-100 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">

                    {/* Brand Section */}
                    <div className="space-y-4 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-3 text-brand-darkest">
                            <div className="p-2 bg-brand-darkest rounded-lg">
                                <Truck className="w-5 h-5 text-brand-sage" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter uppercase">
                                Route<span className="text-brand-sage">Guard</span>
                            </span>
                        </div>
                        <p className="text-brand-steel text-sm font-medium max-w-xs leading-relaxed">
                            Precision route monitoring and real-time telemetry for modern global logistics.
                        </p>
                    </div>

                    {/* Quick Links / Socials */}
                    <div className="flex flex-col items-center md:items-end gap-6">
                        <div className="flex gap-6">
                            <a href="#" className="text-brand-steel hover:text-brand-darkest transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-brand-steel hover:text-brand-darkest transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-brand-steel hover:text-brand-darkest transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
                            © 2026 RouteGuard Intelligence Systems
                        </p>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default LandingPage;