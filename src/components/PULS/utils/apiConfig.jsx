/**
 * CONFIGURATION CENTRALISÉE DES APIS
 * 
 * Ce fichier centralise toutes les URLs d'API de l'application
 * pour faciliter la maintenance et la gestion des endpoints.
 * 
 * Chaque fonction retourne l'URL complète construite avec les paramètres nécessaires.
 * Les paramètres dynamiques sont récupérés via usePulsParams.
 * 
 * STRUCTURE:
 * - Configuration globale
 * - Hooks pour paramètres dynamiques  
 * - URLs organisées par domaine fonctionnel
 * - Fonctions utilitaires
 * 
 * VERSION: 1.0.0
 * DERNIÈRE MISE À JOUR: 2024
 */

import { useMemo } from "react";
import { usePulsParams } from "../../hooks/useDynamicParams";
import getFullUrl from "../../hooks/urlUtils";

// ===========================
// HOOK POUR PARAMÈTRES DYNAMIQUES
// ===========================
/**
 * Hook centralisé pour récupérer tous les paramètres dynamiques de l'utilisateur connecté
 * @returns {object} Tous les paramètres dynamiques disponibles
 */
const useAppParams = () => {
    const {
        ecoleId: dynamicEcoleId,
        personnelInfo,
        academicYearId: dynamicAcademicYearId,
        periodicitieId: dynamicPeriodicitieId,
        profileId,
        userId,
        email,
        isAuthenticated,
        isInitialized,
        isReady,
    } = usePulsParams();

    return useMemo(() => ({
        // IDs principaux
        ecoleId: dynamicEcoleId,
        academicYearId: dynamicAcademicYearId,
        periodicitieId: dynamicPeriodicitieId,
        profileId: profileId,
        userId,

        // Informations du personnel
        personnelInfo,
        personnelId: personnelInfo?.personnelid,
        userProfile: localStorage.getItem('userProfile'),//personnelInfo?.profil,

        // Authentification
        email,
        isAuthenticated,
        isInitialized,
        isReady,

        // Valeurs par défaut pour fallback
    }), [
        dynamicEcoleId,
        dynamicAcademicYearId,
        dynamicPeriodicitieId,
        profileId,
        userId,
        personnelInfo,
        email,
        isAuthenticated,
        isInitialized,
        isReady
    ]);
};

// ===========================
// URLS - GESTION DES CLASSES
// ===========================

/**
 * URLs pour la gestion des classes
 */
const useClassesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();
    return useMemo(() => ({

        /**
         * Récupère les classes visibles par branche (utilise automatiquement l'école de l'utilisateur connecté)
         * @param {number} brancheId - ID de la branche
         */
        getVisibleByBranche: (brancheId) =>
            `${baseUrl}classes/get-visible-by-branche?branche=${brancheId}&ecole=${params.ecoleId}`,

        /**
         * Liste des classes par école (triées) (utilise automatiquement l'école de l'utilisateur connecté)
         */
        allListEcoleSorted: () =>
            `${baseUrl}classes/list-by-ecole-sorted?ecole=${params.ecoleId}`,

        listByEcoleSorted: () =>
            `${baseUrl}classes/get-classe-dto-by-user-type?annee=${params.academicYearId}&ecole=${params.ecoleId}&personnel=${params.personnelInfo.personnelConnecteDetail.personnelid}&profil=${params.profileId}`,

        /**
         * Liste de toutes les classes populées par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getClasseByEcole: () =>
            `${baseUrl}classes/list-all-populate-by-ecole?ecole=${params.ecoleId}`,

        /**
         * Sauvegarde une classe
         */
        saveClasse: () =>
            `${baseUrl}classes/saveAndDisplay`,

        updateClasse: () =>
            `${baseUrl}classes/update-display`,

        /**
         * Liste des classes populées par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listPopulateByEcole: () =>
            `${baseUrl}classes/list-populate-by-ecole?ecole=${params.ecoleId}`,

        /**
         * Récupère une classe spécifique par ID
         * @param {number} classeId - ID de la classe
         */
        getById: (classeId) =>
            `${baseUrl}classes/${classeId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES NIVEAUX ET BRANCHES
// ===========================

/**
 * URLs pour la gestion des niveaux d'enseignement
 */
const useNiveauxUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les niveaux visibles par branche (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getVisibleByBranche: () =>
            `${baseUrl}niveau-enseignement/get-visible-by-branche?ecole=${params.ecoleId}`,

        getNiveauEcole: () =>
            `${baseUrl}niveau/ecole/${params.ecoleId}`,

        /**
         * Liste de tous les niveaux d'enseignement
         */
        list: () =>
            `${baseUrl}niveau-enseignement/list`,

    }), [params, baseUrl]);
};

/**
 * URLs pour la gestion des branches
 */
const useBranchesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les branches par niveau d'enseignement (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getByNiveauEnseignement: () =>
            `${baseUrl}branche/get-by-niveau-enseignement?ecole=${params.ecoleId}`,

        getByEcole: () =>
            `${baseUrl}branche/list-by-ecole/${params.ecoleId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES MATIÈRES
// ===========================

/**
 * URLs pour la gestion des matières
 */
const useMatieresUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les matières d'une école via niveau d'enseignement (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getByEcoleViaNiveauEnseignement: () =>
            `${baseUrl}matiere-ecole/get-by-ecole-via-niveau-enseignement?id=${params.ecoleId}`,

        getByEcoleViaNiveauEnseignementProgection: (niveau) =>
            `${baseUrl}matiere/get-by-niveau-enseignement-projection?niveau=${niveau}`,

        /**
         * Liste des matières par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listByEcole: () =>
            `${baseUrl}matiere-ecole/list-by-ecole/${params.ecoleId}`,

        /**
         * Mettre à jour une matière (mode display)
         */
        updateDisplay: () =>
            `${baseUrl}matiere-ecole/update-display`,

        getLangueListe: () => `${baseUrl}langues/list`,

        getCategoriesList: () => `${baseUrl}categorie-matiere/list`,

        /**
         * Récupère les matières d'une classe via branche (utilise automatiquement l'école de l'utilisateur connecté)
         * @param {number} classeId - ID de la classe
         */
        getAllByBrancheViaClasse: (classeId) =>
            `${baseUrl}classe-matiere/get-all-by-branche-via-classe?branche=${classeId}&ecole=${params.ecoleId}`,

        imprimerMatriceClasse: (classeId) =>
            `${baseUrl}imprimer-matrice-classe/matieres-ecole-web/${params.ecoleId}/${classeId}`,

        getMariereByClasse: (classeId) =>
            `${baseUrl}personnel-matiere-classe/get-enseignant-matiere-classe?annee=${params.academicYearId}&classe=${classeId}`,

        progressionSeance: (classeId, matiereId) =>
            `${baseUrl}progression-seance/get-by-classe-matiere-annee?classe=${classeId}&matiere=${matiereId}&annee=${params.academicYearId}`,

    }), [params, baseUrl]);
};


// ===========================
// URLS - GESTION DES DOMAINES
// ===========================

/**
 * URLs pour la gestion des domaines
 */
const useDomainesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les matières d'une école via niveau d'enseignement (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getDomaineFormation: () =>
            `${baseUrl}Domaine_formation`,

    }), [params, baseUrl]);
};


// ===========================
// URLS - GESTION DU PERSONNEL
// ===========================

/**
 * URLs pour la gestion du personnel et des affectations
 */
const usePersonnelUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les affectations matière-classe du professeur connecté (utilise automatiquement les paramètres de l'utilisateur connecté)
         */
        getMatiereClasseByProf: () =>
            `${baseUrl}personnel-matiere-classe/get-by-prof?annee=${params.academicYearId}&prof=${params.personnelInfo.personnelConnecteDetail.personnelid}&ecole=${params.ecoleId}`,

        /**
         * Récupère les affectations matière-classe d'un professeur spécifique
         * @param {number} anneeId - ID de l'année
         * @param {number} profId - ID du professeur
         * @param {number} ecoleId - ID de l'école
         */
        getByProf: (profId) =>
            `${baseUrl}personnel-matiere-classe/get-by-prof?annee=${params.academicYearId}&prof=${profId}&ecole=${params.ecoleId}`,

        getClasseParProf: (personnel_id) =>
            `${baseUrl}souscription-personnel/classe-par-prof/${personnel_id}/${params.academicYearId}`,

        /**
         * Récupère les matières d'un professeur pour une classe spécifique
         * @param {number} classeId - ID de la classe
         */
        getMatiereClasseByProfClasse: (classeId) =>
            `${baseUrl}personnel-matiere-classe/get-by-prof-classe?prof=${params.personnelInfo.personnelConnecteDetail.personnelid}&classe=${classeId}&annee=${params.academicYearId}`,

        /**
         * Récupère la liste du personnel par école et profil (utilise automatiquement l'école et le profil de l'utilisateur connecté)
         */
        getByEcoleAndProfil: (profProfilId = 8) =>
            `${baseUrl}personnels/get-by-ecole-and-profil?ecole=${params.ecoleId}&profil=${profProfilId}`,

        /**
         * Récupère les souscriptions de personnel par statut
         * @param {string} statut - Statut des souscriptions (VALIDEE, EN_ATTENTE, REFUSEE, etc.)
         */
        getSouscriptionsByStatut: (statut = 'VALIDEE') =>
            `${baseUrl}souscription-personnel/attente/${statut}`,

        /**
         * Récupère les souscriptions de personnel par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getSouscriptionsByEcole: () =>
            `${baseUrl}souscription-personnel/personnel/${params.ecoleId}`,

        /**
         * Recrute un agent (utilise automatiquement l'école de l'utilisateur connecté)
         * @param {number} agent_id - ID de l'agent à recruter
         */
        saveRecutementSouscriptionRecruter: (agent_id) =>
            `${baseUrl}souscription-personnel/recruter/${params.ecoleId}/${agent_id}`,

        /**
         * Ajoute un personnel au panier de recrutement
         * Méthode: POST
         * Corps de requête: { identifiant_ecole, identifiant_personnel, panier_personnel_date_creation }
         */
        addToPanier: () => `${baseUrl}panier-personnel`,

        /**
         * Récupère le panier de personnel (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getPanier: () =>
            `${baseUrl}panier-personnel/ecole/${params.ecoleId}`,

        /**
         * Récupère le panier de personnel par statut (utilise automatiquement l'école de l'utilisateur connecté)
         * @param {string} statut - Statut du panier (EN_ATTENTE, VALIDE, etc.)
         */
        getPanierByStatut: (statut = 'EN_ATTENTE') =>
            `${baseUrl}panier-personnel/ecole/${params.ecoleId}/${statut}`,


        getAgentByStatut: (statut = 'VALIDEE') =>
            `${baseUrl}panier-personnel/ecole/${params.ecoleId}/${statut}`,

        /**
         * Met à jour le statut d'une souscription de personnel
         * @param {number} personnelId - ID du personnel
         * Méthode: PUT/PATCH
         */
        updateSouscriptionStatut: (personnelId) =>
            `${baseUrl}souscription-personnel/${personnelId}/statut`,

        deleteByStatus: () =>
            `${baseUrl}personnel-matiere-classe/delete-by-status/`,

        

        /**
         * Récupère le personnel par fonction (utilise automatiquement l'école de l'utilisateur connecté)
         * @param {number} fonctionId - ID de la fonction
         */
        getByFonction: (fonctionId) =>
            `${baseUrl}personnels/get-by-fonction?fonction=${fonctionId}&ecole=${params.ecoleId}`,

        /**
         * Récupère le personnel pour les certificats de travail (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getForCertificat: () =>
            `${baseUrl}souscription-personnel/personnel/${params.ecoleId}`,

        getUserInfos: (userId) =>
            `${baseUrl}souscription-personnel/personnelById/${userId}`,

        /**
         * Génère un certificat de travail
         * @param {number} ecoleId - ID de l'école
         * @param {number} personnelId - ID du personnel
         * @param {string} nomSignataire - Nom du signataire
         * @param {string} fonctionSignataire - Fonction du signataire
         */
        imprimerCertificatTravail: (ecoleId, personnelId, nomSignataire, fonctionSignataire) =>
            `${baseUrl}imprimer-perspnnel/certificat-de-travail/${params.ecoleId}/${personnelId}/${nomSignataire}/${fonctionSignataire}`,

        ouvrirFichierByApi: (filename) =>
            `${baseUrl}souscription-personnel/ouvrir-fichier/${filename}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES PÉRIODES
// ===========================

/**
 * URLs pour la gestion des périodes
 */
const usePeriodesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();


    const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));
    //console.log(academicYear.periodicite.id)
    //alert(academicYear.periodicite.id);


    return useMemo(() => ({

        /**
         * Liste des périodes par périodicité (utilise automatiquement la périodicité de l'utilisateur connecté)
         */
        listByPeriodicite: () =>
            `${baseUrl}periodes/list-by-periodicite?id=${academicYear.periodicite.id}`,

        /**
         * Liste des périodes par périodicité spécifique
         * @param {number} periodicitieId - ID de la périodicité
         */
        listByPeriodiciteId: (periodicitieId) =>
            `${baseUrl}periodes/list-by-periodicite?id=${periodicitieId}`,

        /**
         * Liste de toutes les périodes
         */
        list: () =>
            `${baseUrl}periodes/list`,

        /**
         * Liste des périodicités
         */
        listPeriodicites: () =>
            `${baseUrl}periodicite/list`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES ÉLÈVES
// ===========================

/**
 * URLs pour la gestion des élèves
 */
const useElevesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les élèves d'une classe (utilise automatiquement l'année de l'utilisateur connecté)
         * @param {number} classeId - ID de la classe
         */
        retrieveByClasse: (classeId) =>
            `${baseUrl}classe-eleve/retrieve-by-classe/${classeId}/${params.academicYearId}`,

        /**
         * Récupère les élèves d'une classe pour une année spécifique
         * @param {number} classeId - ID de la classe
         * @param {number} anneeId - ID de l'année
         */
        retrieveByClasseAnnee: (classeId) =>
            `${baseUrl}classe-eleve/retrieve-by-classe/${classeId}/${params.academicYearId}`,

        imprimerFicheIdentification: (selectedYear, matricule) =>
            `${baseUrl}imprimer-Fiche-eleve/identification/${selectedYear}/${matricule}/${params.ecoleId}`,

        imprimerFicheInscription: (selectedYear, matricule) =>
            `${baseUrl}imprimer-Fiche-eleve/inscription/${selectedYear}/${matricule}/${params.ecoleId}`,



        /**
         * Sauvegarde l'affectation d'élèves à une classe
         * @param {number} classeId - ID de la classe
         */
        handleSave: (classeId) =>
            `${baseUrl}classe-eleve/handle-save/${classeId}`,

        /**
         * Supprime un élève d'une classe
         * @param {number} eleveId - ID de l'élève
         */
        delete: (eleveId) =>
            `${baseUrl}classe-eleve/delete/${eleveId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES MESSAGES
// ===========================

/**
 * URLs pour la gestion des messages
 */
const useMessagesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Boîte de réception des messages (utilise automatiquement l'utilisateur connecté)
         */
        boiteReception: () =>
            `${baseUrl}message-personnel/boite-reception/${params.userId}`,

        /**
         * Messages envoyés (utilise automatiquement l'utilisateur connecté)
         */
        boiteEnvoi: () =>
            `${baseUrl}message-personnel/boite-envoie/${params.userId}`,

        /**
         * Envoie un message à un personnel spécifique
         * @param {number} personnelId - ID du personnel destinataire
         * Méthode: POST
         * Corps de requête: { message_personnel_sujet, message_personnel_message, idEmetteur, idDestinataire, ... }
         */
        sendToPersonnel: (personnelId) =>
            `${baseUrl}message-personnel/${personnelId}`,

        /**
         * Créer un nouveau message
         * Méthode: POST
         */
        create: () =>
            `${baseUrl}message-personnel`,

        /**
         * Récupère un message spécifique par ID
         * @param {number} messageId - ID du message
         */
        getById: (messageId) =>
            `${baseUrl}message-personnel/${messageId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES FONCTIONS
// ===========================

/**
 * URLs pour la gestion des fonctions du personnel
 */
const useFonctionsUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Liste des fonctions par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listByEcole: () =>
            `${baseUrl}fonction/list-by-ecole?ecole=${params.ecoleId}`,

        getFondateur: () =>
            `${baseUrl}fonction/sans-fondateur/fondateur`,

    }), [params, baseUrl]);
};

const useAutorsationUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        getAutorsation: () =>
            `${baseUrl}typeAutorisation`,

    }), [params, baseUrl]);
};


// ===========================
// URLS - GESTION DES ANNÉES SCOLAIRES
// ===========================

/**
 * URLs pour la gestion des années scolaires
 */
const useAnneesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Liste de toutes les années scolaires
         */
        list: () =>
            `${baseUrl}annee-scolaire/list`,

        /**
         * Années ouvertes ou fermées (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listOpenedOrClosedToEcole: () =>
            `${baseUrl}annee/list-opened-or-closed-to-ecole?ecole=${params.ecoleId}`,

        /**
         * Années ouvertes ou fermées pour une école spécifique
         */
        listOpenedOrClosedToEcoleId: () =>
            `${baseUrl}annee/list-opened-or-closed-to-ecole?ecole=${params.ecoleId}`,

        /**
         * Liste des années scolaires (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listByEcole: () =>
            `${baseUrl}annee/list-to-ecole?ecole=${params.ecoleId}`,

        /**
         * Récupère l'année principale (utilise automatiquement l'école de l'utilisateur connecté)
         */
        getMainByEcole: () =>
            `${baseUrl}annee/get-main-annee-by-ecole/${params.ecoleId}`,

        /**
         * Sauvegarde/met à jour une année scolaire
         */
        saveUpdate: () =>
            `${baseUrl}annee/save-update-ecole`,

        /**
         * Liste des années scolaires centrales
         */
        listToCentral: () =>
            `${baseUrl}annee/list-to-central`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES ÉVALUATIONS
// ===========================

/**
 * URLs pour la gestion des évaluations
 */
const useEvaluationsUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Recherche d'évaluations par filtres
         * @param {Object} filters - Objet contenant les filtres
         * @param {number} filters.classe_id - ID de la classe (obligatoire)
         * @param {number} filters.annee_id - ID de l'année (optionnel, utilise params par défaut)
         * @param {number} filters.matiere_id - ID de la matière (optionnel)
         * @param {number} filters.periode_id - ID de la période (optionnel)
         */
        getByFilters: (filters) => {
            const baseUrlPath = `${baseUrl}evaluation/get-by-filters`;
            const urlParams = new URLSearchParams();

            // Paramètre obligatoire
            if (filters.classe_id) {
                urlParams.append('classe_id', filters.classe_id);
            }

            // Paramètres optionnels avec valeurs par défaut
            urlParams.append('annee_id', filters.annee_id || params.academicYearId);

            if (filters.matiere_id) {
                urlParams.append('matiere_id', filters.matiere_id);
            }

            if (filters.periode_id) {
                urlParams.append('periode_id', filters.periode_id);
            }

            return `${baseUrlPath}?${urlParams.toString()}`;
        },

        /**
         * Récupère les évaluations par classe, matière et période
         * @param {Object} filters - Objet contenant les filtres
         */
        getClasseMatierePeriodie: (filters) => {
            const urlParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    urlParams.append(key, value);
                }
            });
            return `${baseUrl}evaluations/get-classe-matiere-periode?${urlParams.toString()}`;
        },

        imprimerProcesVerbal: (classeId, uuid) =>
            `${baseUrl}imprimer-proces-verbal/imprimer-proces-verbal/${classeId}/${uuid}`,

        /**
         * Récupère une évaluation spécifique par ID
         * @param {number} evaluationId - ID de l'évaluation
         */
        getById: (evaluationId) =>
            `${baseUrl}evaluation/${evaluationId}`,

        updateDisplayEvaluation: () =>
            `${baseUrl}evaluations/update-display`,

        saveAndDisplayEvaluation: () =>
            `${baseUrl}evaluations/saveAndDisplay`,

        deleteEvaluation: (evaluationId, userId) =>
            `${baseUrl}evaluations/delete-handle/${evaluationId}/${userId}`,

        /**
         * Récupère une évaluation par code
         * @param {string} evaluationCode - Code de l'évaluation
         */
        getByCode: (evaluationCode) =>
            `${baseUrl}evaluations/code/${evaluationCode}`,

        /**
         * Vérifie si une évaluation est verrouillée
         * @param {number} evaluationId - ID de l'évaluation
         */
        isLocked: (evaluationId) =>
            `${baseUrl}evaluations/is-locked/${evaluationId}`,

        /**
         * Statistiques d'évaluations pour un professeur
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         * @param {number} periodeId - ID de la période
         * @param {number} professeurId - ID du professeur
         */
        statistiqueProf: (ecoleId, anneeId, periodeId, professeurId) =>
            `${baseUrl}evaluations/statistique-prof/${ecoleId}/${params.academicYearId}/${periodeId}/${professeurId}`,

        /**
         * Créer une nouvelle évaluation
         */
        create: () =>
            `${baseUrl}evaluation/create`,

        /**
         * Mettre à jour une évaluation existante
         * @param {number} evaluationId - ID de l'évaluation
         */
        update: (evaluationId) =>
            `${baseUrl}evaluation/update/${evaluationId}`,

        /**
         * Supprimer une évaluation
         * @param {number} evaluationId - ID de l'évaluation
         */
        delete: (evaluationId) =>
            `${baseUrl}evaluation/delete/${evaluationId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES NOTES
// ===========================

/**
 * URLs pour la gestion des notes
 */
const useNotesUrls = () => {
    const baseUrl = getFullUrl();
    const params = useAppParams();

    return useMemo(() => ({

        /**
         * Récupère les notes d'une évaluation
         * @param {string} evaluationCode - Code de l'évaluation
         */
        listAboutEvaluation: (evaluationCode) =>
            `${baseUrl}notes/list-about-evaluation/${evaluationCode}`,

        getEvalutionsByPeriodeEtBrnche: (periode, niveau) =>
            `${baseUrl}evaluation-periode/get-by-annee-ecole-periode-niveau/${params.academicYearId}/${params.ecoleId}/${periode}/${niveau}`,

        update: (matiereId, classeId) =>
            `${baseUrl}personnel-matiere-classe/get-professeur-by-matiere?annee=${params.academicYearId}&matiere=${matiereId}&classe=${classeId}`,
        handleNotes: () =>
            `${baseUrl}notes/handle-notes`,

        /**
         * Récupère les notes par classe et période
         * @param {Object} filters - Filtres pour la recherche
         */
        getByClasseAndPeriode: (filters) => {
            const urlParams = new URLSearchParams();
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    urlParams.append(key, value);
                }
            });
            return `${baseUrl}notes/get-by-classe-periode?${urlParams.toString()}`;
        },

    }), [baseUrl]);
};

// ===========================
// URLS - GESTION DES INSCRIPTIONS
// ===========================

/**
 * URLs pour la gestion des inscriptions
 */
const useInscriptionsUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les élèves disponibles pour affectation à une classe
         * @param {number} anneeId - ID de l'année
         * @param {number} brancheId - ID de la branche
         * @param {string} statut - Statut des inscriptions (VALIDEE par défaut)
         * @param {number} ecoleId - ID de l'école
         */
        retrieveToAttribClasse: (brancheId, statut = 'VALIDEE') =>
            `${baseUrl}inscription/retrieve-to-attrib-classe/${params.academicYearId}/?branche=${brancheId}&statut=${statut}&ecole=${params.ecoleId}`,

        /**
         * Récupère les inscriptions par statut
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         * @param {string} statut - Statut des inscriptions
         * @param {string} typeInscription - Type d'inscription
         */
        getByStatut: (statut, typeInscription) =>
            `${baseUrl}inscriptions/statuts/${params.ecoleId}/${params.academicYearId}/${statut}/${typeInscription}`,

        /**
         * Récupère toutes les inscriptions
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         * @param {string} typeInscription - Type d'inscription
         */
        getAllInscriptions: (typeInscription) =>
            `${baseUrl}inscriptions/allInscription/${params.ecoleId}/${params.academicYearId}/${typeInscription}`,

        /**
         * Créer une inscription
         */
        create: () =>
            `${baseUrl}inscriptions/create`,

        /**
         * Mettre à jour une inscription
         * @param {number} inscriptionId - ID de l'inscription
         */
        update: (inscriptionId) =>
            `${baseUrl}inscriptions/update/${inscriptionId}`,

        getStudentPhoto: (eleve_id) =>
            `${baseUrl}inscriptions/get-image-by-inscription/${eleve_id}`,

        upploadStudentPhoto: (eleve_id) =>
            `${baseUrl}inscriptions/charger-photo/${eleve_id}`,

        infosComplementairesEleve: () =>
            `${baseUrl}inscriptions/infos-complementaires/`,

        //`${apiUrls.inscriptions.base}/charger-photo/${formData.eleve_id}`

        /**
         * Liste des élèves par classe
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         */
        listEleveClasse: () =>
            `${baseUrl}inscriptions/list-eleve-classe/${params.ecoleId}/${params.academicYearId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES BULLETINS
// ===========================

/**
 * URLs pour la gestion des bulletins
 */
const useBulletinsUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère le bulletin d'un élève pour une année et période données
         * @param {number} anneeId - ID de l'année
         * @param {string} matricule - Matricule de l'élève
         * @param {number} periodeId - ID de la période
         * @param {number} classeId - ID de la classe
         */
        /**
         * Récupère le bulletin d'un élève (utilise automatiquement l'année de l'utilisateur connecté)
         * @param {string} matricule - Matricule de l'élève
         * @param {number} periodeId - ID de la période
         * @param {number} classeId - ID de la classe
         */
        getBulletinEleveAnneePeriode: (matricule, periodeId, classeId) =>
            `${baseUrl}bulletin/get-bulletin-eleve-annee-periode?annee=${params.academicYearId}&matricule=${matricule}&periode=${periodeId}&classe=${classeId}`,

        /**
         * Récupère le bulletin d'un élève pour une année spécifique
         * @param {number} anneeId - ID de l'année
         * @param {string} matricule - Matricule de l'élève
         * @param {number} periodeId - ID de la période
         * @param {number} classeId - ID de la classe
         */
        getBulletinEleveAnneePeriodeSpecific: (anneeId, matricule, periodeId, classeId) =>
            `${baseUrl}bulletin/get-bulletin-eleve-annee-periode?annee=${anneeId}&matricule=${matricule}&periode=${periodeId}&classe=${classeId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES AFFECTATIONS PERSONNEL-MATIÈRE-CLASSE
// ===========================

/**
 * URLs pour la gestion des affectations personnel-matière-classe
 */
const useAffectationsUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les professeurs principaux et éducateurs par classe (utilise automatiquement l'année et l'école de l'utilisateur connecté)
         * @param {number} classeId - ID de la classe
         */
        getPpAndEducDtoByClasse: (classeId) =>
            `${baseUrl}personnel-matiere-classe/get-pp-and-educ-dto-by-classe?annee=${params.academicYearId}&ecole=${params.ecoleId}&classe=${classeId}`,

        /**
         * Récupère les professeurs par classe (utilise automatiquement l'année de l'utilisateur connecté)
         * @param {number} classeId - ID de la classe
         */
        getProfesseurByClasse: (classeId) =>
            `${baseUrl}personnel-matiere-classe/get-professeur-by-classe?classe=${classeId}&annee=${params.academicYearId}`,

        /**
         * Récupère le personnel par classe (utilise automatiquement l'année et l'école de l'utilisateur connecté)
         * @param {number} classeId - ID de la classe
         */
        getPersonnelByClasse: (classeId) =>
            `${baseUrl}personnel-matiere-classe/get-personnel-by-classe?annee=${params.academicYearId}&ecole=${params.ecoleId}&classe=${classeId}`,

        getByMatiere: (matiereId) =>
            `${baseUrl}personnel-matiere-classe/get-by-matiere?matiere=${matiereId}&ecole=${params.ecoleId}&annee=${params.academicYearId}`,

        /**
         * Affecte un personnel à une classe
         */
        affecterClassePersonnel: () =>
            `${baseUrl}personnel-matiere-classe/saveAndDisplayList`,

        // affecterClassePersonnel: () =>
        //     `${baseUrl}personnel-matiere-classe/affecter-classe-personnel`,

        /**
         * Affecte une matière à un professeur
         */
        affecterMatiereProfesseur: () =>
            `${baseUrl}personnel-matiere-classe/saveAndDisplay`,

        getProfesseur: () =>
            `${baseUrl}fonctions/list`,

        getByFonction: (fonctionId) =>
            `${baseUrl}personnel-matiere-classe/get-by-fonction?annee=${params.academicYearId}&ecole=${params.ecoleId}&fonctionId=${fonctionId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES SALLES
// ===========================

/**
 * URLs pour la gestion des salles
 */
const useSallesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Liste des salles par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listByEcole: () =>
            `${baseUrl}salle/list-by-ecole?ecole=${params.ecoleId}`,

        /**
         * Créer une nouvelle salle
         */
        create: () =>
            `${baseUrl}salles`,

        /**
         * Mettre à jour une salle
         * @param {number} salleId - ID de la salle
         */
        update: (salleId) =>
            `${baseUrl}salles/${salleId}`,

        updateDisplay: () =>
            `${baseUrl}salle/update-display `,

        saveAndDisplay: () =>
            `${baseUrl}salle/saveAndDisplay`,

        /**
         * Supprimer une salle
         * @param {number} salleId - ID de la salle
         */
        delete: (salleId) => `${baseUrl}salle/delete/${salleId}`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES OFFRES D'EMPLOI
// ===========================

/**
 * URLs pour la gestion des offres d'emploi
 */
const useOffresUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Liste des offres d'emploi par école (utilise automatiquement l'école de l'utilisateur connecté)
         */
        listByEcole: () =>
            `${baseUrl}offres-emploi/list-by-ecole?ecole=${params.ecoleId}`,

        /**
         * Créer une nouvelle offre d'emploi
         */
        create: () =>
            `${baseUrl}offres-emploi`,

        /**
         * Mettre à jour une offre d'emploi
         * @param {number} offreId - ID de l'offre
         */
        update: (offreId) =>
            `${baseUrl}offres-emploi/${offreId}`,

        /**
         * Supprimer une offre d'emploi
         * @param {number} offreId - ID de l'offre
         */
        delete: (offreId) =>
            `${baseUrl}offres-emploi/${offreId}`,

        /**
         * Liste des niveaux d'étude
         */
        getNiveauxEtude: () =>
            `${baseUrl}niveau_etude`,

        /**
         * Liste des types d'offre
         */
        getTypesOffre: () =>
            `${baseUrl}type_offre`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES COEFFICIENTS
// ===========================

/**
 * URLs pour la gestion des coefficients de matières
 */
const useCoefficientsUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Liste des coefficients par école et branche (utilise automatiquement l'école de l'utilisateur connecté)
         * @param {number} brancheId - ID de la branche
         */
        listByEcoleAndBranche: (brancheId) =>
            `${baseUrl}coefficients/list-by-ecole-branche?ecole=${params.ecoleId}&branche=${brancheId}`,

        /**
         * Créer un nouveau coefficient
         */
        create: () =>
            `${baseUrl}coefficients`,

        /**
         * Mettre à jour un coefficient
         * @param {number} coefficientId - ID du coefficient
         */
        update: (coefficientId) =>
            `${baseUrl}coefficients/${coefficientId}`,

        /**
         * Supprimer un coefficient
         * @param {number} coefficientId - ID du coefficient
         */
        delete: (coefficientId) =>
            `${baseUrl}coefficients/${coefficientId}`,

        /**
         * Récupère les coefficients par branche
         * @param {number} brancheId - ID de la branche
         * @param {number} ecoleId - ID de l'école (optionnel, utilise params par défaut)
         */
        getByBranche: (brancheId) =>
            `${baseUrl}classe-matiere/get-by-branche?branche=${brancheId}&ecole=${params.ecoleId}`,

        /**
         * Met à jour les coefficients
         */
        majCoefficients: () =>
            `${baseUrl}classe-matiere/maj-coefficients`,

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES SÉANCES
// ===========================

/**
 * URLs pour la gestion des séances
 */
const useSeancesUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les séances par statut
         * @param {number} anneeId - ID de l'année
         * @param {string} statut - Statut des séances
         * @param {number} ecoleId - ID de l'école
         */
        /**
         * Récupère les séances par statut (utilise automatiquement l'année et l'école de l'utilisateur connecté)
         * @param {string} statut - Statut des séances (MAN par défaut)
         */
        getListStatut: (statut = 'MAN') =>
            `${baseUrl}seances/get-list-statut?annee=${params.academicYearId}&statut=${statut}&ecole=${params.ecoleId}`,

        getStatSceanceEcole: () =>
            `${baseUrl}seances/stat-seance-by-annee-and-ecole?annee=${params.academicYearId}&ecole=${params.ecoleId}`,

        getSceanceEcoleByDate: (
            dateDebutStr,
            dateFinStr,
            page,
            rows,
            classeId,
            matiereId
        ) => {
            let url = `${baseUrl}seances/seances-dto-by-ecole-and-criteria?ecole=${params.ecoleId}&dateDebut=${dateDebutStr}&dateFin=${dateFinStr}&page=${page}&rows=${rows}`;

            if (classeId) url += `&classe=${classeId}`;
            if (matiereId) url += `&matiere=${matiereId}`;

            return url;
        },

        /**
         * Récupère les séances par statut pour des paramètres spécifiques
         * @param {number} anneeId - ID de l'année
         * @param {string} statut - Statut des séances
         * @param {number} ecoleId - ID de l'école
         */
        getListStatutSpecific: (anneeId, statut, ecoleId) =>
            `${baseUrl}seances/get-list-statut?annee=${anneeId}&statut=${statut}&ecole=${ecoleId}`,

        /**
         * Sauvegarde une séance
         */
        saveAndDisplay: () =>
            `${baseUrl}seances/saveAndDisplay`,

        /**
         * Supprime une séance
         * @param {number} seanceId - ID de la séance
         */
        delete: (seanceId) =>
            `${baseUrl}seances/delete/${seanceId}`,

        /**
         * Récupère les salles disponibles pour une séance
         * @param {Object} params - Paramètres de recherche
         */
        getSallesDispoHeures: (params) => {
            const urlParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined && value !== '') {
                    urlParams.append(key, value);
                }
            });
            return `${baseUrl}salle/get-salles-dispo-heures?${urlParams.toString()}`;
        },

    }), [params, baseUrl]);
};

// ===========================
// URLS - GESTION DES ÉCOLES
// ===========================

/**
 * URLs pour la gestion des écoles
 */
const useEcolesUrls = () => {
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Liste des écoles à valider
         */
        getEcolesAValider: () =>
            `${baseUrl}ecoles/a-valider`,

        /**
         * Valider une école
         * @param {number} ecoleId - ID de l'école
         */
        valider: (ecoleId) =>
            `${baseUrl}ecoles/valider/${ecoleId}`,

    }), [baseUrl]);
};

// ===========================
// URLS - GESTION DES RAPPORTS
// ===========================

/**
 * URLs pour la gestion des rapports
 */
const useRapportsUrls = () => {
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Génère un rapport
         * @param {string} type - Type de rapport
         */
        generer: (type) =>
            `${baseUrl}rapports/${type}`,

        /**
         * Liste des rapports disponibles
         */
        liste: () =>
            `${baseUrl}rapports`,

        /**
         * Génère un bulletin par classe
         */
        bulletinClasse: (ecoleId, periodeLabel, anneeLabel, classe, niveauEnseignementId) =>
            `${baseUrl}imprimer-bulletin-list/spider-bulletin/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}/true/${niveauEnseignementId}/true/true/true/true/false/true/false/false/false/false`,

        /**
         * Génère un bulletin par matricule
         */
        bulletinMatricule: (ecoleId, periodeLabel, anneeLabel, classe, matriculeEleves, niveauEnseignementId) =>
            `${baseUrl}imprimer-bulletin-list/spider-bulletin-matricule/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}/${matriculeEleves}/true/${niveauEnseignementId}/true/true/true/true/false/true/false/false/false/false`,

        /**
         * Test de connexion API
         */
        testConnexion: () =>
            `${baseUrl}health`,

    }), [baseUrl]);
};

// ===========================
// URLS POUR L'ENQUÊTE RAPIDE
// ===========================
const useEnqueteRapideUrls = () => {
    const baseUrl = getFullUrl();
    const params = useAppParams();

    return useMemo(() => ({

        /**
         * Liste des branches par école avec affectés/non affectés
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         */
        listeParEcoleAffNaff: (ecoleId, anneeId) =>
            `${baseUrl}enquete-rapide/liste-par-ecole-aff-naff/${ecoleId}/${anneeId}`,

        /**
         * Liste des réunions par école
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         */
        listeParEcole: (ecoleId, anneeId) =>
            `${baseUrl}enquete-rapide/liste-par-ecole/${ecoleId}/${anneeId}`,

        /**
         * Créer/modifier une réunion
         */
        reunion: () =>
            `${baseUrl}enquete-rapide/reunion`,

        saveEnquetteRapide: () =>
            `${baseUrl}enquete-rapide`,

        /**
         * Télécharger le rapport rapide de rentrée
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         */
        downloadRapport: () =>
            `${baseUrl}raport-rapide-de-rentree/imprimer/${params.ecoleId}/${params.academicYearId}`,

    }), [baseUrl]);
};

// ===========================
// URLS POUR L'EMPLOI DU TEMPS
// ===========================
const useEmploiDuTempsUrls = () => {
    const baseUrl = getFullUrl();
    const params = useAppParams();
    return useMemo(() => ({

        /**
         * Liste des activités par école
         * @param {number} ecoleId - ID de l'école
         */
        listActivitesByEcole: () =>
            `${baseUrl}activite/list-by-ecole/${params.ecoleId}`,

        /**
         * Liste des jours
         */
        listJours: () =>
            `${baseUrl}jour/list`,

        /**
         * Types d'activité par école
         * @param {number} ecoleId - ID de l'école
         */
        getTypesActiviteByEcole: () =>
            `${baseUrl}type-activite/get-by-ecole/${params.ecoleId}`,

        /**
         * Matières par classe via branche
         * @param {number} classeId - ID de la classe
         */
        getMatieresByClasse: (classeId) =>
            `${baseUrl}classe-matiere/get-by-branche-via-classe?classe=${classeId}`,

        /**
         * Vérifier si une plage horaire est valide
         */
        isPlageHoraireValid: (annee, classe, jour, heureDeb, heureFin) =>
            `${baseUrl}activite/is-plage-horaire-valid?annee=${annee}&classe=${classe}&jour=${jour}&heureDeb=${heureDeb}&heureFin=${heureFin}`,

        /**
         * Salles disponibles pour une plage horaire
         */
        getSallesDisponibles: (annee, classe, jour, date, heureDeb, heureFin) =>
            `${baseUrl}salle/get-salles-dispo-heures?annee=${annee}&classe=${classe}&jour=${jour}&date=${date}&heureDeb=${heureDeb}&heureFin=${heureFin}`,

        /**
         * Activités par classe et jour
         */
        getActivitesByClasseJour: (classe, jour) =>
            `${baseUrl}activite/list-by-classe-jour?annee=${params.academicYearId}&classe=${classe}&jour=${jour}`,

        /**
         * Sauvegarder une activité
         */
        saveActivite: () =>
            `${baseUrl}activite/saveAndDisplay`,

        /**
         * Supprimer une activité
         * @param {number} activiteId - ID de l'activité
         */
        deleteActivite: (activiteId) =>
            `${baseUrl}activite/${activiteId}`,

    }), [baseUrl]);
};

// ===========================
// URLS - GESTION DES IMPORTS
// ===========================

/**
 * URLs pour la gestion des imports
 */
const useImportsUrls = () => {
    const baseUrl = getFullUrl();
    const params = useAppParams();

    return useMemo(() => ({

        /**
         * Import d'élèves
         */
        importEleves: () =>
            `${baseUrl}import/eleves`,

        /**
         * Import de notes
         */
        importNotes: () =>
            `${baseUrl}import/notes`,

        /**
         * Validation d'import
         * @param {string} type - Type d'import
         */
        valider: (type) =>
            `${baseUrl}import/${type}/valider`,

        /**
         * Import d'élèves avec paramètres complets
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         * @param {string} typeAction - Type d'action
         * @param {number} brancheId - ID de la branche
         */
        importElevesComplet: (typeAction, selectedBranche) =>
            `${baseUrl}eleve/importer-eleve/${params.ecoleId}/${params.academicYearId}/${typeAction}/${selectedBranche}`,

        /**
         * Import d'évaluations par classe
         */
        importEvaluationsClasse: () =>
            `${baseUrl}import-list-evaluation-classe/`,

    }), [baseUrl]);
};

// ===========================
// URLS - GESTION DES SOUSCRIPTIONS
// ===========================

/**
 * URLs pour la gestion des souscriptions
 */
const useSouscriptionsUrls = () => {
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les souscriptions en attente
         * @param {string} statut - Statut des souscriptions
         */
        getEnAttente: (statut = 'EN%20ATTENTE') =>
            `${baseUrl}souscription-personnel/attente/${statut}`,

        souscriptionPersonnel: () =>
            `${baseUrl}souscription-personnel`,


        /**
         * Récupère les souscriptions d'écoles
         * @param {string} typeValidation - Type de validation
         */
        getAllSouscriptionEcoles: (typeValidation) =>
            `${baseUrl}souscription-ecole/allSouscriptionEcoles/${typeValidation}`,

        /**
         * Récupère les fondateurs en attente
         * @param {string} typeValidation - Type de validation
         * @param {string} typeFondateur - Type de fondateur
         */
        getFondateursAttente: (typeValidation, typeFondateur = 'Fondateur') =>
            `${baseUrl}souscription-personnel/attente-fondateur/${typeValidation}/${typeFondateur}`,

    }), [baseUrl]);
};

// ===========================
// URLS - GESTION DES PROFILS
// ===========================

/**
 * URLs pour la gestion des profils
 */
const useProfilsUrls = () => {
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les profils visibles
         */
        getProfilVisible: () => `${baseUrl}profil/profil-visible`,

        affecterProfilUtilisateur: () => `${baseUrl}connexion/affecter-profil-utilisateur`,

        editPasseWord: () => `${baseUrl}connexion/modifier-motDePasse`,



    }), [baseUrl]);
};

// ===========================
// URLS - GESTION DU DASHBOARD
// ===========================

/**
 * URLs pour la gestion du dashboard
 */
const useDashboardUrls = () => {
    const params = useAppParams();
    const baseUrl = getFullUrl();

    return useMemo(() => ({

        /**
         * Récupère les données du bloc élèves pour le dashboard fondateur
         * (utilise automatiquement l'école et l'année de l'utilisateur connecté)
         */
        getEleveBlock: () =>
            `${baseUrl}dashboard-fondateur/eleve-block/${params.ecoleId}/${params.academicYearId}`,

        /**
         * Récupère les données du bloc élèves pour des paramètres spécifiques
         * @param {number} ecoleId - ID de l'école
         * @param {number} anneeId - ID de l'année
         */
        getEleveBlockSpecific: (ecoleId, anneeId) =>
            `${baseUrl}dashboard-fondateur/eleve-block/${ecoleId}/${anneeId}`,

        /**
         * Récupère les statistiques générales du dashboard
         * (utilise automatiquement l'école et l'année de l'utilisateur connecté)
         */
        getStatistiques: () =>
            `${baseUrl}dashboard-fondateur/statistiques/${params.ecoleId}/${params.academicYearId}`,

        /**
         * Récupère les données du bloc personnel
         * (utilise automatiquement l'école et l'année de l'utilisateur connecté)
         */
        getPersonnelBlock: () =>
            `${baseUrl}dashboard-fondateur/personnel-block/${params.ecoleId}/${params.academicYearId}`,

        /**
         * Récupère les données du bloc financier
         * (utilise automatiquement l'école et l'année de l'utilisateur connecté)
         */
        getFinancierBlock: () =>
            `${baseUrl}dashboard-fondateur/financier-block/${params.ecoleId}/${params.academicYearId}`,

        /**
         * Récupère les données du bloc académique
         * (utilise automatiquement l'école et l'année de l'utilisateur connecté)
         */
        getAcademiqueBlock: () =>
            `${baseUrl}dashboard-fondateur/academique-block/${params.ecoleId}/${params.academicYearId}`,


    }), [params, baseUrl]);
};

// ===========================
// HOOK PRINCIPAL - TOUTES LES URLS
// ===========================

/**
 * Hook principal qui regroupe toutes les URLs de l'application
 * Utilise les hooks spécialisés pour chaque domaine fonctionnel
 *
 * @returns {Object} Objet contenant toutes les URLs organisées par domaine
 *
 * @example
 * const apiUrls = useAllApiUrls();
 *
 * // Utilisation
 * const classesUrl = apiUrls.classes.listByEcoleSorted();
 * const matieresUrl = apiUrls.matieres.getByEcoleViaNiveauEnseignement();
 * const elevesUrl = apiUrls.eleves.retrieveByClasse(classeId);
 */
const useAllApiUrls = () => {
    const classes = useClassesUrls();
    const niveaux = useNiveauxUrls();
    const branches = useBranchesUrls();
    const matieres = useMatieresUrls();
    const domaineFormation = useDomainesUrls();
    const personnel = usePersonnelUrls();
    const periodes = usePeriodesUrls();
    const eleves = useElevesUrls();
    const messages = useMessagesUrls();
    const fonctions = useFonctionsUrls();
    const autorisation = useAutorsationUrls();
    const annees = useAnneesUrls();
    const evaluations = useEvaluationsUrls();
    const notes = useNotesUrls();
    const inscriptions = useInscriptionsUrls();
    const bulletins = useBulletinsUrls();
    const affectations = useAffectationsUrls();
    const salles = useSallesUrls();
    const offres = useOffresUrls();
    const coefficients = useCoefficientsUrls();
    const seances = useSeancesUrls();
    const ecoles = useEcolesUrls();
    const rapports = useRapportsUrls();
    const imports = useImportsUrls();
    const souscriptions = useSouscriptionsUrls();
    const profils = useProfilsUrls();
    const dashboard = useDashboardUrls();
    const enqueteRapide = useEnqueteRapideUrls();
    const emploiDuTemps = useEmploiDuTempsUrls();
    const params = useAppParams();

    return useMemo(() => ({
        // Domaines fonctionnels
        classes,
        niveaux,
        branches,
        matieres,
        personnel,
        periodes,
        eleves,
        domaineFormation,
        autorisation,
        messages,
        fonctions,
        annees,
        evaluations,
        notes,
        inscriptions,
        bulletins,
        affectations,
        salles,
        offres,
        coefficients,
        seances,
        ecoles,
        rapports,
        imports,
        souscriptions,
        profils,
        dashboard,
        enqueteRapide,
        emploiDuTemps,

        // Accès rapide aux paramètres
        params,

        // Informations de version
        version: '1.0.0',
        lastUpdate: new Date().toISOString(),
    }), [
        classes,
        niveaux,
        branches,
        matieres,
        personnel,
        periodes,
        eleves,
        messages,
        fonctions,
        domaineFormation,
        autorisation,
        annees,
        evaluations,
        notes,
        inscriptions,
        bulletins,
        affectations,
        salles,
        offres,
        coefficients,
        seances,
        ecoles,
        rapports,
        imports,
        souscriptions,
        profils,
        dashboard,
        enqueteRapide,
        emploiDuTemps,
        params
    ]);
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Construit une URL avec des paramètres de requête
 * @param {string} baseUrl - URL de base
 * @param {Object} queryParams - Objet contenant les paramètres de requête
 * @returns {string} URL complète avec paramètres
 */
export const buildUrlWithParams = (baseUrl, queryParams = {}) => {
    const url = new URL(baseUrl, getFullUrl());

    Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
            url.searchParams.append(key, value);
        }
    });

    return url.toString();
};

/**
 * Valide si une URL est bien formée
 * @param {string} url - URL à valider
 * @returns {boolean} true si l'URL est valide
 */
export const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

/**
 * Extrait les paramètres de requête d'une URL
 * @param {string} url - URL à analyser
 * @returns {Object} Objet contenant les paramètres extraits
 */
export const extractQueryParams = (url) => {
    try {
        const urlObj = new URL(url);
        const params = {};

        urlObj.searchParams.forEach((value, key) => {
            params[key] = value;
        });

        return params;
    } catch {
        return {};
    }
};

// ===========================
// EXPORTS PRINCIPAUX
// ===========================

// Export du hook principal comme export par défaut
export default useAllApiUrls;

// Exports nommés pour usage spécifique
export {
    useAppParams,
    useClassesUrls,
    useNiveauxUrls,
    useBranchesUrls,
    useMatieresUrls,
    useDomainesUrls,
    usePersonnelUrls,
    usePeriodesUrls,
    useElevesUrls,
    useMessagesUrls,
    useFonctionsUrls,
    useAutorsationUrls,
    useAnneesUrls,
    useEvaluationsUrls,
    useNotesUrls,
    useInscriptionsUrls,
    useBulletinsUrls,
    useAffectationsUrls,
    useSallesUrls,
    useOffresUrls,
    useCoefficientsUrls,
    useSeancesUrls,
    useEcolesUrls,
    useRapportsUrls,
    useImportsUrls,
    useSouscriptionsUrls,
    useProfilsUrls,
    useDashboardUrls,
    useAllApiUrls,
};