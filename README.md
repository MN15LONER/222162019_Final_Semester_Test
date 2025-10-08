
ShopEZ - Expo React Native shopping app

Quick start (clone + run)
1. Clone the repo and install dependencies:

   git clone <your-repo-url>
   cd <repo-folder>
   npm install

2. Install Expo CLI (if you don't have it):

   npm install -g expo-cli

3. Install native-compatible dependencies via Expo (recommended):

   cd <repo-folder>
   expo install @react-native-async-storage/async-storage
   expo install firebase
   # If prompted by Expo, accept any matching versions

4. Start the Expo dev server and clear cache (recommended on first run):

   expo start -c

5. Open the app in Expo Go on your device, or in an emulator.

Required packages (the app depends on these):
- expo (~54)
- react (19.x)
- react-native (0.81.x)
- firebase (^9.x)
- axios
- @react-navigation/native
- @react-navigation/stack
- react-native-gesture-handler
- react-native-reanimated
- react-native-safe-area-context
- react-native-screens
- @react-native-async-storage/async-storage

The exact package versions are listed in `package.json` (install via npm or yarn to get the same versions).

Firebase setup (you must do this locally):
1. Create a Firebase project at https://console.firebase.google.com/.
2. Enable Email/Password authentication in Authentication -> Sign-in method.
3. Create a Realtime Database (not Firestore) and note the database URL.
4. Add a Web app under Project settings -> General -> Your apps and copy the firebase config object.
5. Edit `firebase.js` in the project root and replace the placeholder values with your project's config values (apiKey, authDomain, databaseURL, projectId, storageBucket, messagingSenderId, appId).

Realtime Database security rules (copy/paste into the rules editor):

```
{
  "rules": {
    "carts": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

Troubleshooting & notes
- If you run into issues with Firebase auth on React Native / Expo, restart Metro with a cleared cache:

  expo start -c

- If the app shows an error about missing native modules (AsyncStorage), run:

  expo install @react-native-async-storage/async-storage

- If you change native dependencies in a bare React Native workflow, you may need to rebuild the native app (Xcode / Android Studio).

- The checkout flow is not implemented; add as needed.

If you'd like, I can create a short demo branch that contains sample firebase config (with fake placeholders) and a script for automated startup but I didn't commit any secrets to this repository.



