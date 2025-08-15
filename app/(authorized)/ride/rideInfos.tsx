// app/rides/[id].tsx
import { useAuthSession } from "@/providers/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Ride = {
  id: number;
  driver_name: string;
  driver_rating: number;
  departure_time: string;
  departure_address: string;
  arrival_address: string;
  capacity: number;
  ride_fare: string;
  driver: {
    id: number;
    name: string;
    surname: number;
    cellphone: string;
    document: string;
    profile_photo: string;
  }
  car: {
    brand: string;
    model: string;
    color: string;
    plate: string;
  }
};

export default function RideDetailScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const { user } = useAuthSession();

  const ride: Ride = (() => {
    try {
      return JSON.parse(params.ride as string);
    } catch {
      return {} as Ride;
    }
  })();

  const handleReserve = async () => {

    const token = await SecureStore.getItemAsync("access_token");
    const formattedRide = { ride_id: ride.id, user_id: user?.id };

    try {

      const url = `${apiUrl}/passengerRides`;

      const response = await fetch(url, {
          method: "POST",
          headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formattedRide),
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.errors || "Erro ao reservar carona");
      }

      Alert.alert("Reserva confirmada", `Você reservou a viagem com ${ride.driver.name}`);

      router.push({
          pathname: "/(tabs)/home",
      });

    } catch (error) {
        Alert.alert("Erro", "Não foi possível reservar a carona. Tente novamente mais tarde.");
        return;
    }

  };

  if (!ride?.id) {
    return (
      <View style={styles.center}>
        <Text>Carona não encontrada.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>🚗 Detalhes da Viagem</Text>

        <Text style={styles.label}>Motorista:</Text>
        <Text style={styles.value}>{ride.driver.name} { ride.driver.surname }</Text>

        <Text style={styles.label}>Veículo:</Text>
        <Text style={styles.value}>{ride.car.brand} { ride.car.model } { ride.car.color } - { ride.car.plate }</Text>

        <Text style={styles.label}>Saída:</Text>
        <Text style={styles.value}>{ride.departure_time}</Text>

        <Text style={styles.label}>Origem:</Text>
        <Text style={styles.value}>{ride.departure_address}</Text>

        <Text style={styles.label}>Destino:</Text>
        <Text style={styles.value}>{ride.arrival_address}</Text>

        <Text style={styles.label}>Lugares disponíveis:</Text>
        <Text style={styles.value}>{ride.capacity}</Text>

        <Text style={styles.label}>Valor:</Text>
        <Text style={styles.value}>R$ {ride.ride_fare}</Text>

        <TouchableOpacity style={styles.button} onPress={handleReserve}>
          <Text style={styles.buttonText}>Reservar Viagem</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1, 
        padding: 16, 
        backgroundColor: 
        "#f2f2f2", 
        justifyContent: "center", 
        alignItems: "center"
    },
    center: { 
        flex: 1, 
        justifyContent: "center", 
        alignItems: "center" 
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 3 },
        shadowRadius: 6,
        elevation: 4,
    },
    title: { fontSize: 20, fontWeight: "bold", marginBottom: 12, color: "#000" },
    label: { marginTop: 10, fontWeight: "600", color: "#333" },
    value: { fontSize: 16, fontWeight: "500", color: "#000" },
    button: {
        marginTop: 20,
        backgroundColor: "#007BFF",
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
