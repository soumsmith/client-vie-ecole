/**
 * Service pour la gestion des séances
 * Inspiré de NoteService.js
 */

import { useState } from 'react';
import axios from 'axios';
import getFullUrl from "../../../hooks/urlUtils";

// ===========================
// HOOK POUR LA RECHERCHE DES SÉANCES
// ===========================
export const useSeanceSearch = () => {
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);

    /**
     * Recherche les séances par date et classe
     */
    const searchSeances = async (date, classeId) => {
        if (!date || !classeId) {
            setError({
                message: 'Veuillez sélectionner une date et une classe',
                type: 'ValidationError',
                code: 'MISSING_PARAMS'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);

            const baseUrl = getFullUrl();
            const apiUrl = `${baseUrl}seances/get-distinct-list-date-classe?date=${date}&classe=${classeId}`;
            
            console.log('🔗 URL API séances:', apiUrl);

            const response = await axios.get(apiUrl);
            console.log('📥 Données API séances:', response.data);

            // Transformation des données
            const processedSeances = Array.isArray(response.data) 
                ? response.data.map((item, index) => ({
                    id: `seance-${index}`,
                    classeId: item[0],
                    classeLibelle: item[1],
                    statut: item[2],
                    dateSeance: item[3],
                    raw_data: item
                }))
                : [];

            setSeances(processedSeances);
            setSearchPerformed(true);

        } catch (err) {
            console.error('❌ Erreur recherche séances:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des séances',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setSeances([]);
        setError(null);
        setSearchPerformed(false);
    };

    return {
        seances,
        loading,
        error,
        searchPerformed,
        searchSeances,
        clearResults
    };
};

// ===========================
// HOOK POUR LES DÉTAILS D'UNE SÉANCE
// ===========================
export const useSeanceDetails = () => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Récupère les détails d'une séance
     */
    const fetchSeanceDetails = async (date, classeId, statut) => {
        if (!date || !classeId || !statut) {
            setError({
                message: 'Paramètres manquants pour récupérer les détails',
                type: 'ValidationError'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const baseUrl = getFullUrl();
            const apiUrl = `${baseUrl}seances/get-list-date-classe-statut?date=${date}&classe=${classeId}&statut=${statut}`;
            
            console.log('🔗 URL API détails séance:', apiUrl);

            const response = await axios.get(apiUrl);
            console.log('📥 Détails séance:', response.data);

            // Transformation des données
            const processedDetails = Array.isArray(response.data)
                ? response.data.map((item, index) => ({
                    id: item.id || `detail-${index}`,
                    dateSeance: item.dateSeance,
                    classe: {
                        id: item.classe?.id,
                        libelle: item.classe?.libelle,
                        code: item.classe?.code
                    },
                    matiere: {
                        id: item.matiere?.id,
                        libelle: item.matiere?.libelle,
                        code: item.matiere?.code
                    },
                    typeActivite: {
                        id: item.typeActivite?.id,
                        libelle: item.typeActivite?.libelle,
                        typeSeance: item.typeActivite?.typeSeance
                    },
                    heureDeb: item.heureDeb,
                    heureFin: item.heureFin,
                    salle: {
                        id: item.salle?.id,
                        libelle: item.salle?.libelle,
                        code: item.salle?.code
                    },
                    statut: item.statut,
                    duree: item.duree || 0,
                    jour: item.jour,
                    raw_data: item
                }))
                : [];

            setDetails(processedDetails);

        } catch (err) {
            console.error('❌ Erreur détails séance:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la récupération des détails',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    const clearDetails = () => {
        setDetails([]);
        setError(null);
    };

    return {
        details,
        loading,
        error,
        fetchSeanceDetails,
        clearDetails
    };
};

// ===========================
// HOOK POUR LA GÉNÉRATION DE SÉANCES
// ===========================
export const useSeanceGeneration = () => {
    const [generationResult, setGenerationResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Génère les séances pour une date et classe donnée
     */
    const generateSeances = async (date, classeId, anneeId) => {
        if (!date || !classeId || !anneeId) {
            setError({
                message: 'Paramètres manquants pour générer les séances',
                type: 'ValidationError'
            });
            return null;
        }

        try {
            setLoading(true);
            setError(null);

            const baseUrl = getFullUrl();
            const apiUrl = `${baseUrl}seances/generate-seances?date=${date}&classe=${classeId}&annee=${anneeId}`;
            
            console.log('🔗 URL API génération séances:', apiUrl);

            const response = await axios.get(apiUrl);
            console.log('📥 Résultat génération:', response.data);

            // Transformation du résultat
            const result = {
                success: true,
                messages: Array.isArray(response.data) ? response.data : [response.data],
                timestamp: new Date().toISOString()
            };

            setGenerationResult(result);
            return result;

        } catch (err) {
            console.error('❌ Erreur génération séances:', err);
            const errorResult = {
                success: false,
                message: err.response?.data?.message || err.message || 'Erreur lors de la génération des séances',
                type: err.name || 'GenerationError'
            };
            setError(errorResult);
            return errorResult;
        } finally {
            setLoading(false);
        }
    };

    const clearResult = () => {
        setGenerationResult(null);
        setError(null);
    };

    return {
        generationResult,
        loading,
        error,
        generateSeances,
        clearResult
    };
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Formate une date pour l'affichage
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

/**
 * Retourne une couleur selon le statut
 */
export const getStatutColor = (statut) => {
    const statutUpper = statut?.toUpperCase() || '';
    switch (statutUpper) {
        case 'AUTO':
            return 'blue';
        case 'ACT':
            return 'green';
        case 'ANNULE':
            return 'red';
        case 'REPORTE':
            return 'orange';
        default:
            return 'gray';
    }
};

/**
 * Retourne le libellé du statut
 */
export const getStatutLabel = (statut) => {
    const statutUpper = statut?.toUpperCase() || '';
    switch (statutUpper) {
        case 'AUTO':
            return 'Automatique';
        case 'ACT':
            return 'Actif';
        case 'ANNULE':
            return 'Annulé';
        case 'REPORTE':
            return 'Reporté';
        default:
            return statut || 'Inconnu';
    }
};

/**
 * Formate une plage horaire
 */
export const formatHeureRange = (heureDeb, heureFin) => {
    if (!heureDeb || !heureFin) return '';
    return `${heureDeb} - ${heureFin}`;
};