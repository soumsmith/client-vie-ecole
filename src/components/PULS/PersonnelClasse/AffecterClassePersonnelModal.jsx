import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, SelectPicker, Button, Message, Loader, Table, Panel, Divider } from 'rsuite';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from '../../hooks/useDynamicParams';
import getFullUrl from "../../hooks/urlUtils";

const { Column, HeaderCell, Cell } = Table;

/**
 * Hook pour récupérer la liste des classes
 */
const useClassesData = () => {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchClasses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.classes.listByEcoleSorted());
            const formattedClasses = (response.data || []).map(classe => ({
                label: `${classe.libelle} - ${classe.branche?.serie?.libelle || 'N/A'}`,
                value: classe.id,
                raw_data: classe
            }));
            setClasses(formattedClasses);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des classes');
        } finally {
            setLoading(false);
        }
    }, [apiUrls.classes]);

    useEffect(() => {
        fetchClasses();
    }, [fetchClasses]);

    return { classes, loading, error, refetch: fetchClasses };
};

/**
 * Hook pour récupérer les professeurs principaux par école et profil
 */
const useProfesseursData = () => {
    const [professeurs, setProfesseurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();
    const apiUrls = useAllApiUrls();

    const fetchProfesseurs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // API pour les professeurs principaux (profil=8)
            const response = await axios.get(apiUrls.personnel.getByEcoleAndProfil(8));
            // const responses = await axios.get(
            //     `${getFullUrl()}personnels/get-by-ecole-and-profil?ecole=${dynamicEcoleId}&profil=8`
            // );

            const formattedProfesseurs = (response.data || []).map(prof => ({
                label: `${prof.nom || ''} ${prof.prenom || ''}`.trim(),
                value: prof.id,
                raw_data: prof,
                // Informations supplémentaires pour l'affichage
                fonction: prof.fonction?.libelle || '',
                contact: prof.contact || '',
                sexe: prof.sexe || '',
                niveauEtude: prof.niveauEtude || 0
            }));

            setProfesseurs(formattedProfesseurs);
        } catch (err) {
            console.error('Erreur lors du chargement des professeurs:', err);
            setError(err.message || 'Erreur lors du chargement des professeurs');
        } finally {
            setLoading(false);
        }
    }, [dynamicEcoleId]);

    useEffect(() => {
        fetchProfesseurs();
    }, [fetchProfesseurs]);

    return { professeurs, loading, error, refetch: fetchProfesseurs };
};

/**
 * Hook pour récupérer les éducateurs par école et profil
 */
const useEducateursData = () => {
    const [educateurs, setEducateurs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { ecoleId: dynamicEcoleId } = usePulsParams();
    const apiUrls = useAllApiUrls();

    const fetchEducateurs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // API pour les éducateurs (profil=9)
            const response = await axios.get(apiUrls.personnel.getByEcoleAndProfil(9));

            const formattedEducateurs = (response.data || []).map(educ => ({
                label: `${educ.nom || ''} ${educ.prenom || ''}`.trim(),
                value: educ.id,
                raw_data: educ,
                // Informations supplémentaires pour l'affichage
                fonction: educ.fonction?.libelle || '',
                contact: educ.contact || '',
                sexe: educ.sexe || '',
                niveauEtude: educ.niveauEtude || 0
            }));

            setEducateurs(formattedEducateurs);
        } catch (err) {
            console.error('Erreur lors du chargement des éducateurs:', err);
            setError(err.message || 'Erreur lors du chargement des éducateurs');
        } finally {
            setLoading(false);
        }
    }, [dynamicEcoleId]);

    useEffect(() => {
        if (dynamicEcoleId) {
            fetchEducateurs();
        }
    }, [fetchEducateurs]);

    return { educateurs, loading, error, refetch: fetchEducateurs };
};

/**
 * Hook pour récupérer les données d'affectation d'une classe (optionnel - pour pré-remplir)
 */
const useClasseAffectationData = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchAffectationData = useCallback(async (classeId) => {
        if (!classeId) {
            setData(null);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(
                apiUrls.affectations.getPpAndEducDtoByClasse(classeId)
            );
            setData(response.data);
        } catch (err) {
            console.error('Erreur lors du chargement des affectations existantes:', err);
            setError(err.message || 'Erreur lors du chargement des données d\'affectation');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [apiUrls.affectations]);

    return { data, loading, error, fetchAffectationData };
};

/**
 * Modal d'affectation d'une classe à un personnel
 */
const AffecterClassePersonnelModal = ({ visible, onClose, onSuccess }) => {
    const [selectedClasse, setSelectedClasse] = useState(null);
    const [selectedProfesseur, setSelectedProfesseur] = useState(null);
    const [selectedEducateur, setSelectedEducateur] = useState(null);
    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    const apiUrls = useAllApiUrls();
    const { ecoleId: dynamicEcoleId, academicYearId: dynamicAcademicYearId } = usePulsParams();

    // Hooks pour récupérer les données
    const { classes, loading: classesLoading } = useClassesData();
    const { professeurs, loading: professeursLoading } = useProfesseursData();
    const { educateurs, loading: educateursLoading } = useEducateursData();
    const { data: affectationData, loading: affectationLoading, fetchAffectationData } = useClasseAffectationData();

    /**
     * Gestion du changement de classe
     */
    const handleClasseChange = useCallback((classeId) => {
        setSelectedClasse(classeId);
        setSelectedProfesseur(null);
        setSelectedEducateur(null);

        if (classeId) {
            fetchAffectationData(classeId);
        }
    }, [fetchAffectationData]);

    /**
     * Sélection automatique des professeurs et éducateurs s'ils existent déjà
     */
    useEffect(() => {
        if (selectedClasse && affectationData && !affectationLoading) {
            // Pré-sélectionner le professeur s'il existe déjà
            if (affectationData.prof && !selectedProfesseur) {
                setSelectedProfesseur(affectationData.prof.id);
            }

            // Pré-sélectionner l'éducateur s'il existe déjà
            if (affectationData.educateur && !selectedEducateur) {
                setSelectedEducateur(affectationData.educateur.id);
            }
        }
    }, [selectedClasse, affectationData, affectationLoading, selectedProfesseur, selectedEducateur]);

    /**
     * Sélection automatique s'il n'y en a qu'un seul disponible
     */
    useEffect(() => {
        if (selectedClasse) {
            // Sélection automatique du professeur principal s'il n'y en a qu'un seul
            if (professeurs.length === 1 && !selectedProfesseur && !professeursLoading) {
                setSelectedProfesseur(professeurs[0].value);
            }

            // Sélection automatique de l'éducateur s'il n'y en a qu'un seul
            if (educateurs.length === 1 && !selectedEducateur && !educateursLoading) {
                setSelectedEducateur(educateurs[0].value);
            }
        }
    }, [selectedClasse, professeurs, educateurs, professeursLoading, educateursLoading, selectedProfesseur, selectedEducateur]);

    /**
     * Soumission du formulaire
     */
    const handleSubmit = async () => {
        if (!selectedClasse) {
            Message.error('Veuillez sélectionner une classe');
            return;
        }

        if (!selectedProfesseur || !selectedEducateur) {
            Message.error('Veuillez sélectionner un professeur principal et un éducateur');
            return;
        }

        try {
            setLoading(true);
            setSubmitError(null);

            // Préparer les données d'affectation
            const affectationData = {
                classeId: selectedClasse,
                professeurId: selectedProfesseur,
                educateurId: selectedEducateur,
                anneeId: dynamicAcademicYearId,
                ecoleId: dynamicEcoleId
            };

            // Appel API pour enregistrer l'affectation
            const response = await axios.post(
                apiUrls.affectations.affecterClassePersonnel(),
                affectationData
            );

            // Succès
            handleReset();
            onSuccess(response.data);
            onClose();

            Message.success('Affectation créée avec succès');

        } catch (error) {
            const errorMessage = error.response?.data?.message ||
                error.message ||
                'Erreur lors de la création de l\'affectation';
            setSubmitError(errorMessage);
            Message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Annulation - fermer le modal
     */
    const handleCancel = () => {
        handleReset();
        onClose();
    };

    /**
     * Réinitialisation du formulaire
     */
    const handleReset = () => {
        setSelectedClasse(null);
        setSelectedProfesseur(null);
        setSelectedEducateur(null);
        setSubmitError(null);
    };

    /**
     * Réinitialisation quand le modal s'ouvre
     */
    useEffect(() => {
        if (visible) {
            handleReset();
        }
    }, [visible]);

    // Préparer les données du tableau des affectations existantes
    const tableData = affectationData ? [{
        classe: affectationData.classe?.libelle || 'N/A',
        professeurPrincipal: affectationData.prof ?
            `${affectationData.prof.nom || ''} ${affectationData.prof.prenom || ''}`.trim() : 'Non assigné',
        educateur: affectationData.educateur ?
            `${affectationData.educateur.nom || ''} ${affectationData.educateur.prenom || ''}`.trim() : 'Non assigné'
    }] : [];

    const isDataLoading = classesLoading || professeursLoading || educateursLoading || affectationLoading;

    // Statistiques pour debug/info
    const statsInfo = {
        totalClasses: classes.length,
        totalProfesseurs: professeurs.length,
        totalEducateurs: educateurs.length,
        selectedClasseInfo: selectedClasse ? classes.find(c => c.value === selectedClasse)?.raw_data : null
    };

    return (
        <Modal open={visible} onClose={handleCancel} size="lg">
            <Modal.Header>
                <Modal.Title>Affecter une classe à un personnel</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Affichage des erreurs */}
                {submitError && (
                    <div style={{
                        marginBottom: 16,
                        padding: 12,
                        backgroundColor: '#fff2f0',
                        border: '1px solid #ffccc7',
                        borderRadius: 6,
                        color: '#a8071a'
                    }}>
                        <strong>Erreur : </strong>{submitError}
                    </div>
                )}

                {/* Statistiques et informations (masquable en production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className='d-none' style={{
                        marginBottom: 16,
                        padding: 8,
                        backgroundColor: '#f6ffed',
                        border: '1px solid #b7eb8f',
                        borderRadius: 4,
                        fontSize: '12px',
                        color: '#52c41a'
                    }}>
                        <strong>Info :</strong> Classes: {statsInfo.totalClasses},
                        Professeurs: {statsInfo.totalProfesseurs},
                        Éducateurs: {statsInfo.totalEducateurs}
                        {statsInfo.selectedClasseInfo && (
                            <span> | Classe sélectionnée: {statsInfo.selectedClasseInfo.libelle}</span>
                        )}
                    </div>
                )}

                {/* Formulaire de sélection */}
                <Form disabled={loading || isDataLoading} fluid>
                    {/* Sélection de la classe */}
                    <Form.Group controlId="classe">
                        <Form.ControlLabel>Classe *</Form.ControlLabel>
                        <SelectPicker
                            data={classes}
                            value={selectedClasse}
                            onChange={handleClasseChange}
                            placeholder="Sélectionner une classe"
                            searchable
                            cleanable={false}
                            loading={classesLoading}
                            style={{ width: '100%' }}
                            size="lg"
                            renderMenuItem={(label, item) => (
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{item.raw_data?.libelle}</div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        {item.raw_data?.branche?.libelle} - Effectif: {item.raw_data?.effectif || 0}
                                    </div>
                                </div>
                            )}
                        />
                        {classes.length === 0 && !classesLoading && (
                            <div style={{ fontSize: '12px', color: '#f5222d', marginTop: 4 }}>
                                Aucune classe disponible
                            </div>
                        )}
                    </Form.Group>

                    {/* Sélection du professeur principal */}
                    <Form.Group controlId="professeur">
                        <Form.ControlLabel>Professeur Principal *</Form.ControlLabel>
                        <SelectPicker
                            data={professeurs}
                            value={selectedProfesseur}
                            onChange={setSelectedProfesseur}
                            placeholder="Sélectionner un professeur principal"
                            searchable
                            cleanable={false}
                            loading={professeursLoading}
                            disabled={!selectedClasse || professeursLoading}
                            style={{ width: '100%' }}
                            size="lg"
                            renderMenuItem={(label, item) => (
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{label}</div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        {item.fonction} - {item.contact} - Niveau: {item.niveauEtude}
                                    </div>
                                </div>
                            )}
                        />
                        {professeurs.length === 0 && !professeursLoading && (
                            <div style={{ fontSize: '12px', color: '#fa8c16', marginTop: 4 }}>
                                Aucun professeur principal disponible
                            </div>
                        )}
                    </Form.Group>

                    {/* Sélection de l'éducateur */}
                    <Form.Group controlId="educateur">
                        <Form.ControlLabel>Éducateur *</Form.ControlLabel>
                        <SelectPicker
                            data={educateurs}
                            value={selectedEducateur}
                            onChange={setSelectedEducateur}
                            placeholder="Sélectionner un éducateur"
                            searchable
                            cleanable={false}
                            loading={educateursLoading}
                            disabled={!selectedClasse || educateursLoading}
                            style={{ width: '100%' }}
                            size="lg"
                            renderMenuItem={(label, item) => (
                                <div>
                                    <div style={{ fontWeight: 'bold' }}>{label}</div>
                                    <div style={{ fontSize: '12px', color: '#999' }}>
                                        {item.fonction} - {item.contact} - Niveau: {item.niveauEtude}
                                    </div>
                                </div>
                            )}
                        />
                        {educateurs.length === 0 && !educateursLoading && (
                            <div style={{ fontSize: '12px', color: '#fa8c16', marginTop: 4 }}>
                                Aucun éducateur disponible
                            </div>
                        )}
                    </Form.Group>
                </Form>

                {/* Divider */}
                <Divider style={{ margin: '20px 0' }} />

                {/* Section des affectations existantes */}
                <div style={{ marginTop: 20 }}>
                    <h6 style={{
                        margin: '0 0 15px 0',
                        color: '#666',
                        fontSize: '14px',
                        fontWeight: '600'
                    }}>
                        Affectations existantes pour la classe sélectionnée
                    </h6>

                    {/* Indicateur de chargement pour les données d'affectation */}
                    {affectationLoading && (
                        <div style={{ textAlign: 'center', padding: 20 }}>
                            <Loader size="sm" />
                            <div style={{ marginTop: 8, color: '#666', fontSize: '12px' }}>
                                Chargement des affectations...
                            </div>
                        </div>
                    )}

                    {/* Tableau des affectations */}
                    {!affectationLoading && selectedClasse && (
                        <Table
                            data={tableData}
                            autoHeight
                            style={{
                                border: '1px solid #e5e5ea',
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        >
                            <Column width={140} align="center" fixed>
                                <HeaderCell style={{ backgroundColor: '#f7f9fc', fontWeight: '600' }}>
                                    CLASSE
                                </HeaderCell>
                                <Cell dataKey="classe" style={{ fontSize: '13px' }} />
                            </Column>

                            <Column width={200} align="center">
                                <HeaderCell style={{ backgroundColor: '#f7f9fc', fontWeight: '600' }}>
                                    PROFESSEUR PRINCIPAL
                                </HeaderCell>
                                <Cell dataKey="professeurPrincipal" style={{ fontSize: '13px' }} />
                            </Column>

                            <Column width={180} align="center">
                                <HeaderCell style={{ backgroundColor: '#f7f9fc', fontWeight: '600' }}>
                                    ÉDUCATEUR
                                </HeaderCell>
                                <Cell dataKey="educateur" style={{ fontSize: '13px' }} />
                            </Column>
                        </Table>
                    )}

                    {/* Message si aucune classe sélectionnée */}
                    {!selectedClasse && !affectationLoading && (
                        <div style={{
                            textAlign: 'center',
                            padding: '30px 20px',
                            backgroundColor: '#f8f9fa',
                            border: '1px dashed #dee2e6',
                            borderRadius: '8px',
                            color: '#6c757d',
                            fontSize: '14px'
                        }}>
                            Sélectionnez une classe pour voir les affectations existantes
                        </div>
                    )}

                    {/* Message si aucune affectation trouvée */}
                    {selectedClasse && !affectationLoading && tableData.length === 0 && (
                        <div style={{
                            textAlign: 'center',
                            padding: '30px 20px',
                            backgroundColor: '#fff3cd',
                            border: '1px solid #ffeaa7',
                            borderRadius: '8px',
                            color: '#856404',
                            fontSize: '14px'
                        }}>
                            Aucune affectation trouvée pour cette classe
                        </div>
                    )}
                </div>

                {/* Indicateur de chargement global */}
                {isDataLoading && (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <Loader size="lg" />
                            <div style={{ marginTop: 8, color: '#666' }}>
                                Chargement des données...
                            </div>
                        </div>
                    </div>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button
                    onClick={handleSubmit}
                    appearance="primary"
                    loading={loading}
                    disabled={isDataLoading || !selectedClasse || !selectedProfesseur || !selectedEducateur}
                    color="green"
                    size="lg"
                >
                    Enregistrer l'affectation
                </Button>
                <Button
                    onClick={handleCancel}
                    appearance="subtle"
                    disabled={loading}
                    size="lg"
                >
                    Annuler
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default AffecterClassePersonnelModal;