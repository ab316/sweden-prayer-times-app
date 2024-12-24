import { IOptionData } from "@/types/IOptionData";
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import { View, StyleSheet, Text } from "react-native";

export const CitySelector = ({ cities }: { cities: Array<IOptionData> }) => {
  const [selectedCity, setSelectedCity] = useState<string>(cities[0].value);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>City:</Text>
      <Picker
        selectedValue={selectedCity}
        onValueChange={(itemValue) => setSelectedCity(itemValue)}
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
