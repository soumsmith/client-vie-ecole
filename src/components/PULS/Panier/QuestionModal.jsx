import React, { useCallback } from 'react';
import { Modal, Button, Panel, FlexboxGrid } from 'rsuite';
import { FiSave, FiTrash2, FiPlus, FiAlertCircle } from 'react-icons/fi';
import SelectPicker from "rsuite/SelectPicker";

/**
 * Composant Modal réutilisable pour les questions
 */
const QuestionModal = ({ 
    modalState, 
    onClose, 
    onSave, 
    referenceData 
}) => {
    /**
     * Retourne le titre du modal selon le type
     */
    const getModalTitle = useCallback(() => {
        switch (modalState.type) {
            case 'view': return 'Détails de la question';
            case 'edit': return 'Modifier la question';
            case 'delete': return 'Supprimer la question';
            case 'create': return 'Créer une question';
            default: return 'Question';
        }
    }, [modalState.type]);

    /**
     * Rendu du contenu du modal selon le type
     */
    const renderModalContent = useCallback(() => {
        if (!modalState.selectedQuestion && modalState.type !== 'create') return null;

        switch (modalState.type) {
            case 'view':
                return renderViewContent();
            case 'edit':
                return renderEditContent();
            case 'delete':
                return renderDeleteContent();
            case 'create':
                return renderCreateContent();
            default:
                return <div>Type de modal non reconnu</div>;
        }
    }, [modalState.selectedQuestion, modalState.type]);

    /**
     * Rendu du contenu en mode visualisation
     */
    const renderViewContent = () => {
        const item = modalState.selectedQuestion;
        
        switch (modalState.context) {
            case 'questions':
                return (
                    <div>
                        <Panel header="Informations générales" bordered style={{ marginBottom: '16px' }}>
                            <FlexboxGrid>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Type:</strong> {item.type_display}</p>
                                    <p><strong>Domaine:</strong> {item.domain_display}</p>
                                    <p><strong>Difficulté:</strong> {item.difficulty_display}</p>
                                </FlexboxGrid.Item>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Points:</strong> {item.points}</p>
                                    <p><strong>Réponses:</strong> {item.answers_summary}</p>
                                    <p><strong>Date de création:</strong> {item.created_date}</p>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                        </Panel>

                        <Panel header="Contenu de la question" bordered>
                            <div style={{
                                padding: '12px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '4px',
                                fontSize: '14px',
                                lineHeight: '1.6'
                            }}>
                                {item.content}
                            </div>
                            {item.explanation && (
                                <div style={{ marginTop: '12px' }}>
                                    <strong>Explication:</strong>
                                    <div style={{
                                        padding: '8px',
                                        backgroundColor: '#fff3cd',
                                        borderRadius: '4px',
                                        marginTop: '4px',
                                        fontSize: '13px'
                                    }}>
                                        {item.explanation}
                                    </div>
                                </div>
                            )}
                        </Panel>
                    </div>
                );

            case 'domains':
                return (
                    <div>
                        <Panel header="Informations du domaine" bordered>
                            <p><strong>Nom:</strong> {item.name}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            <p><strong>Niveau Premium:</strong> {item.premium_level_name}</p>
                            {item.icon && <p><strong>Icône:</strong> {item.icon}</p>}
                            {item.color && (
                                <p><strong>Couleur:</strong> 
                                    <span style={{
                                        display: 'inline-block',
                                        width: '20px',
                                        height: '20px',
                                        backgroundColor: item.color,
                                        marginLeft: '8px',
                                        borderRadius: '4px'
                                    }}></span>
                                </p>
                            )}
                        </Panel>
                    </div>
                );

            case 'courses':
                return (
                    <div>
                        <Panel header="Informations du cours" bordered>
                            <p><strong>Titre:</strong> {item.title}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            <p><strong>Instructeur:</strong> {item.instructor_name}</p>
                            <p><strong>Domaine:</strong> {item.domain_name}</p>
                            <p><strong>Sous-domaine:</strong> {item.sub_domain_name}</p>
                            <p><strong>Niveau d'éducation:</strong> {item.education_level_name}</p>
                            <p><strong>Nombre de leçons:</strong> {item.total_lessons}</p>
                        </Panel>
                    </div>
                );

            case 'lessons':
                return (
                    <div>
                        <Panel header="Informations de la leçon" bordered>
                            <p><strong>Titre:</strong> {item.title}</p>
                            <p><strong>Description:</strong> {item.description}</p>
                            <p><strong>Cours:</strong> {item.course_title}</p>
                            <p><strong>Type:</strong> {item.lesson_type}</p>
                            <p><strong>Durée estimée:</strong> {item.estimated_duration} minutes</p>
                        </Panel>
                    </div>
                );

            default:
                return (
                    <div>
                        <Panel header="Informations générales" bordered style={{ marginBottom: '16px' }}>
                            <FlexboxGrid>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Type:</strong> {item.type_display}</p>
                                    <p><strong>Domaine:</strong> {item.domain_display}</p>
                                    <p><strong>Difficulté:</strong> {item.difficulty_display}</p>
                                </FlexboxGrid.Item>
                                <FlexboxGrid.Item colspan={12}>
                                    <p><strong>Points:</strong> {item.points}</p>
                                    <p><strong>ID:</strong> {item.id}</p>
                                </FlexboxGrid.Item>
                            </FlexboxGrid>
                            <div style={{ marginTop: '16px' }}>
                                <strong>Contenu:</strong>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '4px',
                                    marginTop: '8px'
                                }}>
                                    {item.content}
                                </div>
                            </div>
                        </Panel>
                    </div>
                );
        }
    };

    /**
     * Rendu du contenu en mode édition
     */
    const renderEditContent = () => (
        <div>
            <h5>Modifier la question #{modalState.selectedQuestion.id}</h5>
            <div className="form-group mb-3">
                <label>Contenu de la question</label>
                <textarea
                    className="form-control"
                    rows="4"
                    defaultValue={modalState.selectedQuestion.content}
                />
            </div>
            <div className="row">
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label>Points</label>
                        <input
                            type="number"
                            className="form-control"
                            defaultValue={modalState.selectedQuestion.points}
                        />
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="form-group mb-3">
                        <label>Difficulté</label>
                        <SelectPicker
                            data={referenceData.difficultes}
                            style={{ width: "100%" }}
                            defaultValue={modalState.selectedQuestion.difficulty_id}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    /**
     * Rendu du contenu en mode suppression
     */
    const renderDeleteContent = () => (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <FiAlertCircle size={48} style={{ color: '#e74c3c', marginBottom: '16px' }} />
            <h5>Confirmer la suppression</h5>
            <p>Êtes-vous sûr de vouloir supprimer cette question ?</p>
            <div style={{
                backgroundColor: '#f8d7da',
                padding: '12px',
                borderRadius: '4px',
                marginTop: '16px'
            }}>
                <strong>Question #{modalState.selectedQuestion.id}:</strong><br />
                {modalState.selectedQuestion.content_preview}
            </div>
            <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '12px' }}>
                Cette action est irréversible.
            </p>
        </div>
    );

    /**
     * Rendu du contenu en mode création
     */
    const renderCreateContent = () => (
        <div>
            <h5>Créer une nouvelle question</h5>
            <div className="form-group mb-3">
                <label>Contenu de la question</label>
                <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Saisissez le contenu de la question..."
                />
            </div>
            <div className="row">
                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Type</label>
                        <SelectPicker
                            data={referenceData.typesQuestion}
                            style={{ width: "100%" }}
                            placeholder="Sélectionnez le type"
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Domaine</label>
                        <SelectPicker
                            data={referenceData.domaines}
                            style={{ width: "100%" }}
                            placeholder="Sélectionnez le domaine"
                        />
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="form-group mb-3">
                        <label>Points</label>
                        <input
                            type="number"
                            className="form-control"
                            placeholder="Points"
                            min="1"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    /**
     * Retourne les boutons du modal selon le type
     */
    const getModalButtons = useCallback(() => {
        const baseButtons = [
            <Button key="cancel" onClick={onClose} appearance="subtle">
                Annuler
            </Button>
        ];

        switch (modalState.type) {
            case 'view':
                return baseButtons;

            case 'edit':
                return [
                    ...baseButtons,
                    <Button
                        key="save"
                        onClick={onSave}
                        appearance="primary"
                        startIcon={<FiSave />}
                    >
                        Sauvegarder
                    </Button>
                ];

            case 'delete':
                return [
                    ...baseButtons,
                    <Button
                        key="delete"
                        onClick={onSave}
                        appearance="primary"
                        color="red"
                        startIcon={<FiTrash2 />}
                    >
                        Supprimer
                    </Button>
                ];

            case 'create':
                return [
                    ...baseButtons,
                    <Button
                        key="create"
                        onClick={onSave}
                        appearance="primary"
                        startIcon={<FiPlus />}
                    >
                        Créer
                    </Button>
                ];

            default:
                return baseButtons;
        }
    }, [modalState.type, onClose, onSave]);

    return (
        <Modal
            open={modalState.show}
            onClose={onClose}
            size={modalState.type === 'view' ? "lg" : "md"}
        >
            <Modal.Header>
                <Modal.Title>{getModalTitle()}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {renderModalContent()}
            </Modal.Body>
            <Modal.Footer>
                {getModalButtons()}
            </Modal.Footer>
        </Modal>
    );
};

export default QuestionModal;