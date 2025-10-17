import React, { useState, useCallback } from "react";
import {
    SelectPicker,
    Button,
    Row,
    Col,
    Message,
    Loader,
    Steps
} from 'rsuite';
import {
    FiSearch,
    FiRotateCcw,
    FiHash,
    FiPlus
} from 'react-icons/fi';
import { useNiveauxBranchesData } from "../utils/CommonDataService";
import { getUserProfile } from "../../hooks/userUtils";
import IconBox from "../Composant/IconBox";
import GradientButton from '../../GradientButton';


// ===========================
// COMPOSANT DE FORMULAIRE DE RECHERCHE MODERNE AVEC BOUTON AJOUTER
// ===========================
const CoefficientsFilters = ({
    onSearch,
    onClear,
    onAdd,
    loading = false,
    error = null,
    selectedBranche,
    onBrancheChange
}) => {
    const [formError, setFormError] = useState(null);
    const userProfile = getUserProfile();
    const { branches, branchesLoading, branchesError, refetch } = useNiveauxBranchesData();
    const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));

    const handleSearch = useCallback(() => {
        if (!selectedBranche) {
            setFormError('Veuillez sélectionner une branche');
            return;
        }

        setFormError(null);
        if (onSearch) {
            onSearch({ brancheId: selectedBranche });
        }
    }, [selectedBranche, onSearch]);

    const handleClear = useCallback(() => {
        setFormError(null);
        if (onClear) onClear();
    }, [onClear]);

    const handleAdd = useCallback(() => {
        if (!selectedBranche) {
            setFormError('Veuillez sélectionner une branche avant d\'ajouter une matière');
            return;
        }

        setFormError(null);
        if (onAdd) {
            const selectedBrancheData = branches.find(b => b.id === selectedBranche);
            onAdd(selectedBrancheData);
        }
    }, [selectedBranche, onAdd, branches]);

    const isDataLoading = branchesLoading;
    const hasDataError = branchesError;

    // Préparation simple des données pour SelectPicker
    const branchesData = branches.map(branche => ({
        value: branche.id,
        label: branche.label
    }));

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête moderne */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 25,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <IconBox icon={FiHash} />
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Gestion des Coefficients des Matières
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Sélectionnez une branche pour afficher et modifier les coefficients
                    </p>
                </div>
            </div>

            {/* Messages d'erreur compacts */}
            {hasDataError && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="error" showIcon style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                        Erreur de chargement des données
                    </Message>
                </div>
            )}

            {(formError || error) && (
                <div style={{ marginBottom: 20 }}>
                    <Message type="warning" showIcon style={{ background: '#fffbeb', border: '1px solid #fed7aa' }}>
                        {formError || error?.message}
                    </Message>
                </div>
            )}

            {/* Formulaire de filtres */}
            <Row gutter={20}>
                <Col xs={24} sm={16} md={16}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Branche / Niveau *
                        </label>
                        <SelectPicker
                            data={branchesData}
                            value={selectedBranche}
                            onChange={(value) => {
                                onBrancheChange(value);
                            }}
                            placeholder="Choisir une branche"
                            searchable
                            style={{ width: '100%' }}
                            loading={branchesLoading}
                            disabled={branchesLoading || loading}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                <Col xs={24} sm={4} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: 'transparent',
                            fontSize: '14px'
                        }}>
                            Actions
                        </label>
                        <div style={{ display: 'flex', gap: 8, height: '40px' }}>
                             <GradientButton
                                icon={<FiSearch size={16} />}
                                text="Afficher"
                                loadingText="Chargement..."
                                loading={loading}
                                disabled={isDataLoading || loading || !selectedBranche}
                                onClick={handleSearch}
                                variant="primary"
                                style={{ flex: 1 }}
                            />

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

                <Col xs={24} sm={4} md={4}>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 8,
                            fontWeight: '500',
                            color: 'transparent',
                            fontSize: '14px'
                        }}>
                            Ajouter
                        </label>
                        <Button
                            appearance="ghost"
                            onClick={handleAdd}
                            disabled={isDataLoading || loading || !selectedBranche}
                            startIcon={<FiPlus />}
                            style={{
                                width: '100%',
                                borderRadius: '8px',
                                border: `1px solid ${!selectedBranche ? '#e2e8f0' : '#10b981'}`,
                                color: !selectedBranche ? '#94a3b8' : '#10b981',
                                backgroundColor: !selectedBranche ? '#f8fafc' : '#f0fdf4',
                                fontWeight: '500',
                                transition: 'all 0.2s ease'
                            }}
                            size="lg"
                        >
                            Ajouter Matière
                        </Button>
                    </div>
                </Col>
            </Row>

            {/* Indicateur de progression */}
            <div className={`steps-container ${selectedBranche ? `has-branche-${academicYear.niveauEnseignement?.libelle.replace(/[\s()]/g, '')} has-branche-${academicYear.niveauEnseignement?.id}` : `no-branche-${academicYear.niveauEnseignement?.libelle.replace(/[\s()]/g, '')} no-branche-${academicYear.niveauEnseignement?.id}`}`}
                style={{ marginTop: 15 }}
                >
                <Steps
                    current={selectedBranche ? 1 : 0}
                    size="small"
                >
                    <Steps.Item title="Branche" />
                    <Steps.Item title="Coefficients" />
                </Steps>
            </div>


            {/* Loading indicator discret */}
            {isDataLoading && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    marginTop: 15,
                    padding: '10px 15px',
                    background: '#f0f9ff',
                    borderRadius: '8px',
                    border: '1px solid #bae6fd'
                }}>
                    <Loader size="xs" />
                    <span style={{ fontSize: '14px', color: '#0369a1' }}>
                        Chargement des données...
                    </span>
                </div>
            )}
        </div>
    );
};

export default CoefficientsFilters;