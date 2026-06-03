import { add, getAllByIndex } from "./db.js";
import { uuid } from "./uuid.js";

/**
 * List all sets for a workout (fast via index workoutId)
 */
export async function listSetsForWorkout(workoutId) {
  const all = await getAllByIndex("sets", "workoutId", workoutId);
  // ensure consistent ordering in UI
  all.sort((a, b) => {
    if (a.exerciseName !== b.exerciseName) return a.exerciseName.localeCompare(b.exerciseName);
    return (a.order ?? 0) - (b.order ?? 0);
  });
  return all;
}

/**
 * List sets for a specific exercise within a workout
 */
export async function listSetsForExercise(workoutId, exerciseName) {
  const all = await listSetsForWorkout(workoutId);
  return all.filter((s) => s.exerciseName === exerciseName).sort((a, b) => a.order - b.order);
}

/**
 * Add a set. Computes next order for that workout+exercise.
 */
export async function addSet({ workout, exerciseName, reps, weight, rpe, note }) {
  const existing = await listSetsForExercise(workout.id, exerciseName);
  const nextOrder = existing.length === 0 ? 1 : Math.max(...existing.map((s) => s.order)) + 1;

  const set = {
    id: uuid(),
    workoutId: workout.id,
    exerciseName,
    order: nextOrder,
    reps: reps ?? null,
    weight: weight ?? null,
    rpe: rpe ?? null,
    note: note ?? "",
    performedAt: workout.startedAt
  };

  await add("sets", set);
  return set;
}
