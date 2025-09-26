/**
 * Modal de création d'école
 * VERSION: 1.0.0
 * DESCRIPTION: Modal complet avec sélection en cascade pour créer une nouvelle école
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Button,
    Form,
    Input,
    Grid,
    Row,
    Col,
    SelectPicker,
    Text,
    Uploader,
    Message,
    Notification
} from 'rsuite';
import {
    //FiSchool,
    FiSave,
    FiX,
    FiTag,
    FiMapPin,
    FiPhone,
    FiMail,
    FiUpload,
    FiImage,
    FiFile
} from 'react-icons/fi';
import Swal from 'sweetalert2';

import { 
    useReferenceData, 
    useCascadeSelection, 
    validateEcoleData,
    ecolesApiService,
} from './EcolesService';

import { 
    useNiveauxEnseignementData
} from '../utils/CommonDataService';

// ===========================
// COMPOSANT PRINCIPAL DU MODAL
// ===========================
const CreateEcoleModal = ({ show, onClose, onSave }) => {
    // ===========================
    // ÉTATS DU FORMULAIRE
    // ===========================
    const [formData, setFormData] = useState({
        pays: null,
        directionRegionale: null,
        ville: null,
        commune: null,
        zone: null,
        nomEtablissement: '',
        emailEtablissement: '',
        niveauEnseignement: null,
        telephoneEtablissement: '',
        codeEtablissement: '',
        indicationEtablissement: ''
    });

    const [autorisationFile, setAutorisationFile] = useState(null);
    const [logoFile, setLogoFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const { niveaux, loading: niveauxLoading } = useNiveauxEnseignementData();

    // ===========================
    // HOOKS PERSONNALISÉS
    // ===========================
    const { pays, niveauxEnseignement, loading: loadingReference } = useReferenceData();
    const {
        directionsRegionales,
        villes,
        communes,
        zones,
        loading: loadingCascade,
        loadDirectionsRegionales,
        loadVilles,
        loadCommunes,
        loadZones,
        resetCascade
    } = useCascadeSelection();

    // ===========================
    // EFFETS
    // ===========================
    useEffect(() => {
        if (show) {
            resetForm();
        }
    }, [show]);

    // ===========================
    // GESTIONNAIRES DE FORMULAIRE
    // ===========================
    const handleInputChange = useCallback((name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // Effacer l'erreur de validation pour ce champ
        if (validationErrors[name]) {
            setValidationErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    }, [validationErrors]);

    const handlePaysChange = useCallback(async (value) => {
        handleInputChange('pays', value);
        setFormData(prev => ({
            ...prev,
            directionRegionale: null,
            ville: null,
            commune: null,
            zone: null
        }));
        resetCascade();
        
        if (value) {
            await loadDirectionsRegionales(value);
        }
    }, [handleInputChange, resetCascade, loadDirectionsRegionales]);

    const handleDirectionRegionaleChange = useCallback(async (value) => {
        handleInputChange('directionRegionale', value);
        setFormData(prev => ({
            ...prev,
            ville: null,
            commune: null,
            zone: null
        }));
        resetCascade('villes');
        
        if (value) {
            await loadVilles(value);
        }
    }, [handleInputChange, resetCascade, loadVilles]);

    const handleVilleChange = useCallback(async (value) => {
        handleInputChange('ville', value);
        setFormData(prev => ({
            ...prev,
            commune: null,
            zone: null
        }));
        resetCascade('communes');
        
        if (value) {
            await loadCommunes(value);
        }
    }, [handleInputChange, resetCascade, loadCommunes]);

    const handleCommuneChange = useCallback(async (value) => {
        handleInputChange('commune', value);
        setFormData(prev => ({
            ...prev,
            zone: null
        }));
        resetCascade('zones');
        
        if (value) {
            await loadZones(value);
        }
    }, [handleInputChange, resetCascade, loadZones]);

    const handleZoneChange = useCallback((value) => {
        handleInputChange('zone', value);
    }, [handleInputChange]);

    // ===========================
    // GESTION DES FICHIERS
    // ===========================
    const handleAutorisationFileChange = useCallback((files) => {
        const file = files[0];
        if (file) {
            // Validation du fichier PDF
            if (file.type !== 'application/pdf') {
                Swal.fire({
                    icon: 'warning',
                    title: 'Format de fichier invalide',
                    text: 'Veuillez sélectionner un fichier PDF pour l\'autorisation.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }
            
            // Limite de taille (5MB)
            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fichier trop volumineux',
                    text: 'Le fichier PDF ne doit pas dépasser 5MB.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }
        }
        setAutorisationFile(file);
    }, []);

    const handleLogoFileChange = useCallback((files) => {
        const file = files[0];
        if (file) {
            // Validation du fichier image
            const validTypes = ['image/jpeg', 'image/jpg'];
            if (!validTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Format de fichier invalide',
                    text: 'Veuillez sélectionner un fichier JPEG pour le logo.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }
            
            // Limite de taille (2MB)
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire({
                    icon: 'warning',
                    title: 'Fichier trop volumineux',
                    text: 'Le fichier image ne doit pas dépasser 2MB.',
                    confirmButtonColor: '#f59e0b'
                });
                return;
            }
        }
        setLogoFile(file);
    }, []);

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================
    const handleSave = useCallback(async () => {
        // Validation des données
        const validation = validateEcoleData(formData);
        if (!validation.isValid) {
            setValidationErrors(validation.errors);
            Swal.fire({
                icon: 'warning',
                title: 'Formulaire incomplet',
                text: 'Veuillez remplir tous les champs obligatoires.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Demande de confirmation
        const result = await Swal.fire({
            title: 'Confirmer la création',
            text: `Êtes-vous sûr de vouloir créer l'école "${formData.nomEtablissement}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, créer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Préparation des données
            const ecoleData = {
                ...formData,
                // Ajouter les libellés pour l'affichage
                paysLibelle: pays.find(p => p.value === formData.pays)?.label || '',
                drLibelle: directionsRegionales.find(dr => dr.value === formData.directionRegionale)?.label || '',
                villeLibelle: villes.find(v => v.value === formData.ville)?.label || '',
                communeLibelle: communes.find(c => c.value === formData.commune)?.label || '',
                zoneLibelle: zones.find(z => z.value === formData.zone)?.label || '',
                niveauEnseignementLibelle: niveauxEnseignement.find(n => n.value === formData.niveauEnseignement)?.label || ''
            };

            // Upload des fichiers si nécessaire
            let autorisationUrl = null;
            let logoUrl = null;

            if (autorisationFile) {
                try {
                    const autorisationResult = await ecolesApiService.uploadFile(autorisationFile, 'autorisation');
                    autorisationUrl = autorisationResult.url;
                } catch (uploadError) {
                    console.error('Erreur lors de l\'upload de l\'autorisation:', uploadError);
                    // Continuer sans le fichier - optionnel selon vos besoins
                }
            }

            if (logoFile) {
                try {
                    const logoResult = await ecolesApiService.uploadFile(logoFile, 'logo');
                    logoUrl = logoResult.url;
                } catch (uploadError) {
                    console.error('Erreur lors de l\'upload du logo:', uploadError);
                    // Continuer sans le fichier - optionnel selon vos besoins
                }
            }

            // Ajouter les URLs des fichiers
            ecoleData.autorisationUrl = autorisationUrl;
            ecoleData.logoUrl = logoUrl;

            // Appel à l'API ou callback parent
            let newEcole;
            if (onSave) {
                newEcole = await onSave(ecoleData);
            } else {
                newEcole = await ecolesApiService.createEcole(ecoleData);
            }

            // Notification de succès
            await Swal.fire({
                icon: 'success',
                title: 'École créée avec succès !',
                text: `L'école "${formData.nomEtablissement}" a été créée avec succès.`,
                confirmButtonColor: '#10b981',
                timer: 3000,
                showConfirmButton: true
            });

            // Fermer le modal et réinitialiser
            handleClose();

        } catch (error) {
            console.error('Erreur lors de la création de l\'école:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de la création de l\'école.';
            
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations saisies.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Une école avec ce code existe déjà.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = error.response.data?.message || errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur de création',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [formData, pays, directionsRegionales, villes, communes, zones, niveauxEnseignement, autorisationFile, logoFile, onSave]);

    // ===========================
    // UTILITAIRES
    // ===========================
    const resetForm = useCallback(() => {
        setFormData({
            pays: null,
            directionRegionale: null,
            ville: null,
            commune: null,
            zone: null,
            nomEtablissement: '',
            emailEtablissement: '',
            niveauEnseignement: null,
            telephoneEtablissement: '',
            codeEtablissement: '',
            indicationEtablissement: ''
        });
        setAutorisationFile(null);
        setLogoFile(null);
        setValidationErrors({});
        resetCascade();
    }, [resetCascade]);

    const handleClose = useCallback(() => {
        resetForm();
        if (onClose) {
            onClose();
        }
    }, [resetForm, onClose]);

    // ===========================
    // COMPOSANT UPLOAD PERSONNALISÉ
    // ===========================
    const CustomUploader = ({ file, onFileChange, accept, placeholder, icon: Icon }) => (
        <Uploader
            fileListVisible={false}
            listType="text"
            accept={accept}
            onChange={onFileChange}
            disabled={isSubmitting}
        >
            <div style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed #e2e8f0',
                borderRadius: '8px',
                backgroundColor: isSubmitting ? '#f8fafc' : '#fafafa',
                color: '#64748b',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
                '&:hover': !isSubmitting ? {
                    borderColor: '#c7d2fe',
                    backgroundColor: '#f0f9ff'
                } : {}
            }}>
                <Icon style={{ marginRight: '8px' }} />
                {file ? file.name : placeholder}
            </div>
        </Uploader>
    );

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <Modal
            open={show}
            onClose={handleClose}
            size="lg"
            backdrop="static"
            style={{ borderRadius: '16px' }}
        >
            <Modal.Header style={{
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                padding: '24px',
                borderRadius: '16px 16px 0 0'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* <FiSchool size={24} color="#667eea" /> */}
                    <Text size="lg" weight="semibold" style={{ color: '#1e293b' }}>
                        Création d'une École
                    </Text>
                </div>
            </Modal.Header>

            <Modal.Body style={{ 
                padding: '32px 24px', 
                background: '#fafafa',
                maxHeight: '70vh',
                overflow: 'auto'
            }}>
                <Form fluid>
                    <Grid fluid>
                        {/* Section Localisation */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '1px solid #f1f5f9'
                        }}>
                            <Text size="md" weight="semibold" style={{ 
                                color: '#1e293b',
                                marginBottom: '16px',
                                display: 'block'
                            }}>
                                <FiMapPin size={16} style={{ marginRight: '8px' }} />
                                Localisation
                            </Text>

                            <Row gutter={16} style={{ marginBottom: '16px' }}>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Pays <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={pays}
                                            value={formData.pays}
                                            onChange={handlePaysChange}
                                            placeholder="Sélectionner un pays"
                                            style={{ width: '100%' }}
                                            cleanable={false}
                                            loading={loadingReference}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.pays && (
                                            <Text color="red" size="sm">{validationErrors.pays}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Direction Régionale <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={directionsRegionales}
                                            value={formData.directionRegionale}
                                            onChange={handleDirectionRegionaleChange}
                                            placeholder="Sélectionner une direction régionale"
                                            style={{ width: '100%' }}
                                            disabled={!formData.pays || isSubmitting}
                                            loading={loadingCascade}
                                            cleanable={false}
                                        />
                                        {validationErrors.directionRegionale && (
                                            <Text color="red" size="sm">{validationErrors.directionRegionale}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={8}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Ville <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={villes}
                                            value={formData.ville}
                                            onChange={handleVilleChange}
                                            placeholder="Sélectionner une ville"
                                            style={{ width: '100%' }}
                                            disabled={!formData.directionRegionale || isSubmitting}
                                            loading={loadingCascade}
                                            cleanable={false}
                                        />
                                        {validationErrors.ville && (
                                            <Text color="red" size="sm">{validationErrors.ville}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={8}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Commune <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={communes}
                                            value={formData.commune}
                                            onChange={handleCommuneChange}
                                            placeholder="Sélectionner une commune"
                                            style={{ width: '100%' }}
                                            disabled={!formData.ville || isSubmitting}
                                            loading={loadingCascade}
                                            cleanable={false}
                                        />
                                        {validationErrors.commune && (
                                            <Text color="red" size="sm">{validationErrors.commune}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={8}>
                                    <Form.Group>
                                        <Form.ControlLabel>Zone</Form.ControlLabel>
                                        <SelectPicker
                                            data={zones}
                                            value={formData.zone}
                                            onChange={handleZoneChange}
                                            placeholder="Sélectionner une zone"
                                            style={{ width: '100%' }}
                                            disabled={!formData.commune || isSubmitting}
                                            loading={loadingCascade}
                                            cleanable
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Section Informations de l'École */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '1px solid #f1f5f9'
                        }}>
                            <Text size="md" weight="semibold" style={{ 
                                color: '#1e293b',
                                marginBottom: '16px',
                                display: 'block'
                            }}>
                                {/* <FiSchool size={16} style={{ marginRight: '8px' }} /> */}
                                Informations de l'École
                            </Text>

                            <Row gutter={16} style={{ marginBottom: '16px' }}>
                                <Col xs={8}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Nom de l'Établissement <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            value={formData.nomEtablissement}
                                            onChange={(value) => handleInputChange('nomEtablissement', value)}
                                            placeholder="Ex: Lycée Moderne de Cocody"
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.nomEtablissement && (
                                            <Text color="red" size="sm">{validationErrors.nomEtablissement}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={8}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Email de l'Établissement <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            type="email"
                                            value={formData.emailEtablissement}
                                            onChange={(value) => handleInputChange('emailEtablissement', value)}
                                            placeholder="contact@ecole.edu.ci"
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.emailEtablissement && (
                                            <Text color="red" size="sm">{validationErrors.emailEtablissement}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={8}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Niveau d'enseignement <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={niveaux}
                                            value={formData.niveauEnseignement}
                                            onChange={(value) => handleInputChange('niveauEnseignement', value)}
                                            placeholder="Sélectionner le niveau"
                                            style={{ width: '100%' }}
                                            cleanable={false}
                                            loading={loadingReference}
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.niveauEnseignement && (
                                            <Text color="red" size="sm">{validationErrors.niveauEnseignement}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            <FiPhone size={14} style={{ marginRight: '6px' }} />
                                            Téléphone de l'Établissement <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            value={formData.telephoneEtablissement}
                                            onChange={(value) => handleInputChange('telephoneEtablissement', value)}
                                            placeholder="+225 01 02 03 04"
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.telephoneEtablissement && (
                                            <Text color="red" size="sm">{validationErrors.telephoneEtablissement}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            <FiTag size={14} style={{ marginRight: '6px' }} />
                                            Code Établissement <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            value={formData.codeEtablissement}
                                            onChange={(value) => handleInputChange('codeEtablissement', value)}
                                            placeholder="Ex: LMC001"
                                            disabled={isSubmitting}
                                        />
                                        {validationErrors.codeEtablissement && (
                                            <Text color="red" size="sm">{validationErrors.codeEtablissement}</Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Section Upload de Fichiers */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '1px solid #f1f5f9'
                        }}>
                            <Text size="md" weight="semibold" style={{ 
                                color: '#1e293b',
                                marginBottom: '16px',
                                display: 'block'
                            }}>
                                <FiUpload size={16} style={{ marginRight: '8px' }} />
                                Documents
                            </Text>

                            <Row gutter={16}>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Autorisation de création (.pdf)
                                        </Form.ControlLabel>
                                        <CustomUploader
                                            file={autorisationFile}
                                            onFileChange={handleAutorisationFileChange}
                                            accept=".pdf"
                                            placeholder="Choisir un fichier PDF"
                                            icon={FiFile}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>
                                            Logo de l'école (.jpeg)
                                        </Form.ControlLabel>
                                        <CustomUploader
                                            file={logoFile}
                                            onFileChange={handleLogoFileChange}
                                            accept=".jpg,.jpeg"
                                            placeholder="Choisir un fichier JPEG"
                                            icon={FiImage}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Section Description */}
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            border: '1px solid #f1f5f9'
                        }}>
                            <Form.Group>
                                <Form.ControlLabel>
                                    Indication de l'Établissement <span style={{color: '#ef4444'}}>*</span>
                                </Form.ControlLabel>
                                <Input
                                    as="textarea"
                                    rows={3}
                                    value={formData.indicationEtablissement}
                                    onChange={(value) => handleInputChange('indicationEtablissement', value)}
                                    placeholder="Description ou indication particulière de l'établissement..."
                                    disabled={isSubmitting}
                                />
                                {validationErrors.indicationEtablissement && (
                                    <Text color="red" size="sm">{validationErrors.indicationEtablissement}</Text>
                                )}
                            </Form.Group>
                        </div>
                    </Grid>
                </Form>
            </Modal.Body>

            <Modal.Footer style={{
                padding: '20px 24px',
                borderTop: '1px solid #f1f5f9',
                background: 'white',
                borderRadius: '0 0 16px 16px'
            }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button
                        appearance="subtle"
                        onClick={handleClose}
                        startIcon={<FiX />}
                        disabled={isSubmitting}
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px'
                        }}
                    >
                        Annuler
                    </Button>
                    <Button
                        appearance="primary"
                        onClick={handleSave}
                        startIcon={<FiSave />}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{
                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                    >
                        {isSubmitting ? 'Création en cours...' : 'Créer l\'École'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateEcoleModal;