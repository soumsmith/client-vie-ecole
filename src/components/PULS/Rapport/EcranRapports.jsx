import React, { useState, useCallback, useEffect, useRef } from "react";
import {
    Panel,
    SelectPicker,
    Toggle,
    Button,
    Notification,
    Loader,
    Radio,
    RadioGroup,
    Input,
    InputNumber,
    Badge,
    Row,
    Col,
    Card,
    Text
} from 'rsuite';
import { FiFileText, FiDownload, FiSettings, FiUsers, FiAward, FiBarChart } from 'react-icons/fi';
import "bootstrap/dist/css/bootstrap.min.css";
import Swal from 'sweetalert2';

// Import des fonctions externalisées
import DataTable from "../../DataTable";
import {
    useClassesData,
    usePeriodesData,
    useAnneesData,
    useNiveauxData,
    useRapportsData,
    useBranchesData,
    useMatieresData,
    drenaModels,
    sexeOptions,
    redoublantOptions,
    boursierOptions,
    langueVivanteOptions,
    statutOptions,
    genererRapportParCode,
    rapportsTableConfig,
    clearRapportsCache
} from './RapportsServiceManager';

const EcranRapports = ({ ecoleId = 38, niveauEnseignementId = 2 }) => {
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [generating, setGenerating] = useState(false);

    // ===========================
    // ÉTATS DES PARAMÈTRES
    // ===========================
    const [parametres, setParametres] = useState({
        // Paramètres obligatoires
        annee: null,
        periode: null,
        annuel: false,

        // Modèle DRENA
        modeleDrena: 'dren3',

        // Paramètres facultatifs
        classe: null,
        matriculeEleves: '',
        formatExcel: false,

        // Format bulletin
        decompresserBulletin: true,
        formatAvecPiedPage: false,
        supprimerFiligramme: true,
        changerPositionLogo: true,
        pivoterPhotosVersLaDroite: true,
        changerPositionRepublique: true,
        utiliserModeleSecondaire: false,
        activerDistinctions: true,
        utiliserModeleBTS: false,
        utiliserModeleSuperieurBTS: false,
        testLourd: false,
        imprimerBulletinAPartir: 0,
        imprimerBulletinJusqua: 200,
        formatEcoleArabe: false,

        // Paramètres élèves
        avecPhoto: false,
        redoublant: 'ALL',
        sexe: 'ALL',
        boursier: 'ALL',
        langueVivante: 'ALL',
        statut: 'AFFECTE',
        niveau: null,

        // Certificats
        autreModeleCertificat: false,
        nomSignataire: '',
        fonctionSignataire: '',

        // Admis
        moyenneSuperieure: 10,

        // Moyennes par professeur
        matiere: null
    });

    // ===========================
    // HOOKS POUR LES DONNÉES
    // ===========================
    const { classes, loading: classesLoading } = useClassesData(refreshTrigger);
    const { periodes, loading: periodesLoading } = usePeriodesData(refreshTrigger);
    const { annees, loading: anneesLoading } = useAnneesData(refreshTrigger);
    const { niveaux, loading: niveauxLoading } = useNiveauxData(refreshTrigger);
    const { branches, loading: branchesLoading } = useBranchesData(refreshTrigger);
    const { matieres, loading: matieresLoading } = useMatieresData(parametres.classe, refreshTrigger);
    const { rapports, loading: rapportsLoading, error: rapportsError } = useRapportsData(niveauEnseignementId, refreshTrigger);

    // ===========================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ===========================
    const handleParametreChange = useCallback((key, value) => {
        setParametres(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleGenererRapport = useCallback(async (rapport) => {
        // Validation des paramètres obligatoires
        if (!parametres.annee) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Veuillez sélectionner une année.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        if (!parametres.annuel && !parametres.periode) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Veuillez sélectionner une période ou activer le mode annuel.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        // Validation spécifique selon le code du rapport
        const needsClasse = ['R01', 'R02', 'R07', 'R08', 'R10', 'R19', 'R20', 'R21', 'R23', 'R25', 'R27', 'R28', 'R29', 'R31', 'R32', 'R33'].includes(rapport.code);
        const needsMatricule = ['R02', 'R08', 'R16', 'R22'].includes(rapport.code);
        const needsMatiere = ['R24', 'R27'].includes(rapport.code);
        const needsBranche = ['R26', 'R30'].includes(rapport.code);

        if (needsClasse && !parametres.classe) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Ce rapport nécessite la sélection d\'une classe.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        if (needsMatricule && !parametres.matriculeEleves) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Ce rapport nécessite la saisie d\'un matricule.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        if (needsMatiere && !parametres.matiere) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Ce rapport nécessite la sélection d\'une matière.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        if (needsBranche && !parametres.niveau) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Ce rapport nécessite la sélection d\'un niveau.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        // Validation matricule/classe pour certains rapports
        if (['R14', 'R15'].includes(rapport.code) && !parametres.classe && !parametres.matriculeEleves) {
            Swal.fire({
                icon: 'warning',
                title: 'Paramètres manquants',
                text: 'Ce rapport nécessite soit une classe, soit un matricule.',
                confirmButtonColor: '#4a90e2'
            });
            return;
        }

        // Confirmation avec SweetAlert
        const result = await Swal.fire({
            title: 'Générer le rapport',
            text: `Voulez-vous générer le rapport "${rapport.nom}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#4a90e2',
            cancelButtonColor: '#95a5a6',
            confirmButtonText: 'Oui, générer',
            cancelButtonText: 'Annuler',
            background: '#ffffff',
            customClass: {
                popup: 'swal-custom-popup'
            }
        });

        if (!result.isConfirmed) return;

        try {
            setGenerating(true);

            // Afficher le loader
            Swal.fire({
                title: 'Génération en cours...',
                text: 'Veuillez patienter pendant la génération du rapport.',
                icon: 'info',
                allowOutsideClick: false,
                allowEscapeKey: false,
                showConfirmButton: false,
                background: '#ffffff',
                didOpen: () => {
                    Swal.showLoading();
                }
            });

            const parametresComplets = {
                ...parametres,
                ecoleId,
                niveauEnseignementId,
                periodes,
                annees,
                classes,
                branches,
                matieres
            };

            const downloadResult = await genererRapportParCode(rapport.code, parametresComplets);

            // Fermer le loader et afficher le succès
            Swal.fire({
                icon: 'success',
                title: 'Rapport généré !',
                text: `Le rapport "${downloadResult.filename}" a été téléchargé avec succès.`,
                confirmButtonColor: '#27ae60',
                background: '#ffffff'
            });

        } catch (error) {
            console.error('Erreur lors de la génération:', error);

            Swal.fire({
                icon: 'error',
                title: 'Erreur de génération',
                text: error.message || 'Une erreur est survenue lors de la génération du rapport.',
                confirmButtonColor: '#e74c3c',
                background: '#ffffff'
            });
        } finally {
            setGenerating(false);
        }
    }, [parametres, ecoleId, niveauEnseignementId, periodes, annees, classes, branches, matieres]);

    const handleTableAction = useCallback((actionType, item) => {
        if (actionType === 'generate') {
            handleGenererRapport(item);
        }
    }, [handleGenererRapport]);

    const isDataLoading = classesLoading || periodesLoading || anneesLoading || niveauxLoading;

    // Helper pour déterminer le label des acteurs selon le niveau d'enseignement
    const getActeurLabel = () => {
        const niveau = parseInt(niveauEnseignementId, 10);
        return niveau > 2 && niveau !== 4 ? 'Étudiants' : 'Élèves';
    };

    // ===========================
    // STYLES LIGHT
    // ===========================
    const cardStyle = {
        marginBottom: '24px',
        border: '1px solid #f5f5f5',
        borderRadius: '12px',
        backgroundColor: '#ffffff',
        overflow: 'hidden'
    };

    const cardHeaderStyle = {
        padding: '20px 24px 16px 24px',
        borderBottom: '1px solid #f8f9fa',
        backgroundColor: '#fdfdfd',
        fontWeight: '500',
        fontSize: '15px',
        color: '#2c3e50',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
    };

    const cardBodyStyle = {
        padding: '24px'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '400',
        color: '#495057',
        fontSize: '14px'
    };

    const inputStyle = {
        marginBottom: '16px'
    };


    // SELECTION AUTOMATIQUES DES COMBOX DE ANNEE ET PERIODE EN COURS

    // useEffect(() => {
    //     if (annees.length > 0 && !parametres.annee) {
    //         const derniereAnnee = annees[annees.length - 1]?.value;
    //         handleParametreChange('annee', derniereAnnee);
    //     }
    // }, [annees]);

    // academicYearInfo.anneeLibelle

    useEffect(() => {
        const academicYearInfo = JSON.parse(localStorage.getItem('academicYearInfo'));

        if (periodes.length > 0 && academicYearInfo?.periodeLibelle && !parametres.periode) {
            // Trouver la période qui correspond au libellé
            const periodeCorrespondante = periodes.find(
                p => p.label === academicYearInfo?.periodeLibelle ||
                    p.value === academicYearInfo?.periodeLibelle
            );

            if (periodeCorrespondante) {
                handleParametreChange('periode', periodeCorrespondante.value);
            }
        }
    }, [periodes]);

    useEffect(() => {
        const academicYearInfo = JSON.parse(localStorage.getItem('academicYearInfo'));

        if (annees.length > 0 && academicYearInfo?.anneeLibelle && !parametres.annee) {
            // Trouver la période qui correspond au libellé
            const anneeCorrespondante = annees.find(
                p => p.label === academicYearInfo.anneeLibelle ||
                    p.value === academicYearInfo.anneeLibelle
            );

            if (anneeCorrespondante) {
                handleParametreChange('annee', anneeCorrespondante.value);
            }
        }
    }, [annees]);

    // ===========================
    // RENDU DU COMPOSANT
    // ===========================
    return (
        <>
            {/* Styles personnalisés pour SweetAlert */}
            <style jsx global>{`
                .swal-custom-popup {
                    border-radius: 12px !important;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
                }
                .swal2-title {
                    color: #2c3e50 !important;
                    font-weight: 600 !important;
                }
                .swal2-content {
                    color: #495057 !important;
                }
            `}</style>

            <div style={{
                padding: '32px',
                backgroundColor: '#fafbfc',
                minHeight: '100vh',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
            }}>
                <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                    {/* En-tête */}
                    <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                        <h2 style={{
                            margin: '0 0 8px 0',
                            color: '#2c3e50',
                            fontWeight: '600',
                            fontSize: '28px',
                            letterSpacing: '-0.5px'
                        }}>
                            Configuration des Rapports
                        </h2>
                        <Text style={{
                            fontSize: '16px',
                            color: '#6c757d',
                            lineHeight: '1.5'
                        }}>
                            Configurez et générez vos rapports personnalisés
                        </Text>
                    </div>

                    {/* Paramètres Obligatoires */}
                    <Card style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <FiSettings size={18} color="#495057" />
                            <span>Paramètres Obligatoires</span>
                            <Badge
                                style={{
                                    fontSize: '11px',
                                    marginLeft: 'auto',
                                    backgroundColor: '#e3f2fd',
                                    color: '#1976d2',
                                    border: 'none'
                                }}
                            >
                                REQUIS
                            </Badge>
                        </div>
                        <div style={cardBodyStyle}>
                            <Row gutter={24}>
                                <Col xs={24} sm={8}>
                                    <label style={labelStyle}>Année</label>
                                    <SelectPicker
                                        data={annees}
                                        value={parametres.annee}
                                        onChange={(value) => handleParametreChange('annee', value)}
                                        placeholder="Sélectionner l'année"
                                        style={{ width: '100%', ...inputStyle }}
                                        loading={anneesLoading}
                                        searchable
                                        cleanable={false}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <label style={labelStyle}>Période</label>
                                    <SelectPicker
                                        data={periodes}
                                        value={parametres.periode}
                                        onChange={(value) => handleParametreChange('periode', value)}
                                        placeholder="Sélectionner la période"
                                        style={{ width: '100%', ...inputStyle }}
                                        loading={periodesLoading}
                                        searchable
                                        cleanable={false}
                                        disabled={parametres.annuel}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <label style={labelStyle}>Mode</label>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginTop: '8px',
                                        marginBottom: '16px'
                                    }}>
                                        <Toggle
                                            checked={parametres.annuel}
                                            onChange={(checked) => handleParametreChange('annuel', checked)}
                                            checkedChildren="Annuel"
                                            unCheckedChildren="Période"
                                            size="md"
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    {/* Modèles DRENA */}
                    <Card style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <FiFileText size={18} color="#495057" />
                            <span>Modèle de rapport par DRENA</span>
                        </div>
                        <div style={cardBodyStyle}>
                            <RadioGroup
                                value={parametres.modeleDrena}
                                onChange={(value) => handleParametreChange('modeleDrena', value)}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                                    gap: '12px'
                                }}
                            >
                                {drenaModels.map(model => (
                                    <Radio
                                        key={model.key}
                                        value={model.value}
                                        style={{
                                            padding: '12px 16px',
                                            border: parametres.modeleDrena === model.value
                                                ? '2px solid #4a90e2'
                                                : '1px solid #e9ecef',
                                            borderRadius: '8px',
                                            backgroundColor: parametres.modeleDrena === model.value
                                                ? '#f8fafe'
                                                : '#ffffff',
                                            fontSize: '13px',
                                            margin: 0,
                                            transition: 'all 0.2s ease',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {model.label}
                                    </Radio>
                                ))}
                            </RadioGroup>
                        </div>
                    </Card>

                    {/* Paramètres Facultatifs */}
                    <Card style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <FiSettings size={18} color="#495057" />
                            <span>Paramètres Facultatifs</span>
                            <Badge
                                style={{
                                    fontSize: '11px',
                                    marginLeft: 'auto',
                                    backgroundColor: '#fff3cd',
                                    color: '#856404',
                                    border: 'none'
                                }}
                            >
                                CLASSE/MATRICULE
                            </Badge>
                        </div>
                        <div style={cardBodyStyle}>
                            <Row gutter={24}>
                                <Col xs={24} sm={8}>
                                    <label style={labelStyle}>Classe</label>
                                    <SelectPicker
                                        data={classes}
                                        value={parametres.classe}
                                        onChange={(value) => {
                                            handleParametreChange('classe', value);
                                            if (parametres.matriculeEleves) {
                                                handleParametreChange('matriculeEleves', '');
                                            }
                                        }}
                                        placeholder="Sélectionner une classe"
                                        style={{ width: '100%', ...inputStyle }}
                                        loading={classesLoading}
                                        searchable
                                        cleanable
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <label style={labelStyle}>
                                        Matricule {getActeurLabel()}
                                    </label>
                                    <Input
                                        value={parametres.matriculeEleves}
                                        onChange={(value) => handleParametreChange('matriculeEleves', value)}
                                        placeholder="Matricule élève"
                                        style={{ width: '100%', ...inputStyle }}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={8}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginTop: '32px'
                                    }}>
                                        <Toggle
                                            checked={parametres.formatExcel}
                                            onChange={(checked) => handleParametreChange('formatExcel', checked)}
                                            size="md"
                                        />
                                        <Text style={{ fontSize: '14px', color: '#495057' }}>Format Excel</Text>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    {/* Options de Format */}
                    <Card style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <FiFileText size={18} color="#495057" />
                            <span>Options de Format (Bulletins)</span>
                        </div>
                        <div style={cardBodyStyle}>
                            <Row gutter={16}>
                                {[
                                    { key: 'decompresserBulletin', label: 'Décompresser bulletin' },
                                    { key: 'supprimerFiligramme', label: 'Supprimer filigramme' },
                                    { key: 'formatAvecPiedPage', label: 'Format avec pied de page' },
                                    { key: 'changerPositionLogo', label: 'Repositionner logo' },
                                    { key: 'pivoterPhotosVersLaDroite', label: 'Pivoter photos' },
                                    { key: 'changerPositionRepublique', label: 'Position République' },
                                    { key: 'utiliserModeleSecondaire', label: 'Modèle secondaire' },
                                    { key: 'activerDistinctions', label: 'Activer distinctions' },
                                    { key: 'utiliserModeleBTS', label: 'Modèle BTS' },
                                    { key: 'utiliserModeleSuperieurBTS', label: 'Modèle supérieur BTS' },
                                    { key: 'testLourd', label: 'Test lourd' },
                                    { key: 'formatEcoleArabe', label: 'Format école Arabe' },

                                ].map(({ key, label }) => (
                                    <Col key={key} xs={24} sm={12} md={8} lg={6}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            marginBottom: '16px',
                                            padding: '8px 0'
                                        }}>
                                            <Toggle
                                                size="md"
                                                checked={parametres[key]}
                                                onChange={(checked) => handleParametreChange(key, checked)}
                                            />
                                            <Text style={{ fontSize: '13px', color: '#495057' }}>{label}</Text>
                                        </div>
                                    </Col>
                                ))}
                            </Row>
                            <Row gutter={24}>
                                <Col xs={24} sm={12}>
                                    <label style={labelStyle}>Imprimer à partir du bulletin N°</label>
                                    <InputNumber
                                        value={parametres.imprimerBulletinAPartir}
                                        onChange={(value) => handleParametreChange('imprimerBulletinAPartir', value)}
                                        min={0}
                                        max={200}
                                        style={{ width: '100%' }}
                                        size="md"
                                    />
                                    <Text style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                        Par défaut: 0 (premier bulletin)
                                    </Text>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <label style={labelStyle}>Imprimer jusqu'au bulletin N°</label>
                                    <InputNumber
                                        value={parametres.imprimerBulletinJusqua}
                                        onChange={(value) => handleParametreChange('imprimerBulletinJusqua', value)}
                                        min={0}
                                        max={200}
                                        style={{ width: '100%' }}
                                        size="md"
                                    />
                                    <Text style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                                        Par défaut: 200 (tous les bulletins)
                                    </Text>
                                </Col>
                            </Row>

                            {/* <div style={{
                                marginTop: '16px',
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                borderLeft: '3px solid #4a90e2'
                            }}>
                                <Text style={{ fontSize: '13px', color: '#495057' }}>
                                    💡 <strong>Astuce :</strong> Ces paramètres sont utilisés uniquement pour le rapport R33 (Bulletin avec plage d'impression).
                                    Laissez les valeurs par défaut pour imprimer tous les bulletins.
                                </Text>
                            </div> */}
                        </div>
                    </Card>

                    {/* Filtres Élèves */}
                    <Card style={cardStyle}>
                        <div style={cardHeaderStyle}>
                            <FiUsers size={18} color="#495057" />
                            <span>Filtres {getActeurLabel()}</span>
                        </div>
                        <div style={cardBodyStyle}>
                            <Row gutter={20}>
                                <Col xs={24} sm={6} lg={4}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        height: '40px'
                                    }}>
                                        <Toggle
                                            checked={parametres.avecPhoto}
                                            onChange={(checked) => handleParametreChange('avecPhoto', checked)}
                                            size="md"
                                        />
                                        <label style={{ ...labelStyle, marginBottom: 0 }}>Avec photo</label>
                                    </div>
                                </Col>
                                <Col xs={24} sm={6} lg={4}>
                                    <label style={labelStyle}>Redoublant</label>
                                    <SelectPicker
                                        data={redoublantOptions}
                                        value={parametres.redoublant}
                                        onChange={(value) => handleParametreChange('redoublant', value)}
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={6} lg={4}>
                                    <label style={labelStyle}>Sexe</label>
                                    <SelectPicker
                                        data={sexeOptions}
                                        value={parametres.sexe}
                                        onChange={(value) => handleParametreChange('sexe', value)}
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={6} lg={4}>
                                    <label style={labelStyle}>Boursier</label>
                                    <SelectPicker
                                        data={boursierOptions}
                                        value={parametres.boursier}
                                        onChange={(value) => handleParametreChange('boursier', value)}
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={6} lg={4}>
                                    <label style={labelStyle}>Langue</label>
                                    <SelectPicker
                                        data={langueVivanteOptions}
                                        value={parametres.langueVivante}
                                        onChange={(value) => handleParametreChange('langueVivante', value)}
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        size="md"
                                    />
                                </Col>
                                <Col xs={24} sm={6} lg={4}>
                                    <label style={labelStyle}>Statut</label>
                                    <SelectPicker
                                        data={statutOptions}
                                        value={parametres.statut}
                                        onChange={(value) => handleParametreChange('statut', value)}
                                        style={{ width: '100%' }}
                                        cleanable={false}
                                        size="md"
                                    />
                                </Col>
                            </Row>

                            <Row gutter={20} style={{ marginTop: '16px' }}>
                                <Col xs={24} sm={24}>
                                    <label style={labelStyle}>Niveau</label>
                                    <SelectPicker
                                        data={branches}
                                        value={parametres.niveau}
                                        onChange={(value) => handleParametreChange('niveau', value)}
                                        placeholder="Tous les niveaux"
                                        style={{ width: '100%' }}
                                        loading={branchesLoading}
                                        searchable
                                        cleanable
                                        size="md"
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Card>

                    {/* Options Spécialisées */}
                    <Row gutter={24}>
                        <Col xs={24} lg={8}>
                            <Card style={cardStyle}>
                                <div style={cardHeaderStyle}>
                                    <FiAward size={18} color="#495057" />
                                    <span>Certificats</span>
                                </div>
                                <div style={cardBodyStyle}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '12px',
                                        marginBottom: '16px'
                                    }}>
                                        <Toggle
                                            checked={parametres.autreModeleCertificat}
                                            onChange={(checked) => handleParametreChange('autreModeleCertificat', checked)}
                                            size="md"
                                        />
                                        <Text style={{ fontSize: '14px', color: '#495057' }}>Modèle alternatif</Text>
                                    </div>
                                    <Input
                                        value={parametres.nomSignataire}
                                        onChange={(value) => handleParametreChange('nomSignataire', value)}
                                        placeholder="Nom signataire"
                                        style={{ width: '100%', marginBottom: '12px' }}
                                        size="md"
                                    />
                                    <Input
                                        value={parametres.fonctionSignataire}
                                        onChange={(value) => handleParametreChange('fonctionSignataire', value)}
                                        placeholder="Fonction signataire"
                                        style={{ width: '100%' }}
                                        size="md"
                                    />
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card style={cardStyle}>
                                <div style={cardHeaderStyle}>
                                    <FiBarChart size={18} color="#495057" />
                                    <span>Admis</span>
                                </div>
                                <div style={cardBodyStyle}>
                                    <label style={labelStyle}>Moyenne minimale</label>
                                    <InputNumber
                                        value={parametres.moyenneSuperieure}
                                        onChange={(value) => handleParametreChange('moyenneSuperieure', value)}
                                        min={0}
                                        max={20}
                                        step={0.1}
                                        style={{ width: '100%' }}
                                        size="md"
                                    />
                                </div>
                            </Card>
                        </Col>

                        <Col xs={24} lg={8}>
                            <Card style={cardStyle}>
                                <div style={cardHeaderStyle}>
                                    <FiUsers size={18} color="#495057" />
                                    <span>Professeurs</span>
                                </div>
                                <div style={cardBodyStyle}>
                                    <label style={labelStyle}>Matière</label>
                                    <SelectPicker
                                        data={matieres}
                                        value={parametres.matiere}
                                        onChange={(value) => handleParametreChange('matiere', value)}
                                        placeholder="Sélectionner classe d'abord"
                                        style={{ width: '100%' }}
                                        disabled={!parametres.classe}
                                        loading={matieresLoading}
                                        searchable
                                        cleanable
                                        size="md"
                                    />
                                    <Text style={{ fontSize: '12px', color: '#6c757d', marginTop: '8px' }}>
                                        {!parametres.classe ? 'Veuillez d\'abord sélectionner une classe' : ''}
                                    </Text>
                                </div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Rapports Disponibles */}
                    <Card style={{ ...cardStyle, marginBottom: 0 }}>
                        <div style={cardHeaderStyle}>
                            <FiFileText size={18} color="#495057" />
                            <span>Rapports Disponibles</span>
                            <Badge
                                style={{
                                    fontSize: '11px',
                                    marginLeft: 'auto',
                                    backgroundColor: '#e8f5e8',
                                    color: '#2e7d32',
                                    border: 'none'
                                }}
                            >
                                {rapports.length}
                            </Badge>
                        </div>
                        <div style={cardBodyStyle}>
                            {isDataLoading ? (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '60px 20px',
                                    backgroundColor: '#fafbfc',
                                    borderRadius: '8px'
                                }}>
                                    <Loader size="lg" />
                                    <Text style={{
                                        marginTop: '16px',
                                        fontSize: '14px',
                                        color: '#6c757d'
                                    }}>
                                        Chargement des rapports...
                                    </Text>
                                </div>
                            ) : (
                                <DataTable
                                    data={rapports}
                                    loading={rapportsLoading}
                                    error={rapportsError}
                                    columns={rapportsTableConfig.columns}
                                    actions={rapportsTableConfig.actions}
                                    onAction={handleTableAction}
                                    defaultPageSize={10}
                                    pageSizeOptions={[10, 20, 50, 100]}
                                    tableHeight={600}
                                    enableRefresh={false}
                                    enableCreate={false}
                                    selectable={false}
                                    rowKey="id"
                                    showHeader={true}
                                    showToolbar={true}
                                    customStyles={{
                                        container: { backgroundColor: "#ffffff" },
                                        panel: {
                                            minHeight: "400px",
                                            border: 'none',
                                            boxShadow: 'none',
                                            borderRadius: '8px'
                                        },
                                    }}
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default EcranRapports;