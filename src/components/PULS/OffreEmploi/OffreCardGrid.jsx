import React, { useState, useMemo, useCallback } from 'react';
import {
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
import CalendarIcon from '@rsuite/icons/Calendar';
import { FiMapPin, FiClock, FiUser, FiBriefcase, FiEye, FiEdit, FiTrash2, FiDollarSign, FiCalendar, FiFileText } from 'react-icons/fi';

/**
 * Composant OffreCardGrid - Alternative en cartes au DataTable pour les offres d'emploi
 * Reprend exactement les mêmes props et fonctionnalités que DataTable
 * mais affiche les données sous forme de cartes Bootstrap responsives
 */
const OffreCardGrid = ({
  // ==================== CONFIGURATION DE BASE ====================
  title = "Gestion des offres d'emploi",
  subtitle = "offres trouvées",

  // ==================== DONNÉES ET ÉTATS ====================
  data = [],
  loading = false,
  error = null,

  // ==================== CONFIGURATION DES COLONNES ====================
  columns = [], // Utilisé pour extraire les informations d'affichage

  // ==================== CONFIGURATION DES FILTRES ====================
  searchableFields = [],
  filterConfigs = [],

  // ==================== CONFIGURATION POUR FILTRAGE API ====================
  dateFilterMode = 'client',
  onDateRangeChange = null,
  defaultDateRange = null,

  // ==================== CONFIGURATION DES ACTIONS ====================
  actions = [],
  onAction = () => { },

  // ==================== CONFIGURATION DE LA PAGINATION ====================
  defaultPageSize = 12, // Adapté pour les cartes (multiple de 4)
  pageSizeOptions = [8, 12, 20, 32],

  // ==================== CONFIGURATION DE LA SÉLECTION ====================
  selectable = false,
  selectedItems = [],
  onSelectionChange = () => { },
  rowKey = 'id',

  // ==================== CONFIGURATION ADDITIONNELLE ====================
  enableRefresh = true,
  enableCreate = true,
  createButtonText = "Nouvelle Offre",

  // ==================== CALLBACKS ====================
  onRefresh = () => { },

  // ==================== STYLES PERSONNALISÉS ====================
  customStyles = {}
}) => {
  // ==================== ÉTATS LOCAUX (identiques à DataTable) ====================
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortColumn, setSortColumn] = useState('');
  const [sortType, setSortType] = useState('');
  const [limit, setLimit] = useState(defaultPageSize);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState(defaultDateRange || []);

  // ==================== LOGIQUE DE FILTRAGE ET TRI (reprise de DataTable) ====================
  
  const getSearchValue = useCallback((item, field) => {
    if (typeof field === 'object' && field.dataKeys) {
      return field.dataKeys.map(key => String(item[key] || '')).join(' ');
    }
    if (typeof field === 'object' && field.valueGetter) {
      return String(field.valueGetter(item) || '');
    }
    return String(item[field] || '');
  }, []);

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

  const isDateInRange = useCallback((itemDate, filterValue) => {
    if (!itemDate || !filterValue || dateFilterMode === 'server') return true;

    const itemDateObj = new Date(itemDate);

    if (Array.isArray(filterValue)) {
      const [startDate, endDate] = filterValue;
      if (!startDate && !endDate) return true;
      if (startDate && itemDateObj < startDate) return false;
      if (endDate && itemDateObj > endDate) return false;
      return true;
    } else {
      const filterDate = new Date(filterValue);
      return itemDateObj.toDateString() === filterDate.toDateString();
    }
  }, [dateFilterMode]);

  // ==================== GÉNÉRATION DYNAMIQUE DES OPTIONS ====================
  const dynamicFilterOptions = useMemo(() => {
    return filterConfigs.reduce((acc, filter) => {
      if (filter.type === 'date' || filter.type === 'dateRange') {
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
  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesSearch = !searchTerm || searchableFields.some(field =>
        getSearchValue(item, field)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      );

      const matchesFilters = Object.entries(activeFilters).every(([field, value]) => {
        if (!value) return true;

        const filterConfig = filterConfigs.find(f => f.field === field);

        if (filterConfig && (filterConfig.type === 'date' || filterConfig.type === 'dateRange') && dateFilterMode === 'server') {
          return true;
        }

        if (filterConfig && (filterConfig.type === 'date' || filterConfig.type === 'dateRange')) {
          return isDateInRange(item[field], value);
        }

        return String(item[field] || '').toLowerCase() === String(value || '').toLowerCase();
      });

      return matchesSearch && matchesFilters;
    });

    if (sortColumn && sortType) {
      filtered = filtered.sort((a, b) => {
        let x = getSortValue(a, sortColumn);
        let y = getSortValue(b, sortColumn);

        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;

        if (x instanceof Date && y instanceof Date) {
          return sortType === 'asc' ? x - y : y - x;
        }

        if (typeof x === 'string' && typeof y === 'string') {
          x = x.toLowerCase();
          y = y.toLowerCase();
        }

        if (typeof x === 'number' && typeof y === 'number') {
          return sortType === 'asc' ? x - y : y - x;
        }

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
    isDateInRange,
    dateFilterMode
  ]);

  const paginatedData = useMemo(() => {
    const startIndex = (page - 1) * limit;
    return filteredAndSortedData.slice(startIndex, startIndex + limit);
  }, [filteredAndSortedData, page, limit]);

  // ==================== LOGIQUE DE SÉLECTION ====================
  const selectedIds = useMemo(() => {
    if (!Array.isArray(selectedItems)) return [];
    return selectedItems.map(item =>
      typeof item === 'object' ? item[rowKey] : item
    );
  }, [selectedItems, rowKey]);

  const isAllPageSelected = useMemo(() => {
    if (paginatedData.length === 0) return false;
    return paginatedData.every(item => selectedIds.includes(item[rowKey]));
  }, [paginatedData, selectedIds, rowKey]);

  const isSomePageSelected = useMemo(() => {
    return paginatedData.some(item => selectedIds.includes(item[rowKey]));
  }, [paginatedData, selectedIds, rowKey]);

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================
  const handleDateRangeChange = useCallback((newDateRange) => {
    setDateRange(newDateRange);
    setPage(1);
    
    if (dateFilterMode === 'server' && onDateRangeChange) {
      const formattedRange = {
        dateBegin: newDateRange[0] ? 
          new Date(newDateRange[0]).toISOString().slice(0, 19).replace('T', ' ') : 
          "2025-05-19 00:00:00",
        dateEnd: newDateRange[1] ? 
          new Date(newDateRange[1]).toISOString().slice(0, 19).replace('T', ' ') : 
          "2025-07-19 23:59:00"
      };
      
      onDateRangeChange(formattedRange);
    }
  }, [dateFilterMode, onDateRangeChange]);

  const handleSelectAllPage = useCallback((checked) => {
    const pageIds = paginatedData.map(item => item[rowKey]);

    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...new Set([...selectedIds, ...pageIds])];
    } else {
      newSelectedIds = selectedIds.filter(id => !pageIds.includes(id));
    }

    onSelectionChange(newSelectedIds);
  }, [paginatedData, selectedIds, rowKey, onSelectionChange]);

  const handleSelectItem = useCallback((itemId, checked) => {
    let newSelectedIds;
    if (checked) {
      newSelectedIds = [...selectedIds, itemId];
    } else {
      newSelectedIds = selectedIds.filter(id => id !== itemId);
    }

    onSelectionChange(newSelectedIds);
  }, [selectedIds, onSelectionChange]);

  const handleFilterChange = useCallback((field, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  }, []);

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setPage(1);
  }, []);

  const clearFilter = useCallback((field) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[field];
      return newFilters;
    });
  }, []);

  const handleAction = useCallback((actionType, item, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onAction(actionType, item);
  }, [onAction]);

  const handleActionButtonClick = useCallback((actionType, item) => {
    return (event) => {
      event.preventDefault();
      event.stopPropagation();
      handleAction(actionType, item, event);
    };
  }, [handleAction]);

  const handleRefreshClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    onRefresh();
  }, [onRefresh]);

  const handleCreateClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    handleAction('create', null, event);
  }, [handleAction]);

  const handleChangePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const handleChangeLimit = useCallback((newLimit) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  // ==================== GÉNÉRATEURS DE FILTRES ====================
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

  // ==================== STYLES POUR LA ZONE DE FILTRES ====================
  const lightFilterStyles = {
    container: {
      background: 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e9ecef',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      marginBottom: '24px'
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '12px'
    },
    headerTitle: {
      fontSize: '16px',
      fontWeight: '600',
      color: '#495057',
      margin: 0
    },
    headerIcon: {
      padding: '8px',
      backgroundColor: '#667eea',
      borderRadius: '8px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    filtersGrid: {
      gap: '16px',
      alignItems: 'end'
    },
    filterItem: {
      minWidth: '200px'
    },
    dateRangeItem: {
      minWidth: '300px'
    },
    searchItem: {
      minWidth: '250px'
    },
    inputWrapper: {
      position: 'relative'
    },
    inputLabel: {
      fontSize: '13px',
      fontWeight: '500',
      color: '#6c757d',
      marginBottom: '6px',
      display: 'block'
    }
  };

  // ==================== COMPOSANT OFFRECARD ====================
  const OffreCard = ({ offre, isSelected, onSelect, actions, onAction }) => {
    const cardStyle = {
      transition: 'all 0.3s ease',
      border: '1px solid #e9ecef',
      borderRadius: '12px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      cursor: 'pointer',
      position: 'relative'
    };

    const hoverStyle = {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      borderColor: '#667eea'
    };

    // Fonction pour générer une couleur de fond basée sur le type d'offre
    const getTypeColor = (type) => {
      const colors = {
        'Stage': '#e3f2fd',
        'CDI': '#e8f5e8',
        'CDD': '#fff3e0',
        'Freelance': '#f3e5f5',
        'Temps partiel': '#e0f2f1'
      };
      return colors[type] || '#f8f9fa';
    };

    const getTypeTextColor = (type) => {
      const colors = {
        'Stage': '#1976d2',
        'CDI': '#388e3c',
        'CDD': '#f57c00',
        'Freelance': '#7b1fa2',
        'Temps partiel': '#00796b'
      };
      return colors[type] || '#495057';
    };

    return (
      <div 
        className="col-lg-3 col-md-6 col-sm-12 mb-4"
        onMouseEnter={(e) => Object.assign(e.currentTarget.firstChild.style, hoverStyle)}
        onMouseLeave={(e) => Object.assign(e.currentTarget.firstChild.style, cardStyle)}
      >
        <div style={cardStyle}>
          {/* Selection Checkbox */}
          {selectable && (
            <div style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              zIndex: 10,
              backgroundColor: 'rgba(255,255,255,0.9)',
              borderRadius: '4px',
              padding: '4px'
            }}>
              <Checkbox
                checked={isSelected}
                onChange={(value, checked, e) => {
                  e.stopPropagation();
                  onSelect(offre[rowKey], checked);
                }}
              />
            </div>
          )}

          {/* Header avec icône */}
          <div style={{
            height: '120px',
            background: `linear-gradient(135deg, ${getTypeColor(offre.typeOffre)} 0%, ${getTypeTextColor(offre.typeOffre)}20 100%)`,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              fontSize: '48px',
              color: getTypeTextColor(offre.typeOffre),
              opacity: 0.8
            }}>
              <FiBriefcase />
            </div>
            
            {/* Badge de type d'offre */}
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: getTypeTextColor(offre.typeOffre),
              color: 'white',
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '10px',
              fontWeight: '600',
              textTransform: 'uppercase'
            }}>
              {offre.typeOffre || 'N/A'}
            </div>
          </div>

          {/* Card Body */}
          <div style={{
            padding: '16px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column'
          }}>
            {/* Code de l'offre */}
            <div style={{
              fontSize: '12px',
              color: '#6c757d',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              #{offre.code || 'N/A'}
            </div>

            {/* Title/Description */}
            <h5 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#2c3e50',
              margin: '0 0 12px 0',
              lineHeight: '1.4',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}>
              {offre.description || 'Description non disponible'}
            </h5>

            {/* Profil requis */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '12px',
              fontSize: '12px',
              color: '#495057',
              backgroundColor: '#f8f9fa',
              padding: '6px 8px',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <FiUser size={12} color="#667eea" />
              <span style={{
                fontWeight: '500',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {offre.profil || 'Profil non défini'}
              </span>
            </div>

            {/* Informations additionnelles */}
            <div style={{
              marginTop: 'auto',
              paddingTop: '8px'
            }}>
              {/* Date de création si disponible */}
              {offre.dateCreation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                  fontSize: '11px',
                  color: '#6c757d'
                }}>
                  <FiCalendar size={11} />
                  <span>Créée le {new Date(offre.dateCreation).toLocaleDateString('fr-FR')}</span>
                </div>
              )}

              {/* Salaire si disponible */}
              {offre.salaire && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginBottom: '6px',
                  fontSize: '11px',
                  color: '#28a745',
                  fontWeight: '500'
                }}>
                  <FiDollarSign size={11} />
                  <span>{offre.salaire}</span>
                </div>
              )}

              {/* Localisation si disponible */}
              {offre.localisation && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  color: '#495057'
                }}>
                  <FiMapPin size={11} color="#e74c3c" />
                  <span style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {offre.localisation}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid #f1f3f4',
            backgroundColor: '#fafbfc'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '8px'
            }}>
              {actions.map((action, index) => (
                <Whisper key={index} speaker={<Tooltip>{action.tooltip}</Tooltip>}>
                  <Button
                    size="xs"
                    appearance="subtle"
                    onClick={onAction(action.type, offre)}
                    style={{
                      padding: '4px 8px',
                      fontSize: '14px',
                      color: action.color || 'inherit',
                      border: 'none'
                    }}
                  >
                    {action.icon}
                  </Button>
                </Whisper>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==================== RENDU PRINCIPAL ====================
  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#fff',
      minHeight: '100vh',
    }}>
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
                  style={{ backgroundColor: '#667eea', border: 'none' }}
                >
                  {createButtonText}
                </Button>
              )}
            </div>
          </div>
        }
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          ...customStyles.panel
        }}
      >
        {/* ==================== ZONE DE FILTRES ==================== */}
        {(searchableFields.length > 0 || filterConfigs.length > 0 || dateFilterMode === 'server') && (
          <div style={lightFilterStyles.container} className='mt-5'>
            <div style={lightFilterStyles.header}>
              <div style={lightFilterStyles.headerIcon}>
                <SearchIcon size="16px" />
              </div>
              <h4 style={lightFilterStyles.headerTitle}>Filtres et recherche</h4>
            </div>

            <FlexboxGrid justify="start" align="bottom" style={lightFilterStyles.filtersGrid}>
              {/* Zone de recherche */}
              {searchableFields.length > 0 && (
                <FlexboxGrid.Item style={lightFilterStyles.searchItem}>
                  <div style={lightFilterStyles.inputWrapper}>
                    <label style={lightFilterStyles.inputLabel}>Recherche textuelle</label>
                    <InputGroup inside>
                      <Input
                        placeholder="Tapez votre recherche..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        style={{ 
                          borderRadius: '8px',
                          border: '1px solid #dee2e6',
                          height: '38px'
                        }}
                        disabled={loading}
                      />
                      <InputGroup.Addon>
                        <SearchIcon />
                      </InputGroup.Addon>
                    </InputGroup>
                  </div>
                </FlexboxGrid.Item>
              )}

              {/* Filtre de plage de dates pour mode server */}
              {dateFilterMode === 'server' && (
                <FlexboxGrid.Item style={lightFilterStyles.dateRangeItem}>
                  <div style={lightFilterStyles.inputWrapper}>
                    <label style={lightFilterStyles.inputLabel}>
                      <CalendarIcon style={{ marginRight: '6px' }} />
                      Période de création
                    </label>
                    <DateRangePicker
                      format="dd/MM/yyyy"
                      placeholder="Sélectionner une période"
                      value={dateRange}
                      onChange={handleDateRangeChange}
                      style={{ 
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #dee2e6',
                        height: '38px'
                      }}
                      cleanable
                      disabled={loading}
                    />
                  </div>
                </FlexboxGrid.Item>
              )}

              {/* Autres filtres */}
              {filterConfigs.map((filter) => (
                <FlexboxGrid.Item
                  key={filter.field}
                  style={filter.type === 'dateRange' ? lightFilterStyles.dateRangeItem : lightFilterStyles.filterItem}
                >
                  <div style={lightFilterStyles.inputWrapper}>
                    <label style={lightFilterStyles.inputLabel}>{filter.label}</label>
                    <div style={{ 
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}>
                      {renderFilterComponent(filter)}
                    </div>
                  </div>
                </FlexboxGrid.Item>
              ))}
            </FlexboxGrid>
          </div>
        )}

        {/* ==================== TAGS DE FILTRES ACTIFS ==================== */}
        {(searchTerm || Object.keys(activeFilters).length > 0 || (dateFilterMode === 'server' && dateRange.length > 0)) && (
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
              {dateFilterMode === 'server' && dateRange.length > 0 && (
                <Tag
                  closable
                  onClose={() => handleDateRangeChange([])}
                  color="purple"
                >
                  Période: {formatFilterValueForTag('dateRange', dateRange)}
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
                {selectedIds.length} offre(s) sélectionnée(s)
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  size="xs"
                  appearance="ghost"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    handleSelectAllPage(true);
                  }}
                  disabled={isAllPageSelected}
                >
                  Tout sélectionner
                </Button>
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
          </div>
        )}

        {/* ==================== GRILLE DE CARTES ==================== */}
        <div className="container-fluid p-0">
          {loading ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #667eea',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                animation: 'spin 1s linear infinite'
              }}></div>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>Chargement des offres...</p>
            </div>
          ) : error ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '48px' }}>⚠️</div>
              <p style={{ color: '#e74c3c', fontSize: '16px', fontWeight: '500' }}>
                Erreur lors du chargement
              </p>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>{error}</p>
            </div>
          ) : paginatedData.length === 0 ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <div style={{ fontSize: '48px' }}>💼</div>
              <p style={{ color: '#6c757d', fontSize: '16px', fontWeight: '500' }}>
                Aucune offre d'emploi trouvée
              </p>
              <p style={{ color: '#6c757d', fontSize: '14px' }}>
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="row">
              {paginatedData.map((offre, index) => (
                <OffreCard
                  key={offre[rowKey] || index}
                  offre={offre}
                  isSelected={selectedIds.includes(offre[rowKey])}
                  onSelect={handleSelectItem}
                  actions={actions}
                  onAction={handleActionButtonClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* ==================== PAGINATION ==================== */}
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
          <div>
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

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OffreCardGrid;