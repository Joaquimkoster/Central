import { useEffect, useState } from "react";
import { getBrazilianHolidays } from "../utils/holidays";
import { getMoonPhase } from "../utils/moonPhases";
import Icon from "../components/Icon";

const API_URL = "http://100.71.224.93:8080/api/events";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const WEEK_DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function toDateString(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export default function Calendar() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    toDateString(today.getFullYear(), today.getMonth(), today.getDate())
  );

  const [events, setEvents] = useState([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Feriados do ano atualmente exibido
  const holidays = getBrazilianHolidays(year);

  function holidayForDate(date) {
    return holidays.find((holiday) => holiday.date === date);
  }

  async function loadEvents() {
    try {
      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
    }
  }

  useEffect(() => {
    let isActive = true;

    fetch(API_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }

        return response.json();
      })
      .then((data) => {
        if (isActive) {
          setEvents(data);
        }
      })
      .catch((error) => {
        console.error("Erro ao carregar eventos:", error);
      });

    return () => {
      isActive = false;
    };
  }, []);

  function previousMonth() {
    setCurrentDate(new Date(year, month - 1, 1));
  }

  function nextMonth() {
    setCurrentDate(new Date(year, month + 1, 1));
  }

  function getCalendarDays() {
    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const previousMonthDays = new Date(year, month, 0).getDate();

    const days = [];

    // Dias do mês anterior
    for (let i = firstDay - 1; i >= 0; i--) {
      const day = previousMonthDays - i;

      const date = new Date(year, month - 1, day);

      days.push({
        day,
        date: toDateString(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ),
        currentMonth: false,
      });
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({
        day,
        date: toDateString(year, month, day),
        currentMonth: true,
      });
    }

    // Completa a grade com dias do próximo mês
    let nextDay = 1;

    while (days.length < 42) {
      const date = new Date(year, month + 1, nextDay);

      days.push({
        day: nextDay,
        date: toDateString(
          date.getFullYear(),
          date.getMonth(),
          date.getDate()
        ),
        currentMonth: false,
      });

      nextDay++;
    }

    return days;
  }

  function eventsForDate(date) {
    return events
      .filter((event) => event.date === date)
      .sort((a, b) =>
        (a.startTime || "00:00").localeCompare(b.startTime || "00:00")
      );
  }

  function isToday(date) {
    const now = new Date();

    return (
      date ===
      toDateString(now.getFullYear(), now.getMonth(), now.getDate())
    );
  }

  function selectDay(day) {
    setSelectedDate(day.date);
    setShowForm(false);
    setEditingId(null);

    if (!day.currentMonth) {
      const [selectedYear, selectedMonth] = day.date.split("-");

      setCurrentDate(
        new Date(Number(selectedYear), Number(selectedMonth) - 1, 1)
      );
    }
  }

  function clearForm() {
    setTitle("");
    setDescription("");
    setStartTime("");
    setEndTime("");
    setEditingId(null);
  }

  function openNewEvent() {
    clearForm();
    setShowForm(true);
  }

  function cancelForm() {
    clearForm();
    setShowForm(false);
  }

  function editEvent(event) {
    setEditingId(event.id);

    setTitle(event.title || "");
    setDescription(event.description || "");

    setStartTime(
      event.startTime ? event.startTime.substring(0, 5) : ""
    );

    setEndTime(
      event.endTime ? event.endTime.substring(0, 5) : ""
    );

    setShowForm(true);
  }

  async function saveEvent() {
    if (!title.trim()) {
      alert("Digite um título para o evento.");
      return;
    }

    if (startTime && endTime && endTime < startTime) {
      alert("O horário de término não pode ser anterior ao horário de início.");
      return;
    }

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      date: selectedDate,
      startTime: startTime || null,
      endTime: endTime || null,
    };

    try {
      let response;

      if (editingId !== null) {
        response = await fetch(`${API_URL}/${editingId}`, {
          method: "PUT",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(eventData),
        });
      } else {
        response = await fetch(API_URL, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      await loadEvents();

      clearForm();
      setShowForm(false);
    } catch (error) {
      console.error("Erro ao salvar evento:", error);
      alert("Não foi possível salvar o evento.");
    }
  }

  async function deleteEvent(id) {
    const confirmed = window.confirm(
      "Deseja realmente excluir este evento?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      setEvents((current) =>
        current.filter((event) => event.id !== id)
      );
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      alert("Não foi possível excluir o evento.");
    }
  }

  const calendarDays = getCalendarDays();

  const selectedEvents = eventsForDate(selectedDate);

  const selectedHoliday = holidayForDate(selectedDate);

  const selectedMoonPhase = getMoonPhase(selectedDate);

  const selectedDateLabel = new Date(
    `${selectedDate}T12:00:00`
  ).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="page calendar-page">
      {/* CABEÇALHO */}

      <div className="calendar-header">
        <div>
          <span className="calendar-eyebrow">PLANEJAMENTO</span>
          <h1>Calendário</h1>

          <p>
            Eventos, compromissos, feriados e organização da Central.
          </p>
        </div>

        <button
          type="button"
          className="page-badge"
          onClick={loadEvents}
          aria-label="Atualizar página"
          title="Atualizar página"
        >
          <Icon name="refresh" />
        </button>
      </div>

      <div className="calendar-surface">
        {/* NAVEGAÇÃO */}

        <div className="calendar-month-navigation">
          <button
            onClick={previousMonth}
            aria-label="Mês anterior"
          >
            ‹
          </button>

          <div className="calendar-month-title">
            <span>{year}</span>
            <h2>{MONTHS[month]}</h2>
          </div>

          <button
            onClick={nextMonth}
            aria-label="Próximo mês"
          >
            ›
          </button>
        </div>

      {/* CALENDÁRIO */}

      <div className="calendar-grid">
        {WEEK_DAYS.map((day) => (
          <div
            className="calendar-week-day"
            key={day}
          >
            {day}
          </div>
        ))}

        {calendarDays.map((calendarDay) => {
          const dayEvents = eventsForDate(calendarDay.date);
          const holiday = holidayForDate(calendarDay.date);
          const moonPhase = getMoonPhase(calendarDay.date);

          return (
            <button
              key={calendarDay.date}
              className={[
                "calendar-day",

                !calendarDay.currentMonth
                  ? "other-month"
                  : "",

                isToday(calendarDay.date)
                  ? "today"
                  : "",

                selectedDate === calendarDay.date
                  ? "selected"
                  : "",

                holiday
                  ? "has-holiday"
                  : "",
              ].join(" ")}
              onClick={() => selectDay(calendarDay)}
              aria-pressed={selectedDate === calendarDay.date}
              aria-label={`${calendarDay.day} de ${MONTHS[new Date(`${calendarDay.date}T12:00:00`).getMonth()]}`}
            >
              <span className="calendar-day-number">
                {calendarDay.day}
              </span>

              {moonPhase && (
                <div
                  className="calendar-moon-phase"
                  title={moonPhase.name}
                >
                  <span className="calendar-moon-icon">
                    {moonPhase.icon}
                  </span>

                  <span className="calendar-moon-name">
                    {moonPhase.name}
                  </span>
                </div>
              )}

              {/* FERIADO */}

              {holiday && (
                <div
                  className={`calendar-holiday calendar-holiday-${holiday.type}`}
                  title={holiday.name}
                >
                  {holiday.name}
                </div>
              )}

              {/* EVENTOS */}

              <div className="calendar-day-events">
                {dayEvents
                  .slice(0, 3)
                  .map((event) => (
                    <div
                      className="calendar-small-event"
                      key={event.id}
                    >
                      {event.startTime && (
                        <span>
                          {event.startTime.substring(0, 5)}
                        </span>
                      )}

                      {event.title}
                    </div>
                  ))}

                {dayEvents.length > 3 && (
                  <div className="calendar-more-events">
                    +{dayEvents.length - 3} eventos
                  </div>
                )}
              </div>
            </button>
          );
        })}
        </div>
      </div>

      {/* DIA SELECIONADO */}

      <div className="calendar-selected-day">
        <div className="calendar-selected-header">
          <div>
            <span className="calendar-detail-label">Agenda do dia</span>

            <h2>{selectedDateLabel}</h2>

            {selectedHoliday && (
              <div className="calendar-selected-holiday">
                Feriado: {selectedHoliday.name}
              </div>
            )}
          </div>

          {selectedMoonPhase && (
            <div className="calendar-selected-moon">
              {selectedMoonPhase.icon} {selectedMoonPhase.name}
            </div>
          )}

          <div className="calendar-selected-actions">
            <span className="calendar-event-count">
              {selectedEvents.length} {selectedEvents.length === 1 ? "evento" : "eventos"}
            </span>

            <button
              className="calendar-new-event-button"
              onClick={openNewEvent}
            >
              <Icon name="plus" size={16} />
              Novo evento
            </button>
          </div>
        </div>

        {/* FORMULÁRIO */}

        {showForm && (
          <div className="calendar-event-form">
            <div className="calendar-form-header">
              <h3>
                {editingId !== null
                  ? "Editar evento"
                  : "Novo evento"}
              </h3>

              <span>{selectedDateLabel}</span>
            </div>

            <input
              type="text"
              placeholder="Título do evento"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />

            <textarea
              placeholder="Descrição do evento..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />

            <div className="calendar-time-inputs">
              <div>
                <label>Início</label>

                <input
                  type="time"
                  value={startTime}
                  onChange={(e) =>
                    setStartTime(e.target.value)
                  }
                />
              </div>

              <div>
                <label>Término</label>

                <input
                  type="time"
                  value={endTime}
                  onChange={(e) =>
                    setEndTime(e.target.value)
                  }
                />
              </div>
            </div>

            <div className="calendar-form-actions">
              <button
                className="calendar-cancel-button"
                onClick={cancelForm}
              >
                Cancelar
              </button>

              <button
                className="calendar-save-button"
                onClick={saveEvent}
              >
                {editingId !== null
                  ? "Salvar alterações"
                  : "Criar evento"}
              </button>
            </div>
          </div>
        )}

        {/* EVENTOS DO DIA */}

        {!showForm && (
          <>
            {selectedEvents.length === 0 ? (
              <div className="calendar-empty">
                <span><Icon name="calendar" size={22} /></span>
                <strong>Agenda livre</strong>
                <p>Nenhum evento programado para este dia.</p>
              </div>
            ) : (
              <div className="calendar-selected-events">
                {selectedEvents.map((event) => (
                  <div
                    className="calendar-selected-event"
                    key={event.id}
                  >
                    <div className="calendar-event-time">
                      {event.startTime
                        ? event.startTime.substring(0, 5)
                        : "--:--"}
                    </div>

                    <div className="calendar-event-details">
                      <strong>
                        {event.title}
                      </strong>

                      {event.description && (
                        <p>
                          {event.description}
                        </p>
                      )}

                      {event.endTime && (
                        <small>
                          até{" "}
                          {event.endTime.substring(0, 5)}
                        </small>
                      )}
                    </div>

                    <div className="calendar-event-actions">
                      <button
                        className="calendar-edit-button"
                        onClick={() =>
                          editEvent(event)
                        }
                      >
                        Editar
                      </button>

                      <button
                        className="calendar-delete-button"
                        onClick={() =>
                          deleteEvent(event.id)
                        }
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
