import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Form,
    Input,
    Panel,
    Grid,
    Row,
    Col,
    Text,
    Badge,
    Avatar,
    DatePicker,
    InputNumber,
    Table
} from 'rsuite';
import {
    FiCalendar,
    FiEdit,
    FiSave,
    FiX,
    FiType,
    FiClock,
    FiSettings
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';

const EditAnneeModal = ({ show, annee, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        customLibelle: '',
        delaiNotes: 0,
        periodes: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const apiUrls = useAllApiUrls();

    // Fonction pour nettoyer et parser les dates de l'API
    const parseAPIDate = (dateString) => {
        if (!dateString) return null;
        try {
            // Nettoyer le format de date de l'API en retirant [UTC]
            const cleanDateString = dateString.replace(/\[UTC\]$/, '');
            const date = new Date(cleanDateString);
            return isNaN(date.getTime()) ? null : date;
        } catch (error) {
            console.error('Erreur lors du parsing de la date:', dateString, error);
            return null;
        }
    };

    // Fonction pour parser les périodes depuis anneePeriodes
    const parsePeriodesFromData = (anneePeriodes) => {
        if (!anneePeriodes || !Array.isArray(anneePeriodes)) {
            return [];
        }

        const periodesMap = {};

        anneePeriodes.forEach(item => {
            const match = item.id.match(/(.+)_(\d+)/);
            if (match) {
                const [, type, numero] = match;
                const periodeKey = `periode_${numero}`;

                if (!periodesMap[periodeKey]) {
                    periodesMap[periodeKey] = {
                        numero: parseInt(numero),
                        libelle: getPeriodeLibelle(parseInt(numero)),
                        dateDebut: null,
                        dateFin: null,
                        dateLimite: null,
                        maxEvaluations: 0
                    };
                }

                switch (type) {
                    case 'deb':
                        periodesMap[periodeKey].dateDebut = parseAPIDate(item.value);
                        break;
                    case 'fin':
                        periodesMap[periodeKey].dateFin = parseAPIDate(item.value);
                        break;
                    case 'limite':
                        periodesMap[periodeKey].dateLimite = parseAPIDate(item.value);
                        break;
                    case 'nbeval':
                        periodesMap[periodeKey].maxEvaluations = item.nbEval || 0;
                        break;
                }
            }
        });

        return Object.values(periodesMap).sort((a, b) => a.numero - b.numero);
    };

    // Fonction pour obtenir le libellé de la période
    const getPeriodeLibelle = (numero) => {
        const libelles = {
            1: 'Premier Trimestre',
            2: 'Deuxième Trimestre',
            3: 'Troisième Trimestre',
            4: 'Quatrième Trimestre'
        };
        return libelles[numero] || `Période ${numero}`;
    };

    // Fonction pour convertir les périodes au format API
    const convertPeriodesForAPI = (periodes) => {
        const anneePeriodes = [];

        periodes.forEach(periode => {
            if (periode.dateDebut) {
                anneePeriodes.push({
                    id: `deb_${periode.numero}`,
                    value: periode.dateDebut.toISOString()
                });
            }

            if (periode.dateFin) {
                anneePeriodes.push({
                    id: `fin_${periode.numero}`,
                    value: periode.dateFin.toISOString()
                });
            }

            if (periode.dateLimite) {
                anneePeriodes.push({
                    id: `limite_${periode.numero}`,
                    value: periode.dateLimite.toISOString()
                });
            }

            anneePeriodes.push({
                id: `nbeval_${periode.numero}`,
                nbEval: periode.maxEvaluations || 0
            });
        });

        return anneePeriodes;
    };

    // Réinitialiser le formulaire quand le modal s'ouvre
    useEffect(() => {
        if (show && annee) {
            const periodes = parsePeriodesFromData(annee.anneePeriodes);

            setFormData({
                customLibelle: annee.customLibelle || annee.libelle || '',
                delaiNotes: annee.delaiNotes || 0,
                periodes: periodes
            });
        }
    }, [show, annee]);

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePeriodeChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            periodes: prev.periodes.map((periode, i) =>
                i === index ? { ...periode, [field]: value } : periode
            )
        }));
    };

    const handleSave = async () => {
        // Validation des champs requis
        if (!formData.customLibelle.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champ requis',
                text: 'Veuillez renseigner le libellé de l\'année scolaire.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Validation des périodes
        const periodesInvalides = formData.periodes.filter(periode =>
            !periode.dateDebut || !periode.dateFin || !periode.dateLimite
        );

        if (periodesInvalides.length > 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Périodes incomplètes',
                text: 'Veuillez renseigner toutes les dates pour chaque période.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Demande de confirmation
        const result = await Swal.fire({
            title: 'Confirmer la modification',
            text: `Êtes-vous sûr de vouloir modifier l'année scolaire "${formData.customLibelle}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, modifier',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Fonction pour formater les dates au format API avec [UTC]
            const formatDateForAPI = (date) => {
                if (!date) return null;
                return date.toISOString().replace('Z', 'Z[UTC]');
            };

            // Conversion des périodes au format API avec le nouveau format de date
            const convertPeriodesForAPIWithUTC = (periodes) => {
                const anneePeriodes = [];

                periodes.forEach(periode => {
                    if (periode.dateDebut) {
                        anneePeriodes.push({
                            id: `deb_${periode.numero}`,
                            value: formatDateForAPI(periode.dateDebut)
                        });
                    }

                    if (periode.dateFin) {
                        anneePeriodes.push({
                            id: `fin_${periode.numero}`,
                            value: formatDateForAPI(periode.dateFin)
                        });
                    }

                    if (periode.dateLimite) {
                        anneePeriodes.push({
                            id: `limite_${periode.numero}`,
                            value: formatDateForAPI(periode.dateLimite)
                        });
                    }

                    anneePeriodes.push({
                        id: `nbeval_${periode.numero}`,
                        nbEval: periode.maxEvaluations || 0
                    });
                });

                return anneePeriodes;
            };

            // Préparation des données selon le format spécifié
            const apiData = {
                anneeDebut: annee.anneeDebut || annee.raw_data?.anneeDebut,
                anneeFin: annee.anneeFin || annee.raw_data?.anneeFin,
                anneePeriodes: convertPeriodesForAPIWithUTC(formData.periodes),
                customLibelle: formData.customLibelle,
                dateCreation: annee.raw_data?.dateCreation || annee.dateCreation,
                dateUpdate: formatDateForAPI(new Date()),
                ecole: annee.raw_data?.ecole || {
                    code: annee.ecole_code,
                    id: annee.ecole_id,
                    libelle: annee.ecole_libelle,
                    niveauEnseignement: annee.raw_data?.ecole?.niveauEnseignement || {
                        code: annee.niveauEnseignement_id?.toString(),
                        id: annee.niveauEnseignement_id,
                        libelle: annee.niveauEnseignement_libelle
                    },
                    nomSignataire: annee.ecole_signataire,
                    tel: annee.raw_data?.ecole?.tel || ""
                },
                id: annee.id,
                libelle: formData.customLibelle,
                nbreEval: formData.delaiNotes || annee.nbreEval || 9,
                niveau: annee.niveau || annee.raw_data?.niveau,
                niveauEnseignement: annee.raw_data?.niveauEnseignement || {
                    code: annee.niveauEnseignement_id?.toString(),
                    id: annee.niveauEnseignement_id,
                    libelle: annee.niveauEnseignement_libelle
                },
                periodicite: annee.raw_data?.periodicite || {
                    code: annee.periodicite_code,
                    dateCreation: annee.raw_data?.periodicite?.dateCreation || "2023-09-01T00:00:00Z[UTC]",
                    dateUpdate: annee.raw_data?.periodicite?.dateUpdate || "2023-09-01T00:00:00Z[UTC]",
                    id: annee.periodicite_id,
                    isDefault: annee.periodicite_isDefault ? "DEFAULT" : "CUSTOM",
                    libelle: annee.periodicite_libelle,
                    ordre: annee.periodicite_code
                },
                statut: annee.statut || annee.raw_data?.statut,
                user: annee.user || annee.raw_data?.user
            };

            console.log('Données à envoyer:', apiData); // Pour debug

            const response = await axios.post(
                apiUrls.annees.saveUpdate(),
                apiData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 15000
                }
            );

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Année modifiée !',
                    text: `L'année scolaire "${formData.customLibelle}" a été modifiée avec succès.`,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                if (onSave) {
                    onSave({
                        annee: apiData,
                        formData,
                        apiResponse: response.data
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de la modification de l\'année:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de la modification.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations saisies.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Année scolaire non trouvée ou service indisponible.';
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
                title: 'Erreur de modification',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!annee) return null;

    // Extraction du code et libellé pour l'avatar
    const getInitials = (libelle) => {
        if (libelle) {
            const words = libelle.split(' ');
            if (words.length >= 2) {
                return `${words[0][0]}${words[1][0]}`.toUpperCase();
            }
            return libelle.slice(0, 2).toUpperCase();
        }
        return 'AS';
    };

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1' }) => (
        <div style={{
            background: '#ffffff',
            border: `1px solid ${color}`,
            borderRadius: '12px',
            padding: '16px',
            height: '85px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} style={{ color }} />
                <Text size="sm" style={{
                    color: '#64748b',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
            </div>
            <div>
                <Text style={{
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '14px',
                    lineHeight: '1.2'
                }}>
                    {value || 'Non renseigné'}
                </Text>
            </div>
        </div>
    );

    // Colonnes pour le tableau des périodes
    const periodesColumns = [
        {
            key: 'libelle',
            label: 'Période',
            width: 150,
            fixed: true
        },
        {
            key: 'dateDebut',
            label: 'Date Début',
            width: 150
        },
        {
            key: 'dateFin',
            label: 'Date Fin',
            width: 150
        },
        {
            key: 'dateLimite',
            label: 'Date Limite',
            width: 150
        },
        {
            key: 'maxEvaluations',
            label: 'Max Évaluations',
            width: 150
        }
    ];

    return (
        <Modal
            open={show}
            onClose={onClose}
            size="lg"
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden',
            }}
        >
            {/* Header */}
            <Modal.Header >
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
                        {getInitials(annee?.libelle || annee?.customLibelle)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {annee?.libelle || annee?.customLibelle || 'Année Scolaire'}
                        </Text>
                        <Badge style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {annee?.anneeDebut} - {annee?.anneeFin}
                        </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiEdit size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Paramétrer une année scolaire
                        </Text>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{
                
            }}>
                {/* Informations actuelles */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations actuelles
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
                    className=''
                >
                    <Grid fluid className='mt-3'>
                        <Row gutter={16}>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiCalendar}
                                    title="Période"
                                    value={`${annee?.anneeDebut} - ${annee?.anneeFin}`}
                                    color="#f59e0b"
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiSettings}
                                    title="Périodicité"
                                    value={annee?.periodicite?.libelle || 'Non définie'}
                                    color="#ef4444"
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiClock}
                                    title="Statut"
                                    value={annee?.statut || 'Non défini'}
                                    color="#10b981"
                                />
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Formulaire de modification */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Modifier les paramètres
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
                        {/* Libellé personnalisé */}
                        <Row gutter={16} style={{ marginBottom: '20px' }}>
                            <Col xs={24}>
                                <Form.Group>
                                    <Form.ControlLabel style={{
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        <FiType size={14} style={{ marginRight: '6px' }} />
                                        Libellé personnalisé <span style={{ color: '#ef4444' }}>*</span>
                                    </Form.ControlLabel>
                                    <Input
                                        value={formData.customLibelle}
                                        onChange={(value) => handleInputChange('customLibelle', value)}
                                        placeholder="Ex: Année scolaire 2024-2025"
                                        disabled={isSubmitting}
                                        style={{
                                            borderRadius: '8px',
                                            border: '1px solid #e2e8f0',
                                            padding: '12px',
                                            fontSize: '14px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Tableau des périodes */}
                        <div style={{ marginBottom: '20px' }}>
                            <Text weight="semibold" style={{
                                color: '#374151',
                                marginBottom: '12px',
                                display: 'block'
                            }}>
                                Configuration des périodes
                            </Text>

                            <div style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <Table
                                    data={formData.periodes}
                                    autoHeight
                                    bordered={false}
                                    cellBordered
                                    headerHeight={40}
                                    rowHeight={60}
                                >
                                    <Table.Column width={220} fixed>
                                        <Table.HeaderCell style={{ background: '#f8fafc', fontWeight: '600' }}>
                                            Période
                                        </Table.HeaderCell>
                                        <Table.Cell>
                                            {rowData => (
                                                <div style={{ fontWeight: '500', color: '#475569' }}>
                                                    {rowData.libelle}
                                                </div>
                                            )}
                                        </Table.Cell>
                                    </Table.Column>

                                    <Table.Column width={150}>
                                        <Table.HeaderCell style={{ background: '#f8fafc', fontWeight: '600' }}>
                                            Date Début
                                        </Table.HeaderCell>
                                        <Table.Cell>
                                            {(rowData, rowIndex) => (
                                                <DatePicker
                                                    value={rowData.dateDebut}
                                                    onChange={(value) => handlePeriodeChange(rowIndex, 'dateDebut', value)}
                                                    format="dd/MM/yyyy"
                                                    placeholder="Sélectionner"
                                                    style={{ width: '100%' }}
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        </Table.Cell>
                                    </Table.Column>

                                    <Table.Column width={150}>
                                        <Table.HeaderCell style={{ background: '#f8fafc', fontWeight: '600' }}>
                                            Date Fin
                                        </Table.HeaderCell>
                                        <Table.Cell>
                                            {(rowData, rowIndex) => (
                                                <DatePicker
                                                    value={rowData.dateFin}
                                                    onChange={(value) => handlePeriodeChange(rowIndex, 'dateFin', value)}
                                                    format="dd/MM/yyyy"
                                                    placeholder="Sélectionner"
                                                    style={{ width: '100%' }}
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        </Table.Cell>
                                    </Table.Column>

                                    <Table.Column width={150}>
                                        <Table.HeaderCell style={{ background: '#f8fafc', fontWeight: '600' }}>
                                            Date Limite
                                        </Table.HeaderCell>
                                        <Table.Cell>
                                            {(rowData, rowIndex) => (
                                                <DatePicker
                                                    value={rowData.dateLimite}
                                                    onChange={(value) => handlePeriodeChange(rowIndex, 'dateLimite', value)}
                                                    format="dd/MM/yyyy"
                                                    placeholder="Sélectionner"
                                                    style={{ width: '100%' }}
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        </Table.Cell>
                                    </Table.Column>

                                    <Table.Column width={150}>
                                        <Table.HeaderCell style={{ background: '#f8fafc', fontWeight: '600' }}>
                                            Max Évaluations
                                        </Table.HeaderCell>
                                        <Table.Cell>
                                            {(rowData, rowIndex) => (
                                                <InputNumber
                                                    value={rowData.maxEvaluations}
                                                    onChange={(value) => handlePeriodeChange(rowIndex, 'maxEvaluations', value)}
                                                    min={0}
                                                    max={50}
                                                    style={{ width: '100%' }}
                                                    disabled={isSubmitting}
                                                />
                                            )}
                                        </Table.Cell>
                                    </Table.Column>
                                </Table>
                            </div>
                        </div>

                        {/* Délai de saisie des notes */}
                        <Row gutter={16}>
                            <Col xs={12}>
                                <Form.Group>
                                    <Form.ControlLabel style={{
                                        fontWeight: '500',
                                        color: '#374151',
                                        marginBottom: '8px'
                                    }}>
                                        <FiClock size={14} style={{ marginRight: '6px' }} />
                                        Délai de saisie des notes (jours)
                                    </Form.ControlLabel>
                                    <InputNumber
                                        value={formData.delaiNotes}
                                        onChange={(value) => handleInputChange('delaiNotes', value)}
                                        min={0}
                                        max={365}
                                        disabled={isSubmitting}
                                        style={{
                                            width: '100%',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </Form>
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
                        appearance="primary"
                        onClick={handleSave}
                        startIcon={<FiSave />}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                        style={{
                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                    >
                        {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EditAnneeModal;