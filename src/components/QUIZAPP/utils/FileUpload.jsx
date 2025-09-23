import React, { useState, useCallback } from 'react';
import { Button, Progress, Message } from 'rsuite';
import { FiUpload, FiX, FiFile, FiImage, FiVideo } from 'react-icons/fi';

/**
 * Composant pour l'upload de fichiers
 */
const FileUpload = ({ 
    exerciseType, 
    onFileSelect, 
    currentFile, 
    onFileRemove,
    disabled = false 
}) => {
    const [dragOver, setDragOver] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Obtient les types de fichiers acceptés selon le type d'exercice
     */
    const getAcceptedFileTypes = useCallback(() => {
        switch (exerciseType) {
            case 'image':
                return {
                    accept: 'image/*',
                    types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
                    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
                    maxSize: 5 * 1024 * 1024, // 5MB
                    label: 'Images (JPG, PNG, GIF, WebP)'
                };
            case 'video':
                return {
                    accept: 'video/*',
                    types: ['video/mp4', 'video/webm', 'video/ogg'],
                    extensions: ['.mp4', '.webm', '.ogg'],
                    maxSize: 100 * 1024 * 1024, // 100MB
                    label: 'Vidéos (MP4, WebM, OGG)'
                };
            case 'pdf':
                return {
                    accept: 'application/pdf',
                    types: ['application/pdf'],
                    extensions: ['.pdf'],
                    maxSize: 10 * 1024 * 1024, // 10MB
                    label: 'Fichiers PDF'
                };
            default:
                return {
                    accept: '*/*',
                    types: [],
                    extensions: [],
                    maxSize: 50 * 1024 * 1024, // 50MB
                    label: 'Tous les fichiers'
                };
        }
    }, [exerciseType]);

    /**
     * Valide le fichier sélectionné
     */
    const validateFile = useCallback((file) => {
        const fileConfig = getAcceptedFileTypes();
        
        // Vérifier la taille
        if (file.size > fileConfig.maxSize) {
            throw new Error(`Le fichier est trop volumineux. Taille maximum: ${(fileConfig.maxSize / 1024 / 1024).toFixed(1)}MB`);
        }

        // Vérifier le type si spécifié
        if (fileConfig.types.length > 0 && !fileConfig.types.includes(file.type)) {
            throw new Error(`Type de fichier non supporté. Types acceptés: ${fileConfig.label}`);
        }

        return true;
    }, [getAcceptedFileTypes]);

    /**
     * Simule l'upload du fichier (à remplacer par votre logique d'upload)
     */
    const uploadFile = useCallback(async (file) => {
        setUploading(true);
        setUploadProgress(0);
        setError(null);

        try {
            // Simulation d'un upload avec progression
            const formData = new FormData();
            formData.append('file', file);
            formData.append('exercise_type', exerciseType);

            // Simulation de progression
            for (let i = 0; i <= 100; i += 10) {
                setUploadProgress(i);
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // TODO: Remplacer par votre logique d'upload réelle
            // const response = await fetch('/api/upload', {
            //     method: 'POST',
            //     body: formData
            // });
            // const result = await response.json();

            // Simulation d'une réponse d'upload réussie
            const mockResult = {
                success: true,
                file_url: URL.createObjectURL(file),
                file_name: file.name,
                file_size: file.size,
                file_type: file.type
            };

            onFileSelect({
                file: file,
                url: mockResult.file_url,
                name: mockResult.file_name,
                size: mockResult.file_size,
                type: mockResult.file_type
            });

        } catch (err) {
            setError(err.message);
        } finally {
            setUploading(false);
            setUploadProgress(0);
        }
    }, [exerciseType, onFileSelect]);

    /**
     * Gère la sélection de fichier
     */
    const handleFileSelect = useCallback(async (file) => {
        try {
            validateFile(file);
            await uploadFile(file);
        } catch (err) {
            setError(err.message);
        }
    }, [validateFile, uploadFile]);

    /**
     * Gère le changement de fichier via input
     */
    const handleFileChange = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            handleFileSelect(file);
        }
    }, [handleFileSelect]);

    /**
     * Gère le drag & drop
     */
    const handleDrop = useCallback((event) => {
        event.preventDefault();
        setDragOver(false);
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    }, [handleFileSelect]);

    const handleDragOver = useCallback((event) => {
        event.preventDefault();
        setDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setDragOver(false);
    }, []);

    /**
     * Supprime le fichier sélectionné
     */
    const handleRemoveFile = useCallback(() => {
        onFileRemove();
        setError(null);
    }, [onFileRemove]);

    /**
     * Obtient l'icône selon le type de fichier
     */
    const getFileIcon = useCallback(() => {
        switch (exerciseType) {
            case 'image':
                return <FiImage size={24} />;
            case 'video':
                return <FiVideo size={24} />;
            default:
                return <FiFile size={24} />;
        }
    }, [exerciseType]);

    /**
     * Formate la taille du fichier
     */
    const formatFileSize = useCallback((bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }, []);

    const fileConfig = getAcceptedFileTypes();

    return (
        <div style={{ width: '100%' }}>
            {!currentFile ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    style={{
                        border: `2px dashed ${dragOver ? '#007bff' : '#dee2e6'}`,
                        borderRadius: '8px',
                        padding: '32px 16px',
                        textAlign: 'center',
                        backgroundColor: dragOver ? '#f8f9fa' : '#ffffff',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.6 : 1,
                        transition: 'all 0.2s ease'
                    }}
                    onClick={() => !disabled && document.getElementById('file-input').click()}
                >
                    <div style={{ marginBottom: '16px' }}>
                        {getFileIcon()}
                    </div>
                    
                    <h6 style={{ marginBottom: '8px', color: '#495057' }}>
                        {dragOver ? 'Déposez le fichier ici' : 'Cliquez pour sélectionner ou glissez-déposez'}
                    </h6>
                    
                    <p style={{ margin: '0 0 16px 0', color: '#6c757d', fontSize: '14px' }}>
                        {fileConfig.label}
                    </p>
                    
                    <p style={{ margin: 0, color: '#6c757d', fontSize: '12px' }}>
                        Taille maximum: {(fileConfig.maxSize / 1024 / 1024).toFixed(1)}MB
                    </p>

                    <input
                        id="file-input"
                        type="file"
                        accept={fileConfig.accept}
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                        disabled={disabled}
                    />
                </div>
            ) : (
                <div style={{
                    border: '1px solid #dee2e6',
                    borderRadius: '8px',
                    padding: '16px',
                    backgroundColor: '#f8f9fa'
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {getFileIcon()}
                            <div>
                                <div style={{ fontWeight: '500', color: '#495057' }}>
                                    {currentFile.name}
                                </div>
                                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                    {formatFileSize(currentFile.size)}
                                </div>
                            </div>
                        </div>
                        
                        <Button
                            appearance="subtle"
                            size="sm"
                            startIcon={<FiX />}
                            onClick={handleRemoveFile}
                            disabled={disabled}
                        >
                            Supprimer
                        </Button>
                    </div>
                </div>
            )}

            {uploading && (
                <div style={{ marginTop: '16px' }}>
                    <Progress 
                        percent={uploadProgress} 
                        strokeColor="#007bff"
                        showInfo={true}
                        status="active"
                    />
                    <p style={{ 
                        margin: '8px 0 0 0', 
                        fontSize: '14px', 
                        color: '#6c757d',
                        textAlign: 'center'
                    }}>
                        Upload en cours...
                    </p>
                </div>
            )}

            {error && (
                <div style={{ marginTop: '16px' }}>
                    <Message type="error" showIcon>
                        {error}
                    </Message>
                </div>
            )}
        </div>
    );
};

export default FileUpload;