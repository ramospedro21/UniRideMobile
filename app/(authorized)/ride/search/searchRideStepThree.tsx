import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Ride = {
  id: number;
  driver_id: number;
  car_id: number;
  departure_location_lat: string;
  departure_location_long: string;
  arrive_location_lat: string;
  arrive_location_long: string;
  departure_time: string;
  available_seats: number;
  ride_fare: string;
  departure_distance?: number;
  arrival_distance?: number;
  week_days: string[];
  departure_address?: string;
  arrival_address?: string;  
  driver: {
    name: string;
    surname: string;
  }
};

const weekDayMap: Record<string, string> = {
  monday: "Segunda",
  tuesday: "Terça",
  wednesday: "Quarta",
  thursday: "Quinta",
  friday: "Sexta",
  saturday: "Sábado",
  sunday: "Domingo",
};

export default function RidesListScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();

  const rides: Ride[] = (() => {
    if (!params.rides) return [];
    try {
      return JSON.parse(params.rides as string);
    } catch (e) {
      console.error("Erro ao parsear rides:", e);
      return [];
    }
  })();

  const showRideDetails = (ride: Ride) => {
    router.push({
      pathname: "/(authorized)/ride/rideInfos",
      params: {
        ride: JSON.stringify(ride),
      },
    });
  };

  const formatTime = (time: string) => {
    if (!time) return "";
    return time.slice(0, 5); // pega apenas HH:mm
  };

  const formatWeekDays = (days: string[]) => {
    return days.map((day) => weekDayMap[day.toLowerCase()] || day).join(", ");
  };

  if (rides.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Nenhuma carona encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList<Ride>
        data={rides}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <Text style={styles.introText}>
            Estas são as viagens disponíveis com base na sua pesquisa
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => showRideDetails(item)}
          >
            <View style={styles.cardContent}>
              <View style={{ flex: 1 }}>
                <View style={styles.row}>
                  <Text style={styles.label}>🚗 Motorista:</Text>
                  <Text style={styles.value}>
                    {item.driver.name} {item.driver.surname}
                  </Text>
                </View>

                <View style={[styles.row, { flexDirection: "column" }]}>
                  <Text style={styles.label}>📍 Origem:</Text>
                  <Text style={styles.value}>{item.departure_address}</Text>
                </View>

                <View style={[styles.row, { flexDirection: "column" }]}>
                  <Text style={styles.label}>🏁 Destino:</Text>
                  <Text style={styles.value}>{item.arrival_address}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>🕒 Saída:</Text>
                  <Text style={styles.value}>{formatTime(item.departure_time)}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>👥 Lugares disponíveis:</Text>
                  <Text style={styles.value}>{item.available_seats}</Text>
                </View>

                <View style={styles.row}>
                  <Text style={styles.label}>💰 Valor:</Text>
                  <Text style={styles.value}>R$ {item.ride_fare}</Text>
                </View>

                {item.week_days && item.week_days.length > 0 && (
                  <View style={styles.row}>
                    <Text style={styles.label}>📅 Dias:</Text>
                    <Text style={styles.value}>{formatWeekDays(item.week_days)}</Text>
                  </View>
                )}
              </View>
              <Ionicons name="chevron-forward" size={24} color="#888" />
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={[
          styles.list,
          { flexGrow: 1, justifyContent: "center" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    flexWrap: "wrap",
  },
  label: {
    fontWeight: "600",
    color: "#333",
    marginRight: 6,
  },
  value: {
    fontWeight: "bold",
    color: "#000",
    flexShrink: 1,
    flexWrap: "wrap",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#555",
    marginTop: 100,
  },
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    marginTop: 50,
  },
  introText: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "justify",
    color: "#000",
  },
});
