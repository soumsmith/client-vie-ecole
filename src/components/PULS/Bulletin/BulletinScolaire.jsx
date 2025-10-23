import React, { useState, useCallback, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
//import './BulletinScolaire.css'; // Import des styles personnalisés
import {
  SelectPicker,
  Button,
  Panel,
  Row,
  Col,
  Message,
  Loader,
  Badge,
  Avatar,
  Divider,
  Input,
  InputNumber,
  Tag,
  Steps,
  Nav,
  Toggle,
} from "rsuite";

import { 
    FiSearch, 
    FiRotateCcw, 
    FiCalendar, 
    FiUser, 
    FiBarChart,
    FiPlus,
    FiTrendingUp
} from 'react-icons/fi';

// Import du service centralisé
import {
  useClassesData,
  usePeriodesData,
  useElevesData,
} from "../utils/CommonDataService";

// Import des services spécifiques au bulletin
import {
  useBulletinData,
  getNoteColor,
  getAppreciationColor,
  getMention,
  formatNote,
  calculateTotals,
} from "./BulletinService";
import { useAllApiUrls } from '../utils/apiConfig';
import { usePulsParams } from "../../hooks/useDynamicParams";
import GradientButton from '../../GradientButton';

// ===========================
// COMPOSANT DE SÉLECTION (FILTRES) - VERSION LIGHT
// ===========================
const BulletinFilters = ({
  onSearch,
  onClear,
  loading = false,
  error = null,
  selectedClasse,
  selectedPeriode,
  selectedEleve,
  onClasseChange,
  onPeriodeChange,
  onEleveChange,
}) => {
  const [formError, setFormError] = useState(null);

  const {
    classes,
    loading: classesLoading,
    error: classesError,
  } = useClassesData();

  const {
    periodes,
    loading: periodesLoading,
    error: periodesError,
  } = usePeriodesData(2);

  const {
    eleves,
    loading: elevesLoading,
    error: elevesError,
    fetchEleves,
    clearEleves,
  } = useElevesData();

  // Charger les élèves quand une classe est sélectionnée
  useEffect(() => {
    console.log("🔄 Effect déclenché pour classe:", selectedClasse);
    if (selectedClasse) {
      console.log("📚 Chargement des élèves pour classe ID:", selectedClasse);
      fetchEleves(selectedClasse);
    } else {
      console.log("🗑️ Nettoyage des élèves (pas de classe sélectionnée)");
      clearEleves();
    }
  }, [selectedClasse]);

  const handleSearch = useCallback(() => {
    if (!selectedClasse) {
      setFormError("Veuillez sélectionner une classe");
      return;
    }
    if (!selectedPeriode) {
      setFormError("Veuillez sélectionner une période");
      return;
    }
    if (!selectedEleve) {
      setFormError("Veuillez sélectionner un élève");
      return;
    }

    setFormError(null);
    if (onSearch) {
      onSearch({
        classeId: selectedClasse,
        periodeId: selectedPeriode,
        eleveId: selectedEleve,
      });
    }
  }, [selectedClasse, selectedPeriode, selectedEleve, onSearch]);

  const handleClear = useCallback(() => {
    setFormError(null);
    if (onClear) onClear();
  }, [onClear]);

  const isDataLoading = classesLoading || periodesLoading || elevesLoading;
  const hasDataError = classesError || periodesError || elevesError;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        marginBottom: "24px",
        overflow: "hidden",
      }}
    >
      {/* En-tête simplifié */}
      <div style={{
        padding: "20px 24px",
        borderBottom: "1px solid #f3f4f6",
        background: "#fafafa",
      }}>
        <h2 style={{
          margin: 0,
          fontSize: "18px",
          fontWeight: "600",
          color: "#1f2937",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <span style={{ fontSize: "20px" }}>📄</span>
          Recherche de Bulletin Scolaire
        </h2>
      </div>

      <div style={{ padding: "24px" }}>
        {/* Informations sur l'école - Version light */}
        {eleves.length > 0 && eleves[0].raw_data?.inscription?.ecole && (
          <div style={{
            marginBottom: "20px",
            padding: "16px",
            background: "#f9fafb",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ fontSize: "16px" }}>🏫</span>
              <div>
                <div style={{ fontWeight: "600", color: "#1f2937" }}>
                  {eleves[0].raw_data.inscription.ecole.libelle}
                </div>
                <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                  Code: {eleves[0].raw_data.inscription.ecole.code} |
                  Tél: {eleves[0].raw_data.inscription.ecole.tel} |
                  Signataire: {eleves[0].raw_data.inscription.ecole.nomSignataire}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages d'erreur simplifiés */}
        {hasDataError && (
          <div style={{ marginBottom: "16px" }}>
            {classesError && (
              <div style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "14px",
                marginBottom: "8px"
              }}>
                Erreur classes: {classesError.message}
              </div>
            )}
            {periodesError && (
              <div style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "14px",
                marginBottom: "8px"
              }}>
                Erreur périodes: {periodesError.message}
              </div>
            )}
            {elevesError && (
              <div style={{
                padding: "12px 16px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "14px"
              }}>
                Erreur élèves: {elevesError.message}
              </div>
            )}
          </div>
        )}

        {(formError || error) && (
          <div style={{
            padding: "12px 16px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "8px",
            color: "#d97706",
            fontSize: "14px",
            marginBottom: "16px"
          }}>
            {formError || error?.message}
          </div>
        )}

        {isDataLoading && (
          <div style={{ textAlign: "center", marginBottom: "16px" }}>
            <Loader content="Chargement des données..." />
          </div>
        )}

        {/* Formulaire de sélection - Design light */}
        <Row gutter={16}>
          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#374151",
                fontSize: "14px"
              }}>
                Classe *
              </label>
              <SelectPicker
                data={classes}
                value={selectedClasse}
                onChange={(value) => {
                  console.log("🏫 Classe sélectionnée:", value);
                  onClasseChange(value);
                  if (onEleveChange) onEleveChange(null);
                }}
                placeholder="Sélectionner une classe"
                searchable
                style={{ width: "100%" }}
                loading={classesLoading}
                disabled={classesLoading || loading}
                cleanable={false}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#374151",
                fontSize: "14px"
              }}>
                Période *
              </label>
              <SelectPicker
                data={periodes}
                value={selectedPeriode}
                onChange={onPeriodeChange}
                placeholder="Sélectionner une période"
                searchable
                style={{ width: "100%" }}
                loading={periodesLoading}
                disabled={periodesLoading || loading}
                cleanable={false}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "#374151",
                fontSize: "14px"
              }}>
                Élève *
              </label>
              <SelectPicker
                data={eleves.map((eleve) => {
                  console.log("🏷️ Formatage élève pour dropdown:", eleve);
                  return {
                    value: eleve.matricule,
                    label: `${eleve.nom} ${eleve.prenom}${eleve.matricule ? ` - ${eleve.matricule}` : ""
                      }`,
                    matricule: eleve.matricule,
                  };
                })}
                value={selectedEleve}
                onChange={(value) => {
                  console.log("👤 Élève sélectionné:", value);
                  onEleveChange(value);
                }}
                placeholder={
                  elevesLoading
                    ? "Chargement..."
                    : eleves.length === 0
                      ? "Aucun élève trouvé"
                      : "Sélectionner un élève"
                }
                searchable
                style={{ width: "100%" }}
                loading={elevesLoading}
                disabled={!selectedClasse || elevesLoading || loading}
                cleanable={false}
                renderMenu={(menu) => {
                  if (eleves.length === 0 && !elevesLoading) {
                    return (
                      <div style={{
                        padding: "10px",
                        textAlign: "center",
                        color: "#6b7280",
                      }}>
                        {selectedClasse
                          ? "Aucun élève trouvé pour cette classe"
                          : "Sélectionnez d'abord une classe"}
                      </div>
                    );
                  }
                  return menu;
                }}
              />
            </div>
          </Col>

          <Col xs={24} sm={12} md={6}>
            <div style={{ marginBottom: "16px" }}>
              <label style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
                color: "transparent",
                fontSize: "14px"
              }}>
                Actions
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <GradientButton
                  icon={<FiSearch size={16} />}
                  text="Afficher"
                  loadingText="Chargement..."
                  loading={loading}
                  disabled={isDataLoading || loading}
                  onClick={handleSearch}
                  variant="primary"
                  style={{ flex: 1 }}
                />

                <Button
                  onClick={handleClear}
                  disabled={loading}
                  style={{
                    minWidth: "100px",
                    color: "#6b7280",
                    borderColor: "#d1d5db"
                  }}
                >
                  Réinitialiser
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Indicateur de progression - Version light */}
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb"
        }}>
          <Steps
            current={
              selectedClasse
                ? selectedPeriode
                  ? selectedEleve
                    ? 3
                    : 2
                  : 1
                : 0
            }
            size="small"
          >
            <Steps.Item title="Classe" />
            <Steps.Item title="Période" />
            <Steps.Item title="Élève" />
            <Steps.Item title="Bulletin" />
          </Steps>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT D'AFFICHAGE DU BULLETIN - VERSION LIGHT
// ===========================
const BulletinCard = ({
  bulletinData,
  classeInfo,
  periodeInfo,
  ecoleInfo,
  onNoteChange,
  selectedClasse,
  selectedPeriode,
  initialAdjustments = {},
  initialToggles = {},
}) => {
  if (!bulletinData) return null;

  const { eleve, notes, matieres } = bulletinData;
  const totals = calculateTotals(matieres);
  const mention = getMention(parseFloat(notes.moyenneGenerale));

  // État pour gérer le mode édition et les ajustements
  const [editMode, setEditMode] = useState(false);
  const [editedMatieres, setEditedMatieres] = useState(matieres);
  const [adjustments, setAdjustments] = useState({});
  const [itemToggles, setItemToggles] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [saving, setSaving] = useState(false);
  const apiUrls = useAllApiUrls();
  const { academicYearId: dynamicAcademicYearId } = usePulsParams();



  // Fonction pour vérifier s'il y a des changements par rapport aux valeurs initiales
  const checkForChanges = useCallback((currentAdjustments, currentToggles, currentMatieres) => {
    // Vérifier les ajustements
    const adjustmentKeys = new Set([...Object.keys(currentAdjustments), ...Object.keys(initialAdjustments)]);
    for (const key of adjustmentKeys) {
      const current = currentAdjustments[key];
      const initial = initialAdjustments[key];
      // Modification pour permettre la valeur 0
      if (current !== initial) {
        return true;
      }
    }

    // Vérifier les toggles
    const toggleKeys = new Set([...Object.keys(currentToggles), ...Object.keys(initialToggles)]);
    for (const key of toggleKeys) {
      const current = currentToggles[key] || false;
      const initial = initialToggles[key] || false;
      if (current !== initial) {
        return true;
      }
    }

    // Vérifier les appréciations
    const appreciationChanged = currentMatieres.some(
      (matiere, index) => matiere.appreciation !== matieres[index].appreciation
    );

    return appreciationChanged;
  }, [initialAdjustments, initialToggles, matieres]);

  // Fonction pour gérer les ajustements - CORRECTION POUR PERMETTRE 0
  const handleAdjustmentChange = (matiereIndex, adjustmentValue) => {
    const newAdjustments = { ...adjustments };
    const newToggles = { ...itemToggles };

    // Permettre les valeurs vides, nulles ou undefined
    if (adjustmentValue === "" || adjustmentValue === null || adjustmentValue === undefined) {
      delete newAdjustments[matiereIndex];
      delete newToggles[matiereIndex];
    } else {
      const adjustment = parseFloat(adjustmentValue);
      // Vérifier si c'est un nombre valide (y compris 0)
      if (!isNaN(adjustment)) {
        newAdjustments[matiereIndex] = adjustment;
        // Activer automatiquement le toggle si ajustement saisi (y compris 0)
        newToggles[matiereIndex] = true;
      } else {
        delete newAdjustments[matiereIndex];
        delete newToggles[matiereIndex];
      }
    }

    setAdjustments(newAdjustments);
    setItemToggles(newToggles);
    setHasChanges(checkForChanges(newAdjustments, newToggles, editedMatieres));
  };

  // Fonction pour gérer les toggles individuels
  const handleItemToggle = (matiereIndex, checked) => {
    const newToggles = { ...itemToggles };

    if (checked) {
      newToggles[matiereIndex] = true;
    } else {
      delete newToggles[matiereIndex];
    }

    setItemToggles(newToggles);
    setHasChanges(checkForChanges(adjustments, newToggles, editedMatieres));
  };

  // Fonction pour calculer la moyenne finale (moyenne + ajustement)
  const getMoyenneFinale = (matiereIndex) => {
    const moyenneInitiale = matieres[matiereIndex].moyenne;
    const adjustment = adjustments[matiereIndex];

    // Si pas d'ajustement défini, retourner la moyenne initiale
    if (adjustment === undefined || adjustment === null) {
      return moyenneInitiale;
    }

    // Sinon, appliquer l'ajustement (y compris si c'est 0)
    return Math.max(0, Math.min(20, moyenneInitiale + adjustment));
  };

  // Fonction pour sauvegarder les modifications
  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      // Construire la structure de données pour l'API
      const apiData = {
        appreciation: notes.appreciation || "Passable",
        classeId: selectedClasse,
        details: editedMatieres.map((matiere, index) => {
          const hasAdjustment = adjustments[index] !== undefined;
          const isToggled = itemToggles[index] || false;
          const moyenneFinale = getMoyenneFinale(index);

          const detail = {
            appreciation: matiere.appreciation,
            categorie: matiere.categorie || "03",
            categorieMatiere: matiere.categorieMatiere || "Littéraire",
            coef: matiere.coefficient,
            matiereId: matiere.id,
            matiereLibelle: matiere.libelle,
            moyCoef: moyenneFinale * matiere.coefficient,
            moyenne: matiere.moyenne,
            rang: matiere.rang || 1
          };

          // Ajouter les champs spécifiques si des modifications existent
          if (hasAdjustment || isToggled) {
            detail.isChecked = isToggled;
            detail.statut = isToggled ? "VALID" : "INVALID";

            if (hasAdjustment) {
              detail.adjustMoyenne = adjustments[index];
            }
          }

          return detail;
        }),
        libelleClasse: classeInfo?.label || "",
        libellePeriode: periodeInfo?.label || "",
        matricule: eleve.matricule,
        moyGeneral: parseFloat(editedTotals.moyenneGenerale),
        nom: eleve.nom,
        periodeId: selectedPeriode,
        prenoms: eleve.prenom,
        rang: notes.rang,
        anneeId: dynamicAcademicYearId
      };

      console.log("📤 Envoi des données à l'API:", apiData);

      // Appel à l'API
      const response = await fetch(apiUrls.bulletins.applyMoyenneAdjustment(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Réponse de l'API:", result);

      // Succès
      setEditMode(false);
      setHasChanges(false);
      setShowSaveAlert(true);

      // Masquer l'alerte après 3 secondes
      setTimeout(() => setShowSaveAlert(false), 3000);

    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);

      // Afficher une alerte d'erreur
      setShowSaveAlert(true);
      const alertDiv = document.querySelector('.modification-alert');
      if (alertDiv) {
        alertDiv.innerHTML = '<strong>❌ Erreur lors de la sauvegarde!</strong><br/>' + error.message;
        alertDiv.style.background = '#fef2f2';
        alertDiv.style.color = '#dc2626';
        alertDiv.style.border = '1px solid #fecaca';
      }

      // Masquer l'alerte d'erreur après 5 secondes
      setTimeout(() => setShowSaveAlert(false), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Fonction pour annuler les modifications
  const handleCancelChanges = () => {
    setEditedMatieres([...matieres]);
    setAdjustments({ ...initialAdjustments });
    setItemToggles({ ...initialToggles });
    setEditMode(false);
    setHasChanges(false);
  };

  // Fonction pour réinitialiser une matière
  const handleResetMatiere = (matiereIndex) => {
    const updatedMatieres = [...editedMatieres];
    updatedMatieres[matiereIndex] = { ...matieres[matiereIndex] };
    setEditedMatieres(updatedMatieres);

    const newAdjustments = { ...adjustments };
    const newToggles = { ...itemToggles };

    if (initialAdjustments[matiereIndex] !== undefined) {
      newAdjustments[matiereIndex] = initialAdjustments[matiereIndex];
    } else {
      delete newAdjustments[matiereIndex];
    }

    if (initialToggles[matiereIndex] !== undefined) {
      newToggles[matiereIndex] = initialToggles[matiereIndex];
    } else {
      delete newToggles[matiereIndex];
    }

    setAdjustments(newAdjustments);
    setItemToggles(newToggles);
    setHasChanges(checkForChanges(newAdjustments, newToggles, updatedMatieres));
  };

  // Fonction pour réinitialiser toutes les matières
  const handleResetAll = () => {
    setEditedMatieres([...matieres]);
    setAdjustments({ ...initialAdjustments });
    setItemToggles({ ...initialToggles });
    setHasChanges(false);
  };

  // Initialiser les données éditées quand les données originales changent
  useEffect(() => {
    setEditedMatieres([...matieres]);

    // Initialiser avec les ajustements et toggles provenant de l'API
    setAdjustments({ ...initialAdjustments });
    setItemToggles({ ...initialToggles });

    // Vérifier s'il y a des modifications initiales
    const hasInitialChanges = Object.keys(initialAdjustments).length > 0 || Object.keys(initialToggles).length > 0;
    setHasChanges(hasInitialChanges);

    console.log("🔄 Initialisation avec:", {
      adjustments: initialAdjustments,
      toggles: initialToggles,
      hasChanges: hasInitialChanges
    });
  }, [matieres, initialAdjustments, initialToggles]);

  // Fonction pour calculer la moyenne ajustée
  const getMoyenneAjustee = (matiereIndex) => {
    const moyenneInitiale = matieres[matiereIndex].moyenne;
    const adjustment = adjustments[matiereIndex];
    const isToggled = itemToggles[matiereIndex] || false;

    // Ne retourner la moyenne ajustée que si le toggle est activé
    if (isToggled && adjustment !== undefined) {
      return Math.max(0, Math.min(20, moyenneInitiale + adjustment));
    }
    return moyenneInitiale;
  };

  // Fonction pour calculer la différence affichée sous l'input
  const getDifferenceAffichage = (matiereIndex) => {
    const adjustment = adjustments[matiereIndex];
    const moyenneInitiale = matieres[matiereIndex].moyenne;
    const isToggled = itemToggles[matiereIndex] || false;

    if (adjustment !== undefined) {
      const difference = adjustment;
      return {
        difference: difference,
        active: isToggled
      };
    }
    return null;
  };

  // Recalculer les totaux avec les moyennes finales (incluant les ajustements)
  const calculateAdjustedTotals = () => {
    let totalPoints = 0;
    let totalCoefficients = 0;

    editedMatieres.forEach((matiere, index) => {
      const moyenneAjustee = getMoyenneAjustee(index);
      totalPoints += moyenneAjustee * matiere.coefficient;
      totalCoefficients += matiere.coefficient;
    });

    const moyenneGenerale =
      totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;

    return {
      totalPoints: totalPoints.toFixed(2),
      totalCoefficients,
      moyenneGenerale: moyenneGenerale.toFixed(2),
    };
  };

  const editedTotals = calculateAdjustedTotals();
  const editedMention = getMention(parseFloat(editedTotals.moyenneGenerale));

  return (
    <div style={{
      background: "white",
      borderRadius: "12px",
      border: "1px solid #e5e7eb",
      overflow: "hidden",
      margin: "20px 0",
    }}>
      {/* Alerte de sauvegarde - Version light */}
      {showSaveAlert && (
        <div
          className="modification-alert"
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            zIndex: 1000,
            padding: "16px 20px",
            background: saving ? "#fef3c7" : "#d1fae5",
            border: `1px solid ${saving ? "#fde68a" : "#a7f3d0"}`,
            borderRadius: "8px",
            color: saving ? "#92400e" : "#065f46",
            fontSize: "14px",
            fontWeight: "500",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            animation: "slideIn 0.3s ease-out"
          }}
        >
          {saving ? (
            <strong>⏳ Sauvegarde en cours...</strong>
          ) : (
            <strong>✅ Modifications sauvegardées avec succès!</strong>
          )}
        </div>
      )}

      {/* En-tête du bulletin - Version light */}
      <div style={{
        background: "#f8fafc",
        borderBottom: "1px solid #e5e7eb",
        padding: "24px",
        textAlign: "center",
      }}>
        <h1 style={{
          margin: 0,
          fontSize: "28px",
          fontWeight: "700",
          color: "#1f2937",
          marginBottom: "8px"
        }}>
          BULLETIN SCOLAIRE
        </h1>
        <p style={{
          margin: 0,
          fontSize: "16px",
          color: "#6b7280",
          fontWeight: "500"
        }}>
          {periodeInfo?.label || "Période"} - Année Scolaire 2024-2025
        </p>
        {ecoleInfo && (
          <div style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
            <div style={{ fontWeight: "600", color: "#374151" }}>{ecoleInfo.libelle}</div>
            <div>Code: {ecoleInfo.code} | Tél: {ecoleInfo.tel}</div>
          </div>
        )}
      </div>

      <div style={{ padding: "24px" }}>
        {/* Barre d'outils d'édition - Version light */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
          padding: "16px 20px",
          background: editMode ? "#fffbeb" : "#f9fafb",
          borderRadius: "8px",
          border: `1px solid ${editMode ? "#fde68a" : "#e5e7eb"}`,
          position: "relative",
        }}>
          {/* Indicateur de changements */}
          {hasChanges && (
            <div style={{
              position: "absolute",
              top: "-8px",
              right: "20px",
              background: "#ef4444",
              color: "white",
              padding: "4px 12px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "600",
            }}>
              Modifications non sauvegardées
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "18px" }}>{editMode ? "✏️" : "📊"}</span>
            <span style={{
              fontWeight: "600",
              color: editMode ? "#92400e" : "#374151",
            }}>
              {editMode ? "Mode Édition Activé" : "Mode Consultation"}
            </span>
            {editMode && hasChanges && (
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{
                  background: "#fef3c7",
                  color: "#92400e",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500"
                }}>
                  {Object.keys(adjustments).length} ajustement(s)
                </span>
                <span style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: "500"
                }}>
                  {Object.keys(itemToggles).length} toggle(s) activé(s)
                </span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {editMode && (
              <>
                <Button
                  appearance="primary"
                  size="sm"
                  onClick={handleSaveChanges}
                  disabled={!hasChanges || saving}
                  loading={saving}
                  style={{
                    minWidth: "120px",
                    backgroundColor: "#10b981",
                    borderColor: "#10b981"
                  }}
                >
                  {saving ? "💾 Sauvegarde..." : "💾 Sauvegarder"}
                </Button>
                <Button
                  appearance="subtle"
                  size="sm"
                  onClick={handleCancelChanges}
                  disabled={saving}
                  style={{
                    minWidth: "100px",
                    color: "#6b7280",
                    borderColor: "#d1d5db"
                  }}
                >
                  ❌ Annuler
                </Button>
              </>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
                {editMode ? "Désactiver" : "Activer"} l'édition:
              </span>
              <Toggle
                checked={editMode}
                disabled={saving}
                onChange={(checked) => {
                  if (saving) return;
                  if (checked) {
                    setEditMode(true);
                  } else {
                    if (hasChanges) {
                      if (window.confirm("Vous avez des modifications non sauvegardées. Voulez-vous vraiment quitter le mode édition ?")) {
                        handleCancelChanges();
                      }
                    } else {
                      setEditMode(false);
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Informations de l'élève - Version light */}
        <div style={{
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "white",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f3f4f6",
            background: "#fafafa",
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "20px" }}>👨‍🎓</span>
              Informations de l'élève
            </h3>
          </div>

          <div style={{ padding: "24px" }}>
            <div className="row" style={{ alignItems: "center" }}>
              <div className="col-12 col-md-4 col-lg-3">
                <div style={{ textAlign: "center", marginBottom: "24px" }}>
                  <Avatar
                    size="lg"
                    src={eleve.urlPhoto}
                    alt={`${eleve.nom} ${eleve.prenom}`}
                    style={{
                      width: "100px",
                      height: "100px",
                      border: "3px solid #e5e7eb",
                      background: "#f9fafb",
                    }}
                  >
                    {!eleve.urlPhoto && (
                      <span style={{
                        fontSize: "28px",
                        fontWeight: "600",
                        color: "#6b7280",
                      }}>
                        {`${eleve.nom?.[0]}${eleve.prenom?.[0]}`}
                      </span>
                    )}
                  </Avatar>
                  <div style={{
                    marginTop: "12px",
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                  }}>
                    {eleve.nom} {eleve.prenom}
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "#6b7280",
                    marginTop: "4px",
                    background: "#f3f4f6",
                    padding: "4px 12px",
                    borderRadius: "6px",
                    display: "inline-block",
                    border: "1px solid #e5e7eb",
                  }}>
                    #{eleve.matricule}
                  </div>
                </div>
              </div>

              <div className="col-12 col-md-8 col-lg-9">
                <div className="row" style={{ gap: "16px 0" }}>
                  <div className="col-12 col-sm-6 col-lg-4">
                    <div style={{
                      background: "#f9fafb",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      height: "100%",
                    }}>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}>
                        🏫 Classe
                      </div>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "600",
                        color: "#1f2937",
                      }}>
                        {classeInfo?.label || "N/A"}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-lg-4">
                    <div style={{
                      background: "#f9fafb",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      height: "100%",
                    }}>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}>
                        {eleve.sexe === "M" ? "👨" : "👩"} Genre
                      </div>
                      <div style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#1f2937",
                        background: eleve.sexe === "M" ? "#dbeafe" : "#fce7f3",
                        padding: "4px 12px",
                        borderRadius: "6px",
                        display: "inline-block",
                        border: `1px solid ${eleve.sexe === "M" ? "#bfdbfe" : "#f9a8d4"}`,
                      }}>
                        {eleve.sexe === "M" ? "Masculin" : "Féminin"}
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-sm-6 col-lg-4">
                    <div style={{
                      background: "#f9fafb",
                      padding: "16px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      height: "100%",
                    }}>
                      <div style={{
                        fontSize: "12px",
                        fontWeight: "500",
                        color: "#6b7280",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}>
                        🌍 Nationalité
                      </div>
                      <div style={{
                        fontSize: "16px",
                        fontWeight: "500",
                        color: "#1f2937",
                      }}>
                        {eleve.nationalite || "Non spécifiée"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Résultats scolaires - Version light */}
        <div style={{
          marginBottom: "24px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          background: "white",
          overflow: "hidden",
        }}>
          <div style={{
            padding: "20px 24px",
            borderBottom: "1px solid #f3f4f6",
            background: "#fafafa",
          }}>
            <h3 style={{
              margin: 0,
              fontSize: "18px",
              fontWeight: "600",
              color: "#1f2937",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <span style={{ fontSize: "20px" }}>📊</span>
              Résultats Scolaires
            </h3>
          </div>

          <div style={{ padding: "24px" }}>
            {/* Tableau des matières - Version light */}
            <div style={{
              overflowX: "auto",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}>
              <table style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "14px",
              }}>
                <thead style={{
                  background: "#f9fafb",
                  borderBottom: "2px solid #e5e7eb",
                }}>
                  <tr>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Matière
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Coef.
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Moyenne
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Rang
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Total Points
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "left",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Appréciation
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      Ajustement
                    </th>
                    <th style={{
                      padding: "16px 12px",
                      textAlign: "center",
                      fontWeight: "600",
                      color: "#374151",
                    }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {editedMatieres.map((matiere, index) => {
                    const currentAdjustment = adjustments[index];
                    const initialAdjustment = initialAdjustments[index];
                    const currentToggle = itemToggles[index] || false;
                    const initialToggle = initialToggles[index] || false;

                    const hasAdjustmentChange = currentAdjustment !== initialAdjustment;
                    const hasToggleChange = currentToggle !== initialToggle;
                    const hasAppreciationChange = matiere.appreciation !== matieres[index].appreciation;

                    const isModified = hasAdjustmentChange || hasToggleChange || hasAppreciationChange;
                    const moyenneFinale = getMoyenneFinale(index);

                    return (
                      <tr
                        key={matiere.id || index}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          ...(isModified && {
                            background: "#fffbeb",
                            borderLeft: "3px solid #f59e0b",
                          }),
                        }}
                      >
                        <td style={{
                          padding: "16px 12px",
                          fontWeight: "500",
                          color: "#1f2937",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          {matiere.libelle}
                          {hasAdjustmentChange && (
                            <div style={{ marginTop: "6px" }}>
                              <span style={{
                                background: "#dcfce7",
                                color: "#166534",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "11px",
                                fontWeight: "500",
                              }}>
                                ✨ AJUSTÉ
                              </span>
                            </div>
                          )}
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          textAlign: "center",
                          color: "#6b7280",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          {matiere.coefficient}
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          textAlign: "center",
                          fontWeight: "500",
                          color: "#1f2937",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          {moyenneFinale.toFixed(2)}/20
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          textAlign: "center",
                          color: "#6b7280",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          {matiere.rang || "-"}
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          textAlign: "center",
                          fontWeight: "500",
                          color: "#1f2937",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          {(moyenneFinale * matiere.coefficient).toFixed(2)}
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          <span style={{
                            background: "#f3f4f6",
                            color: "#374151",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: "500",
                          }}>
                            {matiere.appreciation || "N/A"}
                          </span>
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          textAlign: "center",
                          borderRight: "1px solid #f3f4f6",
                        }}>
                          <div style={{
                            display: "flex",
                            flexDirection: "row",
                            alignItems: "center",
                            gap: "6px",
                          }}>
                            <input
                              type="number"
                              min="-20"
                              max="20"
                              step="0.01"
                              placeholder="0.00"
                              value={adjustments[index] !== undefined ? adjustments[index] : ""}
                              onChange={(e) => handleAdjustmentChange(index, e.target.value)}
                              disabled={!editMode || saving}
                              style={{
                                width: "80px",
                                textAlign: "center",
                                border: hasAdjustmentChange
                                  ? "2px solid #10b981"
                                  : "1px solid #d1d5db",
                                borderRadius: "6px",
                                padding: "6px 8px",
                                fontSize: "13px",
                                fontWeight: "500",
                                background: (!editMode || saving)
                                  ? "#f9fafb"
                                  : hasAdjustmentChange
                                    ? "#ecfdf5"
                                    : "white",
                                opacity: (!editMode || saving) ? 0.6 : 1,
                                cursor: (!editMode || saving) ? "not-allowed" : "text",
                              }}
                            />

                            {/* Affichage de la différence calculée */}
                            {(() => {
                              const differenceInfo = getDifferenceAffichage(index);
                              if (differenceInfo) {
                                return (
                                  <div style={{
                                    fontSize: "11px",
                                    textAlign: "center"
                                  }}>
                                    <div style={{
                                      color: differenceInfo.active ? "#059669" : "#6b7280",
                                      fontWeight: "500",
                                      background: differenceInfo.active ? "#ecfdf5" : "#f9fafb",
                                      padding: "2px 6px",
                                      borderRadius: "4px",
                                      border: `1px solid ${differenceInfo.active ? "#a7f3d0" : "#e5e7eb"}`
                                    }}>
                                      {differenceInfo.difference > 0 ? "+" : ""}{differenceInfo.difference.toFixed(2)}
                                    </div>
                                    {!differenceInfo.active && (
                                      <div style={{
                                        color: "#ef4444",
                                        fontSize: "9px",
                                        fontStyle: "italic",
                                        marginTop: "2px"
                                      }}>
                                        (inactif)
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </td>
                        <td style={{
                          padding: "16px 12px",
                          textAlign: "center",
                        }}>
                          <div style={{
                            display: "flex",
                            gap: "6px",
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                            <Toggle
                              size="sm"
                              checked={itemToggles[index] || false}
                              onChange={(checked) => handleItemToggle(index, checked)}
                              disabled={!editMode || saving}
                              style={{
                                opacity: (!editMode || saving) ? 0.5 : 1,
                              }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot style={{
                  background: hasChanges ? "#eff6ff" : "#f9fafb",
                  borderTop: "2px solid #e5e7eb",
                }}>
                  <tr>
                    <td style={{
                      padding: "20px 12px",
                      fontSize: "16px",
                      fontWeight: "700",
                      color: "#1f2937",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      TOTAUX
                    </td>
                    <td style={{
                      padding: "20px 12px",
                      textAlign: "center",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      {editedTotals.totalCoefficients}
                    </td>
                    <td style={{
                      padding: "20px 12px",
                      textAlign: "center",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#1f2937",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      {parseFloat(editedTotals.moyenneGenerale).toFixed(2)}/20
                    </td>
                    <td style={{
                      padding: "20px 12px",
                      textAlign: "center",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      {notes.rang}{notes.rang === 1 ? "er" : "ème"}
                    </td>
                    <td style={{
                      padding: "20px 12px",
                      textAlign: "center",
                      fontSize: "15px",
                      fontWeight: "700",
                      color: "#1f2937",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      {editedTotals.totalPoints}
                    </td>
                    <td style={{
                      padding: "20px 12px",
                      fontSize: "15px",
                      fontWeight: "600",
                      color: "#374151",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      {editedMention.mention}
                    </td>
                    <td style={{
                      padding: "20px 12px",
                      textAlign: "center",
                      fontSize: "13px",
                      color: "#6b7280",
                      borderRight: "1px solid #f3f4f6",
                    }}>
                      {Object.keys(adjustments).length} ajust.
                    </td>
                    <td style={{ padding: "20px 12px", textAlign: "center" }}>
                      <Button
                        size="xs"
                        onClick={handleResetAll}
                        disabled={!hasChanges || saving}
                        style={{
                          borderRadius: "6px",
                          padding: "6px 12px",
                          fontSize: "12px",
                          fontWeight: "500",
                          color: "#6b7280",
                          borderColor: "#d1d5db"
                        }}
                      >
                        🔄 Reset
                      </Button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Informations complémentaires - Version light */}
        <div className="row" style={{ margin: "0 -12px" }}>
          <div className="col-12 col-md-6" style={{ marginBottom: "16px" }}>
            <div style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "white",
              height: "100%",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
                background: "#fafafa",
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}>
                  Vie Scolaire
                </h4>
              </div>
              <div style={{ padding: "20px" }}>
                <div className="row g-3">
                  <div className="col-lg-4">
                    <div style={{
                      padding: "12px 16px",
                      background: "#fef2f2",
                      borderRadius: "6px",
                      border: "1px solid #fecaca",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "14px", color: "#374151" }}>
                        Absences justifiées
                      </span>
                      <span style={{
                        background: "#fed7d7",
                        color: "#991b1b",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {notes.absencesJustifiees} jour(s)
                      </span>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div style={{
                      padding: "12px 16px",
                      background: "#fef2f2",
                      borderRadius: "6px",
                      border: "1px solid #fecaca",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "14px", color: "#374151" }}>
                        Absences non justifiées
                      </span>
                      <span style={{
                        background: "#fca5a5",
                        color: "#991b1b",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {notes.absencesNonJustifiees} jour(s)
                      </span>
                    </div>
                  </div>

                  <div className="col-lg-4">
                    <div style={{
                      padding: "12px 16px",
                      background: notes.isClassed === "O" ? "#f0fdf4" : "#fef2f2",
                      borderRadius: "6px",
                      border: `1px solid ${notes.isClassed === "O" ? "#bbf7d0" : "#fecaca"}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}>
                      <span style={{ fontSize: "14px", color: "#374151" }}>
                        Statut académique
                      </span>
                      <span style={{
                        background: notes.isClassed === "O" ? "#bbf7d0" : "#fca5a5",
                        color: notes.isClassed === "O" ? "#166534" : "#991b1b",
                        padding: "4px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}>
                        {notes.isClassed === "O" ? "✓ Classé" : "✗ Non classé"}
                      </span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="col-12 col-md-6" style={{ marginBottom: "16px" }}>
            <div style={{
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              background: "white",
              height: "100%",
              overflow: "hidden",
            }}>
              <div style={{
                padding: "16px 20px",
                borderBottom: "1px solid #f3f4f6",
                background: "#fafafa",
              }}>
                <h4 style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}>
                  Appréciation Générale
                </h4>
              </div>
              <div style={{ padding: "20px" }}>
                <div style={{
                  background: "#f9fafb",
                  padding: "20px",
                  borderRadius: "8px",
                  minHeight: "120px",
                  border: "1px solid #e5e7eb",
                  display: "flex",
                  alignItems: "center",
                }}>
                  <p style={{
                    fontStyle: "italic",
                    margin: 0,
                    fontSize: "15px",
                    lineHeight: "1.6",
                    color: "#4b5563",
                    textAlign: notes.appreciation ? "left" : "center",
                    width: "100%",
                  }}>
                    {notes.appreciation || (
                      <span style={{ color: "#9ca3af", fontSize: "14px" }}>
                        📝 Aucune appréciation disponible pour le moment.
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pied de page avec signatures - Version light */}
        <div style={{
          marginTop: "24px",
          padding: "20px",
          background: "#f9fafb",
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
        }}>
          <Row gutter={20}>
            <Col xs={12}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "600", color: "#374151", marginBottom: "12px" }}>
                  Le Professeur Principal
                </div>
                <div style={{
                  height: "60px",
                  borderBottom: "1px solid #d1d5db",
                  marginTop: "10px",
                }}></div>
              </div>
            </Col>
            <Col xs={12}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontWeight: "600", color: "#374151", marginBottom: "12px" }}>
                  Le Directeur
                </div>
                <div style={{
                  height: "60px",
                  borderBottom: "1px solid #d1d5db",
                  marginTop: "10px",
                }}></div>
              </div>
            </Col>
          </Row>
          <div style={{
            textAlign: "center",
            marginTop: "20px",
            fontSize: "12px",
            color: "#6b7280",
          }}>
            Bulletin généré le {new Date().toLocaleDateString("fr-FR")}
          </div>
        </div>
      </div>
    </div>
  );
};

// ===========================
// COMPOSANT PRINCIPAL - VERSION LIGHT
// ===========================
const BulletinScolaire = () => {
  const [selectedClasse, setSelectedClasse] = useState(null);
  const [selectedPeriode, setSelectedPeriode] = useState(null);
  const [selectedEleve, setSelectedEleve] = useState(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  const {
    eleves,
    loading: elevesLoading,
    error: elevesError,
    fetchEleves,
    clearEleves,
  } = useElevesData();

  const {
    bulletinData,
    loading: bulletinLoading,
    error: bulletinError,
    fetchBulletinData,
    clearBulletin,
    initialAdjustments,
    initialToggles
  } = useBulletinData();

  // Récupérer les informations complémentaires
  const { classes } = useClassesData();
  const { periodes } = usePeriodesData();

  const handleSearch = useCallback(
    async ({ classeId, periodeId, eleveId }) => {
      console.log("🔍 Génération du bulletin:", {
        classeId,
        periodeId,
        eleveId,
      });

      setSearchPerformed(true);
      await fetchBulletinData(classeId, periodeId, eleveId);
    },
    [fetchBulletinData, eleves]
  );

  const handleClear = useCallback(() => {
    console.log("🗑️ Réinitialisation des filtres");
    setSelectedClasse(null);
    setSelectedPeriode(null);
    setSelectedEleve(null);
    setSearchPerformed(false);
    clearEleves();
    clearBulletin();
  }, [clearEleves, clearBulletin]);

  // Fonction pour gérer les changements de notes depuis le bulletin
  const handleNoteChange = useCallback((eleveId, matiereIndex, newValue) => {
    console.log("📝 Changement de note dans le bulletin:", {
      eleveId,
      matiereIndex,
      newValue,
    });
  }, []);

  // Informations complémentaires pour l'affichage
  const classeInfo = classes.find((c) => c.id === selectedClasse);
  const periodeInfo = periodes.find((p) => p.id === selectedPeriode);
  const selectedEleveData = eleves.find((e) => e.id === selectedEleve);

  // Utiliser les informations de l'école depuis les données d'élèves ou depuis le bulletin
  const ecoleInfo = selectedEleveData?.raw_data?.inscription?.ecole ||
    bulletinData?.ecole ||
    null;

  return (
    <div style={{
      background: "#f8fafc",
      minHeight: "100vh",
      padding: "20px 0"
    }}>
      <div className="container-fluid">
        {/* Filtres de recherche */}
        <BulletinFilters
          onSearch={handleSearch}
          onClear={handleClear}
          loading={bulletinLoading}
          error={bulletinError}
          selectedClasse={selectedClasse}
          selectedPeriode={selectedPeriode}
          selectedEleve={selectedEleve}
          onClasseChange={(value) => {
            setSelectedClasse(value);
            setSelectedEleve(null);
          }}
          onPeriodeChange={setSelectedPeriode}
          onEleveChange={setSelectedEleve}
        />

        {/* Message d'information */}
        {!searchPerformed && !bulletinLoading && (
          <div className="row mb-4">
            <div className="col-lg-12">
              <div style={{
                padding: "16px 20px",
                background: "#eff6ff",
                border: "1px solid #bfdbfe",
                borderRadius: "8px",
                color: "#1e40af",
                fontSize: "14px",
              }}>
                <strong>Information :</strong> Sélectionnez une classe, une période et un élève, puis cliquez sur "Afficher" pour générer le bulletin.
              </div>
            </div>
          </div>
        )}

        {/* Erreur */}
        {bulletinError && (
          <div className="row mb-4">
            <div className="col-lg-12">
              <div style={{
                padding: "16px 20px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                fontSize: "14px",
              }}>
                <strong>Erreur :</strong> {bulletinError.message}
              </div>
            </div>
          </div>
        )}

        {/* Chargement */}
        {bulletinLoading && (
          <div className="row mb-4">
            <div className="col-lg-12">
              <div style={{ textAlign: "center", padding: "50px" }}>
                <Loader size="lg" content="Génération du bulletin..." />
              </div>
            </div>
          </div>
        )}

        {/* Affichage du bulletin */}
        {searchPerformed && bulletinData && !bulletinLoading && (
          <div className="row">
            <div className="col-lg-12">
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                padding: "16px 20px",
                background: "white",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
              }}>
                <h3 style={{
                  margin: 0,
                  color: "#1f2937",
                  fontSize: "20px",
                  fontWeight: "600"
                }}>
                  Bulletin de {bulletinData.eleve.prenom} {bulletinData.eleve.nom}
                </h3>
                <div style={{ display: "flex", gap: "8px" }}>
                  <Button
                    appearance="primary"
                    style={{
                      backgroundColor: "#3b82f6",
                      borderColor: "#3b82f6"
                    }}
                    onClick={() => window.print()}
                  >
                    📄 Imprimer
                  </Button>
                  <Button
                    onClick={handleClear}
                    style={{
                      color: "#6b7280",
                      borderColor: "#d1d5db"
                    }}
                  >
                    🔄 Nouveau bulletin
                  </Button>
                </div>
              </div>
              <BulletinCard
                bulletinData={bulletinData}
                classeInfo={classeInfo}
                periodeInfo={periodeInfo}
                ecoleInfo={ecoleInfo}
                onNoteChange={handleNoteChange}
                selectedClasse={selectedClasse}
                selectedPeriode={selectedPeriode}
                initialAdjustments={initialAdjustments}
                initialToggles={initialToggles}
              />
            </div>
          </div>
        )}

        {/* Aucun résultat */}
        {searchPerformed &&
          !bulletinData &&
          !bulletinLoading &&
          !bulletinError && (
            <div className="row">
              <div className="col-lg-12">
                <div style={{
                  padding: "16px 20px",
                  background: "#fffbeb",
                  border: "1px solid #fde68a",
                  borderRadius: "8px",
                  color: "#d97706",
                  fontSize: "14px",
                }}>
                  <strong>Aucun résultat :</strong> Aucune donnée trouvée pour cette sélection.
                </div>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default BulletinScolaire;