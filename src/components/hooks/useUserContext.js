import { useContext } from 'react';
import UserContext from '../../contrexts/UserContext';

/**
 * Hook personnalisé pour accéder au contexte utilisateur
 * @returns {object} - Contexte utilisateur avec paramètres et fonctions
 */
export const useUserContext = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext doit être utilisé dans un UserProvider');
    }
    return context;
}; 