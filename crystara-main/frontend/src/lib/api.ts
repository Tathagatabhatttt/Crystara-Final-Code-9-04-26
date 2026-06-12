export const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  if (hostname !== "localhost" && hostname !== "127.0.0.1") {
    return "https://crystara-backend.vercel.app";
  }
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5001";
};

export const API_URL = getApiUrl();
