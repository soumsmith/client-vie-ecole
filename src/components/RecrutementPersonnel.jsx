import React from 'react';
import { Badge } from 'rsuite';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';
import EyeIcon from '@rsuite/icons/Visible';
import DataTable from './DataTable'; // Importer le composant générique

/**
 * Exemple d'utilisation du DataTable pour la gestion du personnel
 * Utilise directement les données de l'API sans transformation
 */
const RecrutementPersonnel = () => {

  /**
   * Configuration des colonnes du tableau utilisant les champs originaux de l'API
   */
  const columns = [
    {
      title: 'Utilisateur',
      dataKey: 'nom_complet', // Clé virtuelle pour le tri
      dataKeys: ['prenomPersonnel', 'nomPersonnel'],
      separator: ' ',
      width: 200,
      fixed: true,
      cellType: 'avatar',
      subField: 'email',
      avatarColor: '#667eea',
      avatarGenerator: (rowData) => {
        const prenom = rowData.prenomPersonnel || '';
        const nom = rowData.nomPersonnel || '';
        return (prenom.charAt(0) + nom.charAt(0)).toUpperCase();
      },
      valueGetter: (rowData) => `${rowData.prenomPersonnel || ''} ${rowData.nomPersonnel || ''}`.trim()
    },
    {
      title: 'Rôle',
      dataKey: 'libelle_fonction',
      width: 150,
      sortable: true
    },
    {
      title: 'Département',
      dataKey: 'domaine_formation',
      width: 140,
      sortable: true
    },
    {
      title: 'École',
      dataKey: 'libelleEcole',
      width: 200,
      sortable: true
    },
    {
      title: 'Diplôme',
      dataKey: 'diplome_recent',
      width: 120,
      sortable: true
    },
    {
      title: 'Expérience',
      dataKey: 'nombreAnneeExperience',
      width: 100,
      align: 'center',
      sortable: true,
      valueGetter: (rowData) => `${rowData.nombreAnneeExperience || 0} ans`
    },
    {
      title: 'Date création',
      dataKey: 'panier_personnel_date_creation',
      width: 120,
      sortable: true
    },
    {
      title: 'Contact',
      dataKey: 'contact',
      width: 120,
      sortable: true
    },
    {
      title: 'Actions',
      dataKey: 'actions', // Clé pour identifier la colonne
      width: 120,
      align: 'center',
      fixed: 'right',
      cellType: 'actions',
      sortable: false
    }
  ];

  /**
   * Configuration des champs de recherche
   * Utilise les objets avec dataKeys pour la recherche multi-champs
   */
  const searchableFields = [
    { dataKeys: ['prenomPersonnel', 'nomPersonnel'] },
    'email',
    'libelle_fonction',
    'libelleEcole'
  ];

  /**
   * Configuration des filtres basés sur les champs originaux
   */
  const filterConfigs = [
    {
      field: 'domaine_formation',
      label: 'Domaine de formation',
      placeholder: 'Filtrer par domaine',
      tagColor: 'orange',
      dynamic: true,
      allLabel: 'Tous les domaines'
    },
    {
      field: 'diplome_recent',
      label: 'Diplôme',
      placeholder: 'Filtrer par diplôme',
      tagColor: 'blue',
      dynamic: true,
      allLabel: 'Tous les diplômes'
    }
  ];

  /**
   * Configuration des actions
   */
  const actions = [
    {
      type: 'view',
      icon: <EyeIcon />,
      tooltip: 'Voir les détails',
      color: 'inherit'
    },
    {
      type: 'edit',
      icon: <EditIcon />,
      tooltip: 'Modifier',
      color: 'inherit'
    },
    {
      type: 'delete',
      icon: <TrashIcon />,
      tooltip: 'Supprimer',
      color: '#dc3545'
    }
  ];

  /**
   * Configuration du modal
   */
  const modalConfig = {
    size: 'md',
    titles: {
      view: 'Détails du personnel',
      edit: 'Modifier le personnel',
      create: 'Ajouter du personnel'
    },
    saveButtonText: 'Sauvegarder',
    showSaveButton: true,
    renderContent: (modalType, selectedItem) => {
      switch (modalType) {
        case 'view':
          return selectedItem ? (
            <div style={{ lineHeight: '2' }}>
              <div><strong>ID Personnel:</strong> {selectedItem.idPersonnel}</div>
              <div><strong>Nom complet:</strong> {selectedItem.prenomPersonnel} {selectedItem.nomPersonnel}</div>
              <div><strong>Email:</strong> {selectedItem.email}</div>
              <div><strong>Contact:</strong> {selectedItem.contact}</div>
              <div><strong>Date de naissance:</strong> {selectedItem.dateNaissance}</div>
              <div><strong>Fonction:</strong> {selectedItem.libelle_fonction}</div>
              <div><strong>Domaine de formation:</strong> {selectedItem.domaine_formation}</div>
              <div><strong>Diplôme récent:</strong> {selectedItem.diplome_recent}</div>
              <div><strong>Années d'expérience:</strong> {selectedItem.nombreAnneeExperience}</div>
              <div><strong>École:</strong> {selectedItem.libelleEcole}</div>
              <div><strong>Date de création:</strong> {selectedItem.panier_personnel_date_creation}</div>
              <div><strong>ID Panier:</strong> {selectedItem.idpanier_personnel_id}</div>
              {selectedItem.lien_autorisation && (
                <div><strong>Lien autorisation:</strong> {selectedItem.lien_autorisation}</div>
              )}
              {selectedItem.lien_piece && (
                <div><strong>Lien pièce:</strong> {selectedItem.lien_piece}</div>
              )}
            </div>
          ) : null;
        
        case 'edit':
          return (
            <div>
              <p>Formulaire de modification (simulation)</p>
              <p>Ici vous pourriez intégrer un formulaire complet pour modifier les données du personnel.</p>
            </div>
          );
        
        case 'create':
          return (
            <div>
              <p>Formulaire de création (simulation)</p>
              <p>Ici vous pourriez intégrer un formulaire complet pour ajouter un nouveau membre du personnel.</p>
            </div>
          );
        
        default:
          return <div>Type de modal non reconnu</div>;
      }
    }
  };

  /**
   * Gestionnaire des actions
   */
  const handleAction = (actionType, item, { openModal, closeModal, toaster }) => {
    switch (actionType) {
      case 'view':
        openModal('view', item);
        break;
      
      case 'edit':
        openModal('edit', item);
        break;
      
      case 'create':
        openModal('create');
        break;
      
      case 'delete':
        toaster.push({
          type: 'info',
          header: 'Action simulée',
          message: `Suppression de ${item.prenomPersonnel} ${item.nomPersonnel} (simulation)`
        }, { duration: 3000 });
        break;
      
      case 'save':
        toaster.push({
          type: 'success',
          header: 'Succès',
          message: 'Données sauvegardées avec succès'
        }, { duration: 3000 });
        closeModal();
        break;
      
      default:
        console.log('Action non gérée:', actionType);
    }
  };

  /**
   * Callbacks pour les événements
   */
  const onDataLoaded = (data) => {
    console.log('Données chargées:', data.length, 'éléments');
  };

  const onError = (error) => {
    console.error('Erreur de chargement:', error);
  };

  return (
    <DataTable
      // Configuration de base
      title="Gestion du Personnel"
      subtitle="membre(s) du personnel trouvé(s)"
      
      // Configuration API (sans transformation)
      apiUrl="panier-personnel/ecole/38/VALIDEE"
      
      // Configuration du tableau
      columns={columns}
      searchableFields={searchableFields}
      filterConfigs={filterConfigs}
      actions={actions}
      
      // Configuration de la pagination
      defaultPageSize={10}
      pageSizeOptions={[10, 20, 50]}
      
      // Configuration du modal
      modalConfig={modalConfig}
      
      // Configuration des boutons
      enableRefresh={true}
      enableCreate={true}
      createButtonText="Nouveau personnel"
      
      // Gestionnaires d'événements
      onAction={handleAction}
      onDataLoaded={onDataLoaded}
      onError={onError}
      
      // Configuration du style
      tableHeight={500}
      customStyles={{
        container: {},
        panel: {},
        table: {}
      }}
    />
  );
};

export default RecrutementPersonnel;