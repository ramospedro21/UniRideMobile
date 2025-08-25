import { useAuthSession } from "@/providers/AuthProvider";
import { hasRegisteredCar } from "@/services/carService";
import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const { signOut, user } = useAuthSession();

  const handleOfferRide = async () => {
    const hasCar = await hasRegisteredCar();

    if (hasCar) {
      router.push("/(authorized)/ride/offer/offerStepOne");
    } else {
      router.push("/(authorized)/vehicle/requireCar");
    }
  };

  const handleSearchRide = () => {
    router.push("/(authorized)/ride/search/searchRideStepOne");
  };

  const handleTrips = () => {
    router.push("/(authorized)/trips/tripsList");
  };

  return (
    <View style={styles.container}>

      {/* logo */}
      <View style={styles.logoContainer}>
        <Image source={require("@/assets/images/uniride_logo.png")} style={styles.logo} />
      </View>

      
      <TouchableOpacity onPress={signOut}>
        <Text>Sair</Text>
      </TouchableOpacity>
      
      {/* localização */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Olá {user?.name}, O que procura hoje?</Text>
        </TouchableOpacity>
      </View>


      {/* Título */}
      <Text style={styles.selectTitle}>Selecione uma das opções:</Text>

      {/* Card Oferecer carona */}
      <View style={styles.card}>
        <TouchableOpacity onPress={handleOfferRide}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Oferecer carona</Text>
            <FontAwesome5 name="car" size={20} color="black" />
          </View>
          <Text style={styles.cardText}>
            Compartilhe uma vaga no seu carro com outros usuários indo para o mesmo destino.
          </Text>
          <Text style={styles.continue}>Continuar</Text>
        </TouchableOpacity>
      </View>

      {/* Card Buscar carona */}
      <View style={styles.card}>
        <TouchableOpacity onPress={handleSearchRide}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Buscar carona</Text>
            <MaterialIcons name="event-seat" size={20} color="black" />
          </View>
          <Text style={styles.cardText}>
            Encontre uma carona disponível e viaje com mais economia e praticidade.
          </Text>
          <Text style={styles.continue}>Continuar</Text>
        </TouchableOpacity>
      </View>

      {/* Suas viagens */}
      <TouchableOpacity style={styles.tripsButton} onPress={handleTrips}>
        <Text style={styles.tripsText}>Suas viagens</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  header: {
    backgroundColor: "#141e61",
    height: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  time: {
    color: "white",
  },
  statusIcons: {
    flexDirection: "row",
    gap: 10,
  },
  logoContainer: {
    alignItems: "flex-start", // antes era center
  },
  logo: {
    maxHeight: 100,
    maxWidth: 100,
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  locationButton: {
    backgroundColor: "#ffe600",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    alignSelf: "center",
    marginTop: 20,
  },
  locationText: {
    fontWeight: "bold",
    color: "#000",
  },
  selectTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 16,
    textAlign: 'center',
    marginTop: 30,
  },
  card: {
    backgroundColor: "#f3f3fb",
    borderRadius: 12,
    padding: 16,
    marginTop: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },
  continue: {
    color: "#141e61",
    fontWeight: "bold",
    textAlign: "right",
  },
  tripsButton: {
    backgroundColor: "#f0f0f5",
    padding: 16,
    alignItems: "center",
    borderRadius: 20,
    marginTop: 10,
  },
  tripsText: {
    fontSize: 16,
    fontWeight: "500",
  },
});