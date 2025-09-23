import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, Input, SelectPicker, Toggle, Button, Message, Loader, Schema } from 'rsuite';
import axios from 'axios';
import { useNiveauxBranchesData, useClassesByBrancheData } from "../utils/CommonDataService";
import { useClassesUrls, useMatieresUrls, useAppParams } from '../utils/apiConfig';


const { StringType, NumberType } = Schema.Types;

/**
 * Modèle de validation pour le formulaire
 */
const model = Schema.Model({
    code: StringType()
        .isRequired('Le code est obligatoire')
        .minLength(2, 'Le code doit contenir au moins 2 caractères'),
    libelle: StringType()
        .isRequired('Le libellé est obligatoire')
        .minLength(3, 'Le libellé doit contenir au moins 3 caractères'),
    effectif: NumberType()
        .isRequired('L\'effectif est obligatoire')
        .min(0, 'L\'effectif doit être positif'),
    branche: NumberType()
        .isRequired('La branche est obligatoire'),
    langueVivante: NumberType()
        .isRequired('La langue vivante est obligatoire')
});

/**
 * Hook pour récupérer les langues (LV2)
 */
const useLanguesData = () => {
    const [langues, setLangues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const languesUrls = useMatieresUrls();


    const fetchLangues = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const url = languesUrls.getClasseByEcole();
            const response = await axios.get(url);
            const formattedLangues = (response.data || []).map(langue => ({
                label: `${langue.libelle} (${langue.code})`,
                value: langue.id
            }));
            setLangues(formattedLangues);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des langues');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLangues();
    }, [fetchLangues]);

    return { langues, loading, error, refetch: fetchLangues };
};


/**
 * Modal de création d'une nouvelle classe
 */
const CreateClassModal = ({ visible, onClose, onSuccess }) => {
    const [formValue, setFormValue] = useState({
        code: '',
        libelle: '',
        effectif: 0,
        branche: null,
        langueVivante: null,
        visible: true
    });
    const [formError, setFormError] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const appParams = useAppParams();
    const classesUrls = useClassesUrls();



    // Hooks pour récupérer les données
    const { langues, loading: languesLoading } = useLanguesData();
    //const { branches, loading: branchesLoading } = useBranchesData();
    const { branches, loading: branchesLoading, error: branchesError } = useNiveauxBranchesData();

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
            const classeData = {
                annee: appParams.anneeScolaireId,
                branche: {
                    id: formValue.branche,
                    code: "",
                    libelle: ""
                },
                code: formValue.code,
                id: "87115", // ID généré ou fourni par l'API
                langueVivante: {
                    id: formValue.langueVivante,
                    code: "",
                    libelle: "Selectionner la langue"
                },
                libelle: formValue.libelle,
                profPrincipal: null,
                ecole: {
                    id: appParams.ecoleId
                },
                visible: formValue.visible ? 1 : 0,
                effectif: formValue.effectif || 0
            };

            const url = classesUrls.saveClasse();
            const response = await axios.post(url, classeData);

            // Succès - réinitialiser le formulaire et fermer le modal
            handleReset();
            onSuccess(response.data);
            onClose();

            Message.success('Classe créée avec succès');

        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Erreur lors de la création de la classe';
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
        setFormValue({
            code: '',
            libelle: '',
            effectif: 0,
            branche: null,
            langueVivante: null,
            visible: true
        });
        setFormError({});
        setSubmitError(null);
    };

    /**
     * Réinitialisation quand le modal s'ouvre
     */
    useEffect(() => {
        if (visible) {
            handleReset();
        }
    }, [visible]);

    const isDataLoading = branchesLoading || languesLoading;

    return (
        <Modal open={visible} onClose={handleCancel} size="md">
            <Modal.Header>
                <Modal.Title>Créer une nouvelle classe</Modal.Title>
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
                    {/* Code de la classe */}
                    <Form.Group controlId="code">
                        <Form.ControlLabel>Code</Form.ControlLabel>
                        <Form.Control
                            name="code"
                            placeholder="Entrez le code de la classe"
                        />
                        <Form.HelpText>Le code unique de la classe</Form.HelpText>
                    </Form.Group>

                    {/* Libellé de la classe */}
                    <Form.Group controlId="libelle">
                        <Form.ControlLabel>Libellé</Form.ControlLabel>
                        <Form.Control
                            name="libelle"
                            placeholder="Entrez le libellé de la classe"
                        />
                        <Form.HelpText>Le nom complet de la classe</Form.HelpText>
                    </Form.Group>

                    {/* Effectif maximal */}
                    <Form.Group controlId="effectif">
                        <Form.ControlLabel>Effectif Maximal</Form.ControlLabel>
                        <Form.Control
                            name="effectif"
                            type="number"
                            min="0"
                            placeholder="0"
                        />
                        <Form.HelpText>Nombre maximum d'élèves dans la classe</Form.HelpText>
                    </Form.Group>

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
                        />
                        <Form.HelpText>La branche d'enseignement de la classe</Form.HelpText>
                    </Form.Group>

                    {/* Sélection de la langue vivante (LV2) */}
                    <Form.Group controlId="langueVivante">
                        <Form.ControlLabel>LV2</Form.ControlLabel>
                        <Form.Control
                            name="langueVivante"
                            accepter={SelectPicker}
                            data={langues}
                            placeholder="Sélectionner la langue"
                            searchable
                            cleanable={false}
                            loading={languesLoading}
                            style={{ width: '100%' }}
                        />
                        <Form.HelpText>La langue vivante 2 enseignée</Form.HelpText>
                    </Form.Group>

                    {/* Switch de visibilité */}
                    <Form.Group controlId="visible">
                        <Form.ControlLabel>Visibilité</Form.ControlLabel>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Form.Control
                                name="visible"
                                accepter={Toggle}
                                checkedChildren="Visible"
                                unCheckedChildren="Masquée"
                            />
                            <span style={{ color: '#666', fontSize: '14px' }}>
                                La classe sera visible dans la liste
                            </span>
                        </div>
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
                >
                    Enregistrer
                </Button>
                <Button
                    onClick={handleCancel}
                    appearance="subtle"
                    disabled={loading}
                >
                    Annuler
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateClassModal;