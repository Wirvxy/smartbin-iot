# Smart Waste Dashboard - Spring Boot Application

Application web complète pour la gestion intelligente des conteneurs de déchets, développée avec Spring Boot 3.x.

## 🚀 Fonctionnalités

### Module 1 : Authentification et Gestion des Utilisateurs
- ✅ Page de connexion sécurisée avec JWT
- ✅ Gestion des rôles (administrateur, gestionnaire, employé)
- ✅ CRUD complet des utilisateurs
- ✅ Historique des connexions et audit trail

### Module 2 : Tableau de bord principal
- ✅ Vue d'ensemble temps réel de tous les conteneurs
- ✅ Indicateurs clés : taux de remplissage moyen, alertes actives
- ✅ Graphiques de tendances (Chart.js)
- ✅ Carte interactive avec marqueurs colorés selon le niveau

### Module 3 : Gestion des conteneurs
- ✅ Liste complète avec filtres et recherche
- ✅ Formulaires d'ajout/modification de poubelles
- ✅ Attribution aux régions et configuration des seuils
- ✅ Historique des modifications pour chaque conteneur

### Module 4 : Rapports et statistiques
- ✅ Génération de rapports PDF personnalisables
- ✅ Statistiques par région, par période
- ✅ Export des données en CSV

### Module 5 : Alertes et notifications
- ✅ Système d'alertes configurables (seuils personnalisés)
- ✅ Notifications en temps réel (WebSocket)
- ✅ Centre de notifications avec historique

## 🛠️ Stack Technologique

### Backend
- **Spring Boot 3.2.0** - Framework Java principal
- **Spring Security** - Authentification et autorisation
- **Spring Data JPA** - Accès aux données
- **Thymeleaf** - Moteur de templates server-side
- **WebSocket** - Notifications en temps réel
- **JWT** - Tokens d'authentification

### Frontend
- **HTML5/CSS3** - Structure et style des pages
- **Bootstrap 5** - Framework CSS responsive
- **JavaScript/jQuery** - Interactions côté client
- **Chart.js** - Visualisation des données (graphiques)
- **Leaflet** - Cartes interactives
- **SockJS/STOMP** - WebSocket client

### Base de données
- **H2 Database** (développement) - Base de données en mémoire
- **PostgreSQL** (production) - Support configuré

## 📦 Installation et Démarrage

### Prérequis
- Java 17 ou supérieur
- Maven 3.6+

### Étapes

1. **Cloner le projet**
```bash
git clone <repository-url>
cd PFE-web
```

2. **Compiler le projet**
```bash
mvn clean install
```

3. **Lancer l'application**
```bash
mvn spring-boot:run
```

4. **Accéder à l'application**
- URL: http://localhost:8080
- Console H2: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:smartwaste`
  - Username: `sa`
  - Password: (vide)

### Comptes par défaut

L'application crée automatiquement deux comptes utilisateurs :

1. **Administrateur**
   - Username: `admin`
   - Password: `admin123`
   - Rôle: ADMIN

2. **Gestionnaire**
   - Username: `manager`
   - Password: `manager123`
   - Rôle: MANAGER

## 📁 Structure du Projet

```
src/
├── main/
│   ├── java/com/smartwaste/
│   │   ├── config/          # Configurations (Security, WebSocket, etc.)
│   │   ├── controller/      # Contrôleurs MVC et REST
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── model/           # Entités JPA
│   │   ├── repository/      # Repositories Spring Data
│   │   ├── security/        # Configuration sécurité JWT
│   │   └── service/         # Couche service métier
│   └── resources/
│       ├── templates/       # Templates Thymeleaf
│       └── application.yml # Configuration application
└── test/                    # Tests unitaires
```

## 🔐 Sécurité

- Authentification basée sur JWT
- Protection CSRF désactivée pour API (stateless)
- Autorisation basée sur les rôles (ADMIN, MANAGER, EMPLOYEE)
- Historique des connexions pour audit

## 📊 API REST

### Endpoints disponibles

- `GET /api/containers` - Liste tous les conteneurs
- `GET /api/containers/{id}` - Détails d'un conteneur
- `GET /api/dashboard/stats` - Statistiques du dashboard
- `POST /api/containers/{containerId}/level` - Mettre à jour le niveau

## 🌐 Pages Web

- `/login` - Page de connexion
- `/dashboard` - Tableau de bord principal
- `/containers` - Liste des conteneurs
- `/containers/create` - Créer un conteneur
- `/containers/edit/{id}` - Modifier un conteneur
- `/containers/{id}` - Détails d'un conteneur
- `/admin/users` - Gestion des utilisateurs (ADMIN uniquement)
- `/reports` - Rapports et exports
- `/alerts` - Alertes actives

## 🔔 WebSocket

L'application utilise WebSocket pour les notifications en temps réel :
- Endpoint: `/ws`
- Topic: `/topic/notifications`
- Queue: `/queue/notifications/{userId}`

## 📝 Notes

- La base de données H2 est en mémoire et sera réinitialisée à chaque redémarrage
- Pour la production, configurez PostgreSQL dans `application.yml`
- Les données de démonstration sont créées automatiquement au démarrage

## 📄 Licence

Ce projet fait partie d'un projet de fin d'études (PFE).
