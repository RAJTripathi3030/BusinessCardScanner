# How to Build an Android APK

To create a standalone APK file that you can install on your phone, you will use **EAS Build** (Expo Application Services).

## Prerequisites

1.  **Expo Account**: You need an account at [expo.dev](https://expo.dev/signup).
2.  **EAS CLI**: Install the command line tool globally (if not already installed):
    ```bash
    npm install -g eas-cli
    ```

## Steps to Build

### 1. Login to Expo
Run the following command and log in with your credentials:
```bash
eas login
```

### 2. Configure the Project
Run this command to set up the build configuration:
```bash
eas build:configure
```
- Select **Android** when asked.
- This will create an `eas.json` file in your project.

### 3. Configure for APK (Preview Build)
By default, EAS builds an `.aab` file for the Play Store. To get an installable `.apk`, open `eas.json` and add a `preview` profile:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {}
  }
}
```

### 4. Run the Build
Run the build command using the preview profile:
```bash
eas build -p android --profile preview
```

### 5. Download and Install
- The build process will take a few minutes.
- Once finished, it will provide a **link to download the APK**.
- Open that link on your phone to download and install the app.
