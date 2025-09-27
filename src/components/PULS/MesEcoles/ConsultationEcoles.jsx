import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { 
    Notification, 
    Badge, 
    Row, 
    Col, 
    InputGroup,
    Input as RInput 
} from 'rsuite';
import { FiBookOpen, FiSearch, FiFilter } from 'react-icons/fi';
import "bootstrap/dist/css/bootstrap.min.css";

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import QuestionModal from '../Panier/QuestionModal';
import CreateEcoleModal from './CreateEcoleModal'; // Nouveau modal unifié
import DataTable from "../../DataTable";
import { useEcolesData, ecolesTableConfig, clearEcolesCache } from './EcoleServiceManager';
import IconBox from "../Composant/IconBox";

const ConsultationEcoles = ({ fondateurId = 419 }) => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // ===========================
    // ÉTATS POUR LE MODAL UNIFIÉ
    // ===========================
    const [modalState, setModalState] = useState({
        visible: false,
        mode: 'create', // 'create' ou 'edit'
        selectedEcole: null
    });
    
    // États pour les filtres (inchangés)
    const [filters, setFilters] = useState({
        statut: 'TOUS',
        searchTerm: '',
        drem: 'TOUS'
    });

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState: questionModalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    // ===========================
    // DONNÉES DES ÉCOLES
    // ===========================
    const { ecoles, loading, error, refetch } = useEcolesData(refreshTrigger, fondateurId);

    // ===========================
    // FILTRAGE DES DONNÉES (inchangé)
    // ===========================
    const filteredEcoles = useCallback(() => {
        if (!ecoles) return [];

        return ecoles.filter(ecole => {
            // Filtre par statut
            if (filters.statut !== 'TOUS') {
                if (filters.statut === 'VALIDE' && ecole.status !== 'VALIDE') return false;
                if (filters.statut === 'EN_ATTENTE' && ecole.status !== 'EN_ATTENTE') return false;
                if (filters.statut === 'ACTIVE' && ecole.status !== 'ACTIVE') return false;
                if (filters.statut === 'APPROUVE' && ecole.status !== 'APPROUVE') return false;
            }

            // Filtre par DREM
            if (filters.drem !== 'TOUS') {
                const dremValue = ecole.directionRegionale?.libelle || ecole.drLibelle || '';
                if (dremValue !== filters.drem) return false;
            }

            // Filtre par recherche
            if (filters.searchTerm) {
                const searchLower = filters.searchTerm.toLowerCase();
                const matchesSearch = 
                    (ecole.nom?.toLowerCase().includes(searchLower)) ||
                    (ecole.code?.toLowerCase().includes(searchLower)) ||
                    (ecole.email?.toLowerCase().includes(searchLower)) ||
                    (ecole.telephone?.includes(filters.searchTerm)) ||
                    (ecole.ville?.villelibelle?.toLowerCase().includes(searchLower)) ||
                    (ecole.niveauEnseignement?.libelle?.toLowerCase().includes(searchLower));

                if (!matchesSearch) return false;
            }

            return true;
        });
    }, [ecoles, filters]);

    // ===========================
    // OPTIONS DE FILTRES (inchangées)
    // ===========================
    const statutOptions = [
        { label: 'Tous les statuts', value: 'TOUS' },
        { label: 'Validées', value: 'VALIDE' },
        { label: 'En attente', value: 'EN_ATTENTE' },
        { label: 'Actives', value: 'ACTIVE' },
        { label: 'Approuvées', value: 'APPROUVE' }
    ];

    const getDremOptions = useCallback(() => {
        if (!ecoles) return [{ label: 'Toutes les DREM', value: 'TOUS' }];
        
        const drems = [...new Set(ecoles
            .map(e => e.directionRegionale?.libelle || e.drLibelle)
            .filter(Boolean)
        )].sort();
        
        return [
            { label: 'Toutes les DREM', value: 'TOUS' },
            ...drems.map(drem => ({ label: drem, value: drem }))
        ];
    }, [ecoles]);

    // ===========================
    // GESTION DES FILTRES (inchangée)
    // ===========================
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const clearFilters = () => {
        setFilters({
            statut: 'TOUS',
            searchTerm: '',
            drem: 'TOUS'
        });
    };

    // ===========================
    // GESTION DU MODAL UNIFIÉ
    // ===========================
    const handleOpenCreateModal = useCallback(() => {
        setModalState({
            visible: true,
            mode: 'create',
            selectedEcole: null
        });
    }, []);

    const handleOpenEditModal = useCallback((ecole) => {
        console.log('Ouverture du modal en mode modification avec:', ecole);
        setModalState({
            visible: true,
            mode: 'edit',
            selectedEcole: ecole
        });
    }, []);

    const handleCloseUnifiedModal = useCallback(() => {
        setModalState({
            visible: false,
            mode: 'create',
            selectedEcole: null
        });
    }, []);

    // ===========================
    // GESTIONNAIRES D'ACTIONS ADAPTÉS
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        if (actionType === 'edit' && item && item.id) {
            // Ouvrir le modal unifié en mode modification
            handleOpenEditModal(item);
            return;
        }

        if (actionType === 'create') {
            // Ouvrir le modal unifié en mode création
            handleOpenCreateModal();
            return;
        }

        // Pour les autres actions (view, delete), utiliser l'ancien système
        handleTableAction(actionType, item);
    }, [handleTableAction, handleOpenEditModal, handleOpenCreateModal]);

    // ===========================
    // GESTION DES SUCCÈS D'OPÉRATIONS
    // ===========================
    const handleUnifiedModalSave = useCallback(async (ecoleData, operationType) => {
        try {
            console.log('Données reçues du modal:', ecoleData, 'Type:', operationType);
            
            // Ici vous pouvez appeler votre API selon le type d'opération
            let result;
            if (operationType === 'edit') {
                // Appel API pour modification
                result = await ecolesApiService.updateEcole(ecoleData);
                console.log('École modifiée:', result);
            } else {
                // Appel API pour création
                result = await ecolesApiService.createEcole(ecoleData);
                console.log('École créée:', result);
            }

            // Rafraîchir les données
            clearEcolesCache();
            setRefreshTrigger(prev => prev + 1);

            // Notification de succès
            const message = operationType === 'edit' 
                ? `L'école "${ecoleData.nomEtablissement}" a été modifiée avec succès.`
                : `L'école "${ecoleData.nomEtablissement}" a été créée avec succès.`;

            Notification.success({
                title: operationType === 'edit' ? 'École modifiée avec succès' : 'École créée avec succès',
                description: message,
                placement: 'topEnd',
                duration: 4500,
            });

            return result;

        } catch (error) {
            console.error('Erreur lors de l\'opération:', error);
            
            const errorMessage = operationType === 'edit' 
                ? 'Erreur lors de la modification de l\'école'
                : 'Erreur lors de la création de l\'école';
            
            Notification.error({
                title: errorMessage,
                description: error.message || 'Une erreur inattendue s\'est produite.',
                placement: 'topEnd',
                duration: 5000,
            });
            
            throw error; // Re-lancer l'erreur pour que le modal la gère
        }
    }, []);

    // ===========================
    // GESTIONNAIRES POUR LES AUTRES ACTIONS (inchangés)
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            switch (questionModalState.type) {
                case 'delete':
                    console.log('Supprimer l\'école:', questionModalState.selectedQuestion);
                    clearEcolesCache();
                    setRefreshTrigger(prev => prev + 1);
                    Notification.success({
                        title: 'École supprimée',
                        description: 'L\'école a été supprimée avec succès.',
                        placement: 'topEnd',
                        duration: 3000,
                    });
                    break;
                case 'view':
                    console.log('Voir l\'école:', questionModalState.selectedQuestion);
                    break;
                default:
                    console.log('Action non gérée:', questionModalState.type);
                    break;
            }
            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Notification.error({
                title: 'Erreur',
                description: error.message || 'Une erreur est survenue lors de l\'opération.',
                placement: 'topEnd',
                duration: 5000,
            });
        }
    }, [questionModalState.type, questionModalState.selectedQuestion, handleCloseModal, navigate]);

    const handleRefresh = useCallback(() => {
        clearEcolesCache();
        setRefreshTrigger(prev => prev + 1);
        Notification.info({
            title: 'Données actualisées',
            description: 'La liste des écoles a été mise à jour.',
            placement: 'topEnd',
            duration: 2000,
        });
    }, []);

    // ===========================
    // COMPOSANTS D'INTERFACE (inchangés)
    // ===========================
    
    // Composant Select personnalisé simple
    const CustomSelect = ({ value, onChange, options, placeholder }) => (
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                cursor: 'pointer'
            }}
        >
            {options.map(option => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );

    // Statistiques filtrées (inchangé)
    const safeStringIncludes = (str, searchTerm) => {
        if (typeof str !== 'string') return false;
        return str.toLowerCase().includes(searchTerm.toLowerCase());
    };

    const getStatistics = useCallback(() => {
        const currentEcoles = filteredEcoles();
        if (!currentEcoles || currentEcoles.length === 0) return null;

        const stats = {
            total: currentEcoles.length,
            active: currentEcoles.filter(e => e.status === 'ACTIVE').length,
            enAttente: currentEcoles.filter(e => e.status === 'EN_ATTENTE').length,
            approuve: currentEcoles.filter(e => e.status === 'APPROUVE').length,
            valide: currentEcoles.filter(e => e.status === 'VALIDEE').length,
            primaire: currentEcoles.filter(e => safeStringIncludes(e.niveauEnseignement?.libelle, 'Primaire')).length,
            secondaire: currentEcoles.filter(e => safeStringIncludes(e.niveauEnseignement?.libelle, 'Secondaire')).length,
        };

        const villesUniques = [...new Set(currentEcoles.map(e => e.ville?.villelibelle))].filter(Boolean);
        const villeStats = villesUniques.map(ville => ({
            ville,
            count: currentEcoles.filter(e => e.ville?.villelibelle === ville).length
        }));

        const dremUniques = [...new Set(currentEcoles.map(e => e.directionRegionale?.libelle || e.drLibelle))].filter(Boolean);

        return { ...stats, villesUniques, villeStats, dremUniques };
    }, [filteredEcoles]);

    const stats = getStatistics();
    const dremOptions = getDremOptions();

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

    const FilterBar = () => (
        <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 15,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <FiFilter size={18} color="#667eea" />
                <h6 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                    Filtres de recherche
                </h6>
            </div>

            <Row gutter={16}>
                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: 4, display: 'block' }}>
                            Rechercher...
                        </label>
                        <InputGroup inside>
                            <InputGroup.Addon>
                                <FiSearch size={14} />
                            </InputGroup.Addon>
                            <RInput
                                placeholder="Nom, code, email, téléphone..."
                                value={filters.searchTerm}
                                onChange={(value) => handleFilterChange('searchTerm', value)}
                            />
                        </InputGroup>
                    </div>
                </Col>

                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: 4, display: 'block' }}>
                            Filter par statut
                        </label>
                        <CustomSelect
                            value={filters.statut}
                            onChange={(value) => handleFilterChange('statut', value)}
                            options={statutOptions}
                            placeholder="Statut"
                        />
                    </div>
                </Col>

                <Col xs={24} md={8}>
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', marginBottom: 4, display: 'block' }}>
                            Filter par DREM
                        </label>
                        <CustomSelect
                            value={filters.drem}
                            onChange={(value) => handleFilterChange('drem', value)}
                            options={dremOptions}
                            placeholder="Direction Régionale"
                        />
                    </div>
                </Col>
            </Row>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                    {filters.statut !== 'TOUS' || filters.drem !== 'TOUS' || filters.searchTerm ? (
                        <span>
                            Filtres actifs: 
                            {filters.statut !== 'TOUS' && <Badge color="blue" style={{ marginLeft: 8 }}>{filters.statut}</Badge>}
                            {filters.drem !== 'TOUS' && <Badge color="green" style={{ marginLeft: 8 }}>{filters.drem}</Badge>}
                            {filters.searchTerm && <Badge color="orange" style={{ marginLeft: 8 }}>Recherche: {filters.searchTerm}</Badge>}
                        </span>
                    ) : 'Aucun filtre actif'}
                </div>
                
                {(filters.statut !== 'TOUS' || filters.drem !== 'TOUS' || filters.searchTerm) && (
                    <button
                        onClick={clearFilters}
                        style={{
                            background: 'none',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '4px 12px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        Effacer les filtres
                    </button>
                )}
            </div>
        </div>
    );

    const EcolesStatsHeader = ({ stats }) => {
        if (!stats) return null;

        const statConfigs = [
            { key: 'total', label: 'Total Écoles', color: '#0369a1', bgColor: '#f0f9ff', borderColor: '#bae6fd' },
            { key: 'valide', label: 'Validées', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
            { key: 'enAttente', label: 'En Attente', color: '#d97706', bgColor: '#fffbeb', borderColor: '#fed7aa' },
            { key: 'active', label: 'Actives', color: '#9333ea', bgColor: '#f5f3ff', borderColor: '#d8b4fe' },
            { key: 'approuve', label: 'Approuvées', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca' },
            { key: 'primaire', label: 'Primaire', color: '#059669', bgColor: '#ecfdf5', borderColor: '#a7f3d0' }
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
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 20,
                    paddingBottom: 15,
                    borderBottom: '1px solid #f1f5f9'
                }}>
                    <IconBox icon={FiBookOpen} />
                    <div style={{ flex: 1 }}>
                        <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                            Consultation des Écoles
                            {filters.statut !== 'TOUS' && ` - ${filters.statut}`}
                        </h5>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            {stats.total} école(s) filtrée(s) • {stats.villesUniques.length} ville(s) • {stats.dremUniques.length} DREM
                        </p>
                    </div>
                </div>

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
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <>
            {/* Barre de filtres */}
            <FilterBar />

            {/* Statistiques */}
            {stats && <EcolesStatsHeader stats={stats} />}

            {/* Tableau des écoles filtrées */}
            <div className="row">
                <div className="col-lg-12">
                    <DataTable
                        title={`Écoles ${filters.statut !== 'TOUS' ? `- ${filters.statut}` : ''}`}
                        subtitle={`école(s) filtrée(s)`}
                        data={filteredEcoles()}
                        loading={loading}
                        error={error}
                        columns={ecolesTableConfig.columns}
                        searchableFields={ecolesTableConfig.searchableFields}
                        filterConfigs={ecolesTableConfig.filterConfigs}
                        actions={ecolesTableConfig.actions}
                        onAction={handleTableActionLocal}
                        onRefresh={handleRefresh}
                        onCreateNew={handleOpenCreateModal} // Utilise la nouvelle fonction
                        defaultPageSize={10}
                        pageSizeOptions={[10, 15, 25, 50]}
                        tableHeight={700}
                        enableRefresh={true}
                        enableCreate={true}
                        createButtonText="Nouvelle École"
                        selectable={false}
                        rowKey="id"
                        customStyles={{
                            container: { backgroundColor: "#f8f9fa" },
                            panel: { minHeight: "700px" },
                        }}
                        emptyMessage="Aucune école trouvée avec les filtres actuels"
                        showRowIndex={true}
                    />
                </div>
            </div>

            {/* Modal Unifié Création/Modification */}
            <CreateEcoleModal
                show={modalState.visible}
                onClose={handleCloseUnifiedModal}
                onSave={handleUnifiedModalSave}
                selectedEcole={modalState.selectedEcole}
                mode={modalState.mode}
            />

            {/* Modal pour les autres actions (View, Delete) */}
            <QuestionModal
                modalState={questionModalState}
                onClose={handleCloseModal}
                onSave={handleModalSave}
                entityName="école"
                viewTitle="Détails de l'école"
                deleteTitle="Supprimer l'école"
                viewFields={[
                    { key: 'nom', label: 'Nom' },
                    { key: 'code', label: 'Code' },
                    { key: 'email', label: 'Email' },
                    { key: 'telephone', label: 'Téléphone' },
                    { key: 'ville.villelibelle', label: 'Ville' },
                    { key: 'commune.communelibelle', label: 'Commune' },
                    { key: 'niveauEnseignement.libelle', label: 'Niveau d\'Enseignement' },
                    { key: 'status', label: 'Statut' }
                ]}
            />
        </>
    );
};

export default ConsultationEcoles;