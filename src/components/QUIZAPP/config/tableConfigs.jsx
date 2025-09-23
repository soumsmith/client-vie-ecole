import React from 'react';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2 } from 'react-icons/fi';

/**
 * Configuration des colonnes pour les questions
 */
export const questionsTableConfig = {
    columns: [
        {
            title: 'Question',
            dataKey: 'content_preview',
            flexGrow: 3,
            minWidth: 400, // ✅ Réduit de 800 mais garde priorité
            cellType: 'avatar',
            avatarGenerator: (rowData) => `Q${rowData.id}`,
            avatarColor: '#667eea',
            subField: 'type_display',
            sortable: true
        },
        {
            title: 'Type',
            dataKey: 'type_display',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'badge',
            badgeColorMap: (value) => {
                const colorMap = {
                    'QCM': 'blue',
                    'Vrai/Faux': 'green',
                    'Texte libre': 'orange',
                    'Numérique': '#e8f5e8'
                };
                return colorMap[value] || 'gray';
            },
            sortable: true
        },
        {
            title: 'Domaine',
            dataKey: 'domain_display',
            flexGrow: 1,
            minWidth: 150,
            sortable: true
        },
        {
            title: 'Difficulté',
            dataKey: 'difficulty_display',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'badge',
            badgeColorMap: (value) => {
                const colorMap = {
                    'Facile': 'green',
                    'Moyen': 'orange',
                    'Difficile': 'red',
                    'Expert': 'violet'
                };
                return colorMap[value] || 'gray';
            },
            sortable: true
        },
        {
            title: 'Date de création',
            dataKey: 'created_at',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'date',
            sortable: true
        },
        {
            title: 'Points',
            dataKey: 'points',
            flexGrow: 0.5,
            minWidth: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    padding: '2px 8px',
                    backgroundColor: '#e8f5e8',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#2e7d32'
                }}>
                    #{cellValue}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'type_display',
            label: 'Type',
            placeholder: 'Tous les types',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        },
        {
            field: 'domain_display',
            label: 'Domaine',
            placeholder: 'Tous les domaines',
            type: 'select',
            dynamic: true,
            tagColor: 'green'
        },
        {
            field: 'difficulty_display',
            label: 'Difficulté',
            placeholder: 'Toutes les difficultés',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
        },
        {
            field: 'created_at',
            label: 'Date de création',
            placeholder: 'Sélectionner une date',
            type: 'date',
            tagColor: 'purple'
        },
        {
            field: 'last_modified',
            label: 'Période de modification',
            placeholder: 'Sélectionner une période',
            type: 'dateRange',
            tagColor: 'cyan'
        }
    ],
    searchableFields: [
        'content',
        'explanation',
        'tags',
        'type_display',
        'domain_display'
    ],
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
            tooltip: 'Modifier la question',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer la question',
            color: '#e74c3c'
        }
    ]
};

/**
 * Configuration des colonnes pour les domaines
 */
export const domainsTableConfig = {
    columns: [
        {
            title: 'Domaine',
            dataKey: 'name',
            flexGrow: 2,
            minWidth: 250,
            cellType: 'avatar',
            avatarGenerator: (rowData) => rowData.name ? rowData.name.charAt(0).toUpperCase() : 'D',
            avatarColor: '#3498db',
            subField: 'description',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description',
            flexGrow: 3,
            minWidth: 300,
            sortable: true
        },
        {
            title: 'Niveau Premium',
            dataKey: 'premium_level_name',
            flexGrow: 1,
            minWidth: 140,
            cellType: 'badge',
            badgeColorMap: (value) => {
                return value === 'Gratuit' ? 'green' : 'orange';
            },
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'premium_level_name',
            label: 'Niveau Premium',
            placeholder: 'Tous les niveaux',
            type: 'select',
            dynamic: true,
            tagColor: 'orange'
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
            tooltip: 'Modifier le domaine',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer le domaine',
            color: '#e74c3c'
        }
    ]
};

/**
 * Configuration des colonnes pour les sous-domaines
 */
export const subDomainsTableConfig = {
    columns: [
        {
            title: 'Sous-domaine',
            dataKey: 'name',
            flexGrow: 2,
            minWidth: 250,
            cellType: 'avatar',
            avatarGenerator: (rowData) => rowData.name ? rowData.name.charAt(0).toUpperCase() : 'S',
            avatarColor: '#2ecc71',
            subField: 'domain_name',
            sortable: true
        },
        {
            title: 'Domaine parent',
            dataKey: 'domain_name',
            flexGrow: 1.5,
            minWidth: 200,
            cellType: 'badge',
            badgeColorMap: () => 'blue',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description',
            flexGrow: 3,
            minWidth: 300,
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'domain_name',
            label: 'Domaine parent',
            placeholder: 'Tous les domaines',
            type: 'select',
            dynamic: true,
            tagColor: 'blue'
        }
    ],
    searchableFields: ['name', 'description', 'domain_name'],
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
            tooltip: 'Modifier le sous-domaine',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer le sous-domaine',
            color: '#e74c3c'
        }
    ]
};

/**
 * Configuration des colonnes pour les cours
 */
export const coursesTableConfig = {
    columns: [
        {
            title: 'Cours',
            dataKey: 'name_display',
            flexGrow: 3,
            minWidth: 350, // ✅ Réduit de 500 pour équilibrer
            cellType: 'avatar',
            avatarGenerator: (rowData) => {
                if (rowData.name) return rowData.name.charAt(0).toUpperCase();
                if (rowData.name_display) return rowData.name_display.charAt(0).toUpperCase();
                return 'C';
            },
            avatarColor: '#9b59b6',
            subField: 'description_preview',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description_display',
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
                <Badge color="blue">{cellValue}</Badge>
            ),
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'active',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'badge',
            badgeColorMap: (value) => {
                return value === 1 ? 'green' : 'red';
            },
            customRenderer: (rowData, cellValue) => (
                <Badge color={cellValue === 1 ? 'green' : 'red'}>
                    {cellValue === 1 ? 'Actif' : 'Inactif'}
                </Badge>
            ),
            sortable: true
        },
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            fixed: 'right'
        }
    ],
    filterConfigs: [
        {
            field: 'name_display',
            label: 'Nom du cours',
            placeholder: 'Rechercher par nom',
            type: 'text',
            tagColor: 'blue'
        },
        {
            field: 'description_display',
            label: 'Description',
            placeholder: 'Rechercher dans les descriptions',
            type: 'text',
            tagColor: 'green'
        },
        {
            field: 'active',
            label: 'Statut',
            placeholder: 'Tous les statuts',
            type: 'select',
            options: [
                { value: '', label: 'Tous les statuts' }, // ✅ Ajout option reset
                { value: 1, label: 'Actif' },
                { value: 0, label: 'Inactif' }
            ],
            tagColor: 'orange'
        }
    ],
    searchableFields: [
        'name',
        'name_display',
        'description',
        'description_display',
        'description_preview'
    ],
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
            tooltip: 'Modifier le cours',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer le cours',
            color: '#e74c3c'
        }
    ]
};

/**
 * Configuration alternative avec plus de détails (si tu veux l'utiliser)
 */
export const coursesTableConfigDetailed = {
    columns: [
        {
            title: 'Cours',
            dataKey: 'name_display',
            flexGrow: 2,
            minWidth: 250,
            cellType: 'avatar',
            avatarGenerator: (rowData) => {
                if (rowData.name) return rowData.name.charAt(0).toUpperCase();
                if (rowData.name_display) return rowData.name_display.charAt(0).toUpperCase();
                return 'C';
            },
            avatarColor: '#9b59b6',
            subField: 'id',
            sortable: true
        },
        {
            title: 'Description',
            dataKey: 'description_preview',
            flexGrow: 2.5,
            minWidth: 250,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 0.5,
            minWidth: 60,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    padding: '2px 8px',
                    backgroundColor: '#e3f2fd',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#1565c0'
                }}>
                    #{cellValue}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Nom complet',
            dataKey: 'name',
            flexGrow: 2,
            minWidth: 200,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Statut',
            dataKey: 'active',
            flexGrow: 1,
            minWidth: 90,
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: cellValue === 1 ? '#27ae60' : '#e74c3c'
                    }} />
                    <span style={{
                        fontSize: '12px',
                        color: cellValue === 1 ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                    }}>
                        {cellValue === 1 ? 'Actif' : 'Inactif'}
                    </span>
                </div>
            ),
            sortable: true
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
            field: 'name_display',
            label: 'Nom du cours',
            placeholder: 'Rechercher par nom',
            type: 'text',
            tagColor: 'blue'
        },
        {
            field: 'description_display',
            label: 'Description',
            placeholder: 'Rechercher dans les descriptions',
            type: 'text',
            tagColor: 'green'
        },
        {
            field: 'active',
            label: 'Statut',
            placeholder: 'Tous les statuts',
            type: 'select',
            options: [
                { value: '', label: 'Tous les statuts' }, // ✅ Ajout option reset
                { value: 1, label: 'Actif' },
                { value: 0, label: 'Inactif' }
            ],
            tagColor: 'orange'
        }
    ],
    searchableFields: [
        'name',
        'name_display',
        'description',
        'description_display',
        'description_preview'
    ],
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
            tooltip: 'Modifier le cours',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer le cours',
            color: '#e74c3c'
        }
    ]
};

/**
 * Configuration des colonnes pour les leçons - CORRIGÉE selon l'API
 */
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

/**
 * Configuration des colonnes pour les exercices
 */
export const exercisesTableConfig = {
    columns: [
        {
            title: 'Exercice',
            dataKey: 'title',
            flexGrow: 3,
            minWidth: 300, // ✅ Réduit de 500 pour équilibrer
            cellType: 'avatar',
            avatarGenerator: (rowData) => {
                if (rowData.title) return rowData.title.charAt(0).toUpperCase();
                return 'E';
            },
            avatarColor: '#e67e22',
            subField: 'description',
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
                    backgroundColor: '#e8f5e8',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: '#2e7d32'
                }}>
                    #{cellValue}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Type',
            dataKey: 'exercise_type',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'badge',
            badgeColorMap: (value) => {
                const colorMap = {
                    'text': 'blue',
                    'pdf': 'red',
                    'image': 'green',
                    'video': 'purple',
                    'link': 'orange',
                    'interactive': 'cyan',
                    'mixed': 'violet'
                };
                return colorMap[value] || 'gray';
            },
            customRenderer: (rowData, cellValue) => (
                <Badge color={(() => {
                    const colorMap = {
                        'text': 'blue',
                        'pdf': 'red',
                        'image': 'green',
                        'video': 'purple',
                        'link': 'orange',
                        'interactive': 'cyan',
                        'mixed': 'violet'
                    };
                    return colorMap[cellValue] || 'gray';
                })()}>
                    {cellValue || 'text'}
                </Badge>
            ),
            sortable: true
        },
        {
            title: 'Difficulté',
            dataKey: 'difficulty_name',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'badge',
            badgeColorMap: (value) => {
                const colorMap = {
                    'Facile': 'green',
                    'Moyen': 'orange',
                    'Difficile': 'red',
                    'Expert': 'violet'
                };
                return colorMap[value] || 'gray';
            },
            sortable: true
        },
        {
            title: 'Points',
            dataKey: 'points',
            flexGrow: 0.5,
            minWidth: 80,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    padding: '2px 8px',
                    backgroundColor: '#f0f0f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    color: cellValue > 20 ? '#e74c3c' : cellValue > 15 ? '#f39c12' : '#27ae60'
                }}>
                    {cellValue || 10}
                </div>
            ),
            sortable: true
        },
        {
            title: 'Durée (min)',
            dataKey: 'estimated_duration',
            flexGrow: 0.8,
            minWidth: 100,
            align: 'center',
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <span style={{
                    fontSize: '12px',
                    color: '#666'
                }}>
                    {cellValue || 0}min
                </span>
            ),
            sortable: true
        },
        {
            title: 'Obligatoire',
            dataKey: 'is_mandatory',
            flexGrow: 1,
            minWidth: 100,
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: cellValue ? '#27ae60' : '#e74c3c'
                    }} />
                    <span style={{
                        fontSize: '12px',
                        color: cellValue ? '#27ae60' : '#e74c3c',
                        fontWeight: 'bold'
                    }}>
                        {cellValue ? 'Oui' : 'Non'}
                    </span>
                </div>
            ),
            sortable: true
        },
        {
            title: 'Auteur',
            dataKey: 'author_name',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'text',
            sortable: true
        },
        {
            title: 'Date de création',
            dataKey: 'created_at',
            flexGrow: 1,
            minWidth: 120,
            cellType: 'date',
            sortable: true
        },
        {
            title: 'Statistiques',
            dataKey: 'usage_stats',
            flexGrow: 1.2,
            minWidth: 150,
            cellType: 'custom',
            customRenderer: (rowData, cellValue) => (
                <div style={{
                    fontSize: '11px',
                    color: '#666'
                }}>
                    <div>Tentatives: {cellValue?.total_attempts || 0}</div>
                    <div>Réussies: {cellValue?.completions || 0}</div>
                </div>
            ),
            sortable: false
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
            field: 'exercise_type',
            label: 'Type d\'exercice',
            placeholder: 'Tous les types',
            type: 'select',
            options: [
                { value: '', label: 'Tous les types' }, // ✅ Ajout option reset
                { value: 'text', label: 'Texte' },
                { value: 'pdf', label: 'PDF' },
                { value: 'image', label: 'Image' },
                { value: 'video', label: 'Vidéo' },
                { value: 'link', label: 'Lien' },
                { value: 'interactive', label: 'Interactif' },
                { value: 'mixed', label: 'Mixte' }
            ],
            tagColor: 'blue'
        },
        {
            field: 'difficulty_name',
            label: 'Difficulté',
            placeholder: 'Toutes les difficultés',
            type: 'select',
            options: [
                { value: '', label: 'Toutes les difficultés' }, // ✅ Ajout option reset
                { value: 'Facile', label: 'Facile' },
                { value: 'Moyen', label: 'Moyen' },
                { value: 'Difficile', label: 'Difficile' },
                { value: 'Expert', label: 'Expert' }
            ],
            tagColor: 'orange'
        },
        {
            field: 'is_mandatory',
            label: 'Obligatoire',
            placeholder: 'Tous',
            type: 'select',
            options: [
                { value: '', label: 'Tous' }, // ✅ Ajout option reset
                { value: true, label: 'Oui' },
                { value: false, label: 'Non' }
            ],
            tagColor: 'green'
        },
        {
            field: 'author_name',
            label: 'Auteur',
            placeholder: 'Tous les auteurs',
            type: 'select',
            dynamic: true,
            tagColor: 'purple'
        },
        {
            field: 'created_at',
            label: 'Date de création',
            placeholder: 'Sélectionner une date',
            type: 'date',
            tagColor: 'cyan'
        },
        {
            field: 'points',
            label: 'Points',
            placeholder: 'Rechercher par points',
            type: 'number',
            tagColor: 'red'
        }
    ],
    searchableFields: [
        'title',
        'description',
        'exercise_type',
        'difficulty_name',
        'author_name'
    ],
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
            tooltip: 'Modifier l\'exercice',
            color: '#f39c12'
        },
        {
            type: 'delete',
            icon: <FiTrash2 />,
            tooltip: 'Supprimer l\'exercice',
            color: '#e74c3c'
        }
    ]
};

// ✅ Props optimisées pour chaque type de table
export const tableProps = {
    questions: {
        title: "Gestion des Questions",
        subtitle: "questions trouvées",
        minTableWidth: 1130, // Total des minWidth
        tableHeight: 500,
        defaultPageSize: 10,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouvelle Question"
    },
    domains: {
        title: "Gestion des Domaines",
        subtitle: "domaines trouvés",
        minTableWidth: 810, // Total des minWidth
        tableHeight: 400,
        defaultPageSize: 10,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouveau Domaine"
    },
    subDomains: {
        title: "Gestion des Sous-domaines",
        subtitle: "sous-domaines trouvés",
        minTableWidth: 870, // Total des minWidth
        tableHeight: 400,
        defaultPageSize: 10,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouveau Sous-domaine"
    },
    courses: {
        title: "Gestion des Cours",
        subtitle: "cours trouvés",
        minTableWidth: 990, // Total des minWidth
        tableHeight: 500,
        defaultPageSize: 10,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouveau Cours"
    },
    lessons: {
        title: "Gestion des Leçons",
        subtitle: "leçons trouvées",
        minTableWidth: 880, // Total des minWidth
        tableHeight: 500,
        defaultPageSize: 10,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouvelle Leçon"
    },
    exercises: {
        title: "Gestion des Exercices",
        subtitle: "exercices trouvés",
        minTableWidth: 1370, // Total des minWidth (table large)
        tableHeight: 500,
        defaultPageSize: 10,
        enableRefresh: true,
        enableCreate: true,
        createButtonText: "Nouvel Exercice"
    }
};