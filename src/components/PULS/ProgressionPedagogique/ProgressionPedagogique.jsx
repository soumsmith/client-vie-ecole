import React, { useState, useEffect, useCallback } from "react";
import {
    Button,
    Modal,
    Row,
    Col,
    Message,
    Loader,
    Badge,
    SelectPicker,
    Uploader,
    IconButton,
    Table,
    Panel,
    Form,
    Input,
    InputNumber,
    DatePicker,
    Notification
} from 'rsuite';
import {
    FiUpload,
    FiDownload,
    FiFile,
    FiCheck,
    FiX,
    FiRefreshCw,
    FiEye,
    FiTrash2,
    FiEdit,
    FiPlus,
    FiBook,
    FiCalendar,
    FiClock,
    FiHash,
    FiSave,
    FiLayers,
    FiBookOpen
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useAllApiUrls } from '../utils/apiConfig';
import { getFromCache, setToCache } from '../utils/cacheUtils';
import { usePulsParams } from '../../hooks/useDynamicParams';
import axios from 'axios';
import getFullUrl from "../../hooks/urlUtils";

const { Column, HeaderCell, Cell } = Table;

// ===========================
// STYLES MODERNES
// ===========================
const modernStyles = {
    // Palette de couleurs harmonieuse
    colors: {
        primary: '#6366F1', // Indigo moderne
        primaryLight: '#818CF8',
        primaryDark: '#4F46E5',
        secondary: '#F3F4F6',
        accent: '#10B981', // Emerald
        warning: '#F59E0B',
        danger: '#EF4444',
        text: {
            primary: '#111827',
            secondary: '#6B7280',
            light: '#9CA3AF'
        },
        background: {
            main: '#FAFBFC',
            card: '#FFFFFF',
            subtle: '#F9FAFB'
        },
        border: {
            light: '#E5E7EB',
            medium: '#D1D5DB'
        }
    },
    
    // Espacements cohérents
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '48px'
    },
    
    // Ombres modernes
    shadows: {
        sm: '0 1px 3px rgba(0, 0, 0, 0.05)',
        md: '0 4px 12px rgba(0, 0, 0, 0.08)',
        lg: '0 8px 25px rgba(0, 0, 0, 0.12)',
        colored: '0 4px 20px rgba(99, 102, 241, 0.15)'
    },
    
    // Border radius
    radius: {
        sm: '6px',
        md: '12px',
        lg: '16px',
        xl: '20px',
        full: '9999px'
    }
};

// ===========================
// CONFIGURATION GLOBALE
// ===========================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// ===========================
// HOOKS PERSONNALISÉS (gardés identiques)
// ===========================

const useNiveauxEnseignement = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchNiveaux = useCallback(async () => {
        const cacheKey = 'niveaux-enseignement';

        try {
            setLoading(true);
            setError(null);

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setNiveaux(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${getFullUrl()}niveau-enseignement/list`);

            const formattedData = response.data.map(niveau => ({
                value: niveau.id,
                label: niveau.libelle,
                code: niveau.code
            }));

            setToCache(cacheKey, formattedData, CACHE_DURATION);
            setNiveaux(formattedData);
        } catch (err) {
            console.error('Erreur lors de la récupération des niveaux:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des niveaux',
                type: err.name || 'NetworkError',
                code: err.response?.status || err.code
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls]);

    useEffect(() => {
        fetchNiveaux();
    }, [fetchNiveaux]);

    return { niveaux, loading, error, refetch: fetchNiveaux };
};

const usePeriodes = () => {
    const [periodes, setPeriodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchPeriodes = useCallback(async () => {
        const cacheKey = 'periodes-list';

        try {
            setLoading(true);
            setError(null);

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setPeriodes(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${getFullUrl()}periodes/list`);

            const formattedData = response.data.map(periode => ({
                value: periode.id,
                label: periode.libelle,
                coef: periode.coef,
                niveau: periode.niveau
            }));

            setToCache(cacheKey, formattedData, CACHE_DURATION);
            setPeriodes(formattedData);
        } catch (err) {
            console.error('Erreur lors de la récupération des périodes:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des périodes',
                type: err.name || 'NetworkError',
                code: err.response?.status || err.code
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls]);

    useEffect(() => {
        fetchPeriodes();
    }, [fetchPeriodes]);

    return { periodes, loading, error, refetch: fetchPeriodes };
};

const useNiveauData = (niveauId) => {
    const [branches, setBranches] = useState([]);
    const [matieres, setMatieres] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchNiveauData = useCallback(async () => {
        if (!niveauId) {
            setBranches([]);
            setMatieres([]);
            setAnnees([]);
            return;
        }

        const cacheKey = `niveau-data-${niveauId}`;

        try {
            setLoading(true);
            setError(null);

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setBranches(cachedData.branches);
                setMatieres(cachedData.matieres);
                setAnnees(cachedData.annees);
                setLoading(false);
                return;
            }

            const [branchesResponse, matieresResponse, anneesResponse] = await Promise.all([
                axios.get(`${getFullUrl()}branche/get-by-niveau-enseignement-projection?niveau=${niveauId}`),
                axios.get(`${getFullUrl()}matiere/get-by-niveau-enseignement-projection?niveau=${niveauId}`),
                axios.get(`${getFullUrl()}annee/list-to-central-niveau-enseignement-projection?niveau=${niveauId}`)
            ]);

            const formattedBranches = branchesResponse.data.map(branche => ({
                value: branche.id,
                label: branche.libelle
            }));

            const formattedMatieres = matieresResponse.data.map(matiere => ({
                value: matiere.id,
                label: matiere.libelle
            }));

            const formattedAnnees = anneesResponse.data.map(annee => ({
                value: annee.id,
                label: annee.libelle
            }));

            const dataToCache = {
                branches: formattedBranches,
                matieres: formattedMatieres,
                annees: formattedAnnees
            };

            setToCache(cacheKey, dataToCache, CACHE_DURATION);
            setBranches(formattedBranches);
            setMatieres(formattedMatieres);
            setAnnees(formattedAnnees);
        } catch (err) {
            console.error('Erreur lors de la récupération des données du niveau:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des données',
                type: err.name || 'NetworkError',
                code: err.response?.status || err.code
            });
        } finally {
            setLoading(false);
        }
    }, [niveauId, apiUrls]);

    useEffect(() => {
        fetchNiveauData();
    }, [fetchNiveauData]);

    return { branches, matieres, annees, loading, error, refetch: fetchNiveauData };
};

const useAnneesGlobales = () => {
    const [annees, setAnnees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchAnnees = useCallback(async () => {
        const cacheKey = 'annees-globales';

        try {
            setLoading(true);
            setError(null);

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setAnnees(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${getFullUrl()}annee/list-to-central`);

            const formattedData = response.data.map(annee => ({
                value: annee.id,
                label: annee.customLibelle + " - " + annee.niveauEnseignement.libelle,
            }));

            setToCache(cacheKey, formattedData, CACHE_DURATION);
            setAnnees(formattedData);
        } catch (err) {
            console.error('Erreur lors de la récupération des années:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des années',
                type: err.name || 'NetworkError',
                code: err.response?.status || err.code
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls]);

    useEffect(() => {
        fetchAnnees();
    }, [fetchAnnees]);

    return { annees, loading, error, refetch: fetchAnnees };
};

const useProgressionDetails = () => {
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDetails = useCallback(async (progressionId) => {
        if (!progressionId) return;

        try {
            setLoading(true);
            setError(null);

            const response = await axios.get(`${getFullUrl()}detail-progression/get-by-progression/${progressionId}`);
            setDetails(response.data);
        } catch (err) {
            console.error('Erreur lors de la récupération des détails:', err);
            setError({
                message: err.response?.data?.message || err.message || 'Erreur lors du chargement des détails',
                type: err.name || 'NetworkError',
                code: err.response?.status || err.code
            });
        } finally {
            setLoading(false);
        }
    }, []);

    return { details, loading, error, fetchDetails, setDetails };
};

// ===========================
// COMPOSANTS PERSONNALISÉS
// ===========================

// Carte moderne avec animation
const ModernCard = ({ children, className = '', hover = false, ...props }) => {
    const baseStyle = {
        background: modernStyles.colors.background.card,
        borderRadius: modernStyles.radius.lg,
        border: `1px solid ${modernStyles.colors.border.light}`,
        boxShadow: modernStyles.shadows.sm,
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        ...props.style
    };

    const hoverStyle = hover ? {
        ':hover': {
            boxShadow: modernStyles.shadows.md,
            transform: 'translateY(-2px)',
            borderColor: modernStyles.colors.border.medium
        }
    } : {};

    return (
        <div 
            {...props}
            style={{...baseStyle, ...hoverStyle}}
            className={`modern-card ${className}`}
        >
            {children}
        </div>
    );
};

// Bouton moderne personnalisé
const ModernButton = ({ children, variant = 'primary', size = 'md', icon, loading, ...props }) => {
    const variants = {
        primary: {
            background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
            color: 'white',
            border: 'none',
            boxShadow: modernStyles.shadows.colored
        },
        secondary: {
            background: modernStyles.colors.background.card,
            color: modernStyles.colors.text.primary,
            border: `1px solid ${modernStyles.colors.border.light}`,
            boxShadow: modernStyles.shadows.sm
        },
        outline: {
            background: 'transparent',
            color: modernStyles.colors.primary,
            border: `1px solid ${modernStyles.colors.primary}`,
            boxShadow: 'none'
        }
    };

    const sizes = {
        sm: { padding: '8px 16px', fontSize: '14px' },
        md: { padding: '12px 24px', fontSize: '15px' },
        lg: { padding: '16px 32px', fontSize: '16px' }
    };

    return (
        <Button
            {...props}
            style={{
                ...variants[variant],
                ...sizes[size],
                borderRadius: modernStyles.radius.md,
                fontWeight: '500',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                alignItems: 'center',
                gap: icon ? '8px' : '0',
                ...props.style
            }}
            startIcon={icon}
            loading={loading}
        >
            {children}
        </Button>
    );
};

// En-tête avec gradient
const GradientHeader = ({ title, subtitle, action }) => (
    <ModernCard style={{
        background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
        color: 'white',
        border: 'none',
        marginBottom: modernStyles.spacing.lg
    }}>
        <div style={{ 
            padding: modernStyles.spacing.xl,
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
        }}>
            <div style={{ flex: 1 }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: modernStyles.spacing.md,
                    marginBottom: modernStyles.spacing.sm
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: modernStyles.radius.md,
                        padding: modernStyles.spacing.md,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <FiBookOpen size={24} />
                    </div>
                    <h1 style={{
                        margin: 0,
                        fontSize: '28px',
                        fontWeight: '700',
                        letterSpacing: '-0.025em'
                    }}>
                        {title}
                    </h1>
                </div>
                <p style={{
                    margin: 0,
                    fontSize: '16px',
                    opacity: 0.9,
                    fontWeight: '400'
                }}>
                    {subtitle}
                </p>
            </div>
            {action && (
                <div>
                    {action}
                </div>
            )}
        </div>
    </ModernCard>
);

// ===========================
// COMPOSANT PRINCIPAL REDESIGNÉ
// ===========================
const ProgressionPedagogique = () => {
    // États principaux (gardés identiques)
    const [showLoadModal, setShowLoadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [progressions, setProgressions] = useState([]);
    const [selectedAnnee, setSelectedAnnee] = useState(null);
    const [selectedProgression, setSelectedProgression] = useState(null);
    const [loading, setLoading] = useState(false);

    const [selectedNiveau, setSelectedNiveau] = useState(null);
    const [selectedAnneeModal, setSelectedAnneeModal] = useState(null);
    const [selectedBranche, setSelectedBranche] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [fileData, setFileData] = useState([]);
    const [fileInfo, setFileInfo] = useState(null);

    // Hooks (gardés identiques)
    const { niveaux, loading: niveauxLoading, error: niveauxError } = useNiveauxEnseignement();
    const { periodes, loading: periodesLoading, error: periodesError } = usePeriodes();
    const { annees: anneesGlobales, loading: anneesLoading } = useAnneesGlobales();
    const { branches, matieres, annees: anneesNiveau, loading: niveauDataLoading } = useNiveauData(selectedNiveau);
    const { details: progressionDetails, loading: detailsLoading, fetchDetails, setDetails } = useProgressionDetails();

    const {
        ecoleId: dynamicEcoleId,
        academicYearId: dynamicAcademicYearId
    } = usePulsParams();

    const apiUrls = useAllApiUrls();

    // Fonctions (gardées identiques mais appelées avec le nouveau design)
    const loadProgressionsByAnnee = useCallback(async (anneeId) => {
        if (!anneeId) return;

        const cacheKey = `progressions-${anneeId}-${dynamicEcoleId}`;

        try {
            setLoading(true);

            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
                setProgressions(cachedData);
                setLoading(false);
                return;
            }

            const response = await axios.get(`${getFullUrl()}progression/get-by-annee/${anneeId}`);

            const processedData = response.data.map((item, index) => ({
                id: item.id || `progression-${index}`,
                branche: item.branche?.libelle || 'Non définie',
                matiere: item.matiere?.libelle || 'Non définie',
                annee: item.annee,
                niveau: item.niveau,
                raw_data: item
            }));

            setToCache(cacheKey, processedData, CACHE_DURATION);
            setProgressions(processedData);
        } catch (error) {
            console.error('Erreur chargement progressions:', error);
            Notification.error({
                title: 'Erreur',
                description: error.response?.data?.message || 'Erreur lors du chargement des progressions'
            });
        } finally {
            setLoading(false);
        }
    }, [apiUrls, dynamicEcoleId]);

    // Fonctions de gestion des fichiers (gardées identiques)
    const parseFile = (file) => {
        const fileExtension = file.name.toLowerCase().split('.').pop();

        if (fileExtension === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                dynamicTyping: true,
                complete: (results) => {
                    setFileData(results.data);
                    setFileInfo({ name: file.name, size: file.size });
                },
                error: (error) => {
                    Notification.error({
                        title: 'Erreur de lecture',
                        description: 'Erreur lors de la lecture du fichier CSV'
                    });
                }
            });
        } else if (['xls', 'xlsx'].includes(fileExtension)) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                    const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                    setFileData(jsonData);
                    setFileInfo({ name: file.name, size: file.size });
                } catch (error) {
                    Notification.error({
                        title: 'Erreur de lecture',
                        description: 'Erreur lors de la lecture du fichier Excel'
                    });
                }
            };
            reader.readAsArrayBuffer(file);
        }
    };

    const handleFileUpload = (fileList) => {
        if (fileList.length > 0) {
            parseFile(fileList[0].blobFile);
        }
    };

    // Composants de cellules (gardés identiques)
    const PeriodeCell = ({ rowData, dataKey, onChange, ...props }) => {
        return (
            <Cell {...props}>
                <SelectPicker
                    data={periodes}
                    value={rowData[dataKey]?.id || rowData[dataKey]}
                    onChange={(value) => onChange && onChange(rowData, dataKey, value)}
                    size="sm"
                    cleanable={false}
                    style={{ width: '100%' }}
                />
            </Cell>
        );
    };

    const DateCell = ({ rowData, dataKey, onChange, ...props }) => {
        let dateValue = null;
        if (rowData[dataKey]) {
            if (typeof rowData[dataKey] === 'string') {
                const parts = rowData[dataKey].split('/');
                if (parts.length === 3) {
                    dateValue = new Date(parts[2], parts[1] - 1, parts[0]);
                }
            } else {
                dateValue = new Date(rowData[dataKey]);
            }
        }

        return (
            <Cell {...props}>
                <DatePicker
                    value={dateValue}
                    onChange={(value) => onChange && onChange(rowData, dataKey, value)}
                    format="dd/MM/yyyy"
                    size="sm"
                    style={{ width: '100%' }}
                />
            </Cell>
        );
    };

    const EditableCell = ({ rowData, dataKey, onChange, ...props }) => {
        return (
            <Cell {...props}>
                <Input
                    value={rowData[dataKey] || ''}
                    onChange={(value) => onChange && onChange(rowData, dataKey, value)}
                    size="sm"
                />
            </Cell>
        );
    };

    const NumberCell = ({ rowData, dataKey, onChange, ...props }) => {
        return (
            <Cell {...props}>
                <InputNumber
                    value={rowData[dataKey] || 0}
                    onChange={(value) => onChange && onChange(rowData, dataKey, value)}
                    size="sm"
                    min={0}
                />
            </Cell>
        );
    };

    // Fonctions de gestion (gardées identiques)
    const handleTableChange = (rowData, dataKey, value) => {
        const newData = fileData.map(item =>
            item === rowData ? { ...item, [dataKey]: value } : item
        );
        setFileData(newData);
    };

    const handleProgressionDetailsChange = (rowData, dataKey, value) => {
        const newDetails = progressionDetails.map(item =>
            item === rowData ? { ...item, [dataKey]: value } : item
        );
        setDetails(newDetails);
    };

    const handleEditProgression = (progression) => {
        setSelectedProgression(progression);
        fetchDetails(progression.id);
        setShowEditModal(true);
    };

    const handleSaveModifications = async () => {
        if (!selectedProgression) return;

        try {
            setLoading(true);

            const dataToSave = {
                progressionId: selectedProgression.id,
                details: progressionDetails.map(detail => ({
                    ...detail,
                    dateDeb: typeof detail.dateDeb === 'object' ?
                        detail.dateDeb.toLocaleDateString('fr-FR') : detail.dateDeb,
                    dateFin: typeof detail.dateFin === 'object' ?
                        detail.dateFin.toLocaleDateString('fr-FR') : detail.dateFin
                }))
            };

            await axios.put(`${getFullUrl()}progression/${selectedProgression.id}/update-details`, dataToSave);

            Notification.success({
                title: 'Succès',
                description: 'Modifications sauvegardées avec succès'
            });

            setShowEditModal(false);
            setSelectedProgression(null);

            if (selectedAnnee) {
                loadProgressionsByAnnee(selectedAnnee);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Notification.error({
                title: 'Erreur de sauvegarde',
                description: error.response?.data?.message || 'Erreur lors de la sauvegarde des modifications'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedNiveau || !selectedAnneeModal || !selectedBranche || !selectedMatiere) {
            Notification.error({
                title: 'Erreur de validation',
                description: 'Veuillez remplir tous les champs obligatoires'
            });
            return;
        }

        if (fileData.length === 0) {
            Notification.error({
                title: 'Erreur de validation',
                description: 'Veuillez importer un fichier avec des données'
            });
            return;
        }

        try {
            setLoading(true);

            const progressionData = {
                niveauId: selectedNiveau,
                anneeId: selectedAnneeModal,
                brancheId: selectedBranche,
                matiereId: selectedMatiere,
                ecoleId: dynamicEcoleId,
                academicYearId: dynamicAcademicYearId,
                details: fileData
            };

            const response = await axios.post(`${getFullUrl()}progression/save`, progressionData);

            Notification.success({
                title: 'Succès',
                description: 'Progression sauvegardée avec succès'
            });

            setShowLoadModal(false);
            resetForm();

            if (selectedAnnee) {
                loadProgressionsByAnnee(selectedAnnee);
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);
            Notification.error({
                title: 'Erreur de sauvegarde',
                description: error.response?.data?.message || 'Erreur lors de la sauvegarde de la progression'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedNiveau(null);
        setSelectedAnneeModal(null);
        setSelectedBranche(null);
        setSelectedMatiere(null);
        setFileData([]);
        setFileInfo(null);
    };

    return (
        <div style={{
            background: `linear-gradient(135deg, ${modernStyles.colors.background.main} 0%, #F8FAFC 100%)`,
            minHeight: '100vh',
            padding: modernStyles.spacing.lg
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
                {/* En-tête moderne avec gradient */}
                <GradientHeader
                    title="Progressions Pédagogiques"
                    subtitle="Gérez et suivez efficacement les progressions pédagogiques par matière et niveau"
                    action={
                        <ModernButton
                            size="lg"
                            icon={<FiPlus size={20} />}
                            onClick={() => setShowLoadModal(true)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255, 255, 255, 0.3)',
                                color: 'white',
                                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            Nouvelle Progression
                        </ModernButton>
                    }
                />

                {/* Sélection année scolaire */}
                <ModernCard style={{
                    padding: modernStyles.spacing.xl,
                    marginBottom: modernStyles.spacing.lg
                }}>
                    <Row gutter={32} style={{ alignItems: 'center' }}>
                        <Col xs={6}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: modernStyles.spacing.md
                            }}>
                                <div style={{
                                    background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                                    borderRadius: modernStyles.radius.md,
                                    padding: modernStyles.spacing.md,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiCalendar size={20} />
                                </div>
                                <div>
                                    <h3 style={{
                                        margin: 0,
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '18px',
                                        fontWeight: '600'
                                    }}>
                                        Année Scolaire
                                    </h3>
                                    <p style={{
                                        margin: '2px 0 0 0',
                                        color: modernStyles.colors.text.secondary,
                                        fontSize: '14px'
                                    }}>
                                        Sélectionnez la période
                                    </p>
                                </div>
                            </div>
                        </Col>
                        <Col xs={18}>
                            <SelectPicker
                                data={anneesGlobales}
                                value={selectedAnnee}
                                onChange={(value) => {
                                    setSelectedAnnee(value);
                                    if (value) {
                                        loadProgressionsByAnnee(value);
                                    }
                                }}
                                placeholder="Sélectionner l'année scolaire..."
                                style={{ 
                                    width: '100%',
                                }}
                                size="lg"
                                cleanable={false}
                                loading={anneesLoading}
                            />
                        </Col>
                    </Row>
                </ModernCard>

                {/* Tableau des progressions modernisé */}
                <ModernCard style={{ overflow: 'hidden' }}>
                    <div style={{
                        background: `linear-gradient(135deg, ${modernStyles.colors.background.subtle} 0%, #FFFFFF 100%)`,
                        padding: modernStyles.spacing.lg,
                        borderBottom: `1px solid ${modernStyles.colors.border.light}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: modernStyles.spacing.md
                        }}>
                            <div style={{
                                background: `linear-gradient(135deg, ${modernStyles.colors.accent} 0%, #34D399 100%)`,
                                borderRadius: modernStyles.radius.md,
                                padding: modernStyles.spacing.sm,
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FiLayers size={20} />
                            </div>
                            <div>
                                <h3 style={{
                                    margin: 0,
                                    color: modernStyles.colors.text.primary,
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }}>
                                    Liste des Progressions
                                </h3>
                                <p style={{
                                    margin: '2px 0 0 0',
                                    color: modernStyles.colors.text.secondary,
                                    fontSize: '14px'
                                }}>
                                    {progressions.length} progression{progressions.length !== 1 ? 's' : ''} trouvée{progressions.length !== 1 ? 's' : ''}
                                </p>
                            </div>
                        </div>

                        {selectedAnnee && (
                            <ModernButton
                                variant="outline"
                                size="sm"
                                icon={<FiRefreshCw size={16} />}
                                onClick={() => loadProgressionsByAnnee(selectedAnnee)}
                                loading={loading}
                            >
                                Actualiser
                            </ModernButton>
                        )}
                    </div>

                    <div style={{ padding: 0 }}>
                        <Table
                            height={500}
                            data={progressions}
                            loading={loading}
                            style={{ 
                                borderRadius: 0,
                                '--rs-table-border-color': modernStyles.colors.border.light
                            }}
                        >
                            <Column width={250} fixed>
                                <HeaderCell style={{
                                    background: modernStyles.colors.background.subtle,
                                    color: modernStyles.colors.text.primary,
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    padding: '16px'
                                }}>
                                    Branche
                                </HeaderCell>
                                <Cell dataKey="branche" style={{ padding: '16px' }} />
                            </Column>

                            <Column flexGrow={1}>
                                <HeaderCell style={{
                                    background: modernStyles.colors.background.subtle,
                                    color: modernStyles.colors.text.primary,
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    padding: '16px'
                                }}>
                                    Matière
                                </HeaderCell>
                                <Cell dataKey="matiere" style={{ padding: '16px' }} />
                            </Column>

                            <Column width={140} fixed="right">
                                <HeaderCell style={{
                                    background: modernStyles.colors.background.subtle,
                                    color: modernStyles.colors.text.primary,
                                    fontWeight: '600',
                                    fontSize: '14px',
                                    padding: '16px'
                                }}>
                                    Actions
                                </HeaderCell>
                                <Cell style={{ padding: '16px' }}>
                                    {rowData => (
                                        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                                            <IconButton
                                                icon={<FiEdit />}
                                                size="sm"
                                                appearance="subtle"
                                                style={{
                                                    background: modernStyles.colors.primary,
                                                    color: 'white',
                                                    borderRadius: modernStyles.radius.sm,
                                                    border: 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                                onClick={() => handleEditProgression(rowData)}
                                            />
                                            <IconButton
                                                icon={<FiTrash2 />}
                                                size="sm"
                                                appearance="subtle"
                                                style={{
                                                    background: modernStyles.colors.danger,
                                                    color: 'white',
                                                    borderRadius: modernStyles.radius.sm,
                                                    border: 'none',
                                                    transition: 'all 0.2s ease'
                                                }}
                                            />
                                        </div>
                                    )}
                                </Cell>
                            </Column>
                        </Table>

                        {progressions.length === 0 && !loading && (
                            <div style={{
                                textAlign: 'center',
                                padding: `${modernStyles.spacing.xxl} ${modernStyles.spacing.lg}`,
                                background: `linear-gradient(135deg, ${modernStyles.colors.background.subtle} 0%, #FFFFFF 100%)`
                            }}>
                                <div style={{
                                    background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                                    borderRadius: modernStyles.radius.full,
                                    width: '80px',
                                    height: '80px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 24px auto',
                                    color: 'white'
                                }}>
                                    <FiBookOpen size={32} />
                                </div>
                                <h3 style={{
                                    margin: '0 0 8px 0',
                                    color: modernStyles.colors.text.primary,
                                    fontSize: '20px',
                                    fontWeight: '600'
                                }}>
                                    Aucune progression trouvée
                                </h3>
                                <p style={{
                                    margin: 0,
                                    color: modernStyles.colors.text.secondary,
                                    fontSize: '16px',
                                    lineHeight: '1.5'
                                }}>
                                    {selectedAnnee ? 
                                        'Aucune progression n\'est disponible pour cette année scolaire' : 
                                        'Sélectionnez une année scolaire pour voir les progressions disponibles'
                                    }
                                </p>
                            </div>
                        )}
                    </div>
                </ModernCard>
            </div>

            {/* Modal de création modernisé */}
            <Modal
                open={showLoadModal}
                onClose={() => {
                    setShowLoadModal(false);
                    resetForm();
                }}
                size="lg"
                style={{ '--rs-modal-border-radius': modernStyles.radius.lg }}
            >
                <Modal.Header style={{
                    background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                    color: 'white',
                    borderRadius: `${modernStyles.radius.lg} ${modernStyles.radius.lg} 0 0`,
                    padding: modernStyles.spacing.xl
                }}>
                    <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: modernStyles.radius.md,
                            padding: modernStyles.spacing.md,
                            backdropFilter: 'blur(10px)'
                        }}>
                            <FiPlus size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
                                Nouvelle Progression Pédagogique
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '400' }}>
                                Créez une nouvelle progression à partir d'un fichier
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: modernStyles.spacing.xl }}>
                    {(niveauxError || periodesError) && (
                        <Message 
                            type="error" 
                            style={{ 
                                marginBottom: modernStyles.spacing.lg,
                                borderRadius: modernStyles.radius.md
                            }}
                        >
                            Erreur lors du chargement des données de référence
                        </Message>
                    )}

                    {/* Formulaire de sélection modernisé */}
                    <div style={{ marginBottom: modernStyles.spacing.xl }}>
                        <h4 style={{
                            margin: `0 0 ${modernStyles.spacing.lg} 0`,
                            color: modernStyles.colors.text.primary,
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: modernStyles.spacing.sm
                        }}>
                            <div style={{
                                width: '6px',
                                height: '24px',
                                background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                                borderRadius: '3px'
                            }} />
                            Configuration de la progression
                        </h4>

                        <Row gutter={24}>
                            <Col xs={6}>
                                <div style={{ marginBottom: modernStyles.spacing.lg }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: modernStyles.spacing.sm,
                                        fontWeight: '500',
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '14px'
                                    }}>
                                        Niveau d'enseignement *
                                    </label>
                                    <SelectPicker
                                        data={niveaux}
                                        value={selectedNiveau}
                                        onChange={setSelectedNiveau}
                                        placeholder="Sélectionner le niveau..."
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        loading={niveauxLoading}
                                    />
                                </div>
                            </Col>

                            <Col xs={6}>
                                <div style={{ marginBottom: modernStyles.spacing.lg }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: modernStyles.spacing.sm,
                                        fontWeight: '500',
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '14px'
                                    }}>
                                        Année scolaire *
                                    </label>
                                    <SelectPicker
                                        data={anneesNiveau}
                                        value={selectedAnneeModal}
                                        onChange={setSelectedAnneeModal}
                                        placeholder="Sélectionner l'année..."
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        disabled={!selectedNiveau}
                                        loading={niveauDataLoading}
                                    />
                                </div>
                            </Col>

                            <Col xs={6}>
                                <div style={{ marginBottom: modernStyles.spacing.lg }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: modernStyles.spacing.sm,
                                        fontWeight: '500',
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '14px'
                                    }}>
                                        Branche *
                                    </label>
                                    <SelectPicker
                                        data={branches}
                                        value={selectedBranche}
                                        onChange={setSelectedBranche}
                                        placeholder="Sélectionner la branche..."
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        disabled={!selectedNiveau}
                                        loading={niveauDataLoading}
                                    />
                                </div>
                            </Col>

                            <Col xs={6}>
                                <div style={{ marginBottom: modernStyles.spacing.lg }}>
                                    <label style={{
                                        display: 'block',
                                        marginBottom: modernStyles.spacing.sm,
                                        fontWeight: '500',
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '14px'
                                    }}>
                                        Matière *
                                    </label>
                                    <SelectPicker
                                        data={matieres}
                                        value={selectedMatiere}
                                        onChange={setSelectedMatiere}
                                        placeholder="Sélectionner la matière..."
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        disabled={!selectedNiveau}
                                        loading={niveauDataLoading}
                                    />
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Zone d'upload modernisée */}
                    <div style={{ marginBottom: modernStyles.spacing.xl }}>
                        <h4 style={{
                            margin: `0 0 ${modernStyles.spacing.md} 0`,
                            color: modernStyles.colors.text.primary,
                            fontSize: '18px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: modernStyles.spacing.sm
                        }}>
                            <div style={{
                                width: '6px',
                                height: '24px',
                                background: `linear-gradient(135deg, ${modernStyles.colors.accent} 0%, #34D399 100%)`,
                                borderRadius: '3px'
                            }} />
                            Import du fichier
                        </h4>
                        
                        <div style={{
                            border: `2px dashed ${modernStyles.colors.border.medium}`,
                            borderRadius: modernStyles.radius.lg,
                            background: `linear-gradient(135deg, ${modernStyles.colors.background.subtle} 0%, #FFFFFF 100%)`,
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <Uploader
                                fileListVisible={false}
                                onChange={handleFileUpload}
                                accept=".csv,.xls,.xlsx"
                                draggable
                                autoUpload={false}
                            >
                                <div style={{
                                    padding: modernStyles.spacing.xxl,
                                    textAlign: 'center'
                                }}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                                        borderRadius: modernStyles.radius.full,
                                        width: '80px',
                                        height: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px auto',
                                        color: 'white'
                                    }}>
                                        <FiUpload size={32} />
                                    </div>
                                    <h4 style={{
                                        margin: '0 0 8px 0',
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '18px',
                                        fontWeight: '600'
                                    }}>
                                        Importez votre fichier de progression
                                    </h4>
                                    <p style={{
                                        margin: '0 0 16px 0',
                                        color: modernStyles.colors.text.secondary,
                                        fontSize: '15px',
                                        lineHeight: '1.5'
                                    }}>
                                        Glissez-déposez votre fichier ici ou cliquez pour parcourir
                                    </p>
                                    <div style={{
                                        display: 'inline-flex',
                                        gap: modernStyles.spacing.sm
                                    }}>
                                        <Badge style={{ background: modernStyles.colors.primary, color: 'white' }}>CSV</Badge>
                                        <Badge style={{ background: modernStyles.colors.accent, color: 'white' }}>XLS</Badge>
                                        <Badge style={{ background: modernStyles.colors.warning, color: 'white' }}>XLSX</Badge>
                                    </div>
                                </div>
                            </Uploader>
                        </div>

                        {fileInfo && (
                            <div style={{
                                marginTop: modernStyles.spacing.md,
                                padding: modernStyles.spacing.lg,
                                background: `linear-gradient(135deg, #F0FDF4 0%, #ECFDF5 100%)`,
                                border: `1px solid #BBF7D0`,
                                borderRadius: modernStyles.radius.md,
                                display: 'flex',
                                alignItems: 'center',
                                gap: modernStyles.spacing.md
                            }}>
                                <div style={{
                                    background: modernStyles.colors.accent,
                                    borderRadius: modernStyles.radius.md,
                                    padding: modernStyles.spacing.sm,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <FiFile size={20} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ 
                                        fontWeight: '600', 
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '15px'
                                    }}>
                                        {fileInfo.name}
                                    </div>
                                    <div style={{
                                        color: modernStyles.colors.text.secondary,
                                        fontSize: '13px',
                                        marginTop: '2px'
                                    }}>
                                        {(fileInfo.size / 1024).toFixed(1)} KB • {fileData.length} lignes détectées
                                    </div>
                                </div>
                                <div style={{
                                    background: modernStyles.colors.accent,
                                    color: 'white',
                                    padding: '4px 8px',
                                    borderRadius: modernStyles.radius.sm,
                                    fontSize: '12px',
                                    fontWeight: '500'
                                }}>
                                    <FiCheck size={14} style={{ marginRight: '4px' }} />
                                    Prêt
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Tableau modernisé */}
                    {fileData.length > 0 && (
                        <div>
                            <h4 style={{
                                margin: `0 0 ${modernStyles.spacing.lg} 0`,
                                color: modernStyles.colors.text.primary,
                                fontSize: '18px',
                                fontWeight: '600',
                                display: 'flex',
                                alignItems: 'center',
                                gap: modernStyles.spacing.sm
                            }}>
                                <div style={{
                                    width: '6px',
                                    height: '24px',
                                    background: `linear-gradient(135deg, ${modernStyles.colors.warning} 0%, #FBBF24 100%)`,
                                    borderRadius: '3px'
                                }} />
                                Aperçu des données • {fileData.length} enregistrement{fileData.length !== 1 ? 's' : ''}
                            </h4>
                            
                            <div style={{
                                maxHeight: '400px',
                                overflow: 'auto',
                                border: `1px solid ${modernStyles.colors.border.light}`,
                                borderRadius: modernStyles.radius.md,
                                background: modernStyles.colors.background.card
                            }}>
                                <Table
                                    height={Math.min(400, fileData.length * 46 + 46)}
                                    data={fileData}
                                    bordered
                                    style={{
                                        '--rs-table-border-color': modernStyles.colors.border.light
                                    }}
                                >
                                    <Column width={120}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Période
                                        </HeaderCell>
                                        <PeriodeCell
                                            dataKey="Période"
                                            onChange={handleTableChange}
                                        />
                                    </Column>

                                    <Column width={120}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Date début
                                        </HeaderCell>
                                        <DateCell
                                            dataKey="Date début"
                                            onChange={handleTableChange}
                                        />
                                    </Column>

                                    <Column width={120}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Date fin
                                        </HeaderCell>
                                        <DateCell
                                            dataKey="Date fin"
                                            onChange={handleTableChange}
                                        />
                                    </Column>

                                    <Column width={80}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Semaine
                                        </HeaderCell>
                                        <Cell dataKey="Semaine" />
                                    </Column>

                                    <Column width={100}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            N° leçon
                                        </HeaderCell>
                                        <Cell dataKey="Numéro leçon" />
                                    </Column>

                                    <Column flexGrow={1} minWidth={200}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Titre Leçon
                                        </HeaderCell>
                                        <Cell dataKey="Titre Leçon" />
                                    </Column>

                                    <Column width={80}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Heures
                                        </HeaderCell>
                                        <Cell dataKey="heure" />
                                    </Column>

                                    <Column width={100}>
                                        <HeaderCell style={{
                                            background: modernStyles.colors.background.subtle,
                                            fontWeight: '600',
                                            color: modernStyles.colors.text.primary
                                        }}>
                                            Nb Séances
                                        </HeaderCell>
                                        <Cell dataKey="Nbre Séance" />
                                    </Column>
                                </Table>
                            </div>
                        </div>
                    )}
                </Modal.Body>

                <Modal.Footer style={{
                    padding: modernStyles.spacing.xl,
                    background: modernStyles.colors.background.subtle,
                    borderRadius: `0 0 ${modernStyles.radius.lg} ${modernStyles.radius.lg}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: modernStyles.spacing.md
                }}>
                    <ModernButton
                        variant="secondary"
                        onClick={() => {
                            setShowLoadModal(false);
                            resetForm();
                        }}
                    >
                        Annuler
                    </ModernButton>
                    <ModernButton
                        onClick={handleSave}
                        loading={loading}
                        icon={<FiSave />}
                    >
                        Enregistrer la progression
                    </ModernButton>
                </Modal.Footer>
            </Modal>

            {/* Modal de modification */}
            <Modal
                open={showEditModal}
                size="lg"
                onClose={() => {
                    setShowEditModal(false);
                    setSelectedProgression(null);
                }}
                style={{ '--rs-modal-border-radius': modernStyles.radius.lg }}
            >
                <Modal.Header style={{
                    background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                    color: 'white',
                    borderRadius: `${modernStyles.radius.lg} ${modernStyles.radius.lg} 0 0`,
                    padding: modernStyles.spacing.xl
                }}>
                    <Modal.Title style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: modernStyles.radius.md,
                            padding: modernStyles.spacing.md,
                            backdropFilter: 'blur(10px)'
                        }}>
                            <FiEdit size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '4px' }}>
                                Modifier la Progression
                            </div>
                            <div style={{ fontSize: '14px', opacity: 0.9, fontWeight: '400' }}>
                                Éditez les détails de la progression sélectionnée
                            </div>
                        </div>
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body style={{ padding: modernStyles.spacing.xl }}>
                    {selectedProgression && (
                        <div style={{
                            background: `linear-gradient(135deg, ${modernStyles.colors.background.subtle} 0%, #FFFFFF 100%)`,
                            border: `1px solid ${modernStyles.colors.border.light}`,
                            borderRadius: modernStyles.radius.md,
                            padding: modernStyles.spacing.lg,
                            marginBottom: modernStyles.spacing.xl
                        }}>
                            <h4 style={{
                                margin: '0 0 16px 0',
                                color: modernStyles.colors.text.primary,
                                fontWeight: '600',
                                fontSize: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: modernStyles.spacing.sm
                            }}>
                                <div style={{
                                    width: '4px',
                                    height: '20px',
                                    background: `linear-gradient(135deg, ${modernStyles.colors.primary} 0%, ${modernStyles.colors.primaryLight} 100%)`,
                                    borderRadius: '2px'
                                }} />
                                Informations de la progression
                            </h4>
                            <div style={{ display: 'flex', gap: modernStyles.spacing.xl, flexWrap: 'wrap' }}>
                                <div style={{
                                    padding: modernStyles.spacing.md,
                                    background: 'white',
                                    borderRadius: modernStyles.radius.sm,
                                    border: `1px solid ${modernStyles.colors.border.light}`
                                }}>
                                    <span style={{ 
                                        fontWeight: '500', 
                                        color: modernStyles.colors.text.secondary,
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Branche
                                    </span>
                                    <div style={{ 
                                        color: modernStyles.colors.text.primary,
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        marginTop: '4px'
                                    }}>
                                        {selectedProgression.branche}
                                    </div>
                                </div>
                                <div style={{
                                    padding: modernStyles.spacing.md,
                                    background: 'white',
                                    borderRadius: modernStyles.radius.sm,
                                    border: `1px solid ${modernStyles.colors.border.light}`
                                }}>
                                    <span style={{ 
                                        fontWeight: '500', 
                                        color: modernStyles.colors.text.secondary,
                                        fontSize: '13px',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.5px'
                                    }}>
                                        Matière
                                    </span>
                                    <div style={{ 
                                        color: modernStyles.colors.text.primary,
                                        fontWeight: '600',
                                        fontSize: '15px',
                                        marginTop: '4px'
                                    }}>
                                        {selectedProgression.matiere}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {detailsLoading ? (
                        <div style={{
                            textAlign: 'center',
                            padding: modernStyles.spacing.xxl,
                            background: modernStyles.colors.background.subtle,
                            borderRadius: modernStyles.radius.md
                        }}>
                            <Loader size="md" />
                            <p style={{ 
                                marginTop: modernStyles.spacing.lg, 
                                color: modernStyles.colors.text.secondary,
                                fontSize: '16px'
                            }}>
                                Chargement des détails de la progression...
                            </p>
                        </div>
                    ) : (
                        <>
                            {progressionDetails.length > 0 && (
                                <div>
                                    <h4 style={{
                                        margin: `0 0 ${modernStyles.spacing.lg} 0`,
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '18px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: modernStyles.spacing.sm
                                    }}>
                                        <div style={{
                                            width: '6px',
                                            height: '24px',
                                            background: `linear-gradient(135deg, ${modernStyles.colors.accent} 0%, #34D399 100%)`,
                                            borderRadius: '3px'
                                        }} />
                                        Détails de la progression • {progressionDetails.length} leçon{progressionDetails.length !== 1 ? 's' : ''}
                                    </h4>
                                    <div style={{
                                        maxHeight: '500px',
                                        overflow: 'auto',
                                        border: `1px solid ${modernStyles.colors.border.light}`,
                                        borderRadius: modernStyles.radius.md,
                                        background: modernStyles.colors.background.card
                                    }}>
                                        <Table
                                            height={Math.min(500, progressionDetails.length * 46 + 46)}
                                            data={progressionDetails}
                                            bordered
                                            style={{
                                                '--rs-table-border-color': modernStyles.colors.border.light
                                            }}
                                        >
                                            <Column width={120}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Période
                                                </HeaderCell>
                                                <PeriodeCell
                                                    dataKey="periode"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column width={120}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Date début
                                                </HeaderCell>
                                                <DateCell
                                                    dataKey="dateDeb"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column width={120}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Date fin
                                                </HeaderCell>
                                                <DateCell
                                                    dataKey="dateFin"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column width={80}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    N° leçon
                                                </HeaderCell>
                                                <NumberCell
                                                    dataKey="numLecon"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column width={80}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Ordre
                                                </HeaderCell>
                                                <NumberCell
                                                    dataKey="ordre"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column flexGrow={1} minWidth={200}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Titre
                                                </HeaderCell>
                                                <EditableCell
                                                    dataKey="titre"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column width={80}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Heures
                                                </HeaderCell>
                                                <NumberCell
                                                    dataKey="heure"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>

                                            <Column width={100}>
                                                <HeaderCell style={{
                                                    background: modernStyles.colors.background.subtle,
                                                    fontWeight: '600',
                                                    color: modernStyles.colors.text.primary
                                                }}>
                                                    Nb Séances
                                                </HeaderCell>
                                                <NumberCell
                                                    dataKey="nbreSeance"
                                                    onChange={handleProgressionDetailsChange}
                                                />
                                            </Column>
                                        </Table>
                                    </div>
                                </div>
                            )}

                            {progressionDetails.length === 0 && !detailsLoading && (
                                <div style={{
                                    textAlign: 'center',
                                    padding: modernStyles.spacing.xxl,
                                    background: modernStyles.colors.background.subtle,
                                    borderRadius: modernStyles.radius.md
                                }}>
                                    <div style={{
                                        background: `linear-gradient(135deg, ${modernStyles.colors.text.light} 0%, ${modernStyles.colors.text.secondary} 100%)`,
                                        borderRadius: modernStyles.radius.full,
                                        width: '80px',
                                        height: '80px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        margin: '0 auto 24px auto',
                                        color: 'white'
                                    }}>
                                        <FiBookOpen size={32} />
                                    </div>
                                    <h3 style={{
                                        margin: '0 0 8px 0',
                                        color: modernStyles.colors.text.primary,
                                        fontSize: '20px',
                                        fontWeight: '600'
                                    }}>
                                        Aucun détail trouvé
                                    </h3>
                                    <p style={{
                                        margin: 0,
                                        color: modernStyles.colors.text.secondary,
                                        fontSize: '16px'
                                    }}>
                                        Cette progression ne contient pas encore de détails
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </Modal.Body>

                <Modal.Footer style={{
                    padding: modernStyles.spacing.xl,
                    background: modernStyles.colors.background.subtle,
                    borderRadius: `0 0 ${modernStyles.radius.lg} ${modernStyles.radius.lg}`,
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: modernStyles.spacing.md
                }}>
                    <ModernButton
                        variant="secondary"
                        onClick={() => {
                            setShowEditModal(false);
                            setSelectedProgression(null);
                        }}
                    >
                        Annuler
                    </ModernButton>
                    <ModernButton
                        onClick={handleSaveModifications}
                        loading={loading}
                        icon={<FiSave />}
                        disabled={progressionDetails.length === 0}
                    >
                        Sauvegarder les modifications
                    </ModernButton>
                </Modal.Footer>
            </Modal>

            {/* CSS pour les animations et états hover */}
            <style jsx>{`
                .modern-card:hover {
                    transform: translateY(-2px);
                    box-shadow: ${modernStyles.shadows.md};
                }
                
                .rs-btn:hover {
                    transform: translateY(-1px);
                }
                
                .rs-table-row:hover {
                    background-color: ${modernStyles.colors.background.subtle} !important;
                }
                
                .rs-modal {
                    backdrop-filter: blur(10px);
                }
                
                .rs-selectpicker-toggle:focus,
                .rs-input:focus,
                .rs-input-number:focus {
                    border-color: ${modernStyles.colors.primary} !important;
                    box-shadow: 0 0 0 2px ${modernStyles.colors.primary}20 !important;
                }
            `}</style>
        </div>
    );
};

export default ProgressionPedagogique;