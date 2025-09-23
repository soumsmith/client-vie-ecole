import React, { useState } from 'react';
import { Button, Panel, Alert, Divider } from 'rsuite';
import { usePulsParams, useApiParams } from '../../hooks/useDynamicParams';
import { useClassesDataDynamic, usePeriodesDataDynamic, validateDynamicParams } from './DynamicServiceExample';

/**
 * Composant de test pour vérifier le fonctionnement des paramètres dynamiques
 */
const TestDynamicParams = () => {
    const [showDetails, setShowDetails] = useState(false);
    
    // Récupérer les paramètres dynamiques
    const {
        ecoleId,
        academicYearId,
        periodiciteId,
        userId,
        profileId,
        email,
        personnelInfo,
        academicYearInfo,
        isAuthenticated,
        isInitialized
    } = usePulsParams();

    // Récupérer les paramètres d'API
    const apiParams = useApiParams({
        includeEcoleId: true,
        includeAcademicYearId: true,
        includePeriodiciteId: true,
        includeUserId: true
    });

    // Tester les services dynamiques
    const { classes, loading: classesLoading, error: classesError, ecoleId: usedEcoleId } = useClassesDataDynamic();
    const { periodes, loading: periodesLoading, error: periodesError, periodiciteId: usedPeriodiciteId } = usePeriodesDataDynamic();

    // Valider les paramètres
    const validation = validateDynamicParams({
        ecoleId,
        academicYearId,
        periodiciteId
    });

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
            <h2>🧪 Test des Paramètres Dynamiques</h2>
            
            {/* État d'authentification */}
            <Panel header="État d'Authentification" bordered style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isAuthenticated ? '#22c55e' : '#ef4444'
                    }} />
                    <span>
                        {isAuthenticated ? '✅ Authentifié' : '❌ Non authentifié'}
                    </span>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: isInitialized ? '#22c55e' : '#f59e0b'
                    }} />
                    <span>
                        {isInitialized ? '✅ Initialisé' : '⏳ En cours d\'initialisation'}
                    </span>
                </div>
            </Panel>

            {/* Paramètres principaux */}
            <Panel header="Paramètres Principaux" bordered style={{ marginBottom: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                        <strong>École ID:</strong> {ecoleId || 'Non défini'}
                    </div>
                    <div>
                        <strong>Année Académique ID:</strong> {academicYearId || 'Non défini'}
                    </div>
                    <div>
                        <strong>Périodicité ID:</strong> {periodiciteId || 'Non défini'}
                    </div>
                    <div>
                        <strong>Utilisateur ID:</strong> {userId || 'Non défini'}
                    </div>
                    <div>
                        <strong>Profil ID:</strong> {profileId || 'Non défini'}
                    </div>
                    <div>
                        <strong>Email:</strong> {email || 'Non défini'}
                    </div>
                </div>
            </Panel>

            {/* Validation des paramètres */}
            <Panel header="Validation des Paramètres" bordered style={{ marginBottom: '20px' }}>
                <Alert
                    type={validation.isValid ? 'success' : 'warning'}
                    title={validation.isValid ? '✅ Paramètres Valides' : '⚠️ Paramètres Manquants'}
                >
                    {validation.message}
                    {!validation.isValid && (
                        <div style={{ marginTop: '10px' }}>
                            <strong>Paramètres manquants:</strong> {validation.missingParams.join(', ')}
                        </div>
                    )}
                </Alert>
            </Panel>

            {/* Paramètres d'API */}
            <Panel header="Paramètres d'API" bordered style={{ marginBottom: '20px' }}>
                <pre style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '4px',
                    fontSize: '12px'
                }}>
                    {JSON.stringify(apiParams, null, 2)}
                </pre>
            </Panel>

            {/* Test des services */}
            <Panel header="Test des Services Dynamiques" bordered style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '15px' }}>
                    <h4>Classes</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: classesLoading ? '#f59e0b' : classesError ? '#ef4444' : '#22c55e'
                        }} />
                        <span>
                            {classesLoading ? '⏳ Chargement...' : 
                             classesError ? '❌ Erreur' : 
                             `✅ ${classes.length} classes chargées`}
                        </span>
                    </div>
                    <small>École utilisée: {usedEcoleId}</small>
                </div>

                <Divider />

                <div>
                    <h4>Périodes</h4>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: periodesLoading ? '#f59e0b' : periodesError ? '#ef4444' : '#22c55e'
                        }} />
                        <span>
                            {periodesLoading ? '⏳ Chargement...' : 
                             periodesError ? '❌ Erreur' : 
                             `✅ ${periodes.length} périodes chargées`}
                        </span>
                    </div>
                    <small>Périodicité utilisée: {usedPeriodiciteId}</small>
                </div>
            </Panel>

            {/* Détails avancés */}
            <Button 
                appearance="ghost" 
                onClick={() => setShowDetails(!showDetails)}
                style={{ marginBottom: '20px' }}
            >
                {showDetails ? 'Masquer' : 'Afficher'} les détails avancés
            </Button>

            {showDetails && (
                <Panel header="Détails Avancés" bordered>
                    <div style={{ marginBottom: '15px' }}>
                        <h5>Informations du Personnel</h5>
                        <pre style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '10px', 
                            borderRadius: '4px',
                            fontSize: '11px',
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(personnelInfo, null, 2)}
                        </pre>
                    </div>

                    <div>
                        <h5>Informations de l'Année Académique</h5>
                        <pre style={{ 
                            backgroundColor: '#f8f9fa', 
                            padding: '10px', 
                            borderRadius: '4px',
                            fontSize: '11px',
                            maxHeight: '200px',
                            overflow: 'auto'
                        }}>
                            {JSON.stringify(academicYearInfo, null, 2)}
                        </pre>
                    </div>
                </Panel>
            )}

            {/* Instructions */}
            <Panel header="Instructions" bordered>
                <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
                    <p><strong>Comment utiliser ce test :</strong></p>
                    <ol>
                        <li>Vérifiez que l'état d'authentification est vert</li>
                        <li>Assurez-vous que tous les paramètres principaux sont définis</li>
                        <li>Vérifiez que la validation des paramètres est réussie</li>
                        <li>Testez les services dynamiques pour voir s'ils fonctionnent</li>
                        <li>Utilisez les détails avancés pour déboguer si nécessaire</li>
                    </ol>
                    
                    <p><strong>Si les tests échouent :</strong></p>
                    <ul>
                        <li>Vérifiez que vous êtes connecté</li>
                        <li>Rafraîchissez la page pour réinitialiser les paramètres</li>
                        <li>Vérifiez les données dans le localStorage</li>
                        <li>Consultez la console pour les erreurs</li>
                    </ul>
                </div>
            </Panel>
        </div>
    );
};

export default TestDynamicParams; 