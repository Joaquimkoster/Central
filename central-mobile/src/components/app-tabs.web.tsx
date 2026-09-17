import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  type TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, Text, View, StyleSheet } from "react-native";
import { Icon, type IconName } from "./central-ui";
function TabButton({
  children,
  isFocused,
  icon,
  ...props
}: TabTriggerSlotProps & { icon: IconName }) {
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      style={styles.tab}
    >
      <View style={[styles.icon, isFocused && styles.active]}>
        <Icon name={icon} size={20} />
      </View>
      <Text style={[styles.label, isFocused && { color: "#fff" }]}>
        {children}
      </Text>
    </Pressable>
  );
}
export default function AppTabs() {
  return (
    <Tabs style={styles.root}>
      <TabSlot style={{ flex: 1 }} />
      <TabList style={styles.bar}>
        <TabTrigger name="home" href="/" asChild>
          <TabButton icon="home">Início</TabButton>
        </TabTrigger>
        <TabTrigger name="notes" href="/notes" asChild>
          <TabButton icon="notes">Notas</TabButton>
        </TabTrigger>
        <TabTrigger name="tasks" href="/tasks" asChild>
          <TabButton icon="tasks">Tarefas</TabButton>
        </TabTrigger>
        <TabTrigger name="reminders" href="/reminders" asChild>
          <TabButton icon="bell">Lembretes</TabButton>
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#050b12" },
  bar: {
    flexDirection: "row",
    backgroundColor: "#03070c",
    borderTopWidth: 1,
    borderTopColor: "#142030",
    paddingTop: 7,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  icon: { paddingHorizontal: 14, paddingVertical: 4, borderRadius: 20 },
  active: { backgroundColor: "#203b60" },
  label: { color: "#8592a8", fontSize: 10 },
});
