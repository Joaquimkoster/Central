import { useRef, useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const icons = {
  refresh: require("../../assets/icons/refresh.png"),
  home: require("../../assets/icons/home.png"),
  notes: require("../../assets/icons/notes.png"),
  tasks: require("../../assets/icons/tasks.png"),
  bell: require("../../assets/icons/bell.png"),
  calendar: require("../../assets/icons/calendar.png"),
  goal: require("../../assets/icons/goal.png"),
  book: require("../../assets/icons/book.png"),
  clock: require("../../assets/icons/clock.png"),
  moon: require("../../assets/icons/moon.png"),
  pc: require("../../assets/icons/pc.png"),
  bot: require("../../assets/icons/bot.png"),
  chevron: require("../../assets/icons/chevron.png"),
  plus: require("../../assets/icons/plus.png"),
  search: require("../../assets/icons/search.png"),
};
export type IconName = keyof typeof icons;
export function Icon({ name, size = 21 }: { name: IconName; size?: number }) {
  return (
    <Image
      source={icons[name]}
      style={{ width: size, height: size }}
      accessibilityIgnoresInvertColors
    />
  );
}
export function Screen({
  title,
  subtitle,
  onRefresh,
  children,
  action,
  compact = false,
}: {
  title: string;
  subtitle: string;
  onRefresh?: () => Promise<void>;
  children: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [revision, setRevision] = useState(0);
  const scroll = useRef<ScrollView>(null);
  const busy = useRef(false);
  async function refresh() {
    if (busy.current) return;
    busy.current = true;
    setRefreshing(true);
    try {
      if (onRefresh) await onRefresh();
      else setRevision((value) => value + 1);
      scroll.current?.scrollTo({ y: 0, animated: true });
    } finally {
      busy.current = false;
      setRefreshing(false);
    }
  }
  return (
    <SafeAreaView edges={["top", "left", "right"]} style={ui.screen}>
      <View style={ui.header}>
        <View style={{ flex: 1 }}>
          <Text accessibilityRole="header" style={ui.title}>
            {title}
          </Text>
          <Text style={ui.subtitle}>{subtitle}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Atualizar página"
          accessibilityState={{ disabled: refreshing, busy: refreshing }}
          disabled={refreshing}
          onPress={refresh}
          hitSlop={5}
          style={({ pressed }) => [ui.badge, pressed && { opacity: 0.7 }]}
        >
          {refreshing ? (
            <ActivityIndicator color="#c1cde0" size="small" />
          ) : (
            <Icon name="refresh" />
          )}
        </Pressable>
      </View>
      <ScrollView
        ref={scroll}
        key={revision}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[ui.body, compact && { gap: 6 }]}
      >
        {children}
      </ScrollView>
      {action && <View style={ui.footer}>{action}</View>}
    </SafeAreaView>
  );
}
export function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [ui.primary, pressed && { opacity: 0.75 }]}
    >
      <Icon name="plus" size={18} />
      <Text style={ui.primaryText}>{title}</Text>
    </Pressable>
  );
}
export function Composer({
  title,
  visible,
  onClose,
  children,
}: {
  title: string;
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={ui.overlay}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <SafeAreaView style={ui.sheet}>
          <View style={ui.sheetHeader}>
            <Text style={ui.sheetTitle}>{title}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fechar formulário"
              onPress={onClose}
              style={ui.close}
            >
              <Text style={ui.closeText}>✕</Text>
            </Pressable>
          </View>
          <ScrollView keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
export function Segments({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={ui.segments}>
      {options.map((option) => (
        <Pressable
          key={option}
          accessibilityRole="button"
          accessibilityState={{ selected: option === value }}
          onPress={() => onChange(option)}
          style={[ui.segment, option === value && ui.selected]}
        >
          <Text style={[ui.segmentText, option === value && { color: "#fff" }]}>
            {option}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
export function ComingSoon({ name }: { name: string }) {
  const [open, setOpen] = useState(false);
  const icon: IconName =
    (
      {
        Calendário: "calendar",
        Estudos: "book",
        "Tempo de tela": "clock",
        Diário: "notes",
        Sono: "moon",
        "Controle do PC": "pc",
        Darly: "bot",
      } as Record<string, IconName>
    )[name] || "goal";
  return (
    <>
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen(true)}
        style={ui.menuRow}
      >
        <Icon name={icon} />
        <Text style={ui.menuText}>{name}</Text>
        <Icon name="chevron" size={16} />
      </Pressable>
      <Composer title={name} visible={open} onClose={() => setOpen(false)}>
        <Text style={ui.notice}>Este módulo está em desenvolvimento.</Text>
      </Composer>
    </>
  );
}
export const ui = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#050b12" },
  header: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  title: {
    color: "#f4f6fb",
    fontSize: 27,
    fontWeight: "700",
    letterSpacing: -0.8,
  },
  subtitle: { color: "#8996ac", fontSize: 12, marginTop: 5 },
  badge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#213d65",
    alignItems: "center",
    justifyContent: "center",
  },
  body: { paddingHorizontal: 20, paddingBottom: 24, gap: 12, flexGrow: 1 },
  footer: { padding: 20, paddingTop: 12, backgroundColor: "#050b12" },
  primary: {
    minHeight: 48,
    backgroundColor: "#315b9d",
    borderWidth: 1,
    borderColor: "#416cb0",
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "#000000aa",
  },
  sheet: {
    maxHeight: "90%",
    backgroundColor: "#0b1421",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sheetTitle: { fontSize: 21, fontWeight: "700", color: "#fff" },
  close: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: { color: "#aab8cc", fontSize: 20 },
  segments: {
    flexDirection: "row",
    padding: 4,
    backgroundColor: "#0b1420",
    borderRadius: 10,
  },
  segment: {
    flex: 1,
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  selected: { backgroundColor: "#304f7c" },
  segmentText: { fontSize: 12, color: "#99a7bb" },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: "#0b1420",
    borderWidth: 1,
    borderColor: "#152130",
    borderRadius: 9,
    paddingHorizontal: 13,
    minHeight: 44,
  },
  menuText: { flex: 1, color: "#e4eaf4", fontSize: 14 },
  notice: { color: "#aab8cc", padding: 16, lineHeight: 22 },
  error: {
    color: "#f0a0a0",
    fontSize: 13,
    padding: 12,
    backgroundColor: "#281921",
    borderRadius: 8,
  },
  search: {
    color: "#edf2fa",
    backgroundColor: "#101b29",
    borderWidth: 1,
    borderColor: "#192637",
    padding: 13,
    borderRadius: 9,
    fontSize: 14,
  },
});
