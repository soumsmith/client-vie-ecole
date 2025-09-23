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
  DatePicker,
  InputNumber,
  Avatar,
  IconButton
} from 'rsuite';
import SearchIcon from '@rsuite/icons/Search';
import PlusIcon from '@rsuite/icons/Plus';
import ReloadIcon from '@rsuite/icons/Reload';
import { FiChevronDown, FiChevronRight, FiUser } from 'react-icons/fi';

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
        setTableWidth(minContentWidth);
      } else {
        setTableWidth('100%');
      }
    };
    
    calculateMinWidth();
    window.addEventListener('resize', calculateMinWidth);
    return () => window.removeEventListener('resize', calculateMinWidth);
  }, [minContentWidth]);
  
  return tableWidth;
};

/**
 * Utilitaires pour l'affichage étudiant
 */
const getNoteColor = (note, noteSur = 20) => {
  const pourcentage = (note / noteSur) * 100;
  if (pourcentage >= 90) return 'green';
  if (pourcentage >= 75) return 'blue';
  if (pourcentage >= 60) return 'orange';
  if (pourcentage >= 50) return 'yellow';
  return 'red';
};

const getAppreciationColor = (appreciation) => {
  const appreciationLower = appreciation?.toLowerCase() || '';
  if (appreciationLower.includes('excellent')) return 'green';
  if (appreciationLower.includes('très bien')) return 'blue';
  if (appreciationLower.includes('bien')) return 'cyan';
  if (appreciationLower.includes('assez bien')) return 'orange';
  if (appreciationLower.includes('passable')) return 'yellow';
  return 'red';
};

const getRangBadgeColor = (rang) => {
  if (rang === '1' || rang === 1) return 'green';
  if (parseInt(rang) <= 3) return 'blue';
  if (parseInt(rang) <= 10) return 'cyan';
  return 'gray';
};

/**
 * Composant DataTable générique et réutilisable avec support mode étudiant
 * VERSION ÉTENDUE - Support d'affichage par étudiant avec notes expandables
 */
const DataTable = ({
  // ==================== CONFIGURATION DE BASE ====================
  title = "Gestion des données",
  subtitle = "données trouvées",

  // ==================== DONNÉES ET ÉTATS ====================
  data = [],
  loading = false,
  error = null,

  // ==================== NOUVELLE CONFIGURATION POUR MODE ÉTUDIANT ====================
  /** Mode d'affichage: 'classic' ou 'student' */
  displayMode = 'classic',
  /** Callback pour les changements d'absences (mode étudiant) */
  onAbsenceChange = () => {},
  /** Callback pour les changements de notes (mode étudiant) */
  onNoteChange = () => {},

  // ==================== CONFIGURATION DES COLONNES ====================
  columns = [],

  // ==================== CONFIGURATION DES FILTRES ====================
  searchableFields = [],
  filterConfigs = [],

  // ==================== CONFIGURATION DES ACTIONS ====================
  actions = [],
  onAction = () => {},

  // ==================== CONFIGURATION DE LA PAGINATION ====================
  defaultPageSize = 10,
  pageSizeOptions = [10, 20, 50],

  // ==================== CONFIGURATION DE LA SÉLECTION ====================
  selectable = false,
  selectedItems = [],
  onSelectionChange = () => {},
  rowKey = 'id',

  // ==================== CONFIGURATION ADDITIONNELLE ====================
  tableHeight = 500,
  enableRefresh = true,
  enableCreate = true,
  createButtonText = "Nouveau",
  minTableWidth = 1000,

  // ==================== CALLBACKS ====================
  onRefresh = () => {},

  // ==================== STYLES PERSONNALISÉS ====================
  customStyles = {},

  // ==================== RENDU PERSONNALISÉ POUR CELLULES ====================
  cellRenderer = {}
}) => {
  // ==================== ÉTATS LOCAUX ====================
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({});
  const [sortColumn, setSortColumn] = useState('');
  const [sortType, setSortType] = useState('');
  const [limit, setLimit] = useState(defaultPageSize);
  const [page, setPage] = useState(1);

  // État pour les lignes expandables (mode étudiant)
  const [expandedRows, setExpandedRows] = useState({});
  const [expandedMatieres, setExpandedMatieres] = useState({});

  const tableWidth = useTableDimensions(minTableWidth);

  // ==================== LOGIQUE D'EXPANSION (MODE ÉTUDIANT) ====================
  const toggleRowExpansion = useCallback((rowId) => {
    setExpandedRows(prev => ({
      ...prev,
      [rowId]: !prev[rowId]
    }));
  }, []);

  const toggleMatiereExpansion = useCallback((etudiantId, matiereId) => {
    const key = `${etudiantId}-${matiereId}`;
    setExpandedMatieres(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  }, []);

  // ==================== UTILITAIRES DE DONNÉES ====================
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
    if (!itemDate || !filterValue) return true;

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
  }, []);

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
    isDateInRange
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

  // ==================== GESTIONNAIRES D'ÉVÉNEMENTS ====================
  const handleSortColumn = useCallback((sortColumn, sortType) => {
    setSortColumn(sortColumn);
    setSortType(sortType);
  }, []);

  const handleChangeLimit = useCallback((newLimit) => {
    setPage(1);
    setLimit(newLimit);
  }, []);

  const handleChangePage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

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

  // ==================== COMPOSANTS SPÉCIAUX POUR MODE ÉTUDIANT ====================

  /**
   * Cellule d'expansion pour les étudiants
   */
  const StudentExpandCell = useCallback(({ rowData, ...props }) => {
    const isExpanded = expandedRows[rowData[rowKey]];
    
    return (
      <Cell {...props} style={{ padding: '6px' }}>
        <IconButton
          icon={isExpanded ? <FiChevronDown /> : <FiChevronRight />}
          onClick={(event) => {
            event.stopPropagation();
            toggleRowExpansion(rowData[rowKey]);
          }}
          size="xs"
          circle
        />
      </Cell>
    );
  }, [expandedRows, rowKey, toggleRowExpansion]);

  /**
   * Cellule Photo seule pour étudiant
   */
  const StudentPhotoCell = useCallback(({ rowData, ...props }) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = () => {
      setImageError(true);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    const getInitials = (nom, prenom) => {
      const firstInitial = nom ? nom.charAt(0).toUpperCase() : '';
      const lastInitial = prenom ? prenom.charAt(0).toUpperCase() : '';
      return firstInitial + lastInitial;
    };

    return (
      <Cell {...props} style={{ padding: '8px', textAlign: 'center' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '2px solid #e9ecef',
          overflow: 'hidden',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          margin: '0 auto'
        }}>
          {rowData.urlPhoto && !imageError ? (
            <>
              <img
                src={rowData.urlPhoto}
                alt={`${rowData.prenom} ${rowData.nom}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: imageLoaded ? 'block' : 'none'
                }}
                onError={handleImageError}
                onLoad={handleImageLoad}
              />
              {!imageLoaded && (
                <div style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  backgroundColor: '#667eea',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  fontWeight: 'bold'
                }}>
                  {getInitials(rowData.nom, rowData.prenom)}
                </div>
              )}
            </>
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              backgroundColor: '#667eea',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
              fontWeight: 'bold'
              
            }}>
              {getInitials(rowData.nom, rowData.prenom)}
            </div>
          )}
        </div>
      </Cell>
    );
  }, []);

  /**
   * Cellule Nom et Prénom pour étudiant
   */
  const StudentNameCell = useCallback(({ rowData, ...props }) => {
    return (
      <div {...props} style={{ padding: '8px' }}>
        <div id='noteMoyene'>
          <div style={{ 
            fontWeight: 'bold', 
            fontSize: '13px', 
            color: '#2c3e50',
            marginBottom: '4px',
            whiteSpace: 'nowrap' 
          }}>
              {String(rowData.nom).replace(/['"]/g, '').trim()} 
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: '#868e96',
            fontWeight: 'bold', 
          }}>
            {String(rowData.prenom).replace(/['"]/g, '').trim()}
             {/* {rowData.prenom} */}
          </div>
        </div>
      </div>
    );
  }, []);

  /**
   * Cellule Absences avec inputs
   */
  const StudentAbsenceCell = useCallback(({ rowData, field, ...props }) => {
    const [value, setValue] = useState(rowData[field] || 0);

    const handleChange = useCallback((newValue) => {
      setValue(newValue || 0);
      onAbsenceChange(rowData[rowKey], field, newValue || 0);
    }, [rowData, field]);

    return (
      <Cell {...props}>
        <InputNumber
          value={value}
          onChange={handleChange}
          min={0}
          size="sm"
          style={{ width: '80px' }}
        />
      </Cell>
    );
  }, [rowKey, onAbsenceChange]);

  /**
   * Rendu des notes détaillées (ligne expandable)
   */
  const renderStudentExpandedContent = useCallback((etudiant) => {
    if (!expandedRows[etudiant[rowKey]] || !etudiant.matieres) return null;

    return (
      <tr>
        <td colSpan={columns.length + (selectable ? 1 : 0) + 1} style={{ padding: 0, backgroundColor: '#f8f9fa' }}>
          <div style={{ padding: '20px' }}>
            <h6 style={{ marginBottom: '16px', color: '#2c3e50' }}>
              Détail des matières et notes
            </h6>
            
            <div className="table-responsive">
              <table className="table table-bordered table-sm">
                <thead className="table-light">
                  <tr >
                    <th style={{ width: '50px' }}></th>
                    <th style={{ width: '400px' }}>MATIERE</th>
                    <th style={{ width: '600px' }}>NOTES</th>
                    <th style={{ width: '80px' }}>COEF.</th>
                    <th style={{ width: '100px' }}>MOYENNE</th>
                    <th style={{ width: '80px' }}>RANG</th>
                    <th style={{ width: '150px' }}>APPRECIATION</th>
                  </tr>
                </thead>
                <tbody>
                  {etudiant.matieres?.map((matiere, index) => (
                    <React.Fragment key={matiere.id || index}>
                      {/* Ligne principale de la matière */}
                      <tr>
                        <td>
                          <IconButton
                            icon={expandedMatieres[`${etudiant[rowKey]}-${matiere.id}`] ? <FiChevronDown /> : <FiChevronRight />}
                            onClick={() => toggleMatiereExpansion(etudiant[rowKey], matiere.id)}
                            size="xs"
                            circle
                          />
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <div 
                              style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                backgroundColor: matiere.pec === 1 ? '#28a745' : '#6c757d',
                                marginRight: '8px'
                              }}
                            ></div>
                            <strong>{matiere.libelle}</strong>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '60px' }}>
                            {matiere.notes?.slice(0, 6).map((note, noteIndex) => (
                              <span
                                // key={noteIndex}
                                // color={getNoteColor(note.note, note.noteSur)}
                                style={{ fontSize: '0.8em' }}
                              >
                                {note.note}/{note.noteSur}
                              </span>
                            ))}
                            {matiere.notes?.length > 6 && (
                              <Badge color="gray" style={{ fontSize: '0.8em' }}>
                                +{matiere.notes.length - 6}
                              </Badge>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {matiere.coefficient}
                          {/* <Badge color="blue"></Badge> */}
                        </td>
                        <td className="text-center">
                          <Badge 
                            color={getNoteColor(matiere.moyenne, 20)}
                            style={{ fontSize: '0.9em' }}
                          >
                            {parseFloat(matiere.moyenne).toFixed(2)}
                          </Badge>
                        </td>
                        <td className="text-center ">
                          {matiere.rang}
                          <sup>{parseInt(matiere.rang) === 1 ? 'er' : 'ème'}</sup>
                        </td>

                        <td className='fw-bold'>
                          {/* <Badge 
                            color={getAppreciationColor(matiere.appreciation)}
                            style={{ fontSize: '0.8em' }}
                          > */}
                            {matiere.appreciation}
                          {/* </Badge> */}
                        </td>
                      </tr >

                      {/* Ligne détaillée des notes (collapsible) */}
                      {expandedMatieres[`${etudiant[rowKey]}-${matiere.id}`] && matiere.notes?.length > 0 && (
                        <tr>
                          <td></td>
                          <td colSpan="6">
                            <div style={{ padding: '10px', backgroundColor: '#fff' }}>
                              <h6>Détail des notes:</h6>
                              <div className="row">
                                {matiere.notes.map((note, noteIndex) => (
                                  <div key={noteIndex} className="col-md-4 col-sm-6 mb-2">
                                    <div className="border p-2 rounded">
                                      <div className="d-flex justify-content-between align-items-center">
                                        <Badge 
                                          color={getNoteColor(note.note, note.noteSur)}
                                          style={{ fontSize: '1em' }}
                                        >
                                          {note.note}/{note.noteSur}
                                        </Badge>
                                        {note.evaluation?.duree && (
                                          <small className="text-muted">
                                            {note.evaluation.duree}
                                          </small>
                                        )}
                                      </div>
                                      {note.evaluation?.code && (
                                        <small className="text-muted d-block mt-1">
                                          Code: {note.evaluation.code.substring(0, 8)}...
                                        </small>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </td>
      </tr>
    );
  }, [expandedRows, expandedMatieres, columns, selectable, rowKey, toggleMatiereExpansion]);

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

  // ==================== GÉNÉRATEURS DE CELLULES ====================
  const createCustomCell = useCallback((column) => {
    return ({ rowData, ...props }) => {
      const cellValue = getCellValue(rowData, column);

      // Mode étudiant - cellules spéciales
      if (displayMode === 'student') {
        if (column.cellType === 'student-photo') {
          return <StudentPhotoCell rowData={rowData} {...props}/>;
        }
        if (column.cellType === 'student-name') {
          return <StudentNameCell rowData={rowData} {...props} />;
        }
        if (column.cellType === 'student-absence-justifiee') {
          return <StudentAbsenceCell rowData={rowData} field="absencesJustifiees" {...props} />;
        }
        if (column.cellType === 'student-absence-non-justifiee') {
          return <StudentAbsenceCell rowData={rowData} field="absencesNonJustifiees" {...props} />;
        }
      }

      // Utiliser les cellRenderer personnalisés s'ils existent
      if (cellRenderer && column.cellType && cellRenderer[column.cellType]) {
        return (
          <Cell {...props}>
            {cellRenderer[column.cellType](cellValue, rowData)}
          </Cell>
        );
      }

      // Types de cellules standards (votre code existant)
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
              <ButtonGroup size="xs">
                {actions.map((action, index) => (
                  <Whisper key={index} speaker={<Tooltip>{action.tooltip}</Tooltip>}>
                    <Button
                      appearance="subtle"
                      onClick={handleActionButtonClick(action.type, rowData)}
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
              {cellValue}
            </Cell>
          );
      }
    };
  }, [getCellValue, actions, handleActionButtonClick, displayMode, cellRenderer]);

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
    WebkitOverflowScrolling: 'touch',
    scrollbarWidth: 'thin',
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

        {/* ==================== TABLEAU PRINCIPAL AVEC SUPPORT MODE ÉTUDIANT ==================== */}
        <div style={tableContainerStyle}>
          {displayMode === 'student' ? (
            // MODE ÉTUDIANT - Table personnalisée avec expansion
            <div id='notesEtMoyennes' style={{ border: '1px solid #e9ecef', borderRadius: '8px' }}>
              <table className="table table-hover mb-0" style={{ tableLayout: 'fixed' }}>
              <thead className="table-light">
                <tr style={{ height: '50px' }}>
                  <th className="align-middle" style={{ width: '50px' }}></th>
                  {selectable && <th className="align-middle" style={{ width: '50px' }}>
                    <Checkbox
                      indeterminate={isSomePageSelected && !isAllPageSelected}
                      checked={isAllPageSelected}
                      onChange={(value, checked) => handleSelectAllPage(checked)}
                    />
                  </th>}
                  {columns.map((column, index) => (
                    <th 
                      key={column.dataKey || index} 
                      className='photo-etidiant align-middle'  
                      style={{ 
                        width: column.minWidth || 50
                      }}
                    >
                      {column.title}
                    </th>
                  ))}
                </tr>
              </thead>
                <tbody>
                  {paginatedData.map((etudiant, rowIndex) => (
                    <React.Fragment key={etudiant[rowKey] || rowIndex}>
                      {/* Ligne principale étudiant */}
                      <tr style={{ cursor: 'pointer', height: '80px' }}>
                        <td style={{ verticalAlign: 'middle' }}>
                          <IconButton
                            icon={expandedRows[etudiant[rowKey]] ? <FiChevronDown /> : <FiChevronRight />}
                            onClick={() => toggleRowExpansion(etudiant[rowKey])}
                            size="xs"
                            circle
                          />
                        </td>
                        {selectable && (
                          <td style={{ verticalAlign: 'middle' }}>
                            <Checkbox
                              checked={selectedIds.includes(etudiant[rowKey])}
                              onChange={(value, checked) => handleSelectItem(etudiant[rowKey], checked)}
                            />
                          </td>
                        )}
                        {columns.map((column, colIndex) => {
                          const CellComponent = createCustomCell(column);
                          return (
                            <td key={colIndex} style={{ verticalAlign: 'middle' }}>
                              <CellComponent rowData={etudiant} />
                            </td>
                          );
                        })}
                      </tr>
                      
                      {/* Ligne expandable avec détails */}
                      {renderStudentExpandedContent(etudiant)}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // MODE CLASSIQUE - Table RSuite standard
            <Table
              height={tableHeight}
              width={tableWidth}
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
                    flexGrow={column.flexGrow}
                    minWidth={column.minWidth || 150}
                    resizable={false}
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
        }}
          onClick={(e) => e.stopPropagation()}
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