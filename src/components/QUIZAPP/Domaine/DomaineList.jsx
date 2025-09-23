import React, { useState, useCallback, useEffect } from 'react';
import {
    Badge,
    Button,
    Panel
} from 'rsuite';
import {
    FiFileText,
    FiSave,
    FiEdit,
    FiTrash2
} from 'react-icons/fi';
import SelectPicker from "rsuite/SelectPicker";
import DataTable from '../../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePostData from "../../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

// Import des services
import { useDomaineData, lessonsTableConfig, updateLessonActiveStatus } from './domaineService';
import { loadAllReferenceData } from '../../services/referenceDataService';

const SaveDomains = () => {
    // ===========================
    // CONFIGURATION & CONSTANTES
    // ===========================
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("domain_api.php");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { lessons, loading, error, refetch } = useDomaineData(refreshTrigger);

    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState({
        pays: [],
        niveauxPremium: []
    });

    // ===========================
    // ÉTATS - FORMULAIRE PRINCIPAL
    // ===========================
    const initialFormData = {
        id: null, // Pour la modification
        name: "",
        description: "",
        color: "#3498db",
        country_id: null,
        premium_level_id: null,
        active: 1
    };

    const [formData, setFormData] = useState(initialFormData);
    const [selectedDomainIds, setSelectedDomainIds] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
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
        setIsEditing(false);
        setSelectedDomainIds([]);
    }, []);

    const handleRefreshDomains = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);

    // ===========================
    // GESTION DES DONNÉES
    // ===========================

    const loadAllReferenceDataLocal = useCallback(async () => {
        try {
            await loadAllReferenceData(setReferenceData, () => {});
        } catch (error) {
            console.error("Erreur lors du chargement des données de référence:", error);
        }
    }, []);

    // ===========================
    // GESTION DES ACTIONS DU TABLEAU
    // ===========================

    const handleTableAction = useCallback((actionType, item) => {
        switch (actionType) {
            case 'edit':
                handleEditDomain(item);
                break;
            case 'delete':
                handleDeleteDomain(item);
                break;
            case 'toggle_active':
                handleToggleActive(item);
                break;
            default:
                console.log(`Action ${actionType} non gérée`);
        }
    }, []);

    const handleEditDomain = useCallback((domain) => {
        setFormData({
            id: domain.id,
            name: domain.name || "",
            description: domain.description || "",
            color: domain.color || "#3498db",
            country_id: domain.country_id || null,
            premium_level_id: domain.premium_level_id || null,
            active: domain.active || 1
        });
        setIsEditing(true);
        
        // Faire défiler vers le formulaire
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDeleteDomain = useCallback(async (domain) => {
        const confirm = await MySwal.fire({
            title: 'Confirmer la suppression',
            text: `Êtes-vous sûr de vouloir supprimer le domaine "${domain.name}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6'
        });

        if (confirm.isConfirmed) {
            try {
                const result = await postData({
                    action: 'delete',
                    id: domain.id
                });

                if (result && result.success) {
                    toast.success(`✅ Domaine "${domain.name}" supprimé avec succès !`);
                    handleRefreshDomains();
                } else {
                    throw new Error(result?.message || "Erreur lors de la suppression");
                }
            } catch (error) {
                toast.error(`❌ Erreur: ${error.message}`);
            }
        }
    }, [MySwal, postData, handleRefreshDomains]);

    const handleToggleActive = useCallback(async (domain) => {
        try {
            const result = await postData({
                action: 'toggle_active',
                id: domain.id,
                active: domain.active ? 0 : 1
            });

            if (result && result.success) {
                toast.success(`✅ Statut du domaine "${domain.name}" modifié avec succès !`);
                handleRefreshDomains();
            } else {
                throw new Error(result?.message || "Erreur lors de la modification du statut");
            }
        } catch (error) {
            toast.error(`❌ Erreur: ${error.message}`);
        }
    }, [postData, handleRefreshDomains]);

    const handleDomainSelection = useCallback((selectedIds) => {
        setSelectedDomainIds(selectedIds);
    }, []);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================

    const validateForm = useCallback(() => {
        const errors = [];
        
        if (!formData.name.trim()) {
            errors.push("Le nom du domaine est obligatoire");
        }
        
        if (!formData.country_id) {
            errors.push("Le pays est obligatoire");
        }

        return errors;
    }, [formData]);

    const handleSubmitDomain = useCallback(async (event) => {
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
        const actionText = isEditing ? 'modifier' : 'créer';
        const confirm = await MySwal.fire({
            title: `Confirmer la ${actionText === 'créer' ? 'création' : 'modification'} du domaine ?`,
            text: `Voulez-vous ${actionText} le domaine "${formData.name}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: `Oui, ${actionText}`,
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        });

        if (!confirm.isConfirmed) return;

        try {
            setSubmitLoading(true);

            const dataToSend = {
                ...formData,
                action: isEditing ? 'update' : 'create'
            };

            const result = await postData(dataToSend);

            if (result && result.success) {
                const successMessage = isEditing 
                    ? `✅ Domaine "${formData.name}" modifié avec succès !`
                    : `✅ Domaine "${formData.name}" créé avec succès !`;
                
                toast.success(successMessage, {
                    position: "top-center"
                });
                
                resetForm();
                handleRefreshDomains();
            } else {
                throw new Error(result?.message || `Erreur lors de la ${actionText === 'créer' ? 'création' : 'modification'} du domaine`);
            }
        } catch (err) {
            console.error(`Erreur lors de la ${actionText === 'créer' ? 'création' : 'modification'} du domaine:`, err);
            toast.error(`❌ Erreur: ${err.message}`, {
                position: "top-center"
            });
        } finally {
            setSubmitLoading(false);
        }
    }, [formData, isEditing, postData, resetForm, handleRefreshDomains, MySwal, validateForm]);

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
                                {isEditing ? 'Modification d\'un Domaine' : 'Création d\'un Domaine'}
                            </h3>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                                {isEditing ? 'Modifiez les informations du domaine' : 'Configurez votre nouveau domaine d\'activité'}
                            </p>
                        </div>
                        {isEditing && (
                            <Button
                                appearance="subtle"
                                size="sm"
                                onClick={resetForm}
                                style={{ color: '#6c757d' }}
                            >
                                Annuler la modification
                            </Button>
                        )}
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

                            {/* Nom du domaine */}
                            <div className="col-lg-8">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Nom du domaine d'activité
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Saisir le nom du domaine"
                                        value={formData.name}
                                        onChange={(e) => updateFormField('name', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {/* Couleur */}
                            <div className="col-lg-4">
                                <div className="form-group mb-3">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Couleur du domaine
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
                            <div className="col-lg-12">
                                <div className="form-group mb-4">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Saisir la description du domaine"
                                        value={formData.description}
                                        onChange={(e) => updateFormField('description', e.target.value)}
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
                                        disabled={submitLoading}
                                        startIcon={<FiSave />}
                                        style={{ backgroundColor: formData.color, borderColor: formData.color }}
                                        onClick={handleSubmitDomain}
                                    >
                                        {submitLoading 
                                            ? (isEditing ? 'Modification en cours...' : 'Création en cours...')
                                            : (isEditing ? 'Modifier le Domaine' : 'Créer le Domaine')
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===========================
                        COLONNE DROITE - TABLEAU DES DOMAINES
                        =========================== */}
                    <div className='col-lg-6'>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => e.stopPropagation()}
                            style={{ width: '100%' }}
                        >
                            <DataTable
                                title="Liste des domaines"
                                subtitle={`${lessons?.length || 0} domaine(s) disponible(s)`}
                                data={lessons}
                                loading={loading}
                                error={error}
                                columns={lessonsTableConfig.columns}
                                searchableFields={lessonsTableConfig.searchableFields}
                                filterConfigs={lessonsTableConfig.filterConfigs}
                                actions={lessonsTableConfig.actions}
                                onAction={handleTableAction}
                                onRefresh={handleRefreshDomains}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={600}
                                enableRefresh={true}
                                selectable={false}
                                selectedItems={selectedDomainIds}
                                onSelectionChange={handleDomainSelection}
                                rowKey="id"
                                customStyles={{
                                    container: { backgroundColor: "#f8f9fa" },
                                    panel: { minHeight: "600px" },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </Panel>
        </>
    );
};

export default SaveDomains;