/**
 * Service pour la gestion des écoles
 * VERSION: 1.1.0 - Version nettoyée et corrigée
 * DESCRIPTION: Service complet pour la gestion des écoles avec API de sélection en cascade
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import getFullUrl from "../../hooks/urlUtils";

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===========================
// UTILITAIRES
// ===========================
const safeStringIncludes = (str, searchTerm) => {
    if (typeof str !== 'string') return false;
    return str.toLowerCase().includes(searchTerm.toLowerCase());
};

const safeArrayMap = (data, mapFn, fallback = []) => {
    if (!Array.isArray(data)) return fallback;
    return data.map(mapFn);
};

// ===========================
// SERVICE API PRINCIPAL
// ===========================
export const ecolesApiService = {
    // ===== APIS DE RÉFÉRENCE =====
    getPays: async () => {
        try {
            const response = await axios.get(`${getFullUrl()}/pays/`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des pays:', error);
            throw error;
        }
    },

    getDirectionsRegionales: async (paysId) => {
        try {
            const response = await axios.get(`${getFullUrl()}/DirectionGenerale/pays/${paysId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des directions régionales:', error);
            throw error;
        }
    },

    getVilles: async (drId) => {
        try {
            const response = await axios.get(`${getFullUrl()}/ville/direction-regionale/${drId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des villes:', error);
            throw error;
        }
    },

    getCommunes: async (villeId) => {
        try {
            const response = await axios.get(`${getFullUrl()}/commune/ville/${villeId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des communes:', error);
            throw error;
        }
    },

    getZones: async (communeId) => {
        try {
            const response = await axios.get(`${getFullUrl()}/zone/commune/${communeId}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des zones:', error);
            throw error;
        }
    },

    getNiveauxEnseignement: async () => {
        try {
            const response = await axios.get(`${getFullUrl()}/niveau-enseignement/list`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des niveaux d\'enseignement:', error);
            throw error;
        }
    },

    // ===== APIS DES ÉCOLES =====
    getEcoles: async () => {
        try {
            const response = await axios.get(`${getFullUrl()}/ecoles/list`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des écoles:', error);
            // Simulation de données pour le développement
            return [
                {
                    id: 1,
                    nomEtablissement: 'Lycée Moderne de Cocody',
                    codeEtablissement: 'LMC001',
                    emailEtablissement: 'contact@lmc.edu.ci',
                    telephoneEtablissement: '+225 01 02 03 04',
                    niveauEnseignement: 'Enseignement Secondaire Générale',
                    pays: 'Côte d\'Ivoire',
                    ville: 'ABIDJAN',
                    commune: 'COCODY',
                    indicationEtablissement: 'Établissement d\'excellence situé au cœur de Cocody'
                },
                {
                    id: 2,
                    nomEtablissement: 'École Primaire de Yopougon',
                    codeEtablissement: 'EPY002',
                    emailEtablissement: 'info@epy.edu.ci',
                    telephoneEtablissement: '+225 05 06 07 08',
                    niveauEnseignement: 'Enseignement Primaire',
                    pays: 'Côte d\'Ivoire',
                    ville: 'ABIDJAN',
                    commune: 'YOPOUGON',
                    indicationEtablissement: 'École primaire moderne avec infrastructures récentes'
                }
            ];
        }
    },

    createEcole: async (ecoleData) => {
        try {
            const response = await axios.post(`${getFullUrl()}/ecoles/create`, ecoleData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'école:', error);
            throw error;
        }
    },

    updateEcole: async (ecoleId, ecoleData) => {
        try {
            const response = await axios.put(`${getFullUrl()}/ecoles/${ecoleId}`, ecoleData, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'école:', error);
            throw error;
        }
    },

    deleteEcole: async (ecoleId) => {
        try {
            const response = await axios.delete(`${getFullUrl()}/ecoles/${ecoleId}`, {
                timeout: 10000
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'école:', error);
            throw error;
        }
    },

    uploadFile: async (file, type) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', type);

            const response = await axios.post(`${getFullUrl()}/ecoles/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 30000
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de l\'upload du fichier:', error);
            throw error;
        }
    }
};

// ===========================
// HOOKS PERSONNALISÉS
// ===========================

/**
 * Hook pour la gestion des données de référence avec cache
 */
export const useReferenceData = () => {
    const [pays, setPays] = useState([]);
    const [niveauxEnseignement, setNiveauxEnseignement] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const loadReferenceData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const cacheKey = 'reference-data-ecoles';
            const cachedData = getFromCache(cacheKey);

            if (cachedData) {
                setPays(cachedData.pays);
                setNiveauxEnseignement(cachedData.niveauxEnseignement);
                setLoading(false);
                return;
            }

            const [paysData, niveauxResponse] = await Promise.all([
                ecolesApiService.getPays(),
                axios.get(apiUrls.niveaux.list())
            ]);

            const processedPays = safeArrayMap(paysData, p => ({
                label: p.payslibelle,
                value: p.paysid,
                data: p
            }));

            // ⭐ CORRECTION: niveauxResponse.data au lieu de niveauxData
            const niveauxData = niveauxResponse.data || [];
            const processedNiveaux = safeArrayMap(niveauxData, n => ({
                label: n.libelle,
                value: n.id,
                data: n
            }));

            const dataToCache = {
                pays: processedPays,
                niveauxEnseignement: processedNiveaux
            };

            setToCache(cacheKey, dataToCache, CACHE_DURATION);
            setPays(processedPays);
            setNiveauxEnseignement(processedNiveaux);

        } catch (err) {
            console.error('Erreur lors du chargement des données de référence:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des données de référence',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls]);

    useEffect(() => {
        loadReferenceData();
    }, [loadReferenceData]);

    return {
        pays,
        niveauxEnseignement,
        loading,
        error,
        refetch: loadReferenceData
    };
};

/**
 * Hook pour la gestion de la sélection en cascade
 */
export const useCascadeSelection = () => {
    const [directionsRegionales, setDirectionsRegionales] = useState([]);
    const [villes, setVilles] = useState([]);
    const [communes, setCommunes] = useState([]);
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(false);

    const loadDirectionsRegionales = useCallback(async (paysId) => {
        if (!paysId) {
            setDirectionsRegionales([]);
            return;
        }

        setLoading(true);
        try {
            const data = await ecolesApiService.getDirectionsRegionales(paysId);
            const processed = safeArrayMap(data, dr => ({
                label: dr.libelle,
                value: dr.id,
                data: dr
            }));
            setDirectionsRegionales(processed);
        } catch (error) {
            console.error('Erreur lors du chargement des directions régionales:', error);
            setDirectionsRegionales([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadVilles = useCallback(async (drId) => {
        if (!drId) {
            setVilles([]);
            return;
        }

        setLoading(true);
        try {
            const data = await ecolesApiService.getVilles(drId);
            const processed = safeArrayMap(data, v => ({
                label: v.villelibelle,
                value: v.villeid,
                data: v
            }));
            setVilles(processed);
        } catch (error) {
            console.error('Erreur lors du chargement des villes:', error);
            setVilles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadCommunes = useCallback(async (villeId) => {
        if (!villeId) {
            setCommunes([]);
            return;
        }

        setLoading(true);
        try {
            const data = await ecolesApiService.getCommunes(villeId);
            const processed = safeArrayMap(data, c => ({
                label: c.communelibelle,
                value: c.communeid,
                data: c
            }));
            setCommunes(processed);
        } catch (error) {
            console.error('Erreur lors du chargement des communes:', error);
            setCommunes([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadZones = useCallback(async (communeId) => {
        if (!communeId) {
            setZones([]);
            return;
        }

        setLoading(true);
        try {
            const data = await ecolesApiService.getZones(communeId);
            const processed = safeArrayMap(data, z => ({
                label: z.zonelibelle,
                value: z.zoneid,
                data: z
            }));
            setZones(processed);
        } catch (error) {
            console.error('Erreur lors du chargement des zones:', error);
            setZones([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const resetCascade = useCallback((level = 'all') => {
        switch (level) {
            case 'directions':
                setDirectionsRegionales([]);
            case 'villes':
                setVilles([]);
            case 'communes':
                setCommunes([]);
            case 'zones':
                setZones([]);
                break;
            case 'all':
            default:
                setDirectionsRegionales([]);
                setVilles([]);
                setCommunes([]);
                setZones([]);
                break;
        }
    }, []);

    return {
        directionsRegionales,
        villes,
        communes,
        zones,
        loading,
        loadDirectionsRegionales,
        loadVilles,
        loadCommunes,
        loadZones,
        resetCascade
    };
};

/**
 * Hook pour la gestion des écoles
 */
export const useEcolesData = (refreshTrigger = 0) => {
    const [ecoles, setEcoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchEcoles = useCallback(async (skipCache = false) => {
        setLoading(true);
        setError(null);

        try {
            const cacheKey = 'liste-ecoles';

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setEcoles(cachedData);
                    setLoading(false);
                    return;
                }
            }

            const data = await ecolesApiService.getEcoles();
            setToCache(cacheKey, data, CACHE_DURATION);
            setEcoles(data);

        } catch (err) {
            console.error('Erreur lors de la récupération des écoles:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des écoles',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEcoles(false);
    }, [refreshTrigger, fetchEcoles]);

    const createEcole = useCallback(async (ecoleData) => {
        try {
            const newEcole = await ecolesApiService.createEcole(ecoleData);
            setEcoles(prev => [...prev, newEcole]);
            setToCache('liste-ecoles', null, 0);
            return newEcole;
        } catch (error) {
            console.error('Erreur lors de la création de l\'école:', error);
            throw error;
        }
    }, []);

    const updateEcole = useCallback(async (ecoleId, ecoleData) => {
        try {
            const updatedEcole = await ecolesApiService.updateEcole(ecoleId, ecoleData);
            setEcoles(prev => prev.map(e => e.id === ecoleId ? updatedEcole : e));
            setToCache('liste-ecoles', null, 0);
            return updatedEcole;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'école:', error);
            throw error;
        }
    }, []);

    const deleteEcole = useCallback(async (ecoleId) => {
        try {
            await ecolesApiService.deleteEcole(ecoleId);
            setEcoles(prev => prev.filter(e => e.id !== ecoleId));
            setToCache('liste-ecoles', null, 0);
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'école:', error);
            throw error;
        }
    }, []);

    return {
        ecoles,
        loading,
        error,
        refetch: () => fetchEcoles(true),
        createEcole,
        updateEcole,
        deleteEcole
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES ÉCOLES
// ===========================

// ⭐ CORRECTION: Fonction getNiveauColor sécurisée
const getNiveauColor = (niveau) => {
    const niveauStr = String(niveau || '').toLowerCase();
    
    if (niveauStr.includes('primaire')) return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
    if (niveauStr.includes('secondaire')) return { bg: '#fffbeb', color: '#d97706', border: '#fed7aa' };
    if (niveauStr.includes('supérieur')) return { bg: '#f5f3ff', color: '#9333ea', border: '#d8b4fe' };
    if (niveauStr.includes('technique')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    if (niveauStr.includes('maternelle')) return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };
    
    return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
};

export const listeEcolesTableConfig = {
    columns: [
        {
            title: 'Code',
            dataKey: 'codeEtablissement',
            flexGrow: 0.5,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const code = typeof rowData.codeEtablissement === 'object' 
                    ? rowData.codeEtablissement?.libelle || rowData.codeEtablissement?.code || 'N/A'
                    : rowData.codeEtablissement || 'N/A';
                
                return (
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: '#f0f9ff',
                        color: '#0369a1',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '600',
                        textAlign: 'center',
                        fontFamily: 'monospace'
                    }}>
                        {String(code)}
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Établissement',
            dataKey: 'nomEtablissement',
            flexGrow: 2.5,
            minWidth: 250,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const nom = typeof rowData.nomEtablissement === 'object'
                    ? rowData.nomEtablissement?.libelle || rowData.nomEtablissement?.nom || 'Nom non renseigné'
                    : rowData.nomEtablissement || 'Nom non renseigné';
                
                const email = typeof rowData.emailEtablissement === 'object'
                    ? rowData.emailEtablissement?.libelle || rowData.emailEtablissement?.email || 'Email non renseigné'
                    : rowData.emailEtablissement || 'Email non renseigné';
                
                return (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc',
                            border: '2px solid #e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            🏫
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{
                                fontWeight: '600',
                                color: '#1e293b',
                                fontSize: '14px',
                                marginBottom: '2px'
                            }}>
                                {String(nom)}
                            </div>
                            <div style={{
                                fontSize: '11px',
                                color: '#64748b'
                            }}>
                                {String(email)}
                            </div>
                        </div>
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Niveau d\'Enseignement',
            dataKey: 'niveauEnseignement',
            flexGrow: 1.5,
            minWidth: 180,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const niveau = typeof rowData.niveauEnseignement === 'object'
                    ? rowData.niveauEnseignement?.libelle || rowData.niveauEnseignement?.nom || 'Non renseigné'
                    : rowData.niveauEnseignement || 'Non renseigné';
                
                const colors = getNiveauColor(niveau);
                return (
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: colors.bg,
                        color: colors.color,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        {String(niveau)}
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Localisation',
            dataKey: 'commune',
            flexGrow: 1.2,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const commune = typeof rowData.commune === 'object'
                    ? rowData.commune?.libelle || rowData.commune?.nom || 'Commune non renseignée'
                    : rowData.commune || 'Commune non renseignée';
                
                const ville = typeof rowData.ville === 'object'
                    ? rowData.ville?.libelle || rowData.ville?.nom || ''
                    : rowData.ville || '';
                
                const pays = typeof rowData.pays === 'object'
                    ? rowData.pays?.libelle || rowData.pays?.nom || ''
                    : rowData.pays || '';
                
                const localisation = [String(ville), String(pays)]
                    .filter(item => item && item !== '')
                    .join(', ') || 'Localisation non renseignée';
                
                return (
                    <div>
                        <div style={{
                            fontWeight: '500',
                            color: '#1e293b',
                            fontSize: '13px',
                            marginBottom: '2px'
                        }}>
                            {String(commune)}
                        </div>
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b'
                        }}>
                            {localisation}
                        </div>
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Contact',
            dataKey: 'telephoneEtablissement',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const telephone = typeof rowData.telephoneEtablissement === 'object'
                    ? rowData.telephoneEtablissement?.libelle || rowData.telephoneEtablissement?.numero || 'Non renseigné'
                    : rowData.telephoneEtablissement || 'Non renseigné';
                
                return (
                    <div style={{
                        fontSize: '12px',
                        color: '#374151',
                        fontFamily: 'monospace'
                    }}>
                        {String(telephone)}
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'niveauEnseignement',
            label: 'Niveau d\'enseignement',
            type: 'select',
            options: [
                { label: 'Primaire', value: 'Primaire' },
                { label: 'Secondaire', value: 'Secondaire' },
                { label: 'Supérieur', value: 'Supérieur' },
                { label: 'Technique', value: 'Technique' },
                { label: 'Maternelle', value: 'Maternelle' }
            ],
            tagColor: 'blue'
        },
        {
            field: 'ville',
            label: 'Ville',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'pays',
            label: 'Pays',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        }
    ],
    searchableFields: [
        'codeEtablissement',
        'nomEtablissement',
        'emailEtablissement',
        'commune',
        'ville',
        'pays'
    ],
    actions: [
        {
            type: 'view',
            icon: '👁️',
            tooltip: 'Voir les détails',
            color: '#3b82f6'
        },
        {
            type: 'edit',
            icon: '✏️',
            tooltip: 'Modifier l\'école',
            color: '#f59e0b'
        },
        {
            type: 'delete',
            icon: '🗑️',
            tooltip: 'Supprimer l\'école',
            color: '#ef4444'
        }
    ],
    defaultSortField: 'nomEtablissement',
    defaultSortOrder: 'asc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};

// ===========================
// UTILITAIRES DE VALIDATION
// ===========================

/**
 * Valide les données d'une école
 */
export const validateEcoleData = (ecoleData) => {
    const errors = {};

    const requiredFields = {
        nomEtablissement: 'Le nom de l\'établissement est requis',
        codeEtablissement: 'Le code établissement est requis',
        emailEtablissement: 'L\'email de l\'établissement est requis',
        telephoneEtablissement: 'Le téléphone de l\'établissement est requis',
        pays: 'Le pays est requis',
        directionRegionale: 'La direction régionale est requise',
        ville: 'La ville est requise',
        commune: 'La commune est requise',
        niveauEnseignement: 'Le niveau d\'enseignement est requis',
        indicationEtablissement: 'L\'indication de l\'établissement est requise'
    };

    // Validation des champs obligatoires
    Object.entries(requiredFields).forEach(([field, message]) => {
        if (!ecoleData[field]?.toString().trim()) {
            errors[field] = message;
        }
    });

    // Validation email
    if (ecoleData.emailEtablissement && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ecoleData.emailEtablissement)) {
        errors.emailEtablissement = 'L\'email n\'est pas valide';
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

/**
 * Formate les données d'école pour l'affichage
 */
export const formatEcoleForDisplay = (ecole, referenceData) => {
    return {
        ...ecole,
        displayName: `${ecole.codeEtablissement || 'N/A'} - ${ecole.nomEtablissement || 'N/A'}`,
        localisation: [ecole.commune, ecole.ville, ecole.pays].filter(Boolean).join(', ') || 'Localisation non renseignée',
        niveauDisplay: referenceData?.niveauxEnseignement?.find(n => n.value === ecole.niveauEnseignement)?.label || ecole.niveauEnseignement || 'Non renseigné'
    };
};