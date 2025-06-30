import { Slot, useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuthSession } from "../providers/AuthProvider";

export default function RootLayout() {
  return (
    <AuthProvider>
      <LayoutGate />
    </AuthProvider>
  );
}

function LayoutGate() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuthSession();

  useEffect(() => {
    if (loading) return;

    if (isAuthenticated) {
      router.replace("/(authorized)/tabs/home");
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <Slot />;
}
