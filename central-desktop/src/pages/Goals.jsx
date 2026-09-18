import { useEffect, useState } from "react";
import Composer from "../components/Composer";
import Icon from "../components/Icon";
import PageHeader from "../components/PageHeader";

const API_URL = "http://100.71.224.93:8080/api/goals";

const emptyForm = {
  title: "",
  description: "",
  deadline: "",
  progress: 0,
  status: "Em andamento",
};

function maskDate(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");
}

function dateToDisplay(value) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : maskDate(value);
}

function displayToDate(value) {
  if (!value) return null;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year || year.length !== 4) return null;
  const date = new Date(`${year}-${month}-${day}T00:00:00`);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== Number(year) ||
    date.getMonth() + 1 !== Number(month) ||
    date.getDate() !== Number(day)
  ) return null;
  return `${year}-${month}-${day}`;
}

function maskProgress(value) {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return String(Math.min(100, Number(digits)));
}

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState(emptyForm);

  const [editingId, setEditingId] = useState(null);

  const [error, setError] = useState("");

  /*
   * CARREGAR OBJETIVOS
   */

  async function loadGoals() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(
          `Erro ao carregar objetivos: ${response.status}`
        );
      }

      const data = await response.json();

      setGoals(data);
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível conectar ao backend."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // A carga inicial é o efeito externo desta tela.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadGoals();
  }, []);

  /*
   * FORMULÁRIO
   */

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: name === "deadline"
        ? maskDate(value)
        : name === "progress"
          ? maskProgress(value)
          : value,
    }));
  }

  function openNewGoal() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  /*
   * SALVAR
   */

  async function saveGoal(event) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Digite um título.");
      return;
    }

    const deadline = displayToDate(form.deadline);
    if (form.deadline && !deadline) {
      setError("Digite um prazo válido no formato DD/MM/AAAA.");
      return;
    }

    try {
      setError("");

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const method = editingId
        ? "PUT"
        : "POST";

      const response = await fetch(url, {
        method,

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          title: form.title.trim(),

          description:
            form.description.trim(),

          deadline,

          progress:
            Number(form.progress),

          status:
            form.status,
        }),
      });

      if (!response.ok) {
        const message = await response.text();

        throw new Error(
          message || "Erro ao salvar objetivo."
        );
      }

      closeForm();

      await loadGoals();
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Não foi possível salvar o objetivo."
      );
    }
  }

  /*
   * EDITAR
   */

  function editGoal(goal) {
    setEditingId(goal.id);

    setForm({
      title: goal.title || "",
      description: goal.description || "",
      deadline: dateToDisplay(goal.deadline),
      progress: String(goal.progress ?? 0),
      status: goal.status || "Em andamento",
    });

    setError("");
    setShowForm(true);
  }

  /*
   * EXCLUIR
   */

  async function deleteGoal(id) {
    const confirmed = window.confirm(
      "Deseja realmente excluir este objetivo?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const response = await fetch(
        `${API_URL}/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Erro ao excluir objetivo."
        );
      }

      await loadGoals();
    } catch (err) {
      console.error(err);

      setError(
        "Não foi possível excluir o objetivo."
      );
    }
  }

  /*
   * FORMATAÇÃO
   */

  function formatDate(date) {
    if (!date) {
      return "Sem prazo";
    }

    const [year, month, day] =
      date.split("-");

    return `${day}/${month}/${year}`;
  }

  /*
   * RESUMO
   */

  const activeGoals = goals.filter(
    (goal) =>
      goal.status === "Em andamento"
  ).length;

  const completedGoals = goals.filter(
    (goal) =>
      goal.status === "Concluído"
  ).length;

  const averageProgress =
    goals.length > 0
      ? Math.round(
          goals.reduce(
            (total, goal) =>
              total + (goal.progress || 0),
            0
          ) / goals.length
        )
      : 0;

  return (
    <div className="page-content goals-page">

      {/* CABEÇALHO */}

      <PageHeader
        title="Objetivos"
        subtitle="Acompanhe suas metas e seu progresso"
        onRefresh={loadGoals}
      />

      <div className="page-toolbar goals-toolbar">
        <span className="goals-toolbar-copy">Visão geral das suas metas</span>
        <button className="primary-button" onClick={openNewGoal}>
          <Icon name="plus" size={18} />
          Novo objetivo
        </button>
      </div>

      {/* ERRO */}

      {error && (
        <div className="goal-error">
          {error}
        </div>
      )}

      {/* FORMULÁRIO */}

      <Composer
        title={editingId ? "Editar objetivo" : "Novo objetivo"}
        open={showForm}
        onClose={closeForm}
      >
        <form
          className="goal-form"
          onSubmit={saveGoal}
        >

          <label>
            Título

            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ex: Finalizar a Central"
              maxLength={150}
            />
          </label>

          <label>
            Descrição

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva seu objetivo..."
            />
          </label>

          <div className="goal-form-row">

            <label>
              Prazo

              <input
                type="text"
                name="deadline"
                value={form.deadline}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
              />
            </label>

            <label>
              Status

              <select
                name="status"
                value={form.status}
                onChange={handleChange}
              >
                <option>
                  Em andamento
                </option>

                <option>
                  Pausado
                </option>

                <option>
                  Concluído
                </option>
              </select>

            </label>

          </div>

          <label>
            Progresso
            <span className="goal-progress-input">
              <input
                type="text"
                name="progress"
                value={form.progress}
                onChange={handleChange}
                placeholder="0"
                inputMode="numeric"
                maxLength={3}
              />
              <span>%</span>
            </span>
          </label>

          <div className="goal-form-actions">

            <button
              type="button"
              className="goal-cancel-button"
              onClick={closeForm}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="goal-save-button"
            >
              {editingId
                ? "Salvar alterações"
                : "Criar objetivo"}
            </button>

          </div>

        </form>
      </Composer>

      {/* RESUMO */}

      <div className="goals-summary">

        <div className="goal-summary-card">
          <span>Objetivos</span>
          <strong>{goals.length}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Em andamento</span>
          <strong>{activeGoals}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Concluídos</span>
          <strong>{completedGoals}</strong>
        </div>

        <div className="goal-summary-card">
          <span>Progresso médio</span>
          <strong>
            {averageProgress}%
          </strong>
        </div>

      </div>

      {/* LISTA */}

      <div className="goals-section-header">

        <h2>Meus objetivos</h2>

        <span className="goals-count">
          {goals.length}
        </span>

      </div>

      {loading ? (

        <div className="goals-empty">
          <p>Carregando objetivos...</p>
        </div>

      ) : (

        <div className="goals-list">

          {goals.length === 0 ? (

            <div className="goals-empty">

              <h3>Nenhum objetivo</h3>

              <p>
                Crie seu primeiro objetivo para
                começar a acompanhar seu progresso.
              </p>

            </div>

          ) : (

            goals.map((goal) => (

              <div
                className="goal-card"
                key={goal.id}
              >

                <div className="goal-card-header">

                  <div>

                    <h3>
                      {goal.title}
                    </h3>

                    <span
                      className={`goal-status ${
                        goal.status ===
                        "Concluído"
                          ? "completed"
                          : goal.status ===
                            "Pausado"
                          ? "paused"
                          : "active"
                      }`}
                    >
                      {goal.status}
                    </span>

                  </div>

                  <div className="goal-card-actions">

                    <button
                      onClick={() =>
                        editGoal(goal)
                      }
                    >
                      Editar
                    </button>

                    <button
                      className="goal-delete-button"
                      onClick={() =>
                        deleteGoal(goal.id)
                      }
                    >
                      Excluir
                    </button>

                  </div>

                </div>

                <p className={`goal-description ${goal.description ? "" : "empty"}`}>
                  {goal.description || "Sem descrição"}
                </p>

                <div className="goal-progress-header">

                  <span>
                    Progresso
                  </span>

                  <strong>
                    {goal.progress || 0}%
                  </strong>

                </div>

                <div className="goal-progress-track">

                  <div
                    className="goal-progress-bar"
                    style={{
                      width:
                        `${goal.progress || 0}%`,
                    }}
                  />

                </div>

                <div className="goal-footer">

                  <span>Prazo</span>

                  <strong>
                    {formatDate(
                      goal.deadline
                    )}
                  </strong>

                </div>

              </div>

            ))

          )}

        </div>

      )}

    </div>
  );
}
