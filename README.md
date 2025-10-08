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


- If the app shows an error about missing native modules (AsyncStorage), run:

  expo install @react-native-async-storage/async-storage




