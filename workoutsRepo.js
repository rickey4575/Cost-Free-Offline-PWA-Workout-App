import { add, put, getAll, getAllByIndex, get } from "./db.js";
import { uuid } from "./uuid.js";


export async function startWorkoutFromTemplate(template) {
  const startedAt = new Date().toISOString();

  const workout = {
    id: uuid(),
    templateCode: template.code,
    templateId: template.id,
    startedAt,
    finishedAt: null,
    notes: "",
    exerciseSnapshot: (template.exerciseDefs || []).map((e) => e.name),
  };

  await add("workouts", workout);
  return workout;
}

export async function finishWorkout(workoutId, notes) {
  const w = await get("workouts", workoutId);
  if (!w) throw new Error("Workout not found");

  const finished = {
    ...w,
    finishedAt: new Date().toISOString(),
    notes: (notes ?? "").trim(),
  };

  await put("workouts", finished);
  return finished;
}

export async function listWorkoutsByTemplateCode(templateCode) {
  const all = await getAllByIndex("workouts", "templateCode", templateCode);
  // newest first
  all.sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
  return all;
}

export async function listRecentWorkouts(limit = 20) {
  const all = await getAll("workouts");
  all.sort((a, b) => (b.startedAt || "").localeCompare(a.startedAt || ""));
  return all.slice(0, limit);
}
