import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { 
    Button, 
    Panel, 
    Row, 
    Col, 
    Message, 
    Loader, 
    Badge,
    Steps,
    Notification,
    SelectPicker,
    Uploader,
    IconButton,
    toaster
} from 'rsuite';
import { 
    FiUpload, 
    FiDownload, 
    FiBarChart, 
    FiFile,
    FiCheck,
    FiX,
    FiRefreshCw,
    FiEye,
    FiTrash2,
    FiCalendar,
    FiBookOpen
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// Import des fonctions externalisées
import DataTable from "../../../DataTable";
import { 
    useImportNotesData,
    importNotesTableConfig
} from './ImportNoteService';

// Import des hooks depuis CommonDataService
import { 
    useClassesData, 
    useMatieresData,
    usePeriodesData,
    useAnneesData // Hook pour les années scolaires
} from "../../utils/CommonDataService";
import { useAllApiUrls } from '../../utils/apiConfig';


// ===========================
// COMPOSANT DE SÉLECTION POUR IMPORT DE NOTES
// ===========================
const ImportNotesSelector = ({ 
    selectedClasse,
    selectedMatiere,
    selectedPeriode,
    selectedAnnee,
    onClasseChange,
    onMatiereChange,
    onPeriodeChange,
    onAnneeChange,
    disabled = false
}) => {
    const { classes, classesLoading, classesError } = useClassesData();
    
    const {
        matieres,
        loading: matieresLoading,
        error: matieresError,
        fetchMatieres,
        clearMatieres
    } = useMatieresData();

    const { periodes, loading: periodesLoading, error: periodesError } = usePeriodesData();

    // Hook pour récupérer les années scolaires
    const { annees, loading: anneesLoading, error: anneesError } = useAnneesData();

    // Charger les matières quand une classe est sélectionnée
    useEffect(() => {
        if (selectedClasse) {
            fetchMatieres(selectedClasse, 38);
        } else {
            clearMatieres();
        }
    }, [selectedClasse, fetchMatieres, clearMatieres]);

    const isDataLoading = classesLoading || matieresLoading || periodesLoading || anneesLoading;
    const hasDataError = classesError || matieresError || periodesError || anneesError;

    return (
        <div style={{ marginBottom: 20 }}>
            {hasDataError && (
                <div style={{ marginBottom: 15 }}>
                    <Message type="error" showIcon>
                        Erreur de chargement des données
                    </Message>
                </div>
            )}

            <Row gutter={16}>
                {/* Classe */}
                <Col xs={24} md={6}>
                    <div style={{ marginBottom: 15 }}>
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
                            onChange={(value) => {
                                onClasseChange(value);
                                onMatiereChange(null);
                            }}
                            placeholder="Choisir une classe"
                            searchable
                            style={{ width: '100%' }}
                            loading={classesLoading}
                            disabled={classesLoading || disabled}
                            cleanable={false}
                            size="lg"
                        />
                    </div>
                </Col>

                {/* Matière */}
                <Col xs={24} md={6}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Matière (optionnel)
                        </label>
                        <SelectPicker
                            data={matieres.map(matiere => ({
                                value: matiere.id,
                                label: matiere.libelle,
                                id: matiere.id
                            }))}
                            value={selectedMatiere}
                            onChange={onMatiereChange}
                            placeholder={matieresLoading ? "Chargement..." : "Toutes les matières"}
                            searchable
                            style={{ width: '100%' }}
                            loading={matieresLoading}
                            disabled={!selectedClasse || matieresLoading || disabled}
                            cleanable={true}
                            size="lg"
                        />
                    </div>
                </Col>

                {/* Période */}
                <Col xs={24} md={6}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Période (optionnel)
                        </label>
                        <SelectPicker
                            data={periodes}
                            value={selectedPeriode}
                            onChange={onPeriodeChange}
                            placeholder="Toutes"
                            searchable
                            style={{ width: '100%' }}
                            loading={periodesLoading}
                            disabled={periodesLoading || disabled}
                            cleanable={true}
                            size="lg"
                        />
                    </div>
                </Col>

                {/* Année Scolaire */}
                <Col xs={24} md={6}>
                    <div style={{ marginBottom: 15 }}>
                        <label style={{ 
                            display: 'block', 
                            marginBottom: 8, 
                            fontWeight: '500', 
                            color: '#475569',
                            fontSize: '14px'
                        }}>
                            Année Scolaire *
                        </label>
                        <SelectPicker
                            data={annees}
                            value={selectedAnnee}
                            onChange={onAnneeChange}
                            placeholder="Choisir l'année"
                            searchable
                            style={{ width: '100%' }}
                            loading={anneesLoading}
                            disabled={anneesLoading || disabled}
                            cleanable={false}
                            size="lg"
                            renderMenu={menu => {
                                if (annees.length === 0 && !anneesLoading) {
                                    return (
                                        <div style={{ padding: '10px', textAlign: 'center', color: '#999' }}>
                                            Aucune année scolaire trouvée
                                        </div>
                                    );
                                }
                                return menu;
                            }}
                        />
                    </div>
                </Col>
            </Row>

            {/* Loading indicator */}
            {isDataLoading && (
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 10, 
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

// ===========================
// COMPOSANT D'UPLOAD DE FICHIER
// ===========================
const FileUploadSection = ({ 
    onFileLoad, 
    loading, 
    fileInfo,
    onClear 
}) => {
    const handleFileUpload = useCallback((fileList) => {
        if (fileList.length > 0) {
            const file = fileList[0].blobFile;
            if (onFileLoad) {
                onFileLoad(file);
            }
        }
    }, [onFileLoad]);

    return (
        <div style={{ 
            background: 'white',
            borderRadius: '15px',
            padding: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)',
            marginBottom: '20px'
        }}>
            {/* En-tête */}
            <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                marginBottom: 25,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <div style={{
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    borderRadius: '10px',
                    padding: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <FiBarChart size={18} color="white" />
                </div>
                <div>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Importation de Notes d'Évaluation
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        Téléchargez un fichier CSV ou Excel contenant les notes des élèves
                    </p>
                </div>
            </div>

            <Row gutter={20}>
                <Col xs={24} md={16}>
                    {!fileInfo ? (
                        <div style={{
                            border: '2px dashed #d1d5db',
                            borderRadius: '12px',
                            padding: '40px 20px',
                            textAlign: 'center',
                            backgroundColor: '#f8fafc',
                            transition: 'all 0.3s ease'
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
                                    <div style={{ marginBottom: 15 }}>
                                        <FiFile size={48} color="#f59e0b" />
                                    </div>
                                    <div style={{ marginBottom: 10 }}>
                                        <Button
                                            appearance="primary"
                                            loading={loading}
                                            style={{ 
                                                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                border: 'none'
                                            }}
                                        >
                                            {loading ? 'Chargement...' : 'Choisir un fichier'}
                                        </Button>
                                    </div>
                                    <p style={{ 
                                        margin: 0, 
                                        color: '#64748b', 
                                        fontSize: '14px'
                                    }}>
                                        ou glissez-déposez votre fichier ici
                                    </p>
                                    <p style={{ 
                                        margin: '5px 0 0 0', 
                                        color: '#94a3b8', 
                                        fontSize: '12px'
                                    }}>
                                        Formats acceptés: CSV, Excel (.xls, .xlsx)
                                    </p>
                                </div>
                            </Uploader>
                        </div>
                    ) : (
                        <div style={{
                            border: '2px solid #f59e0b',
                            borderRadius: '12px',
                            padding: '20px',
                            backgroundColor: '#fffbeb'
                        }}>
                            <div style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center' 
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <FiFile size={24} color="#f59e0b" />
                                    <div>
                                        <div style={{ 
                                            fontWeight: '600', 
                                            color: '#1e293b' 
                                        }}>
                                            {fileInfo.name}
                                        </div>
                                        <div style={{ 
                                            fontSize: '12px', 
                                            color: '#64748b' 
                                        }}>
                                            {(fileInfo.size / 1024).toFixed(1)} KB
                                        </div>
                                    </div>
                                </div>
                                <IconButton
                                    icon={<FiTrash2 />}
                                    onClick={onClear}
                                    color="red"
                                    appearance="subtle"
                                    size="sm"
                                />
                            </div>
                        </div>
                    )}
                </Col>

                <Col xs={24} md={8}>
                    <div style={{
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        padding: '20px'
                    }}>
                        <h6 style={{ 
                            margin: '0 0 15px 0', 
                            color: '#1e293b', 
                            fontSize: '14px',
                            fontWeight: '600'
                        }}>
                            Format requis
                        </h6>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                            <p style={{ margin: '0 0 8px 0' }}>
                                <strong>Colonne obligatoire :</strong>
                            </p>
                            <ul style={{ margin: '0 0 12px 15px', padding: 0 }}>
                                <li>matricule</li>
                            </ul>
                            <p style={{ margin: '0 0 8px 0' }}>
                                <strong>Colonnes de notes (130+ disponibles) :</strong>
                            </p>
                            <ul style={{ margin: '0', padding: '0 0 0 15px' }}>
                                <li>noteFran1, noteFran2, noteFran3...</li>
                                <li>noteMath1, noteMath2, noteMath3...</li>
                                <li>noteAng1, noteAng2, noteAng3...</li>
                                <li>Et toutes les autres matières...</li>
                            </ul>
                            <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#f59e0b' }}>
                                <strong>Notes entre 0 et 20</strong>
                            </p>
                        </div>
                    </div>
                </Col>
            </Row>
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const ImportNotesWithSwal = () => {
    const navigate = useNavigate();
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedMatiere, setSelectedMatiere] = useState(null);
    const [selectedPeriode, setSelectedPeriode] = useState(null);
    const [selectedAnnee, setSelectedAnnee] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const apiUrls = useAllApiUrls();

    // État de sélection géré localement
    const [localSelectedRows, setLocalSelectedRows] = useState([]);

    const {
        data,
        loading,
        error,
        fileInfo,
        importing,
        loadFile,
        clearData
    } = useImportNotesData();

    // Synchroniser la sélection locale avec les données
    useEffect(() => {
        if (data.length > 0) {
            // Auto-sélectionner les lignes valides au chargement
            const validIds = data.filter(row => row.isValid).map(row => row.id);
            setLocalSelectedRows(validIds);
        } else {
            setLocalSelectedRows([]);
        }
    }, [data]);

    // ===========================
    // GESTION DE LA SÉLECTION
    // ===========================
    const handleSelectionChange = useCallback((selectedIds) => {
        console.log("Sélection des notes:", selectedIds);
        
        // Détection si c'est une sélection/désélection globale
        const allValidIds = data.filter(row => row.isValid).map(row => row.id);
        const isSelectingAll = selectedIds.length > localSelectedRows.length && 
                              selectedIds.length >= allValidIds.length;
        const isDeselectingAll = selectedIds.length === 0;
        
        if (isSelectingAll) {
            console.log("Sélection globale détectée");
            setLocalSelectedRows(allValidIds);
        } else if (isDeselectingAll) {
            console.log("Désélection globale détectée");
            setLocalSelectedRows([]);
        } else {
            // Sélection individuelle : filtrer les lignes valides
            const validSelectedIds = selectedIds.filter(id => {
                const row = data.find(r => r.id === id);
                return row && row.isValid;
            });
            
            console.log("Sélection individuelle:", validSelectedIds);
            setLocalSelectedRows(validSelectedIds);
        }
    }, [data, localSelectedRows]);

    const handleSelectAll = useCallback(() => {
        const allValidIds = data.filter(row => row.isValid).map(row => row.id);
        console.log("Sélection manuelle de tout:", allValidIds);
        setLocalSelectedRows(allValidIds);
    }, [data]);

    const handleUnselectAll = useCallback(() => {
        console.log("Désélection manuelle de tout");
        setLocalSelectedRows([]);
    }, []);

    // ===========================
    // GESTION DES ACTIONS
    // ===========================
    const handleFileLoad = useCallback((file) => {
        loadFile(file);
    }, [loadFile]);

    const handleClearFile = useCallback(() => {
        clearData();
        setLocalSelectedRows([]);
    }, [clearData]);

    // Fonction pour prévisualiser les données JSON
    const handlePreviewData = useCallback(() => {
        if (localSelectedRows.length === 0) {
            toaster.push(
                <Message type="warning" showIcon closable>
                    <strong>Aucune sélection :</strong> Veuillez sélectionner au moins une ligne pour prévisualiser
                </Message>,
                { duration: 4000 }
            );
            return;
        }

        const selectedData = data.filter(row => localSelectedRows.includes(row.id));
        const validData = selectedData.filter(row => row.isValid);

        // Formater selon le format API
        const previewData = validData.slice(0, 2).map(row => {
            const noteData = {
                matricule: row.matricule,
                annee: parseInt(selectedAnnee || 226),
                periode: parseInt(selectedPeriode || 4),
                classe: parseInt(selectedClasse || 91145)
            };

            // Ajouter quelques notes pour la prévisualisation
            ['noteFran1', 'noteFran2', 'noteMath1', 'noteMath2'].forEach(col => {
                noteData[col] = row[col] || "";
            });

            // Ajouter quelques IDs de matières
            noteData.matiereFranId = 1;
            noteData.matiereMathId = 7;

            return noteData;
        });

        Swal.fire({
            title: 'Aperçu des données formatées',
            html: `
                <div style="text-align: left;">
                    <p><strong>Format JSON qui sera envoyé à l'API :</strong></p>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left;">
${JSON.stringify(previewData, null, 2)}
                        </pre>
                    </div>
                    <p style="margin-top: 10px;"><small>Aperçu des 2 premiers élèves avec quelques colonnes seulement</small></p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Compris',
            confirmButtonColor: '#f59e0b',
            width: 700,
            allowOutsideClick: true,
            allowEscapeKey: true
        });
    }, [data, localSelectedRows, selectedClasse, selectedAnnee, selectedPeriode]);

    const handleImport = useCallback(async () => {
    if (!selectedClasse) {
        toaster.push(
            <Message type="error" showIcon closable>
                <strong>Erreur :</strong> Veuillez sélectionner une classe
            </Message>,
            { duration: 5000 }
        );
        return;
    }

    if (!selectedAnnee) {
        toaster.push(
            <Message type="error" showIcon closable>
                <strong>Erreur :</strong> Veuillez sélectionner une année scolaire
            </Message>,
            { duration: 5000 }
        );
        return;
    }

    if (localSelectedRows.length === 0) {
        toaster.push(
            <Message type="error" showIcon closable>
                <strong>Erreur :</strong> Veuillez sélectionner au moins une ligne à importer
            </Message>,
            { duration: 5000 }
        );
        return;
    }

    // Préparer les données pour l'aperçu
    const selectedData = data.filter(row => localSelectedRows.includes(row.id));
    const validData = selectedData.filter(row => row.isValid);

    if (validData.length === 0) {
        toaster.push(
            <Message type="error" showIcon closable>
                <strong>Erreur :</strong> Aucune ligne valide sélectionnée pour l'importation
            </Message>,
            { duration: 5000 }
        );
        return;
    }

    // SweetAlert de confirmation avec aperçu
    const { isConfirmed } = await Swal.fire({
        title: 'Confirmer l\'importation des notes',
        html: `
            <div style="text-align: left;">
                <p><strong>Vous êtes sur le point d'importer :</strong></p>
                <ul style="margin: 10px 0;">
                    <li><strong>${validData.length}</strong> élève(s) avec notes valides</li>
                    <li>Classe ID: <strong>${selectedClasse}</strong></li>
                    <li>Année: <strong>${selectedAnnee}</strong></li>
                    <li>Période: <strong>${selectedPeriode || 4}</strong></li>
                </ul>
                <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
                    <small><strong>Premiers élèves :</strong></small><br>
                    ${validData.slice(0, 3).map(eleve => 
                        `<small>• ${eleve.matricule} (${eleve.notesSaisies} notes)</small>`
                    ).join('<br>')}
                    ${validData.length > 3 ? '<br><small>... et ' + (validData.length - 3) + ' autre(s)</small>' : ''}
                </div>
                <p style="color: #dc3545; font-size: 14px;">
                    <strong>⚠️ Cette action est irréversible</strong>
                </p>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Oui, importer les notes',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#f59e0b',
        cancelButtonColor: '#6c757d',
        width: 550,
        backdrop: true
    });

    if (!isConfirmed) {
        return;
    }

    // État de chargement pour les boutons de l'interface
    setIsImporting(true);

    // Afficher le loader SweetAlert
    Swal.fire({
        title: 'Importation en cours...',
        html: `
            <div style="text-align: center; padding: 20px;">
                <div style="display: inline-block; margin-bottom: 20px;">
                    <div class="swal2-loader" style="border-color: #f59e0b transparent #f59e0b transparent !important;"></div>
                </div>
                <p style="margin: 10px 0; color: #64748b; font-size: 14px;">
                    Importation de <strong>${validData.length} ligne(s)</strong> de notes...
                </p>
                <p style="margin: 5px 0; color: #94a3b8; font-size: 12px;">
                    Veuillez patienter, cette opération peut prendre quelques instants.
                </p>
                <div style="background: #fffbeb; padding: 10px; border-radius: 5px; margin: 15px 0; font-size: 11px; color: #92400e;">
                    📊 Classe: ${selectedClasse} • Année: ${selectedAnnee} • Période: ${selectedPeriode || 4}
                </div>
            </div>
        `,
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });

    try {
        // Toutes les colonnes de notes disponibles
        const NOTES_COLUMNS = [
            'noteFran1', 'noteFran2', 'noteFran3', 'noteFran4', 'noteFran5',
            'noteExpreOral1', 'noteExpreOral2', 'noteExpreOral3', 'noteExpreOral4', 'noteExpreOral5',
            'noteCompoFr1', 'noteCompoFr2', 'noteCompoFr3', 'noteCompoFr4', 'noteCompoFr5',
            'noteOrthoGram1', 'noteOrthoGram2', 'noteOrthoGram3', 'noteOrthoGram4', 'noteOrthoGram5',
            'notephiloso1', 'notephiloso2', 'notephiloso3', 'notephiloso4', 'notephiloso5',
            'noteAng1', 'noteAng2', 'noteAng3', 'noteAng4', 'noteAng5',
            'noteMath1', 'noteMath2', 'noteMath3', 'noteMath4', 'noteMath5',
            'notePhysiq1', 'notePhysiq2', 'notePhysiq3', 'notePhysiq4', 'notePhysiq5',
            'noteSVT1', 'noteSVT2', 'noteSVT3', 'noteSVT4', 'noteSVT5',
            'noteEsp1', 'noteEsp2', 'noteEsp3', 'noteEsp4', 'noteEsp5',
            'noteAll1', 'noteAll2', 'noteAll3', 'noteAll4', 'noteAll5',
            'noteArplat1', 'noteArplat2', 'noteArplat3', 'noteArplat4', 'noteArplat5',
            'noteTic1', 'noteTic2', 'noteTic3', 'noteTic4', 'noteTic5',
            'noteInfor1', 'noteInfor2', 'noteInfor3', 'noteInfor4', 'noteInfor5',
            'noteConduite1', 'noteConduite2', 'noteConduite3', 'noteConduite4', 'noteConduite5',
            'noteEps1', 'noteEps2', 'noteEps3', 'noteEps4', 'noteEps5',
            'noteHg1', 'noteHg2', 'noteHg3', 'noteHg4', 'noteHg5',
            'noteEdhc1', 'noteEdhc2', 'noteEdhc3', 'noteEdhc4', 'noteEdhc5',
            'noteArabe1', 'noteArabe2', 'noteArabe3', 'noteArabe4', 'noteArabe5',
            'noteArtVisu1', 'noteArtVisu2', 'noteArtVisu3', 'noteArtVisu4', 'noteArtVisu5',
            'noteEmr1', 'noteEmr2', 'noteEmr3', 'noteEmr4', 'noteEmr5',
            'noteFiq1', 'noteFiq2', 'noteFiq3', 'noteFiq4', 'noteFiq5',
            'noteAssirah1', 'noteAssirah2', 'noteAssirah3', 'noteAssirah4', 'noteAssirah5',
            'noteAlquidah1', 'noteAlquidah2', 'noteAlquidah3', 'noteAlquidah4', 'noteAlquidah5',
            'noteAlAklaq1', 'noteAlAklaq2', 'noteAlAklaq3', 'noteAlAklaq4', 'noteAlAklaq5',
            'noteMemo1', 'noteMemo2', 'noteMemo3', 'noteMemo4', 'noteMemo5'
        ];

        // Formater pour l'API selon le format requis
        const formattedData = validData.map(row => {
            const noteData = {
                matricule: String(row.matricule),
                annee: parseInt(selectedAnnee),
                periode: parseInt(selectedPeriode || 4),
                classe: parseInt(selectedClasse)
            };

            // Ajouter toutes les notes (avec chaînes vides pour les notes manquantes)
            NOTES_COLUMNS.forEach(col => {
                if (row[col] && row[col] !== '') {
                    const value = parseFloat(row[col]);
                    if (!isNaN(value)) {
                        noteData[col] = value.toString();
                    } else {
                        noteData[col] = "";
                    }
                } else {
                    noteData[col] = "";
                }
            });

            // Ajouter les IDs des matières (valeurs par défaut basées sur l'exemple)
            const baseIds = {
                matiereMathId: 7,
                matiereFranId: 1,
                matiereCompoFrId: 2,
                matiereExpreOralId: 3,
                matiereOrthoGramId: 4,
                matiereHgId: 6,
                matiereEdhcId: 11,
                matierephilosoId: 26,
                matiereAngId: 5,
                matierePhysiqId: 8,
                matiereSVTId: 9,
                matiereEspId: 21,
                matiereAllId: 25,
                matiereArplatId: 36,
                matiereTicId: 27,
                matiereConduiteId: 12,
                matiereEpsId: 10,
                matiereArabeId: 73,
                matiereArtVisuId: 36,
                matiereAssirahId: 35,
                matiereAlquidahId: 37,
                matiereEmrId: 31,
                matiereMemoId: 29,
                matiereAlAklaqId: 38,
                matiereFiqId: 30,
                matiereInforId: 13
            };

            // Fusionner avec les IDs des matières
            Object.assign(noteData, baseIds);

            return noteData;
        });

        // Appel API direct
        const apiUrl = apiUrls.imports.importEvaluationsClasse();
        
        console.log('URL API:', apiUrl);
        console.log('Données envoyées:', JSON.stringify(formattedData, null, 2));
        
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formattedData)
        });

        // Récupérer le contenu de la réponse
        const responseText = await response.text();
        console.log('Réponse brute:', responseText);

        if (!response.ok) {
            // Essayer de parser en JSON, sinon utiliser le texte brut
            let errorMessage;
            try {
                const errorData = JSON.parse(responseText);
                errorMessage = errorData.message || `Erreur HTTP ${response.status}`;
            } catch (e) {
                // Si ce n'est pas du JSON, utiliser le texte brut
                errorMessage = responseText || `Erreur HTTP ${response.status}: ${response.statusText}`;
            }
            throw new Error(errorMessage);
        }

        // Essayer de parser la réponse de succès
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (e) {
            // Si la réponse de succès n'est pas du JSON valide
            console.warn('Réponse de succès non-JSON:', responseText);
            result = { message: 'Importation réussie', data: responseText };
        }
        
        // Fermer le loader et afficher le succès
        await Swal.fire({
            title: 'Importation réussie !',
            html: `
                <div style="text-align: center;">
                    <div style="margin-bottom: 20px;">
                        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                            <svg width="30" height="30" fill="white" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                    <p><strong>${validData.length} ligne(s) de notes</strong> ont été importées avec succès</p>
                    <div style="background: #d4edda; color: #155724; padding: 15px; border-radius: 8px; margin: 15px 0;">
                        ✅ Les notes ont été enregistrées dans le système
                    </div>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0; font-size: 12px; color: #64748b;">
                        📊 Classe: ${selectedClasse} • Année: ${selectedAnnee} • Période: ${selectedPeriode || 4}
                    </div>
                </div>
            `,
            icon: 'success',
            confirmButtonText: 'Parfait !',
            confirmButtonColor: '#10b981',
            allowOutsideClick: false,
            allowEscapeKey: false,
            timer: 0 // Pas de timer automatique
        });

        // Optionnel : Vider les données après import réussi
        clearData();
        setLocalSelectedRows([]);

    } catch (error) {
        console.error('Erreur importation:', error);
        
        // Fermer le loader et afficher l'erreur
        await Swal.fire({
            title: 'Erreur d\'importation',
            html: `
                <div style="text-align: left;">
                    <div style="text-align: center; margin-bottom: 20px;">
                        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                            <svg width="30" height="30" fill="white" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
                            </svg>
                        </div>
                    </div>
                    <p style="text-align: center;"><strong>L'importation a échoué</strong></p>
                    <div style="background: #f8d7da; color: #721c24; padding: 15px; border-radius: 8px; margin: 15px 0; max-height: 200px; overflow-y: auto;">
                        <pre style="margin: 0; font-size: 12px; white-space: pre-wrap;">${error.message}</pre>
                    </div>
                    <div style="background: #fff3cd; color: #856404; padding: 12px; border-radius: 8px; margin: 15px 0; font-size: 12px;">
                        💡 <strong>Suggestions :</strong><br>
                        • Vérifiez que toutes les données obligatoires sont remplies<br>
                        • Utilisez l'aperçu JSON pour vérifier le format<br>
                        • Contactez l'administrateur si le problème persiste
                    </div>
                </div>
            `,
            icon: 'error',
            confirmButtonText: 'Compris',
            confirmButtonColor: '#dc2626',
            allowOutsideClick: false,
            allowEscapeKey: false
        });
    } finally {
        // Désactiver le state d'importation
        setIsImporting(false);
    }
}, [selectedClasse, selectedAnnee, selectedPeriode, localSelectedRows, data, clearData, apiUrls.imports]);

    const handleTableAction = useCallback((actionType, item) => {
        if (actionType === 'view') {
            console.log('Voir détails:', item);
        }
    }, []);

    // Statistiques
    const totalRows = data.length;
    const validRows = data.filter(row => row.isValid).length;
    const errorRows = totalRows - validRows;
    const selectedCount = localSelectedRows.length;

    // Statistiques sur les notes
    const totalNotes = data.reduce((sum, row) => sum + (row.notesSaisies || 0), 0);
    const avgNotes = totalRows > 0 ? (totalNotes / totalRows).toFixed(1) : 0;

    // ===========================
    // RENDU
    // ===========================
    return (
        <div style={{ 
             
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Section d'upload */}
                <div className="row">
                    <div className="col-lg-12">
                        <FileUploadSection
                            onFileLoad={handleFileLoad}
                            loading={loading}
                            fileInfo={fileInfo}
                            onClear={handleClearFile}
                        />
                    </div>
                </div>

                {/* Erreur de chargement */}
                {error && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '20px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(239, 68, 68, 0.15)'
                            }}>
                                <Message type="error" showIcon>
                                    <strong>{error.message}</strong>
                                    {error.details && (
                                        <div style={{ marginTop: 10, fontSize: '12px' }}>
                                            Détails: {JSON.stringify(error.details)}
                                        </div>
                                    )}
                                </Message>
                            </div>
                        </div>
                    </div>
                )}

                {/* Section de contrôle et statistiques */}
                {data.length > 0 && (
                    <div className="row mb-4">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '25px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)'
                            }}>
                                {/* En-tête avec stats */}
                                <div style={{ 
                                    display: 'flex', 
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: 20,
                                    paddingBottom: 15,
                                    borderBottom: '1px solid #f1f5f9'
                                }}>
                                    <div>
                                        <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                                            Prévisualisation - {totalRows} ligne(s)
                                        </h5>
                                        <div style={{ display: 'flex', gap: 15, marginTop: 8, flexWrap: 'wrap' }}>
                                            <Badge content={validRows} style={{ backgroundColor: '#10b981' }}>
                                                Valides
                                            </Badge>
                                            <Badge content={errorRows} style={{ backgroundColor: '#ef4444' }}>
                                                Erreurs
                                            </Badge>
                                            <Badge content={selectedCount} style={{ backgroundColor: '#f59e0b' }}>
                                                Sélectionnés
                                            </Badge>
                                            <Badge content={totalNotes} style={{ backgroundColor: '#8b5cf6' }}>
                                                Notes totales
                                            </Badge>
                                            <Badge content={`${avgNotes}/ligne`} style={{ backgroundColor: '#06b6d4' }}>
                                                Moyenne
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Sélection des critères d'importation */}
                                <ImportNotesSelector
                                    selectedClasse={selectedClasse}
                                    selectedMatiere={selectedMatiere}
                                    selectedPeriode={selectedPeriode}
                                    selectedAnnee={selectedAnnee}
                                    onClasseChange={setSelectedClasse}
                                    onMatiereChange={setSelectedMatiere}
                                    onPeriodeChange={setSelectedPeriode}
                                    onAnneeChange={setSelectedAnnee}
                                    disabled={isImporting}
                                />

                                {/* Boutons d'action */}
                                <div style={{ 
                                    display: 'flex', 
                                    gap: 10, 
                                    alignItems: 'center',
                                    marginTop: 20
                                }}>
                                    <Button
                                        onClick={handleSelectAll}
                                        disabled={isImporting || validRows === 0}
                                        size="md"
                                    >
                                        <FiCheck size={16} style={{ marginRight: 5 }} />
                                        Sélectionner tout
                                    </Button>

                                    <Button
                                        onClick={handleUnselectAll}
                                        disabled={isImporting || selectedCount === 0}
                                        size="md"
                                    >
                                        <FiX size={16} style={{ marginRight: 5 }} />
                                        Désélectionner
                                    </Button>

                                    <Button
                                        onClick={handlePreviewData}
                                        disabled={isImporting || selectedCount === 0}
                                        size="md"
                                        color="blue"
                                        appearance="ghost"
                                    >
                                        <FiEye size={16} style={{ marginRight: 5 }} />
                                        Aperçu JSON
                                    </Button>

                                    <div style={{ flex: 1 }} />

                                    <Button
                                        appearance="primary"
                                        onClick={handleImport}
                                        loading={isImporting}
                                        disabled={!selectedClasse || !selectedAnnee || selectedCount === 0}
                                        size="lg"
                                        style={{ 
                                            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontWeight: '600',
                                            minWidth: '140px'
                                        }}
                                    >
                                        {isImporting ? 'Importation...' : `Importer (${selectedCount})`}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DataTable */}
                {data.length > 0 && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                overflow: 'hidden'
                            }}>
                                <DataTable
                                    title="Notes à importer"
                                    subtitle={`${totalRows} ligne(s) • ${validRows} valides • ${selectedCount} sélectionnées • ${totalNotes} notes`}
                                    
                                    data={data}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={importNotesTableConfig.columns}
                                    searchableFields={importNotesTableConfig.searchableFields}
                                    filterConfigs={importNotesTableConfig.filterConfigs}
                                    actions={importNotesTableConfig.actions}
                                    
                                    onAction={handleTableAction}
                                    
                                    defaultPageSize={15}
                                    pageSizeOptions={[10, 15, 25, 50]}
                                    tableHeight={600}
                                    
                                    enableRefresh={false}
                                    enableCreate={false}
                                    
                                    // Configuration de sélection optimisée
                                    selectable={true}
                                    selectedItems={localSelectedRows}
                                    onSelectionChange={handleSelectionChange}
                                    rowKey="id"
                                    
                                    // Empêcher la sélection des lignes invalides
                                    disabledItemValues={data.filter(row => !row.isValid).map(row => row.id)}
                                    
                                    customStyles={{
                                        container: { backgroundColor: "transparent" },
                                        panel: { minHeight: "600px", border: "none", boxShadow: "none" },
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Message d'accueil */}
                {!fileInfo && !loading && (
                    <div className="row">
                        <div className="col-lg-12">
                            <div style={{
                                background: 'white',
                                borderRadius: '15px',
                                padding: '40px',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(59, 130, 246, 0.15)',
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
                                    <FiBarChart size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Importation de Notes d'Évaluation
                                </h5>
                                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
                                    Téléchargez un fichier CSV ou Excel pour importer les notes des élèves selon vos critères de sélection.
                                    Vous pourrez prévisualiser et valider les données avant l'importation définitive.
                                </p>
                                <div style={{
                                    background: '#fffbeb',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginTop: '20px',
                                    textAlign: 'left'
                                }}>
                                    <h6 style={{ color: '#d97706', fontSize: '14px', margin: '0 0 10px 0' }}>
                                        📊 Étapes de l'importation :
                                    </h6>
                                    <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#92400e' }}>
                                        <li>Téléchargez votre fichier CSV ou Excel avec les notes</li>
                                        <li>Prévisualisez et vérifiez les données</li>
                                        <li>Sélectionnez les critères d'importation (classe, année, etc.)</li>
                                        <li>Choisissez les lignes à importer</li>
                                        <li>Confirmez l'importation avec SweetAlert</li>
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportNotesWithSwal;