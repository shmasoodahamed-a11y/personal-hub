# Personal Hub

A browser based personal workspace for focus sessions, planning, learning topics, watchlists, and finances. Data is saved in the browser by default. Google sign-in syncs the app data through Firebase Firestore.

## Run locally

The app uses browser storage and a service worker, so open it through a local web server instead of double-clicking `index.html`:

1. Open PowerShell in this folder.
2. Run `py -m http.server 8000`.
3. Visit [http://localhost:8000](http://localhost:8000).

The first launch asks for your currency and calendar week start. Use **Preferences** to change them later. Planner tasks are date based and do not require a time. Use **Export Data** regularly to save a portable JSON backup; importing a backup restores app data and notebooks.

## Cloud sync

Google sign-in requires a Firebase project configured in `script.js` with Google authentication and Firestore enabled. Deploy the included `firestore.rules` to that project's Firestore database before using cloud sync. The rules limit each signed-in account to its own `/users/{userId}` document. Signed-in users can sync that personal workspace across devices; this setup does not provide multi-account team collaboration.

## Offline and installable use

The service worker caches the app shell after the first successful visit. Browser install prompts require a supported browser and a secure context; `localhost` counts as secure for local development. Some app features that load libraries from external CDNs need an initial internet connection.

