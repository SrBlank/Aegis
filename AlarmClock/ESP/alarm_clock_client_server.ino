#include <Wire.h>
#include <SD.h>
#include <SPI.h>
#include "Audio.h"
#include "Adafruit_EPD.h"
#include <WiFi.h>
#include <WebServer.h>

#define LCK 25
#define DIN 26
#define BCK 12
#define SDCS 4
#define MAX9744_I2CADDR 0x4B
#define EPD_DC 17
#define EPD_CS 5
#define EPD_BUSY -1 // can set to -1 to not use a pin (will wait a fixed delay)
#define SRAM_CS 16
#define EPD_RESET 2  
#define EPD_SPI &SPI // primary SPI
#define COLOR1 EPD_BLACK
#define RESET_PIN 2

bool isSetup = false;
int8_t thevol = 31; // Volume level
const char* apSSID = "AEGIS_ESP32_AP";
const char* apPassword = "12345678";

char ssid[32] = "";     // Buffer for SSID
char password[32] = ""; // Buffer for Password

Audio audio;
Adafruit_SSD1680 display(250, 122, EPD_DC, EPD_RESET, EPD_CS, SRAM_CS, EPD_BUSY, EPD_SPI);
WebServer server(80);

void setup() {
  Serial.begin(115200);

  pinMode(RESET_PIN, INPUT_PULLUP);
  
  Serial.println("Starting Initialization");

  // Initialize I2C
  Wire.begin();
  if (!setvolume(thevol)) {
    Serial.println("--MAX9744 Initialization Failed");
    return;
  }
  audio.setPinout(BCK, DIN, LCK);
  audio.setVolume(21); // Volume level (0-21)
  Serial.println("--AMP and DAC Decoder Initialized");

  // Initialize display
  if (!display.begin()) {
      Serial.println("--Display Initialization Failed");
      return;
  }
  Serial.println("--Display Initialized");

  // Initialize SD card
  if (!SD.begin(SDCS)) {
      Serial.println("--Card Mount Failed");
      return;
  }
  Serial.println("--SD Card Initialized");

  // Check if setup is needed
  if (digitalRead(RESET_PIN) == LOW || !loadCredentials()) {
    updateDisplay("Setup...");
    startFirstTimeSetup();
  } else {
    connectToWiFi();
  }
}

void loop() {
  if (isSetup) {
    server.handleClient();
  } else {
    // Your normal operation code here
  }
}

/*
 * startFirstTimeSetup - will start the Access Point
 */
void startFirstTimeSetup() {
  Serial.println("Starting First-Time Setup");
  WiFi.softAP(apSSID, apPassword);
  
  server.on("/", handleRoot);
  server.on("/configure", HTTP_POST, handleConfigure);
  
  server.begin();
  Serial.println("HTTP server started, connect to ESP32_AP");
  isSetup = true; 
}

/*
 * connectToWifi - connects to wifi
 */
void connectToWiFi() {
  Serial.println("Connecting to WiFi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("--WiFi Initialized. IP Address: ");
  Serial.println(WiFi.localIP());
  isSetup = false;
  // Proceed with normal operation after WiFi is connected
}

/*
 * loadCredentials - will get credentials from SD card
 */
bool loadCredentials() {
  File file = SD.open("/credentials.txt");
  if (!file) {
    Serial.println("No credentials found.");
    return false;
  }
  String s = file.readStringUntil('\n');
  if (s.startsWith("SSID:")) {
    strncpy(ssid, s.substring(5).c_str(), sizeof(ssid) - 1);
    ssid[sizeof(ssid) - 1] = '\0'; // Ensure null-termination
    s = file.readStringUntil('\n');
    if (s.startsWith("PASSWORD:")) {
      strncpy(password, s.substring(9).c_str(), sizeof(password) - 1);
      password[sizeof(password) - 1] = '\0'; // Ensure null-termination
      file.close();
      Serial.println("Credentials loaded.");
      return true;
    }
  }
  file.close();
  Serial.println("Failed to load credentials.");
  return false;
}

/*
 * saveCredentials - will save credentials to SD card
 */
void saveCredentials(const char* ssid, const char* password) {
  File file = SD.open("/credentials.txt", FILE_WRITE);
  if (file) {
    file.println(String("SSID:") + ssid);
    file.println(String("PASSWORD:") + password);
    file.close();
    Serial.println("Credentials saved.");
  } else {
    Serial.println("Failed to save credentials.");
  }
}

/*
 * handleRoot- starts web page
 */
void handleRoot() {
  String html = "<html><body><h1>Configure WiFi</h1><form action='/configure' method='POST'><label for='ssid'>SSID:</label><input type='text' id='ssid' name='ssid'><br><label for='password'>Password:</label><input type='password' id='password' name='password'><br><input type='submit' value='Submit'></form></body></html>";
  server.send(200, "text/html", html);
}

/*
 * handleConfigure - interprets data from http form
 */
void handleConfigure() {
  if (server.hasArg("ssid") && server.hasArg("password")) {
    String ssid = server.arg("ssid");
    String password = server.arg("password");

    // Save credentials to a file
    saveCredentials(ssid.c_str(), password.c_str());

    server.send(200, "text/plain", "Configuration received, restarting...");
    delay(1000);
    ESP.restart(); // Restart to apply new configuration
  } else {
    server.send(400, "text/plain", "Invalid request");
  }
}

/*
 * updateDisplay - Update E-Ink Display
 */
void updateDisplay(String text) {
    display.clearBuffer();
    display.setCursor(0, 0);
    display.setTextColor(COLOR1);
    display.setTextWrap(true);
    display.print(text);
    display.display();
}

/*
 * setVolume - Set volume for MAX9744 AMP
 */
bool setvolume(int8_t v) {
  if (v > 63) v = 63;
  if (v < 0) v = 0;
  Wire.beginTransmission(MAX9744_I2CADDR);
  Wire.write(v);
  return Wire.endTransmission() == 0;
}
