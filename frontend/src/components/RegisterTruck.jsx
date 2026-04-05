import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Truck,
  User,
  ChevronLeft,
  Save,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import Header from "./dashboard/Header";
import API from "../config/api";

const RegisterTruck = () => {
  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    truckId: "",
    driver: "",
    routeId: "",
  });

  // ✅ FETCH ROUTES
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await API.trips.getAll();
        setRoutes(res);
      } catch (err) {
        console.error(err);
        setError("Failed to load routes");
      }
    };
    fetchRoutes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (!form.truckId || !form.driver || !form.routeId) {
        setError("Please fill all fields");
        return;
      }

      const payload = {
        truckId: form.truckId,
        driver: form.driver,
        routeId: Number(form.routeId),
      };

      await API.trucks.create(payload);

      setSuccess("✓ Vehicle registered successfully!");

      setTimeout(() => navigate("/dashboard"), 1500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-brand-lightest overflow-hidden">
      <main className="flex-1 flex flex-col min-w-0 h-screen">
        <Header />

        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center">
          <div className="w-full max-w-4xl space-y-8">
            {/* HEADER */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-3 text-brand-steel hover:text-brand-deep font-black uppercase text-xs tracking-widest transition-all"
              >
                <ChevronLeft size={16} />
                Back
              </button>

              <div className="flex items-center gap-2 text-brand-steel/40">
                <ShieldCheck size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Secure Registration
                </span>
              </div>
            </div>

            {/* TITLE */}
            <div>
              <h1 className="text-3xl font-black text-brand-darkest italic">
                Register{" "}
                <span className="not-italic text-brand-steel">Truck</span>
              </h1>
              <p className="text-sm text-brand-steel/60">
                Assign a vehicle to a predefined route.
              </p>
            </div>

            {/* ALERTS */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl text-green-700">
                <ShieldCheck size={18} />
                {success}
              </div>
            )}

            {/* 🔥 GLASS CARD */}
            <form onSubmit={handleSubmit}>
              <div className="glass p-10 rounded-[2.5rem] border border-brand-sage/20 shadow-2xl space-y-6">
                {/* Vehicle + Driver */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="relative group">
                    <Truck
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel group-focus-within:text-brand-deep"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Vehicle ID (TRK-101)"
                      value={form.truckId}
                      onChange={(e) =>
                        setForm({ ...form, truckId: e.target.value })
                      }
                      className="w-full bg-white/50 border border-brand-sage/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-brand-sage/20 focus:bg-white outline-none transition"
                    />
                  </div>

                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-steel group-focus-within:text-brand-deep"
                      size={16}
                    />
                    <input
                      type="text"
                      placeholder="Driver Name"
                      value={form.driver}
                      onChange={(e) =>
                        setForm({ ...form, driver: e.target.value })
                      }
                      className="w-full bg-white/50 border border-brand-sage/20 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-brand-sage/20 focus:bg-white outline-none transition"
                    />
                  </div>
                </div>

                {/* ROUTE DROPDOWN */}
                <div className="relative">
                  <select
                    value={form.routeId}
                    onChange={(e) =>
                      setForm({ ...form, routeId: e.target.value })
                    }
                    className="w-full appearance-none bg-white/50 border border-brand-sage/20 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-4 focus:ring-brand-sage/20 focus:bg-white outline-none transition cursor-pointer"
                  >
                    <option value="">Select Route</option>

                    {routes.length === 0 ? (
                      <option disabled>Loading routes...</option>
                    ) : (
                      routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          Route {route.id} • {route.originLat} → {route.destLat}
                        </option>
                      ))
                    )}
                  </select>

                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-steel pointer-events-none">
                    ▼
                  </div>
                </div>

                {/* BUTTON */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-brand-darkest text-brand-lightest rounded-[1.5rem] py-5 font-black uppercase tracking-[0.3em] text-xs hover:bg-brand-deep transition-all shadow-2xl hover:shadow-brand-deep/40 active:scale-95"
                >
                  {isSubmitting ? "Initializing..." : "Finalize Registration"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterTruck;
