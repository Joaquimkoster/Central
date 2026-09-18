const byRole = (exercise, role) => (exercise.muscles || []).filter((item) => item.role === role && !item.emphasis);
const emphasis = (exercise) => (exercise.muscles || []).filter((item) => item.emphasis);
const names = (items) => items.map((item) => item.name).join(", ");

export default function ExerciseCard({ exercise, relation, onOpen }) {
  return (
    <button type="button" className="exercise-atlas-card" onClick={() => onOpen(exercise)}>
      <span className="exercise-atlas-card-top">
        <span>
          <strong>{exercise.name}</strong>
          <small>{exercise.muscleGroup || exercise.muscles?.[0]?.muscleGroupName || "Exercício"}</small>
        </span>
        {relation && <em className={`muscle-role ${relation.toLowerCase()}`}>{relation}</em>}
      </span>
      <span className="exercise-atlas-meta"><i>Primários</i><b>{names(byRole(exercise, "PRIMARY")) || "Consulte os detalhes"}</b></span>
      {!!byRole(exercise, "SECONDARY").length && <span className="exercise-atlas-meta"><i>Secundários</i><b>{names(byRole(exercise, "SECONDARY"))}</b></span>}
      {!!emphasis(exercise).length && <span className="exercise-atlas-meta"><i>Ênfase</i><b>{names(emphasis(exercise))}</b></span>}
      <span className="exercise-equipment">{exercise.equipment || "Equipamento não informado"}</span>
    </button>
  );
}
