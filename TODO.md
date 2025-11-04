# Hotel Booking App Development TODO

## Step 1: Firebase Setup (B1)
- [x] Update firebase.js to use the provided Firebase config (from task).
- [x] Initialize Firestore instead of Realtime DB.
- [x] Ensure collections: users, bookings, reviews are set up (via code).

## Step 2: Dependencies
- [x] Update package.json to add: @react-navigation/bottom-tabs, react-native-modal-datetime-picker.
- [x] Install the new dependencies using npm install.

## Step 3: Context Update
- [x] Extend context/userContext.js to include:
  - [x] Onboarding flag (AsyncStorage).
  - [x] Bookings state and Firestore operations.
  - [x] Reviews state and Firestore operations.
  - [x] Update user profile functions.

## Step 4: New Screens Creation
- [x] Create OnboardingScreen.js: Multi-screen flow with images from assets, AsyncStorage flag.
- [x] Create ExploreScreen.js: Hotel listings from API, FlatList with cards (image, name, location, rating, price), sorting/filtering.
- [x] Create HotelDetailScreen.js: Details, Book Now button, Reviews section with add review modal.
- [x] Create BookingScreen.js: Date pickers, room selection, cost calculation, confirmation, store in Firestore.
- [x] Create ProfileScreen.js: User info, edit profile, bookings list, logout.
- [x] Update LoginScreen.js: Add forgot password, better validation.
- [x] Update RegisterScreen.js: Better validation.

## Step 5: Navigation Update
- [x] Update App.js: Use Stack for auth/onboarding, Bottom Tabs for main app (Explore, Profile).
- [x] Ensure conditional rendering based on auth and onboarding state.

## Step 6: API Integration (B4)
- [x] Implement fetching hotels from RapidAPI Booking.com in ExploreScreen.
- [x] Handle loading, error states, update UI with fetched data.

## Step 7: Firestore Integration (B3)
- [x] Implement storing user profiles on sign-up.
- [x] Store bookings and reviews in Firestore with real-time listeners.
- [x] Fetch and display bookings/reviews in Profile/HotelDetail.

## Step 8: Testing and Final Touches
- Test auth flow with Firestore.
- Test API fetching and UI rendering.
- Test booking and review submissions.
- Ensure responsive design, error handling, no crashes on auth changes.
- Verify all requirements from A1-A6, B1-B4 are met.
