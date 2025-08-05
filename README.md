# 🌤️ Application Météo de Jean-Paul

Une application météorologique moderne développée avec Next.js, intégrant un système de paiement premium, une gestion des favoris et une authentification complète.

## 📋 Table des matières

- [Aperçu](#aperçu)
- [Technologies utilisées](#technologies-utilisées)
- [Fonctionnalités](#fonctionnalités)
- [Architecture](#architecture)
- [Installation](#installation)
- [Configuration](#configuration)
- [Utilisation](#utilisation)
- [API](#api)
- [Base de données](#base-de-données)
- [Paiements](#paiements)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)

## 🌟 Aperçu

L'application météo de Jean-Paul est une solution complète pour consulter les prévisions météorologiques avec des fonctionnalités premium. Elle propose une interface intuitive, un système de favoris, et une version premium avec fonctionnalités étendues.

### Caractéristiques principales :

- 🔍 Recherche de villes et prévisions météo
- ⭐ Système de favoris (3 villes gratuites, illimité en premium)
- 💳 Paiements sécurisés via Stripe
- 👤 Authentification complète (Supabase + NextAuth)
- 📱 Interface responsive (mobile-first)
- 🎨 Design moderne avec glassmorphism

## 🛠️ Technologies utilisées

### Frontend

- **Next.js 14.0.0** - Framework React avec rendu côté serveur
- **React 18** - Bibliothèque d'interface utilisateur
- **Tailwind CSS** - Framework CSS utilitaire
- **Zod** - Validation de schémas TypeScript

### Backend & API

- **Next.js API Routes** - API REST intégrée
- **Supabase** - Base de données PostgreSQL et authentification
- **NextAuth.js** - Authentification OAuth (Google)
- **Stripe** - Traitement des paiements

### Base de données

- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** - Sécurité au niveau des lignes
- **Triggers automatiques** - Gestion des utilisateurs

### Déploiement & DevOps

- **Vercel** - Plateforme de déploiement
- **Node.js** - Environnement d'exécution
- **npm/yarn/pnpm** - Gestionnaires de paquets

## ✨ Fonctionnalités

### 🆓 Version gratuite

- Consultation des prévisions météo actuelles
- Recherche de villes par nom
- Gestion de 3 villes favorites maximum
- Interface responsive mobile et desktop
- Authentification sécurisée

### 💎 Version Premium (9,99€)

- Favoris illimités
- Prévisions étendues
- Alertes météo personnalisées
- Interface premium sans publicités
- Support prioritaire

### 🔐 Système d'authentification

- Inscription/connexion par email
- OAuth Google via NextAuth
- Gestion de profil utilisateur
- Changement de mot de passe sécurisé
- Suppression de compte

## 🏗️ Architecture

L'application suit une architecture moderne séparant clairement les responsabilités :

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   (Next.js)     │◄──►│   (Next.js)     │◄──►│   (Supabase)    │
│                 │    │                 │    │                 │
│ • Pages         │    │ • Authentication│    │ • Users         │
│ • Components    │    │ • Favoris       │    │ • Favoris       │
│ • Contexts      │    │ • Payments      │    │ • Sessions      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │              ┌─────────────────┐              │
         └──────────────►│   Stripe API    │◄─────────────┘
                        │   (Paiements)   │
                        └─────────────────┘
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm, yarn, pnpm ou bun
- Compte Supabase
- Compte Stripe
- Compte Google OAuth (optionnel)

### Étapes d'installation

1. **Cloner le projet**

```bash
git clone [URL_DU_REPO]
cd aplicationmeteo
```

2. **Installer les dépendances**

3. **Installer les dépendances**

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

3. **Configurer les variables d'environnement**
   Créer un fichier `.env.local` :

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Google OAuth (optionnel)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Stripe
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

4. **Configurer la base de données**
   Exécuter le script SQL `database-schema-premium.sql` dans Supabase :

```sql
-- Ce script crée les tables, triggers et politiques RLS
-- Voir le fichier database-schema-premium.sql pour le détail
```

5. **Lancer le serveur de développement**

```bash
npm run dev
# ou
yarn dev
# ou
pnpm dev
```

6. **Accéder à l'application**
   Ouvrir [http://localhost:3000](http://localhost:3000) dans le navigateur.

## ⚙️ Configuration

### Supabase

1. Créer un nouveau projet sur [supabase.com](https://supabase.com)
2. Exécuter le schéma de base de données fourni
3. Configurer les politiques RLS pour la sécurité
4. Récupérer les clés API depuis les paramètres

### Stripe

1. Créer un compte sur [stripe.com](https://stripe.com)
2. Configurer un produit "Premium" à 9,99€
3. Configurer les webhooks pour la confirmation de paiement
4. Récupérer les clés API (publique et secrète)

### NextAuth (optionnel)

1. Créer un projet Google OAuth dans Google Cloud Console
2. Configurer les URLs de redirection autorisées
3. Récupérer le client ID et secret

## 🎯 Utilisation

### Interface utilisateur

#### Page d'accueil (`/`)

- **Recherche météo** : Saisir le nom d'une ville
- **Affichage des favoris** : Accès rapide aux villes sauvegardées
- **Statut premium** : Visualisation de l'abonnement actuel
- **Achat premium** : Bouton d'upgrade vers la version payante

#### Authentification (`/auth/`)

- **Inscription** (`/auth/signup`) : Création de compte
- **Connexion** (`/auth/signin`) : Authentification
- **OAuth Google** : Connexion rapide (si configuré)

#### Profil utilisateur (`/profile/`)

- **Informations personnelles** : Modification du profil
- **Changement de mot de passe** : Sécurité du compte
- **Gestion du compte** : Suppression définitive

#### Confirmation de paiement (`/success`)

- **Vérification automatique** : Validation du paiement Stripe
- **Activation premium** : Mise à jour du statut utilisateur
- **Feedback visuel** : Confirmation ou erreur de paiement

### Fonctionnalités détaillées

#### Système de favoris

```javascript
// Ajouter une ville aux favoris
const ajouterFavori = async (ville) => {
  // Vérification de la limite (3 gratuit, illimité premium)
  // Sauvegarde en base de données
  // Mise à jour de l'interface
};

// Supprimer un favori
const supprimerFavori = async (id) => {
  // Suppression sécurisée avec vérification utilisateur
};
```

#### Gestion des paiements

```javascript
// Processus d'achat premium
const acheterPremium = async () => {
  // 1. Vérification de l'authentification
  // 2. Création de session Stripe
  // 3. Redirection vers le paiement
  // 4. Retour et vérification
  // 5. Activation du premium
};
```

## 🔌 API

### Endpoints disponibles

#### Authentification

- `POST /api/auth/[...nextauth]` - Gestion NextAuth
- `POST /api/users/create` - Création d'utilisateur
- `GET /api/users/premium-status` - Vérification du statut premium

#### Favoris

- `GET /api/favoris` - Liste des favoris utilisateur
- `POST /api/favoris` - Ajouter un favori
- `DELETE /api/favoris` - Supprimer un favori

#### Paiements

- `POST /api/chekout_sessions` - Créer une session de paiement
- `GET /api/checkout-sessions/[session_id]` - Vérifier un paiement

### Exemples d'utilisation

#### Récupérer les favoris

```javascript
const response = await fetch("/api/favoris", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
const favoris = await response.json();
```

#### Ajouter un favori

```javascript
const response = await fetch("/api/favoris", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    nom: "Paris",
    latitude: 48.8566,
    longitude: 2.3522,
  }),
});
```

## 🗄️ Base de données

### Schéma principal

#### Table `users`

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    password_hash VARCHAR,
    first_name VARCHAR,
    last_name VARCHAR,
    is_premium BOOLEAN DEFAULT FALSE,
    premium_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Table `favoris`

```sql
CREATE TABLE favoris (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    nom VARCHAR NOT NULL,
    latitude DECIMAL NOT NULL,
    longitude DECIMAL NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Politiques de sécurité (RLS)

#### Users

```sql
-- Les utilisateurs ne peuvent voir que leurs propres données
CREATE POLICY "Users can view own data" ON users
FOR SELECT USING (auth.uid() = id);

-- Les utilisateurs peuvent modifier leurs propres données
CREATE POLICY "Users can update own data" ON users
FOR UPDATE USING (auth.uid() = id);
```

#### Favoris

```sql
-- Les utilisateurs ne peuvent voir que leurs favoris
CREATE POLICY "Users can view own favoris" ON favoris
FOR SELECT USING (auth.uid() = user_id);

-- Les utilisateurs peuvent gérer leurs favoris
CREATE POLICY "Users can manage own favoris" ON favoris
FOR ALL USING (auth.uid() = user_id);
```

## 💳 Paiements

### Configuration Stripe

#### Produits configurés

- **Premium Monthly** : 9,99€/mois
- **Durée** : 30 jours à partir de l'achat
- **Renouvellement** : Manuel (pas d'abonnement récurrent)

#### Workflow de paiement

1. **Initialisation** : Création de session via `/api/chekout_sessions`
2. **Redirection** : Vers l'interface Stripe Checkout
3. **Paiement** : Traitement sécurisé par Stripe
4. **Retour** : Redirection vers `/success?session_id=xxx`
5. **Vérification** : Validation et activation premium
6. **Confirmation** : Affichage du résultat à l'utilisateur

#### Sécurité des paiements

- ✅ Validation côté serveur des sessions Stripe
- ✅ Vérification de l'identité utilisateur
- ✅ Activation premium uniquement après confirmation
- ✅ Gestion automatique de l'expiration
- ✅ Logs détaillés pour le debug

## 🚀 Déploiement

### Déploiement sur Vercel (recommandé)

1. **Connecter le repository**

```bash
vercel --prod
```

2. **Configurer les variables d'environnement**
   Dans le dashboard Vercel, ajouter toutes les variables d'environnement.

3. **Configurer les domaines**

- Domaine de production pour NextAuth
- URLs de redirection Stripe
- CORS Supabase

### Déploiement alternatif

#### Docker (optionnel)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

#### Variables d'environnement de production

```env
# Production URLs
NEXTAUTH_URL=https://votre-domaine.com
STRIPE_WEBHOOK_SECRET=whsec_production_key

# Base de données de production
NEXT_PUBLIC_SUPABASE_URL=https://prod.supabase.co
```

## 📁 Structure du projet

```
aplicationmeteo/
├── 📄 README.md                    # Documentation principale
├── 📄 package.json                 # Dépendances et scripts
├── 📄 next.config.js               # Configuration Next.js
├── 📄 tailwind.config.js           # Configuration Tailwind
├── 📄 database-schema-premium.sql  # Schéma de base de données
├── 📄 jsconfig.json               # Configuration JavaScript
├── 📄 postcss.config.js           # Configuration PostCSS
│
├── 📁 pages/                      # Pages Next.js (routage)
│   ├── 📄 _app.js                 # Configuration globale de l'app
│   ├── 📄 index.js                # Page d'accueil principale
│   ├── 📄 success.js              # Confirmation de paiement
│   │
│   ├── 📁 api/                    # API Routes backend
│   │   ├── 📁 auth/               # Authentification
│   │   │   └── 📄 [...nextauth].js
│   │   ├── 📁 favoris/            # Gestion des favoris
│   │   │   └── 📄 index.js
│   │   ├── 📁 users/              # Gestion des utilisateurs
│   │   │   ├── 📄 create.js
│   │   │   └── 📄 premium-status.js
│   │   └── 📁 checkout-sessions/  # Paiements Stripe
│   │       └── 📄 [session_id].js
│   │
│   ├── 📁 auth/                   # Pages d'authentification
│   │   ├── 📄 signin.js           # Connexion
│   │   └── 📄 signup.js           # Inscription
│   │
│   └── 📁 profile/                # Gestion du profil
│       └── 📄 index.js            # Page de profil utilisateur
│
├── 📁 components/                 # Composants React réutilisables
│   ├── 📄 Header.js               # En-tête avec navigation
│   ├── 📄 Footer.js               # Pied de page
│   ├── 📄 Hero.js                 # Interface météo principale
│   ├── 📄 FavorisManager.js       # Gestion des favoris
│   ├── 📄 PremiumStatus.js        # Affichage du statut premium
│   └── 📄 StripeLayout.js         # Layout pour Stripe
│
├── 📁 contexts/                   # Contextes React (état global)
│   └── 📄 AuthContext.js          # Contexte d'authentification
│
├── 📁 lib/                        # Utilitaires et services
│   ├── 📄 supabase.js             # Client Supabase (client-side)
│   ├── 📄 supabaseAdmin.js        # Client admin Supabase (server-side)
│   ├── 📄 supabaseUsers.js        # Gestion des utilisateurs
│   ├── 📄 stripe.js               # Configuration Stripe
│   ├── 📄 favorisService.js       # Service des favoris
│   ├── 📄 demoAuth.js             # Authentification demo
│   └── 📄 validations.js          # Schémas de validation Zod
│
├── 📁 styles/                     # Styles CSS globaux
│   └── 📄 globals.css             # Styles Tailwind et personnalisés
│
└── 📁 public/                     # Fichiers statiques
    ├── 📄 manifest.json           # Manifest PWA
    └── 📁 assets/img/             # Images et icônes
        ├── 📄 fond.png            # Arrière-plan principal
        ├── 📄 lundi.png           # Icônes des jours
        ├── 📄 mardi.png
        ├── 📄 mercredi.png
        ├── 📄 jeudi.png
        ├── 📄 vendredi.png
        ├── 📄 samedi.png
        └── 📄 dimanche.png
```

### Description des dossiers

#### `pages/` - Routage et pages

- **Routage automatique** : Chaque fichier devient une route
- **API Routes** : Backend intégré dans `/api/`
- **SSR/SSG** : Rendu côté serveur automatique

#### `components/` - Composants UI

- **Réutilisables** : Composants modulaires
- **Props typées** : Documentation des interfaces
- **Responsive design** : Mobile-first approach

#### `lib/` - Logique métier

- **Services** : Interaction avec les APIs externes
- **Clients** : Configuration des services (Supabase, Stripe)
- **Validations** : Schémas Zod pour la validation

#### `contexts/` - État global

- **AuthContext** : Gestion de l'authentification
- **Provider pattern** : Encapsulation de l'état

## 🔧 Scripts disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement
npm run build        # Build de production
npm run start        # Démarrer en mode production
npm run lint         # Vérification du code

# Base de données
npm run db:setup     # Initialiser le schéma Supabase
npm run db:reset     # Réinitialiser la base de données

# Tests (à implémenter)
npm run test         # Lancer les tests
npm run test:watch   # Tests en mode watch

# Scripts utilitaires (Windows)
.\restart-dev.bat     # Nettoyer les processus Node.js et redémarrer (simple)
.\restart-dev.ps1     # Nettoyer les processus Node.js et redémarrer (PowerShell)
.\setup-env.ps1       # Configurer automatiquement .env.local

# Scripts utilitaires (Linux/Mac)
./setup-env.sh       # Configurer automatiquement .env.local
```

## 🐛 Débuggage et résolution d'erreurs

### Logs détaillés

L'application utilise des logs détaillés avec des emojis pour faciliter le debug :

```javascript
console.log("🚀 Tentative d'achat premium");
console.log("📊 Loading:", loading);
console.log("👤 User:", user);
console.log("✅ Utilisateur valide:", user.email);
console.error("❌ Erreur complète:", error);
```

### 🚨 Erreurs courantes et solutions

#### 1. Erreur 404 sur `/api/checkout_sessions`

**Symptôme :**

```
❌ Erreur complète: Error: Erreur 404: Erreur de réponse
    at handlePurchase (index.js:140:15)
```

**Causes possibles :**

- Le fichier API n'existe pas : `/pages/api/checkout_sessions.js`
- Erreur dans l'URL de l'API (faute de frappe)
- Problème de routage Next.js

**Solutions :**

```bash
# Vérifier que le fichier API existe
ls pages/api/checkout_sessions.js

# Vérifier l'URL dans le code frontend
grep -r "checkout" pages/index.js

# Redémarrer le serveur de développement
npm run dev
```

#### 2. Erreur d'authentification Stripe

**Symptôme :**

```
🔐 Erreur d'authentification Stripe - Vérifier les clés API
```

**Solutions :**

```bash
# Vérifier les variables d'environnement Stripe
echo $STRIPE_SECRET_KEY
echo $STRIPE_PUBLISHABLE_KEY

# Vérifier dans le fichier .env.local
cat .env.local | grep STRIPE
```

#### 3. Port 3000 déjà utilisé

**Symptôme :**

```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solutions automatiques :**

```bash
# Option 1: Script batch simple (Windows - recommandé)
.\restart-dev.bat

# Option 2: Script PowerShell (Windows)
.\restart-dev.ps1

# Option 3: Commandes manuelles PowerShell
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
npm run dev

# Option 4: Commandes manuelles CMD
taskkill /IM node.exe /F
npm run dev

# Option 5: Tuer un processus spécifique
netstat -ano | findstr :3000
taskkill /PID [PID_NUMBER] /F
```

**Solutions alternatives :**

```bash
# Utiliser un autre port
npm run dev -- -p 3001

# Accéder à l'application sur le nouveau port
# http://localhost:3001

# Ou utiliser un port aléatoire libre
npm run dev -- -p 0
```

**Script de nettoyage automatique :**
Un script `restart-dev.ps1` est disponible pour nettoyer automatiquement les processus et redémarrer l'application.

#### 4. Erreur de base de données Supabase

**Symptôme :**

```
❌ Erreur API: Invalid API key
```

**Solutions :**

```bash
# Vérifier les clés Supabase
echo $NEXT_PUBLIC_SUPABASE_URL
echo $NEXT_PUBLIC_SUPABASE_ANON_KEY
echo $SUPABASE_SERVICE_ROLE_KEY

# Vérifier les politiques RLS dans Supabase
SELECT * FROM pg_policies WHERE tablename = 'users';
```

#### 5. Erreur NextAuth 404

**Symptôme :**

```
Failed to load resource: the server responded with a status of 404 ()
[next-auth][warn][NEXTAUTH_URL]
[next-auth][warn][NO_SECRET]
```

**Causes :**

- Variables d'environnement NextAuth manquantes
- Configuration Google OAuth incomplète
- Fichier `.env.local` absent

**Solutions :**

```bash
# Créer le fichier .env.local avec les variables NextAuth
echo "NEXTAUTH_URL=http://localhost:3000" >> .env.local
echo "NEXTAUTH_SECRET=$(openssl rand -base64 32)" >> .env.local

# Vérifier la configuration
cat .env.local | grep NEXTAUTH

# Redémarrer l'application
npm run dev
```

#### 6. Erreur Google OAuth

**Symptôme :**

```
Configuration NextAuth incomplète
```

**Solutions :**

```bash
# Ajouter les clés Google OAuth (optionnel)
echo "GOOGLE_CLIENT_ID=your_client_id" >> .env.local
echo "GOOGLE_CLIENT_SECRET=your_client_secret" >> .env.local

# Ou utiliser seulement Supabase Auth (recommandé)
# Dans ce cas, NextAuth peut être désactivé
```

### 🔍 Outils de débogage

#### Logs en temps réel

```bash
# Surveiller les logs de l'application
npm run dev

# Logs spécifiques aux paiements
grep "Stripe" .next/server/chunks/*.js
```

#### Tests d'API avec curl

```bash
# Tester l'API de création de session
curl -X POST http://localhost:3000/api/checkout_sessions \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","userEmail":"test@example.com"}'

# Tester l'API des favoris
curl -X GET http://localhost:3000/api/favoris \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Vérification de la base de données

```sql
-- Vérifier la structure des tables
\d users;
\d favoris;

-- Vérifier les données utilisateur
SELECT id, email, is_premium, premium_expires_at FROM users LIMIT 5;

-- Vérifier les favoris
SELECT id, user_id, nom FROM favoris LIMIT 10;
```

### 🔧 Scripts de diagnostic

#### Vérification complète de l'environnement

```bash
#!/bin/bash
echo "🔍 Diagnostic de l'environnement..."

# Vérifier Node.js
node --version
npm --version

# Vérifier les dépendances
npm list --depth=0

# Vérifier les variables d'environnement critiques
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
  echo "❌ NEXT_PUBLIC_SUPABASE_URL manquant"
else
  echo "✅ NEXT_PUBLIC_SUPABASE_URL configuré"
fi

if [ -z "$STRIPE_SECRET_KEY" ]; then
  echo "❌ STRIPE_SECRET_KEY manquant"
else
  echo "✅ STRIPE_SECRET_KEY configuré"
fi

# Vérifier les fichiers critiques
if [ -f "pages/api/checkout_sessions.js" ]; then
  echo "✅ API checkout_sessions existe"
else
  echo "❌ API checkout_sessions manquant"
fi
```

### 📊 Monitoring et métriques

#### Logs structurés

```javascript
// Exemple de log structuré
const logEvent = (event, data) => {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      event,
      data,
      userId: user?.id,
      sessionId: session?.id,
    })
  );
};

// Usage
logEvent("payment_attempt", { amount: 999, currency: "EUR" });
logEvent("api_error", {
  endpoint: "/api/checkout_sessions",
  error: error.message,
});
```

### 🚨 Alertes et notifications

#### Configuration d'alertes

```javascript
// Notification d'erreurs critiques
const notifyError = async (error, context) => {
  if (process.env.NODE_ENV === "production") {
    // Envoyer à un service de monitoring (Sentry, LogRocket, etc.)
    console.error("🚨 ERREUR CRITIQUE:", {
      error: error.message,
      stack: error.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }
};
```

### 📝 Checklist de débogage

Avant de signaler un bug, vérifiez :

- [ ] **Variables d'environnement** : Toutes les variables requises sont définies
- [ ] **Fichiers API** : Les endpoints existent et sont correctement nommés
- [ ] **Base de données** : Connexion fonctionnelle et schéma à jour
- [ ] **Ports** : Aucun conflit de port (3000 libre)
- [ ] **Dépendances** : `npm install` exécuté récemment
- [ ] **Cache** : Vider le cache Next.js (`rm -rf .next`)
- [ ] **Console** : Vérifier les erreurs dans la console navigateur
- [ ] **Network** : Vérifier les requêtes réseau dans DevTools

### Problèmes courants

#### Erreur d'authentification

```bash
# Vérifier les variables d'environnement
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_ROLE_KEY
```

#### Erreur de paiement Stripe

```bash
# Vérifier les webhooks
stripe listen --forward-to localhost:3000/api/webhook
```

#### Base de données

```sql
-- Vérifier les politiques RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
```

## 🤝 Contribution

### Guidelines de développement

1. **Commits conventionnels** : `feat:`, `fix:`, `docs:`
2. **Tests unitaires** : Couvrir les fonctionnalités critiques
3. **Documentation** : Commenter le code complexe
4. **Sécurité** : Valider toutes les entrées utilisateur

### Roadmap

- [ ] Tests automatisés (Jest + Testing Library)
- [ ] Notifications push pour les alertes météo
- [ ] Mode hors ligne (PWA)
- [ ] Support multilingue (i18n)
- [ ] Thèmes sombre/clair
- [ ] API météo multiple (fallback)

## 📞 Support

### Contact

- **Développeur** : Jean-Paul
- **Email** : [email@exemple.com]
- **GitHub** : [lien vers le repository]

### Documentation technique

- **Next.js** : [nextjs.org/docs](https://nextjs.org/docs)
- **Supabase** : [supabase.com/docs](https://supabase.com/docs)
- **Stripe** : [stripe.com/docs](https://stripe.com/docs)
- **Tailwind** : [tailwindcss.com/docs](https://tailwindcss.com/docs)

---

**Développé avec ❤️ par Jean-Paul - 2025**
# aplicationmeteo
