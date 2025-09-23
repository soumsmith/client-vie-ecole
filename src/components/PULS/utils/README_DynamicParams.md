# Système de Paramètres Dynamiques

## Vue d'ensemble

Ce système permet de remplacer les paramètres codés en dur dans les services par des paramètres dynamiques basés sur les données de l'utilisateur connecté. Les paramètres sont automatiquement récupérés lors de la connexion et mis à jour dans le contexte global.

## Architecture

### 1. Contexte Utilisateur (`UserContext.jsx`)
- Gère les paramètres globaux de l'utilisateur
- Initialise les paramètres depuis le localStorage
- Met à jour les paramètres après connexion
- Fournit des valeurs par défaut en cas d'erreur

### 2. Hooks Dynamiques (`useDynamicParams.js`)
- `usePulsParams()` : Paramètres principaux pour les services PULS
- `useApiParams()` : Génération automatique des paramètres d'API
- `useDynamicParams()` : Hook général avec options de fallback

### 3. Services Dynamiques (`DynamicServiceExample.jsx`)
- Exemples de services utilisant les paramètres dynamiques
- Gestion de l'authentification et de l'initialisation
- Cache intelligent basé sur les paramètres utilisateur

## Paramètres Disponibles

| Paramètre | Description | Valeur par défaut |
|-----------|-------------|-------------------|
| `ecoleId` | ID de l'école de l'utilisateur | 38 |
| `academicYearId` | ID de l'année académique | 226 |
| `periodiciteId` | ID de la périodicité | 2 |
| `userId` | ID de l'utilisateur connecté | null |
| `profileId` | ID du profil utilisateur | null |
| `email` | Email de l'utilisateur | null |
| `personnelInfo` | Informations du personnel | null |
| `academicYearInfo` | Informations de l'année académique | null |

## Utilisation

### 1. Dans un Service

```javascript
import { usePulsParams } from '../../hooks/useDynamicParams';

export const useMonService = () => {
    const { ecoleId, academicYearId, isAuthenticated, isInitialized } = usePulsParams();
    
    const fetchData = useCallback(async () => {
        if (!isAuthenticated || !isInitialized) {
            console.log('⏳ En attente de l\'authentification...');
            return;
        }
        
        const response = await axios.get(`/api/data?ecole=${ecoleId}&annee=${academicYearId}`);
    }, [ecoleId, academicYearId, isAuthenticated, isInitialized]);
};
```

### 2. Dans un Composant

```javascript
import { usePulsParams } from '../../hooks/useDynamicParams';

const MonComposant = () => {
    const { ecoleId, userId, isAuthenticated } = usePulsParams();
    
    if (!isAuthenticated) {
        return <div>Veuillez vous connecter</div>;
    }
    
    return (
        <div>
            <p>École: {ecoleId}</p>
            <p>Utilisateur: {userId}</p>
        </div>
    );
};
```

### 3. Génération de Paramètres d'API

```javascript
import { useApiParams } from '../../hooks/useDynamicParams';

const MonService = () => {
    const apiParams = useApiParams({
        includeEcoleId: true,
        includeAcademicYearId: true,
        includeUserId: false
    });
    
    // apiParams = { ecoleId: 38, academicYearId: 226 }
    
    const response = await axios.get('/api/data', { params: apiParams });
};
```

## Flux de Données

### 1. Connexion Utilisateur
```
Utilisateur se connecte → useLoginData → fetchAllUserData → 
UserContext.updateFromLoginData → Paramètres mis à jour
```

### 2. Initialisation
```
Page se charge → UserContext.initializeUserParams → 
Récupération depuis localStorage → Paramètres disponibles
```

### 3. Utilisation dans les Services
```
Service utilise usePulsParams → Paramètres dynamiques → 
Vérification authentification → Appel API avec bons paramètres
```

## Sécurité

### Vérifications Automatiques
- Authentification requise pour les services sensibles
- Initialisation des paramètres avant utilisation
- Fallbacks sécurisés en cas d'erreur

### Gestion des Erreurs
```javascript
if (!isAuthenticated || !isInitialized) {
    console.log('⏳ En attente de l\'authentification...');
    return;
}
```

## Performance

### Cache Intelligent
- Cache basé sur les paramètres utilisateur
- Invalidation automatique lors du changement de paramètres
- Réduction des appels API inutiles

### Optimisations
- Chargement parallèle des données utilisateur
- Mise à jour différée des paramètres
- Validation préventive des paramètres

## Migration des Services Existants

### Étape 1 : Importer les Hooks
```javascript
import { usePulsParams } from '../../hooks/useDynamicParams';
```

### Étape 2 : Remplacer les Constantes
```javascript
// ❌ AVANT
const DEFAULT_ECOLE_ID = 38;

// ✅ APRÈS
const { ecoleId } = usePulsParams();
```

### Étape 3 : Ajouter la Vérification d'Authentification
```javascript
const { ecoleId, isAuthenticated, isInitialized } = usePulsParams();

const fetchData = useCallback(async () => {
    if (!isAuthenticated || !isInitialized) return;
    // Votre logique ici
}, [ecoleId, isAuthenticated, isInitialized]);
```

### Étape 4 : Mettre à Jour les Dépendances
```javascript
useEffect(() => {
    if (isAuthenticated && isInitialized && ecoleId) {
        fetchData();
    }
}, [ecoleId, isAuthenticated, isInitialized]);
```

## Tests et Débogage

### Composant de Test
Utilisez `TestDynamicParams.jsx` pour vérifier :
- État d'authentification
- Paramètres disponibles
- Validation des paramètres
- Fonctionnement des services

### Console de Débogage
```javascript
// Activer les logs de débogage
console.log('🔄 Récupération des données pour l\'école', ecoleId);
console.log('✅ Paramètres mis à jour:', params);
console.log('❌ Erreur de paramètres:', error);
```

## Avantages

### 1. Sécurité
- Paramètres basés sur l'authentification
- Validation automatique des permissions
- Isolation des données par utilisateur

### 2. Flexibilité
- Adaptation automatique aux données utilisateur
- Support multi-écoles
- Gestion des années académiques

### 3. Maintenabilité
- Code plus propre et réutilisable
- Réduction des valeurs codées en dur
- Centralisation de la logique

### 4. Performance
- Cache intelligent
- Réduction des appels API
- Chargement optimisé

### 5. Expérience Utilisateur
- Données personnalisées
- Chargement plus rapide
- Interface cohérente

## Support et Maintenance

### Fichiers Importants
- `UserContext.jsx` : Contexte global
- `useDynamicParams.js` : Hooks utilitaires
- `DynamicServiceExample.jsx` : Exemples d'utilisation
- `MigrationGuide.md` : Guide de migration
- `TestDynamicParams.jsx` : Composant de test

### Logs et Monitoring
- Console logs pour le débogage
- Validation automatique des paramètres
- Gestion des erreurs centralisée

### Mise à Jour
- Ajout de nouveaux paramètres dans `UserContext.jsx`
- Extension des hooks dans `useDynamicParams.js`
- Documentation des changements

## Exemples Complets

### Service d'Évaluations
```javascript
export const useEvaluationsData = () => {
    const { 
        ecoleId, 
        academicYearId, 
        periodiciteId, 
        isAuthenticated, 
        isInitialized 
    } = usePulsParams();
    
    const fetchEvaluations = useCallback(async () => {
        if (!isAuthenticated || !isInitialized) return;
        
        const response = await axios.get('/api/evaluations', {
            params: { ecoleId, academicYearId, periodiciteId }
        });
    }, [ecoleId, academicYearId, periodiciteId, isAuthenticated, isInitialized]);
};
```

### Service de Classes
```javascript
export const useClassesData = () => {
    const { ecoleId, isAuthenticated, isInitialized } = usePulsParams();
    
    const fetchClasses = useCallback(async () => {
        if (!isAuthenticated || !isInitialized) return;
        
        const response = await axios.get(`/api/classes?ecole=${ecoleId}`);
    }, [ecoleId, isAuthenticated, isInitialized]);
};
```

Ce système offre une solution complète et robuste pour gérer les paramètres dynamiques dans votre application React, en remplaçant efficacement les valeurs codées en dur par des paramètres basés sur l'utilisateur connecté. 