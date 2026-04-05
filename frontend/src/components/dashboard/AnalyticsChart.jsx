import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const AnalyticsChart = ({ analyticsData }) => {
    return (
        <div className="bg-brand-darkest rounded-[2rem] p-8 text-brand-sage border border-white/5 shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-brand-darkest/40">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">System Reliability</h3>
                    <p className="text-[10px] text-brand-sage/40 uppercase tracking-[0.2em] font-black">7-Day Deviation Metrics</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-brand-deep/20 transition-colors">
                    <TrendingUp size={18} className="text-brand-sage" />
                </div>
            </div>

            <div className="flex-1 h-64 lg:h-auto min-h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData}>
                        <defs>
                            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#AEC3B0" stopOpacity={1} />
                                <stop offset="100%" stopColor="#598392" stopOpacity={0.6} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis
                            dataKey="name"
                            stroke="#ffffff20"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <YAxis
                            stroke="#ffffff20"
                            fontSize={10}
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: '#ffffff40', fontWeight: 'bold' }}
                        />
                        <Tooltip
                            cursor={{ fill: '#ffffff05' }}
                            contentStyle={{
                                backgroundColor: 'rgba(1, 22, 30, 0.8)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                color: '#EFF6E0',
                                borderRadius: '16px',
                                backdropFilter: 'blur(10px)',
                                fontSize: '11px',
                                fontWeight: 'bold'
                            }}
                            itemStyle={{ color: '#AEC3B0' }}
                        />
                        <Bar
                            dataKey="deviations"
                            fill="url(#barGradient)"
                            radius={[6, 6, 0, 0]}
                            barSize={16}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-black tracking-widest text-brand-sage/30">Target Goal</span>
                    <span className="text-sm font-black text-white">98.5% <span className="text-green-400 text-[10px] ml-1">↑ 2.1%</span></span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 text-brand-sage text-[10px] font-black uppercase tracking-widest border border-white/5">
                    Monthly Report
                </div>
            </div>
        </div>
    );
};

export default AnalyticsChart;
