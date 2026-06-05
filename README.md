# Workout PWA

A small phone-friendly workout tracker built as a progressive web app. It is intended to be published with GitHub Pages, opened on a phone, and added to the Home Screen so it can be used like an app offline and cost-free.

It lets you create workout templates, start workouts from those templates, log sets, add notes, review recent activity, and use a simple rest timer.

## Features

- Create reusable workout templates with a code, name, and exercise list.
- Start a workout from any active template.
- Log sets with reps, weight, RPE, and an optional note.
- Add workout-level notes and per-exercise notes.
- View recent workouts and history for the current template.
- Use an optional rest timer that starts after adding a set.
- Runs locally in the browser with IndexedDB storage.
- Caches the app shell locally for offline use after the first load.

## Privacy and Data

This app does not include API keys, passwords, access tokens, server credentials, or remote service configuration.

Workout data is stored locally on the user's device using the browser's IndexedDB storage. It is not uploaded anywhere by this app.

On iPhone, this means workouts are saved locally for the Safari/GitHub Pages app origin used when the app is added to the Home Screen. If a user clears Safari website data, removes the saved app data, uses another browser/device, or opens the app from a different URL, their stored workout data may not be available.

## Project Structure

```text
workout-pwa/
  index.html              Main app page
  app.js                  App startup and view coordination
  db.js                   IndexedDB setup and helpers
  templatesRepo.js        Template data operations
  templatesView.js        Template list and editor UI
  workoutsRepo.js         Workout data operations
  workoutView.js          Workout screen UI
  setsRepo.js             Set logging data operations
  exerciseNotesRepo.js    Exercise note data operations
  restTimer.js            Rest timer UI and logic
  recentActivityView.js   Recent workout activity UI
  service-worker.js       Offline app shell cache
  manifest.json           PWA manifest
```

## Use on iPhone

1. Publish the app with GitHub Pages (details below).
2. Open the GitHub Pages URL in Safari on your iPhone.
3. Tap the Safari share button.
4. Choose `Add to Home Screen`.
5. Open `Workout` from the Home Screen.
6. Create templates and log workouts.

After the first successful load, the service worker caches the app files locally so the app can open offline. Workout data is also saved locally on the phone.

## How to Use

1. Select `+ New template`.
2. Enter a template code, a template name, and one exercise per line.
3. Save the template.
4. Select `Start workout`.
5. Add sets for each exercise as you train.
6. Optionally enable the rest timer before logging sets.
7. Add workout notes, then select `Finish workout`.
8. Use recent activity or template history to review previous workouts.

## Publish with GitHub Pages

1. Push this project to a GitHub repository.
2. In the repository settings, open `Pages`.
3. Choose the branch you want to publish.
4. If `workout-pwa` is the project folder, either publish from that folder if your Pages setup supports it, or move the contents of `workout-pwa` to the repository root.
5. Open the GitHub Pages URL once deployment finishes.
6. On iPhone, open that URL in Safari and add it to the Home Screen.

## Notes

- The app currently has no build step and no external dependencies.
- The `manifest.json` references `icons/icon-192.png` and `icons/icon-512.png`. Add those files before publishing if you want installable PWA icons to display correctly.
- The UI includes a debug output area that displays the active workout JSON. This is local browser data only, but you may want to remove it before sharing the app with non-technical users.
