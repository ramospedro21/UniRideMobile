import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync("access_token");
      setToken(storedToken);
      setLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (newToken: string) => {
    await SecureStore.setItemAsync("access_token", newToken);
    setToken(newToken);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthSession = () => useContext(AuthContext);
