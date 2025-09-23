/**
 * Exemple d'utilisation du service centralisé CommonDataService
 * Ce composant montre comment utiliser les hooks centralisés
 */

import React, { useState } from 'react';
import { 
    SelectPicker, 
    Button, 
    Panel, 
    Row, 
    Col, 
    Message, 
    Loader,
    Divider
} from 'rsuite';

// Import du service centralisé
import { 
    useClassesData, 
    useNiveauxData, 
    useBranchesData, 
    useMatieresData, 
    usePeriodesData, 
    useElevesData, 
    useFonctionsData,
    useAnneesData,
    useBaseData
} from './CommonDataService';

// ===========================
// COMPOSANT D'EXEMPLE POUR LES CLASSES
// ===========================
const ClassesExample = () => {
    const { classes, loading, error, refetch } = useClassesData();

    if (loading) return <Loader content="Chargement des classes..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Classes" bordered>
            <Row>
                <Col md={8}>
                    <SelectPicker
                        data={classes}
                        placeholder="Sélectionner une classe"
                        style={{ width: '100%' }}
                        onChange={(value) => console.log('Classe sélectionnée:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch}>Actualiser</Button>
                </Col>
            </Row>
            <div style={{ marginTop: 10 }}>
                <strong>Classes disponibles:</strong> {classes.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES NIVEAUX
// ===========================
const NiveauxExample = () => {
    const { niveaux, loading, error, refetch } = useNiveauxData();

    if (loading) return <Loader content="Chargement des niveaux..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Niveaux d'enseignement" bordered>
            <Row>
                <Col md={8}>
                    <SelectPicker
                        data={niveaux}
                        placeholder="Sélectionner un niveau"
                        style={{ width: '100%' }}
                        onChange={(value) => console.log('Niveau sélectionné:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch}>Actualiser</Button>
                </Col>
            </Row>
            <div style={{ marginTop: 10 }}>
                <strong>Niveaux disponibles:</strong> {niveaux.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES BRANCHES
// ===========================
const BranchesExample = () => {
    const { branches, loading, error, refetch } = useBranchesData();

    if (loading) return <Loader content="Chargement des branches..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Branches" bordered>
            <Row>
                <Col md={8}>
                    <SelectPicker
                        data={branches}
                        placeholder="Sélectionner une branche"
                        style={{ width: '100%' }}
                        onChange={(value) => console.log('Branche sélectionnée:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch}>Actualiser</Button>
                </Col>
            </Row>
            <div style={{ marginTop: 10 }}>
                <strong>Branches disponibles:</strong> {branches.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES MATIÈRES
// ===========================
const MatieresExample = () => {
    const [selectedClasse, setSelectedClasse] = useState(null);
    const { matieres, loading, error, refetch, clearMatieres } = useMatieresData(selectedClasse);

    return (
        <Panel header="Matières par classe" bordered>
            <Row>
                <Col md={6}>
                    <SelectPicker
                        data={[]} // Ici vous pourriez utiliser useClassesData
                        placeholder="Sélectionner une classe"
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            setSelectedClasse(value);
                            if (!value) clearMatieres();
                        }}
                    />
                </Col>
                <Col md={6}>
                    <SelectPicker
                        data={matieres}
                        placeholder="Sélectionner une matière"
                        style={{ width: '100%' }}
                        disabled={!selectedClasse}
                        onChange={(value) => console.log('Matière sélectionnée:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch} disabled={!selectedClasse}>Actualiser</Button>
                </Col>
            </Row>
            {loading && <Loader content="Chargement des matières..." />}
            {error && <Message type="error" description={error.message} />}
            <div style={{ marginTop: 10 }}>
                <strong>Matières disponibles:</strong> {matieres.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES PÉRIODES
// ===========================
const PeriodesExample = () => {
    const { periodes, loading, error, refetch } = usePeriodesData();

    if (loading) return <Loader content="Chargement des périodes..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Périodes" bordered>
            <Row>
                <Col md={8}>
                    <SelectPicker
                        data={periodes}
                        placeholder="Sélectionner une période"
                        style={{ width: '100%' }}
                        onChange={(value) => console.log('Période sélectionnée:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch}>Actualiser</Button>
                </Col>
            </Row>
            <div style={{ marginTop: 10 }}>
                <strong>Périodes disponibles:</strong> {periodes.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES ÉLÈVES
// ===========================
const ElevesExample = () => {
    const [selectedClasse, setSelectedClasse] = useState(null);
    const { eleves, loading, error, refetch, clearEleves } = useElevesData(selectedClasse);

    return (
        <Panel header="Élèves par classe" bordered>
            <Row>
                <Col md={6}>
                    <SelectPicker
                        data={[]} // Ici vous pourriez utiliser useClassesData
                        placeholder="Sélectionner une classe"
                        style={{ width: '100%' }}
                        onChange={(value) => {
                            setSelectedClasse(value);
                            if (!value) clearEleves();
                        }}
                    />
                </Col>
                <Col md={6}>
                    <SelectPicker
                        data={eleves}
                        placeholder="Sélectionner un élève"
                        style={{ width: '100%' }}
                        disabled={!selectedClasse}
                        onChange={(value) => console.log('Élève sélectionné:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch} disabled={!selectedClasse}>Actualiser</Button>
                </Col>
            </Row>
            {loading && <Loader content="Chargement des élèves..." />}
            {error && <Message type="error" description={error.message} />}
            <div style={{ marginTop: 10 }}>
                <strong>Élèves disponibles:</strong> {eleves.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES FONCTIONS
// ===========================
const FonctionsExample = () => {
    const { fonctions, loading, error, refetch } = useFonctionsData();

    if (loading) return <Loader content="Chargement des fonctions..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Fonctions du personnel" bordered>
            <Row>
                <Col md={8}>
                    <SelectPicker
                        data={fonctions}
                        placeholder="Sélectionner une fonction"
                        style={{ width: '100%' }}
                        onChange={(value) => console.log('Fonction sélectionnée:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch}>Actualiser</Button>
                </Col>
            </Row>
            <div style={{ marginTop: 10 }}>
                <strong>Fonctions disponibles:</strong> {fonctions.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES ANNÉES
// ===========================
const AnneesExample = () => {
    const { annees, loading, error, refetch } = useAnneesData();

    if (loading) return <Loader content="Chargement des années..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Années scolaires" bordered>
            <Row>
                <Col md={8}>
                    <SelectPicker
                        data={annees}
                        placeholder="Sélectionner une année"
                        style={{ width: '100%' }}
                        onChange={(value) => console.log('Année sélectionnée:', value)}
                    />
                </Col>
                <Col md={4}>
                    <Button onClick={refetch}>Actualiser</Button>
                </Col>
            </Row>
            <div style={{ marginTop: 10 }}>
                <strong>Années disponibles:</strong> {annees.length}
            </div>
        </Panel>
    );
};

// ===========================
// COMPOSANT D'EXEMPLE POUR LES DONNÉES DE BASE
// ===========================
const BaseDataExample = () => {
    const { classes, niveaux, branches, loading, error, refetch } = useBaseData();

    if (loading) return <Loader content="Chargement des données de base..." />;
    if (error) return <Message type="error" description={error.message} />;

    return (
        <Panel header="Données de base (Classes, Niveaux, Branches)" bordered>
            <Row>
                <Col md={4}>
                    <strong>Classes:</strong> {classes.length}
                </Col>
                <Col md={4}>
                    <strong>Niveaux:</strong> {niveaux.length}
                </Col>
                <Col md={4}>
                    <strong>Branches:</strong> {branches.length}
                </Col>
            </Row>
            <Row style={{ marginTop: 10 }}>
                <Col md={12}>
                    <Button onClick={refetch}>Actualiser toutes les données</Button>
                </Col>
            </Row>
        </Panel>
    );
};

// ===========================
// COMPOSANT PRINCIPAL D'EXEMPLE
// ===========================
const CommonDataExample = () => {
    return (
        <div style={{ padding: 20 }}>
            <h2>Exemple d'utilisation du service centralisé CommonDataService</h2>
            <p>Ce composant montre comment utiliser les hooks centralisés pour récupérer les données communes.</p>
            
            <Divider />
            
            <Row>
                <Col md={6}>
                    <ClassesExample />
                </Col>
                <Col md={6}>
                    <NiveauxExample />
                </Col>
            </Row>
            
            <Divider />
            
            <Row>
                <Col md={6}>
                    <BranchesExample />
                </Col>
                <Col md={6}>
                    <FonctionsExample />
                </Col>
            </Row>
            
            <Divider />
            
            <Row>
                <Col md={12}>
                    <MatieresExample />
                </Col>
            </Row>
            
            <Divider />
            
            <Row>
                <Col md={12}>
                    <ElevesExample />
                </Col>
            </Row>
            
            <Divider />
            
            <Row>
                <Col md={6}>
                    <PeriodesExample />
                </Col>
                <Col md={6}>
                    <AnneesExample />
                </Col>
            </Row>
            
            <Divider />
            
            <BaseDataExample />
        </div>
    );
};

export default CommonDataExample; 