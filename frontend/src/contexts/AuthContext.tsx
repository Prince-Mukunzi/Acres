import { createContext, useContext, useState, type ReactNode } from "react";
import { googleLogout } from "@react-oauth/google";
import { fetchApi } from "../utils/api";

interface User {
  id?: string;
  name: string;
  email: string;
  picture?: string;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user exists in local storage on initial load
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = (userData: User) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    googleLogout();
    setUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    fetchApi("/api/v1/auth/logout", { method: "POST" }).catch((error) => {
      console.error("Failed to log out from backend:", error);
    });
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
