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
    FiEye
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';

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
                apiUrls.personnel.getClasseParProf(personnel.id, dynamicAcademicYearId)
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

    const handleSaveProfileAssignment = async () => {
        // [Logique d'affectation conservée...]
        if (!personnel || !personnel.id) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Données du personnel manquantes. Impossible d\'affecter les profils.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (selectedProfiles.length === 0) {
            Swal.fire({
                icon: 'warning',
                title: 'Sélection requise',
                text: 'Veuillez sélectionner au moins un profil à affecter.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (!dateFinValidite) {
            Swal.fire({
                icon: 'warning',
                title: 'Date requise',
                text: 'Veuillez sélectionner une date de fin de validité.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

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
                                ${dateFinValidite.toLocaleDateString('fr-FR', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            })}
                            </div>
                        </div>
                        <div style="flex: 1; background: ${profileActive ? '#d1fae5' : '#fee2e2'}; border: 1px solid ${profileActive ? '#a7f3d0' : '#fecaca'}; border-radius: 10px; padding: 12px;">
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; color: ${profileActive ? '#065f46' : '#991b1b'}; font-weight: 600; font-size: 12px;">
                                <span style="font-size: 14px;">${profileActive ? '✅' : '❌'}</span>
                                Statut
                            </div>
                            <div style="color: ${profileActive ? '#064e3b' : '#7f1d1d'}; font-weight: 600; font-size: 14px;">
                                ${profileActive ? 'Actif' : 'Inactif'}
                            </div>
                        </div>
                    </div>
                    <div style="background: #fffbeb; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px; margin-top: 16px; display: flex; align-items: start; gap: 8px;">
                        <span style="color: #f59e0b; font-size: 16px;">⚠️</span>
                        <div style="flex: 1; text-align: left;">
                            <div style="color: #92400e; font-weight: 600; font-size: 13px; margin-bottom: 4px;">
                                Cette action va affecter définitivement ces profils
                            </div>
                            <div style="color: #451a03; font-size: 12px; line-height: 1.4;">
                                Les accès seront actifs immédiatement et expireront à la date spécifiée.
                            </div>
                        </div>
                    </div>
                </div>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, affecter',
            cancelButtonText: 'Annuler',
            reverseButtons: true,
            width: '600px'
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            const data = {
                personnel_personnelid: personnel.id,
                utilisateur_has_person_active: profileActive ? 1 : 0,
                utilisateur_has_person_date_fin: dateFinValidite.toISOString().split('T')[0],
                ecole_ecoleid: dynamicEcoleId.toString(),
                listProfil: selectedProfiles
            };

            const response = await axios.post(
                apiUrls.connexion.affecterProfilUtilisateur(),
                data,
                {
                    headers: { 'Content-Type': 'application/json' },
                    timeout: 15000
                }
            );

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Profils affectés avec succès !',
                    html: `
                        <div style="text-align: left;">
                            <p><strong>${selectedProfiles.length}</strong> profil${selectedProfiles.length > 1 ? 's ont été affectés' : ' a été affecté'} à <strong>${personnel.nomComplet}</strong>.</p>
                            <div style="margin-top: 10px;">
                                ${selectedProfiles.map(p => `<span style="display: inline-block; background: #d4edda; color: #155724; padding: 2px 8px; margin: 2px; border-radius: 4px; font-size: 12px;">${p.profil_libelle}</span>`).join('')}
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#10b981',
                    timer: 4000,
                    showConfirmButton: true
                });

                setSelectedProfiles([]);
                setDateFinValidite(null);
                setProfileActive(true);

                if (onSave) {
                    onSave({
                        personnel,
                        profiles: selectedProfiles,
                        apiResponse: response.data
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de l\'affectation des profils:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de l\'affectation des profils.';

            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les profils sélectionnés et la date de validité.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 403) {
                    errorMessage = 'Accès refusé. Vous n\'avez pas les droits pour affecter des profils.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Personnel ou profil non trouvé. Actualisez la page et réessayez.';
                } else if (error.response.status === 422) {
                    errorMessage = 'Données de validation incorrectes. Vérifiez tous les champs.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
                } else {
                    errorMessage = `Erreur serveur: ${error.response.status} - ${error.response.data?.message || 'Erreur inconnue'}`;
                }
            } else if (error.request) {
                errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
            } else if (error.code === 'ECONNABORTED') {
                errorMessage = 'La requête a expiré. Le serveur met trop de temps à répondre.';
            }

            await Swal.fire({
                icon: 'error',
                title: 'Erreur d\'affectation',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
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
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
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


                </Panel>

                {/* Classes enseignées */}
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
                    {/* Barre de recherche */}
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
                                        <Col xs={4} key={`${classe.idPerson}-${classe.idAnn}-${index}`} className='mb-3'>
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
                                        layout={['total', '|', 'pager']}
                                        total={filteredClasses.length}
                                        limit={itemsPerPage}
                                        activePage={currentPage}
                                        onChangePage={setCurrentPage}
                                    />
                                </div>
                            )}
                        </>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FiBookOpen size={48} style={{ color: '#dee2e6', marginBottom: '16px' }} />
                            <Text muted>
                                {searchTerm
                                    ? 'Aucune classe trouvée pour cette recherche'
                                    : 'Aucune classe assignée'}
                            </Text>
                        </div>
                    )}
                </Panel>
            </div>
        );
    };

    // Rendu pour l'action "modifier" (affectation de profils)
    const renderEditContent = () => {
        if (!personnel) return null;

        return (
            <div style={{ padding: '0 4px' }}>
                {/* Configuration de l'accès */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            <FiClock style={{ marginRight: '8px' }} />
                            Configuration de l'accès
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
                        <Row gutter={16} className='mt-3'>
                            <Col xs={16}>
                                <Text style={{
                                    color: '#374151',
                                    fontWeight: '500',
                                    marginBottom: '8px',
                                    display: 'block'
                                }}>
                                    Date de fin de validité <span style={{ color: '#ef4444' }}>*</span>
                                </Text>
                                <DatePicker
                                    format="dd/MM/yyyy"
                                    placeholder="Sélectionner une date"
                                    value={dateFinValidite}
                                    onChange={setDateFinValidite}
                                    disabled={isSubmitting}
                                    style={{ width: '100%' }}
                                    cleanable={false}
                                    ranges={[
                                        {
                                            label: 'Dans 1 an',
                                            value: () => {
                                                const date = new Date();
                                                date.setFullYear(date.getFullYear() + 1);
                                                return date;
                                            }
                                        },
                                        {
                                            label: 'Dans 6 mois',
                                            value: () => {
                                                const date = new Date();
                                                date.setMonth(date.getMonth() + 6);
                                                return date;
                                            }
                                        }
                                    ]}
                                />
                            </Col>
                            <Col xs={8}>
                                <Text style={{
                                    color: '#374151',
                                    fontWeight: '500',
                                    marginBottom: '8px',
                                    display: 'block'
                                }}>
                                    Statut
                                </Text>
                                <div style={{ paddingTop: '8px' }}>
                                    <Checkbox
                                        checked={profileActive}
                                        onChange={(value, checked) => setProfileActive(checked)}
                                        disabled={isSubmitting}
                                    >
                                        <Text weight="medium">Profil actif</Text>
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
                                <FiShield style={{ marginRight: '8px' }} />
                                Profils disponibles <span style={{ color: '#ef4444' }}>*</span>
                            </Text>
                            <Badge style={{
                                background: selectedProfiles.length > 0 ? '#10b981' : '#f1f5f9',
                                color: selectedProfiles.length > 0 ? 'white' : '#475569',
                                fontWeight: '500'
                            }}>
                                {selectedProfiles.length} sélectionné{selectedProfiles.length > 1 ? 's' : ''}
                            </Badge>
                        </div>
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
                    {/* Barre de recherche pour profils */}
                    <div style={{ marginBottom: '20px', marginTop: '20px'}}>
                        <InputGroup inside style={{ width: '100%' }}>
                            <Input
                                placeholder="Rechercher un profil..."
                                value={profileSearchTerm}
                                onChange={setProfileSearchTerm}
                                disabled={isSubmitting}
                            />
                            <InputGroup.Addon>
                                <FiSearch />
                            </InputGroup.Addon>
                        </InputGroup>
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Placeholder.Paragraph rows={4} active />
                        </div>
                    ) : filteredProfiles.length > 0 ? (
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                            <Grid fluid>
                                <Row gutter={12}>
                                    {filteredProfiles.map((profile) => {
                                        const isSelected = selectedProfiles.some(p => p.profilid === profile.profilid);
                                        return (
                                            <Col xs={8} key={profile.profilid}>
                                                <div
                                                    onClick={() => !isSubmitting && handleProfileSelection(profile, !isSelected)}
                                                    style={{
                                                        background: isSelected ? '#f0f8ff' : '#ffffff',
                                                        border: `1px solid ${isSelected ? '#3b82f6' : '#f1f5f9'}`,
                                                        borderRadius: '12px',
                                                        padding: '16px',
                                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        marginBottom: '12px',
                                                        opacity: isSubmitting ? 0.6 : 1,
                                                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isSubmitting) {
                                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isSubmitting) {
                                                            e.currentTarget.style.transform = 'translateY(0)';
                                                            e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05)';
                                                        }
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px'}}>
                                                            <Checkbox
                                                                checked={isSelected}
                                                                onChange={(value, checked) => handleProfileSelection(profile, checked)}
                                                                disabled={isSubmitting}
                                                            />
                                                            <div>
                                                                <Text style={{
                                                                    fontSize: '14px',
                                                                    fontWeight: '600',
                                                                    color: '#1e293b'
                                                                }}>
                                                                    {profile.profil_libelle}
                                                                </Text>
                                                                {/* <Text size="sm" style={{
                                                                    color: '#64748b',
                                                                    marginTop: '2px',
                                                                    display: 'block'
                                                                }}>
                                                                    Code: {profile.profilcode}
                                                                </Text> */}
                                                            </div>
                                                        </div>

                                                        {isSelected && (
                                                            <Badge style={{
                                                                background: '#10b981',
                                                                color: 'white',
                                                                fontSize: '11px'
                                                            }}>
                                                                <FiCheck style={{ marginRight: '4px' }} />
                                                                Sélectionné
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </Col>
                                        );
                                    })}
                                </Row>
                            </Grid>
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <FiShield size={48} style={{ color: '#dee2e6', marginBottom: '16px' }} />
                            <Text muted>
                                {profileSearchTerm ? 'Aucun profil trouvé pour cette recherche' : 'Aucun profil disponible'}
                            </Text>
                        </div>
                    )}
                </Panel>

                {/* Résumé de la sélection */}
                {selectedProfiles.length > 0 && (
                    <Panel
                        header={
                            <Text size="md" weight="semibold" style={{ color: '#10b981' }}>
                                <FiCheck style={{ marginRight: '8px' }} />
                                Profils sélectionnés ({selectedProfiles.length})
                            </Text>
                        }
                        style={{
                            background: '#f0fdf4',
                            borderRadius: '12px',
                            border: '1px solid #bbf7d0',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                        }}
                        bodyStyle={{ padding: '20px' }}
                    >
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            {selectedProfiles.map((profile) => (
                                <Tag
                                    key={profile.profilid}
                                    color="green"
                                    closable={!isSubmitting}
                                    onClose={() => !isSubmitting && handleProfileSelection(profile, false)}
                                    style={{
                                        margin: '2px',
                                        fontSize: '12px',
                                        fontWeight: '500'
                                    }}
                                >
                                    {profile.profil_libelle}
                                </Tag>
                            ))}
                        </div>
                    </Panel>
                )}
            </div>
        );
    };

    // Rendu pour l'action "supprimer"
    const renderDeleteContent = () => {
        if (!personnel) return null;

        return (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{
                    fontSize: '64px',
                    marginBottom: '24px',
                    background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                }}>
                    ⚠️
                </div>
                <Text size="xl" weight="bold" style={{
                    marginBottom: '16px',
                    color: '#1e293b'
                }}>
                    Confirmer la suppression
                </Text>
                <Text style={{
                    marginBottom: '24px',
                    lineHeight: '1.6',
                    color: '#64748b'
                }}>
                    Êtes-vous sûr de vouloir supprimer le personnel <strong style={{ color: '#1e293b' }}>{personnel.nomComplet}</strong> ?
                </Text>

                <div style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    padding: '20px',
                    textAlign: 'left',
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
                padding: '32px 24px',
                background: '#fafafa'
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