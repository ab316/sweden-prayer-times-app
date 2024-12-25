import { IOptionData } from "@/types/IOptionData";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet } from "react-native";
import { ThemedText } from "./ui/ThemedText";
import { ThemedView } from "./ui/ThemedView";

interface ICitySelectorProps {
  cities: IOptionData[];
  selectedCity: string;
  onCityChange: (city: IOptionData) => void;
}

export const CitySelector = ({
  cities,
  selectedCity,
  onCityChange,
}: ICitySelectorProps) => {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultBold" variant="primary">
        City:
      </ThemedText>
      <Picker
        selectedValue={selectedCity}
        onValueChange={(itemValue: string) => {
          const city = cities.find((city) => city.value === itemValue);
          if (city) {
            onCityChange(city);
          }
        }}
        style={styles.picker}
      >
        {cities.map((city) => (
          <Picker.Item key={city.value} label={city.label} value={city.value} />
        ))}
      </Picker>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#E8F5E9", // Light green background
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    backgroundColor: "#A5D6A7", // Light green for dropdown
    borderRadius: 5,
    padding: 5,
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#1B5E20", // Dark green
  },
});
