import React, { useState } from 'react';
import {
    Button,
    Input,
    InputGroup,
    SelectPicker,
    DatePicker,
    InputNumber,
    Uploader,
    Panel,
    Row,
    Col,
    Loader,
    Card,
    Avatar,
    Divider,
    Tag
} from 'rsuite';
import {
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiBookOpen,
    FiBriefcase,
    FiUpload,
    FiSave,
    FiCheck,
    FiX,
    FiEdit3,
    FiFileText,
    FiAward,
    FiSettings,
    FiFile,
    FiLock,
    FiUserPlus
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// Import du service
import {
    useUserInfoForm,
    UI_CONFIG,
    USER_CONFIG
} from '../GestionUserInfos/UserInfoService';
import { getUserProfile } from "../../hooks/userUtils";

/**
 * Composant de création/modification de compte professionnel
 * @param {string} mode - 'create' ou 'edit' (par défaut 'edit')
 * @param {number} userId - ID de l'utilisateur (requis en mode 'edit', null en mode 'create')
 */
const CreationDeComptePro = ({ mode = 'edit', userId = null }) => {
    const userProfile = getUserProfile();
    const isCreateMode = mode === 'create';

    // Utilisation du hook personnalisé
    const {
        formData,
        validation,
        selectLists,
        loading,
        initialLoading,
        uploadedFiles,
        handleInputChange,
        handleFileChange,
        handleSubmit,
        removeFile,
        checkLoginAvailability,
        loginCheckStatus
    } = useUserInfoForm(userId, mode);

    // État local pour le mot de passe (uniquement en mode création)
    const [passwordData, setPasswordData] = useState({
        password: '',
        confirmPassword: ''
    });

    // État pour la vérification du login
    const [isCheckingLogin, setIsCheckingLogin] = useState(false);

    // Fonction helper pour s'assurer qu'on a toujours un tableau
    const safeArray = (array) => {
        return Array.isArray(array) ? array : [];
    };

    // Vérifier la disponibilité du login (mode création uniquement)
    const handleLoginCheck = async () => {
        if (!formData.login || formData.login.trim().length < 3) {
            Swal.fire({
                icon: 'warning',
                title: 'Login invalide',
                text: 'Le login doit contenir au moins 3 caractères',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        setIsCheckingLogin(true);
        const result = await checkLoginAvailability(formData.login);
        setIsCheckingLogin(false);

        if (result.available) {
            Swal.fire({
                icon: 'success',
                title: 'Login disponible',
                text: `Le login "${formData.login}" est disponible`,
                confirmButtonColor: '#10b981'
            });
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Login indisponible',
                text: `Le login "${formData.login}" est déjà utilisé. Veuillez en choisir un autre.`,
                confirmButtonColor: '#ef4444'
            });
        }
    };

    // Validation du mot de passe
    const validatePassword = () => {
        if (isCreateMode) {
            if (!passwordData.password || passwordData.password.length < 8) {
                return { isValid: false, message: 'Le mot de passe doit contenir au moins 8 caractères' };
            }
            if (passwordData.password !== passwordData.confirmPassword) {
                return { isValid: false, message: 'Les mots de passe ne correspondent pas' };
            }
        }
        return { isValid: true, message: '' };
    };

    // Gestion de la soumission avec SweetAlert
    const onSubmit = async () => {
        try {
            // Validation du mot de passe en mode création
            if (isCreateMode) {
                const passwordValidation = validatePassword();
                if (!passwordValidation.isValid) {
                    await Swal.fire({
                        title: 'Erreur de validation',
                        text: passwordValidation.message,
                        icon: 'error',
                        confirmButtonColor: '#ef4444'
                    });
                    return;
                }

                // Vérifier que le login a été vérifié
                if (!loginCheckStatus.checked) {
                    await Swal.fire({
                        title: 'Vérification requise',
                        text: 'Veuillez vérifier la disponibilité du login avant de continuer',
                        icon: 'warning',
                        confirmButtonColor: '#f59e0b'
                    });
                    return;
                }

                if (!loginCheckStatus.available) {
                    await Swal.fire({
                        title: 'Login indisponible',
                        text: 'Le login choisi n\'est pas disponible. Veuillez en choisir un autre.',
                        icon: 'error',
                        confirmButtonColor: '#ef4444'
                    });
                    return;
                }
            }

            // Alerte de confirmation
            const result = await Swal.fire({
                title: isCreateMode ? 'Confirmer la création' : 'Confirmer la modification',
                text: isCreateMode 
                    ? 'Êtes-vous sûr de vouloir créer ce compte professionnel ?' 
                    : 'Êtes-vous sûr de vouloir modifier vos informations personnelles ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                cancelButtonColor: '#ef4444',
                confirmButtonText: isCreateMode ? 'Oui, créer' : 'Oui, modifier',
                cancelButtonText: 'Annuler',
                background: '#ffffff',
                customClass: {
                    popup: 'swal-custom-popup',
                    confirmButton: 'swal-custom-confirm',
                    cancelButton: 'swal-custom-cancel'
                }
            });

            if (result.isConfirmed) {
                // Alerte de chargement
                Swal.fire({
                    title: isCreateMode ? 'Création en cours...' : 'Modification en cours...',
                    text: isCreateMode 
                        ? 'Veuillez patienter pendant la création du compte' 
                        : 'Veuillez patienter pendant la mise à jour de vos informations',
                    icon: 'info',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Exécuter la création/modification
                const submitResult = await handleSubmit(isCreateMode ? passwordData.password : null);

                if (submitResult.success) {
                    // Succès
                    await Swal.fire({
                        title: 'Succès !',
                        text: isCreateMode 
                            ? 'Le compte a été créé avec succès. Les identifiants de connexion ont été envoyés par email.' 
                            : 'Vos informations ont été mises à jour avec succès',
                        icon: 'success',
                        confirmButtonColor: '#10b981',
                        confirmButtonText: 'Parfait !',
                        background: '#ffffff',
                        customClass: {
                            popup: 'swal-custom-popup',
                            confirmButton: 'swal-custom-success'
                        }
                    });

                    // Réinitialiser le formulaire en mode création
                    if (isCreateMode) {
                        setPasswordData({ password: '', confirmPassword: '' });
                        // Vous pouvez ajouter une redirection ici si nécessaire
                    }
                } else {
                    // Erreur
                    await Swal.fire({
                        title: 'Erreur !',
                        text: submitResult.error,
                        icon: 'error',
                        confirmButtonColor: '#ef4444',
                        confirmButtonText: 'Compris',
                        background: '#ffffff',
                        customClass: {
                            popup: 'swal-custom-popup',
                            confirmButton: 'swal-custom-error'
                        }
                    });
                }
            }
        } catch (error) {
            await Swal.fire({
                title: 'Erreur inattendue !',
                text: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
                icon: 'error',
                confirmButtonColor: '#ef4444',
                confirmButtonText: 'Compris',
                background: '#ffffff'
            });
        }
    };

    // Fonction pour gérer l'upload des fichiers
    const handleFileUpload = (field) => (fileList) => {
        if (fileList && fileList.length > 0) {
            const fileInfo = fileList[0];
            const file = fileInfo.blobFile || fileInfo.file || fileInfo;

            if (file && file instanceof File) {
                handleFileChange(field, file);
            }
        }
    };

    // Fonction pour supprimer un fichier
    const handleFileRemove = (field) => (file) => {
        removeFile(field);
        return true;
    };

    // Fonction de rendu des erreurs de validation
    const renderValidationError = (field) => {
        if (validation[field] && !validation[field].isValid) {
            return (
                <div style={{
                    marginTop: '6px',
                    fontSize: '12px',
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontWeight: '500'
                }}>
                    <FiX size={12} />
                    {validation[field].message}
                </div>
            );
        }
        return null;
    };

    // Fonction pour rendre le statut d'un fichier uploadé
    const renderFileStatus = (field) => {
        const file = uploadedFiles[field];
        if (file) {
            return (
                <div style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#15803d',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                }}>
                    <FiCheck size={12} />
                    <FiFile size={12} />
                    <span>{file.name} ({(file.size / 1024).toFixed(1)} KB)</span>
                </div>
            );
        }
        return null;
    };

    // Affichage du chargement initial
    if (initialLoading && !isCreateMode) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '500px',
                flexDirection: 'column',
                gap: '20px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                borderRadius: '16px',
                margin: '20px'
            }}>
                <Avatar
                    circle
                    size="lg"
                    style={{
                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                        marginBottom: '16px'
                    }}
                >
                    <FiSettings size={32} color="white" />
                </Avatar>
                <Loader size="lg" content="Chargement de vos informations..." />
            </div>
        );
    }

    return (
        <>
            {/* Styles personnalisés */}
            <style jsx>{`
                .swal-custom-popup {
                    border-radius: 16px !important;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
                }
                
                .swal-custom-confirm, .swal-custom-success {
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    padding: 12px 24px !important;
                    border: none !important;
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%) !important;
                    box-shadow: 0 4px 14px 0 rgba(59, 130, 246, 0.39) !important;
                }
                
                .swal-custom-cancel, .swal-custom-error {
                    border-radius: 8px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    padding: 12px 24px !important;
                    border: none !important;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
                    box-shadow: 0 4px 14px 0 rgba(239, 68, 68, 0.39) !important;
                }

                .custom-card {
                    background: white;
                    border: none;
                    border-radius: 16px;
                    transition: all 0.3s ease;
                }

                .custom-card:hover {
                    box-shadow: 0 8px 30px 0 rgba(0, 0, 0, 0.12);
                    transform: translateY(-2px);
                }

                .section-header {
                    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                    border-radius: 12px;
                    padding: 16px 20px;
                    margin-bottom: 24px;
                    border: 1px solid #e2e8f0;
                }

                .upload-area {
                    border: 2px dashed #d1d5db !important;
                    border-radius: 12px !important;
                    background: #fafafa !important;
                    transition: all 0.2s ease !important;
                    min-height: 80px !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                }

                .upload-area:hover {
                    border-color: #3b82f6 !important;
                    background: #f8fafc !important;
                }

                .upload-content {
                    text-align: center;
                    padding: 16px;
                    color: #6b7280;
                }
            `}</style>

            <div style={{
                padding: '20px',
                maxWidth: '1200px',
                margin: '0 auto',
                minHeight: '100vh'
            }}>
                {/* En-tête principale */}
                <Card className="custom-card" style={{ marginBottom: '24px' }}>
                    <div style={{
                        textAlign: 'center',
                        padding: '32px 20px'
                    }}>
                        <Avatar
                            circle
                            size="lg"
                            style={{
                                background: isCreateMode 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                marginBottom: '16px'
                            }}
                        >
                            {isCreateMode ? <FiUserPlus size={32} color="white" /> : <FiEdit3 size={32} color="white" />}
                        </Avatar>
                        <h1 style={{
                            margin: '0 0 8px 0',
                            color: '#1e293b',
                            fontWeight: '700',
                            fontSize: '28px'
                        }}>
                            {isCreateMode ? 'Création de compte professionnel' : 'Modification de compte professionnel'}
                        </h1>
                        <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '16px'
                        }}>
                            {isCreateMode 
                                ? 'Créez un nouveau compte professionnel avec tous les détails nécessaires'
                                : 'Mettez à jour vos informations personnelles et professionnelles'}
                        </p>
                        {!isCreateMode && userId && (
                            <Tag color="blue" style={{ marginTop: '12px' }}>
                                ID: {userId}
                            </Tag>
                        )}
                    </div>
                </Card>

                {/* Section Informations personnelles */}
                <Card className="custom-card" style={{ marginBottom: '24px' }}>
                    <div className="section-header">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FiUser size={20} color="#3b82f6" />
                            <h3 style={{
                                margin: 0,
                                color: '#1e293b',
                                fontWeight: '600',
                                fontSize: '18px'
                            }}>
                                Informations personnelles
                            </h3>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px' }}>
                        <Row gutter={24}>
                            {/* Email */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.EMAIL}
                                    </label>
                                    <InputGroup style={{ width: '100%' }}>
                                        <InputGroup.Addon>
                                            <FiMail color="#3b82f6" />
                                        </InputGroup.Addon>
                                        <Input
                                            type="email"
                                            placeholder={UI_CONFIG.PLACEHOLDERS.EMAIL}
                                            value={formData.email}
                                            onChange={(value) => handleInputChange('email', value)}
                                        />
                                    </InputGroup>
                                    {renderValidationError('email')}
                                </div>
                            </Col>

                            {/* Nom */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.NOM}
                                    </label>
                                    <InputGroup style={{ width: '100%' }}>
                                        <InputGroup.Addon>
                                            <FiUser color="#3b82f6" />
                                        </InputGroup.Addon>
                                        <Input
                                            placeholder={UI_CONFIG.PLACEHOLDERS.NOM}
                                            value={formData.nom}
                                            onChange={(value) => handleInputChange('nom', value)}
                                        />
                                    </InputGroup>
                                    {renderValidationError('nom')}
                                </div>
                            </Col>

                            {/* Prénom */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.PRENOM}
                                    </label>
                                    <InputGroup style={{ width: '100%' }}>
                                        <InputGroup.Addon>
                                            <FiUser color="#3b82f6" />
                                        </InputGroup.Addon>
                                        <Input
                                            placeholder={UI_CONFIG.PLACEHOLDERS.PRENOM}
                                            value={formData.prenom}
                                            onChange={(value) => handleInputChange('prenom', value)}
                                        />
                                    </InputGroup>
                                    {renderValidationError('prenom')}
                                </div>
                            </Col>

                            {/* Contact */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.CONTACT}
                                    </label>
                                    <InputGroup style={{ width: '100%' }}>
                                        <InputGroup.Addon>
                                            <FiPhone color="#3b82f6" />
                                        </InputGroup.Addon>
                                        <Input
                                            placeholder={UI_CONFIG.PLACEHOLDERS.CONTACT}
                                            value={formData.contact}
                                            onChange={(value) => handleInputChange('contact', value)}
                                        />
                                    </InputGroup>
                                    {renderValidationError('contact')}
                                </div>
                            </Col>

                            {/* Sexe */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.SEXE}
                                    </label>
                                    <SelectPicker
                                        data={USER_CONFIG.SEXES}
                                        value={formData.sexe}
                                        onChange={(value) => handleInputChange('sexe', value)}
                                        placeholder="Sélectionner le sexe"
                                        style={{ width: '100%' }}
                                        size="lg"
                                        cleanable={false}
                                    />
                                    {renderValidationError('sexe')}
                                </div>
                            </Col>

                            {/* Date de naissance */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.DATE_NAISSANCE}
                                    </label>
                                    <DatePicker
                                        value={formData.date_naissance ? new Date(formData.date_naissance) : null}
                                        onChange={(date) => {
                                            const formattedDate = date ? date.toISOString().split('T')[0] : '';
                                            handleInputChange('date_naissance', formattedDate);
                                        }}
                                        format="dd/MM/yyyy"
                                        placeholder="Sélectionner la date"
                                        style={{ width: '100%' }}
                                        size="lg"
                                        cleanable={false}
                                    />
                                    {renderValidationError('date_naissance')}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {/* Section Identifiants de connexion (uniquement en mode création) */}
                {isCreateMode && (
                    <Card className="custom-card" style={{ marginBottom: '24px' }}>
                        <div className="section-header">
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px'
                            }}>
                                <FiLock size={20} color="#8b5cf6" />
                                <h3 style={{
                                    margin: 0,
                                    color: '#1e293b',
                                    fontWeight: '600',
                                    fontSize: '18px'
                                }}>
                                    Identifiants de connexion
                                </h3>
                            </div>
                        </div>

                        <div style={{ padding: '0 20px 20px 20px' }}>
                            <Row gutter={24}>
                                {/* Login */}
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '14px'
                                        }}>
                                            Login*
                                        </label>
                                        <InputGroup style={{ width: '100%' }}>
                                            <InputGroup.Addon>
                                                <FiUser color="#8b5cf6" />
                                            </InputGroup.Addon>
                                            <Input
                                                placeholder="Choisissez un login"
                                                value={formData.login}
                                                onChange={(value) => handleInputChange('login', value)}
                                            />
                                            <InputGroup.Button 
                                                onClick={handleLoginCheck}
                                                loading={isCheckingLogin}
                                                disabled={!formData.login || formData.login.length < 3}
                                                style={{
                                                    background: loginCheckStatus.available ? '#10b981' : '#3b82f6',
                                                    color: 'white',
                                                    border: 'none'
                                                }}
                                            >
                                                {loginCheckStatus.available ? <FiCheck /> : 'Vérifier'}
                                            </InputGroup.Button>
                                        </InputGroup>
                                        {renderValidationError('login')}
                                        {loginCheckStatus.checked && (
                                            <div style={{
                                                marginTop: '8px',
                                                fontSize: '12px',
                                                color: loginCheckStatus.available ? '#10b981' : '#ef4444',
                                                fontWeight: '500'
                                            }}>
                                                {loginCheckStatus.available ? '✓ Login disponible' : '✗ Login déjà utilisé'}
                                            </div>
                                        )}
                                    </div>
                                </Col>

                                {/* Mot de passe */}
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '14px'
                                        }}>
                                            Mot de passe* (min. 8 caractères)
                                        </label>
                                        <InputGroup style={{ width: '100%' }}>
                                            <InputGroup.Addon>
                                                <FiLock color="#8b5cf6" />
                                            </InputGroup.Addon>
                                            <Input
                                                type="password"
                                                placeholder="Choisissez un mot de passe"
                                                value={passwordData.password}
                                                onChange={(value) => setPasswordData({...passwordData, password: value})}
                                            />
                                        </InputGroup>
                                    </div>
                                </Col>

                                {/* Confirmation mot de passe */}
                                <Col xs={24} md={12}>
                                    <div style={{ marginBottom: '24px' }}>
                                        <label style={{
                                            display: 'block',
                                            marginBottom: '8px',
                                            fontWeight: '600',
                                            color: '#374151',
                                            fontSize: '14px'
                                        }}>
                                            Confirmer le mot de passe*
                                        </label>
                                        <InputGroup style={{ width: '100%' }}>
                                            <InputGroup.Addon>
                                                <FiLock color="#8b5cf6" />
                                            </InputGroup.Addon>
                                            <Input
                                                type="password"
                                                placeholder="Confirmez le mot de passe"
                                                value={passwordData.confirmPassword}
                                                onChange={(value) => setPasswordData({...passwordData, confirmPassword: value})}
                                            />
                                        </InputGroup>
                                        {passwordData.password && passwordData.confirmPassword && 
                                         passwordData.password !== passwordData.confirmPassword && (
                                            <div style={{
                                                marginTop: '6px',
                                                fontSize: '12px',
                                                color: '#ef4444',
                                                fontWeight: '500'
                                            }}>
                                                ✗ Les mots de passe ne correspondent pas
                                            </div>
                                        )}
                                        {passwordData.password && passwordData.confirmPassword && 
                                         passwordData.password === passwordData.confirmPassword && (
                                            <div style={{
                                                marginTop: '6px',
                                                fontSize: '12px',
                                                color: '#10b981',
                                                fontWeight: '500'
                                            }}>
                                                ✓ Les mots de passe correspondent
                                            </div>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>
                )}

                {/* Section Formation et Expérience */}
                <Card className="custom-card" style={{ marginBottom: '24px' }}>
                    <div className="section-header">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FiBookOpen size={20} color="#10b981" />
                            <h3 style={{
                                margin: 0,
                                color: '#1e293b',
                                fontWeight: '600',
                                fontSize: '18px'
                            }}>
                                Formation et expérience
                            </h3>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px' }}>
                        <Row gutter={24}>
                            {/* Diplôme */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.DIPLOME}
                                    </label>
                                    <InputGroup style={{ width: '100%' }}>
                                        <InputGroup.Addon style={{
                                            backgroundColor: '#f0fdf4',
                                            border: '1px solid #bbf7d0',
                                            borderRight: 'none'
                                        }}>
                                            <FiAward color="#10b981" />
                                        </InputGroup.Addon>
                                        <Input
                                            placeholder={UI_CONFIG.PLACEHOLDERS.DIPLOME}
                                            value={formData.diplome_recent}
                                            onChange={(value) => handleInputChange('diplome_recent', value)}
                                            style={{
                                                border: '1px solid #bbf7d0',
                                                borderLeft: 'none'
                                            }}
                                        />
                                    </InputGroup>
                                </div>
                            </Col>

                            {/* Expérience */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.EXPERIENCE}
                                    </label>
                                    <InputNumber
                                        placeholder={UI_CONFIG.PLACEHOLDERS.EXPERIENCE}
                                        value={formData.nbre_annee_experience}
                                        onChange={(value) => handleInputChange('nbre_annee_experience', value)}
                                        style={{ width: '100%' }}
                                        size="lg"
                                        min={0}
                                        max={50}
                                    />
                                    {renderValidationError('nbre_annee_experience')}
                                </div>
                            </Col>

                            {/* Domaine */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.DOMAINE}
                                    </label>
                                    <SelectPicker
                                        data={safeArray(selectLists?.domaines).map(d => ({
                                            value: d.domaine_formationid,
                                            label: d.domaine_formation_libelle
                                        }))}
                                        value={formData.identifiantdomaine_formation}
                                        onChange={(value) => handleInputChange('identifiantdomaine_formation', value)}
                                        placeholder="Sélectionner le domaine"
                                        style={{ width: '100%' }}
                                        size="lg"
                                        searchable
                                        cleanable={false}
                                    />
                                    {renderValidationError('identifiantdomaine_formation')}
                                </div>
                            </Col>

                            {/* Niveau */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.NIVEAU}
                                    </label>
                                    <SelectPicker
                                        data={safeArray(selectLists?.niveaux).map(n => ({
                                            value: n.niveau_etudeid,
                                            label: n.niveau_etude_libelle
                                        }))}
                                        value={formData.niveau_etudeIdentifiant}
                                        onChange={(value) => handleInputChange('niveau_etudeIdentifiant', value)}
                                        placeholder="Sélectionner le niveau"
                                        style={{ width: '100%' }}
                                        size="lg"
                                        searchable
                                        cleanable={false}
                                    />
                                    {renderValidationError('niveau_etudeIdentifiant')}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {/* Section Fonction et Autorisation */}
                <Card className="custom-card" style={{ marginBottom: '24px' }}>
                    <div className="section-header">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FiBriefcase size={20} color="#f59e0b" />
                            <h3 style={{
                                margin: 0,
                                color: '#1e293b',
                                fontWeight: '600',
                                fontSize: '18px'
                            }}>
                                Fonction et autorisation
                            </h3>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px' }}>
                        <Row gutter={24}>
                            {/* Fonction */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.FONCTION}
                                    </label>
                                    <SelectPicker
                                        data={safeArray(selectLists?.fonctions).map(f => ({
                                            value: f.fonctionid,
                                            label: f.fonctionlibelle
                                        }))}
                                        value={formData.fonctionidentifiant}
                                        onChange={(value) => handleInputChange('fonctionidentifiant', value)}
                                        placeholder="Sélectionner la fonction"
                                        style={{ width: '100%' }}
                                        size="lg"
                                        searchable
                                        cleanable={false}
                                    />
                                    {renderValidationError('fonctionidentifiant')}
                                </div>
                            </Col>

                            {/* Autorisation */}
                            <Col xs={24} md={12}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.AUTORISATION}
                                    </label>
                                    <SelectPicker
                                        data={safeArray(selectLists?.autorisations).map(a => ({
                                            value: a.idtype_autorisationid,
                                            label: a.type_autorisation_libelle
                                        }))}
                                        value={formData.type_autorisation_id}
                                        onChange={(value) => handleInputChange('type_autorisation_id', value)}
                                        placeholder="Sélectionner le type d'autorisation"
                                        style={{ width: '100%' }}
                                        size="lg"
                                        searchable
                                        cleanable={true}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {/* Section Documents */}
                <Card className="custom-card" style={{ marginBottom: '24px' }}>
                    <div className="section-header">
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px'
                        }}>
                            <FiFileText size={20} color="#8b5cf6" />
                            <h3 style={{
                                margin: 0,
                                color: '#1e293b',
                                fontWeight: '600',
                                fontSize: '18px'
                            }}>
                                Documents
                            </h3>
                        </div>
                    </div>

                    <div style={{ padding: '0 20px 20px 20px' }}>
                        <Row gutter={24}>
                            {/* Pièce d'identité */}
                            <Col xs={24} md={8}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.PIECE}
                                    </label>
                                    <Uploader
                                        fileList={uploadedFiles.lien_piece ? [uploadedFiles.lien_piece] : []}
                                        onChange={handleFileUpload('lien_piece')}
                                        onRemove={handleFileRemove('lien_piece')}
                                        multiple={false}
                                        accept="image/*,.pdf,.doc,.docx"
                                        draggable
                                        autoUpload={false}
                                    >
                                        <div className="upload-area">
                                            <div className="upload-content">
                                                <FiUpload size={24} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                                                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                                    Cliquez ou glissez votre pièce d'identité
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                    PDF, JPG, PNG (max 5MB)
                                                </div>
                                            </div>
                                        </div>
                                    </Uploader>
                                    {renderFileStatus('lien_piece')}
                                    {renderValidationError('lien_piece')}
                                </div>
                            </Col>

                            {/* CV */}
                            <Col xs={24} md={8}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.CV}
                                    </label>
                                    <Uploader
                                        fileList={uploadedFiles.lien_cv ? [uploadedFiles.lien_cv] : []}
                                        onChange={handleFileUpload('lien_cv')}
                                        onRemove={handleFileRemove('lien_cv')}
                                        multiple={false}
                                        accept="image/*,.pdf,.doc,.docx"
                                        draggable
                                        autoUpload={false}
                                    >
                                        <div className="upload-area">
                                            <div className="upload-content">
                                                <FiUpload size={24} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                                                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                                    Cliquez ou glissez votre CV
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                    PDF, JPG, PNG (max 5MB)
                                                </div>
                                            </div>
                                        </div>
                                    </Uploader>
                                    {renderFileStatus('lien_cv')}
                                    {renderValidationError('lien_cv')}
                                </div>
                            </Col>

                            {/* Autorisation d'enseigner */}
                            <Col xs={24} md={8}>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: '8px',
                                        fontWeight: '600',
                                        color: '#374151',
                                        fontSize: '14px'
                                    }}>
                                        {UI_CONFIG.FORM_LABELS.AUTORISATION_FILE}
                                    </label>
                                    <Uploader
                                        fileList={uploadedFiles.lien_autorisation ? [uploadedFiles.lien_autorisation] : []}
                                        onChange={handleFileUpload('lien_autorisation')}
                                        onRemove={handleFileRemove('lien_autorisation')}
                                        multiple={false}
                                        accept="image/*,.pdf,.doc,.docx"
                                        draggable
                                        autoUpload={false}
                                    >
                                        <div className="upload-area">
                                            <div className="upload-content">
                                                <FiUpload size={24} style={{ marginBottom: '8px', display: 'block', margin: '0 auto 8px' }} />
                                                <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                                                    Cliquez ou glissez l'autorisation
                                                </div>
                                                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                                                    PDF, JPG, PNG, DOC (max 5MB)
                                                </div>
                                            </div>
                                        </div>
                                    </Uploader>
                                    {renderFileStatus('lien_autorisation')}
                                    {renderValidationError('lien_autorisation')}
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {/* Bouton de soumission */}
                <Card className="custom-card">
                    <div style={{
                        padding: '24px',
                        textAlign: 'center'
                    }}>
                        <Button
                            appearance="primary"
                            size="lg"
                            loading={loading}
                            onClick={onSubmit}
                            style={{
                                height: '52px',
                                paddingLeft: '48px',
                                paddingRight: '48px',
                                border: 'none',
                                borderRadius: '12px',
                                fontWeight: '600',
                                fontSize: '16px',
                                background: isCreateMode 
                                    ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                    : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                boxShadow: isCreateMode
                                    ? '0 4px 14px 0 rgba(16, 185, 129, 0.39)'
                                    : '0 4px 14px 0 rgba(59, 130, 246, 0.39)',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                            }}>
                                <FiSave size={18} />
                                {isCreateMode ? 'Créer le compte' : 'Enregistrer les modifications'}
                            </div>
                        </Button>
                    </div>
                </Card>
            </div>
        </>
    );
};

export default CreationDeComptePro;