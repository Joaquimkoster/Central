import PageHeader from "../components/PageHeader";
import Composer from "../components/Composer";
import Icon from "../components/Icon";
import Segments from "../components/Segments";
import { useEffect, useState } from "react";

const API_URL = "http://100.71.224.93:8080/api/tasks";

export default function Tasks({ onRefresh }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todas");

  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function addTask() {
    if (!title.trim()) return;

    try {
      setError("");
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const savedTask = await response.json();

      setTasks((current) => [savedTask, ...current]);

      setEditorOpen(false);
      setTitle("");
      setDescription("");
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao criar tarefa:", error);
    }
  }

  async function toggleTask(id) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const updatedTask = await response.json();

      setTasks((current) =>
        current.map((task) => (task.id === id ? updatedTask : task)),
      );
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao atualizar tarefa:", error);
    }
  }

  async function deleteTask(id) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      setTasks((current) => current.filter((task) => task.id !== id));
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao excluir tarefa:", error);
    }
  }

  useEffect(() => {
    let active = true;
    fetch(API_URL)
      .then((response) => {
        if (!response.ok) throw new Error("Erro ao carregar dados");
        return response.json();
      })
      .then((data) => {
        if (active) setTasks(data);
      })
      .catch(() => {
        if (active)
          setError(
            "Não foi possível carregar os dados. Verifique sua conexão.",
          );
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const visibleItems = tasks.filter(
    (task) =>
      filter === "Todas" ||
      (filter === "Concluídas" ? task.completed : !task.completed),
  );

  return (
    <div className="page-content">
      <PageHeader
        onRefresh={onRefresh}
        title="Tarefas"
        subtitle="Organize e faça acontecer"
      />
      <div className="page-toolbar">
        <Segments
          options={["Todas", "Pendentes", "Concluídas"]}
          value={filter}
          onChange={setFilter}
        />
        <button className="primary-button" onClick={() => setEditorOpen(true)}>
          <Icon name="plus" size={18} />
          Nova tarefa
        </button>
      </div>
      {!!error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      <Composer
        title="Nova tarefa"
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      >
        {!!error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="task-editor">
          <input
            type="text"
            placeholder="Título da tarefa"
            aria-label="Título da tarefa"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <textarea
            placeholder="Descrição da tarefa..."
            aria-label="Descrição da tarefa..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <button onClick={addTask}>Adicionar tarefa</button>
        </div>
      </Composer>
      <div className="task-list">
        {loading ? (
          <p className="empty-text">Carregando tarefas...</p>
        ) : visibleItems.length === 0 ? (
          <p className="empty-text">Nenhuma tarefa neste filtro.</p>
        ) : (
          visibleItems.map((task) => (
            <div
              key={task.id}
              className={`task-card ${task.completed ? "task-completed" : ""}`}
            >
              <button
                className="task-check"
                aria-label={`Marcar ${task.title} como ${task.completed ? "pendente" : "concluído"}`}
                aria-pressed={task.completed}
                onClick={() => toggleTask(task.id)}
              >
                {task.completed ? "✓" : ""}
              </button>

              <div className="task-info">
                <h3>{task.title}</h3>

                {task.description && <p>{task.description}</p>}
              </div>

              <button
                className="task-delete"
                onClick={() => deleteTask(task.id)}
              >
                Excluir
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
