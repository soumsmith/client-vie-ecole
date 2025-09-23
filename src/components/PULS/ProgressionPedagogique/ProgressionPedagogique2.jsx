import React, { useState, useCallback, useEffect } from "react";
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
    Form,
    Uploader,
    Table,
    DatePicker,
    InputNumber,
    Input,
    toaster
} from 'rsuite';
import {
    FiDownload,
    FiUpload,
    FiFile,
    FiUsers,
    FiBookOpen,
    FiCalendar,
    FiX,
    FiCheck,
    FiTrash2,
    FiPlus
} from 'react-icons/fi';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import getFullUrl from '../../hooks/urlUtils';

const { Column, HeaderCell, Cell } = Table;

// ===========================
// HOOKS PERSONNALISÉS
// ===========================

// Hook pour récupérer les années scolaires
const useAnneesScholaires = () => {
    const [annees, setAnnees] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchAnnees = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.annees.listToCentral());
            const data = await response.json();
            const formattedData = data.map(annee => ({
                label: annee.customLibelle || annee.libelle,
                value: annee.id,
                raw_data: annee
            }));
            setAnnees(formattedData);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAnnees();
    }, [fetchAnnees]);

    return { annees, loading, error, refetch: fetchAnnees };
};

// Hook pour récupérer les niveaux d'enseignement
const useNiveauxEnseignement = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiUrls = useAllApiUrls();
    const fetchNiveaux = useCallback(async () => {
        setLoading(true);
        try {

            
            const response = await axios.get(apiUrls.niveaux.list());
            const data = await response.json();
            const formattedData = data.map(niveau => ({
                label: niveau.libelle,
                value: niveau.id,
                raw_data: niveau
            }));
            setNiveaux(formattedData);
        } catch (err) {
            console.error('Erreur chargement niveaux:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNiveaux();
    }, [fetchNiveaux]);

    return { niveaux, loading };
};

// Hook pour les données dépendantes du niveau
const useDataByNiveau = (niveau) => {
    const [matieres, setMatieres] = useState([]);
    const [branches, setBranches] = useState([]);
    const [annees, setAnnees] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiUrls = useAllApiUrls();
    const fetchData = useCallback(async () => {
        if (!niveau) return;

        setLoading(true);
        try {
            //const response = await axios.get(apiUrls.periodes.list());
            const [matieresRes, branchesRes, anneesRes] = await Promise.all([
                axios.get(apiUrls.matieres.getByEcoleViaNiveauEnseignementProgection(niveau)),
                axios.get(`http://10.3.119.232:8889/api/branche/get-by-niveau-enseignement-projection?niveau=${niveau}`),
                axios.get(`http://10.3.119.232:8889/api/annee/list-to-central-niveau-enseignement-projection?niveau=${niveau}`)
            ]);

            const [matieresData, branchesData, anneesData] = await Promise.all([
                matieresRes.json(),
                branchesRes.json(),
                anneesRes.json()
            ]);

            setMatieres(matieresData.map(m => ({ label: m.libelle, value: m.id })));
            setBranches(branchesData.map(b => ({ label: b.libelle, value: b.id })));
            setAnnees(anneesData.map(a => ({ label: a.libelle, value: a.id })));
        } catch (err) {
            console.error('Erreur chargement données niveau:', err);
        } finally {
            setLoading(false);
        }
    }, [niveau]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { matieres, branches, annees, loading };
};

// Hook pour les périodes
const usePeriodes = () => {
    const [periodes, setPeriodes] = useState([]);
    const [loading, setLoading] = useState(false);
    const apiUrls = useAllApiUrls();
    const fetchPeriodes = useCallback(async () => {
        setLoading(true);
        try {

            const response = await axios.get(apiUrls.periodes.list());
            const data = await response.json();
            const formattedData = data.map(periode => ({
                label: periode.libelle,
                value: periode.id,
                raw_data: periode
            }));
            setPeriodes(formattedData);
        } catch (err) {
            console.error('Erreur chargement périodes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPeriodes();
    }, [fetchPeriodes]);

    return { periodes, loading };
};

// ===========================
// COMPOSANT MODAL D'IMPORTATION
// ===========================
const ImportProgressionModal = ({ visible, onClose, onImportSuccess }) => {
    const [selectedNiveau, setSelectedNiveau] = useState(null);
    const [selectedAnnee, setSelectedAnnee] = useState(null);
    const [selectedBranche, setSelectedBranche] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [progressionData, setProgressionData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Sélection, 2: Fichier, 3: Données

    const { niveaux, loading: niveauxLoading } = useNiveauxEnseignement();
    const { matieres, branches, annees, loading: dataLoading } = useDataByNiveau(selectedNiveau);
    const { periodes } = usePeriodes();

    const handleFileUpload = useCallback(async (fileList) => {
        if (fileList.length === 0) return;

        const file = fileList[0].blobFile;
        setLoading(true);

        try {
            let data = [];

            if (file.name.toLowerCase().endsWith('.csv')) {
                // Parse CSV
                const text = await file.text();
                const result = Papa.parse(text, { header: true, skipEmptyLines: true });
                data = result.data;
            } else {
                // Parse Excel
                const buffer = await file.arrayBuffer();
                const workbook = XLSX.read(buffer, { type: 'buffer' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                data = XLSX.utils.sheet_to_json(worksheet);
            }

            // Traiter les données
            const processedData = data.map((row, index) => ({
                id: index + 1,
                periode: row.Période || row.Periode || '',
                dateDebut: row['Date début'] || row['Date debut'] || '',
                dateFin: row['Date fin'] || '',
                semaine: parseInt(row.Semaine) || 0,
                numeroLecon: parseInt(row['Numéro leçon'] || row['Numero lecon']) || 0,
                titreLecon: row['Titre Leçon'] || row['Titre Lecon'] || '',
                heure: parseFloat(row.heure || row.Heure) || 0,
                nbreSeance: parseInt(row['Nbre Séance'] || row['Nbre Seance']) || 0
            }));

            setFileData({ name: file.name, size: file.size });
            setProgressionData(processedData);
            setStep(3);
        } catch (err) {
            toaster.push(
                <Message type="error" showIcon closable>
                    Erreur lors du traitement du fichier: {err.message}
                </Message>,
                { duration: 5000 }
            );
        } finally {
            setLoading(false);
        }
    }, []);

    const handleNext = useCallback(() => {
        if (selectedNiveau && selectedAnnee && selectedBranche && selectedMatiere) {
            setStep(2);
        } else {
            toaster.push(
                <Message type="warning" showIcon closable>
                    Veuillez remplir tous les champs obligatoires
                </Message>,
                { duration: 4000 }
            );
        }
    }, [selectedNiveau, selectedAnnee, selectedBranche, selectedMatiere]);

    const handleSave = useCallback(() => {
        // Simulation de sauvegarde
        setTimeout(() => {
            onImportSuccess(progressionData);
            handleReset();
            onClose();
            toaster.push(
                <Message type="success" showIcon closable>
                    Progression importée avec succès !
                </Message>,
                { duration: 4000 }
            );
        }, 1000);
    }, [progressionData, onImportSuccess, onClose]);

    const handleReset = useCallback(() => {
        setSelectedNiveau(null);
        setSelectedAnnee(null);
        setSelectedBranche(null);
        setSelectedMatiere(null);
        setFileData(null);
        setProgressionData([]);
        setStep(1);
    }, []);

    const handleClose = useCallback(() => {
        handleReset();
        onClose();
    }, [handleReset, onClose]);

    // Éditeur en ligne pour les cellules
    const EditableCell = ({ rowData, dataKey, onChange, options, type = 'text' }) => {
        const [editing, setEditing] = useState(false);
        const [value, setValue] = useState(rowData[dataKey]);

        const handleChange = (newValue) => {
            setValue(newValue);
            onChange && onChange(rowData.id, dataKey, newValue);
        };

        if (editing) {
            if (type === 'select') {
                return (
                    <SelectPicker
                        data={options}
                        value={value}
                        onChange={handleChange}
                        onBlur={() => setEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                        style={{ width: '100%' }}
                        size="sm"
                        autoFocus
                    />
                );
            } else if (type === 'date') {
                return (
                    <DatePicker
                        value={value ? new Date(value) : null}
                        onChange={(date) => handleChange(date ? date.toISOString().split('T')[0] : '')}
                        onBlur={() => setEditing(false)}
                        format="dd/MM/yyyy"
                        style={{ width: '100%' }}
                        size="sm"
                        autoFocus
                    />
                );
            } else if (type === 'number') {
                return (
                    <InputNumber
                        value={value}
                        onChange={handleChange}
                        onBlur={() => setEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                        style={{ width: '100%' }}
                        size="sm"
                        autoFocus
                    />
                );
            } else {
                return (
                    <Input
                        value={value}
                        onChange={handleChange}
                        onBlur={() => setEditing(false)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditing(false)}
                        style={{ width: '100%' }}
                        size="sm"
                        autoFocus
                    />
                );
            }
        }

        return (
            <div
                onClick={() => setEditing(true)}
                style={{
                    padding: '6px 10px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    transition: 'background-color 0.2s',
                    ':hover': { backgroundColor: '#f5f5f5' }
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
                {type === 'select' && options ?
                    options.find(opt => opt.value === value)?.label || value :
                    (type === 'date' && value ? new Date(value).toLocaleDateString('fr-FR') : value)
                }
            </div>
        );
    };

    const handleCellChange = useCallback((id, dataKey, newValue) => {
        setProgressionData(prev => prev.map(item =>
            item.id === id ? { ...item, [dataKey]: newValue } : item
        ));
    }, []);

    return (
        <Modal
            open={visible}
            onClose={handleClose}
            size="lg"
            backdrop="static"
            style={{ borderRadius: '16px', overflow: 'hidden' }}
        >
            <Modal.Header style={{
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                padding: '24px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiUpload size={24} color="white" />
                    </div>
                    <div>
                        <h4 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                            Formulaire de chargement des progressions
                        </h4>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Étape {step} sur 3
                        </p>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ padding: '32px 24px', background: '#fafafa' }}>
                {step === 1 && (
                    <div>
                        <Row gutter={16}>
                            <Col xs={6}>
                                <Form.Group style={{ marginBottom: '20px' }}>
                                    <Form.ControlLabel style={{ fontWeight: '500', color: '#374151' }}>
                                        Niveau d'enseignement <span style={{ color: '#ef4444' }}>*</span>
                                    </Form.ControlLabel>
                                    <SelectPicker
                                        data={niveaux}
                                        value={selectedNiveau}
                                        onChange={setSelectedNiveau}
                                        placeholder="Sélectionner le niveau"
                                        style={{ width: '100%' }}
                                        loading={niveauxLoading}
                                        cleanable={false}
                                        size="lg"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group style={{ marginBottom: '20px' }}>
                                    <Form.ControlLabel style={{ fontWeight: '500', color: '#374151' }}>
                                        Année scolaire <span style={{ color: '#ef4444' }}>*</span>
                                    </Form.ControlLabel>
                                    <SelectPicker
                                        data={annees}
                                        value={selectedAnnee}
                                        onChange={setSelectedAnnee}
                                        placeholder="Sélectionner l'année"
                                        style={{ width: '100%' }}
                                        loading={dataLoading}
                                        disabled={!selectedNiveau}
                                        cleanable={false}
                                        size="lg"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group style={{ marginBottom: '20px' }}>
                                    <Form.ControlLabel style={{ fontWeight: '500', color: '#374151' }}>
                                        Branche <span style={{ color: '#ef4444' }}>*</span>
                                    </Form.ControlLabel>
                                    <SelectPicker
                                        data={branches}
                                        value={selectedBranche}
                                        onChange={setSelectedBranche}
                                        placeholder="Sélectionner la branche"
                                        style={{ width: '100%' }}
                                        loading={dataLoading}
                                        disabled={!selectedNiveau}
                                        cleanable={false}
                                        size="lg"
                                    />
                                </Form.Group>
                            </Col>
                            <Col xs={6}>
                                <Form.Group style={{ marginBottom: '20px' }}>
                                    <Form.ControlLabel style={{ fontWeight: '500', color: '#374151' }}>
                                        Matière <span style={{ color: '#ef4444' }}>*</span>
                                    </Form.ControlLabel>
                                    <SelectPicker
                                        data={matieres}
                                        value={selectedMatiere}
                                        onChange={setSelectedMatiere}
                                        placeholder="Sélectionner la matière"
                                        style={{ width: '100%' }}
                                        loading={dataLoading}
                                        disabled={!selectedNiveau}
                                        cleanable={false}
                                        size="lg"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                    </div>
                )}

                {step === 2 && (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <div style={{
                            border: '2px dashed #d1d5db',
                            borderRadius: '12px',
                            padding: '60px 40px',
                            backgroundColor: '#f8fafc'
                        }}>
                            <Uploader
                                fileListVisible={false}
                                onChange={handleFileUpload}
                                accept=".csv,.xls,.xlsx"
                                disabled={loading}
                                draggable
                                autoUpload={false}
                            >
                                <div>
                                    <FiFile size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                                    <Button
                                        appearance="primary"
                                        loading={loading}
                                        style={{
                                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                            border: 'none',
                                            marginBottom: '12px'
                                        }}
                                        size="lg"
                                    >
                                        {loading ? 'Traitement...' : 'Sélectionner le fichier ...'}
                                    </Button>
                                    <p style={{ color: '#64748b', fontSize: '14px' }}>
                                        Glissez-déposez votre fichier ici ou cliquez pour sélectionner
                                    </p>
                                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>
                                        Formats supportés: CSV, Excel (.xls, .xlsx)
                                    </p>
                                </div>
                            </Uploader>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '20px',
                            border: '1px solid #e2e8f0'
                        }}>
                            <p style={{ margin: 0, color: '#16a34a', fontWeight: '600' }}>
                                ✓ Fichier importé: {fileData?.name} ({Math.round(fileData?.size / 1024)} KB)
                            </p>
                            <p style={{ margin: '8px 0 0 0', color: '#64748b', fontSize: '14px' }}>
                                {progressionData.length} ligne(s) trouvée(s). Vous pouvez modifier les données ci-dessous.
                            </p>
                        </div>

                        <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            overflow: 'hidden'
                        }}>
                            <Table
                                data={progressionData}
                                height={400}
                                bordered
                                cellBordered
                            >
                                <Column width={120} align="center">
                                    <HeaderCell>Période</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="periode"
                                                onChange={handleCellChange}
                                                options={periodes}
                                                type="select"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={120} align="center">
                                    <HeaderCell>Date début</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="dateDebut"
                                                onChange={handleCellChange}
                                                type="date"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={120} align="center">
                                    <HeaderCell>Date fin</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="dateFin"
                                                onChange={handleCellChange}
                                                type="date"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={80} align="center">
                                    <HeaderCell>Semaine</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="semaine"
                                                onChange={handleCellChange}
                                                type="number"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={100} align="center">
                                    <HeaderCell>Numéro leçon</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="numeroLecon"
                                                onChange={handleCellChange}
                                                type="number"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={200} align="left">
                                    <HeaderCell>Titre Leçon</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="titreLecon"
                                                onChange={handleCellChange}
                                                type="text"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={80} align="center">
                                    <HeaderCell>Heure</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="heure"
                                                onChange={handleCellChange}
                                                type="number"
                                            />
                                        )}
                                    </Cell>
                                </Column>

                                <Column width={100} align="center">
                                    <HeaderCell>Nbre Séance</HeaderCell>
                                    <Cell>
                                        {rowData => (
                                            <EditableCell
                                                rowData={rowData}
                                                dataKey="nbreSeance"
                                                onChange={handleCellChange}
                                                type="number"
                                            />
                                        )}
                                    </Cell>
                                </Column>
                            </Table>
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer style={{
                padding: '20px 24px',
                borderTop: '1px solid #f1f5f9',
                background: 'white'
            }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button
                        appearance="subtle"
                        onClick={handleClose}
                        startIcon={<FiX />}
                    >
                        Annuler
                    </Button>

                    {step === 1 && (
                        <Button
                            appearance="primary"
                            onClick={handleNext}
                            disabled={!selectedNiveau || !selectedAnnee || !selectedBranche || !selectedMatiere}
                            style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none'
                            }}
                        >
                            Suivant
                        </Button>
                    )}

                    {step === 2 && (
                        <Button
                            appearance="subtle"
                            onClick={() => setStep(1)}
                        >
                            Retour
                        </Button>
                    )}

                    {step === 3 && (
                        <>
                            <Button
                                appearance="subtle"
                                onClick={() => setStep(2)}
                            >
                                Retour
                            </Button>
                            <Button
                                appearance="primary"
                                onClick={handleSave}
                                startIcon={<FiCheck />}
                                style={{
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    border: 'none'
                                }}
                            >
                                Enregistrer
                            </Button>
                        </>
                    )}
                </div>
            </Modal.Footer>
        </Modal>
    );
};

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const ProgressionPedagogique = () => {
    const [selectedAnnee, setSelectedAnnee] = useState(null);
    const [importModalVisible, setImportModalVisible] = useState(false);
    const [progressions, setProgressions] = useState([]);
    const [loading, setLoading] = useState(false);

    const { annees, loading: anneesLoading } = useAnneesScholaires();

    const handleImport = useCallback(() => {
        setImportModalVisible(true);
    }, []);

    const handleImportSuccess = useCallback((data) => {
        setProgressions(data);
    }, []);

    const handleChargerProgression = useCallback(async () => {
        if (!selectedAnnee) {
            toaster.push(
                <Message type="warning" showIcon closable>
                    Veuillez sélectionner une année scolaire
                </Message>,
                { duration: 4000 }
            );
            return;
        }

        setLoading(true);
        // Simulation de chargement
        setTimeout(() => {
            setLoading(false);
            // Ici vous pourriez charger les données existantes depuis l'API
        }, 1000);
    }, [selectedAnnee]);

    return (
        <div style={{
            
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Header */}
                <div className="row mb-4">
                    <div className="col-lg-12">
                        <div style={{
                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            borderRadius: '15px',
                            padding: '20px 25px',
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
                        }}>
                            <FiDownload size={24} />
                            <div>
                                <h5 style={{ margin: 0, fontWeight: '600' }}>
                                    Charger progression
                                </h5>
                                <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>
                                    RÉFÉRENTIEL DES PROGRESSIONS PÉDAGOGIQUES
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contrôles */}
                <div className="row mb-4">
                    <div className="col-lg-12">
                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            padding: '25px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(102, 126, 234, 0.1)'
                        }}>
                            <div style={{
                                background: '#2c3e50',
                                borderRadius: '10px',
                                padding: '15px 20px',
                                marginBottom: '20px',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ fontWeight: '600' }}>Année scolaire</span>
                                </div>
                                <div style={{ minWidth: '300px' }}>
                                    <SelectPicker
                                        data={annees}
                                        value={selectedAnnee}
                                        onChange={setSelectedAnnee}
                                        placeholder="Sélectionner l'année"
                                        style={{ width: '100%' }}
                                        loading={anneesLoading}
                                        cleanable={false}
                                        size="lg"
                                    />
                                </div>
                            </div>

                            <Row gutter={16}>
                                <Col xs={8}>
                                    <div>
                                        <h6 style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#1e293b' }}>
                                            Branche
                                        </h6>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                            Aucune donnée trouvée
                                        </p>
                                    </div>
                                </Col>
                                <Col xs={8}>
                                    <div>
                                        <h6 style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#1e293b' }}>
                                            Matière
                                        </h6>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                            -
                                        </p>
                                    </div>
                                </Col>
                                <Col xs={8}>
                                    <div>
                                        <h6 style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#1e293b' }}>
                                            Action
                                        </h6>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <Button
                                                appearance="primary"
                                                onClick={handleChargerProgression}
                                                loading={loading}
                                                disabled={!selectedAnnee}
                                                style={{
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    border: 'none'
                                                }}
                                            >
                                                {loading ? 'Chargement...' : 'Charger'}
                                            </Button>
                                            <Button
                                                color="green"
                                                appearance="primary"
                                                onClick={handleImport}
                                                startIcon={<FiUpload />}
                                                style={{
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    border: 'none'
                                                }}
                                            >
                                                Importer
                                            </Button>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>
                </div>

                {/* Tableau des progressions */}
                {progressions.length > 0 ? (
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
                                    padding: '20px 25px',
                                    borderBottom: '1px solid #f1f5f9',
                                    background: '#f8fafc'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <h6 style={{ margin: 0, color: '#1e293b', fontWeight: '600' }}>
                                                Progressions chargées
                                            </h6>
                                            <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                                {progressions.length} progression(s) trouvée(s)
                                            </p>
                                        </div>
                                        <Badge content={progressions.length} style={{ backgroundColor: '#10b981' }}>
                                            Entrées
                                        </Badge>
                                    </div>
                                </div>

                                <Table
                                    data={progressions}
                                    height={500}
                                    bordered
                                    cellBordered
                                >
                                    <Column width={120} align="center">
                                        <HeaderCell>Période</HeaderCell>
                                        <Cell dataKey="periode" />
                                    </Column>

                                    <Column width={120} align="center">
                                        <HeaderCell>Date début</HeaderCell>
                                        <Cell dataKey="dateDebut" />
                                    </Column>

                                    <Column width={120} align="center">
                                        <HeaderCell>Date fin</HeaderCell>
                                        <Cell dataKey="dateFin" />
                                    </Column>

                                    <Column width={80} align="center">
                                        <HeaderCell>Semaine</HeaderCell>
                                        <Cell dataKey="semaine" />
                                    </Column>

                                    <Column width={100} align="center">
                                        <HeaderCell>Numéro leçon</HeaderCell>
                                        <Cell dataKey="numeroLecon" />
                                    </Column>

                                    <Column width={250} align="left">
                                        <HeaderCell>Titre Leçon</HeaderCell>
                                        <Cell dataKey="titreLecon" />
                                    </Column>

                                    <Column width={80} align="center">
                                        <HeaderCell>Heure</HeaderCell>
                                        <Cell dataKey="heure" />
                                    </Column>

                                    <Column width={100} align="center">
                                        <HeaderCell>Nbre Séance</HeaderCell>
                                        <Cell dataKey="nbreSeance" />
                                    </Column>
                                </Table>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '60px 40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                textAlign: 'center'
                            }}>
                                <div style={{
                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <FiBookOpen size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Aucune progression chargée
                                </h5>
                                <p style={{ margin: 0, color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
                                    Sélectionnez une année scolaire et cliquez sur "Charger" ou importez un fichier de progression
                                </p>
                                <Button
                                    appearance="primary"
                                    onClick={handleImport}
                                    startIcon={<FiUpload />}
                                    style={{
                                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                        border: 'none'
                                    }}
                                >
                                    Importer une progression
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal d'importation */}
            <ImportProgressionModal
                visible={importModalVisible}
                onClose={() => setImportModalVisible(false)}
                onImportSuccess={handleImportSuccess}
            />
        </div>
    );
};

export default ProgressionPedagogique;