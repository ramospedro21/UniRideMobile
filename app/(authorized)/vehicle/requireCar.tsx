import { useRouter } from "expo-router";
import { Button, StyleSheet, Text, View } from "react-native";

export default function VehicleRequiredScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.mainText}>
        Cadastre um veículo
      </Text>
      <Text style={styles.text}>
        Você ainda não cadastrou nenhum veículo. Para começar a oferecer caronas aos seus colegas, adicione as informações do seu veículo.      
      </Text>
      {/* <Text style={styles.text}>
        Você ainda não cadastrou nenhum veículo. Para começar a oferecer caronas aos seus colegas, adicione as informações do seu veículo.      
      </Text> */}
      <Button title="Cadastrar veículo" onPress={() => router.push("/(authorized)/vehicle/registerCar")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  mainText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    fontWeight: "normal",
    textAlign: "justify"
  }
});
