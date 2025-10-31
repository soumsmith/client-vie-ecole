import React, { useState, useEffect, useCallback } from "react";
import {
  Modal,
  Button,
  Form,
  SelectPicker,
  Input,
  Panel,
  Grid,
  Row,
  Col,
  Badge,
  Text,
  Avatar,
  Message,
  Loader,
  Table
} from "rsuite";
import {
  FiClock,
  FiBook,
  FiCalendar,
  FiCheck,
  FiX,
  FiAlertTriangle,
  FiSave,
  FiPlus,
  FiMapPin,
  FiUsers,
} from "react-icons/fi";
import Swal from "sweetalert2";
import {
  useClassesData,
  useJoursData,
  useTypesActiviteData,
  useMatieresByClasse,
  checkCreneauDisponibilite,
  getSallesDisponibles,
  saveActivite,
} from "./EmploiDuTempsServiceManager";
import { usePulsParams } from "../../hooks/useDynamicParams";
import { useAllApiUrls } from "../utils/apiConfig";
import VerificationStatus from '../Composant/VerificationStatus';


const EmploiDuTempsModal = ({
  modalState,
  onClose,
  onSave,
  selectedClasse,
  selectedDay,
  activitesExistantes,
  loadingActivites
}) => {
  const { isOpen, type, selectedQuestion: activite } = modalState;
  const {
    ecoleId: dynamicEcoleId,
    personnelInfo,
    academicYearId: dynamicAcademicYearId,
    periodicitieId: dynamicPeriodicitieId,
    profileId,
    userId: dynamicUserId,
    email,
    isAuthenticated,
    isInitialized,
    isReady,
  } = usePulsParams();

  const apiUrls = useAllApiUrls();

  const [formData, setFormData] = useState({
    classeId: null,
    jourId: null,
    heureDeb: "",
    heureFin: "",
    matiereId: null,
    salleId: null,
    typeActiviteId: null,
  });

  // ===========================
  // STATE SIMPLIFIÉ
  // ===========================
  const [verfication, setVerification] = useState({
    creneauDisponible: null,
    sallesDisponibles: [],
    loading: false,
    error: null
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===========================
  // HOOKS POUR LES DONNÉES
  // ===========================
  const { classes } = useClassesData();
  const { jours } = useJoursData();
  const { typesActivite } = useTypesActiviteData(dynamicEcoleId);
  const { matieres } = useMatieresByClasse(formData.classeId);

  // ===========================
  // PRÉPARATION DES OPTIONS
  // ===========================
  const classesOptions = classes.map(classe => ({
    label: classe.libelle,
    value: classe.id
  }));

  const joursOptions = jours.map(jour => ({
    label: jour.libelle,
    value: jour.id
  }));

  const matieresOptions = matieres.map(matiere => ({
    label: matiere.matiere.libelle,
    value: matiere.matiere.id
  }));

  const sallesOptions = verfication.sallesDisponibles.map(salle => ({
    label: salle.libelle,
    value: salle.id
  }));

  const typesActiviteOptions = typesActivite.map(type => ({
    label: type.libelle,
    value: type.id
  }));

  // ===========================
  // FONCTIONS DE VALIDATION
  // ===========================
  const validateTimeRange = useCallback(() => {
    const { heureDeb, heureFin } = formData;

    if (!heureDeb || !heureFin) {
      return { valid: false, message: "Les heures de début et fin sont obligatoires" };
    }

    const [debutH, debutM] = heureDeb.split(':').map(Number);
    const [finH, finM] = heureFin.split(':').map(Number);

    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;

    if (finMinutes <= debutMinutes) {
      return { valid: false, message: "L'heure de fin doit être supérieure à l'heure de début" };
    }

    if (finMinutes - debutMinutes < 15) {
      return { valid: false, message: "Il doit y avoir au moins 15 minutes entre le début et la fin" };
    }

    return { valid: true, message: null };
  }, [formData.heureDeb, formData.heureFin]);

  const isFormValid = useCallback(() => {
    const requiredFields = ['classeId', 'jourId', 'heureDeb', 'heureFin', 'matiereId', 'salleId', 'typeActiviteId'];
    const hasAllFields = requiredFields.every(field => formData[field]);
    const timeValidation = validateTimeRange();

    return hasAllFields && timeValidation.valid && verfication.creneauDisponible;
  }, [formData, validateTimeRange, verfication.creneauDisponible]);

  // ===========================
  // VÉRIFICATION DE DISPONIBILITÉ - CORRIGÉE
  // ===========================
  const verifierDisponibilite = useCallback(async () => {
    const { classeId, jourId, heureDeb, heureFin } = formData;

    console.log('=== DÉBUT VÉRIFICATION DE DISPONIBILITÉ ===');
    console.log('FormData:', { classeId, jourId, heureDeb, heureFin });

    // Reset de l'état de vérification
    setVerification(prev => ({
      ...prev,
      creneauDisponible: null,
      sallesDisponibles: [],
      error: null
    }));

    // Vérification des prérequis
    if (!classeId || !jourId || !heureDeb || !heureFin) {
      console.log('Prérequis non satisfaits - arrêt de la vérification');
      return;
    }

    // Validation des heures
    const timeValidation = validateTimeRange();
    if (!timeValidation.valid) {
      setVerification(prev => ({
        ...prev,
        creneauDisponible: false,
        error: timeValidation.message
      }));
      return;
    }

    setVerification(prev => ({ ...prev, loading: true }));
    console.log('Démarrage de la vérification...');

    try {
      // Vérifier la disponibilité du créneau - CORRIGÉ avec apiUrls
      console.log('Vérification du créneau avec:', {
        dynamicAcademicYearId,
        classeId,
        jourId,
        heureDeb,
        heureFin
      });

      const disponible = await checkCreneauDisponibilite(
        dynamicAcademicYearId,
        classeId,
        jourId,
        heureDeb,
        heureFin,
        apiUrls  // AJOUT MANQUANT
      );

      console.log('Résultat disponibilité créneau:', disponible);

      if (disponible) {
        // Si disponible, récupérer les salles - CORRIGÉ avec apiUrls
        console.log('Récupération des salles disponibles...');
        const salles = await getSallesDisponibles(
          dynamicAcademicYearId,
          classeId,
          jourId,
          heureDeb,
          heureFin,
          '', // date par défaut
          apiUrls  // AJOUT MANQUANT
        );

        console.log('Salles récupérées:', salles);

        setVerification({
          creneauDisponible: true,
          sallesDisponibles: salles,
          loading: false,
          error: null
        });
      } else {
        setVerification({
          creneauDisponible: false,
          sallesDisponibles: [],
          loading: false,
          error: "Plage horaire non disponible"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la vérification:', error);
      setVerification({
        creneauDisponible: false,
        sallesDisponibles: [],
        loading: false,
        error: "Erreur lors de la vérification de disponibilité"
      });
    }

    console.log('=== FIN VÉRIFICATION DE DISPONIBILITÉ ===');
  }, [formData, validateTimeRange, dynamicAcademicYearId, apiUrls]);

  // Vérification spécifique pour le mode édition - CORRIGÉE
  const verifierDisponibiliteForEdit = useCallback(async (classeId, jourId, heureDeb, heureFin, salleActuelle) => {
    console.log('=== VÉRIFICATION POUR ÉDITION ===');
    console.log('Paramètres:', { classeId, jourId, heureDeb, heureFin, salleActuelle });

    setVerification(prev => ({ ...prev, loading: true }));

    try {
      // Récupérer les salles disponibles pour ce créneau - CORRIGÉ avec apiUrls
      const salles = await getSallesDisponibles(
        dynamicAcademicYearId,
        classeId,
        jourId,
        heureDeb,
        heureFin,
        '', // date par défaut
        apiUrls  // AJOUT MANQUANT
      );

      console.log('Salles récupérées:', salles);

      // Ajouter la salle actuelle si elle n'est pas dans la liste
      let sallesAvecActuelle = [...salles];
      if (salleActuelle && !salles.find(s => s.id === salleActuelle)) {
        // Récupérer les détails de la salle actuelle depuis activite
        const salleActuelleObj = activite?.raw_data?.salle || activite?.salle;
        if (salleActuelleObj) {
          sallesAvecActuelle.push(salleActuelleObj);
          console.log('Salle actuelle ajoutée:', salleActuelleObj);
        }
      }

      setVerification({
        creneauDisponible: true,
        sallesDisponibles: sallesAvecActuelle,
        loading: false,
        error: null
      });

      console.log('Vérification terminée, salles disponibles:', sallesAvecActuelle);
    } catch (error) {
      console.error('Erreur lors de la vérification pour édition:', error);

      // En cas d'erreur, au moins inclure la salle actuelle
      const salleActuelleObj = activite?.raw_data?.salle || activite?.salle;
      const sallesMinimal = salleActuelleObj ? [salleActuelleObj] : [];

      setVerification({
        creneauDisponible: true, // On assume que c'est disponible en mode édition
        sallesDisponibles: sallesMinimal,
        loading: false,
        error: "Erreur lors de la récupération des salles, seule la salle actuelle est affichée"
      });
    }
  }, [dynamicAcademicYearId, activite, apiUrls]);

  // ===========================
  // GESTION DES CHANGEMENTS
  // ===========================
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };

      // Reset des champs dépendants
      if (field === 'classeId') {
        newData.matiereId = null;
        newData.salleId = null;
      }

      // Reset de la salle si les paramètres de vérification changent
      if (['classeId', 'jourId', 'heureDeb', 'heureFin'].includes(field)) {
        newData.salleId = null;
      }

      return newData;
    });
  }, []);

  // ===========================
  // EFFECTS - CORRIGÉS
  // ===========================

  // Initialisation du formulaire - CORRIGÉE POUR LE PRÉ-REMPLISSAGE
  useEffect(() => {
    if (type === "edit" && activite && isOpen) {
      console.log('=== INITIALISATION MODE ÉDITION ===');
      console.log('Activité reçue:', activite);

      // Extraction des IDs depuis les différentes structures possibles
      const getIdFromField = (field) => {
        if (!field) return null;

        // Si c'est déjà un ID (nombre)
        if (typeof field === 'number') return field;

        // Si c'est un objet avec un ID
        if (typeof field === 'object' && field.id) return field.id;

        // Si c'est dans raw_data
        if (activite.raw_data && activite.raw_data[field] && activite.raw_data[field].id) {
          return activite.raw_data[field].id;
        }

        return null;
      };

      const formDataEdit = {
        classeId: getIdFromField('classe') || activite.classeId || (activite.raw_data?.classe?.id),
        jourId: getIdFromField('jour') || activite.jourId || (activite.raw_data?.jour?.id),
        heureDeb: activite.heureDeb || (activite.raw_data?.heureDeb) || "",
        heureFin: activite.heureFin || (activite.raw_data?.heureFin) || "",
        matiereId: getIdFromField('matiere') || activite.matiereId || (activite.raw_data?.matiere?.id),
        salleId: getIdFromField('salle') || activite.salleId || (activite.raw_data?.salle?.id),
        typeActiviteId: getIdFromField('typeActivite') || activite.typeActiviteId || (activite.raw_data?.typeActivite?.id),
      };

      console.log('FormData calculé pour édition:', formDataEdit);
      setFormData(formDataEdit);

      // Déclencher la vérification pour le mode édition après un court délai
      setTimeout(() => {
        if (formDataEdit.classeId && formDataEdit.jourId && formDataEdit.heureDeb && formDataEdit.heureFin) {
          verifierDisponibiliteForEdit(
            formDataEdit.classeId,
            formDataEdit.jourId,
            formDataEdit.heureDeb,
            formDataEdit.heureFin,
            formDataEdit.salleId
          );
        }
      }, 500);

    } else if (type === "create" && isOpen) {
      console.log('=== INITIALISATION MODE CRÉATION ===');

      // PRÉ-SÉLECTION DE LA CLASSE ET DU JOUR POUR LA CRÉATION
      setFormData({
        classeId: selectedClasse?.id || null,
        jourId: selectedDay || null,
        heureDeb: "",
        heureFin: "",
        matiereId: null,
        salleId: null,
        typeActiviteId: null,
      });
      setVerification({
        creneauDisponible: null,
        sallesDisponibles: [],
        loading: false,
        error: null
      });
    }
  }, [type, activite, isOpen, selectedClasse, selectedDay, verifierDisponibiliteForEdit]);

  // Vérification automatique - DÉCLENCHEMENT CORRIGÉ
  useEffect(() => {
    const { classeId, jourId, heureDeb, heureFin } = formData;

    // Vérifier seulement en mode création et si tous les champs requis sont remplis
    if (type === "create" && classeId && jourId && heureDeb && heureFin) {
      console.log('Déclenchement de la vérification automatique');
      const timer = setTimeout(() => {
        verifierDisponibilite();
      }, 300);

      return () => clearTimeout(timer);
    } else if (type === "create") {
      // Reset de la vérification si les champs requis ne sont pas tous remplis
      setVerification({
        creneauDisponible: null,
        sallesDisponibles: [],
        loading: false,
        error: null
      });
    }
  }, [formData.classeId, formData.jourId, formData.heureDeb, formData.heureFin, type, verifierDisponibilite]);

  // ===========================
  // SAUVEGARDE - CORRIGÉE
  // ===========================
  const handleSave = async () => {
    if (!isFormValid()) {
      Swal.fire({
        icon: "warning",
        title: "Formulaire incomplet",
        text: "Veuillez remplir tous les champs obligatoires et vérifier la disponibilité du créneau.",
        confirmButtonColor: "#10b981",
      });
      return;
    }

    const result = await Swal.fire({
      title: type === "create" ? "Créer l'activité" : "Modifier l'activité",
      text: `Confirmer ${type === "create" ? "la création de" : "la modification de"} cette activité ?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, confirmer",
      cancelButtonText: "Annuler",
    });

    if (!result.isConfirmed) return;

    setIsSubmitting(true);

    try {
      // Récupérer les objets complets pour l'API
      const classe = classes.find(c => c.id === formData.classeId);
      const jour = jours.find(j => j.id === formData.jourId);
      const matiere = matieres.find(m => m.matiere.id === formData.matiereId)?.matiere;
      const salle = verfication.sallesDisponibles.find(s => s.id === formData.salleId);
      const typeActivite = typesActivite.find(t => t.id === formData.typeActiviteId);

      const activiteData = {
        jour: { id: jour.id, libelle: null },
        heureDeb: formData.heureDeb,
        heureFin: formData.heureFin,
        matiere: { id: matiere.id, libelle: null },
        classe: { id: classe.id, libelle: null },
        salle: { id: salle.id, libelle: null },
        typeActivite: { id: typeActivite.id, libelle: null },
        user: dynamicUserId,
        annee: dynamicAcademicYearId.toString(),
        ecole: { id: dynamicEcoleId.toString() },
        profPrincipal: null,
      };

      console.log('Données à sauvegarder:', activiteData);

      const response = await saveActivite(activiteData, apiUrls);  // AJOUT apiUrls

      await Swal.fire({
        icon: "success",
        title: `Activité ${type === "create" ? "créée" : "modifiée"} !`,
        text: `L'activité a été ${type === "create" ? "créée" : "modifiée"} avec succès.`,
        confirmButtonColor: "#10b981",
        timer: 3000,
      });

      if (onSave) onSave(response);
      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);

      let errorMessage = "Une erreur inattendue est survenue.";
      if (error.response?.status === 400) {
        errorMessage = "Données invalides. Vérifiez les informations saisies.";
      } else if (error.response?.status === 409) {
        errorMessage = "Plage horaire est déjà occupé.";
      }

      await Swal.fire({
        icon: "error",
        title: "Erreur de sauvegarde",
        text: errorMessage,
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===========================
  // FONCTIONS UTILITAIRES
  // ===========================
  const formatTime = (time) => {
    if (!time) return "";
    return time.substring(0, 5);
  };

  // Récupérer le nom du jour sélectionné
  const getSelectedDayName = () => {
    const jour = jours.find(j => j.id === selectedDay);
    return jour?.libelle || 'Jour sélectionné';
  };


  // ===========================
  // COMPOSANT TABLE DES ACTIVITÉS EXISTANTES
  // ===========================
  const ActivitesExistantesTable = () => {
    if (!activitesExistantes || activitesExistantes.length === 0) {
      return (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
          color: "#64748b",
          textAlign: "center"
        }}>
          <FiClock size={48} style={{ marginBottom: "16px", color: "#d1d5db" }} />
          <Text size="lg" weight="semibold" style={{ marginBottom: "8px", color: "#374151" }}>
            Aucune activité programmée
          </Text>
          <Text style={{ color: "#6b7280" }}>
            Le {getSelectedDayName().toLowerCase()} est libre pour cette classe
          </Text>
        </div>
      );
    }

    return (
      <Table
        autoHeight
        data={activitesExistantes}
        loading={loadingActivites}
        style={{ fontSize: "13px" }}
        headerHeight={40}
        rowHeight={50}
      >
        <Table.Column width={100} align="center">
          <Table.HeaderCell style={{ background: "#f8fafc", fontWeight: "600", color: "#374151" }}>
            <FiClock style={{ marginRight: "4px" }} />
            Début
          </Table.HeaderCell>
          <Table.Cell>
            {(rowData) => (
              <Badge
                color="blue"
                style={{
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  fontWeight: "500"
                }}
              >
                {formatTime(rowData.heureDeb)}
              </Badge>
            )}
          </Table.Cell>
        </Table.Column>

        <Table.Column width={100} align="center">
          <Table.HeaderCell style={{ background: "#f8fafc", fontWeight: "600", color: "#374151" }}>
            Fin
          </Table.HeaderCell>
          <Table.Cell>
            {(rowData) => (
              <Badge
                color="orange"
                style={{
                  background: "#fed7aa",
                  color: "#c2410c",
                  fontWeight: "500"
                }}
              >
                {formatTime(rowData.heureFin)}
              </Badge>
            )}
          </Table.Cell>
        </Table.Column>

        <Table.Column flexGrow={1}>
          <Table.HeaderCell style={{ background: "#f8fafc", fontWeight: "600", color: "#374151" }}>
            <FiBook style={{ marginRight: "4px" }} />
            Matière
          </Table.HeaderCell>
          <Table.Cell>
            {(rowData) => (
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#10b981"
                }}></div>
                <Text weight="semibold" style={{ color: "#374151" }}>
                  {rowData.matiere?.libelle || 'Non définie'}
                </Text>
              </div>
            )}
          </Table.Cell>
        </Table.Column>

        <Table.Column width={120}>
          <Table.HeaderCell style={{ background: "#f8fafc", fontWeight: "600", color: "#374151" }}>
            <FiMapPin style={{ marginRight: "4px" }} />
            Salle
          </Table.HeaderCell>
          <Table.Cell>
            {(rowData) => (
              <Text style={{ color: "#6b7280" }}>
                {rowData.salle?.libelle || 'Non définie'}
              </Text>
            )}
          </Table.Cell>
        </Table.Column>

        <Table.Column width={100}>
          <Table.HeaderCell style={{ background: "#f8fafc", fontWeight: "600", color: "#374151" }}>
            Type
          </Table.HeaderCell>
          <Table.Cell>
            {(rowData) => (
              <Badge style={{
                background: "#f0f9ff",
                color: "#1e40af",
                border: "1px solid #bfdbfe",
                fontSize: "11px"
              }}>
                {rowData.typeActivite?.libelle || 'Non défini'}
              </Badge>
            )}
          </Table.Cell>
        </Table.Column>
      </Table>
    );
  };


  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size='lg'
      backdrop="static"
      style={{ borderRadius: "16px", overflow: "hidden" }}
    >
      {/* Header */}
      <Modal.Header
        style={{
          background: "#ffffff",
          borderBottom: "1px solid #f1f5f9",
          padding: "24px",
          borderRadius: "16px 16px 0 0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Avatar
            size="lg"
            style={{
              background: type === "create" ? "#10b981" : "#6366f1",
              color: "white",
              fontWeight: "600",
              fontSize: "18px",
            }}
          >
            {type === "create" ? <FiPlus /> : <FiClock />}
          </Avatar>
          <div style={{ flex: 1 }}>
            <Text size="lg" weight="semibold" style={{ color: "#0f172a", marginBottom: "4px" }}>
              {type === "create" ? "Créer une nouvelle activité" : "Modifier une activité"}
            </Text>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <Badge
                style={{
                  background: "#f1f5f9",
                  color: "#475569",
                  fontWeight: "500",
                  border: "1px solid #e2e8f0",
                }}
              >
                EMPLOI DU TEMPS
              </Badge>
              {selectedClasse && (
                <Badge
                  style={{
                    background: "#dbeafe",
                    color: "#1d4ed8",
                    fontWeight: "500",
                    border: "1px solid #bfdbfe",
                  }}
                >
                  <FiUsers style={{ marginRight: "4px" }} />
                  {selectedClasse.libelle}
                </Badge>
              )}
              {selectedDay && (
                <Badge
                  style={{
                    background: "#dcfce7",
                    color: "#166534",
                    fontWeight: "500",
                    border: "1px solid #bbf7d0",
                  }}
                >
                  <FiCalendar style={{ marginRight: "4px" }} />
                  {getSelectedDayName()}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body
        style={{
          padding: "32px 24px",
          background: "#fafafa",
          maxHeight: "80vh",
          overflowY: "auto",
        }}
      >
        <Grid fluid>
          <Row gutter={24}>
            {/* Formulaire principal */}
            <Col lg={10} xs={24}>
              <Panel
                header={
                  <Text size="md" weight="semibold" style={{ color: "#1e293b" }}>
                    <FiBook style={{ marginRight: "8px" }} />
                    Détails de l'activité
                  </Text>
                }
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                  marginBottom: "24px",
                }}
                bodyStyle={{ padding: "20px" }}
              >
                <Form fluid>
                  <Grid fluid>
                    <Row gutter={16}>
                      <Col xs={24}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Classe <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <SelectPicker
                            data={classesOptions}
                            value={formData.classeId}
                            onChange={(value) => handleFieldChange('classeId', value)}
                            placeholder="Sélectionner la classe"
                            cleanable={false}
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={24}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Jour <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <SelectPicker
                            data={joursOptions}
                            value={formData.jourId}
                            onChange={(value) => handleFieldChange('jourId', value)}
                            placeholder="Sélectionner le jour"
                            cleanable={false}
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Heure début <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <Input
                            type="time"
                            value={formData.heureDeb}
                            onChange={(value) => handleFieldChange('heureDeb', value)}
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={12}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Heure fin <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <Input
                            type="time"
                            value={formData.heureFin}
                            onChange={(value) => handleFieldChange('heureFin', value)}
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Statut de vérification */}
                    <VerificationStatus
                      formData={formData}
                      verification={verfication}
                      validateTimeRange={validateTimeRange}
                      successMessage="Plage horaire disponible"
                    />

                    <Row gutter={16}>
                      <Col xs={24}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Matière <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <SelectPicker
                            data={matieresOptions}
                            value={formData.matiereId}
                            onChange={(value) => handleFieldChange('matiereId', value)}
                            placeholder="Sélectionner la matière"
                            cleanable={false}
                            disabled={isSubmitting || !formData.classeId}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={24}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Type d'activité <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <SelectPicker
                            data={typesActiviteOptions}
                            value={formData.typeActiviteId}
                            onChange={(value) => handleFieldChange('typeActiviteId', value)}
                            placeholder="Sélectionner le type d'activité"
                            cleanable={false}
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col xs={24}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Salle disponible <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <SelectPicker
                            data={sallesOptions}
                            value={formData.salleId}
                            onChange={(value) => handleFieldChange('salleId', value)}
                            placeholder={
                              verfication.loading
                                ? "Vérification en cours..."
                                : verfication.creneauDisponible
                                  ? "Sélectionner la salle"
                                  : "Vérifiez d'abord la disponibilité du créneau"
                            }
                            cleanable={false}
                            disabled={isSubmitting || !verfication.creneauDisponible || verfication.loading}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </Grid>
                </Form>
              </Panel>
            </Col>

            {/* Emploi du temps défini - AFFICHÉ POUR CRÉATION ET MODIFICATION */}
            <Col lg={14} xs={24}>
              <Panel
                header={
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <Text size="md" weight="semibold" style={{ color: "#1e293b" }}>
                      <FiClock style={{ marginRight: "8px" }} />
                      Planning du {getSelectedDayName()}
                    </Text>
                    <Badge style={{
                      background: activitesExistantes?.length > 0 ? "#dcfce7" : "#f3f4f6",
                      color: activitesExistantes?.length > 0 ? "#166534" : "#6b7280",
                      fontWeight: "500"
                    }}>
                      {activitesExistantes?.length || 0} activité{(activitesExistantes?.length || 0) > 1 ? 's' : ''}
                    </Badge>
                  </div>
                }
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
                  height: "500px",
                }}
                bodyStyle={{
                  padding: "0",
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                {loadingActivites ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    gap: 10
                  }}>
                    <Loader size="sm" />
                    <Text style={{ color: '#64748b' }}>Chargement...</Text>
                  </div>
                ) : (
                  <ActivitesExistantesTable />
                )}
              </Panel>
            </Col>
          </Row>
        </Grid>
      </Modal.Body>

      <Modal.Footer
        style={{
          padding: "20px 24px",
          borderTop: "1px solid #f1f5f9",
          background: "white",
          borderRadius: "0 0 16px 16px",
        }}
      >
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <Button
            appearance="subtle"
            onClick={onClose}
            disabled={isSubmitting}
            startIcon={<FiX />}
            style={{
              color: "#64748b",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 16px",
            }}
          >
            Fermer
          </Button>
          <Button
            appearance="primary"
            onClick={handleSave}
            loading={isSubmitting}
            disabled={!isFormValid() || isSubmitting}
            startIcon={<FiSave />}
            style={{
              background: isSubmitting
                ? "#94a3b8"
                : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 20px",
              fontWeight: "600",
            }}
          >
            {isSubmitting
              ? type === "create"
                ? "Création..."
                : "Modification..."
              : type === "create"
                ? "Enregistrer"
                : "Modifier"}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default EmploiDuTempsModal;