/**
 * Service pour la gestion des données de messages reçus
 * VERSION OPTIMISÉE avec axios et cache
 */

import axios from 'axios';
import { Badge } from 'rsuite';
import { FiEye, FiEdit, FiTrash2, FiDownload, FiUser, FiPhone, FiMail, FiMessageSquare, FiCalendar } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getFromCache, setToCache, clearCache } from '../utils/cacheUtils';


/**
 * Vide le cache des messages
 */
export const clearMessagesCache = () => {
    clearCache();
};

// Configuration du tableau pour les messages
export const messagesTableConfig = {
    columns: [
        {
            title: 'ID',
            dataKey: 'id',
            flexGrow: 1,
            minWidth: 80,
            sortable: true
        },
        {
            title: 'Expéditeur',
            dataKey: 'fullName',
            flexGrow: 2,
            minWidth: 200,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <div style={{ fontWeight: 'bold', color: '#2c3e50' }}>
                        {value}
                    </div>
                );
            }
        },
        {
            title: 'Sujet',
            dataKey: 'sujet',
            flexGrow: 3,
            minWidth: 300,
            sortable: true,
            cellRenderer: (value) => {
                return (
                    <div style={{ 
                        fontWeight: '500', 
                        color: '#34495e',
                        maxWidth: '280px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {value}
                    </div>
                );
            }
        },
        {
            title: 'Date',
            dataKey: 'date',
            flexGrow: 1,
            minWidth: 120,
            sortable: true,
            cellRenderer: (value) => {
                const date = new Date(value);
                const formattedDate = date.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
                return (
                    <span color="blue">
                        {formattedDate}
                    </span>
                );
            }
        },
        {
            title: 'Message',
            dataKey: 'message',
            flexGrow: 2,
            minWidth: 200,
            sortable: false,
            cellRenderer: (value) => {
                // Supprimer les balises HTML pour afficher le texte brut
                const textContent = value.replace(/<[^>]*>/g, '').substring(0, 50);
                return (
                    <div style={{ 
                        fontSize: '0.9em',
                        color: '#7f8c8d',
                        maxWidth: '200px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                    }}>
                        {textContent}...
                    </div>
                );
            }
        },
        
        {
            title: 'Actions',
            dataKey: 'actions',
            flexGrow: 1,
            minWidth: 160,
            cellType: 'actions',
            // fixed: 'right'
        }
    ],
    searchableFields: ['fullName', 'sujet', 'message'],
    filterConfigs: [
        {
            key: 'date',
            label: 'Date',
            type: 'dateRange',
            placeholder: 'Filtrer par date'
        },
        {
            key: 'expediteur',
            label: 'Expéditeur',
            type: 'text',
            placeholder: 'Filtrer par expéditeur'
        }
    ],
    actions: [
        {
            type: 'view',
            icon: <FiEye size={17} />,
            tooltip: 'Voir le message',
            color: '#3498db'
        },
        // {
        //     type: 'edit',
        //     icon: <FiEdit />,
        //     tooltip: 'Répondre au message',
        //     color: '#f39c12'
        // },
        // {
        //     type: 'delete',
        //     icon: <FiTrash2 />,
        //     tooltip: 'Supprimer le message',
        //     color: '#e74c3c'
        // }
    ]
}; 