import { useAuthSession } from "@/providers/AuthProvider";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function LoginScreen() {
  const { signIn } = useAuthSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    if (!email) {
      Alert.alert("Erro", "Preencha e-mail");
      return;
    }

    if (!password) {
      Alert.alert("Erro", "Preencha a senha");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://192.168.15.89:8000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Erro ao fazer login.");
      }

      if (!data.access_token) {
        throw new Error("Token não encontrado na resposta.");
      }

      await signIn(data.access_token); // Armazena no AuthProvider

    } catch (error: any) {
      Alert.alert("Erro", error.message);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Nova Conta</Text>

      {/* Logo */}
      <Image
        source={require("@/assets/images/uniride_logo.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.welcomeText}>Bem vindo de volta!</Text>

      {/* Inputs */}
      <TextInput
        style={styles.input}
        placeholder="E-mail institucional"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Botão Entrar */}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.loginButtonText}>Entrar</Text>
      </TouchableOpacity>

      {/* Esqueceu a senha */}
      <TouchableOpacity 
        style={styles.forgotButton}
        onPress={() => router.push("/login/resetPassword")} 
      >
        <Text style={styles.forgotButtonText}>Esqueceu a senha?</Text>
      </TouchableOpacity>

      {/* Criar nova conta */}
      <TouchableOpacity 
        style={styles.createAccountButton}
        onPress={() => router.push("/login/register")}   
      >
        <Text style={styles.createAccountText}>Criar nova conta</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff9f9",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#000",
  },
  logo: {
    width: 1000,
    height: 200,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3c3c3c",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 15,
    marginBottom: 12,
    fontSize: 16,
  },
  loginButton: {
    width: "100%",
    backgroundColor: "#191970",
    padding: 15,
    borderRadius: 25,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  forgotButton: {
    marginTop: 15,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    width: "100%",
    alignItems: "center",
  },
  forgotButtonText: {
    color: "#444",
    fontSize: 14,
  },
  createAccountButton: {
    marginTop: 10,
    backgroundColor: "#ffff00",
    padding: 15,
    borderRadius: 25,
    width: "100%",
    alignItems: "center",
  },
  createAccountText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 16,
  },
});
