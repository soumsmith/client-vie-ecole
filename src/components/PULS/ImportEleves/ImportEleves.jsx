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
    Progress,
    Notification,
    SelectPicker,
    Uploader,
    IconButton,
    Checkbox,
    toaster
} from 'rsuite';
import { 
    FiUpload, 
    FiDownload, 
    FiUsers, 
    FiFile,
    FiCheck,
    FiX,
    FiRefreshCw,
    FiEye,
    FiTrash2,
    FiBarChart,
    FiBookOpen
} from 'react-icons/fi';
import Swal from 'sweetalert2';

// Import des fonctions externalisées
import DataTable from "../../DataTable";
import { 
    useImportElevesData,
    importElevesTableConfig
} from './ImportEleveService';

import { useNiveauxBranchesData } from "../utils/CommonDataService";
import { useAllApiUrls } from '../utils/apiConfig';

// ===========================
// VERSION COMPLÈTE AVEC TOUTES LES COLONNES
// ===========================

const ImportElevesComplet = () => {
    const navigate = useNavigate();
    const [selectedBranche, setSelectedBranche] = useState(null);
    const [isImporting, setIsImporting] = useState(false); // État local pour l'importation
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
        importSelectedEleves,
        clearData
    } = useImportElevesData();

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
        console.log("Sélection des élèves:", selectedIds);
        
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

    const handleTableAction = useCallback((actionType, item) => {
        if (actionType === 'view') {
            console.log('Voir détails:', item);
        }
    }, []);

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

    const handleImport = useCallback(async () => {
        if (!selectedBranche) {
            toaster.push(
                <Message type="error" showIcon closable>
                    <strong>Erreur :</strong> Veuillez sélectionner une branche de destination
                </Message>,
                { duration: 5000 }
            );
            return;
        }

        if (localSelectedRows.length === 0) {
            toaster.push(
                <Message type="error" showIcon closable>
                    <strong>Erreur :</strong> Veuillez sélectionner au moins un élève à importer
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
            title: 'Confirmer l\'importation',
            html: `
                <div style="text-align: left;">
                    <p><strong>Vous êtes sur le point d'importer :</strong></p>
                    <ul style="margin: 10px 0;">
                        <li><strong>${validData.length}</strong> élève(s) valide(s)</li>
                        <li>Dans la branche sélectionnée</li>
                        <li>Avec toutes les colonnes disponibles</li>
                    </ul>
                    <div style="background: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
                        <small><strong>Premiers élèves :</strong></small><br>
                        ${validData.slice(0, 3).map(eleve => 
                            `<small>• ${eleve.nom} ${eleve.prenoms} (${eleve.matricule})</small>`
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
            confirmButtonText: 'Oui, importer',
            cancelButtonText: 'Annuler',
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6c757d',
            width: 500,
            backdrop: true
        });

        if (!isConfirmed) {
            return;
        }

        // État de chargement
        try {
            // Activer le state d'importation
            setIsImporting(true);

            // Formater les données pour l'API selon le format requis
            const importData = validData.map(row => {
                // Toutes les colonnes requises avec valeurs par défaut vides
                const apiData = {
                    matricule: String(row.matricule || ''),
                    nom: String(row.nom || ''),
                    prenoms: String(row.prenoms || ''),
                    statut: String(row.statut || ''),
                    nationalite: String(row.nationalite || ''),
                    ivoirien: String(row.ivoirien || ''),
                    etranger_africain: String(row.etranger_africain || ''),
                    etranger_non_africain: String(row.etranger_non_africain || ''),
                    sexe: String(row.sexe || ''),
                    lv2: String(row.lv2 || ''),
                    datenaissance: String(row.datenaissance || ''),
                    branche: String(row.branche || ''),
                    lieun: String(row.lieun || ''),
                    adresse: String(row.adresse || ''),
                    mobile: String(row.mobile || ''),
                    mobile2: String(row.mobile2 || ''),
                    pere: String(row.pere || ''),
                    mere: String(row.mere || ''),
                    tuteur: String(row.tuteur || ''),
                    redoublant: String(row.redoublant || ''),
                    regime: String(row.regime || ''),
                    decision_ant: String(row.decision_ant || ''),
                    extrait_numero: String(row.extrait_numero || ''),
                    extrait_date: String(row.extrait_date || ''),
                    extrait_lieu: String(row.extrait_lieu || ''),
                    decision_aff: String(row.decision_aff || '')
                };
                
                return apiData;
            });

            // Appel API direct
            const typeAction = 'INSCRIPTION';
            const apiUrl = apiUrls.imports.importElevesComplet(typeAction, selectedBranche);
            console.log('URL API:', apiUrl);
            console.log('Données à envoyer:', JSON.stringify(importData, null, 2));
            
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(importData)
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
            
            // Notification de succès avec SweetAlert UNIQUEMENT
            await Swal.fire({
                title: 'Importation réussie !',
                html: `
                    <div style="text-align: center;">
                        <p><strong>${validData.length} élève(s)</strong> ont été importés avec succès</p>
                        <div style="background: #d4edda; color: #155724; padding: 10px; border-radius: 5px; margin: 10px 0;">
                            ✅ Les données ont été enregistrées dans le système
                        </div>
                    </div>
                `,
                icon: 'success',
                confirmButtonText: 'Parfait !',
                confirmButtonColor: '#10b981',
                allowOutsideClick: false,
                allowEscapeKey: false
            });

            // Optionnel : Vider les données après import réussi
            clearData();
            setLocalSelectedRows([]);

        } catch (error) {
            console.error('Erreur importation:', error);
            
            // Notification d'erreur avec SweetAlert
            await Swal.fire({
                title: 'Erreur d\'importation',
                html: `
                    <div style="text-align: left;">
                        <p><strong>L'importation a échoué :</strong></p>
                        <div style="background: #f8d7da; color: #721c24; padding: 10px; border-radius: 5px; margin: 10px 0; max-height: 200px; overflow-y: auto;">
                            <pre style="margin: 0; font-size: 12px; white-space: pre-wrap;">${error.message}</pre>
                        </div>
                        <div style="background: #fff3cd; color: #856404; padding: 8px; border-radius: 5px; margin: 10px 0; font-size: 12px;">
                            💡 <strong>Suggestions :</strong><br>
                            • Vérifiez que toutes les données obligatoires sont remplies<br>
                            • Utilisez l'aperçu JSON pour vérifier le format<br>
                            • Contactez l'administrateur si le problème persiste
                        </div>
                    </div>
                `,
                icon: 'error',
                confirmButtonText: 'Compris',
                confirmButtonColor: '#dc3545',
                allowOutsideClick: false,
                allowEscapeKey: false
            });
        } finally {
            // Désactiver le state d'importation
            setIsImporting(false);
        }
    }, [selectedBranche, localSelectedRows, data, clearData, apiUrls.eleves]);

    // Fonction pour prévisualiser les données formatées
    const handlePreviewData = useCallback(() => {
        if (localSelectedRows.length === 0) {
            toaster.push(
                <Message type="warning" showIcon closable>
                    <strong>Aucune sélection :</strong> Veuillez sélectionner au moins un élève pour prévisualiser
                </Message>,
                { duration: 4000 }
            );
            return;
        }

        const selectedData = data.filter(row => localSelectedRows.includes(row.id));
        const validData = selectedData.filter(row => row.isValid);

        // Formater selon le format API
        const importData = validData.slice(0, 3).map(row => ({
            matricule: String(row.matricule || ''),
            nom: String(row.nom || ''),
            prenoms: String(row.prenoms || ''),
            statut: String(row.statut || ''),
            nationalite: String(row.nationalite || ''),
            ivoirien: String(row.ivoirien || ''),
            etranger_africain: String(row.etranger_africain || ''),
            etranger_non_africain: String(row.etranger_non_africain || ''),
            sexe: String(row.sexe || ''),
            lv2: String(row.lv2 || ''),
            datenaissance: String(row.datenaissance || ''),
            branche: String(row.branche || ''),
            lieun: String(row.lieun || ''),
            adresse: String(row.adresse || ''),
            mobile: String(row.mobile || ''),
            mobile2: String(row.mobile2 || ''),
            pere: String(row.pere || ''),
            mere: String(row.mere || ''),
            tuteur: String(row.tuteur || ''),
            redoublant: String(row.redoublant || ''),
            regime: String(row.regime || ''),
            decision_ant: String(row.decision_ant || ''),
            extrait_numero: String(row.extrait_numero || ''),
            extrait_date: String(row.extrait_date || ''),
            extrait_lieu: String(row.extrait_lieu || ''),
            decision_aff: String(row.decision_aff || '')
        }));

        Swal.fire({
            title: 'Aperçu des données formatées',
            html: `
                <div style="text-align: left;">
                    <p><strong>Format JSON qui sera envoyé à l'API :</strong></p>
                    <div style="max-height: 400px; overflow-y: auto;">
                        <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 11px; text-align: left;">
${JSON.stringify(importData, null, 2)}
                        </pre>
                    </div>
                    <p style="margin-top: 10px;"><small>Affichage des 3 premiers élèves seulement</small></p>
                </div>
            `,
            icon: 'info',
            confirmButtonText: 'Compris',
            confirmButtonColor: '#10b981',
            width: 600,
            allowOutsideClick: true,
            allowEscapeKey: true
        });
    }, [data, localSelectedRows]);

    // ===========================
    // COMPOSANT DE SÉLECTION BRANCHE
    // ===========================
    const BrancheSelector = () => {
        const { branches, loading: branchesLoading, error: branchesError } = useNiveauxBranchesData();

        const branchesData = branches.map(branche => ({
            value: branche.id,
            label: branche.label
        }));

        return (
            <div style={{ marginBottom: 20 }}>
                <label style={{ 
                    display: 'block', 
                    marginBottom: 8, 
                    fontWeight: '500', 
                    color: '#475569',
                    fontSize: '14px'
                }}>
                    Branche cible pour l'importation *
                </label>

                {branchesError && (
                    <div style={{ marginBottom: 10 }}>
                        <Message type="error" showIcon>
                            Erreur de chargement des branches
                        </Message>
                    </div>
                )}

                <SelectPicker
                    data={branchesData}
                    value={selectedBranche}
                    onChange={setSelectedBranche}
                    placeholder="Sélectionner la branche de destination"
                    searchable
                    style={{ width: '100%' }}
                    loading={branchesLoading}
                    disabled={branchesLoading || isImporting}
                    cleanable={false}
                    size="lg"
                />
            </div>
        );
    };

    // ===========================
    // COMPOSANT D'UPLOAD
    // ===========================
    const FileUploadSection = () => {
        const handleFileUpload = useCallback((fileList) => {
            if (fileList.length > 0) {
                const file = fileList[0].blobFile;
                handleFileLoad(file);
            }
        }, []);

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
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        borderRadius: '10px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiUsers size={18} color="white" />
                    </div>
                    <div>
                        <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                            Importation d'Élèves Complète
                        </h5>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                            Téléchargez un fichier CSV ou Excel avec toutes les colonnes internes du système
                        </p>
                    </div>
                </div>

                {!fileInfo ? (
                    <Row gutter={20}>
                        <Col xs={24} md={16}>
                            <div style={{
                                border: '2px dashed #d1d5db',
                                borderRadius: '12px',
                                padding: '40px 20px',
                                textAlign: 'center',
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
                                        <div style={{ marginBottom: 15 }}>
                                            <FiFile size={48} color="#10b981" />
                                        </div>
                                        <Button
                                            appearance="primary"
                                            loading={loading}
                                            style={{ 
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                border: 'none',
                                                marginBottom: 10
                                            }}
                                        >
                                            {loading ? 'Chargement...' : 'Choisir un fichier'}
                                        </Button>
                                        <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                                            ou glissez-déposez votre fichier ici
                                        </p>
                                        <p style={{ margin: '5px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>
                                            Formats: CSV, Excel (.xls, .xlsx)
                                        </p>
                                    </div>
                                </Uploader>
                            </div>
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
                                    Format complet (25 colonnes)
                                </h6>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    <p style={{ margin: '0 0 8px 0' }}>
                                        <strong>Colonnes obligatoires :</strong>
                                    </p>
                                    <ul style={{ margin: '0 0 12px 15px', padding: 0 }}>
                                        <li>matricule, nom, prenoms, sexe</li>
                                    </ul>
                                    <p style={{ margin: '0 0 8px 0' }}>
                                        <strong>Catégories disponibles :</strong>
                                    </p>
                                    <ul style={{ margin: '0', padding: '0 0 0 15px' }}>
                                        <li>Identification, Nationalité</li>
                                        <li>Info. personnelles, Scolarité</li>
                                        <li>Contact, Famille, État civil</li>
                                    </ul>
                                    <p style={{ margin: '10px 0 0 0', fontSize: '11px', color: '#10b981' }}>
                                        <strong>Support complet de toutes les colonnes internes</strong>
                                    </p>
                                </div>
                            </div>
                        </Col>
                    </Row>
                ) : (
                    <div style={{
                        border: '2px solid #10b981',
                        borderRadius: '12px',
                        padding: '20px',
                        backgroundColor: '#ecfdf5',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <FiFile size={24} color="#10b981" />
                            <div>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>
                                    {fileInfo.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                    {(fileInfo.size / 1024).toFixed(1)} KB
                                </div>
                            </div>
                        </div>
                        <IconButton
                            icon={<FiTrash2 />}
                            onClick={handleClearFile}
                            color="red"
                            appearance="subtle"
                            size="sm"
                        />
                    </div>
                )}
            </div>
        );
    };

    // Statistiques
    const totalRows = data.length;
    const validRows = data.filter(row => row.isValid).length;
    const errorRows = totalRows - validRows;
    const selectedCount = localSelectedRows.length;

    // Statistiques avancées
    const totalColonnesRenseignees = data.reduce((sum, row) => sum + (row.colonnesRenseignees || 0), 0);
    const avgColonnes = totalRows > 0 ? (totalColonnesRenseignees / totalRows).toFixed(1) : 0;
    const totalCategories = data.reduce((sum, row) => sum + (row.categoriesRepresentees || 0), 0);

    // ===========================
    // RENDU
    // ===========================
    return (
        <div style={{ 
             
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Upload */}
                <div className="row">
                    <div className="col-lg-12">
                        <FileUploadSection />
                    </div>
                </div>

                {/* Erreurs */}
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

                {/* Contrôles et stats */}
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
                                            <Badge content={`${avgColonnes}/ligne`} style={{ backgroundColor: '#8b5cf6' }}>
                                                Colonnes moy.
                                            </Badge>
                                            <Badge content={totalCategories} style={{ backgroundColor: '#06b6d4' }}>
                                                Catégories
                                            </Badge>
                                        </div>
                                    </div>
                                </div>

                                <Row gutter={20}>
                                    <Col xs={24} md={8}>
                                        <BrancheSelector />
                                    </Col>

                                    <Col xs={24} md={16}>
                                        <div style={{ 
                                            display: 'flex', 
                                            gap: 10, 
                                            alignItems: 'flex-end',
                                            height: '66px'
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
                                                disabled={!selectedBranche || selectedCount === 0}
                                                size="lg"
                                                style={{ 
                                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontWeight: '600',
                                                    minWidth: '140px'
                                                }}
                                            >
                                                {isImporting ? 'Importation...' : `Importer (${selectedCount})`}
                                            </Button>
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tableau avec toutes les colonnes */}
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
                                    title="Élèves à importer (toutes colonnes)"
                                    subtitle={`${totalRows} ligne(s) • ${validRows} valides • ${selectedCount} sélectionnées • ${avgColonnes} colonnes/ligne en moyenne`}
                                    
                                    data={data}
                                    loading={loading}
                                    error={null}
                                    
                                    columns={importElevesTableConfig.columns}
                                    searchableFields={importElevesTableConfig.searchableFields}
                                    filterConfigs={importElevesTableConfig.filterConfigs}
                                    actions={importElevesTableConfig.actions}
                                    
                                    onAction={handleTableAction}
                                    
                                    defaultPageSize={10}
                                    pageSizeOptions={[5, 10, 15, 25]}
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
                                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                    borderRadius: '20px',
                                    padding: '20px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: 20
                                }}>
                                    <FiUsers size={40} color="white" />
                                </div>
                                <h5 style={{ margin: '0 0 10px 0', color: '#1e293b', fontWeight: '600' }}>
                                    Importation d'Élèves - Version Complète
                                </h5>
                                <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: '14px' }}>
                                    Téléchargez un fichier CSV ou Excel avec toutes les colonnes internes du système (25 colonnes).
                                    Vous pourrez prévisualiser et valider les données avant l'importation définitive.
                                </p>
                                <div style={{
                                    background: '#ecfdf5',
                                    borderRadius: '8px',
                                    padding: '15px',
                                    marginTop: '20px',
                                    textAlign: 'left'
                                }}>
                                    <h6 style={{ color: '#059669', fontSize: '14px', margin: '0 0 10px 0' }}>
                                        🎯 Nouvelles fonctionnalités de cette version :
                                    </h6>
                                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#047857' }}>
                                        <li>Support de toutes les 25 colonnes internes du système</li>
                                        <li>Organisation par catégories (Identification, Nationalité, etc.)</li>
                                        <li>Validation avancée avec alertes et avertissements</li>
                                        <li>Statistiques détaillées sur les données importées</li>
                                        <li>Tableau horizontal scrollable pour toutes les colonnes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ImportElevesComplet;