# Project Brief: Sakinah Bloom - Islamic Prayer Times App

## 1. Project Overview
**Sakinah Bloom** is a mobile application (React Native) designed to provide users with accurate Islamic prayer times with a focus on peace, elegance, and Swedish localization. The app combines modern Swedish minimalism with subtle Islamic aesthetic touches to create a serene user experience.

## 2. Target Audience
- Muslim residents and travelers in Sweden.
- Users looking for a clean, distraction-free, and high-fidelity prayer time utility.

## 3. Core Features & Requirements

### 3.1. Prayer Times Dashboard
- **Daily Times:** Display Fajr, Shuruk (Sunrise), Dhuhr, Asr, Maghrib, and Isha.
- **Visual Hierarchy:** 
    - Hero section highlighting the **Next Prayer** (Name and Time) and the remaining time (countdown).
    - Prominent highlighting of the **Current Prayer** in the daily list.
- **Thematic Icons:** Custom icons for each prayer representing the sun/moon's position.
- **Date Navigation:** Ability to change the date to view past or future prayer times.

### 3.2. Location & Localization
- **Swedish City Support:** Comprehensive support for cities across Sweden.
- **Auto-Detection:** Automatically detect the nearest city via GPS/Location services on first load.
- **Manual Selection:** Searchable list of Swedish cities for manual overrides.

### 3.3. Qibla Finder
- **Compass Interface:** An elegant, interactive compass to help users find the Qibla direction based on their current location.

### 3.4. Notifications & Alerts
- **Individual Controls:** Toggle notifications on/off for each specific prayer.
- **Customization:** Support for pre-alerts (e.g., 15 mins before) and Adhan-specific notifications.

### 3.5. Data & Performance
- **API Integration:** Load accurate prayer times from a reliable external API.
- **Caching:** Cache data locally to ensure quick access and offline availability.

### 3.6. Information
- **About Section:** Details about the app version, background on the "Sakinah Bloom" brand, and developer/contact information.

## 4. Design Principles
- **Aesthetic:** "Sakinah Bloom" (Peaceful Bloom). Use of warm stone tones, deep emerald greens, and soft highlights.
- **Typography:** Elegant, modern serif titles (avoiding "newspaper-style" serifs) paired with clean, legible sans-serif for utility data.
- **Consistency:** High-fidelity components (TopAppBar, BottomNavBar) used across all screens.
- **Exportability:** Clean, semantic code structure (HTML/Tailwind) for ease of implementation.

## 5. App Structure (Current Screens)
1. **Prayer Times (Home):** Main dashboard with countdown and list.
2. **Select City:** Location management and search.
3. **Qibla Finder:** Compass view.
4. **Notifications/Settings:** Alert management.
5. **About:** App information and credits.

## 6. Technical Stack
- **Framework:** React Native.
- **Styling:** Consistent design tokens for colors, typography, and spacing.
- **Localization:** Swedish locale settings.
