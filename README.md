# Overview
A react native app that allows users see salaat times in Sweden for their city. It also includes a feature that allows users to see the qibla direction.


# Setup
This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
    npx run android
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)


## Build on EAS (Expo Application Services)
1. Install the EAS CLI

   ```bash
   npm install -g eas-cli
   ```

2. Authenticate with your Expo account

   ```bash
    eas login
    ```

3. Build the app

   ```bash
    eas build --platform android
   ```

NOTE: This project is already configured to build on EAS. You can find the configuration in the `eas.json` file.


## Development Resources

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.
