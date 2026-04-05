import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("purrmatch_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        // Check expiry
        if (payload.exp * 1000 < Date.now()) {
          logout();
        } else {
          setUser({ user_id: payload.user_id, role: payload.role, email: payload.email });
        }
      } catch {
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  async function login(email, password) {
    const data = await api.post("/api/v1/auth/login", { email, password });
    localStorage.setItem("purrmatch_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function register(fields) {
    const data = await api.post("/api/v1/auth/register", fields);
    localStorage.setItem("purrmatch_token", data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    localStorage.removeItem("purrmatch_token");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be within AuthProvider");
  return ctx;
}
