import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    SelectPicker,
    Loader,
    Row,
    Col,
    Message,
    toaster
} from 'rsuite';
import {
    FiPrinter,
    FiDownload,
    FiFileText,
    FiUser,
    FiCalendar,
    FiBookOpen,
    FiCheck,
    FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import { downloadFromSimpleUrl, sanitizeFilename } from '../utils/downloadUtils';

// ===========================
// MODAL D'IMPRESSION CORRIGÉ
// ===========================
const PrintModal = ({ show, inscription, onClose }) => {
    const [selectedYear, setSelectedYear] = useState(null);
    const [years, setYears] = useState([]);
    const [loadingYears, setLoadingYears] = useState(false);
    const [loadingPrint, setLoadingPrint] = useState({
        identification: false,
        inscription: false
    });
    const [downloadProgress, setDownloadProgress] = useState({});
    const apiUrls = useAllApiUrls();

    // Charger les années disponibles
    useEffect(() => {
        if (show) {
            fetchYears();
        }
    }, [show]);

    // Reset des états quand la modal se ferme
    useEffect(() => {
        if (!show) {
            setLoadingPrint({ identification: false, inscription: false });
            setDownloadProgress({});
        }
    }, [show]);

    const fetchYears = async () => {
        setLoadingYears(true);
        try {
            const response = await axios.get(
                apiUrls.annees.listOpenedOrClosedToEcoleId()
            );

            const yearOptions = response.data.map(year => ({
                label: year.customLibelle || year.libelle,
                value: year.id,
                statut: year.statut,
                niveauEnseignement: year.niveauEnseignement?.libelle
            }));

            setYears(yearOptions);

            // Sélectionner la première année par défaut
            if (yearOptions.length > 0) {
                setSelectedYear(yearOptions[0].value);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des années:', error);
            toaster.push(
                <Message type="error">
                    Erreur lors du chargement des années scolaires
                </Message>,
                { duration: 5000 }
            );
        } finally {
            setLoadingYears(false);
        }
    };

    const handlePrint = async (type) => {
        if (!inscription || !selectedYear) {
            toaster.push(
                <Message type="warning">
                    Veuillez sélectionner une année scolaire
                </Message>,
                { duration: 3000 }
            );
            return;
        }

        setLoadingPrint(prev => ({ ...prev, [type]: true }));
        setDownloadProgress(prev => ({ ...prev, [type]: 0 }));

        try {
            // Construire l'URL du endpoint
            const endpoint = type === 'identification'
                ? apiUrls.eleves.imprimerFicheIdentification(selectedYear, inscription.matricule)
                : apiUrls.eleves.imprimerFicheInscription(selectedYear, inscription.matricule);

            // Créer un nom de fichier sécurisé
            const typeLabel = type === 'identification' ? 'identification' : 'inscription';
            const filename = sanitizeFilename(`fiche_${typeLabel}_${inscription.matricule}.pdf`);

            console.log(`🔄 Téléchargement ${type} pour ${inscription.matricule}`);
            console.log(`📡 URL: ${endpoint}`);

            // Utiliser la fonction de téléchargement unifiée
            const result = await downloadFromSimpleUrl(endpoint, filename);

            if (result.success) {
                console.log(`✅ Téléchargement réussi: ${result.filename}`);
                toaster.push(
                    <Message type="success">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <FiCheck />
                            Fiche {typeLabel} téléchargée avec succès
                        </div>
                    </Message>,
                    { duration: 4000 }
                );
            }

        } catch (error) {
            console.error(`❌ Erreur lors du téléchargement ${type}:`, error);

            // Afficher un message d'erreur détaillé
            toaster.push(
                <Message type="error">
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                            <FiAlertCircle />
                            <strong>Erreur de téléchargement</strong>
                        </div>
                        <div style={{ fontSize: '13px', opacity: 0.9 }}>
                            {error.message || 'Une erreur inattendue est survenue'}
                        </div>
                    </div>
                </Message>,
                { duration: 6000 }
            );
        } finally {
            // Reset des états avec un délai pour l'effet visuel
            setTimeout(() => {
                setLoadingPrint(prev => ({ ...prev, [type]: false }));
                setDownloadProgress(prev => ({ ...prev, [type]: 0 }));
            }, 1000);
        }
    };

    if (!inscription) return null;

    const selectedYearInfo = years.find(year => year.value === selectedYear);

    return (
        <Modal open={show} onClose={onClose} size="md">
            <Modal.Header style={{ borderBottom: 'none', paddingBottom: 0 }}>
                <Modal.Title style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: '20px',
                    fontWeight: '700',
                    color: '#1e293b'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '12px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(102, 126, 234, 0.25)'
                    }}>
                        <FiPrinter size={20} color="white" />
                    </div>
                    Imprimer Fiche Élève
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: '0 24px 24px 24px' }}>
                <div>
                    {/* Card d'information élève */}
                    <div style={{
                        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                        padding: '24px',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        marginBottom: '24px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Décoration de fond */}
                        <div style={{
                            position: 'absolute',
                            top: '-10px',
                            right: '-10px',
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                            borderRadius: '50%',
                            zIndex: 0
                        }} />

                        <div style={{ position: 'relative', zIndex: 1 }}>
                            <Row gutter={16} style={{ alignItems: 'center' }}>
                                <Col md={4}>
                                    {inscription.hasPhoto ? (
                                        <img
                                            src={inscription.urlPhoto}
                                            alt={inscription.nomComplet}
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                borderRadius: '12px',
                                                objectFit: 'cover',
                                                border: '3px solid white',
                                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    ) : (
                                        <div style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '12px',
                                            backgroundColor: '#e2e8f0',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '3px solid white',
                                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                                        }}>
                                            <FiUser size={32} color="#64748b" />
                                        </div>
                                    )}
                                </Col>
                                <Col md={20}>
                                    <div>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8,
                                            marginBottom: 8
                                        }}>
                                            <div style={{
                                                padding: '4px 12px',
                                                backgroundColor: '#3b82f6',
                                                color: 'white',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600',
                                                fontFamily: 'monospace'
                                            }}>
                                                {inscription.matricule}
                                            </div>
                                            <div style={{
                                                padding: '4px 12px',
                                                backgroundColor: inscription.genre_short === 'M' ? '#dbeafe' : '#fce7f3',
                                                color: inscription.genre_short === 'M' ? '#2563eb' : '#ec4899',
                                                borderRadius: '20px',
                                                fontSize: '12px',
                                                fontWeight: '600'
                                            }}>
                                                {inscription.genre_display}
                                            </div>
                                        </div>

                                        <h4 style={{
                                            margin: '0 0 8px 0',
                                            color: '#1e293b',
                                            fontWeight: '700',
                                            fontSize: '18px'
                                        }}>
                                            {inscription.nomComplet}
                                        </h4>

                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 16,
                                            fontSize: '14px',
                                            color: '#64748b'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiBookOpen size={14} />
                                                <span style={{ fontWeight: '500' }}>{inscription.classe}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <FiCalendar size={14} />
                                                <span>{inscription.dateNaissance_display}</span>
                                            </div>
                                            <div>
                                                📍 {inscription.lieuNaissance}
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    </div>

                    {/* Sélection de l'année */}
                    <div style={{ marginBottom: 32 }}>
                        <label style={{
                            display: 'block',
                            marginBottom: 12,
                            fontWeight: '600',
                            color: '#374151',
                            fontSize: '16px'
                        }}>
                            <FiCalendar style={{ marginRight: 8, verticalAlign: 'middle' }} />
                            Année scolaire
                        </label>

                        {loadingYears ? (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                padding: '16px',
                                backgroundColor: '#f8fafc',
                                borderRadius: '8px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <Loader size="sm" />
                                <span style={{ fontSize: '15px', color: '#64748b' }}>
                                    Chargement des années scolaires...
                                </span>
                            </div>
                        ) : (
                            <div>
                                <SelectPicker
                                    data={years}
                                    value={selectedYear}
                                    onChange={setSelectedYear}
                                    style={{ width: '100%' }}
                                    placeholder="Sélectionner une année scolaire"
                                    disabled={years.length === 0}
                                    size="lg"
                                    renderMenuItem={(label, item) => (
                                        <div style={{ padding: '8px 0' }}>
                                            <div style={{ fontWeight: '500', color: '#1e293b' }}>
                                                {label}
                                            </div>
                                            {item.niveauEnseignement && (
                                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                                    {item.niveauEnseignement} • {item.statut}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                />

                                {selectedYearInfo && (
                                    <div style={{
                                        marginTop: 8,
                                        padding: '8px 12px',
                                        backgroundColor: '#f0f9ff',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        color: '#0369a1'
                                    }}>
                                        ✓ {selectedYearInfo.niveauEnseignement} • Statut: {selectedYearInfo.statut}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Boutons d'impression */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px'
                    }}>
                        {/* Fiche d'identification */}
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f0f9ff',
                            borderRadius: '12px',
                            border: '2px solid #bfdbfe',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            cursor: selectedYear ? 'pointer' : 'not-allowed',
                            opacity: selectedYear ? 1 : 0.6
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: '#3b82f6',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)'
                            }}>
                                <FiFileText size={20} color="white" />
                            </div>

                            <h6 style={{
                                margin: '0 0 8px 0',
                                color: '#1e40af',
                                fontWeight: '600',
                                fontSize: '15px'
                            }}>
                                Fiche d'identification
                            </h6>

                            <p style={{
                                margin: '0 0 16px 0',
                                color: '#64748b',
                                fontSize: '13px',
                                lineHeight: '1.4'
                            }}>
                                Informations personnelles et administratives de l'élève
                            </p>

                            <Button
                                appearance="primary"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#3b82f6',
                                    borderColor: '#3b82f6',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}
                                disabled={!selectedYear}
                                loading={loadingPrint.identification}
                                onClick={() => handlePrint('identification')}
                                startIcon={loadingPrint.identification ? null : <FiDownload />}
                            >
                                {loadingPrint.identification ? 'Génération...' : 'Télécharger'}
                            </Button>
                        </div>

                        {/* Fiche d'inscription */}
                        <div style={{
                            padding: '20px',
                            backgroundColor: '#f0fdf4',
                            borderRadius: '12px',
                            border: '2px solid #bbf7d0',
                            textAlign: 'center',
                            transition: 'all 0.2s ease',
                            cursor: selectedYear ? 'pointer' : 'not-allowed',
                            opacity: selectedYear ? 1 : 0.6
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                backgroundColor: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 12px',
                                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.25)'
                            }}>
                                <FiUser size={20} color="white" />
                            </div>

                            <h6 style={{
                                margin: '0 0 8px 0',
                                color: '#047857',
                                fontWeight: '600',
                                fontSize: '15px'
                            }}>
                                Fiche d'inscription
                            </h6>

                            <p style={{
                                margin: '0 0 16px 0',
                                color: '#64748b',
                                fontSize: '13px',
                                lineHeight: '1.4'
                            }}>
                                Dossier complet d'inscription avec informations académiques
                            </p>

                            <Button
                                appearance="primary"
                                style={{
                                    width: '100%',
                                    backgroundColor: '#10b981',
                                    borderColor: '#10b981',
                                    borderRadius: '8px',
                                    fontWeight: '600'
                                }}
                                disabled={!selectedYear}
                                loading={loadingPrint.inscription}
                                onClick={() => handlePrint('inscription')}
                                startIcon={loadingPrint.inscription ? null : <FiDownload />}
                            >
                                {loadingPrint.inscription ? 'Génération...' : 'Télécharger'}
                            </Button>
                        </div>
                    </div>

                    {/* Note informative */}
                    {selectedYear && (
                        <div style={{
                            marginTop: 20,
                            padding: '12px 16px',
                            backgroundColor: '#fefce8',
                            border: '1px solid #fde047',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8
                        }}>
                            <FiCheck size={16} color="#ca8a04" />
                            <span style={{ fontSize: '13px', color: '#92400e' }}>
                                Les fiches seront générées au format PDF et téléchargées automatiquement
                            </span>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer style={{ borderTop: '1px solid #e5e7eb', padding: '16px 24px' }}>
                <Button
                    onClick={onClose}
                    appearance="subtle"
                    style={{
                        fontWeight: '500',
                        color: '#6b7280'
                    }}
                    disabled={loadingPrint.identification || loadingPrint.inscription}
                >
                    {(loadingPrint.identification || loadingPrint.inscription) ? 'Traitement...' : 'Fermer'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default PrintModal;