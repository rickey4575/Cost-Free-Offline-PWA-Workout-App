import { els } from "./dom.js";
import { parseExercisesFromTextarea } from "./format.js";
import {
  createTemplate,
  deactivateTemplate,
  getTemplateById,
  listTemplates,
  updateTemplate,
} from "./templatesRepo.js";

let editingTemplateId = null;

export function renderTemplateEditorEmpty() {
  editingTemplateId = null;
  els.editorTitle.textContent = "Template editor";
  els.templateEditor.innerHTML =
    "<p style='opacity:0.7;'>Select a template to edit, or create a new one.</p>";
}

export async function renderTemplateEditor({ mode, template, onSaved }) {
  editingTemplateId = template?.id || null;
  els.editorTitle.textContent =
    mode === "new" ? "New template" : `Edit ${template.code}`;

  els.templateEditor.innerHTML = "";

  const form = document.createElement("form");
  form.style.display = "grid";
  form.style.gap = "10px";

  const code = document.createElement("input");
  code.placeholder = "Code (e.g. A1)";
  code.value = template?.code || "";
  code.required = true;

  const name = document.createElement("input");
  name.placeholder = "Name";
  name.value = template?.name || "";
  name.required = true;

  const exercises = document.createElement("textarea");
  exercises.rows = 8;
  exercises.placeholder = "One exercise per line";
  exercises.value = (template?.exerciseDefs || []).map((e) => e.name).join("\n");

  const row = document.createElement("div");
  row.style.display = "flex";
  row.style.gap = "8px";
  row.style.alignItems = "center";
  row.style.flexWrap = "wrap";

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.textContent = "Save";

  const deactivateBtn = document.createElement("button");
  deactivateBtn.type = "button";
  deactivateBtn.textContent = "Deactivate";
  deactivateBtn.style.display = mode === "edit" ? "inline-block" : "none";

  const status = document.createElement("span");
  status.style.opacity = "0.75";

  row.appendChild(saveBtn);
  row.appendChild(deactivateBtn);
  row.appendChild(status);

  form.appendChild(code);
  form.appendChild(name);
  form.appendChild(exercises);
  form.appendChild(row);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    status.textContent = "Saving...";

    try {
      const exerciseNames = parseExercisesFromTextarea(exercises.value);

      if (mode === "new") {
        await createTemplate({
          code: code.value.trim(),
          name: name.value.trim(),
          exerciseNames,
        });
      } else {
        const updated = {
          ...template,
          code: code.value.trim(),
          name: name.value.trim(),
          exerciseDefs: exerciseNames.map((n) => ({ name: n })),
          isActive: true,
        };
        await updateTemplate(updated);
      }

      status.textContent = "Saved";
      await onSaved?.();
      renderTemplateEditorEmpty();
      setTimeout(() => (status.textContent = ""), 800);
    } catch (err) {
      console.error(err);
      status.textContent = "Save failed (code must be unique, check console)";
    }
  });

  deactivateBtn.addEventListener("click", async () => {
    if (!template?.id) return;
    if (!confirm(`Deactivate ${template.code}?`)) return;

    status.textContent = "Deactivating...";
    try {
      await deactivateTemplate(template.id);
      status.textContent = "Deactivated";
      await onSaved?.();
      renderTemplateEditorEmpty();
    } catch (err) {
      console.error(err);
      status.textContent = "Deactivate failed";
    }
  });

  els.templateEditor.appendChild(form);
}

export async function renderTemplates({ onStartWorkout, onHomeChanged }) {
  const templates = await listTemplates();

  if (templates.length === 0) {
    els.templates.innerHTML = "<p>No templates yet.</p>";
    return;
  }

  els.templates.innerHTML = "";
  for (const t of templates) {
    const row = document.createElement("div");
    row.style.display = "flex";
    row.style.gap = "8px";
    row.style.alignItems = "center";
    row.style.marginBottom = "8px";

    const label = document.createElement("div");
    label.textContent = `${t.code} - ${t.name}`;
    label.style.flex = "1";

    const startBtn = document.createElement("button");
    startBtn.textContent = "Start workout";
    startBtn.addEventListener("click", async () => {
      await onStartWorkout(t);
    });

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", async () => {
      const full = await getTemplateById(t.id);
      await renderTemplateEditor({
        mode: "edit",
        template: full,
        onSaved: onHomeChanged,
      });
    });

    row.appendChild(label);
    row.appendChild(startBtn);
    row.appendChild(editBtn);
    els.templates.appendChild(row);
  }
}
