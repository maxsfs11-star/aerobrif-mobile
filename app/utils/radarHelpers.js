// 🧠 O Cérebro Tradutor baseado em Física de Voo
export function classificarAeronavePorFisica(altitude, velocidade) {
  // Garantindo que temos os números
  const alt = Number(altitude) || 0;
  const vel = Number(velocidade) || 0;

  // 🚁 Regra do Helicóptero: Voando baixo e devagar
  if (alt < 4000 && vel < 130) {
    return "helicoptero";
  }

  // 🛩️ Regra do Teco-Teco / Turboélice: Altitude e velocidade médias
  if (alt < 15000 && vel < 250) {
    return "teco-teco";
  }

  // ✈️ Regra do Jato: Se está alto ou rápido, é jato comercial!
  return "jato";
}
