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
    Modal,
    Notification,
    toaster
} from 'rsuite';
import {
    FiSearch,
    FiRotateCcw,
    FiUser,
    FiUsers,
    FiBookOpen,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiPhone,
    FiMail,
    FiTrash2
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import AffecterMatiereProfesseurModal from './AffecterMatiereProfesseurModal';
import ProfesseurDetailModal from './ProfesseurDetailModal';
import {
    useProfesseurMatiereData,
    professeurMatiereTableConfig
} from './ProfesseurMatiereService';
import { useMatieresEcoleData } from "../utils/CommonDataService";
import { useAllApiUrls } from '../utils/apiConfig';
import { getUserProfile } from "../../hooks/userUtils";
import IconBox from "../Composant/IconBox";
import StatistiquesProfesseurMatiere from './StatistiquesProfesseurMatiere';


// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE
// ===========================
const ProfesseurMatiereFilters = ({
    onSearch,
    onClear,
    loading = false,
    error = null,
    selectedMatiere,
    onMatiereChange
}) => {
    const [formError, setFormError] = useState(null);
    const userProfile = getUserProfile();

    const { matieres, matieresLoading, matieresError, refetch } = useMatieresEcoleData();

    const handleSearch = useCallback(() => {
        if (!selectedMatiere) {
            setFormError('Veuillez sélectionner une matière');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({ matiereId: selectedMatiere });
        }
    }, [selectedMatiere, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const isDataLoading = matieresLoading;
    const hasDataError = matieresError;

    // Préparation des données pour SelectPicker
    const matieresData = matieres.map(matiere => ({
        value: matiere.id,
        label: matiere.label
    }));

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
                <IconBox icon={FiUsers} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Affectations Professeur - Matière
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez une matière pour voir les professeurs affectés
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des matières
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

            {/* Formulaire de filtres */}
            <Row gutter={20}>
                <Col xs={24} sm={16} md={14}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Matière *
                        </label>
                        <SelectPicker
                            data={matieresData}
                            value={selectedMatiere}
                            onChange={(value) => {
                                onMatiereChange(value);
                            }}
                            placeholder="Choisir une matière"
                            searchable
                            style={{ width: '100%' }}
                            loading={matieresLoading}
                            disabled={matieresLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={8} md={6}>
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
                            <Button
                                appearance="primary"
                                onClick={handleSearch}
                                loading={loading}
                                disabled={isDataLoading || loading || !selectedMatiere}
                                style={{
                                    flex: 1,
                                    //background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                }}
                                size="lg"
                                className={`${userProfile}-btn-search`}
                            >
                                {loading ? 'Chargement...' : 'Afficher'}
                            </Button>

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

            {/* Indicateur de progression */}
            <div style={{ marginTop: 15 }}>
                <Steps
                    current={selectedMatiere ? 1 : 0}
                    size="small"
                    style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}
                >
                    <Steps.Item title="Matière" />
                    <Steps.Item title="Professeurs" />
                </Steps>
            </div>

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
                        Chargement des matières...
                    </span>
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const ProfesseurMatiereStatsHeader = ({ affectations, loading, selectedMatiereInfo }) => {
    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '20px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(102, 126, 234, 0.1)',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Loader size="sm" />
                    <span>Chargement des affectations...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalAffectations = affectations.length;
    const professeurs = affectations.filter(a => a.isProfesseur).length;
    const autresPersonnels = totalAffectations - professeurs;
    const classesAffectees = [...new Set(affectations.map(a => a.classe_id))].length;

    // Répartition par genre
    const masculins = affectations.filter(a => a.personnel_sexe === 'MASCULIN').length;
    const feminins = affectations.filter(a => a.personnel_sexe === 'FEMININ').length;

    // Fonctions représentées
    const fonctions = [...new Set(affectations.map(a => a.fonction_libelle))];

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiBookOpen size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Affectations pour la matière
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {totalAffectations} affectation(s) • {classesAffectees} classe(s) • {fonctions.length} fonction(s)
                    </p>
                </div>
            </div>

            {/* Statistiques en grille */}
            <Row gutter={16}>
                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
                            {totalAffectations}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Affectations
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                            {professeurs}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Professeurs
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fdf2f8',
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>
                            {feminins}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: '500' }}>
                            Femmes
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={6} md={3}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                        border: '1px solid #c7d2fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                            {masculins}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                            Hommes
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {fonctions.slice(0, 4).map((fonction, index) => (
                    <Badge
                        key={fonction}
                        color={['green', 'blue', 'orange', 'violet'][index % 4]}
                        style={{ fontSize: '11px' }}
                    >
                        {fonction}
                    </Badge>
                ))}
                {fonctions.length > 4 && (
                    <Badge color="gray" style={{ fontSize: '11px' }}>
                        +{fonctions.length - 4} autres fonctions
                    </Badge>
                )}
                <div style={{ marginLeft: 'auto', fontSize: '12px', color: '#64748b' }}>
                    {classesAffectees} classe(s) concernée(s)
                </div>
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL PROFESSEUR-MATIÈRE
// ===========================
const ProfesseurMatiere = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedMatiereInfo, setSelectedMatiereInfo] = useState(null);
    const [affectationModalVisible, setAffectationModalVisible] = useState(false);
    const apiUrls = useAllApiUrls();

    // États pour le modal de détail
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedProfesseur, setSelectedProfesseur] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        affectations,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchAffectations,
        clearResults
    } = useProfesseurMatiereData();

    // Hook pour récupérer les matières
    const { matieres } = useMatieresEcoleData(139);

    // ===========================
    // GESTION DE LA SUPPRESSION
    // ===========================
    const handleDeleteAffectation = useCallback(async (affectation) => {
        console.log('🗑️ [DELETE] Début de la suppression:', affectation);
        
        try {
            // Vérification de l'objet affectation
            if (!affectation || !affectation.id) {
                console.error('❌ [DELETE] Affectation invalide:', affectation);
                throw new Error('Affectation invalide ou ID manquant');
            }

            console.log('✅ [DELETE] Affectation valide, ID:', affectation.id);

            // Demande de confirmation
            console.log('🔔 [DELETE] Affichage de la confirmation...');
            const result = await Swal.fire({
                title: 'Confirmer la suppression',
                html: `
                    <div style="text-align: left; margin: 20px 0;">
                        <p>Vous êtes sur le point de supprimer cette affectation :</p>
                        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
                            <strong>Professeur :</strong> ${affectation.personnel_nomComplet}<br>
                            <strong>Classe :</strong> ${affectation.classe_libelle}<br>
                            <strong>Matière :</strong> ${affectation.matiere_libelle}
                        </div>
                        <p style="color: #dc2626; font-weight: 500;">Cette action est irréversible.</p>
                    </div>
                `,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#ef4444',
                cancelButtonColor: '#6b7280',
                confirmButtonText: 'Oui, supprimer',
                cancelButtonText: 'Annuler',
                reverseButtons: true,
                customClass: {
                    popup: 'swal-wide'
                }
            });

            console.log('🔔 [DELETE] Résultat confirmation:', result.isConfirmed);

            if (!result.isConfirmed) {
                console.log('❌ [DELETE] Suppression annulée par l\'utilisateur');
                return;
            }

            console.log('✅ [DELETE] Confirmation OK, début de la suppression...');

            // Affichage du loading pendant la suppression
            Swal.fire({
                title: 'Suppression en cours...',
                html: `
                    <div style="text-align: center;">
                        <p>Suppression de l'affectation de <strong>${affectation.personnel_nomComplet}</strong></p>
                        <p style="color: #64748b; font-size: 14px;">Veuillez patienter...</p>
                    </div>
                `,
                icon: 'info',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            // Vérification de l'URL de l'API
            console.log('🔍 [DELETE] Vérification de apiUrls.personnel:', apiUrls.personnel);
            
            if (!apiUrls.personnel || !apiUrls.personnel.deleteByStatus) {
                console.error('❌ [DELETE] apiUrls.personnel.deleteByStatus n\'existe pas!');
                throw new Error('Configuration API manquante pour la suppression');
            }

            const deleteUrl = apiUrls.personnel.deleteByStatus();
            console.log('🌐 [DELETE] URL de suppression:', deleteUrl);

            if (!deleteUrl) {
                console.error('❌ [DELETE] L\'URL de suppression est vide!');
                throw new Error('URL de suppression invalide');
            }

            // Préparer les données pour l'API
            const deleteData = {
                id: affectation.id,
                status: 'DELETED',
                updatedBy: 'USER_CURRENT',
                updatedDate: new Date().toISOString()
            };

            console.log('📦 [DELETE] Données à envoyer:', deleteData);
            console.log('🚀 [DELETE] Envoi de la requête PUT vers:', deleteUrl);

            // Appel API pour supprimer
            const response = await axios.put(deleteUrl, deleteData);

            console.log('✅ [DELETE] Réponse reçue:', response.status, response.data);

            if (response.status === 200 || response.status === 204) {
                console.log('🎉 [DELETE] Suppression réussie!');
                
                await Swal.fire({
                    icon: 'success',
                    title: 'Affectation supprimée !',
                    html: `
                        <div style="text-align: center;">
                            <p>L'affectation de <strong>${affectation.personnel_nomComplet}</strong> a été supprimée avec succès.</p>
                        </div>
                    `,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                // Actualiser les données
                console.log('🔄 [DELETE] Actualisation des données...');
                if (selectedMatiere && searchPerformed) {
                    await searchAffectations(selectedMatiere);
                    console.log('✅ [DELETE] Données actualisées');
                } else {
                    console.log('⚠️ [DELETE] Pas de matière sélectionnée, pas d\'actualisation');
                }
            } else {
                console.error('❌ [DELETE] Statut de réponse inattendu:', response.status);
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('💥 [DELETE] ERREUR CAPTURÉE:', error);
            console.error('💥 [DELETE] Type d\'erreur:', error.constructor.name);
            console.error('💥 [DELETE] Message:', error.message);
            console.error('💥 [DELETE] Stack:', error.stack);

            // Fermer le modal de loading si ouvert
            Swal.close();

            let errorMessage = 'Une erreur inattendue est survenue lors de la suppression.';

            if (error.response) {
                console.error('💥 [DELETE] Erreur response:', error.response);
                console.error('💥 [DELETE] Status:', error.response.status);
                console.error('💥 [DELETE] Data:', error.response.data);
                
                if (error.response.status === 400) {
                    errorMessage = 'Impossible de supprimer cette affectation. Données invalides.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Affectation non trouvée ou déjà supprimée.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Impossible de supprimer cette affectation. Elle est peut-être utilisée ailleurs.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = `Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                console.error('💥 [DELETE] Erreur request (pas de réponse):', error.request);
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                console.error('💥 [DELETE] Timeout');
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            } else {
                console.error('💥 [DELETE] Autre erreur:', error.message);
                errorMessage = `Erreur: ${error.message}`;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur de suppression',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        }
    }, [selectedMatiere, searchPerformed, searchAffectations, apiUrls.personnel]);

    // ===========================
    // GESTION DE LA RECHERCHE
    // ===========================
    const handleSearch = useCallback(async ({ matiereId }) => {
        console.log('🔍 Lancement de la recherche des affectations:', { matiereId });

        // Récupérer les infos de la matière sélectionnée
        const matiereInfo = matieres.find(m => m.id === matiereId);
        setSelectedMatiereInfo(matiereInfo);

        await searchAffectations(matiereId);
    }, [searchAffectations, matieres]);

    const handleClearSearch = useCallback(() => {
        console.log('🗑️ Effacement des résultats de recherche');
        setSelectedMatiere(null);
        setSelectedMatiereInfo(null);
        clearResults();
    }, [clearResults]);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        switch (actionType) {
            case 'edit':
                if (item && item.id) {
                    navigate(`/professeurs/affectations/edit/${item.id}`);
                }
                break;

            case 'view':
                if (item && item.personnel_id) {
                    console.log('📊 Ouverture du modal détail pour le professeur:', item.personnel_nomComplet);
                    setSelectedProfesseur(item);
                    setDetailModalVisible(true);
                }
                break;

            case 'delete':
                // Supprimer l'affectation
                if (item && item.id) {
                    handleDeleteAffectation(item);
                }
                break;

            case 'create':
                setAffectationModalVisible(true);
                break;

            default:
                handleTableAction(actionType, item);
                break;
        }
    }, [navigate, handleTableAction, handleDeleteAffectation]);

    // ===========================
    // GESTION DU MODAL D'AFFECTATION
    // ===========================
    const handleCreateAffectation = useCallback(() => {
        setAffectationModalVisible(true);
    }, []);

    const handleAffectationModalClose = useCallback(() => {
        setAffectationModalVisible(false);
    }, []);

    const handleAffectationSuccess = useCallback((newAffectation) => {
        // Actualiser les données si une recherche est en cours
        if (selectedMatiere && searchPerformed) {
            searchAffectations(selectedMatiere);
        }
    }, [selectedMatiere, searchPerformed, searchAffectations]);

    // ===========================
    // GESTION DU MODAL DE DÉTAIL
    // ===========================
    const handleDetailModalClose = useCallback(() => {
        console.log('🔒 Fermeture du modal détail');
        setDetailModalVisible(false);
        setSelectedProfesseur(null);
    }, []);

    const handleDataLoad = useCallback((data) => {
        console.log('📈 Données du professeur chargées dans le modal:', data);
    }, []);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        if (selectedMatiere) {
            searchAffectations(selectedMatiere);
        }
        setRefreshTrigger(prev => prev + 1);
    }, [selectedMatiere, searchAffectations]);

    // ===========================
    // GESTION DE L'EXPORT
    // ===========================
    const handleExportAll = useCallback(() => {
        console.log('Export des affectations professeur-matière');
        toaster.push(
            <Notification type="info" header="Export">
                Fonctionnalité d'export en cours de développement
            </Notification>,
            { duration: 3000 }
        );
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <div style={{

            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Formulaire de recherche */}
                <div className="row">
                    <div className="col-lg-12">
                        <ProfesseurMatiereFilters
                            onSearch={handleSearch}
                            onClear={handleClearSearch}
                            loading={searchLoading}
                            error={searchError}
                            selectedMatiere={selectedMatiere}
                            onMatiereChange={setSelectedMatiere}
                        />
                    </div>
                </div>

                {/* En-tête avec statistiques */}
                {/* {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <ProfesseurMatiereStatsHeader 
                                affectations={affectations}
                                loading={searchLoading}
                                selectedMatiereInfo={selectedMatiereInfo}
                            />
                        </div>
                    </div>
                )} */}

                {searchPerformed && affectations?.length > 0 && !searchLoading && (
                    <div className="row">
                        <div className="col-lg-12">
                            <StatistiquesProfesseurMatiere
                                affectations={affectations}
                                selectedMatiereInfo={selectedMatiereInfo}
                            />
                        </div>
                    </div>
                )}


                {/* Message d'information moderne */}
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
                                    <FiUsers size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les affectations ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez une matière dans le formulaire ci-dessus pour voir les professeurs affectés
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Erreur de recherche moderne */}
                {searchError && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
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
                                <DataTable
                                    title="Affectations Professeur - Matière"
                                    subtitle="affectation(s) trouvée(s)"

                                    data={affectations}
                                    loading={searchLoading}
                                    error={null}

                                    columns={professeurMatiereTableConfig.columns}
                                    searchableFields={professeurMatiereTableConfig.searchableFields}
                                    filterConfigs={professeurMatiereTableConfig.filterConfigs}
                                    actions={professeurMatiereTableConfig.actions}

                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateAffectation}

                                    defaultPageSize={professeurMatiereTableConfig.pageSize}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={850}

                                    enableRefresh={true}
                                    enableCreate={true}
                                    createButtonText="Nouvelle Affectation"
                                    selectable={false}
                                    rowKey="id"

                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "650px", border: "none", boxShadow: "none" },
                                    }}

                                    // Boutons d'action supplémentaires
                                    extraActions={[
                                        {
                                            key: 'export-all',
                                            label: 'Exporter Tout',
                                            icon: <FiDownload />,
                                            color: 'green',
                                            onClick: handleExportAll
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ===========================
                MODAL D'AFFECTATION MATIÈRE-PROFESSEUR
                =========================== */}
            <AffecterMatiereProfesseurModal
                visible={affectationModalVisible}
                onClose={handleAffectationModalClose}
                onSuccess={handleAffectationSuccess}
            />

            {/* ===========================
                MODAL DÉTAIL PROFESSEUR
                =========================== */}
            <ProfesseurDetailModal
                visible={detailModalVisible}
                onClose={handleDetailModalClose}
                professeurData={selectedProfesseur}
                onDataLoad={handleDataLoad}
            />
        </div>
    );
};

export default ProfesseurMatiere;