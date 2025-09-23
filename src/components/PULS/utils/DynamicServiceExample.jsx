/**
 * Exemple de service utilisant les paramètres dynamiques
 * Ce fichier montre comment remplacer les valeurs codées en dur
 * par des paramètres dynamiques basés sur les données utilisateur
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { getFromCache, setToCache } from './cacheUtils';
import { useAllApiUrls } from './apiConfig';
import { usePulsParams, useApiParams } from '../../hooks/useDynamicParams';

// ===========================
// HOOK POUR RÉCUPÉRER LES CLASSES AVEC PARAMÈTRES DYNAMIQUES
// ===========================
/**
 * Récupère la liste des classes pour l'école de l'utilisateur connecté
 * @param {number} refreshTrigger - Déclencheur de rafraîchissement
 * @returns {object} - Données des classes
 */
export const useClassesDataDynamic = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    // Récupérer les paramètres dynamiques de l'utilisateur
    const { ecoleId, isAuthenticated, isInitialized } = usePulsParams();

    const fetchClasses = useCallback(async (skipCache = false) => {
        // Vérifier que l'utilisateur est connecté et que les paramètres sont initialisés
        if (!isAuthenticated || !isInitialized) {
            console.log('⏳ En attente de l\'authentification ou de l\'initialisation...');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const cacheKey = `dynamic-classes-data-${ecoleId}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            console.log(`🔄 Récupération des classes pour l'école ${ecoleId}...`);
            
            // Appel API avec l'ID d'école dynamique
            const response = await axios.get(apiUrls.classes.listByEcoleSorted());
            
            // Traitement des données
            const processedClasses = response.data && Array.isArray(response.data)
                ? response.data.map(classe => ({
                    value: classe.id,
                    label: classe.libelle,
                    id: classe.id,
                    niveau: classe.niveau || '',
                    serie: classe.serie || '',
                    raw_data: classe
                }))
                : [];

            setToCache(cacheKey, processedClasses);
            setData(processedClasses);
            
            console.log(`✅ ${processedClasses.length} classes récupérées pour l'école ${ecoleId}`);
        } catch (err) {
            console.error('❌ Erreur lors du chargement des classes:', err.message);
            setError({
                message: err.message || 'Erreur lors du chargement des classes',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [ecoleId, isAuthenticated, isInitialized, apiUrls.classes]);

    useEffect(() => {
        if (isAuthenticated && isInitialized && ecoleId) {
            fetchClasses(false);
        }
    }, [ecoleId, isAuthenticated, isInitialized, refreshTrigger, fetchClasses]);

    return {
        classes: data,
        loading,
        error,
        refetch: () => fetchClasses(true),
        ecoleId, // Retourner l'ID d'école utilisé
        isAuthenticated,
        isInitialized
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES PÉRIODES AVEC PARAMÈTRES DYNAMIQUES
// ===========================
/**
 * Récupère la liste des périodes pour la périodicité de l'utilisateur connecté
 * @param {number} refreshTrigger - Déclencheur de rafraîchissement
 * @returns {object} - Données des périodes
 */
export const usePeriodesDataDynamic = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    // Récupérer les paramètres dynamiques de l'utilisateur
    const { periodiciteId, isAuthenticated, isInitialized } = usePulsParams();

    const fetchPeriodes = useCallback(async (skipCache = false) => {
        // Vérifier que l'utilisateur est connecté et que les paramètres sont initialisés
        if (!isAuthenticated || !isInitialized) {
            console.log('⏳ En attente de l\'authentification ou de l\'initialisation...');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const cacheKey = `dynamic-periodes-data-${periodiciteId}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            console.log(`🔄 Récupération des périodes pour la périodicité ${periodiciteId}...`);
            
            // Appel API avec l'ID de périodicité dynamique
            const response = await axios.get(apiUrls.periodes.listByPeriodicite());
            
            // Traitement des données
            const processedPeriodes = response.data && Array.isArray(response.data)
                ? response.data.map(periode => ({
                    value: periode.id,
                    label: periode.libelle,
                    id: periode.id,
                    libelle: periode.libelle,
                    debut: periode.debut,
                    fin: periode.fin,
                    raw_data: periode
                }))
                : [];

            setToCache(cacheKey, processedPeriodes);
            setData(processedPeriodes);
            
            console.log(`✅ ${processedPeriodes.length} périodes récupérées pour la périodicité ${periodiciteId}`);
        } catch (err) {
            console.error('❌ Erreur lors du chargement des périodes:', err.message);
            setError({
                message: err.message || 'Erreur lors du chargement des périodes',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [periodiciteId, isAuthenticated, isInitialized, apiUrls.periodes]);

    useEffect(() => {
        if (isAuthenticated && isInitialized && periodiciteId) {
            fetchPeriodes(false);
        }
    }, [periodiciteId, isAuthenticated, isInitialized, refreshTrigger, fetchPeriodes]);

    return {
        periodes: data,
        loading,
        error,
        refetch: () => fetchPeriodes(true),
        periodiciteId, // Retourner l'ID de périodicité utilisé
        isAuthenticated,
        isInitialized
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉVALUATIONS AVEC PARAMÈTRES DYNAMIQUES
// ===========================
/**
 * Récupère la liste des évaluations avec tous les paramètres dynamiques
 * @param {number} refreshTrigger - Déclencheur de rafraîchissement
 * @returns {object} - Données des évaluations
 */
export const useEvaluationsDataDynamic = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    // Récupérer tous les paramètres dynamiques nécessaires
    const {
        ecoleId,
        academicYearId,
        periodiciteId,
        userId,
        isAuthenticated,
        isInitialized
    } = usePulsParams();

    const fetchEvaluations = useCallback(async (skipCache = false) => {
        // Vérifier que l'utilisateur est connecté et que les paramètres sont initialisés
        if (!isAuthenticated || !isInitialized) {
            console.log('⏳ En attente de l\'authentification ou de l\'initialisation...');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            const cacheKey = `dynamic-evaluations-data-${ecoleId}-${academicYearId}-${periodiciteId}`;
            
            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            console.log(`🔄 Récupération des évaluations pour l'école ${ecoleId}, année ${academicYearId}, périodicité ${periodiciteId}...`);
            
            // Appel API avec tous les paramètres dynamiques
            const response = await axios.get(apiUrls.evaluations.listByParams(), {
                params: {
                    ecole: ecoleId,
                    annee: academicYearId,
                    periodicite: periodiciteId,
                    userId: userId
                }
            });
            
            // Traitement des données
            const processedEvaluations = response.data && Array.isArray(response.data)
                ? response.data.map(evaluation => ({
                    id: evaluation.id,
                    libelle: evaluation.libelle,
                    date: evaluation.date,
                    duree: evaluation.duree,
                    classe: evaluation.classe,
                    matiere: evaluation.matiere,
                    periode: evaluation.periode,
                    coefficient: evaluation.coefficient,
                    nombreEleves: evaluation.nombreEleves,
                    statut: evaluation.statut,
                    raw_data: evaluation
                }))
                : [];

            setToCache(cacheKey, processedEvaluations);
            setData(processedEvaluations);
            
            console.log(`✅ ${processedEvaluations.length} évaluations récupérées`);
        } catch (err) {
            console.error('❌ Erreur lors du chargement des évaluations:', err.message);
            setError({
                message: err.message || 'Erreur lors du chargement des évaluations',
                type: err.name || 'FetchError',
                code: err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    }, [ecoleId, academicYearId, periodiciteId, userId, isAuthenticated, isInitialized, apiUrls.evaluations]);

    useEffect(() => {
        if (isAuthenticated && isInitialized && ecoleId && academicYearId && periodiciteId) {
            fetchEvaluations(false);
        }
    }, [ecoleId, academicYearId, periodiciteId, userId, isAuthenticated, isInitialized, refreshTrigger, fetchEvaluations]);

    return {
        evaluations: data,
        loading,
        error,
        refetch: () => fetchEvaluations(true),
        // Retourner tous les paramètres utilisés
        params: {
            ecoleId,
            academicYearId,
            periodiciteId,
            userId
        },
        isAuthenticated,
        isInitialized
    };
};

// ===========================
// HOOK POUR GÉNÉRER LES PARAMÈTRES D'API DYNAMIQUES
// ===========================
/**
 * Génère automatiquement les paramètres pour les requêtes API
 * @param {object} options - Options de configuration
 * @returns {object} - Paramètres d'API
 */
export const useApiParamsDynamic = (options = {}) => {
    const {
        includeEcoleId = true,
        includeAcademicYearId = true,
        includePeriodiciteId = true,
        includeUserId = false,
        includeProfileId = false,
        includeEmail = false
    } = options;

    return useApiParams({
        includeEcoleId,
        includeAcademicYearId,
        includePeriodiciteId,
        includeUserId,
        includeProfileId,
        includeEmail
    });
};

// ===========================
// FONCTION UTILITAIRE POUR VALIDER LES PARAMÈTRES
// ===========================
/**
 * Valide que tous les paramètres requis sont disponibles
 * @param {object} params - Paramètres à valider
 * @returns {object} - Résultat de la validation
 */
export const validateDynamicParams = (params) => {
    const requiredParams = ['ecoleId', 'academicYearId', 'periodiciteId'];
    const missingParams = requiredParams.filter(param => !params[param]);
    
    return {
        isValid: missingParams.length === 0,
        missingParams,
        message: missingParams.length > 0 
            ? `Paramètres manquants: ${missingParams.join(', ')}`
            : 'Tous les paramètres requis sont disponibles'
    };
}; 