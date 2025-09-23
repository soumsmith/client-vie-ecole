import React, { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  Button,
  Panel,
  Row,
  Col,
  Message,
  Loader,
  Badge,
  Modal,
  SelectPicker,
  Input,
  Form,
} from "rsuite";
import {
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiDownload,
  FiClock,
  FiAlertTriangle,
  FiUser,
  FiBriefcase,
} from "react-icons/fi";

// Import des fonctions externalisées
import { useCommonState } from "../../hooks/useCommonState";
import DataTable from "../../DataTable";
import {
  useSouscriptionsData,
  souscriptionsTableConfig,
} from "./SouscriptionsService";

// ===========================
// COMPOSANT D'EN-TÊTE AVEC STATISTIQUES DE VALIDATION
// ===========================
const SouscriptionsStatsHeader = ({ souscriptions, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: "15px",
          padding: "20px",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(102, 126, 234, 0.1)",
          marginBottom: "20px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Loader size="sm" />
          <span>Chargement des souscriptions à valider...</span>
        </div>
      </div>
    );
  }

  // Calcul des statistiques
  const totalSouscriptions = souscriptions.length;
  const souscriptionsEnAttente = souscriptions.filter(
    (s) => s.statut === "EN ATTENTE"
  ).length;
  const souscriptionsValidees = souscriptions.filter(
    (s) => s.statut === "VALIDEE"
  ).length;
  const souscriptionsRefusees = souscriptions.filter(
    (s) => s.statut === "REFUSEE"
  ).length;

  // Répartition par genre
  const candidatsMasculins = souscriptions.filter(
    (s) => s.sexe === "MASCULIN"
  ).length;
  const candidatesFeminins = souscriptions.filter(
    (s) => s.sexe === "FEMININ"
  ).length;

  // Fonctions les plus demandées
  const functionsCount = [...new Set(souscriptions.map((s) => s.fonction))]
    .length;

  // Niveaux d'études
  const niveauxCount = [...new Set(souscriptions.map((s) => s.niveau_etude))]
    .length;

  // Expérience moyenne
  const experienceTotale = souscriptions.reduce(
    (sum, s) => sum + (s.experience || 0),
    0
  );
  const experienceMoyenne =
    totalSouscriptions > 0
      ? Math.round(experienceTotale / totalSouscriptions)
      : 0;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "15px",
        padding: "25px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(102, 126, 234, 0.1)",
        marginBottom: "20px",
      }}
    >
      {/* En-tête */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
          paddingBottom: 15,
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            borderRadius: "10px",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiBriefcase size={18} color="white" />
        </div>
        <div>
          <h5 style={{ margin: 0, color: "#334155", fontWeight: "600" }}>
            Souscriptions Personnel à Valider
          </h5>
          <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
            Candidatures en attente • {totalSouscriptions} souscription(s) •
            Expérience moyenne: {experienceMoyenne} ans
          </p>
        </div>
      </div>

      {/* Statistiques en grille */}
      <Row gutter={16}>
        <Col xs={12} sm={8} md={4}>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f0f9ff",
              borderRadius: "8px",
              border: "1px solid #bae6fd",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: "#0369a1" }}
            >
              {totalSouscriptions}
            </div>
            <div
              style={{ fontSize: "12px", color: "#0369a1", fontWeight: "500" }}
            >
              Total Souscriptions
            </div>
          </div>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#fffbeb",
              borderRadius: "8px",
              border: "1px solid #fed7aa",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: "#d97706" }}
            >
              {souscriptionsEnAttente}
            </div>
            <div
              style={{ fontSize: "12px", color: "#d97706", fontWeight: "500" }}
            >
              En Attente
            </div>
          </div>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: "#16a34a" }}
            >
              {souscriptionsValidees}
            </div>
            <div
              style={{ fontSize: "12px", color: "#16a34a", fontWeight: "500" }}
            >
              Validées
            </div>
          </div>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#f5f3ff",
              borderRadius: "8px",
              border: "1px solid #d8b4fe",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: "#9333ea" }}
            >
              {functionsCount}
            </div>
            <div
              style={{ fontSize: "12px", color: "#9333ea", fontWeight: "500" }}
            >
              Fonctions
            </div>
          </div>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#fef2f2",
              borderRadius: "8px",
              border: "1px solid #fecaca",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: "#dc2626" }}
            >
              {experienceMoyenne}
            </div>
            <div
              style={{ fontSize: "12px", color: "#dc2626", fontWeight: "500" }}
            >
              Ans d'expérience
            </div>
          </div>
        </Col>

        <Col xs={12} sm={8} md={4}>
          <div
            style={{
              textAlign: "center",
              padding: "15px",
              backgroundColor: "#ecfdf5",
              borderRadius: "8px",
              border: "1px solid #a7f3d0",
            }}
          >
            <div
              style={{ fontSize: "24px", fontWeight: "700", color: "#059669" }}
            >
              {niveauxCount}
            </div>
            <div
              style={{ fontSize: "12px", color: "#059669", fontWeight: "500" }}
            >
              Niveaux d'étude
            </div>
          </div>
        </Col>
      </Row>

      {/* Badges informatifs */}
      <div style={{ marginTop: 15, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Badge color="blue" style={{ fontSize: "11px" }}>
          {candidatsMasculins} Hommes
        </Badge>
        <Badge color="pink" style={{ fontSize: "11px" }}>
          {candidatesFeminins} Femmes
        </Badge>
        {souscriptionsRefusees > 0 && (
          <Badge color="red" style={{ fontSize: "11px" }}>
            {souscriptionsRefusees} Refusée(s)
          </Badge>
        )}
      </div>

      {/* Alerte pour les souscriptions en attente */}
      {souscriptionsEnAttente > 0 && (
        <div
          style={{
            marginTop: 15,
            padding: "12px 16px",
            backgroundColor: "#fef3c7",
            border: "1px solid #f59e0b",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FiAlertTriangle size={16} color="#d97706" />
          <span
            style={{ fontSize: "13px", color: "#92400e", fontWeight: "500" }}
          >
            {souscriptionsEnAttente} souscription(s) nécessitent une validation
          </span>
        </div>
      )}
    </div>
  );
};

// ===========================
// MODAL DE VALIDATION/MODIFICATION
// ===========================
const ValidationModal = ({ show, type, souscription, onClose, onConfirm }) => {
  const [formData, setFormData] = useState({
    statut: "",
    diplome_recent: "",
    comment: "",
  });
  const [loading, setLoading] = useState(false);

  // Options pour les statuts
  const statutOptions = [
    { label: "Validée", value: "VALIDEE" },
    { label: "Refusée", value: "REFUSEE" },
    { label: "En attente", value: "EN ATTENTE" },
  ];

  useEffect(() => {
    if (souscription && show) {
      setFormData({
        statut: souscription.statut || "",
        diplome_recent: souscription.diplome_recent || "",
        comment: "",
      });
    }
  }, [souscription, show]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(souscription, formData);
      setFormData({ statut: "", diplome_recent: "", comment: "" });
      onClose();
    } catch (error) {
      console.error("Erreur lors de la validation:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValidation = type === "validate";
  const isEdit = type === "edit";
  const title = isValidation
    ? "Valider la souscription"
    : type === "reject"
      ? "Refuser la souscription"
      : "Modifier la souscription";
  const color = isValidation
    ? "#22c55e"
    : type === "reject"
      ? "#ef4444"
      : "#f39c12";
  const icon = isValidation ? (
    <FiCheckCircle />
  ) : type === "reject" ? (
    <FiXCircle />
  ) : (
    <FiBriefcase />
  );

  return (
    <Modal open={show} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ color }}>{icon}</span>
          {title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {souscription && (
          <div>
            {/* Informations du candidat - Design amélioré */}
            <div
              style={{
                marginBottom: 24,
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "16px",
                padding: "2px",
                boxShadow: "0 8px 32px rgba(102, 126, 234, 0.15)",
              }}
            >
              <div
                style={{
                  backgroundColor: "#ffffff",
                  borderRadius: "14px",
                  padding: "24px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* Élément décoratif */}
                <div
                  style={{
                    position: "absolute",
                    top: -20,
                    right: -20,
                    width: 100,
                    height: 100,
                    background: "linear-gradient(135deg, #667eea20, #764ba220)",
                    borderRadius: "50%",
                    zIndex: 0,
                  }}
                />

                {/* Header avec avatar et nom */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 24,
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 16,
                      color: "white",
                      fontSize: "24px",
                      fontWeight: "bold",
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                    }}
                  >
                    {souscription.nomComplet?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "#2d3748",
                        fontSize: "22px",
                        fontWeight: "600",
                        marginBottom: 4,
                      }}
                    >
                      {souscription.nomComplet}
                    </h3>
                    <span
                      style={{
                        color: "#718096",
                        fontSize: "14px",
                        fontWeight: "500",
                      }}
                    >
                      Candidat • {souscription.fonction}
                    </span>
                  </div>
                </div>

                {/* Informations principales en cards */}
                <Row gutter={[16, 16]}>
                  <Col xs={12} sm={8}>
                    <div
                      style={{
                        backgroundColor: "#f7fafc",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: "#667eea",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          🎂
                        </div>
                        <div className="flex-column">
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#4a5568",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Naissance
                          </span>
                          <div
                            style={{
                              color: "#2d3748",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {souscription.dateNaissance_display}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} sm={8}>
                    <div
                      style={{
                        backgroundColor: "#f0fff4",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #c6f6d5",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: "#48bb78",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          📞
                        </div>
                        <div className="flex-column">
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#2f855a",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Contact
                          </span>
                          <div
                            style={{
                              color: "#2d3748",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {souscription.contact}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={12} sm={8}>
                    <div
                      style={{
                        backgroundColor: "#fffbf0",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #fbd38d",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: "#ed8936",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          🎯
                        </div>
                        <div className="flex-column">
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#c05621",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Fonction
                          </span>
                          <div
                            style={{
                              color: "#2d3748",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {souscription.fonction}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Deuxième rangée d'informations */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} sm={8}>
                    <div
                      style={{
                        backgroundColor: "#f0f4ff",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #c3dafe",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: "#4299e1",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          🎓
                        </div>

                        <div className="flex-column">
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#2c5282",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Niveau d'étude
                          </span>
                          <div
                            style={{
                              color: "#2d3748",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {souscription.niveau_etude}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col xs={24} sm={16}>
                    <div
                      style={{
                        backgroundColor: "#fef5e7",
                        padding: "16px",
                        borderRadius: "12px",
                        border: "1px solid #f6e05e",
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 4px 12px rgba(0,0,0,0.1)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            backgroundColor: "#d69e2e",
                            borderRadius: "8px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            marginRight: 10,
                          }}
                        >
                          📚
                        </div>
                        <div className="flex-column">
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: "600",
                              color: "#b7791f",
                              textTransform: "uppercase",
                              letterSpacing: "0.5px",
                            }}
                          >
                            Formation
                          </span>
                          <div
                            style={{
                              color: "#2d3748",
                              fontSize: "14px",
                              fontWeight: "500",
                            }}
                          >
                            {souscription.domaine_formation}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Col>
                </Row>

                {/* Badge d'expérience */}
                <div
                  style={{
                    marginTop: 20,
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "white",
                      padding: "12px 24px",
                      borderRadius: "25px",
                      fontSize: "14px",
                      fontWeight: "600",
                      boxShadow: "0 4px 16px rgba(102, 126, 234, 0.3)",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: 8 }}>💼</span>
                    <span>Expérience: {souscription.experience_display}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulaire de modification - reste inchangé */}
            <Form layout="vertical">
              {(isEdit || type === "validate" || type === "reject") && (
                <Form.Group>
                  <Form.ControlLabel>
                    Statut de la souscription
                  </Form.ControlLabel>
                  <SelectPicker
                    data={statutOptions}
                    value={formData.statut}
                    onChange={(value) =>
                      setFormData({ ...formData, statut: value })
                    }
                    placeholder="Sélectionner un statut"
                    style={{ width: "100%" }}
                    disabled={type === "validate" || type === "reject"}
                  />
                </Form.Group>
              )}

              {isEdit && (
                <Form.Group>
                  <Form.ControlLabel>Diplôme récent</Form.ControlLabel>
                  <Input
                    value={formData.diplome_recent}
                    onChange={(value) =>
                      setFormData({ ...formData, diplome_recent: value })
                    }
                    placeholder="Diplôme le plus récent..."
                  />
                </Form.Group>
              )}

              <Form.Group>
                <Form.ControlLabel>
                  Commentaire{" "}
                  {!isEdit
                    ? type === "reject"
                      ? "(obligatoire)"
                      : "(optionnel)"
                    : "(optionnel)"}
                </Form.ControlLabel>
                <Input
                  as="textarea"
                  rows={4}
                  value={formData.comment}
                  onChange={(value) =>
                    setFormData({ ...formData, comment: value })
                  }
                  placeholder={
                    type === "validate"
                      ? "Commentaire sur la validation..."
                      : type === "reject"
                        ? "Motif du refus (obligatoire)..."
                        : "Commentaire ou notes..."
                  }
                />
              </Form.Group>
            </Form>
          </div>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button onClick={onClose} appearance="subtle">
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          appearance="primary"
          loading={loading}
          disabled={type === "reject" && !formData.comment.trim()}
          style={{ backgroundColor: color, borderColor: color }}
        >
          {isValidation
            ? "Valider"
            : type === "reject"
              ? "Refuser"
              : "Enregistrer"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

// ===========================
// COMPOSANT PRINCIPAL DES SOUSCRIPTIONS À VALIDER
// ===========================
const SouscriptionsAValider = () => {
  const navigate = useNavigate();
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [validationModal, setValidationModal] = useState({
    show: false,
    type: null,
    souscription: null,
  });

  // ===========================
  // HOOKS PERSONNALISÉS
  // ===========================
  const { modalState, handleTableAction, handleCloseModal } = useCommonState();

  const { souscriptions, loading, error, refetch } =
    useSouscriptionsData(refreshTrigger);

  // ===========================
  // GESTION DU TABLEAU ET NAVIGATION
  // ===========================
  const handleTableActionLocal = useCallback(
    (actionType, item) => {
      console.log("Action:", actionType, "Item:", item);

      // Gestion spécifique pour les actions de validation
      if (actionType === "validate" && item && item.id) {
        setValidationModal({
          show: true,
          type: "validate",
          souscription: item,
        });
        return;
      }

      if (actionType === "reject" && item && item.id) {
        setValidationModal({
          show: true,
          type: "reject",
          souscription: item,
        });
        return;
      }

      // Gestion spécifique pour l'action "modifier"
      if (actionType === "edit" && item && item.id) {
        setValidationModal({
          show: true,
          type: "edit",
          souscription: item,
        });
        return;
      }

      // Pour les autres actions (view, download, etc.), utiliser le modal
      handleTableAction(actionType, item);
    },
    [navigate, handleTableAction]
  );

  // ===========================
  // GESTION DE LA VALIDATION/REFUS/MODIFICATION
  // ===========================
  const handleValidationConfirm = useCallback(
    async (souscription, formData) => {
      const action = validationModal.type;

      console.log(`${action} de la souscription:`, {
        souscription: souscription.id,
        candidat: souscription.nomComplet,
        formData: formData,
        action: action,
      });

      // Ici vous pouvez ajouter l'appel API pour valider/refuser/modifier
      // await updateSouscriptionStatus(souscription.id, formData);

      // Simulation d'un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Actualiser les données
      setRefreshTrigger((prev) => prev + 1);
    },
    [validationModal.type]
  );

  // ===========================
  // GESTION DU MODAL CLASSIQUE
  // ===========================
  const handleModalSave = useCallback(async () => {
    try {
      switch (modalState.type) {
        case "view":
          console.log("Voir le dossier complet:", modalState.selectedItem);
          break;

        case "download":
          console.log("Télécharger les documents:", modalState.selectedItem);
          break;

        default:
          console.log("Action non gérée:", modalState.type);
          break;
      }

      handleCloseModal();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  }, [modalState.type, modalState.selectedItem, handleCloseModal]);

  // ===========================
  // GESTION DU RAFRAÎCHISSEMENT
  // ===========================
  const handleRefresh = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // ===========================
  // GESTION DES ACTIONS EN MASSE
  // ===========================
  const handleValidateAll = useCallback(() => {
    const pendingSouscriptions = souscriptions.filter(
      (s) => s.statut === "EN ATTENTE"
    );
    console.log(
      "Validation en masse de",
      pendingSouscriptions.length,
      "souscriptions"
    );
  }, [souscriptions]);

  const handleExportAll = useCallback(() => {
    console.log("Export de toutes les souscriptions à valider");
  }, []);

  // ===========================
  // RENDU DU COMPOSANT
  // ===========================
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
        padding: "20px 0",
      }}
    >
      <div className="container-fluid">
        {/* En-tête avec statistiques */}
        <div className="row">
          <div className="col-lg-12">
            <SouscriptionsStatsHeader
              souscriptions={souscriptions}
              loading={loading}
            />
          </div>
        </div>

        {/* Erreur de chargement */}
        {error && (
          <div className="row mb-4">
            <div className="col-lg-12">
              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "25px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(239, 68, 68, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    borderRadius: "12px",
                    padding: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>⚠️</span>
                </div>
                <div>
                  <h6
                    style={{ margin: 0, color: "#dc2626", fontWeight: "600" }}
                  >
                    Erreur de chargement
                  </h6>
                  <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                    {error.message}
                  </p>
                </div>
                <Button
                  appearance="primary"
                  style={{
                    marginLeft: "auto",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                  }}
                  startIcon={<FiRefreshCw />}
                  onClick={handleRefresh}
                >
                  Réessayer
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* DataTable avec style amélioré */}
        {!error && (
          <div className="row">
            <div className="col-lg-12">
              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(102, 126, 234, 0.1)",
                  overflow: "hidden",
                }}
              >
                <DataTable
                  title="Souscriptions Personnel à Valider"
                  subtitle="souscription(s) en attente de traitement"
                  data={souscriptions}
                  loading={loading}
                  error={null}
                  columns={souscriptionsTableConfig.columns}
                  searchableFields={souscriptionsTableConfig.searchableFields}
                  filterConfigs={souscriptionsTableConfig.filterConfigs}
                  actions={souscriptionsTableConfig.actions}
                  onAction={handleTableActionLocal}
                  onRefresh={handleRefresh}
                  defaultPageSize={15}
                  pageSizeOptions={[10, 15, 25, 50]}
                  tableHeight={650}
                  enableRefresh={true}
                  enableCreate={false}
                  selectable={false}
                  rowKey="id"
                  customStyles={{
                    container: { backgroundColor: "transparent" },
                    panel: {
                      minHeight: "650px",
                      border: "none",
                      boxShadow: "none",
                    },
                  }}
                  // Boutons d'action supplémentaires
                  extraActions={[
                    {
                      key: "validate-all",
                      label: "Valider Toutes",
                      icon: <FiCheckCircle />,
                      color: "green",
                      onClick: handleValidateAll,
                      disabled:
                        souscriptions.filter((s) => s.statut === "EN ATTENTE")
                          .length === 0,
                    },
                    {
                      key: "export-all",
                      label: "Exporter Tout",
                      icon: <FiDownload />,
                      color: "blue",
                      onClick: handleExportAll,
                    },
                  ]}
                />
              </div>
            </div>
          </div>
        )}

        {/* Aucune souscription - cas possible */}
        {!loading && !error && souscriptions?.length === 0 && (
          <div className="row">
            <div className="col-lg-12">
              <div
                style={{
                  background: "white",
                  borderRadius: "15px",
                  padding: "40px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.15)",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    borderRadius: "20px",
                    padding: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 20,
                  }}
                >
                  <FiBriefcase size={40} color="white" />
                </div>
                <h5
                  style={{
                    margin: "0 0 10px 0",
                    color: "#1e293b",
                    fontWeight: "600",
                  }}
                >
                  Aucune souscription à valider
                </h5>
                <p style={{ margin: 0, color: "#64748b", fontSize: "14px" }}>
                  Toutes les souscriptions ont été traitées ou il n'y a pas de
                  nouvelle candidature.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de validation/refus/modification */}
      <ValidationModal
        show={validationModal.show}
        type={validationModal.type}
        souscription={validationModal.souscription}
        onClose={() =>
          setValidationModal({ show: false, type: null, souscription: null })
        }
        onConfirm={handleValidationConfirm}
      />
    </div>
  );
};

export default SouscriptionsAValider;
