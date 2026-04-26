import React, { useEffect, useRef } from "react";
import { StyleSheet, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function AnimatedSplashScreen({ onFinish }) {
  // Criando as variáveis de animação seguras
  const fadeAnim = useRef(new Animated.Value(0)).current; // Começa invisível (0)
  const scaleAnim = useRef(new Animated.Value(0.8)).current; // Começa menor (0.8)

  useEffect(() => {
    // 1. Inicia a animação assim que a tela abre
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true, // 👈 Isso faz rodar direto na placa de vídeo do celular!
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. O timer para fechar a tela depois de 3.5 segundos
    const timer = setTimeout(onFinish, 3500);
    return () => clearTimeout(timer);
  }, [onFinish, fadeAnim, scaleAnim]);

  return (
    <LinearGradient
      colors={["#00040D", "#0A192F", "#001C3D"]}
      style={styles.container}
    >
      {/* 🌟 A Logo usando o motor Animated nativo */}
      <Animated.Image
        source={require("./assets/images/splash.png")}
        style={[
          styles.fullLogoImage,
          {
            opacity: fadeAnim, // Conectando a variável de opacidade
            transform: [{ scale: scaleAnim }], // Conectando a variável de tamanho
          },
        ]}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fullLogoImage: {
    width: width * 1.5,
    height: width * 1.5,
    resizeMode: "contain",
  },
});
