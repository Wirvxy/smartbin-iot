#include <RadioLib.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <PubSubClient.h>

// Wi-Fi + AWS IoT credentials live in secrets.h (copy secrets.example.h)
#include "secrets.h"

// ========== LORA PINS ==========
#define LORA_NSS   8
#define LORA_DIO1  14
#define LORA_RST   12
#define LORA_BUSY  13
#define VEXT_PIN   36

SX1262 radio = new Module(LORA_NSS, LORA_DIO1, LORA_RST, LORA_BUSY);

WiFiClientSecure wifiClient;
PubSubClient mqttClient(wifiClient);

void connectWiFi() {
  Serial.print("Connecting to WiFi");
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println(" OK!");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void connectMQTT() {
  mqttClient.setServer(AWS_IOT_ENDPOINT, AWS_IOT_PORT);
  while (!mqttClient.connected()) {
    Serial.print("Connecting to AWS IoT...");
    if (mqttClient.connect(THING_NAME)) {
      Serial.println(" OK!");
    } else {
      Serial.print(" FAILED (rc=");
      Serial.print(mqttClient.state());
      Serial.println(") retrying in 3s...");
      delay(3000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("=== HELTEC V3 GATEWAY ===");

  pinMode(VEXT_PIN, OUTPUT);
  digitalWrite(VEXT_PIN, LOW);
  delay(500);

  SPI.begin(9, 11, 10, 8);
  int state = radio.begin(433.0, 125.0, 7, 5, 0x12, 17, 8, 1.6, false);
  radio.setSyncWord(0x12, 0x24);

  if (state == RADIOLIB_ERR_NONE) {
    Serial.println("LoRa: OK at 433 MHz");
  } else {
    Serial.print("LoRa: FAILED ");
    Serial.println(state);
    while (1);
  }

  connectWiFi();

  wifiClient.setCACert(AWS_ROOT_CA);
  wifiClient.setCertificate(DEVICE_CERT);
  wifiClient.setPrivateKey(PRIVATE_KEY);

  mqttClient.setBufferSize(512);
  connectMQTT();

  Serial.println("=== GATEWAY READY ===");
  Serial.println("Waiting for LoRa packets...");
}

void loop() {
  if (!mqttClient.connected()) {
    connectMQTT();
  }
  mqttClient.loop();

  String received;
  int state = radio.receive(received, 0);

  if (state == RADIOLIB_ERR_NONE) {
    float rssi = radio.getRSSI();
    float snr = radio.getSNR();

    Serial.println("--- LoRa Packet ---");
    Serial.print("Data: ");
    Serial.println(received);
    Serial.print("RSSI: ");
    Serial.print(rssi);
    Serial.print(" dBm | SNR: ");
    Serial.print(snr);
    Serial.println(" dB");

    String payload = "{";
    payload += "\"raw\":\"" + received + "\",";
    payload += "\"rssi\":" + String(rssi, 1) + ",";
    payload += "\"snr\":" + String(snr, 1) + ",";
    payload += "\"gateway\":\"" + String(THING_NAME) + "\"";
    payload += "}";

    if (mqttClient.publish(MQTT_TOPIC, payload.c_str())) {
      Serial.println("-> Published to AWS!");
    } else {
      Serial.println("-> AWS publish FAILED!");
    }
    Serial.println();
  }
}