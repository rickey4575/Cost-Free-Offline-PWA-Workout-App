// db.js

const DB_NAME = "workoutDB";
const DB_VERSION = 1;

let dbPromise = null;

/**
 * Open database
 */
export function openDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      /* =========================
         1) templates
      ========================= */
      if (!db.objectStoreNames.contains("templates")) {
        const templates = db.createObjectStore("templates", {
          keyPath: "id"
        });

        templates.createIndex("code", "code", { unique: true });
      }

      /* =========================
         2) workouts
      ========================= */
      if (!db.objectStoreNames.contains("workouts")) {
        const workouts = db.createObjectStore("workouts", {
          keyPath: "id"
        });

        workouts.createIndex("startedAt", "startedAt", { unique: false });
        workouts.createIndex("templateCode", "templateCode", { unique: false });
        workouts.createIndex(
          "templateCode_startedAt",
          ["templateCode", "startedAt"],
          { unique: false }
        );
      }

      /* =========================
         3) sets
      ========================= */
      if (!db.objectStoreNames.contains("sets")) {
        const sets = db.createObjectStore("sets", {
          keyPath: "id"
        });

        sets.createIndex("workoutId", "workoutId", { unique: false });
        sets.createIndex("exerciseName", "exerciseName", { unique: false });

        sets.createIndex(
          "exerciseName_performedAt",
          ["exerciseName", "performedAt"],
          { unique: false }
        );

        sets.createIndex(
          "workout_exercise_order",
          ["workoutId", "exerciseName", "order"],
          { unique: false }
        );
      }

      /* =========================
         4) exerciseNotes
      ========================= */
      if (!db.objectStoreNames.contains("exerciseNotes")) {
        const exerciseNotes = db.createObjectStore("exerciseNotes", {
          keyPath: "id"
        });

        exerciseNotes.createIndex(
          "workout_exercise_unique",
          ["workoutId", "exerciseName"],
          { unique: true }
        );

        exerciseNotes.createIndex("workoutId", "workoutId", {
          unique: false
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * Generic transaction helper
 */
async function tx(storeName, mode = "readonly") {
  const db = await openDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

/**
 * Add record
 */
export async function add(storeName, value) {
  const store = await tx(storeName, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.add(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Put (insert or update)
 */
export async function put(storeName, value) {
  const store = await tx(storeName, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.put(value);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get by ID
 */
export async function get(storeName, id) {
  const store = await tx(storeName);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Get all
 */

export async function getAll(storeName) {
  const store = await tx(storeName);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete by ID
 */
export async function remove(storeName, id) {
  const store = await tx(storeName, "readwrite");

  return new Promise((resolve, reject) => {
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getByIndex(storeName, indexName, key) {
  const store = await tx(storeName);
  return new Promise((resolve, reject) => {
    const req = store.index(indexName).get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllByIndex(storeName, indexName, key) {
  const store = await tx(storeName);
  return new Promise((resolve, reject) => {
    const req = store.index(indexName).getAll(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function putByUniqueIndex(storeName, indexName, key, makeValue) {
  const store = await tx(storeName, "readwrite");

  return new Promise((resolve, reject) => {
    const idx = store.index(indexName);
    const getReq = idx.get(key);

    getReq.onerror = () => reject(getReq.error);
    getReq.onsuccess = () => {
      const existing = getReq.result;
      const value = makeValue(existing || null);

      const putReq = store.put(value);
      putReq.onerror = () => reject(putReq.error);
      putReq.onsuccess = () => resolve(value);
    };
  });
}
