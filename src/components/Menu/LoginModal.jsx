import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  SelectPicker,
  Button,
  Message,
  Panel,
  Stack,
  IconButton,
  Loader
} from 'rsuite';
//import EyeIcon from '@rsuite/icons/Eye';
//import EyeSlashIcon from '@rsuite/icons/EyeSlash';
import useLoginData from './useLoginData';
import { useNavigate } from 'react-router-dom';

/**
 * Composant Modal de connexion réutilisable
 * Gère l'authentification pour différents types d'utilisateurs (personnel, candidat, parent, élève)
 * 
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - État d'ouverture du modal
 * @param {Function} props.onClose - Fonction de fermeture du modal
 * @param {Object} props.config - Configuration du modal (titre, APIs, champs, etc.)
 * @param {Function} props.onSuccess - Callback appelé en cas de succès de connexion
 */
const LoginModal = ({ open, onClose, config, onSuccess }) => {
  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    schoolId: null,
    profileId: null
  });
  
  // État pour l'affichage du mot de passe
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // ajoute tout en haut si ce n’est pas déjà fait

  // État de validation du formulaire
  const [formErrors, setFormErrors] = useState({});

  // Utilisation du hook personnalisé pour les données de connexion
  const {
    schools,
    profiles,
    loadingSchools,
    loadingProfiles,
    submitting,
    schoolsError,
    profilesError,
    submitError,
    submitLogin,
    clearErrors
  } = useLoginData(config);

  /**
   * Réinitialise le formulaire et les erreurs
   */
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      schoolId: null,
      profileId: null
    });
    setFormErrors({});
    setShowPassword(false);
    clearErrors();
  };

  /**
   * Valide les champs du formulaire
   * @returns {boolean} - True si le formulaire est valide
   */
  const validateForm = () => {
    const errors = {};

    // Validation de l'email
    // if (!formData.email) {
    //   errors.email = 'L\'email est requis';
    // } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    //   errors.email = 'Format d\'email invalide';
    // }

    // Validation du mot de passe
    if (!formData.password) {
      errors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 3) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation de l'école (si requise)
    if (config?.fields?.showSchoolSelector && !formData.schoolId) {
      errors.schoolId = 'Veuillez sélectionner une école';
    }

    // Validation du profil (si requis)
    if (config?.fields?.showProfileSelector && !formData.profileId) {
      errors.profileId = 'Veuillez sélectionner un profil';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Gère le changement des valeurs du formulaire
   */
  const handleInputChange = (value, field) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Supprime l'erreur du champ modifié
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  /**
   * Gère la soumission du formulaire
   */
  const handleSubmit = async () => {
  if (!validateForm()) return;

  const { success, data } = await submitLogin(formData);

  if (success && data) {
    resetForm();
    onClose();

    if (onSuccess) {
      onSuccess(data); // envoie les données brutes si besoin
    }

    // Redirection forcée si config.redirectPath non défini
    navigate('/dashboard');
  }
};

  /**
   * Gère la fermeture du modal
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Réinitialisation lors de l'ouverture du modal
  useEffect(() => {
    if (open) {
      resetForm();
    }
  }, [open, config]);

  // Affichage conditionnel basé sur la configuration
  if (!config) {
    return null;
  }

  return (
    <Modal 
      open={open} 
      onClose={handleClose}
      size="md"
      backdrop="static"
    >
      <Modal.Header>
        <Modal.Title style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          <span style={{ fontSize: '32px' }}>{config.icon}</span>
          {config.title}
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <Panel bordered style={{ marginBottom: '20px', backgroundColor: '#f8f9fa' }}>
          <p style={{ margin: 0, color: '#6c757d', textAlign: 'center' }}>
            {config.description}
          </p>
        </Panel>

        <Form fluid>
          {/* Champ Email */}
          <Form.Group>
            <Form.ControlLabel>
              {config.fields?.emailLabel || 'Email'} <span style={{ color: 'red' }}>*</span>
            </Form.ControlLabel>
            <Form.Control
              name="email"
              type="email"
              value={formData.email}
              onChange={(value) => handleInputChange(value, 'email')}
              placeholder="Entrez votre email"
              style={{ marginBottom: '5px' }}
            />
            {formErrors.email && (
              <Form.HelpText style={{ color: 'red' }}>
                {formErrors.email}
              </Form.HelpText>
            )}
          </Form.Group>

          {/* Champ Mot de passe */}
          <Form.Group>
            <Form.ControlLabel>
              {config.fields?.passwordLabel || 'Mot de passe'} <span style={{ color: 'red' }}>*</span>
            </Form.ControlLabel>
            <Stack spacing={0} style={{ position: 'relative' }}>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(value) => handleInputChange(value, 'password')}
                placeholder="Entrez votre mot de passe"
                style={{ paddingRight: '45px' }}
                className='w-100'
              />
              <IconButton
                //icon={showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                onClick={() => setShowPassword(!showPassword)}
                appearance="subtle"
                style={{
                  position: 'absolute',
                  right: '5px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1
                }}
              />
            </Stack>
            {formErrors.password && (
              <Form.HelpText style={{ color: 'red', marginTop: '5px' }}>
                {formErrors.password}
              </Form.HelpText>
            )}
          </Form.Group>

          {/* Sélecteur d'école */}
          {config.fields?.showSchoolSelector && (
            <Form.Group>
              <Form.ControlLabel>
                École <span style={{ color: 'red' }}>*</span>
              </Form.ControlLabel>
              <SelectPicker
                data={schools}
                value={formData.schoolId}
                onChange={(value) => handleInputChange(value, 'schoolId')}
                placeholder="Sélectionnez votre école"
                loading={loadingSchools}
                block
                cleanable={false}
                searchable
                style={{ marginBottom: '5px' }}
              />
              {formErrors.schoolId && (
                <Form.HelpText style={{ color: 'red' }}>
                  {formErrors.schoolId}
                </Form.HelpText>
              )}
              {schoolsError && (
                <Form.HelpText style={{ color: 'orange' }}>
                  {schoolsError}
                </Form.HelpText>
              )}
            </Form.Group>
          )}

          {/* Sélecteur de profil */}
          {config.fields?.showProfileSelector && (
            <Form.Group>
              <Form.ControlLabel>
                Profil <span style={{ color: 'red' }}>*</span>
              </Form.ControlLabel>
              <SelectPicker
                data={profiles}
                value={formData.profileId}
                onChange={(value) => handleInputChange(value, 'profileId')}
                placeholder="Sélectionnez votre profil"
                loading={loadingProfiles}
                block
                cleanable={false}
                searchable
                style={{ marginBottom: '5px' }}
              />
              {formErrors.profileId && (
                <Form.HelpText style={{ color: 'red' }}>
                  {formErrors.profileId}
                </Form.HelpText>
              )}
              {profilesError && (
                <Form.HelpText style={{ color: 'orange' }}>
                  {profilesError}
                </Form.HelpText>
              )}
            </Form.Group>
          )}

          {/* Affichage des erreurs de soumission */}
          {submitError && (
            <Message showIcon type="error" style={{ marginTop: '15px' }}>
              {submitError}
            </Message>
          )}
        </Form>
      </Modal.Body>

      <Modal.Footer>
        <Button 
          onClick={handleClose} 
          appearance="subtle"
          disabled={submitting}
        >
          Annuler
        </Button>
        <Button 
          onClick={handleSubmit}
          appearance="primary"
          disabled={submitting}
          style={{ 
            backgroundColor: '#667eea', 
            border: 'none',
            minWidth: '120px'
          }}
        >
          {submitting ? (
            <>
              <Loader size="sm" style={{ marginRight: '8px' }} />
              Connexion...
            </>
          ) : (
            'Se connecter'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default LoginModal;