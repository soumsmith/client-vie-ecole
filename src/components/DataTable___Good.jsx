import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Panel,
  InputGroup,
  Input,
  SelectPicker,
  TagGroup,
  Tag,
  Button,
  ButtonGroup,
  Pagination,
  FlexboxGrid,
  Badge,
  Whisper,
  Tooltip,
  Modal,
  Message,
  useToaster
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import EditIcon from '@rsuite/icons/Edit';
import TrashIcon from '@rsuite/icons/Trash';
import EyeIcon from '@rsuite/icons/Visible';
import PlusIcon from '@rsuite/icons/Plus';
import ReloadIcon from '@rsuite/icons/Reload';

const { Column, HeaderCell, Cell } = Table;

/**
 * Composant DataTable générique et réutilisable
 * Supporte la configuration complète des colonnes, filtres, et actions
 */
const DataTable = ({
  // Configuration de base
  title = "Gestion des données",
  subtitle = "données trouvées",
  
  // Configuration API
  apiUrl,
  dataTransformer = (data) => data,
  
  // Configuration des colonnes
  columns = [],
  
  // Configuration des filtres
  searchableFields = [],
  filterConfigs = [],
  
  // Configuration des actions
  actions = [],
  onAction = () => {},
  
  // Configuration de la pagination
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],
  
  // Configuration du modal
  modalConfig = {},
  
  // Données statiques (optionnel, si pas d'API)
  staticData = null,
  
  // Configuration additionnelle
  tableHeight = 500,
  enableRefresh = true,
  enableCreate = true,
  createButtonText = "Nouveau",
  
  // Callbacks personnalisés
  onDataLoaded = () => {},
  onError = () => {},
  
  // Style personnalisé
  customStyles = {}
}) => {
  const toaster = useToaster();

  // États principaux
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(!!apiUrl);
  const [error, setError] = useState(null);

  // États de filtrage et tri
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortColumn, setSortColumn] = useState('');
  const [sortType, setSortType] = useState('');
  const [limit, setLimit] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  // États du modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('view');
  const [selectedItem, setSelectedItem] = useState(null);

  /**
   * Fonction de récupération des données depuis l'API
   */
  const fetchData = async () => {
    if (!apiUrl) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      const transformedData = dataTransformer(data);
      setTableData(transformedData);
      
      onDataLoaded(transformedData);
      
      toaster.push(
        <Message type="success" header="Succès">
          {transformedData.length} {subtitle}
        </Message>,
        { duration: 3000 }
      );

    } catch (err) {
      console.error('Erreur lors du chargement des données:', err);
      setError(err.message);
      onError(err);
      
      toaster.push(
        <Message type="error" header="Erreur">
          Impossible de charger les données: {err.message}
        </Message>,
        { duration: 5000 }
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Initialisation des données
   */
  useEffect(() => {
    if (staticData) {
      setTableData(staticData);
      setLoading(false);
    } else if (apiUrl) {
      fetchData();
    }
  }, [apiUrl, staticData]);

  /**
   * Fonction pour obtenir la valeur de recherche d'un élément
   */
  const getSearchValue = (item, field) => {
    if (typeof field === 'object' && field.dataKeys) {
      return field.dataKeys.map(key => String(item[key] || '')).join(' ');
    }
    if (typeof field === 'object' && field.valueGetter) {
      return String(field.valueGetter(item) || '');
    }
    return String(item[field] || '');
  };

  /**
   * Fonction pour obtenir la valeur d'une cellule
   */
  const getCellValue = (rowData, column) => {
    if (column.valueGetter) {
      return column.valueGetter(rowData);
    }
    if (column.dataKeys && Array.isArray(column.dataKeys)) {
      return column.dataKeys.map(key => rowData[key]).join(column.separator || ' ');
    }
    return rowData[column.dataKey];
  };

  /**
   * Génération dynamique des options de filtres
   */
  const dynamicFilterOptions = useMemo(() => {
    return filterConfigs.reduce((acc, filter) => {
      if (filter.dynamic) {
        const uniqueValues = [...new Set(tableData.map(item => item[filter.field]))];
        acc[filter.field] = [
          { label: filter.allLabel || `Tous les ${filter.label.toLowerCase()}`, value: '' },
          ...uniqueValues.map(value => ({ label: value, value }))
        ];
      } else {
        acc[filter.field] = filter.options;
      }
      return acc;
    }, {});
  }, [tableData, filterConfigs]);

  /**
   * Fonction pour obtenir la valeur de tri d'une colonne
   */
  const getSortValue = (item, sortColumn) => {
    // Trouver la configuration de la colonne correspondante
    const columnConfig = columns.find(col => col.dataKey === sortColumn || 
      (col.dataKeys && col.dataKeys.includes(sortColumn)));
    
    if (columnConfig) {
      return getCellValue(item, columnConfig);
    }
    
    // Fallback pour les colonnes simples
    return item[sortColumn];
  };

  /**
   * Logique de filtrage et tri
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = tableData.filter(item => {
      // Filtrage par recherche textuelle
      const matchesSearch = !searchTerm || searchableFields.some(field => 
        getSearchValue(item, field).toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Filtrage par filtres spécifiques
      const matchesFilters = Object.entries(activeFilters).every(([field, value]) => 
        !value || String(item[field] || '').toLowerCase() === String(value || '').toLowerCase()
      );
      
      return matchesSearch && matchesFilters;
    });

    // Tri amélioré
    if (sortColumn && sortType) {
      filtered = filtered.sort((a, b) => {
        let x = getSortValue(a, sortColumn);
        let y = getSortValue(b, sortColumn);
        
        // Gestion des valeurs null/undefined
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        
        // Conversion en string pour comparaison si nécessaire
        if (typeof x === 'string' && typeof y === 'string') {
          x = x.toLowerCase();
          y = y.toLowerCase();
        }
        
        // Tri numérique si les deux valeurs sont des nombres
        if (typeof x === 'number' && typeof y === 'number') {
          return sortType === 'asc' ? x - y : y - x;
        }
        
        // Tri standard
        if (sortType === 'asc') {
          return x < y ? -1 : x > y ? 1 : 0;
        } else {
          return x > y ? -1 : x < y ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [tableData, searchTerm, activeFilters, sortColumn, sortType, searchableFields, columns]);

  /**
   * Données paginées
   */
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredAndSortedData.slice(startIndex, startIndex + limit);
  }, [filteredAndSortedData, page, limit]);

  /**
   * Gestionnaires d'événements
   */
  const handleSortColumn = (sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  };

  const handleChangeLimit = (dataKey) => {
    setPage(1);
    setLimit(dataKey);
  };

  const handleChangePage = (dataKey) => {
    setPage(dataKey);
  };

  const handleFilterChange = (field, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    setPage(1); // Retour à la première page lors d'une recherche
  };

  const clearFilter = (field) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleAction = (actionType, item) => {
    onAction(actionType, item, { openModal, closeModal, toaster });
  };

  /**
   * Générateur de cellules personnalisées
   */
  const createCustomCell = (column) => {
    return ({ rowData, ...props }) => {
      const cellValue = getCellValue(rowData, column);
      
      switch (column.cellType) {
        case 'avatar':
          return (
            <Cell {...props}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  backgroundColor: column.avatarColor || '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  marginRight: '12px'
                }}>
                  {column.avatarGenerator ? column.avatarGenerator(rowData) : 
                    String(cellValue || '').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: '500', color: '#2c3e50' }}>
                    {cellValue}
                  </div>
                  {column.subField && (
                    <div style={{ fontSize: '12px', color: '#6c757d' }}>
                      {getCellValue(rowData, { dataKey: column.subField })}
                    </div>
                  )}
                </div>
              </div>
            </Cell>
          );

        case 'badge':
          return (
            <Cell {...props}>
              <Badge 
                color={column.badgeColorMap ? column.badgeColorMap(cellValue) : 'blue'} 
                content={cellValue} 
              />
            </Cell>
          );

        case 'progress':
          return (
            <Cell {...props}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span style={{ marginRight: '8px', fontWeight: '500' }}>
                  {cellValue}{column.progressUnit || '%'}
                </span>
                <div style={{
                  width: '50px',
                  height: '6px',
                  backgroundColor: '#e9ecef',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(cellValue, 100)}%`,
                    height: '100%',
                    backgroundColor: column.progressColorMap ? 
                      column.progressColorMap(cellValue) : '#28a745',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            </Cell>
          );

        case 'custom':
          return (
            <Cell {...props}>
              {column.customRenderer(rowData, cellValue)}
            </Cell>
          );

        case 'actions':
          return (
            <Cell {...props} style={{ padding: '6px' }}>
              <ButtonGroup size="xs">
                {actions.map((action, index) => (
                  <Whisper key={index} speaker={<Tooltip>{action.tooltip}</Tooltip>}>
                    <Button
                      appearance="subtle"
                      onClick={() => handleAction(action.type, rowData)}
                      style={{ 
                        padding: '4px 8px',
                        color: action.color || 'inherit'
                      }}
                    >
                      {action.icon}
                    </Button>
                  </Whisper>
                ))}
              </ButtonGroup>
            </Cell>
          );

      }
    };
  };

  /**
   * Affichage d'erreur
   */
  if (error && !loading) {
    return (
      <div style={{ padding: '24px', backgroundColor: '#fafafa', minHeight: '100vh', ...customStyles.container }}>
        <Panel 
          header="Erreur de chargement"
          bordered
          style={{ backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
        >
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Message type="error" header="Impossible de charger les données">
              {error}
            </Message>
            <Button 
              appearance="primary" 
              onClick={fetchData}
              style={{ marginTop: '20px', backgroundColor: '#667eea', border: 'none' }}
            >
              Réessayer
            </Button>
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '24px', 
      backgroundColor: '#fafafa', 
      minHeight: '100vh',
      ...customStyles.container 
    }}>
      <Panel 
        header={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '20px', fontWeight: '600' }}>
                {title}
              </h3>
              <p style={{ margin: '4px 0 0 0', color: '#6c757d', fontSize: '14px' }}>
                {loading ? 'Chargement...' : `${filteredAndSortedData.length} ${subtitle}`}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {enableRefresh && apiUrl && (
                <Button
                  appearance="ghost"
                  onClick={fetchData}
                  disabled={loading}
                  startIcon={<ReloadIcon />}
                >
                  Actualiser
                </Button>
              )}
              {enableCreate && (
                <Button
                  appearance="primary"
                  startIcon={<PlusIcon />}
                  onClick={() => handleAction('create')}
                  style={{ backgroundColor: '#667eea', border: 'none' }}
                >
                  {createButtonText}
                </Button>
              )}
            </div>
          </div>
        }
        bordered
        style={{ 
          backgroundColor: '#ffffff', 
          borderRadius: '8px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          ...customStyles.panel 
        }}
      >
        {/* Barre de filtres et recherche */}
        {(searchableFields.length > 0 || filterConfigs.length > 0) && (
          <div style={{ marginBottom: '20px' }}>
            <FlexboxGrid justify="space-between" align="middle">
              {searchableFields.length > 0 && (
                <FlexboxGrid.Item colspan={8}>
                  <InputGroup inside>
                    <Input
                      placeholder={`Rechercher...`}
                      value={searchTerm}
                      onChange={handleSearchChange}
                      style={{ width: '100%' }}
                      disabled={loading}
                    />
                    <InputGroup.Addon>
                      <SearchIcon />
                    </InputGroup.Addon>
                  </InputGroup>
                </FlexboxGrid.Item>
              )}
              
              {filterConfigs.map((filter, index) => (
                <FlexboxGrid.Item key={filter.field} colspan={6}>
                  <SelectPicker
                    data={dynamicFilterOptions[filter.field] || filter.options}
                    placeholder={filter.placeholder || `Filtrer par ${filter.label}`}
                    value={activeFilters[filter.field] || ''}
                    onChange={(value) => handleFilterChange(filter.field, value)}
                    cleanable={false}
                    searchable={false}
                    style={{ width: '100%' }}
                    disabled={loading}
                  />
                </FlexboxGrid.Item>
              ))}
            </FlexboxGrid>
          </div>
        )}

        {/* Tags de filtres actifs */}
        {(searchTerm || Object.keys(activeFilters).length > 0) && (
          <div style={{ marginBottom: '16px' }}>
            <TagGroup>
              {searchTerm && (
                <Tag
                  closable
                  onClose={() => setSearchTerm('')}
                  color="blue"
                >
                  Recherche: {searchTerm}
                </Tag>
              )}
              {Object.entries(activeFilters).map(([field, value]) => {
                const filterConfig = filterConfigs.find(f => f.field === field);
                return value && (
                  <Tag
                    key={field}
                    closable
                    onClose={() => clearFilter(field)}
                    color={filterConfig?.tagColor || 'green'}
                  >
                    {filterConfig?.label || field}: {value}
                  </Tag>
                );
              })}
            </TagGroup>
          </div>
        )}

        {/* Tableau principal */}
        <Table
          height={tableHeight}
          data={paginatedData}
          sortColumn={sortColumn}
          sortType={sortType}
          onSortColumn={handleSortColumn}
          loading={loading}
          bordered
          cellBordered
          rowHeight={60}
          style={{ fontSize: '14px', ...customStyles.table }}
        >
          {columns.map((column, index) => {
            const CustomCell = createCustomCell(column);
            
            return (
              <Column 
                key={column.dataKey || index}
                width={column.width || 150}
                align={column.align || 'left'}
                sortable={column.sortable !== false}
                fixed={column.fixed}
              >
                <HeaderCell style={{ 
                  fontWeight: '600', 
                  backgroundColor: '#f8f9fa',
                  ...column.headerStyle 
                }}>
                  {column.title}
                </HeaderCell>
                <CustomCell dataKey={column.dataKey} />
              </Column>
            );
          })}
        </Table>

        {/* Pagination */}
        <div style={{ 
          padding: '20px 0', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderTop: '1px solid #e9ecef',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {loading ? 'Chargement...' : 
              `Affichage de ${((page - 1) * limit) + 1} à ${Math.min(page * limit, filteredAndSortedData.length)} sur ${filteredAndSortedData.length} entrées`
            }
          </div>
          <Pagination
            prev
            next
            first
            last
            ellipsis
            boundaryLinks
            maxButtons={5}
            size="md"
            layout={['total', '-', 'limit', '|', 'pager', 'skip']}
            total={filteredAndSortedData.length}
            limitOptions={pageSizeOptions}
            limit={limit}
            activePage={page}
            onChangePage={handleChangePage}
            onChangeLimit={handleChangeLimit}
            disabled={loading}
          />
        </div>
      </Panel>

      {/* Modal générique */}
      <Modal open={showModal} onClose={closeModal} size={modalConfig.size || "md"}>
        <Modal.Header>
          <Modal.Title>
            {modalConfig.titles?.[modalType] || `${modalType} élément`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalConfig.renderContent ? 
            modalConfig.renderContent(modalType, selectedItem) :
            <div>Configuration du modal requise</div>
          }
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={closeModal} appearance="subtle">
            Annuler
          </Button>
          {modalType !== 'view' && modalConfig.showSaveButton !== false && (
            <Button 
              appearance="primary" 
              style={{ backgroundColor: '#667eea', border: 'none' }}
              onClick={() => handleAction('save', selectedItem)}
            >
              {modalConfig.saveButtonText || 'Sauvegarder'}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default DataTable;