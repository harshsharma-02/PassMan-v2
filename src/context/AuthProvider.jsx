import { useCallback, useEffect, useRef, useState } from "react";
import { AuthContext } from "./auth-context";

const API = "http://localhost:3000";
const TOKEN_KEY = "passman_token";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [ready, setReady] = useState(false);
  /** Ignore late /api/auth/me results after sign-out (avoids re-applying user state). */
  const ignoreMeResultRef = useRef(false);
  const meAbortRef = useRef(null);

  const logout = useCallback(() => {
    ignoreMeResultRef.current = true;
    meAbortRef.current?.abort();
    meAbortRef.current = null;
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  useEffect(() => {
    if (!token) {
      setUser(null);
      setReady(true);
      return;
    }
    ignoreMeResultRef.current = false;
    let cancelled = false;
    const ac = new AbortController();
    meAbortRef.current = ac;
    (async () => {
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("unauthorized");
        const data = await res.json();
        if (!cancelled && !ignoreMeResultRef.current) setUser(data.user);
      } catch (e) {
        if (e?.name === "AbortError" || ac.signal.aborted) return;
        if (!cancelled && !ignoreMeResultRef.current) logout();
      } finally {
        if (!cancelled && !ignoreMeResultRef.current) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
      ac.abort();
    };
  }, [token, logout]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Login failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const register = async (email, password) => {
    const res = await fetch(`${API}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "Registration failed");
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
    setUser(data.user);
    return data;
  };

  const value = { user, token, ready, login, register, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
