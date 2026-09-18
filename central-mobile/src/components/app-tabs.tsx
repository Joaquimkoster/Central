import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function AppTabs() {
  return (
    <NativeTabs
      backgroundColor="#03070c"
      indicatorColor="#203b60"
      labelStyle={{
        selected: { color: "#ffffff" },
      }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="notes">
        <NativeTabs.Trigger.Label>Notas</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/notes.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="tasks">
        <NativeTabs.Trigger.Label>Tarefas</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tasks.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="reminders">
        <NativeTabs.Trigger.Label>Lembretes</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/bell.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="calendar">
        <NativeTabs.Trigger.Label>Calendário</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/calendar.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="goals">
        <NativeTabs.Trigger.Label>
          Objetivos
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          src={require("@/assets/icons/tasks.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="workouts">
        <NativeTabs.Trigger.Label>Treinos</NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon
          sf="dumbbell"
          md="fitness_center"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
