#include <SPI.h>
#include <LoRa.h>
#include <SoftwareSerial.h>
#include <TinyGPSPlus.h>

#define SS_PIN   10
#define RST_PIN  -1
#define DIO0_PIN 2
#define TRIG 7
#define ECHO 6

SoftwareSerial gpsSerial(4, 3);
TinyGPSPlus gps;

#define BIN_ID     1
#define BIN_HEIGHT 30

void setup() {
  Serial.begin(9600);
  delay(1000);

  pinMode(TRIG, OUTPUT);
  pinMode(ECHO, INPUT);
  gpsSerial.begin(9600);

  SPI.begin();
  pinMode(SS_PIN, OUTPUT);
  digitalWrite(SS_PIN, HIGH);
  delay(1000);

  digitalWrite(SS_PIN, LOW);
  SPI.transfer(0x42);
  byte ver = SPI.transfer(0x00);
  digitalWrite(SS_PIN, HIGH);
  if (ver != 0x12) delay(2000);

  LoRa.setPins(SS_PIN, RST_PIN, DIO0_PIN);
  LoRa.setSyncWord(0x12);

  if (!LoRa.begin(433E6)) {
    Serial.println("LoRa FAILED!");
    while (1);
  }

  LoRa.setSpreadingFactor(7);
  LoRa.setSignalBandwidth(125E3);
  LoRa.setCodingRate4(5);
  LoRa.setTxPower(17);

  Serial.println("================================");
  Serial.println("  SmartBin - Poubelle Intelligente");
  Serial.println("================================");
  Serial.println();
}

float readDistance() {
  digitalWrite(TRIG, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG, LOW);
  long dur = pulseIn(ECHO, HIGH, 30000);
  if (dur == 0) return -1;
  return dur * 0.034 / 2.0;
}

void loop() {
  unsigned long start = millis();
  while (millis() - start < 1000) {
    while (gpsSerial.available()) {
      gps.encode(gpsSerial.read());
    }
  }

  float dist = readDistance();
  int fill = 0;
  if (dist > 0 && dist < BIN_HEIGHT) {
    fill = 100 - (int)((dist / BIN_HEIGHT) * 100);
  } else if (dist >= BIN_HEIGHT) {
    fill = 0;
  } else {
    fill = -1;
  }

  float lat = 0, lon = 0;
  if (gps.location.isValid()) {
    lat = gps.location.lat();
    lon = gps.location.lng();
  }

  String msg = String(BIN_ID) + "," +
               String(fill) + "," +
               String(dist, 1) + "," +
               String(lat, 6) + "," +
               String(lon, 6);

  LoRa.beginPacket();
  LoRa.print(msg);
  LoRa.endPacket();

  // Pretty output
  Serial.println("--------------------------------");
  Serial.print("  Poubelle ID     : BIN");
  Serial.println(BIN_ID);
  Serial.print("  Remplissage     : ");
  if (fill >= 0) {
    Serial.print(fill);
    Serial.println(" %");
  } else {
    Serial.println("Erreur capteur");
  }
  Serial.print("  Distance        : ");
  if (dist >= 0) {
    Serial.print(dist, 1);
    Serial.println(" cm");
  } else {
    Serial.println("Erreur");
  }
  Serial.print("  GPS Latitude    : ");
  Serial.println(lat, 6);
  Serial.print("  GPS Longitude   : ");
  Serial.println(lon, 6);
  Serial.print("  GPS Status      : ");
  if (gps.location.isValid()) {
    Serial.println("Fixe OK");
  } else {
    Serial.println("En attente...");
  }
  Serial.print("  LoRa            : Envoye -> ");
  Serial.println(msg);
  Serial.println("--------------------------------");
  Serial.println();

  delay(5000);
}