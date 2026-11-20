# Guide d'Installation - Smart Waste Dashboard

## 📋 Prérequis

Pour exécuter ce projet Spring Boot, vous devez installer les éléments suivants :

### 1. Java Development Kit (JDK) 17 ou supérieur

**Pourquoi :** Le projet utilise Java 17 (spécifié dans `pom.xml`)

**Installation :**
1. Téléchargez JDK 17 depuis :
   - **Oracle JDK** : https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
   - **OpenJDK** (recommandé, gratuit) : https://adoptium.net/temurin/releases/?version=17
   - **Amazon Corretto** : https://aws.amazon.com/corretto/

2. Installez le JDK en suivant l'assistant d'installation

3. **Vérifiez l'installation :**
   ```powershell
   java -version
   ```
   Vous devriez voir quelque chose comme :
   ```
   openjdk version "17.0.x" ...
   ```

4. **Configurez JAVA_HOME (si nécessaire) :**
   - Ouvrez les Variables d'environnement Windows
   - Créez une variable `JAVA_HOME` pointant vers le dossier d'installation JDK
     (ex: `C:\Program Files\Java\jdk-17`)
   - Ajoutez `%JAVA_HOME%\bin` à votre PATH

### 2. Apache Maven 3.6+ 

**Pourquoi :** Maven est nécessaire pour compiler et gérer les dépendances du projet

**Installation :**
1. Téléchargez Maven depuis : https://maven.apache.org/download.cgi
   - Choisissez le fichier `apache-maven-3.9.x-bin.zip`

2. Extrayez l'archive dans un dossier (ex: `C:\Program Files\Apache\maven`)

3. **Configurez les variables d'environnement :**
   - Créez `MAVEN_HOME` = `C:\Program Files\Apache\maven`
   - Ajoutez `%MAVEN_HOME%\bin` à votre PATH

4. **Vérifiez l'installation :**
   ```powershell
   mvn -version
   ```
   Vous devriez voir :
   ```
   Apache Maven 3.9.x
   Maven home: C:\Program Files\Apache\maven
   Java version: 17.0.x
   ```

### 3. Git (optionnel mais recommandé)

**Pourquoi :** Pour cloner le projet depuis un dépôt Git

**Installation :**
- Téléchargez depuis : https://git-scm.com/download/win
- Installez avec les options par défaut

## 🚀 Installation Rapide avec Chocolatey (Windows)

Si vous avez **Chocolatey** installé, vous pouvez installer tout en une commande :

```powershell
# Installer Chocolatey (si pas déjà installé)
# Ouvrez PowerShell en tant qu'administrateur et exécutez :
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Installer Java 17 et Maven
choco install openjdk17 maven -y
```

## ✅ Vérification de l'Installation

Exécutez ces commandes dans PowerShell pour vérifier que tout est installé :

```powershell
# Vérifier Java
java -version

# Vérifier Maven
mvn -version

# Vérifier JAVA_HOME (optionnel)
echo $env:JAVA_HOME
```

## 📦 Installation des Dépendances du Projet

Une fois Java et Maven installés, les dépendances seront téléchargées automatiquement lors de la première compilation :

```powershell
# Naviguer vers le dossier du projet
cd C:\Users\Wirvxy\Desktop\PFE-web

# Télécharger toutes les dépendances (première fois, peut prendre quelques minutes)
mvn clean install
```

**Note :** Maven téléchargera automatiquement :
- Spring Boot 3.2.0 et toutes ses dépendances
- Spring Security, Spring Data JPA, Thymeleaf
- JWT, H2 Database, iText PDF, Apache POI
- Et toutes les autres dépendances listées dans `pom.xml`

## 🗄️ Base de Données

**Aucune installation requise !** 

Le projet utilise **H2 Database** (base de données en mémoire) qui est :
- ✅ Inclus dans les dépendances Maven
- ✅ Démarre automatiquement avec l'application
- ✅ Aucune configuration supplémentaire nécessaire

**Pour la production**, vous pouvez configurer PostgreSQL (optionnel) :
- Téléchargez PostgreSQL : https://www.postgresql.org/download/windows/
- Modifiez `application.yml` pour utiliser PostgreSQL au lieu de H2

## 🎯 Démarrage de l'Application

Une fois tout installé :

```powershell
# Option 1 : Avec Maven (recommandé)
mvn spring-boot:run

# Option 2 : Compiler puis exécuter le JAR
mvn clean package
java -jar target/dashboard-web-1.0.0.jar
```

L'application sera accessible sur : **http://localhost:8080**

## 🔑 Comptes par Défaut

L'application crée automatiquement ces comptes au premier démarrage :

- **Administrateur**
  - Username: `admin`
  - Password: `admin123`

- **Gestionnaire**
  - Username: `manager`
  - Password: `manager123`

## 🛠️ IDE Recommandé (Optionnel)

Pour développer plus facilement, installez un IDE :

- **IntelliJ IDEA Community** (gratuit) : https://www.jetbrains.com/idea/download/
- **Eclipse IDE** (gratuit) : https://www.eclipse.org/downloads/
- **VS Code** avec extensions Java : https://code.visualstudio.com/

## ❓ Dépannage

### Problème : "java n'est pas reconnu"
- Vérifiez que Java est installé : `java -version`
- Vérifiez que JAVA_HOME est configuré
- Redémarrez PowerShell après l'installation

### Problème : "mvn n'est pas reconnu"
- Vérifiez que Maven est installé : `mvn -version`
- Vérifiez que MAVEN_HOME est dans le PATH
- Redémarrez PowerShell après l'installation

### Problème : Port 8080 déjà utilisé
- Changez le port dans `application.yml` :
  ```yaml
  server:
    port: 8081  # Utilisez un autre port
  ```

### Problème : Erreur de compilation Maven
- Vérifiez votre connexion Internet (Maven doit télécharger les dépendances)
- Essayez : `mvn clean install -U` (force la mise à jour)
- Vérifiez que vous utilisez Java 17 : `java -version`

## 📝 Résumé Minimal

**Minimum requis pour démarrer :**
1. ✅ Java JDK 17
2. ✅ Apache Maven 3.6+

**Tout le reste (dépendances, base de données) est géré automatiquement par Maven !**

Une fois installé, exécutez simplement :
```powershell
mvn spring-boot:run
```
