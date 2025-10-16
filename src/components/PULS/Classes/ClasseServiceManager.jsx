/**
 * Service pour la gestion des données de classes
 * VERSION CORRIGÉE avec filtres fonctionnels
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiPhone, FiMail } from 'react-icons/fi';
import { useState, useEffect, useCallback } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';
import { useClassesUrls, useBranchesUrls, useAppParams } from '../utils/apiConfig';


/**
 * Hook pour récupérer la liste des classes
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useClassesData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [performance, setPerformance] = useState(null);

    const appParams = useAppParams();
    const classesUrls = useClassesUrls();

    const fetchData = async (skipCache = false) => {
        try {
            setLoading(true);
            setError(null);
            const startTime = Date.now();
            const cacheKey = 'classes-data';
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

            const url = classesUrls.getClasseByEcole();
            const response = await axios.get(url);

            // ⚠️ CORRECTION : Aplatir les données pour faciliter le filtrage
            const processedClasses = response.data && Array.isArray(response.data)
                ? response.data.map(classe => ({
                    id: classe.id,
                    libelle: classe.libelle,
                    code: classe.code,
                    effectif: classe.effectif,
                    visible: classe.visible,
                    // ✓ CORRECTION : Convertir le statut en texte lisible
                    statutTexte: classe.visible === 1 ? 'Visible' : 'Masquée',
                    // ✓ Données aplaties pour les filtres
                    brancheLibelle: classe.branche?.libelle || 'N/A',
                    niveauLibelle: classe.branche?.niveau?.libelle || 'N/A',
                    serieLibelle: classe.branche?.serie?.libelle || 'N/A',
                    langueVivanteLibelle: classe.langueVivante?.libelle || 'N/A',
                    // Garder aussi les objets complets pour l'affichage
                    branche: classe.branche,
                    ecole: classe.ecole,
                    langueVivante: classe.langueVivante,
                    dateCreation: classe.dateCreation,
                    dateUpdate: classe.dateUpdate,
                    raw_data: classe
                }))
                : [];
            
            console.log('Classes traitées:', processedClasses);
            
            setToCache(cacheKey, processedClasses);
            setData(processedClasses);
            setPerformance({
                duration: Date.now() - startTime,
                source: 'api',
                itemCount: processedClasses.length,
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
    }, [refreshTrigger]);

    // Fonction pour forcer le refresh sans cache
    const forceRefresh = () => {
        fetchData(true);
    };

    return {
        classes: data,
        loading,
        error,
        refetch: forceRefresh,
        performance
    };
};

/**
 * Hook pour récupérer les branches par niveauEnseignement et école
 * @param {number} niveauEnseignementId
 * @returns {object}
 */
export const useBranchesByNiveauEnseignement = (niveauEnseignementId) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const appParams = useAppParams();
  const classesUrls = useBranchesUrls();

  const fetchBranches = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = classesUrls.getByNiveauEnseignement();
      const response = await axios.get(url);
      // Filtrer par niveauEnseignement côté client si besoin
      const filtered = niveauEnseignementId
        ? (response.data || []).filter(b => b.niveauEnseignement?.id === niveauEnseignementId)
        : (response.data || []);
      setBranches(filtered);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [niveauEnseignementId]);

  useEffect(() => {
    if (appParams.ecoleId) fetchBranches();
  }, [fetchBranches, appParams.ecoleId, niveauEnseignementId]);

  return { branches, loading, error, refetch: fetchBranches };
};

/**
 * Vide le cache des classes
 */
export const clearClassesCache = () => {
    clearCache();
};

// Configuration du tableau pour les classes
export const classesTableConfig = {
    columns: [
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Libellé',
            dataKey: 'libelle',
            flexGrow: 2,
            minWidth: 200,
            sortable: true,
            // ✓ CORRIGÉ : Utiliser 'cell' au lieu de 'cellRenderer'
            cell: ({ rowData }) => {
                if (!rowData) return null;
                return (
                    <div>
                        <div style={{ fontWeight: '500' }}>{rowData.libelle}</div>
                        <div style={{ fontSize: '0.85em', color: '#666' }}>
                            Code: {rowData.code}
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Effectif',
            dataKey: 'effectif',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cell: ({ rowData }) => {
                if (!rowData) return null;
                return (
                    <div style={{ textAlign: 'center' }}>
                        <Badge 
                            style={{ 
                                backgroundColor: rowData.effectif > 30 ? '#27ae60' : '#f39c12',
                                color: 'white',
                                padding: '4px 8px',
                                fontSize: '13px'
                            }}
                        >
                            {rowData.effectif || 0} élèves
                        </Badge>
                    </div>
                );
            }
        },
        {
            title: 'Branche',
            dataKey: 'brancheLibelle',
            flexGrow: 2,
            minWidth: 200,
            sortable: true,
            cell: ({ rowData }) => {
                if (!rowData) return null;
                return (
                    <div>
                        <div style={{ fontWeight: '500' }}>{rowData.brancheLibelle}</div>
                        <div style={{ fontSize: '0.8em', color: '#666' }}>
                            {rowData.niveauLibelle}
                        </div>
                    </div>
                );
            }
        },
        {
            title: 'Série',
            dataKey: 'serieLibelle',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cell: ({ rowData }) => {
                if (!rowData || rowData.serieLibelle === 'N/A') return 'N/A';
                return (
                    <Badge style={{ backgroundColor: '#3498db', color: 'white', padding: '4px 8px' }}>
                        {rowData.serieLibelle}
                    </Badge>
                );
            }
        },
        {
            title: 'Langue Vivante',
            dataKey: 'langueVivanteLibelle',
            flexGrow: 1,
            minWidth: 150,
            sortable: true,
            cell: ({ rowData }) => {
                if (!rowData) return null;
                return rowData.langueVivanteLibelle;
            }
        },
        {
            title: 'Statut',
            dataKey: 'statutTexte',  // ✓ CORRIGÉ : Utiliser le champ texte
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cell: ({ rowData }) => {
                if (!rowData) return null;
                return (
                    <Badge style={{ 
                        backgroundColor: rowData.visible === 1 ? '#27ae60' : '#e74c3c',
                        color: 'white',
                        padding: '4px 8px'
                    }}>
                        {rowData.statutTexte}
                    </Badge>
                );
            }
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.8,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    
    // ✓ CORRIGÉ : Utiliser les champs aplatis pour la recherche
    searchableFields: ['libelle', 'code', 'brancheLibelle', 'serieLibelle', 'langueVivanteLibelle', 'niveauLibelle', 'statutTexte'],
    
    // ⚠️ CORRECTION MAJEURE : Utiliser 'field' au lieu de 'key' et ajouter 'dynamic: true'
    filterConfigs: [
        {
            field: 'brancheLibelle',  // ✓ Utilise 'field' comme dans le panier
            label: 'Branche',
            placeholder: 'Toutes les branches',
            type: 'select',
            dynamic: true,  // ✓ Important pour générer les options automatiquement
            tagColor: 'green'
        },
        {
            field: 'serieLibelle',  // ✓ Utilise 'field'
            label: 'Série',
            placeholder: 'Toutes les séries',
            type: 'select',
            dynamic: true,  // ✓ Important
            tagColor: 'blue'
        },
        {
            field: 'niveauLibelle',  // ✓ Ajout du filtre niveau
            label: 'Niveau',
            placeholder: 'Tous les niveaux',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'langueVivanteLibelle',  // ✓ Utilise 'field'
            label: 'Langue Vivante',
            placeholder: 'Toutes les langues',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'statutTexte',  // ✓ CORRIGÉ : Utiliser le champ texte
            label: 'Statut',
            placeholder: 'Tous les statuts',
            type: 'select',
            dynamic: true,  // ✓ Génère automatiquement "Visible" et "Masquée"
            tagColor: 'red'
        },
        // {
        //     field: 'effectif',
        //     label: 'Effectif',
        //     placeholder: 'Tous les effectifs',
        //     type: 'range',
        //     min: 0,
        //     max: 100,
        //     tagColor: 'cyan'
        // }
    ],
    
    actions: [
        {
            type: 'view',
            icon: <FiEye size={17} />,
            tooltip: 'Voir la classe',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit size={17} />,
            tooltip: 'Modifier la classe',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 size={17} />,
            tooltip: 'Supprimer la classe',
            color: '#e74c3c'
        }
    ]
};