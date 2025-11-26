import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, ActivityIndicator, ScrollView, Alert, TextInput, Modal, TouchableOpacity, Clipboard } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CameraScanner from './src/components/CameraScanner';
import { extractBusinessCardInfo } from './src/services/geminiService';
import { saveToSheet } from './src/services/sheetsService';

const APPS_SCRIPT_CODE = `function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = JSON.parse(e.postData.contents);
  
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Name", "Job Title", "Company", "Email", "Phone", "Website", "Address"]);
  }
  
  sheet.appendRow([
    data.name, data.job_title, data.company, data.email, data.phone, data.website, data.address
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
}`;

export default function App() {
  const [view, setView] = useState('home'); // home, camera, processing, result
  const [scannedData, setScannedData] = useState(null);
  const [sheetUrl, setSheetUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    loadSheetUrl();
  }, []);

  const loadSheetUrl = async () => {
    try {
      const savedUrl = await AsyncStorage.getItem('sheetUrl');
      if (savedUrl) {
        setSheetUrl(savedUrl);
      }
    } catch (error) {
      console.error("Failed to load sheet URL", error);
    }
  };

  const saveSheetUrl = async (url) => {
    try {
      setSheetUrl(url);
      await AsyncStorage.setItem('sheetUrl', url);
    } catch (error) {
      console.error("Failed to save sheet URL", error);
    }
  };

  const handleStartScan = () => {
    if (!sheetUrl) {
      Alert.alert("Missing URL", "Please enter your Google Apps Script Web App URL first.");
      return;
    }
    setView('camera');
  };

  const handlePictureTaken = async (photo) => {
    setView('processing');
    try {
      const data = await extractBusinessCardInfo(photo.uri);
      setScannedData(data);
      setView('result');
    } catch (error) {
      Alert.alert("Error", "Failed to extract information. Please try again.");
      setView('home');
    }
  };

  const handleCancelScan = () => {
    setView('home');
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveToSheet(sheetUrl, scannedData);
      Alert.alert("Success", "Data saved to Google Sheet!");
      setView('home');
      setScannedData(null);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetake = () => {
    setScannedData(null);
    setView('camera');
  };

  const copyToClipboard = () => {
    Clipboard.setString(APPS_SCRIPT_CODE);
    Alert.alert("Copied", "Code copied to clipboard!");
  };

  if (view === 'camera') {
    return (
      <SafeAreaProvider style={styles.safeArea}>
        <CameraScanner onPictureTaken={handlePictureTaken} onCancel={handleCancelScan} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider style={styles.safeArea}>
      <SafeAreaView style={styles.container} edges={['right', 'left', 'top']}>
        <StatusBar style="dark" backgroundColor="#fff" />

        {view === 'home' && (
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>Business Card Scanner</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Google Apps Script URL:</Text>
              <TextInput
                style={styles.input}
                placeholder="https://script.google.com/..."
                value={sheetUrl}
                onChangeText={saveSheetUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity onPress={() => setShowHelp(true)}>
                <Text style={styles.helpLink}>How to get this URL?</Text>
              </TouchableOpacity>
            </View>

            <Button title="Scan Business Card" onPress={handleStartScan} />
          </ScrollView>
        )}

        {view === 'processing' && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.loadingText}>Extracting information...</Text>
          </View>
        )}

        {view === 'result' && scannedData && (
          <ScrollView contentContainerStyle={styles.resultContainer}>
            <Text style={styles.title}>Extracted Information</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{scannedData.name || 'N/A'}</Text>

              <Text style={styles.label}>Job Title:</Text>
              <Text style={styles.value}>{scannedData.job_title || 'N/A'}</Text>

              <Text style={styles.label}>Company:</Text>
              <Text style={styles.value}>{scannedData.company || 'N/A'}</Text>

              <Text style={styles.label}>Email:</Text>
              <Text style={styles.value}>{scannedData.email || 'N/A'}</Text>

              <Text style={styles.label}>Phone:</Text>
              <Text style={styles.value}>{scannedData.phone || 'N/A'}</Text>

              <Text style={styles.label}>Website:</Text>
              <Text style={styles.value}>{scannedData.website || 'N/A'}</Text>

              <Text style={styles.label}>Address:</Text>
              <Text style={styles.value}>{scannedData.address || 'N/A'}</Text>
            </View>

            <View style={styles.buttonGroup}>
              {isSaving ? (
                <ActivityIndicator size="small" color="#0000ff" />
              ) : (
                <Button title="Save to Sheets" onPress={handleSave} />
              )}
              <View style={styles.spacer} />
              <Button title="Retake" onPress={handleRetake} color="red" />
            </View>
          </ScrollView>
        )}

        <Modal visible={showHelp} animationType="slide">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Setup Instructions</Text>
              <Button title="Close" onPress={() => setShowHelp(false)} />
            </View>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.step}>1. Create a new Google Sheet.</Text>
              <Text style={styles.step}>2. Go to Extensions {'>'} Apps Script.</Text>
              <Text style={styles.step}>3. Delete any code there and paste this:</Text>

              <View style={styles.codeBlock}>
                <Text style={styles.code}>{APPS_SCRIPT_CODE}</Text>
              </View>
              <Button title="Copy Code" onPress={copyToClipboard} />

              <Text style={styles.step}>4. Click Deploy {'>'} New Deployment.</Text>
              <Text style={styles.step}>5. Select type: Web App.</Text>
              <Text style={styles.step}>6. Set "Who has access" to "Anyone".</Text>
              <Text style={styles.step}>7. Click Deploy and copy the Web App URL.</Text>
              <Text style={styles.step}>8. Paste the URL in the app.</Text>
            </ScrollView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginTop: 5,
    width: '100%',
  },
  helpLink: {
    color: '#007AFF',
    marginTop: 10,
    textAlign: 'right',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    padding: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    backgroundColor: '#f9f9f9',
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  value: {
    fontSize: 18,
    fontWeight: '500',
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 40,
    alignItems: 'center',
  },
  spacer: {
    width: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalContent: {
    padding: 20,
  },
  step: {
    fontSize: 16,
    marginBottom: 10,
    marginTop: 10,
  },
  codeBlock: {
    backgroundColor: '#f4f4f4',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  code: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
});
