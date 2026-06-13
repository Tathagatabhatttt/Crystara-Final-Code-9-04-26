export const getApiUrl = (): string => {
  const hostname = window.location.hostname;
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    return "http://localhost:5001";
  }
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || "https://crystara-final-code-9-04-26-gwpv.vercel.app";
};

export const API_URL = getApiUrl();

