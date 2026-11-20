#pragma once
// Copy this file to secrets.h and fill in your own values.
// secrets.h is git-ignored: never publish Wi-Fi passwords or AWS IoT keys.

// ========== WIFI CONFIG ==========
const char* WIFI_SSID     = "your-wifi-ssid";
const char* WIFI_PASSWORD = "your-wifi-password";

// ========== AWS IOT CONFIG ==========
const char* AWS_IOT_ENDPOINT = "xxxxxxxxxxxxxx-ats.iot.<region>.amazonaws.com";
const int   AWS_IOT_PORT     = 8883;
const char* THING_NAME       = "heltec-gateway";
const char* MQTT_TOPIC       = "smartbin/data";

// ========== CERTIFICATES (from the AWS IoT console) ==========
const char AWS_ROOT_CA[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
<Amazon Root CA 1>
-----END CERTIFICATE-----
)EOF";

const char DEVICE_CERT[] PROGMEM = R"EOF(
-----BEGIN CERTIFICATE-----
<your device certificate>
-----END CERTIFICATE-----
)EOF";

const char PRIVATE_KEY[] PROGMEM = R"EOF(
-----BEGIN RSA PRIVATE KEY-----
<your device private key>
-----END RSA PRIVATE KEY-----
)EOF";

