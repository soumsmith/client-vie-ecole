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
    Tag
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
    FiStar
} from 'react-icons/fi';
import getFullUrl from "./hooks/urlUtils";


// Configuration de l'API
const API_CONFIG = {
    params: {
        annee: 226,
        prof: 158,
        ecole: 38
    }
};

// Données simulées pour les séances
const mockSeances = [
    {
        id: "6b33e746-625f-444c-ad3b-441b3df4c177",
        heureDeb: "09:10",
        heureFin: "10:00",
        matiere: { libelle: "ANGLAIS" },
        classe: { libelle: "6EME F" },
        salle: { libelle: "Salle A6" },
        isEnded: true
    },
    {
        id: "another-id",
        heureDeb: "11:05",
        heureFin: "11:55",
        matiere: { libelle: "ANGLAIS" },
        classe: { libelle: "6EME J" },
        salle: { libelle: "Salle A8" },
        isEnded: false
    },
    {
        id: "third-id",
        heureDeb: "15:00",
        heureFin: "15:50",
        matiere: { libelle: "ANGLAIS" },
        classe: { libelle: "4EME B" },
        salle: { libelle: "Salle A5" },
        isEnded: false
    }
];

/**
 * Composant de carte d'activité (séance)
 */
const ActivityCard = ({ seance, onOpenCahier }) => {
    const getStatusColor = () => {
        return seance.isEnded ? '#6c757d' : '#28a745';
    };

    const getStatusText = () => {
        return seance.isEnded ? 'Terminé' : 'En cours / À venir';
    };

    return (
        <Panel
            bordered
            style={{
                borderRadius: '12px',
                border: `2px solid ${seance.isEnded ? '#e9ecef' : '#28a74520'}`,
                background: seance.isEnded ? '#f8f9fa' : 'white',
                marginBottom: '16px',
                transition: 'all 0.3s ease'
            }}
        >
            <div style={{ padding: '20px' }}>
                <Row gutter={16}>
                    <Col xs={24} sm={6}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: getStatusColor() + '15',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '12px'
                        }}>
                            <FiClock size={24} color={getStatusColor()} />
                            <div style={{ marginLeft: '8px', textAlign: 'center' }}>
                                <div style={{
                                    fontSize: '18px',
                                    fontWeight: '600',
                                    color: getStatusColor()
                                }}>
                                    {seance.heureDeb} - {seance.heureFin}
                                </div>
                            </div>
                        </div>
                    </Col>

                    <Col xs={24} sm={12}>
                        <div style={{ marginBottom: '8px' }}>
                            <Tag color="blue" style={{ marginRight: '8px' }}>
                                {seance.matiere.libelle}
                            </Tag>
                            <Tag color="green">
                                {seance.classe.libelle}
                            </Tag>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            marginBottom: '8px',
                            color: '#6c757d'
                        }}>
                            <FiHome size={16} style={{ marginRight: '6px' }} />
                            <span>{seance.salle.libelle}</span>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: getStatusColor()
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: getStatusColor(),
                                marginRight: '6px'
                            }} />
                            <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                {getStatusText()}
                            </span>
                        </div>
                    </Col>

                    <Col xs={24} sm={6}>
                        <div style={{
                            display: 'flex',
                            gap: '8px',
                            justifyContent: 'flex-end',
                            alignItems: 'center',
                            height: '100%'
                        }}>
                            <Button
                                size="sm"
                                appearance="primary"
                                style={{
                                    background: '#007bff',
                                    border: 'none',
                                    borderRadius: '6px'
                                }}
                                onClick={() => onOpenCahier(seance)}
                            >
                                Cahier de texte
                            </Button>
                            <Button
                                size="sm"
                                appearance="subtle"
                                style={{ borderRadius: '6px' }}
                            >
                                Appel
                            </Button>
                        </div>
                    </Col>
                </Row>
            </div>
        </Panel>
    );
};

/**
 * Composant de carte de classe
 */
const ClassCard = ({ classe, onSelectClass, isSelected }) => {
    const progressValue = classe.evaluationsCount ? (classe.evaluationsCount / 30) * 100 : 0;

    return (
        <Panel
            bordered
            className={`mb-3 ${isSelected ? "card-selected" : "card-default"}`}
            style={{
                borderRadius: "12px",
                background: isSelected ? "rgb(240, 255, 244)" : "white",
                cursor: "pointer",
                transition: "all 0.3s ease",
                height: "200px"
            }}
            onClick={() => onSelectClass(classe)}
        >
            <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px'
                }}>
                    <h4 style={{
                        margin: 0,
                        color: '#2c3e50',
                        fontSize: '18px',
                        fontWeight: '600'
                    }}>
                        {classe.libelle}
                    </h4>
                    <Tag color="blue">{classe.matiere.libelle}</Tag>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '12px',
                    color: '#6c757d'
                }}>
                    <FiUsers size={16} style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '16px', fontWeight: '500' }}>
                        Effectif: {classe.effectif}
                    </span>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '16px',
                    color: '#6c757d'
                }}>
                    <FiEdit3 size={16} style={{ marginRight: '8px' }} />
                    <span style={{ fontSize: '14px' }}>
                        Évaluations: {classe.evaluationsCount || 0}
                    </span>
                </div>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '8px'
                    }}>
                        <span style={{ fontSize: '12px', color: '#6c757d' }}>
                            Progression
                        </span>
                        <span style={{ fontSize: '12px', color: '#6c757d' }}>
                            {Math.round(progressValue)}%
                        </span>
                    </div>
                </div>
            </div>
        </Panel>
    );
};

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
                        Matière enseignée: {classe.matiere.libelle}
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
                                    <div><strong>Niveau:</strong> 6EME</div>
                                    <div><strong>Classe:</strong> {seance.classe.libelle}</div>
                                    <div><strong>Matière:</strong> {seance.matiere.libelle}</div>
                                    <div><strong>Horaire:</strong> {seance.heureDeb} - {seance.heureFin}</div>
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
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f8f9fa' }}>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>PÉRIODE</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>DÉBUT</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>FIN</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>NUMÉRO TITRE</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>TITRE DE LA LEÇON</th>
                                    <th style={{ padding: '12px', border: '1px solid #dee2e6', textAlign: 'left' }}>NBRE HEURE</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>Premier Trimestre</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>09/09/2024</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>29/11/2024</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>1</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>Les salutations (Greetings)</td>
                                    <td style={{ padding: '12px', border: '1px solid #dee2e6' }}>3</td>
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
    const [professor, setProfessor] = useState({
        nom: "Professeur",
        prenom: "Utilisateur"
    });

    // Fonction pour charger les données de l'API
    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const url = `${getFullUrl()}/personnel-matiere-classe/get-by-prof?annee=${API_CONFIG.params.annee}&prof=${API_CONFIG.params.prof}&ecole=${API_CONFIG.params.ecole}`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Mapper les données de l'API vers le format attendu
            const mappedClasses = data.map(item => ({
                id: item.classe.id,
                libelle: item.classe.libelle,
                effectif: item.classe.effectif,
                matiere: {
                    libelle: item.matiere.libelle
                },
                evaluationsCount: 0, // Cette donnée n'est pas fournie par l'API
                branche: item.classe.branche?.libelle || 'N/A',
                ecole: item.classe.ecole?.libelle || 'N/A'
            }));
            
            setClasses(mappedClasses);
            
            // Extraire les informations du professeur
            if (data.length > 0 && data[0].personnel) {
                setProfessor({
                    nom: data[0].personnel.nom,
                    prenom: data[0].personnel.prenom,
                    contact: data[0].personnel.contact
                });
            }
        } catch (err) {
            console.error('Erreur lors du chargement des classes:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

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
        fetchClasses();
    };

    const today = new Date().toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div style={{
            minHeight: '100vh',
            padding: '20px',
            background: '#f5f5f5'
        }}>
            <div className="container-fluid">
                {/* En-tête */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '30px',
                    background: 'rgba(52, 73, 94, 0.9)',
                    padding: '20px 30px',
                    borderRadius: '15px',
                    color: 'white'
                }}>
                    <div>
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
                        loading={loading}
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
                {error && (
                    <Message type="error" showIcon style={{ marginBottom: '20px' }}>
                        Erreur lors du chargement des données: {error}
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
                        <h3 style={{
                            color: '#2c3e50',
                            marginBottom: '20px',
                            display: 'flex',
                            alignItems: 'center'
                        }}>
                            <FiClock style={{ marginRight: '8px' }} />
                            Mon emploi du temps du jour - {today}
                        </h3>

                        {mockSeances.length === 0 ? (
                            <Panel bordered style={{ borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
                                <div style={{ color: '#6c757d' }}>
                                    Aucune activité prévue pour aujourd'hui
                                </div>
                            </Panel>
                        ) : (
                            mockSeances.map((seance) => (
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
                    <div>
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
                                        Mes classes ({classes.length})
                                    </h3>

                                    {classes.length === 0 ? (
                                        <Panel bordered style={{ borderRadius: '12px', textAlign: 'center', padding: '40px' }}>
                                            <div style={{ color: '#6c757d' }}>
                                                Aucune classe trouvée
                                            </div>
                                        </Panel>
                                    ) : (
                                        <Row gutter={16}>
                                            {classes.map((classe) => (
                                                <Col xs={24} sm={12} md={8} lg={selectedClass ? 12 : 8} key={classe.id}>
                                                    <ClassCard
                                                        classe={classe}
                                                        onSelectClass={handleSelectClass}
                                                        isSelected={selectedClass?.id === classe.id}
                                                    />
                                                </Col>
                                            ))}
                                        </Row>
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