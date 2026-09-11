import { View, Text, StyleSheet, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";

const menuItems = [
  "Notas",
  "Tarefas",
  "Lembretes",
  "Calendário",
  "Objetivos",
  "Treinos",
  "Estudos",
  "Tempo de tela",
  "Controle de vícios",
  "Diário",
  "Sono",
  "Controle do PC",
  "Darly",
];

export default function HomeScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Central</Text>
        <Text style={styles.subtitle}>Sua central pessoal</Text>
      </View>

      <View style={styles.grid}>
        {menuItems.map((item) => (
          <Pressable
            key={item}
            style={styles.card}
            onPress={() => {
              if (item === "Notas") {
                router.push("/notes");
              }
            }}
          >
            <Text style={styles.cardText}>{item}</Text>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0b0d12",
    padding: 20,
  },

  header: {
    marginTop: 35,
    marginBottom: 25,
  },

  title: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "700",
  },

  subtitle: {
    color: "#858d9b",
    marginTop: 6,
    fontSize: 15,
  },

  grid: {
    gap: 12,
    paddingBottom: 40,
  },

  card: {
    backgroundColor: "#131720",
    borderWidth: 1,
    borderColor: "#252b36",
    borderRadius: 14,
    padding: 18,
  },

  cardText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "500",
  },
});