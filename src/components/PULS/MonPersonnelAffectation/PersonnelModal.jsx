import React, { useState, useEffect } from 'react';
import {
    Modal,
    Button,
    Input,
    Pagination,
    Checkbox,
    DatePicker,
    Panel,
    PanelGroup,
    FlexboxGrid,
    Tag,
    Divider,
    InputGroup,
    SelectPicker,
    Avatar,
    Badge,
    Placeholder,
    Text,
    Stack,
    IconButton,
    Grid,
    Row,
    Col
} from 'rsuite';
import {
    FiUser,
    FiPhone,
    FiMail,
    FiCalendar,
    FiBookOpen,
    FiAward,
    FiSearch,
    FiFilter,
    FiCheck,
    FiX,
    FiUsers,
    FiShield,
    FiClock,
    FiUserCheck,
    FiUserMinus,
    FiEye,
    FiDownload,
    FiFile
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';
import getFullUrl from "../../hooks/urlUtils";

const PersonnelModal = ({ modalState, onClose, onSave }) => {
    const { isOpen, type, selectedQuestion: personnel } = modalState;
    const [classes, setClasses] = useState([]);
    const [profiles, setProfiles] = useState([]);
    const [filteredProfiles, setFilteredProfiles] = useState([]);
    const [selectedProfiles, setSelectedProfiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [profileSearchTerm, setProfileSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [dateFinValidite, setDateFinValidite] = useState(null);
    const [profileActive, setProfileActive] = useState(true);

    const { ecoleId: dynamicEcoleId, academicYearId: dynamicAcademicYearId } = usePulsParams();
    const itemsPerPage = 9;
    const apiUrls = useAllApiUrls();

    // Fonction pour télécharger un fichier
    const downloadFile = async (filename, displayName) => {
        try {
            const response = await axios.get(apiUrls.personnel.ouvrirFichierByApi(filename));

            // Créer un lien de téléchargement
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            Swal.fire({
                icon: 'success',
                title: 'Téléchargement réussi',
                text: `Le fichier ${displayName} a été téléchargé avec succès.`,
                timer: 3000,
                showConfirmButton: false
            });
        } catch (error) {
            console.error('Erreur lors du téléchargement:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de téléchargement',
                text: `Impossible de télécharger le fichier ${displayName}. Veuillez réessayer.`,
                confirmButtonColor: '#ef4444'
            });
        }
    };

    // Récupération des données
    useEffect(() => {
        if (type === 'view' && personnel?.id && isOpen) {
            fetchPersonnelClasses();
        }
    }, [type, personnel, isOpen]);

    useEffect(() => {
        if (type === 'edit' && isOpen) {
            fetchAvailableProfiles();
        }
    }, [type, isOpen]);

    // Filtrage des profils avec recherche
    useEffect(() => {
        const filtered = profiles.filter(profile =>
            profile.profil_libelle?.toLowerCase().includes(profileSearchTerm.toLowerCase()) ||
            profile.profilcode?.toLowerCase().includes(profileSearchTerm.toLowerCase())
        );
        setFilteredProfiles(filtered);
    }, [profiles, profileSearchTerm]);

    const fetchPersonnelClasses = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                apiUrls.personnel.getClasseParProf(personnel.id) //
            );
            setClasses(response.data || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des classes:', error);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableProfiles = async () => {
        try {
            setLoading(true);
            const response = await axios.get(apiUrls.profils.getProfilVisible());
            setProfiles(response.data || []);
        } catch (error) {
            console.error('Erreur lors de la récupération des profils:', error);
            setProfiles([]);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSelection = (profile, checked) => {
        if (checked) {
            setSelectedProfiles(prev => [...prev, profile]);
        } else {
            setSelectedProfiles(prev => prev.filter(p => p.profilid !== profile.profilid));
        }
    };

    // Dans la fonction handleSaveProfileAssignment, remplacez la construction de requestData par :

    const handleSaveProfileAssignment = async () => {
    // Validations - personnel
    if (!personnel || !personnel.id) {
        Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Données du personnel manquantes. Impossible d\'affecter les profils.',
            confirmButtonColor: '#10b981'
        });
        return;
    }

    // Validations - profils sélectionnés
    if (selectedProfiles.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'Sélection requise',
            text: 'Veuillez sélectionner au moins un profil à affecter.',
            confirmButtonColor: '#10b981'
        });
        return;
    }

    // Validations - date de fin
    if (!dateFinValidite) {
        Swal.fire({
            icon: 'warning',
            title: 'Date requise',
            text: 'Veuillez sélectionner une date de fin de validité.',
            confirmButtonColor: '#10b981'
        });
        return;
    }

    // Confirmation avec le contenu complet du Swal
    const result = await Swal.fire({
        title: 'Confirmer l\'affectation des profils',
        html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border: 1px solid #dee2e6; border-radius: 12px; padding: 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
                    <div style="width: 40px; height: 40px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 16px;">
                        ${personnel.nomComplet?.charAt(0) || 'P'}
                    </div>
                    <div style="flex: 1; text-align: left;">
                        <div style="font-weight: 600; color: #2c3e50; font-size: 16px; margin-bottom: 4px;">
                            ${personnel.nomComplet}
                        </div>
                        <div style="color: #6c757d; font-size: 13px;">
                            ID: ${personnel.id} • ${personnel.fonction || 'Personnel'}
                        </div>
                    </div>
                </div>
                <div style="background: #f0f8ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; color: #1e40af; font-weight: 600; font-size: 14px;">
                        <span style="width: 20px; height: 20px; background: #3b82f6; border-radius: 4px; display: inline-flex; align-items: center; justify-content: center; color: white; font-size: 12px;">🛡️</span>
                        Profils sélectionnés (${selectedProfiles.length})
                    </div>
                    <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                        ${selectedProfiles.map(p => `
                            <span style="background: #3b82f6; color: white; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; display: inline-flex; align-items: center; gap: 4px;">
                                <span style="width: 16px; height: 16px; background: rgba(255,255,255,0.3); border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; font-size: 10px;">${p.profilcode}</span>
                                ${p.profil_libelle}
                            </span>
                        `).join('')}
                    </div>
                </div>
                <div style="display: flex; gap: 12px;">
                    <div style="flex: 1; background: #fef3cd; border: 1px solid #fde68a; border-radius: 10px; padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; color: #92400e; font-weight: 600; font-size: 12px;">
                            <span style="font-size: 14px;">📅</span>
                            Date de fin
                        </div>
                        <div style="color: #451a03; font-weight: 600; font-size: 14px;">
                            ${dateFinValidite ? new Date(dateFinValidite).toLocaleDateString('fr-FR') : 'Non définie'}
                        </div>
                    </div>
                    <div style="flex: 1; background: #dcfce7; border: 1px solid #bbf7d0; border-radius: 10px; padding: 12px;">
                        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; color: #15803d; font-weight: 600; font-size: 12px;">
                            <span style="font-size: 14px;">✅</span>
                            État
                        </div>
                        <div style="color: #14532d; font-weight: 600; font-size: 14px;">
                            ${profileActive ? 'Actif' : 'Inactif'}
                        </div>
                    </div>
                </div>
            </div>
        `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Confirmer l\'affectation',
        cancelButtonText: 'Annuler',
        confirmButtonColor: '#10b981',
        cancelButtonColor: '#6b7280',
        customClass: {
            popup: 'swal2-popup-custom',
            confirmButton: 'swal2-confirm-custom',
            cancelButton: 'swal2-cancel-custom'
        }
    });

    // Si l'utilisateur confirme
    if (result.isConfirmed) {
        try {
            setIsSubmitting(true);

            // NOUVEAU FORMAT DE DONNÉES SELON VOTRE DEMANDE
            const requestData = {
                personnel_personnelid: personnel.id,
                utilisateur_has_person_active: profileActive ? 1 : 0,
                utilisateur_has_person_date_fin: dateFinValidite.toISOString().split('T')[0], // Format YYYY-MM-DD
                ecole_ecoleid: dynamicEcoleId?.toString() || "38", // Utilise l'ID dynamique ou "38" par défaut
                listProfil: selectedProfiles.map(profile => ({
                    profil_libelle: profile.profil_libelle,
                    profilcode: profile.profilcode,
                    profilid: profile.profilid
                }))
            };

            console.log('Données à envoyer:', requestData); // Pour debug

            // Appel API avec le nouveau format
            const response = await axios.post(
                apiUrls.profils.affecterProfilUtilisateur(),
                requestData
            );

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Affectation réussie !',
                    html: `
                        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
                            <div style="background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%); border: 1px solid #86efac; border-radius: 12px; padding: 20px; margin: 16px 0; text-align: center;">
                                <div style="font-size: 48px; margin-bottom: 12px;">✅</div>
                                <div style="color: #15803d; font-weight: 600; font-size: 18px; margin-bottom: 8px;">
                                    Profils affectés avec succès !
                                </div>
                                <div style="color: #166534; font-size: 14px;">
                                    ${selectedProfiles.length} profil(s) ont été affectés à <strong>${personnel.nomComplet}</strong>
                                </div>
                            </div>
                            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; text-align: left;">
                                <div style="color: #475569; font-size: 13px; margin-bottom: 8px;">
                                    <strong>Détails de l'affectation :</strong>
                                </div>
                                <div style="color: #64748b; font-size: 12px; line-height: 1.4;">
                                    • Personnel : ${personnel.nomComplet}<br>
                                    • Nombre de profils : ${selectedProfiles.length}<br>
                                    • Date de fin : ${dateFinValidite ? new Date(dateFinValidite).toLocaleDateString('fr-FR') : 'Non définie'}<br>
                                    • État : ${profileActive ? 'Actif' : 'Inactif'}
                                </div>
                            </div>
                        </div>
                    `,
                    timer: 5000,
                    showConfirmButton: false,
                    showCloseButton: true
                });

                // Réinitialiser les états
                setSelectedProfiles([]);
                setDateFinValidite(null);
                setProfileActive(true);
                
                // Fermer le modal et déclencher le refresh
                if (onSave) {
                    onSave();
                }
                onClose();
            }

        } catch (error) {
            console.error('Erreur lors de l\'affectation des profils:', error);
            
            let errorMessage = 'Une erreur est survenue lors de l\'affectation des profils.';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.message) {
                errorMessage = error.message;
            }

            Swal.fire({
                icon: 'error',
                title: 'Erreur d\'affectation',
                text: errorMessage,
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsSubmitting(false);
        }
    }
};

    const formatDate = (dateString) => {
        if (!dateString) return 'Non définie';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const filteredClasses = classes.filter(classe =>
        classe.libelleClasse?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedClasses = filteredClasses.slice(startIndex, startIndex + itemsPerPage);

    // Extraction du prénom et nom pour l'avatar
    const getInitials = (name) => {
        if (!name) return 'PR';
        const names = name.split(' ');
        return names.length > 1
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : name.slice(0, 2).toUpperCase();
    };

    const InfoCard = ({ icon: Icon, title, value, color = '#6366f1' }) => (
        <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            padding: '16px',
            height: '85px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Icon size={14} style={{ color }} />
                <Text size="sm" style={{
                    color: '#64748b',
                    fontWeight: '500'
                }}>
                    {title}
                </Text>
            </div>
            <Text style={{
                color: '#0f172a',
                fontWeight: '600',
                fontSize: '14px',
                lineHeight: '1.2'
            }}>
                {value || 'Non renseigné'}
            </Text>
        </div>
    );

    const ClassCard = ({ classe, index }) => (
        <div style={{
            background: '#ffffff',
            border: '1px solid #f1f5f9',
            borderRadius: '12px',
            padding: '16px',
            height: '100px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
            cursor: 'pointer'
        }}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
            }}>
            <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#6366f1',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px',
                color: 'white',
            }}>
                <FiBookOpen size={18} />
            </div>
            <Text style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1e293b',
                textAlign: 'center'
            }}>
                {classe.libelleClasse}
            </Text>
        </div>
    );

    // Rendu pour l'action "voir"
    const renderViewContent = () => {
        if (!personnel) return null;

        return (
            <div style={{ padding: '0 4px' }}>
                {/* Contact rapide */}


                {/* Informations professionnelles */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            <FiUsers style={{ marginRight: '8px' }} />
                            Informations professionnelles
                        </Text>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        marginBottom: '24px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <Grid fluid>
                        <Row gutter={16} style={{ marginTop: '16px' }}>
                            <Col xs={6}>
                                <InfoCard
                                    icon={FiUser}
                                    title="Fonction"
                                    value={personnel.fonction}
                                    color="#6366f1"
                                />
                            </Col>
                            <Col xs={5}>
                                <InfoCard
                                    icon={FiAward}
                                    title="Formation"
                                    value={personnel.niveauEtude}
                                    color="#f59e0b"
                                />
                            </Col>
                            <Col xs={5}>
                                <InfoCard
                                    icon={FiCalendar}
                                    title="Expérience"
                                    value={`${personnel.experienceAnnees || 0} ans`}
                                    color="#10b981"
                                />
                            </Col>
                            <Col xs={8}>
                                {personnel.diplomeRecent && (
                                    <div>
                                        <InfoCard
                                            icon={FiAward}
                                            title="Dernier diplôme"
                                            value={personnel.diplomeRecent}
                                            color="#f59e0b"
                                        />
                                    </div>
                                )}
                            </Col>
                        </Row>
                    </Grid>
                    <div className="mt-2" style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}>
                        <Grid fluid>
                            <Row gutter={16}>
                                <Col xs={12}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FiPhone size={16} style={{ color: '#10b981' }} />
                                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                                            {personnel.contact || 'Téléphone non disponible'}
                                        </Text>
                                    </div>
                                </Col>
                                <Col xs={12}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <FiMail size={16} style={{ color: '#6366f1' }} />
                                        <Text style={{ color: '#64748b', fontSize: '14px' }}>
                                            {personnel.email || 'Email non disponible'}
                                        </Text>
                                    </div>
                                </Col>
                            </Row>
                        </Grid>
                    </div>
                </Panel>

                {/* Section Documents - Boutons de téléchargement conditionnels */}
                {(personnel?.cvLien && personnel.cvLien.trim() !== '') ||
                    (personnel?.pieceIdentiteLien && personnel.pieceIdentiteLien.trim() !== '') ||
                    (personnel?.autorisationLien && personnel.autorisationLien.trim() !== '') ? (
                    <Panel
                        header={
                            <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                <FiFile style={{ marginRight: '8px' }} />
                                Documents
                            </Text>
                        }
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            marginBottom: '24px',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <Grid fluid className="mt-3">
                            <Row gutter={16}>
                                {/* Bouton CV */}
                                {personnel?.cvLien && personnel.cvLien.trim() !== '' && (
                                    <Col xs={8}>
                                        <Button
                                            appearance="primary"
                                            color="blue"
                                            size="md"
                                            block
                                            startIcon={<FiDownload />}
                                            onClick={() => downloadFile(personnel.cvLien, 'CV')}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Télécharger CV
                                        </Button>
                                    </Col>
                                )}

                                {/* Bouton Pièce d'identité */}
                                {personnel?.pieceIdentiteLien && personnel.pieceIdentiteLien.trim() !== '' && (
                                    <Col xs={8}>
                                        <Button
                                            appearance="primary"
                                            color="green"
                                            size="md"
                                            block
                                            startIcon={<FiDownload />}
                                            onClick={() => downloadFile(personnel.pieceIdentiteLien, 'Pièce d\'identité')}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Télécharger CNI
                                        </Button>
                                    </Col>
                                )}

                                {/* Bouton Autorisation */}
                                {personnel?.autorisationLien && personnel.autorisationLien.trim() !== '' && (
                                    <Col xs={8}>
                                        <Button
                                            appearance="primary"
                                            color="orange"
                                            size="md"
                                            block
                                            startIcon={<FiDownload />}
                                            onClick={() => downloadFile(personnel.autorisationLien, 'Autorisation')}
                                            style={{
                                                borderRadius: '8px',
                                                fontWeight: '500'
                                            }}
                                        >
                                            Télécharger Autorisation
                                        </Button>
                                    </Col>
                                )}
                            </Row>
                        </Grid>
                    </Panel>
                ) : null}

                {/* Classes enseignées - Affichage conditionnel */}
                {classes && classes.length > 0 && (
                    <Panel
                        header={
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                    <FiBookOpen style={{ marginRight: '8px' }} />
                                    Classes enseignées
                                </Text>
                                <Badge style={{
                                    background: '#f1f5f9',
                                    color: '#475569',
                                    fontWeight: '500',
                                    border: '1px solid #e2e8f0'
                                }}>
                                    {filteredClasses.length} classe{filteredClasses.length > 1 ? 's' : ''}
                                </Badge>
                            </div>
                        }
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <div id="ClasseEnseigner">
                            <div style={{ marginBottom: '20px', marginTop: '20px' }}>
                                <InputGroup inside style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Rechercher une classe..."
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                        style={{
                                            borderRadius: '8px',
                                            border: '0px solid #e2e8f0'
                                        }}
                                    />
                                    <InputGroup.Addon>
                                        <FiSearch />
                                    </InputGroup.Addon>
                                </InputGroup>
                            </div>
                            {loading ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <Placeholder.Graph active />
                                </div>
                            ) : paginatedClasses.length > 0 ? (
                                <>
                                    <Grid fluid>
                                        <Row gutter={16}>
                                            {paginatedClasses.map((classe, index) => (
                                                <Col xs={6} key={`${classe.idPerson}-${classe.idAnn}-${index}`} className='mb-3'>
                                                    <ClassCard classe={classe} index={index} />
                                                </Col>
                                            ))}
                                        </Row>
                                    </Grid>

                                    {Math.ceil(filteredClasses.length / itemsPerPage) > 1 && (
                                        <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                            <Pagination
                                                prev
                                                next
                                                first
                                                last
                                                ellipsis
                                                boundaryLinks
                                                maxButtons={5}
                                                size="sm"
                                                layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                                                total={filteredClasses.length}
                                                limitOptions={[9, 18, 30]}
                                                limit={itemsPerPage}
                                                activePage={currentPage}
                                                onChangePage={setCurrentPage}
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    background: 'white',
                                                    borderRadius: '8px',
                                                    padding: '12px'
                                                }}
                                            />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    color: '#64748b'
                                }}>
                                    <FiBookOpen size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                                    <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                                        Aucune classe trouvée
                                    </Text>
                                    <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
                                        {searchTerm ? `Aucun résultat pour "${searchTerm}"` : 'Ce personnel n\'a pas de classes assignées'}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Panel>
                )}
            </div>
        );
    };

    // Rendu pour l'action "éditer" (affecter des profils)
    const renderEditContent = () => {
        const profilePageCount = Math.ceil(filteredProfiles.length / itemsPerPage);
        const profileStartIndex = (currentPage - 1) * itemsPerPage;
        const paginatedProfiles = filteredProfiles.slice(profileStartIndex, profileStartIndex + itemsPerPage);

        return (
            <div style={{ padding: '0 4px' }}>
                {/* Configuration */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            <FiShield style={{ marginRight: '8px' }} />
                            Configuration de l'affectation
                        </Text>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        marginBottom: '24px',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <Grid fluid className='mt-3'>
                        <Row gutter={16}>
                            <Col xs={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text size="sm" style={{ color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                                        <FiCalendar size={14} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                        Date de fin de validité *
                                    </Text>
                                    <DatePicker
                                        value={dateFinValidite}
                                        onChange={setDateFinValidite}
                                        placeholder="Sélectionner une date"
                                        format="dd/MM/yyyy"
                                        size="md"
                                        style={{ width: '100%' }}
                                        ranges={[
                                            {
                                                label: 'Dans 1 mois',
                                                value: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                            },
                                            {
                                                label: 'Dans 3 mois',
                                                value: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
                                            },
                                            {
                                                label: 'Dans 6 mois',
                                                value: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
                                            },
                                            {
                                                label: 'Dans 1 an',
                                                value: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
                                            }
                                        ]}
                                    />
                                </div>
                            </Col>
                            <Col xs={12}>
                                <div style={{ marginBottom: '16px' }}>
                                    <Text size="sm" style={{ color: '#64748b', marginBottom: '8px', fontWeight: '500' }}>
                                        État du profil
                                    </Text>
                                    <Checkbox
                                        checked={profileActive}
                                        onChange={(value, checked) => setProfileActive(checked)}
                                    >
                                        Profil actif
                                    </Checkbox>
                                </div>
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Sélection des profils */}
                <Panel
                    header={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                <FiUserCheck style={{ marginRight: '8px' }} />
                                Profils disponibles
                            </Text>
                            <Badge style={{
                                background: '#f1f5f9',
                                color: '#475569',
                                fontWeight: '500',
                                border: '1px solid #e2e8f0'
                            }}>
                                {selectedProfiles.length} sélectionné{selectedProfiles.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    {/* Barre de recherche */}
                    <div className='mt-3' style={{ marginBottom: '20px' }}>
                        <InputGroup inside style={{ width: '100%' }}>
                            <Input
                                placeholder="Rechercher un profil..."
                                value={profileSearchTerm}
                                onChange={setProfileSearchTerm}
                                style={{
                                    borderRadius: '8px',
                                    border: '1px solid #e2e8f0'
                                }}
                            />
                            <InputGroup.Addon>
                                <FiSearch />
                            </InputGroup.Addon>
                        </InputGroup>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Placeholder.Graph active />
                        </div>
                    ) : paginatedProfiles.length > 0 ? (
                        <>
                            <Grid fluid>
                                <Row gutter={16}>
                                    {paginatedProfiles.map((profile) => {
                                        const isSelected = selectedProfiles.some(p => p.profilid === profile.profilid);
                                        return (
                                            <Col xs={8} key={profile.profilid}>
                                                <div
                                                    style={{
                                                        background: isSelected ? '#f0f8ff' : '#ffffff',
                                                        border: isSelected ? '1px solid #3b82f6' : '1px solid #f1f5f9',
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        marginBottom: '16px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                                                    }}
                                                    onClick={() => handleProfileSelection(profile, !isSelected)}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <Checkbox
                                                            checked={isSelected}
                                                            onChange={(value, checked) => handleProfileSelection(profile, checked)}
                                                        />
                                                        <div style={{ flex: 1 }}>
                                                            <Text style={{
                                                                fontWeight: '600',
                                                                fontSize: '13px',
                                                                color: isSelected ? '#1d4ed8' : '#1e293b',
                                                                marginBottom: '4px'
                                                            }}>
                                                                {profile.profil_libelle}
                                                            </Text>
                                                        </div>
                                                    </div>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Grid>

                            {profilePageCount > 1 && (
                                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                                    <Pagination
                                        prev
                                        next
                                        first
                                        last
                                        ellipsis
                                        boundaryLinks
                                        maxButtons={5}
                                        size="sm"
                                        layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                                        total={filteredProfiles.length}
                                        limitOptions={[9, 18, 30]}
                                        limit={itemsPerPage}
                                        activePage={currentPage}
                                        onChangePage={setCurrentPage}
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            background: 'white',
                                            borderRadius: '8px',
                                            padding: '12px'
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{
                            textAlign: 'center',
                            padding: '40px 20px',
                            color: '#64748b'
                        }}>
                            <FiSearch size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
                            <Text style={{ fontSize: '16px', fontWeight: '500' }}>
                                Aucun profil trouvé
                            </Text>
                            <Text style={{ fontSize: '14px', color: '#94a3b8', marginTop: '8px' }}>
                                {profileSearchTerm ? `Aucun résultat pour "${profileSearchTerm}"` : 'Aucun profil disponible'}
                            </Text>
                        </div>
                    )}

                    {/* Profils sélectionnés */}
                    {selectedProfiles.length > 0 && (
                        <div style={{
                            marginTop: '24px',
                            padding: '16px',
                            background: '#f0f8ff',
                            border: '1px solid #bfdbfe',
                            borderRadius: '8px'
                        }}>
                            <Text size="sm" style={{ color: '#1e40af', fontWeight: '600', marginBottom: '12px' }}>
                                Profils sélectionnés ({selectedProfiles.length})
                            </Text>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {selectedProfiles.map((profile) => (
                                    <div
                                        key={profile.profilid}
                                        style={{
                                            background: '#3b82f6',
                                            color: 'white',
                                            padding: '4px 6px',
                                            borderRadius: '10px',
                                            fontSize: '10px',
                                            fontWeight: '500',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}
                                    >
                                        {profile.profilcode} - {profile.profil_libelle}
                                        <IconButton
                                            size="xs"
                                            icon={<FiX />}
                                            circle
                                            style={{
                                                background: 'rgba(255, 255, 255, 0.2)',
                                                color: 'white',
                                                border: 'none'
                                            }}
                                            onClick={() => handleProfileSelection(profile, false)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Panel>
            </div>
        );
    };

    // Rendu pour l'action "supprimer"
    const renderDeleteContent = () => {
        return (
            <div style={{
                padding: '32px 24px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                border: '1px solid #fecaca',
                borderRadius: '12px',
                margin: '20px 0',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{
                        width: '20px',
                        height: '20px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                    }}>
                        <Text style={{ color: 'white', fontSize: '12px', fontWeight: 'bold' }}>!</Text>
                    </div>
                    <div>
                        <Text weight="bold" style={{ color: '#dc2626', marginBottom: '8px' }}>
                            Attention : Action irréversible
                        </Text>
                        <Text style={{ color: '#7f1d1d', lineHeight: '1.5' }}>
                            Cette action supprimera définitivement toutes les informations liées à ce membre du personnel,
                            y compris ses affectations de classes et ses profils d'accès.
                        </Text>
                    </div>
                </div>
            </div>
        );
    };

    // Configuration du modal
    const getModalConfig = () => {
        switch (type) {
            case 'view':
                return {
                    title: `Détails - ${personnel?.nomComplet || 'Personnel'}`,
                    icon: FiEye,
                    size: 'lg',
                    showSaveButton: false,
                    content: renderViewContent()
                };
            case 'edit':
                return {
                    title: `Affecter des profils - ${personnel?.nomComplet || 'Personnel'}`,
                    icon: FiUserCheck,
                    size: 'md',
                    showSaveButton: true,
                    saveButtonText: isSubmitting ? 'Affectation en cours...' : 'Affecter les profils',
                    saveButtonColor: 'blue',
                    onSave: handleSaveProfileAssignment,
                    content: renderEditContent()
                };
            case 'delete':
                return {
                    title: 'Supprimer le personnel',
                    icon: FiUserMinus,
                    size: 'sm',
                    showSaveButton: true,
                    saveButtonText: 'Supprimer',
                    saveButtonColor: 'red',
                    content: renderDeleteContent()
                };
            default:
                return {
                    title: 'Personnel',
                    icon: FiUser,
                    size: 'sm',
                    showSaveButton: false,
                    content: <Text>Action non reconnue: {type}</Text>
                };
        }
    };

    const modalConfig = getModalConfig();

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size={modalConfig.size}
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header épuré */}
            <Modal.Header style={{
                background: '#ffffff',
                borderBottom: '1px solid #f1f5f9',
                padding: '24px',
                borderRadius: '16px 16px 0 0'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                }}>
                    <Avatar
                        size="lg"
                        style={{
                            background: '#f8fafc',
                            color: '#64748b',
                            fontWeight: '600',
                            fontSize: '18px',
                            border: '2px solid #e2e8f0'
                        }}
                    >
                        {getInitials(personnel?.nomComplet)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {personnel?.nomComplet || 'Personnel'}
                        </Text>
                        <Badge style={{
                            background: '#f1f5f9',
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {personnel?.fonction || 'PERSONNEL'}
                        </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <modalConfig.icon size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            {type === 'view' ? 'Consultation' : type === 'edit' ? 'Affectation' : 'Suppression'}
                        </Text>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{
                maxHeight: '75vh',
                overflowY: 'auto',
            }}>
                {modalConfig.content}
            </Modal.Body>

            <Modal.Footer style={{
                padding: '20px 24px',
                borderTop: '1px solid #f1f5f9',
                background: 'white',
                borderRadius: '0 0 16px 16px'
            }}>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                    <Button
                        appearance="subtle"
                        onClick={onClose}
                        disabled={loading || isSubmitting}
                        startIcon={<FiX />}
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px'
                        }}
                    >
                        {modalConfig.showSaveButton ? 'Annuler' : 'Fermer'}
                    </Button>

                    {modalConfig.showSaveButton && (
                        <Button
                            appearance="primary"
                            color={modalConfig.saveButtonColor || 'blue'}
                            onClick={modalConfig.onSave || onSave}
                            loading={isSubmitting}
                            disabled={
                                loading ||
                                isSubmitting ||
                                (type === 'edit' && (selectedProfiles.length === 0 || !dateFinValidite))
                            }
                            startIcon={type === 'delete' ? <FiUserMinus /> : <FiCheck />}
                            style={{
                                background: isSubmitting ? '#94a3b8' :
                                    type === 'delete' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' :
                                        'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                border: 'none',
                                borderRadius: '8px',
                                padding: '8px 20px',
                                fontWeight: '600'
                            }}
                        >
                            {modalConfig.saveButtonText || 'Sauvegarder'}
                        </Button>
                    )}
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default PersonnelModal;