import React, { useState, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import { classificarAeronavePorFisica } from "./utils/radarHelpers";

// 🛠️ CORREÇÃO 1: Caminho ajustado. Como este arquivo está em /app,
// usamos '../' para subir um nível e achar a animação na raiz.
import AnimatedSplashScreen from "../AnimatedSplashScreen";

import { gpsAeroportos } from "./aeroportos";
import PainelFMS from "../components/PainelFMS";
import BottomSheetBriefing from "../components/BottomSheetBriefing";

const imgJato = require("../assets/images/jato.png");
const imgTeco = require("../assets//images/tecoteco.png");
const imgHeli = require("../assets//images/heli.png");

export default function Index() {
  // 🗺️ Memória de posição do mapa (O radar precisa disso para buscar!)
  const [regiaoMapa, setRegiaoMapa] = useState({
    latitude: -23.5505,
    longitude: -46.6333,
    latitudeDelta: 10.0,
    longitudeDelta: 10.0,
  });
  const [aviaoSelecionado, setAviaoSelecionado] = useState(null);
  const [isSplashFinished, setIsSplashFinished] = useState(false);
  const [modalCalculadoraVisivel, setModalCalculadoraVisivel] = useState(false);
  const [proaPista, setProaPista] = useState("");
  const [direcaoVento, setDirecaoVento] = useState("");
  const [velocidadeVento, setVelocidadeVento] = useState("");
  const [resultadoVento, setResultadoVento] = useState(null);
  const mapRef = useRef(null);
  const [filtroRadar, setFiltroRadar] = useState("TODOS");

  const [rotaAtiva, setRotaAtiva] = useState(null);
  const [setLocalPiloto] = useState(null);

  const [sheetVisivel, setSheetVisivel] = useState(false);
  const [carregandoDados, setCarregandoDados] = useState(false);
  const [dadosVoo, setDadosVoo] = useState({
    metarOrigem: "",
    metarDestino: "",
    tafOrigem: "",
    tafDestino: "",
    notamsOrigem: [],
    notamsDestino: [],
  });
  const [abaAtiva, setAbaAtiva] = useState("briefing");

  const [avioes, setAvioes] = useState([]);
  const [buscandoRadar, setBuscandoRadar] = useState(false);
  const [exibirNuvens, setExibirNuvens] = useState(false);

  const buscarDadosDoServidor = async (icaoO, icaoD) => {
    setCarregandoDados(true);
    setSheetVisivel(true);
    setAbaAtiva("briefing");
    try {
      const [resMetarO, resMetarD, resTafO, resTafD, resNotamO, resNotamD] =
        await Promise.all([
          fetch(`https://aerobrif.onrender.com/api/metar/${icaoO}`),
          fetch(`https://aerobrif.onrender.com/api/metar/${icaoD}`),
          fetch(`https://aerobrif.onrender.com/api/taf/${icaoO}`),
          fetch(`https://aerobrif.onrender.com/api/taf/${icaoD}`),
          fetch(`https://aerobrif.onrender.com/api/notam/${icaoO}`),
          fetch(`https://aerobrif.onrender.com/api/notam/${icaoD}`),
        ]);

      const metarO = await resMetarO.json();
      const metarD = await resMetarD.json();
      const tafO = await resTafO.json();
      const tafD = await resTafD.json();
      const notamO = await resNotamO.json();
      const notamD = await resNotamD.json();

      setDadosVoo({
        metarOrigem: metarO.length > 0 ? metarO[0].rawOb : "METAR Indisponível",
        metarDestino:
          metarD.length > 0 ? metarD[0].rawOb : "METAR Indisponível",
        tafOrigem: tafO.length > 0 ? tafO[0].rawTAF : "Sem previsão TAF",
        tafDestino: tafD.length > 0 ? tafD[0].rawTAF : "Sem previsão TAF",
        notamsOrigem: Array.isArray(notamO) ? notamO : [],
        notamsDestino: Array.isArray(notamD) ? notamD : [],
      });
    } catch (error) {
      console.log("Erro:", error);
      Alert.alert("Erro", "Falha na conexão com a torre.");
    } finally {
      setCarregandoDados(false);
    }
  };

  const handleMinhaLocalizacao = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Erro", "Sem GPS.");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const coords = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
    setLocalPiloto(coords);
    mapRef.current?.animateToRegion(
      { ...coords, latitudeDelta: 0.5, longitudeDelta: 0.5 },
      1500,
    );
  };

  const varreduraRadar = async () => {
    if (!regiaoMapa) return;
    setBuscandoRadar(true);
    const key = "iDWmtzvnIteCxcqDyV1opfHOfse9xHJ5";
    const {
      latitude: lat,
      longitude: lon,
      latitudeDelta: dLat,
      longitudeDelta: dLon,
    } = regiaoMapa;
    const query = `-latlong "${(lat - dLat).toFixed(4)} ${(lon - dLon).toFixed(4)} ${(lat + dLat).toFixed(4)} ${(lon + dLon).toFixed(4)}"`;
    const url = `https://aeroapi.flightaware.com/aeroapi/flights/search?query=${encodeURIComponent(query)}&max_pages=1`;

    try {
      const res = await fetch(url, {
        headers: { "x-apikey": key, Accept: "application/json" },
      });
      const dados = await res.json();
      if (dados?.flights) {
        setAvioes(
          dados.flights
            .filter((f) => f.last_position)
            .map((f) => ({
              id: f.fa_flight_id,
              callsign: f.ident,
              latitude: f.last_position.latitude,
              longitude: f.last_position.longitude,
              altitude: (f.last_position.altitude || 0) * 100,
              velocidade: f.last_position.groundspeed || 0,
              direcao: f.last_position.heading || 0,
              origem: f.origin?.code || "N/A",
              destino: f.destination?.code || "N/A",
            })),
        );
      }
    } catch (e) {
      console.log(e);
    } finally {
      setBuscandoRadar(false);
    }
  };

  useEffect(() => {
    const timerRadar = setInterval(() => {
      varreduraRadar();
    }, 30000);

    return () => clearInterval(timerRadar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regiaoMapa]);

  const handleCarregarRota = (icaoO_digitado, icaoD_digitado) => {
    Keyboard.dismiss();

    const icaoO = icaoO_digitado.toUpperCase().trim();
    const icaoD = icaoD_digitado.toUpperCase().trim();

    if (!gpsAeroportos[icaoO] || !gpsAeroportos[icaoD]) return;

    const coordsO = {
      latitude: gpsAeroportos[icaoO].coords[0],
      longitude: gpsAeroportos[icaoO].coords[1],
    };
    const coordsD = {
      latitude: gpsAeroportos[icaoD].coords[0],
      longitude: gpsAeroportos[icaoD].coords[1],
    };

    setRotaAtiva({
      origem: { icao: icaoO, coords: coordsO },
      destino: { icao: icaoD, coords: coordsD },
    });
    mapRef.current?.fitToCoordinates([coordsO, coordsD], {
      edgePadding: { top: 100, right: 50, bottom: 450, left: 50 },
      animated: true,
    });
    buscarDadosDoServidor(icaoO, icaoD);
  };

  const calcularVentoTransversal = () => {
    const rad =
      (parseFloat(direcaoVento) - parseFloat(proaPista)) * (Math.PI / 180);
    const vel = parseFloat(velocidadeVento);
    setResultadoVento({
      crosswind: Math.abs(Math.sin(rad) * vel).toFixed(1),
      headwind: Math.abs(Math.cos(rad) * vel).toFixed(1),
      tipoFrontal:
        Math.cos(rad) * vel >= 0 ? "Vento de Proa" : "Vento de Cauda",
    });
  };

  const limparCalculadora = () => {
    setProaPista("");
    setDirecaoVento("");
    setVelocidadeVento("");
    setResultadoVento(null);
  };

  if (!isSplashFinished) {
    return <AnimatedSplashScreen onFinish={() => setIsSplashFinished(true)} />;
  }

  console.log("DADOS DO VOO:", avioes[0]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle="light-content"
        translucent
        backgroundColor="transparent"
      />

      {/* 🎛️ PAINEL DE FILTROS DO RADAR */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "center",
          backgroundColor: "#0f172a",
          padding: 10,
          paddingTop: 40,
          zIndex: 10,
        }}
      >
        {["TODOS", "AVIÃO", "MONOMOTOR", "HELICÓPTERO"].map((filtro) => (
          <TouchableOpacity
            key={filtro}
            onPress={() => setFiltroRadar(filtro)}
            style={{
              paddingHorizontal: 15,
              paddingVertical: 8,
              marginHorizontal: 5,
              backgroundColor: filtroRadar === filtro ? "#0ea5e9" : "#1e293b",
              borderRadius: 20,
              borderWidth: 1,
              borderColor: "#334155",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "bold" }}>
              {filtro}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <MapView
        ref={mapRef} // 🎥 Conectando o Cameraman!
        onRegionChangeComplete={setRegiaoMapa}
        onPress={() => setAviaoSelecionado(null)}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -23.5505,
          longitude: -46.6333,
          latitudeDelta: 10.0,
          longitudeDelta: 10.0,
        }}
        userInterfaceStyle="dark"
      >
        {/* 📍 1. TRAÇANDO A ROTA (POLYLINE) */}
        {rotaAtiva && rotaAtiva.origem && rotaAtiva.destino && (
          <Polyline
            coordinates={[
              {
                latitude:
                  rotaAtiva.origem.latitude || rotaAtiva.origem.lat || 0,
                longitude:
                  rotaAtiva.origem.longitude || rotaAtiva.origem.lon || 0,
              },
              {
                latitude:
                  rotaAtiva.destino.latitude || rotaAtiva.destino.lat || 0,
                longitude:
                  rotaAtiva.destino.longitude || rotaAtiva.destino.lon || 0,
              },
            ]}
            strokeColor="#0ea5e9" // Azul brilhante
            strokeWidth={3}
            lineDashPattern={[5, 5]} // Deixa a linha tracejada!
          />
        )}

        {/* 2. FILTRANDO E DESENHANDO OS AVIÕES */}
        {avioes
          .filter((aviao) => {
            // 🎛️ A Mágica do Filtro acontece aqui antes de desenhar!
            if (filtroRadar === "TODOS") return true;
            const tipo = classificarAeronavePorFisica(
              aviao.altitude,
              aviao.velocidade,
            );
            if (filtroRadar === "HELIS" && tipo === "helicoptero") return true;
            if (filtroRadar === "TECOS" && tipo === "teco-teco") return true;
            if (
              filtroRadar === "JATOS" &&
              tipo !== "helicoptero" &&
              tipo !== "teco-teco"
            )
              return true;
            return false;
          })
          .map((aviao) => {
            const latVerdadeira = aviao.latitude;
            const lonVerdadeira = aviao.longitude;
            const direcaoVerdadeira = parseFloat(aviao.direcao || 0);

            if (!aviao || latVerdadeira == null || lonVerdadeira == null)
              return null;

            const tipoFisica = classificarAeronavePorFisica(
              aviao.altitude,
              aviao.velocidade,
            );
            let fotoAeronave = imgJato;
            let tamanhoAeronave = 45;
            let corAeronave = "#EF4444";

            if (tipoFisica === "helicoptero") {
              fotoAeronave = imgHeli;
              tamanhoAeronave = 45;
              corAeronave = "#3B82F6";
            } else if (tipoFisica === "teco-teco") {
              fotoAeronave = imgTeco;
              tamanhoAeronave = 30;
              corAeronave = "##EAB308";
            }

            return (
              <Marker
                key={aviao.id || aviao.callsign || Math.random().toString()}
                coordinate={{
                  latitude: latVerdadeira,
                  longitude: lonVerdadeira,
                }}
                anchor={{ x: 0.5, y: 0.5 }}
                flat={true}
                rotation={direcaoVerdadeira}
                onPress={(e) => {
                  e.stopPropagation();
                  setAviaoSelecionado(aviao);

                  // 🎥 3. FOLLOW MODE: Câmera persegue o avião clicado!
                  if (mapRef.current) {
                    mapRef.current.animateToRegion(
                      {
                        latitude: latVerdadeira,
                        longitude: lonVerdadeira,
                        latitudeDelta: 0.5, // Dá um zoom no avião
                        longitudeDelta: 0.5,
                      },
                      1000,
                    ); // 1000ms = 1 segundo de animação suave
                  }
                }}
              >
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Image
                    source={fotoAeronave}
                    style={{
                      width: tamanhoAeronave + 4,
                      height: tamanhoAeronave + 4,
                      resizeMode: "contain",
                      tintColor: "#FFFFFF",
                      position: "absolute",
                    }}
                  />
                  <Image
                    source={fotoAeronave}
                    style={{
                      width: tamanhoAeronave,
                      height: tamanhoAeronave,
                      resizeMode: "contain",
                      tintColor: corAeronave,
                    }}
                  />
                </View>
              </Marker>
            );
          })}
      </MapView>

      {/* ✈️ PAINEL SUPERIOR DO AVIÃO SELECIONADO (HUD) */}
      {aviaoSelecionado && (
        <View style={styles.painelTopoInfo}>
          <TouchableOpacity
            style={{ position: "absolute", top: 10, right: 15, zIndex: 10 }}
            onPress={() => setAviaoSelecionado(null)}
          >
            <Text
              style={{ color: "#ef4444", fontSize: 18, fontWeight: "bold" }}
            >
              X
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginBottom: 10,
              backgroundColor: "rgba(0, 255, 255, 0.1)",
              padding: 10,
              borderRadius: 8,
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#aaa", fontSize: 10 }}>ORIGEM</Text>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                {aviaoSelecionado.origem} {/* 👈 Puxando a nova variável */}
              </Text>
            </View>
            <Text style={{ color: "#00FFFF", fontSize: 20 }}>✈️</Text>
            <View style={{ alignItems: "center" }}>
              <Text style={{ color: "#aaa", fontSize: 10 }}>DESTINO</Text>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                {aviaoSelecionado.destino}
              </Text>
            </View>
          </View>

          {/* Dados de Telemetria */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View>
              <Text style={{ color: "#aaa", fontSize: 12 }}>Aeronave</Text>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {aviaoSelecionado.aircraft_type ||
                  aviaoSelecionado.modelo ||
                  "Radar Estimado"}
              </Text>
            </View>
            <View>
              <Text style={{ color: "#aaa", fontSize: 12 }}>Velocidade</Text>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {aviaoSelecionado.velocidade} kt
              </Text>
            </View>
            <View>
              <Text style={{ color: "#aaa", fontSize: 12 }}>Altitude</Text>
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {aviaoSelecionado.altitude} ft
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Botões Lado Direito */}
      <TouchableOpacity
        style={[styles.btnRadar, { right: 20 }]}
        onPress={handleMinhaLocalizacao}
      >
        <Text>🎯</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.btnRadar,
          { right: 20, bottom: 290, borderColor: "#a855f7" },
        ]}
        onPress={() => setModalCalculadoraVisivel(true)}
      >
        <Text>🧮</Text>
      </TouchableOpacity>

      {/* Botões Lado Esquerdo */}
      <TouchableOpacity
        style={[styles.btnRadar, { left: 20, borderColor: "#f97316" }]}
        onPress={varreduraRadar}
      >
        {buscandoRadar ? (
          <ActivityIndicator color="#f97316" />
        ) : (
          <Text>📡</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.btnRadar,
          {
            left: 20,
            bottom: 290,
            borderColor: exibirNuvens ? "#38bdf8" : "#1e293b",
          },
        ]}
        onPress={() => setExibirNuvens(!exibirNuvens)}
      >
        <Text>{exibirNuvens ? "⛈️" : "☁️"}</Text>
      </TouchableOpacity>

      {!sheetVisivel ? (
        <PainelFMS onCarregar={handleCarregarRota} />
      ) : (
        <BottomSheetBriefing
          visivel={sheetVisivel}
          onFechar={() => setSheetVisivel(false)}
          carregando={carregandoDados}
          dadosVoo={dadosVoo}
          rotaAtiva={rotaAtiva}
          abaAtiva={abaAtiva}
          setAbaAtiva={setAbaAtiva}
        />
      )}

      {/* MODAL CALCULADORA */}
      <Modal visible={modalCalculadoraVisivel} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Calculadora de Vento</Text>
            <TextInput
              style={styles.inputCalc}
              placeholder="Proa Pista"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={proaPista}
              onChangeText={setProaPista}
            />
            <TextInput
              style={styles.inputCalc}
              placeholder="Dir. Vento"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={direcaoVento}
              onChangeText={setDirecaoVento}
            />
            <TextInput
              style={styles.inputCalc}
              placeholder="Vel. Vento (kt)"
              placeholderTextColor="#94a3b8"
              keyboardType="numeric"
              value={velocidadeVento}
              onChangeText={setVelocidadeVento}
            />
            <View style={styles.rowBotoesCalc}>
              <TouchableOpacity
                style={styles.btnCalcular}
                onPress={calcularVentoTransversal}
              >
                <Text style={styles.btnText}>Calcular</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.btnLimpar}
                onPress={limparCalculadora}
              >
                <Text style={styles.btnText}>Limpar</Text>
              </TouchableOpacity>
            </View>
            {resultadoVento && (
              <View style={styles.resultadoBox}>
                <Text style={styles.resultadoTexto}>
                  Través: {resultadoVento.crosswind} kt
                </Text>
                <Text style={styles.resultadoTexto}>
                  {resultadoVento.tipoFrontal}: {resultadoVento.headwind} kt
                </Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.btnFecharModal}
              onPress={() => setModalCalculadoraVisivel(false)}
            >
              <Text style={styles.btnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  map: { width: "100%", height: "100%", position: "absolute" },
  hud: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "rgba(15, 23, 42, 0.85)",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#0ea5e9",
  },
  hudText: {
    color: "#0ea5e9",
    fontWeight: "bold",
    fontSize: 12,
    letterSpacing: 1,
  },
  pinoMapa: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 4,
    borderWidth: 2,
    borderColor: "#0ea5e9",
  },
  btnRadar: {
    position: "absolute",
    bottom: 220,
    backgroundColor: "rgba(15, 23, 42, 0.9)",
    width: 55,
    height: 55,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4ade80",
    elevation: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#0f172a",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#38bdf8",
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  inputCalc: {
    backgroundColor: "#1e293b",
    color: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#334155",
  },
  rowBotoesCalc: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  btnCalcular: {
    flex: 1,
    backgroundColor: "#0ea5e9",
    padding: 12,
    borderRadius: 10,
    marginRight: 10,
    alignItems: "center",
  },
  btnLimpar: {
    flex: 1,
    backgroundColor: "#475569",
    padding: 12,
    borderRadius: 10,
    marginLeft: 10,
    alignItems: "center",
  },
  btnFecharModal: {
    backgroundColor: "#ef4444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resultadoBox: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#4ade80",
    marginBottom: 15,
  },
  resultadoTexto: {
    color: "#4ade80",
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 5,
  },

  painelTopoInfo: {
    position: "absolute",
    top: 50, // Distância do topo da tela
    left: 20,
    right: 20,
    backgroundColor: "#0A192F",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00FFFF",
    elevation: 10, // Sombra no Android
    shadowColor: "#000", // Sombra no iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 100, // Garante que fique acima de TUDO
  },
});
