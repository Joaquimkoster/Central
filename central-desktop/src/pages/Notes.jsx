import { useEffect, useState } from "react";



function Notes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetch("http://100.71.224.93:8080/api/notes")
      .then((response) => response.json())
      .then((data) => {
        setNotes(data);
      })
      .catch((error) => {
        console.error("Erro ao carregar notas:", error);
      });
  }, []);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");



  async function addNote() {
    if (!title.trim() && !content.trim()) return;

    try {
      const response = await fetch(
        "http://100.71.224.93:8080/api/notes",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title || "Sem título",
            content: content,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao salvar nota");
      }

      const savedNote = await response.json();

      setNotes((currentNotes) => [savedNote, ...currentNotes]);

      setTitle("");
      setContent("");
    } catch (error) {
      console.error("Erro ao salvar nota:", error);
    }
  }



  async function deleteNote(id) {
    try {
      const response = await fetch(
        `http://100.71.224.93:8080/api/notes/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao excluir nota");
      }

      setNotes((currentNotes) =>
        currentNotes.filter((note) => note.id !== id)
      );
    } catch (error) {
      console.error("Erro ao excluir nota:", error);
    }
  }



  return (
    <div className="page-content">
      <h1>Notas</h1>
      <p className="subtitle">Crie e organize suas anotações.</p>

      <div className="notes-layout">
        <section className="note-editor">
          <input
            className="note-title-input"
            type="text"
            placeholder="Título da nota"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="note-content-input"
            placeholder="Escreva sua nota..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button className="primary-button" onClick={addNote}>
            Salvar nota
          </button>
        </section>

        <section className="notes-list">
          {notes.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma nota criada ainda.</p>
            </div>
          ) : (
            notes.map((note) => (
              <div className="note-card" key={note.id}>
                <div className="note-card-header">
                  <h3>{note.title}</h3>

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