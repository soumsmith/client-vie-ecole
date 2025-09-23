/**
 * Service pour la gestion des affectations Personnel par Fonction
 * VERSION ADAPTÉE pour afficher les classes selon le profil/fonction sélectionné
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiBookOpen, FiUsers, FiPhone } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';

import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DES TÉLÉPHONES
// ===========================
/**
 * Formate un numéro de téléphone
 * @param {string} phone
 * @returns {string}
 */
const formatPhone = (phone) => {
    if (!phone) return 'Non renseigné';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `${cleaned.slice(0, 2)} ${cleaned.slice(2, 4)} ${cleaned.slice(4, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`;
    }
    return phone;
};

// ===========================
// HOOK POUR RÉCUPÉRER LA LISTE DES FONCTIONS
// ===========================
/**
 * Récupère la liste des fonctions disponibles
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useFonctionsData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchFonctions = useCallback(async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const cacheKey = `fonctions-list-data`;

            // Vérifier le cache
            if (!skipCache) {
                const cachedData = getFromCache(cacheKey);
                if (cachedData) {
                    setData(cachedData);
                    setLoading(false);
                    return;
                }
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.affectations.getProfesseur());

            // Traitement des données de fonctions
            let processedFonctions = [];
            if (response.data && Array.isArray(response.data)) {
                processedFonctions = response.data.map((fonction, index) => {
                    return {
                        // Propriétés essentielles pour SelectPicker
                        value: fonction.id,
                        label: fonction.libelle,

                        // Données complètes de la fonction
                        id: fonction.id,
                        code: fonction.code || '',
                        libelle: fonction.libelle || '',

                        // Affichage optimisé
                        display_short: fonction.libelle,
                        display_code: `${fonction.code} - ${fonction.libelle}`,

                        // Type de fonction pour classification
                        type_fonction: determineFonctionType(fonction.libelle),
                        couleur_type: getCouleurTypeFonction(determineFonctionType(fonction.libelle)),

                        // Données brutes
                        raw_data: fonction
                    };
                });

                // Tri par code puis par libellé
                processedFonctions.sort((a, b) => {
                    if (a.code !== b.code) {
                        return a.code.localeCompare(b.code);
                    }
                    return a.libelle.localeCompare(b.libelle);
                });
            }

            setToCache(cacheKey, processedFonctions, CACHE_DURATION);
            setData(processedFonctions);
        } catch (err) {
            console.error('Erreur lors de la récupération des fonctions:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des fonctions',
                type: err.name || 'FetchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFonctions(false);
    }, [refreshTrigger, fetchFonctions]);

    return {
        fonctions: data,
        loading,
        error,
        refetch: () => fetchFonctions(true)
    };
};

// ===========================
// HOOK POUR RÉCUPÉRER LES AFFECTATIONS PAR FONCTION
// ===========================
/**
 * Récupère la liste des affectations personnels-classes pour une fonction donnée
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const usePersonnelFonctionData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();

    const {
        ecoleId: dynamicEcoleId,
        academicYearId: dynamicAcademicYearId
    } = usePulsParams();

    const searchAffectations = useCallback(async (fonctionId) => {
        if (!fonctionId) {
            setError({
                message: 'Veuillez sélectionner une fonction',
                type: 'ValidationError',
                code: 'MISSING_FONCTION'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);

            const cacheKey = `personnel-fonction-${fonctionId}-${dynamicEcoleId}-${dynamicAcademicYearId}`;

            // Vérifier le cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setData(cachedData);
                setSearchPerformed(true);
                setLoading(false);
                return;
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.affectations.getByFonction(fonctionId));

            // Traitement des affectations selon la structure de données
            let processedAffectations = [];
            if (response.data) {
                // Si c'est un objet unique, on le met dans un tableau
                const dataArray = Array.isArray(response.data) ? response.data : [response.data];

                processedAffectations = dataArray.map((item, index) => {
                    const personnel = item.personnel || {};
                    const classe = item.classe || {};
                    const branche = classe.branche || {};
                    const annee = item.annee || {};
                    const fonction = personnel.fonction || {};
                    const ecole = classe.ecole || personnel.ecole || {};

                    return {
                        id: item.id || `affectation-${index}`,

                        // Informations du personnel
                        personnel_id: personnel.id || null,
                        personnel_nom: personnel.nom || 'Nom inconnu',
                        personnel_prenom: personnel.prenom || 'Prénom inconnu',
                        personnel_nomComplet: `${personnel.nom || 'Nom'} ${personnel.prenom || 'Prénom'}`.trim(),
                        personnel_sexe: personnel.sexe || 'Non spécifié',
                        personnel_sexe_display: personnel.sexe === 'MASCULIN' ? 'M' : personnel.sexe === 'FEMININ' ? 'F' : '?',
                        personnel_contact: personnel.contact || '',
                        personnel_contact_display: formatPhone(personnel.contact),
                        personnel_niveauEtude: personnel.niveauEtude || 0,
                        personnel_souscriptionAttenteId: personnel.souscriptionAttenteId || null,

                        // Informations de fonction
                        fonction_id: fonction.id || null,
                        fonction_code: fonction.code || '',
                        fonction_libelle: fonction.libelle || 'Non définie',

                        // Informations de classe
                        classe_id: classe.id || null,
                        classe_libelle: classe.libelle || 'Classe inconnue',
                        classe_code: classe.code || '',
                        classe_effectif: classe.effectif || 0,
                        classe_visible: classe.visible || 0,

                        // Informations de branche
                        branche_id: branche.id || null,
                        branche_libelle: branche.libelle || '',
                        niveau_libelle: branche.niveau?.libelle || '',
                        filiere_libelle: branche.filiere?.libelle || '',
                        serie_libelle: branche.serie?.libelle || '',
                        programme_libelle: branche.programme?.libelle || '',

                        // Informations de niveau d'enseignement
                        niveauEnseignement_libelle: branche.niveauEnseignement?.libelle || '',

                        // Informations d'année
                        annee_id: annee.id || dynamicAcademicYearId,
                        annee_libelle: annee.libelle || annee.customLibelle || '',

                        // École
                        ecole_id: ecole.id || dynamicEcoleId,
                        ecole_libelle: ecole.libelle || '',
                        ecole_code: ecole.code || '',
                        ecole_tel: ecole.tel || '',
                        ecole_nomSignataire: ecole.nomSignataire || '',

                        // Type de fonction
                        typeFonction: item.typeFonction || '',

                        // Numéro d'ordre pour tri
                        ordre: index + 1,

                        // Classification du personnel
                        isProfesseur: fonction.libelle === 'PROFESSEUR',
                        isEducateur: fonction.libelle === 'EDUCATEUR',
                        isFondateur: fonction.libelle === 'FONDATEUR',
                        isAutres: fonction.libelle === 'AUTRES',

                        // Affichage optimisé
                        display_personnel: `${personnel.nom || 'Nom'} ${personnel.prenom || 'Prénom'}`,
                        display_classe: `${classe.libelle || 'Classe'} (${classe.effectif || 0} élèves)`,
                        display_contact: formatPhone(personnel.contact),
                        display_fonction: fonction.libelle || 'Non définie',
                        display_niveau_etude: `Niveau ${personnel.niveauEtude || 0}`,
                        display_branche_complete: `${branche.libelle || ''} - ${branche.niveau?.libelle || ''}`,

                        // Informations sur la langue vivante
                        langueVivante_libelle: classe.langueVivante?.libelle || '',
                        langueVivante_code: classe.langueVivante?.code || '',

                        // Indicateurs visuels
                        couleur_sexe: personnel.sexe === 'MASCULIN' ? '#3b82f6' : personnel.sexe === 'FEMININ' ? '#ec4899' : '#64748b',
                        couleur_fonction: getCouleurFonction(fonction.libelle),

                        // Métadonnées
                        dateCreation: item.dateCreation || '',
                        user: item.user || '',

                        // Données brutes pour debug
                        raw_data: item
                    };
                });

                // Tri par nom du personnel puis par classe
                processedAffectations.sort((a, b) => {
                    const nameCompare = a.personnel_nomComplet.localeCompare(b.personnel_nomComplet);
                    if (nameCompare !== 0) return nameCompare;
                    return a.classe_libelle.localeCompare(b.classe_libelle);
                });
            }

            setToCache(cacheKey, processedAffectations, CACHE_DURATION);
            setData(processedAffectations);
            setSearchPerformed(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des affectations:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des affectations',
                type: err.name || 'SearchError',
                code: err.response?.status || err.code || 'UNKNOWN',
                details: err.response?.data,
                url: err.config?.url
            });
        } finally {
            setLoading(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setData([]);
        setError(null);
        setSearchPerformed(false);
        setLoading(false);
    }, []);

    useEffect(() => {
        if (refreshTrigger > 0) {
            // Possibilité de rafraîchir si besoin
        }
    }, [refreshTrigger]);

    return {
        affectations: data,
        loading,
        error,
        searchPerformed,
        searchAffectations,
        clearResults
    };
};

// ===========================
// FONCTIONS UTILITAIRES
// ===========================

/**
 * Détermine le type de fonction
 * @param {string} fonctionLibelle
 * @returns {string}
 */
const determineFonctionType = (fonctionLibelle) => {
    if (!fonctionLibelle) return 'AUTRES';

    const libelle = fonctionLibelle.toUpperCase();

    if (libelle.includes('PROFESSEUR')) return 'ENSEIGNANT';
    if (libelle.includes('EDUCATEUR')) return 'EDUCATION';
    if (libelle.includes('FONDATEUR')) return 'DIRECTION';

    return 'AUTRES';
};

/**
 * Obtient les couleurs associées à un type de fonction
 * @param {string} type
 * @returns {object}
 */
const getCouleurTypeFonction = (type) => {
    const couleurs = {
        'ENSEIGNANT': { background: '#dcfce7', text: '#16a34a', border: '#22c55e' },
        'EDUCATION': { background: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
        'DIRECTION': { background: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
        'AUTRES': { background: '#f8fafc', text: '#64748b', border: '#94a3b8' }
    };

    return couleurs[type] || couleurs['AUTRES'];
};

/**
 * Obtient la couleur pour une fonction spécifique
 * @param {string} fonctionLibelle
 * @returns {string}
 */
const getCouleurFonction = (fonctionLibelle) => {
    const couleurs = {
        'PROFESSEUR': '#16a34a',
        'EDUCATEUR': '#2563eb',
        'FONDATEUR': '#9333ea',
        'AUTRES': '#f59e0b'
    };

    return couleurs[fonctionLibelle] || couleurs['AUTRES'];
};

// ===========================
// CONFIGURATION DU TABLEAU DES AFFECTATIONS
// ===========================
export const personnelFonctionTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'ordre',
            flexGrow: 0.5,
            minWidth: 60,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 8px',
                    // backgroundColor: '#667eea',
                    // color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '35px'
                }}>
                    {rowData.ordre}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Personnel',
            dataKey: 'personnel_nomComplet',
            flexGrow: 2.5,
            minWidth: 200,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: rowData.couleur_sexe + '15',
                        border: `2px solid ${rowData.couleur_sexe}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: rowData.couleur_sexe
                    }}>
                        {rowData.personnel_sexe_display}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                            fontWeight: '600',
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px'
                        }}>
                            {rowData.display_personnel}
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span style={{
                                padding: '2px 6px',
                                backgroundColor: rowData.couleur_fonction + '15',
                                color: rowData.couleur_fonction,
                                borderRadius: '4px',
                                fontSize: '10px',
                                fontWeight: '500'
                            }}>
                                {rowData.display_fonction}
                            </span>
                            <span>📚 {rowData.display_niveau_etude}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Contact',
            dataKey: 'personnel_contact_display',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '500',
                        color: '#475569',
                        marginBottom: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                        <FiPhone size={12} />
                        {rowData.display_contact}
                    </div>
                    {rowData.personnel_souscriptionAttenteId && (
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b'
                        }}>
                            {/* ID: {rowData.personnel_souscriptionAttenteId} */}
                        </div>
                    )}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Classe Assignée',
            dataKey: 'classe_libelle',
            flexGrow: 1.5,
            minWidth: 140,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#475569',
                        marginBottom: '4px'
                    }}>
                        {rowData.classe_libelle}
                    </div>
                    <div style={{
                        fontSize: '11px',
                        color: '#64748b',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}>
                        <FiUsers size={10} />
                        {rowData.classe_effectif} élève(s)
                        {rowData.niveau_libelle && (
                            <span style={{
                                padding: '1px 4px',
                                backgroundColor: '#e0f2fe',
                                color: '#0369a1',
                                borderRadius: '3px',
                                fontSize: '9px',
                                marginLeft: '4px'
                            }}>
                                {rowData.niveau_libelle}
                            </span>
                        )}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Branche/Filière',
            dataKey: 'branche_libelle',
            flexGrow: 1.3,
            minWidth: 130,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ fontSize: '12px' }}>
                    <div style={{
                        marginBottom: '4px',
                        color: '#475569',
                        fontWeight: '500'
                    }}>
                        {rowData.branche_libelle || 'Non définie'}
                    </div>
                    <div style={{
                        color: '#64748b',
                        fontSize: '11px'
                    }}>
                        {rowData.filiere_libelle && (
                            <div>📋 {rowData.filiere_libelle}</div>
                        )}
                        {/* {rowData.programme_libelle && (
                            <div>🎓 {rowData.programme_libelle}</div>
                        )} */}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Type Fonction',
            dataKey: 'typeFonction',
            flexGrow: 0.8,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const typeFonction = rowData.typeFonction || 'STANDARD';
                const colors = {
                    'PPRINC': { bg: '#dcfce7', text: '#16a34a', label: 'PRINCIPAL' },
                    'PSEC': { bg: '#dbeafe', text: '#2563eb', label: 'SECONDAIRE' },
                    'STANDARD': { bg: '#f1f5f9', text: '#475569', label: 'STANDARD' }
                };
                const color = colors[typeFonction] || colors['STANDARD'];

                return (
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: color.bg,
                        color: color.text,
                        borderRadius: '6px',
                        fontSize: '10px',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {color.label}
                    </div>
                );
            },
            sortable: true
        },
        // {
        //     title: 'Actions',
        //     dataKey: 'actions',
        //     flexGrow: 1,
        //     minWidth: 120,
        //     cellType: 'actions',
        //     fixed: 'right'
        // }
    ],
    filterConfigs: [
        {
            field: 'fonction_libelle',
            label: 'Fonction',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'personnel_sexe',
            label: 'Genre',
            type: 'select',
            dynamic: true,
            tagColor: 'pink'
        },
        {
            field: 'classe_libelle',
            label: 'Classe',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'niveau_libelle',
            label: 'Niveau',
            type: 'select',
            dynamic: true,
            tagColor: 'violet'
        },
        {
            field: 'typeFonction',
            label: 'Type Fonction',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'filiere_libelle',
            label: 'Filière',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
        }
    ],
    searchableFields: [
        'personnel_nomComplet',
        'personnel_nom',
        'personnel_prenom',
        'personnel_contact',
        'classe_libelle',
        'branche_libelle',
        'fonction_libelle',
        'niveau_libelle',
        'filiere_libelle',
        'programme_libelle'
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir le profil du personnel',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier l\'affectation',
            color: '#f39c12'
        },
        {
            type: 'download',
            icon: <FiDownload />,
            tooltip: 'Exporter les données',
            color: '#9b59b6'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer l\'affectation',
            color: '#e74c3c'
        }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'personnel_nomComplet',
    defaultSortOrder: 'asc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};