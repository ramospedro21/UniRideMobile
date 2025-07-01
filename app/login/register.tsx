import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function RegisterScreen() {
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    surname: "",
    cellphone: "",
    email: "",
    password: "",
    document: "",
    driverDocument: "",
    driverCode: "",
    photo: null as string | null,
  });

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setForm((prev) => ({ ...prev, foto: result.assets[0].uri }));
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.surname || !form.email || !form.password || !form.cellphone || !form.document || !form.photo) {
      Alert.alert("Erro", "Preencha todos os campos obrigatórios.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://192.168.15.12:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ form }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao fazer login.");
      }

      if (!data.access_token) {
        throw new Error("Token não encontrado na resposta.");
      }

      await router.push("/login/register")

    } catch (error: any) {
      Alert.alert("Erro", error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
    Alert.alert("Sucesso", "Cadastro enviado com sucesso!");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Nova conta</Text>
      <Text style={styles.subtitle}>Informe seus dados:</Text>

      <View style={styles.row}>
        <TextInput
          placeholder="Primeiro nome*"
          style={[styles.input, styles.flex1]}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
        <TextInput
          placeholder="Sobrenome*"
          style={[styles.input, styles.flex1]}
          onChangeText={(text) => setForm((prev) => ({ ...prev, surname: text }))}
        />
      </View>

      <TextInput
        placeholder="Número de telefone*"
        style={styles.input}
        keyboardType="phone-pad"
        onChangeText={(text) => setForm((prev) => ({ ...prev, cellphone: text }))}
      />

      <TextInput
        placeholder="E-mail institucional*"
        style={styles.input}
        keyboardType="email-address"
        onChangeText={(text) => setForm((prev) => ({ ...prev, email: text }))}
      />

      <TextInput
        placeholder="Senha*"
        style={styles.input}
        secureTextEntry
        onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
      />

      <TextInput
        placeholder="Informe seu CPF*"
        style={styles.input}
        keyboardType="numeric"
        onChangeText={(text) => setForm((prev) => ({ ...prev, document: text }))}
      />

      <TextInput
        placeholder="Nº de registro da sua CNH"
        style={styles.input}
        onChangeText={(text) => setForm((prev) => ({ ...prev, driverDocument: text }))}
      />

      <TextInput
        placeholder="Código de segurança da sua CNH (11 caracteres)"
        style={styles.input}
        maxLength={11}
        onChangeText={(text) => setForm((prev) => ({ ...prev, driverCode: text }))}
      />

      <TouchableOpacity style={styles.imageBox} onPress={handlePickImage}>
        {form.photo ? (
          <Image source={{ uri: form.photo }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Sua foto de perfil*</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Criar nova conta</Text>
      </TouchableOpacity>

      <Text style={styles.terms}>
        Ao continuar, você concorda com nosso{" "}
        <Text style={{ fontWeight: "bold" }}>Termos de serviço/uso</Text>
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: "#fff",
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 12,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  flex1: {
    flex: 1,
  },
  imageBox: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderStyle: "dashed",
    height: 120,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  imageText: {
    color: "#888",
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  button: {
    backgroundColor: "yellow",
    padding: 15,
    borderRadius: 30,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonText: {
    fontWeight: "bold",
    color: "#000",
  },
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: "#444",
  },
});
