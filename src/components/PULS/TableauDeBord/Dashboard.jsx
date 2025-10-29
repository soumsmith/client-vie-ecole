import React, { useState, useEffect, useCallback } from 'react';
import {
    Panel,
    Row,
    Col,
    Badge,
    Loader,
    Message,
    Button,
    Modal,
    Input,
    Nav,
    Progress,
    Tag,
    InputGroup,
    Grid,
    DatePicker
} from 'rsuite';
import {
    FiClock,
    FiBookOpen,
    FiUsers,
    FiCalendar,
    FiEdit3,
    FiEye,
    FiTrendingUp,
    FiRefreshCw,
    FiBook,
    FiHome,
    FiStar,
    FiSearch,
    FiGrid,
    FiCheckCircle,
    FiAlertCircle
} from 'react-icons/fi';
import getFullUrl from "../../hooks/urlUtils";
import { useAllApiUrls } from '../utils/apiConfig';
import axios from "axios";
import ClassCard from '../card/ClassCard';
import { useSeancesByDateProf, useSeancesStatistics, formatDateForAPI } from './useSeancesByDateProf.jsx';
import { usePulsParams } from '../../hooks/useDynamicParams';
import InfoStatCard from '../card/InfoStatCard';
import ActivityCard from '../card/Activitycard.jsx';

/**
 * Composant de détails de classe
 */
const ClassDetails = ({ classe }) => {
    if (!classe) return null;

    const progressValue = classe.evaluationsCount ? (classe.evaluationsCount / 30) * 100 : 0;

    return (
        <Panel
            header={`Détails de la classe ${classe.libelle}`}
            bordered
            style={{
                borderRadius: '12px',
                border: '2px solid #007bff20',
                background: 'white'
            }}
        >
            <div style={{ padding: '20px' }}>
                <Row gutter={20}>
                    <Col xs={24} md={8}>
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            background: '#f8f9ff',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '700',
                                color: '#007bff',
                                marginBottom: '8px'
                            }}>
                                {classe.effectif}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                Effectif total
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={8}>
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            background: '#f0fff4',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '700',
                                color: '#28a745',
                                marginBottom: '8px'
                            }}>
                                {classe.evaluationsCount || 0}
                            </div>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                Évaluations effectuées
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} md={8}>
                        <div style={{
                            textAlign: 'center',
                            padding: '20px',
                            background: '#fffbf0',
                            borderRadius: '12px',
                            marginBottom: '16px'
                        }}>
                            <div style={{
                                fontSize: '36px',
                                fontWeight: '700',
                                color: '#ffc107',
                                marginBottom: '8px'
                            }}>
                                N/A
                            </div>
                            <div style={{ fontSize: '14px', color: '#6c757d' }}>
                                Séances effectuées
                            </div>
                        </div>
                    </Col>
                </Row>

                <div style={{ marginTop: '24px' }}>
                    <h5 style={{ marginBottom: '16px', color: '#2c3e50' }}>
                        Matière enseignée: {classe.matiere?.libelle || 'Non définie'}
                    </h5>

                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '14px', color: '#6c757d' }}>
                            Progression du programme
                        </span>
                        <span style={{ fontSize: '14px', color: '#6c757d' }}>
                            {Math.round(progressValue)}%
                        </span>
                    </div>
                    <Progress.Line
                        percent={progressValue}
                        strokeColor="#007bff"
                        trailColor="#e9ecef"
                        strokeWidth={8}
                    />

                    <div style={{
                        marginTop: '16px',
                        display: 'flex',
                        gap: '12px',
                        flexWrap: 'wrap'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#28a74515',
                            padding: '8px 12px',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#28a745',
                                marginRight: '8px'
                            }} />
                            <span style={{ fontSize: '12px', color: '#28a745' }}>
                                Heures enseignées
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#007bff15',
                            padding: '8px 12px',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#007bff',
                                marginRight: '8px'
                            }} />
                            <span style={{ fontSize: '12px', color: '#007bff' }}>
                                Heures restantes
                            </span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            background: '#dc354515',
                            padding: '8px 12px',
                            borderRadius: '6px'
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#dc3545',
                                marginRight: '8px'
                            }} />
                            <span style={{ fontSize: '12px', color: '#dc3545' }}>
                                Absences
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Panel>
    );
};

/**
 * Modal Cahier de texte
 */
const CahierModal = ({ show, onClose, seance }) => {
    const [observations, setObservations] = useState('');

    if (!seance) return null;

    return (
        <Modal open={show} onClose={onClose} size="lg">
            <Modal.Header>
                <Modal.Title>Cahier de texte - {seance.classe.libelle}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div style={{ padding: '20px' }}>
                    <Row gutter={20}>
                        <Col xs={24} md={12}>
                            <div style={{
                                background: '#f8f9fa',
                                padding: '20px',
                                borderRadius: '8px',
                                marginBottom: '20px'
                            }}>
                                <Badge content="Année 2024 - 2025" />
                                <div style={{ marginTop: '16px' }}>
                                    <div><strong>Date:</strong> {seance.dateSeanceFormatted}</div>
                                    <div><strong>Niveau:</strong> {seance.classe.niveau}</div>
                                    <div><strong>Classe:</strong> {seance.classe.libelle}</div>
                                    <div><strong>Matière:</strong> {seance.matiere.libelle}</div>
                                    <div><strong>Horaire:</strong> {seance.heureDeb} - {seance.heureFin}</div>
                                    <div><strong>Durée:</strong> {seance.duree} minutes</div>
                                </div>
                            </div>
                        </Col>

                        <Col xs={24} md={12}>
                            <h5>Observations</h5>
                            <Input
                                as="textarea"
                                rows={6}
                                placeholder="Saisir vos observations..."
                                value={observations}
                                onChange={setObservations}
                                style={{ marginBottom: '20px' }}
                            />
                        </Col>
                    </Row>

                    <div style={{ marginTop: '20px' }}>
                        <h5 style={{ marginBottom: '12px' }}>Progression des leçons</h5>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>PÉRIODE</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>DÉBUT</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>FIN</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>N°</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>TITRE DE LA LEÇON</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>HEURES</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td colSpan={6} style={{
                                        padding: '24px',
                                        textAlign: 'center',
                                        color: '#6c757d',
                                        border: '1px solid #dee2e6'
                                    }}>
                                        Aucune leçon enregistrée pour cette séance
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Fermer
                </Button>
                <Button appearance="primary">
                    Enregistrer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

/**
 * Composant de statistiques des séances
 */
const SeancesStats = ({ stats }) => {
    return (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={6}>
                <InfoStatCard value={stats.total} label="Séances du jour" color="#764ba2" bgColor="#fdecfc" />
            </Col>
            <Col xs={24} sm={6}>
                <InfoStatCard value={stats.terminees} label="Terminées" color="#28a745" bgColor="#ecfdf5" />
            </Col>
            <Col xs={24} sm={6}>
                <InfoStatCard value={stats.enCours} label="En cours" color="#ffc107" bgColor="#fff6da" />
            </Col>
            <Col xs={24} sm={6}>
                <InfoStatCard value={stats.aVenir} label="A venir" color="#138496" bgColor="#e0fbff" />
            </Col>
        </Row>
    );
};

/**
 * Composant principal du tableau de bord professeur
 */
const TeacherDashboard = () => {
    const [activeTab, setActiveTab] = useState('activities');
    const [selectedClass, setSelectedClass] = useState(null);
    const [showCahierModal, setShowCahierModal] = useState(false);
    const [selectedSeance, setSelectedSeance] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [classes, setClasses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));


    const [professor, setProfessor] = useState({
        id: null,
        nom: "Professeur",
        prenom: "Utilisateur"
    });

    const apiUrls = useAllApiUrls();
    const { userId } = usePulsParams();

    // Récupérer les séances avec le hook personnalisé
    const {
        seances,
        loading: seancesLoading,
        error: seancesError,
        refetch: refetchSeances
    } = useSeancesByDateProf(
        professor.id || userId,
        formatDateForAPI(selectedDate),
        refreshTrigger
    );

    // Calculer les statistiques des séances
    const stats = useSeancesStatistics(seances);

    // Fonction pour charger les classes depuis l'API
    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.get(apiUrls.classes.listByEcoleSorted());

            const mappedClasses = response.data && Array.isArray(response.data)
                ? response.data.map(item => ({
                    id: item.id,
                    libelle: item.libelle,
                    code: item.code,
                    effectif: item.effectif,
                    visible: item.visible,
                    branche: item.branche,
                    ecole: item.ecole,
                    dateCreation: item.dateCreation,
                    dateUpdate: item.dateUpdate,
                    niveau: item.branche?.niveau?.libelle || 'Non défini',
                    programme: item.branche?.programme?.libelle || 'Non défini',
                    niveauEnseignement: item.branche?.niveauEnseignement?.libelle || 'Non défini',
                    ordre: item.branche?.niveau?.ordre || 999,
                    matiere: item.matiere || { libelle: 'Non définie' },
                    evaluationsCount: 0
                }))
                : [];

            mappedClasses.sort((a, b) => a.ordre - b.ordre);
            setClasses(mappedClasses);

            // Extraire les informations du professeur depuis la première séance
            if (seances.length > 0 && seances[0].professeur) {
                setProfessor({
                    id: seances[0].professeur.id,
                    nom: seances[0].professeur.nom,
                    prenom: seances[0].professeur.prenom
                });
            }
        } catch (err) {
            console.error('Erreur lors du chargement des classes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [apiUrls, seances]);

    // Charger les données au montage du composant
    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    const handleOpenCahier = (seance) => {
        setSelectedSeance(seance);
        setShowCahierModal(true);
    };

    const handleSelectClass = (classe) => {
        setSelectedClass(classe);
    };

    const handleRefresh = () => {
        setRefreshTrigger(prev => prev + 1);
        fetchClasses();
    };

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setRefreshTrigger(prev => prev + 1);
    };

    // Filtrage des classes
    const filteredClasses = classes.filter(classe =>
        classe.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classe.niveau.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const selectedDateFormatted = selectedDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div style={{
            minHeight: '100vh',
            padding: '20px',
        }}>
            <div className="container-fluid">
                {/* En-tête */}
                <div className={`ecole-id-${academicYear?.niveauEnseignement?.id || ''} dashboard-head-card-${academicYear?.niveauEnseignement?.libelle.replace(/[\s()]/g, '')}`} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    padding: '20px 30px',
                    borderRadius: '15px',
                    color: 'white !important'
                }}>
                    <div className='text-white'>
                        <h2 style={{
                            margin: '0 0 5px 0',
                            fontWeight: '700',
                            fontSize: '28px'
                        }}>
                            Dashboard du professeur
                        </h2>
                        <p style={{
                            margin: 0,
                            fontSize: '16px',
                            fontStyle: 'italic'
                        }}>
                            Bienvenue, {professor.prenom} {professor.nom}
                        </p>
                    </div>
                    <Button
                        appearance="primary"
                        startIcon={<FiRefreshCw />}
                        onClick={handleRefresh}
                        loading={loading || seancesLoading}
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '8px'
                        }}
                    >
                        Actualiser
                    </Button>
                </div>

                {/* Message d'erreur */}
                {(error || seancesError) && (
                    <Message type="error" showIcon style={{ marginBottom: '20px' }}>
                        Erreur lors du chargement des données: {error || seancesError?.message}
                    </Message>
                )}

                {/* Navigation */}
                <Nav
                    appearance="tabs"
                    activeKey={activeTab}
                    onSelect={setActiveTab}
                    style={{
                        marginBottom: '30px',
                        background: 'white',
                        borderRadius: '12px',
                        padding: '5px'
                    }}
                >
                    <Nav.Item eventKey="activities" icon={<FiCalendar />}>
                        Mes activités
                    </Nav.Item>
                    <Nav.Item eventKey="classes" icon={<FiBookOpen />}>
                        Mes classes
                    </Nav.Item>
                </Nav>

                {/* Contenu selon l'onglet actif */}
                {activeTab === 'activities' && (
                    <div>
                        {/* Sélecteur de date */}
                        <Panel
                            style={{
                                marginBottom: '24px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                background: 'white'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiCalendar size={20} style={{ color: '#6b7280' }} />
                                <span style={{ fontWeight: '500', color: '#374151' }}>Sélectionner une date:</span>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={handleDateChange}
                                    format="dd/MM/yyyy"
                                    placeholder="Sélectionner une date"
                                    style={{ width: '200px' }}
                                />
                                <Button
                                    size="sm"
                                    onClick={() => handleDateChange(new Date())}
                                    style={{ marginLeft: 'auto' }}
                                >
                                    Aujourd'hui
                                </Button>
                            </div>
                        </Panel>

                        {/* Statistiques des séances */}
                        <SeancesStats stats={stats} />

                        {/* Titre avec date */}
                        <h3 style={{
                            color: '#2c3e50',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FiClock style={{ marginRight: '8px' }} />
                            Mon emploi du temps - {selectedDateFormatted}
                        </h3>

                        {/* État de chargement */}
                        {seancesLoading && (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Loader size="lg" content="Chargement des séances..." />
                            </div>
                        )}

                        {/* Liste des séances */}
                        {!seancesLoading && seances.length === 0 ? (
                            <Panel bordered style={{
                                borderRadius: '12px',
                                textAlign: 'center',
                                padding: '40px',
                                background: 'white'
                            }}>
                                <FiCalendar size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                                <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>
                                    Aucune activité prévue
                                </h3>
                                <p style={{ color: '#9ca3af' }}>
                                    Vous n'avez aucune séance programmée pour cette date
                                </p>
                            </Panel>
                        ) : (
                            !seancesLoading && seances.map((seance) => (
                                <ActivityCard
                                    key={seance.id}
                                    seance={seance}
                                    onOpenCahier={handleOpenCahier}
                                />
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'classes' && (
                    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                        {/* Barre de recherche */}
                        <Panel
                            style={{
                                marginBottom: '24px',
                                borderRadius: '8px',
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                                background: 'white'
                            }}
                        >
                            <InputGroup style={{ width: '100%' }}>
                                <Input
                                    placeholder="Rechercher une classe..."
                                    value={searchTerm}
                                    onChange={setSearchTerm}
                                    style={{
                                        height: '44px',
                                        fontSize: '16px',
                                        border: 'none'
                                    }}
                                />
                                <InputGroup.Addon style={{
                                    background: '#f9fafb',
                                    border: 'none',
                                    color: '#6b7280'
                                }}>
                                    <FiSearch />
                                </InputGroup.Addon>
                            </InputGroup>
                        </Panel>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '40px' }}>
                                <Loader size="lg" content="Chargement des classes..." />
                            </div>
                        ) : (
                            <Row gutter={20}>
                                {/* Liste des classes */}
                                <Col xs={24} lg={selectedClass ? 14 : 24}>
                                    <h3 style={{
                                        color: '#2c3e50',
                                        marginBottom: '20px',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <FiBookOpen style={{ marginRight: '8px' }} />
                                        Mes classes ({filteredClasses.length})
                                    </h3>

                                    {filteredClasses.length === 0 ? (
                                        <Panel bordered style={{
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            padding: '64px 0',
                                            background: 'white'
                                        }}>
                                            <FiGrid size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                                            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>
                                                Aucune classe trouvée
                                            </h3>
                                            <p style={{ color: '#9ca3af' }}>
                                                {searchTerm ? 'Essayez de modifier votre recherche' : 'Aucune classe disponible'}
                                            </p>
                                        </Panel>
                                    ) : (
                                        <Grid fluid>
                                            <Row gutter={16}>
                                                {filteredClasses.map((classe) => (
                                                    <Col
                                                        key={classe.id}
                                                        xs={24}
                                                        sm={12}
                                                        md={selectedClass ? 12 : 8}
                                                        lg={selectedClass ? 12 : 6}
                                                    >
                                                        <ClassCard
                                                            classe={classe}
                                                            onClick={() => handleSelectClass(classe)}
                                                            borderColor="#e2e8f0"
                                                            accentColor="#3b82f6"
                                                            size="medium"
                                                            showArrow={false}
                                                            hoverable={true}
                                                            isSelected={selectedClass?.id === classe.id}
                                                        />
                                                    </Col>
                                                ))}
                                            </Row>
                                        </Grid>
                                    )}
                                </Col>

                                {/* Détails de la classe sélectionnée */}
                                {selectedClass && (
                                    <Col xs={24} lg={10}>
                                        <ClassDetails classe={selectedClass} />
                                    </Col>
                                )}
                            </Row>
                        )}
                    </div>
                )}
            </div>

            {/* Modal Cahier de texte */}
            <CahierModal
                show={showCahierModal}
                onClose={() => setShowCahierModal(false)}
                seance={selectedSeance}
            />
        </div>
    );
};

export default TeacherDashboard;