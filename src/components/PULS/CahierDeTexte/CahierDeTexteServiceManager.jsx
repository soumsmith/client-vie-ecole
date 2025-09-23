/**
 * Service pour la gestion des données des cahiers de texte
 * Inspiré du service d'emploi du temps
 */

import axios from 'axios';
import { useState, useEffect } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import getFullUrl from "../../hooks/urlUtils";

/**
 * Hook pour récupérer la liste des classes pour les cahiers de texte
 */
export const useClassesListData = (refreshTrigger = 0) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();
    const apiUrls = useAllApiUrls();

    const fetchClasses = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `cahier-texte-classes-226`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setClasses(cachedData);
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.get(apiUrls.classes.listByEcoleSorted());

            const processedClasses = response.data && Array.isArray(response.data)
                ? response.data.map(classe => ({
                    id: classe.id,
                    libelle: classe.libelle,
                    code: classe.code,
                    effectif: classe.effectif,
                    visible: classe.visible,
                    branche: classe.branche,
                    ecole: classe.ecole,
                    dateCreation: classe.dateCreation,
                    dateUpdate: classe.dateUpdate,
                    niveau: classe.branche?.niveau?.libelle || 'Non défini',
                    programme: classe.branche?.programme?.libelle || 'Non défini',
                    niveauEnseignement: classe.branche?.niveauEnseignement?.libelle || 'Non défini',
                    ordre: classe.branche?.niveau?.ordre || 999
                }))
                : [];

            // Trier par ordre de niveau
            processedClasses.sort((a, b) => a.ordre - b.ordre);

            setToCache(cacheKey, processedClasses);
            setClasses(processedClasses);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des classes',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses(false);
    }, [dynamicEcoleId, refreshTrigger]);

    const forceRefresh = () => {
        fetchClasses(true);
    };

    return { classes, loading, error, refetch: forceRefresh };
};

/**
 * Hook pour récupérer les matières et professeurs d'une classe
 */
export const useMatieresByClasseData = (classeId, refreshTrigger = 0) => {
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const fetchMatieres = async (skipCache = false) => {
        if (!classeId) {
            setMatieres([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const cacheKey = `cahier-texte-matieres-${classeId}-226`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setMatieres(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Utilisation de l'API fournie
            const response = await axios.get(
                `${getFullUrl()}/api/personnel-matiere-classe/get-enseignant-matiere-classe?annee=226&classe=${classeId}`
            );

            const processedMatieres = response.data && Array.isArray(response.data)
                ? response.data.map(item => ({
                    id: item.id,
                    annee: item.annee,
                    classe: item.classe,
                    matiere: item.matiere,
                    personel: item.personel,
                    // Propriétés calculées pour l'affichage
                    matiereLibelle: item.matiere?.libelle || 'Non définie',
                    professorLibelle: item.personel?.libelle || 'Non défini',
                    raw_data: item
                }))
                : [];

            // Trier par nom de matière
            processedMatieres.sort((a, b) => 
                a.matiereLibelle.localeCompare(b.matiereLibelle)
            );

            setToCache(cacheKey, processedMatieres, 300000); // Cache 5 minutes
            setMatieres(processedMatieres);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des matières',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatieres(false);
    }, [classeId, dynamicEcoleId, refreshTrigger]);

    const forceRefresh = () => {
        fetchMatieres(true);
    };

    return { matieres, loading, error, refetch: forceRefresh };
};

/**
 * Hook pour récupérer les détails d'un cahier de texte
 * Utilise l'API réelle maintenant disponible
 */
export const useCahierDeTexteData = (classeId, matiereId, refreshTrigger = 0) => {
    const [cahierData, setCahierData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const fetchCahierData = async (skipCache = false) => {
        if (!classeId || !matiereId) {
            setCahierData([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const cacheKey = `cahier-texte-detail-${classeId}-${matiereId}-226`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setCahierData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // API maintenant prête
            const response = await axios.get(
                `${getFullUrl()}/api/progression-seance/get-by-classe-matiere-annee?classe=${classeId}&matiere=${matiereId}&annee=226`
            );

            const processedData = response.data && Array.isArray(response.data)
                ? response.data.map(item => ({
                    id: item.seanceId,
                    seanceDto: item.seanceDto,
                    attachmentUrl: item.attachmentUrl,
                    observations: item.observations,
                    duree: item.duree,
                    dureeTotale: item.dureeTotale,
                    position: item.position,
                    detailProgressions: item.detailProgressions || [],
                    fullDetailProgressions: item.fullDetailProgressions || [],
                    
                    // Propriétés calculées pour l'affichage
                    date: item.seanceDto?.date ? new Date(item.seanceDto.date).toLocaleDateString('fr-FR') : 'Non définie',
                    dateComplete: item.seanceDto?.date,
                    horaires: item.seanceDto ? `${item.seanceDto.heureDebut} - ${item.seanceDto.heureFin}` : 'Non défini',
                    classe: item.seanceDto?.classeLibelle || 'Non définie',
                    matiere: item.seanceDto?.matiereLibelle || 'Non définie',
                    professeur: item.seanceDto?.profNomPrenom || 'Non défini',
                    
                    // Leçons abordées formatées
                    lecons: item.fullDetailProgressions?.map(prog => ({
                        titre: prog.titre,
                        numLecon: prog.numLecon,
                        ordre: prog.ordre,
                        periode: prog.periode?.libelle || 'Non définie',
                        dateDeb: prog.dateDeb,
                        dateFin: prog.dateFin,
                        nbreSeance: prog.nbreSeance,
                        heure: prog.heure
                    })) || [],
                    
                    raw_data: item
                }))
                : [];

            // Trier par date décroissante (plus récent en premier)
            processedData.sort((a, b) => 
                new Date(b.dateComplete) - new Date(a.dateComplete)
            );

            setToCache(cacheKey, processedData, 300000); // Cache 5 minutes
            setCahierData(processedData);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement du cahier de texte',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCahierData(false);
    }, [classeId, matiereId, dynamicEcoleId, refreshTrigger]);

    const forceRefresh = () => {
        fetchCahierData(true);
    };

    return { cahierData, loading, error, refetch: forceRefresh };
};

/**
 * Fonction pour verrouiller/déverrouiller un cahier de texte
 * (À implémenter selon les besoins de l'API)
 */
export const toggleCahierVerrouillage = async (classeId, matiereId, statut, apiUrls) => {
    try {
        console.log('=== CHANGEMENT STATUT CAHIER ===');
        console.log('Classe ID:', classeId);
        console.log('Matière ID:', matiereId);
        console.log('Nouveau statut:', statut);
        console.log('================================');

        // TODO: Implémenter l'appel API réel
        // const response = await axios.post(
        //     apiUrls.cahierTexte.toggleVerrouillage(),
        //     {
        //         classeId,
        //         matiereId,
        //         statut
        //     }
        // );

        // Simulation pour le développement
        return { success: true, statut: statut };
    } catch (error) {
        console.error('Erreur lors du changement de statut:', error);
        throw error;
    }
};

/**
 * Fonction pour sauvegarder une séance dans le cahier de texte
 */
export const saveCahierSeance = async (seanceData, apiUrls) => {
    try {
        console.log('=== SAUVEGARDE SEANCE CAHIER ===');
        console.log(JSON.stringify(seanceData, null, 2));
        console.log('===============================');

        // TODO: Implémenter l'appel API réel
        // const response = await axios.post(
        //     apiUrls.cahierTexte.saveSeance(),
        //     seanceData
        // );

        // Simulation pour le développement
        return { 
            success: true, 
            id: Date.now(), 
            message: 'Séance sauvegardée avec succès' 
        };
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        throw error;
    }
};

/**
 * Fonction pour supprimer une séance du cahier de texte
 */
export const deleteCahierSeance = async (seanceId, apiUrls) => {
    try {
        console.log('Suppression de la séance ID:', seanceId);

        // TODO: Implémenter l'appel API réel
        // const response = await axios.delete(
        //     apiUrls.cahierTexte.deleteSeance(seanceId)
        // );

        // Simulation pour le développement
        return { success: true, message: 'Séance supprimée avec succès' };
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        throw error;
    }
};

/**
 * Vider le cache des cahiers de texte
 */
export const clearCahierDeTexteCache = () => {
    // Supprimer tous les caches liés aux cahiers de texte
    const cacheKeys = Object.keys(localStorage).filter(key => 
        key.startsWith('cahier-texte-')
    );
    
    cacheKeys.forEach(key => {
        localStorage.removeItem(key);
    });
};

/**
 * Vider le cache d'une classe spécifique pour les cahiers de texte
 */
export const clearClasseCahierCache = (classeId) => {
    const cacheKeys = Object.keys(localStorage).filter(key => 
        key.includes(`cahier-texte-`) && key.includes(`-${classeId}-`)
    );
    
    cacheKeys.forEach(key => {
        localStorage.removeItem(key);
    });
};

/**
 * Hook pour obtenir les statistiques d'un cahier de texte
 * (Nombre de séances, progression, etc.)
 */
export const useCahierStatistiques = (classeId, matiereId) => {
    const [stats, setStats] = useState({
        totalSeances: 0,
        seancesEffectuees: 0,
        progression: 0,
        derniereMiseAJour: null
    });

    useEffect(() => {
        // TODO: Calculer les vraies statistiques quand l'API sera prête
        // Pour l'instant, valeurs simulées
        setStats({
            totalSeances: 35,
            seancesEffectuees: 12,
            progression: Math.round((12/35) * 100),
            derniereMiseAJour: new Date().toISOString().split('T')[0]
        });
    }, [classeId, matiereId]);

    return stats;
};

// Configuration pour un futur DataTable des séances (si nécessaire)
export const cahierSeancesTableConfig = {
    columns: [
        {
            title: 'Date',
            dataKey: 'date',
            width: 120,
            sortable: true,
            cellRenderer: (value) => (
                <span style={{ fontWeight: '500' }}>
                    {new Date(value).toLocaleDateString('fr-FR')}
                </span>
            )
        },
        {
            title: 'Séance',
            dataKey: 'seance',
            width: 150,
            sortable: true
        },
        {
            title: 'Contenu',
            dataKey: 'contenu',
            flexGrow: 2,
            cellRenderer: (value) => (
                <div style={{ 
                    maxWidth: '300px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {value}
                </div>
            )
        },
        {
            title: 'Devoirs',
            dataKey: 'devoirs',
            flexGrow: 1,
            cellRenderer: (value) => (
                <div style={{ 
                    maxWidth: '200px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}>
                    {value || 'Aucun'}
                </div>
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            width: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['seance', 'contenu', 'devoirs'],
    actions: [
        {
            type: 'view',
            icon: '👁️',
            tooltip: 'Voir les détails',
            color: '#6366f1'
        },
        {
            type: 'edit',
            icon: '✏️',
            tooltip: 'Modifier la séance',
            color: '#f59e0b'
        },
        {
            type: 'delete',
            icon: '🗑️',
            tooltip: 'Supprimer la séance',
            color: '#ef4444'
        }
    ]
};