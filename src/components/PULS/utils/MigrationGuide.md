# Guide de Migration vers CommonDataService

Ce guide vous aide à migrer progressivement votre code existant vers le service centralisé `CommonDataService`.

## 🎯 Objectif

Remplacer les appels API dupliqués par des hooks centralisés tout en gardant le code fonctionnel.

## 📋 Plan de Migration

### Étape 1: Identifier les fichiers à migrer

Recherchez dans votre code les patterns suivants:

```bash
# Rechercher les appels API dupliqués
grep -r "axios.get.*classes" src/components/PULS/
grep -r "axios.get.*niveau" src/components/PULS/
grep -r "axios.get.*branche" src/components/PULS/
grep -r "axios.get.*matiere" src/components/PULS/
grep -r "axios.get.*periode" src/components/PULS/
grep -r "axios.get.*eleve" src/components/PULS/
grep -r "axios.get.*fonction" src/components/PULS/
```

### Étape 2: Migration par type de données

#### 2.1 Migration des Classes

**Avant:**
```javascript
// Dans chaque composant
const [classes, setClasses] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${getFullUrl()}classes/list-by-ecole-sorted?ecole=38`);
            setClasses(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchClasses();
}, []);
```

**Après:**
```javascript
// Import du service centralisé
import { useClassesData } from '../utils/CommonDataService';

// Dans votre composant
const { classes, loading, error, refetch } = useClassesData(38);
```

#### 2.2 Migration des Niveaux

**Avant:**
```javascript
const [niveaux, setNiveaux] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchNiveaux = async () => {
        try {
            const response = await axios.get(`${getFullUrl()}niveau-enseignement/get-visible-by-branche?ecole=38`);
            setNiveaux(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchNiveaux();
}, []);
```

**Après:**
```javascript
import { useNiveauxData } from '../utils/CommonDataService';

const { niveaux, loading, error, refetch } = useNiveauxData(38);
```

#### 2.3 Migration des Branches

**Avant:**
```javascript
const [branches, setBranches] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchBranches = async () => {
        try {
            const response = await axios.get(`${getFullUrl()}branche/get-by-niveau-enseignement?ecole=38`);
            setBranches(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchBranches();
}, []);
```

**Après:**
```javascript
import { useBranchesData } from '../utils/CommonDataService';

const { branches, loading, error, refetch } = useBranchesData(38);
```

#### 2.4 Migration des Matières

**Avant:**
```javascript
const [matieres, setMatieres] = useState([]);
const [loading, setLoading] = useState(false);

const fetchMatieres = useCallback(async (classeId) => {
    if (!classeId) return;
    
    try {
        setLoading(true);
        const response = await axios.get(`${getFullUrl()}imprimer-matrice-classe/matieres-ecole-web/38/${classeId}`);
        setMatieres(response.data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    if (selectedClasse) {
        fetchMatieres(selectedClasse);
    }
}, [selectedClasse, fetchMatieres]);
```

**Après:**
```javascript
import { useMatieresData } from '../utils/CommonDataService';

const { matieres, loading, error, refetch, clearMatieres } = useMatieresData(selectedClasse, 38);
```

#### 2.5 Migration des Périodes

**Avant:**
```javascript
const [periodes, setPeriodes] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchPeriodes = async () => {
        try {
            const response = await axios.get(`${getFullUrl()}periodes/list-by-periodicite?id=2`);
            setPeriodes(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchPeriodes();
}, []);
```

**Après:**
```javascript
import { usePeriodesData } from '../utils/CommonDataService';

const { periodes, loading, error, refetch } = usePeriodesData(2);
```

#### 2.6 Migration des Élèves

**Avant:**
```javascript
const [eleves, setEleves] = useState([]);
const [loading, setLoading] = useState(false);

const fetchEleves = useCallback(async (classeId, anneeId = 226) => {
    if (!classeId) return;
    
    try {
        setLoading(true);
        const response = await axios.get(`${getFullUrl()}classe-eleve/retrieve-by-classe/${classeId}/${anneeId}`);
        setEleves(response.data);
    } catch (err) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    if (selectedClasse) {
        fetchEleves(selectedClasse);
    }
}, [selectedClasse, fetchEleves]);
```

**Après:**
```javascript
import { useElevesData } from '../utils/CommonDataService';

const { eleves, loading, error, refetch, clearEleves } = useElevesData(selectedClasse, 226);
```

#### 2.7 Migration des Fonctions

**Avant:**
```javascript
const [fonctions, setFonctions] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchFonctions = async () => {
        try {
            const response = await axios.get(`${getFullUrl()}fonction/list-by-ecole?ecole=38`);
            setFonctions(response.data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };
    fetchFonctions();
}, []);
```

**Après:**
```javascript
import { useFonctionsData } from '../utils/CommonDataService';

const { fonctions, loading, error, refetch } = useFonctionsData(38);
```

### Étape 3: Migration des Services Existants

#### 3.1 Migration de BulletinService.jsx

**Avant:**
```javascript
// BulletinService.jsx
export const useClassesData = (ecoleId = DEFAULT_ECOLE_ID, refreshTrigger = 0) => {
    // ... code dupliqué
};

export const usePeriodesData = (periodicitieId = DEFAULT_PERIODICITE_ID, refreshTrigger = 0) => {
    // ... code dupliqué
};

export const useElevesClasse = () => {
    // ... code dupliqué
};
```

**Après:**
```javascript
// BulletinService.jsx
import { 
    useClassesData, 
    usePeriodesData, 
    useElevesData 
} from '../utils/CommonDataService';

// Réexporter les hooks centralisés
export { useClassesData, usePeriodesData, useElevesData };

// Garder seulement les fonctions spécifiques au bulletin
export const useBulletinData = () => {
    // ... code spécifique au bulletin
};

export const getNoteColor = (note, noteSur = 20) => {
    // ... code spécifique au bulletin
};
```

#### 3.2 Migration de EvaluationService.jsx

**Avant:**
```javascript
// EvaluationService.jsx
export const useClassesData = (ecoleId = null, refreshTrigger = 0) => {
    // ... code dupliqué
};

export const useMatieresData = () => {
    // ... code dupliqué
};

export const usePeriodesData = (periodicitieId = DEFAULT_PERIODICITE_ID) => {
    // ... code dupliqué
};
```

**Après:**
```javascript
// EvaluationService.jsx
import { 
    useClassesData, 
    useMatieresData, 
    usePeriodesData 
} from '../utils/CommonDataService';

// Réexporter les hooks centralisés
export { useClassesData, useMatieresData, usePeriodesData };

// Garder seulement les fonctions spécifiques aux évaluations
export const useEvaluationsData = (refreshTrigger = 0) => {
    // ... code spécifique aux évaluations
};
```

### Étape 4: Mise à jour des Imports

#### 4.1 Dans les composants utilisateurs

**Avant:**
```javascript
// Dans BulletinScolaire.jsx
import { 
    useClassesData, 
    usePeriodesData, 
    useElevesClasse,
    useBulletinData
} from './BulletinService';
```

**Après:**
```javascript
// Dans BulletinScolaire.jsx
import { 
    useClassesData, 
    usePeriodesData, 
    useElevesData
} from '../utils/CommonDataService';

import { 
    useBulletinData
} from './BulletinService';
```

### Étape 5: Test et Validation

#### 5.1 Tests unitaires

```javascript
// Test d'un hook centralisé
import { renderHook } from '@testing-library/react-hooks';
import { useClassesData } from '../utils/CommonDataService';

test('useClassesData should return classes data', () => {
    const { result } = renderHook(() => useClassesData(38));
    
    expect(result.current).toHaveProperty('classes');
    expect(result.current).toHaveProperty('loading');
    expect(result.current).toHaveProperty('error');
    expect(result.current).toHaveProperty('refetch');
});
```

#### 5.2 Tests d'intégration

```javascript
// Test d'un composant utilisant le service centralisé
import { render, screen } from '@testing-library/react';
import MonComposant from './MonComposant';

test('MonComposant should display classes', () => {
    render(<MonComposant />);
    
    expect(screen.getByText('Chargement des classes...')).toBeInTheDocument();
});
```

## 🔧 Checklist de Migration

### ✅ Préparation
- [ ] Identifier tous les fichiers utilisant des appels API dupliqués
- [ ] Créer une branche de développement pour la migration
- [ ] Sauvegarder l'état actuel du code

### ✅ Migration par Type
- [ ] Migrer les appels aux classes
- [ ] Migrer les appels aux niveaux
- [ ] Migrer les appels aux branches
- [ ] Migrer les appels aux matières
- [ ] Migrer les appels aux périodes
- [ ] Migrer les appels aux élèves
- [ ] Migrer les appels aux fonctions

### ✅ Services
- [ ] Migrer BulletinService.jsx
- [ ] Migrer EvaluationService.jsx
- [ ] Migrer EnqueteRapideServiceManager.jsx
- [ ] Vérifier les autres services

### ✅ Composants
- [ ] Mettre à jour les imports dans tous les composants
- [ ] Tester chaque composant après migration
- [ ] Vérifier que les données s'affichent correctement

### ✅ Tests
- [ ] Tester les fonctionnalités principales
- [ ] Vérifier le cache fonctionne
- [ ] Tester les erreurs réseau
- [ ] Vérifier les performances

### ✅ Finalisation
- [ ] Supprimer l'ancien code dupliqué
- [ ] Mettre à jour la documentation
- [ ] Former l'équipe sur le nouveau service
- [ ] Déployer en production

## 🚨 Points d'Attention

### 1. Compatibilité des Données
Assurez-vous que le format des données retournées est compatible avec vos composants existants.

### 2. Gestion des Erreurs
Le nouveau service gère les erreurs différemment. Vérifiez que vos composants gèrent correctement les erreurs.

### 3. Performance
Le cache peut améliorer les performances, mais vérifiez qu'il n'y a pas de problèmes de mémoire.

### 4. Tests
Testez chaque composant après migration pour vous assurer qu'il fonctionne correctement.

## 📞 Support

Si vous rencontrez des problèmes lors de la migration:

1. Consultez le fichier `README_CommonDataService.md`
2. Regardez les exemples dans `CommonDataExample.jsx`
3. Vérifiez les logs de la console pour les erreurs
4. Testez avec un composant simple d'abord

## 🎉 Avantages après Migration

- **Moins de code dupliqué**: Réduction significative de la taille du code
- **Meilleures performances**: Cache intelligent et optimisations
- **Maintenance facilitée**: Un seul endroit pour modifier les appels API
- **Cohérence**: Format de données standardisé
- **Extensibilité**: Facile d'ajouter de nouveaux types de données 