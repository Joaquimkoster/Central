import { useState } from "react";
import PageHeader from "../components/PageHeader";
import ExerciseLibrary from "../components/workouts/exercises/ExerciseLibrary";

const tabs = [
  "Meu Treino",
  "Exercícios",
  "Frequência",
  "Progresso",
  "Fotos",
  "Recordes",
];

export default function Workouts({ onRefresh }) {
  const [activeTab, setActiveTab] = useState("Meu Treino");
  const [workouts, setWorkouts] = useState([]);

  return (
    <div className="page-content workouts-page">
      <PageHeader
        title="Treinos"
        subtitle="Acompanhe seus treinos, evolução e desempenho"
        onRefresh={onRefresh}
      />

      <div className="workout-tabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "workout-tab active"
                : "workout-tab"
            }
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="workout-content">

        {activeTab === "Meu Treino" && (
          <MyWorkout workouts={workouts} setWorkouts={setWorkouts} />
        )}

        {activeTab === "Exercícios" && (
          <Exercises />
        )}

        {activeTab === "Frequência" && (
          <Frequency />
        )}

        {activeTab === "Progresso" && (
          <Progress />
        )}

        {activeTab === "Fotos" && (
          <Photos />
        )}

        {activeTab === "Recordes" && (
          <Records />
        )}

      </div>
    </div>
  );
}


/* =========================
   MEU TREINO
========================= */

const emptyWorkout = { name: "", description: "" };
const emptyExercise = {
  name: "",
  sets: "",
  reps: "",
  weight: "",
  rest: "",
  notes: "",
};

function createId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function MyWorkout({ workouts, setWorkouts }) {
  const [workoutEditor, setWorkoutEditor] = useState(null);
  const [exerciseEditor, setExerciseEditor] = useState(null);
  const [expandedWorkouts, setExpandedWorkouts] = useState([]);

  function openNewWorkout() {
    setWorkoutEditor({ id: null, values: { ...emptyWorkout } });
    setExerciseEditor(null);
  }

  function editWorkout(workout) {
    setWorkoutEditor({
      id: workout.id,
      values: { name: workout.name, description: workout.description },
    });
    setExerciseEditor(null);
  }

  function updateWorkoutField(event) {
    const { name, value } = event.target;
    setWorkoutEditor((current) => ({
      ...current,
      values: { ...current.values, [name]: value },
    }));
  }

  function saveWorkout(event) {
    event.preventDefault();
    const name = workoutEditor.values.name.trim();
    if (!name) return;

    if (workoutEditor.id) {
      setWorkouts((current) =>
        current.map((workout) =>
          workout.id === workoutEditor.id
            ? {
                ...workout,
                name,
                description: workoutEditor.values.description.trim(),
              }
            : workout,
        ),
      );
    } else {
      const id = createId();
      setWorkouts((current) => [
        ...current,
        {
          id,
          name,
          description: workoutEditor.values.description.trim(),
          exercises: [],
        },
      ]);
      setExpandedWorkouts((current) => [...current, id]);
    }

    setWorkoutEditor(null);
  }

  function removeWorkout(workout) {
    if (!window.confirm(`Excluir o treino “${workout.name}”?`)) return;
    setWorkouts((current) => current.filter((item) => item.id !== workout.id));
    setExpandedWorkouts((current) => current.filter((id) => id !== workout.id));
    setExerciseEditor(null);
  }

  function openNewExercise(workoutId) {
    setExerciseEditor({ workoutId, id: null, values: { ...emptyExercise } });
    setWorkoutEditor(null);
    setExpandedWorkouts((current) =>
      current.includes(workoutId) ? current : [...current, workoutId],
    );
  }

  function editExercise(workoutId, exercise) {
    setExerciseEditor({
      workoutId,
      id: exercise.id,
      values: {
        name: exercise.name,
        sets: String(exercise.sets),
        reps: String(exercise.reps),
        weight: String(exercise.weight),
        rest: String(exercise.rest),
        notes: exercise.notes,
      },
    });
    setWorkoutEditor(null);
  }

  function updateExerciseField(event) {
    const { name, value } = event.target;
    setExerciseEditor((current) => ({
      ...current,
      values: { ...current.values, [name]: value },
    }));
  }

  function saveExercise(event) {
    event.preventDefault();
    const values = exerciseEditor.values;
    const exercise = {
      id: exerciseEditor.id || createId(),
      name: values.name.trim(),
      sets: Number(values.sets),
      reps: Number(values.reps),
      weight: Number(values.weight),
      rest: Number(values.rest),
      notes: values.notes.trim(),
    };
    if (!exercise.name) return;

    setWorkouts((current) =>
      current.map((workout) => {
        if (workout.id !== exerciseEditor.workoutId) return workout;
        const exercises = exerciseEditor.id
          ? workout.exercises.map((item) =>
              item.id === exerciseEditor.id ? exercise : item,
            )
          : [...workout.exercises, exercise];
        return { ...workout, exercises };
      }),
    );
    setExerciseEditor(null);
  }

  function removeExercise(workoutId, exercise) {
    if (!window.confirm(`Excluir o exercício “${exercise.name}”?`)) return;
    setWorkouts((current) =>
      current.map((workout) =>
        workout.id === workoutId
          ? {
              ...workout,
              exercises: workout.exercises.filter((item) => item.id !== exercise.id),
            }
          : workout,
      ),
    );
    if (exerciseEditor?.id === exercise.id) setExerciseEditor(null);
  }

  function toggleWorkout(id) {
    setExpandedWorkouts((current) =>
      current.includes(id)
        ? current.filter((workoutId) => workoutId !== id)
        : [...current, id],
    );
  }

  return (
    <div className="my-workout">
      <div className="workout-section-header">
        <div>
          <h2>Meu Treino</h2>
          <p>
            Organize sua rotina atual de treinamento.
          </p>
        </div>

        <button className="workout-primary-button" onClick={openNewWorkout}>
          + Criar treino
        </button>
      </div>

      {workoutEditor && (
        <form className="workout-form" onSubmit={saveWorkout}>
          <div className="workout-form-heading">
            <h3>{workoutEditor.id ? "Editar treino" : "Novo treino"}</h3>
            <span>Os campos com * são obrigatórios.</span>
          </div>
          <label>
            Nome do treino *
            <input
              name="name"
              value={workoutEditor.values.name}
              onChange={updateWorkoutField}
              placeholder="Ex.: Treino A — Peito e Tríceps"
              autoFocus
              required
            />
          </label>
          <label>
            Descrição
            <textarea
              name="description"
              value={workoutEditor.values.description}
              onChange={updateWorkoutField}
              placeholder="Objetivo ou detalhes desta rotina (opcional)"
              rows="3"
            />
          </label>
          <div className="workout-form-actions">
            <button type="button" className="workout-secondary-button" onClick={() => setWorkoutEditor(null)}>
              Cancelar
            </button>
            <button type="submit" className="workout-primary-button">
              {workoutEditor.id ? "Salvar alterações" : "Criar treino"}
            </button>
          </div>
        </form>
      )}

      {workouts.length === 0 && !workoutEditor ? (
        <div className="workout-empty">
          <h3>Nenhum treino cadastrado</h3>
          <p>Crie seu primeiro treino para começar.</p>
        </div>
      ) : (
        <div className="workout-card-list">
          {workouts.map((workout) => {
            const expanded = expandedWorkouts.includes(workout.id);
            return (
              <article className="workout-routine-card" key={workout.id}>
                <div className="workout-routine-header">
                  <button
                    type="button"
                    className="workout-expand-button"
                    onClick={() => toggleWorkout(workout.id)}
                    aria-expanded={expanded}
                  >
                    <span className="workout-chevron">{expanded ? "⌄" : "›"}</span>
                    <span>
                      <strong>{workout.name}</strong>
                      <small>
                        {workout.exercises.length} {workout.exercises.length === 1 ? "exercício" : "exercícios"}
                      </small>
                    </span>
                  </button>
                  <div className="workout-card-actions">
                    <button type="button" onClick={() => editWorkout(workout)}>Editar</button>
                    <button type="button" className="danger" onClick={() => removeWorkout(workout)}>Excluir</button>
                  </div>
                </div>

                {expanded && (
                  <div className="workout-routine-body">
                    {workout.description && <p className="workout-description">{workout.description}</p>}

                    <div className="workout-exercise-toolbar">
                      <h4>Exercícios</h4>
                      <button type="button" className="workout-secondary-button" onClick={() => openNewExercise(workout.id)}>
                        + Adicionar exercício
                      </button>
                    </div>

                    {exerciseEditor?.workoutId === workout.id && (
                      <ExerciseForm
                        editor={exerciseEditor}
                        onChange={updateExerciseField}
                        onSubmit={saveExercise}
                        onCancel={() => setExerciseEditor(null)}
                      />
                    )}

                    {workout.exercises.length === 0 ? (
                      <div className="workout-exercises-empty">Nenhum exercício adicionado.</div>
                    ) : (
                      <div className="workout-exercise-list">
                        {workout.exercises.map((exercise) => (
                          <div className="workout-exercise-row" key={exercise.id}>
                            <div className="workout-exercise-name">
                              <strong>{exercise.name}</strong>
                              {exercise.notes && <span>{exercise.notes}</span>}
                            </div>
                            <div className="workout-exercise-stat">
                              <span>Séries × repetições</span>
                              <strong>{exercise.sets} × {exercise.reps}</strong>
                            </div>
                            <div className="workout-exercise-stat">
                              <span>Carga</span>
                              <strong>{exercise.weight} kg</strong>
                            </div>
                            <div className="workout-exercise-stat">
                              <span>Descanso</span>
                              <strong>{exercise.rest}s</strong>
                            </div>
                            <div className="workout-exercise-actions">
                              <button type="button" onClick={() => editExercise(workout.id, exercise)}>Editar</button>
                              <button type="button" className="danger" onClick={() => removeExercise(workout.id, exercise)}>Excluir</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExerciseForm({ editor, onChange, onSubmit, onCancel }) {
  return (
    <form className="workout-form exercise-form" onSubmit={onSubmit}>
      <div className="workout-form-heading">
        <h3>{editor.id ? "Editar exercício" : "Novo exercício"}</h3>
        <span>Preencha os dados da execução.</span>
      </div>
      <label className="exercise-name-field">
        Nome *
        <input name="name" value={editor.values.name} onChange={onChange} placeholder="Ex.: Supino reto" autoFocus required />
      </label>
      <div className="exercise-number-fields">
        <label>Séries *<input type="number" name="sets" value={editor.values.sets} onChange={onChange} min="1" step="1" required /></label>
        <label>Repetições *<input type="number" name="reps" value={editor.values.reps} onChange={onChange} min="1" step="1" required /></label>
        <label>Carga (kg) *<input type="number" name="weight" value={editor.values.weight} onChange={onChange} min="0" step="0.5" required /></label>
        <label>Descanso (s) *<input type="number" name="rest" value={editor.values.rest} onChange={onChange} min="0" step="1" required /></label>
      </div>
      <label>
        Observação
        <textarea name="notes" value={editor.values.notes} onChange={onChange} placeholder="Ex.: Controlar a descida (opcional)" rows="2" />
      </label>
      <div className="workout-form-actions">
        <button type="button" className="workout-secondary-button" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="workout-primary-button">{editor.id ? "Salvar alterações" : "Adicionar exercício"}</button>
      </div>
    </form>
  );
}


/* =========================
   EXERCÍCIOS
========================= */

function Exercises() {
  return <ExerciseLibrary />;
}

/* =========================
   FREQUÊNCIA
========================= */

function Frequency() {
  const today = new Date();

  const [currentDate, setCurrentDate] =
    useState(
      new Date(
        today.getFullYear(),
        today.getMonth(),
        1
      )
    );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName =
    currentDate.toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });

  const daysInMonth =
    new Date(year, month + 1, 0).getDate();

  // JS começa domingo = 0.
  // Transformamos segunda = 0.
  const firstWeekDay =
    (new Date(year, month, 1).getDay() + 6) % 7;

  function previousMonth() {
    setCurrentDate(
      new Date(year, month - 1, 1)
    );
  }

  function nextMonth() {
    setCurrentDate(
      new Date(year, month + 1, 1)
    );
  }

  const cells = [];

  for (let i = 0; i < firstWeekDay; i++) {
    cells.push(
      <div
        key={`empty-${i}`}
        className="frequency-day empty"
      />
    );
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    cells.push(
      <button
        key={day}
        className={
          isToday
            ? "frequency-day today"
            : "frequency-day"
        }
      >
        <span className="frequency-day-number">
          {day}
        </span>
      </button>
    );
  }

  return (
    <div>
      <div className="workout-section-header">
        <div>
          <h2>Frequência</h2>

          <p>
            Acompanhe os dias planejados e realizados.
          </p>
        </div>
      </div>

      <div className="frequency-summary">

        <div className="frequency-stat">
          <span>Realizados</span>
          <strong>0</strong>
        </div>

        <div className="frequency-stat">
          <span>Planejados</span>
          <strong>0</strong>
        </div>

        <div className="frequency-stat">
          <span>Faltas</span>
          <strong>0</strong>
        </div>

        <div className="frequency-stat">
          <span>Frequência</span>
          <strong>0%</strong>
        </div>

      </div>

      <div className="frequency-calendar">

        <div className="frequency-calendar-header">

          <button onClick={previousMonth}>
            ‹
          </button>

          <h3>
            {monthName}
          </h3>

          <button onClick={nextMonth}>
            ›
          </button>

        </div>

        <div className="frequency-weekdays">
          <span>SEG</span>
          <span>TER</span>
          <span>QUA</span>
          <span>QUI</span>
          <span>SEX</span>
          <span>SÁB</span>
          <span>DOM</span>
        </div>

        <div className="frequency-grid">
          {cells}
        </div>

        <div className="frequency-legend">

          <span>
            <i className="legend-dot planned" />
            Planejado
          </span>

          <span>
            <i className="legend-dot completed" />
            Treinou
          </span>

          <span>
            <i className="legend-dot missed" />
            Faltou
          </span>

          <span>
            <i className="legend-dot rest" />
            Descanso
          </span>

        </div>

      </div>
    </div>
  );
}


/* =========================
   PROGRESSO
========================= */

function Progress() {
  return (
    <div>
      <div className="workout-section-header">
        <div>
          <h2>Progresso</h2>

          <p>
            Acompanhe peso e medidas corporais.
          </p>
        </div>

        <button className="workout-primary-button">
          + Registrar
        </button>
      </div>

      <div className="workout-empty">
        <h3>Sem registros</h3>

        <p>
          Seus gráficos de evolução aparecerão aqui.
        </p>
      </div>
    </div>
  );
}


/* =========================
   FOTOS
========================= */

function Photos() {
  return (
    <div>
      <div className="workout-section-header">
        <div>
          <h2>Fotos de progresso</h2>

          <p>
            Registre sua evolução visual ao longo do tempo.
          </p>
        </div>

        <button className="workout-primary-button">
          + Adicionar fotos
        </button>
      </div>

      <div className="workout-empty">
        <h3>Nenhuma foto</h3>

        <p>
          Suas fotos de progresso aparecerão aqui.
        </p>
      </div>
    </div>
  );
}


/* =========================
   RECORDES
========================= */

function Records() {
  return (
    <div>
      <div className="workout-section-header">
        <div>
          <h2>Recordes</h2>

          <p>
            Acompanhe suas melhores cargas.
          </p>
        </div>

        <button className="workout-primary-button">
          + Recorde
        </button>
      </div>

      <div className="workout-empty">
        <h3>Nenhum recorde</h3>

        <p>
          Seus recordes pessoais aparecerão aqui.
        </p>
      </div>
    </div>
  );
}
