import axios from "axios";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface Passenger {
  id: number;
  name: string;
  surname: string;
  cellphone: string;
  bio?: string;
  photo?: string;
}

export default function PassengerProfile() {
  const { id, rideId } = useLocalSearchParams();
  const router = useRouter();
  const [passenger, setPassenger] = useState<Passenger | null>(null);
  const [loading, setLoading] = useState(true);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  useEffect(() => {

    if (!id) return;

    const passengerId = Array.isArray(id) ? id[0] : id;

    const fetchPassenger = async () => {
      try {

        const token = await SecureStore.getItemAsync("access_token");

        const url = `${apiUrl}/users/${passengerId}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        setPassenger(data.data);

      } catch (error) {
        console.error(error);
        Alert.alert("Erro", "Não foi possível carregar os dados do passageiro.");
      } finally {
        setLoading(false);
      }
    };

    fetchPassenger();
  }, [id]);

  const handleRemovePassenger = async () => {
    Alert.alert(
      "Remover passageiro",
      `Deseja realmente remover ${passenger?.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Remover",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(`https://seu-backend.com/api/rides/passengers/${id}`);
              Alert.alert("Sucesso", "Passageiro removido.");
              router.back(); // volta para tela da carona
            } catch (err) {
              Alert.alert("Erro", "Não foi possível remover o passageiro.");
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!passenger) {
    return (
      <View style={styles.center}>
        <Text>Passageiro não encontrado</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
        <View style={styles.centerContent}>

        <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
                router.push({
                    pathname: "/(authorized)/trips/driverTripDetail",
                    params: { rideId: String(rideId) },
                });
            }}>
            <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        {/* Foto e botão de conversa */}
        <View style={styles.header}>
            <Image
                source={
                    passenger.photo
                    ? { uri: passenger.photo }
                    : require("../../../images/default_profile.jpg")
                }
                style={styles.avatar}
            />
        </View>

        {/* Dados */}
        <Text style={styles.name}>{passenger.name} {passenger.surname}</Text>
        <Text style={styles.info}>📞 Telefone: {passenger.cellphone}</Text>
        <Text style={styles.info}>📝 Bio: {passenger.bio || "Sem biografia"}</Text>

        {/* Botão de conversa */}
        <TouchableOpacity style={styles.chatButton} onPress={() => console.log("Iniciar conversa")}>
            <Text style={styles.chatButtonText}>ENVIAR MENSAGEM</Text>
        </TouchableOpacity>
        {/* Botão remover */}
        <TouchableOpacity style={styles.removeButton} onPress={handleRemovePassenger}>
            <Text style={styles.removeButtonText}>REMOVER PASSAGEIRO</Text>
        </TouchableOpacity>
        </View>
    </View>
);

}
const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#fff", 
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,  
  },
  header: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    marginBottom: 20,
  },
  avatar: { 
    width: 100, 
    height: 100, 
    borderRadius: 50 
  },
  chatButton: {
    backgroundColor: "#007AFF",
    marginTop: 30,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  chatButtonText: { color: "#fff", fontSize: 18 },
  name: { fontSize: 20, fontWeight: "bold", marginTop: 10 },
  info: { fontSize: 16, marginTop: 5 },
  removeButton: {
    marginTop: 30,
    backgroundColor: "#ff3b30",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  removeButtonText: { color: "#fff", fontWeight: "bold" },
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
