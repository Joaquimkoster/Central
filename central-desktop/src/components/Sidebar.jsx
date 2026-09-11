const menuItems = [
  "Início",
  "Notas",
  "Tarefas",
  "Lembretes",
  "Calendário",
  "Objetivos",
  "Treinos",
  "Estudos",
  "Tempo de tela",
  "Controle de vícios",
  "Diário",
  "Sono",
  "Controle do PC",
  "Darly",
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Central</h2>
        <span>Pessoal</span>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item}
            className={activePage === item ? "menu-item active" : "menu-item"}
            onClick={() => setActivePage(item)}
          >
            {item}
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;