import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import MapView, { Marker } from "react-native-maps";

const MAPBOX_TOKEN = "pk.eyJ1IjoicmFtb3NwZWRybzIxIiwiYSI6ImNtZDY3dXE1ejA2aTcybHEyam9vdjl6a3gifQ.0exFeD6rPB0vkWF-StaUXw";

type Coordinates = {
  latitude: number;
  longitude: number;
};

type Ride = {
  departure: Coordinates;
  arrival: Coordinates | null;
};

export default function OfferStepOne() {
  const router = useRouter();
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [rideSearchParams, setRideSearchParams] = useState<Ride>({
    departure: { latitude: 0, longitude: 0 },
    arrival: { latitude: 0, longitude: 0 },
  });

  // Autocomplete
  useEffect(() => {
    if (address.length < 3) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(() => {
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          address
        )}.json?access_token=${MAPBOX_TOKEN}&limit=5&language=pt-BR`
      )
        .then(res => res.json())
        .then(data => {
          setSuggestions(data.features || []);
        })
        .catch(err => {
          setSuggestions([]);
        });
    }, 400);

    return () => clearTimeout(delay);
  }, [address]);

  const handleSelectSuggestion = (item: any) => {
    Keyboard.dismiss();
    setAddress(item.place_name);
    setSuggestions([]);

    const coords = {
      latitude: item.center[1],
      longitude: item.center[0],
    };
    setCoordinates(coords);
  };

  const handleSaveAndNext = () => {
    if (!coordinates) {
      Alert.alert("Erro", "Selecione um endereço válido.");
      return;
    }

    const updatedRide: Ride = {
      ...rideSearchParams,
      departure: coordinates,
    };

    router.push({
      pathname: "/(authorized)/ride/search/searchRideStepTwo",
      params: {
        ride: JSON.stringify(updatedRide),
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => router.back()}>
        <Text style={styles.back}>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Endereço de partida</Text>

      <TextInput
        style={styles.input}
        placeholder="Digite o endereço"
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
        {coordinates && (
          <MapView
            style={styles.map}
            initialRegion={{
              ...coordinates,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
          >
            <Marker coordinate={coordinates} />
          </MapView>
        )}
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
    borderColor: "#ccc",
    padding: 14,
    borderRadius: 10,
    marginBottom: 4,
  },
  suggestionsList: {
    maxHeight: 150,
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
    height: 300,
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
  },
  saveText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
