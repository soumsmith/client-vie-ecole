/**
 * Composant principal de la liste des écoles avec DataTable
 * VERSION: 1.1.0 - Version nettoyée
 * DESCRIPTION: Interface complète de gestion des écoles utilisant le composant DataTable personnalisé
 */

import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    Button, 
    Row, 
    Col, 
    Loader, 
    Badge,
    Avatar
} from 'rsuite';
import { 
    FiBookOpen, 
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiMail,
    FiUser
} from 'react-icons/fi';
import Swal from 'sweetalert2';

import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { useEcolesData, listeEcolesTableConfig } from './EcolesService';
import CreateEcoleModal from './CreateEcoleModal';
import IconBox from "../Composant/IconBox";

// ===========================
// UTILITAIRES
// ===========================
const safeStringIncludes = (str, searchTerm) => {
    if (typeof str !== 'string') return false;
    return str.toLowerCase().includes(searchTerm.toLowerCase());
};

const calculateStats = (ecoles) => {
    const total = ecoles.length;
    const stats = {
        total,
        primaire: ecoles.filter(e => safeStringIncludes(e.niveauEnseignement, 'Primaire')).length,
        secondaire: ecoles.filter(e => safeStringIncludes(e.niveauEnseignement, 'Secondaire')).length,
        superieur: ecoles.filter(e => safeStringIncludes(e.niveauEnseignement, 'Supérieur')).length,
        technique: ecoles.filter(e => safeStringIncludes(e.niveauEnseignement, 'Technique')).length,
        maternelle: ecoles.filter(e => safeStringIncludes(e.niveauEnseignement, 'Maternelle')).length
    };

    const villesUniques = [...new Set(ecoles.map(e => e.ville))].filter(Boolean);
    const villeStats = villesUniques.map(ville => ({
        ville,
        count: ecoles.filter(e => e.ville === ville).length
    }));

    return { ...stats, villesUniques, villeStats };
};

// ===========================
// COMPOSANT SECTION PROFIL
// ===========================
const ProfileSection = ({ userInfo }) => {
    const defaultUser = {
        name: 'Administrateur Système',
        email: 'admin@education.ci',
        role: 'Gestionnaire des Écoles',
        avatar: null
    };

    const user = userInfo || defaultUser;

    return (
        <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '15px',
            padding: '25px',
            marginBottom: '25px',
            color: 'white',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <Avatar
                    size="lg"
                    style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '24px',
                        fontWeight: '600',
                        backdropFilter: 'blur(10px)'
                    }}
                    src={user.avatar}
                >
                    {user.name.split(' ').map(n => n[0]).join('')}
                </Avatar>
                <div style={{ flex: 1 }}>
                    <h4 style={{ margin: 0, fontSize: '22px', fontWeight: '600' }}>
                        {user.name}
                    </h4>
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '15px', 
                        marginTop: '8px',
                        fontSize: '14px',
                        opacity: 0.9
                    }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiMail size={14} />
                            {user.email}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <FiUser size={14} />
                            {user.role}
                        </span>
                    </div>
                </div>
                <div style={{ 
                    padding: '12px 20px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                    borderRadius: '10px',
                    backdropFilter: 'blur(10px)',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: '20px', fontWeight: '700' }}>
                        {new Date().toLocaleDateString('fr-FR')}
                    </div>
                    <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '2px' }}>
                        Aujourd'hui
                    </div>
                </div>
            </div>
        </div>
    );
};

// ===========================
// COMPOSANT STATISTIQUES
// ===========================
const StatCard = ({ value, label, color, bgColor, borderColor }) => (
    <div style={{
        textAlign: 'center',
        padding: '15px',
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`
    }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color }}>
            {value}
        </div>
        <div style={{ fontSize: '12px', color, fontWeight: '500' }}>
            {label}
        </div>
    </div>
);

const EcolesStatsHeader = ({ ecoles, loading }) => {
    const stats = useMemo(() => calculateStats(ecoles || []), [ecoles]);

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
                    <span>Chargement des écoles...</span>
                </div>
            </div>
        );
    }

    const statConfigs = [
        { key: 'total', label: 'Total Écoles', color: '#0369a1', bgColor: '#f0f9ff', borderColor: '#bae6fd' },
        { key: 'primaire', label: 'Primaire', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
        { key: 'secondaire', label: 'Secondaire', color: '#d97706', bgColor: '#fffbeb', borderColor: '#fed7aa' },
        { key: 'superieur', label: 'Supérieur', color: '#9333ea', bgColor: '#f5f3ff', borderColor: '#d8b4fe' },
        { key: 'technique', label: 'Technique', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca' },
        { key: 'maternelle', label: 'Maternelle', color: '#059669', bgColor: '#ecfdf5', borderColor: '#a7f3d0' }
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
            {/* En-tête */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <IconBox icon={FiBookOpen} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Statistiques des Écoles
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Année scolaire 2024-2025 • {stats.total} école(s) enregistrée(s) • {stats.villesUniques.length} ville(s)
                    </p>
                </div>
            </div>

            {/* Statistiques en grille */}
            <Row gutter={16}>
                {statConfigs.map(({ key, label, color, bgColor, borderColor }) => (
                    <Col xs={12} sm={8} md={4} key={key}>
                        <StatCard
                            value={stats[key]}
                            label={label}
                            color={color}
                            bgColor={bgColor}
                            borderColor={borderColor}
                        />
                    </Col>
                ))}
            </Row>

            {/* Badges des villes */}
            {stats.villeStats.length > 0 && (
                <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {stats.villeStats.slice(0, 6).map((villeStat, index) => (
                        <Badge 
                            key={villeStat.ville} 
                            color={['green', 'blue', 'orange', 'violet', 'cyan', 'red'][index % 6]} 
                            style={{ fontSize: '11px' }}
                        >
                            {villeStat.count} {villeStat.ville}
                        </Badge>
                    ))}
                    {stats.villeStats.length > 6 && (
                        <Badge color="gray" style={{ fontSize: '11px' }}>
                            +{stats.villeStats.length - 6} autres villes
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const ListeEcoles = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEcole, setSelectedEcole] = useState(null);

    const { handleTableAction, handleCloseModal } = useCommonState();
    const { ecoles, loading, error, refetch } = useEcolesData(refreshTrigger);

    // ===========================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ===========================
    const showEcoleDetails = useCallback(async (ecole) => {
        await Swal.fire({
            title: ecole.nomEtablissement,
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <p><strong>Code:</strong> ${ecole.codeEtablissement || 'Non renseigné'}</p>
                    <p><strong>Email:</strong> ${ecole.emailEtablissement || 'Non renseigné'}</p>
                    <p><strong>Téléphone:</strong> ${ecole.telephoneEtablissement || 'Non renseigné'}</p>
                    <p><strong>Niveau:</strong> ${ecole.niveauEnseignement || 'Non renseigné'}</p>
                    <p><strong>Localisation:</strong> ${[ecole.commune, ecole.ville, ecole.pays].filter(Boolean).join(', ') || 'Non renseignée'}</p>
                    <p><strong>Description:</strong> ${ecole.indicationEtablissement || 'Non renseignée'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#667eea',
            confirmButtonText: 'Fermer'
        });
    }, []);

    const confirmDeleteEcole = useCallback(async (ecole) => {
        const result = await Swal.fire({
            title: 'Confirmer la suppression',
            text: `Êtes-vous sûr de vouloir supprimer l'école "${ecole.nomEtablissement}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await Swal.fire({
                    icon: 'success',
                    title: 'École supprimée',
                    text: `L'école "${ecole.nomEtablissement}" a été supprimée avec succès.`,
                    confirmButtonColor: '#10b981',
                    timer: 2000
                });
                setRefreshTrigger(prev => prev + 1);
            } catch (error) {
                await Swal.fire({
                    icon: 'error',
                    title: 'Erreur',
                    text: 'Une erreur est survenue lors de la suppression.',
                    confirmButtonColor: '#ef4444'
                });
            }
        }
    }, []);

    const handleTableActionLocal = useCallback(async (actionType, item) => {
        const actionHandlers = {
            create: () => {
                setSelectedEcole(null);
                setShowCreateModal(true);
            },
            view: () => showEcoleDetails(item),
            edit: async () => {
                await Swal.fire({
                    title: 'Modification',
                    text: `Fonctionnalité de modification pour "${item.nomEtablissement}" à implémenter`,
                    icon: 'info',
                    confirmButtonColor: '#f59e0b'
                });
            },
            delete: () => confirmDeleteEcole(item)
        };

        const handler = actionHandlers[actionType];
        if (handler) {
            await handler();
        } else {
            handleTableAction(actionType, item);
        }
    }, [showEcoleDetails, confirmDeleteEcole, handleTableAction]);

    const handleCreateEcole = useCallback(() => {
        setSelectedEcole(null);
        setShowCreateModal(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setSelectedEcole(null);
        setShowCreateModal(false);
    }, []);

    const handleCreateEcoleSuccess = useCallback(async (ecoleData) => {
        try {
            const enrichedData = {
                ...ecoleData,
                pays: ecoleData.paysLibelle,
                ville: ecoleData.villeLibelle,
                commune: ecoleData.communeLibelle,
                niveauEnseignement: ecoleData.niveauEnseignementLibelle
            };

            const newEcole = {
                id: Date.now(),
                ...enrichedData
            };

            setShowCreateModal(false);
            setSelectedEcole(null);
            setRefreshTrigger(prev => prev + 1);
            
            return newEcole;
        } catch (error) {
            console.error('Erreur lors de la création de l\'école:', error);
            throw error;
        }
    }, []);

    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    const handleExportAll = useCallback(() => {
        Swal.fire({
            title: 'Export des données',
            text: 'Fonctionnalité d\'export à implémenter',
            icon: 'info',
            confirmButtonColor: '#10b981'
        });
    }, []);

    // ===========================
    // COMPOSANTS DE RENDU
    // ===========================
    const ErrorDisplay = () => (
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
                            Erreur de chargement
                        </h6>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            {error?.message || 'Une erreur inattendue s\'est produite'}
                        </p>
                    </div>
                    <Button
                        appearance="primary"
                        style={{ 
                            marginLeft: 'auto',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                        startIcon={<FiRefreshCw />}
                        onClick={handleRefresh}
                    >
                        Réessayer
                    </Button>
                </div>
            </div>
        </div>
    );

    const EmptyState = () => (
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
                        <FiBookOpen size={40} color="white" />
                    </div>
                    <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                        Aucune école enregistrée
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Il n'y a actuellement aucune école enregistrée dans le système.
                    </p>
                    <Button
                        appearance="primary"
                        style={{ 
                            marginTop: 15,
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none'
                        }}
                        startIcon={<FiPlus />}
                        onClick={handleCreateEcole}
                    >
                        Créer la première école
                    </Button>
                </div>
            </div>
        </div>
    );

    // ===========================
    // RENDU PRINCIPAL
    // ===========================
    return (
        <div style={{ 
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Section Profil */}
                <div className="row">
                    <div className="col-lg-12">
                        <ProfileSection />
                    </div>
                </div>

                {/* En-tête avec statistiques */}
                <div className="row">
                    <div className="col-lg-12">
                        <EcolesStatsHeader ecoles={ecoles} loading={loading} />
                    </div>
                </div>

                {/* Gestion des erreurs */}
                {error && <ErrorDisplay />}

                {/* Table principale */}
                {!error && (
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
                                    title="Liste des Écoles"
                                    subtitle="école(s) enregistrée(s)"
                                    data={ecoles}
                                    loading={loading}
                                    error={null}
                                    columns={listeEcolesTableConfig.columns}
                                    searchableFields={listeEcolesTableConfig.searchableFields}
                                    filterConfigs={listeEcolesTableConfig.filterConfigs}
                                    actions={listeEcolesTableConfig.actions}
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateEcole}
                                    defaultPageSize={listeEcolesTableConfig.pageSize}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={650}
                                    enableRefresh={true}
                                    enableCreate={true}
                                    createButtonText="Nouvelle École"
                                    selectable={true}
                                    rowKey="id"
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "650px", border: "none", boxShadow: "none" },
                                    }}
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

                {/* État vide */}
                {!loading && !error && ecoles?.length === 0 && <EmptyState />}
            </div>

            {/* Modal de création */}
            <CreateEcoleModal
                show={showCreateModal}
                onClose={handleCloseCreateModal}
                onSave={handleCreateEcoleSuccess}
            />
        </div>
    );
};

export default ListeEcoles;