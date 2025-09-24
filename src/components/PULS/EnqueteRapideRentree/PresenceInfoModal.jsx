import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, SelectPicker, Button, Message, Loader, Schema } from 'rsuite';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';

import { useNiveauxBranchesData } from "../utils/CommonDataService";

const { StringType, NumberType } = Schema.Types;

/**
 * Modèle de validation pour le formulaire
 */
const model = Schema.Model({
    branche: NumberType()
        .isRequired('La branche est obligatoire'),
    nombreAffecte: NumberType()
        .isRequired('Le nombre affecté est obligatoire')
        .min(0, 'Le nombre affecté doit être positif'),
    nombreNonAffecte: NumberType()
        .isRequired('Le nombre non affecté est obligatoire')
        .min(0, 'Le nombre non affecté doit être positif')
});

/**
 * Modal pour ajouter/modifier les informations de présence par niveau
 */
const PresenceInfoModal = ({ visible, onClose, onSuccess, editData = null, ecoleId = null, anneeId = 1 }) => {
    const [formValue, setFormValue] = useState({
        branche: null,
        nombreAffecte: 0,
        nombreNonAffecte: 0
    });
    const [formError, setFormError] = useState({});
    const [loading, setLoading] = useState(false);
    const apiUrls = useAllApiUrls();
    const [submitError, setSubmitError] = useState(null);

    // Hook pour récupérer les branches
    const { branches, branchesLoading, branchesError, refetch } = useNiveauxBranchesData(ecoleId);

    /**
     * Validation du formulaire
     */
    const handleCheck = (formError) => {
        setFormError(formError);
    };

    /**
     * Afficher une notification de succès
     */
    const showSuccessNotification = (message) => {
        Message.success(message, 4000);
    };

    /**
     * Afficher une notification d'erreur
     */
    const showErrorNotification = (message) => {
        Message.error(message, 5000);
    };

    /**
     * Confirmation avec SweetAlert avant soumission
     */
    const confirmSubmission = async () => {
        const action = editData ? 'modifier' : 'enregistrer';
        const title = editData ? 'Confirmer la modification' : 'Confirmer l\'enregistrement';
        const text = `Êtes-vous sûr de vouloir ${action} ces informations de présence ?`;

        const result = await Swal.fire({
            title: title,
            text: text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Oui, ' + action,
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            await handleSubmit();
        }
    };

    /**
     * Soumission du formulaire
     */
    const handleSubmit = async () => {
        if (!model.check(formValue)) {
            showErrorNotification('Veuillez corriger les erreurs du formulaire');
            return;
        }

        try {
            setLoading(true);
            setSubmitError(null);

            // Trouver le libelle de la branche sélectionnée
            const selectedBranch = branches.find(branch => branch.value === formValue.branche);
            const libelleBranche = selectedBranch ? selectedBranch.label : "";

            // Préparer les données selon le nouveau format API
            const presenceData = {
                libelleBranche: libelleBranche,
                idBranche: formValue.branche,
                nombreNAff: String(formValue.nombreNonAffecte), // Convertir en string
                nombreAff: formValue.nombreAffecte,
                idAnn: String(anneeId), // Convertir en string
                idEcole: String(ecoleId) // Convertir en string
            };

            // Utiliser la même URL pour création et modification
            const url = apiUrls.enqueteRapide.saveEnquetteRapide();
            
            const response = await axios.post(url, presenceData);
            
            // Succès - réinitialiser le formulaire et fermer le modal
            handleReset();
            onSuccess(response.data);
            onClose();
            
            const message = editData 
                ? 'Informations de présence mises à jour avec succès'
                : 'Informations de présence ajoutées avec succès';
            
            showSuccessNotification(message);
            
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            
            const errorMessage = error.response?.data?.message || 
                               error.response?.data?.error ||
                               error.message || 
                               'Erreur lors de la sauvegarde des informations de présence';
            
            setSubmitError(errorMessage);
            showErrorNotification(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Annulation - fermer le modal
     */
    const handleCancel = () => {
        handleReset();
        onClose();
    };

    /**
     * Réinitialisation du formulaire
     */
    const handleReset = () => {
        setFormValue({
            branche: null,
            nombreAffecte: 0,
            nombreNonAffecte: 0
        });
        setFormError({});
        setSubmitError(null);
    };

    /**
     * Initialisation du formulaire avec les données d'édition
     */
    useEffect(() => {
        if (visible) {
            if (editData) {
                setFormValue({
                    branche: editData.idBranche || editData.id,
                    nombreAffecte: editData.nombreAff || editData.nombreAffecte || 0,
                    nombreNonAffecte: editData.nombreNAff || editData.nombreNonAffecte || 0
                });
            } else {
                handleReset();
            }
        }
    }, [visible, editData]);

    const isDataLoading = branchesLoading;
    const modalTitle = editData 
        ? 'Modifier les informations de présence' 
        : 'Informations sur les élèves présents Par niveau';

    return (
        <Modal open={visible} onClose={handleCancel} size="md">
            <Modal.Header>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>
            
            <Modal.Body>
                {/* Affichage des erreurs */}
                {submitError && (
                    <div style={{ 
                        marginBottom: 16, 
                        padding: 12, 
                        backgroundColor: '#fff2f0', 
                        border: '1px solid #ffccc7',
                        borderRadius: 6,
                        color: '#a8071a'
                    }}>
                        <strong>Erreur : </strong>{submitError}
                    </div>
                )}

                {/* Indicateur de chargement des données */}
                {isDataLoading && (
                    <div style={{ textAlign: 'center', padding: 20 }}>
                        <Loader size="lg" />
                        <div style={{ marginTop: 8, color: '#666' }}>
                            Chargement des données...
                        </div>
                    </div>
                )}

                <Form
                    model={model}
                    formValue={formValue}
                    formError={formError}
                    onCheck={handleCheck}
                    onChange={setFormValue}
                    disabled={loading || isDataLoading}
                    fluid
                >
                    {/* Sélection de la branche */}
                    <Form.Group controlId="branche">
                        <Form.ControlLabel>Branche</Form.ControlLabel>
                        <Form.Control
                            name="branche"
                            accepter={SelectPicker}
                            data={branches}
                            placeholder="Sélectionner la branche"
                            searchable
                            cleanable={false}
                            loading={branchesLoading}
                            style={{ width: '100%' }}
                            disabled={!!editData} // Désactiver la sélection en mode édition
                        />
                        <Form.HelpText>
                            {editData ? 'La branche ne peut pas être modifiée' : 'Sélectionner la branche concernée'}
                        </Form.HelpText>
                    </Form.Group>

                    <div style={{ display: 'flex', gap: 16 }}>
                        {/* Nombre affecté */}
                        <Form.Group controlId="nombreAffecte" style={{ flex: 1 }}>
                            <Form.ControlLabel>Nombre affecté</Form.ControlLabel>
                            <Form.Control 
                                name="nombreAffecte" 
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                            <Form.HelpText>Nombre d'élèves affectés</Form.HelpText>
                        </Form.Group>

                        {/* Nombre non affecté */}
                        <Form.Group controlId="nombreNonAffecte" style={{ flex: 1 }}>
                            <Form.ControlLabel>Nombre Non affecté</Form.ControlLabel>
                            <Form.Control 
                                name="nombreNonAffecte" 
                                type="number"
                                min="0"
                                placeholder="0"
                            />
                            <Form.HelpText>Nombre d'élèves non affectés</Form.HelpText>
                        </Form.Group>
                    </div>

                    {/* Affichage du total */}
                    {(formValue.nombreAffecte > 0 || formValue.nombreNonAffecte > 0) && (
                        <div style={{
                            marginTop: 16,
                            padding: 12,
                            backgroundColor: '#f6ffed',
                            border: '1px solid #b7eb8f',
                            borderRadius: 6,
                            textAlign: 'center'
                        }}>
                            <strong>Total élèves : {(formValue.nombreAffecte || 0) + (formValue.nombreNonAffecte || 0)}</strong>
                        </div>
                    )}
                </Form>
            </Modal.Body>
            
            <Modal.Footer>
                <Button 
                    onClick={handleCancel} 
                    appearance="subtle"
                    disabled={loading}
                >
                    Annuler
                </Button>
                <Button 
                    onClick={confirmSubmission} 
                    appearance="primary" 
                    loading={loading}
                    disabled={isDataLoading}
                    color="green"
                >
                    Enregistrer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PresenceInfoModal;