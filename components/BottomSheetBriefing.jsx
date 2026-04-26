import React from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from "react-native";

export default function BottomSheetBriefing({
  visivel,
  onFechar,
  carregando,
  dadosVoo,
  rotaAtiva,
  abaAtiva,
  setAbaAtiva,
}) {
  if (!visivel) return null;

  // 🌐 Função para abrir o AISWEB direto nas cartas do aeródromo
  const abrirCartas = (icao, tipo = "") => {
    // tipo pode ser ADC, SID, STAR, IAC para facilitar a busca no site
    Linking.openURL(
      `https://aisweb.decea.mil.br/?i=cartas&p=cartas&aero=${icao}`,
    );
  };

  return (
    <View style={styles.bottomSheet}>
      <View style={styles.sheetHeader}>
        <Text style={styles.sheetTitle}>📋 DESPACHO DE VOO</Text>
        <TouchableOpacity onPress={onFechar} style={styles.btnFechar}>
          <Text style={styles.txtFechar}>FECHAR X</Text>
        </TouchableOpacity>
      </View>

      {/* MENU DE ABAS */}
      <View style={styles.tabMenu}>
        <TouchableOpacity
          style={[styles.tabBtn, abaAtiva === "briefing" && styles.tabBtnAtiva]}
          onPress={() => setAbaAtiva("briefing")}
        >
          <Text
            style={[
              styles.tabTxt,
              abaAtiva === "briefing" && styles.tabTxtAtiva,
            ]}
          >
            BRIEFING
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, abaAtiva === "rotaer" && styles.tabBtnAtiva]}
          onPress={() => setAbaAtiva("rotaer")}
        >
          <Text
            style={[styles.tabTxt, abaAtiva === "rotaer" && styles.tabTxtAtiva]}
          >
            ROTAER
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, abaAtiva === "cartas" && styles.tabBtnAtiva]}
          onPress={() => setAbaAtiva("cartas")}
        >
          <Text
            style={[styles.tabTxt, abaAtiva === "cartas" && styles.tabTxtAtiva]}
          >
            CARTAS
          </Text>
        </TouchableOpacity>
      </View>

      {carregando ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.txtLoading}>Sincronizando com a Torre...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollSheet}
          showsVerticalScrollIndicator={false}
        >
          {/* 🌦️ ABA 1: BRIEFING (METAR + TAF + NOTAM) */}
          {abaAtiva === "briefing" && (
            <View>
              {/* --- CARD DE CLIMA --- */}
              <View style={styles.infoCard}>
                <Text style={styles.cardHeader}>🌦️ CLIMA & PREVISÃO</Text>

                <Text style={styles.icaoLabel}>
                  🛫 ORIGEM ({rotaAtiva?.origem.icao}):
                </Text>
                <Text style={styles.metarText}>{dadosVoo.metarOrigem}</Text>
                <Text style={styles.tafLabel}>PREVISÃO (TAF):</Text>
                <Text style={styles.tafText}>{dadosVoo.tafOrigem}</Text>

                <View style={styles.linhaDivisoria} />

                <Text style={styles.icaoLabel}>
                  🛬 DESTINO ({rotaAtiva?.destino.icao}):
                </Text>
                <Text style={styles.metarText}>{dadosVoo.metarDestino}</Text>
                <Text style={styles.tafLabel}>PREVISÃO (TAF):</Text>
                <Text style={styles.tafText}>{dadosVoo.tafDestino}</Text>
              </View>

              {/* --- CARD NOTAM ORIGEM --- */}
              <View style={[styles.infoCard, { borderColor: "#b45309" }]}>
                <Text style={[styles.cardHeader, { color: "#fbbf24" }]}>
                  ⚠️ AVISOS DA ORIGEM (NOTAM)
                </Text>
                {dadosVoo.notamsOrigem.length > 0 ? (
                  dadosVoo.notamsOrigem.map((notam, index) => (
                    <View key={index} style={styles.notamItem}>
                      <Text style={styles.notamTitulo}>
                        {notam.titulo || "AVISO"}
                      </Text>
                      <Text style={styles.notamCorpo}>
                        {notam.corpo || notam}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: "#94a3b8", fontStyle: "italic" }}>
                    Sem avisos para a origem.
                  </Text>
                )}
              </View>

              {/* --- CARD NOTAM DESTINO --- */}
              <View
                style={[
                  styles.infoCard,
                  { borderColor: "#b45309", marginBottom: 40 },
                ]}
              >
                <Text style={[styles.cardHeader, { color: "#fbbf24" }]}>
                  ⚠️ AVISOS DO DESTINO (NOTAM)
                </Text>
                {dadosVoo.notamsDestino && dadosVoo.notamsDestino.length > 0 ? (
                  dadosVoo.notamsDestino.map((notam, index) => (
                    <View key={index} style={styles.notamItem}>
                      <Text style={styles.notamTitulo}>
                        {notam.titulo || "AVISO"}
                      </Text>
                      <Text style={styles.notamCorpo}>
                        {notam.corpo || notam}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: "#94a3b8", fontStyle: "italic" }}>
                    Sem avisos para o destino.
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* 🏢 ABA 2: ROTAER (Dados de Pista e Rádio) */}
          {abaAtiva === "rotaer" && rotaAtiva && (
            <View>
              {[rotaAtiva.origem, rotaAtiva.destino].map((aero, idx) => (
                <View key={idx} style={styles.infoCard}>
                  <Text style={styles.cardHeader}>
                    🏢 {idx === 0 ? "ORIGEM" : "DESTINO"} - {aero.icao}
                  </Text>

                  <View style={styles.gridRotaer}>
                    <View style={styles.itemRotaer}>
                      <Text style={styles.labelRotaer}>ELEVAÇÃO</Text>
                      <Text style={styles.valorRotaer}>
                        {aero?.info?.elevacao || "---"} FT
                      </Text>
                    </View>

                    <View style={styles.itemRotaer}>
                      <Text style={styles.labelRotaer}>MAIOR PISTA</Text>
                      <Text style={styles.valorRotaer}>
                        {aero?.info?.comprimento || "---"} M
                      </Text>
                    </View>
                  </View>

                  <View style={styles.linhaDivisoria} />

                  <Text style={styles.labelRotaer}>
                    📡 FREQUÊNCIAS DE COMUNICAÇÃO
                  </Text>
                  <View style={styles.freqBox}>
                    <View style={styles.freqRow}>
                      <Text style={styles.freqLabel}>TWR (Torre):</Text>
                      <Text style={styles.freqValue}>
                        {aero?.info?.freqSolo || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.freqRow}>
                      <Text style={styles.freqLabel}>GND (Solo):</Text>
                      <Text style={styles.freqValue}>
                        {aero?.info?.freqSolo || "N/A"}
                      </Text>
                    </View>
                    <View style={styles.freqRow}>
                      <Text style={styles.freqLabel}>APP (Controle):</Text>
                      <Text style={styles.freqValue}>
                        {aero?.info?.freqApp || "N/A"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
              <View style={{ height: 50 }} />
            </View>
          )}

          {/* 📚 ABA 3: CARTAS (Links de Download) */}
          {abaAtiva === "cartas" && rotaAtiva && (
            <View>
              {[rotaAtiva.origem, rotaAtiva.destino].map((aero, idx) => (
                <View key={idx} style={styles.infoCard}>
                  <Text style={styles.cardHeader}>📚 CARTAS - {aero.icao}</Text>
                  <Text style={styles.subTexto}>
                    Acesse as cartas atualizadas no portal AISWEB (DECEA):
                  </Text>

                  <View style={styles.btnGridCartas}>
                    <TouchableOpacity
                      style={styles.btnCartaItem}
                      onPress={() => abrirCartas(aero.icao)}
                    >
                      <Text style={styles.txtBtnCarta}>ADC / PDC</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnCartaItem}
                      onPress={() => abrirCartas(aero.icao)}
                    >
                      <Text style={styles.txtBtnCarta}>SID (Saída)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnCartaItem}
                      onPress={() => abrirCartas(aero.icao)}
                    >
                      <Text style={styles.txtBtnCarta}>STAR (Chegada)</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.btnCartaItem}
                      onPress={() => abrirCartas(aero.icao)}
                    >
                      <Text style={styles.txtBtnCarta}>IAC (Aprox.)</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <View style={{ height: 50 }} />
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // ... (Mantenha os estilos anteriores de bottomSheet, tabMenu, etc) ...
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    height: "75%",
    backgroundColor: "#0f172a",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 15,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderColor: "#334155",
    elevation: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  sheetTitle: { color: "#f8fafc", fontSize: 16, fontWeight: "900" },
  btnFechar: {
    backgroundColor: "#1e293b",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  txtFechar: { color: "#94a3b8", fontSize: 12, fontWeight: "bold" },
  tabMenu: {
    flexDirection: "row",
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 4,
    marginBottom: 15,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
  },
  tabBtnAtiva: { backgroundColor: "#0ea5e9" },
  tabTxt: { color: "#64748b", fontSize: 11, fontWeight: "bold" },
  tabTxtAtiva: { color: "#fff" },
  scrollSheet: { flex: 1 },
  infoCard: {
    backgroundColor: "#1e293b",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#334155",
  },
  cardHeader: {
    color: "#0ea5e9",
    fontWeight: "bold",
    marginBottom: 12,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  linhaDivisoria: { height: 1, backgroundColor: "#334155", marginVertical: 15 },

  // Estilos Clima
  icaoLabel: {
    color: "#94a3b8",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 4,
  },
  metarText: {
    color: "#4ade80",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 13,
    lineHeight: 20,
  },
  tafLabel: {
    color: "#38bdf8",
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 2,
  },
  tafText: {
    color: "#94a3b8",
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
    fontSize: 12,
    fontStyle: "italic",
  },

  // Estilos ROTAER
  gridRotaer: { flexDirection: "row", justifyContent: "space-between" },
  itemRotaer: { flex: 1 },
  labelRotaer: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  valorRotaer: { color: "#f8fafc", fontSize: 18, fontWeight: "bold" },
  freqBox: {
    backgroundColor: "#0f172a",
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
  freqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  freqLabel: { color: "#94a3b8", fontSize: 12 },
  freqValue: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "bold",
    fontFamily: "monospace",
  },

  // Estilos CARTAS
  subTexto: { color: "#94a3b8", fontSize: 12, marginBottom: 15 },
  btnGridCartas: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  btnCartaItem: {
    backgroundColor: "#0f172a",
    width: "48%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  txtBtnCarta: { color: "#0ea5e9", fontSize: 11, fontWeight: "bold" },

  loadingBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  txtLoading: { color: "#94a3b8", marginTop: 15, fontWeight: "bold" },
  notamItem: {
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    paddingBottom: 10,
    marginBottom: 10,
  },
  notamTitulo: { color: "#fbbf24", fontSize: 12, fontWeight: "bold" },
  notamCorpo: { color: "#cbd5e1", fontSize: 12, lineHeight: 18 },
});
