import { useState, useEffect } from "react";
import API from "../config/api";

/**
 * Generic fetch hook
 */
export const useFetch = (fetchFn, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchFn();

        if (isMounted) {
          setData(result);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Failed to fetch data");
          console.error("Fetch error:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  return { data, loading, error };
};

/**
 * Mutation hook (POST/PUT/DELETE)
 */
export const useMutation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const mutate = async (mutationFn) => {
    try {
      setLoading(true);
      setError(null);

      const result = await mutationFn();
      setData(result);

      return result;
    } catch (err) {
      const errorMessage = err.message || "Operation failed";
      setError(errorMessage);
      console.error("Mutation error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error, data };
};

/**
 * 🔥 FIXED: Fetch all trucks (NOT trips)
 */
export const useTrips = () => {
  return useFetch(() => API.trucks.getAll(), []);
};

/**
 * Fetch single truck (optional)
 */
export const useTrip = (id) => {
  return useFetch(() => API.trucks.getById(id), [id]);
};

/**
 * Analytics (no change)
 */
export const useAnalytics = () => {
  return useFetch(() => API.analytics.getSummary(), []);
};

export const useAnomalies = () => {
  return useFetch(() => API.analytics.getAnomalies(), []);
};

/**
 * Mutations
 */
export const useCompleteTrip = () => {
  return useMutation();
};

export const useImportTrips = () => {
  return useMutation();
};

export const useLogGPS = () => {
  return useMutation();
};
