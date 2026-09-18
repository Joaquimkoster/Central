const paths = {
  refresh: "M20 4v6h-6 M20 10a8 8 0 1 0 0 5",
  home: "M3 11 L12 3 L21 11 M5 10 L5 21 L10 21 L10 15 L14 15 L14 21 L19 21 L19 10",
  notes:
    "M6 3 L15 3 L19 7 L19 21 L6 21 L6 3 M14 3 L14 8 L19 8 M9 12 L16 12 M9 16 L16 16",
  tasks: "M20 12 L20 20 L4 20 L4 4 L13 4 M8 10 L12 14 L21 4",
  bell: "M5 17 L7 14 L7 8 L9 5 L15 5 L17 8 L17 14 L19 17 L5 17 M10 20 L14 20 M12 3 L12 5",
  calendar: "M4 5 L20 5 L20 21 L4 21 L4 5 M4 10 L20 10 M8 3 L8 7 M16 3 L16 7",
  goal: "M12 3 L20 7 L20 15 L12 21 L4 15 L4 7 L12 3 M8 12 L11 15 L17 8",
  workout: "M6 9 L6 15 M3 10 L3 14 M6 12 L18 12 M18 9 L18 15 M21 10 L21 14",
  book: "M12 6 L5 4 L3 5 L3 19 L6 18 L12 20 L18 18 L21 19 L21 5 L19 4 L12 6 L12 20",
  clock:
    "M12 3 L18 5 L21 12 L18 19 L12 21 L5 18 L3 12 L5 5 L12 3 M12 7 L12 12 L16 14",
  moon: "M10 3 L6 5 L3 11 L5 17 L10 21 L17 20 L21 15 L15 16 L10 12 L9 7 L10 3",
  pc: "M3 4 L21 4 L21 17 L3 17 L3 4 M12 17 L12 21 M8 21 L16 21",
  bot: "M5 7 L19 7 L21 9 L21 19 L3 19 L3 9 L5 7 M12 3 L12 7 M8 11 L8 13 M16 11 L16 13 M9 16 L15 16",
  chevron: "M9 5 L16 12 L9 19",
  plus: "M12 5 L12 19 M5 12 L19 12",
  search:
    "M10 3 L15 5 L17 10 L15 15 L10 17 L5 15 L3 10 L5 5 L10 3 M16 16 L21 21",
};
export default function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.notes} />
    </svg>
  );
}
