import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Panel
} from 'rsuite';
import {
    FiFileText,
    FiSave,
    FiCheckCircle
} from 'react-icons/fi';
import SelectPicker from "rsuite/SelectPicker";
import DataTable from '../../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePostData from "../../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

// Import des services
import { useLevelDomainsData, levelTableConfig } from './domaineService';
import { loadAllReferenceData } from '../../services/referenceDataService';

const SaveLevelDomains = () => {
    // ===========================
    // CONFIGURATION & CONSTANTES
    // ===========================
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("level_domain_api.php");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { levelDomains, loading, error, refetch } = useLevelDomainsData(refreshTrigger);

    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState({
        pays: [],
        niveauxPremium: [],
        domaines: []
    });

    // ===========================
    // ÉTATS - FORMULAIRE PRINCIPAL
    // ===========================
    const initialFormData = {
        // Informations de base
        title: "",
        description: "",
        color: "#3498db",

        // Catégorisation
        domain_id: null,
        country_id: null,
        premium_level_id: null,

        // Configuration
        active: 1,
        order_index: 0
    };

    const [formData, setFormData] = useState(initialFormData);

    // ===========================
    // ÉTATS - SÉLECTION DES NIVEAUX
    // ===========================
    const [selectedLevelIds, setSelectedLevelIds] = useState([]);
    const [selectedLevels, setSelectedLevels] = useState([]);

    // ===========================
    // ÉTATS - UI
    // ===========================
    const [submitLoading, setSubmitLoading] = useState(false);

    // ===========================
    // FONCTIONS UTILITAIRES
    // ===========================
    const updateFormField = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const resetForm = useCallback(() => {
        setFormData(initialFormData);
        setSelectedLevelIds([]);
        setSelectedLevels([]);
    }, []);

    const handleRefreshLevels = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DES DONNÉES
    // ===========================
    const loadAllReferenceDataLocal = useCallback(async () => {
        try {
            await loadAllReferenceData(setReferenceData, () => { });
        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
        }
    }, []);

    // ===========================
    // GESTION DE LA SÉLECTION DES NIVEAUX
    // ===========================
    const handleLevelSelection = useCallback((levelIds) => {
        setSelectedLevelIds(levelIds);
        
        // Mettre à jour la liste des niveaux sélectionnés
        const selected = levelDomains.filter(level => levelIds.includes(level.id));
        setSelectedLevels(selected);
    }, [levelDomains]);

    // ===========================
    // GESTION DES ACTIONS DU TABLEAU
    // ===========================
    const handleTableAction = useCallback((actionType, item) => {
        switch (actionType) {
            case 'edit':
                console.log('Modifier le niveau:', item);
                break;
            case 'delete':
                console.log('Supprimer le niveau:', item);
                break;
            case 'toggle_active':
                console.log('Basculer le statut:', item);
                break;
            default:
                console.log(`Action ${actionType} non gérée`);
        }
    }, []);

    // ===========================
    // VALIDATION DU FORMULAIRE
    // ===========================
    const validateForm = useCallback(() => {
        const errors = [];

        /*if (!formData.title.trim()) {
            errors.push("Le titre est obligatoire");
        }*/

        if (!formData.domain_id) {
            errors.push("Le domaine d'activité est obligatoire");
        }

        /*if (!formData.country_id) {
            errors.push("Le pays est obligatoire");
        }*/

        if (selectedLevelIds.length === 0) {
            errors.push("Vous devez sélectionner au moins un niveau");
        }

        return errors;
    }, [formData, selectedLevelIds]);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================
    const handleSubmitLevelDomains = useCallback(async (event) => {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        // Validation
        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            MySwal.fire({
                title: 'Erreurs de validation',
                html: validationErrors.map(error => `<p>• ${error}</p>`).join(''),
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }

        // Confirmation utilisateur
        const confirm = await MySwal.fire({
            title: 'Confirmer la création ?',
            text: `Voulez-vous créer "${formData.title}" avec ${selectedLevelIds.length} niveau(x) sélectionné(s) ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Oui, créer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        try {
            setSubmitLoading(true);

            const dataToSend = {
                ...formData,
                level_ids: selectedLevelIds,
                action: 'create'
            };

            const result = await postData(dataToSend);

            if (result && result.success) {
                toast.success(`✅ "${formData.title}" créé avec succès avec ${selectedLevelIds.length} niveau(x) !`, {
                    position: "top-center"
                });
                resetForm();
                handleRefreshLevels();
            } else {
                throw new Error(result?.message || "Erreur lors de la création");
            }
        } catch (err) {
            console.error("Erreur lors de la création:", err);
            toast.error(`❌ Erreur: ${err.message}`, {
                position: "top-center"
            });
        } finally {
            setSubmitLoading(false);
        }
    }, [formData, selectedLevelIds, postData, resetForm, handleRefreshLevels, MySwal, validateForm]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================
    
    // Chargement initial des données de référence
    useEffect(() => {
        loadAllReferenceDataLocal();
    }, [loadAllReferenceDataLocal]);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <>
            <Panel
                header={
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div>
                            <h3 style={{
                                margin: 0,
                                color: '#2c3e50',
                                fontSize: '20px',
                                fontWeight: '600'
                            }}>
                                Gestion des Niveaux de Domaine
                            </h3>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                                Configurez et sélectionnez les niveaux pour votre domaine d'activité
                            </p>
                        </div>
                    </div>
                }
                bordered
                style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
            >
                <div className='row mt-5'>
                    {/* ===========================
                        COLONNE GAUCHE - FORMULAIRE
                        =========================== */}
                    <div className='col-lg-6'>
                        <div className="row">
                            {/* INFORMATIONS DE BASE */}
                            <div className="col-lg-12">
                                <h5 className="mb-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    <FiFileText style={{ marginRight: '8px' }} />
                                    Informations de base
                                </h5>
                            </div>

                            {/* Titre */}
                            <div className="col-lg-8 d-none">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Titre
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Saisir le titre"
                                        value={formData.title}
                                        onChange={(e) => updateFormField('title', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Couleur */}
                            <div className="col-lg-4 d-none">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Couleur
                                    </label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <input
                                            type="color"
                                            className="form-control"
                                            value={formData.color}
                                            onChange={(e) => updateFormField('color', e.target.value)}
                                            style={{ width: '60px', height: '38px', padding: '2px' }}
                                        />
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.color}
                                            onChange={(e) => updateFormField('color', e.target.value)}
                                            placeholder="#3498db"
                                            style={{ flex: 1 }}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="col-lg-12 d-none">
                                <div className="form-group mb-4">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Saisir la description"
                                        value={formData.description}
                                        onChange={(e) => updateFormField('description', e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* CATÉGORISATION */}
                            <div className="col-lg-12 d-none">
                                <h5 className="mb-3 mt-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    Catégorisation
                                </h5>
                            </div>

                            {/* Domaine d'activité */}
                            <div className="col-lg-12">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Domaine d'activité
                                    </label>
                                    <SelectPicker
                                        data={referenceData.domaines}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('domain_id', value)}
                                        value={formData.domain_id}
                                        placeholder="Sélectionnez un domaine"
                                    />
                                </div>
                            </div>

                            {/* Niveau Premium */}
                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Niveau Premium
                                    </label>
                                    <SelectPicker
                                        data={referenceData.niveauxPremium}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('premium_level_id', value)}
                                        value={formData.premium_level_id}
                                        placeholder="Sélectionnez un niveau"
                                    />
                                </div>
                            </div>

                            {/* Pays */}
                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Pays
                                    </label>
                                    <SelectPicker
                                        data={referenceData.pays}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('country_id', value)}
                                        value={formData.country_id}
                                        placeholder="Sélectionnez un pays"
                                    />
                                </div>
                            </div>

                            {/* CONFIGURATION */}
                            <div className="col-lg-12">
                                <h5 className="mb-3 mt-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    Configuration
                                </h5>
                            </div>

                            {/* Ordre d'affichage */}
                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Ordre d'affichage
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        min="0"
                                        value={formData.order_index}
                                        onChange={(e) => updateFormField('order_index', parseInt(e.target.value) || 0)}
                                    />
                                </div>
                            </div>

                            {/* Statut */}
                            <div className="col-lg-6">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Statut
                                    </label>
                                    <SelectPicker
                                        data={[
                                            { label: 'Actif', value: 1 },
                                            { label: 'Inactif', value: 0 }
                                        ]}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('active', value)}
                                        value={formData.active}
                                        placeholder="Sélectionnez un statut"
                                    />
                                </div>
                            </div>

                            {/* RÉSUMÉ DE LA SÉLECTION */}
                            {selectedLevels.length > 0 && (
                                <div className="col-lg-12">
                                    <div className="mt-4 p-3 bg-light rounded">
                                        <h6 className="mb-2">
                                            <FiCheckCircle style={{ color: 'green', marginRight: '8px' }} />
                                            Niveaux sélectionnés: {selectedLevels.length}
                                        </h6>
                                        <div className="d-flex flex-wrap gap-2">
                                            {selectedLevels.slice(0, 5).map((level, index) => (
                                                <Badge key={level.id} color="blue">
                                                    {level.name}
                                                </Badge>
                                            ))}
                                            {selectedLevels.length > 5 && (
                                                <Badge color="gray">
                                                    +{selectedLevels.length - 5} autres...
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* BOUTONS D'ACTION */}
                            <div className="col-lg-12">
                                <div className="mt-4 d-flex justify-content-end gap-2">
                                    <Button
                                        type="button"
                                        appearance="subtle"
                                        onClick={resetForm}
                                        disabled={submitLoading}
                                    >
                                        Réinitialiser
                                    </Button>
                                    <Button
                                        type="button"
                                        appearance="primary"
                                        loading={submitLoading}
                                        disabled={submitLoading || selectedLevels.length === 0}
                                        startIcon={<FiSave />}
                                        style={{ backgroundColor: formData.color, borderColor: formData.color }}
                                        onClick={handleSubmitLevelDomains}
                                    >
                                        {submitLoading ? 'Création en cours...' : 'Créer avec les Niveaux'}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===========================
                        COLONNE DROITE - TABLEAU DES NIVEAUX
                        =========================== */}
                    <div className='col-lg-6'>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => e.stopPropagation()}
                            style={{ width: '100%' }}
                        >
                            <DataTable
                                title="Sélection des Niveaux"
                                subtitle={`niveau(x) disponible(s)`}
                                data={levelDomains}
                                loading={loading}
                                error={error}
                                columns={levelTableConfig.columns}
                                searchableFields={levelTableConfig.searchableFields}
                                filterConfigs={levelTableConfig.filterConfigs}
                                actions={levelTableConfig.actions}
                                onAction={handleTableAction}
                                onRefresh={handleRefreshLevels}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={600}
                                enableRefresh={true}
                                enableCreate={true}
                                createButtonText="Nouveau Niveau"
                                selectable={true}
                                selectedItems={selectedLevelIds}
                                onSelectionChange={handleLevelSelection}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: '#f8f9fa' },
                                    panel: { minHeight: '600px' }
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Panel>
        </>
    );
};

export default SaveLevelDomains;