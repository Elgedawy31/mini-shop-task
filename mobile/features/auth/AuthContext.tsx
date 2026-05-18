import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { sessionStore, type StoredSession } from "./session";

type AuthState = {
  session: StoredSession | null;
  isHydrating: boolean;
  setSession: (next: StoredSession | null) => void;
  refreshFromStore: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<StoredSession | null>(null);
  const [isHydrating, setHydrating] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = await sessionStore.load();
      if (!cancelled) {
        setSessionState(stored);
        setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      isHydrating,
      setSession(next) {
        setSessionState(next);
      },
      async refreshFromStore() {
        const stored = await sessionStore.load();
        setSessionState(stored);
      },
      async logout() {
        await sessionStore.clear();
        setSessionState(null);
      },
    }),
    [session, isHydrating]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
