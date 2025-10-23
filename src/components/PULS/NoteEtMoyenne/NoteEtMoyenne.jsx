import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    SelectPicker,
    Button,
    Panel,
    Row,
    Col,
    Message,
    Loader,
    Badge,
    Steps,
    toaster
} from 'rsuite';
import {
    FiSearch,
    FiRotateCcw,
    FiBook,
    FiUsers,
    FiBarChart
} from 'react-icons/fi';
import axios from 'axios';
import getFullUrl from "../../hooks/urlUtils";

// Import des fonctions externalisées
import DataTable from "../../DataTable"; // Utilisation de la DataTable étendue
import DataTableExtended from "../../DataTable2";
import {
    useNoteSearch,
    getNoteColor,
    getAppreciationColor
} from './NoteService';

import { usePeriodesData, useClassesData, useMatieresData } from "../utils/CommonDataService";
import { usePulsParams } from '../../hooks/useDynamicParams';
import GradientButton from '../../GradientButton';
import IconBox from "../Composant/IconBox";

// ===========================
// FONCTION POUR SAUVEGARDER LES ABSENCES
// ===========================
const saveAbsenceToAPI = async (etudiantData, classeInfo, periodeId, academicYearId, field, value) => {
    try {
        const baseUrl = getFullUrl();
        const apiUrl = `${baseUrl}absence-eleve/save-list-process`;

        // Construction du payload selon le format demandé
        const payload = [{
            eleve: {
                id: etudiantData.id,
                matricule: etudiantData.matricule,
                nom: etudiantData.nom,
                prenom: etudiantData.prenom,
                sexe: etudiantData.sexe
            },
            periode: {
                id: periodeId
            },
            classe: {
                id: classeInfo.id,
                libelle: classeInfo.libelle,
                ecoleId: classeInfo.raw_data?.ecoleId || classeInfo.ecoleId
            },
            annee: {
                id: academicYearId
            },
            isClassed: etudiantData.isClassed || "O"
        }];

        // Ajout des champs d'absence selon le type
        if (field === 'absencesJustifiees') {
            payload[0].absJustifiee = parseInt(value) || 0;
            // Conserver la valeur existante pour l'autre type d'absence
            if (etudiantData.absencesNonJustifiees > 0) {
                payload[0].absNonJustifiee = parseInt(etudiantData.absencesNonJustifiees) || 0;
            }
        } else if (field === 'absencesNonJustifiees') {
            payload[0].absNonJustifiee = parseInt(value) || 0;
            // Conserver la valeur existante pour l'autre type d'absence
            if (etudiantData.absencesJustifiees > 0) {
                payload[0].absJustifiee = parseInt(etudiantData.absencesJustifiees) || 0;
            }
        }

        console.log('💾 Sauvegarde absence - Payload:', JSON.stringify(payload, null, 2));

        const response = await axios.post(apiUrl, payload);

        console.log('✅ Réponse API sauvegarde absence:', response.data);
        return { success: true, data: response.data };

    } catch (error) {
        console.error('❌ Erreur sauvegarde absence:', error);
        return {
            success: false,
            error: error.response?.data?.message || error.message || 'Erreur lors de la sauvegarde'
        };
    }
};

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE AMÉLIORÉ (INCHANGÉ)
// ===========================
const SearchForm = ({
    onSearch,
    onClear,
    loading = false,
    error = null,
    showMatiereFilter = false
}) => {
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedPeriode, setSelectedPeriode] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [formError, setFormError] = useState(null);

    const {
        classes,
        loading: classesLoading,
        error: classesError
    } = useClassesData();

    const {
        periodes,
        loading: periodesLoading,
        error: periodesError
    } = usePeriodesData();

    // Hook conditionnel pour les matières
    const {
        matieres,
        loading: matieresLoading,
        error: matieresError,
        fetchMatieres,
        clearMatieres
    } = useMatieresData(); // Mode manuel


    useEffect(() => {
        if (showMatiereFilter && selectedClasse && fetchMatieres) {
            console.log('📚 Chargement des matières pour classe ID:', selectedClasse);
            fetchMatieres(selectedClasse);
        } else if (showMatiereFilter && clearMatieres) {
            console.log('🗑️ Nettoyage des matières');
            clearMatieres();
        }
    }, [selectedClasse, fetchMatieres, clearMatieres, showMatiereFilter]);

    const handleSearch = useCallback(() => {
        if (!selectedClasse) {
            setFormError('Veuillez sélectionner une classe');
            return;
        }

        if (!selectedPeriode) {
            setFormError('Veuillez sélectionner une période');
            return;
        }

        setFormError(null);
        if (onSearch) {
            // Construction des paramètres de recherche
            const searchParams = {
                classeId: selectedClasse,
                periodeId: selectedPeriode
            };

            // Ajout conditionnel de la matière si le filtre est activé
            if (showMatiereFilter) {
                searchParams.matiereId = selectedMatiere; // null si rien n'est sélectionné
            }

            console.log('🔍 Paramètres de recherche:', searchParams);
            onSearch(searchParams);
        }
    }, [selectedClasse, selectedPeriode, selectedMatiere, onSearch, showMatiereFilter]);

    const handleClear = useCallback(() => {
        setSelectedClasse(null);
        setSelectedPeriode(null);
        setSelectedMatiere(null);
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = classesLoading || periodesLoading || (showMatiereFilter && matieresLoading);
    const hasDataError = classesError || periodesError || (showMatiereFilter && matieresError);

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête moderne */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 25,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <IconBox icon={FiSearch} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Recherche des Notes par Période
                        {showMatiereFilter && (
                            <Badge color="cyan" style={{ marginLeft: '8px', fontSize: '10px' }}>
                                Filtre matière activé
                            </Badge>
                        )}
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {showMatiereFilter
                            ? 'Sélectionnez une classe, période et optionnellement une matière'
                            : 'Sélectionnez une classe et une période pour afficher les résultats'
                        }
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des données
                    </Message>
                </div>
            )}

            {(formError || error) && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="warning" showIcon style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}>
                        {formError || error?.message}
                    </Message>
                </div>
            )}

            {/* Formulaire adaptatif */}
            <Row gutter={20}>
                <Col xs={24} sm={12} md={showMatiereFilter ? 8 : 10}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Classe *
                        </label>
                        <SelectPicker
                            data={classes}
                            value={selectedClasse}
                            onChange={(value) => {
                                console.log('🏫 Classe sélectionnée:', value);
                                setSelectedClasse(value);
                                // Réinitialiser la matière quand on change de classe
                                if (showMatiereFilter) {
                                    console.log('🔄 Réinitialisation de la matière');
                                    setSelectedMatiere(null);
                                }
                            }}
                            placeholder="Choisir une classe"
                            searchable
                            style={{ width: '100%' }}
                            loading={classesLoading}
                            disabled={classesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                {/* Filtre matière conditionnel */}
                {showMatiereFilter && (
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: 20 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: '500',
                                color: '#475569',
                                fontSize: '14px'
                            }}>
                                Matière {!selectedMatiere && '(toutes les matières)'}
                                <Badge
                                    color="orange"
                                    style={{ marginLeft: '8px', fontSize: '10px' }}
                                >
                                    Optionnel
                                </Badge>
                            </label>
                            <SelectPicker
                                data={matieres.map(matiere => ({
                                    value: matiere.id,
                                    label: matiere.libelle,
                                    id: matiere.id
                                }))}
                                value={selectedMatiere}
                                onChange={(value) => {
                                    console.log('📚 Matière sélectionnée:', value);
                                    setSelectedMatiere(value);
                                }}
                                placeholder={
                                    matieresLoading ? "Chargement..." :
                                        matieres.length === 0 ? "Sélectionnez d'abord une classe" :
                                            "Toutes les matières"
                                }
                                searchable
                                style={{ width: '100%' }}
                                loading={matieresLoading}
                                disabled={!selectedClasse || matieresLoading || loading}
                                cleanable={true}
                                size="lg"
                                renderMenu={menu => {
                                    if (matieres.length === 0 && !matieresLoading) {
                                        return (
                                            <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                                                {selectedClasse ? 'Aucune matière trouvée pour cette classe' : 'Sélectionnez d\'abord une classe'}
                                            </div>
                                        );
                                    }
                                    return menu;
                                }}
                            />
                        </div>
                    </Col>
                )}

                <Col xs={24} sm={12} md={showMatiereFilter ? 8 : 10}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Période *
                        </label>
                        <SelectPicker
                            data={periodes}
                            value={selectedPeriode}
                            onChange={(value) => {
                                console.log('📅 Période sélectionnée:', value);
                                setSelectedPeriode(value);
                            }}
                            placeholder="Choisir une période"
                            searchable
                            style={{ width: '100%' }}
                            loading={periodesLoading}
                            disabled={periodesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: 'transparent',
                            fontSize: '14px'
                        }}>
                            Action
                        </label>
                        <div style={{ display: 'flex', gap: 8, height: '40px' }}>

                            <GradientButton
                                icon={<FiSearch size={16} />}
                                text="Recherche"
                                loadingText="Chargement..."
                                loading={loading}
                                disabled={isDataLoading || loading}
                                onClick={handleSearch}
                                variant="primary"
                                style={{ flex: 1 }}
                            />

                            <Button
                                onClick={handleClear}
                                disabled={loading}
                                style={{
                                    minWidth: '45px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                                size="lg"
                            >
                                <FiRotateCcw size={16} />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Indicateur de progression adaptatif */}
            <div style={{ marginTop: 15 }}>
                <Steps
                    current={
                        selectedClasse ?
                            (selectedPeriode ?
                                (showMatiereFilter ? 3 : 2) :
                                1
                            ) :
                            0
                    }
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Classe" />
                    {showMatiereFilter && <Steps.Item title="Matière" />}
                    <Steps.Item title="Période" />
                    <Steps.Item title="Résultats" />
                </Steps>
            </div>

            {/* Indicateur de contexte */}
            {showMatiereFilter && selectedClasse && (
                <div style={{
                    marginTop: 15,
                    padding: '12px 16px',
                    background: selectedMatiere ? '#f0f9ff' : '#fffbeb',
                    borderRadius: '8px',
                    border: `1px solid ${selectedMatiere ? '#bae6fd' : '#fed7aa'}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10
                }}>
                    <span style={{ fontSize: '16px' }}>
                        {selectedMatiere ? '🎯' : '📚'}
                    </span>
                    <span style={{
                        fontSize: '13px',
                        color: selectedMatiere ? '#0369a1' : '#92400e',
                        fontWeight: '500'
                    }}>
                        {selectedMatiere
                            ? `Recherche ciblée sur une matière spécifique`
                            : `Recherche sur toutes les matières de la classe`
                        }
                    </span>
                </div>
            )}

            {/* Loading indicator discret */}
            {isDataLoading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 15,
                    padding: '10px 15px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <Loader size="xs" />
                    <span style={{ fontSize: '14px', color: '#0369a1' }}>
                        Chargement des données...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT STATISTIQUES ENRICHI (INCHANGÉ)
// ===========================
const StatsPanel = ({ stats, classeInfo, searchContext }) => {
    if (!stats || !classeInfo) return null;

    const statsData = [
        {
            label: 'Classe',
            value: classeInfo.libelle,
            icon: '🏫',
            color: '#3b82f6',
            bg: '#eff6ff'
        },
        {
            label: 'Effectif',
            value: stats.totalEtudiants,
            icon: '👥',
            color: '#06b6d4',
            bg: '#ecfeff'
        },
        {
            label: 'Moyenne',
            value: `${stats.moyenneClasse}/20`,
            icon: '📊',
            color: '#8b5cf6',
            bg: '#f3f4f6'
        },
        {
            label: 'Note Min',
            value: `${stats.noteMin}/20`,
            icon: '📉',
            color: '#ef4444',
            bg: '#fef2f2'
        },
        {
            label: 'Note Max',
            value: `${stats.noteMax}/20`,
            icon: '📈',
            color: '#10b981',
            bg: '#f0fdf4'
        },
        {
            label: 'Admis',
            value: `${stats.etudiantsAdmis}/${stats.totalEtudiants}`,
            icon: '✅',
            color: stats.etudiantsAdmis > stats.totalEtudiants / 2 ? '#10b981' : '#f59e0b',
            bg: stats.etudiantsAdmis > stats.totalEtudiants / 2 ? '#f0fdf4' : '#fffbeb'
        }
    ];

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête enrichi */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiBarChart size={18} color="white" />
                </div>
                <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Statistiques de la Classe
                        {searchContext?.showMatiereFilter && (
                            <Badge
                                color={searchContext.matiereId ? "blue" : "orange"}
                                style={{ marginLeft: '8px', fontSize: '10px' }}
                            >
                                {searchContext.matiereId ? "Matière spécifique" : "Toutes matières"}
                            </Badge>
                        )}
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Aperçu des performances et effectifs
                        {searchContext?.selectedMatiereLabel && (
                            <span style={{ marginLeft: '8px', fontStyle: 'italic' }}>
                                • {searchContext.selectedMatiereLabel}
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Grille des statistiques */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '15px'
            }}>
                {statsData.map((stat, index) => (
                    <div
                        key={index}
                        style={{
                            background: stat.bg,
                            borderRadius: '12px',
                            padding: '16px',
                            border: `1px solid ${stat.color}20`,
                            transition: 'all 0.3s ease',
                            cursor: 'default'
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.transform = 'translateY(-2px)';
                            e.target.style.boxShadow = `0 8px 25px ${stat.color}15`;
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.transform = 'translateY(0)';
                            e.target.style.boxShadow = 'none';
                        }}
                    >
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            marginBottom: 8
                        }}>
                            <span style={{ fontSize: '20px' }}>{stat.icon}</span>
                            <span style={{
                                fontSize: '13px',
                                fontWeight: '500',
                                color: '#64748b',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px'
                            }}>
                                {stat.label}
                            </span>
                        </div>
                        <div style={{
                            fontSize: '18px',
                            fontWeight: '700',
                            color: stat.color
                        }}>
                            {stat.value}
                        </div>
                    </div>
                ))}
            </div>

            {/* Barre de progression pour les admis */}
            <div style={{
                marginTop: 20,
                padding: '15px',
                background: '#f8fafc',
                borderRadius: '10px',
                border: '1px solid #e2e8f0'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: '#475569' }}>
                        Taux de Réussite
                    </span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
                        {((stats.etudiantsAdmis / stats.totalEtudiants) * 100).toFixed(1)}%
                    </span>
                </div>
                <div style={{
                    width: '100%',
                    height: '8px',
                    background: '#e2e8f0',
                    borderRadius: '4px',
                    overflow: 'hidden'
                }}>
                    <div style={{
                        width: `${(stats.etudiantsAdmis / stats.totalEtudiants) * 100}%`,
                        height: '100%',
                        background: stats.etudiantsAdmis > stats.totalEtudiants / 2
                            ? 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
                            : 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
                        borderRadius: '4px',
                        transition: 'width 0.5s ease'
                    }}></div>
                </div>
            </div>
        </div>
    );
};

// ===========================
// CONFIGURATION DES COLONNES POUR MODE ÉTUDIANT (INCHANGÉ)
// ===========================
const getStudentTableColumns = (profil) => {
    const columns = [];

    if (profil === 'Professeur') {
        // ORDRE DEMANDÉ : Matricule, Photo, Matière, Note, Coefficient, Moyenne générale, Rang, Appréciation, Classé

        // 1. MATRICULE
        columns.push({
            title: 'Matricule',
            dataKey: 'matricule',
            cellType: 'custom',
            flexGrow: 2,
            minWidth: 120,
            sortable: true,
            customRenderer: (rowData, value) => (
                <div style={{
                    fontFamily: 'monospace',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    color: '#495057',
                    textAlign: 'center'
                }}>
                    {value}
                </div>
            )
        });

        // 2. PHOTO
        columns.push({
            title: 'Photo',
            dataKey: 'urlPhoto',
            cellType: 'custom',
            flexGrow: 1,
            minWidth: 100,
            width: 100,
            sortable: false,
            customRenderer: (rowData, value) => (
                <div style={{
                    width: '45px',
                    height: '45px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f0f0f0',
                    margin: '0 auto'
                }}>
                    {value ? (
                        <img
                            src={value}
                            alt="Photo profil"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover'
                            }}
                            onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentNode.innerHTML = '👤';
                            }}
                        />
                    ) : (
                        <span style={{ fontSize: '20px', color: '#666' }}>👤</span>
                    )}
                </div>
            )
        });

        // 3. NOM ET PRÉNOM (ajouté pour clarté)
        columns.push({
            title: 'Nom & Prénom',
            dataKey: 'nom',
            cellType: 'custom',
            flexGrow: 3,
            minWidth: 280,
            sortable: true,
            customRenderer: (rowData, value) => (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                }}>
                    <div style={{
                        fontWeight: '600',
                        color: '#1e293b',
                        fontSize: '14px'
                    }}>
                        {rowData.nom || ''}
                    </div>
                    <div style={{
                        fontSize: '13px',
                        color: '#64748b',
                        fontWeight: '500'
                    }}>
                        {rowData.prenom || ''}
                    </div>
                </div>
            )
        });

        // 4. MATIÈRES
        columns.push({
            title: 'Matières',
            dataKey: 'matieres',
            cellType: 'custom',
            flexGrow: 3,
            minWidth: 200,
            sortable: false,
            customRenderer: (rowData, value) => {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return (
                        <div style={{
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            color: '#64748b',
                            fontSize: '12px',
                            textAlign: 'center'
                        }}>
                            Aucune matière
                        </div>
                    );
                }

                return (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '100px',
                        overflowY: 'auto'
                    }}>
                        {value.map((matiere, index) => (
                            <div key={index} style={{
                                background: '#f1f5f9',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{
                                    fontWeight: '600',
                                    color: '#475569',
                                    fontSize: '12px'
                                }}>
                                    {matiere.libelle}
                                </div>
                            </div>
                        ))}
                    </div>
                );
            }
        });

        // 5. NOTES
        columns.push({
            title: 'Notes',
            dataKey: 'matieres',
            cellType: 'custom',
            flexGrow: 4,
            minWidth: 350,
            sortable: false,
            customRenderer: (rowData, value) => {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return (
                        <div style={{
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            color: '#64748b',
                            fontSize: '12px',
                            textAlign: 'center'
                        }}>
                            Aucune note
                        </div>
                    );
                }

                return (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '100px',
                        overflowY: 'auto'
                    }}>
                        {value.map((matiere, index) => (
                            <div key={index} style={{
                                background: '#f8fafc',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                {matiere.notes && matiere.notes.length > 0 ? (
                                    <div style={{
                                        display: 'flex',
                                        flexWrap: 'wrap',
                                        gap: '3px'
                                    }}>
                                        {matiere.notes.map((note, noteIndex) => (
                                            <span
                                                key={noteIndex}
                                                color={getNoteColor(note.note, note.noteSur)}
                                                style={{ fontSize: '12px', marginRight: '5px' }}
                                            >
                                                {note.note}/{note.noteSur}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{
                                        fontSize: '10px',
                                        color: '#94a3b8',
                                        fontStyle: 'italic'
                                    }}>
                                        Pas de notes
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                );
            }
        });

        // 6. COEFFICIENTS
        columns.push({
            title: 'Coefficients',
            dataKey: 'matieres',
            cellType: 'custom',
            flexGrow: 2,
            minWidth: 120,
            sortable: false,
            customRenderer: (rowData, value) => {
                if (!value || !Array.isArray(value) || value.length === 0) {
                    return (
                        <div style={{
                            padding: '8px',
                            background: '#f8fafc',
                            borderRadius: '6px',
                            color: '#64748b',
                            fontSize: '12px',
                            textAlign: 'center'
                        }}>
                            N/A
                        </div>
                    );
                }

                return (
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px',
                        maxHeight: '100px',
                        overflowY: 'auto'
                    }}>
                        {value.map((matiere, index) => (
                            <div key={index} style={{
                                background: '#fef3c7',
                                borderRadius: '4px',
                                padding: '6px 8px',
                                border: '1px solid #fbbf24',
                                textAlign: 'center'
                            }}>

                                <Badge color="yellow" style={{ fontSize: '10px' }}>
                                    Coef: {matiere.coefficient || 1}
                                </Badge>
                            </div>
                        ))}
                    </div>
                );
            }
        });

        // 7. MOYENNE GÉNÉRALE
        columns.push({
            title: 'Moy. Coéf',
            dataKey: 'moyenneGenerale',
            flexGrow: 2,
            minWidth: 120,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => (
                <div style={{ textAlign: 'center' }}>
                    <Badge
                        color={getNoteColor(value, 20)}
                        style={{ fontSize: '12px', fontWeight: 'bold' }}
                    >
                        {parseFloat(value).toFixed(2)}/20
                    </Badge>
                </div>
            )
        });

        // 8. RANG
        columns.push({
            title: 'Rang',
            dataKey: 'rang',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => {
                const getRangBadgeColor = (rang) => {
                    if (rang === '1' || rang === 1) return 'green';
                    if (parseInt(rang) <= 3) return 'blue';
                    if (parseInt(rang) <= 10) return 'cyan';
                    return 'gray';
                };

                return (
                    <div style={{ textAlign: 'center' }}>
                        <Badge color={getRangBadgeColor(value)}>
                            {value}{value === '1' || value === 1 ? 'er' : 'ème'}
                        </Badge>
                    </div>
                );
            }
        });

        // 9. APPRÉCIATION
        columns.push({
            title: 'Appréciation',
            dataKey: 'appreciation',
            flexGrow: 2,
            minWidth: 70,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => (
                <div style={{
                    // maxWidth: '80px',
                    // overflow: 'hidden',
                    // textOverflow: 'ellipsis',
                    // whiteSpace: 'nowrap'
                }}>
                    <Badge
                        color={getAppreciationColor(value)}
                        style={{
                            fontSize: '12px',
                            // overflow: 'hidden',
                            // textOverflow: 'ellipsis'
                        }}
                        title={value} // Tooltip pour voir le texte complet
                    >
                        {value || 'Non définie'}
                    </Badge>
                </div>
            )
        });

        // 10. CLASSÉ
        columns.push({
            title: 'Classé',
            dataKey: 'isClassed',
            flexGrow: 1,
            minWidth: 80,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => (
                <div style={{ textAlign: 'center' }}>
                    <Badge color={value === 'O' ? 'green' : 'red'}>
                        {value === 'O' ? 'Oui' : 'Non'}
                    </Badge>
                </div>
            )
        });

    } else {
        // Pour les autres profils : configuration normale (inchangée)
        columns.push({
            title: 'Photo',
            dataKey: 'urlPhoto',
            cellType: 'student-photo',
            flexGrow: 1,
            minWidth: 50,
            width: 50,
            sortable: false
        });

        columns.push({
            title: 'Nom',
            dataKey: 'nom',
            cellType: 'student-name',
            flexGrow: 6,
            minWidth: 200,
            sortable: true
        });

        // Colonnes communes pour les autres profils
        columns.push(
            {
                title: 'Matricule',
                dataKey: 'matricule',
                cellType: 'custom',
                flexGrow: 2,
                minWidth: 150,
                sortable: true,
                customRenderer: (rowData, value) => (
                    <div style={{
                        fontFamily: 'monospace',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        color: '#495057'
                    }}>
                        {value}
                    </div>
                )
            },
            {
                title: 'Moy. Géné.',
                dataKey: 'moyenneGenerale',
                flexGrow: 1,
                minWidth: 100,
                sortable: true,
                cellType: 'badge',
                badgeColorMap: (value) => getNoteColor(value, 20)
            },
            {
                title: 'Rang',
                dataKey: 'rang',
                flexGrow: 1,
                minWidth: 100,
                sortable: true,
                cellType: 'custom',
                customRenderer: (rowData, value) => {
                    const getRangBadgeColor = (rang) => {
                        if (rang === '1' || rang === 1) return 'green';
                        if (parseInt(rang) <= 3) return 'blue';
                        if (parseInt(rang) <= 10) return 'cyan';
                        return 'gray';
                    };

                    return (
                        <Badge color={getRangBadgeColor(value)}>
                            {value}{value === '1' || value === 1 ? 'er' : 'ème'}
                        </Badge>
                    );
                }
            },
            {
                title: 'Appréciation',
                dataKey: 'appreciation',
                flexGrow: 2,
                minWidth: 150,
                sortable: true,
                cellType: 'badge',
                badgeColorMap: (value) => getAppreciationColor(value)
            }
        );

        // Ajout conditionnel des colonnes d'absence
        columns.push(
            {
                title: 'Abs. Just.',
                dataKey: 'absencesJustifiees',
                cellType: 'student-absence-justifiee',
                flexGrow: 1,
                minWidth: 120,
                sortable: true
            },
            {
                title: 'Abs. Non Just.',
                dataKey: 'absencesNonJustifiees',
                cellType: 'student-absence-non-justifiee',
                flexGrow: 1,
                minWidth: 120,
                sortable: true
            }
        );

        // Dernière colonne pour les autres profils
        columns.push({
            title: 'Est classé',
            dataKey: 'isClassed',
            flexGrow: 1,
            minWidth: 100,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => (
                <Badge color={value === 'O' ? 'green' : 'red'}>
                    {value === 'O' ? 'Oui' : 'Non'}
                </Badge>
            )
        });
    }

    return columns;
};


// ===========================
// COMPOSANT PRINCIPAL MODIFIÉ AVEC API D'ABSENCE
// ===========================
const NoteEtMoyenne = ({ profil, showMatiereFilter = false }) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [savingAbsences, setSavingAbsences] = useState(new Set()); // Pour tracking des sauvegardes en cours

    // Hook pour les notifications rsuite

    const TableComponent = profil === 'Fondateur' ? DataTableExtended : DataTable; // Changer de datatable en fonction du profil

    // Récupération des paramètres dynamiques
    const {
        periodicitieId: dynamicPeriodicitieId,
        personnelInfo: personnelInfo,
        academicYearId: dynamicAcademicYearId,
        ecoleId: dynamicEcoleId
    } = usePulsParams();

    // Hook modifié pour prendre en compte showMatiereFilter
    const {
        etudiants,
        classeInfo,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchNotes,
        clearResults,
        updateStudentData,
        searchContext
    } = useNoteSearch(profil, showMatiereFilter);

    // État pour stocker la période actuelle pour les appels API
    const [currentSearchParams, setCurrentSearchParams] = useState(null);

    // Fonction handleSearch modifiée pour passer le matiereId
    const handleSearch = useCallback(async (params) => {
        console.log('🔍 Lancement de la recherche avec paramètres:', {
            ...params,
            showMatiereFilter,
            context: 'NoteEtMoyenne'
        });

        // Stockage des paramètres pour les appels d'absence
        setCurrentSearchParams(params);

        // Appel modifié pour inclure le matiereId
        await searchNotes(
            params.classeId,
            params.periodeId,
            showMatiereFilter ? params.matiereId : null
        );
    }, [searchNotes, showMatiereFilter]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setCurrentSearchParams(null);
        clearResults();
    }, [clearResults]);

    // ===========================
    // FONCTION CORRIGÉE POUR GÉRER LES ABSENCES AVEC API
    // ===========================
    const handleAbsenceChange = useCallback(async (etudiantId, field, value) => {
        console.log('📝 Changement d\'absence pour étudiant:', etudiantId, field, value);

        // Vérification des prérequis
        if (!currentSearchParams || !classeInfo || !dynamicAcademicYearId) {
            toaster.push(
                <Message type="error" showIcon closable>
                    <strong>Erreur</strong><br />
                    Impossible de sauvegarder : informations de contexte manquantes
                </Message>,
                { placement: 'topEnd', duration: 5000 }
            );
            return;
        }

        // Recherche de l'étudiant dans la liste
        const etudiant = etudiants.find(e => e.id === etudiantId);
        if (!etudiant) {
            toaster.push(
                <Message type="error" showIcon closable>
                    <strong>Erreur</strong><br />
                    Étudiant non trouvé dans la liste
                </Message>,
                { placement: 'topEnd', duration: 5000 }
            );
            return;
        }

        // Prévention des appels multiples
        const savingKey = `${etudiantId}-${field}`;
        if (savingAbsences.has(savingKey)) {
            console.log('⏳ Sauvegarde déjà en cours pour:', savingKey);
            return;
        }

        try {
            // Marquage comme en cours de sauvegarde
            setSavingAbsences(prev => new Set([...prev, savingKey]));

            // Mise à jour immédiate de l'état local via le hook
            console.log('🔄 Mise à jour optimiste locale:', { [field]: parseInt(value) || 0 });
            updateStudentData(etudiantId, { [field]: parseInt(value) || 0 });

            // Notification de début de sauvegarde
            toaster.push(
                <Message type="info" showIcon closable>
                    <strong>Sauvegarde en cours...</strong><br />
                    Mise à jour de l'absence pour {etudiant.prenom} {etudiant.nom}
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );

            // Appel API avec les données mises à jour
            const etudiantUpdated = { ...etudiant, [field]: parseInt(value) || 0 };
            const result = await saveAbsenceToAPI(
                etudiantUpdated,
                classeInfo,
                currentSearchParams.periodeId,
                dynamicAcademicYearId,
                field,
                value
            );

            if (result.success) {
                // Succès
                toaster.push(
                    <Message type="success" showIcon closable>
                        <strong>Succès !</strong><br />
                        Absence mise à jour pour {etudiant.prenom} {etudiant.nom}
                    </Message>,
                    { placement: 'topEnd', duration: 4000 }
                );

                console.log('✅ Absence sauvegardée avec succès:', result.data);
            } else {
                // Échec - annuler la mise à jour optimiste
                console.error('❌ Échec sauvegarde absence:', result.error);

                // Restaurer l'ancienne valeur
                updateStudentData(etudiantId, { [field]: etudiant[field] });

                toaster.push(
                    <Message type="error" showIcon closable>
                        <strong>Erreur de sauvegarde</strong><br />
                        {result.error || 'Impossible de sauvegarder l\'absence'}
                    </Message>,
                    { placement: 'topEnd', duration: 6000 }
                );
            }

        } catch (error) {
            console.error('❌ Erreur inattendue lors de la sauvegarde:', error);

            // Restaurer l'ancienne valeur en cas d'erreur
            updateStudentData(etudiantId, { [field]: etudiant[field] });

            toaster.push(
                <Message type="error" showIcon closable>
                    <strong>Erreur inattendue</strong><br />
                    Une erreur s'est produite lors de la sauvegarde
                </Message>,
                { placement: 'topEnd', duration: 6000 }
            );
        } finally {
            // Retrait du marquage de sauvegarde en cours
            setSavingAbsences(prev => {
                const newSet = new Set([...prev]);
                newSet.delete(savingKey);
                return newSet;
            });
        }
    }, [currentSearchParams, classeInfo, dynamicAcademicYearId, etudiants, savingAbsences, updateStudentData]);


    const handleNoteChange = useCallback((etudiantId, matiereId, noteId, value) => {
        console.log('📝 Changement de note:', etudiantId, matiereId, noteId, value);
        // Ici vous pouvez ajouter la logique pour sauvegarder les notes
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const calculateGlobalStats = () => {
        if (!etudiants || etudiants.length === 0) return null;

        const moyennes = etudiants.map(e => parseFloat(e.moyenneGenerale) || 0);

        return {
            totalEtudiants: etudiants.length,
            moyenneClasse: (moyennes.reduce((a, b) => a + b, 0) / moyennes.length).toFixed(2),
            noteMin: Math.min(...moyennes).toFixed(2),
            noteMax: Math.max(...moyennes).toFixed(2),
            etudiantsAdmis: etudiants.filter(e => parseFloat(e.moyenneGenerale) >= 10).length
        };
    };

    const globalStats = calculateGlobalStats();

    // Configuration des filtres
    const filterConfigs = [
        {
            field: 'sexe',
            label: 'Sexe',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'appreciation',
            label: 'Appréciation',
            type: 'select',
            dynamic: true,
            tagColor: 'cyan'
        },
        {
            field: 'isClassed',
            label: 'Est classé',
            type: 'select',
            options: [
                { label: 'Tous', value: '' },
                { label: 'Oui', value: 'O' },
                { label: 'Non', value: 'N' }
            ],
            tagColor: 'green'
        }
    ];

    const searchableFields = ['nom', 'prenom', 'matricule', 'sexe'];

    return (
        <div style={{

            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Formulaire de recherche amélioré */}
                <div className="row">
                    <div className="col-lg-12">
                        <SearchForm
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            showMatiereFilter={showMatiereFilter}
                        />
                    </div>
                </div>

                {/* Statistiques enrichies */}
                {searchPerformed && globalStats && classeInfo && (
                    <div className="row">
                        <div className="col-lg-12">
                            <StatsPanel
                                stats={globalStats}
                                classeInfo={classeInfo}
                                searchContext={classeInfo.searchContext}
                            />
                        </div>
                    </div>
                )}

                {/* Message d'information adaptatif */}
                {!searchPerformed && !searchLoading && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiBook size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les notes ?
                                        {showMatiereFilter && (
                                            <Badge color="cyan" style={{ marginLeft: '8px', fontSize: '10px' }}>
                                                Mode filtré
                                            </Badge>
                                        )}
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        {showMatiereFilter
                                            ? 'Sélectionnez une classe, période et optionnellement une matière dans le formulaire ci-dessus'
                                            : 'Sélectionnez une classe et une période dans le formulaire ci-dessus pour démarrer'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Erreur de recherche enrichie */}
                {searchError && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15, marginBottom: 15 }}>
                                    <div style={{
                                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                                        borderRadius: '12px',
                                        padding: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <span style={{ fontSize: '24px' }}>⚠️</span>
                                    </div>
                                    <div>
                                        <h6 style={{ margin: 0, color: '#dc2626', fontWeight: '600' }}>
                                            Erreur de recherche
                                        </h6>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                            {searchError.message}
                                        </p>
                                    </div>
                                </div>

                                {/* Informations de debug si disponibles */}
                                {searchError.context && (
                                    <div style={{
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                        padding: '12px',
                                        border: '1px solid #e2e8f0'
                                    }}>
                                        <div style={{ fontSize: '12px', color: '#64748b', fontFamily: 'monospace' }}>
                                            <strong>Contexte:</strong> {JSON.stringify(searchError.context, null, 2)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DataTable avec style amélioré */}
                {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <TableComponent
                                    // Configuration de base
                                    title={`Notes et Moyennes par Étudiant${showMatiereFilter ? ' (Mode Filtré)' : ''}`}
                                    subtitle="étudiant(s)"

                                    // Mode étudiant
                                    displayMode="student"

                                    // Données
                                    data={etudiants}
                                    loading={searchLoading}
                                    error={null}

                                    // Configuration des colonnes
                                    columns={getStudentTableColumns(profil)}

                                    // Configuration des filtres
                                    searchableFields={searchableFields}
                                    filterConfigs={filterConfigs}

                                    // Pagination
                                    defaultPageSize={20}
                                    pageSizeOptions={[10, 20, 50]}
                                    tableHeight={700}

                                    // Actions et callbacks
                                    onRefresh={handleRefresh}
                                    onAbsenceChange={handleAbsenceChange}
                                    onNoteChange={handleNoteChange}

                                    // Configuration additionnelle
                                    enableRefresh={false}
                                    enableCreate={false}
                                    selectable={false}
                                    rowKey="id"

                                    // Largeur minimale pour scroll horizontal
                                    minTableWidth={1300}

                                    // Rendu personnalisé pour les badges de notes
                                    cellRenderer={{
                                        note: (value, rowData) => (
                                            <Badge
                                                color={getNoteColor(value, rowData.note_sur || 20)}
                                                style={{ fontSize: '0.9em' }}
                                            >
                                                {value}/{rowData.note_sur || 20}
                                            </Badge>
                                        ),
                                        moyenne: (value) => (
                                            <Badge
                                                color={getNoteColor(value, 20)}
                                                style={{ fontSize: '0.9em' }}
                                            >
                                                {parseFloat(value).toFixed(2)}/20
                                            </Badge>
                                        )
                                    }}

                                    // Styles personnalisés
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "600px", border: "none", boxShadow: "none" },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Aucun résultat - style moderne */}
                {searchPerformed && etudiants?.length === 0 && !searchLoading && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(245, 158, 11, 0.15)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <span style={{ fontSize: '40px' }}>📚</span>
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucun étudiant trouvé
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Aucun résultat pour cette classe et période{showMatiereFilter ? ' avec la matière sélectionnée' : ''}.
                                    Vérifiez vos critères de recherche.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NoteEtMoyenne;