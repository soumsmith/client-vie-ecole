import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import CertificatTravailModal from './CertificatTravailModal';
import DataTable from "../../DataTable";
import { useCertificatPersonnelData, certificatPersonnelTableConfig } from './CertificatTravailService';

const CertificatTravail = () => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // État pour le modal d'impression du certificat
    const [certificatModal, setCertificatModal] = useState({
        open: false,
        selectedPersonnel: null
    });

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DU PERSONNEL
    // ===========================
    const { personnel, loading, error, refetch } = useCertificatPersonnelData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET ACTIONS
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "imprimer"
        if (actionType === 'print' && item && item.id) {
            setCertificatModal({
                open: true,
                selectedPersonnel: item
            });
            return;
        }

        // Pour les autres actions potentielles, utiliser le modal existant
        handleTableAction(actionType, item);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU MODAL DE CERTIFICAT
    // ===========================

    const handleCloseCertificatModal = useCallback(() => {
        setCertificatModal({
            open: false,
            selectedPersonnel: null
        });
    }, []);

    const handleCertificatSuccess = useCallback((personnel, certificatData) => {
        console.log('Certificat généré avec succès pour:', personnel.nomComplet);
        console.log('Données du certificat:', certificatData);
        
        // Optionnel : Actualiser les données après génération
        setRefreshTrigger(prev => prev + 1);
        
        // Ici tu peux ajouter d'autres actions comme :
        // - Ouvrir le PDF dans un nouvel onglet
        // - Télécharger automatiquement le fichier
        // - Afficher un toast de succès personnalisé
        
    }, []);

    // ===========================
    // GESTION DU MODAL EXISTANT (pour d'autres actions futures)
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer le personnel:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression si nécessaire
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir le personnel:', modalState.selectedQuestion);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                TABLEAU DU PERSONNEL POUR CERTIFICATS
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title="Liste du Personnel - Certificats de Travail"
                        subtitle={`${personnel.length} personnel(s) disponible(s)`}
                        data={personnel}
                        loading={loading}
                        error={error}
                        columns={certificatPersonnelTableConfig.columns}
                        searchableFields={certificatPersonnelTableConfig.searchableFields}
                        filterConfigs={certificatPersonnelTableConfig.filterConfigs}
                        actions={certificatPersonnelTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={false} // Pas de création depuis cette interface
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "600px" },
                        }}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE GÉNÉRATION DE CERTIFICAT
                =========================== */}
            <CertificatTravailModal
                open={certificatModal.open}
                personnel={certificatModal.selectedPersonnel}
                onClose={handleCloseCertificatModal}
                onSuccess={handleCertificatSuccess}
            />

            {/* ===========================
                MODAL DE GESTION D'AUTRES ACTIONS (optionnel)
                =========================== */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default CertificatTravail;