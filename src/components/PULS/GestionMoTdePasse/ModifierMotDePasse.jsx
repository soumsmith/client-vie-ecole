import React from 'react';
import {
    Button,
    Input,
    InputGroup
} from 'rsuite';
import {
    FiLock,
    FiEye,
    FiEyeOff,
    FiCheck,
    FiX,
    FiShield,
    FiKey
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// Import du service
import {
    usePasswordChangeForm,
    UI_CONFIG,
    getPasswordStrengthColor,
    getPasswordStrengthLabel
} from './PasswordChangeService';
import { getUserProfile } from "../../hooks/userUtils";
import IconBox from "../Composant/IconBox";

const ModifierMotDePasse = () => {
    const userProfile = getUserProfile();

    // Informations utilisateur (à récupérer depuis le contexte/state global)
    const userLogin = "oladikporafiu@gmail.com"; // À adapter selon votre contexte

    // Utilisation du hook personnalisé du service
    const {
        formData,
        validation,
        showPasswords,
        loading,
        passwordStrength,
        isFormValid,
        handleInputChange,
        togglePasswordVisibility,
        handleSubmit,
        getPasswordStrengthColor: getCurrentStrengthColor,
        getPasswordStrengthLabel: getCurrentStrengthLabel
    } = usePasswordChangeForm(userLogin);

    // Gestion de la soumission avec confirmation SweetAlert
    const onSubmit = async () => {
        try {
            // Alerte de confirmation
            const result = await Swal.fire({
                title: 'Confirmer la modification',
                text: 'Êtes-vous sûr de vouloir modifier votre mot de passe ?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#667eea',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Oui, modifier',
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
                    title: 'Modification en cours...',
                    text: 'Veuillez patienter pendant la modification de votre mot de passe',
                    icon: 'info',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    showConfirmButton: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });

                // Exécuter la modification
                const submitResult = await handleSubmit();

                if (submitResult.success) {
                    // Succès
                    await Swal.fire({
                        title: 'Succès !',
                        text: 'Votre mot de passe a été modifié avec succès',
                        icon: 'success',
                        confirmButtonColor: '#22c55e',
                        confirmButtonText: 'Parfait !',
                        background: '#ffffff',
                        customClass: {
                            popup: 'swal-custom-popup',
                            confirmButton: 'swal-custom-success'
                        }
                    });
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
            // Erreur inattendue
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

    return (
        <>
            {/* Styles personnalisés pour SweetAlert */}
            <style jsx>{`
                .swal-custom-popup {
                    border-radius: 20px !important;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
                    border: 1px solid rgba(255, 255, 255, 0.2) !important;
                }
                
                .swal-custom-confirm {
                    border-radius: 10px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    padding: 10px 24px !important;
                    border: none !important;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3) !important;
                }
                
                .swal-custom-cancel {
                    border-radius: 10px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    padding: 10px 24px !important;
                    border: none !important;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
                }
                
                .swal-custom-success {
                    border-radius: 10px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    padding: 10px 24px !important;
                    border: none !important;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3) !important;
                }
                
                .swal-custom-error {
                    border-radius: 10px !important;
                    font-weight: 600 !important;
                    font-size: 14px !important;
                    padding: 10px 24px !important;
                    border: none !important;
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3) !important;
                }
            `}</style>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px'
            }}>
                <div style={{
                    background: 'white',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    width: '100%',
                    maxWidth: '500px'
                }}>
                    {/* En-tête */}
                    <div className="d-flex justify-content-center align-items-center mb-4 w-100">
                        <IconBox icon={FiShield} size={42} />
                    </div>

                    <div style={{
                        textAlign: 'center',
                        marginBottom: '30px'
                    }}>
                        <h2 style={{
                            margin: '20px 0 8px 0',
                            color: '#1e293b',
                            fontWeight: '700',
                            fontSize: '28px'
                        }}>
                            Modifier mon mot de passe
                        </h2>
                        <p style={{
                            margin: 0,
                            color: '#64748b',
                            fontSize: '14px'
                        }}>
                            Sécurisez votre compte avec un nouveau mot de passe
                        </p>
                    </div>

                    {/* Informations utilisateur */}
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '12px',
                        padding: '15px',
                        marginBottom: '25px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '14px',
                            color: '#475569',
                            fontWeight: '500'
                        }}>
                            <FiKey size={16} color="#667eea" />
                            <span>Compte :</span>
                            <span style={{ color: '#1e293b', fontWeight: '600' }}>{userLogin}</span>
                        </div>
                    </div>

                    {/* Formulaire */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {/* Ancien mot de passe */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px'
                            }}>
                                {UI_CONFIG.FORM_LABELS.OLD_PASSWORD}
                            </label>
                            <InputGroup style={{ width: '100%' }}>
                                <InputGroup.Addon>
                                    <FiLock color="#667eea" />
                                </InputGroup.Addon>
                                <Input
                                    type={showPasswords.ancien ? 'text' : 'password'}
                                    placeholder={UI_CONFIG.PLACEHOLDERS.OLD_PASSWORD}
                                    value={formData.ancienMotPasse}
                                    onChange={(value) => handleInputChange('ancienMotPasse', value)}
                                    style={{
                                        height: '48px',
                                        borderColor: !validation.ancienMotPasse.isValid ? '#ef4444' : '#e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <InputGroup.Button onClick={() => togglePasswordVisibility('ancien')}>
                                    {showPasswords.ancien ? <FiEyeOff /> : <FiEye />}
                                </InputGroup.Button>
                            </InputGroup>
                            {!validation.ancienMotPasse.isValid && (
                                <div style={{
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FiX size={14} />
                                    {validation.ancienMotPasse.message}
                                </div>
                            )}
                        </div>

                        {/* Nouveau mot de passe */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px'
                            }}>
                                {UI_CONFIG.FORM_LABELS.NEW_PASSWORD}
                            </label>
                            <InputGroup style={{ width: '100%' }}>
                                <InputGroup.Addon>
                                    <FiLock color="#667eea" />
                                </InputGroup.Addon>
                                <Input
                                    type={showPasswords.nouveau ? 'text' : 'password'}
                                    placeholder={UI_CONFIG.PLACEHOLDERS.NEW_PASSWORD}
                                    value={formData.nouveauMotPasse}
                                    onChange={(value) => handleInputChange('nouveauMotPasse', value)}
                                    style={{
                                        height: '48px',
                                        borderColor: !validation.nouveauMotPasse.isValid ? '#ef4444' :
                                            formData.nouveauMotPasse && validation.nouveauMotPasse.isValid ? '#22c55e' : '#e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <InputGroup.Button onClick={() => togglePasswordVisibility('nouveau')}>
                                    {showPasswords.nouveau ? <FiEyeOff /> : <FiEye />}
                                </InputGroup.Button>
                            </InputGroup>

                            {/* Indicateur de force du mot de passe */}
                            {formData.nouveauMotPasse && (
                                <div style={{ marginTop: '8px' }}>
                                    <div style={{
                                        display: 'flex',
                                        gap: '4px',
                                        marginBottom: '4px'
                                    }}>
                                        {[1, 2, 3, 4, 5].map((level) => (
                                            <div
                                                key={level}
                                                style={{
                                                    height: '4px',
                                                    flex: 1,
                                                    borderRadius: '2px',
                                                    backgroundColor: level <= passwordStrength ?
                                                        getCurrentStrengthColor() : '#e2e8f0'
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: getCurrentStrengthColor(),
                                        fontWeight: '500'
                                    }}>
                                        Force: {getCurrentStrengthLabel()}
                                    </div>
                                </div>
                            )}

                            {!validation.nouveauMotPasse.isValid && (
                                <div style={{
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FiX size={14} />
                                    {validation.nouveauMotPasse.message}
                                </div>
                            )}
                        </div>

                        {/* Confirmation du mot de passe */}
                        <div>
                            <label style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontWeight: '600',
                                color: '#374151',
                                fontSize: '14px'
                            }}>
                                {UI_CONFIG.FORM_LABELS.CONFIRM_PASSWORD}
                            </label>
                            <InputGroup style={{ width: '100%' }}>
                                <InputGroup.Addon>
                                    <FiLock color="#667eea" />
                                </InputGroup.Addon>
                                <Input
                                    type={showPasswords.confirm ? 'text' : 'password'}
                                    placeholder={UI_CONFIG.PLACEHOLDERS.CONFIRM_PASSWORD}
                                    value={formData.confirmMotPasse}
                                    onChange={(value) => handleInputChange('confirmMotPasse', value)}
                                    style={{
                                        height: '48px',
                                        borderColor: !validation.confirmMotPasse.isValid ? '#ef4444' :
                                            formData.confirmMotPasse && validation.confirmMotPasse.isValid ? '#22c55e' : '#e2e8f0',
                                        borderRadius: '8px'
                                    }}
                                />
                                <InputGroup.Button onClick={() => togglePasswordVisibility('confirm')}>
                                    {showPasswords.confirm ? <FiEyeOff /> : <FiEye />}
                                </InputGroup.Button>
                            </InputGroup>

                            {formData.confirmMotPasse && validation.confirmMotPasse.isValid && (
                                <div style={{
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: '#22c55e',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FiCheck size={14} />
                                    Les mots de passe correspondent
                                </div>
                            )}

                            {!validation.confirmMotPasse.isValid && formData.confirmMotPasse && (
                                <div style={{
                                    marginTop: '5px',
                                    fontSize: '12px',
                                    color: '#ef4444',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px'
                                }}>
                                    <FiX size={14} />
                                    {validation.confirmMotPasse.message}
                                </div>
                            )}
                        </div>

                        {/* Conseils de sécurité */}
                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '10px',
                            padding: '15px',
                            fontSize: '12px',
                            color: '#0369a1'
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '8px' }}>
                                Conseils pour un mot de passe sécurisé :
                            </div>
                            <ul style={{ margin: 0, paddingLeft: '16px' }}>
                                {UI_CONFIG.SECURITY_TIPS.map((tip, index) => (
                                    <li key={index}>{tip}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Bouton de soumission */}
                        <Button
                            appearance="primary"
                            size="lg"
                            loading={loading}
                            disabled={!isFormValid}
                            onClick={onSubmit}
                            className={`${userProfile}-btn-search`}
                            style={{
                                height: '50px',
                                border: 'none',
                                borderRadius: '10px',
                                fontWeight: '600',
                                fontSize: '16px',
                                marginTop: '10px'
                            }}
                            block
                        >
                            <div style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                justifyContent: 'center' 
                            }}>
                                <FiCheck />
                                {UI_CONFIG.FORM_LABELS.SUBMIT_BUTTON}
                            </div>
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ModifierMotDePasse;