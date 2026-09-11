import { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";

const API_URL = "http://100.71.224.93:8080/api/notes";

type Note = {
  id: number;
  title: string;
  content: string;
};

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);


  
  async function loadNotes() {
    try {
      setLoading(true);

      const response = await fetch(API_URL);

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data: Note[] = await response.json();

      setNotes(data);
    } catch (error) {
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

      setTitle("");
      setContent("");
    } catch (error) {
      console.log("Erro ao salvar nota:", error);
    }
  }



  async function deleteNote(id: number) {
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      setNotes((current) =>
        current.filter((note) => note.id !== id)
      );
    } catch (error) {
      console.log("Erro ao excluir nota:", error);
    }
  }



  useEffect(() => {
    loadNotes();
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      <Text style={styles.title}>Notas</Text>

      <Text style={styles.subtitle}>
        Suas anotações sincronizadas com a Central.
      </Text>

      <View style={styles.editor}>
        <TextInput
          style={styles.input}
          placeholder="Título"
          placeholderTextColor="#69717e"
          value={title}
          onChangeText={setTitle}
        />

        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="Escreva sua nota..."
          placeholderTextColor="#69717e"
          value={content}
          onChangeText={setContent}
          multiline
        />

        <Pressable
          style={styles.saveButton}
          onPress={addNote}
        >
          <Text style={styles.saveButtonText}>
            Salvar nota
          </Text>
        </Pressable>
      </View>

      <View style={styles.notesList}>
        {loading ? (
          <Text style={styles.emptyText}>
            Carregando notas...
          </Text>
        ) : notes.length === 0 ? (
          <Text style={styles.emptyText}>
            Nenhuma nota criada ainda.
          </Text>
        ) : (
          notes.map((note) => (
            <View
              key={note.id}
              style={styles.noteCard}
            >
              <Text style={styles.noteTitle}>
                {note.title}
              </Text>

              <Text style={styles.noteContent}>
                {note.content}
              </Text>

              <Pressable
                onPress={() => deleteNote(note.id)}
              >
                <Text style={styles.deleteText}>
                  Excluir
                </Text>
              </Pressable>
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
  },

  contentContainer: {
    padding: 20,
    paddingBottom: 50,
  },

  title: {
    color: "#ffffff",
    fontSize: 30,
    fontWeight: "700",
    marginTop: 35,
  },

  subtitle: {
    color: "#858d9b",
    marginTop: 6,
    marginBottom: 20,
  },

  editor: {
    backgroundColor: "#131720",
    borderWidth: 1,
    borderColor: "#252b36",
    borderRadius: 14,
    padding: 16,
    gap: 12,
  },

  input: {
    backgroundColor: "#0e1117",
    borderWidth: 1,
    borderColor: "#2a303b",
    color: "#ffffff",
    borderRadius: 9,
    padding: 12,
  },

  textarea: {
    minHeight: 120,
    textAlignVertical: "top",
  },

  saveButton: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 9,
    alignItems: "center",
  },

  saveButtonText: {
    color: "#111111",
    fontWeight: "700",
  },

  notesList: {
    marginTop: 20,
    gap: 12,
  },

  noteCard: {
    backgroundColor: "#131720",
    borderWidth: 1,
    borderColor: "#252b36",
    borderRadius: 14,
    padding: 16,
  },

  noteTitle: {
    color: "#ffffff",
    fontSize: 17,
    fontWeight: "700",
  },

  noteContent: {
    color: "#a1a8b4",
    marginTop: 8,
    marginBottom: 12,
  },

  deleteText: {
    color: "#d87878",
  },

  emptyText: {
    color: "#747d8c",
    textAlign: "center",
    padding: 30,
  },
});