import { useState, useEffect, useCallback } from 'react';
import { Badge } from 'rsuite';
import { FiEdit, FiTrash2, FiToggleLeft, FiToggleRight, FiGraduationCap, FiHash } from 'react-icons/fi';

// Hook personnalisé pour récupérer les données des niveaux scolaires
export const useAcademicLevelsData = (refreshTrigger = 0) => {
    const [academicLevels, setAcademicLevels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAcademicLevels = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch('academic_levels_api.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'get_all'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                setAcademicLevels(result.data || []);
            } else {
                throw new Error(result.message || 'Erreur lors de la récupération des niveaux');
            }
        } catch (err) {
            console.error('Erreur lors de la récupération des niveaux:', err);
            setError(err.message);
            setAcademicLevels([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAcademicLevels();
    }, [fetchAcademicLevels, refreshTrigger]);

    const refetch = useCallback(() => {
        fetchAcademicLevels();
    }, [fetchAcademicLevels]);

    return { academicLevels, loading, error, refetch };
};

// Configuration du tableau des niveaux scolaires
export const academicLevelsTableConfig = {
    columns: [
        {
            key: 'name',
            label: 'Nom du niveau',
            sortable: true,
            render: (value, item) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FiGraduationCap style={{ marginRight: '8px', color: '#28a745' }} />
                    <strong>{value}</strong>
                </div>
            )
        },
        {
            key: 'category',
            label: 'Catégorie',
            sortable: true,
            render: (value, item) => {
                const categoryColors = {
                    'maternelle': 'pink',
                    'primaire': 'blue',
                    'college': 'green',
                    'lycee': 'orange',
                    'superieur': 'purple',
                    'formation_pro': 'cyan',
                    'formation_continue': 'yellow'
                };
                
                const categoryLabels = {
                    'maternelle': 'Maternelle',
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
            render: (value, item) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <FiHash style={{ marginRight: '4px', color: '#6c757d' }} />
                    <Badge color="violet">{value}</Badge>
                </div>
            )
        },
        {
            key: 'description',
            label: 'Description',
            sortable: false,
            render: (value, item) => (
                <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {value || <span style={{ color: '#6c757d', fontStyle: 'italic' }}>Aucune description</span>}
                </div>
            )
        },
        {
            key: 'active',
            label: 'Statut',
            sortable: true,
            render: (value, item) => (
                <Badge color={value ? 'green' : 'red'}>
                    {value ? 'Actif' : 'Inactif'}
                </Badge>
            )
        },
        {
            key: 'created_at',
            label: 'Date de création',
            sortable: true,
            render: (value, item) => {
                if (!value) return '-';
                return new Date(value).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                });
            }
        }
    ],
    searchableFields: ['name', 'category', 'description'],
    filterConfigs: [
        {
            key: 'category',
            label: 'Catégorie',
            type: 'select',
            options: [
                { label: 'Maternelle', value: 'maternelle' },
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
            key: 'edit',
            label: 'Modifier',
            icon: <FiEdit />,
            color: 'blue',
            position: 'row'
        },
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