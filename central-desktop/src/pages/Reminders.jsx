import { maskBrazilianDate, maskTime, toISODate } from "../utils/date";
import PageHeader from "../components/PageHeader";
import Composer from "../components/Composer";
import Icon from "../components/Icon";
import Segments from "../components/Segments";
import { useEffect, useState } from "react";

const API_URL = "http://100.71.224.93:8080/api/reminders";

export default function Reminders({ onRefresh }) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todos");

  const [reminders, setReminders] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);

  async function addReminder() {
    if (!title.trim()) return;

    const isoDate = toISODate(date);
    if (date && !isoDate) {
      setError("Informe uma data válida no formato DD/MM/AAAA.");
      return;
    }
    if ((date && !time) || (!date && time)) {
      setError("Preencha a data e o horário, ou deixe os dois em branco.");
      return;
    }
    if (time && !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) {
      setError("Informe um horário válido no formato HH:MM.");
      return;
    }

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
          dateTime: isoDate && time ? `${isoDate}T${time}` : null,
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const savedReminder = await response.json();

      setReminders((current) => [savedReminder, ...current]);

      setEditorOpen(false);
      setTitle("");
      setDescription("");
      setDate("");
      setTime("");
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao criar lembrete:", error);
    }
  }

  async function toggleReminder(id) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const updatedReminder = await response.json();

      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === id ? updatedReminder : reminder,
        ),
      );
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao atualizar lembrete:", error);
    }
  }

  async function deleteReminder(id) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      setReminders((current) =>
        current.filter((reminder) => reminder.id !== id),
      );
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.error("Erro ao excluir lembrete:", error);
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
        if (active) setReminders(data);
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

  const visibleItems = reminders.filter((reminder) => {
    if (filter === "Todos") return true;
    if (!reminder.dateTime || reminder.completed) return false;
    const date = new Date(reminder.dateTime);
    return filter === "Hoje"
      ? date.toDateString() === new Date().toDateString()
      : date > new Date();
  });

  return (
    <div className="page-content">
      <PageHeader
        onRefresh={onRefresh}
        title="Lembretes"
        subtitle="Nunca mais esqueça"
      />
      <div className="page-toolbar">
        <Segments
          options={["Hoje", "Próximos", "Todos"]}
          value={filter}
          onChange={setFilter}
        />
        <button className="primary-button" onClick={() => setEditorOpen(true)}>
          <Icon name="plus" size={18} />
          Novo lembrete
        </button>
      </div>
      {!!error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}

      <Composer
        title="Novo lembrete"
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
      >
        {!!error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
        <div className="reminder-editor">
          <input
            type="text"
            placeholder="Título do lembrete"
            aria-label="Título do lembrete"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />

          <textarea
            placeholder="Descrição..."
            aria-label="Descrição..."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />

          <div className="reminder-date-row">
            <input
              type="text"
              inputMode="numeric"
              maxLength={10}
              placeholder="DD/MM/AAAA"
              aria-label="Data do lembrete (DD/MM/AAAA)"
              value={date}
              onChange={(event) =>
                setDate(maskBrazilianDate(event.target.value, date))
              }
            />

            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="HH:MM"
              aria-label="Horário do lembrete (HH:MM)"
              value={time}
              onChange={(event) => setTime(maskTime(event.target.value, time))}
            />
          </div>

          <button onClick={addReminder}>Adicionar lembrete</button>
        </div>
      </Composer>
      <div className="reminder-list">
        {loading ? (
          <p className="empty-text">Carregando lembretes...</p>
        ) : visibleItems.length === 0 ? (
          <p className="empty-text">Nenhum lembrete neste filtro.</p>
        ) : (
          visibleItems.map((reminder) => (
            <div
              key={reminder.id}
              className={`reminder-card ${
                reminder.completed ? "reminder-completed" : ""
              }`}
            >
              <button
                className="reminder-check"
                aria-label={`Marcar ${reminder.title} como ${reminder.completed ? "pendente" : "concluído"}`}
                aria-pressed={reminder.completed}
                onClick={() => toggleReminder(reminder.id)}
              >
                {reminder.completed ? "✓" : <Icon name="bell" size={18} />}
              </button>

              <div className="reminder-info">
                <h3>{reminder.title}</h3>

                {reminder.description && <p>{reminder.description}</p>}

                {reminder.dateTime && (
                  <span>
                    {new Date(reminder.dateTime).toLocaleString("pt-BR")}
                  </span>
                )}
              </div>

              <button
                className="reminder-delete"
                onClick={() => deleteReminder(reminder.id)}
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
