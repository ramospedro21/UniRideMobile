import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PassengerTripDetail() {
  const { rideId } = useLocalSearchParams<{ rideId: string }>();
  const router = useRouter();
  const [ride, setRide] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPassenger, setSelectedPassenger] = useState<any>(null);

  const handlePassengerPress = (passenger: any) => {
    setSelectedPassenger(passenger);
    setModalVisible(true);
  };

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

  const handleReservation = async (passengerRideId: number, action: "approve" | "reject", passengerName: string, passengerId: number) => {
    const token = await SecureStore.getItemAsync("access_token");

    try {
      const url = `${apiUrl}/passengerRides/${passengerRideId}/handleReservation`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
            action,
            ride_id: ride.id,
            passenger_id: passengerId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.errors || "Erro ao processar a solicitação");
      }

      Alert.alert(
        action === "approve" ? "Aprovado" : "Recusado",
        `Você ${action === "approve" ? "aprovou" : "recusou"} a carona do passageiro ${passengerName}.`
      );

        setRide((prev: any) => {
            if (!prev) return prev;
            return {
                ...prev,
                passengers: prev.passengers
                .map((p: any) =>
                    p.id === passengerId
                    ? action === "approve"
                        ? { ...p, status: "aceito" }
                        : null
                    : p
                )
                .filter(Boolean),
            };
        });

      setModalVisible(false);

    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Não foi possível processar a solicitação. Tente novamente mais tarde.");
      }
    }
  };

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
                <TouchableOpacity
                    key={p.id}
                    onPress={() => p.status === "Pendente" && handlePassengerPress(p)}
                >
                    <Text style={styles.textMarging}>
                        👤 Nome: {p.name} | {p.status === "Pendente" ? "Pendente de aprovação ⚠️" : "Aprovado ✅"}
                    </Text>
                </TouchableOpacity>
                ))
            ) : (
            <Text>Nenhum passageiro ainda</Text>
        )}
      </View>

    <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
    >
    <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Aprovar ou Recusar</Text>
        <Text>Deseja aprovar a carona para {selectedPassenger?.id}?</Text>

        <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 16 }}>
            <Pressable
                style={[styles.modalButton, { backgroundColor: "#28a745" }]}
                onPress={() => {
                    handleReservation(selectedPassenger.passenger_ride_id, "approve", selectedPassenger.name, selectedPassenger.id);
                    setModalVisible(false);
                }}
            >
                <Text style={styles.modalButtonText}>Aprovar</Text>
            </Pressable>

            <Pressable
                style={[styles.modalButton, { backgroundColor: "#dc3545" }]}
                onPress={() => {
                    handleReservation(selectedPassenger.passenger_ride_id, "reject", selectedPassenger.name, selectedPassenger.id);
                    setModalVisible(false);
                }}
            >
                <Text style={styles.modalButtonText}>Recusar</Text>
            </Pressable>
        </View>

        <Pressable onPress={() => setModalVisible(false)} style={{ marginTop: 10 }}>
            <Text style={{ textAlign: "center", color: "#007bff" }}>Fechar</Text>
        </Pressable>
        </View>
    </View>
    </Modal>
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
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
    modalContent: {
        width: "80%",
        backgroundColor: "#fff",
        padding: 20,
        borderRadius: 12,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 12,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        marginHorizontal: 5,
    },
    modalButtonText: {
        color: "#fff",
        fontWeight: "bold",
        textAlign: "center",
    },
});
