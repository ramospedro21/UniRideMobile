import { useAuthSession } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Ride = {
  id: number;
  departure_time: string;
  capacity: number;
  ride_fare: string;
  status: string;
};

type RequestedAPIItem = {
  id: number;
  ride_id: number;
  status: number; // 0 = pendente, 1 = confirmada
  user_id: number;
  evaluation: any;
  created_at: string;
  updated_at: string;
  ride: Ride;
};

export default function UserRidesScreen() {
  const [activeTab, setActiveTab] = useState<"solicitadas" | "oferecidas">("solicitadas");
  const [offeredRides, setOfferedRides] = useState<Ride[]>([]);
  const [requestedRides, setRequestedRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  const { user } = useAuthSession();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;


  useEffect(() => {
    const fetchRides = async () => {
        try {
            const token = await SecureStore.getItemAsync("access_token");
            const url = `${apiUrl}/getRidesByUser/${user?.id}`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const json = await response.json();

            const requestedArray: RequestedAPIItem[] = json?.data?.requested ?? [];
            const offeredArray: RequestedAPIItem[] = json?.data?.offered ?? [];

            const mappedRequested: Ride[] = requestedArray.map((item: RequestedAPIItem, index) => ({
                ...item.ride,
                status: item.status === 0 ? "pendente" : "confirmada",
                id: item.ride?.id ?? index,
                departure_time: formatTime(item.ride?.departure_time),
            }));

            const mappedOffered: Ride[] = (offeredArray as any[]).map((ride: any, index: number) => {
                const passengerCount = Array.isArray(ride.passenger_rides) ? ride.passenger_rides.flat().length : 0;
                const availableSeats = ride.capacity - passengerCount;

                return {
                    id: ride.id ?? index,
                    departure_time: formatTime(ride.departure_time),
                    arrival_time: formatTime(ride.arrival_time),
                    capacity: ride.capacity,
                    ride_fare: ride.ride_fare,
                    status: availableSeats <= 0 ? "Completa" : "Disponível",
                    departure_address: ride.departure_address,
                    arrival_address: ride.arrival_address,
                    passenger_count: passengerCount,
                    available_seats: availableSeats,
                };
            });

            setRequestedRides(mappedRequested);
            setOfferedRides(mappedOffered);
        } catch (error) {
            console.error("Erro ao buscar corridas do usuário:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchRides();
  }, []);

  function formatTime(time: string | undefined): string {
    if (!time) return "";
    return time.split(":").slice(0, 2).join(":");
  }

  const renderRide = (ride: Ride) => (
    <TouchableOpacity
        onPress={() => {
            if(activeTab === "solicitadas") {
                router.push({
                    pathname: "/(authorized)/trips/passenger-trip-detail",
                    params: { rideId: ride.id }
                })
            } else {
                router.push({
                    pathname: `/(authorized)/trips/driverTripDetail`, 
                    params: { rideId: ride.id }
                });
            }
        }}>
        <View style={styles.card}>
            <Text style={styles.cardText}>🕒 Saída: {ride.departure_time}</Text>
            <Text style={styles.cardText}>👥 Lugares: {ride.capacity}</Text>
            <Text style={styles.cardText}>💰 Valor: R$ {ride.ride_fare}</Text>
            <Text style={styles.status}>📌 Status: {ride.status}</Text>
        </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007bff" />
        <Text>Carregando suas corridas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Botão Voltar */}
      <TouchableOpacity onPress={() => router.push("/(tabs)/home")}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Tabs estilo bootstrap */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "solicitadas" && styles.activeTab]}
          onPress={() => setActiveTab("solicitadas")}
        >
          <Text style={[styles.tabText, activeTab === "solicitadas" && styles.activeTabText]}>
            Solicitadas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "oferecidas" && styles.activeTab]}
          onPress={() => setActiveTab("oferecidas")}
        >
          <Text style={[styles.tabText, activeTab === "oferecidas" && styles.activeTabText]}>
            Oferecidas
          </Text>
        </TouchableOpacity>
      </View>

      {/* Listagem */}
      {activeTab === "solicitadas" ? (
        <FlatList
          data={requestedRides}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderRide(item)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma corrida solicitada.</Text>}
        />
      ) : (
        <FlatList
          data={offeredRides}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => renderRide(item)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma corrida oferecida.</Text>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#f8f9fa", // mesma cor da foto
    paddingTop: 60, // margem do topo para o botão Voltar
  },
  loader: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8f9fa" },
  backButton: {
    padding: 12,
    backgroundColor: "#007bff",
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    alignSelf: "flex-start",
  },
  backText: { color: "#000", fontSize: 14 },
  tabs: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    padding: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: "#007bff",
  },
  tabText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#555",
  },
  activeTabText: {
    color: "#007bff",
  },
  list: { 
    paddingHorizontal: 16, 
    paddingBottom: 16, 
    backgroundColor: "#f8f9fa" // mantém mesma cor da tela
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  cardText: { fontSize: 14, marginBottom: 4, color: "#333" },
  status: { marginTop: 4, fontWeight: "600", color: "#007bff" },
  emptyText: { textAlign: "center", color: "#666", marginTop: 20 },
});
