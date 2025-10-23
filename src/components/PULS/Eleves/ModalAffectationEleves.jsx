import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Button,
    Loader,
    Panel,
    Grid,
    Row,
    Col,
    Text,
    Avatar,
    Badge,
    Input,
    InputGroup
} from 'rsuite';
import {
    FiUsers,
    FiUser,
    FiPlus,
    FiX,
    FiCheck,
    FiSearch,
    FiChevronRight,
    FiChevronLeft,
    FiChevronsRight,
    FiChevronsLeft
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';

/**
 * Hook pour récupérer les élèves à affecter
 */
const useElevesAAffecter = () => {
    const [elevesDisponibles, setElevesDisponibles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchElevesDisponibles = useCallback(async (brancheId, statut = 'VALIDEE') => {
        if (!brancheId) {
            setElevesDisponibles([]);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                apiUrls.inscriptions.retrieveToAttribClasse(brancheId, statut)
            );

            // L'API retourne déjà les élèves disponibles pour affectation
            setElevesDisponibles(response.data || []);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des élèves');
            setElevesDisponibles([]);
        } finally {
            setLoading(false);
        }
    }, [apiUrls.inscriptions]);

    return { elevesDisponibles, loading, error, fetchElevesDisponibles };
};

/**
 * Modal d'affectation d'élèves avec interface PickList moderne
 */
const ModalAffectationEleves = ({
    visible,
    onClose,
    onSuccess,
    selectedBranche,
    selectedClasse,
    classeInfo
}) => {
    const [elevesSource, setElevesSource] = useState([]);
    const [elevesTarget, setElevesTarget] = useState([]);
    const [selectedSource, setSelectedSource] = useState([]);
    const [selectedTarget, setSelectedTarget] = useState([]);
    const [searchSource, setSearchSource] = useState('');
    const [searchTarget, setSearchTarget] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const apiUrls = useAllApiUrls();

    const { elevesDisponibles, loading: loadingEleves, fetchElevesDisponibles } = useElevesAAffecter();

    // Charger les élèves disponibles quand le modal s'ouvre
    useEffect(() => {
        if (visible && selectedBranche) {
            fetchElevesDisponibles(selectedBranche, 'VALIDEE');
        }
    }, [visible, selectedBranche, fetchElevesDisponibles]);

    // Mettre à jour la source quand les données arrivent
    useEffect(() => {
        setElevesSource(elevesDisponibles);
        setElevesTarget([]);
        setSelectedSource([]);
        setSelectedTarget([]);
        setSearchSource('');
        setSearchTarget('');
    }, [elevesDisponibles]);

    // Filtrage des élèves
    const filteredSource = elevesSource.filter(inscription =>
        searchSource === '' ||
        inscription.eleve.matricule.toLowerCase().includes(searchSource.toLowerCase()) ||
        `${inscription.eleve.nom} ${inscription.eleve.prenom}`.toLowerCase().includes(searchSource.toLowerCase())
    );

    const filteredTarget = elevesTarget.filter(inscription =>
        searchTarget === '' ||
        inscription.eleve.matricule.toLowerCase().includes(searchTarget.toLowerCase()) ||
        `${inscription.eleve.nom} ${inscription.eleve.prenom}`.toLowerCase().includes(searchTarget.toLowerCase())
    );

    // Fonctions de déplacement
    const moveToTarget = () => {
        const newTarget = [...elevesTarget, ...selectedSource];
        const newSource = elevesSource.filter(item => !selectedSource.includes(item));
        setElevesTarget(newTarget);
        setElevesSource(newSource);
        setSelectedSource([]);
    };

    const moveToSource = () => {
        const newSource = [...elevesSource, ...selectedTarget];
        const newTarget = elevesTarget.filter(item => !selectedTarget.includes(item));
        setElevesSource(newSource);
        setElevesTarget(newTarget);
        setSelectedTarget([]);
    };

    const moveAllToTarget = () => {
        setElevesTarget([...elevesTarget, ...elevesSource]);
        setElevesSource([]);
        setSelectedSource([]);
    };

    const moveAllToSource = () => {
        setElevesSource([...elevesSource, ...elevesTarget]);
        setElevesTarget([]);
        setSelectedTarget([]);
    };

    // Gestion de la sélection multiple
    const handleSourceSelection = (inscription, event) => {
        event.preventDefault();
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (isCtrlPressed) {
            // Sélection/désélection avec Ctrl
            if (selectedSource.find(item => item.id === inscription.id)) {
                setSelectedSource(selectedSource.filter(item => item.id !== inscription.id));
            } else {
                setSelectedSource([...selectedSource, inscription]);
            }
        } else if (isShiftPressed && selectedSource.length > 0) {
            // Sélection de plage avec Shift
            const lastSelected = selectedSource[selectedSource.length - 1];
            const currentIndex = filteredSource.findIndex(item => item.id === inscription.id);
            const lastIndex = filteredSource.findIndex(item => item.id === lastSelected.id);

            const startIndex = Math.min(currentIndex, lastIndex);
            const endIndex = Math.max(currentIndex, lastIndex);

            const rangeSelection = filteredSource.slice(startIndex, endIndex + 1);
            setSelectedSource(rangeSelection);
        } else {
            // Sélection simple
            setSelectedSource([inscription]);
        }
    };

    const handleTargetSelection = (inscription, event) => {
        event.preventDefault();
        const isCtrlPressed = event.ctrlKey || event.metaKey;
        const isShiftPressed = event.shiftKey;

        if (isCtrlPressed) {
            // Sélection/désélection avec Ctrl
            if (selectedTarget.find(item => item.id === inscription.id)) {
                setSelectedTarget(selectedTarget.filter(item => item.id !== inscription.id));
            } else {
                setSelectedTarget([...selectedTarget, inscription]);
            }
        } else if (isShiftPressed && selectedTarget.length > 0) {
            // Sélection de plage avec Shift
            const lastSelected = selectedTarget[selectedTarget.length - 1];
            const currentIndex = filteredTarget.findIndex(item => item.id === inscription.id);
            const lastIndex = filteredTarget.findIndex(item => item.id === lastSelected.id);

            const startIndex = Math.min(currentIndex, lastIndex);
            const endIndex = Math.max(currentIndex, lastIndex);

            const rangeSelection = filteredTarget.slice(startIndex, endIndex + 1);
            setSelectedTarget(rangeSelection);
        } else {
            // Sélection simple
            setSelectedTarget([inscription]);
        }
    };

    // Sauvegarde
    const handleSave = async () => {
        if (elevesTarget.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Aucun élève sélectionné',
                text: 'Veuillez sélectionner au moins un élève à affecter.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        const result = await Swal.fire({
            title: 'Confirmer l\'affectation',
            text: `Voulez-vous affecter ${elevesTarget.length} élève(s) à la classe ${classeInfo?.libelle} ?`,
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
            setSaving(true);

            const response = await axios.post(
                apiUrls.eleves.handleSave(selectedClasse),
                elevesTarget,
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
                    title: 'Affectation réussie !',
                    text: `${elevesTarget.length} élève(s) ont été affectés avec succès.`,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                onSuccess(response.data);
                handleClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de l\'affectation:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de l\'affectation.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations.';
                } else if (error.response.status === 409) {
                    errorMessage = 'Certains élèves sont déjà affectés à cette classe.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = `Erreur serveur: ${error.response.status}`;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur d\'affectation',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setSaving(false);
        }
    };

    const handleClose = () => {
        setElevesSource([]);
        setElevesTarget([]);
        setSelectedSource([]);
        setSelectedTarget([]);
        setSearchSource('');
        setSearchTarget('');
        onClose();
    };

    // Composant pour afficher un élève
    const EleveItem = ({ inscription, isSelected, onClick, disabled = false }) => (
        <div
            onClick={(e) => !disabled && onClick(e)}
            style={{
                padding: '12px',
                margin: '4px 0',
                border: `2px solid ${isSelected ? '#10b981' : '#e5e7eb'}`,
                borderRadius: '8px',
                background: isSelected ? '#f0fdf4' : '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.6 : 1,
                userSelect: 'none'
            }}
            onMouseEnter={(e) => {
                if (!disabled && !isSelected) {
                    e.target.style.borderColor = '#d1d5db';
                    e.target.style.background = '#f9fafb';
                }
            }}
            onMouseLeave={(e) => {
                if (!disabled && !isSelected) {
                    e.target.style.borderColor = '#e5e7eb';
                    e.target.style.background = '#ffffff';
                }
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar
                    size="sm"
                    style={{
                        background: inscription.eleve.sexe === 'MASCULIN' ? '#3b82f6' : '#ec4899',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: 'bold'
                    }}
                >
                    {inscription.eleve.sexe === 'MASCULIN' ? 'M' : 'F'}
                </Avatar>
                <div style={{ flex: 1 }}>
                    <div style={{
                        fontWeight: '600',
                        color: '#1e293b',
                        fontSize: '14px',
                        marginBottom: '2px'
                    }}>
                        {inscription.eleve.nom} {inscription.eleve.prenom}
                    </div>
                    <div style={{
                        fontSize: '12px',
                        color: '#64748b',
                        fontFamily: 'monospace'
                    }}>
                        {inscription.eleve.matricule}
                    </div>
                </div>
                {inscription.eleve.nationalite && (
                    <Badge
                        style={{
                            fontSize: '10px',
                            background: '#f1f5f9',
                            color: '#475569'
                        }}
                    >
                        {inscription.eleve.nationalite}
                    </Badge>
                )}
                {/* Indicateur de sélection */}
                {isSelected && (
                    <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: '#10b981',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiCheck size={12} color="white" />
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            open={visible}
            onClose={handleClose}
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
                            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '18px',
                            border: '2px solid #e2e8f0'
                        }}
                    >
                        <FiUsers size={24} />
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            Affecter des élèves à la classe
                        </Text>
                        <Text size="sm" style={{ color: '#64748b' }}>
                            Classe: <strong>{classeInfo?.libelle}</strong> • Branche: <strong>{classeInfo?.branche}</strong>
                        </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Badge style={{
                            background: '#10b981',
                            color: 'white',
                            fontSize: '12px',
                            fontWeight: '600'
                        }}>
                            {elevesTarget.length} sélectionné(s)
                        </Badge>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{
                padding: '24px',
                background: '#fafafa',
                maxHeight: '70vh',
                overflow: 'hidden'
            }}>
                {loadingEleves ? (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <Loader size="lg" />
                            <Text style={{ marginTop: 12, color: '#666' }}>
                                Chargement des élèves disponibles...
                            </Text>
                        </div>
                    </div>
                ) : (
                    <Grid fluid style={{ height: '500px' }}>
                        <Row gutter={16} style={{ height: '100%' }}>
                            {/* Colonne gauche - Élèves disponibles */}
                            <Col xs={10} style={{ height: '100%' }}>
                                <Panel
                                    header={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text size="md" weight="semibold">
                                                Élèves disponibles
                                            </Text>
                                            <Badge style={{ background: '#6b7280', color: 'white' }}>
                                                {filteredSource.length}
                                            </Badge>
                                        </div>
                                    }
                                    style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    bodyStyle={{
                                        padding: '16px',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <InputGroup style={{ marginBottom: '12px' }}>
                                        <InputGroup.Addon>
                                            <FiSearch />
                                        </InputGroup.Addon>
                                        <Input
                                            placeholder="Rechercher par nom ou matricule..."
                                            value={searchSource}
                                            onChange={setSearchSource}
                                        />
                                    </InputGroup>

                                    <div style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        maxHeight: '350px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        background: '#f9fafb'
                                    }}>
                                        {filteredSource.length === 0 ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#6b7280'
                                            }}>
                                                <FiUser size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                                <Text>Aucun élève disponible</Text>
                                            </div>
                                        ) : (
                                            filteredSource.map((inscription) => (
                                                <EleveItem
                                                    key={inscription.id}
                                                    inscription={inscription}
                                                    isSelected={selectedSource.find(item => item.id === inscription.id) !== undefined}
                                                    onClick={(e) => handleSourceSelection(inscription, e)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </Panel>
                            </Col>

                            {/* Colonne centrale - Boutons de contrôle */}
                            <Col xs={4} style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    <Button
                                        appearance="primary"
                                        size="sm"
                                        disabled={selectedSource.length === 0 || saving}
                                        onClick={moveToTarget}
                                        style={{ minWidth: '40px', padding: '8px' }}
                                    >
                                        <FiChevronRight />
                                    </Button>

                                    <Button
                                        appearance="primary"
                                        size="sm"
                                        disabled={elevesSource.length === 0 || saving}
                                        onClick={moveAllToTarget}
                                        style={{ minWidth: '40px', padding: '8px' }}
                                    >
                                        <FiChevronsRight />
                                    </Button>

                                    <Button
                                        appearance="default"
                                        size="sm"
                                        disabled={elevesTarget.length === 0 || saving}
                                        onClick={moveAllToSource}
                                        style={{ minWidth: '40px', padding: '8px' }}
                                    >
                                        <FiChevronsLeft />
                                    </Button>

                                    <Button
                                        appearance="default"
                                        size="sm"
                                        disabled={selectedTarget.length === 0 || saving}
                                        onClick={moveToSource}
                                        style={{ minWidth: '40px', padding: '8px' }}
                                    >
                                        <FiChevronLeft />
                                    </Button>
                                </div>
                            </Col>

                            {/* Colonne droite - Élèves sélectionnés */}
                            <Col xs={10} style={{ height: '100%' }}>
                                <Panel
                                    header={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text size="md" weight="semibold">
                                                Élèves à affecter
                                            </Text>
                                            <Badge style={{ background: '#10b981', color: 'white' }}>
                                                {filteredTarget.length}
                                            </Badge>
                                        </div>
                                    }
                                    style={{
                                        background: 'white',
                                        borderRadius: '12px',
                                        border: '1px solid #e5e7eb',
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                    bodyStyle={{
                                        padding: '16px',
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column'
                                    }}
                                >
                                    <InputGroup style={{ marginBottom: '12px' }}>
                                        <InputGroup.Addon>
                                            <FiSearch />
                                        </InputGroup.Addon>
                                        <Input
                                            placeholder="Rechercher dans la sélection..."
                                            value={searchTarget}
                                            onChange={setSearchTarget}
                                        />
                                    </InputGroup>

                                    <div style={{
                                        flex: 1,
                                        overflowY: 'auto',
                                        maxHeight: '350px',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        background: '#f0fdf4'
                                    }}>
                                        {filteredTarget.length === 0 ? (
                                            <div style={{
                                                textAlign: 'center',
                                                padding: '40px',
                                                color: '#6b7280'
                                            }}>
                                                <FiPlus size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                                                <Text>Aucun élève sélectionné</Text>
                                                <Text size="sm" style={{ marginTop: '8px', color: '#9ca3af' }}>
                                                    Utilisez Ctrl+clic pour sélectionner plusieurs élèves
                                                </Text>
                                            </div>
                                        ) : (
                                            filteredTarget.map((inscription) => (
                                                <EleveItem
                                                    key={inscription.id}
                                                    inscription={inscription}
                                                    isSelected={selectedTarget.find(item => item.id === inscription.id) !== undefined}
                                                    onClick={(e) => handleTargetSelection(inscription, e)}
                                                />
                                            ))
                                        )}
                                    </div>
                                </Panel>
                            </Col>
                        </Row>
                    </Grid>
                )}
            </Modal.Body>

            <Modal.Footer style={{
                padding: '20px 24px',
                borderTop: '1px solid #f1f5f9',
                background: 'white',
                borderRadius: '0 0 16px 16px'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Text size="sm" style={{ color: '#64748b' }}>
                            <strong>{elevesTarget.length}</strong> élève(s) sélectionné(s)
                        </Text>
                        {classeInfo?.effectifMax && (
                            <Text size="sm" style={{ color: '#64748b' }}>
                                Capacité: {classeInfo.effectifActuel || 0}/{classeInfo.effectifMax}
                            </Text>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <Button
                            appearance="subtle"
                            onClick={handleClose}
                            startIcon={<FiX />}
                            disabled={saving}
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
                            loading={saving}
                            disabled={loadingEleves || elevesTarget.length === 0}
                            startIcon={<FiCheck />}
                            style={{
                                background: saving ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 20px',
                                fontWeight: '600'
                            }}
                        >
                            {saving ? 'Affectation en cours...' : `Affecter ${elevesTarget.length} élève(s)`}
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalAffectationEleves;