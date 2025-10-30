import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  Message,
  Checkbox,
  Divider,
  DateRangePicker,
  DatePicker
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import PlusIcon from '@rsuite/icons/Plus';
import ReloadIcon from '@rsuite/icons/Reload';

const { Column, HeaderCell, Cell } = Table;

/**
 * Hook pour gérer la largeur dynamique de la table avec scroll horizontal
 */
const useTableDimensions = (minContentWidth = 1000) => {
  const [tableWidth, setTableWidth] = useState('100%');
  
  useEffect(() => {
    const calculateMinWidth = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth < minContentWidth) {
        setTableWidth(minContentWidth); // Force le scroll horizontal
      } else {
        setTableWidth('100%'); // Utilise toute la largeur disponible
      }
    };
    
    calculateMinWidth();
    window.addEventListener('resize', calculateMinWidth);
    return () => window.removeEventListener('resize', calculateMinWidth);
  }, [minContentWidth]);
  
  return tableWidth;
};

/**
 * Composant DataTable générique et réutilisable avec support de sélection multiple
 * VERSION AMÉLIORÉE - Date pickers, modal externe, actions dans le parent, scroll responsive
 */
const DataTable = ({
  // ==================== CONFIGURATION DE BASE ====================
  /** Titre principal du tableau */
  title = "Gestion des données",
  /** Texte descriptif pour le nombre d'éléments */
  subtitle = "données trouvées",

  // ==================== DONNÉES ET ÉTATS ====================
  /** Données à afficher dans le tableau */
  data = [],
  /** État de chargement */
  loading = false,
  /** Message d'erreur éventuel */
  error = null,

  // ==================== CONFIGURATION DES COLONNES ====================
  /** Configuration des colonnes du tableau */
  columns = [],

  // ==================== CONFIGURATION DES FILTRES ====================
  /** Champs sur lesquels effectuer la recherche textuelle */
  searchableFields = [],
  /** Configuration des filtres dropdown et date pickers */
  filterConfigs = [],

  // ==================== CONFIGURATION DES ACTIONS ====================
  /** Actions disponibles pour chaque ligne */
  actions = [],
  /** Gestionnaire des actions */
  onAction = () => { },

  // ==================== CONFIGURATION DE LA PAGINATION ====================
  /** Nombre d'éléments par page par défaut */
  defaultPageSize = 10,
  /** Options disponibles pour le nombre d'éléments par page */
  pageSizeOptions = [10, 20, 50],

  // ==================== CONFIGURATION DE LA SÉLECTION ====================
  /** Activer la sélection multiple */
  selectable = false,
  /** Éléments sélectionnés (contrôlé de l'extérieur) */
  selectedItems = [],
  /** Callback appelé lors du changement de sélection */
  onSelectionChange = () => { },
  /** Clé unique pour identifier les éléments (par défaut 'id') */
  rowKey = 'id',

  // ==================== CONFIGURATION ADDITIONNELLE ====================
  /** Hauteur du tableau en pixels */
  tableHeight = 500,
  /** Activer le bouton de rafraîchissement */
  enableRefresh = true,
  /** Activer le bouton de création */
  enableCreate = true,
  /** Texte du bouton de création */
  createButtonText = "Nouveau",
  /** Largeur minimale pour forcer le scroll horizontal */
  minTableWidth = 1000,

  // ==================== CALLBACKS ====================
  /** Callback appelé lors du rafraîchissement */
  onRefresh = () => { },

  // ==================== STYLES PERSONNALISÉS ====================
  /** Styles CSS personnalisés */
  customStyles = {}
}) => {
  // ==================== ÉTATS LOCAUX ====================

  // États de filtrage et tri
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortColumn, setSortColumn] = useState('');
  const [sortType, setSortType] = useState('');

  // États de pagination
  const [limit, setLimit] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  // Hook pour la largeur responsive de la table
  const tableWidth = useTableDimensions(minTableWidth);
  const academicYear = JSON.parse(localStorage.getItem('academicYearMain'));

  // ==================== UTILITAIRES DE DONNÉES ====================

  /**
   * Extrait la valeur de recherche d'un élément pour un champ donné
   */
  const getSearchValue = useCallback((item, field) => {
    if (typeof field === 'object' && field.dataKeys) {
      return field.dataKeys.map(key => String(item[key] || '')).join(' ');
    }
    if (typeof field === 'object' && field.valueGetter) {
      return String(field.valueGetter(item) || '');
    }
    return String(item[field] || '');
  }, []);

  /**
   * Obtient la valeur d'une cellule selon la configuration de la colonne
   */
  const getCellValue = useCallback((rowData, column) => {
    if (column.valueGetter) {
      return column.valueGetter(rowData);
    }
    if (column.dataKeys && Array.isArray(column.dataKeys)) {
      return column.dataKeys
        .map(key => rowData[key])
        .join(column.separator || ' ');
    }
    return rowData[column.dataKey];
  }, []);

  /**
   * Obtient la valeur de tri pour une colonne donnée
   */
  const getSortValue = useCallback((item, sortColumn) => {
    const columnConfig = columns.find(col =>
      col.dataKey === sortColumn ||
      (col.dataKeys && col.dataKeys.includes(sortColumn))
    );

    if (columnConfig) {
      return getCellValue(item, columnConfig);
    }

    return item[sortColumn];
  }, [columns, getCellValue]);

  /**
   * Vérifie si une date est dans une plage donnée
   */
  const isDateInRange = useCallback((itemDate, filterValue) => {
    if (!itemDate || !filterValue) return true;

    const itemDateObj = new Date(itemDate);

    if (Array.isArray(filterValue)) {
      // Date range
      const [startDate, endDate] = filterValue;
      if (!startDate && !endDate) return true;
      if (startDate && itemDateObj < startDate) return false;
      if (endDate && itemDateObj > endDate) return false;
      return true;
    } else {
      // Single date
      const filterDate = new Date(filterValue);
      return itemDateObj.toDateString() === filterDate.toDateString();
    }
  }, []);

  // ==================== GÉNÉRATION DYNAMIQUE DES OPTIONS ====================

  /**
   * Génère dynamiquement les options de filtres basées sur les données
   */
  const dynamicFilterOptions = useMemo(() => {
    return filterConfigs.reduce((acc, filter) => {
      if (filter.type === 'date' || filter.type === 'dateRange') {
        // Les filtres de date n'ont pas besoin d'options dynamiques
        acc[filter.field] = [];
      } else if (filter.dynamic) {
        const uniqueValues = [...new Set(
          data.map(item => item[filter.field])
            .filter(value => value !== null && value !== undefined && value !== '')
        )];

        acc[filter.field] = [
          { label: filter.allLabel || `Tous les ${filter.label.toLowerCase()}`, value: '' },
          ...uniqueValues.map(value => ({
            label: String(value),
            value: String(value)
          }))
        ];
      } else {
        acc[filter.field] = filter.options || [];
      }
      return acc;
    }, {});
  }, [data, filterConfigs]);

  // ==================== LOGIQUE DE FILTRAGE ET TRI ====================

  /**
   * Applique le filtrage et le tri sur les données
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      // Filtrage par recherche textuelle
      const matchesSearch = !searchTerm || searchableFields.some(field =>
        getSearchValue(item, field)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

      // Filtrage par filtres spécifiques
      const matchesFilters = Object.entries(activeFilters).every(([field, value]) => {
        if (!value) return true;

        const filterConfig = filterConfigs.find(f => f.field === field);

        if (filterConfig && (filterConfig.type === 'date' || filterConfig.type === 'dateRange')) {
          return isDateInRange(item[field], value);
        }

        return String(item[field] || '').toLowerCase() === String(value || '').toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });

    // Application du tri
    if (sortColumn && sortType) {
      filtered = filtered.sort((a, b) => {
        let x = getSortValue(a, sortColumn);
        let y = getSortValue(b, sortColumn);

        // Gestion des valeurs nulles
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;

        // Tri des dates
        if (x instanceof Date && y instanceof Date) {
          return sortType === 'asc' ? x - y : y - x;
        }

        // Normalisation pour la comparaison de chaînes
        if (typeof x === 'string' && typeof y === 'string') {
          x = x.toLowerCase();
          y = y.toLowerCase();
        }

        // Tri numérique optimisé
        if (typeof x === 'number' && typeof y === 'number') {
          return sortType === 'asc' ? x - y : y - x;
        }

        // Tri général
        const comparison = x < y ? -1 : x > y ? 1 : 0;
        return sortType === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [
    data,
    searchTerm,
    activeFilters,
    sortColumn,
    sortType,
    searchableFields,
    getSearchValue,
    getSortValue,
    filterConfigs,
    isDateInRange
  ]);

  /**
   * Calcule les données paginées
   */
  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredAndSortedData.slice(startIndex, startIndex + limit);
  }, [filteredAndSortedData, page, limit]);

  // ==================== LOGIQUE DE SÉLECTION ====================

  /**
   * Obtient les IDs des éléments sélectionnés
   */
  const selectedIds = useMemo(() => {
    if (!Array.isArray(selectedItems)) return [];
    return selectedItems.map(item =>
      typeof item === 'object' ? item[rowKey] : item
    );
  }, [selectedItems, rowKey]);

  /**
   * Vérifie si tous les éléments de la page sont sélectionnés
   */
  const isAllPageSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every(item => selectedIds.includes(item[rowKey]));
  }, [paginatedData, selectedIds, rowKey]);

  /**
   * Vérifie si certains éléments de la page sont sélectionnés
   */
  const isSomePageSelected = useMemo(() => {
    return paginatedData.some(item => selectedIds.includes(item[rowKey]));
  }, [paginatedData, selectedIds, rowKey]);

  /**
   * Gère la sélection de tous les éléments de la page
   */
  const handleSelectAllPage = useCallback((checked) => {
    const pageIds = paginatedData.map(item => item[rowKey]);

    let newSelectedIds;
    if (checked) {
      // Ajouter tous les éléments de la page non encore sélectionnés
      newSelectedIds = [...new Set([...selectedIds, ...pageIds])];
    } else {
      // Retirer tous les éléments de la page
      newSelectedIds = selectedIds.filter(id => !pageIds.includes(id));
    }

    onSelectionChange(newSelectedIds);
  }, [paginatedData, selectedIds, rowKey, onSelectionChange]);

  /**
   * Gère la sélection d'un élément individuel
   */
  const handleSelectItem = useCallback((itemId, checked) => {
    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...selectedIds, itemId];
    } else {
      newSelectedIds = selectedIds.filter(id => id !== itemId);
    }

    onSelectionChange(newSelectedIds);
  }, [selectedIds, onSelectionChange]);

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================

  /**
   * Gestionnaire du tri des colonnes - EMPÊCHE LA PROPAGATION
   */
  const handleSortColumn = useCallback((sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  }, []);

  /**
   * Gestionnaire du changement de limite de pagination - EMPÊCHE LA PROPAGATION
   */
  const handleChangeLimit = useCallback((newLimit) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  /**
   * Gestionnaire du changement de page - EMPÊCHE LA PROPAGATION
   */
  const handleChangePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  /**
   * Gestionnaire des changements de filtres - EMPÊCHE LA PROPAGATION
   */
  const handleFilterChange = useCallback((field, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  }, []);

  /**
   * Gestionnaire de la recherche textuelle - EMPÊCHE LA PROPAGATION
   */
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  /**
   * Supprime un filtre actif
   */
  const clearFilter = useCallback((field) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  }, []);

  /**
   * Gestionnaire principal des actions - EMPÊCHE LA PROPAGATION
   */
  const handleAction = useCallback((actionType, item, event) => {
    // Empêcher la propagation pour éviter de déclencher le formulaire parent
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    // Déléguer l'action au composant parent
    onAction(actionType, item);
  }, [onAction]);

  /**
   * Gestionnaire pour les boutons d'actions - EMPÊCHE LA PROPAGATION
   */
  const handleActionButtonClick = useCallback((actionType, item) => {
    return (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleAction(actionType, item, event);
    };
  }, [handleAction]);

  /**
   * Gestionnaire pour le bouton refresh - EMPÊCHE LA PROPAGATION
   */
  const handleRefreshClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    onRefresh();
  }, [onRefresh]);

  /**
   * Gestionnaire pour le bouton create - EMPÊCHE LA PROPAGATION
   */
  const handleCreateClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    handleAction('create', null, event);
  }, [handleAction]);

  // ==================== GÉNÉRATEURS DE FILTRES ====================

  /**
   * Génère un composant de filtre selon le type
   */
  const renderFilterComponent = useCallback((filter) => {
    const baseProps = {
      placeholder: filter.placeholder || `Filtrer par ${filter.label}`,
      value: activeFilters[filter.field] || '',
      onChange: (value) => handleFilterChange(filter.field, value),
      style: { width: '100%' },
      disabled: loading
    };

    switch (filter.type) {
      case 'date':
        return (
          <DatePicker
            {...baseProps}
            format="dd/MM/yyyy"
            placeholder={filter.placeholder || `Sélectionner une date`}
            onChange={(value) => handleFilterChange(filter.field, value)}
            value={activeFilters[filter.field] || null}
            cleanable
          />
        );

      case 'dateRange':
        return (
          <DateRangePicker
            {...baseProps}
            format="dd/MM/yyyy"
            placeholder={filter.placeholder || `Sélectionner une période`}
            onChange={(value) => handleFilterChange(filter.field, value)}
            value={activeFilters[filter.field] || []}
            cleanable
          />
        );

      case 'select':
      default:
        return (
          <SelectPicker
            data={dynamicFilterOptions[filter.field] || filter.options}
            {...baseProps}
            cleanable={false}
            searchable={false}
          />
        );
    }
  }, [activeFilters, handleFilterChange, loading, dynamicFilterOptions]);

  // ==================== GÉNÉRATEURS DE CELLULES ====================

  /**
   * Crée une cellule personnalisée selon le type de colonne
   */
  const createCustomCell = useCallback((column) => {
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
                  {column.avatarGenerator ?
                    column.avatarGenerator(rowData) :
                    String(cellValue || '').charAt(0).toUpperCase()
                  }
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
          const progressValue = Math.max(0, Math.min(Number(cellValue) || 0, 100));
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
                    width: `${progressValue}%`,
                    height: '100%',
                    backgroundColor: column.progressColorMap ?
                      column.progressColorMap(cellValue) : '#28a745',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            </Cell>
          );

        case 'date':
          const dateValue = cellValue ? new Date(cellValue) : null;
          return (
            <Cell {...props}>
              {dateValue ? dateValue.toLocaleDateString('fr-FR') : '-'}
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
              <ButtonGroup size="xs" className='d-flex'>
                {actions.map((action, index) => (
                  <Whisper key={`${action.type}-${index}`} speaker={<Tooltip>{action.tooltip}</Tooltip>}>
                    <Button
                      appearance="subtle"
                      onClick={handleActionButtonClick(action.type, rowData)}
                      className='mx-auto'
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

        default:
          return (
            <Cell {...props}>
              {column.cellRenderer ? 
                column.cellRenderer(cellValue) : 
                (typeof cellValue === 'object' ? JSON.stringify(cellValue) : cellValue)
              }
            </Cell>
          );
      }
    };
  }, [getCellValue, actions, handleActionButtonClick]);

  /**
   * Crée la cellule de sélection
   */
  const SelectionCell = useCallback(({ rowData, ...props }) => {
    return (
      <Cell {...props} style={{ padding: '6px' }}>
        <Checkbox
          checked={selectedIds.includes(rowData[rowKey])}
          onChange={(value, checked, event) => {
            event.stopPropagation();
            handleSelectItem(rowData[rowKey], checked);
          }}
        />
      </Cell>
    );
  }, [selectedIds, rowKey, handleSelectItem]);

  /**
   * Crée l'en-tête de sélection
   */
  const SelectionHeaderCell = useCallback((props) => {
    return (
      <HeaderCell {...props} style={{ padding: '6px' }}>
        <Checkbox
          indeterminate={isSomePageSelected && !isAllPageSelected}
          checked={isAllPageSelected}
          onChange={(value, checked, event) => {
            event.stopPropagation();
            handleSelectAllPage(checked);
          }}
        />
      </HeaderCell>
    );
  }, [isSomePageSelected, isAllPageSelected, handleSelectAllPage]);

  /**
   * Formatte la valeur d'un filtre pour l'affichage dans les tags
   */
  const formatFilterValueForTag = useCallback((field, value) => {
    const filterConfig = filterConfigs.find(f => f.field === field);

    if (!filterConfig) return String(value);

    if (filterConfig.type === 'date') {
      return value ? new Date(value).toLocaleDateString('fr-FR') : '';
    }

    if (filterConfig.type === 'dateRange') {
      if (Array.isArray(value) && value.length === 2) {
        const [start, end] = value;
        const startStr = start ? new Date(start).toLocaleDateString('fr-FR') : '';
        const endStr = end ? new Date(end).toLocaleDateString('fr-FR') : '';
        return `${startStr} - ${endStr}`;
      }
      return '';
    }

    return String(value);
  }, [filterConfigs]);

  // ==================== STYLES POUR LE SCROLL RESPONSIVE ====================
  const tableContainerStyle = {
    width: '100%',
    overflowX: 'auto',
    WebkitOverflowScrolling: 'touch', // Smooth scroll sur iOS
    scrollbarWidth: 'thin', // Firefox
  };

  // ==================== RENDU PRINCIPAL ====================

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#fff !important',
      minHeight: '100vh',
    }} className='p-0'>
      <Panel
        header={
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <h3 style={{
                margin: 0,
                color: '#2c3e50',
                fontSize: '20px',
                fontWeight: '600'
              }}>
                {title}
              </h3>
              <p style={{
                margin: '4px 0 0 0',
                color: '#6c757d',
                fontSize: '14px'
              }}>
                {loading ?
                  'Chargement...' :
                  `${filteredAndSortedData.length} ${subtitle}${selectable && selectedIds.length > 0 ? ` • ${selectedIds.length} sélectionné(s)` : ''}`
                }
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              {enableRefresh && (
                <Button
                  appearance="ghost"
                  onClick={handleRefreshClick}
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
                  onClick={handleCreateClick}
                   className={`datatable-add-btn-${academicYear?.niveauEnseignement?.libelle.replace(/[\s()]/g, '')} datatable-add-btn-niveauEnseignement-${academicYear?.niveauEnseignement?.id}`} 
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
          ...customStyles.panel
        }}
      >
        {/* ==================== BARRE DE FILTRES ==================== */}
        {(searchableFields.length > 0 || filterConfigs.length > 0) && (
          <div style={{ marginBottom: '20px' }} className='mt-4'>
            <FlexboxGrid justify="start" align="middle" style={{ gap: '16px', flexWrap: 'wrap' }}>
              {searchableFields.length > 0 && (
                <FlexboxGrid.Item colspan={6} style={{ minWidth: '200px' }}>
                  <InputGroup inside>
                    <Input
                      placeholder="Rechercher..."
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

              {filterConfigs.map((filter) => (
                <FlexboxGrid.Item
                  key={filter.field}
                  colspan={filter.type === 'dateRange' ? 8 : 5}
                  style={{ minWidth: filter.type === 'dateRange' ? '300px' : '180px' }}
                  className='mt-0'
                >
                  {renderFilterComponent(filter)}
                </FlexboxGrid.Item>
              ))}
            </FlexboxGrid>
          </div>
        )}

        {/* ==================== TAGS DE FILTRES ACTIFS ==================== */}
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
                const displayValue = formatFilterValueForTag(field, value);
                return value && displayValue && (
                  <Tag
                    key={field}
                    closable
                    onClose={() => clearFilter(field)}
                    color={filterConfig?.tagColor || 'green'}
                  >
                    {filterConfig?.label || field}: {displayValue}
                  </Tag>
                );
              })}
            </TagGroup>
          </div>
        )}

        {/* ==================== INFORMATIONS DE SÉLECTION ==================== */}
        {selectable && selectedIds.length > 0 && (
          <div style={{
            marginBottom: '16px',
            padding: '12px',
            backgroundColor: '#f0f9ff',
            borderRadius: '8px',
            border: '1px solid #bae6fd'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span style={{ color: '#0369a1', fontWeight: '500' }}>
                {selectedIds.length} élément(s) sélectionné(s)
              </span>
              <Button
                size="xs"
                appearance="ghost"
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  onSelectionChange([]);
                }}
              >
                Tout désélectionner
              </Button>
            </div>
          </div>
        )}

        {/* ==================== TABLEAU PRINCIPAL AVEC SCROLL RESPONSIVE ==================== */}
        <div style={tableContainerStyle}>
          <Table
            height={tableHeight}
            width={tableWidth} // ✅ Largeur dynamique pour le scroll
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
            {/* Colonne de sélection */}
            {selectable && (
              <Column width={50} align="center" fixed="left">
                <SelectionHeaderCell />
                <SelectionCell />
              </Column>
            )}

            {columns.map((column, index) => {
              const CustomCell = createCustomCell(column);

              return (
                <Column
                  key={column.dataKey || index}
                  flexGrow={column.flexGrow || 1} // ✅ Valeur par défaut
                  minWidth={column.minWidth || 150} // ✅ Augmente la largeur minimale par défaut
                  resizable={false}
                  align={column.align || 'left'}
                  sortable={column.sortable !== false}
                  fixed={column.fixed}
                >
                  <HeaderCell style={{
                    fontWeight: '600',
                    ...column.headerStyle
                  }}>
                    {column.title}
                  </HeaderCell>
                  <CustomCell dataKey={column.dataKey} />
                </Column>
              );
            })}
          </Table>
        </div>

        {/* ==================== PAGINATION - ÉVÉNEMENTS ISOLÉS ==================== */}
        <div style={{
          padding: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderTop: '1px solid #e9ecef',
          marginTop: '20px'
        }}
          onClick={(e) => e.stopPropagation()} // Empêcher la propagation des clics
        >
          <div style={{ fontSize: '14px', color: '#6c757d' }}>
            {loading ? 'Chargement...' :
              `Affichage de ${((page - 1) * limit) + 1} à ${Math.min(page * limit, filteredAndSortedData.length)} sur ${filteredAndSortedData.length} entrées`
            }
          </div>
          <div onClick={(e) => e.stopPropagation()}>
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
        </div>
      </Panel>
    </div>
  );
};

export default DataTable;