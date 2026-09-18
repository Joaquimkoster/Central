import { Pressable, Text } from "react-native";
import { router, type Href } from "expo-router";
import {
  Screen,
  Icon,
  ComingSoon,
  ui,
  type IconName,
} from "@/components/central-ui";
const pages: { title: string; route: Href; icon: IconName }[] = [
  { title: "Notas", route: "/notes", icon: "notes" },
  { title: "Tarefas", route: "/tasks", icon: "tasks" },
  { title: "Lembretes", route: "/reminders", icon: "bell" },
  { title: "Calendário", route: "/calendar", icon: "calendar" },
  { title: "Objetivos", route: "/goals", icon: "goal" },
  { title: "Treinos", route: "/workouts" as Href, icon: "workout" },
];
const planned = [
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
    <Screen title="Central" subtitle="Sua central pessoal" compact>
      {pages.map((page) => (
        <Pressable
          key={page.title}
          accessibilityRole="button"
          onPress={() => router.push(page.route)}
          style={({ pressed }) => [
            ui.menuRow,
            pressed && { backgroundColor: "#17283f" },
          ]}
        >
          <Icon name={page.icon} />
          <Text style={ui.menuText}>{page.title}</Text>
          <Icon name="chevron" size={16} />
        </Pressable>
      ))}
      {planned.map((name) => (
        <ComingSoon key={name} name={name} />
      ))}
    </Screen>
  );
}
