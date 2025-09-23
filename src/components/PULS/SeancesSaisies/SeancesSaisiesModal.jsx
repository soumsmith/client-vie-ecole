import React, { useState, useEffect, useCallback, useRef } from "react";
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
  Checkbox,
  InputNumber,
  DatePicker,
  Loader
} from "rsuite";
import {
  FiClock,
  FiBook,
  FiCalendar,
  FiSave,
  FiPlus,
  FiUser,
  FiMapPin,
  FiCheckSquare,
  FiCheck,
  FiX,
  FiAlertTriangle
} from "react-icons/fi";
import Swal from "sweetalert2";
import {
  useClassesData,
  useJoursData,
  useTypesActiviteData,
  useMatieresByClasse,
  useProfesseursByClasse,
  useSurveillantsData,
  saveSeance,
  checkCreneauDisponibiliteSeance,
} from "./SeancesSaisiesServiceManager";
import { usePulsParams } from "../../hooks/useDynamicParams";

const SeancesSaisiesModal = ({ modalState, onClose, onSave }) => {
  const { isOpen, type, selectedQuestion: seance } = modalState;
  const { ecoleId: dynamicEcoleId, academicYearId: dynamicAcademicYearId } = usePulsParams();

  const [formData, setFormData] = useState({
    classeId: null,
    dateSeance: new Date(),
    jourId: null,
    heureDeb: "",
    heureFin: "",
    matiereId: null,
    professeurId: null,
    surveillantId: null,
    salleId: null,
    typeActiviteId: null,
    duree: "00:15", // Format heure par défaut
    periode: null,
    noteeSur: 0,
    generateEvaluation: true // Coché par défaut
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===========================
  // ÉTAT DE VÉRIFICATION
  // ===========================
  const [verification, setVerification] = useState({
    creneauDisponible: null,
    sallesDisponibles: [],
    loading: false,
    error: null
  });

  // Référence pour éviter les re-rendus constants
  const verificationTimerRef = useRef(null);

  // ===========================
  // HOOKS POUR LES DONNÉES
  // ===========================
  const { classes } = useClassesData();
  const { jours } = useJoursData();
  const { typesActivite } = useTypesActiviteData();
  const { matieres } = useMatieresByClasse(formData.classeId);
  const { professeurs } = useProfesseursByClasse(formData.classeId);
  const { surveillants } = useSurveillantsData();

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

  const professeursOptions = professeurs.map(prof => ({
    label: `${prof.personnel.prenom} ${prof.personnel.nom}`,
    value: prof.personnel.id
  }));

  const surveillantsOptions = surveillants.map(surveillant => ({
    label: `${surveillant.prenom} ${surveillant.nom}`,
    value: surveillant.id
  }));

  const sallesOptions = verification.sallesDisponibles.map(salle => ({
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

  // ===========================
  // FONCTIONS DE VALIDATION
  // ===========================
  const isFormValid = useCallback(() => {
    const requiredFields = ['classeId', 'dateSeance', 'heureDeb', 'heureFin', 'matiereId', 'typeActiviteId'];
    const hasAllFields = requiredFields.every(field => formData[field] !== null && formData[field] !== '');
    
    // Validation simple des heures
    let timeValid = true;
    if (formData.heureDeb && formData.heureFin) {
      const [debutH, debutM] = formData.heureDeb.split(':').map(Number);
      const [finH, finM] = formData.heureFin.split(':').map(Number);
      const debutMinutes = debutH * 60 + debutM;
      const finMinutes = finH * 60 + finM;
      timeValid = finMinutes > debutMinutes && (finMinutes - debutMinutes) >= 15;
    }
    
    return hasAllFields && timeValid && verification.creneauDisponible;
  }, [formData, verification.creneauDisponible]);

  // ===========================
  // VÉRIFICATION DE DISPONIBILITÉ
  // ===========================
  const verifierDisponibilite = useCallback(async (classeId = null, jourId = null, heureDeb = null, heureFin = null) => {
    // Utiliser les paramètres fournis ou ceux du formData
    const classe = classeId || formData.classeId;
    const jour = jourId || formData.jourId;
    const debut = heureDeb || formData.heureDeb;
    const fin = heureFin || formData.heureFin;

    console.log('=== DÉBUT VÉRIFICATION DISPONIBILITÉ ===');
    console.log('classeId:', classe);
    console.log('jourId:', jour);
    console.log('heureDeb:', debut);
    console.log('heureFin:', fin);

    // Reset de l'état de vérification
    setVerification(prev => ({
      ...prev,
      creneauDisponible: null,
      sallesDisponibles: [],
      error: null
    }));

    // Vérification des prérequis
    if (!classe || !jour || !debut || !fin) {
      console.log('Champs manquants pour la vérification');
      return;
    }

    // Validation des heures
    const [debutH, debutM] = debut.split(':').map(Number);
    const [finH, finM] = fin.split(':').map(Number);
    
    const debutMinutes = debutH * 60 + debutM;
    const finMinutes = finH * 60 + finM;

    if (finMinutes <= debutMinutes) {
      console.log('Validation des heures échouée: heure de fin <= heure de début');
      setVerification(prev => ({
        ...prev,
        creneauDisponible: false,
        error: "L'heure de fin doit être supérieure à l'heure de début"
      }));
      return;
    }

    if (finMinutes - debutMinutes < 15) {
      console.log('Validation des heures échouée: durée < 15 minutes');
      setVerification(prev => ({
        ...prev,
        creneauDisponible: false,
        error: "Il doit y avoir au moins 15 minutes entre le début et la fin"
      }));
      return;
    }

    setVerification(prev => ({ ...prev, loading: true }));
    console.log('Début de la vérification API...');

    try {
      // Vérifier la disponibilité du créneau
      const disponible = await checkCreneauDisponibiliteSeance(
        dynamicAcademicYearId,
        classe,
        jour,
        debut,
        fin
      );

      console.log('Résultat disponibilité:', disponible);

      if (disponible) {
        // Si disponible, récupérer les salles
        console.log('Récupération des salles disponibles...');
        const salles = await getSallesDisponibles(
          dynamicAcademicYearId,
          classe,
          jour,
          debut,
          fin
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
          error: "Ce créneau n'est pas disponible"
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
    
    console.log('=== FIN VÉRIFICATION DISPONIBILITÉ ===');
  }, [dynamicAcademicYearId, formData.classeId, formData.jourId, formData.heureDeb, formData.heureFin]);

  // ===========================
  // GESTION DES CHANGEMENTS
  // ===========================
  const handleFieldChange = useCallback((field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Reset des champs dépendants
      if (field === 'classeId') {
        newData.matiereId = null;
        newData.professeurId = null;
        newData.salleId = null;
      }
      
      // Reset de la salle si les paramètres de vérification changent
      if (['classeId', 'jourId', 'heureDeb', 'heureFin'].includes(field)) {
        newData.salleId = null;
      }

      // Calculer automatiquement le jour en fonction de la date
      if (field === 'dateSeance' && value) {
        const jourIndex = value.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
        const jourMapping = {
          0: 7, // Dimanche
          1: 1, // Lundi
          2: 2, // Mardi
          3: 3, // Mercredi
          4: 4, // Jeudi
          5: 5, // Vendredi
          6: 6  // Samedi
        };
        newData.jourId = jourMapping[jourIndex];
      }

      return newData;
    });
  }, []);

  // ===========================
  // VÉRIFICATION TYPE ACTIVITÉ POUR ÉVALUATION
  // ===========================
  const shouldShowEvaluationOption = useCallback(() => {
    const selectedType = typesActivite.find(type => type.id === formData.typeActiviteId);
    // Afficher l'option d'évaluation pour "Devoir" ou "Évaluation"
    return selectedType && (selectedType.libelle === 'Devoir' || selectedType.libelle === 'Évaluation');
  }, [formData.typeActiviteId, typesActivite]);

  // ===========================
  // EFFECTS
  // ===========================
  
  // Initialisation du formulaire
  useEffect(() => {
    if (type === "edit" && seance && isOpen) {
      console.log('=== INITIALISATION EDIT ===');
      console.log('Seance data:', seance);
      console.log('Date brute:', seance.dateSeance);
      
      // Fonction helper pour nettoyer les dates
      const cleanDateString = (dateStr) => {
        if (!dateStr) return null;
        if (typeof dateStr === 'string' && dateStr.includes('[UTC]')) {
          return dateStr.replace('[UTC]', '');
        }
        return dateStr;
      };
      
      // Conversion de la date string en objet Date
      let dateSeanceObj = new Date();
      if (seance.dateSeance) {
        const cleanedDateString = cleanDateString(seance.dateSeance);
        dateSeanceObj = new Date(cleanedDateString);
        console.log('Date nettoyée:', cleanedDateString);
        console.log('Date convertie:', dateSeanceObj);
        console.log('Date valide?', !isNaN(dateSeanceObj.getTime()));
      }

      // Conversion de la durée si nécessaire
      let dureeFormatted = "00:15";
      if (seance.duree && typeof seance.duree === 'number' && seance.duree > 0) {
        const heures = Math.floor(seance.duree / 60);
        const minutes = seance.duree % 60;
        dureeFormatted = `${heures.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }

      setFormData({
        classeId: seance.classeId,
        dateSeance: dateSeanceObj,
        jourId: seance.jourId,
        heureDeb: seance.heureDeb || "",
        heureFin: seance.heureFin || "",
        matiereId: seance.matiereId,
        professeurId: seance.professeurId,
        surveillantId: seance.surveillantId,
        salleId: seance.salleId,
        typeActiviteId: seance.typeActiviteId,
        duree: dureeFormatted,
        periode: seance.periode || null,
        noteeSur: seance.noteeSur || 0,
        generateEvaluation: seance.evaluationIndicator === 1
      });
      
      console.log('=== FIN INITIALISATION EDIT ===');
    } else if (type === "create") {
      console.log('=== INITIALISATION CREATE ===');
      setFormData({
        classeId: null,
        dateSeance: new Date(),
        jourId: null,
        heureDeb: "",
        heureFin: "",
        matiereId: null,
        professeurId: null,
        surveillantId: null,
        salleId: null,
        typeActiviteId: null,
        duree: "00:15", // Format heure par défaut
        periode: null,
        noteeSur: 0,
        generateEvaluation: true // Coché par défaut
      });
      setVerification({
        creneauDisponible: null,
        sallesDisponibles: [],
        loading: false,
        error: null
      });
      console.log('=== FIN INITIALISATION CREATE ===');
    }
  }, [type, seance, isOpen]);

  // Vérification automatique quand les paramètres changent
  useEffect(() => {
    const { classeId, jourId, heureDeb, heureFin } = formData;
    
    console.log('=== EFFECT VÉRIFICATION DÉCLENCHÉE ===');
    console.log('classeId:', classeId);
    console.log('jourId:', jourId);
    console.log('heureDeb:', heureDeb);
    console.log('heureFin:', heureFin);
    
    // Nettoyer le timer précédent
    if (verificationTimerRef.current) {
      clearTimeout(verificationTimerRef.current);
    }
    
    // Fonction de vérification locale
    const effectuerVerification = async () => {
      console.log('=== DÉBUT VÉRIFICATION (EFFECT) ===');
      
      // Reset de l'état de vérification
      setVerification(prev => ({
        ...prev,
        creneauDisponible: null,
        sallesDisponibles: [],
        error: null
      }));

      // Validation des heures
      const [debutH, debutM] = heureDeb.split(':').map(Number);
      const [finH, finM] = heureFin.split(':').map(Number);
      
      const debutMinutes = debutH * 60 + debutM;
      const finMinutes = finH * 60 + finM;

      if (finMinutes <= debutMinutes) {
        setVerification({
          creneauDisponible: false,
          sallesDisponibles: [],
          loading: false,
          error: "L'heure de fin doit être supérieure à l'heure de début"
        });
        return;
      }

      if (finMinutes - debutMinutes < 15) {
        setVerification({
          creneauDisponible: false,
          sallesDisponibles: [],
          loading: false,
          error: "Il doit y avoir au moins 15 minutes entre le début et la fin"
        });
        return;
      }

      setVerification(prev => ({ ...prev, loading: true }));
      
      try {
        // Utiliser la nouvelle API qui retourne directement les salles
        const result = await checkCreneauDisponibiliteSeance(
          dynamicAcademicYearId,
          classeId,
          jourId,
          heureDeb,
          heureFin,
          formData.dateSeance
        );

        console.log('Résultat de la vérification:', result);

        if (result.disponible) {
          setVerification({
            creneauDisponible: true,
            sallesDisponibles: result.salles,
            loading: false,
            error: null
          });
        } else {
          setVerification({
            creneauDisponible: false,
            sallesDisponibles: [],
            loading: false,
            error: "Ce créneau n'est pas disponible"
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
      
      console.log('=== FIN VÉRIFICATION (EFFECT) ===');
    };
    
    // Vérifier si tous les champs requis sont remplis
    if (classeId && jourId && heureDeb && heureFin) {
      console.log('Tous les champs remplis, démarrage du timer...');
      verificationTimerRef.current = setTimeout(() => {
        console.log('Timer expiré, lancement de la vérification');
        effectuerVerification();
      }, 500);
    } else {
      console.log('Champs manquants, reset de la vérification');
      setVerification({
        creneauDisponible: null,
        sallesDisponibles: [],
        loading: false,
        error: null
      });
    }

    // Nettoyage au démontage
    return () => {
      if (verificationTimerRef.current) {
        console.log('Nettoyage du timer');
        clearTimeout(verificationTimerRef.current);
      }
    };
  }, [formData.classeId, formData.jourId, formData.heureDeb, formData.heureFin, formData.dateSeance, dynamicAcademicYearId]);

  // ===========================
  // SAUVEGARDE
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
      title: type === "create" ? "Créer la séance" : "Modifier la séance",
      text: `Confirmer ${type === "create" ? "la création de" : "la modification de"} cette séance ?`,
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
      const professeur = professeurs.find(p => p.personnel.id === formData.professeurId)?.personnel;
      const surveillant = surveillants.find(s => s.id === formData.surveillantId);
      const salle = verification.sallesDisponibles.find(s => s.id === formData.salleId);
      const typeActivite = typesActivite.find(t => t.id === formData.typeActiviteId);

      // Conversion de la durée du format time vers le format API
      const convertDureeToApiFormat = (timeValue) => {
        if (!timeValue) return "00-15";
        const [hours, minutes] = timeValue.split(':').map(Number);
        const totalMinutes = (hours * 60) + minutes;
        return `00-${totalMinutes.toString().padStart(2, '0')}`;
      };

      const seanceData = {
        dateSeance: formData.dateSeance.toISOString(),
        jour: { id: jour?.id, libelle: null },
        heureDeb: formData.heureDeb,
        heureFin: formData.heureFin,
        matiere: { id: matiere?.id, libelle: null },
        classe: { id: classe?.id, libelle: null },
        professeur: professeur ? { id: professeur.id } : null,
        surveillant: surveillant ? { id: surveillant.id } : null,
        salle: salle ? { id: salle.id, libelle: null } : null,
        typeActivite: { id: typeActivite?.id, libelle: null },
        evaluationIndicator: formData.generateEvaluation ? 1 : 0,
        evaluation: formData.generateEvaluation ? {
          id: null,
          periode: { id: formData.periode || 1 },
          noteSur: formData.noteeSur || 20,
          duree: convertDureeToApiFormat(formData.duree)
        } : {
          id: 0,
          periode: { id: 0 },
          noteSur: "",
          duree: ""
        },
        statut: "MAN",
        annee: dynamicAcademicYearId.toString(),
        user: "361",
        profPrincipal: null
      };

      if (type === "edit" && seance?.id) {
        seanceData.id = seance.id;
      }

      const response = await saveSeance(seanceData);

      await Swal.fire({
        icon: "success",
        title: `Séance ${type === "create" ? "créée" : "modifiée"} !`,
        text: `La séance a été ${type === "create" ? "créée" : "modifiée"} avec succès.`,
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
        errorMessage = "Conflit de données détecté.";
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
  // COMPOSANT DE STATUT DE VÉRIFICATION
  // ===========================
  const VerificationStatus = () => {
    if (!formData.heureDeb || !formData.heureFin) return null;

    // Validation simple des heures pour l'affichage
    let timeValid = true;
    let timeMessage = '';
    
    if (formData.heureDeb && formData.heureFin) {
      const [debutH, debutM] = formData.heureDeb.split(':').map(Number);
      const [finH, finM] = formData.heureFin.split(':').map(Number);
      const debutMinutes = debutH * 60 + debutM;
      const finMinutes = finH * 60 + finM;
      
      if (finMinutes <= debutMinutes) {
        timeValid = false;
        timeMessage = "L'heure de fin doit être supérieure à l'heure de début";
      } else if (finMinutes - debutMinutes < 15) {
        timeValid = false;
        timeMessage = "Il doit y avoir au moins 15 minutes entre le début et la fin";
      }
    }

    if (!timeValid) {
      return (
        <Message type="warning" showIcon style={{ marginBottom: 16 }}>
          <FiAlertTriangle style={{ marginRight: 8 }} />
          {timeMessage}
        </Message>
      );
    }

    if (verification.loading) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: 12,
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 8,
          marginBottom: 16
        }}>
          <Loader size="xs" />
          <Text style={{ color: '#0369a1' }}>Vérification de la disponibilité...</Text>
        </div>
      );
    }

    if (verification.error) {
      return (
        <Message type="error" showIcon style={{ marginBottom: 16, marginTop: 16 }}>
          <FiAlertTriangle style={{ marginRight: 8 }} />
          {verification.error}
        </Message>
      );
    }

    if (verification.creneauDisponible === true) {
      return (
        <Message type="success" showIcon style={{ marginBottom: 16, marginTop: 16 }}>
          <FiCheck style={{ marginRight: 8 }} />
          Créneau disponible • {verification.sallesDisponibles.length} salle(s) disponible(s)
        </Message>
      );
    }

    if (verification.creneauDisponible === false) {
      return (
        <Message type="error" showIcon style={{ marginBottom: 16, marginTop: 16 }}>
          <FiX style={{ marginRight: 8 }} />
          Créneau indisponible
        </Message>
      );
    }

    return null;
  };

  // ===========================
  // RENDU DU COMPOSANT
  // ===========================

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      size="lg"
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
              {type === "create" ? "Créer une nouvelle séance" : "Modifier une séance"}
            </Text>
            <Badge
              style={{
                background: "#f1f5f9",
                color: "#475569",
                fontWeight: "500",
                border: "1px solid #e2e8f0",
              }}
            >
              SÉANCES SAISIES
            </Badge>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FiCalendar size={20} style={{ color: "#6366f1" }} />
            <Text size="md" weight="semibold" style={{ color: "#1e293b" }}>
              Saisie
            </Text>
          </div>
        </div>
      </Modal.Header>

      <Modal.Body
        style={{
          padding: "32px 24px",
          background: "#fafafa",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <Grid fluid>
          <Row>
            <Col xs={24}>
              <Panel
                header={
                  <Text size="md" weight="semibold" style={{ color: "#1e293b" }}>
                    <FiBook style={{ marginRight: "8px" }} />
                    Détails de la séance
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
                      <Col xs={8}>
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
                      <Col xs={8}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Date <span style={{ color: "#ef4444" }}>*</span>
                          </Form.ControlLabel>
                          <DatePicker
                            value={formData.dateSeance}
                            onChange={(value) => handleFieldChange('dateSeance', value)}
                            placeholder="Sélectionner la date"
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                            format="dd/MM/yyyy"
                            character="-"
                            showMeridian={false}
                            oneTap
                            cleanable={false}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={8}>
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
                    </Row>

                    {/* Statut de vérification */}
                    <VerificationStatus />

                    <Row gutter={16}>
                      <Col xs={8}>
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
                      <Col xs={8}>
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
                      <Col xs={8}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Salle disponible
                          </Form.ControlLabel>
                          <SelectPicker
                            data={sallesOptions}
                            value={formData.salleId}
                            onChange={(value) => handleFieldChange('salleId', value)}
                            placeholder={
                              verification.loading
                                ? "Vérification en cours..."
                                : verification.creneauDisponible
                                ? "Sélectionner la salle"
                                : "Vérifiez d'abord la disponibilité du créneau"
                            }
                            cleanable={false}
                            disabled={isSubmitting || !verification.creneauDisponible || verification.loading}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col xs={8}>
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
                      <Col xs={8}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Professeur
                          </Form.ControlLabel>
                          <SelectPicker
                            data={professeursOptions}
                            value={formData.professeurId}
                            onChange={(value) => handleFieldChange('professeurId', value)}
                            placeholder="Sélectionner le professeur"
                            cleanable={true}
                            disabled={isSubmitting || !formData.classeId}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                      <Col xs={8}>
                        <Form.Group>
                          <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                            Surveillant
                          </Form.ControlLabel>
                          <SelectPicker
                            data={surveillantsOptions}
                            value={formData.surveillantId}
                            onChange={(value) => handleFieldChange('surveillantId', value)}
                            placeholder="Sélectionner le surveillant"
                            cleanable={true}
                            disabled={isSubmitting}
                            style={{ width: "100%" }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Option d'évaluation conditionnelle */}
                    {shouldShowEvaluationOption() && (
                      <>
                        <Row>
                          <Col xs={24}>
                            <Form.Group>
                              <Checkbox
                                checked={formData.generateEvaluation}
                                onChange={(value, checked) => handleFieldChange('generateEvaluation', checked)}
                                disabled={isSubmitting}
                              >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FiCheckSquare style={{ color: '#10b981' }} />
                                  <Text weight="semibold" style={{ color: '#374151' }}>
                                    Générer automatiquement l'évaluation associée
                                  </Text>
                                </div>
                              </Checkbox>
                            </Form.Group>
                          </Col>
                        </Row>

                        {formData.generateEvaluation && (
                          <Row gutter={16}>
                            <Col xs={8}>
                              <Form.Group>
                                <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                                  Période
                                </Form.ControlLabel>
                                <SelectPicker
                                  data={[
                                    { label: 'Période 1', value: 1 },
                                    { label: 'Période 2', value: 2 },
                                    { label: 'Période 3', value: 3 }
                                  ]}
                                  value={formData.periode}
                                  onChange={(value) => handleFieldChange('periode', value)}
                                  placeholder="Sélectionner la période"
                                  disabled={isSubmitting}
                                  style={{ width: "100%" }}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={8}>
                              <Form.Group>
                                <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                                  Noté sur
                                </Form.ControlLabel>
                                <InputNumber
                                  value={formData.noteeSur}
                                  onChange={(value) => handleFieldChange('noteeSur', value)}
                                  min={0}
                                  max={100}
                                  disabled={isSubmitting}
                                  style={{ width: "100%" }}
                                />
                              </Form.Group>
                            </Col>
                            <Col xs={8}>
                              <Form.Group>
                                <Form.ControlLabel style={{ fontWeight: "500", color: "#374151" }}>
                                  Durée
                                </Form.ControlLabel>
                                <Input
                                  type="time"
                                  value={formData.duree}
                                  onChange={(value) => handleFieldChange('duree', value)}
                                  disabled={isSubmitting}
                                  style={{ width: "100%" }}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        )}
                      </>
                    )}
                  </Grid>
                </Form>
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

export default SeancesSaisiesModal;