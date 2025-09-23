import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    Form,
    Input,
    SelectPicker,
    RadioGroup,
    Radio,
    DatePicker,
    Button,
    Table,
    Message,
    Loader,
    InputNumber,
    Panel,
    Divider
} from 'rsuite';
import { FiCalendar, FiClock, FiRotateCcw, FiRefreshCw } from 'react-icons/fi';
import {
    useNiveauxEnseignementData,
    usePeriodicitesData,
    usePeriodesData
} from './AnneesScolairesServiceManager';

const { Column, HeaderCell, Cell } = Table;

const AnneesScolairesModal = ({ modalState, onClose, onSave }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        anneeDebut: new Date().getFullYear(),
        anneeFin: new Date().getFullYear() + 1,
        niveauEnseignement: null,
        nbreEval: 5,
        periodicite: null,
        periodes: []
    });
    const [selectedPeriodicite, setSelectedPeriodicite] = useState(null);
    const [formErrors, setFormErrors] = useState({});

    // ===========================
    // HOOKS POUR LES DONNÉES
    // ===========================
    const { niveaux, loading: niveauxLoading } = useNiveauxEnseignementData();
    const { periodicitees, loading: periodicitesLoading } = usePeriodicitesData();
    const { periodes, loading: periodesLoading } = usePeriodesData(selectedPeriodicite);

    // Icônes pour les périodicités
    const getPeriodiciteIcon = (label) => {
        if (label.toLowerCase().includes('trimestre')) return <FiRotateCcw style={{ marginRight: 8 }} />;
        if (label.toLowerCase().includes('semestre')) return <FiRefreshCw style={{ marginRight: 8 }} />;
        if (label.toLowerCase().includes('mensuel')) return <FiClock style={{ marginRight: 8 }} />;
        return <FiCalendar style={{ marginRight: 8 }} />;
    };

    // ===========================
    // EFFET POUR INITIALISER LE FORMULAIRE
    // ===========================
    useEffect(() => {
        if (modalState.open) {
            if (modalState.type === 'edit' && modalState.selectedQuestion) {
                const data = modalState.selectedQuestion;
                const initialFormData = {
                    anneeDebut: data.anneeDebut,
                    anneeFin: data.anneeFin,
                    niveauEnseignement: data.niveauEnseignement?.id,
                    nbreEval: data.nbreEval,
                    periodicite: data.periodicite?.id,
                    periodes: data.anneePeriodes?.map(periode => ({
                        ...periode,
                        dateDebut: periode.dateDebut ? new Date(periode.dateDebut) : null,
                        dateFin: periode.dateFin ? new Date(periode.dateFin) : null
                    })) || []
                };
                setFormData(initialFormData);
                setSelectedPeriodicite(data.periodicite?.id);
            } else {
                // Mode création - réinitialiser avec Trimestrielle par défaut
                const currentYear = new Date().getFullYear();
                // Trouver l'ID de la périodicité "Trimestrielle" (généralement ID 2)
                const trimesterId = periodicitees.find(p => p.label.toLowerCase().includes('trimestre'))?.value || 2;
                const initialFormData = {
                    anneeDebut: currentYear,
                    anneeFin: currentYear + 1,
                    niveauEnseignement: null,
                    nbreEval: 5,
                    periodicite: trimesterId,
                    periodes: []
                };
                setFormData(initialFormData);
                setSelectedPeriodicite(trimesterId);
            }
            setFormErrors({});
        }
    }, [modalState.open, modalState.type, modalState.selectedQuestion, periodicitees]);

    // ===========================
    // EFFET POUR METTRE À JOUR LES PÉRIODES
    // ===========================
    useEffect(() => {
        if (periodes.length > 0) {
            const periodesWithDates = periodes.map(periode => ({
                ...periode,
                dateDebut: null,
                dateFin: null
            }));
            setFormData(prev => ({
                ...prev,
                periodes: periodesWithDates
            }));
        }
    }, [periodes]);

    // ===========================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ===========================
    const handleAnneeDebutChange = useCallback((value) => {
        const anneeDebut = parseInt(value) || new Date().getFullYear();
        const anneeFin = anneeDebut + 1;

        const newFormData = {
            ...formData,
            anneeDebut: anneeDebut,
            anneeFin: anneeFin
        };
        setFormData(newFormData);
        if (formErrors.anneeDebut) {
            setFormErrors(prev => ({ ...prev, anneeDebut: null }));
        }
    }, [formData, formErrors]);

    const handleNiveauChange = useCallback((value) => {
        setFormData(prev => ({
            ...prev,
            niveauEnseignement: value
        }));
        if (formErrors.niveauEnseignement) {
            setFormErrors(prev => ({ ...prev, niveauEnseignement: null }));
        }
    }, [formErrors]);

    const handleNbreEvalChange = useCallback((value) => {
        setFormData(prev => ({
            ...prev,
            nbreEval: value || 0
        }));
        if (formErrors.nbreEval) {
            setFormErrors(prev => ({ ...prev, nbreEval: null }));
        }
    }, [formErrors]);

    const handlePeriodiciteChange = useCallback((value) => {
        setSelectedPeriodicite(value);
        setFormData(prev => ({
            ...prev,
            periodicite: value,
            periodes: []
        }));
        if (formErrors.periodicite) {
            setFormErrors(prev => ({ ...prev, periodicite: null }));
        }
    }, [formErrors]);

    const handlePeriodeDateChange = useCallback((periodeId, field, date) => {
        setFormData(prev => ({
            ...prev,
            periodes: prev.periodes.map(periode => {
                if (periode.id === periodeId) {
                    if (field === 'dateDebut') {
                        // Calculer automatiquement la date de fin (date début + 1 jour)
                        const dateFin = date ? new Date(date.getTime() + 24 * 60 * 60 * 1000) : null;
                        return { ...periode, dateDebut: date, dateFin: dateFin };
                    } else {
                        return { ...periode, [field]: date };
                    }
                } else {
                    return periode;
                }
            })
        }));
    }, []);

    // ===========================
    // VALIDATION DU FORMULAIRE
    // ===========================
    const validateForm = useCallback(() => {
        const errors = {};

        if (!formData.anneeDebut || formData.anneeDebut < 2020 || formData.anneeDebut > 2050) {
            errors.anneeDebut = 'Veuillez saisir une année valide entre 2020 et 2050';
        }

        if (!formData.niveauEnseignement) {
            errors.niveauEnseignement = 'Veuillez sélectionner un niveau d\'enseignement';
        }

        if (!formData.nbreEval || formData.nbreEval < 1 || formData.nbreEval > 20) {
            errors.nbreEval = 'Le nombre d\'évaluations doit être entre 1 et 20';
        }

        if (!formData.periodicite) {
            errors.periodicite = 'Veuillez sélectionner une périodicité';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    }, [formData]);

    const handleSave = useCallback(async () => {
        if (!validateForm()) {
            Message.error('Veuillez corriger les erreurs dans le formulaire');
            return;
        }

        try {
            setLoading(true);

            const dataToSave = {
                ...formData,
                libelle: `Année ${formData.anneeDebut} - ${formData.anneeFin}`,
                customLibelle: `Année ${formData.anneeDebut} - ${formData.anneeFin}`
            };

            await onSave(dataToSave);
            Message.success('Année scolaire enregistrée avec succès');
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Message.error('Erreur lors de l\'enregistrement');
        } finally {
            setLoading(false);
        }
    }, [formData, validateForm, onSave]);

    const handleCancel = useCallback(() => {
        setFormData({
            anneeDebut: new Date().getFullYear(),
            anneeFin: new Date().getFullYear() + 1,
            niveauEnseignement: null,
            nbreEval: 5,
            periodicite: null,
            periodes: []
        });
        setSelectedPeriodicite(null);
        setFormErrors({});
        onClose();
    }, [onClose]);

    // ===========================
    // TITRE DU MODAL
    // ===========================
    const getModalTitle = () => {
        switch (modalState.type) {
            case 'create':
                return 'Initialiser une année scolaire';
            case 'edit':
                return 'Modifier une année scolaire';
            case 'view':
                return 'Détails de l\'année scolaire';
            default:
                return 'Année scolaire';
        }
    };

    const isReadOnly = modalState.type === 'view';

    // ===========================
    // FORMATAGE DES DONNÉES POUR LES DROPDOWNS
    // ===========================
    const niveauxData = niveaux.map(niveau => ({
        label: niveau.label,
        value: niveau.value
    }));

    const periodicitesData = periodicitees.map(periodicite => ({
        label: periodicite.label,
        value: periodicite.value
    }));

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <Modal
            open={modalState.open}
            onClose={handleCancel}
            size="lg"
            backdrop="static"
        >
            <Modal.Header>
                <Modal.Title>{getModalTitle()}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* En-tête stylé comme dans CreateEleveModal */}
                <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: 24,
                    paddingBottom: 16,
                    borderBottom: '1px solid #e5e5e5'
                }}>
                    <div style={{ color: '#999', fontSize: '14px' }}>
                        Configuration année scolaire {formData.anneeDebut} - {formData.anneeFin}
                    </div>
                    <div style={{ 
                        backgroundColor: '#f0f2f5', 
                        padding: '6px 12px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        color: '#666'
                    }}>
                        PARAMÉTRAGE
                    </div>
                </div>

                <Form fluid>
                    {/* ===========================
                        SECTION ANNÉE - Layout en grille moderne
                        =========================== */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                        <Form.Group>
                            <Form.ControlLabel>
                                Année de début <span style={{ color: 'red' }}>*</span>
                            </Form.ControlLabel>
                            <InputNumber
                                value={formData.anneeDebut}
                                onChange={handleAnneeDebutChange}
                                min={2020}
                                max={2050}
                                style={{ width: '100%' }}
                                disabled={isReadOnly}
                                placeholder="2024"
                                size="lg"
                            />
                            {formErrors.anneeDebut && (
                                <Form.HelpText style={{ color: 'red' }}>
                                    {formErrors.anneeDebut}
                                </Form.HelpText>
                            )}
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Année de fin</Form.ControlLabel>
                            <InputNumber
                                value={formData.anneeFin}
                                disabled
                                style={{ width: '100%', backgroundColor: '#f5f5f5' }}
                                size="lg"
                            />
                        </Form.Group>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
                        <Form.Group>
                            <Form.ControlLabel>
                                Niveau d'enseignement <span style={{ color: 'red' }}>*</span>
                            </Form.ControlLabel>
                            <SelectPicker
                                data={niveauxData}
                                value={formData.niveauEnseignement}
                                onChange={handleNiveauChange}
                                placeholder="Sélectionner un niveau"
                                style={{ width: '100%' }}
                                disabled={isReadOnly || niveauxLoading}
                                loading={niveauxLoading}
                                searchable={false}
                                size="lg"
                            />
                            {formErrors.niveauEnseignement && (
                                <Form.HelpText style={{ color: 'red' }}>
                                    {formErrors.niveauEnseignement}
                                </Form.HelpText>
                            )}
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>
                                Nombre d'évaluations <span style={{ color: 'red' }}>*</span>
                            </Form.ControlLabel>
                            <InputNumber
                                value={formData.nbreEval}
                                onChange={handleNbreEvalChange}
                                min={1}
                                max={20}
                                style={{ width: '100%' }}
                                disabled={isReadOnly}
                                placeholder="5"
                                size="lg"
                            />
                            {formErrors.nbreEval && (
                                <Form.HelpText style={{ color: 'red' }}>
                                    {formErrors.nbreEval}
                                </Form.HelpText>
                            )}
                        </Form.Group>
                    </div>

                    {/* ===========================
                        PÉRIODICITÉ - Panel amélioré
                        =========================== */}
                    <Panel 
                        header="Configuration des périodes" 
                        bordered
                        style={{ marginBottom: 20 }}
                        bodyFill={false}
                    >
                        <Form.Group style={{}}>
                            <Form.ControlLabel style={{ marginBottom: 16, fontSize: '16px', fontWeight: '500' }}>
                                Périodicité <span style={{ color: 'red' }}>*</span>
                            </Form.ControlLabel>
                            
                            {/* Boutons radio stylés avec icônes */}
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                gap: 16, 
                                marginBottom: 16 
                            }}>
                                {periodicitesData.map(periodicite => (
                                    <div 
                                        key={periodicite.value}
                                        style={{
                                            position: 'relative',
                                            border: formData.periodicite === periodicite.value 
                                                ? '2px solid #3498db' 
                                                : '2px solid #e5e5e5',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            cursor: isReadOnly || periodicitesLoading ? 'not-allowed' : 'pointer',
                                            backgroundColor: formData.periodicite === periodicite.value 
                                                ? '#f8f9fa' 
                                                : 'white',
                                            transition: 'all 0.2s ease',
                                            opacity: isReadOnly || periodicitesLoading ? 0.6 : 1
                                        }}
                                        onClick={() => {
                                            if (!isReadOnly && !periodicitesLoading) {
                                                handlePeriodiciteChange(periodicite.value);
                                            }
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!isReadOnly && !periodicitesLoading && formData.periodicite !== periodicite.value) {
                                                e.target.style.borderColor = '#95a5a6';
                                                e.target.style.backgroundColor = '#fafafa';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (!isReadOnly && !periodicitesLoading && formData.periodicite !== periodicite.value) {
                                                e.target.style.borderColor = '#e5e5e5';
                                                e.target.style.backgroundColor = 'white';
                                            }
                                        }}
                                    >
                                        <div style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            fontSize: '15px',
                                            fontWeight: formData.periodicite === periodicite.value ? '600' : '400',
                                            color: formData.periodicite === periodicite.value ? '#2c3e50' : '#7f8c8d'
                                        }}>
                                            {getPeriodiciteIcon(periodicite.label)}
                                            {periodicite.label}
                                        </div>
                                        
                                        {/* Indicateur de sélection */}
                                        {formData.periodicite === periodicite.value && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '8px',
                                                right: '8px',
                                                width: '20px',
                                                height: '20px',
                                                borderRadius: '50%',
                                                backgroundColor: '#3498db',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}>
                                                <div style={{
                                                    width: '8px',
                                                    height: '8px',
                                                    borderRadius: '50%',
                                                    backgroundColor: 'white'
                                                }} />
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {formErrors.periodicite && (
                                <Form.HelpText style={{ color: 'red' }}>
                                    {formErrors.periodicite}
                                </Form.HelpText>
                            )}
                        </Form.Group>

                        {/* ===========================
                            TABLEAU DES PÉRIODES - Hauteur de ligne augmentée
                            =========================== */}
                        {selectedPeriodicite && (
                            <Form.Group>
                                <Form.ControlLabel style={{ fontSize: '16px', fontWeight: '500', marginBottom: 16 }}>
                                    Calendrier des périodes
                                </Form.ControlLabel>
                                {periodesLoading ? (
                                    <div style={{ textAlign: 'center', padding: '40px' }}>
                                        <Loader size="lg" content="Chargement des périodes..." />
                                    </div>
                                ) : formData.periodes.length > 0 ? (
                                    <Table
                                        data={formData.periodes}
                                        height={Math.min(400, formData.periodes.length * 60 + 60)} // Hauteur de ligne augmentée
                                        bordered
                                        rowHeight={60} // Hauteur de ligne explicite
                                        headerHeight={50} // Hauteur d'en-tête augmentée
                                        style={{ 
                                            border: '1px solid #e5e5e5',
                                            borderRadius: '6px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <Column width={220} align="left" fixed>
                                            <HeaderCell style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                                Période
                                            </HeaderCell>
                                            <Cell 
                                                dataKey="libelle" 
                                                style={{ 
                                                    fontSize: '15px',
                                                    fontWeight: '500',
                                                    padding: '16px 12px'
                                                }} 
                                            />
                                        </Column>

                                        <Column width={220} align="center">
                                            <HeaderCell style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                                Date Début
                                            </HeaderCell>
                                            <Cell style={{ padding: '12px 8px' }}>
                                                {(rowData) => (
                                                    <DatePicker
                                                        value={rowData.dateDebut}
                                                        onChange={(date) => handlePeriodeDateChange(rowData.id, 'dateDebut', date)}
                                                        format="dd/MM/yyyy"
                                                        placeholder="Sélectionner"
                                                        style={{ width: '100%' }}
                                                        disabled={isReadOnly}
                                                        caretAs={FiCalendar}
                                                        size="md"
                                                    />
                                                )}
                                            </Cell>
                                        </Column>

                                        <Column width={220} align="center">
                                            <HeaderCell style={{ backgroundColor: '#f8f9fa', fontWeight: '600' }}>
                                                Date Fin
                                            </HeaderCell>
                                            <Cell style={{ padding: '12px 8px' }}>
                                                {(rowData) => (
                                                    <DatePicker
                                                        value={rowData.dateFin}
                                                        onChange={(date) => handlePeriodeDateChange(rowData.id, 'dateFin', date)}
                                                        format="dd/MM/yyyy"
                                                        placeholder="Sélectionner"
                                                        style={{ width: '100%' }}
                                                        disabled={isReadOnly}
                                                        caretAs={FiCalendar}
                                                        size="md"
                                                    />
                                                )}
                                            </Cell>
                                        </Column>
                                    </Table>
                                ) : (
                                    <Message
                                        type="info"
                                        description="Aucune période disponible pour cette périodicité."
                                        style={{ margin: '20px 0' }}
                                    />
                                )}
                            </Form.Group>
                        )}
                    </Panel>
                </Form>
            </Modal.Body>

            <Modal.Footer>
                <Button 
                    onClick={handleCancel} 
                    appearance="subtle"
                    size="lg"
                    disabled={loading}
                >
                    Annuler
                </Button>
                {!isReadOnly && (
                    <Button
                        onClick={handleSave}
                        appearance="primary"
                        loading={loading}
                        disabled={loading}
                        color="green"
                        size="lg"
                    >
                        Enregistrer
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default AnneesScolairesModal;