# Service Centralisé CommonDataService

Ce service centralise la récupération des données communes utilisées dans toute l'application PULS (classes, niveaux, branches, matières, périodes, élèves, fonctions, années scolaires).

## 🎯 Objectifs

- **Éliminer la duplication** de code pour la récupération des données communes
- **Centraliser la gestion du cache** pour optimiser les performances
- **Standardiser le format** des données retournées
- **Faciliter la maintenance** et les mises à jour

## 📋 Hooks Disponibles

### 1. `useClassesData(ecoleId, refreshTrigger)`
Récupère la liste des classes pour une école.

```javascript
const { classes, loading, error, refetch } = useClassesData(38);
```

**Retourne:**
- `classes`: Array des classes formatées
- `loading`: Boolean indiquant le chargement
- `error`: Object d'erreur si applicable
- `refetch`: Fonction pour forcer le rafraîchissement

### 2. `useNiveauxData(ecoleId, refreshTrigger)`
Récupère la liste des niveaux d'enseignement.

```javascript
const { niveaux, loading, error, refetch } = useNiveauxData(38);
```

### 3. `useBranchesData(ecoleId, refreshTrigger)`
Récupère la liste des branches par niveau d'enseignement.

```javascript
const { branches, loading, error, refetch } = useBranchesData(38);
```

### 4. `useMatieresData(classeId, ecoleId, refreshTrigger)`
Récupère la liste des matières pour une classe spécifique.

```javascript
const { matieres, loading, error, refetch, clearMatieres } = useMatieresData(classeId, 38);
```

**Fonctions spéciales:**
- `clearMatieres()`: Vide la liste des matières

### 5. `usePeriodesData(periodicitieId, refreshTrigger)`
Récupère la liste des périodes pour une périodicité.

```javascript
const { periodes, loading, error, refetch } = usePeriodesData(2);
```

### 6. `useElevesData(classeId, anneeId, refreshTrigger)`
Récupère la liste des élèves pour une classe et une année.

```javascript
const { eleves, loading, error, refetch, clearEleves } = useElevesData(classeId, 226);
```

**Fonctions spéciales:**
- `clearEleves()`: Vide la liste des élèves

### 7. `useFonctionsData(ecoleId, refreshTrigger)`
Récupère la liste des fonctions du personnel.

```javascript
const { fonctions, loading, error, refetch } = useFonctionsData(38);
```

### 8. `useAnneesData(refreshTrigger)`
Récupère la liste des années scolaires.

```javascript
const { annees, loading, error, refetch } = useAnneesData();
```

### 9. `useBaseData(ecoleId)`
Récupère les données de base (classes, niveaux, branches) en une seule fois.

```javascript
const { classes, niveaux, branches, loading, error, refetch } = useBaseData(38);
```

## 🔧 Utilisation Pratique

### Exemple 1: Liste déroulante simple

```javascript
import { useClassesData } from '../utils/CommonDataService';

const MonComposant = () => {
    const { classes, loading, error } = useClassesData();
    
    if (loading) return <Loader content="Chargement..." />;
    if (error) return <Message type="error" description={error.message} />;
    
    return (
        <SelectPicker
            data={classes}
            placeholder="Sélectionner une classe"
            onChange={(value) => console.log('Classe sélectionnée:', value)}
        />
    );
};
```

### Exemple 2: Données dépendantes (Matières par classe)

```javascript
import { useClassesData, useMatieresData } from '../utils/CommonDataService';

const MonComposant = () => {
    const [selectedClasse, setSelectedClasse] = useState(null);
    const { classes } = useClassesData();
    const { matieres, loading, clearMatieres } = useMatieresData(selectedClasse);
    
    const handleClasseChange = (classeId) => {
        setSelectedClasse(classeId);
        if (!classeId) clearMatieres();
    };
    
    return (
        <div>
            <SelectPicker
                data={classes}
                placeholder="Sélectionner une classe"
                onChange={handleClasseChange}
            />
            <SelectPicker
                data={matieres}
                placeholder="Sélectionner une matière"
                disabled={!selectedClasse}
            />
        </div>
    );
};
```

### Exemple 3: Données de base complètes

```javascript
import { useBaseData } from '../utils/CommonDataService';

const MonComposant = () => {
    const { classes, niveaux, branches, loading, error, refetch } = useBaseData();
    
    if (loading) return <Loader content="Chargement des données..." />;
    if (error) return <Message type="error" description={error.message} />;
    
    return (
        <div>
            <h3>Données disponibles:</h3>
            <p>Classes: {classes.length}</p>
            <p>Niveaux: {niveaux.length}</p>
            <p>Branches: {branches.length}</p>
            <Button onClick={refetch}>Actualiser</Button>
        </div>
    );
};
```

## 📊 Format des Données

Toutes les données sont formatées de manière cohérente avec les propriétés suivantes:

```javascript
{
    value: number,        // ID de l'élément (pour SelectPicker)
    label: string,        // Libellé affiché (pour SelectPicker)
    id: number,          // ID de l'élément
    // ... autres propriétés spécifiques
    raw_data: object     // Données brutes de l'API
}
```

### Exemple de format pour les classes:

```javascript
{
    value: 1,
    label: "6ème A",
    id: 1,
    niveau: "6ème",
    serie: "Générale",
    raw_data: { /* données brutes de l'API */ }
}
```

### Exemple de format pour les élèves:

```javascript
{
    value: 123,
    label: "Dupont Jean",
    id: 123,
    matricule: "2024-001",
    nom: "Dupont",
    prenom: "Jean",
    nomComplet: "Jean Dupont",
    sexe: "M",
    classe: {
        id: 1,
        libelle: "6ème A",
        niveau: "6ème",
        serie: "Générale"
    },
    inscription: {
        id: 456,
        statut: "ACTIF",
        redoublant: "NON"
    },
    raw_data: { /* données brutes de l'API */ }
}
```

## 🚀 Migration depuis l'ancien code

### Avant (code dupliqué):

```javascript
// Dans chaque composant
const [classes, setClasses] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
    const fetchClasses = async () => {
        try {
            const response = await axios.get(`${getFullUrl()}/api/classes/list-by-ecole-sorted?ecole=38`);
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

### Après (code centralisé):

```javascript
// Import du hook centralisé
import { useClassesData } from '../utils/CommonDataService';

// Utilisation simple
const { classes, loading, error, refetch } = useClassesData(38);
```

## 🔄 Gestion du Cache

Le service utilise un système de cache intelligent:

- **Cache automatique**: Les données sont mises en cache après la première récupération
- **Clés de cache uniques**: Chaque type de données a sa propre clé de cache
- **Forçage du rafraîchissement**: Utilisez `refetch()` pour ignorer le cache
- **Nettoyage automatique**: Le cache se vide automatiquement selon la configuration

## ⚙️ Configuration

### Valeurs par défaut:

```javascript
const DEFAULT_ECOLE_ID = 38;
const DEFAULT_ANNEE_ID = 226;
const DEFAULT_PERIODICITE_ID = 2;
```

### Paramètres dynamiques:

Le service utilise automatiquement les paramètres du contexte utilisateur via `usePulsParams()` si aucun paramètre n'est fourni.

## 🛠️ Fonctions Utilitaires

### `clearCommonDataCache()`
Vide le cache de toutes les données communes.

```javascript
import { clearCommonDataCache } from '../utils/CommonDataService';

// Dans votre composant
const handleClearCache = () => {
    clearCommonDataCache();
};
```

## 📝 Notes Importantes

1. **Compatibilité**: Le service est compatible avec les composants existants
2. **Performance**: Le cache améliore significativement les performances
3. **Maintenance**: Les modifications d'API se font en un seul endroit
4. **Extensibilité**: Facile d'ajouter de nouveaux types de données

## 🔍 Dépannage

### Problème: Les données ne se chargent pas
- Vérifiez que l'ID d'école est correct
- Vérifiez la connexion réseau
- Consultez la console pour les erreurs

### Problème: Le cache ne fonctionne pas
- Vérifiez que `cacheUtils.js` est correctement importé
- Vérifiez les clés de cache dans le localStorage

### Problème: Les données sont obsolètes
- Utilisez `refetch()` pour forcer le rafraîchissement
- Videz le cache avec `clearCommonDataCache()`

## 📚 Exemples Complets

Consultez le fichier `CommonDataExample.jsx` pour des exemples complets d'utilisation de tous les hooks. 