import { IOptionData } from "@/types/IOptionData";
import { Picker } from "@react-native-picker/picker";
import { StyleSheet, Text, View } from "react-native";

interface ICitySelectorProps {
  cities: Array<IOptionData>;
  selectedCity: string;
  onCityChange: (city: IOptionData) => void;
}

export const CitySelector = ({
  cities,
  selectedCity,
  onCityChange,
}: ICitySelectorProps) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>City:</Text>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    // flexDirection: "column",
    // justifyContent: "center",
    // paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  picker: {},
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
  },
});
