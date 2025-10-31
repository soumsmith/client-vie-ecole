import React from "react";
import { Message, Loader, Text } from "rsuite";
import { FiAlertTriangle, FiCheck, FiX } from "react-icons/fi";

/**
 * Composant de vérification de disponibilité de créneau horaire
 * @param {Object} props
 * @param {Object} props.formData - Données du formulaire avec heureDeb et heureFin
 * @param {Object} props.verification - État de vérification (ou verfication pour EmploiDuTemps)
 * @param {Function} props.validateTimeRange - Fonction de validation des heures
 * @param {string} props.successMessage - Message de succès (optionnel)
 */
const VerificationStatus = ({
  formData,
  verification,
  validateTimeRange,
  successMessage = "Plage horaire disponible"
}) => {
  // Si les heures ne sont pas renseignées, ne rien afficher
  if (!formData?.heureDeb || !formData?.heureFin) {
    return null;
  }

  const timeValidation = validateTimeRange();

  // Affichage d'un avertissement si la validation des heures échoue
  if (!timeValidation.valid) {
    return (
      <Message type="warning" showIcon style={{ marginBottom: 16 }}>
        <FiAlertTriangle style={{ marginRight: 8 }} />
        {timeValidation.message}
      </Message>
    );
  }

  // Affichage de l'état de chargement
  if (verification?.loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 8,
          marginBottom: 16
        }}
      >
        <Loader size="xs" />
        <Text style={{ color: '#0369a1' }}>
          Vérification de la disponibilité...
        </Text>
      </div>
    );
  }

  // Affichage d'une erreur
  if (verification?.error) {
    return (
      <Message type="error" showIcon style={{ marginBottom: 16, marginTop: 16 }}>
        <FiAlertTriangle style={{ marginRight: 8 }} />
        {verification.error}
      </Message>
    );
  }

  // Affichage du succès
  if (verification?.creneauDisponible === true) {
    const sallesCount = verification.sallesDisponibles?.length || 0;
    return (
      <Message type="success" showIcon style={{ marginBottom: 16, marginTop: 16 }}>
        <FiCheck style={{ marginRight: 8 }} />
        {successMessage} • {sallesCount} salle{sallesCount > 1 ? 's' : ''} disponible{sallesCount > 1 ? 's' : ''}
      </Message>
    );
  }

  // Affichage de l'indisponibilité
  if (verification?.creneauDisponible === false) {
    return (
      <Message type="error" showIcon style={{ marginBottom: 16, marginTop: 16 }}>
        <FiX style={{ marginRight: 8 }} />
        {successMessage.replace('disponible', 'indisponible')}
      </Message>
    );
  }

  return null;
};

export default VerificationStatus;