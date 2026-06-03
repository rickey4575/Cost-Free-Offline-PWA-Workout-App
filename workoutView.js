import { get } from "./db.js";
import { els } from "./dom.js";
import { fmt, numberOrNull } from "./format.js";
import { getExerciseNote, upsertExerciseNote } from "./exerciseNotesRepo.js";
import { renderRestTimer, startRestTimerAfterSet } from "./restTimer.js";
import { addSet, listSetsForWorkout } from "./setsRepo.js";
import { listWorkoutsByTemplateCode } from "./workoutsRepo.js";

export async function renderHistory({
  currentWorkout,
  viewingWorkoutId,
  onOpenWorkout,
}) {
  if (!currentWorkout) return;
  const list = await listWorkoutsByTemplateCode(currentWorkout.templateCode);

  els.history.innerHTML = "";
  if (list.length === 0) {
    els.history.innerHTML = "<p>No history yet.</p>";
    return;
  }

  const ul = document.createElement("ul");
  ul.style.paddingLeft = "18px";

  for (const w of list) {
    const li = document.createElement("li");

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = `${fmt(w.startedAt)} -> ${
      w.finishedAt ? fmt(w.finishedAt) : "(active)"
    }`;
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await onOpenWorkout(w.id);
    });

    if (w.id === viewingWorkoutId) {
      link.style.fontWeight = "700";
    }

    li.appendChild(link);
    ul.appendChild(li);
  }

  els.history.appendChild(ul);
}

export async function renderWorkoutScreen({
  currentWorkout,
  viewingWorkoutId,
  onOpenWorkout,
  onWorkoutChanged,
}) {
  if (!currentWorkout) return;

  const viewing = viewingWorkoutId
    ? await get("workouts", viewingWorkoutId)
    : currentWorkout;
  if (!viewing) return;

  const active = viewing.id === currentWorkout.id && !viewing.finishedAt;
  const titleSuffix = viewing.finishedAt
    ? `Finished ${fmt(viewing.finishedAt)}`
    : `Started ${fmt(viewing.startedAt)}`;

  els.workoutTitle.textContent = `${viewing.templateCode} - ${titleSuffix}`;

  els.workoutNotes.value = viewing.notes || "";
  els.workoutNotes.disabled = !active;
  els.finishBtn.disabled = !active;
  renderRestTimer(els.restTimer, { active });

  const exercises = viewing.exerciseSnapshot || [];
  const sets = await listSetsForWorkout(viewing.id);

  els.exercises.innerHTML = "";

  for (const ex of exercises) {
    const card = document.createElement("div");
    card.style.border = "1px solid #ccc";
    card.style.borderRadius = "8px";
    card.style.padding = "12px";
    card.style.marginBottom = "12px";

    const h3 = document.createElement("h3");
    h3.textContent = ex;

    const setsForEx = sets
      .filter((s) => s.exerciseName === ex)
      .sort((a, b) => a.order - b.order);

    const list = document.createElement("div");
    if (setsForEx.length === 0) {
      list.innerHTML = "<p style='margin:0; opacity:0.7;'>No sets yet.</p>";
    } else {
      const ul = document.createElement("ul");
      ul.style.margin = "8px 0";
      for (const s of setsForEx) {
        const li = document.createElement("li");
        li.textContent = `Set ${s.order}: reps=${s.reps ?? "-"}, weight=${
          s.weight ?? "-"
        }, rpe=${s.rpe ?? "-"}${s.note ? ` - ${s.note}` : ""}`;
        ul.appendChild(li);
      }
      list.appendChild(ul);
    }

    const noteWrap = document.createElement("div");
    noteWrap.style.margin = "8px 0";

    const noteLabel = document.createElement("div");
    noteLabel.innerHTML = "<strong>Exercise note</strong>";

    const noteArea = document.createElement("textarea");
    noteArea.rows = 2;
    noteArea.style.width = "100%";
    noteArea.style.maxWidth = "700px";

    const noteStatus = document.createElement("span");
    noteStatus.style.marginLeft = "8px";
    noteStatus.style.opacity = "0.7";

    const existingNote = await getExerciseNote(viewing.id, ex);
    noteArea.value = existingNote?.note || "";
    noteArea.disabled = !active;

    noteArea.addEventListener("blur", async () => {
      if (!active) return;
      noteStatus.textContent = "Saving...";
      try {
        await upsertExerciseNote(viewing.id, ex, noteArea.value);
        noteStatus.textContent = "Saved";
        setTimeout(() => (noteStatus.textContent = ""), 800);
      } catch (err) {
        console.error(err);
        noteStatus.textContent = "Save failed";
      }
    });

    noteWrap.appendChild(noteLabel);
    noteWrap.appendChild(noteArea);
    noteWrap.appendChild(noteStatus);

    const form = document.createElement("form");
    form.style.display = active ? "flex" : "none";
    form.style.flexWrap = "wrap";
    form.style.gap = "8px";
    form.style.alignItems = "center";

    const reps = document.createElement("input");
    reps.type = "number";
    reps.placeholder = "reps";
    reps.min = "0";

    const weight = document.createElement("input");
    weight.type = "number";
    weight.placeholder = "weight";
    weight.min = "0";
    weight.step = "0.5";

    const rpe = document.createElement("input");
    rpe.type = "number";
    rpe.placeholder = "rpe";
    rpe.min = "0";
    rpe.max = "10";
    rpe.step = "0.5";

    const note = document.createElement("input");
    note.type = "text";
    note.placeholder = "note (optional)";
    note.style.flex = "1";
    note.style.minWidth = "180px";

    const btn = document.createElement("button");
    btn.type = "submit";
    btn.textContent = "Add set";

    form.appendChild(reps);
    form.appendChild(weight);
    form.appendChild(rpe);
    form.appendChild(note);
    form.appendChild(btn);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      await addSet({
        workout: viewing,
        exerciseName: ex,
        reps: numberOrNull(reps.value),
        weight: numberOrNull(weight.value),
        rpe: numberOrNull(rpe.value),
        note: note.value.trim(),
      });

      reps.value = "";
      weight.value = "";
      rpe.value = "";
      note.value = "";

      await onWorkoutChanged?.();
      startRestTimerAfterSet();
    });

    card.appendChild(h3);
    card.appendChild(list);
    card.appendChild(noteWrap);
    card.appendChild(form);
    els.exercises.appendChild(card);
  }

  await renderHistory({
    currentWorkout,
    viewingWorkoutId,
    onOpenWorkout,
  });
}
