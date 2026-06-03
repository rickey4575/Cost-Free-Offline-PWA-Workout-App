import { add, put, getAll, getByIndex, get } from "./db.js";
import { uuid } from "./uuid.js";

export async function createTemplate({ code, name, exerciseNames }) {
  const now = new Date().toISOString();

  const template = {
    id: uuid(),
    code,
    name,
    exerciseDefs: (exerciseNames || []).map((n) => ({ name: n })),
    updatedAt: now,
    isActive: true
  };

  await add("templates", template);
  return template;
}

export async function updateTemplate(template) {
  const updated = { ...template, updatedAt: new Date().toISOString() };
  await put("templates", updated);
  return updated;
}

export async function listTemplates() {
  const all = await getAll("templates");
  return all
    .filter((t) => t.isActive)
    .sort((a, b) => (a.code || "").localeCompare(b.code || ""));
}

export async function getTemplateByCode(code) {
  return await getByIndex("templates", "code", code);
}

export async function getTemplateById(id) {
  return await get("templates", id);
}

export async function deactivateTemplate(templateId) {
  const t = await getTemplateById(templateId);
  if (!t) throw new Error("Template not found");

  const updated = {
    ...t,
    isActive: false,
    updatedAt: new Date().toISOString()
  };

  await put("templates", updated);
  return updated;
}
