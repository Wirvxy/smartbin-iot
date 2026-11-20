# 🗑️ SmartBin: IoT Smart Waste Management

![Java](https://img.shields.io/badge/Java_17-ED8B00?style=flat-square&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.2-6DB33F?style=flat-square&logo=springboot&logoColor=white)
![Expo](https://img.shields.io/badge/Expo_54-000020?style=flat-square&logo=expo&logoColor=white)
![Arduino](https://img.shields.io/badge/Arduino-00878F?style=flat-square&logo=arduino&logoColor=white)
![LoRa](https://img.shields.io/badge/LoRa_433_MHz-1a1a1a?style=flat-square)
![AWS IoT](https://img.shields.io/badge/AWS_IoT_Core-232F3E?style=flat-square&logo=amazonwebservices&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)

Connected bins that measure their own fill level and position, send it over **LoRa** to a gateway, which forwards it to **AWS IoT Core**. City agents follow everything on a **web dashboard**, and citizens use a **mobile app** to find the nearest bin that isn't full.

> End-of-studies project (PFE), DUT *Gestion Réseaux et Sécurité*, EST Fès (Université Sidi Mohammed Ben Abdellah), Dec 2025 – Mar 2026.

![Architecture](docs/architecture.svg)

---

## ✨ Features

| | |
|---|---|
| 📡 **Sensor node** | Ultrasonic fill-level measurement + GPS position, sent every few seconds over LoRa 433 MHz |
| 🛰️ **Gateway** | Heltec WiFi LoRa 32 V3 receives LoRa packets, adds RSSI/SNR, publishes to AWS IoT over MQTT/TLS with an X.509 device certificate |
| 🖥️ **Web dashboard** | Live fill levels, map, per-container history, automatic alerts above the threshold, collection tracking, PDF/CSV reports, user management |
| 📱 **Mobile app** | Region picker, list sorted by a recommendation score (fill level × distance), map, statistics. Runs on Android, iOS and web |
| 🧪 **Demo mode** | A built-in simulator replays the exact sensor + gateway payload, so the whole system runs on a laptop without hardware or AWS |

## 📸 Screenshots

### Web dashboard
| Dashboard | Containers |
|---|---|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Containers](docs/screenshots/containers.png) |

| Live container (fed by the sensor node) | Automatic alerts |
|---|---|
| ![Container](docs/screenshots/container-live.png) | ![Alerts](docs/screenshots/alerts.png) |

**Login audit:** every dashboard login attempt is logged, so brute-force attempts show up in red.

![Login history](docs/screenshots/login-history.png)

### Mobile app
| Login | Regions | Recommended bins | Statistics | Details |
|---|---|---|---|---|
| ![](docs/screenshots/app-login.png) | ![](docs/screenshots/app-regions.png) | ![](docs/screenshots/app-containers.png) | ![](docs/screenshots/app-stats.png) | ![](docs/screenshots/app-detail.png) |

*Screenshots taken with the backend in demo mode (simulated sensor) and the app in demo mode. In the sandbox used for the captures, map tiles could not load, which is why the map backgrounds are grey.*

## 🔄 How a reading travels

1. **Sensor node** (`firmware/sensor-node`) measures the distance to the waste, computes the fill %, reads the GPS and sends one LoRa packet:
   ```
   BIN_ID,FILL_%,DISTANCE_CM,LATITUDE,LONGITUDE      e.g.  1,45,16.5,34.004200,-4.991800
   ```
2. **Gateway** (`firmware/gateway`) wraps it as JSON and publishes it to `smartbin/data` on AWS IoT Core:
   ```json
   {"raw":"1,45,16.5,34.004200,-4.991800","rssi":-71.0,"snr":9.5,"gateway":"heltec-gateway"}
   ```
3. The reading is stored in `sensor_data`, and the latest value per bin is kept in `final_stats`.
4. **Backend** syncs `final_stats` into the containers every 5 s and raises an alert when a bin passes its threshold (80 % by default).
5. **Dashboard** and **mobile app** show the new level.

The backend also exposes `POST /api/iot/ingest` (authenticated with an `X-API-Key` header), which performs step 3 directly, so an AWS IoT Rule HTTP action or any test client can feed the system.

## 🔐 Security review

Before publishing, the project went through a security review. Issues found and fixed:

| Issue found | Fix |
|---|---|
| Wi-Fi password, AWS IoT **private key** and certificate hard-coded in the gateway sketch | Moved to a git-ignored `secrets.h` (template: `secrets.example.h`) |
| Production database host and password in `application.yml` | Environment variables + `prod` profile; in-memory H2 for the `demo` profile |
| Default JWT signing key in the config | `JWT_SECRET` env var; the app **refuses to start in prod** with dev defaults |
| CSRF protection disabled on the dashboard (session cookies) | CSRF re-enabled; Thymeleaf forms carry the token |
| Mobile API (`/api/mobile/**`) was public: anyone could read all data | Requires the JWT from `/api/auth/login` |
| Login endpoint answered `200 "Error: ..."` on bad credentials | Proper `401` with a generic message (no account enumeration) |
| Admin password reset to a hard-coded value on every restart | Default accounts created only once |
| No record of failed logins | Every attempt (success/failure, IP, user agent) stored and visible to admins |
| IoT data entry had no authentication | Shared API key, compared in constant time, plus payload validation |

<details>
<summary><b>Functional bugs fixed during the same review</b></summary>

- Containers list and detail pages crashed (500): broken Thymeleaf ternary expressions and `T()` class references
- "Add user" page crashed: invalid quote escaping in a SpEL expression
- Editing a container crashed: infinite `toString()` recursion between JPA entities (Lombok `@Data`)
- Deleting a container with alerts, or a user with login history, failed on foreign-key constraints
- Alerts were never generated (the alert check was never scheduled)
- Dashboard charts showed hard-coded numbers, and its map/stats called a JWT-only API from a browser session, so markers never loaded
- User "History" page template was missing
- Mobile app pointed to a non-existent API (wrong port and paths), with no regions or statistics endpoints on the backend
</details>

## 🚀 Run it

### Backend + dashboard (demo mode, no hardware needed)
Requirements: Java 17+, Maven.
```bash
cd backend
mvn spring-boot:run
```
Open http://localhost:8080 and sign in as `admin` / `admin123` (demo only). Bin **BIN-0001** fills up live from the simulated sensor and triggers an alert above 80 %.

### Mobile app
Requirements: Node 20+.
```bash
cd mobile
npm install
npx expo start                     # demo data, works offline

# connected to the backend (use your PC's IP on a phone):
EXPO_PUBLIC_DEMO_MODE=false EXPO_PUBLIC_API_URL=http://192.168.x.x:8080/api npx expo start
```
Sign in with the same account (`admin@smartwaste.ma` / `admin123`).

### Firmware
Arduino IDE libraries: **LoRa** (Sandeep Mistry) and **TinyGPSPlus** for the sensor node; **RadioLib** and **PubSubClient** for the Heltec V3 gateway.
Copy `firmware/gateway/secrets.example.h` to `secrets.h` and fill in your Wi-Fi and AWS IoT credentials.

### Production (AWS)
| Variable | Purpose |
|---|---|
| `SPRING_PROFILES_ACTIVE=prod` | Use PostgreSQL instead of the demo database |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | PostgreSQL / RDS connection |
| `JWT_SECRET` | 32+ character signing key |
| `ADMIN_PASSWORD`, `MANAGER_PASSWORD` | Initial accounts |
| `IOT_API_KEY` | Key required by `POST /api/iot/ingest` |

## 📁 Repository structure
```
firmware/
  sensor-node/   Arduino sketch: ultrasonic + GPS → LoRa
  gateway/       Heltec V3 sketch: LoRa → MQTT/TLS → AWS IoT
backend/         Spring Boot 3 (Java 17): dashboard, REST API, IoT sync, alerts
mobile/          Expo / React Native app
docs/            Architecture diagram and screenshots
```

## 👥 Team
Built by **Monssif El Haouari**, **Soufiane** and **Abdessamad** at EST Fès.
