import React from 'react';
import { ChevronRight, AlertTriangle, TrendingUp } from 'lucide-react';
import MapView from '../MapView';
import InfoRow from './InfoRow';

const TruckDetail = ({ selectedTruck, setSelectedTruck }) => {
    return (
        <div className="space-y-8 flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <button
                    onClick={() => setSelectedTruck(null)}
                    className="group flex items-center gap-3 text-brand-steel hover:text-brand-deep font-black uppercase text-xs tracking-widest transition-all"
                >
                    <div className="p-2 rounded-xl bg-white border border-brand-sage/20 group-hover:bg-brand-deep group-hover:text-white transition-all shadow-sm">
                        <ChevronRight className="rotate-180" size={16} />
                    </div>
                    Back to Fleet Overview
                </button>
                <div className="flex items-center gap-4">
                    <div className="px-5 py-2.5 rounded-2xl bg-white border border-brand-sage/30 flex items-center gap-3 shadow-sm">
                        <div className={`w-2.5 h-2.5 rounded-full ${selectedTruck.deviation ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                        <span className="text-sm font-black text-brand-darkest tracking-tight">{selectedTruck.id}</span>
                    </div>
                    {selectedTruck.deviation && (
                        <div className="px-5 py-2.5 rounded-2xl bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.2em] animate-pulse shadow-xl shadow-red-500/30 border border-red-400">
                            High Priority Deviation Alert
                        </div>
                    )}
                </div>
            </div>

            {/* Expanded Map View Container */}
            <div className="flex-1 min-h-[550px] rounded-[2.5rem] overflow-hidden border border-brand-sage/20 relative shadow-2xl shadow-brand-darkest/10 group">
                <MapView truck={selectedTruck} />

                {/* Overlay for Info */}
                <div className="absolute top-8 left-8 z-[1000] w-80 space-y-5 pointer-events-none">
                    <div className="glass-dark p-7 rounded-[2rem] border border-white/10 shadow-2xl backdrop-blur-2xl pointer-events-auto transition-transform duration-500 hover:scale-[1.02]">
                        <div className="flex flex-col mb-4">
                            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-brand-sage/50 mb-1">Command Pilot</p>
                            <h4 className="text-2xl font-black text-white tracking-tight">{selectedTruck.driver}</h4>
                        </div>

                        <div className="grid gap-4">
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <InfoRow label="Odometer" value={selectedTruck.distance} />
                                <InfoRow label="ETA" value={selectedTruck.duration} />
                                <InfoRow label="Status" value={selectedTruck.status} />
                            </div>

                            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-brand-deep/30 border border-brand-steel/20">
                                <div className="flex flex-col">
                                    <span className="text-[9px] uppercase font-black text-brand-sage/60 tracking-widest">Efficiency</span>
                                    <span className="text-sm font-black text-brand-lightest">94.8%</span>
                                </div>
                                <div className="w-16 h-8 bg-brand-sage/10 rounded-lg flex items-center justify-center">
                                    <TrendingUp size={14} className="text-brand-sage" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {selectedTruck.deviation && (
                        <div className="bg-red-500/20 border border-red-500/40 p-7 rounded-[2rem] backdrop-blur-xl pointer-events-auto animate-in fade-in slide-in-from-left-4 duration-700">
                            <h5 className="text-red-400 font-black text-xs uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-500" /> Security Breach
                            </h5>
                            <p className="text-[11px] text-black leading-relaxed font-medium">
                                Anomalous trajectory detected. Route deviation exceeds protocol safety margins by <span className="text-red-400 font-bold">12.4%</span>.
                            </p>
                        </div>
                    )}
                </div>

                {/* Bottom Stats Badge */}
                <div className="absolute bottom-8 right-8 z-[1000] glass-dark px-6 py-4 rounded-2xl border border-white/10 shadow-2xl flex items-center gap-8 backdrop-blur-xl">
                    <div className="flex flex-col">
                        <span className="text-[9px] uppercase font-black text-brand-sage/50 tracking-widest">Active Velocity</span>
                        <span className="text-lg font-black text-white tracking-tighter">64 km/h <span className="text-[10px] text-brand-sage/40">avg</span></span>
                    </div>
                    <div className="w-[1px] h-8 bg-white/10"></div>
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase font-black text-brand-sage/50 tracking-widest">Signal Strength</span>
                        <span className="text-lg font-black text-brand-sage tracking-tighter">98.2%</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TruckDetail;
