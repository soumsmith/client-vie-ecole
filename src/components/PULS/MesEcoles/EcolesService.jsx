/**
 * Service pour la gestion des écoles - Version améliorée pour modification
 * VERSION: 2.0.0 - Support complet modification avec chargement en cascade
 * DESCRIPTION: Service complet pour la gestion des écoles avec API de sélection en cascade optimisée
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

const safeArrayMap = (data, mapFn, fallback = []) => {
    if (!Array.isArray(data)) return fallback;
    return data.map(mapFn);
};

// ===========================
// SERVICE API PRINCIPAL AMÉLIORÉ
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

    // ===== NOUVELLE FONCTION : CHARGEMENT COMPLET EN CASCADE =====
    /**
     * Charge toutes les données nécessaires pour pré-remplir un formulaire
     * @param {Object} ecoleData - Données de l'école contenant les IDs de localisation
     */
    loadCascadeDataForEdit: async (ecoleData) => {
        try {
            console.log('Chargement en cascade pour:', ecoleData);
            
            const result = {
                pays: [],
                directionsRegionales: [],
                villes: [],
                communes: [],
                zones: []
            };

            // 1. Charger tous les pays
            result.pays = await ecolesApiService.getPays();

            // 2. Si on a un pays, charger les directions régionales
            const paysId = ecoleData.pays?.id || ecoleData.pays?.paysid || ecoleData.pays;
            if (paysId) {
                console.log('Chargement DR pour pays:', paysId);
                result.directionsRegionales = await ecolesApiService.getDirectionsRegionales(paysId);

                // 3. Si on a une direction régionale, charger les villes
                const drId = ecoleData.directionRegionale?.id || ecoleData.myDirection_regionale?.id || ecoleData.directionRegionale;
                if (drId) {
                    console.log('Chargement villes pour DR:', drId);
                    result.villes = await ecolesApiService.getVilles(drId);

                    // 4. Si on a une ville, charger les communes
                    const villeId = ecoleData.ville?.villeid || ecoleData.ville?.id || ecoleData.ville;
                    if (villeId) {
                        console.log('Chargement communes pour ville:', villeId);
                        result.communes = await ecolesApiService.getCommunes(villeId);

                        // 5. Si on a une commune, charger les zones
                        const communeId = ecoleData.commune?.communeid || ecoleData.commune?.id || ecoleData.commune;
                        if (communeId) {
                            console.log('Chargement zones pour commune:', communeId);
                            result.zones = await ecolesApiService.getZones(communeId);
                        }
                    }
                }
            }

            console.log('Données en cascade chargées:', result);
            return result;

        } catch (error) {
            console.error('Erreur lors du chargement en cascade:', error);
            throw error;
        }
    },

    // ===== FONCTION POUR EXTRAIRE LES IDS DEPUIS LES DONNÉES D'ÉCOLE =====
    /**
     * Extrait et normalise les IDs depuis les données d'une école
     * @param {Object} ecoleData - Données brutes de l'école
     */
    extractLocationIds: (ecoleData) => {
        console.log('Extraction des IDs depuis:', ecoleData);

        const result = {
            paysId: null,
            directionRegionaleId: null,
            villeId: null,
            communeId: null,
            zoneId: null
        };

        try {
            // Extraction pays
            if (ecoleData.pays) {
                result.paysId = ecoleData.pays.paysid || ecoleData.pays.id || ecoleData.pays;
            }

            // Extraction direction régionale
            if (ecoleData.directionRegionale) {
                result.directionRegionaleId = ecoleData.directionRegionale.id || ecoleData.directionRegionale;
            } else if (ecoleData.myDirection_regionale) {
                result.directionRegionaleId = ecoleData.myDirection_regionale.id;
            }

            // Extraction ville  
            if (ecoleData.ville) {
                result.villeId = ecoleData.ville.villeid || ecoleData.ville.id || ecoleData.ville;
            } else if (ecoleData.ville_ville) {
                result.villeId = ecoleData.ville_ville.villeid || ecoleData.ville_ville.id;
            }

            // Extraction commune
            if (ecoleData.commune) {
                result.communeId = ecoleData.commune.communeid || ecoleData.commune.id || ecoleData.commune;
            } else if (ecoleData.commune_commune) {
                result.communeId = ecoleData.commune_commune.communeid || ecoleData.commune_commune.id;
            }

            // Extraction zone
            if (ecoleData.zone) {
                result.zoneId = ecoleData.zone.zoneid || ecoleData.zone.id || ecoleData.zone;
            } else if (ecoleData.zone_zone) {
                result.zoneId = ecoleData.zone_zone.zoneid || ecoleData.zone_zone.id;
            }

            console.log('IDs extraits:', result);
            return result;

        } catch (error) {
            console.error('Erreur lors de l\'extraction des IDs:', error);
            return result;
        }
    },

    // ===== APIS DES ÉCOLES (inchangées) =====
    getEcoles: async () => {
        try {
            const response = await axios.get(`${getFullUrl()}/ecoles/list`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des écoles:', error);
            throw error;
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

    updateEcole: async (ecoleData) => {
        try {
            const ecoleId = ecoleData.id;
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
// HOOK PERSONNALISÉ AMÉLIORÉ POUR SÉLECTION EN CASCADE
// ===========================
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

    // ===== NOUVELLE FONCTION : CHARGEMENT COMPLET EN CASCADE =====
    const loadCascadeForEdit = useCallback(async (ecoleData) => {
        setLoading(true);
        try {
            // Extraire les IDs
            const ids = ecolesApiService.extractLocationIds(ecoleData);
            
            // Charger en cascade dans l'ordre
            if (ids.paysId) {
                await loadDirectionsRegionales(ids.paysId);
                
                if (ids.directionRegionaleId) {
                    await loadVilles(ids.directionRegionaleId);
                    
                    if (ids.villeId) {
                        await loadCommunes(ids.villeId);
                        
                        if (ids.communeId) {
                            await loadZones(ids.communeId);
                        }
                    }
                }
            }

            return ids; // Retourner les IDs pour pouvoir les utiliser dans le formulaire

        } catch (error) {
            console.error('Erreur lors du chargement en cascade pour modification:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    }, [loadDirectionsRegionales, loadVilles, loadCommunes, loadZones]);

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
        loadCascadeForEdit, // Nouvelle fonction
        resetCascade
    };
};

// ===========================
// HOOK POUR DONNÉES DE RÉFÉRENCE (amélioré)
// ===========================
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

// ===========================
// UTILITAIRES DE VALIDATION
// ===========================
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

// ===========================
// CONFIGURATION DU TABLEAU DES ÉCOLES
// ===========================

// Fonction pour obtenir les couleurs selon le niveau d'enseignement
const getNiveauColor = (niveau) => {
    const niveauStr = String(niveau || '').toLowerCase();

    if (niveauStr.includes('primaire')) return { bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0' };
    if (niveauStr.includes('secondaire')) return { bg: '#fffbeb', color: '#d97706', border: '#fed7aa' };
    if (niveauStr.includes('supérieur')) return { bg: '#f5f3ff', color: '#9333ea', border: '#d8b4fe' };
    if (niveauStr.includes('technique')) return { bg: '#fef2f2', color: '#dc2626', border: '#fecaca' };
    if (niveauStr.includes('maternelle')) return { bg: '#ecfdf5', color: '#059669', border: '#a7f3d0' };

    return { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' };
};

export const listeEcolesAAjouterTableConfig = {
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
            title: 'Commune',
            dataKey: 'commune',
            flexGrow: 1,
            minWidth: 120,
            customRenderer: (rowData) => {
                const commune = typeof rowData.commune === 'object'
                    ? rowData.commune?.libelle || rowData.commune?.nom || 'Commune non renseignée'
                    : rowData.commune || 'Commune non renseignée';
                return <span>{commune}</span>;
            },
            sortable: true
        },
        {
            title: 'Ville',
            dataKey: 'ville',
            flexGrow: 1,
            minWidth: 120,
            customRenderer: (rowData) => {
                const ville = typeof rowData.ville === 'object'
                    ? rowData.ville?.libelle || rowData.ville?.nom || 'Ville non renseignée'
                    : rowData.ville || 'Ville non renseignée';
                return <span>{ville}</span>;
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
    searchableFields: [
        'codeEtablissement',
        'nomEtablissement',
        'emailEtablissement',
        'commune',
        'ville',
        'pays'
    ]
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
    searchableFields: [
        'codeEtablissement',
        'nomEtablissement',
        'emailEtablissement',
        'commune',
        'ville',
        'pays'
    ]
};