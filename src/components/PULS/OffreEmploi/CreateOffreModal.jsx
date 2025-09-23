import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Form, SelectPicker, Button, Message, Loader, Input, DatePicker } from 'rsuite';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';

/**
 * Hook pour récupérer les niveaux d'étude
 */
const useNiveauxData = () => {
    const [niveaux, setNiveaux] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchNiveaux = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.offres.getNiveauxEtude());
            // L'API retourne un objet unique selon votre exemple, on le met dans un array
            const niveauxArray = Array.isArray(response.data) ? response.data : [response.data];
            const formattedNiveaux = niveauxArray.map(niveau => ({
                label: niveau.niveau_etude_libelle,
                value: niveau.niveau_etudeid,
                raw_data: niveau
            }));
            setNiveaux(formattedNiveaux);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des niveaux');
        } finally {
            setLoading(false);
        }
    }, [apiUrls.offres]);

    useEffect(() => {
        fetchNiveaux();
    }, [fetchNiveaux]);

    return { niveaux, loading, error, refetch: fetchNiveaux };
};

/**
 * Hook pour récupérer les profils/fonctions
 */
const useProfilsData = () => {
    const [profils, setProfils] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchProfils = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.fonctions.listByEcole());
            const formattedProfils = (response.data || []).map(profil => ({
                label: profil.libelle,
                value: profil.id,
                raw_data: profil
            }));
            setProfils(formattedProfils);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des profils');
        } finally {
            setLoading(false);
        }
    }, [apiUrls.fonctions]);

    useEffect(() => {
        fetchProfils();
    }, [fetchProfils]);

    return { profils, loading, error, refetch: fetchProfils };
};

/**
 * Hook pour récupérer les types d'offre
 */
const useTypesOffreData = () => {
    const [typesOffre, setTypesOffre] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const apiUrls = useAllApiUrls();

    const fetchTypesOffre = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(apiUrls.offres.getTypesOffre());
            const formattedTypes = (response.data || []).map(type => ({
                label: type.libelle,
                value: type.id,
                raw_data: type
            }));
            setTypesOffre(formattedTypes);
        } catch (err) {
            setError(err.message || 'Erreur lors du chargement des types d\'offre');
        } finally {
            setLoading(false);
        }
    }, [apiUrls.offres]);

    useEffect(() => {
        fetchTypesOffre();
    }, [fetchTypesOffre]);

    return { typesOffre, loading, error, refetch: fetchTypesOffre };
};

/**
 * Modal de création d'offre d'emploi
 */
const CreateOffreModal = ({ show, onClose, onSave }) => {
    // ===========================
    // ÉTAT DU FORMULAIRE
    // ===========================
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        experience: '',
        lieu: '',
        dateLimite: null,
        niveauId: null,
        profilId: null,
        typeOffreId: null
    });

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // ===========================
    // HOOKS POUR LES DONNÉES DE RÉFÉRENCE
    // ===========================
    const { niveaux, loading: niveauxLoading } = useNiveauxData();
    const { profils, loading: profilsLoading } = useProfilsData();
    const { typesOffre, loading: typesLoading } = useTypesOffreData();

    // ===========================
    // GESTION DES CHANGEMENTS
    // ===========================
    const handleInputChange = (value, name) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setSubmitError(null);
    };

    // ===========================
    // VALIDATION DU FORMULAIRE
    // ===========================
    const validateForm = () => {
        if (!formData.code.trim()) {
            Message.error('Le code de l\'offre est requis');
            return false;
        }

        if (!formData.description.trim()) {
            Message.error('La description de l\'offre est requise');
            return false;
        }

        if (!formData.experience.trim()) {
            Message.error('L\'expérience requise est obligatoire');
            return false;
        }

        if (!formData.lieu.trim()) {
            Message.error('Le lieu de l\'emploi est requis');
            return false;
        }

        if (!formData.dateLimite) {
            Message.error('La date limite est requise');
            return false;
        }

        // Vérifier que la date est dans le futur
        const selectedDate = new Date(formData.dateLimite);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            Message.error('La date limite doit être dans le futur');
            return false;
        }

        if (!formData.niveauId) {
            Message.error('Le niveau d\'étude est requis');
            return false;
        }

        if (!formData.profilId) {
            Message.error('Le profil est requis');
            return false;
        }

        if (!formData.typeOffreId) {
            Message.error('Le type d\'offre est requis');
            return false;
        }

        return true;
    };

    // ===========================
    // SOUMISSION DU FORMULAIRE
    // ===========================
    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setSubmitError(null);
        
        try {
            await onSave(formData);
            handleReset();
            Message.success('Offre créée avec succès');
        } catch (error) {
            const errorMessage = error.response?.data?.message || 
                               error.message || 
                               'Erreur lors de la création de l\'offre';
            setSubmitError(errorMessage);
            Message.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // ===========================
    // ANNULATION
    // ===========================
    const handleCancel = () => {
        handleReset();
        onClose();
    };

    // ===========================
    // RÉINITIALISATION DU FORMULAIRE
    // ===========================
    const handleReset = () => {
        setFormData({
            code: '',
            description: '',
            experience: '',
            lieu: '',
            dateLimite: null,
            niveauId: null,
            profilId: null,
            typeOffreId: null
        });
        setSubmitError(null);
    };

    // ===========================
    // RÉINITIALISATION QUAND LE MODAL S'OUVRE
    // ===========================
    useEffect(() => {
        if (show) {
            handleReset();
        }
    }, [show]);

    const isDataLoading = niveauxLoading || profilsLoading || typesLoading;

    return (
        <Modal open={show} onClose={handleCancel} size="lg">
            <Modal.Header>
                <Modal.Title>Créer une offre</Modal.Title>
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

                {/* Formulaire */}
                <Form disabled={loading || isDataLoading} fluid>
                    {/* Code de l'offre */}
                    <Form.Group controlId="code">
                        <Form.ControlLabel>Code de l'offre *</Form.ControlLabel>
                        <Input
                            value={formData.code}
                            onChange={(value) => handleInputChange(value, 'code')}
                            placeholder="Code l'offre *"
                            size="lg"
                        />
                    </Form.Group>

                    {/* Description de l'offre */}
                    <Form.Group controlId="description">
                        <Form.ControlLabel>Description de l'offre *</Form.ControlLabel>
                        <Input
                            as="textarea"
                            rows={4}
                            value={formData.description}
                            onChange={(value) => handleInputChange(value, 'description')}
                            placeholder="Commenter l'offre *"
                        />
                    </Form.Group>

                    {/* Ligne avec 3 champs */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {/* Expérience */}
                        <Form.Group controlId="experience" style={{ flex: 1 }}>
                            <Form.ControlLabel>Expérience *</Form.ControlLabel>
                            <Input
                                value={formData.experience}
                                onChange={(value) => handleInputChange(value, 'experience')}
                                placeholder="Expérience*"
                            />
                        </Form.Group>

                        {/* Lieu de l'emploi */}
                        <Form.Group controlId="lieu" style={{ flex: 1 }}>
                            <Form.ControlLabel>Lieu de l'emploi *</Form.ControlLabel>
                            <Input
                                value={formData.lieu}
                                onChange={(value) => handleInputChange(value, 'lieu')}
                                placeholder="Lieu de l'emploi*"
                            />
                        </Form.Group>

                        {/* Date limite */}
                        <Form.Group controlId="dateLimite" style={{ flex: 1 }}>
                            <Form.ControlLabel>Date limite *</Form.ControlLabel>
                            <DatePicker
                                value={formData.dateLimite}
                                onChange={(value) => handleInputChange(value, 'dateLimite')}
                                placeholder="Date limite *"
                                format="dd/MM/yyyy"
                                style={{ width: '100%' }}
                            />
                        </Form.Group>
                    </div>

                    {/* Ligne avec 2 dropdowns */}
                    <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                        {/* Niveau d'étude */}
                        <Form.Group controlId="niveau" style={{ flex: 1 }}>
                            <Form.ControlLabel>Niveau d'étude *</Form.ControlLabel>
                            <SelectPicker
                                data={niveaux}
                                value={formData.niveauId}
                                onChange={(value) => handleInputChange(value, 'niveauId')}
                                placeholder="Sélectionnez le niveau*"
                                searchable
                                cleanable={false}
                                loading={niveauxLoading}
                                style={{ width: '100%' }}
                                size="lg"
                            />
                        </Form.Group>

                        {/* Profil */}
                        <Form.Group controlId="profil" style={{ flex: 1 }}>
                            <Form.ControlLabel>Profil *</Form.ControlLabel>
                            <SelectPicker
                                data={profils}
                                value={formData.profilId}
                                onChange={(value) => handleInputChange(value, 'profilId')}
                                placeholder="Sélectionnez le profil*"
                                searchable
                                cleanable={false}
                                loading={profilsLoading}
                                style={{ width: '100%' }}
                                size="lg"
                            />
                        </Form.Group>
                    </div>

                    {/* Type d'offre */}
                    <Form.Group controlId="typeOffre">
                        <Form.ControlLabel>Type d'offre *</Form.ControlLabel>
                        <SelectPicker
                            data={typesOffre}
                            value={formData.typeOffreId}
                            onChange={(value) => handleInputChange(value, 'typeOffreId')}
                            placeholder="Sélectionnez le type d'offre*"
                            searchable
                            cleanable={false}
                            loading={typesLoading}
                            style={{ width: '100%' }}
                            size="lg"
                        />
                    </Form.Group>
                </Form>

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
                    disabled={isDataLoading}
                    color="green"
                    size="lg"
                    startIcon={<span>✓</span>}
                >
                    Save
                </Button>
                <Button 
                    onClick={handleCancel} 
                    appearance="subtle"
                    disabled={loading}
                    size="lg"
                    startIcon={<span>✕</span>}
                >
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateOffreModal;