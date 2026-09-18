export default function MuscleRegionGrid({ regions, onSelect }) {
  return (
    <div className="muscle-region-grid">
      {regions.map((region) => {
        const icon = ({ CHEST: "CH", BACK: "CO", SHOULDERS: "OM", ARMS: "BR", LEGS: "PE", CORE: "CR" })[region.code] || region.name.slice(0, 2).toUpperCase();
        return (
          <button key={region.id} type="button" className="muscle-region-card" onClick={() => onSelect(region)}>
            <span className="muscle-region-icon">{icon}</span>
            <span className="muscle-region-copy">
              <strong>{region.name}</strong>
              {region.description && <small>{region.description}</small>}
              {region.muscleGroupCount != null && <small>{region.muscleGroupCount} grupos musculares</small>}
              {region.exerciseCount != null && <small>{region.exerciseCount} exercícios relacionados</small>}
            </span>
            <span className="muscle-region-arrow">›</span>
          </button>
        );
      })}
    </div>
  );
}
