import { StyleSheet, View, Text, Linking } from "react-native";

export default function Tab() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>About This App</Text>
      <Text style={styles.text}>
        This app uses a{" "}
        <Text
          style={styles.link}
          onPress={() =>
            Linking.openURL(
              "https://pngtree.com/freepng/beautiful-islamic-compass_13556569.html"
            )
          }
        >
          png image from pngtree.com
        </Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    color: "blue",
    textDecorationLine: "underline",
  },
});
