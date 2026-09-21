// API Configuration

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL; // same-origin proxy path (nginx) to avoid CORS

const API_TIMEOUT = 30000;


const apiCall = async (endpoint, options = {}) => {
  const {
    method = "GET",
    body = null,
    headers = {},
    timeout = API_TIMEOUT,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...headers,
      },
      body: body ? JSON.stringify(body) : null,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("API Error:", error);
    throw error;
  }
};


export const API = {
  trips: {
    getAll: () => apiCall("/trips"),

    getById: (id) => apiCall(`/trips/${id}`),

    create: (data) =>
      apiCall("/trips", {
        method: "POST",
        body: data,
      }),

    update: (id, data) =>
      apiCall(`/trips/${id}`, {
        method: "PUT",
        body: data,
      }),

    delete: (id) =>
      apiCall(`/trips/${id}`, {
        method: "DELETE",
      }),
  },
  trucks: {
    getAll: () => apiCall("/trucks"),

    getById: (id) => apiCall(`/trucks/${id}`),

    create: (data) =>
      apiCall("/trucks", {
        method: "POST",
        body: data,
      }),

    update: (id, data) =>
      apiCall(`/trucks/${id}`, {
        method: "PUT",
        body: data,
      }),

    delete: (id) =>
      apiCall(`/trucks/${id}`, {
        method: "DELETE",
      }),
  },
  gps: {
    log: (tripId, lat, lon) =>
      apiCall(`/gps/${tripId}?lat=${lat}&lon=${lon}`, {
        method: "POST",
      }),

    // Optional
    getHistory: (truckId) => apiCall(`/trucks/${truckId}/gps`),
  },
  analytics: {
    getSummary: () => apiCall("/ml/summary"),
    getAnomalies: () => apiCall("/ml/anomalies"),
  },
};

export default API;
