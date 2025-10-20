import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import MessageDetailModal from './MessageDetailModal'; // Nouveau modal
import DataTable from "../../DataTable";
import {messagesTableConfig } from './MessageServiceManager';
import {useMessagesData } from "../utils/CommonDataService";

const ListeMessages = ({ typeMessage}) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // State pour le modal de détail des messages
    const [showMessageDetail, setShowMessageDetail] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState(null);

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DES MESSAGES
    // ===========================
    const { messages, loading, error, refetch } = useMessagesData(typeMessage, refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================

    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "voir" (détail du message)
        if (actionType === 'view' && item) {
            setSelectedMessage(item);
            setShowMessageDetail(true);
            return;
        }

        // Gestion spécifique pour l'action "modifier" (répondre)
        if (actionType === 'edit' && item && item.id) {
            navigate(`/messages/reply/${item.id}`);
            return;
        }

        // Gestion spécifique pour l'action "créer" (nouveau message)
        if (actionType === 'create') {
            navigate('/messages/create');
            return;
        }

        // Pour les autres actions (delete, etc.), utiliser le modal existant
        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU MODAL DE DÉTAIL
    // ===========================

    const handleCloseMessageDetail = useCallback(() => {
        setShowMessageDetail(false);
        setSelectedMessage(null);
    }, []);

    const handleReplyFromDetail = useCallback((message) => {
        setShowMessageDetail(false);
        navigate(`/messages/reply/${message.id}`);
    }, [navigate]);

    const handleDeleteFromDetail = useCallback(async (message) => {
        try {
            console.log('Supprimer le message depuis le détail:', message);
            // Ici tu peux ajouter la logique de suppression
            // await deleteMessage(message.id);
            
            // Fermer le modal et actualiser les données
            setShowMessageDetail(false);
            setRefreshTrigger(prev => prev + 1);
            
            // Optionnel : afficher une notification de succès
            // toast.success('Message supprimé avec succès');
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            // Optionnel : afficher une notification d'erreur
            // toast.error('Erreur lors de la suppression du message');
        }
    }, []);

    // ===========================
    // GESTION DU MODAL GÉNÉRIQUE
    // ===========================

    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer le message:', modalState.selectedQuestion);
                    // Ici tu peux ajouter la logique de suppression
                    // await deleteMessage(modalState.selectedQuestion.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
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
    // GESTION DU BOUTON CRÉER
    // ===========================

    const handleCreateMessage = useCallback(() => {
        navigate('/messages/create');
    }, [navigate]);

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
                TABLEAU DES MESSAGES
                =========================== */}
            <div className="row mt-5">
                <div className="col-lg-12">
                    <DataTable
                        title={`Messages ${typeMessage === 'reception' ? 'Reçus' : 'Envoyés'}`}
                        subtitle={`message(s) ${typeMessage === 'reception' ? 'reçu(s)' : 'envoyé(s)'}`}
                        data={messages}
                        loading={loading}
                        error={error}
                        columns={messagesTableConfig.columns}
                        searchableFields={messagesTableConfig.searchableFields}
                        filterConfigs={messagesTableConfig.filterConfigs}
                        actions={messagesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreateMessage}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50]}
                        tableHeight={600}
                        enableRefresh={true}
                        enableCreate={false}
                        createButtonText="Nouveau Message"
                        selectable={false} // Désactivé car on n'utilise plus la sélection multiple
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "600px" },
                        }}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE DÉTAIL DU MESSAGE
                =========================== */}
            <MessageDetailModal
                open={showMessageDetail}
                onClose={handleCloseMessageDetail}
                message={selectedMessage}
                onReply={handleReplyFromDetail}
                onDelete={handleDeleteFromDetail}
            />

            {/* ===========================
                MODAL GÉNÉRIQUE (pour les autres actions)
                =========================== */}
            <QuestionModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default ListeMessages;