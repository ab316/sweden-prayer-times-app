import { ImageBackground, StyleSheet } from "react-native";

export const BackgroundProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <ImageBackground
      source={require("../assets/images/background.webp")}
      style={styles.background}
      imageStyle={styles.backgroundImage}
    >
      {children}
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
    left: -35,
  },
});
