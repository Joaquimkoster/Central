import { useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Composer, PrimaryButton, Screen } from "@/components/central-ui";
import ExerciseLibrary from "@/components/workouts/ExerciseLibrary";

const tabs = [
  "Meu Treino",
  "Exercícios",
  "Frequência",
  "Progresso",
  "Fotos",
  "Recordes",
] as const;

type WorkoutTab = (typeof tabs)[number];

type Exercise = {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  rest: number;
  notes: string;
};

type Workout = {
  id: string;
  name: string;
  description: string;
  exercises: Exercise[];
};

type WorkoutForm = { name: string; description: string };
type ExerciseForm = {
  name: string;
  sets: string;
  reps: string;
  weight: string;
  rest: string;
  notes: string;
};

const emptyWorkout: WorkoutForm = { name: "", description: "" };
const emptyExercise: ExerciseForm = {
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

export default function WorkoutsScreen() {
  const [activeTab, setActiveTab] = useState<WorkoutTab>("Meu Treino");
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [workoutForm, setWorkoutForm] = useState<WorkoutForm>(emptyWorkout);
  const [editingWorkoutId, setEditingWorkoutId] = useState<string | null>(null);
  const [workoutComposerOpen, setWorkoutComposerOpen] = useState(false);
  const [exerciseForm, setExerciseForm] = useState<ExerciseForm>(emptyExercise);
  const [exerciseWorkoutId, setExerciseWorkoutId] = useState<string | null>(null);
  const [editingExerciseId, setEditingExerciseId] = useState<string | null>(null);

  function openNewWorkout() {
    setEditingWorkoutId(null);
    setWorkoutForm(emptyWorkout);
    setWorkoutComposerOpen(true);
  }

  function closeWorkoutComposer() {
    setWorkoutComposerOpen(false);
    setEditingWorkoutId(null);
    setWorkoutForm(emptyWorkout);
  }

  function editWorkout(workout: Workout) {
    setEditingWorkoutId(workout.id);
    setWorkoutForm({ name: workout.name, description: workout.description });
    setWorkoutComposerOpen(true);
  }

  function saveWorkout() {
    const name = workoutForm.name.trim();
    if (!name) {
      Alert.alert("Atenção", "Digite o nome do treino.");
      return;
    }

    if (editingWorkoutId) {
      setWorkouts((current) =>
        current.map((workout) =>
          workout.id === editingWorkoutId
            ? { ...workout, name, description: workoutForm.description.trim() }
            : workout,
        ),
      );
    } else {
      const id = createId();
      setWorkouts((current) => [
        ...current,
        { id, name, description: workoutForm.description.trim(), exercises: [] },
      ]);
      setExpanded((current) => [...current, id]);
    }
    closeWorkoutComposer();
  }

  function confirmDeleteWorkout(workout: Workout) {
    Alert.alert("Excluir treino", `Deseja excluir “${workout.name}”?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => {
          setWorkouts((current) => current.filter((item) => item.id !== workout.id));
          setExpanded((current) => current.filter((id) => id !== workout.id));
          if (exerciseWorkoutId === workout.id) closeExerciseComposer();
        },
      },
    ]);
  }

  function openNewExercise(workoutId: string) {
    setExerciseWorkoutId(workoutId);
    setEditingExerciseId(null);
    setExerciseForm(emptyExercise);
  }

  function editExercise(workoutId: string, exercise: Exercise) {
    setExerciseWorkoutId(workoutId);
    setEditingExerciseId(exercise.id);
    setExerciseForm({
      name: exercise.name,
      sets: String(exercise.sets),
      reps: String(exercise.reps),
      weight: String(exercise.weight),
      rest: String(exercise.rest),
      notes: exercise.notes,
    });
  }

  function closeExerciseComposer() {
    setExerciseWorkoutId(null);
    setEditingExerciseId(null);
    setExerciseForm(emptyExercise);
  }

  function saveExercise() {
    const values = {
      name: exerciseForm.name.trim(),
      sets: Number(exerciseForm.sets),
      reps: Number(exerciseForm.reps),
      weight: Number(exerciseForm.weight),
      rest: Number(exerciseForm.rest),
    };
    if (!values.name || values.sets < 1 || values.reps < 1 || values.weight < 0 || values.rest < 0) {
      Alert.alert("Atenção", "Preencha corretamente todos os campos obrigatórios.");
      return;
    }

    setWorkouts((current) =>
      current.map((workout) => {
        if (workout.id !== exerciseWorkoutId) return workout;
        const exercise: Exercise = {
          id: editingExerciseId ?? createId(),
          ...values,
          notes: exerciseForm.notes.trim(),
        };
        return {
          ...workout,
          exercises: editingExerciseId
            ? workout.exercises.map((item) => item.id === editingExerciseId ? exercise : item)
            : [...workout.exercises, exercise],
        };
      }),
    );
    closeExerciseComposer();
  }

  function confirmDeleteExercise(workoutId: string, exercise: Exercise) {
    Alert.alert("Excluir exercício", `Deseja excluir “${exercise.name}”?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: () => setWorkouts((current) =>
          current.map((workout) => workout.id === workoutId
            ? { ...workout, exercises: workout.exercises.filter((item) => item.id !== exercise.id) }
            : workout),
        ),
      },
    ]);
  }

  function toggleWorkout(id: string) {
    setExpanded((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id]);
  }

  const action = activeTab === "Meu Treino"
    ? <PrimaryButton title="Criar treino" onPress={openNewWorkout} />
    : undefined;

  return (
    <Screen
      title="Treinos"
      subtitle="Acompanhe seus treinos, evolução e desempenho"
      action={action}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {tabs.map((tab) => (
          <Pressable
            key={tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
            onPress={() => setActiveTab(tab)}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>{tab}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {activeTab === "Meu Treino" ? (
        <View style={styles.content}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Meu Treino</Text>
            <Text style={styles.sectionSubtitle}>Organize sua rotina atual de treinamento.</Text>
          </View>

          {workouts.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nenhum treino cadastrado</Text>
              <Text style={styles.emptyText}>Use o botão abaixo para criar seu primeiro treino.</Text>
            </View>
          ) : workouts.map((workout) => {
            const isExpanded = expanded.includes(workout.id);
            return (
              <View key={workout.id} style={styles.workoutCard}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: isExpanded }}
                  onPress={() => toggleWorkout(workout.id)}
                  style={styles.workoutHeader}
                >
                  <View style={styles.chevronBox}><Text style={styles.chevron}>{isExpanded ? "⌄" : "›"}</Text></View>
                  <View style={styles.workoutTitleArea}>
                    <Text style={styles.workoutTitle} numberOfLines={2}>{workout.name}</Text>
                    <Text style={styles.workoutCount}>{workout.exercises.length} {workout.exercises.length === 1 ? "exercício" : "exercícios"}</Text>
                  </View>
                </Pressable>

                {isExpanded && (
                  <View style={styles.workoutBody}>
                    {!!workout.description && <Text style={styles.description}>{workout.description}</Text>}
                    <View style={styles.cardActions}>
                      <SmallButton label="Editar treino" onPress={() => editWorkout(workout)} />
                      <SmallButton label="Excluir" danger onPress={() => confirmDeleteWorkout(workout)} />
                    </View>
                    <View style={styles.exerciseHeading}>
                      <Text style={styles.exerciseHeadingText}>EXERCÍCIOS</Text>
                      <SmallButton label="+ Adicionar" onPress={() => openNewExercise(workout.id)} />
                    </View>
                    {workout.exercises.length === 0 ? (
                      <Text style={styles.exerciseEmpty}>Nenhum exercício adicionado.</Text>
                    ) : workout.exercises.map((exercise) => (
                      <View key={exercise.id} style={styles.exerciseCard}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        {!!exercise.notes && <Text style={styles.exerciseNotes}>{exercise.notes}</Text>}
                        <View style={styles.stats}>
                          <Stat label="Séries × reps" value={`${exercise.sets} × ${exercise.reps}`} />
                          <Stat label="Carga" value={`${exercise.weight} kg`} />
                          <Stat label="Descanso" value={`${exercise.rest}s`} />
                        </View>
                        <View style={styles.cardActions}>
                          <SmallButton label="Editar" onPress={() => editExercise(workout.id, exercise)} />
                          <SmallButton label="Excluir" danger onPress={() => confirmDeleteExercise(workout.id, exercise)} />
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      ) : activeTab === "Exercícios" ? (
        <ExerciseLibrary />
      ) : (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>{activeTab}</Text>
          <Text style={styles.emptyText}>Esta área será conectada aos dados de treino em uma próxima etapa.</Text>
        </View>
      )}

      <Composer
        title={editingWorkoutId ? "Editar treino" : "Novo treino"}
        visible={workoutComposerOpen}
        onClose={closeWorkoutComposer}
      >
        <View style={styles.form}>
          <Field label="Nome do treino *">
            <TextInput
              style={styles.input}
              value={workoutForm.name}
              onChangeText={(name) => setWorkoutForm((current) => ({ ...current, name }))}
              placeholder="Ex.: Treino A — Peito e Tríceps"
              placeholderTextColor="#5f6c7e"
              autoFocus
            />
          </Field>
          <Field label="Descrição">
            <TextInput
              style={[styles.input, styles.textarea]}
              value={workoutForm.description}
              onChangeText={(description) => setWorkoutForm((current) => ({ ...current, description }))}
              placeholder="Objetivo ou detalhes da rotina"
              placeholderTextColor="#5f6c7e"
              multiline
            />
          </Field>
          <FormActions onCancel={closeWorkoutComposer} onSave={saveWorkout} saveLabel={editingWorkoutId ? "Salvar" : "Criar treino"} />
        </View>
      </Composer>

      <Composer
        title={editingExerciseId ? "Editar exercício" : "Novo exercício"}
        visible={exerciseWorkoutId !== null}
        onClose={closeExerciseComposer}
      >
        <View style={styles.form}>
          <Field label="Nome *"><TextInput style={styles.input} value={exerciseForm.name} onChangeText={(name) => setExerciseForm((current) => ({ ...current, name }))} placeholder="Ex.: Supino reto" placeholderTextColor="#5f6c7e" autoFocus /></Field>
          <View style={styles.formRow}>
            <NumberField label="Séries *" value={exerciseForm.sets} onChange={(sets) => setExerciseForm((current) => ({ ...current, sets }))} />
            <NumberField label="Repetições *" value={exerciseForm.reps} onChange={(reps) => setExerciseForm((current) => ({ ...current, reps }))} />
          </View>
          <View style={styles.formRow}>
            <NumberField label="Carga (kg) *" value={exerciseForm.weight} onChange={(weight) => setExerciseForm((current) => ({ ...current, weight }))} decimal />
            <NumberField label="Descanso (s) *" value={exerciseForm.rest} onChange={(rest) => setExerciseForm((current) => ({ ...current, rest }))} />
          </View>
          <Field label="Observação"><TextInput style={[styles.input, styles.textarea]} value={exerciseForm.notes} onChangeText={(notes) => setExerciseForm((current) => ({ ...current, notes }))} placeholder="Observação opcional" placeholderTextColor="#5f6c7e" multiline /></Field>
          <FormActions onCancel={closeExerciseComposer} onSave={saveExercise} saveLabel={editingExerciseId ? "Salvar" : "Adicionar"} />
        </View>
      </Composer>
    </Screen>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text>{children}</View>;
}

function NumberField({ label, value, onChange, decimal = false }: { label: string; value: string; onChange: (value: string) => void; decimal?: boolean }) {
  return <View style={[styles.field, styles.flexField]}><Text style={styles.label}>{label}</Text><TextInput style={styles.input} value={value} onChangeText={onChange} keyboardType={decimal ? "decimal-pad" : "number-pad"} placeholder="0" placeholderTextColor="#5f6c7e" /></View>;
}

function FormActions({ onCancel, onSave, saveLabel }: { onCancel: () => void; onSave: () => void; saveLabel: string }) {
  return <View style={styles.formActions}><Pressable onPress={onCancel} style={styles.cancelButton}><Text style={styles.cancelText}>Cancelar</Text></Pressable><Pressable onPress={onSave} style={styles.saveButton}><Text style={styles.saveText}>{saveLabel}</Text></Pressable></View>;
}

function SmallButton({ label, onPress, danger = false }: { label: string; onPress: () => void; danger?: boolean }) {
  return <Pressable onPress={onPress} style={styles.smallButton}><Text style={[styles.smallButtonText, danger && styles.dangerText]}>{label}</Text></Pressable>;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  tabs: { gap: 6, padding: 4, backgroundColor: "#0b1420", borderRadius: 10 },
  tab: { minHeight: 38, paddingHorizontal: 14, alignItems: "center", justifyContent: "center", borderRadius: 8 },
  tabActive: { backgroundColor: "#304f7c" },
  tabText: { color: "#8996aa", fontSize: 12, fontWeight: "600" },
  tabTextActive: { color: "#ffffff" },
  content: { gap: 10 },
  sectionHeading: { marginVertical: 6 },
  sectionTitle: { color: "#f2f5fa", fontSize: 19, fontWeight: "700" },
  sectionSubtitle: { color: "#8491a4", fontSize: 12, marginTop: 5 },
  emptyCard: { minHeight: 160, padding: 24, alignItems: "center", justifyContent: "center", backgroundColor: "#0d1622", borderWidth: 1, borderColor: "#1b2839", borderRadius: 11 },
  emptyTitle: { color: "#e7edf6", fontSize: 15, fontWeight: "600" },
  emptyText: { color: "#748196", fontSize: 12, lineHeight: 18, marginTop: 7, textAlign: "center" },
  workoutCard: { overflow: "hidden", backgroundColor: "#0d1622", borderWidth: 1, borderColor: "#1b2839", borderRadius: 11 },
  workoutHeader: { minHeight: 68, padding: 14, flexDirection: "row", alignItems: "center", gap: 11 },
  chevronBox: { width: 29, height: 29, alignItems: "center", justifyContent: "center", backgroundColor: "#17253a", borderRadius: 8 },
  chevron: { color: "#a8c0e2", fontSize: 20 },
  workoutTitleArea: { flex: 1, gap: 4 },
  workoutTitle: { color: "#edf2fa", fontSize: 15, fontWeight: "600" },
  workoutCount: { color: "#758298", fontSize: 10 },
  workoutBody: { gap: 12, padding: 14, borderTopWidth: 1, borderTopColor: "#1b2839", backgroundColor: "#09111b" },
  description: { color: "#8b98aa", fontSize: 12, lineHeight: 18 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", gap: 6 },
  smallButton: { minHeight: 34, paddingHorizontal: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#131e2d", borderWidth: 1, borderColor: "#253449", borderRadius: 7 },
  smallButtonText: { color: "#b5c2d5", fontSize: 11, fontWeight: "600" },
  dangerText: { color: "#d38a8a" },
  exerciseHeading: { marginTop: 5, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  exerciseHeadingText: { color: "#8594aa", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  exerciseEmpty: { padding: 22, color: "#6f7b8e", fontSize: 12, textAlign: "center", borderWidth: 1, borderStyle: "dashed", borderColor: "#263244", borderRadius: 8 },
  exerciseCard: { gap: 8, padding: 13, backgroundColor: "#101a28", borderWidth: 1, borderColor: "#1e2b3d", borderRadius: 9 },
  exerciseName: { color: "#edf2fa", fontSize: 14, fontWeight: "600" },
  exerciseNotes: { color: "#768398", fontSize: 11 },
  stats: { flexDirection: "row", gap: 8 },
  stat: { flex: 1, gap: 3, padding: 8, backgroundColor: "#0b1420", borderRadius: 7 },
  statLabel: { color: "#69768a", fontSize: 9 },
  statValue: { color: "#e0e7f1", fontSize: 12, fontWeight: "600" },
  form: { gap: 15, paddingBottom: 12 },
  field: { gap: 7 },
  flexField: { flex: 1 },
  label: { color: "#98a6b9", fontSize: 11, fontWeight: "600" },
  input: { minHeight: 46, paddingHorizontal: 13, color: "#edf2fa", backgroundColor: "#08121f", borderWidth: 1, borderColor: "#263750", borderRadius: 9, fontSize: 14 },
  textarea: { minHeight: 88, paddingTop: 13, textAlignVertical: "top" },
  formRow: { flexDirection: "row", gap: 10 },
  formActions: { flexDirection: "row", gap: 9, marginTop: 5 },
  cancelButton: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", backgroundColor: "#131c28", borderWidth: 1, borderColor: "#2b3748", borderRadius: 9 },
  cancelText: { color: "#aab7c9", fontWeight: "600" },
  saveButton: { flex: 1, minHeight: 46, alignItems: "center", justifyContent: "center", backgroundColor: "#315b9d", borderWidth: 1, borderColor: "#416cb0", borderRadius: 9 },
  saveText: { color: "#ffffff", fontWeight: "600" },
});
