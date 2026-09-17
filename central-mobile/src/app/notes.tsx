import {
  Screen,
  Composer,
  PrimaryButton,
  Icon,
  ui,
} from "@/components/central-ui";
import { useEffect, useState } from "react";

import { View, Text, TextInput, Pressable, StyleSheet } from "react-native";

const API_URL = "http://100.71.224.93:8080/api/notes";

type Note = {
  id: number;
  title: string;
  content: string;
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [editorOpen, setEditorOpen] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  async function loadNotes() {
    try {
      setError("");
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: Note[] = await response.json();

      setNotes(data);
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao carregar notas:", error);
    } finally {
      setLoading(false);
    }
  }

  async function addNote() {
    if (!title.trim() && !content.trim()) {
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
          title: title.trim() || "Sem título",
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const savedNote: Note = await response.json();

      setNotes((current) => [savedNote, ...current]);

      setEditorOpen(false);
      setTitle("");
      setContent("");
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao salvar nota:", error);
    }
  }

  async function deleteNote(id: number) {
    try {
      setError("");
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      setNotes((current) => current.filter((note) => note.id !== id));
    } catch (error) {
      setError(
        "Não foi possível conectar. Verifique sua conexão e tente novamente.",
      );
      console.log("Erro ao excluir nota:", error);
    }
  }

  useEffect(() => {
    loadNotes();
  }, []);

  const visibleItems = notes.filter((note) =>
    `${note.title} ${note.content}`
      .toLocaleLowerCase()
      .includes(search.toLocaleLowerCase()),
  );

  return (
    <Screen
      title="Notas"
      subtitle="Suas ideias, em um só lugar"
      onRefresh={loadNotes}
      action={
        <PrimaryButton title="Nova nota" onPress={() => setEditorOpen(true)} />
      }
    >
      <TextInput
        accessibilityLabel="Buscar notas"
        placeholder="Buscar notas..."
        placeholderTextColor="#7e8da3"
        value={search}
        onChangeText={setSearch}
        style={ui.search}
      />
      <Text style={{ color: "#8ea4c2", fontSize: 12 }}>
        Todas as notas · {visibleItems.length}
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={ui.error}>
          {error}
        </Text>
      )}
      <Composer
        title="Nova nota"
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
            accessibilityLabel="Título"
            style={styles.input}
            placeholder="Título"
            placeholderTextColor="#69717e"
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            accessibilityLabel="Escreva sua nota..."
            style={[styles.input, styles.textarea]}
            placeholder="Escreva sua nota..."
            placeholderTextColor="#69717e"
            value={content}
            onChangeText={setContent}
            multiline
          />

          <Pressable style={styles.saveButton} onPress={addNote}>
            <Text style={styles.saveButtonText}>Salvar nota</Text>
          </Pressable>
        </View>
      </Composer>
      <View style={styles.notesList}>
        {loading ? (
          <Text style={styles.emptyText}>Carregando notas...</Text>
        ) : visibleItems.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma nota encontrada.</Text>
        ) : (
          visibleItems.map((note) => (
            <View key={note.id} style={styles.noteCard}>
              <Icon name="notes" size={20} />
              <View style={{ flex: 1 }}>
                <Text style={styles.noteTitle}>{note.title}</Text>
                <Text style={styles.noteContent}>{note.content}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Excluir ${note.title}`}
                hitSlop={8}
                onPress={() => deleteNote(note.id)}
              >
                <Text style={styles.deleteText}>Excluir</Text>
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
    minHeight: 120,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#315b9d",
    padding: 14,
    minHeight: 48,
    borderRadius: 9,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#ffffff",
    fontWeight: "700",
  },

  notesList: {
    marginTop: 0,
    gap: 8,
  },

  noteCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#142030",
    borderRadius: 10,
    padding: 16,
  },

  noteTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  noteContent: {
    fontSize: 12,
    lineHeight: 19,
    color: "#a1a8b4",
    marginTop: 8,
    marginBottom: 0,
  },

  deleteText: {
    fontSize: 11,
    paddingVertical: 4,
    color: "#d87878",
  },

  emptyText: {
    color: "#747d8c",
    textAlign: "center",
    padding: 30,
  },
});
