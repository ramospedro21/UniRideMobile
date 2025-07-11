import { usePathname } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect } from "react";

const ROUTE_KEY = "last_visited_route";

export function RoutePersistence() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname && !pathname.startsWith("/(public)")) {
      SecureStore.setItemAsync(ROUTE_KEY, pathname);
    }
  }, [pathname]);

  return null;
}
