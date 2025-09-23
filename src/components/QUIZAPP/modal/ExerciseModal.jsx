import React from 'react';
import { Modal, Button, Form, Row, Col, Input, SelectPicker, InputNumber, Toggle } from 'rsuite';

const ExerciseModal = ({ 
    modalState, 
    onClose, 
    onSave, 
    referenceData, 
    formData, 
    updateFormField 
}) => {
    const { isOpen, type, selectedExercise } = modalState;

    // Configuration des titres selon le type d'action
    const getModalTitle = () => {
        switch (type) {
            case 'create':
                return 'Créer un nouvel exercice';
            case 'edit':
                return 'Modifier l\'exercice';
            case 'view':
                return 'Détails de l\'exercice';
            case 'delete':
                return 'Supprimer l\'exercice';
            default:
                return 'Exercice';
        }
    };

    const isReadOnly = type === 'view' || type === 'delete';
    const isDeleteMode = type === 'delete';

    return (
        <Modal
            open={isOpen}
            onClose={onClose}
            size="lg"
            backdrop="static"
        >
            <Modal.Header>
                <Modal.Title>{getModalTitle()}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {isDeleteMode ? (
                    <div className="alert alert-warning">
                        <h5>Attention !</h5>
                        <p>
                            Êtes-vous sûr de vouloir supprimer l'exercice 
                            <strong> "{selectedExercise?.title}" </strong> ?
                        </p>
                        <p className="text-muted">
                            Cette action est irréversible et supprimera définitivement l'exercice 
                            ainsi que toutes ses données associées.
                        </p>
                    </div>
                ) : (
                    <Form fluid>
                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Titre de l'exercice *</Form.ControlLabel>
                                    <Input
                                        value={formData.title}
                                        onChange={(value) => updateFormField('title', value)}
                                        placeholder="Saisissez le titre de l'exercice"
                                        disabled={isReadOnly}
                                    />
                                </Form.Group>
                            </Col>

                            <Col xs={24} md={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Type d'exercice</Form.ControlLabel>
                                    <SelectPicker
                                        value={formData.exercise_type}
                                        onChange={(value) => updateFormField('exercise_type', value)}
                                        placeholder="Sélectionnez le type"
                                        disabled={isReadOnly}
                                        data={[
                                            { value: 'text', label: 'Texte' },
                                            { value: 'pdf', label: 'PDF' },
                                            { value: 'image', label: 'Image' },
                                            { value: 'video', label: 'Vidéo' },
                                            { value: 'link', label: 'Lien' },
                                            { value: 'interactive', label: 'Interactif' },
                                            { value: 'mixed', label: 'Mixte' }
                                        ]}
                                        cleanable={false}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24}>
                                <Form.Group>
                                    <Form.ControlLabel>Description</Form.ControlLabel>
                                    <Input
                                        as="textarea"
                                        rows={4}
                                        value={formData.description}
                                        onChange={(value) => updateFormField('description', value)}
                                        placeholder="Décrivez l'exercice"
                                        disabled={isReadOnly}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={8}>
                                <Form.Group>
                                    <Form.ControlLabel>Points</Form.ControlLabel>
                                    <InputNumber
                                        value={formData.points}
                                        onChange={(value) => updateFormField('points', value)}
                                        min={1}
                                        max={100}
                                        disabled={isReadOnly}
                                    />
                                </Form.Group>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Group>
                                    <Form.ControlLabel>Durée estimée (minutes)</Form.ControlLabel>
                                    <InputNumber
                                        value={formData.estimated_duration}
                                        onChange={(value) => updateFormField('estimated_duration', value)}
                                        min={1}
                                        max={300}
                                        disabled={isReadOnly}
                                    />
                                </Form.Group>
                            </Col>

                            <Col xs={24} md={8}>
                                <Form.Group>
                                    <Form.ControlLabel>Difficulté</Form.ControlLabel>
                                    <SelectPicker
                                        value={formData.difficulty_id}
                                        onChange={(value) => updateFormField('difficulty_id', value)}
                                        placeholder="Sélectionnez la difficulté"
                                        disabled={isReadOnly}
                                        data={referenceData.difficulties?.map(difficulty => ({
                                            value: difficulty.id,
                                            label: difficulty.name
                                        })) || []}
                                        cleanable={false}
                                        style={{ width: '100%' }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row gutter={16}>
                            <Col xs={24} md={12}>
                                <Form.Group>
                                    <Form.ControlLabel>Auteur</Form.ControlLabel>
                                    <Input
                                        value={formData.author_name}
                                        onChange={(value) => updateFormField('author_name', value)}
                                        placeholder="Nom de l'auteur"
                                        disabled={isReadOnly}
                                    />
                                </Form.Group>
                            </Col>

                            <Col xs={24} md={12}>
                                <div style={{ marginTop: '30px' }}>
                                    <Row gutter={16}>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.ControlLabel>Obligatoire</Form.ControlLabel>
                                                <Toggle
                                                    checked={formData.is_mandatory}
                                                    onChange={(checked) => updateFormField('is_mandatory', checked)}
                                                    disabled={isReadOnly}
                                                />
                                            </Form.Group>
                                        </Col>
                                        <Col xs={12}>
                                            <Form.Group>
                                                <Form.ControlLabel>Interactif</Form.ControlLabel>
                                                <Toggle
                                                    checked={formData.is_interactive}
                                                    onChange={(checked) => updateFormField('is_interactive', checked)}
                                                    disabled={isReadOnly}
                                                />
                                            </Form.Group>
                                        </Col>
                                    </Row>
                                </div>
                            </Col>
                        </Row>

                        {selectedExercise && type === 'view' && (
                            <Row gutter={16}>
                                <Col xs={24}>
                                    <div className="alert alert-info">
                                        <h6>Statistiques d'utilisation</h6>
                                        <p>
                                            <strong>Tentatives totales :</strong> {selectedExercise.usage_stats?.total_attempts || 0}<br/>
                                            <strong>Réussites :</strong> {selectedExercise.usage_stats?.completions || 0}<br/>
                                            <strong>Taux de réussite :</strong> {
                                                selectedExercise.usage_stats?.total_attempts > 0 
                                                    ? `${Math.round((selectedExercise.usage_stats.completions / selectedExercise.usage_stats.total_attempts) * 100)}%`
                                                    : 'N/A'
                                            }
                                        </p>
                                        <h6>Associations</h6>
                                        <p>
                                            <strong>Domaines :</strong> {selectedExercise.associations_count?.domains || 0}<br/>
                                            <strong>Cours :</strong> {selectedExercise.associations_count?.courses || 0}<br/>
                                            <strong>Leçons :</strong> {selectedExercise.associations_count?.lessons || 0}<br/>
                                            <strong>Questions :</strong> {selectedExercise.associations_count?.questions || 0}
                                        </p>
                                    </div>
                                </Col>
                            </Row>
                        )}
                    </Form>
                )}
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    {isDeleteMode ? 'Annuler' : 'Fermer'}
                </Button>
                {!isReadOnly && (
                    <Button onClick={onSave} appearance={isDeleteMode ? 'primary' : 'primary'} color={isDeleteMode ? 'red' : 'blue'}>
                        {isDeleteMode ? 'Supprimer' : type === 'create' ? 'Créer' : 'Modifier'}
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    );
};

export default ExerciseModal;