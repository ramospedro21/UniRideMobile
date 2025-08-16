import { useAuthSession } from "@/providers/AuthProvider";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const MAPBOX_TOKEN = "pk.eyJ1IjoicmFtb3NwZWRybzIxIiwiYSI6ImNtZDY3dXE1ejA2aTcybHEyam9vdjl6a3gifQ.0exFeD6rPB0vkWF-StaUXw";

type Coordinates = { latitude: number; longitude: number };

type Ride = {
  departure: Coordinates;
  arrival: Coordinates | null;
};

export default function searchRideStepTwo() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  const [rideSearchParams, setRideSearchParams] = useState<Ride | null>(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectCoords, setSelectCoords] = useState<Coordinates | null>(null);
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  const { user } = useAuthSession();

  useEffect(() => {
    const rideParam = params.ride as string | undefined;
    if (rideParam) {
      try {
        setRideSearchParams(JSON.parse(rideParam));
      } catch {
        console.error("Erro ao ler ride");
      }
    }
  }, [params.ride]);

  useEffect(() => {
    if (address.length < 2) {
      setSuggestions([]);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&limit=7&language=pt-BR`
      )
        .then((res) => res.json())
        .then((data) =>
          setSuggestions(Array.isArray(data.features) ? data.features : [])
        )
        .catch(() => setSuggestions([]));
    }, 300);

    return () => clearTimeout(timeout);
  }, [address]);

  const handleSelectSuggestion = (item: any) => {
    Keyboard.dismiss();
    setAddress(item.place_name);
    setSuggestions([]);

    const coords: Coordinates = {
      longitude: item.center[0],
      latitude: item.center[1],
    };

    setSelectCoords(coords);

    // Centraliza mapa na nova localização
    mapRef.current?.animateToRegion({
      ...coords,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    });
  };

  const handleSaveAndNext = async () => {
    if (!rideSearchParams || !selectCoords) {
      Alert.alert("Erro", "Selecione um destino válido.");
      return;
    }

    // Atualiza os parâmetros da carona com o destino selecionado
    const updatedRide: Ride = {
      ...rideSearchParams,
      arrival: selectCoords,
    };

    const token = await SecureStore.getItemAsync("access_token");

    const params = new URLSearchParams({
        departure_lat: String(updatedRide.departure.latitude),
        departure_long: String(updatedRide.departure.longitude),
        arrival_lat: String(updatedRide.arrival?.latitude ?? ""),
        arrival_long: String(updatedRide.arrival?.longitude ?? ""),
    });

    try {

        const url = `${apiUrl}/rides?${params.toString()}`;

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();

        router.push({
            pathname: "/(authorized)/ride/search/searchRideStepThree",
            params: { rides: JSON.stringify(data.data) }
        });
    } catch (error) {
        console.error("Erro ao salvar carona:", error);
        return;
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Destino da carona</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o destino..."
        value={address}
        onChangeText={setAddress}
      />

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          style={styles.suggestionsList}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.suggestionItem}
              onPress={() => handleSelectSuggestion(item)}
            >
              <Text>{item.place_name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={{
            latitude: rideSearchParams?.departure.latitude ?? -23.2,
            longitude: rideSearchParams?.departure.longitude ?? -45.9,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={rideSearchParams?.departure!}
            pinColor="green"
            title="Origem"
          />
          {selectCoords && (
            <Marker
              coordinate={selectCoords}
              pinColor="blue"
              title="Destino"
            />
          )}
        </MapView>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSaveAndNext}>
        <Text style={styles.saveText}>Salvar e continuar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, marginTop: 50 },
  back: { fontSize: 16, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#888",
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  suggestionsList: {
    maxHeight: 180,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  suggestionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  mapContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  saveBtn: {
    backgroundColor: "#141e61",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 20,
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
