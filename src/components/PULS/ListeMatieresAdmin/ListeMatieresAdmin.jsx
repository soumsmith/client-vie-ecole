import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    Button, 
    Panel, 
    Row, 
    Col, 
    Message, 
    Loader, 
    Badge,
    Modal,
    Form,
    Input,
    SelectPicker,
    InputNumber,
    Toggle,
    Notification,
    toaster
} from 'rsuite';
import { 
    FiBookOpen, 
    FiGrid, 
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiTag,
    FiLayers,
    FiX,
    FiCheck
} from 'react-icons/fi';

// Import des fonctions externalisées
import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { 
    useMatieresData, 
    useReferenceData,
    matieresTableConfig 
} from './MatieresService';

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES
// ===========================
const MatieresStatsHeader = ({ matieres, loading }) => {
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
                    <span>Chargement des matières...</span>
                </div>
            </div>
        );
    }

    // Calcul des statistiques
    const totalMatieres = matieres.length;
    const matieresAcademiques = matieres.filter(m => m.is_academic).length;
    const matieresTechniques = matieres.filter(m => m.is_technical).length;
    const matieresSpeciales = matieres.filter(m => m.is_special).length;
    const matieresAvecParent = matieres.filter(m => m.has_parent).length;
    const matieresAvecBonus = matieres.filter(m => m.has_bonus).length;
    const matieresAvecPEC = matieres.filter(m => m.is_pec).length;
    
    // Répartition par catégorie
    const categoriesUniques = [...new Set(matieres.map(m => m.categorie_libelle))].length;
    const niveauxUniques = [...new Set(matieres.map(m => m.niveau_libelle))].length;

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
                        Statistiques des Matières
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Année scolaire 2024-2025 • {totalMatieres} matière(s) • {categoriesUniques} catégorie(s) • {niveauxUniques} niveau(x)
                    </p>
                </div>
            </div>

            {/* Statistiques en grille */}
            <Row gutter={16}>
                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0f9ff',
                        borderRadius: '8px',
                        border: '1px solid #bae6fd'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#0369a1' }}>
                            {totalMatieres}
                        </div>
                        <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
                            Total Matières
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f0fdf4',
                        borderRadius: '8px',
                        border: '1px solid #bbf7d0'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#16a34a' }}>
                            {matieresAcademiques}
                        </div>
                        <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: '500' }}>
                            Académiques
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#eff6ff',
                        borderRadius: '8px',
                        border: '1px solid #c7d2fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#2563eb' }}>
                            {matieresTechniques}
                        </div>
                        <div style={{ fontSize: '12px', color: '#2563eb', fontWeight: '500' }}>
                            Techniques
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fffbeb',
                        borderRadius: '8px',
                        border: '1px solid #fed7aa'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#d97706' }}>
                            {matieresSpeciales}
                        </div>
                        <div style={{ fontSize: '12px', color: '#d97706', fontWeight: '500' }}>
                            Spéciales
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#fdf2f8',
                        borderRadius: '8px',
                        border: '1px solid #fbcfe8'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#ec4899' }}>
                            {matieresAvecParent}
                        </div>
                        <div style={{ fontSize: '12px', color: '#ec4899', fontWeight: '500' }}>
                            Sous-matières
                        </div>
                    </div>
                </Col>

                <Col xs={12} sm={8} md={4}>
                    <div style={{
                        textAlign: 'center',
                        padding: '15px',
                        backgroundColor: '#f5f3ff',
                        borderRadius: '8px',
                        border: '1px solid #d8b4fe'
                    }}>
                        <div style={{ fontSize: '24px', fontWeight: '700', color: '#9333ea' }}>
                            {matieresAvecPEC}
                        </div>
                        <div style={{ fontSize: '12px', color: '#9333ea', fontWeight: '500' }}>
                            Avec P.E.C
                        </div>
                    </div>
                </Col>
            </Row>

            {/* Badges informatifs */}
            <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <Badge color="green" style={{ fontSize: '11px' }}>
                    {categoriesUniques} Catégories
                </Badge>
                <Badge color="blue" style={{ fontSize: '11px' }}>
                    {niveauxUniques} Niveaux
                </Badge>
                {matieresAvecBonus > 0 && (
                    <Badge color="orange" style={{ fontSize: '11px' }}>
                        {matieresAvecBonus} Avec bonus
                    </Badge>
                )}
            </div>
        </div>
    );
};

// ===========================
// MODAL DE CRÉATION/MODIFICATION DE MATIÈRE
// ===========================
const MatiereModal = ({ show, editData, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        code: '',
        libelle: '',
        niveauEnseignement: null,
        categorie: null,
        matiereParent: null,
        numOrdre: 0,
        pec: false,
        bonus: false
    });
    const [loading, setLoading] = useState(false);
    const formRef = useRef();

    // Charger les données de référence
    const { categories, niveaux, matieresParent, loading: refLoading } = useReferenceData();

    // Initialiser le formulaire en mode édition
    useEffect(() => {
        if (editData && show) {
            setFormData({
                code: editData.code || '',
                libelle: editData.libelle || '',
                niveauEnseignement: editData.niveau_id || null,
                categorie: editData.categorie_id || null,
                matiereParent: editData.parent_id || null,
                numOrdre: editData.numOrdre || 0,
                pec: editData.pec > 0,
                bonus: editData.bonus > 0
            });
        } else if (!editData && show) {
            // Réinitialiser pour une nouvelle matière
            setFormData({
                code: '',
                libelle: '',
                niveauEnseignement: null,
                categorie: null,
                matiereParent: null,
                numOrdre: 0,
                pec: false,
                bonus: false
            });
        }
    }, [editData, show]);

    const handleSubmit = async () => {
        // Validation manuelle des champs obligatoires
        if (!formData.code || !formData.libelle || !formData.niveauEnseignement || !formData.categorie) {
            toaster.push(
                <Notification type="error" header="Erreur de validation">
                    Veuillez remplir tous les champs obligatoires (Code, Libellé, Niveau Enseignement, Catégorie).
                </Notification>,
                { duration: 4000 }
            );
            return;
        }

        setLoading(true);
        try {
            // Préparer les données pour l'API
            const submitData = {
                code: formData.code,
                libelle: formData.libelle,
                niveauEnseignement: { id: formData.niveauEnseignement },
                categorie: { id: formData.categorie },
                matiereParent: formData.matiereParent ? { id: formData.matiereParent } : null,
                numOrdre: formData.numOrdre,
                pec: formData.pec ? 1 : 0,
                bonus: formData.bonus ? 1 : 0
            };

            console.log('Données à soumettre:', submitData);

            // Ici vous pouvez ajouter l'appel API pour créer/modifier
            if (editData) {
                // Mode modification
                // await updateMatiere(editData.id, submitData);
                console.log('Modification de la matière:', editData.id, submitData);
            } else {
                // Mode création
                // await createMatiere(submitData);
                console.log('Création d\'une nouvelle matière:', submitData);
            }

            // Simulation d'un délai d'API
            await new Promise(resolve => setTimeout(resolve, 1000));

            onSuccess(submitData);
            onClose();

            toaster.push(
                <Notification type="success" header={editData ? "Matière modifiée" : "Matière créée"}>
                    {editData ? "Les modifications ont été enregistrées avec succès." : "La nouvelle matière a été créée avec succès."}
                </Notification>,
                { duration: 4000 }
            );

        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            toaster.push(
                <Notification type="error" header="Erreur">
                    Une erreur est survenue lors de la sauvegarde.
                </Notification>,
                { duration: 4000 }
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    return (
        <Modal open={show} onClose={onClose} size="md">
            <Modal.Header>
                <Modal.Title>
                    {editData ? 'Modifier une Matière' : 'Créer une nouvelle Matière'}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form 
                    ref={formRef}
                    formValue={formData}
                    onChange={setFormData}
                    layout="vertical"
                >
                    <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Group controlId="code">
                                <Form.ControlLabel>Code *</Form.ControlLabel>
                                <Form.Control
                                    name="code"
                                    accepter={Input}
                                    placeholder="Code de la matière"
                                />
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group controlId="libelle">
                                <Form.ControlLabel>Libellé *</Form.ControlLabel>
                                <Form.Control
                                    name="libelle"
                                    accepter={Input}
                                    placeholder="Nom de la matière"
                                />
                            </Form.Group>
                        </Col>
                    </Row>

                    <Form.Group controlId="niveauEnseignement">
                        <Form.ControlLabel>Niveau Enseignement *</Form.ControlLabel>
                        <Form.Control
                            name="niveauEnseignement"
                            accepter={SelectPicker}
                            data={niveaux}
                            placeholder="Sélectionner le niveau"
                            loading={refLoading}
                            searchable
                            style={{ width: '100%' }}
                        />
                    </Form.Group>

                    <Form.Group controlId="categorie">
                        <Form.ControlLabel>Catégorie Matière *</Form.ControlLabel>
                        <Form.Control
                            name="categorie"
                            accepter={SelectPicker}
                            data={categories}
                            placeholder="Sélectionner la catégorie"
                            loading={refLoading}
                            searchable
                            style={{ width: '100%' }}
                        />
                    </Form.Group>

                    <Form.Group controlId="matiereParent">
                        <Form.ControlLabel>Matière parent</Form.ControlLabel>
                        <Form.Control
                            name="matiereParent"
                            accepter={SelectPicker}
                            data={matieresParent}
                            placeholder="Sélectionner une matière parent..."
                            loading={refLoading}
                            searchable
                            cleanable
                            style={{ width: '100%' }}
                        />
                    </Form.Group>

                    <Form.Group controlId="numOrdre">
                        <Form.ControlLabel>Numéro d'ordre</Form.ControlLabel>
                        <Form.Control
                            name="numOrdre"
                            accepter={InputNumber}
                            min={0}
                            max={999}
                            style={{ width: '100%' }}
                        />
                    </Form.Group>

                    <Row gutter={16}>
                        <Col xs={12}>
                            <Form.Group>
                                <Form.ControlLabel style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Form.Control
                                        name="pec"
                                        accepter={Toggle}
                                        checkedChildren="Activé"
                                        unCheckedChildren="Désactivé"
                                    />
                                    <span>P.E.C</span>
                                </Form.ControlLabel>
                                <Form.HelpText>Prise En Compte dans le calcul des moyennes générales</Form.HelpText>
                            </Form.Group>
                        </Col>
                        <Col xs={12}>
                            <Form.Group>
                                <Form.ControlLabel style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <Form.Control
                                        name="bonus"
                                        accepter={Toggle}
                                        checkedChildren="Activé"
                                        unCheckedChildren="Désactivé"
                                    />
                                    <span>Bonus?</span>
                                </Form.ControlLabel>
                                <Form.HelpText>Cette matière donne-t-elle des points bonus?</Form.HelpText>
                            </Form.Group>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handleCancel} appearance="subtle">
                    <FiX style={{ marginRight: '8px' }} />
                    Annuler
                </Button>
                <Button 
                    onClick={handleSubmit}
                    appearance="primary"
                    loading={loading}
                    style={{ 
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none'
                    }}
                >
                    <FiCheck style={{ marginRight: '8px' }} />
                    {editData ? 'Enregistrer' : 'Créer'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

// ===========================
// COMPOSANT PRINCIPAL DE LA LISTE DES MATIÈRES
// ===========================
const ListeMatieresAdmin = () => {
    const navigate = useNavigate();
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [matiereModal, setMatiereModal] = useState({
        show: false,
        editData: null
    });

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const {
        modalState,
        handleTableAction,
        handleCloseModal
    } = useCommonState();

    const {
        matieres,
        loading,
        error,
        refetch
    } = useMatieresData(refreshTrigger);

    // ===========================
    // GESTION DU TABLEAU ET NAVIGATION
    // ===========================
    const handleTableActionLocal = useCallback((actionType, item) => {
        console.log('Action:', actionType, 'Item:', item);

        // Gestion spécifique pour l'action "modifier"
        if (actionType === 'edit' && item && item.id) {
            setMatiereModal({
                show: true,
                editData: item
            });
            return;
        }

        // Gestion spécifique pour l'action "créer"
        if (actionType === 'create') {
            setMatiereModal({
                show: true,
                editData: null
            });
            return;
        }

        // Pour les autres actions (delete, view, download, etc.), utiliser le modal
        handleTableAction(actionType, item);
    }, [handleTableAction]);

    // ===========================
    // GESTION DU MODAL
    // ===========================
    const handleModalSave = useCallback(async () => {
        try {
            switch (modalState.type) {
                case 'delete':
                    console.log('Supprimer la matière:', modalState.selectedItem);
                    // Ici vous pouvez ajouter la logique de suppression
                    // await deleteMatiere(modalState.selectedItem.id);

                    // Actualiser les données après suppression
                    setRefreshTrigger(prev => prev + 1);
                    break;

                case 'view':
                    console.log('Voir les détails de la matière:', modalState.selectedItem);
                    break;

                case 'download':
                    console.log('Télécharger les données de la matière:', modalState.selectedItem);
                    break;

                default:
                    console.log('Action non gérée:', modalState.type);
                    break;
            }

            handleCloseModal();
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        }
    }, [modalState.type, modalState.selectedItem, handleCloseModal]);

    // ===========================
    // GESTION DU BOUTON CRÉER
    // ===========================
    const handleCreateMatiere = useCallback(() => {
        setMatiereModal({
            show: true,
            editData: null
        });
    }, []);

    // ===========================
    // GESTION DU MODAL DE MATIÈRE
    // ===========================
    const handleMatiereModalClose = useCallback(() => {
        setMatiereModal({
            show: false,
            editData: null
        });
    }, []);

    const handleMatiereModalSuccess = useCallback((data) => {
        // Actualiser les données
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DU RAFRAÎCHISSEMENT
    // ===========================
    const handleRefresh = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DE L'EXPORT
    // ===========================
    const handleExportAll = useCallback(() => {
        console.log('Export de toutes les matières');
        // Ici vous pouvez ajouter la logique d'export
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
                {/* En-tête avec statistiques */}
                <div className="row">
                    <div className="col-lg-12">
                        <MatieresStatsHeader matieres={matieres} loading={loading} />
                    </div>
                </div>

                {/* Erreur de chargement */}
                {error && (
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
                                        {error.message}
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
                )}

                {/* DataTable avec style amélioré */}
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
                                    title="Liste des matières"
                                    subtitle="matière(s) configurée(s)"
                                    
                                    data={matieres}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={matieresTableConfig.columns}
                                    searchableFields={matieresTableConfig.searchableFields}
                                    filterConfigs={matieresTableConfig.filterConfigs}
                                    actions={matieresTableConfig.actions}
                                    
                                    onAction={handleTableActionLocal}
                                    onRefresh={handleRefresh}
                                    onCreateNew={handleCreateMatiere}
                                    
                                    defaultPageSize={matieresTableConfig.pageSize}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={650}
                                    
                                    enableRefresh={true}
                                    enableCreate={true}
                                    createButtonText="Nouveau"
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

                {/* Aucune matière - cas improbable mais à gérer */}
                {!loading && !error && matieres?.length === 0 && (
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
                                    Aucune matière configurée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                    Il n'y a actuellement aucune matière configurée dans le système.
                                </p>
                                <Button
                                    appearance="primary"
                                    style={{ 
                                        marginTop: 15,
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        border: 'none'
                                    }}
                                    startIcon={<FiPlus />}
                                    onClick={handleCreateMatiere}
                                >
                                    Créer une nouvelle matière
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal de création/modification de matière */}
            <MatiereModal
                show={matiereModal.show}
                editData={matiereModal.editData}
                onClose={handleMatiereModalClose}
                onSuccess={handleMatiereModalSuccess}
            />
        </div>
    );
};

export default ListeMatieresAdmin;