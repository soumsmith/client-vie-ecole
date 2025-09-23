import React from 'react';
import { Modal, Button, Form, Input, Badge, SelectPicker } from 'rsuite';

const CourseModal = ({ modalState, onClose, onSave, referenceData, formData, updateFormField }) => {
    const { isOpen, type, selectedCourse } = modalState; // Changé de selectedQuestion à selectedCourse

    const getModalTitle = () => {
        switch (type) {
            case 'view':
                return 'Détails du cours';
            case 'edit':
                return 'Modifier le cours';
            case 'delete':
                return 'Supprimer le cours';
            case 'create':
                return 'Créer un nouveau cours';
            default:
                return 'Cours';
        }
    };

    const handleFormChange = (value, name) => {
        if (updateFormField) {
            updateFormField(name, value);
        }
    };

    const renderModalContent = () => {
        if (!selectedCourse && type !== 'create') {
            return <div>Aucun cours sélectionné</div>;
        }

        switch (type) {
            case 'view':
                return (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                ID du cours
                            </label>
                            <Badge color="blue">#{selectedCourse.id}</Badge>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Titre du cours
                            </label>
                            <p className="text-gray-900 font-medium">{selectedCourse.title}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Description
                            </label>
                            <p className="text-gray-700">{selectedCourse.description}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Instructeur
                            </label>
                            <p className="text-gray-700">{selectedCourse.instructor_name}</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Durée estimée
                            </label>
                            <p className="text-gray-700">{selectedCourse.estimated_duration} minutes</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prix
                            </label>
                            <p className="text-gray-700">{selectedCourse.price}€</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Premium
                            </label>
                            <Badge color={selectedCourse.is_premium === 1 ? 'orange' : 'gray'}>
                                {selectedCourse.is_premium === 1 ? 'Premium' : 'Gratuit'}
                            </Badge>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Statut
                            </label>
                            <Badge color={selectedCourse.active === 1 ? 'green' : 'red'}>
                                {selectedCourse.active === 1 ? 'Actif' : 'Inactif'}
                            </Badge>
                        </div>
                    </div>
                );

            case 'edit':
                return (
                    <Form>
                        <Form.Group>
                            <Form.ControlLabel>Titre du cours</Form.ControlLabel>
                            <Form.Control
                                name="title"
                                defaultValue={selectedCourse?.title || ''}
                                placeholder="Titre du cours"
                                onChange={(value) => handleFormChange(value, 'title')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Description</Form.ControlLabel>
                            <Input
                                as="textarea"
                                rows={4}
                                defaultValue={selectedCourse?.description || ''}
                                placeholder="Description du cours"
                                onChange={(value) => handleFormChange(value, 'description')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Instructeur</Form.ControlLabel>
                            <Form.Control
                                name="instructor_name"
                                defaultValue={selectedCourse?.instructor_name || ''}
                                placeholder="Nom de l'instructeur"
                                onChange={(value) => handleFormChange(value, 'instructor_name')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Durée estimée (minutes)</Form.ControlLabel>
                            <Form.Control
                                name="estimated_duration"
                                type="number"
                                defaultValue={selectedCourse?.estimated_duration || 0}
                                placeholder="Durée en minutes"
                                onChange={(value) => handleFormChange(value, 'estimated_duration')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Prix (€)</Form.ControlLabel>
                            <Form.Control
                                name="price"
                                type="number"
                                step="0.01"
                                defaultValue={selectedCourse?.price || 0}
                                placeholder="Prix du cours"
                                onChange={(value) => handleFormChange(value, 'price')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Premium</Form.ControlLabel>
                            <SelectPicker
                                name="is_premium"
                                defaultValue={selectedCourse?.is_premium || 0}
                                placeholder="Sélectionner le type"
                                data={[
                                    { label: 'Gratuit', value: 0 },
                                    { label: 'Premium', value: 1 }
                                ]}
                                style={{ width: '100%' }}
                                onChange={(value) => handleFormChange(value, 'is_premium')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Statut</Form.ControlLabel>
                            <SelectPicker
                                name="active"
                                defaultValue={selectedCourse?.active || 1}
                                placeholder="Sélectionner le statut"
                                data={[
                                    { label: 'Actif', value: 1 },
                                    { label: 'Inactif', value: 0 }
                                ]}
                                style={{ width: '100%' }}
                                onChange={(value) => handleFormChange(value, 'active')}
                            />
                        </Form.Group>
                    </Form>
                );

            case 'delete':
                return (
                    <div className="space-y-4">
                        <div className="bg-red-50 border border-red-200 rounded-md p-4">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">
                                        Attention
                                    </h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>
                                            Êtes-vous sûr de vouloir supprimer ce cours ? Cette action est irréversible.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-4 rounded-md">
                            <h4 className="font-medium text-gray-900 mb-2">Cours à supprimer :</h4>
                            <p className="text-sm text-gray-700">
                                <strong>ID:</strong> {selectedCourse.id}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Titre:</strong> {selectedCourse.title}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Description:</strong> {selectedCourse.description}
                            </p>
                            <p className="text-sm text-gray-700">
                                <strong>Instructeur:</strong> {selectedCourse.instructor_name}
                            </p>
                        </div>
                    </div>
                );

            case 'create':
                return (
                    <Form>
                        <Form.Group>
                            <Form.ControlLabel>Titre du cours</Form.ControlLabel>
                            <Form.Control
                                name="title"
                                placeholder="Titre du cours"
                                required
                                onChange={(value) => handleFormChange(value, 'title')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Description</Form.ControlLabel>
                            <Input
                                as="textarea"
                                rows={4}
                                placeholder="Description du cours"
                                required
                                onChange={(value) => handleFormChange(value, 'description')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Instructeur</Form.ControlLabel>
                            <Form.Control
                                name="instructor_name"
                                placeholder="Nom de l'instructeur"
                                required
                                onChange={(value) => handleFormChange(value, 'instructor_name')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Durée estimée (minutes)</Form.ControlLabel>
                            <Form.Control
                                name="estimated_duration"
                                type="number"
                                placeholder="Durée en minutes"
                                defaultValue={0}
                                onChange={(value) => handleFormChange(value, 'estimated_duration')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Prix (€)</Form.ControlLabel>
                            <Form.Control
                                name="price"
                                type="number"
                                step="0.01"
                                placeholder="Prix du cours"
                                defaultValue={0}
                                onChange={(value) => handleFormChange(value, 'price')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Premium</Form.ControlLabel>
                            <SelectPicker
                                name="is_premium"
                                defaultValue={0}
                                placeholder="Sélectionner le type"
                                data={[
                                    { label: 'Gratuit', value: 0 },
                                    { label: 'Premium', value: 1 }
                                ]}
                                style={{ width: '100%' }}
                                onChange={(value) => handleFormChange(value, 'is_premium')}
                            />
                        </Form.Group>

                        <Form.Group>
                            <Form.ControlLabel>Statut</Form.ControlLabel>
                            <SelectPicker
                                name="active"
                                defaultValue={1}
                                placeholder="Sélectionner le statut"
                                data={[
                                    { label: 'Actif', value: 1 },
                                    { label: 'Inactif', value: 0 }
                                ]}
                                style={{ width: '100%' }}
                                onChange={(value) => handleFormChange(value, 'active')}
                            />
                        </Form.Group>
                    </Form>
                );

            default:
                return null;
        }
    };

    const getButtonColor = () => {
        switch (type) {
            case 'delete':
                return 'red';
            case 'edit':
                return 'blue';
            case 'create':
                return 'green';
            default:
                return 'blue';
        }
    };

    const getButtonText = () => {
        switch (type) {
            case 'delete':
                return 'Supprimer';
            case 'edit':
                return 'Modifier';
            case 'create':
                return 'Créer';
            case 'view':
                return 'Fermer';
            default:
                return 'OK';
        }
    };

    return (
        <Modal open={isOpen} onClose={onClose} size="md">
            <Modal.Header>
                <Modal.Title>{getModalTitle()}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {renderModalContent()}
            </Modal.Body>

            <Modal.Footer>
                <Button onClick={onClose} appearance="subtle">
                    Annuler
                </Button>
                <Button 
                    onClick={onSave} 
                    appearance="primary" 
                    color={getButtonColor()}
                >
                    {getButtonText()}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CourseModal;