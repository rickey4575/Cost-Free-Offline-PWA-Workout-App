import { get, openDB } from "./db.js";
import { els } from "./dom.js";
import { renderRecentActivity } from "./recentActivityView.js";
import {
  renderTemplateEditor,
  renderTemplateEditorEmpty,
  renderTemplates,
} from "./templatesView.js";
import { finishWorkout, startWorkoutFromTemplate } from "./workoutsRepo.js";
import { renderWorkoutScreen } from "./workoutView.js";

let currentWorkout = null;
let viewingWorkoutId = null;

function showTemplates() {
  els.workoutView.style.display = "none";
  els.templatesView.style.display = "block";
  els.exercises.innerHTML = "";
  els.history.innerHTML = "";
  els.finishStatus.textContent = "";
  els.workoutNotes.value = "";
}

function showWorkout() {
  els.templatesView.style.display = "none";
  els.workoutView.style.display = "block";
}

async function refreshHome() {
  await renderRecentActivity({ onOpenWorkout });
  await renderTemplates({
    onStartWorkout,
    onHomeChanged: refreshHome,
  });
}

async function refreshWorkout() {
  await renderWorkoutScreen({
    currentWorkout,
    viewingWorkoutId,
    onOpenWorkout,
    onWorkoutChanged: refreshWorkout,
  });
}

async function onStartWorkout(template) {
  const workout = await startWorkoutFromTemplate(template);
  currentWorkout = workout;
  viewingWorkoutId = workout.id;
  sessionStorage.setItem("currentWorkoutId", workout.id);

  els.out.textContent = JSON.stringify(workout, null, 2);
  await refreshWorkout();
  showWorkout();
}

async function onOpenWorkout(workoutId) {
  const workout = await get("workouts", workoutId);
  if (!workout) return;

  currentWorkout = workout;
  viewingWorkoutId = workout.id;

  if (!workout.finishedAt) {
    sessionStorage.setItem("currentWorkoutId", workout.id);
  }

  els.out.textContent = JSON.stringify(workout, null, 2);
  await refreshWorkout();
  showWorkout();
}

els.backBtn.addEventListener("click", async () => {
  sessionStorage.removeItem("currentWorkoutId");
  currentWorkout = null;
  viewingWorkoutId = null;
  showTemplates();
  await refreshHome();
});

els.newTemplateBtn.addEventListener("click", async () => {
  await renderTemplateEditor({
    mode: "new",
    template: null,
    onSaved: refreshHome,
  });
});

els.finishBtn.addEventListener("click", async () => {
  if (!currentWorkout) return;

  try {
    els.finishStatus.textContent = "Finishing...";
    const finished = await finishWorkout(currentWorkout.id, els.workoutNotes.value);

    currentWorkout = finished;
    viewingWorkoutId = finished.id;
    sessionStorage.removeItem("currentWorkoutId");

    els.finishStatus.textContent = "Finished";
    await refreshWorkout();
  } catch (err) {
    console.error(err);
    els.finishStatus.textContent = "Finish failed (check console)";
  }
});

(async () => {
  try {
    await openDB();
    els.status.textContent = "DB ready";
    await refreshHome();
    renderTemplateEditorEmpty();

    const workoutId = sessionStorage.getItem("currentWorkoutId");
    if (workoutId) {
      const workout = await get("workouts", workoutId);
      if (workout && !workout.finishedAt) {
        currentWorkout = workout;
        viewingWorkoutId = workout.id;
        await refreshWorkout();
        showWorkout();
      } else {
        sessionStorage.removeItem("currentWorkoutId");
      }
    }
  } catch (err) {
    console.error(err);
    els.status.textContent = "DB error (check console)";
  }
})();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
      console.log("SW registered");
    } catch (e) {
      console.warn("SW registration failed", e);
    }
  });
}
