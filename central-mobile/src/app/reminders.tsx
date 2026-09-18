import { maskBrazilianDate, maskTime, toISODate } from "@/utils/date";
import {
  Screen,
  Composer,
  PrimaryButton,
  Segments,
  Icon,
  ui,
} from "@/components/central-ui";
import { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

const API_URL = "http://100.71.224.93:8080/api/reminders";

type Reminder = {
  id: number;
  title: string;
  description: string;
  dateTime: string | null;
  completed: boolean;
};

export default function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todos");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadReminders() {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: Reminder[] = await response.json();
      setReminders(data);
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao carregar lembretes:", error);
    } finally {
      setLoading(false);
    }
  }

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

      const savedReminder: Reminder = await response.json();

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
      console.log("Erro ao criar lembrete:", error);
    }
  }

  async function toggleReminder(id: number) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const updatedReminder: Reminder = await response.json();

      setReminders((current) =>
        current.map((reminder) =>
          reminder.id === id ? updatedReminder : reminder,
        ),
      );
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao atualizar lembrete:", error);
    }
  }

  async function deleteReminder(id: number) {
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
      console.log("Erro ao excluir lembrete:", error);
    }
  }

  function formatDateTime(dateTime: string | null) {
    if (!dateTime) return "";

    return new Date(dateTime).toLocaleString("pt-BR");
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadReminders();
    }, 0);

    return () => clearTimeout(timer);
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
    <Screen
      title="Lembretes"
      subtitle="Nunca mais esqueça"
      onRefresh={loadReminders}
      action={
        <PrimaryButton
          title="Novo lembrete"
          onPress={() => setEditorOpen(true)}
        />
      }
    >
      <Segments
        options={["Hoje", "Próximos", "Todos"]}
        value={filter}
        onChange={setFilter}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      <Composer
        title="Novo lembrete"
        visible={editorOpen}
        onClose={() => setEditorOpen(false)}
      >
        {!!error && (
          <Text accessibilityRole="alert" style={ui.error}>
            {error}
          </Text>
        )}
        <View style={styles.editor}>
          <TextInput
            accessibilityLabel="Título do lembrete"
            style={styles.input}
            placeholder="Título do lembrete"
            placeholderTextColor="#69717e"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            accessibilityLabel="Descrição..."
            style={[styles.input, styles.textarea]}
            placeholder="Descrição..."
            placeholderTextColor="#69717e"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TextInput
            accessibilityLabel="Data do lembrete (DD/MM/AAAA)"
            keyboardType="number-pad"
            maxLength={10}
            style={styles.input}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#69717e"
            value={date}
            onChangeText={(value) => setDate(maskBrazilianDate(value, date))}
          />

          <TextInput
            accessibilityLabel="Horário do lembrete (HH:MM)"
            keyboardType="number-pad"
            maxLength={5}
            style={styles.input}
            placeholder="HH:MM"
            placeholderTextColor="#69717e"
            value={time}
            onChangeText={(value) => setTime(maskTime(value, time))}
          />

          <Pressable style={styles.addButton} onPress={addReminder}>
            <Text style={styles.addButtonText}>Adicionar lembrete</Text>
          </Pressable>
        </View>
      </Composer>
      <View style={styles.reminderList}>
        {loading ? (
          <Text style={styles.empty}>Carregando lembretes...</Text>
        ) : visibleItems.length === 0 ? (
          <Text style={styles.empty}>Nenhum lembrete neste filtro.</Text>
        ) : (
          visibleItems.map((reminder) => (
            <View
              key={reminder.id}
              style={[
                styles.reminderCard,
                reminder.completed && styles.completedCard,
              ]}
            >
              <View style={styles.reminderMain}>
                <Pressable
                  style={[styles.check, reminder.completed && styles.checkDone]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: reminder.completed }}
                  accessibilityLabel={reminder.title}
                  hitSlop={8}
                  onPress={() => toggleReminder(reminder.id)}
                >
                  {reminder.completed ? (
                    <Text style={styles.checkText}>✓</Text>
                  ) : (
                    <Icon name="bell" size={20} />
                  )}
                </Pressable>

                <View style={styles.reminderInfo}>
                  <Text
                    style={[
                      styles.reminderTitle,
                      reminder.completed && styles.completedText,
                    ]}
                  >
                    {reminder.title}
                  </Text>

                  {!!reminder.description && (
                    <Text
                      style={[
                        styles.description,
                        reminder.completed && styles.completedText,
                      ]}
                    >
                      {reminder.description}
                    </Text>
                  )}

                  {!!reminder.dateTime && (
                    <Text style={styles.dateTime}>
                      {formatDateTime(reminder.dateTime)}
                    </Text>
                  )}
                </View>
              </View>

              <Pressable onPress={() => deleteReminder(reminder.id)}>
                <Text style={styles.delete}>Excluir</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  editor: {
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#142030",
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },

  input: {
    backgroundColor: "#0e1928",
    borderWidth: 1,
    borderColor: "#23334a",
    color: "#ffffff",
    borderRadius: 9,
    padding: 12,
  },

  textarea: {
    minHeight: 90,
    textAlignVertical: "top",
  },

  addButton: {
    backgroundColor: "#315b9d",
    padding: 14,
    minHeight: 48,
    borderRadius: 9,
    alignItems: "center",
  },

  addButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  reminderList: {
    marginTop: 0,
    gap: 8,
  },

  reminderCard: {
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#142030",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  completedCard: {
    opacity: 0.65,
  },

  reminderMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  check: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "transparent",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },

  checkDone: {
    backgroundColor: "#315b9d",
  },

  checkText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  reminderInfo: {
    flex: 1,
  },

  reminderTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  description: {
    color: "#a1a8b4",
    marginTop: 5,
  },

  dateTime: {
    color: "#8d96a5",
    marginTop: 8,
    fontSize: 13,
  },

  completedText: {
    textDecorationLine: "line-through",
    color: "#666d79",
  },

  delete: {
    color: "#d87878",
    marginLeft: 10,
  },

  empty: {
    color: "#747d8c",
    textAlign: "center",
    padding: 30,
  },
});
