/**
 * Service pour la gestion des leçons
 * Fichier : src/components/QUIZAPP/Lesson/lessonService.js
 */

import useFetchData from '../../hooks/useFetchData';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';
import { Badge, Toggle } from 'rsuite';


/**
 * Hook pour récupérer les leçons depuis l'API
 * @param {number} refreshTrigger - Déclencheur pour rafraîchir les données
 * @returns {Object} Les données des leçons, l'état du chargement, les erreurs et la fonction refetch
 */
export const useDomaineData = (refreshTrigger = 0) => {
    const { data: lessonsData, loading, error, refetch } = useFetchData(
        'domaineManager.php', 
        { action: "get_domains" },
        "data",
        refreshTrigger
    );
    // Traitement et formatage des données des leçons
    const processedLessons = lessonsData ? lessonsData.map(lesson => ({
        ...lesson,
        // Ajouter des propriétés formatées si nécessaire
        title_display: lesson.title || 'Titre non défini',
        description_display: lesson.description || 'Description non disponible',
        description_preview: lesson.description ? 
            (lesson.description.length > 100 ? 
                lesson.description.substring(0, 100) + '...' : 
                lesson.description) : 'Description non disponible',
        course_name: lesson.course_name || 'Cours non défini',
        order_display: lesson.order_index || 0
    })) : [];

    return { 
        lessons: processedLessons, 
        loading, 
        error, 
        refetch 
    };
};


export const useSubDomaineData = (refreshTrigger = 0) => {
    const { data: subDomainsData, loading, error, refetch } = useFetchData(
        'domaineManager.php', 
        { action: "get_all_sub_domains" },
        "data",
        refreshTrigger
    );
    // Traitement et formatage des données des sous-domaines
    const processedSubDomains = subDomainsData ? subDomainsData.map(subDomain => ({
        ...subDomain,
        // Ajouter des propriétés formatées si nécessaire
        name_display: subDomain.name || 'Nom non défini',
        description_display: subDomain.description || 'Description non disponible',
        description_preview: subDomain.description ? 
            (subDomain.description.length > 100 ? 
                subDomain.description.substring(0, 100) + '...' : 
                subDomain.description) : 'Description non disponible',
        domain_name_display: subDomain.domain_name || 'Domaine non défini',
        premium_level_name_display: subDomain.premium_level_name || 'Niveau non défini',
        is_premium_display: subDomain.is_premium ? 'Premium' : 'Gratuit',
        access_denied_display: subDomain.access_denied ? 'Accès refusé' : 'Accès autorisé',
        active_display: subDomain.active ? 'Actif' : 'Inactif'
    })) : [];

    return { 
        subDomains: processedSubDomains, 
        loading, 
        error, 
        refetch 
    };
};

export const useLevelDomainsData = (refreshTrigger = 0) => {
    const { data: levelsData, loading, error, refetch } = useFetchData(
        'api_education_levels.php', 
        {
            "action": "get_education_levels",
            "page": 1,
            "per_page": 100
        },
        "data",
        refreshTrigger,
    );
    // Traitement et formatage des données des niveaux

    const processedLevels = levelsData ? levelsData.map(level => ({
        ...level,
        name_display: level.name || 'Nom non défini',
        description_display: level.description || 'Description non disponible',
        description_preview: level.description
            ? (level.description.length > 100
                ? level.description.substring(0, 100) + '...'
                : level.description)
            : 'Description non disponible',
        category_display: level.category || 'Catégorie non définie',
        order_display: level.level_order || 0,
        active_display: level.active ? 'Actif' : 'Inactif'
    })) : [];


    return { 
        levelDomains: processedLevels, 
        loading, 
        error, 
        refetch 
    };
};

export const levelDomainsTableConfig_legacy = {
    columns: [
        {
            key: 'name',
            label: 'Nom du niveau',
            sortable: true,
            render: (value, item) => (
                <strong>{value}</strong>
            )
        },
        {
            key: 'category',
            label: 'Catégorie',
            sortable: true,
            render: (value) => {
                const categoryColors = {
                    'petite_enfance': 'pink',
                    'primaire': 'blue',
                    'college': 'green',
                    'lycee': 'orange',
                    'superieur': 'purple',
                    'formation_pro': 'cyan',
                    'formation_continue': 'yellow'
                };
                const categoryLabels = {
                    'petite_enfance': 'Petite Enfance',
                    'primaire': 'Primaire',
                    'college': 'Collège',
                    'lycee': 'Lycée',
                    'superieur': 'Supérieur',
                    'formation_pro': 'Formation Pro',
                    'formation_continue': 'Formation Continue'
                };
                return (
                    <Badge color={categoryColors[value] || 'gray'}>
                        {categoryLabels[value] || value}
                    </Badge>
                );
            }
        },
        {
            key: 'level_order',
            label: 'Ordre',
            sortable: true,
            render: (value) => (
                <Badge color="violet">{value}</Badge>
            )
        },
        {
            key: 'description',
            label: 'Description',
            sortable: false,
            render: (value) => (
                <span>{value}</span>
            )
        },
        {
            key: 'active',
            label: 'Statut',
            sortable: true,
            render: (value) => (
                <Badge color={value ? 'green' : 'red'}>
                    {value ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            render: (value) => (
                <span>#{value}</span>
            )
        }
    ],
    searchableFields: ['name', 'category', 'description'],
    filterConfigs: [
        {
            key: 'category',
            label: 'Catégorie',
            type: 'select',
            options: [
                { label: 'Petite Enfance', value: 'petite_enfance' },
                { label: 'Primaire', value: 'primaire' },
                { label: 'Collège', value: 'college' },
                { label: 'Lycée', value: 'lycee' },
                { label: 'Supérieur', value: 'superieur' },
                { label: 'Formation Pro', value: 'formation_pro' },
                { label: 'Formation Continue', value: 'formation_continue' }
            ]
        },
        {
            key: 'active',
            label: 'Statut',
            type: 'select',
            options: [
                { label: 'Actif', value: 1 },
                { label: 'Inactif', value: 0 }
            ]
        }
    ],
    actions: [
        {
            key: 'toggle_active',
            label: (item) => item.active ? 'Désactiver' : 'Activer',
            icon: (item) => item.active ? <FiToggleRight /> : <FiToggleLeft />,
            color: (item) => item.active ? 'orange' : 'green',
            position: 'row'
        },
        {
            key: 'delete',
            label: 'Supprimer',
            icon: <FiTrash2 />,
            color: 'red',
            position: 'row',
            confirm: true
        }
    ]
};


/**
 * Fonction pour récupérer les leçons d'un cours spécifique
 * @param {number} courseId - ID du cours
 * @returns {Promise<Array>} Liste des leçons du cours
 */
export const fetchLessonsByCourse = async (courseId) => {
    try {
        const response = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_lessons_by_course',
                course_id: courseId
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const apiResponse = await response.json();

        if (!apiResponse.success || !apiResponse.data) {
            throw new Error('Format de réponse API invalide');
        }

        return apiResponse.data;

    } catch (err) {
        console.error('Erreur lors du chargement des leçons:', err);
        throw err;
    }
};

/**
 * Fonction legacy pour récupérer toutes les leçons (compatibilité)
 * @param {Function} updateState - Fonction pour mettre à jour l'état
 * @param {boolean} preventLoadingState - Empêche le changement d'état de chargement
 * @returns {Promise<Array>} Liste des leçons
 */
export const fetchLessons = async (updateState, preventLoadingState = false) => {
    try {
        if (!preventLoadingState && updateState) {
            updateState({ loading: true, error: null });
        }

        const response = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                action: 'get_alllessons'
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }

        const apiResponse = await response.json();

        if (!apiResponse.success || !apiResponse.data) {
            throw new Error('Format de réponse API invalide');
        }

        // Traitement et formatage des données
        const processedData = apiResponse.data.map(lesson => ({
            ...lesson,
            title_display: lesson.title || 'Titre non défini',
            description_display: lesson.description || 'Description non disponible',
            description_preview: lesson.description ?
                (lesson.description.length > 100 ?
                    lesson.description.substring(0, 100) + '...' :
                    lesson.description) : 'Description non disponible',
            course_name: lesson.course_name || 'Cours non défini',
            order_display: lesson.order_index || 0
        }));

        if (updateState) {
            updateState({ data: processedData, loading: false });
        }

        return processedData;

    } catch (err) {
        console.error('Erreur lors du chargement des leçons:', err);
        if (updateState) {
            updateState({ 
                error: err.message, 
                loading: false 
            });
        }
        throw err;
    }
};

/**
 * Crée une nouvelle leçon
 * @param {Object} lessonData - Données de la leçon
 * @returns {Promise<Object>} Résultat de la création
 */
export const createLesson = async (lessonData) => {
    try {
        const response = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'create_lesson',
                ...lessonData
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la création');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la création de la leçon:', error);
        throw error;
    }
};

/**
 * Met à jour une leçon existante
 * @param {number} lessonId - ID de la leçon
 * @param {Object} lessonData - Nouvelles données de la leçon
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export const updateLesson = async (lessonId, lessonData) => {
    try {
        const response = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_lesson',
                id: lessonId,
                ...lessonData
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la mise à jour');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la leçon:', error);
        throw error;
    }
};

/**
 * Supprime une leçon
 * @param {number} lessonId - ID de la leçon à supprimer
 * @returns {Promise<Object>} Résultat de la suppression
 */
export const deleteLesson = async (lessonId) => {
    try {
        const response = await fetch('http://localhost/CRUDPHP/api/courses-api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'delete_lesson',
                id: lessonId
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la suppression');
        }

        return result;
    } catch (error) {
        console.error('Erreur lors de la suppression de la leçon:', error);
        throw error;
    }
};

/**
 * Met à jour uniquement le statut actif d'une leçon
 * @param {number} lessonId - ID de la leçon
 * @param {boolean|number} active - Nouveau statut (1 ou 0)
 * @returns {Promise<Object>} Résultat de la mise à jour
 */
export const updateLessonActiveStatus = async (lessonId, active) => {
    try {
        const response = await fetch('http://localhost/CRUDPHP/api/lesson_complete_api.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'update_lesson',
                id: lessonId,
                active: active ? 1 : 0
            })
        });

        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Erreur lors de la mise à jour du statut');
        }
        return result;
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut de la leçon:', error);
        throw error;
    }
};

export const lessonsTableConfig = {
    columns: [
        {
            title: 'Leçon',
            dataKey: 'name',
            flexGrow: 3,
            minWidth: 350, // ✅ Réduit de 400
            cellType: 'avatar',
            avatarGenerator: (rowData) => {
                if (rowData.name) return rowData.name.charAt(0).toUpperCase();
                return 'L';
            },
            avatarColor: '#e67e22',
            subField: 'description',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description',
            flexGrow: 3,
            minWidth: 300, // ✅ Réduit de 450
            cellType: 'text',
            sortable: true
        },
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    padding: '2px 8px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#856404'
                }}>
                    #{cellValue}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'active',
            flexGrow: 0.7,
            minWidth: 120,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData) => (
                <Toggle
                    checked={!!rowData.active}
                    size="sm"
                    checkedChildren="Actif"
                    unCheckedChildren="Inactif"
                    disabled={rowData.loadingActive}
                    onChange={() => rowData.onToggleActive && rowData.onToggleActive(rowData)}
                />
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 150,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'name',
            label: 'Nom de la leçon',
            placeholder: 'Rechercher par nom',
            type: 'text',
            tagColor: 'orange'
        },
        {
            field: 'description',
            label: 'Description',
            placeholder: 'Rechercher dans les descriptions',
            type: 'text',
            tagColor: 'blue'
        }
    ],
    searchableFields: ['name', 'description'],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier la leçon',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer la leçon',
            color: '#e74c3c'
        }
    ]
};


export const levelTableConfig = {
    columns: [
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    padding: '8px 8px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#856404'
                }}>
                    #{cellValue}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Niveau',
            dataKey: 'name',
            flexGrow: 3,
            minWidth: 350, // ✅ Réduit de 400
            cellType: 'avatar',
            avatarGenerator: (rowData) => {
                if (rowData.name) return rowData.name.charAt(0).toUpperCase();
                return 'L';
            },
            avatarColor: '#e67e22',
            subField: 'description',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description',
            flexGrow: 3,
            minWidth: 300, // ✅ Réduit de 450
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Catégorie',
            dataKey: 'category',
            flexGrow: 3,
            minWidth: 100, // ✅ Réduit de 450
            cellType: 'text',
            sortable: true
        },
       
        {
            title: 'Statut',
            dataKey: 'active',
            flexGrow: 0.7,
            minWidth: 120,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData) => (
                <Toggle
                    checked={!!rowData.active}
                    size="sm"
                    checkedChildren="Actif"
                    unCheckedChildren="Inactif"
                    disabled={rowData.loadingActive}
                    onChange={() => rowData.onToggleActive && rowData.onToggleActive(rowData)}
                />
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 150,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'name',
            label: 'Nom de la leçon',
            placeholder: 'Rechercher par nom',
            type: 'text',
            tagColor: 'orange'
        },
        {
            field: 'category',
            label: 'Catégorie',
            placeholder: 'Rechercher dans les descriptions',
            type: 'text',
            tagColor: 'blue'
        }
    ],
    searchableFields: ['name', 'description', 'category'],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier la leçon',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer la leçon',
            color: '#e74c3c'
        }
    ]
};

export const subDomainsTableConfig = {
    columns: [
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    padding: '8px 8px',
                    backgroundColor: '#fff3cd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#856404'
                }}>
                    #{cellValue}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Niveau',
            dataKey: 'name',
            flexGrow: 3,
            minWidth: 350, // ✅ Réduit de 400
            cellType: 'avatar',
            avatarGenerator: (rowData) => {
                if (rowData.name) return rowData.name.charAt(0).toUpperCase();
                return 'L';
            },
            avatarColor: '#e67e22',
            subField: 'description',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description',
            flexGrow: 3,
            minWidth: 300, // ✅ Réduit de 450
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Catégorie',
            dataKey: 'category',
            flexGrow: 3,
            minWidth: 100, // ✅ Réduit de 450
            cellType: 'text',
            sortable: true
        },
       
        {
            title: 'Statut',
            dataKey: 'active',
            flexGrow: 0.7,
            minWidth: 120,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData) => (
                <Toggle
                    checked={!!rowData.active}
                    size="sm"
                    checkedChildren="Actif"
                    unCheckedChildren="Inactif"
                    disabled={rowData.loadingActive}
                    onChange={() => rowData.onToggleActive && rowData.onToggleActive(rowData)}
                />
            )
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 150,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'name',
            label: 'Nom de la leçon',
            placeholder: 'Rechercher par nom',
            type: 'text',
            tagColor: 'orange'
        },
        {
            field: 'category',
            label: 'Catégorie',
            placeholder: 'Rechercher dans les descriptions',
            type: 'text',
            tagColor: 'blue'
        }
    ],
    searchableFields: ['name', 'description', 'category'],
    actions: [
        {
            type: 'view',
            icon: <FiEye />,
            tooltip: 'Voir les détails',
            color: '#3498db'
        },
        {
            type: 'edit',
            icon: <FiEdit />,
            tooltip: 'Modifier la leçon',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer la leçon',
            color: '#e74c3c'
        }
    ]
};