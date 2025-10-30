/**
 * Hook personnalisé pour récupérer les séances du jour d'un professeur
 * Utilise l'API: /api/seances/get-list-date-prof?date=YYYY-MM-DD&prof=ID
 */

import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import getFullUrl from '../../hooks/urlUtils';

/**
 * Hook pour récupérer les séances d'un professeur pour une date donnée
 * @param {string} professorId - ID du professeur
 * @param {string} date - Date au format YYYY-MM-DD (par défaut: aujourd'hui)
 * @param {number} refreshTrigger - Compteur pour forcer le rafraîchissement
 * @returns {Object} { seances, loading, error, refetch }
 */
export const useSeancesByDateProf = (professorId, date = null, refreshTrigger = 0) => {
    const [seances, setSeances] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Formater la date au format YYYY-MM-DD
    const formatDate = (dateObj) => {
        if (!dateObj) {
            dateObj = new Date();
        }
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchSeances = useCallback(async () => {
        // Ne pas faire l'appel si pas d'ID professeur
        if (!professorId) {
            console.warn('ID professeur manquant pour récupérer les séances');
            setSeances([]);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const dateFormatted = date || formatDate(new Date()); //"2025-10-28"; // date || formatDate(new Date())
            const url = `${getFullUrl()}seances/get-list-date-prof?date=${dateFormatted}&prof=${professorId}`;

            console.log('📅 Récupération des séances:', url);

            const response = await axios.get(url);

            // Traiter et mapper les données de l'API
            const processedSeances = response.data && Array.isArray(response.data)
                ? response.data.map(seance => ({
                    // Identifiants
                    id: seance.id,

                    // Horaires
                    heureDeb: seance.heureDeb,
                    heureFin: seance.heureFin,
                    duree: seance.duree,
                    dureeTotale: seance.dureeTotale,

                    // Date
                    dateSeance: seance.dateSeance,
                    dateSeanceFormatted: seance.dateSeance
                        ? new Date(seance.dateSeance).toLocaleDateString('fr-FR')
                        : 'Non définie',

                    // Matière
                    matiere: {
                        id: seance.matiere?.id,
                        libelle: seance.matiere?.libelle || 'Matière non définie',
                        code: seance.matiere?.code
                    },

                    // Classe
                    classe: {
                        id: seance.classe?.id,
                        libelle: seance.classe?.libelle || 'Classe non définie',
                        code: seance.classe?.code,
                        effectif: seance.classe?.effectif,
                        niveau: seance.classe?.branche?.niveau?.libelle || 'Non défini'
                    },

                    // Salle
                    salle: {
                        id: seance.salle?.id,
                        libelle: seance.salle?.libelle || 'Salle non définie',
                        code: seance.salle?.code
                    },

                    // Professeur
                    professeur: {
                        id: seance.professeur?.id,
                        nom: seance.professeur?.nom || '',
                        prenom: seance.professeur?.prenom || '',
                        nomComplet: `${seance.professeur?.prenom || ''} ${seance.professeur?.nom || ''}`.trim()
                    },

                    // Statut
                    statut: seance.statut,
                    isEnded: seance.isEnded || false,
                    isVerrou: seance.isVerrou || false,
                    isTextBookLocked: seance.isTextBookLocked || false,

                    // Type d'activité
                    typeActivite: {
                        id: seance.typeActivite?.id,
                        libelle: seance.typeActivite?.libelle || 'Cours',
                        typeSeance: seance.typeActivite?.typeSeance
                    },

                    // Évaluation
                    evaluationIndicator: seance.evaluationIndicator,
                    evaluation: seance.evaluation,
                    appelAlreadyExist: seance.appelAlreadyExist || false,

                    // Autres
                    jour: seance.jour,
                    position: seance.position || 0,

                    // Données brutes pour accès complet si nécessaire
                    raw_data: seance
                }))
                : [];

            // Trier par heure de début
            processedSeances.sort((a, b) => {
                const timeA = a.heureDeb.split(':').map(Number);
                const timeB = b.heureDeb.split(':').map(Number);
                return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
            });

            console.log(`✅ ${processedSeances.length} séances récupérées`);
            setSeances(processedSeances);

        } catch (err) {
            console.error('❌ Erreur lors du chargement des séances:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des séances',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN'
            });
            setSeances([]);
        } finally {
            setLoading(false);
        }
    }, [professorId, date, refreshTrigger]);

    useEffect(() => {
        fetchSeances();
    }, [fetchSeances]);

    const forceRefresh = useCallback(() => {
        fetchSeances();
    }, [fetchSeances]);

    return {
        seances,
        loading,
        error,
        refetch: forceRefresh
    };
};

/**
 * Hook pour obtenir les statistiques des séances d'un professeur
 * @param {Array} seances - Liste des séances
 * @returns {Object} Statistiques calculées
 */
export const useSeancesStatistics = (seances) => {
    const [stats, setStats] = useState({
        total: 0,
        terminees: 0,
        enCours: 0,
        aVenir: 0,
        dureeTotal: 0
    });

    useEffect(() => {
        if (!seances || seances.length === 0) {
            setStats({
                total: 0,
                terminees: 0,
                enCours: 0,
                aVenir: 0,
                dureeTotal: 0
            });
            return;
        }

        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();

        const terminees = seances.filter(s => s.isEnded).length;
        const enCours = seances.filter(s => {
            if (s.isEnded) return false;
            const [debH, debM] = s.heureDeb.split(':').map(Number);
            const [finH, finM] = s.heureFin.split(':').map(Number);
            const debMinutes = debH * 60 + debM;
            const finMinutes = finH * 60 + finM;
            return currentTime >= debMinutes && currentTime <= finMinutes;
        }).length;

        const dureeTotal = seances.reduce((sum, s) => sum + (s.duree || 0), 0);

        setStats({
            total: seances.length,
            terminees,
            enCours,
            aVenir: seances.length - terminees - enCours,
            dureeTotal
        });

    }, [seances]);

    return stats;
};

/**
 * Fonction utilitaire pour formater une date en YYYY-MM-DD
 * @param {Date} date - Date à formater
 * @returns {string} Date formatée
 */
export const formatDateForAPI = (date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Fonction utilitaire pour obtenir les dates de la semaine
 * @returns {Array} Tableau des 7 jours de la semaine avec leur date
 */
export const getWeekDates = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    return Array.from({ length: 7 }, (_, i) => {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        return {
            date: date,
            dateFormatted: formatDateForAPI(date),
            dayName: date.toLocaleDateString('fr-FR', { weekday: 'long' }),
            isToday: date.toDateString() === today.toDateString()
        };
    });
};