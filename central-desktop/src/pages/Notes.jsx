import PageHeader from "../components/PageHeader";
import Composer from "../components/Composer";
import Icon from "../components/Icon";
import { useEffect, useState } from "react";

function Notes({ onRefresh }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("http://100.71.224.93:8080/api/notes")
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar notas");
        return response.json();
      })
      .then((data) => {
        setNotes(data);
      })
      .catch((error) => {
        setError(
          "Não foi possível carregar suas notas. Verifique sua conexão.",
        );
        console.error("Erro ao carregar notas:", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function addNote() {
    if (!title.trim() && !content.trim()) return;

    try {
      setError("");
      const response = await fetch("http://100.71.224.93:8080/api/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title || "Sem título",
          content: content,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar nota");
      }

      const savedNote = await response.json();

      setNotes((currentNotes) => [savedNote, ...currentNotes]);

      setEditorOpen(false);
      setTitle("");
      setContent("");
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao salvar nota:", error);
    }
  }

  async function deleteNote(id) {
    try {
      setError("");
      const response = await fetch(
        `http://100.71.224.93:8080/api/notes/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir nota");
      }

      setNotes((currentNotes) => currentNotes.filter((note) => note.id !== id));
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao excluir nota:", error);
    }
  }

  const visibleItems = notes.filter((note) =>
    `${note.title} ${note.content}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  );

  return (
    <div className="page-content">
      <PageHeader
        onRefresh={onRefresh}
        title="Notas"
        subtitle="Suas ideias, em um só lugar"
      />
      <div className="page-toolbar">
        <label className="search-field">
          <Icon name="search" size={18} />
          <input
            aria-label="Buscar notas"
            placeholder="Buscar notas..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button className="primary-button" onClick={() => setEditorOpen(true)}>
          <Icon name="plus" size={18} />
          Nova nota
        </button>
      </div>
      {!!error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      <div className="notes-layout">
        <Composer
          title="Nova nota"
          open={editorOpen}
          onClose={() => setEditorOpen(false)}
        >
          {!!error && (
            <p role="alert" className="error-message">
              {error}
            </p>
          )}
          <section className="note-editor">
            <input
              className="note-title-input"
              type="text"
              placeholder="Título da nota"
              aria-label="Título da nota"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <textarea
              className="note-content-input"
              placeholder="Escreva sua nota..."
              aria-label="Escreva sua nota..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button className="primary-button" onClick={addNote}>
              Salvar nota
            </button>
          </section>
        </Composer>
        <section className="notes-list">
          {loading ? (
            <p className="empty-text">Carregando notas...</p>
          ) : visibleItems.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma nota encontrada.</p>
            </div>
          ) : (
            visibleItems.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-card-header">
                  <h3>
                    <Icon name="notes" />
                    {note.title}
                  </h3>

                  <button
                    className="delete-button"
                    onClick={() => deleteNote(note.id)}
                  >
                    Excluir
                  </button>
                </div>

                <p>{note.content}</p>
              </div>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

export default Notes;
