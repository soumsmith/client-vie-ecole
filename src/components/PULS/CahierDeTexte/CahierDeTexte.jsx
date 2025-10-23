/**
 * Composant de routage pour les Cahiers de Texte - Version Light
 * Design épuré inspiré de l'emploi du temps - Navigation par écrans
 */

import React, { useState, useCallback } from 'react';
import {
    Panel,
    Grid,
    Row,
    Col,
    Input,
    InputGroup,
    Breadcrumb,
    Button,
    FlexboxGrid,
    Loader,
    Message,
    Notification,
    toaster
} from 'rsuite';
import {
    FiSearch,
    FiUsers,
    FiBook,
    FiArrowLeft,
    FiGrid,
    FiBookOpen
} from 'react-icons/fi';
import {
    useClassesListData,
    useMatieresByClasseData
} from './CahierDeTexteServiceManager';
import CahierDeTexteConsultation from './CahierDeTexteConsultation';
import ClassCard from '../card/ClassCard';
import MatiereCard from '../card/MatiereCard';
import { usePulsParams } from '../../hooks/useDynamicParams';
import getFullUrl from "../../hooks/urlUtils";

const CahierDeTexteRouter = ({
    primaryColor = '#3b82f6',
}) => {
    // Récupérer l'ID de l'utilisateur connecté dynamiquement
    const { userId } = usePulsParams();
    const [currentView, setCurrentView] = useState('list');
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [matieresSearchTerm, setMatieresSearchTerm] = useState('');
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [lockStates, setLockStates] = useState({}); // Stocker les états de verrouillage

    // Chargement des données
    const { classes, loading: classesLoading, error: classesError, refetch: refetchClasses } = useClassesListData(refreshTrigger);
    const { matieres, loading: matieresLoading, error: matieresError, refetch: refetchMatieres } = useMatieresByClasseData(
        selectedClasse?.id,
        refreshTrigger
    );

    // Fonction pour verrouiller/déverrouiller un cahier via l'API
    const handleVerrouillerCahier = async (matiere, shouldLock) => {
        // Vérifier que userId est disponible
        if (!userId) {
            toaster.push(
                <Notification type="error" header="Erreur" closable>
                    Impossible d'identifier l'utilisateur connecté
                </Notification>,
                { placement: 'topEnd', duration: 5000 }
            );
            return false;
        }

        try {
            // Déterminer l'endpoint selon l'action
            const action = shouldLock ? 'lock' : 'unlock';
            const matiereId = matiere.id;

            // Construire l'URL de l'API avec l'userId dynamique
            const url = `${getFullUrl()}/locks/TEXTBOOK/${matiereId}/${action}?actor=${userId}`;

            // Mettre à jour l'état local de manière optimiste
            setLockStates(prev => ({
                ...prev,
                [matiereId]: shouldLock
            }));

            // Appel API
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                // Annuler la mise à jour optimiste en cas d'erreur
                setLockStates(prev => ({
                    ...prev,
                    [matiereId]: !shouldLock
                }));
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ API Response:', data); // Debug

            // Confirmer l'état avec la réponse du serveur
            setLockStates(prev => ({
                ...prev,
                [matiereId]: data.isLocked
            }));

            // Afficher une notification de succès
            toaster.push(
                <Notification type="success" header="Succès" closable>
                    {data.message || `Cahier ${data.isLocked ? 'verrouillé' : 'déverrouillé'} avec succès`}
                </Notification>,
                { placement: 'topEnd', duration: 3000 }
            );

            // Forcer le rafraîchissement des matières pour synchroniser avec le serveur
            setTimeout(() => {
                refetchMatieres();
            }, 500);

            return true; // Succès
        } catch (error) {
            console.error('❌ Erreur lors du verrouillage/déverrouillage:', error);

            // Afficher une notification d'erreur
            toaster.push(
                <Notification type="error" header="Erreur" closable>
                    Une erreur est survenue lors de l'opération. Veuillez réessayer.
                </Notification>,
                { placement: 'topEnd', duration: 5000 }
            );

            return false; // Échec
        }
    };

    // Navigation
    const handleClasseClick = (classe) => {
        setSelectedClasse(classe);
        setCurrentView('detail');
    };

    const handleBackToList = () => {
        setCurrentView('list');
        setSelectedClasse(null);
        setSelectedMatiere(null);
        setLockStates({}); // Réinitialiser les états de verrouillage
    };

    const handleBackToDetail = () => {
        setCurrentView('detail');
        setSelectedMatiere(null);
    };

    // Gestion des actions sur les matières
    const handleOuvrirCahier = (matiere) => {
        setSelectedMatiere(matiere);
        setCurrentView('cahier');
    };

    // Filtrage des classes
    const filteredClasses = classes.filter(classe =>
        classe.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        classe.niveau.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Filtrage des matières
    const filteredMatieres = matieres.filter(matiere =>
        matiere.matiereLibelle.toLowerCase().includes(matieresSearchTerm.toLowerCase()) ||
        matiere.professorLibelle.toLowerCase().includes(matieresSearchTerm.toLowerCase())
    );

    // Vue liste des classes
    if (currentView === 'list') {
        return (
            <div style={{ padding: '24px', background: '#fafafa', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Header */}
                    <div style={{ marginBottom: '24px' }}>
                        <h2 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: '#374151',
                            margin: '0 0 8px 0'
                        }}>
                            Liste des classes - Cahiers de texte
                        </h2>
                        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
                            Consultez et gérez les cahiers de texte de toutes vos classes
                        </p>
                    </div>

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
                                placeholder="Filtrer par libellé"
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

                    {/* État de chargement */}
                    {classesLoading && (
                        <div style={{ textAlign: 'center', padding: '64px 0' }}>
                            <Loader size="lg" content="Chargement des classes..." />
                        </div>
                    )}

                    {/* Gestion d'erreur */}
                    {classesError && (
                        <Message type="error" style={{ marginBottom: '24px' }}>
                            <strong>Erreur:</strong> {classesError.message}
                            <div style={{ marginTop: '8px' }}>
                                <Button size="sm" onClick={() => refetchClasses()}>
                                    Réessayer
                                </Button>
                            </div>
                        </Message>
                    )}

                    {/* Grille des classes */}
                    {!classesLoading && !classesError && (
                        <Grid fluid>
                            <Row gutter={16}>
                                {filteredClasses.map((classe) => (
                                    <Col key={classe.id} xs={24} sm={12} md={8} lg={6}>
                                        <ClassCard
                                            classe={classe}
                                            onClick={() => handleClasseClick(classe)}
                                            borderColor="#e2e8f0"
                                            accentColor={primaryColor}
                                            size="medium"
                                            showArrow={true}
                                            hoverable={true}
                                        />
                                    </Col>
                                ))}
                            </Row>
                        </Grid>
                    )}

                    {/* Message aucune classe */}
                    {!classesLoading && !classesError && filteredClasses.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '64px 0' }}>
                            <FiGrid size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Aucune classe trouvée</h3>
                            <p style={{ color: '#9ca3af' }}>
                                {searchTerm ? 'Essayez de modifier votre recherche' : 'Aucune classe disponible'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vue détail d'une classe avec les matières
    if (currentView === 'detail') {
        return (
            <div style={{ padding: '24px', background: '#fafafa', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Breadcrumb */}
                    <Breadcrumb style={{ marginBottom: '24px' }}>
                        <Breadcrumb.Item
                            onClick={handleBackToList}
                            style={{ cursor: 'pointer', color: '#374151' }}
                        >
                            <FiArrowLeft style={{ marginRight: '8px' }} />
                            Classes
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>
                            Liste des cahiers de texte
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Header avec informations de classe */}
                    <Panel
                        style={{
                            marginBottom: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            background: 'white'
                        }}
                    >
                        <FlexboxGrid justify="space-between" align="middle">
                            <FlexboxGrid.Item>
                                <h2 style={{
                                    fontSize: '24px',
                                    fontWeight: '600',
                                    margin: '0 0 8px 0',
                                    color: '#374151'
                                }}>
                                    Liste des cahiers de texte
                                </h2>
                                <div style={{ display: 'flex', gap: '24px', color: '#6b7280' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FiBook size={16} />
                                        <span>{selectedClasse?.libelle}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <FiUsers size={16} />
                                        <span>{selectedClasse?.effectif} élèves</span>
                                    </div>
                                </div>
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item>
                                <Button
                                    size="sm"
                                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                                    loading={matieresLoading}
                                    style={{
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        background: 'white'
                                    }}
                                >
                                    Actualiser
                                </Button>
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                    </Panel>

                    {/* Barre de recherche pour filtrer les matières */}
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
                                placeholder="Filtrer par matière ou professeur"
                                value={matieresSearchTerm}
                                onChange={setMatieresSearchTerm}
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

                    {/* État de chargement des matières */}
                    {matieresLoading && (
                        <div style={{ textAlign: 'center', padding: '64px 0' }}>
                            <Loader size="lg" content="Chargement des matières..." />
                        </div>
                    )}

                    {/* Gestion d'erreur des matières */}
                    {matieresError && (
                        <Message type="error" style={{ marginBottom: '24px' }}>
                            <strong>Erreur:</strong> {matieresError.message}
                            <div style={{ marginTop: '8px' }}>
                                <Button size="sm" onClick={() => refetchMatieres()}>
                                    Réessayer
                                </Button>
                            </div>
                        </Message>
                    )}

                    {/* Grille des matières */}
                    {!matieresLoading && !matieresError && filteredMatieres.length > 0 && (
                        <Grid fluid>
                            <Row gutter={16}>
                                {filteredMatieres.map((matiere) => {
                                    // Utiliser l'état local en priorité, sinon la valeur du serveur
                                    const currentLockState = lockStates.hasOwnProperty(matiere.id)
                                        ? lockStates[matiere.id]
                                        : (matiere.isLocked ?? false);

                                    return (
                                        <Col key={matiere.id} xs={24} sm={12} md={6}>
                                            <MatiereCard
                                                matiere={matiere}
                                                onOuvrirCahier={handleOuvrirCahier}
                                                onVerrouillerCahier={handleVerrouillerCahier}
                                                isLocked={currentLockState}
                                                borderColor="#e2e8f0"
                                                accentColor={primaryColor}
                                                size="medium"
                                                hoverable={true}
                                            />
                                        </Col>
                                    );
                                })}
                            </Row>
                        </Grid>
                    )}

                    {/* Message aucune matière */}
                    {!matieresLoading && !matieresError && filteredMatieres.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '64px 0' }}>
                            <FiBookOpen size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                            <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Aucune matière trouvée</h3>
                            <p style={{ color: '#9ca3af' }}>
                                {matieresSearchTerm ? 'Essayez de modifier votre recherche' : 'Cette classe n\'a pas encore de matières assignées'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Vue cahier de texte (écran complet)
    if (currentView === 'cahier') {
        return (
            <div style={{ padding: '24px', background: '#fafafa', minHeight: '100vh' }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                    {/* Breadcrumb */}
                    <Breadcrumb style={{ marginBottom: '24px' }}>
                        <Breadcrumb.Item
                            onClick={handleBackToList}
                            style={{ cursor: 'pointer', color: '#374151' }}
                        >
                            Classes
                        </Breadcrumb.Item>
                        <Breadcrumb.Item
                            onClick={handleBackToDetail}
                            style={{ cursor: 'pointer', color: '#374151' }}
                        >
                            <FiArrowLeft style={{ marginRight: '8px' }} />
                            {selectedClasse?.libelle}
                        </Breadcrumb.Item>
                        <Breadcrumb.Item active>
                            Cahier de Texte
                        </Breadcrumb.Item>
                    </Breadcrumb>

                    {/* Header */}
                    <Panel
                        style={{
                            marginBottom: '24px',
                            borderRadius: '8px',
                            border: '1px solid #e5e7eb',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                            background: 'white'
                        }}
                    >
                        <FlexboxGrid justify="space-between" align="middle">
                            <FlexboxGrid.Item>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        width: '50px',
                                        height: '50px',
                                        borderRadius: '12px',
                                        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    }}>
                                        <FiBookOpen size={24} style={{ color: 'white' }} />
                                    </div>
                                    <div>
                                        <h2 style={{
                                            fontSize: '24px',
                                            fontWeight: '600',
                                            margin: '0 0 4px 0',
                                            color: '#374151'
                                        }}>
                                            Progression des Séances
                                        </h2>
                                        <div style={{ fontSize: '14px', color: '#64748b' }}>
                                            {selectedMatiere?.matiere?.libelle} - {selectedClasse?.libelle}
                                        </div>
                                    </div>
                                </div>
                            </FlexboxGrid.Item>
                            <FlexboxGrid.Item>
                                <Button
                                    onClick={handleBackToDetail}
                                    startIcon={<FiArrowLeft />}
                                    style={{
                                        borderRadius: '6px'
                                    }}
                                >
                                    Retour
                                </Button>
                            </FlexboxGrid.Item>
                        </FlexboxGrid>
                    </Panel>

                    {/* Composant de consultation du cahier intégré */}
                    <div>
                        <CahierDeTexteConsultation
                            selectedClasse={selectedClasse}
                            selectedMatiere={selectedMatiere}
                            refreshTrigger={refreshTrigger}
                            primaryColor={primaryColor}
                            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
                            embedded={true}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return null;
};

export default CahierDeTexteRouter;