import { useAuthSession } from "@/providers/AuthProvider";
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

export default function OfferStepThree() {
	const router = useRouter();
	const params = useLocalSearchParams();
	const [ride, setRide] = useState<any>(null);
	const { user } = useAuthSession();
	const [step, setStep] = useState(1);
	const [date, setDate] = useState(new Date());
	const [showDatePicker, setShowDatePicker] = useState(false);
	const [time, setTime] = useState("12:00");
	const [showTimePicker, setShowTimePicker] = useState(false);
	const [passengers, setPassengers] = useState(1);
	const [price, setPrice] = useState("");
	const [cars, setCars] = useState<any[]>([]);
	const [selectedCarId, setSelectedCarId] = useState<string | null>(null);
	const apiUrl = process.env.EXPO_PUBLIC_API_URL;

	useEffect(() => {
		const loadData = async () => {
			try {
				if (params.ride) {
					const parsed = JSON.parse(params.ride as string);
					setRide(parsed);
				}

				const userCars = await fetchUserCars();
				setCars(userCars);
			} catch (error) {
				console.error("Erro ao carregar dados da tela:", error);
				Alert.alert("Erro", "Não foi possível carregar os veículos.");
			}
		};

		loadData();
	}, []);
	
	const next = () => setStep((s) => Math.min(5, s + 1));
	const back = () => (step > 1 ? setStep((s) => s - 1) : router.back());

	const fetchUserCars = async () => {

		const token = await SecureStore.getItemAsync("access_token");
		const response = await fetch(`${apiUrl}/getCarsByUser/${user?.id}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!response.ok) {
			throw new Error("Erro ao buscar veículos");
		}

		const data = await response.json();

		return data.data;
	};

	const formatBRL = (value: string) => {
		const numericValue = value.replace(/\D/g, "");
		const float = parseFloat(numericValue) / 100;

		if (isNaN(float)) return "";
		
		return float.toLocaleString("pt-BR", {
			style: "currency",
			currency: "BRL",
		});
	};

	const handleChange = (text: string) => {
		const formatted = formatBRL(text);
		setPrice(formatted);
	};

	const getNumericValue = (formatted: string) => {
		return Number(formatted.replace(/\D/g, "")) / 100;
	};

	const formatTime = (isoString: string) => {
		const date = new Date(isoString);
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");
		return `${hours}:${minutes}`;
	};

  	const finish = async () => {
		if (!selectedCarId || !price || !ride?.origin || !ride?.destination) {
			return Alert.alert("Preencha todos os campos antes de continuar");
		}

		const formattedRide = {
			driver_id: user?.id,
			car_id: selectedCarId,
			departure_location_lat: String(ride.origin.latitude),
			departure_location_long: String(ride.origin.longitude),
			arrive_location_lat: String(ride.destination.latitude),
			arrive_location_long: String(ride.destination.longitude),
			departure_time: formatTime(date.toISOString()),
			capacity: passengers,
			ride_fare: getNumericValue(price),
		};

		const token = await SecureStore.getItemAsync("access_token");

		const response = await fetch(`${apiUrl}/rides`, {
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
						<Button title="Selecionar horário de saída" onPress={() => setShowTimePicker(true)} />

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
							onChangeText={handleChange}
							keyboardType="numeric"
						/>
					</>
				)}

				{step === 5 && (
					<>
						<Text style={styles.label}>Selecione o veículo:</Text>
						<FlatList
							data={cars}
							keyExtractor={(item) => item.id.toString()}
							renderItem={({ item }) => {
								const isSelected = selectedCarId === item.id;
								return (
									<TouchableOpacity
										style={[
											styles.carItem,
											isSelected && styles.carItemSelected
										]}
										onPress={() => setSelectedCarId(item.id)}
									>
										<View style={styles.radio}>
											{isSelected && <View style={styles.radioSelected} />}
										</View>
										<View>
											<Text style={styles.carTitle}>{`${item.brand} ${item.model}`}</Text>
											<Text style={styles.carPlate}>{item.plate.toUpperCase()}</Text>
										</View>
									</TouchableOpacity>
								);
							}}
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
	carItem: {
	flexDirection: "row",
	alignItems: "center",
	backgroundColor: "#f2f2f2",
	padding: 12,
	borderRadius: 8,
	marginBottom: 10,
	borderWidth: 1,
	borderColor: "#ccc",
},

carItemSelected: {
	borderColor: "#141e61",
	backgroundColor: "#e0e8ff",
},

carTitle: {
	fontSize: 16,
	fontWeight: "bold",
},

carPlate: {
	fontSize: 14,
	color: "#555",
},
});

