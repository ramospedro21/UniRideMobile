import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PassengerTripDetail() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {
    const fetchRide = async () => {
      try {

        const token = await SecureStore.getItemAsync("access_token");
        const url = `${apiUrl}/rides/${rideId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        setRide(data.data);
        console.log(data.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRide();
  }, [rideId]);

  function formatTime(time: string | undefined): string {
    if (!time) return "";
    return time.split(":").slice(0, 2).join(":");
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text>Não foi possível carregar os detalhes da corrida.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Botão Voltar */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.push("/(authorized)/trips/tripsList")}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      {/* Infos principais */}
      <View style={styles.card}>
        <Text style={styles.title}>Informações da Carona</Text>
        <Text style={styles.textMarging}>📍 Saída: {ride.departure_address}</Text>
        <Text style={styles.textMarging}>🏁 Destino: {ride.arrival_address}</Text>
        <Text style={styles.textMarging}>📅 Dias da semana: {ride.week_days_translated?.join(", ")}</Text>
        <Text style={styles.textMarging}>🕒 Hora: {ride.date} {formatTime(ride.departure_time)}</Text>
        <Text style={styles.textMarging}>💰 Valor: R$ {ride.ride_fare}</Text>
      </View>

      {/* Carro */}
      <View style={styles.card}>
        <Text style={styles.title}>Carro</Text>
        <Text style={styles.textMarging}>Marca: {ride.car?.brand}</Text>
        <Text style={styles.textMarging}>Modelo: {ride.car?.model}</Text>
        <Text style={styles.textMarging}>Placa: {ride.car?.plate}</Text>
      </View>

      {/* Motorista */}
      <View style={styles.card}>
        <Text style={styles.title}>Motorista</Text>
        <Text style={styles.textMarging}>👤 Nome: {ride.driver?.name} {ride.driver?.surname}</Text>
        <Text style={styles.textMarging}>📞 {ride.driver?.cellphone}</Text>
      </View>

      {/* Passageiros */}
      <View style={styles.card}>
        <Text style={styles.title}>Passageiros</Text>
        {ride.passengers?.length > 0 ? (
          ride.passengers.map((p: any) => (
            <Text style={styles.textMarging} key={p.id}>👤 Nome: {p.name} | Status: { p.status }</Text>
          ))
        ) : (
          <Text>Nenhum passageiro ainda</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F9FA",
    marginTop: 60
  },
  card: {
    backgroundColor: "#FFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textMarging: {
    marginTop: 10,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#007bff",
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
  },
  backText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
