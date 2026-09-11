function Home() {
  return (
    <div className="page-content">
      <h1>Início</h1>
      <p className="subtitle">Visão geral da sua Central.</p>

      <div className="cards-grid">
        <div className="card">
          <h3>Tarefas</h3>
          <strong>0</strong>
          <span>pendentes hoje</span>
        </div>

        <div className="card">
          <h3>Objetivos</h3>
          <strong>0</strong>
          <span>em andamento</span>
        </div>

        <div className="card">
          <h3>Estudos</h3>
          <strong>0 min</strong>
          <span>hoje</span>
        </div>

        <div className="card">
          <h3>Sono</h3>
          <strong>--</strong>
          <span>última noite</span>
        </div>
      </div>

      <div className="dashboard-grid">
        <section className="panel">
          <h2>Hoje</h2>
          <p>Nenhuma tarefa cadastrada.</p>
        </section>

        <section className="panel">
          <h2>Darly</h2>
          <p>Seu assistente estará disponível aqui.</p>
          <button className="primary-button">Abrir Darly</button>
        </section>
      </div>
    </div>
  );
}

export default Home;