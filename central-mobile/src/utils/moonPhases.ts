const SYNODIC_MONTH = 29.530588853;
const DAY_MS = 86400000;

const REFERENCE_NEW_MOON = Date.UTC(
  2000,
  0,
  6,
  18,
  14
);

export type MoonPhase = {
  name: string;
  icon: string;
};

function normalize(value: number, max: number) {
  return ((value % max) + max) % max;
}

export function getMoonPhase(
  dateString: string
): MoonPhase | null {
  const [year, month, day] = dateString
    .split("-")
    .map(Number);

  const timestamp = Date.UTC(
    year,
    month - 1,
    day,
    12
  );

  const days =
    (timestamp - REFERENCE_NEW_MOON) / DAY_MS;

  const age = normalize(days, SYNODIC_MONTH);

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

  let closest: (typeof phases)[number] | null = null;
  let smallestDistance = Infinity;

  for (const phase of phases) {
    let distance = Math.abs(age - phase.age);

    distance = Math.min(
      distance,
      SYNODIC_MONTH - distance
    );

    if (distance < smallestDistance) {
      smallestDistance = distance;
      closest = phase;
    }
  }

  if (smallestDistance <= 0.55 && closest) {
    return {
      name: closest.name,
      icon: closest.icon,
    };
  }

  return null;
}
