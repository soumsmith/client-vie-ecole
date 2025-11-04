/**
 * Service pour la gestion des données de rapports
 * VERSION COMPLÈTE avec toutes les fonctions par code
 */

import React from 'react';
import axios from 'axios';
import { Badge } from 'rsuite';
import { FiFileText } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { useAllApiUrls } from '../utils/apiConfig';
import getFullUrl from "../../hooks/urlUtils";
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';


/**
 * Hook pour récupérer la liste des classes
 */
export const useClassesData = (refreshTrigger = 0) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchClasses = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `classes-rapport-ecoleId`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setClasses(cachedData);
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.get(apiUrls.classes.listPopulateByEcole());
            const formattedClasses = (response.data || []).map(classe => ({
                label: `${classe.libelle} (${classe.code})`,
                value: classe.id,
                libelle: classe.libelle,
                code: classe.code,
                branche: classe.branche?.libelle || '',
                effectif: classe.effectif || 0,
                raw_data: classe
            }));

            setToCache(cacheKey, formattedClasses);
            setClasses(formattedClasses);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des classes',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClasses(false);
    }, [refreshTrigger]);

    return {
        classes,
        loading,
        error,
        refetch: () => fetchClasses(true)
    };
};

/**
 * Hook pour récupérer la liste des périodes
 */
export const usePeriodesData = (refreshTrigger = 0) => {
    const [periodes, setPeriodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchPeriodes = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = 'periodes-data';

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setPeriodes(cachedData);
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.get(`${getFullUrl()}periodes/list`);
            const formattedPeriodes = (response.data || []).map(periode => ({
                label: periode.libelle,
                value: periode.id,
                libelle: periode.libelle,
                niveau: periode.niveau,
                coef: periode.coef,
                raw_data: periode
            }));

            setToCache(cacheKey, formattedPeriodes);
            setPeriodes(formattedPeriodes);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des périodes',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPeriodes(false);
    }, [refreshTrigger]);

    return {
        periodes,
        loading,
        error,
        refetch: () => fetchPeriodes(true)
    };
};

/**
 * Hook pour récupérer la liste des années scolaires
 */
export const useAnneesData = (refreshTrigger = 0) => {
    const [annees, setAnnees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();


    const fetchAnnees = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `annees-139`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setAnnees(cachedData);
                    setLoading(false);
                    return;
                }
            }
            const response = await axios.get(apiUrls.annees.listOpenedOrClosedToEcoleId());
            console.log('Réponse des années scolaires:', response.data);

            const formattedAnnees = (response.data || []).map(annee => ({
                label: annee.customLibelle || annee.libelle,
                value: annee.id,
                libelle: annee.customLibelle || annee.libelle,
                statut: annee.statut,
                anneeDebut: annee.anneeDebut,
                anneeFin: annee.anneeFin,
                raw_data: annee
            }));

            setToCache(cacheKey, formattedAnnees);
            setAnnees(formattedAnnees);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des années',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnees(false);
    }, [refreshTrigger]);

    return {
        annees,
        loading,
        error,
        refetch: () => fetchAnnees(true)
    };
};

/**
 * Hook pour récupérer la liste des niveaux
 */
export const useNiveauxData = (refreshTrigger = 0) => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchNiveaux = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(apiUrls.branches.getByNiveauEnseignement());

            const formattedNiveaux = (response.data || []).map(niveau => ({
                label: `${niveau.niveau?.libelle || niveau.libelle} - ${niveau.serie?.libelle || ''}`,
                value: niveau.id,
                libelle: niveau.niveau?.libelle || niveau.libelle,
                serie: niveau.serie?.libelle || '',
                programme: niveau.programme?.libelle || '',
                raw_data: niveau
            }));

            setNiveaux(formattedNiveaux);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des niveaux',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNiveaux(false);
    }, [refreshTrigger]);

    return {
        niveaux,
        loading,
        error,
        refetch: () => fetchNiveaux(true)
    };
};

/**
 * Hook pour récupérer la liste des branches
 */
export const useBranchesData = (refreshTrigger = 0) => {
    const [branches, setBranches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchBranches = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(apiUrls.branches.getByNiveauEnseignement());
            const formattedBranches = (response.data || []).map(branche => ({
                label: branche.libelle,
                value: branche.id,
                libelle: branche.libelle,
                raw_data: branche
            }));

            setBranches(formattedBranches);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des branches',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranches(false);
    }, [refreshTrigger]);

    return {
        branches,
        loading,
        error,
        refetch: () => fetchBranches(true)
    };
};

/**
 * Hook pour récupérer la liste des matières par classe
 */
export const useMatieresData = (classeId = null, refreshTrigger = 0) => {
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchMatieres = async (skipCache = false) => {
        if (!classeId) {
            setMatieres([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(apiUrls.matieres.imprimerMatriceClasse(classeId));
            const formattedMatieres = (response.data || []).map(matiere => ({
                label: matiere.libelle,
                value: matiere.id,
                libelle: matiere.libelle,
                raw_data: matiere
            }));

            setMatieres(formattedMatieres);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des matières',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatieres(false);
    }, [classeId, refreshTrigger]);

    return {
        matieres,
        loading,
        error,
        refetch: () => fetchMatieres(true)
    };
};

/**
 * Hook pour récupérer la liste des rapports
 */
export const useRapportsData = (niveauEnseignementId = 2, refreshTrigger = 0) => {
    const [rapports, setRapports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchRapports = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `rapports-${niveauEnseignementId}`;

            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setRapports(cachedData);
                    setLoading(false);
                    return;
                }
            }

            const response = await axios.get(`${getFullUrl()}rapports/${niveauEnseignementId}`);
            const formattedRapports = Array.isArray(response.data) ? response.data : [response.data];

            setToCache(cacheKey, formattedRapports);
            setRapports(formattedRapports);
        } catch (err) {
            setError({
                message: err.message || 'Erreur lors du chargement des rapports',
                type: err.name || 'FetchError'
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRapports(false);
    }, [niveauEnseignementId, refreshTrigger]);

    return {
        rapports,
        loading,
        error,
        refetch: () => fetchRapports(true)
    };
};

/**
 * Configuration des modèles DRENA
 */
export const drenaModels = [
    { key: 'DREN_AGOVILLE', label: 'DREN AGBOVILLE', value: 'Agboville' },
    { key: 'DREN_BOUAKE', label: 'DREN BOUAKE', value: 'Bouake' },
    { key: 'DREN_DALOA', label: 'DREN DALOA', value: 'Daloa' },
    { key: 'DREN_ODIENNE', label: 'DREN ODIENNE', value: 'Odienne' },
    { key: 'DREN_SEGUELA', label: 'DREN SEGUELA', value: 'Seguela' },
    { key: 'DREN_YAMOUSSOUKRO', label: 'DREN YAMOUSSOUKRO', value: 'Yamoussoukro' },
    { key: 'DREN_1', label: 'DREN 1', value: 'dren1' },
    { key: 'DREN_2', label: 'DREN 2', value: 'dren2' },
    { key: 'DREN_3', label: 'DREN 3', value: 'dren3' },
    { key: 'DREN_4', label: 'DREN 4', value: 'dren4' }
];

/**
 * Options pour les paramètres des élèves
 */
export const sexeOptions = [
    { label: 'Masculin', value: 'MASCULIN' },
    { label: 'Féminin', value: 'FEMININ' },
    { label: 'Tous', value: 'ALL' }
];

export const redoublantOptions = [
    { label: 'Oui', value: 'OUI' },
    { label: 'Non', value: 'NON' },
    { label: 'Tous', value: 'ALL' }
];

export const boursierOptions = [
    { label: 'Boursier', value: 'B' },
    { label: 'Demi-boursier', value: '1/2B' },
    { label: 'Tous', value: 'ALL' }
];

export const langueVivanteOptions = [
    { label: 'Anglais', value: 'EN' },
    { label: 'Allemand', value: 'DE' },
    { label: 'Espagnol', value: 'ESP' },
    { label: 'Arabe', value: 'AR' },
    { label: 'Toutes', value: 'ALL' }
];

export const statutOptions = [
    { label: 'Affecté', value: 'AFFECTE' },
    { label: 'Non affecté', value: 'NON_AFFECTE' },
    { label: 'Tous', value: 'ALL' }
];

/**
 * Fonctions de génération par code de rapport
 */
const rapportFunctions = {
    R01: async (params) => {
        const {
            ecoleId,
            periode,
            annee,
            classe,
            niveauEnseignementId,
            decompresserBulletin,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            utiliserModeleSecondaire,
            activerDistinctions,
            utiliserModeleBTS,
            testLourd,
            utiliserModeleSuperieurBTS,
            formatEcoleArabe  // ✅ AJOUTÉ
        } = params;

        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R01 - Paramètres:', {
            ecoleId,
            periode,
            annee,
            classe,
            niveauEnseignementId,
            periodeLabel,
            anneeLabel,
            decompresserBulletin,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            utiliserModeleSecondaire,
            activerDistinctions,
            utiliserModeleBTS,
            testLourd,
            utiliserModeleSuperieurBTS,
            formatEcoleArabe  // ✅ AJOUTÉ
        });
        const url = `${getFullUrl()}imprimer-bulletin-list/spider-bulletin/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}/${decompresserBulletin}/${niveauEnseignementId}/${changerPositionLogo}/${!supprimerFiligramme}/${changerPositionRepublique}/${pivoterPhotosVersLaDroite}/${utiliserModeleSecondaire}/${activerDistinctions}/${utiliserModeleBTS}/${testLourd}/${utiliserModeleSuperieurBTS}/${formatEcoleArabe}`;

        return downloadFile(url, `Bulletin_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R02: async (params) => {
        const {
            ecoleId,
            periode,
            annee,
            classe,
            matriculeEleves,
            niveauEnseignementId,
            decompresserBulletin,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            utiliserModeleSecondaire,
            activerDistinctions,
            utiliserModeleBTS,
            testLourd,
            utiliserModeleSuperieurBTS,
            formatEcoleArabe  // ✅ AJOUTÉ
        } = params;

        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R02 - Paramètres:', {
            ecoleId,
            periode,
            annee,
            classe,
            matriculeEleves,
            niveauEnseignementId,
            periodeLabel,
            anneeLabel,
            decompresserBulletin,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            utiliserModeleSecondaire,
            activerDistinctions,
            utiliserModeleBTS,
            testLourd,
            utiliserModeleSuperieurBTS,
            formatEcoleArabe  // ✅ AJOUTÉ
        });

        // Construction de l'URL avec les vrais paramètres du formulaire
        const url = `${getFullUrl()}imprimer-bulletin-list/spider-bulletin-matricule/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}/${matriculeEleves}/${decompresserBulletin}/${niveauEnseignementId}/${changerPositionLogo}/${!supprimerFiligramme}/${changerPositionRepublique}/${pivoterPhotosVersLaDroite}/${utiliserModeleSecondaire}/${activerDistinctions}/${utiliserModeleBTS}/${testLourd}/${utiliserModeleSuperieurBTS}/${formatEcoleArabe}`;

        return downloadFile(url, `Bulletin_${matriculeEleves}_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R03: async (params) => {
        const { ecoleId, periode, annee } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R03 - Paramètres:', { ecoleId, periodeLabel, anneeLabel });

        const url = `${getFullUrl()}imprimer-rapport-dsps/pouls-rapport-dsps/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}`;

        return downloadFile(url, `fichier_dspd_${periodeLabel.replace(/\s+/g, '_')}.xls`);
    },

    R04: async (params) => {
        const { ecoleId, periode, annee } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R04 - Paramètres:', { ecoleId, periodeLabel, anneeLabel });

        const url = `${getFullUrl()}imprimer-rapport-cio/pouls-rapport-cio/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}`;

        return downloadFile(url, `rapport_cio_trimestrielle_${periodeLabel.replace(/\s+/g, '_')}.xls`);
    },

    R05: async (params) => {
        const { ecoleId, periode, annee, modeleDrena } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R05 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, modeleDrena });

        const url = `${getFullUrl()}imprimer-rapport/pouls-rapport/${ecoleId}/docx/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${annee}/${modeleDrena}`;

        return downloadFile(url, `rapport_trimestrielle_${periodeLabel.replace(/\s+/g, '_')}.docx`);
    },

    R06: async (params) => {
        const { ecoleId, annee } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R06 - Paramètres:', { ecoleId, anneeLabel });

        const url = `${getFullUrl()}imprimer-rapport-annuelle/pouls-rapport/${ecoleId}/docx/${encodeURIComponent(anneeLabel)}/Troisième Trimestre`;

        return downloadFile(url, `rapport_annuelle.docx`);
    },

    R07: async (params) => {
        const {
            ecoleId,
            periode,
            annee,
            classe,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            activerDistinctions
        } = params;

        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const classeLabel = getClasseLabel(classe, params.classes);

        console.log('🔄 R07 - Paramètres:', {
            ecoleId,
            periodeLabel,
            anneeLabel,
            classeLabel,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            activerDistinctions
        });

        // Construction de l'URL avec les vrais paramètres du formulaire
        const url = `${getFullUrl()}imprimer-livret-list/spider-livret/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(classeLabel)}/${changerPositionLogo}/${!supprimerFiligramme}/${changerPositionRepublique}/${pivoterPhotosVersLaDroite}/${activerDistinctions}`;

        return downloadFile(url, `Livret_Scolaire_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R08: async (params) => {
        const {
            ecoleId,
            periode,
            annee,
            classe,
            matriculeEleves,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            activerDistinctions
        } = params;

        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const classeLabel = getClasseLabel(classe, params.classes);

        console.log('🔄 R08 - Paramètres:', {
            ecoleId,
            periodeLabel,
            anneeLabel,
            classeLabel,
            matriculeEleves,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            activerDistinctions
        });

        // Construction de l'URL avec les vrais paramètres du formulaire
        const url = `${getFullUrl()}imprimer-livret-list/spider-livret-matricule/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(classeLabel)}/${matriculeEleves}/${changerPositionLogo}/${!supprimerFiligramme}/${changerPositionRepublique}/${pivoterPhotosVersLaDroite}/${activerDistinctions}`;

        return downloadFile(url, `Livret_Scolaire_${matriculeEleves}_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R09: async (params) => {
        const { ecoleId, annee, formatExcel } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R09 - Paramètres:', { ecoleId, annee, anneeLabel, formatExcel });

        const format = formatExcel ? '/xls' : '';
        const extension = formatExcel ? 'xls' : 'docx';
        const url = `${getFullUrl()}imprimer-rapport-rentree-spider${format}/${ecoleId}/${annee}/${encodeURIComponent(anneeLabel)}`;

        return downloadFile(url, `Rapport_de_rentree.${extension}`);
    },

    R10: async (params) => {
        const { ecoleId, annee, classe } = params;
        const classeLabel = getClasseLabel(classe, params.classes);

        console.log('🔄 R10 - Paramètres:', { ecoleId, annee, classe, classeLabel });

        const url = `${getFullUrl()}emploi-du-temps/imprimer/${ecoleId}/${annee}/${classe}`;

        return downloadFile(url, `Emploi_du_temps_${classeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R11: async (params) => {
        const { ecoleId, periode, annee } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R11 - Paramètres:', { ecoleId, periodeLabel, anneeLabel });

        const url = `${getFullUrl()}imprimer-major-list/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}`;

        return downloadFile(url, `Liste_majors_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R12: async (params) => {
        const { ecoleId, formatExcel } = params;

        console.log('🔄 R12 - Paramètres:', { ecoleId, formatExcel });

        const format = formatExcel ? '-xls' : '';
        const extension = formatExcel ? 'xls' : 'pdf';
        const url = `${getFullUrl()}imprimer-perspnnel/personnel-administratif${format}/${ecoleId}`;

        return downloadFile(url, `personnel_administratif.${extension}`);
    },

    R13: async (params) => {
        const { ecoleId, annee, formatExcel } = params;

        console.log('🔄 R13 - Paramètres:', { ecoleId, annee, formatExcel });

        const format = formatExcel ? '-xls' : '';
        const extension = formatExcel ? 'xls' : 'pdf';
        const url = `${getFullUrl()}imprimer-perspnnel/personnel-enseignant${format}/${annee}/${ecoleId}`;

        return downloadFile(url, `personnel_enseignant.${extension}`);
    },

    R14: async (params) => {
        console.log('🔄 R14 - Liste des élèves');
        return await generateListeEleves(params, false);
    },

    R15: async (params) => {
        console.log('🔄 R15 - Liste des élèves par moyenne');
        return await generateListeEleves(params, true);
    },

    R16: async (params) => {
        const { ecoleId, matriculeEleves, annee, nomSignataire, fonctionSignataire } = params;

        console.log('🔄 R16 - Paramètres:', { ecoleId, matriculeEleves, annee, nomSignataire, fonctionSignataire });

        const url = `${getFullUrl()}certificat-scolarite/imprimer/${ecoleId}/${matriculeEleves}/${annee}/${encodeURIComponent(nomSignataire || '')}/${encodeURIComponent(fonctionSignataire || '')}/Troisième Trimestre`;

        return downloadFile(url, `Certificat_scolarite_${matriculeEleves}.docx`);
    },

    R19: async (params) => {
        const { ecoleId, annee, periode, classe, formatExcel } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const periodeLabel = getPeriodeLabel(periode, params.periodes);

        console.log('🔄 R19 - Paramètres:', { ecoleId, anneeLabel, periodeLabel, classe, formatExcel });

        const format = formatExcel ? '-xls' : '';
        const extension = formatExcel ? 'xls' : 'pdf';
        const url = `${getFullUrl()}imprimer-matrice-classe/imprimer-spider${format}/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${annee}/${classe}`;

        return downloadFile(url, `matrice_classe.${extension}`);
    },

    R20: async (params) => {
        const { ecoleId, annee, periode, classe } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const classeLabel = getClasseLabel(classe, params.classes);

        console.log('🔄 R20 - Paramètres:', { ecoleId, anneeLabel, periodeLabel, classeLabel });

        const url = `${getFullUrl()}imprimer-rapport-pv-conseil-classe/pouls-Conseil-classe/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(classeLabel)}/${annee}/${classe}`;

        return downloadFile(url, `Proces_verbal_conseil_de_classe_${classeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R21: async (params) => {
        const { ecoleId, annee, periode, classe, formatExcel } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const periodeLabel = getPeriodeLabel(periode, params.periodes);

        console.log('🔄 R21 - Paramètres:', { ecoleId, anneeLabel, periodeLabel, classe, formatExcel });

        const format = formatExcel ? '-xls' : '';
        const extension = formatExcel ? 'xls' : 'pdf';
        const url = `${getFullUrl()}imprimer-matrice-Annuelle/imprimer-spider-annuelle${format}/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${annee}/${classe}`;

        return downloadFile(url, `matrice_Annuelle.${extension}`);
    },

    R22: async (params) => {
        const { ecoleId, matriculeEleves, annee, nomSignataire, fonctionSignataire, autreModeleCertificat } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R22 - Paramètres:', { ecoleId, matriculeEleves, anneeLabel, nomSignataire, fonctionSignataire, autreModeleCertificat });

        const url = `${getFullUrl()}certificat-scolarite/certificat-de-frequentation/${matriculeEleves}/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(nomSignataire || '')}/${encodeURIComponent(fonctionSignataire || '')}/${autreModeleCertificat}`;

        return downloadFile(url, `Certificat_frequentation_${matriculeEleves}.docx`);
    },

    R23: async (params) => {
        const { ecoleId, periode, annee, classe } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R23 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, classe });

        const url = `${getFullUrl()}imprimer-tableau-honneur/spider-tableau/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}`;

        return downloadFile(url, `tableau_honneur_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R24: async (params) => {
        const { classe, matiere, annee, periode } = params;
        const matiereLabel = getMatiereLabel(matiere, params.matieres);

        console.log('🔄 R24 - Paramètres:', { classe, matiere, annee, periode, matiereLabel });

        // Utilise sessionStorage.getItem('AnneEncours') comme dans l'original
        const anneeEncours = sessionStorage.getItem('AnneEncours') || annee;
        const url = `${getFullUrl()}moyenneProf/${classe}/${matiere}/${anneeEncours}/${periode}`;

        return downloadFile(url, `Moyenne_par_professeur_${matiereLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R25: async (params) => {
        const { ecoleId, periode, annee, classe } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R25 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, classe });

        const url = `${getFullUrl()}imprimer-trois-premiers/par-classe/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}`;

        return downloadFile(url, `Liste_trois_premiers_par_classe_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R26: async (params) => {
        const { ecoleId, periode, annee, niveau } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R26 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, niveau });

        const url = `${getFullUrl()}imprimer-trois-premiers/par-niveau/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${niveau}`;

        return downloadFile(url, `Liste_trois_premiers_par_niveau_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R27: async (params) => {
        const { ecoleId, annee, periode, classe, matiere, formatExcel } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const matiereLabel = getMatiereLabel(matiere, params.matieres);

        console.log('🔄 R27 - Paramètres:', { ecoleId, anneeLabel, periodeLabel, classe, matiereLabel, formatExcel });

        const format = formatExcel ? '-xls' : '';
        const extension = formatExcel ? 'xls' : 'pdf';
        const url = `${getFullUrl()}imprimer-matrice-Annuelle/imprimer-spider-discpline${format}/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${annee}/${classe}/${encodeURIComponent(matiereLabel)}`;

        return downloadFile(url, `matrice_discipline.${extension}`);
    },

    R28: async (params) => {
        const { ecoleId, annee, periode, classe, formatExcel } = params;
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const periodeLabel = getPeriodeLabel(periode, params.periodes);

        console.log('🔄 R28 - Paramètres:', { ecoleId, anneeLabel, periodeLabel, classe, formatExcel });

        const format = formatExcel ? '-xls' : '';
        const extension = formatExcel ? 'xls' : 'pdf';
        const url = `${getFullUrl()}imprimer-matrice-Annuelle/imprimer-spider-annuelle-dfa${format}/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${annee}/${classe}`;

        return downloadFile(url, `matrice_Annuelle_avec_dfa.${extension}`);
    },

    R29: async (params) => {
        const { ecoleId, periode, annee, classe } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R29 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, classe });

        const url = `${getFullUrl()}imprimer-trois-premiers/par-classe-annuelle/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}`;

        return downloadFile(url, `Liste_trois_premiers_par_classe_annuelle_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R30: async (params) => {
        const { ecoleId, periode, annee, niveau } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R30 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, niveau });

        const url = `${getFullUrl()}imprimer-trois-premiers/par-niveau-annuelle/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${niveau}`;

        return downloadFile(url, `Liste_trois_premiers_par_niveau_annuelle_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R31: async (params) => {
        const { classe, annee } = params;
        const classeLabel = getClasseLabel(classe, params.classes);

        console.log('🔄 R31 - Paramètres:', { classe, annee, classeLabel });

        const url = `${getFullUrl()}imprimer-etats/liste-classe-arabe/${classe}/${annee}`;

        return downloadFile(url, `liste_de_classe_${classeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R32: async (params) => {
        const { ecoleId, periode, annee, classe } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);
        const classeLabel = getClasseLabel(classe, params.classes);

        console.log('🔄 R32 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, classe, classeLabel });

        const url = `${getFullUrl()}imprimer-proces-verbal/imprimer-proces-verbalv2/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${classe}/${encodeURIComponent(classeLabel)}`;

        return downloadFile(url, `Proces_verbal_conseil_de_classe_${classeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R33: async (params) => {
        const {
            ecoleId,
            periode,
            annee,
            classe,
            niveauEnseignementId,
            decompresserBulletin,
            changerPositionLogo,
            supprimerFiligramme,
            changerPositionRepublique,
            pivoterPhotosVersLaDroite,
            utiliserModeleSecondaire,
            activerDistinctions,
            utiliserModeleBTS,
            testLourd,
            formatEcoleArabe,
            imprimerBulletinAPartir,
            imprimerBulletinJusqua,
            formatAvecPiedPage  // ✅ AJOUTÉ
        } = params;

        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R33 - Paramètres:', {
            ecoleId,
            periode,
            annee,
            classe,
            niveauEnseignementId,
            periodeLabel,
            anneeLabel,
            imprimerBulletinAPartir,
            imprimerBulletinJusqua,
            formatAvecPiedPage
        });

        // Construction de l'URL avec la plage d'impression et piedPage à la fin
        const url = `${getFullUrl()}imprimer-bulletin-list/spider-bulletin/${ecoleId}/${encodeURIComponent(periodeLabel)}/${encodeURIComponent(anneeLabel)}/${classe}/${decompresserBulletin}/${niveauEnseignementId}/${changerPositionLogo}/${!supprimerFiligramme}/${changerPositionRepublique}/${pivoterPhotosVersLaDroite}/${utiliserModeleSecondaire}/${activerDistinctions}/${utiliserModeleBTS}/${testLourd}/${formatEcoleArabe}/${imprimerBulletinAPartir}/${imprimerBulletinJusqua}/${formatAvecPiedPage}`;

        return downloadFile(url, `Bulletin_plage_${imprimerBulletinAPartir}_a_${imprimerBulletinJusqua}_${periodeLabel.replace(/\s+/g, '_')}.pdf`);
    },

    R34: async (params) => {
        const { ecoleId, periode, annee } = params;
        const periodeLabel = getPeriodeLabel(periode, params.periodes);
        const anneeLabel = getAnneeLabel(annee, params.annees);

        console.log('🔄 R34 - Paramètres:', { ecoleId, periodeLabel, anneeLabel, annee });

        const url = `${getFullUrl()}imprimer-matrice-Annuelle/imprimer-spider-annuelle-dfa-ecole-xls/${ecoleId}/${encodeURIComponent(anneeLabel)}/${encodeURIComponent(periodeLabel)}/${annee}`;

        return downloadFile(url, `matrice_Annuelle_avec_dfa_ecole.xls`);
    },
};

/**
 * Fonctions utilitaires
 */
const getPeriodeLabel = (periodeId, periodes) => {
    const periode = periodes?.find(p => p.value === periodeId);
    return periode ? periode.libelle : 'Premier Trimestre';
};

const getAnneeLabel = (anneeId, annees) => {
    const annee = annees?.find(a => a.value === anneeId);
    return annee ? annee.libelle : 'Année 2024 - 2025';
};

const getClasseLabel = (classeId, classes) => {
    const classe = classes?.find(c => c.value === classeId);
    return classe ? classe.libelle : '';
};

const getMatiereLabel = (matiereId, matieres) => {
    const matiere = matieres?.find(m => m.value === matiereId);
    return matiere ? matiere.libelle : '';
};

const generateListeEleves = async (params, includeAverage = false) => {
    const { ecoleId, annee, formatExcel, avecPhoto, statut, niveau, classe, sexe, langueVivante, redoublant, boursier, moyenneSuperieure } = params;

    console.log('🔄 Generate Liste Élèves - Paramètres:', {
        ecoleId, annee, formatExcel, avecPhoto, statut, niveau, classe, sexe, langueVivante, redoublant, boursier, moyenneSuperieure, includeAverage
    });

    const queryParams = [];
    queryParams.push(`anneeId=${annee}`);
    queryParams.push(`photo=${avecPhoto}`);
    queryParams.push(`IdEcole=${ecoleId}`);

    if (statut && statut !== 'ALL') queryParams.push(`affecte=${statut}`);
    if (niveau) queryParams.push(`branche=${niveau}`);
    if (classe) {
        const classeLabel = getClasseLabel(classe, params.classes);
        if (classeLabel) {
            queryParams.push(`classe=${encodeURIComponent(classeLabel)}`);
        }
    }
    if (sexe && sexe !== 'ALL') queryParams.push(`genre=${sexe}`);
    if (langueVivante && langueVivante !== 'ALL') queryParams.push(`langueVivante=${langueVivante}`);
    if (redoublant && redoublant !== 'ALL') queryParams.push(`redoublant=${redoublant}`);
    if (boursier && boursier !== 'ALL') queryParams.push(`boursier=${boursier}`);
    if (includeAverage && moyenneSuperieure) queryParams.push(`moyenne=${moyenneSuperieure}`);

    const queryString = queryParams.join('&');
    const format = formatExcel ? '-xls' : '';
    const extension = formatExcel ? 'xls' : 'pdf';
    const endpoint = includeAverage ? 'eleve-par-moyenne' : 'eleve-par-classe';

    console.log('🔍 Query String:', queryString);

    const url = `${getFullUrl()}imprimer-perspnnel/${endpoint}${format}?${queryString}`;

    return downloadFile(url, `Liste_des_eleves${includeAverage ? '_par_moyenne' : ''}.${extension}`);
};

const downloadFile = async (url, filename) => {
    try {
        console.log('📡 URL de téléchargement:', url);
        console.log('📁 Nom de fichier:', filename);

        const response = await axios({
            method: 'GET',
            url: url,
            responseType: 'blob',
            timeout: 120000,
            headers: {
                'Accept': 'application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, */*',
                'Content-Type': 'application/json'
            }
        });

        console.log('📊 Réponse status:', response.status);
        console.log('📊 Réponse headers:', response.headers);
        console.log('📊 Taille du blob:', response.data.size);

        // Vérifier que le fichier n'est pas vide
        if (!response.data || response.data.size === 0) {
            throw new Error('Le fichier généré est vide. Vérifiez les paramètres.');
        }

        // Déterminer le type MIME du fichier
        let mimeType = response.headers['content-type'] || '';
        console.log('🔍 Type MIME détecté:', mimeType);

        // Créer le blob avec le bon type MIME
        const blob = new Blob([response.data], {
            type: mimeType || 'application/octet-stream'
        });

        console.log('📦 Blob créé avec succès, taille:', blob.size);

        // Créer l'URL de téléchargement
        const downloadUrl = window.URL.createObjectURL(blob);

        // Créer et déclencher le téléchargement
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename; // Utiliser download au lieu de setAttribute
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Nettoyer
        setTimeout(() => {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);
        }, 100);

        console.log('✅ Téléchargement déclenché avec succès');
        return { success: true, filename, size: blob.size };

    } catch (error) {
        console.error('❌ Erreur de téléchargement:', error);
        console.error('❌ URL problématique:', url);

        if (error.code === 'ECONNABORTED') {
            throw new Error('La génération du rapport a pris trop de temps. Veuillez réessayer.');
        }

        if (error.response) {
            console.error('❌ Status de réponse:', error.response.status);
            console.error('❌ Headers de réponse:', error.response.headers);

            if (error.response.status === 404) {
                throw new Error('Rapport non trouvé. Vérifiez les paramètres sélectionnés.');
            } else if (error.response.status === 500) {
                throw new Error('Erreur serveur lors de la génération. Veuillez réessayer.');
            }
        }

        throw new Error(error.response?.data?.message || error.message || 'Erreur lors de la génération du rapport');
    }
};

/**
 * Fonction principale pour générer un rapport selon son code
 */
export const genererRapportParCode = async (code, parametres) => {
    console.log('🚀 Génération du rapport:', code);
    console.log('🔧 Paramètres reçus:', parametres);

    const rapportFunction = rapportFunctions[code];

    if (!rapportFunction) {
        throw new Error(`Rapport avec le code ${code} non trouvé`);
    }

    try {
        const result = await rapportFunction(parametres);
        console.log('✅ Rapport généré avec succès:', result);
        return result;
    } catch (error) {
        console.error('❌ Erreur lors de la génération du rapport:', error);
        throw error;
    }
};

/**
 * Fonction de test pour vérifier la connectivité avec l'API
 */
export const testerConnexionAPI = async () => {
    try {
        const response = await axios.get(`${getFullUrl()}health`, {
            timeout: 5000
        });
        console.log('✅ Test de connexion API réussi:', response.status);
        return { success: true, status: response.status };
    } catch (error) {
        console.error('❌ Test de connexion API échoué:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Vide le cache des rapports
 */
export const clearRapportsCache = () => {
    clearCache();
};

// Configuration du tableau des rapports
export const rapportsTableConfig = {
    columns: [
        {
            title: 'Code',
            dataKey: 'code',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Nom du rapport',
            dataKey: 'nom',
            flexGrow: 3,
            minWidth: 200,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                        {value}
                    </div>
                );
            }
        },
        {
            title: 'Description',
            dataKey: 'description',
            flexGrow: 4,
            minWidth: 300,
            sortable: false,
            cellRenderer: (value) => {
                return (
                    <div style={{
                        fontSize: '13px',
                        color: '#7f8c8d',
                        lineHeight: '1.4'
                    }}>
                        {value}
                    </div>
                );
            }
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'actions'
        }
    ],
    actions: [
        {
            type: 'generate',
            icon: <FiFileText size={17} />,
            tooltip: 'Générer le rapport',
            color: '#4a90e2',
            label: 'Générer'
        }
    ]
};

