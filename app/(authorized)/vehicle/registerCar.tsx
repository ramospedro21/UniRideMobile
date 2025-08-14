import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function VehicleRegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

  const [form, setForm] = useState({
    driver_id: 4,
    brand: "",
    model: "",
    plate: "",
    color: "",
    is_default_veichle: true
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCarRegister = async () => {
    
    try {
      setLoading(true);

      const token = await SecureStore.getItemAsync("access_token");

      const response = await fetch(`${apiUrl}/cars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        const message = data?.errors || "Erro ao cadastrar o veículo.";
        throw new Error(message);
      }

      Alert.alert("Sucesso", "Veículo cadastrado com sucesso!");

      router.push("/(authorized)/ride/offer/offerStepOne");

    } catch (error: any) {
      Alert.alert("Erro", error.message || "Erro ao enviar os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Botão voltar */}
      <TouchableOpacity
        onPress={() => router.back()}
        activeOpacity={0.7}
      >
        <Text>← Voltar</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Cadastro de veículo</Text>

      <TextInput
        placeholder="Marca"
        style={styles.input}
        value={form.brand}
        onChangeText={(text) => handleChange("brand", text)}
      />
      <TextInput
        placeholder="Modelo"
        style={styles.input}
        value={form.model}
        onChangeText={(text) => handleChange("model", text)}
      />
      <TextInput
        placeholder="Placa"
        style={styles.input}
        value={form.plate}
        onChangeText={(text) => handleChange("plate", text)}
      />
      <TextInput
        placeholder="Cor"
        style={styles.input}
        value={form.color}
        onChangeText={(text) => handleChange("color", text)}
      />

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.6 }]}
        onPress={handleCarRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "CONCLUIR"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  button: {
    backgroundColor: "#141e61",
    padding: 16,
    borderRadius: 30,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
