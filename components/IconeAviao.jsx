import React from "react";
import { View } from "react-native";
import Svg, { Path, Circle, Rect, G } from "react-native-svg";

export default function IconeAviao({
  cor = "#00FFFF", // Um azul-ciano estilo radar por padrão
  tamanho = 35, // Tamanho um pouco menor para o mapa não ficar poluído
  tipo = "jato",
  rotacao = 0, // 👈 Nova engrenagem: para o avião apontar para a rota certa!
}) {
  const renderDesenho = () => {
    // 🚁 HELICÓPTERO
    if (tipo === "helicoptero") {
      return (
        <Svg height={tamanho} width={tamanho} viewBox="0 0 100 100">
          <G origin="50, 50">
            {/* Corpo / Cabine com contorno */}
            <Circle
              cx="50"
              cy="40"
              r="14"
              fill={cor}
              stroke="#00040D"
              strokeWidth="3"
            />
            {/* Cauda */}
            <Rect
              x="48"
              y="50"
              width="4"
              height="35"
              fill={cor}
              stroke="#00040D"
              strokeWidth="2"
            />
            {/* Rotor Traseiro */}
            <Circle
              cx="50"
              cy="85"
              r="5"
              fill={cor}
              stroke="#00040D"
              strokeWidth="2"
            />
            {/* Rotor Principal (Mantemos sem contorno para dar ideia de movimento) */}
            <Rect
              x="10"
              y="38"
              width="80"
              height="4"
              fill={cor}
              opacity="0.8"
            />
            <Rect x="48" y="0" width="4" height="80" fill={cor} opacity="0.8" />
          </G>
        </Svg>
      );
    }

    // 🛩️ MONOMOTOR (Teco-Teco)
    else if (tipo === "teco-teco") {
      return (
        <Svg height={tamanho} width={tamanho} viewBox="0 0 100 100">
          <G origin="50, 50">
            {/* Fuselagem */}
            <Rect
              x="44"
              y="20"
              width="12"
              height="60"
              fill={cor}
              rx="6"
              stroke="#00040D"
              strokeWidth="3"
            />
            {/* Asa Principal */}
            <Rect
              x="15"
              y="35"
              width="70"
              height="12"
              fill={cor}
              rx="2"
              stroke="#00040D"
              strokeWidth="3"
            />
            {/* Estabilizador Horizontal */}
            <Rect
              x="30"
              y="72"
              width="40"
              height="8"
              fill={cor}
              rx="2"
              stroke="#00040D"
              strokeWidth="3"
            />
          </G>
        </Svg>
      );
    }

    // ✈️ JATO COMERCIAL (Padrão)
    else {
      return (
        <Svg height={tamanho} width={tamanho} viewBox="0 0 512 512">
          <Path
            fill={cor}
            stroke="#00040D" // 👈 Contorno Escuro
            strokeWidth="18" // 👈 Espessura do contorno (maior aqui porque o viewBox é 512)
            strokeLinejoin="round" // Deixa os cantos do contorno suaves
            d="M448 336v-40L288 192V79.2c0-25.5-23.3-47.2-48-47.2s-48 21.7-48 47.2V192L32 296v40l160-48v113.6l-48 31.2V480l96-24 96 24v-47.2l-48-31.2V288l160 48z"
          />
        </Svg>
      );
    }
  };

  return (
    // 👇 Aplicando a rotação na View inteira para o nariz do avião apontar para a direção do voo
    <View
      style={{
        width: tamanho,
        height: tamanho,
        alignItems: "center",
        justifyContent: "center",
        transform: [{ rotate: `${rotacao}deg` }],
      }}
    >
      {renderDesenho()}
    </View>
  );
}
