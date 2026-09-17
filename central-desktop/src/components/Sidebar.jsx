import Icon from "./Icon";
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

const icons = {
  Início: "home",
  Notas: "notes",
  Tarefas: "tasks",
  Lembretes: "bell",
  Calendário: "calendar",
  Estudos: "book",
  Diário: "notes",
  Sono: "moon",
  "Tempo de tela": "clock",
  "Controle do PC": "pc",
  Darly: "bot",
};

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Central</h2>
        <span>Sua central pessoal</span>
      </div>

      <nav className="menu">
        {menuItems.map((item) => (
          <button
            key={item}
            aria-current={activePage === item ? "page" : undefined}
            className={activePage === item ? "menu-item active" : "menu-item"}
            onClick={() => setActivePage(item)}
          >
            <Icon name={icons[item] || "goal"} />
            <span>{item}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
