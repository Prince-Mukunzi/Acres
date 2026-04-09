const BASE_URL = import.meta.env.VITE_API_URL || "";

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include", // Send secure HttpOnly cookies automatically
  });

  if (response.status === 401) {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  }

  return response;
};
