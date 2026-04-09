const BASE_URL = import.meta.env.VITE_API_URL || "";

export const fetchApi = async (url: string, options: RequestInit = {}) => {
  const headers = {
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: "include", // Send secure HttpOnly cookies automatically
  });

  if (response.status === 401) {
    localStorage.removeItem("user");
    window.location.href = "/";
  }

  return response;
};
