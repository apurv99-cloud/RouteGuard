import React, { useState, useEffect, useRef } from "react";
import API from "../config/api";
import { Truck, AlertTriangle, ShieldAlert, Search, Filter, Loader } from "lucide-react";
import Header from "./dashboard/Header";
import StatCard from "./dashboard/StatCard";
import TruckTable from "./dashboard/TruckTable";
import TruckDetail from "./dashboard/TruckDetail";

const defaultStats = {
  totalTrucks: 0,
  activeTrucks: 0,
  onRouteTrucks: 0,
  deviatedTrucks: 0,
  criticalTrucks: 0,
};

const groupHistoryByDate = (history) => {
  const groups = new Map();
  [...history]
    .filter((record) => record?.timestamp)
    .sort((a, b) => String(a.timestamp).localeCompare(String(b.timestamp)))
    .forEach((record) => {
      const date = String(record.timestamp).split("T")[0];
      const day = groups.get(date) || {
        date,
        name: date,
        records: 0,
        deviated: 0,
        maxDistance: null,
        riskLevels: [],
      };
      day.records += 1;
      if (record.deviationStatus === "DEVIATED") {
        day.deviated += 1;
      }
      if (typeof record.distanceFromRoute === "number") {
        day.maxDistance = day.maxDistance == null
          ? record.distanceFromRoute
          : Math.max(day.maxDistance, record.distanceFromRoute);
      }
      if (record.riskLevel && !day.riskLevels.includes(record.riskLevel)) {
        day.riskLevels.push(record.riskLevel);
      }
      groups.set(date, day);
    });

  return [...groups.values()].slice(-7);
};

const Dashboard = () => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [displayTrucks, setDisplayTrucks] = useState([]);
  const [displayStats, setDisplayStats] = useState(defaultStats);
  const [historyAnalytics, setHistoryAnalytics] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const [fleetLoading, setFleetLoading] = useState(true);
  const [fleetError, setFleetError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [riskFilter, setRiskFilter] = useState("ALL");
  const selectedTruckId = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFleetLoading(true);
        setFleetError(null);
        const [data, trips] = await Promise.all([
          API.trucks.getAll(),
          API.trips.getAll(),
        ]);
        const tripsById = new Map(
          (Array.isArray(trips) ? trips : []).map((trip) => [trip.id, trip])
        );

        const transformed = (Array.isArray(data) ? data : []).map((truck, index) => {
          const trip = truck.trip || tripsById.get(truck.trip?.id) || {};
          const truckStatus = truck.status || trip.status || "PLANNED";
          const hours = trip.durationS ? Math.floor(trip.durationS / 3600) : 0;
          const minutes = trip.durationS
            ? Math.floor((trip.durationS % 3600) / 60)
            : 0;

          const hasDestination = trip.destLat != null && trip.destLon != null;
          const hasLocation = truck.currentLatitude != null && truck.currentLongitude != null;

          return {
            id: truck.truckId || truck.id || `TRK-${index + 1}`,
            driver: truck.pilotName || "Unknown",
            status: truckStatus,
            lastLocation: hasLocation
              ? [truck.currentLatitude, truck.currentLongitude]
              : null,
            latitude: truck.currentLatitude,
            longitude: truck.currentLongitude,
            lastGpsTimestamp: truck.lastGpsTimestamp,
            riskLevel: truck.riskLevel || "NORMAL",
            deviating: Boolean(truck.deviation),
            distanceFromRoute: truck.distanceFromRoute,
            destination: hasDestination ? [trip.destLat, trip.destLon] : null,
            distance: truck.distanceFromRoute != null
              ? `${(truck.distanceFromRoute / 1000).toFixed(1)} km`
              : trip.distanceM
                ? `${(trip.distanceM / 1000).toFixed(1)} km`
                : "N/A",
            duration: trip.durationS ? `${hours}h ${minutes}m` : "N/A",
            deviation: Boolean(truck.deviation),
            polyline: trip.polyline || "",
            tripId: trip.id,
            origin: trip.originLat != null && trip.originLon != null
              ? [trip.originLat, trip.originLon]
              : null,
          };
        });

        setDisplayTrucks(transformed);
        setSelectedTruck((current) => {
          if (!current) return current;
          return transformed.find((truck) => truck.id === selectedTruckId.current) || null;
        });

        if (selectedTruckId.current) {
          const historyTruckId = selectedTruckId.current;
          try {
            const history = await API.gps.getHistory(historyTruckId);
            if (selectedTruckId.current !== historyTruckId) return;
            const historyRecords = Array.isArray(history) ? history : [];
            setHistoryAnalytics(groupHistoryByDate(historyRecords));
            setHistoryError(null);
            setHistoryLoading(false);
            const latestGps = historyRecords[0];
            if (latestGps) {
              setSelectedTruck((current) =>
                current && current.id === selectedTruckId.current
                  ? {
                      ...current,
                      speedKmh: latestGps.speedKmh,
                      riskLevel: latestGps.riskLevel || current.riskLevel,
                      deviating: latestGps.deviationStatus === "DEVIATED",
                      distanceFromRoute:
                        latestGps.distanceFromRoute ?? current.distanceFromRoute,
                    }
                  : current
              );
            }
          } catch (historyError) {
            if (selectedTruckId.current !== historyTruckId) return;
            console.error("Failed to load selected truck GPS history:", historyError);
            setHistoryError("Unable to load historical data");
            setHistoryLoading(false);
          }
        }

        setDisplayStats({
          totalTrucks: transformed.length,
          activeTrucks: transformed.filter((t) => !["COMPLETED", "CANCELLED"].includes(t.status)).length,
          onRouteTrucks: transformed.filter((t) => !t.deviating).length,
          deviatedTrucks: transformed.filter((t) => t.deviating).length,
          criticalTrucks: transformed.filter((t) => t.riskLevel === "CRITICAL").length,
        });
      } catch (err) {
        console.error("Failed to load trucks:", err);
        setFleetError("Unable to load fleet data");
        setDisplayTrucks([]);
        setDisplayStats(defaultStats);
      } finally {
        setFleetLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  const selectTruck = (truck) => {
    selectedTruckId.current = truck?.id || null;
    setSelectedTruck(truck);
    setHistoryAnalytics([]);
    setHistoryError(null);
    setHistoryLoading(true);
    if (truck?.id) {
      const historyTruckId = truck.id;
      API.gps.getHistory(historyTruckId)
        .then((history) => {
          if (selectedTruckId.current !== historyTruckId) return;
          setHistoryAnalytics(groupHistoryByDate(Array.isArray(history) ? history : []));
        })
        .catch(() => {
          if (selectedTruckId.current === historyTruckId) {
            setHistoryError("Unable to load historical data");
          }
        })
        .finally(() => {
          if (selectedTruckId.current === historyTruckId) {
            setHistoryLoading(false);
          }
        });
    } else {
      setHistoryLoading(false);
    }
  };

  const clearSelectedTruck = () => {
    selectedTruckId.current = null;
    setSelectedTruck(null);
    setHistoryAnalytics([]);
    setHistoryError(null);
  };

  const filteredTrucks = displayTrucks.filter((truck) => {
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch = !query
      || truck.id.toLowerCase().includes(query)
      || truck.driver.toLowerCase().includes(query);
    const matchesStatus = statusFilter === "ALL"
      || (statusFilter === "DEVIATED" ? truck.deviating : !truck.deviating);
    const matchesRisk = riskFilter === "ALL"
      || truck.riskLevel.toUpperCase() === riskFilter;
    return matchesSearch && matchesStatus && matchesRisk;
  });

  const attentionTrucks = displayTrucks.filter((truck) =>
    truck.deviating || ["HIGH", "CRITICAL"].includes(truck.riskLevel)
  );

  if (fleetLoading && displayTrucks.length === 0) {
    return (
      <div className="flex h-screen bg-brand-lightest">
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center text-brand-deep">
            <Loader className="w-10 h-10 animate-spin mr-3" />
            Loading fleet...
          </div>
        </main>
      </div>
    );
  }

  if (fleetError && displayTrucks.length === 0) {
    return (
      <div className="flex h-screen bg-brand-lightest">
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-50 p-6 rounded-xl text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-semibold">
                Unable to load fleet data
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-brand-lightest">
      <main className="flex-1 flex flex-col">
        <Header />

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {displayTrucks.length === 0 && !fleetLoading ? (
            <div className="bg-white rounded-3xl border border-brand-sage/20 p-10 text-center text-brand-steel">
              No trucks available
            </div>
          ) : selectedTruck ? (
            <>
              <TruckDetail
                selectedTruck={selectedTruck}
                setSelectedTruck={clearSelectedTruck}
                historyAnalytics={historyAnalytics}
                historyLoading={historyLoading}
                historyError={historyError}
              />
            </>
          ) : (
            <>
              {/* STATS */}
              <div className="grid sm:grid-cols-2 xl:grid-cols-5 gap-4 lg:gap-6">
                <StatCard
                  label="Trucks"
                  value={displayStats.totalTrucks}
                  icon={<Truck className="text-brand-deep" />}
                  trend="Registered fleet"
                />
                <StatCard
                  label="Active"
                  value={displayStats.activeTrucks}
                  icon={<Truck className="text-brand-deep" />}
                  trend="Not completed or cancelled"
                />
                <StatCard
                  label="On Route"
                  value={displayStats.onRouteTrucks}
                  icon={<ShieldAlert className="text-green-600" />}
                  trend="Backend route state"
                />
                <StatCard
                  label="Deviated"
                  value={displayStats.deviatedTrucks}
                  icon={<AlertTriangle className="text-red-500" />}
                  critical
                  trend="Backend deviation state"
                />
                <StatCard
                  label="Critical Risk"
                  value={displayStats.criticalTrucks}
                  icon={<ShieldAlert className="text-red-500" />}
                  critical
                  trend="Backend risk level"
                />
              </div>

              <div className="grid xl:grid-cols-3 gap-8 items-start">
                <div className="xl:col-span-2 space-y-6">
                  <div className="bg-white rounded-3xl border border-brand-sage/20 p-5 shadow-xl shadow-brand-darkest/5">
                    <div className="flex flex-col lg:flex-row gap-3">
                      <label className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel/50" size={17} />
                        <input
                          value={searchTerm}
                          onChange={(event) => setSearchTerm(event.target.value)}
                          placeholder="Search truck ID or driver"
                          className="w-full rounded-xl border border-brand-sage/20 bg-brand-lightest/30 py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-deep"
                        />
                      </label>
                      <label className="flex items-center gap-2 rounded-xl border border-brand-sage/20 px-3">
                        <Filter size={16} className="text-brand-steel/60" />
                        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="bg-transparent py-3 text-sm font-bold text-brand-darkest outline-none">
                          <option value="ALL">All statuses</option>
                          <option value="ON_ROUTE">On Route</option>
                          <option value="DEVIATED">Deviated</option>
                        </select>
                      </label>
                      <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} className="rounded-xl border border-brand-sage/20 bg-white px-3 py-3 text-sm font-bold text-brand-darkest outline-none">
                        <option value="ALL">All risk levels</option>
                        {["NORMAL", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((risk) => <option key={risk} value={risk}>{risk}</option>)}
                      </select>
                    </div>
                  </div>
                  <TruckTable
                    trucksData={filteredTrucks}
                    setSelectedTruck={selectTruck}
                  />
                  {filteredTrucks.length === 0 && (
                    <div className="rounded-3xl border border-brand-sage/20 bg-white p-8 text-center text-brand-steel">
                      No trucks match the current search and filters.
                    </div>
                  )}
                </div>

                <div className="space-y-6">
                  <div className="rounded-3xl border border-red-100 bg-red-50 p-6 shadow-xl shadow-red-900/5">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="rounded-xl bg-red-100 p-2 text-red-600"><AlertTriangle size={18} /></div>
                      <div>
                        <h3 className="font-black text-brand-darkest">Attention required</h3>
                        <p className="text-[10px] uppercase tracking-widest text-red-700/60 font-black">Backend-reported alerts</p>
                      </div>
                    </div>
                    {attentionTrucks.length === 0 ? (
                      <p className="text-sm text-green-700">No trucks currently require attention.</p>
                    ) : (
                      <div className="space-y-3">
                        {attentionTrucks.map((truck) => (
                          <button key={truck.id} onClick={() => selectTruck(truck)} className="w-full rounded-2xl border border-red-100 bg-white p-4 text-left hover:border-red-300 transition-colors">
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-black text-brand-darkest">{truck.id}</span>
                              <span className="text-xs font-black text-red-700">{truck.riskLevel}</span>
                            </div>
                            <p className="mt-1 text-xs text-brand-steel">
                              {truck.deviating ? "DEVIATED" : "Risk requires attention"} · Distance: {truck.distanceFromRoute == null ? "Unavailable" : `${truck.distanceFromRoute.toFixed(1)} m`}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
