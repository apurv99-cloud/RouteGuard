import React, { useState, useEffect } from "react";
import API from "../config/api";
import { Truck, AlertTriangle, TrendingUp, Clock, Loader } from "lucide-react";
import Header from "./dashboard/Header";
import StatCard from "./dashboard/StatCard";
import TruckTable from "./dashboard/TruckTable";
import AnalyticsChart from "./dashboard/AnalyticsChart";
import TruckDetail from "./dashboard/TruckDetail";
import { trucksData, analyticsData, summaryStats } from "../data/mockData";
import { useTrips, useAnalytics } from "../hooks/useAPI";

const Dashboard = () => {
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [displayTrucks, setDisplayTrucks] = useState([]);
  const [displayStats, setDisplayStats] = useState(summaryStats);
  const [displayAnalytics, setDisplayAnalytics] = useState(analyticsData);

  const {
    data: trucksDataFromAPI,
    loading: tripsLoading,
    error: tripsError,
  } = useTrips();

  const {
    data: backendAnalytics,
    loading: analyticsLoading,
    error: analyticsError,
  } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await API.trucks.getAll();

        const transformed = data.map((truck, index) => {
          const trip = truck.trip || {};

          const hours = trip.durationS ? Math.floor(trip.durationS / 3600) : 0;

          const minutes = trip.durationS
            ? Math.floor((trip.durationS % 3600) / 60)
            : 0;

          //  FIXED STATUS
          const status = trip.status ? trip.status : "ONGOING";

          return {
            id: truck.id ? `TRK-${truck.id}` : `TRK-${index + 1}`,
            driver: truck.pilotName || "Unknown",

            status: status,

            lastLocation: [
              trip.lastLocationLat ?? trip.originLat ?? 28.8571,
              trip.lastLocationLon ?? trip.originLon ?? 76.827,
            ],

            destination: [trip.destLat || 28.5828, trip.destLon || 77.3988],

            distance: trip.distanceM
              ? `${(trip.distanceM / 1000).toFixed(1)} km`
              : "N/A",

            duration: trip.durationS ? `${hours}h ${minutes}m` : "N/A",

            deviation: status === "DEVIATED",
            risk: trip.riskScore ?? 0,

            polyline: trip.polyline || "",
          };
        });

        setDisplayTrucks(transformed);

        setDisplayStats({
          totalTrucks: transformed.length,
          deviatedTrucks: transformed.filter((t) => t.deviation).length,
          completedTrips: transformed.length,
          avgOnTimeDelivery: "92%",
        });
      } catch (err) {
        console.error(err);
      }
    };

    //  CALL ON LOAD
    fetchData();

    //  INTERVAL
    const interval = setInterval(fetchData, 3000);

    return () => clearInterval(interval);
  }, []);
  // Analytics
  useEffect(() => {
    if (backendAnalytics && Array.isArray(backendAnalytics)) {
      setDisplayAnalytics(backendAnalytics);
    }
  }, [backendAnalytics]);

  //  Loading
  if (tripsLoading || analyticsLoading) {
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
  if (tripsError || analyticsError) {
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
                {tripsError || analyticsError}
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
              trucksData={displayTrucks.length > 0 ? displayTrucks : trucksData}
              setSelectedTruck={setSelectedTruck}
            />
            <AnalyticsChart analyticsData={displayAnalytics} />
          </div>

          {/* DETAIL */}
          {selectedTruck && (
            <TruckDetail
              selectedTruck={selectedTruck}
              setSelectedTruck={setSelectedTruck}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
