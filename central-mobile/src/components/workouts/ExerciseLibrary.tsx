import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { Composer } from "@/components/central-ui";
import { API } from "@/config/api";

type Region = { id: number; code?: string | null; name: string; description?: string | null };
type Group = { id: number; code?: string | null; name: string; description?: string | null; bodyRegion?: Region };
type Muscle = {
  id: number;
  code?: string | null;
  name: string;
  description?: string | null;
  parentMuscleId?: number | null;
  parentMuscleName?: string | null;
  muscleGroup?: Group;
};
type ExerciseMuscle = {
  id: number;
  name: string;
  role: "PRIMARY" | "SECONDARY";
  emphasis: boolean;
  muscleGroupName?: string;
};
type Exercise = {
  id: number;
  name: string;
  description?: string | null;
  equipment?: string | null;
  muscleGroup?: string | null;
  role?: string;
  emphasis?: boolean;
  muscles?: ExerciseMuscle[];
};
type SearchResult = {
  type: "BODY_REGION" | "MUSCLE_GROUP" | "MUSCLE" | "EXERCISE";
  id: number;
  code?: string | null;
  name: string;
  description?: string | null;
  context?: string | null;
};

function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const wrapped = data as { content?: T[]; items?: T[]; results?: T[] };
    return wrapped.content ?? wrapped.items ?? wrapped.results ?? [];
  }
  return [];
}

async function request<T>(url: string, signal: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json() as Promise<T>;
}

export default function ExerciseLibrary() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [muscles, setMuscles] = useState<Muscle[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [region, setRegion] = useState<Region | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [muscle, setMuscle] = useState<Muscle | null>(null);
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [exerciseDetails, setExerciseDetails] = useState<Exercise | null>(null);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState("regions");
  const [error, setError] = useState("");
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [searching, setSearching] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    request<unknown>(API.bodyRegions, controller.signal)
      .then((data) => setRegions(asList<Region>(data)))
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") {
          console.error("Erro ao carregar regiões:", reason);
          setError("Não foi possível carregar as regiões corporais.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoading(""); });
    request<unknown>(API.exercises, controller.signal)
      .then((data) => setAllExercises(asList<Exercise>(data)))
      .catch((reason: Error) => { if (reason.name !== "AbortError") console.error("Erro ao carregar exercícios:", reason); });
    return () => controller.abort();
  }, [revision]);

  useEffect(() => {
    if (!region) return undefined;
    const controller = new AbortController();
    request<unknown>(API.regionMuscleGroups(region.id), controller.signal)
      .then((data) => setGroups(asList<Group>(data)))
      .catch((reason: Error) => handleError(reason, "Não foi possível carregar os grupos musculares."))
      .finally(() => { if (!controller.signal.aborted) setLoading(""); });
    return () => controller.abort();
  }, [region, revision]);

  useEffect(() => {
    if (!group) return undefined;
    const controller = new AbortController();
    request<unknown>(API.groupMuscles(group.id), controller.signal)
      .then((data) => {
        const items = asList<Muscle>(data);
        setMuscles(items);
        const apiGroup = items[0]?.muscleGroup;
        if (apiGroup) {
          setGroup((current) => current?.bodyRegion ? current : { ...current, ...apiGroup });
          if (apiGroup.bodyRegion) setRegion((current) => current || apiGroup.bodyRegion || null);
        }
      })
      .catch((reason: Error) => handleError(reason, "Não foi possível carregar os músculos."))
      .finally(() => { if (!controller.signal.aborted) setLoading(""); });
    return () => controller.abort();
  }, [group, revision]);

  const muscleId = muscle?.id;
  useEffect(() => {
    if (!muscleId) return undefined;
    const controller = new AbortController();
    Promise.all([
      request<Muscle>(API.muscle(muscleId), controller.signal),
      request<unknown>(API.muscleExercises(muscleId), controller.signal),
    ]).then(([muscleData, exerciseData]) => {
      setMuscle((current) => current?.id === muscleId ? { ...current, ...muscleData } : current);
      if (muscleData.muscleGroup) {
        setGroup((current) => current || muscleData.muscleGroup || null);
        if (muscleData.muscleGroup.bodyRegion) setRegion((current) => current || muscleData.muscleGroup?.bodyRegion || null);
      }
      setExercises(asList<Exercise>(exerciseData));
    }).catch((reason: Error) => handleError(reason, "Não foi possível carregar os exercícios deste músculo."))
      .finally(() => { if (!controller.signal.aborted) setLoading(""); });
    return () => controller.abort();
  }, [muscleId, revision]);

  useEffect(() => {
    const query = search.trim();
    if (!query) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      request<unknown>(`${API.exerciseLibrarySearch}?q=${encodeURIComponent(query)}`, controller.signal)
        .then((data) => setSearchResults(asList<SearchResult>(data)))
        .catch((reason: Error) => {
          if (reason.name !== "AbortError") {
            console.error("Erro na pesquisa:", reason);
            setError("Não foi possível pesquisar na biblioteca.");
          }
        }).finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search]);

  useEffect(() => {
    if (!exerciseId) return undefined;
    const controller = new AbortController();
    request<Exercise>(API.exercise(exerciseId), controller.signal)
      .then(setExerciseDetails)
      .catch((reason: Error) => {
        if (reason.name !== "AbortError") {
          console.error("Erro ao carregar detalhes:", reason);
          setDetailError("Não foi possível carregar os detalhes.");
        }
      }).finally(() => { if (!controller.signal.aborted) setDetailLoading(false); });
    return () => controller.abort();
  }, [exerciseId, revision]);

  function handleError(reason: Error, message: string) {
    if (reason.name !== "AbortError") {
      console.error(message, reason);
      setError(message);
    }
  }

  function selectRegion(value: Region) {
    setRegion(value); setGroup(null); setMuscle(null); setGroups([]); setMuscles([]); setExercises([]);
    setSearch(""); setSearchResults([]); setShowAll(false); setError(""); setLoading("groups");
  }

  function selectGroup(value: Group, selectedRegion: Region | null = region) {
    setRegion(selectedRegion); setGroup(value); setMuscle(null); setMuscles([]); setExercises([]);
    setSearch(""); setSearchResults([]); setShowAll(false); setError(""); setLoading("muscles");
  }

  function selectMuscle(value: Muscle, selectedGroup: Group | null = group, selectedRegion: Region | null = region) {
    setRegion(selectedRegion); setGroup(selectedGroup); setMuscle(value); setExercises([]);
    setSearch(""); setSearchResults([]); setShowAll(false); setError(""); setLoading("exercises");
  }

  function reset() {
    setRegion(null); setGroup(null); setMuscle(null); setGroups([]); setMuscles([]); setExercises([]);
    setSearch(""); setSearchResults([]); setShowAll(false); setError("");
  }

  function openExercise(id: number) {
    setExerciseId(id); setExerciseDetails(null); setDetailError(""); setDetailLoading(true);
  }

  function openResult(item: SearchResult) {
    if (item.type === "BODY_REGION") selectRegion(item);
    if (item.type === "MUSCLE_GROUP") selectGroup(item, null);
    if (item.type === "MUSCLE") selectMuscle(item, null, null);
    if (item.type === "EXERCISE") openExercise(item.id);
  }

  function changeSearch(value: string) {
    setSearch(value); setSearchResults([]); setError(""); setSearching(Boolean(value.trim()));
  }

  const crumbs = [
    { key: "root", label: "Exercícios", action: reset },
    ...(region ? [{ key: `r-${region.id}`, label: region.name, action: () => selectRegion(region) }] : []),
    ...(group ? [{ key: `g-${group.id}`, label: group.name, action: () => selectGroup(group, region) }] : []),
    ...(muscle ? [{ key: `m-${muscle.id}`, label: muscle.name, action: () => undefined }] : []),
    ...(showAll ? [{ key: "all", label: "Todos", action: () => undefined }] : []),
  ];

  return (
    <View style={styles.library}>
      <View><Text style={styles.title}>Exercícios</Text><Text style={styles.subtitle}>Explore exercícios por região e grupo muscular.</Text></View>
      <TextInput style={styles.search} value={search} onChangeText={changeSearch} placeholder="Pesquisar exercícios, músculos ou grupos..." placeholderTextColor="#66758a" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.crumbs}>
        {(search ? [{ key: "root", label: "Exercícios", action: reset }, { key: "search", label: `Busca: ${search}`, action: () => undefined }] : crumbs).map((item, index, items) => <View key={item.key} style={styles.crumbItem}>{index > 0 && <Text style={styles.crumbSlash}>/</Text>}<Pressable onPress={item.action} disabled={index === items.length - 1}><Text style={[styles.crumb, index === items.length - 1 && styles.crumbCurrent]}>{item.label}</Text></Pressable></View>)}
      </ScrollView>

      {search ? <SearchView results={searchResults} loading={searching} error={error} onOpen={openResult} />
        : showAll ? <ExerciseList title="Todos os exercícios" exercises={allExercises} onOpen={openExercise} onBack={() => setShowAll(false)} />
        : muscle ? <MuscleScreen muscle={muscle} region={region} group={group} exercises={exercises} loading={loading === "exercises"} error={error} onOpen={openExercise} onBack={() => { setMuscle(null); setExercises([]); setError(""); }} onRetry={() => { setExercises([]); setLoading("exercises"); setError(""); setRevision((value) => value + 1); }} />
        : group ? loading === "muscles" ? <Loading text="Carregando músculos..." /> : error ? <ErrorBox message={error} onRetry={() => { setLoading("muscles"); setError(""); setRevision((value) => value + 1); }} /> : <GroupScreen group={group} region={region} muscles={muscles} onSelect={selectMuscle} onBack={() => { setGroup(null); setMuscles([]); }} />
        : region ? loading === "groups" ? <Loading text="Carregando grupos musculares..." /> : error ? <ErrorBox message={error} onRetry={() => { setLoading("groups"); setError(""); setRevision((value) => value + 1); }} /> : <RegionScreen region={region} groups={groups} onSelect={selectGroup} onBack={reset} />
        : loading === "regions" ? <Loading text="Carregando regiões..." /> : error ? <ErrorBox message={error} onRetry={() => { setLoading("regions"); setError(""); setRevision((value) => value + 1); }} /> : <View style={styles.list}><View style={styles.intro}><Text style={styles.eyebrow}>ATLAS MUSCULAR</Text><Text style={styles.heading}>Escolha uma região corporal</Text><Text style={styles.copy}>{allExercises.length} exercícios disponíveis.</Text>{allExercises.length > 0 && <SmallAction label="Ver todos os exercícios" onPress={() => setShowAll(true)} />}</View>{regions.map((item) => <NavigationCard key={item.id} title={item.name} subtitle={item.description || "Explorar grupos musculares"} badge={regionCode(item)} onPress={() => selectRegion(item)} />)}</View>}

      <Composer title={exerciseDetails?.name || "Detalhes do exercício"} visible={exerciseId !== null} onClose={() => { setExerciseId(null); setExerciseDetails(null); }}>
        <ExerciseDetail exercise={exerciseDetails} loading={detailLoading} error={detailError} onRetry={() => { setDetailLoading(true); setDetailError(""); setRevision((value) => value + 1); }} />
      </Composer>
    </View>
  );
}

function RegionScreen({ region, groups, onSelect, onBack }: { region: Region; groups: Group[]; onSelect: (group: Group) => void; onBack: () => void }) {
  return <View style={styles.list}><SmallAction label="← Todas as regiões" onPress={onBack} /><Header eyebrow="REGIÃO CORPORAL" title={region.name} copy={region.description} />{groups.length ? groups.map((item) => <NavigationCard key={item.id} title={item.name} subtitle={item.description || "Ver músculos deste grupo"} onPress={() => onSelect(item)} />) : <Empty text="Nenhum grupo muscular encontrado." />}</View>;
}

function GroupScreen({ group, region, muscles, onSelect, onBack }: { group: Group; region: Region | null; muscles: Muscle[]; onSelect: (muscle: Muscle) => void; onBack: () => void }) {
  return <View style={styles.list}><SmallAction label={`← Voltar para ${region?.name || "regiões"}`} onPress={onBack} /><Header eyebrow={region?.name || "GRUPO MUSCULAR"} title={group.name} copy={group.description} />{muscles.length ? muscles.map((item) => <NavigationCard key={item.id} title={item.name} subtitle={item.parentMuscleName ? `Subdivisão de ${item.parentMuscleName}` : item.description || "Músculo"} indented={Boolean(item.parentMuscleId)} onPress={() => onSelect(item)} />) : <Empty text="Nenhum músculo encontrado." />}</View>;
}

function MuscleScreen({ muscle, region, group, exercises, loading, error, onOpen, onBack, onRetry }: { muscle: Muscle; region: Region | null; group: Group | null; exercises: Exercise[]; loading: boolean; error: string; onOpen: (id: number) => void; onBack: () => void; onRetry: () => void }) {
  return <View style={styles.list}><SmallAction label="← Voltar" onPress={onBack} /><Header eyebrow={region?.name || muscle.muscleGroup?.bodyRegion?.name || "MÚSCULO"} title={muscle.name} copy={muscle.description} /><Text style={styles.context}>{group?.name || muscle.muscleGroup?.name || ""}</Text><View style={styles.sectionRow}><Text style={styles.sectionLabel}>EXERCÍCIOS PRIMÁRIOS</Text><Text style={styles.count}>{exercises.length}</Text></View>{loading ? <Loading text="Carregando exercícios..." /> : error ? <ErrorBox message={error} onRetry={onRetry} /> : exercises.length ? exercises.map((item) => <ExerciseCard key={item.id} exercise={item} onPress={() => onOpen(item.id)} primary />) : <Empty text="Nenhum exercício primário encontrado." />}</View>;
}

function ExerciseList({ title, exercises, onOpen, onBack }: { title: string; exercises: Exercise[]; onOpen: (id: number) => void; onBack: () => void }) {
  return <View style={styles.list}><SmallAction label="← Voltar ao atlas" onPress={onBack} /><View style={styles.sectionRow}><Text style={styles.sectionLabel}>{title.toUpperCase()}</Text><Text style={styles.count}>{exercises.length}</Text></View>{exercises.map((item) => <ExerciseCard key={item.id} exercise={item} onPress={() => onOpen(item.id)} />)}</View>;
}

function SearchView({ results, loading, error, onOpen }: { results: SearchResult[]; loading: boolean; error: string; onOpen: (item: SearchResult) => void }) {
  if (loading) return <Loading text="Pesquisando na biblioteca..." />;
  if (error) return <ErrorBox message={error} />;
  if (!results.length) return <Empty text="Nenhum resultado encontrado." />;
  return <View style={styles.list}>{results.map((item) => <NavigationCard key={`${item.type}-${item.id}`} title={item.name} subtitle={item.context || labelType(item.type)} onPress={() => onOpen(item)} />)}</View>;
}

function ExerciseCard({ exercise, onPress, primary = false }: { exercise: Exercise; onPress: () => void; primary?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.exerciseCard, pressed && styles.pressed]}><View style={styles.cardTop}><View style={styles.grow}><Text style={styles.cardTitle}>{exercise.name}</Text><Text style={styles.cardSubtitle}>{exercise.equipment || "Equipamento não informado"}</Text></View>{primary && <Text style={styles.primaryTag}>PRIMÁRIO</Text>}<Text style={styles.arrow}>›</Text></View></Pressable>;
}

function ExerciseDetail({ exercise, loading, error, onRetry }: { exercise: Exercise | null; loading: boolean; error: string; onRetry: () => void }) {
  if (loading) return <Loading text="Carregando detalhes..." />;
  if (error) return <ErrorBox message={error} onRetry={onRetry} />;
  if (!exercise) return null;
  const primary = exercise.muscles?.filter((item) => item.role === "PRIMARY" && !item.emphasis) || [];
  const secondary = exercise.muscles?.filter((item) => item.role === "SECONDARY" && !item.emphasis) || [];
  const emphasized = exercise.muscles?.filter((item) => item.emphasis) || [];
  return <View style={styles.detail}><View style={styles.media}><Text style={styles.mediaText}>Espaço reservado para imagem ou animação</Text></View>{!!exercise.description && <Text style={styles.detailCopy}>{exercise.description}</Text>}<DetailRow label="Equipamento" value={exercise.equipment || "Não informado"} /><DetailRow label="Músculos primários" value={names(primary)} /><DetailRow label="Músculos secundários" value={names(secondary)} /><DetailRow label="Ênfases" value={names(emphasized)} /></View>;
}

function NavigationCard({ title, subtitle, badge, indented, onPress }: { title: string; subtitle: string; badge?: string; indented?: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.navCard, indented && styles.indented, pressed && styles.pressed]}>{badge && <View style={styles.badge}><Text style={styles.badgeText}>{badge}</Text></View>}<View style={styles.grow}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.cardSubtitle}>{subtitle}</Text></View><Text style={styles.arrow}>›</Text></Pressable>;
}

function Header({ eyebrow, title, copy }: { eyebrow: string; title: string; copy?: string | null }) { return <View style={styles.intro}><Text style={styles.eyebrow}>{eyebrow}</Text><Text style={styles.heading}>{title}</Text>{!!copy && <Text style={styles.copy}>{copy}</Text>}</View>; }
function DetailRow({ label, value }: { label: string; value: string }) { return <View style={styles.detailRow}><Text style={styles.detailLabel}>{label}</Text><Text style={styles.detailValue}>{value || "Não informado"}</Text></View>; }
function SmallAction({ label, onPress }: { label: string; onPress: () => void }) { return <Pressable onPress={onPress} style={styles.action}><Text style={styles.actionText}>{label}</Text></Pressable>; }
function Loading({ text }: { text: string }) { return <View style={styles.state}><ActivityIndicator color="#8eb1e4" /><Text style={styles.stateText}>{text}</Text></View>; }
function Empty({ text }: { text: string }) { return <View style={styles.state}><Text style={styles.stateText}>{text}</Text></View>; }
function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) { return <View style={styles.state}><Text style={styles.errorText}>{message}</Text>{onRetry && <SmallAction label="Tentar novamente" onPress={onRetry} />}</View>; }
function names(items: ExerciseMuscle[]) { return items.map((item) => item.name).join(", ") || "Não informado"; }
function labelType(type: SearchResult["type"]) { return ({ BODY_REGION: "Região corporal", MUSCLE_GROUP: "Grupo muscular", MUSCLE: "Músculo", EXERCISE: "Exercício" })[type]; }
function regionCode(region: Region) { return ({ CHEST: "CH", BACK: "CO", SHOULDERS: "OM", ARMS: "BR", LEGS: "PE", CORE: "CR" } as Record<string, string>)[region.code || ""] || region.name.slice(0, 2).toUpperCase(); }

const styles = StyleSheet.create({
  library: { gap: 12 }, title: { color: "#f2f5fa", fontSize: 19, fontWeight: "700" }, subtitle: { color: "#8491a4", fontSize: 12, lineHeight: 18, marginTop: 4 },
  search: { minHeight: 46, paddingHorizontal: 13, color: "#edf2fa", backgroundColor: "#0b1420", borderWidth: 1, borderColor: "#203047", borderRadius: 10, fontSize: 13 },
  crumbs: { alignItems: "center", paddingVertical: 2 }, crumbItem: { flexDirection: "row", alignItems: "center" }, crumbSlash: { color: "#46556a", marginHorizontal: 4 }, crumb: { color: "#91a8c7", fontSize: 11, paddingVertical: 6 }, crumbCurrent: { color: "#68768a" },
  list: { gap: 9 }, intro: { padding: 17, backgroundColor: "#0e1927", borderWidth: 1, borderColor: "#213249", borderRadius: 11, gap: 6 }, eyebrow: { color: "#6688b8", fontSize: 9, fontWeight: "700", letterSpacing: 1.1 }, heading: { color: "#eff4fb", fontSize: 18, fontWeight: "700" }, copy: { color: "#7d8a9e", fontSize: 12, lineHeight: 18 },
  navCard: { minHeight: 70, padding: 13, flexDirection: "row", alignItems: "center", gap: 11, backgroundColor: "#0e1722", borderWidth: 1, borderColor: "#1d2a3a", borderRadius: 9 }, indented: { marginLeft: 16, borderLeftColor: "#36577e" }, pressed: { backgroundColor: "#14243a", borderColor: "#345377" }, badge: { width: 39, height: 39, alignItems: "center", justifyContent: "center", backgroundColor: "#172941", borderRadius: 10 }, badgeText: { color: "#a9c3e7", fontSize: 10, fontWeight: "800" }, grow: { flex: 1, gap: 4 }, cardTitle: { color: "#edf2fa", fontSize: 13, fontWeight: "600" }, cardSubtitle: { color: "#718096", fontSize: 10 }, arrow: { color: "#6684a8", fontSize: 21 },
  action: { alignSelf: "flex-start", minHeight: 35, paddingHorizontal: 11, alignItems: "center", justifyContent: "center", backgroundColor: "#111e2d", borderWidth: 1, borderColor: "#25364c", borderRadius: 8 }, actionText: { color: "#a9bad1", fontSize: 11, fontWeight: "600" },
  context: { color: "#7186a3", fontSize: 10 }, sectionRow: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 4 }, sectionLabel: { color: "#dce5f2", fontSize: 10, fontWeight: "700", letterSpacing: 0.5 }, count: { paddingHorizontal: 7, paddingVertical: 3, color: "#9bb8df", backgroundColor: "#1a2d47", borderRadius: 8, fontSize: 9 },
  exerciseCard: { padding: 14, backgroundColor: "#0e1722", borderWidth: 1, borderColor: "#1e2c3e", borderRadius: 9 }, cardTop: { flexDirection: "row", alignItems: "center", gap: 8 }, primaryTag: { paddingHorizontal: 6, paddingVertical: 4, color: "#9fc1eb", backgroundColor: "#19314f", borderRadius: 5, fontSize: 8, fontWeight: "700" },
  state: { minHeight: 145, padding: 22, gap: 10, alignItems: "center", justifyContent: "center", backgroundColor: "#0d1622", borderWidth: 1, borderColor: "#1b2839", borderRadius: 10 }, stateText: { color: "#7c899d", fontSize: 12, textAlign: "center" }, errorText: { color: "#dda0a0", fontSize: 12, textAlign: "center" },
  detail: { gap: 10, paddingBottom: 12 }, media: { minHeight: 120, alignItems: "center", justifyContent: "center", backgroundColor: "#101d2c", borderWidth: 1, borderColor: "#293d57", borderStyle: "dashed", borderRadius: 10 }, mediaText: { color: "#63758d", fontSize: 10 }, detailCopy: { color: "#8997aa", fontSize: 12, lineHeight: 18 }, detailRow: { padding: 12, gap: 5, backgroundColor: "#101b29", borderRadius: 8 }, detailLabel: { color: "#68778d", fontSize: 9, textTransform: "uppercase" }, detailValue: { color: "#d1dae7", fontSize: 12, lineHeight: 17 },
});
