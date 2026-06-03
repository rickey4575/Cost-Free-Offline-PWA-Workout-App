export function parseExercisesFromTextarea(text) {
  return (text || "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function numberOrNull(v) {
  if (v === "" || v === null || v === undefined) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function fmt(dtIso) {
  if (!dtIso) return "";
  return new Date(dtIso).toLocaleString();
}
