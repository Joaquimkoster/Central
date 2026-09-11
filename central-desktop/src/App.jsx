import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import PlaceholderPage from "./pages/PlaceholderPage";
import Notes from "./pages/Notes";
import "./App.css";

function App() {
  const [activePage, setActivePage] = useState("Início");

  const renderPage = () => {
    if (activePage === "Início") {
      return <Home />;
    }

    if (activePage === "Notas") {
      return <Notes />;
    }

    return <PlaceholderPage title={activePage} />;
  };

  return (
    <div className="app">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
      />

      <main className="main-content">
        {renderPage()}
      </main>
    </div>
  );
}

export default App;