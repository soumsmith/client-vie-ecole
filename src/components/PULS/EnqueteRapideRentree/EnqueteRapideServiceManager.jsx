/**
 * Service pour la gestion des données d'enquête rapide de rentrée
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEdit, FiDownload } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';

/**
 * Hook pour récupérer les données d'enquête rapide (tableau des branches)
 * @param {number} ecoleId 
 * @param {number} anneeId 
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useEnqueteRapideData = (ecoleId = 38, anneeId = 1, refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = `enquete-rapide-data-${ecoleId}-${anneeId}`;
            
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

            const response = await axios.get(apiUrls.enqueteRapide.listeParEcoleAffNaff(ecoleId, anneeId));
            const processedData = response.data && Array.isArray(response.data)
                ? response.data.map((item, index) => ({
                    id: item.idBranche,
                    numero: index + 1,
                    niveau: item.libelleBranche,
                    nombreAffecte: item.nombreAff,
                    nombreNonAffecte: item.nombreNAff,
                    raw_data: item
                }))
                : [];

            setToCache(cacheKey, processedData);
            setData(processedData);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedData.length,
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
    }, [ecoleId, anneeId, refreshTrigger]);

    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        enqueteData: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer l'état des réunions tenues
 * @param {number} ecoleId 
 * @param {number} anneeId 
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useReunionsData = (ecoleId = 38, anneeId = 1, refreshTrigger = 0) => {
    const [reunions, setReunions] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ecoleInfo, setEcoleInfo] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchReunions = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await axios.get(apiUrls.enqueteRapide.listeParEcole(ecoleId, anneeId));
            
            if (response.data) {
                setReunions({
                    personnelAdministratif: response.data.perAdmi || false,
                    conseilInterieur: response.data.conseilInter || false,
                    conseilProfesseurs: response.data.conseilProfesseur || false,
                    professeursPrincipaux: response.data.conseilProfesPrincip || false,
                    conseilEnseignement: response.data.conseilEnseigne || false,
                    professeursClassesExamen: response.data.professClassExame || false,
                    parentsEleves: response.data.parentsEleve || false,
                    chefsClasse: response.data.chefClasse || false,
                    unitesPedagogiques: response.data.unitePedagogi || false
                });
                setEcoleInfo(response.data.ecole);
            }
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des réunions',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReunions();
    }, [ecoleId, anneeId, refreshTrigger]);

    return {
        reunions,
        ecoleInfo,
        loading,
        error,
        refetch: fetchReunions,
        setReunions
    };
};

/**
 * Hook pour récupérer les branches/niveaux pour le modal
 * @param {number} ecoleId
 * @returns {object}
 */
export const useBranchesNiveaux = (ecoleId = 38) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchBranches = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.branches.getByNiveauEnseignement());
            const formattedBranches = (response.data || []).map(branche => ({
                label: `${branche.libelle}`,
                value: branche.id,
                niveau: branche.niveau?.libelle || '',
                serie: branche.serie?.libelle || '',
                raw_data: branche
            }));
            setBranches(formattedBranches);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des branches');
        } finally {
            setLoading(false);
        }
    }, [ecoleId, apiUrls.branches]);

    useEffect(() => {
        fetchBranches();
    }, [fetchBranches]);

    return { branches, loading, error, refetch: fetchBranches };
};

/**
 * Fonction pour sauvegarder les réunions - NOUVELLE API
 * @param {number} ecoleId 
 * @param {number} anneeId 
 * @param {object} reunionsData 
 * @param {object} apiUrls
 */
export const saveReunions = async (ecoleId, anneeId, reunionsData, apiUrls) => {
    try {
        // Nouveau format de données selon l'API
        const apiData = {
            idAnneeScolaire: String(anneeId),
            idEcole: String(ecoleId),
            perAdmi: reunionsData.personnelAdministratif || false,
            conseilInter: reunionsData.conseilInterieur || false,
            conseilProfesseur: reunionsData.conseilProfesseurs || false,
            conseilProfesPrincip: reunionsData.professeursPrincipaux || false,
            vconseilEnseigne: null, // Toujours null selon l'exemple
            professClassExame: reunionsData.professeursClassesExamen || false,
            unitePedagogi: reunionsData.unitesPedagogiques || false,
            parentsEleve: reunionsData.parentsEleves || false,
            chefClasse: reunionsData.chefsClasse || false,
            conseilEnseigne: reunionsData.conseilEnseignement || false
        };

        console.log('Données envoyées à l\'API:', apiData);

        const response = await axios.post(apiUrls.enqueteRapide.reunion(), apiData);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des réunions:', error);
        throw new Error(error.response?.data?.message || 'Erreur lors de la sauvegarde des réunions');
    }
};

/**
 * Fonction pour télécharger le rapport
 * @param {number} ecoleId 
 * @param {number} anneeId 
 * @param {object} apiUrls - URLs des API
 */
export const downloadRapport = async (ecoleId, anneeId, apiUrls) => {
    try {
        console.log('Début du téléchargement du rapport...');
        console.log('URL API:', apiUrls.enqueteRapide.downloadRapport());
        
        const response = await axios.get(apiUrls.enqueteRapide.downloadRapport(), {
            responseType: 'blob',
            timeout: 30000, // Timeout de 30 secondes
        });
        
        console.log('Réponse reçue:', response);
        console.log('Type de contenu:', response.headers['content-type']);
        
        // Vérifier que la réponse contient bien un blob
        if (!response.data || response.data.size === 0) {
            throw new Error('Le fichier téléchargé est vide');
        }
        
        // Déterminer l'extension du fichier selon le type de contenu
        const contentType = response.headers['content-type'] || '';
        let extension = 'pdf';
        let mimeType = 'application/pdf';
        
        if (contentType.includes('excel') || contentType.includes('spreadsheet')) {
            extension = 'xlsx';
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        } else if (contentType.includes('word')) {
            extension = 'docx';
            mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        }
        
        // Créer un blob avec le bon type MIME
        const blob = new Blob([response.data], { type: mimeType });
        
        // Créer un lien de téléchargement
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rapport-enquete-rentree-${ecoleId}-${anneeId}.${extension}`);
        
        // Ajouter le lien au DOM temporairement et cliquer dessus
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('Téléchargement terminé avec succès');
        return true;
        
    } catch (error) {
        console.error('Erreur détaillée lors du téléchargement:', error);
        console.error('Status:', error.response?.status);
        console.error('Headers:', error.response?.headers);
        console.error('Data:', error.response?.data);
        
        let errorMessage = 'Erreur lors du téléchargement du rapport';
        
        if (error.code === 'ECONNABORTED') {
            errorMessage = 'Timeout : Le téléchargement a pris trop de temps';
        } else if (error.response?.status === 404) {
            errorMessage = 'Rapport non trouvé sur le serveur';
        } else if (error.response?.status === 500) {
            errorMessage = 'Erreur interne du serveur';
        } else if (error.response?.data) {
            // Essayer de lire le message d'erreur du serveur
            if (error.response.data instanceof Blob) {
                const text = await error.response.data.text();
                try {
                    const jsonError = JSON.parse(text);
                    errorMessage = jsonError.message || errorMessage;
                } catch (e) {
                    errorMessage = text || errorMessage;
                }
            } else {
                errorMessage = error.response.data.message || errorMessage;
            }
        }
        
        throw new Error(errorMessage);
    }
};

/**
 * Vide le cache des données d'enquête
 */
export const clearEnqueteCache = () => {
    clearCache();
};

// Configuration du tableau pour l'enquête rapide
export const enqueteTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numero',
            flexGrow: 1,
            minWidth: 60,
            sortable: true
        },
        {
            title: 'Niveau',
            dataKey: 'niveau',
            flexGrow: 3,
            minWidth: 200,
            sortable: true
        },
        {
            title: 'Nombre Affecté',
            dataKey: 'nombreAffecte',
            flexGrow: 2,
            minWidth: 150,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <Badge color={value > 0 ? 'green' : 'orange'}>
                        {value || 0}
                    </Badge>
                );
            }
        },
        {
            title: 'Nombre non Affecté',
            dataKey: 'nombreNonAffecte',
            flexGrow: 2,
            minWidth: 180,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <Badge color={value > 0 ? 'red' : 'green'}>
                        {value || 0}
                    </Badge>
                );
            }
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    searchableFields: ['niveau'],
    actions: [
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier les informations',
            color: '#f39c12'
        }
    ]
};