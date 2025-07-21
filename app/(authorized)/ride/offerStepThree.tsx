import DateTimePicker from "@react-native-community/datetimepicker";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useEffect, useState } from "react";
import {
	Alert,
	Button,
	FlatList,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";

// Mock: substitua pela sua API
const fetchUserCars = async () => [
  { id: "1", name: "Fiat Uno - ABC-1234" },
  { id: "2", name: "VW Gol - XYZ-9876" },
];

export default function OfferStepThree() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [ride, setRide] = useState<any>(null);

	const [step, setStep] = useState(1);
	const [date, setDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [time, setTime] = useState("12:00");
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [passengers, setPassengers] = useState(1);
	const [price, setPrice] = useState("");
	const [cars, setCars] = useState<any[]>([]);
	const [selectedCarId, setSelectedCarId] = useState<string | null>(null);



	useEffect(() => {
		if (params.ride) {
			try {
			const parsed = JSON.parse(params.ride as string);
			setRide(parsed);
			fetchUserCars().then(setCars);
			} catch (e) {
			console.error("Erro ao recuperar o ride:", e);
			}
		}
	}, [params.ride]);
	
	const next = () => setStep((s) => Math.min(5, s + 1));
	const back = () => (step > 1 ? setStep((s) => s - 1) : router.back());

  	const finish = async () => {
		if (!selectedCarId || !price || !ride?.origin || !ride?.destination) {
			return Alert.alert("Preencha todos os campos antes de continuar");
		}

		const formattedRide = {
			driver_id: "4", //TODO: TRAZER ID DO USUÁRIO DINAMICAMENTE
			car_id: selectedCarId,
			departure_location_lat: String(ride.origin.latitude),
			departure_location_long: String(ride.origin.longitude),
			arrive_location_lat: String(ride.destination.latitude),
			arrive_location_long: String(ride.destination.longitude),
			departure_time: date.toISOString(),
			capacity: passengers,
			ride_fare: Number(price),
		};

		console.log("🚀 Enviando ride formatado:", formattedRide);

		const token = await SecureStore.getItemAsync("access_token");

		const response = await fetch("http://192.168.15.12:8000/api/cars", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(formattedRide),
		});

		const data = await response.json();

		if (!response.ok) {
			const message = data?.errors || "Erro ao registrar a carona.";
			throw new Error(message);
		}

	  	Alert.alert("Sucesso", "Carona registrada com sucesso!");

	  	router.push("/(tabs)/home");
	};

	return (
		<View style={styles.container}>
			<View style={styles.top}>
				<Text style={styles.header}>Passo {step} de 5</Text>
			</View>

			<View style={styles.middle}>
				{step === 1 && (
					<>
					<Button title="Selecionar Data" onPress={() => setShowDatePicker(true)} />
					<Text>Selecionado: {date.toLocaleDateString()}</Text>
					{showDatePicker && (
						<DateTimePicker
						value={date}
						mode="date"
						display="spinner"
						onChange={(_, d) => {
							setShowDatePicker(false);
							if (d) setDate(d);
						}}
						style={styles.counterContainer}
						/>
					)}
					</>
				)}

				{step === 2 && (
					<>
						<Button title="Selecionar hora" onPress={() => setShowTimePicker(true)} />

						{time && (
							<Text style={{ marginTop: 10 }}>Hora selecionada: {time}</Text>
						)}

						{showTimePicker && (
							<View style={{ marginTop: 10 }}>
								<DateTimePicker
								value={date}
								mode="time"
								display="spinner"
								onChange={(event, selectedTime) => {
									if (event.type === "set" && selectedTime) {
										const hours = selectedTime.getHours().toString().padStart(2, "0");
										const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
										setTime(`${hours}:${minutes}`);
										setDate(selectedTime);
									} else {
										setShowTimePicker(false);
									}
								}}
								/>

								<Button
									title="Confirmar horário"
									onPress={() => setShowTimePicker(false)}
									color="#141e61"
								/>
							</View>
						)}
					</>
				)}

				{step === 3 && (
					<>
					<Text style={styles.label}>Informe a quantidade de passageiros</Text>
					<View style={styles.counterContainer}>
						<Button title="-" onPress={() => passengers > 1 && setPassengers(passengers - 1)} />
						<Text style={styles.counterText}>{passengers}</Text>
						<Button title="+" onPress={() => passengers < 4 && setPassengers(passengers + 1)} />
					</View>
					</>
				)}

				{step === 4 && (
					<>
						<Text style={styles.label}>Informe o valor da carona</Text>
						<TextInput
							style={styles.input}
							placeholder="Preço da carona (ex: 20.50)"
							value={price}
							onChangeText={setPrice}
							keyboardType="numeric"
						/>
					</>
				)}

				{step === 5 && (
					<>
					<Text style={styles.label}>Selecione o veículo:</Text>
					<FlatList
						data={cars}
						keyExtractor={(c) => c.id}
						renderItem={({ item }) => (
						<TouchableOpacity
							style={styles.radioRow}
							onPress={() => setSelectedCarId(item.id)}
						>
							<View style={styles.radio}>
							{selectedCarId === item.id && <View style={styles.radioSelected} />}
							</View>
							<Text>{item.name}</Text>
						</TouchableOpacity>
						)}
					/>
					</>
				)}
			</View>
			

			<View style={styles.bottom}>
				<View style={styles.navRow}>
					<Button title="Voltar" onPress={back} />
						{step < 5 ? (
					<Button title="Próximo" onPress={next} />
						) : (
					<Button title="Finalizar" onPress={finish} />
					)}
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20,
	},
	top: {
		flex: 1,
		justifyContent: "flex-end",
		alignItems: "center",
	},
	middle: {
		flex: 3,
		justifyContent: "center",
		alignItems: "center",
	},
	bottom: {
		flex: 1,
		justifyContent: "flex-end",
	},
	header: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 20,
	},
	input: {
		borderWidth: 1,
		borderColor: "#888",
		borderRadius: 8,
		padding: 14,
		marginVertical: 20,
		width: "100%",
	},
	counterContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginVertical: 20,
	},
	counterText: {
		fontSize: 24,
		marginHorizontal: 20,
	},
	navRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 30,
	},
	radioRow: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 10,
	},
	radio: {
		width: 20,
		height: 20,
		borderRadius: 10,
		borderWidth: 2,
		borderColor: "#888",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 10,
	},
	radioSelected: {
		width: 10,
		height: 10,
		borderRadius: 5,
		backgroundColor: "#141e61",
	},
	label: {
		fontSize: 16,
		fontWeight: "500",
		marginBottom: 8,
		alignItems:"center",
	},
});

