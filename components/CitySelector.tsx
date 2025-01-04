import { ThemedText, ThemedView } from "@/components/ui";
import { useTheme } from "@/hooks/ui";
import { ICity } from "@/types/ICity";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet } from "react-native";

interface ICitySelectorProps {
  cities: ICity[];
  selectedCity: string;
  onCityChange: (city: ICity) => void;
}

export const CitySelector = ({
  cities,
  selectedCity,
  onCityChange,
}: ICitySelectorProps) => {
  const theme = useTheme();

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultBold" variant="primary">
        City:
      </ThemedText>

      <Picker
        selectedValue={selectedCity}
        onValueChange={(itemValue: string) => {
          const city = cities.find((city) => city.name === itemValue);
          if (city) {
            onCityChange(city);
          }
        }}
        style={[
          styles.picker,
          { backgroundColor: theme.accent, color: theme.primaryText },
        ]}
      >
        {cities.map((city) => (
          <Picker.Item key={city.name} label={city.name} value={city.name} />
        ))}
      </Picker>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  picker: {
    borderRadius: 5,
    padding: 5,
  },
});
