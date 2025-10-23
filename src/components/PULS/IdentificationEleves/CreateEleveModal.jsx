import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, SelectPicker, Button, Message, Loader, Schema, Panel, Divider } from 'rsuite';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import { useAnneeData, useBranchesData } from './EleveServiceManager';
import { usePulsParams } from "../../hooks/useDynamicParams";


const { StringType, NumberType } = Schema.Types;

/**
 * Modèle de validation pour le formulaire
 */
const model = Schema.Model({
    matricule: StringType()
        .isRequired('Le matricule est obligatoire')
        .minLength(3, 'Le matricule doit contenir au moins 3 caractères'),
    nom: StringType()
        .isRequired('Le nom est obligatoire')
        .minLength(2, 'Le nom doit contenir au moins 2 caractères'),
    prenom: StringType()
        .isRequired('Le prénom est obligatoire')
        .minLength(2, 'Le prénom doit contenir au moins 2 caractères'),
    sexe: StringType()
        .isRequired('Le sexe est obligatoire'),
    statut: StringType()
        .isRequired('Le statut est obligatoire'),
    branche: NumberType()
        .isRequired('La branche est obligatoire')
});

/**
 * Modal de création/modification d'un élève
 */
const CreateEleveModal = ({ visible, onClose, onSuccess, editingEleve = null }) => {
    const [formValue, setFormValue] = useState({
        matricule: '',
        nom: '',
        prenom: '',
        sexe: null,
        statut: null,
        branche: null,
        codeInterne: '',
        contact1: '',
        contact2: ''
    });
    const [formError, setFormError] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const apiUrls = useAllApiUrls();
    const {
        ecoleId: dynamicEcoleId,
        personnelInfo,
        academicYearId: dynamicAcademicYearId,
        periodicitieId: dynamicPeriodicitieId,
        profileId,
        userId: dynamicUserId,
        email,
        isAuthenticated,
        isInitialized,
        isReady,
    } = usePulsParams();

    // Hooks pour récupérer les données
    const { annee, loading: anneeLoading } = useAnneeData();
    const { branches, loading: branchesLoading } = useBranchesData();

    // Options pour les sélecteurs
    const sexeOptions = [
        { label: 'Masculin', value: 'MASCULIN' },
        { label: 'Féminin', value: 'FEMININ' }
    ];

    const statutOptions = [
        { label: 'Affecté', value: 'AFFECTE' },
        { label: 'Non Affecté', value: 'NON_AFFECTE' }
    ];

    /**
     * Validation du formulaire
     */
    const handleCheck = (formError) => {
        setFormError(formError);
    };

    /**
     * Soumission du formulaire
     */
    const handleSubmit = async () => {
        if (!model.check(formValue)) {
            Message.error('Veuillez corriger les erreurs du formulaire');
            return;
        }

        try {
            setLoading(true);
            setSubmitError(null);

            // Préparer les données selon le format API attendu
            const eleveData = {
                id: editingEleve?.id || null,
                matricule: formValue.matricule,
                nom: formValue.nom.toUpperCase(),
                prenom: formValue.prenom,
                sexe: formValue.sexe,
                statut: formValue.statut,
                branche: {
                    id: formValue.branche
                },
                codeInterne: formValue.codeInterne || null,
                contact1: formValue.contact1 || null,
                contact2: formValue.contact2 || null,
                annee: {
                    id: annee?.id
                },
                ecole: {
                    id: dynamicEcoleId
                }
            };

            // URL API pour inscription (à adapter selon votre API)
            const apiUrl = editingEleve
                ? apiUrls.inscriptions.update(editingEleve.id)
                : apiUrls.inscriptions.create();

            const response = editingEleve
                ? await axios.put(apiUrl, eleveData)
                : await axios.post(apiUrl, eleveData);

            // Succès - réinitialiser le formulaire et fermer le modal
            handleReset();
            onSuccess(response.data);
            onClose();

            Message.success(editingEleve ? 'Élève modifié avec succès' : 'Élève créé avec succès');

        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                `Erreur lors de ${editingEleve ? 'la modification' : 'la création'} de l'élève`;
            setSubmitError(errorMessage);
            Message.error(errorMessage);
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
        if (editingEleve) {
            // Mode édition - préremplir avec les données existantes
            setFormValue({
                matricule: editingEleve.matricule || '',
                nom: editingEleve.nom || '',
                prenom: editingEleve.prenom || '',
                sexe: editingEleve.sexe || null,
                statut: editingEleve.statut || null,
                branche: editingEleve.branche?.id || null,
                codeInterne: editingEleve.codeInterne || '',
                contact1: editingEleve.contact1 || '',
                contact2: editingEleve.contact2 || ''
            });
        } else {
            // Mode création - valeurs par défaut
            setFormValue({
                matricule: '',
                nom: '',
                prenom: '',
                sexe: null,
                statut: null,
                branche: null,
                codeInterne: '',
                contact1: '',
                contact2: ''
            });
        }
        setFormError({});
        setSubmitError(null);
    };

    /**
     * Réinitialisation quand le modal s'ouvre ou que l'élève change
     */
    useEffect(() => {
        if (visible) {
            handleReset();
        }
    }, [visible, editingEleve]);

    const isDataLoading = branchesLoading || anneeLoading;
    const modalTitle = editingEleve ? 'Modifier l\'élève' : 'Détails élève';

    return (
        <Modal open={visible} onClose={handleCancel} size="lg">
            <Modal.Header>
                <Modal.Title>{modalTitle}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* En-tête avec l'année */}
                {annee && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 20,
                        paddingBottom: 15,
                        borderBottom: '1px solid #e5e5e5'
                    }}>
                        <div style={{ color: '#999', fontSize: '14px' }}>
                            {annee.customLibelle || annee.libelle}
                        </div>
                        <div style={{
                            backgroundColor: '#f0f2f5',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            color: '#666'
                        }}>
                            INSCRIPTION
                        </div>
                    </div>
                )}

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
                    {/* Matricule */}
                    <Form.Group controlId="matricule">
                        <Form.ControlLabel>Matricule*</Form.ControlLabel>
                        <Form.Control
                            name="matricule"
                            placeholder="Entrez le matricule de l'élève"
                            size="lg"
                        />
                    </Form.Group>

                    {/* Nom */}
                    <Form.Group controlId="nom">
                        <Form.ControlLabel>Nom*</Form.ControlLabel>
                        <Form.Control
                            name="nom"
                            placeholder="Entrez le nom de famille"
                            size="lg"
                        />
                    </Form.Group>

                    {/* Prénom */}
                    <Form.Group controlId="prenom">
                        <Form.ControlLabel>Prénom*</Form.ControlLabel>
                        <Form.Control
                            name="prenom"
                            placeholder="Entrez le prénom"
                            size="lg"
                        />
                    </Form.Group>

                    {/* Ligne avec Sexe, Statut et Branche */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
                        {/* Sexe */}
                        <Form.Group controlId="sexe">
                            <Form.ControlLabel>Sélectionnez le Sexe*</Form.ControlLabel>
                            <Form.Control
                                name="sexe"
                                accepter={SelectPicker}
                                data={sexeOptions}
                                placeholder="Sélectionnez le Sexe*"
                                searchable={false}
                                cleanable={false}
                                size="lg"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>

                        {/* Statut */}
                        <Form.Group controlId="statut">
                            <Form.ControlLabel>Sélectionnez le statut*</Form.ControlLabel>
                            <Form.Control
                                name="statut"
                                accepter={SelectPicker}
                                data={statutOptions}
                                placeholder="Sélectionnez le statut*"
                                searchable={false}
                                cleanable={false}
                                size="lg"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                    </div>

                    {/* Branche */}
                    <Form.Group controlId="branche">
                        <Form.ControlLabel>Sélectionnez la branche*</Form.ControlLabel>
                        <Form.Control
                            name="branche"
                            accepter={SelectPicker}
                            data={branches}
                            placeholder="Sélectionnez la branche*"
                            searchable
                            cleanable={false}
                            loading={branchesLoading}
                            size="lg"
                            style={{ width: '100%' }}
                        />
                    </Form.Group>

                    {/* Ligne avec Code interne, Contact1 et Contact2 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        {/* Code interne */}
                        <Form.Group controlId="codeInterne">
                            <Form.ControlLabel>Code interne</Form.ControlLabel>
                            <Form.Control
                                name="codeInterne"
                                placeholder="Code interne (optionnel)"
                                size="lg"
                            />
                        </Form.Group>

                        {/* Contact1 */}
                        <Form.Group controlId="contact1">
                            <Form.ControlLabel>Contact1</Form.ControlLabel>
                            <Form.Control
                                name="contact1"
                                placeholder="Numéro de téléphone 1"
                                size="lg"
                            />
                        </Form.Group>
                    </div>

                    {/* Contact2 sur une ligne séparée */}
                    <Form.Group controlId="contact2">
                        <Form.ControlLabel>Contact2</Form.ControlLabel>
                        <Form.Control
                            name="contact2"
                            placeholder="Numéro de téléphone 2"
                            size="lg"
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    onClick={handleSubmit}
                    appearance="primary"
                    loading={loading}
                    disabled={isDataLoading}
                    color="green"
                    size="lg"
                >
                    Save
                </Button>
                <Button
                    onClick={handleCancel}
                    appearance="subtle"
                    disabled={loading}
                    size="lg"
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateEleveModal;