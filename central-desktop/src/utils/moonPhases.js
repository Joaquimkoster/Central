const SYNODIC_MONTH = 29.530588853;

// Lua nova de referência:
// 6 de janeiro de 2000, aproximadamente 18:14 UTC
const REFERENCE_NEW_MOON = Date.UTC(
  2000,
  0,
  6,
  18,
  14,
  0
);

const DAY_MS = 24 * 60 * 60 * 1000;

function normalize(value, max) {
  return ((value % max) + max) % max;
}

function getMoonAge(date) {
  // Meio-dia UTC reduz problemas de mudança de dia/fuso
  const timestamp = Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
    0,
    0
  );

  const daysSinceReference =
    (timestamp - REFERENCE_NEW_MOON) / DAY_MS;

  return normalize(daysSinceReference, SYNODIC_MONTH);
}

export function getMoonPhase(dateString) {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const date = new Date(year, month - 1, day);

  const age = getMoonAge(date);

  /*
    As quatro fases principais ocorrem aproximadamente em:

    Lua Nova:          0 dias
    Quarto Crescente:  7,38 dias
    Lua Cheia:        14,77 dias
    Quarto Minguante: 22,15 dias

    Mostramos a fase somente quando o dia está
    próximo de uma dessas quatro posições.
  */

  const phases = [
    {
      age: 0,
      name: "Lua Nova",
      icon: "🌑",
    },
    {
      age: SYNODIC_MONTH / 4,
      name: "Quarto Crescente",
      icon: "🌓",
    },
    {
      age: SYNODIC_MONTH / 2,
      name: "Lua Cheia",
      icon: "🌕",
    },
    {
      age: (SYNODIC_MONTH * 3) / 4,
      name: "Quarto Minguante",
      icon: "🌗",
    },
  ];

  let closestPhase = null;
  let smallestDistance = Infinity;

  for (const phase of phases) {
    let distance = Math.abs(age - phase.age);

    // A Lua Nova fica na transição 29.5 -> 0.
    distance = Math.min(
      distance,
      SYNODIC_MONTH - distance
    );

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closestPhase = phase;
    }
  }

  // Aproximadamente meio dia de tolerância.
  // Assim cada fase tende a aparecer em apenas um dia.
  if (smallestDistance <= 0.55) {
    return closestPhase;
  }

  return null;
}

export function getMoonPhaseForDate(dateString) {
  return getMoonPhase(dateString);
}
