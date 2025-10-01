import React, { useState, useEffect, useRef } from 'react';
import {
    Modal,
    Button,
    SelectPicker,
    Row,
    Col,
    Loader,
    DatePicker,
    Uploader,
    Message,
    useToaster
} from 'rsuite';
import {
    FiCheckCircle,
    FiXCircle,
    FiEdit,
    FiUser,
    FiUpload,
    FiTrash2
} from 'react-icons/fi';
import axios from 'axios';
import { useAllApiUrls } from '../utils/apiConfig';
import { Input, Radio, Checkbox } from 'rsuite';

const EleveDetailsModal = ({ show, inscription, onClose, onSave }) => {
    const [activeTab, setActiveTab] = useState('validation');
    const [formData, setFormData] = useState({});
    const [niveaux, setNiveaux] = useState([]);
    const [classesPrecedentes, setClassesPrecedentes] = useState([]);
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [photoPreview, setPhotoPreview] = useState(null);
    const [loading, setLoading] = useState({
        niveaux: false,
        classes: false,
        save: false,
        photoUpload: false
    });

    const fileInputRef = useRef(null);
    const toaster = useToaster();
    const apiUrls = useAllApiUrls();

    // Charger les données au montage du modal
    useEffect(() => {
        if (show && inscription) {
            setFormData(inscription);
            setPhotoPreview(null); // Reset
            setSelectedPhoto(null); // Reset
            loadNiveaux();
            loadClassesPrecedentes();
            
            // Charger la photo après un court délai pour s'assurer que formData est à jour
            setTimeout(() => {
                loadStudentPhoto();
            }, 100);
        }
    }, [show, inscription]);

    // Nettoyage des URLs blob
    useEffect(() => {
        return () => {
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }
        };
    }, [photoPreview]);

    const loadStudentPhoto = async () => {
        // Utiliser eleve_id en priorité, sinon inscription_id
        const eleveId = inscription?.eleve_id || inscription?.inscription_id;
        
        console.log('Chargement photo pour ID:', eleveId);
        
        if (!eleveId) {
            console.warn('Aucun ID disponible pour charger la photo');
            return;
        }

        try {
            const response = await axios.get(
                `${apiUrls.inscriptions.getStudentPhoto(eleveId)}`,
                { 
                    responseType: 'blob',
                    timeout: 10000 // Timeout de 10 secondes
                }
            );

            if (response.data && response.data.size > 0) {
                // Créer une URL pour l'image blob
                const imageUrl = URL.createObjectURL(response.data);
                console.log('Photo chargée avec succès');
                setPhotoPreview(imageUrl);
                setFormData(prev => ({
                    ...prev,
                    urlPhoto: imageUrl,
                    hasPhoto: true
                }));
            } else {
                console.log('Aucune photo disponible (blob vide)');
                setPhotoPreview(null);
                setFormData(prev => ({
                    ...prev,
                    hasPhoto: false
                }));
            }
        } catch (error) {
            console.error('Erreur lors du chargement de la photo:', error);
            // Ne pas afficher d'erreur si la photo n'existe simplement pas (404)
            if (error.response?.status !== 404) {
                console.error('Erreur inattendue:', error.message);
            }
            setPhotoPreview(null);
            setFormData(prev => ({
                ...prev,
                hasPhoto: false
            }));
        }
    };

    // Charger les niveaux d'enseignement
    const loadNiveaux = async () => {
        setLoading(prev => ({ ...prev, niveaux: true }));
        try {
            const response = await axios.get(
                apiUrls.branches.getByNiveauEnseignement()
            );

            const niveauxOptions = response.data.map(item => ({
                label: item.libelle,
                value: item.id,
                niveau: item.niveau,
                filiere: item.filiere,
                serie: item.serie
            }));

            setNiveaux(niveauxOptions);
        } catch (error) {
            console.error('Erreur lors du chargement des niveaux:', error);
        } finally {
            setLoading(prev => ({ ...prev, niveaux: false }));
        }
    };

    // Charger les classes précédentes
    const loadClassesPrecedentes = async () => {
        setLoading(prev => ({ ...prev, classes: true }));
        try {
            const response = await axios.get(
                apiUrls.niveaux.getNiveauEcole()
            );

            const classesOptions = response.data.map(item => ({
                label: item.niveaulibelle,
                value: item.niveauid,
                code: item.niveaucode
            }));

            setClassesPrecedentes(classesOptions);
        } catch (error) {
            console.error('Erreur lors du chargement des classes précédentes:', error);
        } finally {
            setLoading(prev => ({ ...prev, classes: false }));
        }
    };

    // Gérer les changements de formulaire
    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Gérer la sélection de photo
    const handlePhotoSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            // Vérifier le type de fichier
            if (!file.type.startsWith('image/')) {
                toaster.push(
                    <Message type="error">
                        Veuillez sélectionner un fichier image (JPG, PNG, etc.)
                    </Message>,
                    { placement: 'topEnd', duration: 3000 }
                );
                return;
            }

            // Vérifier la taille (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                toaster.push(
                    <Message type="error">
                        La taille du fichier ne doit pas dépasser 2MB
                    </Message>,
                    { placement: 'topEnd', duration: 3000 }
                );
                return;
            }

            setSelectedPhoto(file);

            // Créer un aperçu
            const reader = new FileReader();
            reader.onload = (e) => {
                // Révoquer l'ancien blob si nécessaire
                if (photoPreview && photoPreview.startsWith('blob:')) {
                    URL.revokeObjectURL(photoPreview);
                }
                setPhotoPreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Upload de la photo
    const handlePhotoUpload = async () => {
        if (!selectedPhoto) {
            toaster.push(
                <Message type="warning">
                    Veuillez d'abord sélectionner une photo
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
            return;
        }

        const eleveId = formData.eleve_id || inscription?.eleve_id;
        
        if (!eleveId) {
            toaster.push(
                <Message type="error">
                    ID de l'élève manquant
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
            return;
        }

        setLoading(prev => ({ ...prev, photoUpload: true }));
        try {
            const uploadFormData = new FormData();
            uploadFormData.append('file', selectedPhoto);

            // Correction de la faute de frappe : uploadStudentPhoto au lieu de upploadStudentPhoto
            const response = await axios.put(
                `${apiUrls.inscriptions.uploadStudentPhoto(eleveId)}`,
                uploadFormData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );

            if (response.status === 200) {
                toaster.push(
                    <Message type="success">
                        Photo uploadée avec succès
                    </Message>,
                    { placement: 'topEnd', duration: 3000 }
                );

                setSelectedPhoto(null);

                // Recharger la photo depuis l'API
                await loadStudentPhoto();
            }
        } catch (error) {
            console.error('Erreur upload photo:', error);
            toaster.push(
                <Message type="error">
                    Erreur lors de l'upload de la photo: {error.response?.data?.message || error.message}
                </Message>,
                { placement: 'topEnd', duration: 5000 }
            );
        } finally {
            setLoading(prev => ({ ...prev, photoUpload: false }));
        }
    };

    // Supprimer la photo
    const handlePhotoDelete = async () => {
        const eleveId = formData.eleve_id || inscription?.eleve_id;
        
        if (!eleveId) {
            toaster.push(
                <Message type="error">
                    ID de l'élève manquant
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
            return;
        }

        try {
            await axios.delete(apiUrls.eleves.deletePhoto(eleveId));

            // Révoquer l'URL blob
            if (photoPreview && photoPreview.startsWith('blob:')) {
                URL.revokeObjectURL(photoPreview);
            }

            setFormData(prev => ({
                ...prev,
                urlPhoto: '',
                hasPhoto: false
            }));
            setPhotoPreview(null);
            setSelectedPhoto(null);

            toaster.push(
                <Message type="success">
                    Photo supprimée avec succès
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
        } catch (error) {
            console.error('Erreur suppression photo:', error);
            toaster.push(
                <Message type="error">
                    Erreur lors de la suppression de la photo
                </Message>,
                { placement: 'topEnd', duration: 3000 }
            );
        }
    };

    // Mapper les données pour l'API
    const mapDataForAPI = (data) => {
        return {
            idEleveInscrit: data.inscription_id || null,
            inscriptionsidEleve: data.eleve_id || null,
            nomEleve: data.nom || "",
            prenomEleve: data.prenom || "",
            matriculeEleve: data.matricule || "",
            identifiantBranche: data.branche_id || null,
            Date_naissanceEleve: data.dateNaissance || null,
            sexeEleve: data.genre || "",
            contactEleve: data.contact_principal || null,
            inscriptions_statut_eleve: data.inscription_statut_eleve || null,
            inscriptions_status: data.inscription_statut || "EN_ATTENTE",
            inscriptions_processus: data.inscription_processus || "EN_COURS",
            inscriptions_type: data.inscription_type || null,
            inscriptions_classe_precedente: data.classe_precedente || "",
            inscriptions_derniereclasse_religieuse: data.derniere_classe_religieuse || "",
            inscriptions_classe_actuelle: data.classe || "",
            inscriptions_contact2: data.contact_secondaire || "",
            inscriptionsid: data.inscription_id || null,
            origine_prise_en_charge: data.origine_prise_en_charge || "",
            profession_pere: data.profession_pere || "",
            boite_postal_mere: data.boite_postal_mere || "",
            num_decision_affectation: data.num_decision_affectation || "",
            internes: data.internes || false,
            demi_pension: data.demi_pension || false,
            externes: data.externes || false,
            ivoirien: data.ivoirien || false,
            etranger_africain: data.etranger_africain || false,
            etranger_non_africain: data.etranger_non_africain || false,
            brancheid: data.branche_id || null,
            nationalite: data.nationalite || "",
            lieuNaissance: data.lieuNaissance || "",
            ecole_origine: data.ecole_origine || "",
            redoublant: data.redoublant || "NON",
            langue_vivante: data.langue_vivante || "",
            prise_en_charge: data.prise_en_charge || false,
            autre_handicap: data.autre_handicap || "NON",
            nom_prenoms_pere: data.nom_prenoms_pere || "",
            tel_pere: data.tel_pere || "",
            nom_prenoms_mere: data.nom_prenoms_mere || "",
            tel_mere: data.tel_mere || "",
            nom_prenom_pers_en_charge: data.nom_prenom_pers_en_charge || "",
            profession_pers_en_charge: data.profession_pers_en_charge || "",
            tel_pers_en_charge: data.tel_pers_en_charge || "",
            profession_mere: data.profession_mere || ""
        };
    };

    // Sauvegarder les modifications
    const handleSave = async () => {
        setLoading(prev => ({ ...prev, save: true }));
        try {
            const apiData = mapDataForAPI(formData);

            console.log('Données envoyées à l\'API:', apiData);

            const response = await axios.put(
                apiUrls.inscriptions.infosComplementairesEleve(),
                apiData,
            );

            if (response.status === 200 || response.status === 201) {
                toaster.push(
                    <Message type="success">
                        Informations mises à jour avec succès
                    </Message>,
                    { placement: 'topEnd', duration: 3000 }
                );

                if (onSave) {
                    await onSave(formData);
                }

                onClose();
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde:', error);

            let errorMessage = 'Erreur lors de la sauvegarde';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            }

            toaster.push(
                <Message type="error">
                    {errorMessage}
                </Message>,
                { placement: 'topEnd', duration: 5000 }
            );
        } finally {
            setLoading(prev => ({ ...prev, save: false }));
        }
    };

    if (!inscription) return null;

    const tabs = [
        { key: 'validation', label: 'VALIDATION DE L\'ELEVE', color: '#3b82f6' },
        { key: 'photo', label: 'CHARGER LA PHOTO', color: '#10b981' },
        { key: 'infos', label: 'INFORMATIONS COMPLEMENTAIRES', color: '#f59e0b' },
        { key: 'parents', label: 'INFORMATIONS SUR LES PARENTS', color: '#8b5cf6' }
    ];

    return (
        <Modal open={show} onClose={onClose} size="lg">
            <Modal.Header>
                <Modal.Title style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    fontSize: '18px',
                    fontWeight: '600'
                }}>
                    <div style={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FiUser size={18} color="white" />
                    </div>
                    Détails de l'élève - {inscription.nomComplet}
                </Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
                {/* Navigation des onglets */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f8fafc',
                    flexWrap: 'wrap'
                }}>
                    {tabs.map(tab => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            style={{
                                flex: 1,
                                minWidth: '200px',
                                padding: '12px 16px',
                                border: 'none',
                                backgroundColor: activeTab === tab.key ? 'white' : 'transparent',
                                color: activeTab === tab.key ? tab.color : '#6b7280',
                                borderBottom: activeTab === tab.key ? `3px solid ${tab.color}` : 'none',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                textAlign: 'center',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Contenu des onglets */}
                <div style={{ padding: '24px' }}>
                    {activeTab === 'validation' && (
                        <div>
                            {/* En-tête avec informations de base */}
                            <div style={{
                                background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                                padding: '16px',
                                borderRadius: '8px',
                                marginBottom: '24px',
                                border: '1px solid #bae6fd'
                            }}>
                                <Row gutter={16}>
                                    <Col md={2}>
                                        {/* PHOTO DE L'ÉTUDIANT */}
                                        <div style={{
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '8px',
                                            overflow: 'hidden',
                                            border: '2px solid #0369a1',
                                            backgroundColor: '#f1f5f9'
                                        }}>
                                            {photoPreview ? (
                                                <img
                                                    src={photoPreview}
                                                    alt="Photo élève"
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover'
                                                    }}
                                                />
                                            ) : (
                                                <div style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    color: '#64748b'
                                                }}>
                                                    <FiUser size={28} />
                                                </div>
                                            )}
                                        </div>
                                    </Col>
                                    <Col md={10}>
                                        <div style={{ fontSize: '14px', color: '#0369a1', marginBottom: '4px' }}>
                                            Matricule : <strong>{formData.matricule}</strong>
                                        </div>
                                        <div style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>
                                            {formData.nom} {formData.prenom}
                                        </div>
                                    </Col>
                                    <Col md={12}>
                                        <div style={{ fontSize: '14px', color: '#0369a1' }}>
                                            Type processus
                                        </div>
                                        <div style={{
                                            fontSize: '14px',
                                            fontWeight: '600',
                                            color: '#1e293b',
                                            padding: '4px 8px',
                                            backgroundColor: 'white',
                                            borderRadius: '4px',
                                            border: '1px solid #bae6fd'
                                        }}>
                                            {formData.inscription_type || 'INSCRIPTION'}
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            <Row gutter={16}>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Sexe
                                        </label>
                                        <SelectPicker
                                            data={[
                                                { label: 'MASCULIN', value: 'MASCULIN' },
                                                { label: 'FEMININ', value: 'FEMININ' }
                                            ]}
                                            value={formData.genre}
                                            onChange={(value) => handleChange('genre', value)}
                                            style={{ width: '100%' }}
                                            placeholder="Sélectionner le sexe"
                                        />
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Nom
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.nom || ''}
                                            onChange={(value) => handleChange('nom', value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Prénom(s)
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.prenom || ''}
                                            onChange={(value) => handleChange('prenom', value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col md={12}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Nationalité
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.nationalite || ''}
                                            onChange={(value) => handleChange('nationalite', value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Lieu de naissance
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.lieuNaissance || ''}
                                            onChange={(value) => handleChange('lieuNaissance', value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col md={12}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Statut d'affectation
                                        </label>
                                        <SelectPicker
                                            data={[
                                                { label: 'AFFECTE', value: 'AFFECTE' },
                                                { label: 'NON_AFFECTE', value: 'NON_AFFECTE' }
                                            ]}
                                            value={formData.inscription_statut_eleve}
                                            onChange={(value) => handleChange('inscription_statut_eleve', value)}
                                            style={{ width: '100%' }}
                                            placeholder="Sélectionner le statut"
                                        />
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Date de naissance
                                        </label>
                                        <DatePicker
                                            value={formData.dateNaissance ? new Date(formData.dateNaissance) : null}
                                            onChange={(date) => handleChange('dateNaissance', date?.toISOString())}
                                            format="dd/MM/yyyy"
                                            style={{ width: '100%' }}
                                            placeholder="Sélectionner la date"
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {activeTab === 'photo' && (
                        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                            <div style={{
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
                                padding: '32px',
                                borderRadius: '12px',
                                border: '1px solid #bbf7d0'
                            }}>
                                {photoPreview ? (
                                    <div>
                                        <img
                                            src={photoPreview}
                                            alt="Aperçu photo élève"
                                            style={{
                                                width: '200px',
                                                height: '200px',
                                                objectFit: 'cover',
                                                borderRadius: '12px',
                                                border: '3px solid #22c55e',
                                                marginBottom: '20px',
                                                boxShadow: '0 8px 25px rgba(34, 197, 94, 0.15)'
                                            }}
                                        />
                                        <div style={{ marginBottom: '20px' }}>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handlePhotoSelect}
                                                style={{ display: 'none' }}
                                            />
                                            <Button
                                                appearance="ghost"
                                                style={{
                                                    border: '1px solid #d1d5db',
                                                    marginRight: '10px'
                                                }}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Choisir un fichier
                                            </Button>
                                            <span style={{ color: '#6b7280', fontSize: '14px' }}>
                                                {selectedPhoto ? selectedPhoto.name : 'Aucun fichier choisi'}
                                            </span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                                            {selectedPhoto && (
                                                <Button
                                                    appearance="primary"
                                                    startIcon={<FiUpload />}
                                                    loading={loading.photoUpload}
                                                    onClick={handlePhotoUpload}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                        border: 'none'
                                                    }}
                                                >
                                                    Charger la photo
                                                </Button>
                                            )}
                                            <Button
                                                appearance="ghost"
                                                color="red"
                                                startIcon={<FiTrash2 />}
                                                onClick={handlePhotoDelete}
                                                style={{ border: '1px solid #ef4444', color: '#ef4444' }}
                                            >
                                                Supprimer
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div style={{
                                            width: '200px',
                                            height: '200px',
                                            border: '3px dashed #22c55e',
                                            borderRadius: '12px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            margin: '0 auto 24px',
                                            backgroundColor: 'white',
                                            cursor: 'pointer'
                                        }}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <FiUser size={48} color="#22c55e" />
                                        </div>
                                        <h6 style={{ color: '#16a34a', marginBottom: '8px' }}>
                                            Ajouter une photo
                                        </h6>
                                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
                                            Formats acceptés: JPG, PNG (max 2MB)
                                        </p>
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            accept="image/*"
                                            onChange={handlePhotoSelect}
                                            style={{ display: 'none' }}
                                        />
                                        <Button
                                            appearance="primary"
                                            startIcon={<FiUpload />}
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                border: 'none'
                                            }}
                                        >
                                            Choisir une photo
                                        </Button>
                                        {selectedPhoto && (
                                            <div style={{ marginTop: '16px' }}>
                                                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                                                    Fichier sélectionné: {selectedPhoto.name}
                                                </div>
                                                <Button
                                                    appearance="primary"
                                                    startIcon={<FiUpload />}
                                                    loading={loading.photoUpload}
                                                    onClick={handlePhotoUpload}
                                                    style={{
                                                        background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                                        border: 'none'
                                                    }}
                                                >
                                                    Charger la photo
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'infos' && (
                        <div>
                            {/* Section Handicaps */}
                            <div style={{
                                marginBottom: 24,
                                padding: '20px',
                                backgroundColor: '#fefce8',
                                borderRadius: '8px',
                                border: '1px solid #fde047'
                            }}>
                                <h6 style={{
                                    color: '#ca8a04',
                                    marginBottom: 16,
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    🏥 Types de handicap
                                </h6>
                                <Row gutter={16}>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Handicap moteur</span>
                                        </label>
                                    </Col>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Handicap visuel</span>
                                        </label>
                                    </Col>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Handicap auditif</span>
                                        </label>
                                    </Col>
                                </Row>

                                <div style={{ marginTop: 16 }}>
                                    <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                        Autre Handicap
                                    </label>
                                    <SelectPicker
                                        data={[
                                            { label: 'OUI', value: 'OUI' },
                                            { label: 'NON', value: 'NON' }
                                        ]}
                                        value={formData.autre_handicap}
                                        onChange={(value) => handleChange('autre_handicap', value)}
                                        style={{ width: '100%' }}
                                        placeholder="Sélectionner"
                                    />
                                </div>
                            </div>

                            {/* Section Type d'inscription */}
                            <div style={{
                                marginBottom: 24,
                                padding: '20px',
                                backgroundColor: '#eff6ff',
                                borderRadius: '8px',
                                border: '1px solid #bfdbfe'
                            }}>
                                <h6 style={{
                                    color: '#2563eb',
                                    marginBottom: 16,
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    📋 Type d'inscription
                                </h6>
                                <Row gutter={16}>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Réaffectation</span>
                                        </label>
                                    </Col>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Régularisation</span>
                                        </label>
                                    </Col>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Réintégration</span>
                                        </label>
                                    </Col>
                                    <Col md={6}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                            <Checkbox />
                                            <span style={{ fontSize: '14px' }}>Transfert</span>
                                        </label>
                                    </Col>
                                </Row>
                            </div>

                            {/* Section Régime et Nationalité */}
                            <Row gutter={16}>
                                <Col md={12}>
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#f0fdf4',
                                        borderRadius: '8px',
                                        border: '1px solid #bbf7d0',
                                        marginBottom: 20
                                    }}>
                                        <h6 style={{ color: '#16a34a', marginBottom: 12, fontWeight: '600' }}>
                                            🏠 Régime
                                        </h6>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Radio
                                                    name="regime"
                                                    checked={formData.internes}
                                                    onChange={() => {
                                                        handleChange('internes', true);
                                                        handleChange('demi_pension', false);
                                                        handleChange('externes', false);
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px' }}>Internes</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Radio
                                                    name="regime"
                                                    checked={formData.demi_pension}
                                                    onChange={() => {
                                                        handleChange('internes', false);
                                                        handleChange('demi_pension', true);
                                                        handleChange('externes', false);
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px' }}>Demi pension</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Radio
                                                    name="regime"
                                                    checked={formData.externes}
                                                    onChange={() => {
                                                        handleChange('internes', false);
                                                        handleChange('demi_pension', false);
                                                        handleChange('externes', true);
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px' }}>Externes</span>
                                            </label>
                                        </div>
                                    </div>
                                </Col>

                                <Col md={12}>
                                    <div style={{
                                        padding: '16px',
                                        backgroundColor: '#fdf2f8',
                                        borderRadius: '8px',
                                        border: '1px solid #fbcfe8',
                                        marginBottom: 20
                                    }}>
                                        <h6 style={{ color: '#be185d', marginBottom: 12, fontWeight: '600' }}>
                                            🌍 Nationalité
                                        </h6>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Radio
                                                    name="nationalite_type"
                                                    checked={formData.ivoirien}
                                                    onChange={() => {
                                                        handleChange('ivoirien', true);
                                                        handleChange('etranger_africain', false);
                                                        handleChange('etranger_non_africain', false);
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px' }}>Ivoirien</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Radio
                                                    name="nationalite_type"
                                                    checked={formData.etranger_africain}
                                                    onChange={() => {
                                                        handleChange('ivoirien', false);
                                                        handleChange('etranger_africain', true);
                                                        handleChange('etranger_non_africain', false);
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px' }}>Etranger africain</span>
                                            </label>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <Radio
                                                    name="nationalite_type"
                                                    checked={formData.etranger_non_africain}
                                                    onChange={() => {
                                                        handleChange('ivoirien', false);
                                                        handleChange('etranger_africain', false);
                                                        handleChange('etranger_non_africain', true);
                                                    }}
                                                />
                                                <span style={{ fontSize: '14px' }}>Etranger non africain</span>
                                            </label>
                                        </div>
                                    </div>
                                </Col>
                            </Row>

                            {/* Autres informations */}
                            <Row gutter={16}>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            École d'origine
                                        </label>
                                        <Input
                                            type="text"
                                            value={formData.ecole_origine || ''}
                                            onChange={(value) => handleChange('ecole_origine', value)}
                                            style={{
                                                width: '100%',
                                                padding: '8px 12px',
                                                border: '1px solid #d1d5db',
                                                borderRadius: '6px'
                                            }}
                                        />
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Classe précédente
                                        </label>
                                        {loading.classes ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
                                                <Loader size="xs" />
                                                <span style={{ fontSize: '14px', color: '#6b7280' }}>Chargement...</span>
                                            </div>
                                        ) : (
                                            <SelectPicker
                                                data={classesPrecedentes}
                                                value={formData.classe_precedente}
                                                onChange={(value) => handleChange('classe_precedente', value)}
                                                style={{ width: '100%' }}
                                                placeholder="Sélectionner une classe"
                                            />
                                        )}
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Niveau actuel
                                        </label>
                                        {loading.niveaux ? (
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px' }}>
                                                <Loader size="xs" />
                                                <span style={{ fontSize: '14px', color: '#6b7280' }}>Chargement...</span>
                                            </div>
                                        ) : (
                                            <SelectPicker
                                                data={niveaux}
                                                value={formData.branche_id}
                                                onChange={(value) => handleChange('branche_id', value)}
                                                style={{ width: '100%' }}
                                                placeholder="Sélectionner un niveau"
                                            />
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Redoublant
                                        </label>
                                        <SelectPicker
                                            data={[
                                                { label: 'OUI', value: 'OUI' },
                                                { label: 'NON', value: 'NON' }
                                            ]}
                                            value={formData.redoublant}
                                            onChange={(value) => handleChange('redoublant', value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'block', marginBottom: 8, fontWeight: '500' }}>
                                            Langue vivante
                                        </label>
                                        <SelectPicker
                                            data={[
                                                { label: 'Anglais', value: 'ANGLAIS' },
                                                { label: 'Espagnol', value: 'ESPAGNOL' },
                                                { label: 'Allemand', value: 'ALLEMAND' },
                                                { label: 'Arabe', value: 'ARABE' }
                                            ]}
                                            value={formData.langue_vivante}
                                            onChange={(value) => handleChange('langue_vivante', value)}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </Col>
                                <Col md={8}>
                                    <div style={{ marginBottom: 20 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <Checkbox
                                                checked={formData.prise_en_charge}
                                                onChange={(checked) => handleChange('prise_en_charge', checked)}
                                            />
                                            <span style={{ fontWeight: '500' }}>Prise en charge</span>
                                        </label>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    )}

                    {activeTab === 'parents' && (
                        <div>
                            {/* Section Père */}
                            <div style={{
                                marginBottom: 24,
                                padding: '20px',
                                backgroundColor: '#f0f9ff',
                                borderRadius: '8px',
                                border: '1px solid #bae6fd'
                            }}>
                                <h6 style={{
                                    color: '#2563eb',
                                    marginBottom: 16,
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    👨 Informations du père
                                </h6>
                                <Row gutter={16}>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Nom du père
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.nom_prenoms_pere || ''}
                                                onChange={(value) => handleChange('nom_prenoms_pere', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Profession du père
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.profession_pere || ''}
                                                onChange={(value) => handleChange('profession_pere', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Téléphone 1 du père
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.tel_pere?.replace('Non renseigné', '') || ''}
                                                onChange={(value) => handleChange('tel_pere', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Section Mère */}
                            <div style={{
                                marginBottom: 24,
                                padding: '20px',
                                backgroundColor: '#fdf2f8',
                                borderRadius: '8px',
                                border: '1px solid #fbcfe8'
                            }}>
                                <h6 style={{
                                    color: '#be185d',
                                    marginBottom: 16,
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    👩 Informations de la mère
                                </h6>
                                <Row gutter={16}>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Nom de la mère
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.nom_prenoms_mere || ''}
                                                onChange={(value) => handleChange('nom_prenoms_mere', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Profession de la mère
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.profession_mere || ''}
                                                onChange={(value) => handleChange('profession_mere', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Téléphone 1 de la mère
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.tel_mere?.replace('Non renseigné', '') || ''}
                                                onChange={(value) => handleChange('tel_mere', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>

                            {/* Section Personne en charge */}
                            <div style={{
                                padding: '20px',
                                backgroundColor: '#f5f3ff',
                                borderRadius: '8px',
                                border: '1px solid #d8b4fe'
                            }}>
                                <h6 style={{
                                    color: '#7c3aed',
                                    marginBottom: 16,
                                    fontWeight: '600',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8
                                }}>
                                    👤 Personne en charge
                                </h6>
                                <Row gutter={16}>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Nom Personne en charge
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.nom_prenom_pers_en_charge || ''}
                                                onChange={(value) => handleChange('nom_prenom_pers_en_charge', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Profession Personne en charge
                                            </label>
                                            <Input
                                                type="text"
                                                value={formData.profession_pers_en_charge || ''}
                                                onChange={(value) => handleChange('profession_pers_en_charge', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                    <Col md={8}>
                                        <div style={{ marginBottom: 16 }}>
                                            <label style={{ display: 'block', marginBottom: 6, fontWeight: '500', fontSize: '13px' }}>
                                                Téléphone1 Personne en charge
                                            </label>
                                            <Input
                                                type="tel"
                                                value={formData.tel_pers_en_charge?.replace('Non renseigné', '') || ''}
                                                onChange={(value) => handleChange('tel_pers_en_charge', value)}
                                                style={{
                                                    width: '100%',
                                                    padding: '8px 12px',
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '6px',
                                                    fontSize: '14px'
                                                }}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Button
                        onClick={onClose}
                        appearance="subtle"
                        startIcon={<FiXCircle />}
                        style={{ color: '#6b7280' }}
                    >
                        Annuler
                    </Button>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <Button
                            appearance="primary"
                            startIcon={<FiCheckCircle />}
                            loading={loading.save}
                            onClick={handleSave}
                            style={{
                                background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                                border: 'none'
                            }}
                        >
                            Valider
                        </Button>
                        <Button
                            appearance="ghost"
                            startIcon={<FiEdit />}
                            onClick={handleSave}
                            disabled={loading.save}
                            style={{
                                border: '1px solid #3b82f6',
                                color: '#3b82f6'
                            }}
                        >
                            Modifier
                        </Button>
                    </div>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EleveDetailsModal;