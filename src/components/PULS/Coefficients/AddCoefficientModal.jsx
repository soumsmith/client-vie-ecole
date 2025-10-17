import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Form,
    Panel,
    Grid,
    Row,
    Col,
    SelectPicker,
    Input,
    Text,
    Badge,
    Avatar
} from 'rsuite';
import {
    FiBookOpen,
    FiSave,
    FiX,
    FiTag,
    FiHash,
    FiPlus
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';
import { useMatieresEcoleData } from '../utils/CommonDataService';
import IconBox from "../Composant/IconBox";
import { getUserProfile } from "../../hooks/userUtils";



const AddCoefficientModal = ({ show, selectedBranche, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        matiereId: null,
        coefficient: 1
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrls = useAllApiUrls();
    const userProfile = getUserProfile();


    const { ecoleId: dynamicEcoleId } = usePulsParams();

    const {
        matieres: toutesLesMatieres,
        loading: matieresLoading,
        error: matieresError
    } = useMatieresEcoleData();

    // Réinitialiser le formulaire quand le modal s'ouvre
    useEffect(() => {
        if (show && selectedBranche) {
            setFormData({
                matiereId: null,
                coefficient: 1
            });
        }
    }, [show, selectedBranche]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Validation de la matière
        if (!formData.matiereId) {
            Swal.fire({
                icon: 'warning',
                title: 'Matière requise',
                text: 'Veuillez sélectionner une matière.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Validation du coefficient
        const coefficient = parseFloat(formData.coefficient);
        if (!coefficient || coefficient <= 0 || coefficient > 20) {
            Swal.fire({
                icon: 'warning',
                title: 'Coefficient invalide',
                text: 'Le coefficient doit être compris entre 0.1 et 20.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Demande de confirmation
        const result = await Swal.fire({
            title: 'Confirmer l\'ajout',
            text: `Êtes-vous sûr de vouloir ajouter cette matière avec un coefficient de ${coefficient} ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, ajouter',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Préparation des données selon le format API
            const apiData = [{
                coef: coefficient,
                id: 0, // ID 0 pour un nouvel élément
                matiere: {
                    id: formData.matiereId
                },
                branche: {
                    id: selectedBranche.id,
                    libelle: selectedBranche.libelle,
                    filiere: selectedBranche.raw_data?.filiere || null,
                    niveau: selectedBranche.raw_data?.niveau || null,
                    niveauEnseignement: selectedBranche.raw_data?.niveauEnseignement || null,
                    programme: selectedBranche.raw_data?.programme || null,
                    serie: selectedBranche.raw_data?.serie || null
                },
                ecole: {
                    id: dynamicEcoleId.toString()
                }
            }];

            const response = await axios.post(
                apiUrls.coefficients.majCoefficients(),
                apiData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Coefficient ajouté !',
                    text: 'La matière a été ajoutée avec succès.',
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                if (onSave) {
                    onSave({
                        formData,
                        apiResponse: response.data
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de l\'ajout du coefficient:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de l\'ajout.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations saisies.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Service indisponible.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = `Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur d\'ajout',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Ne pas afficher le modal si pas de branche sélectionnée
    if (!selectedBranche) return null;

    // Vérifier si les matières sont disponibles
    const hasAvailableMatieres = toutesLesMatieres && Array.isArray(toutesLesMatieres) && toutesLesMatieres.length > 0;

    return (
        <Modal
            open={show}
            onClose={onClose}
            size="md"
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header */}
            <Modal.Header >
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <IconBox icon={FiPlus} size={34} />
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            Ajouter une Matière
                        </Text>
                        <Badge style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {selectedBranche.label || selectedBranche.libelle}
                        </Badge>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body >
                {/* Informations de la branche sélectionnée */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Branche sélectionnée
                        </Text>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        marginBottom: '24px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <div className='mt-3' style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                    }}>
                        <IconBox icon={FiBookOpen} />
                        <div>
                            <Text weight="semibold" style={{ color: '#0f172a', marginBottom: '2px' }}>
                                {selectedBranche.label || selectedBranche.libelle}
                            </Text>
                            <Text size="sm" style={{ color: '#64748b' }}>
                                Niveau: {selectedBranche.niveau_libelle || selectedBranche.niveau || 'Non défini'}
                            </Text>
                        </div>
                    </div>
                </Panel>

                {/* Affichage des erreurs de chargement */}
                {matieresError && (
                    <Panel
                        style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            marginBottom: '24px'
                        }}
                        bodyStyle={{ padding: '16px' }}
                    >
                        <Text style={{ color: '#dc2626' }}>
                            Erreur lors du chargement des matières: {matieresError.message || 'Erreur inconnue'}
                        </Text>
                    </Panel>
                )}

                {/* Formulaire d'ajout */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations de la matière
                        </Text>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <Form fluid className='mt-3'>
                        <Grid fluid>
                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiBookOpen size={14} style={{ marginRight: '6px' }} />
                                            Matière <span style={{ color: '#ef4444' }}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={toutesLesMatieres || []}
                                            value={formData.matiereId}
                                            onChange={(value) => handleInputChange('matiereId', value)}
                                            placeholder={matieresLoading ? "Chargement..." : "Sélectionner une matière"}
                                            disabled={isSubmitting || matieresLoading || !hasAvailableMatieres}
                                            loading={matieresLoading}
                                            style={{ width: '100%' }}
                                            cleanable={false}
                                            searchable={hasAvailableMatieres}
                                            renderMenuItem={(label, item) => (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '24px',
                                                        height: '24px',
                                                        borderRadius: '4px',
                                                        background: '#f1f5f9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <FiBookOpen size={12} />
                                                    </div>
                                                    <span>{label}</span>
                                                </div>
                                            )}
                                        />
                                        {!matieresLoading && !hasAvailableMatieres && (
                                            <Text size="sm" style={{ color: '#f59e0b', marginTop: '4px' }}>
                                                {matieresError ? 'Erreur de chargement des matières' : 'Aucune matière disponible ou toutes les matières sont déjà assignées à cette branche'}
                                            </Text>
                                        )}
                                        {matieresLoading && (
                                            <Text size="sm" style={{ color: '#64748b', marginTop: '4px' }}>
                                                Chargement des matières en cours...
                                            </Text>
                                        )}
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiHash size={14} style={{ marginRight: '6px' }} />
                                            Coefficient <span style={{ color: '#ef4444' }}>*</span>
                                        </Form.ControlLabel>
                                        <Input
                                            type="number"
                                            value={formData.coefficient}
                                            onChange={(value) => handleInputChange('coefficient', value)}
                                            placeholder="Ex: 1"
                                            disabled={isSubmitting}
                                            min="0.1"
                                            max="20"
                                            step="0.1"
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                        <Text size="sm" style={{ color: '#64748b', marginTop: '4px' }}>
                                            Le coefficient doit être compris entre 0.1 et 20
                                        </Text>
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Grid>
                    </Form>
                </Panel>
            </Modal.Body>

            <Modal.Footer style={{
                padding: '10px 0px',
                borderRadius: '0 0 16px 16px'
            }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button
                        appearance="subtle"
                        onClick={onClose}
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
                        className={`${userProfile}-btn-search`}
                        appearance="primary"
                        onClick={handleSave}
                        startIcon={<FiSave />}
                        loading={isSubmitting}
                        disabled={isSubmitting || matieresLoading || !formData.matiereId || !hasAvailableMatieres}

                    >
                        {isSubmitting ? 'Ajout en cours...' : 'Ajouter'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AddCoefficientModal;