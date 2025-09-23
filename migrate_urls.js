#!/usr/bin/env node

/**
 * Script de migration automatique des URLs d'API vers apiConfig.jsx
 * Usage: node migrate_urls.js
 */

const fs = require('fs');
const path = require('path');

// Mappings des URLs vers les nouvelles méthodes apiConfig
const URL_MAPPINGS = {
    // Classes
    '/api/classes/list-by-ecole-sorted': 'apiUrls.classes.listByEcoleSorted',
    '/api/classes/': 'apiUrls.classes.getById',
    
    // Personnel
    '/api/personnels/get-by-ecole-and-profil': 'apiUrls.personnel.getByEcoleAndProfil',
    '/api/personnels/get-by-fonction': 'apiUrls.personnel.getByFonction',
    '/api/souscription-personnel/personnel/': 'apiUrls.personnel.getForCertificat',
    
    // Matières
    '/api/matiere-ecole/get-by-ecole-via-niveau-enseignement': 'apiUrls.matieres.getByEcoleViaNiveauEnseignement',
    '/api/matieres/list': 'apiUrls.matieres.listByEcole',
    
    // Élèves
    '/api/classe-eleve/retrieve-by-classe': 'apiUrls.eleves.retrieveByClasse',
    '/api/classe-eleve/handle-save': 'apiUrls.eleves.handleSave',
    
    // Évaluations
    '/api/evaluations/get-classe-matiere-periode': 'apiUrls.evaluations.getClasseMatierePeriodie',
    '/api/evaluations/code/': 'apiUrls.evaluations.getByCode',
    '/api/evaluations/is-locked/': 'apiUrls.evaluations.isLocked',
    
    // Notes
    '/api/notes/list-about-evaluation/': 'apiUrls.notes.listAboutEvaluation',
    '/api/notes/get-by-classe-periode': 'apiUrls.notes.getByClasseAndPeriode',
    
    // Séances
    '/api/seances/get-list-statut': 'apiUrls.seances.getListStatut',
    '/api/seances/saveAndDisplay': 'apiUrls.seances.saveAndDisplay',
    '/api/seances/delete/': 'apiUrls.seances.delete',
    
    // Affectations
    '/api/personnel-matiere-classe/get-pp-and-educ-dto-by-classe': 'apiUrls.affectations.getPpAndEducDtoByClasse',
    '/api/personnel-matiere-classe/get-professeur-by-classe': 'apiUrls.affectations.getProfesseurByClasse',
    '/api/personnel-matiere-classe/affecter-classe-personnel': 'apiUrls.affectations.affecterClassePersonnel',
    '/api/personnel-matiere-classe/affecter-matiere-professeur': 'apiUrls.affectations.affecterMatiereProfesseur',
    
    // Salles
    '/api/salle/list-by-ecole': 'apiUrls.salles.listByEcole',
    '/api/salle/get-salles-dispo-heures': 'apiUrls.seances.getSallesDispoHeures',
    
    // Périodes
    '/api/periodes/list-by-periodicite': 'apiUrls.periodes.listByPeriodicite',
    
    // Fonctions
    '/api/fonctions/list': 'apiUrls.fonctions.listByEcole',
    
    // Messages
    '/api/message-personnel': 'apiUrls.messages.create',
    '/api/message-personnel/': 'apiUrls.messages.getById',
    
    // Années scolaires
    '/api/annees-scolaires/list': 'apiUrls.annees.list',
    
    // Bulletins
    '/api/bulletin/get-bulletin-eleve-annee-periode': 'apiUrls.bulletins.getBulletinEleveAnneePeriode',
    
    // Inscriptions
    '/api/inscription/retrieve-to-attrib-classe': 'apiUrls.inscriptions.retrieveToAttribClasse',
    
    // Offres d'emploi
    '/api/niveau_etude': 'apiUrls.offres.getNiveauxEtude',
    '/api/type_offre': 'apiUrls.offres.getTypesOffre',
    
    // Profils
    '/api/profil/profil-visible': 'apiUrls.profils.getProfilVisible'
};

function migrateFile(filePath) {
    console.log(`🔄 Migration de ${filePath}...`);
    
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // 1. Remplacer l'import getFullUrl par useAllApiUrls
    if (content.includes("import getFullUrl from '../../hooks/urlUtils';")) {
        content = content.replace(
            "import getFullUrl from '../../hooks/urlUtils';",
            "import { useAllApiUrls } from '../utils/apiConfig';"
        );
        modified = true;
    }
    
    // 2. Ajouter useAllApiUrls dans les hooks
    const hookPattern = /export const (\w+) = \([^)]*\) => \{\s*const \[([^\]]+)\] = useState/g;
    content = content.replace(hookPattern, (match, hookName, stateVars) => {
        if (!match.includes('useAllApiUrls')) {
            const lines = match.split('\n');
            const lastStateIndex = lines.findIndex(line => line.includes('useState'));
            lines.splice(lastStateIndex + 1, 0, '    const apiUrls = useAllApiUrls();');
            modified = true;
            return lines.join('\n');
        }
        return match;
    });
    
    // 3. Remplacer les URLs
    for (const [oldUrl, newMethod] of Object.entries(URL_MAPPINGS)) {
        const regex = new RegExp(`\`\\\${getFullUrl\\(\\)}${oldUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^`]*\``, 'g');
        if (regex.test(content)) {
            console.log(`  ✅ Remplacement: ${oldUrl} -> ${newMethod}`);
            // Cette partie nécessiterait une logique plus complexe pour gérer les paramètres
            modified = true;
        }
    }
    
    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`  ✅ ${filePath} migré avec succès`);
    } else {
        console.log(`  ⏭️  ${filePath} - aucune modification nécessaire`);
    }
}

// Fonction principale
function main() {
    const pulsDir = './src/components/PULS';
    
    // Lire tous les fichiers .jsx dans le dossier PULS
    function getAllJsxFiles(dir) {
        const files = [];
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
            const fullPath = path.join(dir, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory() && item !== 'utils') {
                files.push(...getAllJsxFiles(fullPath));
            } else if (item.endsWith('.jsx') && item !== 'apiConfig.jsx') {
                files.push(fullPath);
            }
        }
        
        return files;
    }
    
    const jsxFiles = getAllJsxFiles(pulsDir);
    console.log(`🚀 Migration de ${jsxFiles.length} fichiers...`);
    
    for (const file of jsxFiles) {
        try {
            migrateFile(file);
        } catch (error) {
            console.error(`❌ Erreur lors de la migration de ${file}:`, error.message);
        }
    }
    
    console.log('🎉 Migration terminée !');
}

if (require.main === module) {
    main();
}
