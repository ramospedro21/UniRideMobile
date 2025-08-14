import { useLocalSearchParams, useRouter } from "expo-router";
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
  origin: Coordinates;
  destination: Coordinates | null;
  driver_id: string | null;
  car_id: string | null;
  price: number | null;
  cost: number | null;
  passengers: number | null;
  departure_time: string | null;
};

export default function OfferStepTwo() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const mapRef = useRef<MapView>(null);

  const [ride, setRide] = useState<Ride | null>(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [selectCoords, setSelectCoords] = useState<Coordinates | null>(null);

  useEffect(() => {
    const rideParam = params.ride as string | undefined;
    if (rideParam) {
      try {
        setRide(JSON.parse(rideParam));
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

  const handleSaveAndNext = () => {
    if (!ride || !selectCoords) {
      Alert.alert("Erro", "Selecione um destino válido.");
      return;
    }

    router.push({
      pathname: "/(authorized)/ride/offer/offerStepThree",
      params: {
        ride: JSON.stringify({ ...ride, destination: selectCoords }),
      },
    });
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
            latitude: ride?.origin.latitude ?? -23.2,
            longitude: ride?.origin.longitude ?? -45.9,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          }}
        >
          <Marker
            coordinate={ride?.origin!}
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
