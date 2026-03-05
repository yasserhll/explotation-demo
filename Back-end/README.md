# BenGuerir Mining - Back-end Laravel 12

Back-end API REST complet pour le système de gestion de production minière de BenGuerir.

## 🚀 Installation & Démarrage

```bash
# 1. Installer les dépendances
composer install

# 2. Copier le fichier d'environnement (déjà configuré avec SQLite)
# Le fichier .env est déjà présent

# 3. Créer la base de données et charger les données
php artisan migrate --seed

# 4. Démarrer le serveur
php artisan serve
```

Le serveur démarre sur **http://localhost:8000**

---

## 📡 Endpoints API

Base URL : `http://localhost:8000/api`

### Dashboard
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/dashboard` | KPIs, trend 15j, top destinations |
| GET | `/optimisations?month=YYYY-MM` | Suggestions d'optimisation automatiques |
| GET | `/rapports/hebdo?from=&to=` | Rapport hebdomadaire |

### Productions
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/productions` | Liste (filtres: date, type, month, from, to, tranchee) |
| POST | `/productions` | Créer une ligne de production |
| GET | `/productions/{id}` | Détails |
| PUT | `/productions/{id}` | Modifier |
| DELETE | `/productions/{id}` | Supprimer |
| GET | `/productions/daily?date=` | Rapport journalier |
| GET | `/productions/monthly?month=YYYY-MM` | Rapport mensuel |
| GET | `/productions/export?from=&to=` | Export CSV |

### Engins
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/engins` | Liste des engins (filtres: type, statut) |
| POST | `/engins` | Créer |
| PUT | `/engins/{id}` | Modifier |
| DELETE | `/engins/{id}` | Supprimer |

### Affectations
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/affectations?date=` | Liste (date=null → permanentes) |
| POST | `/affectations` | Créer |
| POST | `/affectations/bulk` | Import groupé |
| PUT | `/affectations/{id}` | Modifier |
| DELETE | `/affectations/{id}` | Supprimer |

### Arrêts & Disponibilité
| Méthode | URL | Description |
|---------|-----|-------------|
| GET | `/disponibilite?from=&to=` | Taux de disponibilité par engin |
| GET | `/arrets?from=&to=&engin=` | Liste des arrêts |
| POST | `/arrets` | Enregistrer un arrêt |
| PUT | `/arrets/{id}` | Modifier |
| DELETE | `/arrets/{id}` | Supprimer |

---

## 📊 Formule Taux de Disponibilité

```
Heures théoriques = Jours ouvrables × 20h/jour
Taux = ((Heures théoriques - Heures d'arrêt) / Heures théoriques) × 100
```

- ✅ **≥ 85%** : Bonne disponibilité (vert)
- ⚠️ **≥ 70%** : Acceptable (orange)
- ❌ **< 70%** : Critique (rouge)

---

## 🗄️ Structure Base de Données

- **productions** : Lignes de production journalières (phosphate / stérile)
- **engins** : Pelles, niveleuses et autres équipements
- **affectations** : Camions et chauffeurs
- **arrets** : Incidents et arrêts enregistrés
- **rapports_hebdo** : Synthèses hebdomadaires

---

## 🔗 Configuration Frontend

Dans le frontend React (vite.config.js), configurer le proxy :

```javascript
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

---

## 📦 Données pré-chargées

- **8 engins** (pelles 350-E71, 480-E49, 350-E64, 336-E18, CH-E48, etc.)
- **29 affectations** de camions avec chauffeurs (D183 à D255, T01, T02)
- **~100 lignes de production** (janvier-février 2026, données réelles)
