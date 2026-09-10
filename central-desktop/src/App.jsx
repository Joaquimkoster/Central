import { useState } from "react";
import "./App.css";

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

function App() {
  const [activePage, setActivePage] = useState("Início");

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="logo">Central</div>

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

      <main className="content">
        <header className="topbar">
          <h1>{activePage}</h1>
        </header>

        <section className="page">
          <h2>{activePage}</h2>
          <p>Área da Central: {activePage}</p>
        </section>
      </main>
    </div>
  );
}

export default App;