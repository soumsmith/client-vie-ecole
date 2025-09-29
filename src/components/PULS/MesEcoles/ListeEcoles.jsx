/**
 * Composant principal de la liste des écoles avec DataTable - Version locale corrigée
 * VERSION: 2.1.0 - Gestion locale avec sélection multiple et debug
 * DESCRIPTION: Interface de gestion des écoles avec ajout local et sauvegarde par sélection
 */

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
    Button,
    Row,
    Col,
    Loader,
    Badge,
    Avatar,
    Form,
    Input,
    InputGroup,
    Notification
} from 'rsuite';
import {
    FiBookOpen,
    FiPlus,
    FiRefreshCw,
    FiDownload,
    FiMail,
    FiUser,
    FiSave,
    FiCheck,
    FiX
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import axios from 'axios';

import { useCommonState } from '../../hooks/useCommonState';
import DataTable from "../../DataTable";
import { listeEcolesAAjouterTableConfig } from './EcolesService';
import CreateEcoleModal from './CreateEcoleModal';
import IconBox from "../Composant/IconBox";
import getFullUrl from "../../hooks/urlUtils";

// ===========================
// CONSTANTES
// ===========================
const SOUSCRIPTION_ID = 419;

// ===========================
// UTILITAIRES
// ===========================
const safeStringIncludes = (str, searchTerm) => {
    if (typeof str !== 'string') return false;
    return str.toLowerCase().includes(searchTerm.toLowerCase());
};

const calculateStats = (ecoles) => {
    const total = ecoles.length;
    const stats = {
        total,
        primaire: ecoles.filter(e => safeStringIncludes(e.niveauEnseignementLibelle, 'Primaire')).length,
        secondaire: ecoles.filter(e => safeStringIncludes(e.niveauEnseignementLibelle, 'Secondaire')).length,
        superieur: ecoles.filter(e => safeStringIncludes(e.niveauEnseignementLibelle, 'Supérieur')).length,
        technique: ecoles.filter(e => safeStringIncludes(e.niveauEnseignementLibelle, 'Technique')).length,
        maternelle: ecoles.filter(e => safeStringIncludes(e.niveauEnseignementLibelle, 'Maternelle')).length
    };

    const villesUniques = [...new Set(ecoles.map(e => e.villeLibelle))].filter(Boolean);
    const villeStats = villesUniques.map(ville => ({
        ville,
        count: ecoles.filter(e => e.villeLibelle === ville).length
    }));

    return { ...stats, villesUniques, villeStats };
};

// Transformation des données pour l'API - CORRIGÉE
const transformEcoleForAPI = (ecole) => {
    const transformed = {
        sousc_atten_etabliss_email: ecole.emailEtablissement || "",
        sousc_atten_etabliss_indication: ecole.indicationEtablissement || "",
        sousc_atten_etabliss_nom: ecole.nomEtablissement || "",
        sousc_atten_etabliss_tel: ecole.telephoneEtablissement || "",
        sousc_atten_etablisscode: ecole.codeEtablissement || "",
        sousc_atten_etabliss_lien_autorisa: ecole.autorisationUrl || "",
        sousc_atten_etabliss_lien_logo: ecole.logoUrl || "",
        // CORRECTION: S'assurer d'utiliser les IDs numériques
        ville_villeid: parseInt(ecole.ville) || null,
        zone_zoneid: parseInt(ecole.zone) || null,
        niveau_Enseignement_id: parseInt(ecole.niveauEnseignement) || null,
        commune_communeid: parseInt(ecole.commune) || null
    };

    console.log('🔄 Transformation API:', {
        original: ecole,
        transformed: transformed
    });

    return transformed;
};

// ===========================
// COMPOSANT FORMULAIRE PROFIL
// ===========================
const ProfileFormSection = ({ mode, userData, loading }) => {
    const [formData, setFormData] = useState({
        fonction: '',
        nom: '',
        prenom: '',
        telephone: '',
        telephone2: '',
        email: ''
    });

    useEffect(() => {
        if (mode === "candidatEcoleInscription" && userData) {
            setFormData({
                fonction: userData.fonction?.fonctionlibelle || '',
                nom: userData.sous_attent_personn_nom || '',
                prenom: userData.sous_attent_personn_prenom || '',
                telephone: userData.sous_attent_personn_contact || '',
                telephone2: userData.sous_attent_personn_contact2 || '',
                email: userData.sous_attent_personn_email || ''
            });
        }
    }, [mode, userData]);

    const handleChange = (value, field) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    if (loading) {
        return (
            <div style={{
                background: 'white',
                borderRadius: '15px',
                padding: '40px',
                marginBottom: '25px',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
            }}>
                <Loader size="md" content="Chargement des informations..." />
            </div>
        );
    }

    const isReadOnly = mode === "candidatEcoleInscription";

    return (
        <div style={{
            background: 'white',
            borderRadius: '15px',
            padding: '30px',
            marginBottom: '25px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(102, 126, 234, 0.1)'
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '25px',
                paddingBottom: '15px',
                borderBottom: '2px solid #f1f5f9'
            }}>
                <IconBox icon={FiUser} />
                <h5 style={{ margin: 0, color: '#334155', fontWeight: '600', fontSize: '18px' }}>
                    Informations du Fondateur
                </h5>
            </div>

            <Form fluid>
                <Row gutter={16}>
                    {/* Fonction */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Group style={{ marginBottom: '20px' }}>
                            <Form.ControlLabel style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Fonction
                            </Form.ControlLabel>
                            <Input
                                value={formData.fonction}
                                //readOnly
                                style={{
                                    backgroundColor: '#f8fafc',
                                    borderColor: '#e2e8f0'
                                }}
                            />
                        </Form.Group>
                    </Col>

                    {/* Nom */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Group style={{ marginBottom: '20px' }}>
                            <Form.ControlLabel style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Nom du fondateur <span style={{ color: '#ef4444' }}>*</span>
                            </Form.ControlLabel>
                            <Input
                                value={formData.nom}
                                onChange={(value) => handleChange(value, 'nom')}
                                readOnly={isReadOnly}
                                placeholder="Entrez le nom"
                                style={{
                                    backgroundColor: isReadOnly ? '#f8fafc' : 'white',
                                    borderColor: '#e2e8f0'
                                }}
                            />
                        </Form.Group>
                    </Col>

                    {/* Prénom */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Group style={{ marginBottom: '20px' }}>
                            <Form.ControlLabel style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Prénom du fondateur <span style={{ color: '#ef4444' }}>*</span>
                            </Form.ControlLabel>
                            <Input
                                value={formData.prenom}
                                onChange={(value) => handleChange(value, 'prenom')}
                                readOnly={isReadOnly}
                                placeholder="Entrez le prénom"
                                style={{
                                    backgroundColor: isReadOnly ? '#f8fafc' : 'white',
                                    borderColor: '#e2e8f0'
                                }}
                            />
                        </Form.Group>
                    </Col>

                    {/* Téléphone */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Group style={{ marginBottom: '20px' }}>
                            <Form.ControlLabel style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Téléphone du fondateur <span style={{ color: '#ef4444' }}>*</span>
                            </Form.ControlLabel>
                            <InputGroup>
                                <InputGroup.Addon>📞</InputGroup.Addon>
                                <Input
                                    value={formData.telephone}
                                    onChange={(value) => handleChange(value, 'telephone')}
                                    readOnly={isReadOnly}
                                    placeholder="Ex: 0544581486"
                                    style={{
                                        backgroundColor: isReadOnly ? '#f8fafc' : 'white',
                                        borderColor: '#e2e8f0'
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>

                    {/* Deuxième Téléphone */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Group style={{ marginBottom: '20px' }}>
                            <Form.ControlLabel style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Deuxième Téléphone du fondateur
                            </Form.ControlLabel>
                            <InputGroup>
                                <InputGroup.Addon>📱</InputGroup.Addon>
                                <Input
                                    value={formData.telephone2}
                                    onChange={(value) => handleChange(value, 'telephone2')}
                                    readOnly={isReadOnly}
                                    placeholder="Ex: 0544581486"
                                    style={{
                                        backgroundColor: isReadOnly ? '#f8fafc' : 'white',
                                        borderColor: '#e2e8f0'
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>

                    {/* Email */}
                    <Col xs={24} sm={12} md={8}>
                        <Form.Group style={{ marginBottom: '20px' }}>
                            <Form.ControlLabel style={{
                                fontSize: '14px',
                                fontWeight: '500',
                                color: '#475569',
                                marginBottom: '8px'
                            }}>
                                Email personnel <span style={{ color: '#ef4444' }}>*</span>
                            </Form.ControlLabel>
                            <InputGroup>
                                <InputGroup.Addon>✉️</InputGroup.Addon>
                                <Input
                                    type="email"
                                    value={formData.email}
                                    onChange={(value) => handleChange(value, 'email')}
                                    readOnly={isReadOnly}
                                    placeholder="exemple@email.com"
                                    style={{
                                        backgroundColor: isReadOnly ? '#f8fafc' : 'white',
                                        borderColor: '#e2e8f0'
                                    }}
                                />
                            </InputGroup>
                        </Form.Group>
                    </Col>
                </Row>
            </Form>
        </div>
    );
};

// ===========================
// COMPOSANT STATISTIQUES
// ===========================
const StatCard = ({ value, label, color, bgColor, borderColor }) => (
    <div style={{
        textAlign: 'center',
        padding: '15px',
        backgroundColor: bgColor,
        borderRadius: '8px',
        border: `1px solid ${borderColor}`
    }}>
        <div style={{ fontSize: '24px', fontWeight: '700', color }}>
            {value}
        </div>
        <div style={{ fontSize: '12px', color, fontWeight: '500' }}>
            {label}
        </div>
    </div>
);

const EcolesStatsHeader = ({ ecoles, selectedCount }) => {
    const stats = useMemo(() => calculateStats(ecoles || []), [ecoles]);

    const statConfigs = [
        { key: 'total', label: 'Total Écoles', color: '#0369a1', bgColor: '#f0f9ff', borderColor: '#bae6fd' },
        { key: 'primaire', label: 'Primaire', color: '#16a34a', bgColor: '#f0fdf4', borderColor: '#bbf7d0' },
        { key: 'secondaire', label: 'Secondaire', color: '#d97706', bgColor: '#fffbeb', borderColor: '#fed7aa' },
        { key: 'superieur', label: 'Supérieur', color: '#9333ea', bgColor: '#f5f3ff', borderColor: '#d8b4fe' },
        { key: 'technique', label: 'Technique', color: '#dc2626', bgColor: '#fef2f2', borderColor: '#fecaca' },
        { key: 'maternelle', label: 'Maternelle', color: '#059669', bgColor: '#ecfdf5', borderColor: '#a7f3d0' }
    ];

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
                marginBottom: 20,
                paddingBottom: 15,
                borderBottom: '1px solid #f1f5f9'
            }}>
                <IconBox icon={FiBookOpen} />
                <div style={{ flex: 1 }}>
                    <h5 style={{ margin: 0, color: '#334155', fontWeight: '600' }}>
                        Écoles en Attente d'Enregistrement
                    </h5>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>
                        {stats.total} école(s) ajoutée(s) • {selectedCount} sélectionnée(s) • {stats.villesUniques.length} ville(s)
                        {selectedCount > 0 && (
                            <span style={{
                                color: '#10b981',
                                fontWeight: '600',
                                marginLeft: '8px'
                            }}>
                                • Prêt pour enregistrement
                            </span>
                        )}
                    </p>
                </div>
            </div>

            {/* Statistiques en grille */}
            <Row gutter={16}>
                {statConfigs.map(({ key, label, color, bgColor, borderColor }) => (
                    <Col xs={12} sm={8} md={4} key={key}>
                        <StatCard
                            value={stats[key]}
                            label={label}
                            color={color}
                            bgColor={bgColor}
                            borderColor={borderColor}
                        />
                    </Col>
                ))}
            </Row>

            {/* Badges des villes */}
            {stats.villeStats.length > 0 && (
                <div style={{ marginTop: 15, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {stats.villeStats.slice(0, 6).map((villeStat, index) => (
                        <Badge
                            key={villeStat.ville}
                            color={['green', 'blue', 'orange', 'violet', 'cyan', 'red'][index % 6]}
                            style={{ fontSize: '11px' }}
                        >
                            {villeStat.count} {villeStat.ville}
                        </Badge>
                    ))}
                    {stats.villeStats.length > 6 && (
                        <Badge color="gray" style={{ fontSize: '11px' }}>
                            +{stats.villeStats.length - 6} autres villes
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
};

// ===========================
// COMPOSANT PRINCIPAL
// ===========================
const ListeEcoles = ({ mode = "candidatEcoleInscription" }) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loadingUserData, setLoadingUserData] = useState(false);

    // États locaux pour la gestion des écoles
    const [ecoles, setEcoles] = useState([]);
    const [selectedEcoles, setSelectedEcoles] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const { handleTableAction } = useCommonState();

    // DEBUG: Afficher les écoles dans la console
    useEffect(() => {
        console.log('🔍 État des écoles mis à jour:', ecoles);
        console.log('📊 Nombre d\'écoles:', ecoles.length);
        ecoles.forEach((ecole, index) => {
            console.log(`École ${index + 1}:`, ecole);
        });
    }, [ecoles]);

    // Charger les données utilisateur si mode candidat
    useEffect(() => {
        if (mode === "candidatEcoleInscription") {
            loadUserData();
        }
    }, [mode]);

    const loadUserData = async () => {
        setLoadingUserData(true);
        try {
            const response = await axios.get(
                `${getFullUrl()}souscription-personnel/personnelById/${SOUSCRIPTION_ID}`,
                { timeout: 10000 }
            );
            console.log('✅ Données utilisateur chargées:', response.data);
            setUserData(response.data);
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données utilisateur:', error);
            Notification.error({
                title: 'Erreur',
                description: 'Impossible de charger les informations du fondateur.',
                duration: 3000
            });
        } finally {
            setLoadingUserData(false);
        }
    };

    // ===========================
    // GESTIONNAIRES D'ÉVÉNEMENTS
    // ===========================
    const showEcoleDetails = useCallback(async (ecole) => {
        await Swal.fire({
            title: ecole.nomEtablissement,
            html: `
                <div style="text-align: left; font-size: 14px;">
                    <p><strong>Code:</strong> ${ecole.codeEtablissement || 'Non renseigné'}</p>
                    <p><strong>Email:</strong> ${ecole.emailEtablissement || 'Non renseigné'}</p>
                    <p><strong>Téléphone:</strong> ${ecole.telephoneEtablissement || 'Non renseigné'}</p>
                    <p><strong>Niveau:</strong> ${ecole.niveauEnseignementLibelle || 'Non renseigné'}</p>
                    <p><strong>Localisation:</strong> ${[ecole.communeLibelle, ecole.villeLibelle, ecole.paysLibelle].filter(Boolean).join(', ') || 'Non renseignée'}</p>
                    <p><strong>Description:</strong> ${ecole.indicationEtablissement || 'Non renseignée'}</p>
                </div>
            `,
            icon: 'info',
            confirmButtonColor: '#667eea',
            confirmButtonText: 'Fermer'
        });
    }, []);

    const confirmDeleteEcole = useCallback(async (ecole) => {
        const result = await Swal.fire({
            title: 'Confirmer la suppression',
            text: `Êtes-vous sûr de vouloir supprimer l'école "${ecole.nomEtablissement}" ?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, supprimer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            // Supprimer de la liste locale
            setEcoles(prev => prev.filter(e => e.id !== ecole.id));
            // Supprimer de la sélection si elle y était
            setSelectedEcoles(prev => prev.filter(id => id !== ecole.id));

            await Swal.fire({
                icon: 'success',
                title: 'École supprimée',
                text: `L'école "${ecole.nomEtablissement}" a été supprimée de la liste.`,
                confirmButtonColor: '#10b981',
                timer: 2000
            });
        }
    }, []);

    const handleTableActionLocal = useCallback(async (actionType, item) => {
        const actionHandlers = {
            create: () => {
                setShowCreateModal(true);
            },
            view: () => showEcoleDetails(item),
            edit: async () => {
                await Swal.fire({
                    title: 'Modification',
                    text: `Fonctionnalité de modification pour "${item.nomEtablissement}" à implémenter`,
                    icon: 'info',
                    confirmButtonColor: '#f59e0b'
                });
            },
            delete: () => confirmDeleteEcole(item)
        };

        const handler = actionHandlers[actionType];
        if (handler) {
            await handler();
        } else {
            handleTableAction(actionType, item);
        }
    }, [showEcoleDetails, confirmDeleteEcole, handleTableAction]);

    const handleCreateEcole = useCallback(() => {
        setShowCreateModal(true);
    }, []);

    const handleCloseCreateModal = useCallback(() => {
        setShowCreateModal(false);
    }, []);

    // CORRIGÉE: Fonction de création d'école
    const handleCreateEcoleSuccess = useCallback(async (ecoleData) => {
        try {
            console.log('📝 Données reçues du modal:', ecoleData);

            // Créer une nouvelle école avec un ID unique et TOUTES les données nécessaires
            const newEcole = {
                // ID unique obligatoire pour DataTable
                id: Date.now() + Math.random(),

                // Données de base (obligatoires)
                nomEtablissement: ecoleData.nomEtablissement || '',
                emailEtablissement: ecoleData.emailEtablissement || '',
                telephoneEtablissement: ecoleData.telephoneEtablissement || '',
                codeEtablissement: ecoleData.codeEtablissement || '',
                indicationEtablissement: ecoleData.indicationEtablissement || '',

                // IDs numériques (pour l'API)
                ville: ecoleData.ville,
                commune: ecoleData.commune,
                zone: ecoleData.zone,
                niveauEnseignement: ecoleData.niveauEnseignement,
                pays: ecoleData.pays,
                directionRegionale: ecoleData.directionRegionale,

                // Libellés pour l'affichage (obligatoires pour la DataTable)
                villeLibelle: ecoleData.villeLibelle || 'Ville non définie',
                communeLibelle: ecoleData.communeLibelle || 'Commune non définie',
                zoneLibelle: ecoleData.zoneLibelle || '',
                niveauEnseignementLibelle: ecoleData.niveauEnseignementLibelle || 'Niveau non défini',
                paysLibelle: ecoleData.paysLibelle || '',
                drLibelle: ecoleData.drLibelle || '',

                // Fichiers optionnels
                autorisationUrl: ecoleData.autorisationUrl || null,
                logoUrl: ecoleData.logoUrl || null,

                // Métadonnées
                dateCreation: new Date().toISOString(),
                statut: 'En attente'
            };

            console.log('✅ École formatée pour ajout:', newEcole);

            // Vérification des champs obligatoires pour l'affichage
            const champsObligatoires = [
                'nomEtablissement',
                'emailEtablissement',
                'telephoneEtablissement',
                'codeEtablissement',
                'villeLibelle',
                'communeLibelle',
                'niveauEnseignementLibelle'
            ];

            const champsManquants = champsObligatoires.filter(champ => !newEcole[champ]);
            if (champsManquants.length > 0) {
                console.error('❌ Champs obligatoires manquants:', champsManquants);
                throw new Error(`Champs manquants: ${champsManquants.join(', ')}`);
            }

            // Ajouter à la liste locale avec forceUpdate
            setEcoles(prev => {
                const newList = [...prev, newEcole];
                console.log('🔄 Nouvelle liste d\'écoles:', newList);
                return newList;
            });

            setShowCreateModal(false);

            return newEcole;
        } catch (error) {
            console.error('❌ Erreur lors de l\'ajout de l\'école:', error);

            await Swal.fire({
                icon: 'error',
                title: 'Erreur lors de l\'ajout',
                text: error.message || 'Une erreur est survenue',
                confirmButtonColor: '#ef4444'
            });

            throw error;
        }
    }, []);

    const handleSelectionChange = useCallback((selectedKeys) => {
        console.log('🔍 Sélection changée:', selectedKeys);
        console.log('🎯 IDs des écoles:', ecoles.map(e => e.id));
        setSelectedEcoles(selectedKeys);
    }, [ecoles]);

    const handleSelectAll = useCallback(() => {
        if (selectedEcoles.length === ecoles.length) {
            // Tout désélectionner
            setSelectedEcoles([]);
        } else {
            // Tout sélectionner
            setSelectedEcoles(ecoles.map(ecole => ecole.id));
        }
    }, [selectedEcoles.length, ecoles]);

    const handleSaveSelected = useCallback(async () => {
        if (selectedEcoles.length === 0) {
            await Swal.fire({
                icon: 'warning',
                title: 'Aucune sélection',
                text: 'Veuillez sélectionner au moins une école avant d\'enregistrer.',
                confirmButtonColor: '#f59e0b'
            });
            return;
        }

        // Demander confirmation
        const result = await Swal.fire({
            title: 'Confirmer l\'enregistrement',
            text: `Êtes-vous sûr de vouloir enregistrer ${selectedEcoles.length} école(s) sélectionnée(s) ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, enregistrer',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) return;

        setIsSaving(true);

        try {
            // Filtrer les écoles sélectionnées
            const selectedEcolesData = ecoles.filter(ecole =>
                selectedEcoles.includes(ecole.id)
            );

            console.log('📤 Écoles à envoyer:', selectedEcolesData);

            // Transformer les données pour l'API
            const payload = selectedEcolesData.map(transformEcoleForAPI);

            console.log('📤 Payload final:', payload);

            // Appel à l'API
            const response = await axios.post(
                `${getFullUrl()}souscription-ecole/ajouter/souscription-etablissement?idSouscrip=${SOUSCRIPTION_ID}`,
                payload,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            console.log('✅ Réponse API:', response.data);

            // Succès
            await Swal.fire({
                icon: 'success',
                title: 'Enregistrement réussi !',
                text: `${selectedEcoles.length} école(s) ont été enregistrées avec succès.`,
                confirmButtonColor: '#10b981',
                timer: 3000
            });

            // Retirer les écoles enregistrées de la liste
            setEcoles(prev => prev.filter(ecole => !selectedEcoles.includes(ecole.id)));
            setSelectedEcoles([]);

        } catch (error) {
            console.error('❌ Erreur lors de l\'enregistrement:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de l\'enregistrement.';

            if (error.response) {
                console.error('Réponse d\'erreur:', error.response.data);
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations des écoles.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Souscription non trouvée. Vérifiez l\'ID de souscription.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = error.response.data?.message || errorMessage;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur d\'enregistrement',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSaving(false);
        }
    }, [selectedEcoles, ecoles]);

    const handleRefresh = useCallback(() => {
        // Réinitialiser la liste
        setEcoles([]);
        setSelectedEcoles([]);

        Notification.info({
            title: 'Liste réinitialisée',
            description: 'La liste des écoles a été vidée.',
            duration: 2000
        });
    }, []);

    const handleExportAll = useCallback(() => {
        if (ecoles.length === 0) {
            Swal.fire({
                title: 'Liste vide',
                text: 'Aucune école à exporter.',
                icon: 'info',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Créer un CSV simple
        const csvContent = [
            // En-têtes
            ['Code', 'Nom', 'Email', 'Téléphone', 'Niveau', 'Ville', 'Commune'].join(','),
            // Données
            ...ecoles.map(ecole => [
                ecole.codeEtablissement || '',
                `"${ecole.nomEtablissement || ''}"`,
                ecole.emailEtablissement || '',
                ecole.telephoneEtablissement || '',
                `"${ecole.niveauEnseignementLibelle || ''}"`,
                `"${ecole.villeLibelle || ''}"`,
                `"${ecole.communeLibelle || ''}"`
            ].join(','))
        ].join('\n');

        // Télécharger le fichier
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `ecoles_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    }, [ecoles]);


    // ===========================
    // RENDU PRINCIPAL
    // ===========================
    return (
        <div style={{
            backgroundColor: '#f8fafc',
            minHeight: '100vh',
            padding: '20px 0'
        }}>
            <div className="container-fluid">
                {/* Section Profil */}
                <div className="row">
                    <div className="col-lg-12">
                        <ProfileFormSection
                            mode={mode}
                            userData={userData}
                            loading={loadingUserData}
                        />
                    </div>
                </div>

                {/* En-tête avec statistiques */}
                {ecoles.length > 0 && (
                    <div className="row">
                        <div className="col-lg-12">
                            <EcolesStatsHeader ecoles={ecoles} selectedCount={selectedEcoles.length} />
                        </div>
                    </div>
                )}

                {/* Table principale ou état vide */}
                <div className="row">
                    <div className="col-lg-12">
                        {/* DEBUG: Information sur l'état */}
                        <div style={{
                            background: '#f0f9ff',
                            border: '1px solid #0ea5e9',
                            borderRadius: '8px',
                            padding: '12px',
                            marginBottom: '16px',
                            fontSize: '14px',
                            color: '#0c4a6e'
                        }}>
                            🔍 DEBUG: {ecoles.length} école(s) en mémoire, {selectedEcoles.length} sélectionnée(s)
                            {ecoles.length > 0 && (
                                <div style={{ marginTop: '4px', fontSize: '12px' }}>
                                    Dernière école: {ecoles[ecoles.length - 1]?.nomEtablissement}
                                </div>
                            )}
                        </div>

                        {/* Barre d'actions de sélection */}
                        {ecoles.length > 0 && (
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                padding: '16px 20px',
                                marginBottom: '16px',
                                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                                border: '1px solid rgba(102, 126, 234, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: '12px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        onClick={handleSelectAll}
                                        startIcon={selectedEcoles.length === ecoles.length ? <FiX /> : <FiCheck />}
                                        style={{
                                            color: selectedEcoles.length === ecoles.length ? '#ef4444' : '#10b981',
                                            border: `1px solid ${selectedEcoles.length === ecoles.length ? '#fecaca' : '#bbf7d0'}`,
                                            backgroundColor: selectedEcoles.length === ecoles.length ? '#fef2f2' : '#f0fdf4'
                                        }}
                                    >
                                        {selectedEcoles.length === ecoles.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                    </Button>

                                    <div style={{
                                        fontSize: '14px',
                                        color: '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <span>{selectedEcoles.length} / {ecoles.length} sélectionnée(s)</span>
                                        {selectedEcoles.length > 0 && (
                                            <Badge color="green" style={{ fontSize: '11px' }}>
                                                Prêt à enregistrer
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '8px' }}>
                                    {selectedEcoles.length > 0 && (
                                        <Button
                                            appearance="primary"
                                            color="green"
                                            size="sm"
                                            loading={isSaving}
                                            disabled={isSaving}
                                            onClick={handleSaveSelected}
                                            startIcon={<FiSave />}
                                            style={{
                                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                                border: 'none',
                                                fontWeight: '600'
                                            }}
                                        >
                                            {isSaving ? 'Enregistrement...' : `Enregistrer ${selectedEcoles.length} école(s)`}
                                        </Button>
                                    )}

                                    <Button
                                        appearance="subtle"
                                        size="sm"
                                        disabled={ecoles.length === 0}
                                        onClick={handleExportAll}
                                        startIcon={<FiDownload />}
                                        style={{
                                            color: '#3b82f6',
                                            border: '1px solid #dbeafe',
                                            backgroundColor: '#f0f9ff'
                                        }}
                                    >
                                        Exporter CSV
                                    </Button>
                                </div>
                            </div>
                        )}

                        <div style={{
                            background: 'white',
                            borderRadius: '15px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                            border: '1px solid rgba(102, 126, 234, 0.1)',
                            overflow: 'hidden'
                        }}>
                            <DataTable
                                title="Écoles en Attente d'Enregistrement"
                                subtitle={` école(s) • ${selectedEcoles.length} sélectionnée(s)`}
                                data={ecoles}
                                loading={false}
                                error={null}
                                columns={listeEcolesAAjouterTableConfig.columns}
                                searchableFields={listeEcolesAAjouterTableConfig.searchableFields}
                                filterConfigs={listeEcolesAAjouterTableConfig.filterConfigs}
                                actions={listeEcolesAAjouterTableConfig.actions}
                                onAction={handleTableActionLocal}
                                onRefresh={handleRefresh}
                                onCreateNew={handleCreateEcole}
                                defaultPageSize={15}
                                pageSizeOptions={[10, 15, 25, 50]}
                                tableHeight={650}
                                enableRefresh={true}
                                enableCreate={true}
                                createButtonText="Ajouter une École"
                                selectable={true}
                                selectedKeys={selectedEcoles}
                                onSelectionChange={handleSelectionChange}
                                rowKey="id"
                                checkable={true}
                                defaultCheckedKeys={[]}
                                onCheck={handleSelectionChange}
                                customStyles={{
                                    container: { backgroundColor: "transparent" },
                                    panel: { minHeight: "650px", border: "none", boxShadow: "none" },
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de création */}
            <CreateEcoleModal
                show={showCreateModal}
                onClose={handleCloseCreateModal}
                onSave={handleCreateEcoleSuccess}
            />
        </div>
    );
};

export default ListeEcoles