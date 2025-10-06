/**
 * Service pour la gestion des affectations Professeur-Matière
 * VERSION COMPLÈTE avec filtres matière et DataTable optimisé
 * MISE À JOUR: Formatage basé sur le modèle de données réel de l'API
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiBookOpen, FiUsers, FiPhone } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import { usePulsParams } from '../../hooks/useDynamicParams';

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
// HOOK POUR RÉCUPÉRER LES AFFECTATIONS PROFESSEUR-MATIÈRE
// ===========================
/**
 * Récupère la liste des affectations professeur-matière pour une matière donnée
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useProfesseurMatiereData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();

    const {
        ecoleId: dynamicEcoleId,
        academicYearId: dynamicAcademicYearId
    } = usePulsParams();


    const searchAffectations = useCallback(async (matiereId) => {
        if (!matiereId) {
            setError({
                message: 'Veuillez sélectionner une matière',
                type: 'ValidationError',
                code: 'MISSING_MATIERE'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);

            const cacheKey = `professeur-matiere-${matiereId}-${dynamicEcoleId}-${dynamicAcademicYearId}`;

            // Vérifier le cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setData(cachedData);
                setSearchPerformed(true);
                setLoading(false);
                return;
            }

            // Appel direct à l'API
            const response = await axios.get(apiUrls.affectations.getByMatiere(matiereId));

            // Traitement des affectations selon la structure de données
            let processedAffectations = [];
            if (response.data && Array.isArray(response.data)) {
                processedAffectations = response.data.map((item, index) => {
                    const personnel = item.personnel || {};
                    const classe = item.classe || {};
                    const branche = classe.branche || {};
                    const matiere = item.matiere || {};
                    const annee = item.annee || {};
                    const fonction = personnel.fonction || {};

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

                        // Informations de matière
                        matiere_id: matiere.id || matiereId,
                        matiere_libelle: matiere.libelle || 'Matière inconnue',
                        matiere_code: matiere.code || '',
                        matiere_categorie: matiere.categorie?.libelle || '',

                        // Informations d'année
                        annee_id: annee.id || anneeId,
                        annee_libelle: annee.libelle || annee.customLibelle || '',

                        // École
                        ecole_id: personnel.ecole?.id || ecoleId,
                        ecole_libelle: personnel.ecole?.libelle || '',

                        // Numéro d'ordre pour tri
                        ordre: index + 1,

                        // Classification du professeur
                        isProfesseur: fonction.libelle === 'PROFESSEUR',
                        isFormateur: fonction.libelle?.includes('FORMATEUR') || false,

                        // Affichage optimisé
                        display_personnel: `${personnel.nom || 'Nom'} ${personnel.prenom || 'Prénom'}`,
                        display_classe: `${classe.libelle || 'Classe'} (${classe.effectif || 0} élèves)`,
                        display_contact: formatPhone(personnel.contact),
                        display_fonction: fonction.libelle || 'Non définie',
                        display_niveau_etude: `Niveau ${personnel.niveauEtude || 0}`,

                        // Indicateurs visuels
                        couleur_sexe: personnel.sexe === 'MASCULIN' ? '#3b82f6' : personnel.sexe === 'FEMININ' ? '#ec4899' : '#64748b',
                        couleur_fonction: fonction.libelle === 'PROFESSEUR' ? '#16a34a' : '#f59e0b',

                        // Métadonnées
                        dateCreation: item.dateCreation || '',
                        user: item.user || '',

                        // Données brutes pour debug
                        raw_data: item
                    };
                });

                // Tri par nom du personnel
                processedAffectations.sort((a, b) => a.personnel_nomComplet.localeCompare(b.personnel_nomComplet));
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
    }, [apiUrls.affectations]);

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
 * Détermine le type de matière basé sur la catégorie
 * @param {string} categorieLibelle
 * @returns {string}
 */
const determineTypeMatiere = (categorieLibelle) => {
    if (!categorieLibelle) return 'AUTRES';

    const libelle = categorieLibelle.toLowerCase();

    if (libelle.includes('scientifique') || libelle.includes('sciences')) return 'SCIENTIFIQUE';
    if (libelle.includes('littéraire') || libelle.includes('lettres')) return 'LITTERAIRE';
    if (libelle.includes('technique')) return 'TECHNIQUE';
    if (libelle.includes('sportive') || libelle.includes('sport')) return 'SPORTIVE';
    if (libelle.includes('artistique') || libelle.includes('arts')) return 'ARTISTIQUE';
    if (libelle.includes('professionnel')) return 'PROFESSIONNEL';
    if (libelle.includes('général')) return 'GENERAL';

    return 'AUTRES';
};

/**
 * Obtient les couleurs associées à un type de matière
 * @param {string} type
 * @returns {object}
 */
const getCouleurTypeMatiere = (type) => {
    const couleurs = {
        'SCIENTIFIQUE': { background: '#dcfce7', text: '#16a34a', border: '#22c55e' },
        'LITTERAIRE': { background: '#fef3c7', text: '#d97706', border: '#f59e0b' },
        'TECHNIQUE': { background: '#f3e8ff', text: '#9333ea', border: '#a855f7' },
        'SPORTIVE': { background: '#dbeafe', text: '#2563eb', border: '#3b82f6' },
        'ARTISTIQUE': { background: '#fef2f2', text: '#dc2626', border: '#ef4444' },
        'PROFESSIONNEL': { background: '#fce7f3', text: '#ec4899', border: '#f472b6' },
        'GENERAL': { background: '#f1f5f9', text: '#475569', border: '#64748b' },
        'AUTRES': { background: '#f8fafc', text: '#64748b', border: '#94a3b8' }
    };

    return couleurs[type] || couleurs['AUTRES'];
};

// ===========================
// CONFIGURATION DU TABLEAU DES AFFECTATIONS
// ===========================
export const professeurMatiereTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'ordre',
            flexGrow: 0.5,
            minWidth: 60,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    // padding: '6px 8px',
                    // backgroundColor: '#667eea',
                    // color: 'white',
                    // borderRadius: '8px',
                    // fontSize: '12px',
                    // fontWeight: 'bold',
                    // textAlign: 'center',
                    // minWidth: '35px'
                }}>
                    {rowData.ordre}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Professeur',
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
                    {/* {rowData.personnel_souscriptionAttenteId && (
                        <div style={{
                            fontSize: '11px',
                            color: '#64748b'
                        }}>
                            ID: {rowData.personnel_souscriptionAttenteId}
                        </div>
                    )} */}
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
                        {rowData.serie_libelle && (
                            <div>🎓 Série {rowData.serie_libelle}</div>
                        )}
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'isProfesseur',
            flexGrow: 0.8,
            minWidth: 80,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const isProfesseur = rowData.isProfesseur;
                return (
                    <div style={{
                        padding: '6px 10px',
                        backgroundColor: isProfesseur ? '#dcfce7' : '#fef3c7',
                        color: isProfesseur ? '#16a34a' : '#d97706',
                        border: `1px solid ${isProfesseur ? '#22c55e' : '#f59e0b'}`,
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: '600',
                        textAlign: 'center'
                    }}>
                        {isProfesseur ? '✓ ACTIF' : '⚠ AUTRE'}
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.8,
            minWidth: 50,
            cellType: 'actions',
            fixed: 'right'
        }
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
            field: 'isProfesseur',
            label: 'Est Professeur',
            type: 'boolean',
            tagColor: 'orange'
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
        'filiere_libelle'
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye size={17} />,
            tooltip: 'Voir le profil du professeur',
            color: '#3498db'
        },
        // {
        //     type: 'edit',
        //     icon: <FiEdit />,
        //     tooltip: 'Modifier l\'affectation',
        //     color: '#f39c12'
        // },
        // {
        //     type: 'download',
        //     icon: <FiDownload />,
        //     tooltip: 'Exporter les données',
        //     color: '#9b59b6'
        // },
        {
            type: 'delete',
            icon: <FiTrash2 size={17} />,
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