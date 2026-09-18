export const API_BASE = "http://100.71.224.93:8080/api";

export const API = {
  exercises: `${API_BASE}/exercises`,
  bodyRegions: `${API_BASE}/body-regions`,
  exerciseLibrarySearch: `${API_BASE}/exercise-library/search`,
  regionMuscleGroups: (regionId) => `${API_BASE}/body-regions/${regionId}/muscle-groups`,
  groupMuscles: (groupId) => `${API_BASE}/muscle-groups/${groupId}/muscles`,
  muscle: (muscleId) => `${API_BASE}/muscles/${muscleId}`,
  muscleExercises: (muscleId) => `${API_BASE}/muscles/${muscleId}/exercises`,
  exercise: (exerciseId) => `${API_BASE}/exercises/${exerciseId}`,
  workouts: `${API_BASE}/workouts`,
  schedule: `${API_BASE}/workout-schedule`,
  sessions: `${API_BASE}/workout-sessions`,
  progress: `${API_BASE}/body-progress`,
  records: `${API_BASE}/personal-records`,
  photos: `${API_BASE}/progress-photos`,
};
