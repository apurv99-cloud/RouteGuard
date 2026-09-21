import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

const AnalyticsChart = ({ analyticsData, emptyMessage = 'No historical data available' }) => {
    const chartData = Array.isArray(analyticsData) ? analyticsData : [];

    return (
        <div className="bg-brand-darkest rounded-[2rem] p-8 text-brand-sage border border-white/5 shadow-2xl overflow-hidden flex flex-col group transition-all duration-500 hover:shadow-brand-darkest/40 h-[360px] min-h-[360px]">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-black text-white tracking-tight">System Reliability</h3>
                    <p className="text-[10px] text-brand-sage/40 uppercase tracking-[0.2em] font-black">7-Day Deviation Metrics</p>
                </div>
                <div className="p-3 rounded-2xl bg-white/5 border border-white/5 group-hover:bg-brand-deep/20 transition-colors">
                    <TrendingUp size={18} className="text-brand-sage" />
                </div>
            </div>

            {chartData.length === 0 ? (
                <div className="flex flex-1 items-center justify-center text-sm text-brand-sage/60">
                    {emptyMessage}
                </div>
            ) : (
                <div className="relative flex-1 w-full h-[240px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
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
                                dataKey="deviated"
                                fill="url(#barGradient)"
                                radius={[6, 6, 0, 0]}
                                barSize={18}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            )}

            {chartData.length > 0 && (
                <div className="mt-6 pt-6 border-t border-white/5 flex justify-between items-center text-[10px]">
                    <span className="uppercase font-black tracking-widest text-brand-sage/40">
                        Bars: backend DEVIATED record count
                    </span>
                    <span className="text-brand-sage/70 font-bold">Latest 7 available dates</span>
                </div>
            )}
        </div>
    );
};

export default AnalyticsChart;
