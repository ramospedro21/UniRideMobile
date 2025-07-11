import { RoutePersistence } from "@/components/RoutePersistence";
import { AuthProvider, useAuthSession } from "@/providers/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const ROUTE_KEY = "last_visited_route";

function AppLayout() {
  const { isAuthenticated, loading } = useAuthSession();
  const segments = useSegments();
  const router = useRouter();
  const [initialRouteRestored, setInitialRouteRestored] = useState(false);

  useEffect(() => {
    const restoreRoute = async () => {
      if (loading || !isAuthenticated || initialRouteRestored) return;

      const savedRoute = await SecureStore.getItemAsync(ROUTE_KEY);

      const isInPublic = segments[0] === "(public)";
      if (savedRoute && isInPublic) {
        router.replace(savedRoute as any);
      }

      setInitialRouteRestored(true);
    };

    restoreRoute();
  }, [segments, isAuthenticated, loading]);

  useEffect(() => {
    if (loading || !initialRouteRestored) return;

    const inProtectedRoute = segments[0] === "(tabs)" || segments[0] === "auth";

    if (inProtectedRoute && !isAuthenticated) {
      router.replace("/(public)/auth/login");
    }

    if (!inProtectedRoute && isAuthenticated && segments[0] === "(public)") {
      router.replace("/(tabs)/home");
    }
  }, [segments, isAuthenticated, loading, initialRouteRestored]);

  if (loading || !initialRouteRestored) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#141e61" />
      </View>
    );
  }

  return (
    <>
      <RoutePersistence />
      <Slot />
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
