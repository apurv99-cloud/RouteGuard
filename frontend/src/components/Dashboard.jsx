import React, { useState, useEffect } from "react";
import API from "../config/api";
import { Truck, AlertTriangle, TrendingUp, Clock, Loader } from "lucide-react";
import Header from "./dashboard/Header";
import StatCard from "./dashboard/StatCard";
import TruckTable from "./dashboard/TruckTable";
import AnalyticsChart from "./dashboard/AnalyticsChart";
import TruckDetail from "./dashboard/TruckDetail";
import { useAnalytics } from "../hooks/useAPI";

const defaultStats = {
  totalTrucks: 0,
  deviatedTrucks: 0,
  completedTrips: 0,
  avgOnTimeDelivery: "0%",
};

const Dashboard = () => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [displayTrucks, setDisplayTrucks] = useState([]);
  const [displayStats, setDisplayStats] = useState(defaultStats);
  const [displayAnalytics, setDisplayAnalytics] = useState([]);

  const {
    data: backendAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await API.trucks.getAll();

        const transformed = (Array.isArray(data) ? data : []).map((truck, index) => {
          const trip = truck.trip || {};
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
              : [trip.lastLocationLat ?? trip.originLat ?? 28.8571, trip.lastLocationLon ?? trip.originLon ?? 76.827],
            destination: hasDestination ? [trip.destLat, trip.destLon] : null,
            distance: truck.distanceFromRoute != null
              ? `${(truck.distanceFromRoute / 1000).toFixed(1)} km`
              : trip.distanceM
                ? `${(trip.distanceM / 1000).toFixed(1)} km`
                : "N/A",
            duration: trip.durationS ? `${hours}h ${minutes}m` : "N/A",
            deviation: Boolean(truck.deviation || truckStatus === "DEVIATED" || truck.riskLevel === "HIGH"),
            risk: trip.riskScore ?? truck.riskLevel ?? 0,
            polyline: trip.polyline || "",
          };
        });

        setDisplayTrucks(transformed);

        setDisplayStats({
          totalTrucks: transformed.length,
          deviatedTrucks: transformed.filter((t) => t.deviation).length,
          completedTrips: transformed.filter((t) => t.status === "COMPLETED").length,
          avgOnTimeDelivery: transformed.length ? "92%" : "0%",
        });
      } catch (err) {
        console.error("Failed to load trucks:", err);
        setDisplayTrucks([]);
        setDisplayStats(defaultStats);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (Array.isArray(backendAnalytics)) {
      setDisplayAnalytics(backendAnalytics);
      return;
    }

    if (backendAnalytics && typeof backendAnalytics === "object") {
      setDisplayAnalytics([
        { name: "Trips", deviations: Number(backendAnalytics.totalTrips ?? backendAnalytics.total ?? 0) },
        { name: "Deviated", deviations: Number(backendAnalytics.deviatedTrips ?? backendAnalytics.deviated ?? 0) },
      ]);
      return;
    }

    setDisplayAnalytics([
      { name: "Trips", deviations: 0 },
      { name: "Deviated", deviations: 0 },
    ]);
  }, [backendAnalytics]);

  //  Loading
  if (analyticsLoading) {
    return (
      <div className="flex h-screen bg-brand-lightest">
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <Loader className="w-10 h-10 animate-spin text-brand-deep" />
          </div>
        </main>
      </div>
    );
  }

  //  Error
  if (analyticsError) {
    return (
      <div className="flex h-screen bg-brand-lightest">
        <main className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1 flex items-center justify-center">
            <div className="bg-red-50 p-6 rounded-xl text-center">
              <AlertTriangle className="text-red-500 mx-auto mb-3" />
              <p className="text-red-700 font-semibold">
                Failed to load dashboard
              </p>
              <p className="text-sm text-red-500">
                {analyticsError}
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
          {selectedTruck ? (
            <>
              <TruckDetail
                selectedTruck={selectedTruck}
                setSelectedTruck={setSelectedTruck}
              />

              <div className="min-h-[360px]">
                <AnalyticsChart analyticsData={displayAnalytics} />
              </div>
            </>
          ) : (
            <>
              {/* STATS */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  label="Total Fleet"
                  value={displayStats.totalTrucks}
                  icon={<Truck className="text-brand-deep" />}
                />
                <StatCard
                  label="Active Deviations"
                  value={displayStats.deviatedTrucks}
                  icon={<AlertTriangle className="text-red-500" />}
                  critical
                />
                <StatCard
                  label="Trips Today"
                  value={displayStats.completedTrips}
                  icon={<Clock />}
                />
                <StatCard
                  label="Efficiency"
                  value={displayStats.avgOnTimeDelivery}
                  icon={<TrendingUp />}
                />
              </div>

              {/* TABLE + CHART */}
              <div className="grid lg:grid-cols-3 gap-8">
                <TruckTable
                  trucksData={displayTrucks}
                  setSelectedTruck={setSelectedTruck}
                />
                <AnalyticsChart analyticsData={displayAnalytics} />
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
