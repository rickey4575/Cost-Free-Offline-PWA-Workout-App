import { getByIndex, putByUniqueIndex } from "./db.js";
import { uuid } from "./uuid.js";

const UNIQUE_INDEX = "workout_exercise_unique";

export async function getExerciseNote(workoutId, exerciseName) {
  return await getByIndex("exerciseNotes", UNIQUE_INDEX, [workoutId, exerciseName]);
}

export async function upsertExerciseNote(workoutId, exerciseName, noteText) {
  const note = (noteText ?? "").trim();

  return await putByUniqueIndex(
    "exerciseNotes",
    UNIQUE_INDEX,
    [workoutId, exerciseName],
    (existing) => {
      if (existing) {
        return { ...existing, note };
      }
      return {
        id: uuid(),
        workoutId,
        exerciseName,
        note
      };
    }
  );
}
