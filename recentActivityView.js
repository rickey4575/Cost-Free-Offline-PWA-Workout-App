import { els } from "./dom.js";
import { fmt } from "./format.js";
import { listRecentWorkouts } from "./workoutsRepo.js";

export async function renderRecentActivity({ onOpenWorkout }) {
  const workouts = await listRecentWorkouts(10);

  els.recentActivity.innerHTML = "";
  if (workouts.length === 0) {
    els.recentActivity.innerHTML = "<p>No workouts yet.</p>";
    return;
  }

  const ul = document.createElement("ul");
  ul.style.paddingLeft = "18px";

  for (const workout of workouts) {
    const li = document.createElement("li");
    li.style.marginBottom = "6px";

    const link = document.createElement("a");
    link.href = "#";
    link.textContent = `${workout.templateCode} - ${fmt(workout.startedAt)}${
      workout.finishedAt ? ` -> ${fmt(workout.finishedAt)}` : " (active)"
    }`;
    link.addEventListener("click", async (e) => {
      e.preventDefault();
      await onOpenWorkout(workout.id);
    });

    li.appendChild(link);
    ul.appendChild(li);
  }

  els.recentActivity.appendChild(ul);
}
