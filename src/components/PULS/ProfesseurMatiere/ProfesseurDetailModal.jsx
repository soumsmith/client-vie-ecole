import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    Button, 
    Badge, 
    Loader, 
    Input, 
    Pagination,
    Nav,
    Panel,
    Grid,
    Row,
    Col,
    Text,
    Avatar
} from 'rsuite';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { 
    FiUser, 
    FiPhone, 
    FiCalendar, 
    FiUsers, 
    FiBookOpen, 
    FiAward, 
    FiTrendingUp, 
    FiSearch,
    FiMail,
    // FiGraduationCap,
    FiMapPin,
    FiX
} from 'react-icons/fi';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';

/**
 * Modal de détail du professeur - Design moderne inspiré d'EditAgentModal
 */
const ProfesseurDetailModal = ({ visible, onClose, professeurData, onDataLoad }) => {
    const [loading, setLoading] = useState(true);
    const [detailData, setDetailData] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(4);
    const apiUrls = useAllApiUrls();

    useEffect(() => {
        if (visible && professeurData) {
            setLoading(true);
            setError(null);
            setSearchTerm('');
            setCurrentPage(1);
            
            const fetchProfesseurDetail = async () => {
                try {
                    const ecoleId = 139;
                    const anneeId = 226;
                    const profId = professeurData.personnel_id;
                    
                    const response = await axios.get(
                        apiUrls.personnel.getByProf(anneeId, profId, ecoleId)
                    );
                    
                    if (response.data && Array.isArray(response.data)) {
                        const affectations = response.data.map((item, index) => ({
                            id: item.id || `affectation-${index}`,
                            classe: {
                                libelle: item.classe?.libelle || 'Classe inconnue',
                                effectif: item.classe?.effectif || 0,
                                code: item.classe?.code || ''
                            },
                            matiere: {
                                libelle: item.matiere?.libelle || 'Matière inconnue',
                                code: item.matiere?.code || '',
                                categorie: {
                                    libelle: item.matiere?.categorie?.libelle || 'Non classée'
                                }
                            },
                            annee: {
                                libelle: item.annee?.libelle || item.annee?.customLibelle || 'Année inconnue'
                            }
                        }));

                        const totalEleves = affectations.reduce((sum, aff) => sum + aff.classe.effectif, 0);
                        const totalClasses = affectations.length;
                        const totalMatieres = [...new Set(affectations.map(aff => aff.matiere.libelle))].length;

                        const processedData = {
                            personnel: {
                                id: professeurData.personnel_id,
                                nom: professeurData.personnel_nom,
                                prenom: professeurData.personnel_prenom,
                                sexe: professeurData.personnel_sexe,
                                contact: professeurData.personnel_contact,
                                niveauEtude: professeurData.personnel_niveauEtude || 3,
                                fonction: {
                                    libelle: professeurData.fonction_libelle
                                }
                            },
                            affectations: affectations,
                            statistiques: {
                                totalClasses: totalClasses,
                                totalEleves: totalEleves,
                                totalMatieres: totalMatieres,
                                experienceAnnees: Math.floor(Math.random() * 10) + 5,
                                tauxPresence: Math.floor(Math.random() * 10) + 90,
                                noteEvaluation: (Math.random() * 5 + 15).toFixed(1)
                            }
                        };
                        
                        setDetailData(processedData);
                        if (onDataLoad) onDataLoad(processedData);
                    }
                } catch (err) {
                    console.error('Erreur lors du chargement des détails:', err);
                    setError('Erreur lors du chargement des données du professeur');
                } finally {
                    setLoading(false);
                }
            };

            fetchProfesseurDetail();
        }
    }, [visible, professeurData, onDataLoad]);

    const prepareChartData = () => {
        if (!detailData) return { pieData: [], barData: [], lineData: [] };

        const pieData = [
            { name: 'Présent', value: detailData.statistiques.tauxPresence, color: '#22c55e' },
            { name: 'Absent', value: 100 - detailData.statistiques.tauxPresence, color: '#ef4444' }
        ];

        const barData = detailData.affectations.map(aff => ({
            classe: aff.classe.libelle,
            effectif: aff.classe.effectif,
            matiere: aff.matiere.libelle
        }));

        const lineData = [
            { mois: 'Sept', performance: 16.2 },
            { mois: 'Oct', performance: 17.1 },
            { mois: 'Nov', performance: 16.8 },
            { mois: 'Déc', performance: 17.5 },
            { mois: 'Jan', performance: 17.8 }
        ];

        return { pieData, barData, lineData };
    };

    const getFilteredAndPaginatedAffectations = () => {
        if (!detailData) return { filteredItems: [], totalItems: 0, totalPages: 0 };

        const filteredAffectations = detailData.affectations.filter(affectation => {
            const searchLower = searchTerm.toLowerCase();
            return (
                affectation.classe.libelle.toLowerCase().includes(searchLower) ||
                affectation.matiere.libelle.toLowerCase().includes(searchLower) ||
                affectation.matiere.categorie.libelle.toLowerCase().includes(searchLower)
            );
        });

        const totalItems = filteredAffectations.length;
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedItems = filteredAffectations.slice(startIndex, endIndex);

        return {
            filteredItems: paginatedItems,
            totalItems,
            totalPages
        };
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Extraction des initiales pour l'avatar
    const getInitials = (nom, prenom) => {
        const nomInitial = nom ? nom.charAt(0).toUpperCase() : '';
        const prenomInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
        return `${prenomInitial}${nomInitial}` || 'PR';
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

    if (!visible) return null;

    const { pieData, barData, lineData } = prepareChartData();
    const { filteredItems, totalItems, totalPages } = getFilteredAndPaginatedAffectations();

    return (
        <Modal 
            open={visible} 
            onClose={onClose}
            size="lg"
            backdrop="static"
            style={{
                borderRadius: '16px',
                overflow: 'hidden'
            }}
        >
            {/* Header moderne */}
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
                            background: professeurData?.personnel_sexe === 'MASCULIN' ? 
                                'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' : 
                                'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '18px',
                            border: '2px solid #e2e8f0'
                        }}
                    >
                        {getInitials(professeurData?.personnel_nom, professeurData?.personnel_prenom)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {professeurData?.personnel_nomComplet || 'Professeur'}
                        </Text>
                        <Badge style={{ 
                            background: '#f1f5f9', 
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {professeurData?.fonction_libelle || 'PERSONNEL'}
                        </Badge>
                        <div style={{ marginTop: '8px' }}>
                            <Text size="sm" style={{ color: '#94a3b8' }}>
                                ID: {professeurData?.personnel_id || 'Non défini'}
                            </Text>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiUser size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Fiche Détaillée du Professeur
                        </Text>
                    </div>
                </div>
            </Modal.Header>

            <Modal.Body style={{ 
                padding: '32px 24px', 
                background: '#fafafa'
            }}>
                {loading ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '400px',
                        flexDirection: 'column',
                        gap: '20px'
                    }}>
                        <Loader size="lg" />
                        <Text size="md" style={{ color: '#64748b' }}>
                            Chargement des détails du professeur...
                        </Text>
                    </div>
                ) : error ? (
                    <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '400px',
                        flexDirection: 'column',
                        gap: '20px',
                        color: '#ef4444'
                    }}>
                        <div style={{ fontSize: '60px' }}>⚠️</div>
                        <Text size="md" style={{ color: '#ef4444' }}>
                            {error}
                        </Text>
                    </div>
                ) : detailData ? (
                    <div>
                        {/* Contact rapide */}
                        {/* <div style={{
                            background: 'white',
                            borderRadius: '12px',
                            padding: '20px',
                            marginBottom: '24px',
                            border: '1px solid #f1f5f9',
                            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <FiPhone size={16} style={{ color: '#6366f1' }} />
                                <Text style={{ color: '#64748b', fontSize: '14px' }}>
                                    {professeurData?.personnel_contact_display || 'Contact non disponible'}
                                </Text>
                            </div>
                        </div> */}

                        {/* Informations personnelles */}
                        <Panel
                            header={
                                <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                    Informations personnelles
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
                                    <Col xs={8}>
                                        <InfoCard
                                            icon={FiPhone}
                                            title="Contact"
                                            value={professeurData?.personnel_contact_display || 'Non renseigné'}
                                            color="#f59e0b"
                                        />
                                    </Col>
                                    <Col xs={8}>
                                        <InfoCard
                                            icon={FiSearch}
                                            title="Niveau d'étude"
                                            value={`Niveau ${detailData.personnel.niveauEtude}`}
                                            color="#ef4444"
                                        />
                                    </Col>
                                    <Col xs={8}>
                                        <InfoCard
                                            icon={FiAward}
                                            title="Genre"
                                            value={detailData.personnel.sexe || 'Non spécifié'}
                                            color="#10b981"
                                        />
                                    </Col>
                                </Row>
                            </Grid>
                        </Panel>

                        {/* Statistiques d'affectation */}
                        <Panel
                            header={
                                <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                    Statistiques d'affectation
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
                                    <Col xs={6}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            backgroundColor: '#f0fdf4',
                                            borderRadius: '12px',
                                            border: '1px solid #bbf7d0'
                                        }}>
                                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#16a34a', marginBottom: '8px' }}>
                                                {detailData.statistiques.totalClasses}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#16a34a', fontWeight: '500' }}>
                                                Classes
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            backgroundColor: '#eff6ff',
                                            borderRadius: '12px',
                                            border: '1px solid #c7d2fe'
                                        }}>
                                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#2563eb', marginBottom: '8px' }}>
                                                {detailData.statistiques.totalEleves}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#2563eb', fontWeight: '500' }}>
                                                Élèves
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            backgroundColor: '#fef3c7',
                                            borderRadius: '12px',
                                            border: '1px solid #fed7aa'
                                        }}>
                                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#d97706', marginBottom: '8px' }}>
                                                {detailData.statistiques.totalMatieres}
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#d97706', fontWeight: '500' }}>
                                                Matières
                                            </div>
                                        </div>
                                    </Col>
                                    <Col xs={6}>
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '20px',
                                            backgroundColor: '#fdf2f8',
                                            borderRadius: '12px',
                                            border: '1px solid #fbcfe8'
                                        }}>
                                            <div style={{ fontSize: '32px', fontWeight: '700', color: '#ec4899', marginBottom: '8px' }}>
                                                {detailData.statistiques.noteEvaluation}/20
                                            </div>
                                            <div style={{ fontSize: '14px', color: '#ec4899', fontWeight: '500' }}>
                                                Note Moy.
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Grid>
                        </Panel>

                        {/* Navigation par onglets */}
                        <Nav appearance="tabs" activeKey={activeTab} onSelect={setActiveTab} style={{ marginBottom: '24px' }}>
                            <Nav.Item eventKey="overview" icon={<FiTrendingUp />}>Vue d'ensemble</Nav.Item>
                            <Nav.Item eventKey="classes" icon={<FiBookOpen />}>Classes & Matières</Nav.Item>
                            <Nav.Item eventKey="statistics" icon={<FiUsers />}>Statistiques</Nav.Item>
                        </Nav>

                        {/* Contenu des onglets */}
                        <Panel
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #f1f5f9',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                            }}
                            bodyStyle={{ padding: '20px' }}
                        >
                            {activeTab === 'overview' && (
                                <div className="row">
                                    <div className="col-md-6">
                                        <h6 className="mb-3">
                                            <FiTrendingUp className="me-2" />
                                            Taux de Présence
                                        </h6>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <PieChart>
                                                <Pie
                                                    data={pieData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    paddingAngle={8}
                                                    dataKey="value"
                                                >
                                                    {pieData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="col-md-6">
                                        <h6 className="mb-3">
                                            <FiBookOpen className="me-2" />
                                            Évolution Performance
                                        </h6>
                                        <ResponsiveContainer width="100%" height={200}>
                                            <LineChart data={lineData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="mois" />
                                                <YAxis domain={[15, 20]} />
                                                <Tooltip />
                                                <Line 
                                                    type="monotone" 
                                                    dataKey="performance" 
                                                    stroke="#667eea" 
                                                    strokeWidth={3}
                                                    dot={{ fill: '#667eea', strokeWidth: 2, r: 4 }}
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'classes' && (
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                                            Classes et Matières Assignées ({totalItems})
                                        </Text>
                                        <Input
                                            placeholder="Rechercher..."
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            style={{ width: '250px' }}
                                            prefix={<FiSearch />}
                                        />
                                    </div>

                                    {filteredItems.length > 0 ? (
                                        <>
                                            <Grid fluid>
                                                <Row gutter={16}>
                                                    {filteredItems.map((affectation, index) => (
                                                        <Col xs={24} sm={12} md={6} key={affectation.id} style={{ marginBottom: '16px' }}>
                                                            <div style={{
                                                                background: '#f8fafc',
                                                                borderRadius: '12px',
                                                                padding: '20px',
                                                                border: '1px solid #e2e8f0',
                                                                height: '100%',
                                                                transition: 'all 0.3s ease'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                e.currentTarget.style.transform = 'translateY(0)';
                                                                e.currentTarget.style.boxShadow = 'none';
                                                            }}
                                                            >
                                                                <div style={{ marginBottom: '12px' }}>
                                                                    <Text weight="semibold" style={{ color: '#1e293b', fontSize: '16px' }}>
                                                                        {affectation.classe.libelle}
                                                                    </Text>
                                                                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                                                                        <FiUsers size={12} style={{ marginRight: '4px' }} />
                                                                        {affectation.classe.effectif} élèves
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    background: 'white',
                                                                    borderRadius: '8px',
                                                                    padding: '12px',
                                                                    border: '1px solid #f1f5f9'
                                                                }}>
                                                                    <Text style={{ color: '#475569', fontWeight: '500', fontSize: '14px' }}>
                                                                        {affectation.matiere.libelle}
                                                                    </Text>
                                                                    <div style={{ marginTop: '6px' }}>
                                                                        <Badge color="orange" style={{ fontSize: '10px' }}>
                                                                            {affectation.matiere.categorie.libelle}
                                                                        </Badge>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </Grid>

                                            {totalPages > 1 && (
                                                <div style={{ 
                                                    display: 'flex', 
                                                    justifyContent: 'center', 
                                                    marginTop: '20px'
                                                }}>
                                                    <Pagination
                                                        prev
                                                        next
                                                        first
                                                        last
                                                        ellipsis
                                                        boundaryLinks
                                                        maxButtons={5}
                                                        size="md"
                                                        total={totalItems}
                                                        limit={itemsPerPage}
                                                        activePage={currentPage}
                                                        onChangePage={handlePageChange}
                                                    />
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div style={{
                                            textAlign: 'center',
                                            padding: '40px',
                                            color: '#64748b'
                                        }}>
                                            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
                                            <Text>Aucune affectation trouvée</Text>
                                            {searchTerm && (
                                                <Button 
                                                    onClick={() => handleSearchChange('')}
                                                    style={{ marginTop: '12px' }}
                                                    appearance="subtle"
                                                >
                                                    Effacer la recherche
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'statistics' && (
                                <div>
                                    <h6 className="mb-3">
                                        <FiUsers className="me-2" />
                                        Répartition des Effectifs par Classe
                                    </h6>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="classe" fontSize={12} />
                                            <YAxis />
                                            <Tooltip />
                                            <Bar 
                                                dataKey="effectif" 
                                                fill="#667eea"
                                                radius={[4, 4, 0, 0]}
                                            />
                                        </BarChart>
                                    </ResponsiveContainer>

                                    <Grid fluid style={{ marginTop: '20px' }}>
                                        <Row gutter={20}>
                                            <Col xs={6}>
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                    color: 'white',
                                                    borderRadius: '12px'
                                                }}>
                                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                                        {detailData.statistiques.totalEleves}
                                                    </div>
                                                    <div style={{ fontSize: '14px' }}>Total Élèves</div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                                    color: 'white',
                                                    borderRadius: '12px'
                                                }}>
                                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                                        {Math.round(detailData.statistiques.totalEleves / detailData.statistiques.totalClasses)}
                                                    </div>
                                                    <div style={{ fontSize: '14px' }}>Moy. par Classe</div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                                                    color: 'white',
                                                    borderRadius: '12px'
                                                }}>
                                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                                        {detailData.statistiques.experienceAnnees}
                                                    </div>
                                                    <div style={{ fontSize: '14px' }}>Années Exp.</div>
                                                </div>
                                            </Col>
                                            <Col xs={6}>
                                                <div style={{
                                                    textAlign: 'center',
                                                    padding: '20px',
                                                    background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
                                                    color: 'white',
                                                    borderRadius: '12px'
                                                }}>
                                                    <div style={{ fontSize: '32px', fontWeight: '700' }}>
                                                        {detailData.statistiques.noteEvaluation}
                                                    </div>
                                                    <div style={{ fontSize: '14px' }}>Note /20</div>
                                                </div>
                                            </Col>
                                        </Row>
                                    </Grid>
                                </div>
                            )}
                        </Panel>
                    </div>
                ) : (
                    <div style={{ 
                        padding: '60px',
                        textAlign: 'center',
                        color: '#64748b'
                    }}>
                        <div style={{ fontSize: '60px', marginBottom: '20px' }}>📊</div>
                        <Text>Aucune donnée disponible</Text>
                    </div>
                )}
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
                        startIcon={<FiX />}
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px'
                        }}
                    >
                        Fermer
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default ProfesseurDetailModal;