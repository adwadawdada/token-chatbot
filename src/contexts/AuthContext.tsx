
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  threadId: string | null;
  login: (token: string) => Promise<boolean>;
  logout: () => void;
  setThreadId: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(localStorage.getItem("token"));
  const [threadId, setThreadId] = useState<string | null>(localStorage.getItem("threadId"));
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }, [token]);

  useEffect(() => {
    if (threadId) {
      localStorage.setItem("threadId", threadId);
    } else {
      localStorage.removeItem("threadId");
    }
  }, [threadId]);

  const login = async (newToken: string): Promise<boolean> => {
    try {
      // Actual token validation will be done in the Login component
      setToken(newToken);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setThreadId(null);
    navigate("/", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        isAuthenticated,
        threadId,
        login,
        logout,
        setThreadId,
      }}
    >
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
