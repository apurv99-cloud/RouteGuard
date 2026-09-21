import React from 'react';
import { ChevronRight, AlertTriangle, CheckCircle } from 'lucide-react';
import MapView from '../MapView';
import InfoRow from './InfoRow';
import AnalyticsChart from './AnalyticsChart';

const TruckDetail = ({
    selectedTruck,
    setSelectedTruck,
    historyAnalytics,
    historyLoading,
    historyError,
}) => {
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
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                        <span className="text-sm font-black text-brand-darkest tracking-tight">{selectedTruck.id}</span>
                    </div>

                </div>
            </div>

            {/* Expanded Map View Container */}
            <div className="flex-1 min-h-[550px] rounded-[2.5rem] overflow-hidden border border-brand-sage/20 relative shadow-2xl shadow-brand-darkest/10 group">
                <MapView truck={selectedTruck} />

                {/* Overlay for Info */}
                <div className="absolute top-8 left-8 z-[500] w-80 space-y-5 pointer-events-none">
                    <div className="glass-dark p-7 rounded-[2rem] border border-white/10 shadow-xl backdrop-blur-sm pointer-events-auto transition-transform duration-500 hover:scale-[1.01] bg-white/5">
                        <div className="flex flex-col mb-4">
                            <p className="text-[10px] uppercase font-black tracking-[0.25em] text-brand-sage/50 mb-1">Command Pilot</p>
                            <h4 className="text-2xl font-black text-white tracking-tight">{selectedTruck.driver}</h4>
                        </div>

                        <div className="grid gap-4">
                            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-brand-sage/50 font-medium">Risk Level</span>
                                    <span className={`font-black tracking-tight ${
                                        selectedTruck.riskLevel === "CRITICAL" || selectedTruck.riskLevel === "HIGH"
                                            ? "text-red-400"
                                            : selectedTruck.riskLevel === "MEDIUM" || selectedTruck.riskLevel === "WARNING"
                                                ? "text-amber-400"
                                                : "text-green-400"
                                    }`}>
                                        {selectedTruck.riskLevel || "Unavailable"}
                                    </span>
                                </div>
                                <InfoRow
                                    label="Deviation"
                                    value={selectedTruck.deviating ? "DEVIATED" : "ON ROUTE"}
                                />
                                <InfoRow
                                    label="Distance from Route"
                                    value={selectedTruck.distanceFromRoute != null
                                        ? `${selectedTruck.distanceFromRoute.toFixed(1)} m`
                                        : "Unavailable"}
                                />
                                <InfoRow
                                    label="Speed"
                                    value={selectedTruck.speedKmh != null
                                        ? `${selectedTruck.speedKmh.toFixed(2)} km/h`
                                        : "Unavailable"}
                                />
                                <InfoRow label="Odometer" value={selectedTruck.distance} />
                                <InfoRow label="ETA" value={selectedTruck.duration} />
                                <InfoRow label="Status" value={selectedTruck.status} />
                                <InfoRow
                                    label="Latitude"
                                    value={selectedTruck.latitude ?? "No GPS fix"}
                                />
                                <InfoRow
                                    label="Longitude"
                                    value={selectedTruck.longitude ?? "No GPS fix"}
                                />
                                <InfoRow
                                    label="Last GPS"
                                    value={selectedTruck.lastGpsTimestamp || "No GPS fix"}
                                />
                            </div>
                        </div>

                        <div className={`p-5 rounded-[2rem] border backdrop-blur-xl pointer-events-auto ${
                            selectedTruck.deviating
                                ? "bg-red-500/20 border-red-500/40"
                                : "bg-green-500/10 border-green-500/30"
                        }`}>
                            <p className={`font-black text-xs uppercase tracking-[0.2em] flex items-center gap-2 ${
                                selectedTruck.deviating ? "text-red-400" : "text-green-600"
                            }`}>
                                {selectedTruck.deviating
                                    ? <AlertTriangle size={16} />
                                    : <CheckCircle size={16} />}
                                {selectedTruck.deviating
                                    ? "Route Deviation Detected"
                                    : "On Planned Route"}
                            </p>
                            <p className="text-sm font-bold mt-2 text-brand-darkest">
                                Distance from route: {selectedTruck.distanceFromRoute != null
                                    ? `${selectedTruck.distanceFromRoute.toFixed(1)} m`
                                    : "Unavailable"}
                            </p>
                        </div>
                    </div>

                    <section className="space-y-4">
                        <div>
                            <h3 className="text-xl font-black text-brand-darkest tracking-tight">
                                Historical analytics
                            </h3>
                            <p className="text-xs text-brand-steel">
                                Backend GPS history for {selectedTruck.id}; missing dates remain empty.
                            </p>
                        </div>
                        {historyLoading ? (
                            <div className="bg-brand-darkest rounded-[2rem] p-8 text-center text-brand-sage">
                                Loading historical data...
                            </div>
                        ) : historyError ? (
                            <div className="bg-red-50 rounded-[2rem] p-8 text-center text-red-700">
                                {historyError}
                            </div>
                        ) : historyAnalytics.length === 0 ? (
                            <div className="bg-white rounded-[2rem] border border-brand-sage/20 p-8 text-center text-brand-steel">
                                No historical data available
                            </div>
                        ) : (
                            <>
                                <AnalyticsChart analyticsData={historyAnalytics} />
                                <div className="overflow-x-auto rounded-[2rem] bg-white border border-brand-sage/20">
                                    <table className="w-full text-left text-sm">
                                        <thead className="text-[10px] uppercase tracking-widest text-brand-steel border-b border-brand-sage/20">
                                            <tr>
                                                <th className="px-5 py-4">Date</th>
                                                <th className="px-5 py-4">GPS records</th>
                                                <th className="px-5 py-4">Deviated records</th>
                                                <th className="px-5 py-4">Max distance</th>
                                                <th className="px-5 py-4">Backend risk values</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {historyAnalytics.map((day) => (
                                                <tr key={day.date} className="border-b border-brand-sage/10 last:border-0">
                                                    <td className="px-5 py-4 font-bold text-brand-darkest">{day.date}</td>
                                                    <td className="px-5 py-4 text-brand-steel">{day.records}</td>
                                                    <td className="px-5 py-4 text-brand-steel">{day.deviated}</td>
                                                    <td className="px-5 py-4 text-brand-steel">
                                                        {day.maxDistance == null ? 'Unavailable' : `${day.maxDistance.toFixed(1)} m`}
                                                    </td>
                                                    <td className="px-5 py-4 font-bold text-brand-deep">
                                                        {day.riskLevels.length ? day.riskLevels.join(', ') : 'Unavailable'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </section>
                </div>

                {/* Bottom Stats Badge */}
                <div className="absolute bottom-8 right-8 z-[500] glass-dark px-6 py-4 rounded-2xl border border-white/10 shadow-xl flex items-center gap-8 backdrop-blur-sm bg-white/5">
                    <div className="flex flex-col text-right">
                        <span className="text-[9px] uppercase font-black text-brand-sage/50 tracking-widest">Assigned Trip</span>
                        <span className="text-lg font-black text-brand-sage tracking-tighter">{selectedTruck.tripId || "N/A"}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TruckDetail;
