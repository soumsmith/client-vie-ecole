import React, { useState, useCallback } from "react";
import { Panel, Toggle, Button, Notification, Loader, Divider, Badge } from 'rsuite';
import { FiDownload, FiSave, FiPlus, FiEdit } from 'react-icons/fi';
import Swal from 'sweetalert2';
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import DataTable from "../../DataTable";
import PresenceInfoModal from './PresenceInfoModal';
import {
    useEnqueteRapideData,
    useReunionsData,
    enqueteTableConfig,
    saveReunions,
    downloadRapport,
    clearEnqueteCache
} from './EnqueteRapideServiceManager';
import { usePulsParams } from '../../hooks/useDynamicParams';


const EnqueteRapideRentree = ({ anneeId = 1 }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [presenceModalVisible, setPresenceModalVisible] = useState(false);
    const [editPresenceData, setEditPresenceData] = useState(null);
    const [savingReunions, setSavingReunions] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const {
        ecoleId: dynamicEcoleId
      } = usePulsParams();

    // ===========================
    // DONNÉES DE L'ENQUÊTE
    // ===========================
    const { enqueteData, loading: enqueteLoading, error: enqueteError } = useEnqueteRapideData(dynamicEcoleId, anneeId, refreshTrigger);
    const { reunions, ecoleInfo, loading: reunionsLoading, setReunions } = useReunionsData(dynamicEcoleId, anneeId, refreshTrigger);

    // ===========================
    // GESTION DES SWITCHES
    // ===========================
    const handleSwitchChange = useCallback((switchKey, value) => {
        setReunions(prev => ({
            ...prev,
            [switchKey]: value
        }));
    }, [setReunions]);

    // ===========================
    // CONFIRMATION SWEETALERT POUR LES RÉUNIONS
    // ===========================
    const confirmSaveReunions = async () => {
        const result = await Swal.fire({
            title: 'Confirmer l\'enregistrement',
            text: 'Êtes-vous sûr de vouloir enregistrer l\'état actuel des réunions ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#28a745',
            cancelButtonColor: '#6c757d',
            confirmButtonText: 'Oui, enregistrer',
            cancelButtonText: 'Annuler',
            reverseButtons: true,
            customClass: {
                popup: 'swal2-popup-custom',
                title: 'swal2-title-custom',
                content: 'swal2-content-custom'
            }
        });

        if (result.isConfirmed) {
            await handleSaveReunions();
        }
    };

    // ===========================
    // GESTION DES RÉUNIONS - NOUVELLE VERSION
    // ===========================
    const handleSaveReunions = useCallback(async () => {
        try {
            setSavingReunions(true);
            
            console.log('Données des réunions à enregistrer:', reunions);

            // Appel de la nouvelle API
            const response = await saveReunions(dynamicEcoleId, anneeId, reunions);
            
            console.log('Réponse de l\'API:', response);

            // Succès avec SweetAlert
            await Swal.fire({
                title: 'Succès !',
                text: 'L\'état des réunions a été enregistré avec succès.',
                icon: 'success',
                confirmButtonColor: '#28a745',
                confirmButtonText: 'OK',
                timer: 3000,
                timerProgressBar: true
            });

            // Actualiser les données
            setRefreshTrigger(prev => prev + 1);
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            
            // Erreur avec SweetAlert
            await Swal.fire({
                title: 'Erreur !',
                text: error.message || 'Erreur lors de la sauvegarde des réunions.',
                icon: 'error',
                confirmButtonColor: '#dc3545',
                confirmButtonText: 'OK'
            });
        } finally {
            setSavingReunions(false);
        }
    }, [reunions, dynamicEcoleId, anneeId]);

    // ===========================
    // GESTION DU TABLEAU
    // ===========================
    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        if (actionType === 'edit' && item) {
            setEditPresenceData(item);
            setPresenceModalVisible(true);
        }
    }, []);

    // ===========================
    // GESTION DU MODAL DE PRÉSENCE
    // ===========================
    const handleAddPresence = useCallback(() => {
        setEditPresenceData(null);
        setPresenceModalVisible(true);
    }, []);

    const handlePresenceSuccess = useCallback((newData) => {
        // Vider le cache pour forcer le rechargement
        clearEnqueteCache();
        
        // Actualiser les données
        setRefreshTrigger(prev => prev + 1);
        
        const action = editPresenceData ? 'modifiées' : 'ajoutées';
        Notification.success({
            title: `Informations ${action}`,
            description: `Les informations de présence ont été ${action} avec succès.`,
            placement: 'topEnd',
            duration: 4000,
        });
    }, [editPresenceData]);

    const handlePresenceModalClose = useCallback(() => {
        setPresenceModalVisible(false);
        setEditPresenceData(null);
    }, []);

    // ===========================
    // GESTION DU TÉLÉCHARGEMENT
    // ===========================
    const handleDownload = useCallback(async () => {
        try {
            setDownloading(true);
            await downloadRapport(dynamicEcoleId, anneeId);
            
            Notification.success({
                title: 'Téléchargement réussi',
                description: 'Le rapport d\'enquête de rentrée a été téléchargé.',
                placement: 'topEnd',
                duration: 3000,
            });
            
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            Notification.error({
                title: 'Erreur de téléchargement',
                description: error.message || 'Erreur lors du téléchargement du rapport.',
                placement: 'topEnd',
                duration: 5000,
            });
        } finally {
            setDownloading(false);
        }
    }, [dynamicEcoleId, anneeId]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        clearEnqueteCache();
        setRefreshTrigger(prev => prev + 1);
        
        Notification.info({
            title: 'Données actualisées',
            description: 'Les données d\'enquête ont été mises à jour.',
            placement: 'topEnd',
            duration: 2000,
        });
    }, []);

    // ===========================
    // CONFIGURATION DES SWITCHES
    // ===========================
    const switchesConfig = [
        { key: 'personnelAdministratif', label: 'Personnel administratif' },
        { key: 'conseilInterieur', label: 'Conseil intérieur' },
        { key: 'conseilProfesseurs', label: 'Conseil des professeurs' },
        { key: 'professeursPrincipaux', label: 'Professeurs principaux' },
        { key: 'conseilEnseignement', label: 'Conseil d\'enseignement' },
        { key: 'professeursClassesExamen', label: 'Professeurs des classes d\'examen' },
        { key: 'parentsEleves', label: 'Parents d\'élèves' },
        { key: 'chefsClasse', label: 'Chefs de classe' },
        { key: 'unitesPedagogiques', label: 'Unités Pédagogiques' }
    ];

    const isLoading = enqueteLoading || reunionsLoading;

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <>
            <div className="row mt-4">
                <div className="col-lg-12">
                    <Panel header="Enquête rapide de rentrée" bordered>
                        {/* Informations de l'école */}
                        {ecoleInfo && (
                            <div style={{ marginBottom: 20, padding: 15, backgroundColor: '#f8f9fa', borderRadius: 6 }}>
                                <h6 style={{ margin: 0, color: '#2c3e50' }}>
                                    <strong>{ecoleInfo.ecoleclibelle}</strong> - Code: {ecoleInfo.ecolecode}
                                </h6>
                                {ecoleInfo.ecole_telephone && (
                                    <small style={{ color: '#7f8c8d' }}>Tél: {ecoleInfo.ecole_telephone}</small>
                                )}
                            </div>
                        )}

                        {/* Section des switches pour les réunions */}
                        <div style={{ marginBottom: 30 }}>
                            <h5 style={{ marginBottom: 20, color: '#34495e' }}>
                                <Badge color="blue" style={{ marginRight: 8 }}>📋</Badge>
                                Réunions tenues avec :
                            </h5>
                            
                            {isLoading ? (
                                <div style={{ textAlign: 'center', padding: 40 }}>
                                    <Loader size="lg" />
                                    <div style={{ marginTop: 10, color: '#7f8c8d' }}>
                                        Chargement des données...
                                    </div>
                                </div>
                            ) : (
                                <div className="row">
                                    {switchesConfig.map(({ key, label }) => (
                                        <div key={key} className="col-lg-4 col-md-6 mb-3">
                                            <div style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                padding: 12,
                                                border: '1px solid #e9ecef',
                                                borderRadius: 6,
                                                backgroundColor: reunions[key] ? '#f0f9ff' : '#ffffff'
                                            }}>
                                                <Toggle
                                                    checked={reunions[key] || false}
                                                    onChange={(checked) => handleSwitchChange(key, checked)}
                                                    checkedChildren="✓"
                                                    unCheckedChildren="✗"
                                                    size="sm"
                                                />
                                                <span style={{ 
                                                    marginLeft: 12, 
                                                    fontSize: '14px',
                                                    color: reunions[key] ? '#0369a1' : '#6b7280'
                                                }}>
                                                    {label}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Bouton d'enregistrement des réunions avec confirmation */}
                            <div style={{ marginTop: 20, textAlign: 'left' }}>
                                <Button
                                    appearance="primary"
                                    color="green"
                                    size="md"
                                    startIcon={<FiSave />}
                                    loading={savingReunions}
                                    disabled={isLoading}
                                    onClick={confirmSaveReunions}
                                    style={{ 
                                        fontWeight: '500',
                                        boxShadow: '0 2px 8px rgba(40, 167, 69, 0.3)'
                                    }}
                                >
                                    {savingReunions ? 'Enregistrement...' : 'Enregistrer les réunions'}
                                </Button>
                            </div>
                        </div>

                        <Divider />

                        {/* Section du tableau des présences */}
                        <div style={{ marginTop: 30 }}>
                            {/* En-tête avec titre et boutons d'action */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 25
                            }}>
                                <div>
                                    <h4 style={{ margin: 0, color: '#2c3e50', fontWeight: '600' }}>
                                        📊 Informations sur les élèves présents
                                    </h4>
                                    <p style={{ margin: '5px 0 0 0', color: '#7f8c8d', fontSize: '14px' }}>
                                        Répartition détaillée par niveau d'enseignement
                                    </p>
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <Button
                                        appearance="primary"
                                        color="blue"
                                        size="md"
                                        startIcon={<FiPlus />}
                                        onClick={handleAddPresence}
                                        disabled={isLoading}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        Ajouter les informations de présence
                                    </Button>
                                    
                                    <Button
                                        appearance="primary"
                                        color="red"
                                        size="md"
                                        startIcon={<FiDownload />}
                                        loading={downloading}
                                        disabled={isLoading}
                                        onClick={handleDownload}
                                        style={{ borderRadius: '8px' }}
                                    >
                                        Télécharger
                                    </Button>
                                </div>
                            </div>

                            {/* Cartes statistiques */}
                            {!isLoading && enqueteData.length > 0 && (
                                <div className="row mb-4">
                                    {/* Carte Total des niveaux */}
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div style={{
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            color: 'white',
                                            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.15)',
                                            border: 'none'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                                        Niveaux enregistrés
                                                    </div>
                                                    <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>
                                                        {enqueteData.length}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '36px', opacity: 0.8 }}>
                                                    🎓
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Carte Total élèves affectés */}
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div style={{
                                            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            color: 'white',
                                            boxShadow: '0 8px 24px rgba(17, 153, 142, 0.15)',
                                            border: 'none'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                                        Total Affectés
                                                    </div>
                                                    <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>
                                                        {enqueteData.reduce((sum, item) => sum + (item.nombreAffecte || 0), 0)}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '36px', opacity: 0.8 }}>
                                                    ✅
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Carte Total élèves non affectés */}
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div style={{
                                            background: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            color: 'white',
                                            boxShadow: '0 8px 24px rgba(255, 106, 0, 0.15)',
                                            border: 'none'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                                        Non Affectés
                                                    </div>
                                                    <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>
                                                        {enqueteData.reduce((sum, item) => sum + (item.nombreNonAffecte || 0), 0)}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '36px', opacity: 0.8 }}>
                                                    ⚠️
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Carte Total général */}
                                    <div className="col-lg-3 col-md-6 mb-3">
                                        <div style={{
                                            background: 'linear-gradient(135deg, #3742fa 0%, #2f3542 100%)',
                                            borderRadius: '12px',
                                            padding: '24px',
                                            color: 'white',
                                            boxShadow: '0 8px 24px rgba(55, 66, 250, 0.15)',
                                            border: 'none'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <div>
                                                    <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
                                                        Total Élèves
                                                    </div>
                                                    <div style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>
                                                        {enqueteData.reduce((sum, item) => sum + (item.nombreAffecte || 0) + (item.nombreNonAffecte || 0), 0)}
                                                    </div>
                                                </div>
                                                <div style={{ fontSize: '36px', opacity: 0.8 }}>
                                                    👥
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Indicateurs de performance */}
                            {!isLoading && enqueteData.length > 0 && (
                                <div style={{
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderRadius: '12px',
                                    padding: '20px',
                                    marginBottom: '25px',
                                    border: '1px solid #dee2e6'
                                }}>
                                    <div className="row">
                                        <div className="col-lg-6">
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
                                                    marginRight: '12px'
                                                }}></div>
                                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#2c3e50' }}>
                                                    Taux d'affectation
                                                </span>
                                            </div>
                                            <div style={{
                                                background: '#fff',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#11998e' }}>
                                                        {enqueteData.length > 0 ? (
                                                            Math.round((enqueteData.reduce((sum, item) => sum + (item.nombreAffecte || 0), 0) / 
                                                            enqueteData.reduce((sum, item) => sum + (item.nombreAffecte || 0) + (item.nombreNonAffecte || 0), 0)) * 100)
                                                        ) : 0}%
                                                    </span>
                                                    <Badge color="green" style={{ fontSize: '12px' }}>
                                                        {enqueteData.reduce((sum, item) => sum + (item.nombreAffecte || 0), 0) > 
                                                         enqueteData.reduce((sum, item) => sum + (item.nombreNonAffecte || 0), 0) ? 'Excellent' : 'À améliorer'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="col-lg-6">
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                                <div style={{
                                                    width: '12px',
                                                    height: '12px',
                                                    borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)',
                                                    marginRight: '12px'
                                }}></div>
                                                <span style={{ fontSize: '15px', fontWeight: '500', color: '#2c3e50' }}>
                                                    Élèves en attente
                                                </span>
                                            </div>
                                            <div style={{
                                                background: '#fff',
                                                borderRadius: '8px',
                                                padding: '12px 16px',
                                                border: '1px solid #e9ecef'
                                            }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#ff6a00' }}>
                                                        {enqueteData.reduce((sum, item) => sum + (item.nombreNonAffecte || 0), 0)}
                                                    </span>
                                                    <Badge 
                                                        color={enqueteData.reduce((sum, item) => sum + (item.nombreNonAffecte || 0), 0) === 0 ? 'green' : 'orange'} 
                                                        style={{ fontSize: '12px' }}
                                                    >
                                                        {enqueteData.reduce((sum, item) => sum + (item.nombreNonAffecte || 0), 0) === 0 ? 'Complet' : 'Action requise'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message d'état vide */}
                            {!isLoading && enqueteData.length === 0 && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                                    borderRadius: '12px',
                                    border: '2px dashed #dee2e6',
                                    marginBottom: '25px'
                                }}>
                                    <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>
                                        📋
                                    </div>
                                    <h5 style={{ color: '#6c757d', marginBottom: '8px' }}>
                                        Aucune donnée disponible
                                    </h5>
                                    <p style={{ color: '#6c757d', margin: 0, fontSize: '14px' }}>
                                        Commencez par ajouter les informations de présence pour chaque niveau
                                    </p>
                                </div>
                            )}

                            {/* Tableau des données */}
                            <DataTable
                                data={enqueteData}
                                loading={enqueteLoading}
                                error={enqueteError}
                                columns={enqueteTableConfig.columns}
                                searchableFields={enqueteTableConfig.searchableFields}
                                actions={enqueteTableConfig.actions}
                                onAction={handleTableAction}
                                onRefresh={handleRefresh}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={400}
                                enableRefresh={true}
                                enableCreate={false}
                                selectable={false}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: "#ffffff" },
                                    panel: { minHeight: "400px" },
                                }}
                                showHeader={false}
                                showToolbar={false}
                            />
                        </div>
                    </Panel>
                </div>
            </div>

            {/* Modal de gestion des informations de présence */}
            <PresenceInfoModal
                visible={presenceModalVisible}
                onClose={handlePresenceModalClose}
                onSuccess={handlePresenceSuccess}
                editData={editPresenceData}
                ecoleId={dynamicEcoleId}
                anneeId={anneeId}
            />
        </>
    );
};

export default EnqueteRapideRentree;