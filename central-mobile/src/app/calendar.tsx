import { useEffect, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from "react-native";

import { router } from "expo-router";

import { Icon } from "@/components/central-ui";
import { getBrazilianHolidays } from "@/utils/holidays";
import { getMoonPhase } from "@/utils/moonPhases";

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

const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

type CalendarEvent = {
  id: number;
  title: string;
  description?: string;
  date: string;
  startTime?: string;
  endTime?: string;
};

function toDateString(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(
    day
  ).padStart(2, "0")}`;
}

export default function CalendarScreen() {
  const today = new Date();

  const [currentDate, setCurrentDate] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    toDateString(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    )
  );

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  /*
   * FERIADOS
   */

  const holidays = getBrazilianHolidays(year);

  function holidayForDate(date: string) {
    return holidays.find(
      (holiday) => holiday.date === date
    );
  }

  /*
   * EVENTOS
   */

  async function loadEvents() {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}`);
      }

      const data = await response.json();

      setEvents(data);
    } catch (error) {
      console.error(
        "Erro ao carregar eventos:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadEvents();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  /*
   * NAVEGAÇÃO
   */

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

  /*
   * GERAÇÃO DOS DIAS
   */

  function getCalendarDays() {
    const firstDay = new Date(
      year,
      month,
      1
    ).getDay();

    const daysInMonth = new Date(
      year,
      month + 1,
      0
    ).getDate();

    const previousMonthDays = new Date(
      year,
      month,
      0
    ).getDate();

    const days: {
      day: number;
      date: string;
      currentMonth: boolean;
    }[] = [];

    /*
     * Dias do mês anterior
     */

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = previousMonthDays - i;

      const date = new Date(
        year,
        month - 1,
        day
      );

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

    /*
     * Dias do mês atual
     */

    for (
      let day = 1;
      day <= daysInMonth;
      day++
    ) {
      days.push({
        day,

        date: toDateString(
          year,
          month,
          day
        ),

        currentMonth: true,
      });
    }

    /*
     * Dias do próximo mês
     */

    let nextDay = 1;

    while (days.length < 42) {
      const date = new Date(
        year,
        month + 1,
        nextDay
      );

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

  /*
   * EVENTOS POR DATA
   */

  function eventsForDate(date: string) {
    return events
      .filter(
        (event) => event.date === date
      )
      .sort((a, b) =>
        (a.startTime || "00:00").localeCompare(
          b.startTime || "00:00"
        )
      );
  }

  /*
   * VERIFICA SE É HOJE
   */

  function isToday(date: string) {
    const now = new Date();

    return (
      date ===
      toDateString(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      )
    );
  }

  /*
   * SELEÇÃO DO DIA
   */

  function selectDay(calendarDay: {
    day: number;
    date: string;
    currentMonth: boolean;
  }) {
    setSelectedDate(calendarDay.date);

    /*
     * Se tocar em um dia do mês anterior
     * ou seguinte, muda automaticamente
     * para aquele mês.
     */

    if (!calendarDay.currentMonth) {
      const [selectedYear, selectedMonth] =
        calendarDay.date
          .split("-")
          .map(Number);

      setCurrentDate(
        new Date(
          selectedYear,
          selectedMonth - 1,
          1
        )
      );
    }
  }

  /*
   * DADOS DO CALENDÁRIO
   */

  const calendarDays = getCalendarDays();

  const selectedEvents =
    eventsForDate(selectedDate);

  const selectedHoliday =
    holidayForDate(selectedDate);

  const selectedMoonPhase =
    getMoonPhase(selectedDate);

  const selectedDateLabel = new Date(
    `${selectedDate}T12:00:00`
  ).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <ScrollView style={styles.container}>

      {/* =========================
          CABEÇALHO
      ========================== */}

      <View style={styles.header}>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backText}>
            ‹
          </Text>
        </Pressable>

        <View style={styles.headerText}>

          <Text style={styles.title}>
            Calendário
          </Text>

          <Text style={styles.subtitle}>
            Eventos, feriados e fases da Lua
          </Text>

        </View>

        <Pressable
          style={({ pressed }) => [
            styles.todayButton,
            pressed && { opacity: 0.7 },
          ]}
          onPress={loadEvents}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Atualizar página"
          accessibilityState={{ disabled: loading, busy: loading }}
        >
          {loading ? (
            <ActivityIndicator color="#c1cde0" size="small" />
          ) : (
            <Icon name="refresh" size={18} />
          )}
        </Pressable>

      </View>

      {/* =========================
          NAVEGAÇÃO DO MÊS
      ========================== */}

      <View style={styles.monthNavigation}>

        <Pressable
          style={styles.navigationButton}
          onPress={previousMonth}
        >
          <Text style={styles.navigationText}>
            ‹
          </Text>
        </Pressable>

        <Text style={styles.monthTitle}>
          {MONTHS[month]} {year}
        </Text>

        <Pressable
          style={styles.navigationButton}
          onPress={nextMonth}
        >
          <Text style={styles.navigationText}>
            ›
          </Text>
        </Pressable>

      </View>

      {/* =========================
          DIAS DA SEMANA
      ========================== */}

      <View style={styles.weekRow}>

        {WEEK_DAYS.map((day, index) => (
          <Text
            key={index}
            style={styles.weekDay}
          >
            {day}
          </Text>
        ))}

      </View>

      {/* =========================
          GRADE DO CALENDÁRIO
      ========================== */}

      <View style={styles.calendarGrid}>

        {calendarDays.map((calendarDay) => {

          const dayEvents =
            eventsForDate(calendarDay.date);

          const holiday =
            holidayForDate(calendarDay.date);

          const moonPhase =
            getMoonPhase(calendarDay.date);

          const selected =
            selectedDate === calendarDay.date;

          return (
            <Pressable
              key={calendarDay.date}

              style={[
                styles.day,

                selected &&
                  styles.selectedDay,

                holiday &&
                  styles.holidayDay,
              ]}

              onPress={() =>
                selectDay(calendarDay)
              }
            >

              {/* NÚMERO DO DIA */}

              <View
                style={[
                  styles.dayNumberContainer,

                  isToday(calendarDay.date) &&
                    styles.todayCircle,
                ]}
              >

                <Text
                  style={[
                    styles.dayNumber,

                    !calendarDay.currentMonth &&
                      styles.otherMonth,

                    holiday &&
                      calendarDay.currentMonth &&
                      styles.holidayDayNumber,

                    isToday(calendarDay.date) &&
                      styles.todayNumber,
                  ]}
                >
                  {calendarDay.day}
                </Text>

              </View>

              {/* INDICADORES */}

              <View style={styles.indicators}>

                {holiday && (
                  <View
                    style={styles.holidayDot}
                  />
                )}

                {moonPhase && (
                  <Text style={styles.moonIcon}>
                    {moonPhase.icon}
                  </Text>
                )}

                {dayEvents.length > 0 && (
                  <View
                    style={styles.eventDot}
                  />
                )}

              </View>

            </Pressable>
          );
        })}

      </View>

      {/* =========================
          LEGENDA
      ========================== */}

      <View style={styles.legend}>

        <View style={styles.legendItem}>
          <View style={styles.holidayDot} />

          <Text style={styles.legendText}>
            Feriado
          </Text>
        </View>

        <View style={styles.legendItem}>
          <View style={styles.eventDot} />

          <Text style={styles.legendText}>
            Evento
          </Text>
        </View>

        <View style={styles.legendItem}>
          <Text style={styles.legendMoon}>
            🌕
          </Text>

          <Text style={styles.legendText}>
            Fase da Lua
          </Text>
        </View>

      </View>

      {/* =========================
          DIA SELECIONADO
      ========================== */}

      <View style={styles.selectedSection}>

        <Text style={styles.selectedLabel}>
          DIA SELECIONADO
        </Text>

        <Text style={styles.selectedTitle}>
          {selectedDateLabel}
        </Text>

        {/* FERIADO */}

        {selectedHoliday && (
          <View style={styles.holidayBadge}>

            <Text style={styles.holidayBadgeIcon}>
              🇧🇷
            </Text>

            <View style={styles.badgeInfo}>

              <Text style={styles.badgeLabel}>
                Feriado
              </Text>

              <Text style={styles.holidayText}>
                {selectedHoliday.name}
              </Text>

            </View>

          </View>
        )}

        {/* LUA */}

        {selectedMoonPhase && (
          <View style={styles.moonBadge}>

            <Text style={styles.moonBadgeIcon}>
              {selectedMoonPhase.icon}
            </Text>

            <View style={styles.badgeInfo}>

              <Text style={styles.badgeLabel}>
                Fase da Lua
              </Text>

              <Text style={styles.moonText}>
                {selectedMoonPhase.name}
              </Text>

            </View>

          </View>
        )}

        {/* EVENTOS */}

        <View style={styles.eventsHeader}>

          <Text style={styles.eventsTitle}>
            Eventos
          </Text>

          <View style={styles.eventCount}>

            <Text style={styles.eventCountText}>
              {selectedEvents.length}
            </Text>

          </View>

        </View>

        {loading ? (

          <ActivityIndicator
            size="small"
            color="#ffffff"
            style={styles.loading}
          />

        ) : selectedEvents.length === 0 ? (

          <View style={styles.emptyContainer}>

            <Text style={styles.empty}>
              Nenhum evento neste dia.
            </Text>

          </View>

        ) : (

          selectedEvents.map((event) => (

            <View
              key={event.id}
              style={styles.eventCard}
            >

              <View style={styles.eventTimeContainer}>

                <Text style={styles.eventTime}>
                  {event.startTime
                    ? event.startTime.substring(
                        0,
                        5
                      )
                    : "--:--"}
                </Text>

                {event.endTime && (
                  <Text style={styles.eventEndTime}>
                    até{" "}
                    {event.endTime.substring(
                      0,
                      5
                    )}
                  </Text>
                )}

              </View>

              <View style={styles.eventInfo}>

                <Text style={styles.eventTitle}>
                  {event.title}
                </Text>

                {event.description && (
                  <Text
                    style={
                      styles.eventDescription
                    }
                  >
                    {event.description}
                  </Text>
                )}

              </View>

            </View>

          ))

        )}

      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#0b0d12",
    padding: 18,
  },

  /* CABEÇALHO */

  header: {
    marginTop: 35,
    marginBottom: 25,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#252b36",
    backgroundColor: "#131720",
    alignItems: "center",
    justifyContent: "center",
  },

  backText: {
    color: "#ffffff",
    fontSize: 28,
    lineHeight: 30,
  },

  headerText: {
    flex: 1,
  },

  title: {
    color: "#ffffff",
    fontSize: 25,
    fontWeight: "700",
  },

  subtitle: {
    color: "#858d9b",
    marginTop: 3,
    fontSize: 12,
  },

  todayButton: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#213d65",
    borderRadius: 12,
  },

  /* NAVEGAÇÃO */

  monthNavigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    backgroundColor: "#131720",

    borderWidth: 1,
    borderColor: "#252b36",

    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,

    padding: 12,
  },

  navigationButton: {
    width: 36,
    height: 36,

    backgroundColor: "#0e1117",

    borderWidth: 1,
    borderColor: "#2a303b",

    borderRadius: 8,

    alignItems: "center",
    justifyContent: "center",
  },

  navigationText: {
    color: "#ffffff",
    fontSize: 24,
  },

  monthTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  /* SEMANA */

  weekRow: {
    flexDirection: "row",

    backgroundColor: "#10131a",

    borderLeftWidth: 1,
    borderRightWidth: 1,

    borderColor: "#252b36",
  },

  weekDay: {
    width: "14.2857%",

    textAlign: "center",

    color: "#858d9b",

    fontSize: 11,
    fontWeight: "700",

    paddingVertical: 10,
  },

  /* CALENDÁRIO */

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",

    borderLeftWidth: 1,
    borderTopWidth: 1,

    borderColor: "#252b36",
  },

  day: {
    width: "14.2857%",
    height: 58,

    backgroundColor: "#131720",

    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: "#252b36",

    alignItems: "center",

    paddingTop: 5,
  },

  selectedDay: {
    backgroundColor: "#202631",
  },

  holidayDay: {
    backgroundColor: "#17151a",
  },

  dayNumberContainer: {
    width: 27,
    height: 27,

    borderRadius: 14,

    alignItems: "center",
    justifyContent: "center",
  },

  dayNumber: {
    color: "#d8dce3",
    fontSize: 12,
    fontWeight: "600",
  },

  otherMonth: {
    color: "#555d6b",
  },

  holidayDayNumber: {
    color: "#e39a9a",
  },

  todayCircle: {
    backgroundColor: "#ffffff",
  },

  todayNumber: {
    color: "#111111",
    fontWeight: "800",
  },

  /* INDICADORES */

  indicators: {
    height: 16,

    flexDirection: "row",

    alignItems: "center",
    justifyContent: "center",

    gap: 4,

    marginTop: 3,
  },

  holidayDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#d87878",
  },

  eventDot: {
    width: 5,
    height: 5,

    borderRadius: 3,

    backgroundColor: "#8fa7c8",
  },

  moonIcon: {
    fontSize: 10,
    lineHeight: 13,
  },

  /* LEGENDA */

  legend: {
    flexDirection: "row",

    alignItems: "center",

    gap: 15,

    backgroundColor: "#10131a",

    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderBottomWidth: 1,

    borderColor: "#252b36",

    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  legendItem: {
    flexDirection: "row",

    alignItems: "center",

    gap: 5,
  },

  legendText: {
    color: "#747d8c",
    fontSize: 10,
  },

  legendMoon: {
    fontSize: 10,
  },

  /* DIA SELECIONADO */

  selectedSection: {
    backgroundColor: "#131720",

    borderWidth: 1,
    borderColor: "#252b36",

    borderRadius: 14,

    padding: 16,

    marginTop: 16,
    marginBottom: 60,
  },

  selectedLabel: {
    color: "#667080",

    fontSize: 9,
    fontWeight: "700",

    letterSpacing: 1,

    marginBottom: 5,
  },

  selectedTitle: {
    color: "#ffffff",

    fontSize: 17,
    fontWeight: "700",

    textTransform: "capitalize",

    marginBottom: 15,
  },

  /* BADGES */

  holidayBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    backgroundColor: "#26191c",

    borderWidth: 1,
    borderColor: "#57343a",

    borderRadius: 9,

    paddingHorizontal: 11,
    paddingVertical: 9,

    marginBottom: 8,
  },

  holidayBadgeIcon: {
    fontSize: 18,
  },

  moonBadge: {
    flexDirection: "row",
    alignItems: "center",

    gap: 10,

    backgroundColor: "#191e28",

    borderWidth: 1,
    borderColor: "#292f3b",

    borderRadius: 9,

    paddingHorizontal: 11,
    paddingVertical: 9,

    marginBottom: 12,
  },

  moonBadgeIcon: {
    fontSize: 20,
  },

  badgeInfo: {
    flex: 1,
  },

  badgeLabel: {
    color: "#707988",

    fontSize: 9,
    fontWeight: "700",

    textTransform: "uppercase",

    marginBottom: 2,
  },

  holidayText: {
    color: "#e29a9a",

    fontSize: 12,
    fontWeight: "600",
  },

  moonText: {
    color: "#c0c7d2",

    fontSize: 12,
    fontWeight: "600",
  },

  /* EVENTOS */

  eventsHeader: {
    flexDirection: "row",

    alignItems: "center",

    marginTop: 5,
    marginBottom: 5,
  },

  eventsTitle: {
    color: "#ffffff",

    fontSize: 14,
    fontWeight: "700",

    flex: 1,
  },

  eventCount: {
    minWidth: 24,
    height: 24,

    borderRadius: 12,

    backgroundColor: "#202631",

    alignItems: "center",
    justifyContent: "center",
  },

  eventCountText: {
    color: "#aeb6c4",

    fontSize: 10,
    fontWeight: "700",
  },

  loading: {
    paddingVertical: 25,
  },

  emptyContainer: {
    paddingVertical: 25,

    alignItems: "center",
    justifyContent: "center",
  },

  empty: {
    color: "#747d8c",

    textAlign: "center",

    fontSize: 12,
  },

  eventCard: {
    flexDirection: "row",

    gap: 12,

    paddingVertical: 13,

    borderBottomWidth: 1,
    borderBottomColor: "#252b36",
  },

  eventTimeContainer: {
    width: 55,
  },

  eventTime: {
    color: "#b2bac7",

    fontSize: 13,
    fontWeight: "700",
  },

  eventEndTime: {
    color: "#626c7a",

    fontSize: 9,

    marginTop: 3,
  },

  eventInfo: {
    flex: 1,
  },

  eventTitle: {
    color: "#ffffff",

    fontSize: 14,
    fontWeight: "700",
  },

  eventDescription: {
    color: "#9da5b2",

    fontSize: 12,

    marginTop: 4,

    lineHeight: 17,
  },
});
