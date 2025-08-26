import * as Notifications from "expo-notifications";
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
  expoPushToken: string | null;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

// Configura handler de notificações em primeiro plano
Notifications.setNotificationHandler({
  handleNotification: async (): Promise<Notifications.NotificationBehavior> => ({
    shouldShowAlert: false, // removido
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const storedToken = await SecureStore.getItemAsync("access_token");
      const storedUser = await SecureStore.getItemAsync("user");
      const storedPushToken = await SecureStore.getItemAsync("expo_push_token");

      if (storedToken) setToken(storedToken);
      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedPushToken) setExpoPushToken(storedPushToken);

      setLoading(false);
    };
    loadData();

    // Listener para notificações em primeiro plano
    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notificação recebida em primeiro plano:", notification);
      }
    );

    return () => subscription.remove();
  }, []);

  const registerForPushNotifications = async () => {
    let finalStatus;

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.log("Permissão para notificações não concedida!");
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;
    setExpoPushToken(token);
    await SecureStore.setItemAsync("expo_push_token", token);

    return token;
  };

  const signIn = async (newToken: string, userData: User) => {
    await SecureStore.setItemAsync("access_token", newToken);
    await SecureStore.setItemAsync("user", JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);

    const pushToken = await registerForPushNotifications();

    if (pushToken) {
      try {
        await fetch(`${process.env.EXPO_PUBLIC_API_URL}/save-device-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${newToken}`,
          },
          body: JSON.stringify({ token: pushToken }),
        });
      } catch (error) {
        console.log("Erro ao registrar push token no backend:", error);
      }
    }
  };

  const signOut = async () => {
    await SecureStore.deleteItemAsync("access_token");
    await SecureStore.deleteItemAsync("user");
    await SecureStore.deleteItemAsync("expo_push_token");
    setToken(null);
    setUser(null);
    setExpoPushToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        loading,
        signIn,
        signOut,
        user,
        expoPushToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthSession = () => useContext(AuthContext);
