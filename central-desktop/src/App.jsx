import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import PlaceholderPage from "./pages/PlaceholderPage";
import Notes from "./pages/Notes";
import Tasks from "./pages/Tasks";
import Reminders from "./pages/Reminders";
import Calendar from "./pages/Calendar";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Início");

  const [revision, setRevision] = useState(0);
  const refreshPage = () => setRevision((value) => value + 1);

  const renderPage = () => {
    if (activePage === "Início") {
      return <Home onNavigate={setActivePage} onRefresh={refreshPage} />;
    }

    if (activePage === "Notas") {
      return <Notes onRefresh={refreshPage} />;
    }

    if (activePage === "Tarefas") {
      return <Tasks onRefresh={refreshPage} />;
    }

    if (activePage === "Lembretes") {
      return <Reminders onRefresh={refreshPage} />;
    }

    if (activePage === "Calendário") {
      return <Calendar onRefresh={refreshPage} />;
    }

    return <PlaceholderPage title={activePage} />;
  };

  return (
    <div className="app">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />

      <main key={`${activePage}-${revision}`} className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
