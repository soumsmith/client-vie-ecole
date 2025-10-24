import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Form,
    SelectPicker,
    Button,
    Loader,
    Table,
    Panel,
    Grid,
    Row,
    Col,
    Text,
    Avatar,
    Badge
} from 'rsuite';
import {
    FiUsers,
    FiBookOpen,
    FiUser,
    FiFileText,
    FiPlus,
    FiX,
    FiCheck
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';


const { Column, HeaderCell, Cell } = Table;

/**
 * Hook pour récupérer la liste des classes
 */
const useClassesData = (ecoleId = 139) => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.classes.listByEcoleSorted());
            const formattedClasses = (response.data || []).map(classe => ({
                label: `${classe.libelle} - ${classe.branche?.serie?.libelle || 'N/A'}`,
                value: classe.id,
                raw_data: classe
            }));
            setClasses(formattedClasses);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des classes');
        } finally {
            setLoading(false);
        }
    }, [ecoleId, apiUrls.classes]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    return { classes, loading, error, refetch: fetchClasses };
};

/**
 * Hook pour récupérer la liste des matières
 */
const useMatieresData = (ecoleId = 139) => {
    const [matieres, setMatieres] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchMatieres = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.matieres.getByEcoleViaNiveauEnseignement());
            const formattedMatieres = (response.data || []).map(matiere => ({
                label: `${matiere.libelle} (${matiere.categorie?.libelle || 'N/A'})`,
                value: matiere.id,
                raw_data: matiere
            }));
            setMatieres(formattedMatieres);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des matières');
        } finally {
            setLoading(false);
        }
    }, [ecoleId]);

    useEffect(() => {
        fetchMatieres();
    }, [fetchMatieres]);

    return { matieres, loading, error, refetch: fetchMatieres };
};

/**
 * Hook pour récupérer la liste des professeurs
 */
const useProfesseursData = (ecoleId = 139, profil = 8) => {
    const [professeurs, setProfesseurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchProfesseurs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.personnel.getByEcoleAndProfil());
            const formattedProfesseurs = (response.data || []).map(professeur => ({
                label: `${professeur.nom || ''} ${professeur.prenom || ''}`.trim(),
                value: professeur.id,
                raw_data: professeur
            }));
            setProfesseurs(formattedProfesseurs);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des professeurs');
        } finally {
            setLoading(false);
        }
    }, [ecoleId, profil]);

    useEffect(() => {
        fetchProfesseurs();
    }, [fetchProfesseurs]);

    return { professeurs, loading, error, refetch: fetchProfesseurs };
};

/**
 * Hook pour récupérer les affectations existantes d'une classe
 */
const useClasseAffectationsData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAffectations = useCallback(async (classeId) => {
        if (!classeId) {
            setData([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                apiUrls.affectations.getProfesseurByClasse(classeId)
            );
            setData(response.data || []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des affectations');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, fetchAffectations };
};

/**
 * Modal d'affectation d'une matière à un professeur - Design inspiré d'EditAgentModal
 */
const AffecterMatiereProfesseurModal = ({ visible, onClose, onSuccess }) => {
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedProfesseur, setSelectedProfesseur] = useState(null);
    const [loading, setLoading] = useState(false);

    // Hooks pour récupérer les données
    const { classes, loading: classesLoading } = useClassesData();
    const { matieres, loading: matieresLoading } = useMatieresData();
    const { professeurs, loading: professeursLoading } = useProfesseursData();
    const { data: affectations, loading: affectationsLoading, fetchAffectations } = useClasseAffectationsData();
    const apiUrls = useAllApiUrls();
    const { ecoleId: dynamicEcoleId, personnelInfo: personnelInfo, academicYearId: dynamicAcademicYearId, periodicitieId: dynamicPeriodicitieId } = usePulsParams();


    const handleClasseChange = useCallback((classeId) => {
        setSelectedClasse(classeId);
        if (classeId) {
            fetchAffectations(classeId);
        }
    }, [fetchAffectations]);

    const handleSubmit = async () => {
        if (!selectedClasse || !selectedMatiere || !selectedProfesseur) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs requis',
                text: 'Veuillez sélectionner une classe, une matière et un professeur.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Confirmer l\'affectation',
            text: 'Êtes-vous sûr de vouloir créer cette affectation ?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, affecter',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);

            // Récupérer les données complètes des objets sélectionnés
            const selectedClasseData = classes.find(classe => classe.value === selectedClasse)?.raw_data;
            const selectedMatiereData = matieres.find(matiere => matiere.value === selectedMatiere)?.raw_data;
            const selectedProfesseurData = professeurs.find(professeur => professeur.value === selectedProfesseur)?.raw_data;

            // Construire l'objet avec le nouveau format
            const affectationData = {
                matiere: {
                    id: selectedMatiereData?.id || selectedMatiere,
                    code: selectedMatiereData?.code || "",
                    libelle: selectedMatiereData?.libelle || ""
                },
                personnel: {
                    id: selectedProfesseurData?.id || selectedProfesseur,
                    nom: selectedProfesseurData?.nom || "",
                    prenom: selectedProfesseurData?.prenom || ""
                },
                classe: {
                    id: selectedClasseData?.id || selectedClasse,
                    code: selectedClasseData?.code || "",
                    libelle: selectedClasseData?.libelle || ""
                },
                annee: {
                    id: String(dynamicAcademicYearId)
                },
                user: String(personnelInfo?.id || personnelInfo?.userId)
            };

            const response = await axios.post(
                apiUrls.affectations.affecterMatiereProfesseur(),
                affectationData,
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
                    title: 'Affectation créée !',
                    text: 'L\'affectation a été créée avec succès.',
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                handleReset();
                onSuccess(response.data);
                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de la création de l\'affectation:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de la création.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations saisies.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Cette affectation existe déjà.';
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
                title: 'Erreur de création',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        handleReset();
        onClose();
    };

    const handleReset = () => {
        setSelectedClasse(null);
        setSelectedMatiere(null);
        setSelectedProfesseur(null);
    };

    useEffect(() => {
        if (visible) {
            handleReset();
        }
    }, [visible]);

    const tableData = affectations.map((affectation, index) => ({
        id: affectation.id || index,
        classe: affectation.classe?.libelle || 'N/A',
        matiere: affectation.matiere?.libelle || 'N/A',
        professeur: affectation.personnel ?
            `${affectation.personnel.nom || ''} ${affectation.personnel.prenom || ''}`.trim() : 'N/A'
    }));

    const isDataLoading = classesLoading || matieresLoading || professeursLoading;

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1' }) => (
        <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
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
            <Text style={{
                color: '#0f172a',
                fontWeight: '600',
                fontSize: '14px',
                lineHeight: '1.2'
            }}>
                {value || 'Non renseigné'}
            </Text>
        </div>
    );

    return (
        <Modal
            open={visible}
            onClose={handleCancel}
            size="lg"
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header moderne */}
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
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '18px',
                            border: '2px solid #e2e8f0'
                        }}
                    >
                        <FiPlus size={24} />
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            Affecter une matière à un professeur
                        </Text>
                        <Text size="sm" style={{ color: '#64748b' }}>
                            Créer une nouvelle affectation professeur-matière-classe
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUsers size={20} style={{ color: '#10b981' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Nouvelle Affectation
                        </Text>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{
                padding: '32px 24px',
                background: '#fafafa'
            }}>
                {/* Informations contextuelles */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Ressources disponibles
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
                    <Grid fluid className='mt-3'>
                        <Row gutter={16}>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiUsers}
                                    title="Classes"
                                    value={`${classes.length} disponible(s)`}
                                    color="#3b82f6"
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiBookOpen}
                                    title="Matières"
                                    value={`${matieres.length} disponible(s)`}
                                    color="#f59e0b"
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiUser}
                                    title="Professeurs"
                                    value={`${professeurs.length} disponible(s)`}
                                    color="#10b981"
                                />
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Formulaire d'affectation */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations de l'affectation
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
                    <Form disabled={loading || isDataLoading} fluid className='mt-3'>
                        <Grid fluid>

                            <Row gutter={16}>
                                <Col xs={8}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiUsers size={14} style={{ marginRight: '6px' }} />
                                            Classe <span style={{ color: '#ef4444' }}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={classes}
                                            value={selectedClasse}
                                            onChange={handleClasseChange}
                                            placeholder="Sélectionner une classe"
                                            searchable
                                            cleanable={false}
                                            loading={classesLoading}
                                            style={{ width: '100%' }}
                                            size="lg"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={8}>
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
                                            data={matieres}
                                            value={selectedMatiere}
                                            onChange={setSelectedMatiere}
                                            placeholder="Sélectionner la matière"
                                            searchable
                                            cleanable={false}
                                            loading={matieresLoading}
                                            style={{ width: '100%' }}
                                            size="lg"
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={8}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiUser size={14} style={{ marginRight: '6px' }} />
                                            Professeur <span style={{ color: '#ef4444' }}>*</span>
                                        </Form.ControlLabel>
                                        <SelectPicker
                                            data={professeurs}
                                            value={selectedProfesseur}
                                            onChange={setSelectedProfesseur}
                                            placeholder="Sélectionner un professeur"
                                            searchable
                                            cleanable={false}
                                            loading={professeursLoading}
                                            style={{ width: '100%' }}
                                            size="lg"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Grid>

                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '8px',
                            padding: '16px',
                            marginTop: '16px',
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
                                Cette affectation permet d'assigner un professeur à une matière spécifique pour une classe donnée. Assurez-vous que le professeur a les compétences requises pour enseigner cette matière.
                            </Text>
                        </div>
                    </Form>
                </Panel>

                {/* Affectations existantes */}
                <Panel
                    header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                Affectations existantes
                            </Text>
                            {selectedClasse && (
                                <Badge style={{
                                    background: '#10b981',
                                    color: 'white',
                                    fontSize: '12px'
                                }}>
                                    {tableData.length} affectation(s)
                                </Badge>
                            )}
                        </div>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    {affectationsLoading && (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <Loader size="md" />
                            <Text style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                                Chargement des affectations...
                            </Text>
                        </div>
                    )}

                    {!affectationsLoading && selectedClasse && (
                        <div className='mt-3' style={{
                            border: '1px solid #e5e5ea',
                            borderRadius: '8px',
                            overflow: 'hidden'
                        }}>
                            <Table
                                data={tableData}
                                autoHeight
                                bordered={false}

                            >
                                <Column width={150} align="center">
                                    <HeaderCell style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                        CLASSE
                                    </HeaderCell>
                                    <Cell dataKey="classe" style={{ fontSize: '13px' }} />
                                </Column>

                                <Column width={200} align="center">
                                    <HeaderCell style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                        MATIERE
                                    </HeaderCell>
                                    <Cell dataKey="matiere" style={{ fontSize: '13px' }} />
                                </Column>

                                <Column width={200} align="center">
                                    <HeaderCell style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                        PROFESSEUR
                                    </HeaderCell>
                                    <Cell dataKey="professeur" style={{ fontSize: '13px' }} />
                                </Column>
                            </Table>
                        </div>
                    )}

                    {!selectedClasse && !affectationsLoading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            backgroundColor: '#f8f9fa',
                            border: '1px dashed #dee2e6',
                            borderRadius: '8px',
                            color: '#6c757d'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                            <Text>Sélectionnez une classe pour voir les affectations existantes</Text>
                        </div>
                    )}

                    {selectedClasse && !affectationsLoading && tableData.length === 0 && (
                        <div className='mt-3' style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '8px',
                            color: '#856404'
                        }}>
                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📋</div>
                            <Text>Aucune affectation trouvée pour cette classe</Text>
                        </div>
                    )}
                </Panel>

                {/* Indicateur de chargement global */}
                {isDataLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: '16px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <Loader size="lg" />
                            <Text style={{ marginTop: 8, color: '#666' }}>
                                Chargement des données...
                            </Text>
                        </div>
                    </div>
                )}
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
                        onClick={handleCancel}
                        startIcon={<FiX />}
                        disabled={loading}
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
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={isDataLoading || !selectedClasse || !selectedMatiere || !selectedProfesseur}
                        startIcon={<FiCheck />}
                        style={{
                            background: loading ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                    >
                        {loading ? 'Enregistrement en cours...' : 'Enregistrer'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default AffecterMatiereProfesseurModal;