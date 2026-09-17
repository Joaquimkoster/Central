export default function Segments({ options, value, onChange }) {
  return (
    <div className="segments" aria-label="Filtrar lista">
      {options.map((option) => (
        <button
          key={option}
          aria-pressed={value === option}
          className={value === option ? "selected" : ""}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
