import React from 'react';
import { ChevronRight } from 'lucide-react';

const TruckTable = ({ trucksData, setSelectedTruck, setActiveTab }) => {
    return (
        <div className="bg-white rounded-3xl border border-brand-sage/20 shadow-xl shadow-brand-darkest/5 overflow-hidden flex flex-col transition-all duration-500 hover:shadow-2xl hover:shadow-brand-darkest/10">
            <div className="p-5 sm:p-7 border-b border-brand-sage/10 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between bg-gradient-to-r from-white to-brand-lightest/30">
                <div>
                    <h3 className="text-xl font-black text-brand-darkest tracking-tight">Active Fleet Monitor</h3>
                    <p className="text-[10px] text-brand-steel uppercase font-black tracking-widest opacity-60">Real-time logistic tracking</p>
                </div>
                <button
                    onClick={() => setActiveTab('trucks')}
                    className="px-5 py-2 rounded-xl bg-brand-lightest text-brand-deep text-xs font-black uppercase tracking-widest hover:bg-brand-deep hover:text-white transition-all shadow-sm active:scale-95"
                >
                    Expand Fleet
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left">
                    <thead className="glass-table-head text-[10px] uppercase tracking-[0.2em] text-brand-steel/80 border-b border-brand-sage/10 font-black">
                        <tr>
                            <th className="px-8 py-5">Vehicle ID</th>
                            <th className="px-6 py-5">Assigned Pilot</th>
                            <th className="px-6 py-5">Operational Status</th>
                            <th className="px-6 py-5">Trajectory</th>
                            <th className="px-8 py-5 text-center">Protocol</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-brand-sage/5">
                        {trucksData.map((truck) => (
                            <tr key={truck.id} className="hover:bg-brand-lightest/40 transition-all group duration-300">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-2.5 h-2.5 rounded-full shadow-sm ${truck.deviation ? 'bg-red-500 animate-pulse-glow shadow-red-500/50' : 'bg-green-500 shadow-green-500/30'}`}></div>
                                        <span className="font-black text-brand-darkest tracking-tight">{truck.id}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-brand-darkest">{truck.driver}</span>
                                        <span className="text-[10px] text-brand-steel/60 font-medium uppercase tracking-tighter">Certified Driver</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                                            truck.deviating
                                                ? 'bg-red-50 text-red-700 border border-red-100'
                                                : 'bg-green-50 text-green-700 border border-green-100'
                                        }`}>
                                            {truck.deviating ? 'DEVIATED' : 'ON ROUTE'}
                                        </span>
                                        <span className={`text-[10px] font-black uppercase tracking-widest ${
                                            truck.riskLevel === 'CRITICAL' || truck.riskLevel === 'HIGH'
                                                ? 'text-red-600'
                                                : truck.riskLevel === 'MEDIUM' || truck.riskLevel === 'WARNING'
                                                    ? 'text-amber-600'
                                                    : 'text-brand-steel'
                                        }`}>
                                            Risk: {truck.riskLevel || 'UNAVAILABLE'}
                                        </span>
                                        <span className="text-[10px] text-brand-steel/70">{truck.status}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-black text-brand-steel tracking-tighter">{truck.distance}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 text-center">
                                    <button
                                        onClick={() => setSelectedTruck(truck)}
                                        className="p-2.5 rounded-xl bg-brand-lightest text-brand-deep border border-brand-sage/20 hover:bg-brand-deep hover:text-white hover:border-brand-deep transition-all transform active:scale-90 shadow-sm group-hover:scale-110"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TruckTable;
