import React, { useState } from 'react';
import {
    Modal,
    Button,
    Grid,
    Row,
    Col,
    Panel,
    SelectPicker,
    IconButton,
    Stack,
    Text,
    Badge,
    Avatar
} from 'rsuite';
import {
    FiFileText,
    FiX,
    FiCheck,
    FiUser,
    FiMail,
    FiPhone,
    FiCalendar,
    FiAward,
    FiDownload
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { usePersonnelUrls, useAppParams } from '../utils/apiConfig';


const PersonnelDetailsModal = ({
    open,
    onClose,
    personnelData,
    onSave
}) => {
    const [selectedPanier, setSelectedPanier] = useState('En attente');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Utilisation des configurations centralisées
    const appParams = useAppParams();
    const personnelUrls = usePersonnelUrls();

    const panierOptions = [
        { label: 'AJOUTER', value: 'AJOUTER' },
    ].map(item => ({ label: item.label, value: item.value }));

    const handleSave = async () => {
        // Validation des données
        if (!personnelData || !personnelData.id) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Données du personnel manquantes. Impossible de sauvegarder.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Confirmation utilisateur
        const result = await Swal.fire({
            title: 'Confirmer l\'enregistrement',
            text: `Êtes-vous sûr de vouloir enregistrer ce personnel avec le statut "${selectedPanier}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, enregistrer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            const apiData = {
                identifiant_ecole: appParams.ecoleId,
                identifiant_personnel: personnelData.id,
                panier_personnel_date_creation: null
            };

            console.log('📤 Envoi des données vers le panier:', apiData);

            // Utilisation de l'URL centralisée
            const url = personnelUrls.addToPanier();
            const response = await axios.post(url, apiData, {
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout: 10000
            });

            console.log('✅ Réponse du serveur:', response);

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Succès !',
                    text: 'Le personnel a été enregistré avec succès dans le panier.',
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                if (onSave) {
                    onSave({
                        personnel: personnelData,
                        statut: selectedPanier,
                        apiResponse: response.data
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('❌ Erreur lors de l\'enregistrement:', error);

            let errorMessage = 'Une erreur inattendue est survenue.';

            if (error.response) {
                // Erreurs HTTP avec réponse du serveur
                const status = error.response.status;
                const serverMessage = error.response.data?.message || '';

                switch (status) {
                    case 400:
                        errorMessage = `Données invalides: ${serverMessage || 'Vérifiez les informations saisies.'}`;
                        break;
                    case 401:
                        errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                        break;
                    case 403:
                        errorMessage = 'Accès interdit. Vous n\'avez pas les droits nécessaires.';
                        break;
                    case 404:
                        errorMessage = 'Service non trouvé. Contactez l\'administrateur.';
                        break;
                    case 409:
                        errorMessage = 'Conflit: Ce personnel est peut-être déjà dans le panier.';
                        break;
                    case 422:
                        errorMessage = `Données non valides: ${serverMessage}`;
                        break;
                    case 500:
                        errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                        break;
                    case 503:
                        errorMessage = 'Service temporairement indisponible. Réessayez dans quelques instants.';
                        break;
                    default:
                        errorMessage = `Erreur serveur (${status}): ${serverMessage || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                // Erreur réseau - pas de réponse du serveur
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                // Timeout
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            } else {
                // Autres erreurs
                errorMessage = `Erreur technique: ${error.message}`;
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur d\'enregistrement',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDocumentAction = (docType) => {
        console.log(`📄 Ouverture du document ${docType} pour:`, personnelData?.nom_complet);

        // TODO: Implémenter l'ouverture/téléchargement de documents
        // Peut utiliser une URL centralisée pour les documents si nécessaire

        Swal.fire({
            icon: 'info',
            title: 'Fonctionnalité en développement',
            text: `L'ouverture du document "${docType}" sera bientôt disponible.`,
            confirmButtonColor: '#3b82f6'
        });
    };

    if (!personnelData) return null;

    // Extraction du prénom et nom pour l'avatar
    const getInitials = (name) => {
        if (!name) return 'MD';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1' }) => (
        <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            padding: '20px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={16} style={{ color }} />
                <Text size="sm" style={{
                    color: '#64748b',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
            </div>
            <Text style={{
                color: '#0f172a',
                fontWeight: '600',
                fontSize: '15px',
                lineHeight: '1.2'
            }}>
                {value || 'Non renseigné'}
            </Text>
        </div>
    );

    const DocumentCard = ({ type, hasDoc, onClick, title }) => {
        const iconColor = hasDoc ? '#10b981' : '#cbd5e1';
        const bgColor = hasDoc ? '#f0fdf4' : '#f8fafc';
        const borderColor = hasDoc ? '#bbf7d0' : '#e2e8f0';

        return (
            <div
                onClick={hasDoc ? onClick : undefined}
                style={{
                    background: bgColor,
                    border: `1px solid ${borderColor}`,
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: hasDoc ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    minHeight: '80px',
                    justifyContent: 'center'
                }}
                onMouseEnter={(e) => {
                    if (hasDoc) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (hasDoc) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                    }
                }}
            >
                <FiFileText size={20} style={{ color: iconColor }} />
                <Text size="xs" style={{
                    color: hasDoc ? '#059669' : '#64748b',
                    textAlign: 'center',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
                {hasDoc && (
                    <Badge style={{
                        background: '#10b981',
                        color: 'white',
                        fontSize: '10px'
                    }}>
                        Disponible
                    </Badge>
                )}
            </div>
        );
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
            overflow={true}
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header épuré */}
            <Modal.Header style={{
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                padding: '24px',
                borderRadius: '16px 16px 0 0'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <Avatar
                        size="lg"
                        style={{
                            background: '#f8fafc',
                            color: '#64748b',
                            fontWeight: '600',
                            fontSize: '18px',
                            border: '2px solid #e2e8f0'
                        }}
                    >
                        {getInitials(personnelData?.nom_complet)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {personnelData?.nom_complet || 'Nom complet non disponible'}
                        </Text>
                        <Badge style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {personnelData?.fonction_display || 'PROFESSEUR'}
                        </Badge>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{
                padding: '32px 24px',
                background: '#fafafa'
            }}>
                {/* Contact rapide */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid #f1f5f9',
                    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <FiMail size={16} style={{ color: '#6366f1' }} />
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            {personnelData?.email_display || 'Email non renseigné'}
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <FiPhone size={16} style={{ color: '#10b981' }} />
                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                            {personnelData?.contact_display || 'Contact non renseigné'}
                        </Text>
                    </div>
                </div>

                {/* Cards d'informations avec icônes */}
                <Grid fluid style={{ marginBottom: '32px' }}>
                    <Row gutter={16}>
                        <Col xs={8}>
                            <InfoCard
                                icon={FiAward}
                                title="Diplôme récent"
                                value={personnelData?.diplome_display}
                                color="#f59e0b"
                            />
                        </Col>
                        <Col xs={8}>
                            <InfoCard
                                icon={FiCalendar}
                                title="Date de naissance"
                                value={personnelData?.date_naissance_display}
                                color="#ef4444"
                            />
                        </Col>
                        <Col xs={8}>
                            <InfoCard
                                icon={FiUser}
                                title="Statut"
                                value={personnelData?.statut_display || 'Actif'}
                                color="#10b981"
                            />
                        </Col>
                    </Row>
                </Grid>

                {/* Validation du recrutement */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Validation du recrutement
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
                    <SelectPicker
                        data={panierOptions}
                        style={{ width: '100%', marginBottom: '16px' }}
                        value={selectedPanier}
                        onChange={setSelectedPanier}
                        searchable={true}
                        cleanable={false}
                        appearance="default"
                        placeholder="Statut du recrutement"
                        disabled={isSubmitting}
                        className='mt-3 mb-2'
                    />

                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '8px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px'
                    }}>
                        <div style={{
                            width: '20px',
                            height: '20px',
                            background: '#0ea5e9',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            marginTop: '2px'
                        }}>
                            <Text style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>i</Text>
                        </div>
                        <Text size="sm" style={{ color: '#0c4a6e', lineHeight: '1.5' }}>
                            Ce champ détermine le statut final du recrutement de cet agent.
                        </Text>
                    </div>
                </Panel>

                {/* Documents avec design amélioré */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Documents disponibles
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
                    <Grid fluid className='mt-3'>
                        <Row gutter={12} className="d-flex align-items-stretch">
                            <Col xs={6} >
                                <DocumentCard
                                    type="cv"
                                    title="CV"
                                    hasDoc={personnelData?.has_cv}
                                    onClick={() => handleDocumentAction('cv')}
                                    className="w-100 h-100"
                                />
                            </Col>
                            <Col xs={6} >
                                <DocumentCard
                                    type="autorisation"
                                    title="Autorisation"
                                    hasDoc={personnelData?.has_autorisation}
                                    onClick={() => handleDocumentAction('autorisation')}
                                    className="w-100 h-100"
                                />
                            </Col>
                            <Col xs={6} className="d-flex">
                                <DocumentCard
                                    type="piece"
                                    title="Pièce d'identité"
                                    hasDoc={personnelData?.has_piece}
                                    onClick={() => handleDocumentAction('piece')}
                                    className="w-100 h-100"
                                />
                            </Col>
                        </Row>
                    </Grid>

                </Panel>
            </Modal.Body>

            <Modal.Footer style={{
                padding: '20px 24px',
                borderTop: '1px solid #f1f5f9',
                background: 'white',
                borderRadius: '0 0 16px 16px'
            }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={onClose}
                        appearance="subtle"
                        startIcon={<FiX />}
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px'
                        }}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={handleSave}
                        appearance="primary"
                        startIcon={<FiCheck />}
                        style={{
                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PersonnelDetailsModal;