/**
 * Service pour la gestion des élèves par classe - VERSION MISE À JOUR
 * Modifications : Une seule action "retirer" dans le tableau
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiTrash2 } from 'react-icons/fi';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const DEFAULT_ECOLE_ID = 139;
const DEFAULT_ANNEE_ID = 226;

// ===========================
// FONCTION UTILITAIRE POUR FORMATAGE DES DATES
// ===========================
/**
 * Formate une date ISO en format français JJ/MM/AAAA
 * @param {string} dateString
 * @returns {string}
 */
const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Date invalide';
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return 'Date invalide';
    }
};

// ===========================
// HOOK POUR RÉCUPÉRER LES ÉLÈVES D'UNE CLASSE
// ===========================
/**
 * Récupère la liste des élèves pour une classe donnée
 * @param {number} refreshTrigger
 * @returns {object}
 */
export const useElevesData = (refreshTrigger = 0) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPerformed, setSearchPerformed] = useState(false);
    const apiUrls = useAllApiUrls();

    const searchEleves = useCallback(async (classeId, anneeId = DEFAULT_ANNEE_ID) => {
        if (!classeId) {
            setError({
                message: 'Veuillez sélectionner une classe',
                type: 'ValidationError',
                code: 'MISSING_CLASSE'
            });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSearchPerformed(false);

            const cacheKey = `eleves-classe-${classeId}-${anneeId}`;
            
            // Vérifier le cache
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setData(cachedData);
                setSearchPerformed(true);
                setLoading(false);
                return;
            }

            // Appel direct à l'API avec la vraie URL
            const response = await axios.get(apiUrls.eleves.retrieveByClasseAnnee(classeId, anneeId));
            
            // Traitement des élèves selon la vraie structure de données
            let processedEleves = [];
            if (response.data && Array.isArray(response.data)) {
                processedEleves = response.data.map((item, index) => {
                    // Les données de l'élève sont dans inscription.eleve
                    const eleve = item.inscription?.eleve || {};
                    const inscription = item.inscription || {};
                    const classe = item.classe || {};
                    
                    // Formatage du genre
                    const genre = eleve.sexe || 'Non spécifié';
                    const genre_display = genre === 'MASCULIN' ? 'Masculin' : genre === 'FEMININ' ? 'Féminin' : 'Non spécifié';
                    const genre_short = genre === 'MASCULIN' ? 'M' : genre === 'FEMININ' ? 'F' : '?';

                    return {
                        id: item.id || `eleve-${index}`,
                        eleve_id: eleve.id || `eleve-${index}`,
                        matricule: eleve.matricule || `MAT${String(index + 1).padStart(4, '0')}`,
                        nom: eleve.nom || 'Nom inconnu',
                        prenom: eleve.prenom || 'Prénom inconnu',
                        nomComplet: `${eleve.nom || 'Nom'} ${eleve.prenom || 'Prénom'}`,
                        genre: genre,
                        genre_display: genre_display,
                        genre_short: genre_short,
                        dateNaissance: eleve.dateNaissance || '',
                        dateNaissance_display: formatDate(eleve.dateNaissance),
                        lieuNaissance: eleve.lieuNaissance || 'Non renseigné',
                        nationalite: eleve.nationalite || 'Non renseignée',
                        
                        // Informations de contact (pas toujours présentes dans cette structure)
                        telephone: 'Non renseigné',
                        email: 'Non renseigné',
                        adresse: 'Non renseignée',
                        
                        // Informations de classe
                        classe_id: classe.id || classeId,
                        classe: classe.libelle || 'Classe inconnue',
                        classe_code: classe.code || '',
                        classe_effectif: classe.effectif || 0,
                        
                        // Informations de branche
                        branche: classe.branche?.libelle || '',
                        niveau: classe.branche?.niveau?.libelle || '',
                        serie: classe.branche?.serie?.libelle || '',
                        filiere: classe.branche?.filiere?.libelle || '',
                        
                        // Numéro d'ordre dans la classe
                        numeroOrdre: index + 1,
                        
                        // Statut de l'élève
                        statut: item.statut || 'ACTIF',
                        statut_display: item.statut === 'ACTIF' ? 'Actif' : item.statut || 'Actif',
                        
                        // Informations d'inscription
                        inscription_id: inscription.id || '',
                        inscription_statut: inscription.statut || '',
                        redoublant: inscription.redoublant || 'NON',
                        redoublant_display: inscription.redoublant === 'OUI' ? 'Redoublant' : 'Non redoublant',
                        boursier: inscription.boursier || '',
                        boursier_display: inscription.boursier ? 'Boursier' : 'Non boursier',
                        demi_pension: inscription.demi_pension || false,
                        demi_pension_display: inscription.demi_pension ? 'Demi-pensionnaire' : 'Externe',
                        lv2: inscription.lv2 || '',
                        
                        // Informations administratives
                        dateInscription: inscription.dateCreation || item.dateCreation || '',
                        dateInscription_display: formatDate(inscription.dateCreation || item.dateCreation),
                        dateCreation: item.dateCreation || '',
                        dateUpdate: item.dateUpdate || '',
                        
                        // Année scolaire
                        annee: inscription.annee?.libelle || 'Année inconnue',
                        annee_id: inscription.annee?.id || anneeId,
                        
                        // École
                        ecole: classe.ecole?.libelle || inscription.ecole?.libelle || '',
                        ecole_id: classe.ecole?.id || inscription.ecole?.id || DEFAULT_ECOLE_ID,
                        ecole_code: classe.ecole?.code || inscription.ecole?.code || '',
                        ecole_tel: classe.ecole?.tel || inscription.ecole?.tel || '',
                        ecole_signataire: classe.ecole?.nomSignataire || inscription.ecole?.nomSignataire || '',
                        
                        // Photo de l'élève
                        urlPhoto: eleve.urlPhoto || inscription.urlPhoto || '',
                        hasPhoto: !!(eleve.urlPhoto || inscription.urlPhoto),
                        
                        // Informations parents/tuteurs (pas disponibles dans cette structure)
                        tuteur: 'Non renseigné',
                        tuteur_telephone: 'Non renseigné',
                        
                        // Affichage optimisé
                        display_name: `${eleve.nom || 'Nom'} ${eleve.prenom || 'Prénom'}`,
                        display_details: `${eleve.matricule || 'MAT'} • ${genre_short} • ${formatDate(eleve.dateNaissance)}`,
                        display_status: `${item.statut === 'ACTIF' ? '✅' : '❌'} ${item.statut || 'ACTIF'}`,
                        
                        // Données brutes pour debug
                        raw_data: item
                    };
                });
            }

            setToCache(cacheKey, processedEleves);
            setData(processedEleves);
            setSearchPerformed(true);
        } catch (err) {
            console.error('Erreur lors de la récupération des élèves:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors de la recherche des élèves',
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
        eleves: data,
        loading,
        error,
        searchPerformed,
        searchEleves,
        clearResults
    };
};

// ===========================
// CONFIGURATION DU TABLEAU DES ÉLÈVES MISE À JOUR
// ===========================
export const elevesTableConfig = {
    columns: [
        {
            title: 'N°',
            dataKey: 'numeroOrdre',
            flexGrow: 0.5,
            minWidth: 70,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{
                    padding: '6px 8px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    minWidth: '45px'
                }}>
                    {rowData.numeroOrdre}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Matricule',
            dataKey: 'matricule',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#1e293b',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                }}>
                    {rowData.matricule}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Élève',
            dataKey: 'nomComplet',
            flexGrow: 2.5,
            minWidth: 200,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Photo de l'élève si disponible */}
                    {rowData.hasPhoto && (
                        <img 
                            src={rowData.urlPhoto} 
                            alt={rowData.nomComplet}
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '2px solid #e2e8f0'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    )}
                    <div>
                        <div style={{ 
                            fontWeight: '600', 
                            color: '#1e293b',
                            fontSize: '14px',
                            marginBottom: '2px'
                        }}>
                            {rowData.nomComplet}
                        </div>
                        <div style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            fontSize: '12px', 
                            color: '#64748b'
                        }}>
                            <span style={{ 
                                padding: '2px 6px',
                                backgroundColor: rowData.genre_short === 'M' ? '#dbeafe' : '#fce7f3',
                                color: rowData.genre_short === 'M' ? '#2563eb' : '#ec4899',
                                borderRadius: '4px',
                                fontSize: '11px'
                            }}>
                                {rowData.genre_display}
                            </span>
                            <span>📍 {rowData.lieuNaissance}</span>
                            <span>🏳️ {rowData.nationalite}</span>
                        </div>
                    </div>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Date de Naissance',
            dataKey: 'dateNaissance_display',
            flexGrow: 1.2,
            minWidth: 120,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ 
                    fontSize: '13px',
                    color: '#475569'
                }}>
                    🎂 {rowData.dateNaissance_display}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Informations',
            dataKey: 'redoublant_display',
            flexGrow: 1.5,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div>
                    <div style={{ 
                        fontSize: '12px',
                        marginBottom: '4px'
                    }}>
                        {rowData.redoublant === 'OUI' && (
                            <span style={{
                                padding: '2px 6px',
                                backgroundColor: '#fef3c7',
                                color: '#d97706',
                                borderRadius: '4px',
                                fontSize: '11px',
                                marginRight: '4px'
                            }}>
                                Redoublant
                            </span>
                        )}
                        {rowData.boursier && (
                            <span style={{
                                padding: '2px 6px',
                                backgroundColor: '#d1fae5',
                                color: '#059669',
                                borderRadius: '4px',
                                fontSize: '11px',
                                marginRight: '4px'
                            }}>
                                Boursier
                            </span>
                        )}
                    </div>
                    <div style={{ 
                        fontSize: '11px',
                        color: '#64748b'
                    }}>
                        {rowData.demi_pension_display}
                        {rowData.lv2 && (
                            <span style={{ marginLeft: '8px' }}>
                                LV2: {rowData.lv2}
                            </span>
                        )}
                    </div>
                </div>
            ),
            sortable: false
        },
        {
            title: 'Statut',
            dataKey: 'statut_display',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => {
                const colorMap = {
                    'Actif': { bg: '#dcfce7', text: '#16a34a', border: '#22c55e' },
                    'Inactif': { bg: '#fef3c7', text: '#d97706', border: '#f59e0b' },
                    'Suspendu': { bg: '#fee2e2', text: '#dc2626', border: '#ef4444' },
                    'Transféré': { bg: '#e0e7ff', text: '#4f46e5', border: '#6366f1' }
                };
                
                const colors = colorMap[rowData.statut_display] || colorMap['Actif'];
                
                return (
                    <div style={{
                        padding: '4px 8px',
                        backgroundColor: colors.bg,
                        color: colors.text,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '500',
                        textAlign: 'center'
                    }}>
                        {rowData.statut_display}
                    </div>
                );
            },
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 0.7,
            minWidth: 80,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'genre_display',
            label: 'Genre',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'statut_display',
            label: 'Statut',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'redoublant_display',
            label: 'Redoublement',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'demi_pension_display',
            label: 'Régime',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'lieuNaissance',
            label: 'Lieu de naissance',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
        },
        {
            field: 'nationalite',
            label: 'Nationalité',
            type: 'select',
            dynamic: true,
            tagColor: 'violet'
        },
        {
            field: 'lv2',
            label: 'LV2',
            type: 'select',
            dynamic: true,
            tagColor: 'pink'
        },
        {
            field: 'dateNaissance_display',
            label: 'Date de naissance',
            type: 'date',
            tagColor: 'indigo'
        }
    ],
    searchableFields: [
        'matricule',
        'nomComplet',
        'nom',
        'prenom',
        'lieuNaissance',
        'nationalite',
        'classe',
        'branche',
        'niveau',
        'serie',
        'lv2'
    ],
    // UNE SEULE ACTION : RETIRER
    actions: [
        {
            type: 'remove',
            icon: <FiTrash2 />,
            tooltip: 'Retirer l\'élève de la classe',
            color: '#ef4444',
            confirmMessage: 'Êtes-vous sûr de vouloir retirer cet élève de la classe ?'
        }
    ],
    // Configuration supplémentaire pour le tableau
    defaultSortField: 'numeroOrdre',
    defaultSortOrder: 'asc',
    pageSize: 15,
    showPagination: true,
    showSearch: true,
    showFilters: true,
    enableExport: true,
    exportFormats: ['excel', 'pdf', 'csv']
};