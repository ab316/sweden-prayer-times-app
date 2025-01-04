import {
  StyleSheet,
  Text,
  Linking,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function Tab() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>About This App</Text>
      <Text style={styles.text}>
        Prayer times source:{" "}
        <Text
          style={styles.link}
          onPress={() => Linking.openURL("https://awqatsalah.com/")}
        >
          Awqat Salah
        </Text>
      </Text>

      <TouchableOpacity
        style={styles.emailContainer}
        onPress={() => Linking.openURL("mailto:abdullahbaigse316@gmail.com")}
      >
        <MaterialIcons name="email" size={24} color="white" />
        <Text style={styles.emailText}>Report Issues / Feature Requests</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    color: "#555555",
    marginBottom: 20,
  },
  link: {
    color: "#1E88E5",
    textDecorationLine: "underline",
  },
  emailContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#34A853",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  emailText: {
    fontSize: 16,
    color: "white",
    marginLeft: 10,
  },
});
