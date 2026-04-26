import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
} from "react-native";

export default function PainelFMS({ onCarregar }) {
  // 🛡️ O Escudo de Memória: Guardamos a digitação APENAS aqui dentro!
  const [origemLocal, setOrigemLocal] = useState("");
  const [destinoLocal, setDestinoLocal] = useState("");

  return (
    <View style={styles.painelInferior}>
      <View style={styles.linhaInputs}>
        <TextInput
          style={styles.input}
          placeholder="ORIGEM"
          placeholderTextColor="#64748b"
          maxLength={4}
          autoCapitalize="characters"
          value={origemLocal}
          onChangeText={setOrigemLocal} // Atualiza só o painel silenciosamente
        />
        <Text style={styles.seta}>✈️</Text>
        <TextInput
          style={styles.input}
          placeholder="DESTINO"
          placeholderTextColor="#64748b"
          maxLength={4}
          autoCapitalize="characters"
          value={destinoLocal}
          onChangeText={setDestinoLocal} // Atualiza só o painel silenciosamente
        />
      </View>
      <TouchableOpacity
        style={styles.botaoCarregar}
        onPress={() => {
          Keyboard.dismiss();
          // 🚀 Dispara para a Torre as duas palavras de uma vez só!
          onCarregar(origemLocal, destinoLocal);
        }}
      >
        <Text style={styles.textoBotao}>CARREGAR ROTA</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  painelInferior: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    width: "90%",
    backgroundColor: "rgba(15, 23, 42, 0.95)",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    elevation: 15,
  },
  linhaInputs: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  input: {
    flex: 1,
    backgroundColor: "#0f172a",
    color: "#38bdf8",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    borderWidth: 1,
    borderColor: "#475569",
    borderRadius: 8,
    paddingVertical: 12,
  },
  seta: { fontSize: 20, marginHorizontal: 10 },
  botaoCarregar: {
    backgroundColor: "#0ea5e9",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotao: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 16,
    letterSpacing: 1,
  },
});
