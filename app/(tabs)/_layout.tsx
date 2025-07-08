import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#141e61",
        tabBarInactiveTintColor: "#ccc",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null, // <-- isso oculta da TabBar
        }}
      />
      <Tabs.Screen
        name="home"
        options={{
          title: "Corridas",
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="car" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: "Mensagens",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-circle-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
