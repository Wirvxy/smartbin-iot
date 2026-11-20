# Architecture du Dashboard Web - Smart Waste

## Vue d'ensemble

Application web complète développée avec Spring Boot 3.x suivant l'architecture MVC (Model-View-Controller) avec séparation claire des responsabilités.

## Structure des Modules

### Module 1 : Authentification et Gestion des Utilisateurs

**Composants :**
- `AuthController` : Gestion de la connexion et authentification JWT
- `UserController` : CRUD des utilisateurs (réservé aux ADMIN)
- `UserService` : Logique métier pour la gestion des utilisateurs
- `JwtTokenProvider` : Génération et validation des tokens JWT
- `JwtAuthenticationFilter` : Filtre pour valider les tokens JWT
- `SecurityConfig` : Configuration Spring Security

**Fonctionnalités :**
- Authentification par formulaire avec JWT
- Gestion des rôles (ADMIN, MANAGER, EMPLOYEE)
- CRUD complet des utilisateurs
- Historique des connexions (LoginHistory)
- Audit trail des actions utilisateurs

### Module 2 : Tableau de bord principal

**Composants :**
- `DashboardController` : Contrôleur principal du dashboard
- `DashboardService` : Calcul des statistiques en temps réel
- Template `dashboard/index.html` : Vue principale avec graphiques

**Fonctionnalités :**
- Vue d'ensemble temps réel de tous les conteneurs
- Indicateurs clés (KPI) :
  - Total conteneurs
  - Conteneurs actifs
  - Taux de remplissage moyen
  - Alertes actives
- Graphiques Chart.js :
  - Tendance de remplissage (ligne)
  - Répartition par statut (donut)
- Carte interactive Leaflet avec marqueurs colorés
- Mise à jour automatique toutes les 30 secondes

### Module 3 : Gestion des conteneurs

**Composants :**
- `ContainerController` : Contrôleur MVC pour les pages web
- `ApiController` : API REST pour les opérations CRUD
- `ContainerService` : Logique métier complète
- Templates : `list.html`, `form.html`, `view.html`

**Fonctionnalités :**
- Liste complète avec pagination virtuelle
- Filtres avancés :
  - Par région
  - Par statut (ACTIVE, FULL, MAINTENANCE, INACTIVE)
  - Recherche textuelle (nom, ID, adresse, région)
- CRUD complet :
  - Création avec validation
  - Modification avec historique
  - Suppression avec confirmation
  - Vue détaillée avec historique
- Gestion des niveaux :
  - Mise à jour automatique du pourcentage
  - Calcul automatique du statut (FULL si ≥ 100%)
  - Enregistrement dans l'historique
- Collecte des conteneurs :
  - Remise à zéro du niveau
  - Mise à jour du statut
  - Enregistrement de la date de collecte

### Module 4 : Rapports et statistiques

**Composants :**
- `ReportController` : Génération de rapports
- Templates : `reports/index.html`

**Fonctionnalités :**
- Génération de rapports PDF (iText)
  - Statistiques globales
  - Informations par région
  - Données personnalisables
- Export CSV
  - Liste complète des conteneurs
  - Données formatées pour Excel
  - Téléchargement direct

### Module 5 : Alertes et notifications

**Composants :**
- `AlertController` : Gestion des alertes
- `AlertService` : Détection et création d'alertes
- `NotificationService` : Gestion des notifications
- `WebSocketController` : Diffusion en temps réel
- `WebSocketConfig` : Configuration WebSocket

**Fonctionnalités :**
- Système d'alertes automatiques :
  - Détection lorsque seuil atteint
  - Création automatique d'alertes
  - Types : FILL_THRESHOLD, MAINTENANCE_NEEDED, COLLECTION_DUE, CRITICAL_FULL
- Notifications WebSocket :
  - Notifications en temps réel
  - Diffusion globale ou par utilisateur
  - Centre de notifications avec historique
- Résolution des alertes :
  - Marquage comme résolue
  - Enregistrement de la date de résolution

## Architecture Technique

### Couches de l'application

```
┌─────────────────────────────────────┐
│         Controllers (MVC/REST)      │
├─────────────────────────────────────┤
│         Services (Business Logic)   │
├─────────────────────────────────────┤
│         Repositories (Data Access)  │
├─────────────────────────────────────┤
│         Entities (JPA Models)      │
└─────────────────────────────────────┘
```

### Flux de données

1. **Requête HTTP** → Controller
2. **Controller** → Service (logique métier)
3. **Service** → Repository (accès données)
4. **Repository** → Base de données
5. **Réponse** → Template Thymeleaf ou JSON

### Sécurité

- **Authentification** : Formulaire + JWT
- **Autorisation** : Basée sur les rôles (Spring Security)
- **Protection** : CSRF désactivé pour API stateless
- **Audit** : Historique des connexions et actions

### Base de données

**Entités principales :**
- `User` : Utilisateurs et authentification
- `Container` : Conteneurs de déchets
- `ContainerHistory` : Historique des modifications
- `Alert` : Alertes actives
- `Notification` : Notifications utilisateurs
- `LoginHistory` : Historique des connexions

**Relations :**
- Container 1→N ContainerHistory
- Container 1→N Alert
- User 1→N LoginHistory
- User 1→N Notification

## Technologies Utilisées

### Backend
- Spring Boot 3.2.0
- Spring Security 6.x
- Spring Data JPA
- Spring WebSocket
- Thymeleaf 3.x
- JWT (jjwt 0.12.3)
- iText PDF 5.5.13.3
- Apache POI 5.2.5

### Frontend
- Bootstrap 5.3.0
- Chart.js 4.4.0
- Leaflet 1.9.4
- jQuery 3.7.0
- SockJS + STOMP.js

### Base de données
- H2 (développement)
- PostgreSQL (production, configuré)

## Points d'extension

1. **API REST** : Endpoints RESTful pour intégration mobile
2. **WebSocket** : Notifications temps réel extensibles
3. **Rapports** : Système de templates pour rapports personnalisés
4. **Alertes** : Règles configurables pour différents types d'alertes
5. **Export** : Support Excel (POI déjà intégré)

## Configuration

### Variables d'environnement
- `JWT_SECRET` : Clé secrète pour JWT (par défaut dans application.yml)
- `SPRING_DATASOURCE_URL` : URL de la base de données
- `SPRING_DATASOURCE_USERNAME` : Nom d'utilisateur DB
- `SPRING_DATASOURCE_PASSWORD` : Mot de passe DB

### Fichiers de configuration
- `application.yml` : Configuration principale
- `SecurityConfig.java` : Configuration sécurité
- `WebSocketConfig.java` : Configuration WebSocket
