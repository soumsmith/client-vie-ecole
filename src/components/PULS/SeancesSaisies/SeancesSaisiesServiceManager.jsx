/**
 * Service pour la gestion des données de séances saisies
 * VERSION ADAPTÉE - Hooks utilisés uniquement dans les composants
 */

import axios from 'axios';
import { Badge, Tag } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiClock, FiBook, FiMapPin, FiCalendar, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import { useAllApiUrls } from '../utils/apiConfig';


/**
 * Hook pour récupérer les séances saisies
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useSeancesSaisiesData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    const apiUrls = useAllApiUrls();

    const { 
        ecoleId: dynamicEcoleId, 
        academicYearId: dynamicAcademicYearId,
    } = usePulsParams();

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = `seances-saisies-${dynamicEcoleId}-${dynamicAcademicYearId}`;
            
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    setPerformance({
                        duration: Date.now() - startTime,
                        source: 'cache',
                        itemCount: cachedData.length
                    });
                    return;
                }
            }

            const response = await axios.get(
                apiUrls.seances.getListStatut(dynamicAcademicYearId, 'MAN', dynamicEcoleId)
            );
            
            // Transformation du retour API en array si c'est un objet unique
            const rawData = Array.isArray(response.data) ? response.data : [response.data];
            
            const processedSeances = rawData.map(seance => {
                // Fonction helper pour nettoyer les dates de l'API
                const cleanDate = (dateString) => {
                    if (!dateString) return null;
                    // Nettoyer le format avec [UTC] si présent
                    if (typeof dateString === 'string' && dateString.includes('[UTC]')) {
                        return dateString.replace('[UTC]', '');
                    }
                    return dateString;
                };

                const cleanedDate = cleanDate(seance.dateSeance);
                
                return {
                    id: seance.id,
                    classe: seance.classe?.libelle || 'Non définie',
                    classeId: seance.classe?.id,
                    dateSeance: cleanedDate, // Date nettoyée pour le traitement
                    dateSeanceFormatted: cleanedDate ? new Date(cleanedDate).toLocaleDateString('fr-FR') : 'Non définie',
                    jour: seance.jour?.libelle || 'Non défini',
                    jourCode: seance.jour?.code,
                    jourId: seance.jour?.id,
                    heureDeb: seance.heureDeb,
                    heureFin: seance.heureFin,
                    matiere: seance.matiere?.libelle || 'Non définie',
                    matiereId: seance.matiere?.id,
                    professeur: `${seance.professeur?.prenom || ''} ${seance.professeur?.nom || ''}`.trim() || 'Non assigné',
                    professeurId: seance.professeur?.id,
                    salle: seance.salle?.libelle || 'Non définie',
                    salleId: seance.salle?.id,
                    typeActivite: seance.typeActivite?.libelle || 'Non défini',
                    typeActiviteId: seance.typeActivite?.id,
                    statut: seance.statut,
                    duree: seance.duree || 0,
                    dureeTotale: seance.dureeTotale || 0,
                    evaluationIndicator: seance.evaluationIndicator || 0,
                    annee: seance.annee,
                    user: seance.user,
                    creneauHoraire: `${seance.heureDeb} - ${seance.heureFin}`,
                    raw_data: seance
                };
            });

            setToCache(cacheKey, processedSeances);
            setData(processedSeances);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedSeances.length,
                dataSize: JSON.stringify(response.data).length
            });
        } catch (err) {
            setError({
                message: err.message || 'Erreur inconnue',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(false);
    }, [dynamicEcoleId, dynamicAcademicYearId, refreshTrigger]);

    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        seancesSaisies: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer les professeurs par classe
 */
export const useProfesseursByClasse = (classeId) => {
    const [professeurs, setProfesseurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const { academicYearId: dynamicAcademicYearId } = usePulsParams();

    const fetchProfesseurs = async () => {
        if (!classeId) {
            setProfesseurs([]);
            return;
        }

        try {
            setLoading(true);
            const response = await axios.get(
                apiUrls.affectations.getProfesseurByClasse(classeId, dynamicAcademicYearId)
            );
            setProfesseurs(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfesseurs();
    }, [classeId, dynamicAcademicYearId]);

    return { professeurs, loading, error, refetch: fetchProfesseurs };
};

/**
 * Hook pour récupérer les surveillants
 */
export const useSurveillantsData = () => {
    const [surveillants, setSurvaillants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const fetchSurvaillants = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                apiUrls.personnel.getByFonction(1, dynamicEcoleId)
            );
            setSurvaillants(response.data || []);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSurvaillants();
    }, [dynamicEcoleId]);

    return { surveillants, loading, error, refetch: fetchSurvaillants };
};

/**
 * Vérifier la disponibilité d'un créneau pour les séances
 * Utilise l'API spécifique aux séances avec le paramètre date
 *
 * @example
 * // Utilisation avec apiUrls (recommandé dans les composants React)
 * const apiUrls = useAllApiUrls();
 * const result = await checkCreneauDisponibiliteSeance(226, 1, 'LUNDI', '08:00', '10:00', '2024-01-15', apiUrls);
 *
 * // Utilisation sans apiUrls (fallback)
 * const result = await checkCreneauDisponibiliteSeance(226, 1, 'LUNDI', '08:00', '10:00', '2024-01-15');
 */
export const checkCreneauDisponibiliteSeance = async (academicYearId, classe, jour, heureDeb, heureFin, dateSeance = null, apiUrls = null) => {
    console.log('=== VÉRIFICATION CRÉNEAU SÉANCE ===');
    console.log('academicYearId:', academicYearId);
    console.log('classe:', classe);
    console.log('jour:', jour);
    console.log('heureDeb:', heureDeb);
    console.log('heureFin:', heureFin);
    console.log('dateSeance:', dateSeance);
    console.log('==================================');

    try {
        // Formater la date au format YYYY-MM-DD
        let formattedDate = '';
        if (dateSeance) {
            if (dateSeance instanceof Date) {
                formattedDate = dateSeance.toISOString().split('T')[0];
            } else {
                formattedDate = dateSeance;
            }
        }

        let url;
        if (apiUrls && apiUrls.seances) {
            const params = {
                annee: academicYearId,
                classe: classe,
                jour: jour,
                date: formattedDate,
                heureDeb: heureDeb,
                heureFin: heureFin
            };
            url = apiUrls.seances.getSallesDispoHeures(params);
        } else {
            url = apiUrls.emploiDuTemps.getSallesDisponibles(academicYearId, classe, jour, formattedDate, heureDeb, heureFin);
        }
        console.log('URL de vérification séance:', url);

        const response = await axios.get(url);
        console.log('Réponse vérification séance:', response.data);
        
        // Si on a des salles disponibles, c'est que le créneau est disponible
        const sallesDisponibles = response.data || [];
        const disponible = sallesDisponibles.length > 0;
        
        console.log('Nombre de salles disponibles:', sallesDisponibles.length);
        console.log('Créneau disponible:', disponible);
        
        return {
            disponible,
            salles: sallesDisponibles
        };
    } catch (error) {
        console.error('Erreur lors de la vérification du créneau séance:', error);
        
        if (error.response) {
            console.error('Statut de l\'erreur:', error.response.status);
            console.error('Données de l\'erreur:', error.response.data);
        }
        
        return {
            disponible: false,
            salles: []
        };
    }
};

/**
 * Sauvegarder une séance
 */
export const saveSeance = async (seanceData, apiUrls = null) => {
    try {
        console.log('=== DONNÉES SÉANCE À SAUVEGARDER ===');
        console.log(JSON.stringify(seanceData, null, 2));
        console.log('===================================');
        
        const url = apiUrls.seances.saveAndDisplay();

        const response = await axios.post(
            url,
            seanceData,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                timeout: 10000
            }
        );
        
        console.log('Réponse de sauvegarde séance:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde séance:', error);
        
        if (error.response) {
            console.error('Statut d\'erreur sauvegarde séance:', error.response.status);
            console.error('Données d\'erreur sauvegarde séance:', error.response.data);
        }
        
        throw error;
    }
};

/**
 * Supprimer une séance
 */
export const deleteSeance = async (seanceId, apiUrls = null) => {
    try {
        console.log('Suppression de la séance ID:', seanceId);
        
        const url = apiUrls.seances.delete(seanceId);

        const response = await axios.delete(
            url,
            {
                timeout: 10000
            }
        );
        
        console.log('Réponse de suppression séance:', response.data);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression séance:', error);
        throw error;
    }
};

/**
 * Vide le cache des séances saisies
 */
export const clearSeancesSaisiesCache = () => {
    clearCache();
};

// Import des hooks existants de l'emploi du temps
export { 
    useClassesData, 
    useJoursData, 
    useTypesActiviteData, 
    useMatieresByClasse
} from '../Emploi_du_temps/EmploiDuTempsServiceManager';

// Configuration du tableau pour les séances saisies
export const seancesSaisiesTableConfig = {
    columns: [
        {
            title: 'Date',
            dataKey: 'dateSeance',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => {
                if (!value) return 'Non définie';
                
                try {
                    // Nettoyer le format de date de l'API qui peut avoir [UTC] à la fin
                    let cleanDateString = value;
                    if (typeof value === 'string' && value.includes('[UTC]')) {
                        cleanDateString = value.replace('[UTC]', '');
                    }
                    
                    const date = new Date(cleanDateString);
                    
                    // Vérifier si la date est valide
                    if (isNaN(date.getTime())) {
                        console.warn('Date invalide:', value);
                        return 'Date invalide';
                    }
                    
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiCalendar size={14} style={{ color: '#6366f1' }} />
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>
                                {date.toLocaleDateString('fr-FR')}
                            </span>
                        </div>
                    );
                } catch (error) {
                    console.error('Erreur format date:', error, value);
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiCalendar size={14} style={{ color: '#ef4444' }} />
                            <span style={{ fontSize: '13px', color: '#ef4444' }}>
                                Erreur date
                            </span>
                        </div>
                    );
                }
            }
        },
        {
            title: 'Classe',
            dataKey: 'classe',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiBook size={16} style={{ color: '#6366f1' }} />
                    <span style={{ fontWeight: '600' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Type',
            dataKey: 'typeActivite',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellRenderer: (value) => {
                const typeConfig = {
                    'Cours': { color: 'green' },
                    'Devoir': { color: 'red' },
                    'Évaluation': { color: 'orange' }
                };
                
                const config = typeConfig[value] || { color: 'blue' };
                
                return (
                    <Tag 
                        color={config.color} 
                        size="md"
                    >
                        {value}
                    </Tag>
                );
            }
        },
        {
            title: 'Heure début',
            dataKey: 'heureDeb',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Heure Fin',
            dataKey: 'heureFin',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiClock size={14} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '13px', fontWeight: '500' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Matière',
            dataKey: 'matiere',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => (
                <Tag 
                    color="blue" 
                    size="md"
                    style={{ 
                        backgroundColor: '#f0f9ff',
                        color: '#1e40af',
                        border: '1px solid #bfdbfe'
                    }}
                >
                    {value}
                </Tag>
            )
        },
        {
            title: 'Professeur',
            dataKey: 'professeur',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiUser size={14} style={{ color: '#8b5cf6' }} />
                    <span style={{ fontSize: '13px' }}>{value}</span>
                </div>
            )
        },
        {
            title: 'Surveillant',
            dataKey: 'surveillant',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FiUser size={14} style={{ color: '#ef4444' }} />
                    <span style={{ fontSize: '13px' }}>{value || 'Non assigné'}</span>
                </div>
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['classe', 'matiere', 'professeur', 'typeActivite'],
    filterConfigs: [
        {
            key: 'typeActivite',
            label: 'Type d\'activité',
            type: 'select',
            options: [
                { label: 'Cours', value: 'Cours' },
                { label: 'Devoir', value: 'Devoir' },
                { label: 'Évaluation', value: 'Évaluation' }
            ],
            placeholder: 'Filtrer par type'
        },
        {
            key: 'classe',
            label: 'Classe',
            type: 'select',
            options: [], // Will be populated dynamically
            placeholder: 'Filtrer par classe'
        }
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#6366f1'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier la séance',
            color: '#f59e0b'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer la séance',
            color: '#ef4444'
        }
    ]
};