import * as SecureStore from "expo-secure-store";
import { createContext, useContext, useEffect, useState } from "react";

type User = {
  id: number;
  name: string;
  email: string;
};

type AuthContextType = {
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (token: string, user: User) => Promise<void>;
  signOut: () => Promise<void>;
  user: User | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      const storedToken = await SecureStore.getItemAsync("access_token");
      const storedUser = await SecureStore.getItemAsync("user");
      
      if (storedToken) {
        setToken(storedToken);
      }

      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }

      setLoading(false);
    };
    loadToken();
  }, []);

  const signIn = async (newToken: string, userData: User) => {
    await SecureStore.setItemAsync("access_token", newToken);
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("access_token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, loading, signIn, signOut, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthSession = () => useContext(AuthContext);
