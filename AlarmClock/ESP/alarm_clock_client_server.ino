#include <Wire.h>
#include <SD.h>
#include <SPI.h>
#include "Audio.h"
#include "Adafruit_EPD.h"
#include <WiFi.h>

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

int8_t thevol = 31; // Volume level
const char* ssid     = "*******";
const char* password = "*******";

// Create an Audio and display object
Audio audio;
Adafruit_SSD1680 display(250, 122, EPD_DC, EPD_RESET, EPD_CS, SRAM_CS, EPD_BUSY, EPD_SPI);

void setup() {
  Serial.begin(115200);

  Serial.println("Starting Initiliaztion")
  // Initialize I2C
  Wire.begin();
  if (!setvolume(thevol)) {
    Serial.println("--MAX9744 Initialization Failed");
    return;
  }
  audio.setPinout(BCK, DIN, LCK);
  audio.setVolume(21); // Volume level (0-21)
  Serial.println("--AMP and DAC Decoder Initialized")
  // Initialize display
  if (!display.begin()) {
      Serial.println("--Display Initialization Failed");
      return;
  }
  Serial.println("--Display Initialized")
  // Initialize SD card
  if (!SD.begin(SDCS)) {
      Serial.println("--Card Mount Failed");
      return;
  }
  Serial.println("--SD Card Initialized")
  // Initialize WIFI
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();
  Serial.print("--WIFI Initalized RSSI: ");
  Serial.println(WiFi.RSSI());
  Serial.println("Initialization successful");
}

void loop() {
  File root = SD.open("/");
  File file = root.openNextFile();

  while (file) {
    if (file.isDirectory()) {
      file = root.openNextFile();
      continue;
    } else {
      // Check if the file is an MP3
      String fileName = file.name();
      if (fileName.endsWith(".mp3")) {
        Serial.println("Playing file: " + fileName);
        updateDisplay("Playing: " + fileName);
        if (audio.connecttoFS(SD, file.name())) {
          while (audio.isRunning()) {
            audio.loop();
          }
        }
        updateDisplay("Finished: " + fileName);
      }
    }
    file.close();
    file = root.openNextFile();
  }
  updateDisplay("No more files to play");
  delay(10000); // Wait for 10 seconds before restarting the loop
}

/*
 * Update E-Ink Display
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
 * Set volume for MAX9744 AMP
 */
bool setvolume(int8_t v) {
  if (v > 63) v = 63;
  if (v < 0) v = 0;
  Wire.beginTransmission(MAX9744_I2CADDR);
  Wire.write(v);
  return Wire.endTransmission() == 0;
}