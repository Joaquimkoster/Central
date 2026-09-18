import { useEffect, useState } from "react";
import { API } from "../../../config/api";
import ExerciseCard from "./ExerciseCard";
import ExerciseDetails from "./ExerciseDetails";
import ExerciseSearch from "./ExerciseSearch";
import MuscleBreadcrumb from "./MuscleBreadcrumb";
import MuscleGroupView from "./MuscleGroupView";
import MuscleRegionGrid from "./MuscleRegionGrid";
import MuscleView from "./MuscleView";

function asList(data) {
  if (Array.isArray(data)) return data;
  return data?.content || data?.items || data?.results || [];
}

async function request(url, signal) {
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`Erro HTTP ${response.status}`);
  return response.json();
}

export default function ExerciseLibrary() {
  const [regions, setRegions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [muscles, setMuscles] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [allExercises, setAllExercises] = useState([]);
  const [totalExercises, setTotalExercises] = useState(null);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [loadingRegions, setLoadingRegions] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [loadingMuscles, setLoadingMuscles] = useState(false);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searching, setSearching] = useState(false);
  const [regionError, setRegionError] = useState("");
  const [groupError, setGroupError] = useState("");
  const [muscleError, setMuscleError] = useState("");
  const [exerciseError, setExerciseError] = useState("");
  const [detailsError, setDetailsError] = useState("");
  const [searchError, setSearchError] = useState("");
  const [regionsRevision, setRegionsRevision] = useState(0);
  const [groupsRevision, setGroupsRevision] = useState(0);
  const [musclesRevision, setMusclesRevision] = useState(0);
  const [exercisesRevision, setExercisesRevision] = useState(0);
  const [detailsRevision, setDetailsRevision] = useState(0);
  const selectedMuscleId = selectedMuscle?.id;

  useEffect(() => {
    const controller = new AbortController();
    request(API.bodyRegions, controller.signal)
      .then((regionData) => setRegions(asList(regionData)))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Erro ao carregar a biblioteca:", error);
          setRegionError("Não foi possível carregar as regiões corporais.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingRegions(false); });
    request(API.exercises, controller.signal)
      .then((exerciseData) => {
        const items = asList(exerciseData);
        setAllExercises(items);
        setTotalExercises(items.length);
      })
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Erro ao carregar a quantidade de exercícios:", error);
      });
    return () => controller.abort();
  }, [regionsRevision]);

  useEffect(() => {
    if (!selectedRegion) return undefined;
    const controller = new AbortController();
    request(API.regionMuscleGroups(selectedRegion.id), controller.signal)
      .then((data) => setGroups(asList(data)))
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Erro ao carregar grupos musculares:", error);
          setGroupError("Não foi possível carregar os grupos musculares.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingGroups(false); });
    return () => controller.abort();
  }, [selectedRegion, groupsRevision]);

  useEffect(() => {
    if (!selectedGroup) return undefined;
    const controller = new AbortController();
    request(API.groupMuscles(selectedGroup.id), controller.signal)
      .then((data) => {
        const nextMuscles = asList(data);
        setMuscles(nextMuscles);
        const apiGroup = nextMuscles[0]?.muscleGroup;
        if (apiGroup) {
          setSelectedGroup((current) => current?.bodyRegion ? current : { ...current, ...apiGroup });
          if (apiGroup.bodyRegion) setSelectedRegion((current) => current || apiGroup.bodyRegion);
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error("Erro ao carregar músculos:", error);
          setMuscleError("Não foi possível carregar os músculos deste grupo.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingMuscles(false); });
    return () => controller.abort();
  }, [selectedGroup, musclesRevision]);

  useEffect(() => {
    if (!selectedMuscleId) return undefined;
    const muscleId = selectedMuscleId;
    const controller = new AbortController();
    Promise.all([
      request(API.muscle(muscleId), controller.signal),
      request(API.muscleExercises(muscleId), controller.signal),
    ])
      .then(([muscleData, exerciseData]) => {
        setSelectedMuscle((current) => current?.id === muscleId ? { ...current, ...muscleData } : current);
        if (muscleData.muscleGroup) {
          setSelectedGroup((current) => current || muscleData.muscleGroup);
          if (muscleData.muscleGroup.bodyRegion) {
            setSelectedRegion((current) => current || muscleData.muscleGroup.bodyRegion);
          }
        }
        setExercises(asList(exerciseData));
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(`Erro ao carregar o músculo ${muscleId}:`, error);
          setExerciseError("Não foi possível carregar os exercícios deste músculo.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingExercises(false); });
    return () => controller.abort();
  }, [selectedMuscleId, exercisesRevision]);

  useEffect(() => {
    const query = search.trim();
    if (!query) return undefined;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setSearching(true);
      setSearchError("");
      request(`${API.exerciseLibrarySearch}?q=${encodeURIComponent(query)}`, controller.signal)
        .then((data) => setSearchResults(asList(data)))
        .catch((error) => {
          if (error.name !== "AbortError") {
            console.error("Erro na pesquisa da biblioteca:", error);
            setSearchError("Não foi possível realizar a pesquisa.");
          }
        })
        .finally(() => { if (!controller.signal.aborted) setSearching(false); });
    }, 300);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [search]);

  useEffect(() => {
    if (!selectedExerciseId) return undefined;
    const controller = new AbortController();
    request(API.exercise(selectedExerciseId), controller.signal)
      .then(setSelectedExercise)
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.error(`Erro ao carregar o exercício ${selectedExerciseId}:`, error);
          setDetailsError("Não foi possível carregar os detalhes do exercício.");
        }
      })
      .finally(() => { if (!controller.signal.aborted) setLoadingDetails(false); });
    return () => controller.abort();
  }, [selectedExerciseId, detailsRevision]);

  function selectRegion(region) {
    setSelectedRegion(region);
    setSelectedGroup(null);
    setSelectedMuscle(null);
    setGroups([]);
    setMuscles([]);
    setExercises([]);
    setLoadingGroups(true);
    setGroupError("");
    setSearch("");
    setSearchResults([]);
    setShowAll(false);
  }

  function selectGroup(group, region = selectedRegion) {
    setSelectedRegion(region);
    setSelectedGroup(group);
    setSelectedMuscle(null);
    setMuscles([]);
    setExercises([]);
    setLoadingMuscles(true);
    setMuscleError("");
    setSearch("");
    setSearchResults([]);
    setShowAll(false);
  }

  function selectMuscle(muscle, group = selectedGroup, region = selectedRegion) {
    setSelectedRegion(region);
    setSelectedGroup(group);
    setSelectedMuscle(muscle);
    setExercises([]);
    setLoadingExercises(true);
    setExerciseError("");
    setSearch("");
    setSearchResults([]);
    setShowAll(false);
  }

  function resetNavigation() {
    setSelectedRegion(null);
    setSelectedGroup(null);
    setSelectedMuscle(null);
    setGroups([]);
    setMuscles([]);
    setExercises([]);
    setSearch("");
    setShowAll(false);
  }

  function openSearchResult(result) {
    const type = result.type?.toUpperCase();
    if (type === "BODY_REGION") selectRegion(result);
    if (type === "MUSCLE_GROUP") {
      const region = result.bodyRegionId ? { id: result.bodyRegionId, name: result.bodyRegionName || result.context } : null;
      selectGroup(result, region);
    }
    if (type === "MUSCLE") {
      const region = result.bodyRegionId ? { id: result.bodyRegionId, name: result.bodyRegionName || "Região" } : null;
      const group = result.muscleGroupId ? { id: result.muscleGroupId, name: result.muscleGroupName || result.context } : null;
      selectMuscle(result, group, region);
    }
    if (type === "EXERCISE") openExercise(result.id);
  }

  function openExercise(exerciseId) {
    setSelectedExerciseId(exerciseId);
    setSelectedExercise(null);
    setLoadingDetails(true);
    setDetailsError("");
  }

  function changeSearch(value) {
    setSearch(value);
    setSearchResults([]);
    if (value.trim()) {
      setSearching(true);
      setSearchError("");
    } else {
      setSearching(false);
      setSearchError("");
    }
  }

  function navigateBreadcrumb(item) {
    if (item.type === "root") resetNavigation();
    if (item.type === "region") selectRegion(item.value);
    if (item.type === "group") selectGroup(item.value, selectedRegion);
  }

  const breadcrumb = [
    { type: "root", id: "root", name: "Exercícios" },
    ...(selectedRegion ? [{ type: "region", id: selectedRegion.id, name: selectedRegion.name, value: selectedRegion }] : []),
    ...(selectedGroup ? [{ type: "group", id: selectedGroup.id, name: selectedGroup.name, value: selectedGroup }] : []),
    ...(selectedMuscle ? [{ type: "muscle", id: selectedMuscle.id, name: selectedMuscle.name }] : []),
    ...(showAll ? [{ type: "all", id: "all", name: "Todos os exercícios" }] : []),
  ];

  return (
    <div className="exercise-library">
      <div className="workout-section-header exercise-library-header">
        <div><h2>Exercícios</h2><p>Explore exercícios por grupo muscular e descubra quais músculos cada movimento trabalha.</p></div>
      </div>
      <ExerciseSearch value={search} onChange={changeSearch} resultCount={searchResults.length} />
      <MuscleBreadcrumb items={search ? [{ type: "root", id: "root", name: "Exercícios" }, { type: "search", id: "search", name: `Busca: “${search}”` }] : breadcrumb} onNavigate={navigateBreadcrumb} />

      {search ? <SearchResults results={searchResults} loading={searching} error={searchError} onOpen={openSearchResult} />
        : showAll ? <AllExercises exercises={allExercises} onOpen={openExercise} onBack={() => setShowAll(false)} />
        : selectedMuscle ? <MuscleView muscle={selectedMuscle} region={selectedRegion} group={selectedGroup} exercises={exercises} loading={loadingExercises} error={exerciseError} onRetry={() => { setLoadingExercises(true); setExerciseError(""); setExercises([]); setExercisesRevision((value) => value + 1); }} onOpenExercise={(exercise) => openExercise(exercise.id)} onBack={() => { setSelectedMuscle(null); setExercises([]); }} />
          : selectedGroup ? loadingMuscles ? <Loading label="Carregando músculos..." />
            : muscleError ? <ErrorState message={muscleError} onRetry={() => { setLoadingMuscles(true); setMuscleError(""); setMuscles([]); setMusclesRevision((value) => value + 1); }} />
              : <MuscleGroupView region={selectedRegion} groups={groups} group={selectedGroup} muscles={muscles} onSelectGroup={selectGroup} onSelectMuscle={(muscle) => selectMuscle(muscle)} onBack={() => { setSelectedGroup(null); setMuscles([]); }} />
            : selectedRegion ? loadingGroups ? <Loading label="Carregando grupos musculares..." />
              : groupError ? <ErrorState message={groupError} onRetry={() => { setLoadingGroups(true); setGroupError(""); setGroups([]); setGroupsRevision((value) => value + 1); }} />
                : <MuscleGroupView region={selectedRegion} groups={groups} group={null} muscles={[]} onSelectGroup={selectGroup} onSelectMuscle={selectMuscle} onBack={resetNavigation} />
              : loadingRegions ? <Loading label="Carregando regiões..." />
                : regionError ? <ErrorState message={regionError} onRetry={() => { setLoadingRegions(true); setRegionError(""); setRegionsRevision((value) => value + 1); }} />
                  : <><div className="exercise-atlas-intro"><span>ATLAS MUSCULAR</span><h3>Escolha uma região corporal</h3><p>{totalExercises == null ? "Navegue pelos grupos e músculos disponíveis." : `${totalExercises} exercícios disponíveis na biblioteca.`}</p>{allExercises.length > 0 && <button type="button" className="muscle-back-button" onClick={() => setShowAll(true)}>Ver todos os exercícios</button>}</div><MuscleRegionGrid regions={regions} onSelect={selectRegion} /></>}

      <ExerciseDetails exercise={selectedExercise} loading={loadingDetails} error={detailsError} onRetry={() => { setLoadingDetails(true); setDetailsError(""); setSelectedExercise(null); setDetailsRevision((value) => value + 1); }} onClose={() => { setSelectedExerciseId(null); setSelectedExercise(null); setDetailsError(""); }} />
    </div>
  );
}

function SearchResults({ results, loading, error, onOpen }) {
  if (loading) return <Loading label="Pesquisando na biblioteca..." />;
  if (error) return <ErrorState message={error} />;
  if (!results.length) return <div className="workout-empty"><h3>Nenhum resultado</h3><p>Tente pesquisar outro exercício, músculo ou grupo.</p></div>;
  const types = [["BODY_REGION", "Regiões"], ["MUSCLE_GROUP", "Grupos musculares"], ["MUSCLE", "Músculos"], ["EXERCISE", "Exercícios"]];
  return <div className="exercise-search-results">{types.map(([type, title]) => {
    const items = results.filter((item) => item.type?.toUpperCase() === type);
    if (!items.length) return null;
    return <section className="exercise-result-section" key={type}><div className="exercise-result-heading"><h4>{title}</h4><span>{items.length}</span></div>{type === "EXERCISE" ? <div className="exercise-atlas-grid">{items.map((item) => <ExerciseCard key={item.id} exercise={item} onOpen={() => onOpen(item)} />)}</div> : <div className="exercise-search-links">{items.map((item) => <button type="button" key={`${type}-${item.id}`} onClick={() => onOpen(item)}><strong>{item.name}</strong><span>{item.context || item.description || title}</span><i>›</i></button>)}</div>}</section>;
  })}</div>;
}

function AllExercises({ exercises, onOpen, onBack }) {
  return <section className="muscle-level-view"><button type="button" className="muscle-back-button" onClick={onBack}>← Voltar ao atlas</button><div className="exercise-result-heading"><h4>Todos os exercícios</h4><span>{exercises.length}</span></div><div className="exercise-atlas-grid">{exercises.map((exercise) => <ExerciseCard key={exercise.id} exercise={exercise} onOpen={() => onOpen(exercise.id)} />)}</div></section>;
}

function Loading({ label }) {
  return <div className="workout-empty"><p>{label}</p></div>;
}

function ErrorState({ message, onRetry }) {
  return <div className="workout-empty"><h3>Não foi possível carregar</h3><p>{message}</p>{onRetry && <button type="button" className="workout-secondary-button" onClick={onRetry}>Tentar novamente</button>}</div>;
}
