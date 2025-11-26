# Business Card Scanner 📸📇

A powerful React Native application that scans business cards, extracts contact information using Google's Gemini AI, and automatically saves the data to a Google Sheet.

## 🚀 Features

-   **AI-Powered Extraction**: Uses Google Gemini (v2.0 Flash) to intelligently parse names, emails, phone numbers, companies, and more from card images.
-   **Seamless Integration**: Directly uploads extracted data to your own Google Sheet via a Google Apps Script Web App.
-   **Dynamic Configuration**: Users can input their own Google Sheets Web App URL directly in the app.
-   **Cross-Platform**: Built with Expo, compatible with Android (and iOS).
-   **Offline Storage**: Remembers your configuration settings using local storage.

## 🛠️ Tech Stack

-   **Frontend**: React Native, Expo
-   **AI Model**: Google Gemini 2.0 Flash (`@google/generative-ai`)
-   **Backend/Database**: Google Sheets + Google Apps Script
-   **Camera**: `expo-camera`
-   **Storage**: `@react-native-async-storage/async-storage`

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/BusinessCardScanner.git
cd BusinessCardScanner
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure API Keys
1.  Get a **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/).
2.  Open `src/services/geminiService.js`.
3.  Replace the `API_KEY` variable with your key:
    ```javascript
    const API_KEY = "YOUR_ACTUAL_API_KEY";
    ```

### 4. Setup Google Sheets Backend
1.  Create a new Google Sheet.
2.  Go to **Extensions > Apps Script**.
3.  Paste the following code:
    ```javascript
    function doPost(e) {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
      const data = JSON.parse(e.postData.contents);
      
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["Name", "Job Title", "Company", "Email", "Phone", "Website", "Address"]);
      }
      
      sheet.appendRow([
        data.name, data.job_title, data.company, data.email, data.phone, data.website, data.address
      ]);
      
      return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
    }
    ```
4.  **Deploy** as a Web App:
    *   **Execute as**: Me
    *   **Who has access**: **Anyone**
5.  Copy the **Web App URL**.

## 📱 Running the App

Start the development server:
```bash
npx expo start
```
*   Press `s` to switch to Expo Go (if using the app).
*   Press `a` for Android Emulator.
*   Press `w` for Web.

**Note**: If you face connection issues, try tunneling:
```bash
npx expo start --tunnel
```

## 📦 Building the APK

To build a standalone Android APK, follow the detailed instructions in [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md).

Quick command (requires EAS CLI):
```bash
eas build -p android --profile preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
