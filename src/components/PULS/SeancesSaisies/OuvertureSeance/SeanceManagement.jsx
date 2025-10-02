import React, { useState, useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    SelectPicker,
    Button,
    Panel,
    Row,
    Col,
    Message,
    Loader,
    Badge,
    Modal,
    useToaster,
    DatePicker
} from 'rsuite';
import {
    FiSearch,
    FiRotateCcw,
    FiCalendar,
    FiList,
    FiPlusCircle,
    FiInfo
} from 'react-icons/fi';

// Import des hooks et services
import DataTable from "../../../DataTable";
import {
    useSeanceSearch,
    useSeanceDetails,
    useSeanceGeneration,
    formatDate,
    getStatutColor,
    getStatutLabel,
    formatHeureRange
} from './SeanceService';
import { useClassesData } from "../../utils/CommonDataService";
import { usePulsParams } from '../../../hooks/useDynamicParams';

// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE
// ===========================
const SearchForm = ({ onSearch, onClear, loading = false, error = null }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [formError, setFormError] = useState(null);

    const {
        classes,
        loading: classesLoading,
        error: classesError
    } = useClassesData();

    const handleSearch = useCallback(() => {
        if (!selectedDate) {
            setFormError('Veuillez sélectionner une date');
            return;
        }

        if (!selectedClasse) {
            setFormError('Veuillez sélectionner une classe');
            return;
        }

        setFormError(null);
        if (onSearch) {
            const formattedDate = selectedDate.toISOString().split('T')[0];
            onSearch({ date: formattedDate, classeId: selectedClasse });
        }
    }, [selectedDate, selectedClasse, onSearch]);

    const handleClear = useCallback(() => {
        setSelectedDate(new Date());
        setSelectedClasse(null);
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 25,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiSearch size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Recherche des Séances
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez une date et une classe pour afficher les séances
                    </p>
                </div>
            </div>

            {(formError || error) && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="warning" showIcon>
                        {formError || error?.message}
                    </Message>
                </div>
            )}

            <Row gutter={20}>
                <Col xs={24} sm={12} md={10}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Date *
                        </label>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            format="dd-MM-yyyy"
                            placeholder="Sélectionner une date"
                            style={{ width: '100%' }}
                            size="lg"
                            cleanable={false}
                        />
                    </div>
                </Col>

                <Col xs={24} sm={12} md={10}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Classe *
                        </label>
                        <SelectPicker
                            data={classes}
                            value={selectedClasse}
                            onChange={setSelectedClasse}
                            placeholder="Choisir une classe"
                            searchable
                            style={{ width: '100%' }}
                            loading={classesLoading}
                            disabled={classesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={24} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: 'transparent',
                            fontSize: '14px'
                        }}>
                            Action
                        </label>
                        <div style={{ display: 'flex', gap: 8, height: '40px' }}>
                            <Button
                                appearance="primary"
                                onClick={handleSearch}
                                loading={loading}
                                disabled={classesLoading || loading}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: '500'
                                }}
                                size="lg"
                            >
                                {loading ? 'Recherche...' : 'Rechercher'}
                            </Button>

                            <Button
                                onClick={handleClear}
                                disabled={loading}
                                style={{
                                    minWidth: '45px',
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                                size="lg"
                            >
                                <FiRotateCcw size={16} />
                            </Button>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// ===========================
// MODAL DE DÉTAILS DE SÉANCE
// ===========================
const SeanceDetailsModal = ({ open, onClose, seance, details, loading }) => {
    return (
        <Modal
            open={open}
            onClose={onClose}
            size="lg"
            overflow={true}
        >
            <Modal.Body style={{ padding: 0 }}>
                {/* En-tête élégant */}
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }}>
                            <FiInfo size={24} color="white" />
                        </div>
                        <div>
                            <h5 style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '18px' }}>
                                Détails des séances générées
                            </h5>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                Vue d'ensemble des séances programmées
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    {loading ? (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 15
                        }}>
                            <Loader size="md" />
                            <span style={{ color: '#64748b', fontSize: '14px' }}>
                                Chargement des détails...
                            </span>
                        </div>
                    ) : details && details.length > 0 ? (
                        <div>
                            {/* Carte d'information */}
                            <div style={{
                                background: '#f8fafc',
                                padding: '20px',
                                borderRadius: '12px',
                                marginBottom: '25px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <Row gutter={20}>
                                    <Col xs={12}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <FiCalendar size={16} color="#667eea" />
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>
                                                    Date
                                                </div>
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                                                    {formatDate(seance?.dateSeance)}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={12}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <FiList size={16} color="#667eea" />
                                            <div>
                                                <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '2px' }}>
                                                    Classe
                                                </div>
                                                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '14px' }}>
                                                    {seance?.classeLibelle}
                                                </div>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Tableau moderne */}
                            <div style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                overflow: 'hidden'
                            }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ background: '#f8fafc' }}>
                                            <th style={thStyle}>Date</th>
                                            <th style={thStyle}>Classe</th>
                                            <th style={thStyle}>Type séance</th>
                                            <th style={thStyle}>Horaire</th>
                                            <th style={thStyle}>Matière</th>
                                            <th style={thStyle}>Professeur</th>
                                            <th style={thStyle}>Surveillant</th>
                                            <th style={thStyle}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {details.map((detail, index) => (
                                            <tr key={index} style={{
                                                background: index % 2 === 0 ? 'white' : '#fafafa',
                                                transition: 'background 0.2s'
                                            }}>
                                                <td style={tdStyle}>{formatDate(detail.dateSeance)}</td>
                                                <td style={tdStyle}>{detail.classe?.libelle || 'N/A'}</td>
                                                <td style={tdStyle}>
                                                    <span style={{
                                                        padding: '4px 10px',
                                                        background: '#eff6ff',
                                                        color: '#1e40af',
                                                        borderRadius: '6px',
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {detail.typeActivite?.libelle || 'N/A'}
                                                    </span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontSize: '13px' }}>
                                                        {detail.heureDeb} - {detail.heureFin}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ fontWeight: '500', color: '#334155' }}>
                                                        {detail.matiere?.libelle || 'N/A'}
                                                    </div>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>-</span>
                                                </td>
                                                <td style={tdStyle}>
                                                    <div style={{ display: 'flex', gap: 5 }}>
                                                        <Button
                                                            size="xs"
                                                            appearance="ghost"
                                                            style={{ 
                                                                color: '#f59e0b',
                                                                padding: '4px 8px',
                                                                minWidth: 'auto'
                                                            }}
                                                        >
                                                            ✏️
                                                        </Button>
                                                        <Button
                                                            size="xs"
                                                            appearance="ghost"
                                                            style={{ 
                                                                color: '#ef4444',
                                                                padding: '4px 8px',
                                                                minWidth: 'auto'
                                                            }}
                                                        >
                                                            🗑️
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 15
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px'
                            }}>
                                📋
                            </div>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                                Aucun détail disponible
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer simple */}
                <div style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'flex-end'
                }}>
                    <Button 
                        onClick={onClose} 
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px'
                        }}
                    >
                        Fermer
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

// Styles pour les tableaux
const thStyle = {
    padding: '14px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '600',
    color: '#475569',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e2e8f0'
};

const tdStyle = {
    padding: '14px 16px',
    fontSize: '13px',
    color: '#334155',
    borderBottom: '1px solid #f1f5f9'
};

// ===========================
// MODAL D'OUVERTURE DE SÉANCE
// ===========================
const OuvertureSeanceModal = ({ open, onClose, onGenerate }) => {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [generating, setGenerating] = useState(false);

    const {
        classes,
        loading: classesLoading
    } = useClassesData();

    const handleGenerate = async () => {
        if (!selectedDate || !selectedClasse) {
            return;
        }

        setGenerating(true);
        const formattedDate = selectedDate.toISOString().split('T')[0];
        await onGenerate(formattedDate, selectedClasse);
        setGenerating(false);
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="sm"
        >
            <Modal.Body style={{ padding: 0 }}>
                {/* En-tête élégant */}
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                        }}>
                            <FiPlusCircle size={24} color="white" />
                        </div>
                        <div>
                            <h5 style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '18px' }}>
                                Ouverture de Séances
                            </h5>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                Générer les séances pour une classe
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    <Row gutter={16}>
                        <Col xs={24}>
                            <div style={{ marginBottom: 20 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 10,
                                    fontWeight: '500',
                                    color: '#334155',
                                    fontSize: '14px'
                                }}>
                                    Date de la séance *
                                </label>
                                <DatePicker
                                    value={selectedDate}
                                    onChange={setSelectedDate}
                                    format="dd-MM-yyyy"
                                    placeholder="Sélectionner une date"
                                    style={{ width: '100%' }}
                                    size="lg"
                                    cleanable={false}
                                />
                            </div>
                        </Col>

                        <Col xs={24}>
                            <div style={{ marginBottom: 25 }}>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 10,
                                    fontWeight: '500',
                                    color: '#334155',
                                    fontSize: '14px'
                                }}>
                                    Classe concernée *
                                </label>
                                <SelectPicker
                                    data={classes}
                                    value={selectedClasse}
                                    onChange={setSelectedClasse}
                                    placeholder="Choisir une classe"
                                    searchable
                                    style={{ width: '100%' }}
                                    loading={classesLoading}
                                    cleanable={false}
                                    size="lg"
                                />
                            </div>
                        </Col>
                    </Row>

                    {/* Bouton de génération élégant */}
                    <Button
                        appearance="primary"
                        onClick={handleGenerate}
                        loading={generating}
                        disabled={!selectedDate || !selectedClasse || generating}
                        block
                        size="lg"
                        style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '10px',
                            padding: '12px',
                            fontWeight: '600',
                            fontSize: '15px',
                            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)',
                            transition: 'all 0.3s'
                        }}
                    >
                        {generating ? (
                            <>
                                <Loader style={{ marginRight: '8px' }} /> Génération en cours...
                            </>
                        ) : (
                            <>🚀 Générer les séances</>
                        )}
                    </Button>
                </div>

                {/* Footer simple */}
                <div style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Button 
                        onClick={onClose} 
                        appearance="subtle"
                        style={{
                            borderRadius: '8px',
                            padding: '8px 24px',
                            color: '#64748b'
                        }}
                    >
                        Annuler
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

// ===========================
// MODAL RÉCAPITULATIF
// ===========================
const RecapitulatifModal = ({ open, onClose, result }) => {
    if (!result) return null;

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="md"
        >
            <Modal.Body style={{ padding: 0 }}>
                {/* En-tête élégant */}
                <div style={{
                    padding: '30px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
                    borderBottom: '1px solid #e2e8f0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: result.success 
                                ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: result.success
                                ? '0 4px 12px rgba(16, 185, 129, 0.2)'
                                : '0 4px 12px rgba(245, 158, 11, 0.2)'
                        }}>
                            <span style={{ fontSize: '24px' }}>
                                {result.success ? '✓' : 'ℹ'}
                            </span>
                        </div>
                        <div>
                            <h5 style={{ margin: 0, color: '#1e293b', fontWeight: '600', fontSize: '18px' }}>
                                Récapitulatif
                            </h5>
                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                Résultat de la génération de séances
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '30px' }}>
                    {result.messages && result.messages.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            {result.messages.map((msg, index) => (
                                <div key={index} style={{
                                    background: '#ffffff',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
                                }}>
                                    {/* Titre */}
                                    <div style={{
                                        padding: '16px 20px',
                                        background: '#f8fafc',
                                        borderBottom: '1px solid #e2e8f0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10
                                    }}>
                                        <div style={{
                                            width: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            background: getMessageTypeColor(msg.type).bg,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '16px'
                                        }}>
                                            {getMessageTypeIcon(msg.type)}
                                        </div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{
                                                fontWeight: '600',
                                                color: '#1e293b',
                                                fontSize: '14px'
                                            }}>
                                                {msg.title || 'Information'}
                                            </div>
                                        </div>
                                        <Badge 
                                            color={getMessageTypeBadgeColor(msg.type)}
                                            style={{ fontSize: '11px' }}
                                        >
                                            {msg.type || 'info'}
                                        </Badge>
                                    </div>

                                    {/* Détail */}
                                    <div style={{
                                        padding: '20px',
                                        color: '#475569',
                                        fontSize: '14px',
                                        lineHeight: '1.6'
                                    }}>
                                        {msg.detail || 'Aucun détail disponible'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 15
                        }}>
                            <div style={{
                                width: '64px',
                                height: '64px',
                                borderRadius: '50%',
                                background: '#f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '28px'
                            }}>
                                📋
                            </div>
                            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
                                Aucun message disponible
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer avec bouton primaire */}
                <div style={{
                    padding: '20px 30px',
                    borderTop: '1px solid #e2e8f0',
                    background: '#fafafa',
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <Button
                        onClick={onClose}
                        appearance="primary"
                        style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '10px 32px',
                            fontWeight: '500',
                            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.2)'
                        }}
                    >
                        Terminé
                    </Button>
                </div>
            </Modal.Body>
        </Modal>
    );
};

// Fonctions utilitaires pour le modal récapitulatif
const getMessageTypeIcon = (type) => {
    switch(type?.toLowerCase()) {
        case 'success': return '✓';
        case 'error': return '✕';
        case 'warning': return '⚠';
        case 'info':
        default: return 'ℹ';
    }
};

const getMessageTypeColor = (type) => {
    switch(type?.toLowerCase()) {
        case 'success': 
            return { bg: '#dcfce7', border: '#86efac' };
        case 'error': 
            return { bg: '#fee2e2', border: '#fca5a5' };
        case 'warning': 
            return { bg: '#fef3c7', border: '#fcd34d' };
        case 'info':
        default: 
            return { bg: '#dbeafe', border: '#93c5fd' };
    }
};

const getMessageTypeBadgeColor = (type) => {
    switch(type?.toLowerCase()) {
        case 'success': return 'green';
        case 'error': return 'red';
        case 'warning': return 'orange';
        case 'info':
        default: return 'blue';
    }
};

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const SeanceManagement = () => {
    const toaster = useToaster();
    const { academicYearId } = usePulsParams();

    // Hooks de recherche et génération
    const {
        seances,
        loading: searchLoading,
        error: searchError,
        searchPerformed,
        searchSeances,
        clearResults
    } = useSeanceSearch();

    const {
        details,
        loading: detailsLoading,
        fetchSeanceDetails,
        clearDetails
    } = useSeanceDetails();

    const {
        generationResult,
        loading: generating,
        generateSeances,
        clearResult
    } = useSeanceGeneration();

    // États locaux
    const [selectedSeance, setSelectedSeance] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showOuvertureModal, setShowOuvertureModal] = useState(false);
    const [showRecapModal, setShowRecapModal] = useState(false);
    const [currentSearchParams, setCurrentSearchParams] = useState(null);

    // Gestion de la recherche
    const handleSearch = useCallback(async (params) => {
        console.log('🔍 Recherche séances:', params);
        setCurrentSearchParams(params);
        await searchSeances(params.date, params.classeId);
    }, [searchSeances]);

    const handleClearSearch = useCallback(() => {
        clearResults();
        setCurrentSearchParams(null);
    }, [clearResults]);

    // Gestion des détails
    const handleShowDetails = useCallback(async (seance) => {
        console.log('📋 Affichage détails séance:', seance);
        setSelectedSeance(seance);
        setShowDetailsModal(true);
        await fetchSeanceDetails(
            currentSearchParams.date,
            seance.classeId,
            seance.statut
        );
    }, [currentSearchParams, fetchSeanceDetails]);

    // Gestion de la génération
    const handleGenerate = useCallback(async (date, classeId) => {
        console.log('🔄 Génération séances:', { date, classeId, academicYearId });
        
        const result = await generateSeances(date, classeId, academicYearId);
        
        if (result && result.success) {
            toaster.push(
                <Message type="success" showIcon closable>
                    <strong>Succès !</strong><br />
                    Séances générées avec succès
                </Message>,
                { placement: 'topEnd', duration: 4000 }
            );
            
            setShowOuvertureModal(false);
            setShowRecapModal(true);
            
            // Rafraîchir la liste si on a les paramètres
            if (currentSearchParams) {
                await searchSeances(currentSearchParams.date, currentSearchParams.classeId);
            }
        } else {
            toaster.push(
                <Message type="error" showIcon closable>
                    <strong>Erreur</strong><br />
                    {result?.message || 'Erreur lors de la génération'}
                </Message>,
                { placement: 'topEnd', duration: 5000 }
            );
        }
    }, [academicYearId, generateSeances, currentSearchParams, searchSeances, toaster]);

    // Configuration des colonnes
    const columns = [
        {
            title: 'Date',
            dataKey: 'dateSeance',
            flexGrow: 2,
            minWidth: 120,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => formatDate(value)
        },
        {
            title: 'Classe',
            dataKey: 'classeLibelle',
            flexGrow: 2,
            minWidth: 150,
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'statut',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellType: 'custom',
            customRenderer: (rowData, value) => (
                <Badge color={getStatutColor(value)}>
                    {getStatutLabel(value)}
                </Badge>
            )
        },
        {
            title: 'Action',
            dataKey: 'id',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData) => (
                <div style={{ display: 'flex', gap: 5 }}>
                    <Button
                        size="xs"
                        appearance="primary"
                        style={{ background: '#3b82f6' }}
                        onClick={() => handleShowDetails(rowData)}
                    >
                        <FiList /> Détails
                    </Button>
                    <Button
                        size="xs"
                        appearance="ghost"
                        style={{ color: '#ef4444' }}
                    >
                        🗑️
                    </Button>
                </div>
            )
        }
    ];

    return (
        <div style={{ minHeight: '100vh', padding: '20px 0' }}>
            <div className="container-fluid">
                {/* Formulaire de recherche */}
                <SearchForm
                    onSearch={handleSearch}
                    onClear={handleClearSearch}
                    loading={searchLoading}
                    error={searchError}
                />

                {/* Message d'information */}
                {!searchPerformed && !searchLoading && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 15
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                    borderRadius: '12px',
                                    padding: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiCalendar size={24} color="white" />
                                </div>
                                <div>
                                    <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                        Prêt à consulter les séances ?
                                    </h6>
                                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                        Sélectionnez une date et une classe dans le formulaire ci-dessus
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DataTable */}
                {searchPerformed && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    padding: '20px',
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                                        Liste des séances ouvertes
                                    </h5>
                                    <Button
                                        appearance="primary"
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            border: 'none'
                                        }}
                                        onClick={() => setShowOuvertureModal(true)}
                                    >
                                        <FiPlusCircle /> Ouvrir Séance
                                    </Button>
                                </div>

                                <DataTable
                                    title=""
                                    subtitle="séance(s)"
                                    data={seances}
                                    loading={searchLoading}
                                    columns={columns}
                                    defaultPageSize={20}
                                    tableHeight={600}
                                    enableRefresh={false}
                                    enableCreate={false}
                                    selectable={false}
                                    rowKey="id"
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { border: "none", boxShadow: "none" }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Modals */}
                <SeanceDetailsModal
                    open={showDetailsModal}
                    onClose={() => {
                        setShowDetailsModal(false);
                        clearDetails();
                    }}
                    seance={selectedSeance}
                    details={details}
                    loading={detailsLoading}
                />

                <OuvertureSeanceModal
                    open={showOuvertureModal}
                    onClose={() => setShowOuvertureModal(false)}
                    onGenerate={handleGenerate}
                />

                <RecapitulatifModal
                    open={showRecapModal}
                    onClose={() => {
                        setShowRecapModal(false);
                        clearResult();
                    }}
                    result={generationResult}
                />
            </div>
        </div>
    );
};

export default SeanceManagement;