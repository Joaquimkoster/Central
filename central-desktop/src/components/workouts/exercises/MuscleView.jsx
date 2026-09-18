import ExerciseCard from "./ExerciseCard";

export default function MuscleView({ muscle, region, group, exercises, loading, error, onRetry, onOpenExercise, onBack }) {
  return (
    <section className="muscle-level-view">
      <button type="button" className="muscle-back-button" onClick={onBack}>← Voltar</button>
      <div className="muscle-profile">
        <span className="muscle-profile-label">{region?.name || "Músculo"}</span>
        <h3>{muscle.name}</h3>
        <div className="muscle-profile-path">{group?.name && group.name !== muscle.name ? `${group.name} · ` : ""}{region?.name || muscle.muscleGroupName || ""}</div>
        <p>{muscle.description}</p>
        <small>Os movimentos abaixo podem recrutar várias regiões. “Ênfase” não significa isolamento muscular.</small>
      </div>
      <div className="exercise-result-heading"><h4>Exercícios relacionados</h4><span>{exercises.length}</span></div>
      {loading ? <div className="workout-empty"><p>Carregando exercícios...</p></div>
        : error ? <div className="workout-empty"><h3>Não foi possível carregar os exercícios</h3><p>{error}</p><button className="workout-secondary-button" onClick={onRetry}>Tentar novamente</button></div>
          : exercises.length ? <div className="exercise-atlas-grid">{exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} relation="PRIMÁRIO" onOpen={onOpenExercise} />)}</div>
            : <div className="workout-empty"><h3>Nenhum exercício primário</h3><p>A API não retornou exercícios primários para este músculo.</p></div>}
    </section>
  );
}
