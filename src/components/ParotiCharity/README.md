# Paroti Charity - Composant React

## 📋 Description

Ce composant React convertit le template HTML Paroti Charity en une structure modulaire et réutilisable avec des tableaux d'objets pour gérer le contenu dynamiquement.

## 🚀 Utilisation

### Import simple
```jsx
import ParotiCharity from './components/ParotiCharity';

function App() {
  return <ParotiCharity />;
}
```

### Import de composants individuels
```jsx
import { Header, Slider, About, Donation } from './components/ParotiCharity';

function CustomPage() {
  return (
    <div>
      <Header />
      <Slider />
      <About />
      <Donation />
    </div>
  );
}
```

## 📁 Structure des fichiers

```
src/components/ParotiCharity/
├── ParotiCharity.jsx          # Composant principal
├── index.js                   # Exports
├── README.md                  # Documentation
├── data/
│   └── siteData.js           # Données structurées
└── components/
    ├── Header.jsx            # En-tête avec navigation
    ├── Slider.jsx            # Carrousel principal
    ├── About.jsx             # Section À propos
    ├── Donation.jsx          # Section donations
    ├── CTA.jsx               # Call to action
    ├── Causes.jsx            # Causes populaires
    └── MobileNav.jsx         # Navigation mobile
```

## 🎯 Fonctionnalités

### ✅ Données structurées
- **Navigation** : Menu principal et mobile avec sous-menus
- **Slider** : Carrousel avec slides configurables
- **About** : Section à propos avec informations et statistiques
- **Donations** : Cartes de donation avec icônes personnalisables
- **CTA** : Section d'appel à l'action
- **Causes** : Causes populaires avec barres de progression

### ✅ Composants modulaires
- Chaque section est un composant indépendant
- Réutilisable et personnalisable
- Props configurables via les données

### ✅ Responsive
- Navigation mobile intégrée
- Carrousels adaptatifs
- Structure Bootstrap conservée

## 🔧 Personnalisation

### Modifier les données
Éditez le fichier `data/siteData.js` pour personnaliser :

```javascript
// Exemple : Ajouter un nouveau slide
export const sliderData = [
  // ... slides existants
  {
    id: 4,
    backgroundImage: "./assets/images/backgrounds/slider-1-4.jpg",
    title: "Nouveau <span>slide</span>",
    text: "Description du nouveau slide",
    button: {
      text: "En savoir plus",
      link: "about.html"
    }
  }
];
```

### Ajouter de nouvelles sections
1. Créer un nouveau composant dans `components/`
2. Ajouter les données dans `siteData.js`
3. Importer et utiliser dans `ParotiCharity.jsx`

## 📦 Dépendances

- React 16.8+
- CSS/SCSS du template original
- FontAwesome pour les icônes
- Bootstrap pour la grille

## 🎨 Styles

Les styles CSS originaux du template doivent être inclus :
- `bootstrap.min.css`
- `style.css` du template
- Fichiers de polices et icônes

## 🔄 Migration depuis HTML

Le composant conserve la structure HTML originale tout en ajoutant :
- Gestion d'état React
- Props dynamiques
- Données structurées
- Composants réutilisables

## 📝 Notes

- Les animations CSS sont conservées
- Les classes Owl Carousel sont maintenues pour la compatibilité
- Les attributs `data-*` sont préservés pour les plugins JS
- Structure sémantique HTML respectée
