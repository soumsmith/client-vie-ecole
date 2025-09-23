// downloadUtils.js - Utilitaire unifié pour tous les téléchargements
import axios from 'axios';

/**
 * Fonction unifiée pour télécharger tous types de fichiers
 */
export const downloadFileFromUrl = async (url, filename, options = {}) => {
    const {
        timeout = 120000,
        showProgress = false,
        onProgress = null,
        expectedContentType = null
    } = options;

    try {
        console.log('📡 Début du téléchargement:', url);
        console.log('📁 Nom de fichier:', filename);

        // Configuration de la requête axios
        const axiosConfig = {
            method: 'GET',
            url: url,
            responseType: 'blob',
            timeout: timeout,
            headers: {
                'Accept': 'application/pdf, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/octet-stream, */*',
                'Cache-Control': 'no-cache'
            }
        };

        // Ajouter le suivi de progression si demandé
        if (showProgress && onProgress) {
            axiosConfig.onDownloadProgress = (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                onProgress(percentCompleted);
            };
        }

        const response = await axios(axiosConfig);

        console.log('📊 Réponse status:', response.status);
        console.log('📊 Content-Type:', response.headers['content-type']);
        console.log('📊 Taille du blob:', response.data.size);

        // Vérifications de sécurité
        if (!response.data || response.data.size === 0) {
            throw new Error('Le fichier généré est vide. Vérifiez les paramètres ou réessayez.');
        }

        // Vérifier le type de contenu si spécifié
        const contentType = response.headers['content-type'] || '';
        if (expectedContentType && !contentType.includes(expectedContentType)) {
            console.warn('⚠️ Type de contenu inattendu:', contentType);
        }

        // Créer le blob avec le bon type MIME
        const blob = new Blob([response.data], {
            type: contentType || 'application/octet-stream'
        });

        console.log('📦 Blob créé, taille finale:', blob.size);

        // Déclencher le téléchargement
        const success = await triggerDownload(blob, filename);
        
        if (success) {
            console.log('✅ Téléchargement réussi');
            return { 
                success: true, 
                filename, 
                size: blob.size,
                contentType: contentType 
            };
        } else {
            throw new Error('Échec du déclenchement du téléchargement');
        }

    } catch (error) {
        console.error('❌ Erreur de téléchargement:', error);
        
        // Gestion d'erreurs spécifiques
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            throw new Error('Timeout: La génération du document prend trop de temps. Réessayez ou contactez l\'administrateur.');
        }
        
        if (error.response) {
            const status = error.response.status;
            console.error('❌ Status HTTP:', status);
            
            switch (status) {
                case 400:
                    throw new Error('Paramètres invalides. Vérifiez vos sélections.');
                case 401:
                    throw new Error('Non autorisé. Reconnectez-vous.');
                case 403:
                    throw new Error('Accès interdit à cette ressource.');
                case 404:
                    throw new Error('Document non trouvé. Vérifiez les paramètres sélectionnés.');
                case 500:
                    throw new Error('Erreur serveur lors de la génération. Réessayez dans quelques instants.');
                case 503:
                    throw new Error('Service temporairement indisponible. Réessayez plus tard.');
                default:
                    throw new Error(`Erreur HTTP ${status}: ${error.response.statusText}`);
            }
        }
        
        throw new Error(error.message || 'Erreur inconnue lors du téléchargement');
    }
};

/**
 * Déclenche le téléchargement d'un blob
 */
const triggerDownload = (blob, filename) => {
    return new Promise((resolve) => {
        try {
            // Méthode moderne avec URL.createObjectURL
            const downloadUrl = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = downloadUrl;
            link.download = filename;
            link.style.display = 'none';
            
            // Ajouter au DOM temporairement
            document.body.appendChild(link);
            
            // Déclencher le téléchargement
            link.click();
            
            // Nettoyer après un court délai
            setTimeout(() => {
                try {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(downloadUrl);
                } catch (cleanupError) {
                    console.warn('⚠️ Erreur lors du nettoyage:', cleanupError);
                }
                resolve(true);
            }, 100);
            
        } catch (error) {
            console.error('❌ Erreur lors du déclenchement:', error);
            resolve(false);
        }
    });
};

/**
 * Fonction spécialisée pour les téléchargements avec paramètres d'URL
 */
export const downloadFileWithParams = async (baseUrl, params = {}, filename, options = {}) => {
    // Construire l'URL avec les paramètres
    const url = new URL(baseUrl);
    Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
            url.searchParams.append(key, params[key]);
        }
    });
    
    return await downloadFileFromUrl(url.toString(), filename, options);
};

/**
 * Fonction pour télécharger depuis une URL simple (pour PrintModal)
 */
export const downloadFromSimpleUrl = async (url, filename) => {
    return await downloadFileFromUrl(url, filename, {
        timeout: 60000, // Timeout plus court pour les fiches
        expectedContentType: 'pdf'
    });
};

/**
 * Utilitaire pour nettoyer les noms de fichiers
 */
export const sanitizeFilename = (filename) => {
    return filename
        .replace(/[^a-zA-Z0-9\-_\.]/g, '_') // Remplacer les caractères spéciaux
        .replace(/_{2,}/g, '_') // Éviter les underscores multiples
        .replace(/^_|_$/g, ''); // Enlever les underscores en début/fin
};

/**
 * Utilitaire pour détecter le type de fichier depuis l'extension
 */
export const getExpectedContentType = (filename) => {
    const extension = filename.toLowerCase().split('.').pop();
    const contentTypes = {
        'pdf': 'application/pdf',
        'xls': 'application/vnd.ms-excel',
        'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'doc': 'application/msword'
    };
    return contentTypes[extension] || null;
};