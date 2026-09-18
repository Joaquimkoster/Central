export default function ExerciseSearch({ value, onChange, resultCount }) {
  return (
    <div className="exercise-atlas-search">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Pesquisar exercícios, músculos ou grupos..."
        aria-label="Pesquisar na biblioteca de exercícios"
      />
      {value && <small>{resultCount} resultados</small>}
    </div>
  );
}
