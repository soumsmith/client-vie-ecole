import React, { useState, useCallback, useEffect } from "react";
import {
    Panel,
    SelectPicker,
    Button,
    Loader,
    Badge,
    Row,
    Col,
    Card,
    Text,
    DatePicker,
    Table,
    Pagination,
    Message,
    toaster
} from 'rsuite';
import { FiBook, FiUsers, FiPhone, FiFileText, FiCalendar, FiSearch, FiRefreshCw } from 'react-icons/fi';
import "bootstrap/dist/css/bootstrap.min.css";
import { useAllApiUrls } from '../utils/apiConfig';
import axios from 'axios';
import {
    useClassesData,
    usePeriodesData,
    useMatieresEcoleData,
} from "../utils/CommonDataService";



// Hook pour récupérer les statistiques
const useStatistiquesSeances = (anneeId, ecoleId) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchStatistiques = useCallback(async () => {
        if (!anneeId || !ecoleId) return;

        try {
            setLoading(true);
            setError(null);

            // Simulation de l'API - remplacez par votre URL réelle
            const response = await axios.get(apiUrls.seances.getStatSceanceEcole());


            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();
            setData(result);
        } catch (err) {
            setError(err.message);
            // Données de démonstration en cas d'erreur
            setData({
                ecoleId: ecoleId,
                ecoleLibelle: "COLLEGE PRIVE BKB",
                searchLevel: "ECOLE",
                totalAppelGeneral: 468,
                totalAppelGeneralEffectue: 2,
                totalAppelJour: 0,
                totalAppelJourEffectue: 0,
                totalCTGeneral: 468,
                totalCTGeneralEffectue: 4,
                totalCTJour: 0,
                totalCTJourEffectue: 0,
                totalGeneral: 311,
                totalJour: 0
            });
        } finally {
            setLoading(false);
        }
    }, [anneeId, ecoleId]);

    useEffect(() => {
        fetchStatistiques();
    }, [fetchStatistiques]);

    return { data, loading, error, refetch: fetchStatistiques };
};

// Hook pour récupérer les séances
const useSeancesData = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0
    });

    const fetchSeances = useCallback(async (dateDebut, dateFin, page = 0, rows = 10, classeId = null, matiereId = null) => {
        try {
            setLoading(true);
            setError(null);

            // Format des dates pour l'API
            const dateDebutStr = dateDebut ? dateDebut.toLocaleDateString('fr-FR').split('/').join('-') : new Date().toLocaleDateString('fr-FR').split('/').join('-');
            const dateFinStr = dateFin ? dateFin.toLocaleDateString('fr-FR').split('/').join('-') : new Date().toLocaleDateString('fr-FR').split('/').join('-');
            //const response = await fetch(url);
            const response = await axios.get(
                apiUrls.seances.getSceanceEcoleByDate(
                    dateDebutStr,
                    dateFinStr,
                    page,
                    rows,
                    classeId,
                    matiereId
                )
            );

            if (!response.ok) throw new Error('Erreur lors du chargement');

            const result = await response.json();

            // Données de démonstration si l'API ne répond pas
            const demoData = [
                {
                    id: 1,
                    date: '2025-08-14',
                    heure: '08:00-09:00',
                    classe: { libelle: '6ème A' },
                    matiere: { libelle: 'Mathématiques' },
                    ct: 'Fait',
                    an: 'Fait'
                },
                {
                    id: 2,
                    date: '2025-08-14',
                    heure: '09:00-10:00',
                    classe: { libelle: '5ème B' },
                    matiere: { libelle: 'Français' },
                    ct: 'À faire',
                    an: 'Fait'
                }
            ];

            setData(Array.isArray(result) ? result : demoData);
            setPagination(prev => ({
                ...prev,
                total: Array.isArray(result) ? result.length : demoData.length
            }));

        } catch (err) {
            setError(err.message);
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    return { data, loading, error, pagination, fetchSeances };
};

const EcranSeances = () => {
    // États pour les filtres
    const [filtres, setFiltres] = useState({
        classe: null,
        matiere: null,
        dateDebut: new Date(),
        dateFin: new Date()
    });

    // Hooks pour les données
    const { data: statistiques, loading: statsLoading, refetch: refetchStats } = useStatistiquesSeances();
    const { data: seances, loading: seancesLoading, fetchSeances, pagination } = useSeancesData();

    // Données de démonstration pour les options

    const {
        classes,
        loading: classesLoading,
        error: classesError,
    } = useClassesData();

    const { matieres, matieresLoading, matieresError, refetch } = useMatieresEcoleData();

    // Gestionnaires d'événements
    const handleFiltreChange = useCallback((key, value) => {
        setFiltres(prev => ({
            ...prev,
            [key]: value
        }));
    }, []);

    const handleRechercher = useCallback(() => {
        fetchSeances(filtres.dateDebut, filtres.dateFin, 0, 10, filtres.classe, filtres.matiere);
    }, [filtres, fetchSeances]);

    const handleReinitialiser = useCallback(() => {
        setFiltres({
            classe: null,
            matiere: null,
            dateDebut: new Date(),
            dateFin: new Date()
        });
        fetchSeances(new Date(), new Date(), 0, 10);
    }, [fetchSeances]);

    // Charger les données initiales
    useEffect(() => {
        handleRechercher();
    }, []);

    // Styles
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

    const statCardStyle = {
        padding: '24px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        marginBottom: '20px',
        boxShadow: '0 4px 20px rgba(102, 126, 234, 0.25)'
    };

    const labelStyle = {
        display: 'block',
        marginBottom: '8px',
        fontWeight: '400',
        color: '#495057',
        fontSize: '14px'
    };

    // Configuration des colonnes du tableau
    const columns = [
        {
            title: 'Date',
            dataKey: 'date',
            width: 120,
            cell: (data) => (
                <span style={{ fontSize: '13px', color: '#495057' }}>
                    {new Date(data.date).toLocaleDateString('fr-FR')}
                </span>
            )
        },
        {
            title: 'Heure',
            dataKey: 'heure',
            width: 120,
            cell: (data) => (
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#2c3e50' }}>
                    {data.heure}
                </span>
            )
        },
        {
            title: 'Classe',
            dataKey: 'classe',
            width: 150,
            cell: (data) => (
                <Badge
                    style={{
                        backgroundColor: '#e3f2fd',
                        color: '#1976d2',
                        border: 'none'
                    }}
                >
                    {data.classe?.libelle}
                </Badge>
            )
        },
        {
            title: 'Matière',
            dataKey: 'matiere',
            width: 200,
            cell: (data) => (
                <span style={{ fontSize: '13px', color: '#495057' }}>
                    {data.matiere?.libelle}
                </span>
            )
        },
        {
            title: 'CT',
            dataKey: 'ct',
            width: 100,
            align: 'center',
            cell: (data) => (
                <Badge
                    style={{
                        backgroundColor: data.ct === 'Fait' ? '#e8f5e8' : '#fff3cd',
                        color: data.ct === 'Fait' ? '#2e7d32' : '#856404',
                        border: 'none'
                    }}
                >
                    {data.ct}
                </Badge>
            )
        },
        {
            title: 'AN',
            dataKey: 'an',
            width: 100,
            align: 'center',
            cell: (data) => (
                <Badge
                    style={{
                        backgroundColor: data.an === 'Fait' ? '#e8f5e8' : '#fff3cd',
                        color: data.an === 'Fait' ? '#2e7d32' : '#856404',
                        border: 'none'
                    }}
                >
                    {data.an}
                </Badge>
            )
        },
        {
            title: 'Action',
            dataKey: 'action',
            width: 100,
            align: 'center',
            cell: () => (
                <Button size="sm" appearance="primary" style={{ fontSize: '11px' }}>
                    Détails
                </Button>
            )
        }
    ];

    return (
        <div style={{
            padding: '32px',
            backgroundColor: '#fafbfc',
            minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
        }}>
            <div style={{ maxWidth: '1400px', margin: '0 auto' }}>

                {/* En-tête */}
                <div style={{ marginBottom: '32px', textAlign: 'left' }}>
                    <h2 style={{
                        margin: '0 0 8px 0',
                        color: '#2c3e50',
                        fontWeight: '600',
                        fontSize: '28px',
                        letterSpacing: '-0.5px'
                    }}>
                        Gestion des Séances
                    </h2>
                    <Text style={{
                        fontSize: '16px',
                        color: '#6c757d',
                        lineHeight: '1.5'
                    }}>
                        Suivi et gestion des séances d'enseignement
                    </Text>
                </div>

                {/* Cartes de statistiques */}
                {statsLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px' }}>
                        <Loader size="lg" />
                    </div>
                ) : (
                    <>
                        <Row gutter={24} style={{ marginBottom: '24px' }}>
                            <Col xs={24} sm={12} lg={6}>
                                <div style={{
                                    ...statCardStyle,
                                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <FiBook size={32} />
                                        <div>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                                                Séances
                                            </Text>
                                            <div style={{ fontSize: '24px', fontWeight: '600' }}>
                                                {statistiques?.totalGeneral || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                                Total Général
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                                Du jour: {statistiques?.totalJour || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} lg={6}>
                                <div style={{
                                    ...statCardStyle,
                                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <FiPhone size={32} />
                                        <div>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                                                Appels numériques
                                            </Text>
                                            <div style={{ fontSize: '24px', fontWeight: '600' }}>
                                                {statistiques?.totalAppelGeneral || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                                Total Général
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                                Effectués: {statistiques?.totalAppelGeneralEffectue || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} lg={6}>
                                <div style={{
                                    ...statCardStyle,
                                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <FiFileText size={32} />
                                        <div>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                                                Cahier de texte
                                            </Text>
                                            <div style={{ fontSize: '24px', fontWeight: '600' }}>
                                                {statistiques?.totalCTGeneral || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.9 }}>
                                                Total Général
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                                Renseignés: {statistiques?.totalCTGeneralEffectue || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>

                            <Col xs={24} sm={12} lg={6}>
                                <div style={{
                                    ...statCardStyle,
                                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                        <FiCalendar size={32} />
                                        <div>
                                            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px' }}>
                                                Journalier
                                            </Text>
                                            <div style={{ fontSize: '16px', fontWeight: '600' }}>
                                                Appels: {statistiques?.totalAppelJour || 0}
                                            </div>
                                            <div style={{ fontSize: '14px', opacity: 0.9 }}>
                                                CT: {statistiques?.totalCTJour || 0}
                                            </div>
                                            <div style={{ fontSize: '12px', opacity: 0.8 }}>
                                                Effectués: {statistiques?.totalAppelJourEffectue || 0} / {statistiques?.totalCTJourEffectue || 0}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        {/* Indicateurs de performance */}
                        <Row gutter={24} style={{ marginBottom: '32px' }}>
                            <Col xs={24} sm={8}>
                                <div style={{
                                    padding: '16px 20px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef',
                                    textAlign: 'center'
                                }}>
                                    <Text style={{ fontSize: '12px', color: '#6c757d' }}>Taux d'appels effectués</Text>
                                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
                                        {statistiques?.totalAppelGeneral ?
                                            ((statistiques.totalAppelGeneralEffectue / statistiques.totalAppelGeneral) * 100).toFixed(1) : 0
                                        }%
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div style={{
                                    padding: '16px 20px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef',
                                    textAlign: 'center'
                                }}>
                                    <Text style={{ fontSize: '12px', color: '#6c757d' }}>Taux de CT renseignés</Text>
                                    <div style={{ fontSize: '20px', fontWeight: '600', color: '#2c3e50' }}>
                                        {statistiques?.totalCTGeneral ?
                                            ((statistiques.totalCTGeneralEffectue / statistiques.totalCTGeneral) * 100).toFixed(1) : 0
                                        }%
                                    </div>
                                </div>
                            </Col>
                            <Col xs={24} sm={8}>
                                <div style={{
                                    padding: '16px 20px',
                                    backgroundColor: '#ffffff',
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef',
                                    textAlign: 'center'
                                }}>
                                    <Text style={{ fontSize: '12px', color: '#6c757d' }}>École</Text>
                                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#2c3e50' }}>
                                        {statistiques?.ecoleLibelle || 'Non définie'}
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </>
                )}

                {/* Filtres */}
                <Card style={cardStyle}>
                    <div style={cardHeaderStyle}>
                        <FiSearch size={18} color="#495057" />
                        <span>Filtres de recherche</span>
                    </div>
                    <div style={cardBodyStyle}>
                        <Row gutter={24}>
                            <Col xs={24} sm={5}>
                                <label style={labelStyle}>Classes</label>
                                <SelectPicker
                                    data={classes}
                                    value={filtres.classe}
                                    onChange={(value) => handleFiltreChange('classe', value)}
                                    placeholder="Sélectionner la classe"
                                    style={{ width: '100%' }}
                                    searchable
                                    cleanable
                                    size="md"
                                />
                            </Col>
                            <Col xs={24} sm={5}>
                                <label style={labelStyle}>Matière</label>
                                <SelectPicker
                                    data={matieres}
                                    value={filtres.matiere}
                                    onChange={(value) => handleFiltreChange('matiere', value)}
                                    placeholder="Sélectionner la matière"
                                    style={{ width: '100%' }}
                                    searchable
                                    cleanable
                                    size="md"
                                />
                            </Col>
                            <Col xs={24} sm={4}>
                                <label style={labelStyle}>Date de début</label>
                                <DatePicker
                                    value={filtres.dateDebut}
                                    onChange={(value) => handleFiltreChange('dateDebut', value)}
                                    style={{ width: '100%' }}
                                    size="md"
                                    format="dd/MM/yyyy"
                                    placeholder="Date début"
                                />
                            </Col>
                            <Col xs={24} sm={4}>
                                <label style={labelStyle}>Date de fin</label>
                                <DatePicker
                                    value={filtres.dateFin}
                                    onChange={(value) => handleFiltreChange('dateFin', value)}
                                    style={{ width: '100%' }}
                                    size="md"
                                    format="dd/MM/yyyy"
                                    placeholder="Date fin"
                                />
                            </Col>
                            <Col xs={24} sm={6}>
                                <div style={{
                                    display: 'flex',
                                    gap: '12px',
                                    alignItems: 'end',
                                    height: '100%',
                                    paddingTop: '24px'
                                }}>
                                    <Button
                                        appearance="primary"
                                        onClick={handleRechercher}
                                        loading={seancesLoading}
                                        style={{ flex: 1 }}
                                        size="md"
                                    >
                                        <FiSearch style={{ marginRight: '8px' }} />
                                        Rechercher
                                    </Button>
                                    <Button
                                        onClick={handleReinitialiser}
                                        style={{ flex: 1 }}
                                        size="md"
                                    >
                                        <FiRefreshCw style={{ marginRight: '8px' }} />
                                        Réinitialiser
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </div>
                </Card>

                {/* Tableau des séances */}
                <Card style={{ ...cardStyle, marginBottom: 0 }}>
                    <div style={cardHeaderStyle}>
                        <FiCalendar size={18} color="#495057" />
                        <span>Liste des séances</span>
                        <Badge
                            style={{
                                fontSize: '11px',
                                marginLeft: 'auto',
                                backgroundColor: '#e8f5e8',
                                color: '#2e7d32',
                                border: 'none'
                            }}
                        >
                            {seances.length} séance(s)
                        </Badge>
                    </div>
                    <div style={cardBodyStyle}>
                        {seancesLoading ? (
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
                                    Chargement des séances...
                                </Text>
                            </div>
                        ) : seances.length === 0 ? (
                            <div style={{
                                textAlign: 'center',
                                padding: '60px 20px',
                                backgroundColor: '#fafbfc',
                                borderRadius: '8px'
                            }}>
                                <Text style={{
                                    fontSize: '16px',
                                    color: '#6c757d'
                                }}>
                                    Aucune donnée trouvée
                                </Text>
                            </div>
                        ) : (
                            <>
                                <Table
                                    data={seances}
                                    columns={columns}
                                    height={400}
                                    style={{
                                        backgroundColor: '#ffffff',
                                        border: '1px solid #f0f0f0',
                                        borderRadius: '8px'
                                    }}
                                    headerHeight={50}
                                    rowHeight={60}
                                />

                                <div style={{
                                    marginTop: '20px',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <Pagination
                                        prev={pagination.page > 1}
                                        next={pagination.page < Math.ceil(pagination.total / pagination.limit)}
                                        first
                                        last
                                        ellipsis
                                        boundaryLinks
                                        maxButtons={5}
                                        size="md"
                                        layout={['total', '-', 'limit', '|', 'pager', 'skip']}
                                        total={pagination.total}
                                        limitOptions={[10, 20, 50]}
                                        limit={pagination.limit}
                                        activePage={pagination.page}
                                        onChangePage={(page) => {
                                            fetchSeances(filtres.date, page - 1, pagination.limit, filtres.classe, filtres.matiere);
                                        }}
                                        onChangeLimit={(limit) => {
                                            fetchSeances(filtres.date, 0, limit, filtres.classe, filtres.matiere);
                                        }}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default EcranSeances;