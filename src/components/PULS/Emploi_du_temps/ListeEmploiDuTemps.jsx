/**
 * Composant de routage pour l'Emploi du Temps - Version Light
 * Design épuré avec utilisation du composant DataTable et ClassCard externalisé
 */

import React, { useState, useCallback } from 'react';
import { 
  Panel, 
  Grid, 
  Row, 
  Col, 
  Input, 
  InputGroup, 
  Breadcrumb, 
  Nav,
  Button,
  FlexboxGrid,
  Loader,
  Message
} from 'rsuite';
import { 
  FiSearch, 
  FiUsers, 
  FiBook, 
  FiCalendar,
  FiArrowLeft,
  FiPlus,
  FiGrid,
  FiClock
} from 'react-icons/fi';
import Swal from 'sweetalert2';
import { useAllApiUrls } from '../utils/apiConfig';

// Import des services mis à jour
import {
  useClassesListData,
  useJoursListData,
  useActivitesByClasseJour,
  clearClasseCache,
  activitesTableConfig,
  deleteActivite
} from './EmploiDuTempsServiceManager';

// Import du DataTable et du modal
import DataTable from "../../DataTable";
import EmploiDuTempsModal from './EmploiDuTempsModal';
import ClassCard from '../card/ClassCard'; // Import du composant ClassCard externalisé

const EmploiDuTempsRouter = ({ 
  primaryColor = '#3b82f6' // Couleur principale configurable
}) => {
  const [currentView, setCurrentView] = useState('list'); // 'list' ou 'detail'
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDay, setSelectedDay] = useState(1);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Récupération des URLs d'API
  const apiUrls = useAllApiUrls();

  // État du modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: null,
    selectedQuestion: null
  });

  // Chargement des données
  const { classes, loading: classesLoading, error: classesError, refetch: refetchClasses } = useClassesListData(refreshTrigger);
  const { jours, loading: joursLoading } = useJoursListData();
  const { activites, loading: activitesLoading, error: activitesError, refetch: refetchActivites } = useActivitesByClasseJour(
    selectedClasse?.id, 
    selectedDay, 
    refreshTrigger
  );

  // Fonctions utilitaires
  const getSelectedJour = () => {
    const jour = jours.find(j => j.id === selectedDay);
    return jour || { id: selectedDay, libelle: 'Jour', code: 'jour' };
  };

  const getDayStats = () => {
    if (activitesLoading) return "Chargement...";
    if (activitesError) return "Erreur de chargement";
    
    const count = activites.length;
    if (count === 0) return "Aucune activité programmée";
    if (count === 1) return "1 activité programmée";
    return `${count} activités programmées`;
  };

  const getTotalDuration = () => {
    if (activites.length === 0) return null;
    
    try {
      const durations = activites.map(activite => {
        const debut = activite.heureDeb.split(':');
        const fin = activite.heureFin.split(':');
        const debutMinutes = parseInt(debut[0]) * 60 + parseInt(debut[1]);
        const finMinutes = parseInt(fin[0]) * 60 + parseInt(fin[1]);
        return finMinutes - debutMinutes;
      });
      
      const totalMinutes = durations.reduce((acc, duration) => acc + duration, 0);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      if (hours > 0 && minutes > 0) {
        return `${hours}h${minutes.toString().padStart(2, '0')}`;
      } else if (hours > 0) {
        return `${hours}h`;
      } else {
        return `${minutes}min`;
      }
    } catch (error) {
      return null;
    }
  };

  // Navigation
  const handleClasseClick = (classe) => {
    setSelectedClasse(classe);
    setCurrentView('detail');
    setSelectedDay(1);
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedClasse(null);
    setSelectedDay(1);
  };

  // Gestion du modal
  const handleTableAction = useCallback((actionType, item) => {
    console.log('Action déclenchée:', actionType, 'Item:', item);
    setModalState({
      isOpen: true,
      type: actionType,
      selectedQuestion: item
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({
      isOpen: false,
      type: null,
      selectedQuestion: null
    });
  }, []);

  const handleModalSave = useCallback(async (savedData) => {
    try {
      console.log('Activité sauvegardée:', savedData);
      setRefreshTrigger(prev => prev + 1);
      if (selectedClasse?.id) {
        clearClasseCache(selectedClasse.id);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour des données:', error);
    }
  }, [selectedClasse]);

  // Gestion des actions sur les activités
  const handleActiviteAction = useCallback((actionType, item) => {
    if (actionType === 'create') {
      handleTableAction('create', null);
      return;
    }

    if (actionType === 'edit' && item) {
      handleTableAction('edit', item);
      return;
    }

    if (actionType === 'view' && item) {
      handleTableAction('view', item);
      return;
    }

    if (actionType === 'delete' && item && item.id) {
      handleDeleteActivite(item);
      return;
    }

    console.warn('Action non gérée:', actionType);
  }, []);

  // Suppression d'activité
  const handleDeleteActivite = async (activite) => {
    const result = await Swal.fire({
      title: 'Confirmer la suppression',
      html: `
        <div style="text-align: left; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
          <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 40px; height: 40px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">
                ⚠️
              </div>
              <div>
                <div style="font-weight: 600; color: #1f2937; font-size: 16px;">
                  Suppression d'activité
                </div>
                <div style="color: #6b7280; font-size: 14px;">
                  Cette action est irréversible
                </div>
              </div>
            </div>
          </div>
          
          <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px;">
            <div style="font-weight: 600; margin-bottom: 8px; color: #374151;">Détails de l'activité :</div>
            <div style="color: #6b7280; line-height: 1.6;">
              <strong>Horaires :</strong> ${activite.heureDeb} - ${activite.heureFin}<br>
              <strong>Matière :</strong> ${activite.matiere?.libelle || activite.matiere}<br>
              <strong>Salle :</strong> ${activite.salle?.libelle || activite.salle}
            </div>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      reverseButtons: true,
      width: '500px',
    });

    if (!result.isConfirmed) return;

    try {
      await deleteActivite(activite.id, apiUrls);
      
      await Swal.fire({
        icon: 'success',
        title: 'Activité supprimée !',
        text: 'L\'activité a été supprimée avec succès de l\'emploi du temps.',
        confirmButtonColor: '#10b981',
        timer: 3000,
        showConfirmButton: true
      });

      setRefreshTrigger(prev => prev + 1);
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      
      let errorMessage = 'Une erreur est survenue lors de la suppression.';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Activité non trouvée.';
        } else if (error.response.status === 409) {
          errorMessage = 'Impossible de supprimer cette activité car elle est liée à d\'autres données.';
        } else if (error.response.status === 500) {
          errorMessage = 'Erreur interne du serveur. Réessayez plus tard.';
        }
      } else if (error.request) {
        errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
      }

      await Swal.fire({
        icon: 'error',
        title: 'Erreur de suppression',
        text: errorMessage,
        confirmButtonColor: '#ef4444'
      });
    }
  };

  // Filtrage des classes
  const filteredClasses = classes.filter(classe =>
    classe.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    classe.niveau.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Vue liste des classes
  if (currentView === 'list') {
    return (
      <div style={{ padding: '24px', background: '#fafafa', minHeight: '100vh' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ 
              fontSize: '28px', 
              fontWeight: '700', 
              color: '#374151',
              margin: '0 0 8px 0'
            }}>
              Emplois du temps
            </h2>
            <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
              Gérez les emplois du temps de toutes vos classes
            </p>
          </div>

          {/* Barre de recherche */}
          <Panel 
            style={{ 
              marginBottom: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <InputGroup style={{ width: '100%' }}>
              <Input
                placeholder="Rechercher une classe..."
                value={searchTerm}
                onChange={setSearchTerm}
                style={{ 
                  height: '44px',
                  fontSize: '16px',
                  border: 'none'
                }}
              />
              <InputGroup.Addon style={{ 
                background: '#f9fafb',
                border: 'none',
                color: '#6b7280'
              }}>
                <FiSearch />
              </InputGroup.Addon>
            </InputGroup>
          </Panel>

          {/* État de chargement */}
          {classesLoading && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <Loader size="lg" content="Chargement des classes..." />
            </div>
          )}

          {/* Gestion d'erreur */}
          {classesError && (
            <Message type="error" style={{ marginBottom: '24px' }}>
              <strong>Erreur:</strong> {classesError.message}
              <div style={{ marginTop: '8px' }}>
                <Button size="sm" onClick={() => refetchClasses()}>
                  Réessayer
                </Button>
              </div>
            </Message>
          )}

          {/* Grille des classes avec le composant ClassCard externalisé */}
          {!classesLoading && !classesError && (
            <>
              <div style={{ 
                marginBottom: '16px', 
                color: '#6b7280',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {filteredClasses.length} classe{filteredClasses.length > 1 ? 's' : ''} trouvée{filteredClasses.length > 1 ? 's' : ''}
              </div>
              <Grid fluid>
                <Row gutter={16}>
                  {filteredClasses.map((classe, index) => (
                    <Col key={classe.id} xs={24} sm={12} md={8} lg={6}>
                      <ClassCard 
                        classe={classe} 
                        onClick={() => handleClasseClick(classe)}
                        borderColor="#e2e8f0"
                        accentColor={primaryColor}
                        size="medium"
                        showArrow={true}
                        hoverable={true}
                      />
                    </Col>
                  ))}
                </Row>
              </Grid>
            </>
          )}

          {/* Message aucune classe */}
          {!classesLoading && !classesError && filteredClasses.length === 0 && (
            <div style={{ textAlign: 'center', padding: '64px 0' }}>
              <FiGrid size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
              <h3 style={{ color: '#6b7280', marginBottom: '8px' }}>Aucune classe trouvée</h3>
              <p style={{ color: '#9ca3af' }}>
                {searchTerm ? 'Essayez de modifier votre recherche' : 'Aucune classe disponible'}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Vue détail d'une classe avec DataTable
  return (
    <div style={{ padding: '24px', background: '#fafafa', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Breadcrumb */}
        <Breadcrumb style={{ marginBottom: '24px' }}>
          <Breadcrumb.Item 
            onClick={handleBackToList}
            style={{ cursor: 'pointer', color: '#374151' }}
          >
            <FiArrowLeft style={{ marginRight: '8px' }} />
            Classes
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            Emploi du temps
          </Breadcrumb.Item>
        </Breadcrumb>

        {/* Header de la classe */}
        <Panel 
          style={{ 
            marginBottom: '24px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
            background: 'white'
          }}
        >
          <FlexboxGrid justify="space-between" align="middle">
            <FlexboxGrid.Item>
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: '600', 
                margin: '0 0 8px 0',
                color: '#374151'
              }}>
                Emploi du temps - {selectedClasse?.libelle}
              </h2>
              <div style={{ display: 'flex', gap: '24px', color: '#6b7280' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiUsers size={16} />
                  <span>{selectedClasse?.effectif} élèves</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiBook size={16} />
                  <span>{selectedClasse?.niveau}</span>
                </div>
              </div>
            </FlexboxGrid.Item>
          </FlexboxGrid>
        </Panel>

        {/* Navigation par jours */}
        {!joursLoading && jours.length > 0 && (
          <Panel 
            style={{ 
              marginBottom: '24px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
              background: 'white'
            }}
          >
            <div style={{ padding: '16px 0' }}>
              <Nav 
                appearance="subtle" 
                activeKey={selectedDay} 
                onSelect={setSelectedDay}
                style={{ justifyContent: 'center' }}
              >
                {jours.map((jour) => (
                  <Nav.Item 
                    key={jour.id} 
                    eventKey={jour.id}
                    style={{
                      borderRadius: '6px',
                      margin: '0 4px',
                      fontWeight: selectedDay === jour.id ? '600' : '400',
                      background: selectedDay === jour.id ? '#f3f4f6' : 'transparent',
                      color: selectedDay === jour.id ? '#374151' : '#6b7280'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                      <FiCalendar size={16} />
                      <span>{jour.libelle}</span>
                      {selectedDay === jour.id && (
                        <span style={{ 
                          background: primaryColor,
                          color: 'white',
                          borderRadius: '50%',
                          fontSize: '10px',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginLeft: '4px'
                        }}>
                          {activites.length}
                        </span>
                      )}
                    </div>
                  </Nav.Item>
                ))}
              </Nav>
            </div>
          </Panel>
        )}

        {/* DataTable pour les activités */}
        <div style={{
          background: 'white',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header du jour sélectionné */}
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #f3f4f6',
            background: '#fafbfc',
            borderRadius: '8px 8px 0 0'
          }}>
            <FlexboxGrid justify="space-between" align="middle">
              <FlexboxGrid.Item>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div style={{ 
                    padding: '8px',
                    borderRadius: '8px',
                    background: primaryColor,
                    color: 'white'
                  }}>
                    <FiCalendar size={18} />
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '20px', 
                      fontWeight: '600', 
                      margin: 0,
                      color: '#374151'
                    }}>
                      {getSelectedJour().libelle}
                    </h3>
                    <p style={{ 
                      color: '#6b7280', 
                      fontSize: '14px',
                      margin: '4px 0 0 0'
                    }}>
                      {getDayStats()}
                      {getTotalDuration() && (
                        <span style={{ marginLeft: '8px', color: primaryColor }}>
                          • Durée totale: {getTotalDuration()}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </FlexboxGrid.Item>
              <FlexboxGrid.Item>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <Button 
                    size="sm"
                    onClick={() => setRefreshTrigger(prev => prev + 1)}
                    loading={activitesLoading}
                    style={{ 
                      borderRadius: '6px',
                      border: '1px solid #e5e7eb',
                      background: 'white'
                    }}
                  >
                    Actualiser
                  </Button>
                  <Button 
                    appearance="primary"
                    startIcon={<FiPlus />}
                    onClick={() => handleActiviteAction('create', null)}
                    style={{ 
                      borderRadius: '6px',
                      background: primaryColor,
                      borderColor: primaryColor
                    }}
                  >
                    Nouvelle Activité
                  </Button>
                </div>
              </FlexboxGrid.Item>
            </FlexboxGrid>
          </div>

          <DataTable
            title=""
            subtitle=""
            data={activites}
            loading={activitesLoading}
            error={activitesError}
            columns={activitesTableConfig.columns}
            searchableFields={activitesTableConfig.searchableFields}
            actions={activitesTableConfig.actions}
            onAction={handleActiviteAction}
            onRefresh={() => setRefreshTrigger(prev => prev + 1)}
            onCreateNew={() => handleActiviteAction('create', null)}
            defaultPageSize={10}
            pageSizeOptions={[10, 15, 25]}
            tableHeight={500}
            enableRefresh={false}
            enableCreate={false}
            selectable={false}
            rowKey="id"
            customStyles={{
              container: { 
                backgroundColor: "white",
                borderRadius: "0 0 8px 8px",
                padding: "0"
              },
              panel: { 
                minHeight: "500px",
                borderRadius: "0 0 8px 8px",
                border: "none",
                boxShadow: "none"
              },
            }}
            noDataMessage={
              <div style={{ textAlign: 'center', padding: '64px 0' }}>
                <FiCalendar size={48} style={{ color: '#d1d5db', marginBottom: '16px' }} />
                <h4 style={{ color: '#6b7280', marginBottom: '8px' }}>
                  Aucune activité programmée
                </h4>
                <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
                  Le {getSelectedJour().libelle.toLowerCase()} ne contient aucune activité pour cette classe
                </p>
                <Button 
                  appearance="primary"
                  startIcon={<FiPlus />}
                  onClick={() => handleActiviteAction('create', null)}
                  style={{ 
                    borderRadius: '6px',
                    background: primaryColor,
                    borderColor: primaryColor
                  }}
                >
                  Ajouter une activité
                </Button>
              </div>
            }
            errorMessage="Erreur lors du chargement des activités"
          />
        </div>
      </div>

      {/* Modal de gestion - MODIFIÉ AVEC LES NOUVELLES PROPS */}
      <EmploiDuTempsModal
        modalState={modalState}
        onClose={handleCloseModal}
        onSave={handleModalSave}
        selectedClasse={selectedClasse}
        selectedDay={selectedDay}
        activitesExistantes={activites}
        loadingActivites={activitesLoading}
      />
    </div>
  );
};

export default EmploiDuTempsRouter;