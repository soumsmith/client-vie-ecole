import React, { useState, useEffect } from 'react';
import { 
    Modal, 
    Button, 
    Form, 
    Input, 
    Panel, 
    Grid, 
    Row, 
    Col,
    SelectPicker,
    Toggle,
    Text,
    Badge,
    Avatar
} from 'rsuite';
import { 
    FiBookOpen,
    FiEdit,
    FiSave,
    FiX,
    FiTag,
    FiHash,
    FiType,
    FiGrid,
    FiAward
} from 'react-icons/fi';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';

const EditMatiereModal = ({ show, matiere, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        code: '',
        libelle: '',
        numOrdre: 1,
        categorieId: null,
        matiereParentId: null,
        pec: false,
        bonus: false
    });

    const [categories, setCategories] = useState([]);
    const [matieresParent, setMatieresParent] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(false);
    const apiUrls = useAllApiUrls();

    // Réinitialiser le formulaire quand le modal s'ouvre avec une nouvelle matière
    useEffect(() => {
        if (show && matiere) {
            setFormData({
                code: matiere.code || '',
                libelle: matiere.libelle || '',
                numOrdre: matiere.numOrdre || 1,
                categorieId: matiere.categorie?.id || null,
                matiereParentId: matiere.matiere?.matiereParent || null,
                pec: matiere.pec === 1 || matiere.pec === true, // Utiliser la valeur au niveau racine
                bonus: matiere.bonus === 1 || matiere.bonus === true // Utiliser la valeur au niveau racine
            });
            
            // Charger les données des dropdowns
            loadDropdownData();
        }
    }, [show, matiere]);

    const loadDropdownData = async () => {
        setIsLoadingData(true);
        try {
            // Charger les catégories de matières
            const categoriesResponse = await axios.get(apiUrls.matieres.getCategoriesList());

            if (categoriesResponse.data && Array.isArray(categoriesResponse.data)) {
                const categoriesData = categoriesResponse.data.map(cat => ({
                    label: `${cat.code} - ${cat.libelle}`,
                    value: cat.id,
                    data: cat
                }));
                setCategories(categoriesData);
            }

            // Charger les matières parent (utiliser l'ID de l'école de la matière)
            const ecoleId = matiere?.ecole?.id; 
            const matieresResponse = await axios.get(apiUrls.matieres.listByEcole());
            if (matieresResponse.data && Array.isArray(matieresResponse.data)) {
                const matieresData = matieresResponse.data.map(mat => ({
                    label: `${mat.code} - ${mat.libelle}`,
                    value: mat.id,
                    data: mat
                }));
                setMatieresParent(matieresData);
            }

        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
            Swal.fire({
                icon: 'error',
                title: 'Erreur de chargement',
                text: 'Impossible de charger les données nécessaires.',
                confirmButtonColor: '#ef4444'
            });
        } finally {
            setIsLoadingData(false);
        }
    };

    const handleInputChange = (name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        // Vérification des données nécessaires
        if (!matiere || !matiere.id) {
            Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: 'Données de la matière manquantes. Impossible de sauvegarder.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        if (!formData.code.trim() || !formData.libelle.trim()) {
            Swal.fire({
                icon: 'warning',
                title: 'Champs requis',
                text: 'Veuillez remplir le code et le libellé avant de sauvegarder.',
                confirmButtonColor: '#10b981'
            });
            return;
        }

        // Demande de confirmation avec SweetAlert
        const result = await Swal.fire({
            title: 'Confirmer la modification',
            text: `Êtes-vous sûr de vouloir modifier la matière "${formData.libelle}" ?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#10b981',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Oui, modifier',
            cancelButtonText: 'Annuler',
            reverseButtons: true
        });

        if (!result.isConfirmed) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Préparation des données pour l'API en conservant la structure originale
            const apiData = {
                ...matiere, // Garder toutes les données originales
                code: formData.code,
                libelle: formData.libelle,
                numOrdre: parseInt(formData.numOrdre) || 1,
                pec: formData.pec ? 1 : 0,
                bonus: formData.bonus ? 1 : 0,
                
                // Mettre à jour la catégorie si changée
                categorie: formData.categorieId ? {
                    ...matiere.categorie,
                    id: formData.categorieId
                } : matiere.categorie,
                
                // Ajouter la matière parent si sélectionnée
                matiereParent: formData.matiereParentId ? {
                    id: formData.matiereParentId
                } : { id: null }
            };

            const response = await axios.post(
                apiUrls.matieres.updateDisplay(),
                apiData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 10000
                }
            );

            if (response.status === 200 || response.status === 201) {
                await Swal.fire({
                    icon: 'success',
                    title: 'Matière modifiée !',
                    text: `La matière "${formData.libelle}" a été modifiée avec succès.`,
                    confirmButtonColor: '#10b981',
                    timer: 3000,
                    showConfirmButton: true
                });

                if (onSave) {
                    onSave({
                        matiere: apiData,
                        formData,
                        apiResponse: response.data
                    });
                }

                onClose();
            } else {
                throw new Error(`Réponse inattendue du serveur: ${response.status}`);
            }

        } catch (error) {
            console.error('Erreur lors de la modification de la matière:', error);

            let errorMessage = 'Une erreur inattendue est survenue lors de la modification.';
            
            if (error.response) {
                if (error.response.status === 400) {
                    errorMessage = 'Données invalides. Vérifiez les informations saisies.';
                } else if (error.response.status === 401) {
                    errorMessage = 'Non autorisé. Vérifiez vos permissions.';
                } else if (error.response.status === 404) {
                    errorMessage = 'Matière non trouvée ou service indisponible.';
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
                title: 'Erreur de modification',
                text: errorMessage,
                confirmButtonColor: '#ef4444',
                footer: error.response?.data?.details ? `Détails: ${error.response.data.details}` : null
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!matiere) return null;

    // Extraction du code et libellé pour l'avatar
    const getInitials = (code, libelle) => {
        if (code && code.length >= 2) return code.slice(0, 2).toUpperCase();
        if (libelle) return libelle.slice(0, 2).toUpperCase();
        return 'MT';
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
            <div>
                <Text style={{
                    color: '#0f172a',
                    fontWeight: '600',
                    fontSize: '14px',
                    lineHeight: '1.2'
                }}>
                    {value || 'Non renseigné'}
                </Text>
            </div>
        </div>
    );

    return (
        <Modal 
            open={show} 
            onClose={onClose}
            size="lg"
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
                        {getInitials(matiere?.code, matiere?.libelle)}
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <Text size="lg" weight="semibold" style={{ color: '#0f172a', marginBottom: '4px' }}>
                            {matiere?.libelle || 'Matière'}
                        </Text>
                        <Badge style={{ 
                            background: '#f1f5f9', 
                            color: '#475569',
                            fontWeight: '500',
                            border: '1px solid #e2e8f0'
                        }}>
                            {matiere?.code || 'CODE'}
                        </Badge>
                        {/* <div style={{ marginTop: '8px' }}>
                            <Text size="sm" style={{ color: '#94a3b8' }}>
                                ID: {matiere?.id || 'Non défini'}
                            </Text>
                        </div> */}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FiEdit size={20} style={{ color: '#6366f1' }} />
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Modifier une Matière
                        </Text>
                    </div>
                </div>
            </Modal.Header>
            
            <Modal.Body style={{ 
                padding: '32px 24px', 
                background: '#fafafa'
            }}>
                {/* Informations actuelles de la matière */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Informations actuelles
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
                                    icon={FiTag}
                                    title="Catégorie"
                                    value={matiere?.categorie?.libelle || 'Non définie'}
                                    color="#f59e0b"
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiGrid}
                                    title="Ordre"
                                    value={matiere?.numOrdre || '1'}
                                    color="#ef4444"
                                />
                            </Col>
                            <Col xs={8}>
                                <InfoCard
                                    icon={FiAward}
                                    title="Statut"
                                    value={`PEC: ${matiere?.pec === 1 ? 'Activé' : 'Désactivé'} | Bonus: ${matiere?.bonus === 1 ? 'Activé' : 'Désactivé'}`}
                                    color="#10b981"
                                />
                            </Col>
                        </Row>
                        <Row gutter={16} style={{ marginTop: '16px' }}>
                            <Col xs={12}>
                                <InfoCard
                                    icon={FiBookOpen}
                                    title="École"
                                    value={matiere?.ecole?.libelle || 'Non définie'}
                                    color="#6366f1"
                                />
                            </Col>
                            <Col xs={12}>
                                <InfoCard
                                    icon={FiTag}
                                    title="Matière parente"
                                    value={matiere?.matiere?.parentMatiereLibelle || 'Aucune'}
                                    color="#8b5cf6"
                                />
                            </Col>
                        </Row>
                    </Grid>
                </Panel>

                {/* Formulaire de modification */}
                <Panel
                    header={
                        <Text size="md" weight="semibold" style={{ color: '#1e293b' }}>
                            Modifier les informations
                        </Text>
                    }
                    style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #f1f5f9',
                        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    bodyStyle={{ padding: '20px' }}
                >
                    <Form fluid className='mt-3'>
                        <Grid fluid>
                            <Row gutter={16}>
                                <Col xs={24} sm={8}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiHash size={14} style={{ marginRight: '6px' }} />
                                            Code <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input 
                                            value={formData.code}
                                            onChange={(value) => handleInputChange('code', value)}
                                            placeholder="Ex: 01"
                                            disabled={isSubmitting || isLoadingData}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={24} sm={8}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiType size={14} style={{ marginRight: '6px' }} />
                                            Libellé <span style={{color: '#ef4444'}}>*</span>
                                        </Form.ControlLabel>
                                        <Input 
                                            value={formData.libelle}
                                            onChange={(value) => handleInputChange('libelle', value)}
                                            placeholder="Ex: FRANCAIS"
                                            disabled={isSubmitting || isLoadingData}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={24} sm={8}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiGrid size={14} style={{ marginRight: '6px' }} />
                                            Numéro d'ordre
                                        </Form.ControlLabel>
                                        <Input 
                                            type="number"
                                            value={formData.numOrdre}
                                            onChange={(value) => handleInputChange('numOrdre', value)}
                                            placeholder="1"
                                            disabled={isSubmitting || isLoadingData}
                                            style={{
                                                borderRadius: '8px',
                                                border: '1px solid #e2e8f0',
                                                padding: '12px',
                                                fontSize: '14px'
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                

                                <Col xs={24} sm={12}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiTag size={14} style={{ marginRight: '6px' }} />
                                            Catégorie Matière
                                        </Form.ControlLabel>
                                        <SelectPicker 
                                            data={categories}
                                            value={formData.categorieId}
                                            onChange={(value) => handleInputChange('categorieId', value)}
                                            placeholder="Sélectionner une catégorie"
                                            disabled={isSubmitting || isLoadingData}
                                            loading={isLoadingData}
                                            style={{ width: '100%' }}
                                            cleanable={false}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col xs={24} sm={12}>
                                    <Form.Group style={{ marginBottom: '20px' }}>
                                        <Form.ControlLabel style={{ 
                                            fontWeight: '500',
                                            color: '#374151',
                                            marginBottom: '8px'
                                        }}>
                                            <FiBookOpen size={14} style={{ marginRight: '6px' }} />
                                            Matière parent
                                        </Form.ControlLabel>
                                        <SelectPicker 
                                            data={matieresParent}
                                            value={formData.matiereParentId}
                                            onChange={(value) => handleInputChange('matiereParentId', value)}
                                            placeholder="Sélectionner la matière parent"
                                            disabled={true} //isSubmitting || isLoadingData
                                            loading={isLoadingData}
                                            style={{ width: '100%' }}
                                            cleanable={true}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Row gutter={16}>
                                <Col xs={24} sm={12}>
                                    <div style={{
                                        background: '#f0f9ff',
                                        border: '1px solid #bae6fd',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <Text weight="semibold" style={{ color: '#0c4a6e', marginBottom: '4px' }}>
                                                P.E.C
                                            </Text>
                                            <Text size="sm" style={{ color: '#0369a1' }}>
                                                Prise En Compte dans le calcul des moyennes générales
                                            </Text>
                                        </div>
                                        <Toggle 
                                            checked={formData.pec}
                                            onChange={(checked) => handleInputChange('pec', checked)}
                                            disabled={isSubmitting || isLoadingData}
                                            size="lg"
                                        />
                                    </div>
                                </Col>

                                <Col xs={24} sm={12}>
                                    <div style={{
                                        background: '#fef3c7',
                                        border: '1px solid #fed7aa',
                                        borderRadius: '8px',
                                        padding: '16px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div>
                                            <Text weight="semibold" style={{ color: '#92400e', marginBottom: '4px' }}>
                                                Bonus?
                                            </Text>
                                            <Text size="sm" style={{ color: '#d97706' }}>
                                                Points bonus accordés pour cette matière
                                            </Text>
                                        </div>
                                        <Toggle 
                                            checked={formData.bonus}
                                            onChange={(checked) => handleInputChange('bonus', checked)}
                                            disabled={isSubmitting || isLoadingData}
                                            size="lg"
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Grid>
                    </Form>
                </Panel>
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
                        disabled={isSubmitting}
                        style={{
                            color: '#64748b',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            padding: '8px 16px'
                        }}
                    >
                        Annuler
                    </Button>
                    <Button 
                        appearance="primary" 
                        onClick={handleSave}
                        startIcon={<FiSave />}
                        loading={isSubmitting}
                        disabled={isSubmitting || isLoadingData}
                        style={{
                            background: isSubmitting ? '#94a3b8' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 20px',
                            fontWeight: '600'
                        }}
                    >
                        {isSubmitting ? 'Modification en cours...' : 'Modifier'}
                    </Button>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default EditMatiereModal;