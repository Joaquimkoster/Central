export const API_BASE = "http://100.71.224.93:8080/api";

export const API = {
  exercises: `${API_BASE}/exercises`,
  bodyRegions: `${API_BASE}/body-regions`,
  exerciseLibrarySearch: `${API_BASE}/exercise-library/search`,
  regionMuscleGroups: (regionId: number) => `${API_BASE}/body-regions/${regionId}/muscle-groups`,
  groupMuscles: (groupId: number) => `${API_BASE}/muscle-groups/${groupId}/muscles`,
  muscle: (muscleId: number) => `${API_BASE}/muscles/${muscleId}`,
  muscleExercises: (muscleId: number) => `${API_BASE}/muscles/${muscleId}/exercises`,
  exercise: (exerciseId: number) => `${API_BASE}/exercises/${exerciseId}`,
};
