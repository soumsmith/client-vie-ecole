import React, { useState, useEffect, useCallback } from 'react';
import {
    Modal,
    SelectPicker,
    InputNumber,
    Button,
    Loader,
    Message,
    Table
} from 'rsuite';
import {
    FiCheckCircle,
    FiX,
    FiSave,
    FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';
import { useNiveauxBranchesData, usePeriodesData, useTypesActiviteData } from "../utils/CommonDataService";
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from "../../hooks/useDynamicParams";

const { Column, HeaderCell, Cell } = Table;

// ===========================
// COMPOSANT MODAL
// ===========================
const EvaluationPeriodeModal = ({
    show,
    evaluation,
    onClose,
    onSave
}) => {
    // ===========================
    // HOOKS CUSTOM POUR LES DONNÉES
    // ===========================
    const { branches: rawBranches, loading: branchesLoading, error: branchesError } = useNiveauxBranchesData();
    const { periodes: rawPeriodes, loading: periodesLoading, error: periodesError } = usePeriodesData();
    const { typesActivite: rawTypesActivite, loading: typesActiviteLoading, error: typesActiviteError } = useTypesActiviteData();
    const apiUrls = useAllApiUrls();
    const {
            ecoleId: dynamicEcoleId,
            personnelInfo,
            academicYearId: dynamicAcademicYearId,
            periodicitieId: dynamicPeriodicitieId,
            profileId,
            userId: dynamicUserId,
            email,
            isAuthenticated,
            isInitialized,
            isReady,
        } = usePulsParams();
    

    // Transformation des données pour s'assurer du bon format (label/value)
    const branches = React.useMemo(() => {
        if (!rawBranches || rawBranches.length === 0) return [];
        if (rawBranches[0]?.label !== undefined) return rawBranches;

        return rawBranches.map(branche => ({
            label: branche.libelle || branche.label,
            value: branche.id || branche.value,
            data: branche
        }));
    }, [rawBranches]);

    const periodes = React.useMemo(() => {
        if (!rawPeriodes || rawPeriodes.length === 0) return [];
        if (rawPeriodes[0]?.label !== undefined) return rawPeriodes;

        return rawPeriodes.map(periode => ({
            label: periode.libelle || periode.label,
            value: periode.id || periode.value,
            data: periode
        }));
    }, [rawPeriodes]);

    const typesActivite = React.useMemo(() => {
        if (!rawTypesActivite || rawTypesActivite.length === 0) return [];
        if (rawTypesActivite[0]?.label !== undefined) return rawTypesActivite;

        return rawTypesActivite.map(type => ({
            label: type.libelle || type.label,
            value: type.id || type.value,
            data: type
        }));
    }, [rawTypesActivite]);

    // ===========================
    // ÉTATS
    // ===========================
    const [formData, setFormData] = useState({
        periode: null,
        niveau: null,
        typeEvaluation: null,
        numero: 0
    });

    const [evaluationsEnregistrees, setEvaluationsEnregistrees] = useState([]);
    const [loadingEvaluations, setLoadingEvaluations] = useState(false);
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    // ===========================
    // CHARGEMENT DES ÉVALUATIONS ENREGISTRÉES
    // ===========================
    const loadEvaluationsEnregistrees = useCallback(async () => {
        if (!formData.periode || !formData.niveau) {
            setEvaluationsEnregistrees([]);
            return;
        }

        setLoadingEvaluations(true);
        try {
            const response = await axios.get(apiUrls.notes.getEvalutionsByPeriodeEtBranche(formData.periode, formData.niveau));
            setEvaluationsEnregistrees(response.data || []);
        } catch (error) {
            console.error('Erreur lors du chargement des évaluations:', error);
            setEvaluationsEnregistrees([]);
        } finally {
            setLoadingEvaluations(false);
        }
    }, [apiUrls, formData.periode, formData.niveau]);

    // ===========================
    // EFFETS
    // ===========================
    useEffect(() => {
        if (show && formData.periode && formData.niveau) {
            loadEvaluationsEnregistrees();
        }
    }, [show, formData.periode, formData.niveau, loadEvaluationsEnregistrees]);

    useEffect(() => {
        if (evaluation) {
            setFormData({
                periode: evaluation.periode_id,
                niveau: evaluation.niveau_id,
                typeEvaluation: evaluation.typeEvaluation_id,
                numero: evaluation.numero
            });
        } else {
            setFormData({
                periode: null,
                niveau: null,
                typeEvaluation: null,
                numero: 0
            });
        }
        setErrors({});
    }, [evaluation, show]);

    // ===========================
    // GESTION DES CHANGEMENTS
    // ===========================
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => ({ ...prev, [field]: null }));
    };

    // ===========================
    // VALIDATION
    // ===========================
    const validate = () => {
        const newErrors = {};

        if (!formData.periode) {
            newErrors.periode = 'Veuillez sélectionner une période';
        }
        if (!formData.niveau) {
            newErrors.niveau = 'Veuillez sélectionner un niveau';
        }
        if (!formData.typeEvaluation) {
            newErrors.typeEvaluation = 'Veuillez sélectionner un type d\'évaluation';
        }
        if (!formData.numero || formData.numero <= 0) {
            newErrors.numero = 'Le numéro doit être supérieur à 0';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // ===========================
    // SOUMISSION
    // ===========================
    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        setSubmitting(true);

        try {
            // Récupérer les libellés depuis les données des hooks
            const periodeLibelle = periodes.find(p => p.value === formData.periode)?.label || '';
            const niveauLibelle = branches.find(n => n.value === formData.niveau)?.label || '';
            const typeEvaluationLibelle = typesActivite.find(t => t.value === formData.typeEvaluation)?.label || '';

            const payload = {
                annee: {
                    id: dynamicAcademicYearId.toString()
                },
                niveau: {
                    id: formData.niveau
                },
                ecole: {
                    id: dynamicEcoleId.toString()
                },
                numero: formData.numero,
                periode: {
                    id: formData.periode
                },
                typeEvaluation: {
                    id: formData.typeEvaluation
                },
                user: dynamicUserId // ID utilisateur à adapter
            };

            // Appeler la fonction onSave avec les données et les labels
            await onSave({
                payload,
                periodeLibelle,
                niveauLibelle,
                typeEvaluationLibelle,
                numero: formData.numero
            });
        } catch (error) {
            console.error('Erreur lors de la soumission:', error);
        } finally {
            setSubmitting(false);
        }
    };

    // ===========================
    // FERMETURE
    // ===========================
    const handleClose = () => {
        if (!submitting) {
            onClose();
        }
    };

    // ===========================
    // RENDU
    // ===========================
    return (
        <Modal
            open={show}
            onClose={handleClose}
            size="lg"
            overflow={true}
        >
            <Modal.Header>
                <Modal.Title>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '8px',
                            padding: '6px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <FiCheckCircle color="white" size={18} />
                        </div>
                        <span>Définition des évaluations par période</span>
                    </div>
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: '20px' }}>
                {/* Affichage des erreurs de chargement des données */}
                {(branchesError || periodesError || typesActiviteError) && (
                    <Message
                        type="error"
                        showIcon
                        style={{ marginBottom: '15px' }}
                    >
                        Erreur lors du chargement des données. Veuillez réessayer.
                    </Message>
                )}

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 2fr',
                    gap: '20px',
                    minHeight: '400px'
                }}>
                    {/* Colonne gauche - Formulaire */}
                    <div style={{
                        borderRight: '1px solid #e2e8f0',
                        paddingRight: '20px'
                    }}>
                        <h6 style={{
                            marginBottom: '15px',
                            color: '#1e293b',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            Période
                        </h6>
                        <SelectPicker
                            data={periodes || []}
                            value={formData.periode}
                            onChange={(value) => handleChange('periode', value)}
                            placeholder="Sélectionner la période"
                            loading={periodesLoading}
                            block
                            cleanable={false}
                            searchable={false}
                            style={{ marginBottom: '15px' }}
                        />
                        {errors.periode && (
                            <Message
                                type="error"
                                showIcon
                                style={{ marginBottom: '15px', fontSize: '12px' }}
                            >
                                {errors.periode}
                            </Message>
                        )}

                        <h6 style={{
                            marginBottom: '15px',
                            color: '#1e293b',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            Niveau
                        </h6>
                        <SelectPicker
                            data={branches || []}
                            value={formData.niveau}
                            onChange={(value) => handleChange('niveau', value)}
                            placeholder="Sélectionner le niveau"
                            loading={branchesLoading}
                            block
                            cleanable={false}
                            searchable={true}
                            style={{ marginBottom: '15px' }}
                        />
                        {errors.niveau && (
                            <Message
                                type="error"
                                showIcon
                                style={{ marginBottom: '15px', fontSize: '12px' }}
                            >
                                {errors.niveau}
                            </Message>
                        )}

                        <h6 style={{
                            marginBottom: '15px',
                            color: '#1e293b',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            Type d'évaluation
                        </h6>
                        <SelectPicker
                            data={typesActivite || []}
                            value={formData.typeEvaluation}
                            onChange={(value) => handleChange('typeEvaluation', value)}
                            placeholder="Sélectionner le type d'é..."
                            loading={typesActiviteLoading}
                            block
                            cleanable={false}
                            searchable={false}
                            style={{ marginBottom: '15px' }}
                        />
                        {errors.typeEvaluation && (
                            <Message
                                type="error"
                                showIcon
                                style={{ marginBottom: '15px', fontSize: '12px' }}
                            >
                                {errors.typeEvaluation}
                            </Message>
                        )}

                        <h6 style={{
                            marginBottom: '15px',
                            color: '#1e293b',
                            fontWeight: '600',
                            fontSize: '14px'
                        }}>
                            Numéro de l'évaluation
                        </h6>
                        <InputNumber
                            value={formData.numero}
                            onChange={(value) => handleChange('numero', value)}
                            placeholder="0"
                            min={0}
                            style={{ width: '100%', marginBottom: '15px' }}
                        />
                        {errors.numero && (
                            <Message
                                type="error"
                                showIcon
                                style={{ marginBottom: '15px', fontSize: '12px' }}
                            >
                                {errors.numero}
                            </Message>
                        )}
                    </div>

                    {/* Colonne droite - Tableau */}
                    <div>
                        <h6 style={{
                            marginBottom: '15px',
                            color: '#1e293b',
                            fontWeight: '600',
                            fontSize: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            Evaluations périodes Enregistrées
                            {loadingEvaluations && <Loader size="xs" />}
                        </h6>

                        {!formData.periode || !formData.niveau ? (
                            <div style={{
                                background: '#f8fafc',
                                border: '1px dashed #cbd5e1',
                                borderRadius: '8px',
                                padding: '30px',
                                textAlign: 'center',
                                color: '#64748b',
                                fontSize: '13px'
                            }}>
                                <FiAlertCircle size={24} style={{ marginBottom: '10px', opacity: 0.5 }} />
                                <p style={{ margin: 0 }}>
                                    Sélectionnez une période et un niveau pour voir les évaluations
                                </p>
                            </div>
                        ) : evaluationsEnregistrees.length === 0 ? (
                            <div style={{
                                background: '#fef3c7',
                                border: '1px solid #fde68a',
                                borderRadius: '8px',
                                padding: '20px',
                                textAlign: 'center',
                                color: '#92400e',
                                fontSize: '13px'
                            }}>
                                <p style={{ margin: 0, fontWeight: '500' }}>
                                    Aucune donnée
                                </p>
                            </div>
                        ) : (
                            <div style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}>
                                <Table
                                    data={evaluationsEnregistrees}
                                    autoHeight
                                    bordered
                                    cellBordered
                                    headerHeight={40}
                                    rowHeight={45}
                                >
                                    <Column width={80} align="center">
                                        <HeaderCell style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Année
                                        </HeaderCell>
                                        <Cell style={{ fontSize: '12px' }}>
                                            {rowData => rowData.annee?.libelle || '-'}
                                        </Cell>
                                    </Column>

                                    <Column width={100} align="center">
                                        <HeaderCell style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Période
                                        </HeaderCell>
                                        <Cell style={{ fontSize: '12px' }}>
                                            {rowData => rowData.periode?.libelle || '-'}
                                        </Cell>
                                    </Column>

                                    <Column flexGrow={1}>
                                        <HeaderCell style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Niveau
                                        </HeaderCell>
                                        <Cell style={{ fontSize: '12px' }}>
                                            {rowData => rowData.niveau?.libelle || '-'}
                                        </Cell>
                                    </Column>

                                    <Column width={120}>
                                        <HeaderCell style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Type Eval.
                                        </HeaderCell>
                                        <Cell style={{ fontSize: '12px' }}>
                                            {rowData => rowData.typeEvaluation?.libelle || '-'}
                                        </Cell>
                                    </Column>

                                    <Column width={80} align="center">
                                        <HeaderCell style={{ fontSize: '12px', fontWeight: '600' }}>
                                            Numéro
                                        </HeaderCell>
                                        <Cell style={{ fontSize: '12px', fontWeight: '600' }}>
                                            {rowData => (
                                                <span style={{
                                                    background: '#e0f2fe',
                                                    color: '#0369a1',
                                                    padding: '2px 8px',
                                                    borderRadius: '4px'
                                                }}>
                                                    {rowData.numero || 0}
                                                </span>
                                            )}
                                        </Cell>
                                    </Column>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button
                    onClick={handleClose}
                    appearance="subtle"
                    disabled={submitting}
                    startIcon={<FiX />}
                >
                    Annuler
                </Button>
                <Button
                    onClick={handleSubmit}
                    appearance="primary"
                    style={{
                        background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                        border: 'none'
                    }}
                    loading={submitting}
                    disabled={submitting}
                    startIcon={<FiSave />}
                >
                    Enregistrer
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EvaluationPeriodeModal;