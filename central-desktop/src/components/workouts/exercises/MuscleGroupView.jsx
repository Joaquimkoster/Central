export default function MuscleGroupView({ region, groups, group, muscles, onSelectGroup, onSelectMuscle, onBack }) {
  if (group) {
    const regionName = region?.name || group.bodyRegionName || "grupos musculares";
    return (
      <section className="muscle-level-view">
        <button type="button" className="muscle-back-button" onClick={onBack}>← Voltar para {regionName}</button>
        <div className="muscle-view-heading">
          <span>{regionName}</span>
          <h3>{group.name}</h3>
          <p>{group.description}</p>
        </div>
        <div className="muscle-subgroup-grid">
          {muscles.map((muscle) => (
            <button key={muscle.id} type="button" className={muscle.parentMuscleId ? "muscle-child-item" : ""} onClick={() => onSelectMuscle(muscle)}>
              <span><strong>{muscle.name}</strong><small>{muscle.description || (muscle.parentMuscleId ? "Subdivisão muscular" : "Músculo")}</small></span>
              <i>›</i>
            </button>
          ))}
          {!muscles.length && <div className="workout-exercises-empty">Nenhum músculo encontrado neste grupo.</div>}
        </div>
      </section>
    );
  }

  return (
    <section className="muscle-level-view">
      <button type="button" className="muscle-back-button" onClick={onBack}>← Todas as regiões</button>
      <div className="muscle-view-heading">
        <span>Região corporal</span>
        <h3>{region.name}</h3>
        <p>{region.description}</p>
      </div>
      <div className="muscle-subgroup-grid">
        {groups.map((item) => (
          <button key={item.id} type="button" onClick={() => onSelectGroup(item)}>
            <span><strong>{item.name}</strong><small>{item.description || "Ver músculos deste grupo"}</small></span>
            <i>›</i>
          </button>
        ))}
        {!groups.length && <div className="workout-exercises-empty">Nenhum grupo muscular encontrado nesta região.</div>}
      </div>
    </section>
  );
}
