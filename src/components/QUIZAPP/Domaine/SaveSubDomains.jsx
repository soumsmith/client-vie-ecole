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
    FiTrash2,
    FiFolder,
    FiLayers
} from 'react-icons/fi';
import SelectPicker from "rsuite/SelectPicker";
import DataTable from '../../DataTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import usePostData from "../../hooks/usePostData";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { toast } from 'react-toastify';

// Import des services
import { useSubDomaineData, subDomainsTableConfig } from './domaineService';
import { loadAllReferenceData } from '../../services/referenceDataService';

const SaveSubDomains = () => {
    // ===========================
    // CONFIGURATION & CONSTANTES
    // ===========================
    const MySwal = withReactContent(Swal);
    const { postData, loadingPost, errorPost } = usePostData("subdomain_api.php");
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { subDomains, loading, error, refetch } = useSubDomaineData(refreshTrigger);

    // ===========================
    // ÉTATS - DONNÉES DE RÉFÉRENCE
    // ===========================
    const [referenceData, setReferenceData] = useState({
        domaines: [],
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
        domain_id: null, // Domaine parent (obligatoire)
        country_id: null,
        premium_level_id: null,
        active: 1
    };

    const [formData, setFormData] = useState(initialFormData);
    const [selectedSubDomainIds, setSelectedSubDomainIds] = useState([]);
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
        setSelectedSubDomainIds([]);
    }, []);

    const handleRefreshSubDomains = useCallback(() => {
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
                handleEditSubDomain(item);
                break;
            case 'delete':
                handleDeleteSubDomain(item);
                break;
            case 'toggle_active':
                handleToggleActive(item);
                break;
            default:
                console.log(`Action ${actionType} non gérée`);
        }
    }, []);

    const handleEditSubDomain = useCallback((subDomain) => {
        setFormData({
            id: subDomain.id,
            name: subDomain.name || "",
            description: subDomain.description || "",
            color: subDomain.color || "#3498db",
            domain_id: subDomain.domain_id || null,
            country_id: subDomain.country_id || null,
            premium_level_id: subDomain.premium_level_id || null,
            active: subDomain.active || 1
        });
        setIsEditing(true);
        
        // Faire défiler vers le formulaire
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, []);

    const handleDeleteSubDomain = useCallback(async (subDomain) => {
        const confirm = await MySwal.fire({
            title: 'Confirmer la suppression',
            text: `Êtes-vous sûr de vouloir supprimer le sous-domaine "${subDomain.name}" ?`,
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
                    id: subDomain.id
                });

                if (result && result.success) {
                    toast.success(`✅ Sous-domaine "${subDomain.name}" supprimé avec succès !`);
                    handleRefreshSubDomains();
                } else {
                    throw new Error(result?.message || "Erreur lors de la suppression");
                }
            } catch (error) {
                toast.error(`❌ Erreur: ${error.message}`);
            }
        }
    }, [MySwal, postData, handleRefreshSubDomains]);

    const handleToggleActive = useCallback(async (subDomain) => {
        try {
            const result = await postData({
                action: 'toggle_active',
                id: subDomain.id,
                active: subDomain.active ? 0 : 1
            });

            if (result && result.success) {
                toast.success(`✅ Statut du sous-domaine "${subDomain.name}" modifié avec succès !`);
                handleRefreshSubDomains();
            } else {
                throw new Error(result?.message || "Erreur lors de la modification du statut");
            }
        } catch (error) {
            toast.error(`❌ Erreur: ${error.message}`);
        }
    }, [postData, handleRefreshSubDomains]);

    const handleSubDomainSelection = useCallback((selectedIds) => {
        setSelectedSubDomainIds(selectedIds);
    }, []);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================

    const validateForm = useCallback(() => {
        const errors = [];
        
        if (!formData.name.trim()) {
            errors.push("Le nom du sous-domaine est obligatoire");
        }
        
        if (!formData.domain_id) {
            errors.push("La sélection du domaine parent est obligatoire");
        }
        
        if (!formData.country_id) {
            errors.push("Le pays est obligatoire");
        }

        return errors;
    }, [formData]);

    const handleSubmitSubDomain = useCallback(async (event) => {
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
            title: `Confirmer la ${actionText === 'créer' ? 'création' : 'modification'} du sous-domaine ?`,
            text: `Voulez-vous ${actionText} le sous-domaine "${formData.name}" ?`,
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
                    ? `✅ Sous-domaine "${formData.name}" modifié avec succès !`
                    : `✅ Sous-domaine "${formData.name}" créé avec succès !`;
                
                toast.success(successMessage, {
                    position: "top-center"
                });
                
                resetForm();
                handleRefreshSubDomains();
            } else {
                throw new Error(result?.message || `Erreur lors de la ${actionText === 'créer' ? 'création' : 'modification'} du sous-domaine`);
            }
        } catch (err) {
            console.error(`Erreur lors de la ${actionText === 'créer' ? 'création' : 'modification'} du sous-domaine:`, err);
            toast.error(`❌ Erreur: ${err.message}`, {
                position: "top-center"
            });
        } finally {
            setSubmitLoading(false);
        }
    }, [formData, isEditing, postData, resetForm, handleRefreshSubDomains, MySwal, validateForm]);

    // ===========================
    // EFFETS (useEffect)
    // ===========================

    // Chargement initial des données de référence
    useEffect(() => {
        loadAllReferenceDataLocal();
    }, [loadAllReferenceDataLocal]);

    // ===========================
    // HELPERS POUR L'AFFICHAGE
    // ===========================

    const getSelectedDomainName = () => {
        if (!formData.domain_id) return null;
        const domain = referenceData.domaines.find(d => d.value === formData.domain_id);
        return domain ? domain.label : null;
    };

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
                                <FiLayers style={{ marginRight: '8px' }} />
                                {isEditing ? 'Modification d\'un Sous-Domaine' : 'Création d\'un Sous-Domaine'}
                            </h3>
                            <p style={{
                                margin: '4px 0 0 0',
                                color: '#6c757d',
                                fontSize: '14px'
                            }}>
                                {isEditing ? 'Modifiez les informations du sous-domaine' : 'Créez un nouveau sous-domaine rattaché à un domaine parent'}
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
                            {/* SELECTION DU DOMAINE PARENT */}
                            <div className="col-lg-12">
                                <h5 className="mb-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    <FiFolder style={{ marginRight: '8px' }} />
                                    Domaine Parent
                                </h5>
                            </div>

                            {/* Sélection du domaine */}
                            <div className="col-lg-12">
                                <div className="form-group mb-4">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Domaine d'activité parent
                                    </label>
                                    <SelectPicker
                                        data={referenceData.domaines}
                                        style={{ width: "100%" }}
                                        size="lg"
                                        onChange={(value) => updateFormField('domain_id', value)}
                                        value={formData.domain_id}
                                        placeholder="Sélectionnez un domaine parent"
                                        searchable
                                        cleanable
                                    />
                                    {getSelectedDomainName() && (
                                        <small className="text-muted mt-1 d-block">
                                            <FiFolder size={12} /> Domaine sélectionné: <strong>{getSelectedDomainName()}</strong>
                                        </small>
                                    )}
                                </div>
                            </div>

                            {/* INFORMATIONS DE BASE */}
                            <div className="col-lg-12">
                                <h5 className="mb-3" style={{ color: '#495057', borderBottom: '2px solid #e9ecef', paddingBottom: '8px' }}>
                                    <FiFileText style={{ marginRight: '8px' }} />
                                    Informations du sous-domaine
                                </h5>
                            </div>

                            {/* Nom du sous-domaine */}
                            <div className="col-lg-8">
                                <div className="form-group mb-3">
                                    <label className="required fs-6 form-label fw-bold text-gray-900">
                                        Nom du sous-domaine
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Saisir le nom du sous-domaine"
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
                            <div className="col-lg-12">
                                <div className="form-group mb-4">
                                    <label className="fs-6 form-label fw-bold text-gray-900">
                                        Description
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="3"
                                        placeholder="Saisir la description du sous-domaine"
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
                                        cleanable
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
                                        searchable
                                        cleanable
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
                                        disabled={submitLoading || !formData.domain_id}
                                        startIcon={<FiSave />}
                                        style={{ backgroundColor: formData.color, borderColor: formData.color }}
                                        onClick={handleSubmitSubDomain}
                                    >
                                        {submitLoading 
                                            ? (isEditing ? 'Modification en cours...' : 'Création en cours...')
                                            : (isEditing ? 'Modifier le Sous-Domaine' : 'Créer le Sous-Domaine')
                                        }
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===========================
                        COLONNE DROITE - TABLEAU DES SOUS-DOMAINES
                        =========================== */}
                    <div className='col-lg-6'>
                        <div
                            onClick={(e) => e.stopPropagation()}
                            onSubmit={(e) => e.stopPropagation()}
                            style={{ width: '100%' }}
                        >
                            <DataTable
                                title="Liste des sous-domaines"
                                subtitle={`${subDomains?.length || 0} sous-domaine(s) disponible(s)`}
                                data={subDomains}
                                loading={loading}
                                error={error}
                                columns={subDomainsTableConfig.columns}
                                searchableFields={subDomainsTableConfig.searchableFields}
                                filterConfigs={subDomainsTableConfig.filterConfigs}
                                actions={subDomainsTableConfig.actions}
                                onAction={handleTableAction}
                                onRefresh={handleRefreshSubDomains}
                                defaultPageSize={10}
                                pageSizeOptions={[10, 20, 50]}
                                tableHeight={600}
                                enableRefresh={true}
                                selectable={true}
                                selectedItems={selectedSubDomainIds}
                                onSelectionChange={handleSubDomainSelection}
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

export default SaveSubDomains;