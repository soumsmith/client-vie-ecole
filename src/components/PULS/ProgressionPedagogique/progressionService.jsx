// progressionService.js
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import getFullUrl from "../../hooks/urlUtils";

// Configuration axios par défaut
const createApiClient = () => {
    const client = axios.create({
        timeout: 10000,
        headers: {
            'Content-Type': 'application/json',
        }
    });

    // Intercepteur pour les erreurs
    client.interceptors.response.use(
        (response) => response,
        (error) => {
            console.error('Erreur API:', error);
            throw error;
        }
    );

    return client;
};

const apiClient = createApiClient();

// ===========================
// SERVICES API
// ===========================

export const progressionApiService = {
    // Récupérer les années scolaires
    async getAnneesScholaires(apiUrls) {
        try {
            const response = await apiClient.get(apiUrls.annees.listToCentral());
            return response.data.map(annee => ({
                label: annee.customLibelle || annee.libelle,
                value: annee.id,
                raw_data: annee
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des années scolaires:', error);
            throw new Error(`Erreur de chargement des années scolaires: ${error.message}`);
        }
    },

    // Récupérer les niveaux d'enseignement
    async getNiveauxEnseignement(apiUrls) {
        try {
            const response = await apiClient.get(apiUrls.niveaux.list());
            return response.data.map(niveau => ({
                label: niveau.libelle,
                value: niveau.id,
                raw_data: niveau
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des niveaux:', error);
            throw new Error(`Erreur de chargement des niveaux: ${error.message}`);
        }
    },

    // Récupérer les données par niveau
    async getDataByNiveau(niveau, apiUrls) {
        if (!niveau) {
            throw new Error('Le niveau est requis');
        }

        try {
            const [matieresRes, branchesRes, anneesRes] = await Promise.all([
                apiClient.get(apiUrls.matieres.getByEcoleViaNiveauEnseignementProgection(niveau)),
                apiClient.get(`${getFullUrl()}branche/get-by-niveau-enseignement-projection?niveau=${niveau}`),
                apiClient.get(`${getFullUrl()}annee/list-to-central-niveau-enseignement-projection?niveau=${niveau}`)
            ]);

            return {
                matieres: matieresRes.data.map(m => ({ label: m.libelle, value: m.id, raw_data: m })),
                branches: branchesRes.data.map(b => ({ label: b.libelle, value: b.id, raw_data: b })),
                annees: anneesRes.data.map(a => ({ label: a.libelle, value: a.id, raw_data: a }))
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des données par niveau:', error);
            throw new Error(`Erreur de chargement des données: ${error.message}`);
        }
    },

    // Récupérer les périodes
    async getPeriodes(apiUrls) {
        try {
            const response = await apiClient.get(apiUrls.periodes.list());
            return response.data.map(periode => ({
                label: periode.libelle,
                value: periode.id,
                raw_data: periode
            }));
        } catch (error) {
            console.error('Erreur lors de la récupération des périodes:', error);
            throw new Error(`Erreur de chargement des périodes: ${error.message}`);
        }
    },

    // Sauvegarder une progression
    async saveProgression(progressionData, apiUrls) {
        try {
            const response = await apiClient.post(apiUrls.progressions.save(), progressionData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            throw new Error(`Erreur de sauvegarde: ${error.message}`);
        }
    },

    // Charger les progressions par année
    async getProgressionsByAnnee(anneeId, apiUrls) {
        try {
            const response = await apiClient.get(apiUrls.progressions.getByAnnee(anneeId));
            return response.data;
        } catch (error) {
            console.error('Erreur lors du chargement des progressions:', error);
            throw new Error(`Erreur de chargement des progressions: ${error.message}`);
        }
    }
};

// ===========================
// UTILITAIRES
// ===========================

export const fileProcessingService = {
    // Traitement des fichiers CSV et Excel
    async processFile(file) {
        if (!file) {
            throw new Error('Aucun fichier fourni');
        }

        try {
            let data = [];
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.csv')) {
                // Import dynamique de Papa Parse
                const Papa = await import('papaparse');
                const text = await file.text();
                const result = Papa.default.parse(text, { 
                    header: true, 
                    skipEmptyLines: true,
                    dynamicTyping: true,
                    transformHeader: (header) => header.trim() // Nettoyer les en-têtes
                });
                
                if (result.errors.length > 0) {
                    console.warn('Erreurs de parsing CSV:', result.errors);
                }
                
                data = result.data;
            } else if (fileName.endsWith('.xls') || fileName.endsWith('.xlsx')) {
                // Import dynamique de XLSX
                const XLSX = await import('xlsx');
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(worksheet);
            } else {
                throw new Error('Format de fichier non supporté. Utilisez CSV, XLS ou XLSX.');
            }

            // Traiter et normaliser les données
            const processedData = data.map((row, index) => ({
                id: index + 1,
                periode: this.normalizeValue(row.Période || row.Periode || row.periode),
                dateDebut: this.normalizeDate(row['Date début'] || row['Date debut'] || row.dateDebut),
                dateFin: this.normalizeDate(row['Date fin'] || row.dateFin),
                semaine: this.normalizeNumber(row.Semaine || row.semaine),
                numeroLecon: this.normalizeNumber(row['Numéro leçon'] || row['Numero lecon'] || row.numeroLecon),
                titreLecon: this.normalizeValue(row['Titre Leçon'] || row['Titre Lecon'] || row.titreLecon),
                heure: this.normalizeNumber(row.heure || row.Heure),
                nbreSeance: this.normalizeNumber(row['Nbre Séance'] || row['Nbre Seance'] || row.nbreSeance)
            }));

            return {
                data: processedData,
                fileName: file.name,
                fileSize: file.size,
                rowCount: processedData.length
            };
        } catch (error) {
            console.error('Erreur lors du traitement du fichier:', error);
            throw new Error(`Impossible de traiter le fichier: ${error.message}`);
        }
    },

    // Utilitaires de normalisation
    normalizeValue(value) {
        return value ? String(value).trim() : '';
    },

    normalizeNumber(value) {
        const num = parseFloat(value);
        return isNaN(num) ? 0 : num;
    },

    normalizeDate(value) {
        if (!value) return '';
        
        try {
            // Essayer de parser la date
            const date = new Date(value);
            if (isNaN(date.getTime())) {
                return String(value).trim();
            }
            return date.toISOString().split('T')[0];
        } catch {
            return String(value).trim();
        }
    }
};

// ===========================
// VALIDATEURS
// ===========================

export const validationService = {
    // Valider les données de progression
    validateProgressionData(data) {
        const errors = [];

        if (!Array.isArray(data) || data.length === 0) {
            errors.push('Aucune donnée à valider');
            return errors;
        }

        data.forEach((row, index) => {
            const rowErrors = [];
            
            if (!row.titreLecon || row.titreLecon.trim() === '') {
                rowErrors.push('Titre de leçon manquant');
            }
            
            if (!row.numeroLecon || row.numeroLecon <= 0) {
                rowErrors.push('Numéro de leçon invalide');
            }
            
            if (!row.heure || row.heure <= 0) {
                rowErrors.push('Nombre d\'heures invalide');
            }

            if (rowErrors.length > 0) {
                errors.push(`Ligne ${index + 1}: ${rowErrors.join(', ')}`);
            }
        });

        return errors;
    },

    // Valider la sélection des paramètres
    validateSelection(selection) {
        const errors = [];
        
        if (!selection.niveau) errors.push('Niveau d\'enseignement requis');
        if (!selection.annee) errors.push('Année scolaire requise');
        if (!selection.branche) errors.push('Branche requise');
        if (!selection.matiere) errors.push('Matière requise');

        return errors;
    }
};

export default progressionApiService;