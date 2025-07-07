import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function HomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>

      {/* logo */}
      <View style={styles.logoContainer}>
        <Image source={require("@/assets/images/uniride_logo.png")} style={styles.logo} />
      </View>
      
      {/* localização */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <TouchableOpacity style={styles.locationButton}>
          <Text style={styles.locationText}>Qual sua localização?</Text>
        </TouchableOpacity>
      </View>


      {/* Título */}
      <Text style={styles.selectTitle}>Selecione uma das opções:</Text>

      {/* Card Oferecer carona */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Oferecer carona</Text>
          <FontAwesome5 name="car" size={20} color="black" />
        </View>
        <Text style={styles.cardText}>
          Compartilhe uma vaga no seu carro com outros usuários indo para o mesmo destino.
        </Text>
        <TouchableOpacity>
          <Text style={styles.continue}>Continuar</Text>
        </TouchableOpacity>
      </View>

      {/* Card Buscar carona */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Buscar carona</Text>
          <MaterialIcons name="event-seat" size={20} color="black" />
        </View>
        <Text style={styles.cardText}>
          Encontre uma carona disponível e viaje com mais economia e praticidade.
        </Text>
        <TouchableOpacity>
          <Text style={styles.continue}>Continuar</Text>
        </TouchableOpacity>
      </View>

      {/* Suas viagens */}
      <TouchableOpacity style={styles.tripsButton}>
        <Text style={styles.tripsText}>Suas viagens</Text>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <View style={styles.navItemActive}>
          <FontAwesome5 name="car" size={18} color="#fff" />
          <Text style={styles.navTextActive}>Corridas</Text>
        </View>
        <View style={styles.navItem}>
          <MaterialIcons name="chat-bubble-outline" size={20} color="yellow" />
          <Text style={styles.navText}>Mensagens</Text>
        </View>
        <View style={styles.navItem}>
          <Ionicons name="person-circle-outline" size={22} color="yellow" />
          <Text style={styles.navText}>Perfil</Text>
        </View>
      </View>
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
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#141e61",
    height: 70,
    paddingBottom: 10,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navItem: {
    alignItems: "center",
  },
  navItemActive: {
    alignItems: "center",
    borderTopColor: "white",
    borderTopWidth: 5,
    paddingTop: 4,
  },
  navText: {
    color: "yellow",
    fontSize: 12,
  },
  navTextActive: {
    color: "white",
    fontSize: 12,
  },
});