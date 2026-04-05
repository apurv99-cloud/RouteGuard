import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ label, value, icon, trend, critical }) => (
    <div className={`p-6 rounded-[2rem] bg-white border border-brand-sage/20 shadow-xl relative overflow-hidden group card-hover glow-card transition-all duration-500 ${critical ? 'shadow-red-500/5' : 'shadow-brand-darkest/5'}`}>
        <div className="relative z-10 flex flex-col gap-5">
            <div className="flex items-center justify-between">
                <div className={`p-3 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${critical ? 'bg-red-50 text-red-500' : 'bg-brand-lightest text-brand-deep'}`}>
                    {React.cloneElement(icon, { size: 22 })}
                </div>
                <div className="flex items-center gap-1.5">
                    <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${critical ? 'bg-red-500' : 'bg-brand-sage'}`}></div>
                    <span className="text-[10px] uppercase font-black tracking-[0.2em] text-brand-steel/40">Realtime</span>
                </div>
            </div>
            <div>
                <p className="text-4xl font-black text-brand-darkest tracking-tighter mb-1 group-hover:scale-105 transition-transform origin-left duration-500">{value}</p>
                <p className="text-[11px] text-brand-steel/60 uppercase font-black tracking-widest leading-none">Total {label}</p>
            </div>
            <div className={`flex items-center gap-2 pt-4 border-t ${critical ? 'border-red-100' : 'border-brand-sage/10'}`}>
                <div className={`p-1 rounded-md ${critical ? 'bg-red-50' : 'bg-brand-sage/10'}`}>
                    <TrendingUp size={10} className={critical ? 'text-red-500' : 'text-brand-deep'} />
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider ${critical ? 'text-red-600' : 'text-brand-steel/80'}`}>{trend}</span>
            </div>
        </div>

        {/* Background Decorative Element */}
        <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 ${critical ? 'bg-red-500' : 'bg-brand-sage'}`}></div>
    </div>
);

export default StatCard;
