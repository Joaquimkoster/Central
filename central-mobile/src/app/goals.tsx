import { useCallback, useState } from "react";

import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";

import { useFocusEffect } from "expo-router";
import {
  Composer,
  PrimaryButton,
  Screen,
  Segments,
} from "@/components/central-ui";

const API_URL =
  "http://100.71.224.93:8080/api/goals";

type GoalStatus =
  | "Em andamento"
  | "Pausado"
  | "Concluído";

type Goal = {
  id: number;
  title: string;
  description: string | null;
  deadline: string | null;
  progress: number;
  status: GoalStatus;
};

type GoalForm = {
  title: string;
  description: string;
  deadline: string;
  progress: string;
  status: GoalStatus;
};

const emptyForm: GoalForm = {
  title: "",
  description: "",
  deadline: "",
  progress: "0",
  status: "Em andamento",
};

function maskDate(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)]
    .filter(Boolean)
    .join("/");
}

function dateToDisplay(value: string | null) {
  if (!value) return "";
  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : maskDate(value);
}

function displayToDate(value: string) {
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

function maskProgress(value: string) {
  const digits = value.replace(/\D/g, "");
  return digits ? String(Math.min(100, Number(digits))) : "";
}

export default function GoalsScreen() {
  const [goals, setGoals] = useState<Goal[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [showForm, setShowForm] =
    useState(false);

  const [editingId, setEditingId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<GoalForm>(emptyForm);

  /*
   * CARREGAR OBJETIVOS
   */

  const loadGoals = useCallback(
    async () => {
      try {
        setLoading(true);

        const response =
          await fetch(API_URL);

        if (!response.ok) {
          throw new Error(
            `Erro HTTP ${response.status}`
          );
        }

        const data =
          await response.json();

        setGoals(data);
      } catch (error) {
        console.error(
          "Erro ao carregar objetivos:",
          error
        );

        Alert.alert(
          "Erro",
          "Não foi possível conectar ao backend."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /*
   * Atualiza sempre que entrarmos
   * novamente na página.
   */

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [loadGoals])
  );

  /*
   * NOVO OBJETIVO
   */

  function openNewGoal() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  }

  /*
   * EDITAR
   */

  function editGoal(goal: Goal) {
    setEditingId(goal.id);

    setForm({
      title: goal.title ?? "",

      description:
        goal.description ?? "",

      deadline:
        dateToDisplay(goal.deadline),

      progress:
        String(goal.progress ?? 0),

      status:
        goal.status ?? "Em andamento",
    });

    setShowForm(true);
  }

  /*
   * SALVAR
   */

  async function saveGoal() {
    if (!form.title.trim()) {
      Alert.alert(
        "Atenção",
        "Digite o título do objetivo."
      );

      return;
    }

    const progress =
      Number(form.progress);

    const deadline = displayToDate(form.deadline);

    if (form.deadline && !deadline) {
      Alert.alert(
        "Atenção",
        "Digite um prazo válido no formato DD/MM/AAAA."
      );
      return;
    }

    if (
      Number.isNaN(progress) ||
      progress < 0 ||
      progress > 100
    ) {
      Alert.alert(
        "Atenção",
        "O progresso deve estar entre 0 e 100."
      );

      return;
    }

    try {
      setSaving(true);

      const url = editingId
        ? `${API_URL}/${editingId}`
        : API_URL;

      const response = await fetch(
        url,
        {
          method: editingId
            ? "PUT"
            : "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              form.title.trim(),

            description:
              form.description.trim(),

            deadline:
              deadline,

            progress,

            status:
              form.status,
          }),
        }
      );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(message);
      }

      closeForm();

      await loadGoals();
    } catch (error) {
      console.error(
        "Erro ao salvar objetivo:",
        error
      );

      Alert.alert(
        "Erro",
        "Não foi possível salvar o objetivo."
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * EXCLUIR
   */

  function deleteGoal(goal: Goal) {
    Alert.alert(
      "Excluir objetivo",
      `Deseja excluir "${goal.title}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },

        {
          text: "Excluir",
          style: "destructive",

          onPress: async () => {
            try {
              const response =
                await fetch(
                  `${API_URL}/${goal.id}`,
                  {
                    method: "DELETE",
                  }
                );

              if (!response.ok) {
                throw new Error(
                  "Erro ao excluir"
                );
              }

              await loadGoals();
            } catch (error) {
              console.error(error);

              Alert.alert(
                "Erro",
                "Não foi possível excluir o objetivo."
              );
            }
          },
        },
      ]
    );
  }

  /*
   * STATUS
   */

  function changeStatus(
    status: GoalStatus
  ) {
    setForm((previous) => ({
      ...previous,
      status,
    }));
  }

  /*
   * DATA
   */

  function formatDate(
    date: string | null
  ) {
    if (!date) {
      return "Sem prazo";
    }

    const parts =
      date.split("-");

    if (parts.length !== 3) {
      return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  /*
   * RESUMO
   */

  const activeGoals =
    goals.filter(
      (goal) =>
        goal.status ===
        "Em andamento"
    ).length;

  const completedGoals =
    goals.filter(
      (goal) =>
        goal.status ===
        "Concluído"
    ).length;

  const averageProgress =
    goals.length
      ? Math.round(
          goals.reduce(
            (total, goal) =>
              total +
              (goal.progress ?? 0),
            0
          ) / goals.length
        )
      : 0;

  return (
    <Screen
      title="Objetivos"
      subtitle="Acompanhe suas metas e seu progresso"
      onRefresh={loadGoals}
      action={<PrimaryButton title="Novo objetivo" onPress={openNewGoal} />}
    >
      <Composer
        title={editingId ? "Editar objetivo" : "Novo objetivo"}
        visible={showForm}
        onClose={closeForm}
      >
        <View style={styles.form}>

          <Text
            style={styles.label}
          >
            Título
          </Text>

          <TextInput
            style={styles.input}
            value={form.title}
            onChangeText={(value) =>
              setForm(
                (previous) => ({
                  ...previous,
                  title: value,
                })
              )
            }
            placeholder="Ex: Finalizar a Central"
            placeholderTextColor="#596270"
          />

          <Text
            style={styles.label}
          >
            Descrição
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textarea,
            ]}
            value={
              form.description
            }
            onChangeText={(value) =>
              setForm(
                (previous) => ({
                  ...previous,
                  description:
                    value,
                })
              )
            }
            multiline
            placeholder="Descreva seu objetivo..."
            placeholderTextColor="#596270"
          />

          <Text
            style={styles.label}
          >
            Prazo
          </Text>

          <TextInput
            style={styles.input}
            value={form.deadline}
            onChangeText={(value) =>
              setForm(
                (previous) => ({
                  ...previous,
                  deadline: maskDate(value),
                })
              )
            }
            keyboardType="number-pad"
            maxLength={10}
            placeholder="DD/MM/AAAA"
            placeholderTextColor="#596270"
          />

          <Text
            style={styles.label}
          >
            Progresso (%)
          </Text>

          <View style={styles.maskedInput}>
            <TextInput
              style={[styles.input, styles.maskedTextInput]}
              value={form.progress}
              onChangeText={(value) =>
                setForm((previous) => ({
                  ...previous,
                  progress: maskProgress(value),
                }))
              }
              keyboardType="number-pad"
              maxLength={3}
              placeholder="0"
              placeholderTextColor="#596270"
            />
            <Text style={styles.inputSuffix}>%</Text>
          </View>

          <Text
            style={styles.label}
          >
            Status
          </Text>

          <Segments
            options={["Em andamento", "Pausado", "Concluído"]}
            value={form.status}
            onChange={(status) => changeStatus(status as GoalStatus)}
          />

          <View
            style={
              styles.formActions
            }
          >
            <Pressable
              style={
                styles.cancelButton
              }
              onPress={closeForm}
            >
              <Text
                style={
                  styles.cancelText
                }
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={
                styles.saveButton
              }
              onPress={saveGoal}
              disabled={saving}
            >
              <Text
                style={
                  styles.saveText
                }
              >
                {saving
                  ? "Salvando..."
                  : editingId
                  ? "Salvar"
                  : "Criar"}
              </Text>
            </Pressable>
          </View>

        </View>
      </Composer>

      {/* RESUMO */}

      <View style={styles.summary}>
        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {goals.length}
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Objetivos
          </Text>
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {activeGoals}
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Ativos
          </Text>
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {completedGoals}
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Concluídos
          </Text>
        </View>

        <View
          style={
            styles.summaryCard
          }
        >
          <Text
            style={
              styles.summaryNumber
            }
          >
            {averageProgress}%
          </Text>

          <Text
            style={
              styles.summaryLabel
            }
          >
            Média
          </Text>
        </View>
      </View>

      {/* LISTA */}

      <View
        style={
          styles.sectionHeader
        }
      >
        <Text
          style={
            styles.sectionTitle
          }
        >
          Meus objetivos
        </Text>

        <Pressable
          onPress={loadGoals}
        >
          <Text
            style={
              styles.refreshText
            }
          >
            Atualizar
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
        />
      ) : goals.length === 0 ? (
        <View
          style={
            styles.emptyCard
          }
        >
          <Text
            style={
              styles.emptyTitle
            }
          >
            Nenhum objetivo
          </Text>

          <Text
            style={
              styles.emptyText
            }
          >
            Toque em + para criar seu
            primeiro objetivo.
          </Text>
        </View>
      ) : (
        goals.map((goal) => (
          <View
            key={goal.id}
            style={styles.goalCard}
          >
            <View
              style={
                styles.goalHeader
              }
            >
              <View
                style={
                  styles.goalTitleArea
                }
              >
                <Text
                  style={
                    styles.goalTitle
                  }
                  numberOfLines={2}
                >
                  {goal.title}
                </Text>

                <Text
                  style={
                    styles.goalStatus
                  }
                >
                  {goal.status}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  editGoal(goal)
                }
              >
                <Text
                  style={
                    styles.editText
                  }
                >
                  Editar
                </Text>
              </Pressable>
            </View>

            <Text
              style={[
                styles.description,
                !goal.description && styles.hiddenDescription,
              ]}
              numberOfLines={2}
            >
              {goal.description || "Sem descrição"}
            </Text>

            <View
              style={
                styles.progressHeader
              }
            >
              <Text
                style={
                  styles.progressLabel
                }
              >
                Progresso
              </Text>

              <Text
                style={
                  styles.progressValue
                }
              >
                {goal.progress ?? 0}%
              </Text>
            </View>

            <View
              style={
                styles.progressTrack
              }
            >
              <View
                style={[
                  styles.progressBar,
                  {
                    width:
                      `${Math.min(
                        100,
                        Math.max(
                          0,
                          goal.progress ??
                            0
                        )
                      )}%`,
                  },
                ]}
              />
            </View>

            <View
              style={
                styles.goalFooter
              }
            >
              <View>
                <Text
                  style={
                    styles.deadlineLabel
                  }
                >
                  Prazo
                </Text>

                <Text
                  style={
                    styles.deadline
                  }
                >
                  {formatDate(
                    goal.deadline
                  )}
                </Text>
              </View>

              <Pressable
                onPress={() =>
                  deleteGoal(goal)
                }
              >
                <Text
                  style={
                    styles.deleteText
                  }
                >
                  Excluir
                </Text>
              </Pressable>
            </View>
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#142030",
    borderRadius: 10,
    padding: 16,
  },

  label: {
    color: "#8d96a5",
    fontSize: 11,
    fontWeight: "600",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    backgroundColor: "#0e1928",
    borderWidth: 1,
    borderColor: "#23334a",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 11,
    color: "#fff",
    fontSize: 14,
  },

  textarea: {
    minHeight: 85,
    textAlignVertical: "top",
  },

  maskedInput: {
    position: "relative",
    justifyContent: "center",
  },

  maskedTextInput: {
    paddingRight: 38,
  },

  inputSuffix: {
    position: "absolute",
    right: 13,
    color: "#7e8da3",
    fontSize: 14,
  },

  statusOptions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },

  statusOption: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#0e1117",
    borderWidth: 1,
    borderColor: "#2a303b",
    borderRadius: 8,
  },

  statusOptionSelected: {
    backgroundColor: "#17283f",
    borderColor: "#35547a",
  },

  statusOptionText: {
    color: "#858d9b",
    fontSize: 11,
  },

  statusOptionTextSelected: {
    color: "#fff",
  },

  formActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    marginTop: 20,
  },

  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#303744",
    borderRadius: 8,
  },

  cancelText: {
    color: "#a1a8b4",
    fontWeight: "600",
  },

  saveButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: "#fff",
    borderRadius: 8,
  },

  saveText: {
    color: "#111",
    fontWeight: "700",
  },

  summary: {
    flexDirection: "row",
    gap: 7,
    marginBottom: 26,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#152130",
    borderRadius: 9,
    paddingVertical: 13,
    alignItems: "center",
  },

  summaryNumber: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  summaryLabel: {
    color: "#747d8c",
    fontSize: 8,
    marginTop: 4,
  },

  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },

  sectionTitle: {
    flex: 1,
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  refreshText: {
    color: "#8199b8",
    fontSize: 11,
  },

  emptyCard: {
    padding: 30,
    alignItems: "center",
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#152130",
    borderRadius: 10,
  },

  emptyTitle: {
    color: "#fff",
    fontWeight: "700",
  },

  emptyText: {
    color: "#747d8c",
    fontSize: 11,
    marginTop: 6,
  },

  goalCard: {
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#152130",
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    minHeight: 270,
  },

  goalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 68,
  },

  goalTitleArea: {
    flex: 1,
  },

  goalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  goalStatus: {
    color: "#91afd5",
    fontSize: 10,
    marginTop: 6,
  },

  editText: {
    color: "#91afd5",
    fontSize: 11,
  },

  description: {
    color: "#8f98a7",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 13,
    minHeight: 36,
  },

  hiddenDescription: {
    opacity: 0,
  },

  progressHeader: {
    flexDirection: "row",
    marginTop: "auto",
    marginBottom: 7,
  },

  progressLabel: {
    flex: 1,
    color: "#747d8c",
    fontSize: 10,
  },

  progressValue: {
    color: "#b5bdc9",
    fontSize: 11,
    fontWeight: "700",
  },

  progressTrack: {
    height: 6,
    backgroundColor: "#202631",
    borderRadius: 5,
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#6f91bd",
  },

  goalFooter: {
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#192637",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  deadlineLabel: {
    color: "#697281",
    fontSize: 9,
  },

  deadline: {
    color: "#aeb6c4",
    fontSize: 11,
    marginTop: 2,
  },

  deleteText: {
    color: "#d87878",
    fontSize: 11,
  },
});
