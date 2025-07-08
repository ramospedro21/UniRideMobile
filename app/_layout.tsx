import { AuthProvider, useAuthSession } from "@/providers/AuthProvider";
import { Slot, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";

function AppLayout() {
  const { isAuthenticated, loading } = useAuthSession();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const inProtectedRoute = segments[0] === "(tabs)" || segments[0] === "auth";

    if (inProtectedRoute && !isAuthenticated) {
      router.replace("/(public)/auth/login");
    }

    if (!inProtectedRoute && isAuthenticated && segments[0] === "(public)") {
      router.replace("/(tabs)/home");
    }
  }, [segments, isAuthenticated, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#141e61" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  );
}
