const muscleNames = (exercise, role, emphasized = false) => (exercise?.muscles || [])
  .filter((item) => emphasized ? item.emphasis : item.role === role && !item.emphasis)
  .map((item) => item.name)
  .join(", ");

export default function ExerciseDetails({ exercise, loading, error, onRetry, onClose }) {
  if (!exercise && !loading && !error) return null;
  return (
    <div className="exercise-details-overlay" role="presentation" onMouseDown={onClose}>
      <article className="exercise-details-panel" role="dialog" aria-modal="true" aria-labelledby="exercise-details-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>Detalhes do exercício</span><h3 id="exercise-details-title">{exercise?.name || "Carregando..."}</h3></div><button type="button" onClick={onClose} aria-label="Fechar">×</button></header>
        {loading ? <div className="workout-empty"><p>Carregando detalhes...</p></div> : error ? <div className="workout-empty"><h3>Erro ao carregar</h3><p>{error}</p><button className="workout-secondary-button" onClick={onRetry}>Tentar novamente</button></div> : <>
        <div className="exercise-media-placeholder"><span>Espaço reservado para imagem ou animação</span></div>
        <p>{exercise.description || "Descrição detalhada disponível futuramente."}</p>
        <dl className="exercise-details-list">
          <div><dt>Equipamento</dt><dd>{exercise.equipment}</dd></div>
          <div><dt>Músculos primários</dt><dd>{muscleNames(exercise, "PRIMARY") || "Não informado"}</dd></div>
          <div><dt>Músculos secundários</dt><dd>{muscleNames(exercise, "SECONDARY") || "Nenhum informado"}</dd></div>
          <div><dt>Ênfases</dt><dd>{muscleNames(exercise, null, true) || "Nenhuma informada"}</dd></div>
        </dl>
        <div className="exercise-future-blocks"><span>Instruções de execução</span><span>Erros comuns</span><span>Séries recomendadas</span></div></>}
      </article>
    </div>
  );
}
