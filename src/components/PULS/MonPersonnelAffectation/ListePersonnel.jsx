import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    FiUsers,
    FiUser,
    FiUserCheck,
    FiCheckCircle,
    FiClock,
    FiTrendingUp
} from 'react-icons/fi';

// Import des fonctions externalisées
import PersonnelModal from './PersonnelModal';
import DataTable from "../../DataTable";
import { usePersonnelData, getPersonnelTableConfig } from './PersonnelServiceManager';
import getFullUrl from "../../hooks/urlUtils";

const ListePersonnel = ({ typeDeListe, tableTitle }) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // État des modals - Gestion directe
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: null,
        selectedQuestion: null
    });

    // ===========================
    // DONNÉES DU PERSONNEL
    // ===========================
    const { personnel, loading, error, refetch, performance } = usePersonnelData(typeDeListe, refreshTrigger);

    // ===========================
    // CONFIGURATION DU TABLEAU
    // ===========================
    const tableConfig = useMemo(() => {
        return getPersonnelTableConfig(typeDeListe);
    }, [typeDeListe]);

    // ===========================
    // GESTION DES MODALS
    // ===========================
    const handleTableAction = useCallback((actionType, item) => {
        console.log('Action déclenchée:', actionType, 'Élément:', item);
        setModalState({
            isOpen: true,
            type: actionType,
            selectedQuestion: item
        });
    }, []);

    const handleCloseModal = useCallback(() => {
        setModalState({
            isOpen: false,
            type: null,
            selectedQuestion: null
        });
    }, []);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action locale:', actionType, 'Item:', item);

        if (actionType === 'create') {
            navigate('/personnel/create');
            return;
        }

        if (actionType === 'download' && item) {
            handleDownloadDocuments(item);
            return;
        }

        handleTableAction(actionType, item);
    }, [navigate, handleTableAction]);

    // ===========================
    // GESTION DU TÉLÉCHARGEMENT
    // ===========================
    const handleDownloadDocuments = useCallback((personnel) => {
        const documents = [];

        if (personnel.cvLien) {
            documents.push({ name: 'CV', url: personnel.cvLien });
        }
        if (personnel.pieceIdentiteLien) {
            documents.push({ name: 'Pièce d\'identité', url: personnel.pieceIdentiteLien });
        }
        if (personnel.autorisationLien) {
            documents.push({ name: 'Autorisation', url: personnel.autorisationLien });
        }

        if (documents.length === 0) {
            alert('Aucun document disponible pour ce personnel');
            return;
        }

        documents.forEach(doc => {
            if (doc.url && doc.url.trim() !== '') {
                const fullUrl = doc.url.startsWith('http') ? doc.url : `${getFullUrl()}uploads/${doc.url}`;
                window.open(fullUrl, '_blank');
            }
        });
    }, []);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            console.log('Sauvegarde modal - Type:', modalState.type, 'Données:', modalState.selectedQuestion);

            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer le personnel:', modalState.selectedQuestion);
                    alert('Personnel supprimé avec succès !');
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir le personnel:', modalState.selectedQuestion);
                    break;

                case 'edit':
                    console.log('Profils affectés au personnel:', modalState.selectedQuestion);
                    setRefreshTrigger(prev => prev + 1);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            alert('Une erreur est survenue lors de l\'opération');
        }
    }, [modalState.type, modalState.selectedQuestion, handleCloseModal]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    const handleCreatePersonnel = useCallback(() => {
        navigate('/personnel/create');
    }, [navigate]);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
        refetch();
    }, [refetch]);

    // ===========================
    // STATS RAPIDES
    // ===========================
    const getStatsPersonnel = useCallback(() => {
        if (!personnel || personnel.length === 0) return null;

        const stats = {
            total: personnel.length,
            hommes: personnel.filter(p => p.sexe === 'MASCULIN').length,
            femmes: personnel.filter(p => p.sexe === 'FEMININ').length,
            valides: personnel.filter(p => p.statut === 'VALIDEE').length,
            enAttente: personnel.filter(p => p.statut === 'EN_ATTENTE').length,
            experienceMoyenne: Math.round(
                personnel.reduce((sum, p) => sum + (p.experienceAnnees || 0), 0) / personnel.length
            )
        };

        return stats;
    }, [personnel]);

    const stats = getStatsPersonnel();

    // ===========================
    // COMPOSANT CARTE STATISTIQUE
    // ===========================
    // ===========================
    // COMPOSANT CARTE STATISTIQUE (VERSION COMPACTE)
    // ===========================
    const StatCard = ({ icon: Icon, value, label, gradient }) => (
        <div className="col-md-2 mb-3 col-xs-6 col-sm-6">
            <div
                className="stat-card"
                style={{
                    background: gradient,
                    borderRadius: '10px',
                    padding: '16px 14px',
                    color: 'white',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    cursor: 'pointer',
                    position: 'relative',
                    overflow: 'hidden',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
                onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
                }}
            >
                {/* Effet de fond décoratif */}
                <div style={{
                    position: 'absolute',
                    top: '-15px',
                    right: '-15px',
                    opacity: '0.1',
                }}>
                    <Icon size={60} />
                </div>

                {/* Content */}
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                    }}>
                        <div style={{
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            borderRadius: '8px',
                            padding: '6px',
                            display: 'inline-flex',
                        }}>
                            <Icon size={18} />
                        </div>
                    </div>
                    <h3 style={{
                        margin: '0',
                        fontSize: '24px',
                        fontWeight: '700',
                        letterSpacing: '-0.5px',
                        lineHeight: '1'
                    }}>
                        {value}
                    </h3>
                    <p style={{
                        margin: '6px 0 0 0',
                        fontSize: '11px',
                        opacity: '0.9',
                        fontWeight: '500',
                        letterSpacing: '0.2px'
                    }}>
                        {label}
                    </p>
                </div>
            </div>
        </div>
    );

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================

    return (
        <>
            {/* ===========================
                STATISTIQUES RAPIDES
                =========================== */}
            {stats && (
                <div className="row mb-4" style={{ marginTop: '20px' }}>
                    <StatCard
                        icon={FiUsers}
                        value={stats.total}
                        label="Total Personnel"
                        gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    />
                    <StatCard
                        icon={FiUser}
                        value={stats.hommes}
                        label="Hommes"
                        gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
                    />
                    <StatCard
                        icon={FiUserCheck}
                        value={stats.femmes}
                        label="Femmes"
                        gradient="linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    />
                    <StatCard
                        icon={FiCheckCircle}
                        value={stats.valides}
                        label="Validés"
                        gradient="linear-gradient(135deg, #30cfd0 0%, #330867 100%)"
                    />
                    <StatCard
                        icon={FiClock}
                        value={stats.enAttente}
                        label="En Attente"
                        gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    />
                    <StatCard
                        icon={FiTrendingUp}
                        value={stats.experienceMoyenne}
                        label="Exp. Moyenne (ans)"
                        gradient="linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
                    />
                </div>
            )}

            {/* ===========================
                TABLEAU DU PERSONNEL
                =========================== */}
            <div className="row mt-3">
                <div className="col-lg-12">
                    <DataTable
                        title={tableTitle}
                        subtitle={`membre${personnel.length > 1 ? 's' : ''} du personnel`}
                        data={personnel}
                        loading={loading}
                        error={error}
                        columns={tableConfig.columns}
                        searchableFields={tableConfig.searchableFields}
                        filterConfigs={tableConfig.filterConfigs}
                        actions={tableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleCreatePersonnel}
                        defaultPageSize={10}
                        pageSizeOptions={[10, 20, 50, 100]}
                        tableHeight={650}
                        enableRefresh={true}
                        enableCreate={false}
                        createButtonText="Nouveau Personnel"
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "650px" },
                        }}
                        performanceInfo={performance && (
                            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
                                Chargé en {performance.duration}ms depuis {performance.source === 'cache' ? 'cache' : 'API'}
                                {performance.dataSize && ` • ${Math.round(performance.dataSize / 1024)}KB`}
                            </div>
                        )}
                    />
                </div>
            </div>

            {/* ===========================
                MODAL DE GESTION DU PERSONNEL
                =========================== */}
            <PersonnelModal
                modalState={modalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
            />
        </>
    );
};

export default ListePersonnel;