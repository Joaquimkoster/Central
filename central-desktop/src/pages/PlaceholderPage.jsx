function PlaceholderPage({ title }) {
  return (
    <div className="page-content">
      <h1>{title}</h1>
      <p className="subtitle">
        Essa área será desenvolvida nas próximas etapas.
      </p>

      <div className="panel">
        <h2>{title}</h2>
        <p>Conteúdo em desenvolvimento.</p>
      </div>
    </div>
  );
}

export default PlaceholderPage;