import {
  Screen,
  Composer,
  PrimaryButton,
  Segments,
  ui,
} from "@/components/central-ui";
import { useEffect, useState } from "react";

import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

const API_URL = "http://100.71.224.93:8080/api/tasks";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("Todas");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadTasks() {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao carregar tarefas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addTask() {
    if (!title.trim()) {
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
          completed: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const savedTask: Task = await response.json();

      setTasks((current) => [savedTask, ...current]);

      setEditorOpen(false);
      setTitle("");
      setDescription("");
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao criar tarefa:", error);
    }
  }

  async function toggleTask(id: number) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}/toggle`, {
        method: "PATCH",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const updatedTask: Task = await response.json();

      setTasks((current) =>
        current.map((task) => (task.id === id ? updatedTask : task)),
      );
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao atualizar tarefa:", error);
    }
  }

  async function deleteTask(id: number) {
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
      console.log("Erro ao excluir tarefa:", error);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const visibleItems = tasks.filter(
    (task) =>
      filter === "Todas" ||
      (filter === "Concluídas" ? task.completed : !task.completed),
  );

  return (
    <Screen
      title="Tarefas"
      subtitle="Organize e faça acontecer"
      onRefresh={loadTasks}
      action={
        <PrimaryButton
          title="Nova tarefa"
          onPress={() => setEditorOpen(true)}
        />
      }
    >
      <Segments
        options={["Todas", "Pendentes", "Concluídas"]}
        value={filter}
        onChange={setFilter}
      />
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      <Composer
        title="Nova tarefa"
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
            accessibilityLabel="Título da tarefa"
            style={styles.input}
            placeholder="Título da tarefa"
            placeholderTextColor="#69717e"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            accessibilityLabel="Descrição da tarefa..."
            style={[styles.input, styles.textarea]}
            placeholder="Descrição da tarefa..."
            placeholderTextColor="#69717e"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Pressable style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Adicionar tarefa</Text>
          </Pressable>
        </View>
      </Composer>
      <View style={styles.taskList}>
        {loading ? (
          <Text style={styles.empty}>Carregando tarefas...</Text>
        ) : visibleItems.length === 0 ? (
          <Text style={styles.empty}>Nenhuma tarefa neste filtro.</Text>
        ) : (
          visibleItems.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                task.completed && styles.taskCardCompleted,
              ]}
            >
              <View style={styles.taskMain}>
                <Pressable
                  style={[styles.check, task.completed && styles.checkDone]}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: task.completed }}
                  accessibilityLabel={task.title}
                  hitSlop={8}
                  onPress={() => toggleTask(task.id)}
                >
                  <Text style={styles.checkText}>
                    {task.completed ? "✓" : ""}
                  </Text>
                </Pressable>

                <View style={styles.taskText}>
                  <Text
                    style={[
                      styles.taskTitle,
                      task.completed && styles.completedText,
                    ]}
                  >
                    {task.title}
                  </Text>

                  {!!task.description && (
                    <Text
                      style={[
                        styles.description,
                        task.completed && styles.completedText,
                      ]}
                    >
                      {task.description}
                    </Text>
                  )}
                </View>
              </View>

              <Pressable onPress={() => deleteTask(task.id)}>
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

  taskList: {
    marginTop: 0,
    gap: 8,
  },

  taskCard: {
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#142030",
    borderRadius: 10,
    padding: 16,

    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  taskCardCompleted: {
    opacity: 0.65,
  },

  taskMain: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },

  check: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#515866",
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

  taskText: {
    flex: 1,
  },

  taskTitle: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "700",
  },

  description: {
    color: "#a1a8b4",
    marginTop: 5,
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
