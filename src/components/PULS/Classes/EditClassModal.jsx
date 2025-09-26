import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Form,
    SelectPicker,
    Toggle,
    Button,
    Loader,
    Schema,
    Nav,
    Table,
    Panel
} from 'rsuite';
import axios from 'axios';
import Swal from 'sweetalert2';


import { useNiveauxBranchesData, useLanguesData } from "../utils/CommonDataService";
import { useClassesUrls, useMatieresUrls, useAppParams } from '../utils/apiConfig';

const { Column, HeaderCell, Cell } = Table;
const { StringType, NumberType } = Schema.Types;

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

const notifySuccess = (title = 'Succès', text = '') =>
    Swal.fire({ icon: 'success', title, text, confirmButtonText: 'OK' });

const notifyError = (title = 'Erreur', text = '') =>
    Swal.fire({ icon: 'error', title, text, confirmButtonText: 'OK' });

const EditClassModal = ({ visible, onClose, onSuccess, selectedClass }) => {
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
    //   const [langues, setLangues] = useState([]);
    const [languesLoading, setLanguesLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('professeurs');

    const [professeursData] = useState([]);
    const [emploiTempsData] = useState([]);

    const appParams = useAppParams();
    const classesUrls = useClassesUrls();
    const languesUrls = useMatieresUrls();

    const { branches, loading: branchesLoading } = useNiveauxBranchesData();
    const { langues, loading: languesLoadingVivante } = useLanguesData();



    useEffect(() => {
        if (visible && selectedClass) {
            setFormValue({
                code: selectedClass.code || '',
                libelle: selectedClass.libelle || '',
                effectif: selectedClass.effectif || 0,
                branche: selectedClass.branche?.id || null,
                langueVivante: selectedClass.langueVivante?.id || null,
                visible: selectedClass.visible === 1 || selectedClass.visible === true
            });
            setSubmitError(null);
            setFormError({});
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, selectedClass]);

    useEffect(() => {
        if (!visible) {
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
            setActiveTab('professeurs');
        }
    }, [visible]);

    const handleCheck = useCallback((formError) => {
        setFormError(formError);
    }, []);

    const handleSubmit = async () => {
        // validation RSuite
        if (!model.check(formValue)) {
            notifyError('Erreur', 'Veuillez corriger les erreurs du formulaire');
            return;
        }

        if (!selectedClass?.id) {
            notifyError('Erreur', 'Aucune classe sélectionnée pour la modification');
            return;
        }

        try {
            setLoading(true);
            setSubmitError(null);

            const classeData = {
                id: selectedClass.id,
                annee: appParams.anneeScolaireId,
                branche: {
                    id: formValue.branche,
                    code: "",
                    libelle: ""
                },
                code: formValue.code,
                langueVivante: {
                    id: formValue.langueVivante,
                    code: "",
                    libelle: "Selectionner la langue"
                },
                libelle: formValue.libelle,
                profPrincipal: selectedClass.profPrincipal || null,
                ecole: { id: appParams.ecoleId },
                visible: formValue.visible ? 1 : 0,
                effectif: formValue.effectif || 0
            };

            const url = classesUrls.updateClasse();
            const response = await axios.post(url, classeData);

            // prévenir le parent, fermer modal puis notifier
            if (typeof onSuccess === 'function') {
                onSuccess(response.data);
            }
            onClose();

            notifySuccess('Classe modifiée', 'Classe modifiée avec succès');
        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Erreur lors de la modification de la classe';
            setSubmitError(errorMessage);
            notifyError('Erreur', errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onClose();
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'professeurs':
                return (
                    <div style={{ height: '300px' }}>
                        <Table
                            data={professeursData}
                            height={280}
                            loading={false}
                            locale={{ emptyMessage: 'Aucune donnée trouvée' }}
                        >
                            <Column width={150} align="left" fixed>
                                <HeaderCell>Matière</HeaderCell>
                                <Cell dataKey="matiere" />
                            </Column>
                            <Column width={200} align="left">
                                <HeaderCell>Professeur</HeaderCell>
                                <Cell dataKey="professeur" />
                            </Column>
                            <Column width={80} align="center">
                                <HeaderCell>Coef.</HeaderCell>
                                <Cell dataKey="coefficient" />
                            </Column>
                        </Table>
                    </div>
                );

            case 'emploiTemps':
                return (
                    <div style={{ height: '300px' }}>
                        <Table
                            data={emploiTempsData}
                            height={280}
                            loading={false}
                            locale={{ emptyMessage: 'Aucune donnée trouvée' }}
                        >
                            <Column width={100} align="left" fixed>
                                <HeaderCell>Jour</HeaderCell>
                                <Cell dataKey="jour" />
                            </Column>
                            <Column width={100} align="center">
                                <HeaderCell>Heure Deb</HeaderCell>
                                <Cell dataKey="heureDebut" />
                            </Column>
                            <Column width={100} align="center">
                                <HeaderCell>Heure Fin</HeaderCell>
                                <Cell dataKey="heureFin" />
                            </Column>
                            <Column width={150} align="left">
                                <HeaderCell>Matière</HeaderCell>
                                <Cell dataKey="matiere" />
                            </Column>
                        </Table>
                    </div>
                );

            default:
                return null;
        }
    };

    const isDataLoading = branchesLoading || languesLoading;

    return (
        <Modal open={visible} onClose={handleCancel} size="lg" style={{ top: 20 }}>
            <Modal.Header>
                <Modal.Title>
                    Modifier la classe {selectedClass?.code ? `"${selectedClass.code}"` : ''}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: '20px' }}>
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

                <div style={{ display: 'flex', gap: '20px', minHeight: '500px' }}>
                    <div style={{ flex: '0 0 45%' }}>
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
                            <Form.Group controlId="code">
                                <Form.ControlLabel>Code</Form.ControlLabel>
                                <Form.Control name="code" placeholder="Entrez le code de la classe" />
                                <Form.HelpText>Le code unique de la classe</Form.HelpText>
                            </Form.Group>

                            <Form.Group controlId="libelle">
                                <Form.ControlLabel>Libellé</Form.ControlLabel>
                                <Form.Control name="libelle" placeholder="Entrez le libellé de la classe" />
                                <Form.HelpText>Le nom complet de la classe</Form.HelpText>
                            </Form.Group>

                            <Form.Group controlId="effectif">
                                <Form.ControlLabel>Effectif Maximal</Form.ControlLabel>
                                <Form.Control name="effectif" type="number" min="0" placeholder="0" />
                                <Form.HelpText>Nombre maximum d'élèves dans la classe</Form.HelpText>
                            </Form.Group>

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
                    </div>

                    <div style={{ flex: '1', borderLeft: '1px solid #e5e5ea', paddingLeft: '20px' }}>
                        <Nav appearance="tabs" activeKey={activeTab} onSelect={setActiveTab} style={{ marginBottom: '15px' }}>
                            <Nav.Item eventKey="professeurs">Liste des professeurs</Nav.Item>
                            <Nav.Item eventKey="emploiTemps">Emploi du temps</Nav.Item>
                        </Nav>

                        <Panel bordered style={{ height: '320px', overflow: 'hidden' }}>
                            {renderTabContent()}
                        </Panel>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={handleSubmit} appearance="primary" loading={loading} disabled={isDataLoading} color="blue">
                    Enregistrer
                </Button>
                <Button onClick={handleCancel} appearance="subtle" disabled={loading}>
                    Annuler
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditClassModal;
