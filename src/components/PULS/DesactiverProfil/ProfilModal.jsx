import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, SelectPicker, Loader } from 'rsuite';
import { FiUser, FiMail, FiPhone, FiCalendar, FiBookOpen } from 'react-icons/fi';
import { useProfilsData } from './PersonnelServiceManager';

const ProfilModal = ({ modalState, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        profilActif: true,
        profilSelectionne: null
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Récupération de la liste des profils
    const { profils, loading: profilsLoading, error: profilsError } = useProfilsData();

    // Réinitialisation du formulaire quand le modal s'ouvre
    useEffect(() => {
        if (modalState.isOpen && modalState.selectedQuestion) {
            setFormData({
                profilActif: true, // Par défaut activé, à adapter selon vos besoins
                profilSelectionne: null
            });
            setFormErrors({});
        }
    }, [modalState.isOpen, modalState.selectedQuestion]);

    // Gestion des changements dans le formulaire
    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Supprimer l'erreur du champ modifié
        if (formErrors[field]) {
            setFormErrors(prev => ({
                ...prev,
                [field]: null
            }));
        }
    };

    // Validation du formulaire
    const validateForm = () => {
        const errors = {};

        if (!formData.profilSelectionne) {
            errors.profilSelectionne = 'Veuillez sélectionner un profil';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Soumission du formulaire
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        try {
            await onSave(formData);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
        } finally {
            setLoading(false);
        }
    };

    // Formatage de la date
    const formatDate = (dateString) => {
        if (!dateString) return 'Non spécifiée';
        return new Date(dateString).toLocaleDateString('fr-FR');
    };

    // Calcul de l'âge
    const calculateAge = (birthDate) => {
        if (!birthDate) return 'Non spécifiée';
        const today = new Date();
        const birth = new Date(birthDate);
        const age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            return `${age - 1} ans`;
        }
        return `${age} ans`;
    };

    const currentPersonnel = modalState.selectedQuestion;

    return (
        <Modal
            open={modalState.isOpen}
            onClose={onClose}
            size="md"
            backdrop="static"
        >
            <Modal.Header>
                <Modal.Title>
                    <FiUser className="me-2" />
                    Détails personnel
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {currentPersonnel && (
                    <div>
                        {/* Informations personnelles en lecture seule */}
                        <Row gutter={16} className="mb-3">
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Diplôme récent</Form.ControlLabel>
                                    <Form.Control
                                        name="diplome"
                                        value={currentPersonnel.diplomeRecent || 'NEANT'}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Date de naissance</Form.ControlLabel>
                                    <Form.Control
                                        name="dateNaissance"
                                        value={formatDate(currentPersonnel.dateNaissance)}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row gutter={16} className="mb-3">
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Contact</Form.ControlLabel>
                                    <Form.Control
                                        name="contact"
                                        value={currentPersonnel.contact || ''}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Âge</Form.ControlLabel>
                                    <Form.Control
                                        name="age"
                                        value={calculateAge(currentPersonnel.dateNaissance)}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row gutter={16} className="mb-4">
                            <Col xs={24}>
                                <Form.Group>
                                    <Form.ControlLabel>Email</Form.ControlLabel>
                                    <Form.Control
                                        name="email"
                                        value={currentPersonnel.email || ''}
                                        readOnly
                                        plaintext
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Section de configuration du profil */}
                        <div className="border-top pt-4">
                            <Row gutter={16} className="mb-3">
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>Profil</Form.ControlLabel>
                                        {profilsLoading ? (
                                            <div className="d-flex align-items-center">
                                                <Loader size="sm" className="me-2" />
                                                Chargement des profils...
                                            </div>
                                        ) : profilsError ? (
                                            <div
                                                type="error"
                                                description="Erreur lors du chargement des profils"
                                            ></div>
                                        ) : (
                                            <SelectPicker
                                                data={profils}
                                                value={formData.profilSelectionne}
                                                onChange={(value) => handleInputChange('profilSelectionne', value)}
                                                placeholder="Sélectionner un profil"
                                                block
                                                cleanable={false}
                                                searchable
                                            />
                                        )}
                                        {formErrors.profilSelectionne && (
                                            <Form.ErrorMessage show={true}>
                                                {formErrors.profilSelectionne}
                                            </Form.ErrorMessage>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col xs={12}>
                                    <Form.Group>
                                        <Form.ControlLabel>Désactiver profil</Form.ControlLabel>
                                        <div className="mt-2">
                                            {/* <Switch
                                                checked={formData.profilActif}
                                                onChange={(checked) => handleInputChange('profilActif', checked)}
                                                checkedChildren="Activé"
                                                unCheckedChildren="Désactivé"
                                            /> */}
                                        </div>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </div>

                        {/* Liens vers les documents */}
                        <div className="border-top pt-4">
                            <Row gutter={16}>
                                <Col xs={8}>
                                    <Button
                                        appearance="ghost"
                                        size="sm"
                                        disabled={!currentPersonnel.lienCV}
                                        onClick={() => {
                                            if (currentPersonnel.lienCV) {
                                                window.open(currentPersonnel.lienCV, '_blank');
                                            }
                                        }}
                                    >
                                        <FiBookOpen className="me-1" />
                                        CV
                                    </Button>
                                </Col>
                                <Col xs={8}>
                                    <Button
                                        appearance="ghost"
                                        size="sm"
                                        disabled={!currentPersonnel.lienAutorisation}
                                        onClick={() => {
                                            if (currentPersonnel.lienAutorisation) {
                                                window.open(currentPersonnel.lienAutorisation, '_blank');
                                            }
                                        }}
                                    >
                                        <FiBookOpen className="me-1" />
                                        Autorisation
                                    </Button>
                                </Col>
                                <Col xs={8}>
                                    <Button
                                        appearance="ghost"
                                        size="sm"
                                        disabled={!currentPersonnel.lienPiece}
                                        onClick={() => {
                                            if (currentPersonnel.lienPiece) {
                                                window.open(currentPersonnel.lienPiece, '_blank');
                                            }
                                        }}
                                    >
                                        <FiBookOpen className="me-1" />
                                        Pièce
                                    </Button>
                                </Col>
                            </Row>
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    appearance="primary"
                    loading={loading}
                    disabled={loading}
                >
                    Save
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProfilModal;