import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
  DatePicker,
  Dropdown,
  IconButton,
  Card,
  Avatar,
  Progress,
  Popover
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import PlusIcon from '@rsuite/icons/Plus';
import ReloadIcon from '@rsuite/icons/Reload';
import MoreIcon from '@rsuite/icons/More';

/**
 * Composant DataCardGrid générique et réutilisable avec support de sélection multiple
 * VERSION CARTES - Même API que DataTable mais affichage en grille de cartes
 */
const DataCardGrid = ({
  // ==================== CONFIGURATION DE BASE ====================
  /** Titre principal de la grille */
  title = "Gestion des données",
  /** Texte descriptif pour le nombre d'éléments */
  subtitle = "données trouvées",

  // ==================== DONNÉES ET ÉTATS ====================
  /** Données à afficher dans les cartes */
  data = [],
  /** État de chargement */
  loading = false,
  /** Message d'erreur éventuel */
  error = null,

  // ==================== CONFIGURATION DES CHAMPS DE CARTES ====================
  /** Configuration des champs à afficher sur les cartes (remplace columns) */
  cardFields = [],

  // ==================== CONFIGURATION DES FILTRES ====================
  /** Champs sur lesquels effectuer la recherche textuelle */
  searchableFields = [],
  /** Configuration des filtres dropdown et date pickers */
  filterConfigs = [],

  // ==================== CONFIGURATION DES ACTIONS ====================
  /** Actions disponibles pour chaque carte */
  actions = [],
  /** Gestionnaire des actions */
  onAction = () => { },

  // ==================== CONFIGURATION DE LA PAGINATION ====================
  /** Nombre d'éléments par page par défaut */
  defaultPageSize = 12,
  /** Options disponibles pour le nombre d'éléments par page */
  pageSizeOptions = [12, 24, 48],

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
  /** Activer le bouton de rafraîchissement */
  enableRefresh = true,
  /** Activer le bouton de création */
  enableCreate = true,
  /** Texte du bouton de création */
  createButtonText = "Nouveau",

  // ==================== CONFIGURATION DES CARTES ====================
  /** Largeur des cartes en pixels */
  cardWidth = 320,
  /** Hauteur des cartes en pixels */
  cardHeight = 280,
  /** Espacement entre les cartes */
  cardGap = 20,
  /** Configuration du titre principal de la carte */
  cardTitle = { field: 'name', fallback: 'Sans titre' },
  /** Configuration du sous-titre de la carte */
  cardSubtitle = null,
  /** Configuration de l'avatar/image de la carte */
  cardAvatar = null,

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
   * Obtient la valeur d'un champ selon la configuration
   */
  const getFieldValue = useCallback((rowData, fieldConfig) => {
    if (typeof fieldConfig === 'string') {
      return rowData[fieldConfig];
    }
    if (fieldConfig.valueGetter) {
      return fieldConfig.valueGetter(rowData);
    }
    if (fieldConfig.dataKeys && Array.isArray(fieldConfig.dataKeys)) {
      return fieldConfig.dataKeys
        .map(key => rowData[key])
        .join(fieldConfig.separator || ' ');
    }
    if (fieldConfig.field) {
      return rowData[fieldConfig.field];
    }
    return '';
  }, []);

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
        let x = a[sortColumn];
        let y = b[sortColumn];

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
   * Gestionnaire du changement de limite de pagination
   */
  const handleChangeLimit = useCallback((newLimit) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  /**
   * Gestionnaire du changement de page
   */
  const handleChangePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  /**
   * Gestionnaire des changements de filtres
   */
  const handleFilterChange = useCallback((field, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [field]: value
    }));
    setPage(1);
  }, []);

  /**
   * Gestionnaire de la recherche textuelle
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
   * Gestionnaire principal des actions
   */
  const handleAction = useCallback((actionType, item, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    onAction(actionType, item);
  }, [onAction]);

  /**
   * Gestionnaire pour le bouton refresh
   */
  const handleRefreshClick = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
    onRefresh();
  }, [onRefresh]);

  /**
   * Gestionnaire pour le bouton create
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

  // ==================== GÉNÉRATEURS DE CARTES ====================

  /**
   * Génère l'avatar de la carte
   */
  const renderCardAvatar = useCallback((item) => {
    if (!cardAvatar) return null;

    const avatarValue = getFieldValue(item, cardAvatar);

    if (cardAvatar.type === 'image' && avatarValue) {
      return (
        <Avatar
          src={avatarValue}
          alt={getFieldValue(item, cardTitle)}
          style={{ width: 40, height: 40 }}
        />
      );
    }

    if (cardAvatar.type === 'initials' || !cardAvatar.type) {
      const initials = cardAvatar.generator ? 
        cardAvatar.generator(item) : 
        String(avatarValue || '').charAt(0).toUpperCase();
      
      return (
        <Avatar
          style={{
            backgroundColor: cardAvatar.backgroundColor || '#667eea',
            color: 'white',
            width: 40,
            height: 40
          }}
        >
          {initials}
        </Avatar>
      );
    }

    if (cardAvatar.type === 'icon') {
      return (
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: cardAvatar.backgroundColor || '#667eea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white'
        }}>
          {cardAvatar.icon}
        </div>
      );
    }

    return null;
  }, [cardAvatar, cardTitle, getFieldValue]);

  /**
   * Génère le contenu d'un champ de carte
   */
  const renderCardField = useCallback((item, field) => {
    const value = getFieldValue(item, field);

    switch (field.type) {
      case 'badge':
        return (
          <Badge
            color={field.badgeColorMap ? field.badgeColorMap(value) : 'blue'}
            content={value}
          />
        );

      case 'progress':
        const progressValue = Math.max(0, Math.min(Number(value) || 0, 100));
        return (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: '12px', fontWeight: '500' }}>{field.label}</span>
              <span style={{ fontSize: '12px' }}>{value}{field.progressUnit || '%'}</span>
            </div>
            <Progress.Line
              percent={progressValue}
              strokeColor={field.progressColorMap ? field.progressColorMap(value) : '#28a745'}
              strokeWidth={6}
              showInfo={false}
            />
          </div>
        );

      case 'date':
        const dateValue = value ? new Date(value) : null;
        return (
          <div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 2 }}>
              {field.label}
            </div>
            <div style={{ fontSize: '14px' }}>
              {dateValue ? dateValue.toLocaleDateString('fr-FR') : '-'}
            </div>
          </div>
        );

      case 'custom':
        return field.customRenderer(item, value);

      default:
        return (
          <div>
            {field.label && (
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: 2 }}>
                {field.label}
              </div>
            )}
            <div style={{ fontSize: '14px' }}>
              {value || '-'}
            </div>
          </div>
        );
    }
  }, [getFieldValue]);

  /**
   * Génère une carte individuelle
   */
  const renderCard = useCallback((item, index) => {
    const isSelected = selectedIds.includes(item[rowKey]);
    const titleValue = getFieldValue(item, cardTitle);
    const subtitleValue = cardSubtitle ? getFieldValue(item, cardSubtitle) : null;

    return (
      <div key={item[rowKey]} style={{ width: cardWidth }}>
        <Card
          style={{
            width: '100%',
            padding: '20px',
            height: cardHeight,
            border: isSelected ? '2px solid #667eea' : '1px solid #e9ecef',
            borderRadius: '12px',
            overflow: 'hidden',
            transition: 'all 0.2s ease',
            cursor: selectable ? 'pointer' : 'default',
            ...customStyles.card
          }}
          bodyStyle={{
            padding: '16px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column'
          }}
          onClick={selectable ? () => handleSelectItem(item[rowKey], !isSelected) : undefined}
        >
          {/* En-tête de la carte */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 0 }}>
              {renderCardAvatar(item)}
              <div style={{ marginLeft: '12px', flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#2c3e50',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {titleValue || cardTitle.fallback}
                </div>
                {subtitleValue && (
                  <div style={{
                    fontSize: '14px',
                    color: '#6c757d',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {subtitleValue}
                  </div>
                )}
              </div>
            </div>

            {/* Actions de la carte */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {selectable && (
                <Checkbox
                  checked={isSelected}
                  onChange={(value, checked, event) => {
                    event.stopPropagation();
                    handleSelectItem(item[rowKey], checked);
                  }}
                />
              )}
              
              {actions.length > 0 && (
                <Whisper
                  placement="bottomEnd"
                  trigger="click"
                  speaker={
                    <Popover arrow={false}>
                      <div style={{ 
                        minWidth: '150px', 
                        padding: '4px 0',
                        backgroundColor: 'transparent',
                        border: '1px solid #e5e5ea',
                        borderRadius: '6px',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                      }}>
                        {actions.map((action, actionIndex) => (
                          <div
                            key={actionIndex}
                            style={{
                              padding: '8px 16px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = '#f7f7fa';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = 'transparent';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAction(action.type, item);
                            }}
                          >
                            {action.icon && <span style={{ display: 'flex', alignItems: 'center' }}>{action.icon}</span>}
                            <span>{action.label || action.tooltip}</span>
                          </div>
                        ))}
                      </div>
                    </Popover>
                  }
                >
                  <IconButton
                    appearance="subtle"
                    icon={<MoreIcon />}
                    size="sm"
                    circle
                    onClick={(event) => event.stopPropagation()}
                    style={{
                      color: '#8e8ea0',
                      transition: 'all 0.2s'
                    }}
                  />
                </Whisper>
              )}
            </div>
          </div>

          {/* Contenu de la carte */}
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {cardFields.map((field, fieldIndex) => (
                <div key={fieldIndex}>
                  {renderCardField(item, field)}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }, [
    selectedIds,
    cardTitle,
    cardSubtitle,
    cardWidth,
    cardHeight,
    customStyles.card,
    selectable,
    handleSelectItem,
    renderCardAvatar,
    getFieldValue,
    actions,
    handleAction,
    cardFields,
    renderCardField,
    rowKey
  ]);

  // ==================== CALCUL DU LAYOUT RESPONSIVE ====================
  const gridStyle = useMemo(() => {
    return {
      display: 'flex',
      flexWrap: 'wrap',
      gap: `${cardGap}px`,
      justifyContent: 'flex-start',
      alignItems: 'flex-start'
    };
  }, [cardGap]);

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

        {/* ==================== GRILLE DE CARTES ==================== */}
        {loading ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#6c757d'
          }}>
            Chargement des données...
          </div>
        ) : paginatedData.length === 0 ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '200px',
            color: '#6c757d',
            flexDirection: 'column'
          }}>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>
              Aucune donnée trouvée
            </div>
            <div style={{ fontSize: '14px' }}>
              Essayez de modifier vos filtres de recherche
            </div>
          </div>
        ) : (
          <div style={gridStyle}>
            {paginatedData.map(renderCard)}
          </div>
        )}

        {/* ==================== PAGINATION ==================== */}
        {!loading && paginatedData.length > 0 && (
          <div style={{
            padding: '20px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid #e9ecef',
            marginTop: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#6c757d' }}>
              Affichage de {((page - 1) * limit) + 1} à {Math.min(page * limit, filteredAndSortedData.length)} sur {filteredAndSortedData.length} entrées
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
        )}
      </Panel>
    </div>
  );
};

export default DataCardGrid;