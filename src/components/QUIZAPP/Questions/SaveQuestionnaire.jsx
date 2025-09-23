import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Panel,
  Grid,
  Row,
  Col,
  Toggle,
  Notification,
  toaster,
  Button,
  Progress,
  Message,
} from "rsuite";
import DocPassIcon from "@rsuite/icons/DocPass";
import CheckIcon from "@rsuite/icons/Check";
import PlusIcon from "@rsuite/icons/Plus";
import TrashIcon from "@rsuite/icons/Trash";
import { FiFileText, FiImage, FiLink, FiSave, FiEdit, FiPlus } from "react-icons/fi";
import SelectPicker from "rsuite/SelectPicker";
import usePostData from "../../hooks/usePostData";
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

// Import des utilitaires externalisés
import { useFormUtils, initialReferenceData } from '../utils/formUtils';
import { loadAllReferenceData, loadSubDomains } from '../../services/referenceDataService';
import { validateQuestionForm } from '../utils/questionUtils';

const SaveQuestionnaire = () => {
  // ===========================
  // CONFIGURATION & CONSTANTES
  // ===========================
  const MySwal = withReactContent(Swal);
  const { postData, loadingPost, errorPost } = usePostData("questions_api.php", "multipart-form-data");
  const { questionId } = useParams();
  const navigate = useNavigate();

  // Déterminer le mode (création ou modification)
  const isEditMode = Boolean(questionId);

  // ===========================
  // DONNÉES DE RÉFÉRENCE
  // ===========================
  const [referenceData, setReferenceData] = useState(initialReferenceData);

  // ===========================
  // ÉTATS DE CHARGEMENT ET ERREURS
  // ===========================
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // ===========================
  // ÉTATS DU FORMULAIRE PRINCIPAL
  // ===========================
  const initialFormData = {
    content: "",
    explanation: "",
    domain_id: null,
    sub_domain_id: null,
    type_id: null,
    language_id: null,
    country_id: null,
    difficulty_level: null,
    points: 1,
    time_limit: null,
    tags: "",
    active: 1,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [originalQuestionData, setOriginalQuestionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ===========================
  // ÉTATS SPÉCIFIQUES À LA QUESTION
  // ===========================
  const [answers, setAnswers] = useState([
    { content: "", is_correct: false, explanation: "" },
    { content: "", is_correct: false, explanation: "" },
  ]);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [mediaPreview, setMediaPreview] = useState([]);

  const [sources, setSources] = useState([
    { title: "", author: "", url: "", description: "" },
  ]);

  // ===========================
  // HOOKS PERSONNALISÉS
  // ===========================
  const {
    updateFormField,
    resetForm
  } = useFormUtils(initialFormData, setFormData);

  // ===========================
  // FONCTION DE CHARGEMENT DES DONNÉES D'UNE QUESTION
  // ===========================
  const loadQuestionData = async (id) => {
    if (!id) return;
    
    setIsLoadingQuestion(true);
    setLoadError(null);

    try {
      console.log("🔍 Chargement de la question avec ID:", id);
      
      const response = await fetch('http://localhost/CRUDPHP/api/questions_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_question',
          question_id: id
        })
      });

      console.log("📡 Statut de la réponse:", response.status, response.statusText);

      // Vérifier le statut HTTP
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      // Récupérer le texte brut d'abord pour debug
      const responseText = await response.text();
      console.log("📄 Réponse brute de l'API:", responseText);

      // Vérifier si c'est du JSON valide
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("❌ Erreur de parsing JSON:", parseError);
        throw new Error(`Réponse invalide de l'API: ${responseText.substring(0, 200)}...`);
      }

      console.log("✅ Données parsées:", result);

      // *** TRAITEMENT SPÉCIAL POUR TON CAS ***
      // Si l'API retourne success: false mais avec des données de debug utilisables
      if (result.success === false && result.debug && result.debug.simple_query_result && result.debug.simple_query_result.length > 0) {
        console.log("⚠️ API retourne success: false mais données trouvées dans debug");
        const question = result.debug.simple_query_result[0];
        
        // Utiliser les données du debug
        const processedData = {
          question: question,
          answers: [], // Aucune réponse dans le debug, on les chargera séparément si besoin
          sources: [], // Aucune source dans le debug
          media: [] // Aucun média dans le debug
        };

        console.log("📋 Question trouvée dans debug:", question);
        await processQuestionData(processedData);
        return;
      }

      // Traitement normal si success: true
      if (result.success && result.data) {
        console.log("✅ Traitement normal - success: true");
        await processQuestionData(result.data);
        return;
      }

      // Si aucune des conditions ci-dessus n'est remplie
      throw new Error(result.error || result.message || 'Aucune donnée de question trouvée');

    } catch (error) {
      console.error('❌ Erreur lors du chargement de la question:', error);
      console.error('❌ Stack trace:', error.stack);
      
      setLoadError(error.message);
      
      MySwal.fire({
        title: 'Erreur',
        text: `Impossible de charger la question: ${error.message}`,
        icon: 'error',
        confirmButtonText: 'Retour'
      }).then(() => {
        navigate('/questions');
      });
      
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  // ===========================
  // FONCTION DE TRAITEMENT DES DONNÉES DE QUESTION
  // ===========================
  const processQuestionData = async (data) => {
    const { question, answers: questionAnswers = [], sources: questionSources = [], media = [] } = data;

    if (!question) {
      throw new Error('Données de question manquantes');
    }

    console.log("📋 Traitement de la question:", question);
    console.log("🔘 Réponses:", questionAnswers);
    console.log("📚 Sources:", questionSources);
    console.log("🖼️ Médias:", media);

    // Pré-remplir le formulaire principal
    setFormData({
      content: question.content || '',
      explanation: question.explanation || '',
      domain_id: question.domain_id || null,
      sub_domain_id: question.sub_domain_id || null,
      type_id: question.type_id || null,
      language_id: question.language_id || null,
      country_id: question.country_id || null,
      difficulty_level: question.difficulty_level || null,
      points: question.points || 1,
      time_limit: question.time_limit || null,
      tags: question.tags || '',
      active: question.active || 1,
    });

    // Pré-remplir les réponses avec gestion correcte des switches
    if (questionAnswers && questionAnswers.length > 0) {
      const processedAnswers = questionAnswers.map(answer => ({
        id: answer.id || null,
        content: answer.content || '',
        is_correct: Boolean(Number(answer.is_correct)), // Conversion explicite
        explanation: answer.explanation || ''
      }));
      
      console.log("🔘 Réponses traitées:", processedAnswers);
      setAnswers(processedAnswers);
    } else {
      // Charger les réponses séparément si elles ne sont pas dans les données principales
      console.log("🔍 Tentative de chargement des réponses séparément...");
      await loadQuestionAnswers(question.id);
    }

    // Pré-remplir les sources avec mappage correct des champs
    if (questionSources && questionSources.length > 0) {
      const processedSources = questionSources.map(source => ({
        id: source.source_id || source.id || null,
        title: source.source_title || source.title || '',
        author: source.source_author || source.author || '',
        url: source.source_url || source.url || '',
        description: source.source_description || source.description || ''
      }));
      
      console.log("📚 Sources traitées:", processedSources);
      setSources(processedSources);
    }

    // Pré-remplir les médias avec données complètes
    if (media && media.length > 0) {
      const processedMedia = media.map(mediaItem => {
        const mediaUrl = mediaItem.resource_file_url || mediaItem.media_url || mediaItem.file_path || mediaItem.url;
        const mediaType = mediaItem.resource_file_type || mediaItem.media_type || 'document';
        const fileName = mediaItem.resource_name || mediaItem.file_name || 'Fichier existant';
        
        return {
          id: mediaItem.id || null,
          media_resource_id: mediaItem.media_resource_id || null,
          url: mediaUrl,
          type: mediaType === 'image' ? 'image' : 'document',
          file: { 
            name: fileName,
            size: mediaItem.resource_file_size || null
          },
          isExisting: true // Marquer comme média existant
        };
      });
      
      console.log("🖼️ Médias traités:", processedMedia);
      setMediaPreview(processedMedia);
    }

    // Sauvegarder les données originales
    setOriginalQuestionData(data);

    // Charger les sous-domaines si un domaine est sélectionné
    if (question.domain_id) {
      try {
        await loadSubDomains(question.domain_id, setReferenceData);
      } catch (subDomainError) {
        console.error("⚠️ Erreur lors du chargement des sous-domaines:", subDomainError);
        // Ne pas bloquer le chargement principal pour cette erreur
      }
    }

    setIsInitialized(true);
    console.log("✅ Question chargée avec succès!");
  };

  // ===========================
  // FONCTION DE CHARGEMENT DES RÉPONSES SÉPARÉMENT
  // ===========================
  const loadQuestionAnswers = async (questionId) => {
    try {
      console.log("🔍 Chargement des réponses pour la question:", questionId);
      
      const response = await fetch('http://localhost/CRUDPHP/api/questions_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'get_question_answers',
          question_id: questionId
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data && result.data.length > 0) {
          setAnswers(result.data.map(answer => ({
            id: answer.id || null,
            content: answer.content || '',
            is_correct: Boolean(answer.is_correct),
            explanation: answer.explanation || ''
          })));
          console.log("✅ Réponses chargées:", result.data);
        }
      }
    } catch (error) {
      console.warn("⚠️ Impossible de charger les réponses séparément:", error);
      // On garde les réponses par défaut
    }
  };

  // ===========================
  // GESTION DES DONNÉES DE RÉFÉRENCE
  // ===========================
  const loadAllReferenceDataLocal = useCallback(async () => {
    try {
      await loadAllReferenceData(setReferenceData);
    } catch (error) {
      console.error("Erreur lors du chargement des données de référence:", error);
      setError("Erreur lors du chargement des données de référence");
    }
  }, []);

  const loadSubDomainsLocal = useCallback(async (domainId) => {
    try {
      await loadSubDomains(domainId, setReferenceData);
    } catch (error) {
      console.error("Erreur lors du chargement des sous-domaines:", error);
    }
  }, []);

  // ===========================
  // GESTION DES RÉPONSES
  // ===========================
  const handleAnswerChange = useCallback((index, field, value) => {
    const updatedAnswers = [...answers];
    updatedAnswers[index][field] = value;
    
    // Log pour déboguer les switches
    if (field === 'is_correct') {
      console.log(`🔘 Switch réponse ${index + 1}: ${value ? 'CORRECTE' : 'INCORRECTE'}`);
    }
    
    setAnswers(updatedAnswers);
  }, [answers]);

  const addAnswer = useCallback(() => {
    setAnswers(prev => [...prev, { content: "", is_correct: false, explanation: "" }]);
  }, []);

  const removeAnswer = useCallback((index) => {
    if (answers.length > 2) {
      setAnswers(prev => prev.filter((_, i) => i !== index));
    }
  }, [answers.length]);

  // ===========================
  // GESTION DES MÉDIAS
  // ===========================
  const handleMediaUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    setMediaFiles(prev => [...prev, ...files]);

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setMediaPreview(prev => [...prev, {
          file,
          url: e.target.result,
          type: file.type.startsWith('image/') ? 'image' : 'document',
          isExisting: false // Nouveau fichier
        }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeMedia = useCallback((index) => {
    const mediaToRemove = mediaPreview[index];
    
    // Si c'est un nouveau fichier (pas isExisting), on le retire aussi de mediaFiles
    if (!mediaToRemove.isExisting) {
      setMediaFiles(prev => prev.filter((_, i) => {
        // Trouver l'index correspondant dans mediaFiles
        let newFileIndex = 0;
        for (let j = 0; j <= index; j++) {
          if (!mediaPreview[j]?.isExisting) {
            if (j === index) break;
            newFileIndex++;
          }
        }
        return i !== newFileIndex;
      }));
    }
    
    setMediaPreview(prev => prev.filter((_, i) => i !== index));
  }, [mediaPreview]);

  // ===========================
  // GESTION DES SOURCES
  // ===========================
  const handleSourceChange = useCallback((index, field, value) => {
    const updatedSources = [...sources];
    updatedSources[index][field] = value;
    setSources(updatedSources);
  }, [sources]);

  const addSource = useCallback(() => {
    setSources(prev => [...prev, { title: "", author: "", url: "", description: "" }]);
  }, []);

  const removeSource = useCallback((index) => {
    if (sources.length > 1) {
      setSources(prev => prev.filter((_, i) => i !== index));
    }
  }, [sources.length]);

  // ===========================
  // GESTION DU CHANGEMENT DE DOMAINE
  // ===========================
  const handleDomainChange = useCallback(async (domainId) => {
    updateFormField('domain_id', domainId);
    updateFormField('sub_domain_id', null);

    if (domainId) {
      try {
        await loadSubDomains(domainId, setReferenceData);
      } catch (error) {
        console.error("Erreur lors du chargement des sous-domaines:", error);
      }
    }
  }, [updateFormField]);

  // ===========================
  // RÉINITIALISATION COMPLÈTE
  // ===========================
  const resetFormComplete = useCallback(() => {
    resetForm();
    setAnswers([
      { content: "", is_correct: false, explanation: "" },
      { content: "", is_correct: false, explanation: "" },
    ]);
    setMediaFiles([]);
    setMediaPreview([]);
    setSources([{ title: "", author: "", url: "", description: "" }]);
    setError(null);
    setOriginalQuestionData(null);
    setIsInitialized(false);
  }, [resetForm]);

  // ===========================
  // PRÉPARATION DES DONNÉES POUR SOUMISSION - FONCTION CORRIGÉE
  // ===========================
  const prepareSubmissionData = useCallback(() => {
    console.log("🔧 Préparation des données de soumission...");
    
    // Préparer les réponses en filtrant celles qui ont du contenu
    const validAnswers = answers
      .filter(answer => answer.content.trim() !== '')
      .map((answer, index) => ({
        content: answer.content.trim(),
        is_correct: answer.is_correct ? 1 : 0,
        explanation: answer.explanation || '',
        display_order: index + 1
      }));

    // Préparer les sources en filtrant celles qui ont au moins un titre
    const validSources = sources
      .filter(source => source.title.trim() !== '')
      .map((source, index) => ({
        title: source.title.trim(),
        author: source.author || '',
        url: source.url || '',
        description: source.description || '',
        display_order: index + 1
      }));

    // Séparer les médias existants des nouveaux
    const existingMedia = mediaPreview.filter(media => media.isExisting);
    const newMediaFiles = mediaFiles;

    // Préparer les données de base de la question
    const questionData = {
      content: formData.content.trim(),
      explanation: formData.explanation || '',
      domain_id: formData.domain_id,
      sub_domain_id: formData.sub_domain_id,
      type_id: formData.type_id,
      language_id: formData.language_id,
      country_id: formData.country_id,
      difficulty_level: formData.difficulty_level,
      points: parseInt(formData.points) || 1,
      time_limit: formData.time_limit ? parseInt(formData.time_limit) : null,
      tags: formData.tags || '',
      active: formData.active ? 1 : 0
    };

    // Créer l'objet final selon le mode
    const finalData = {
      action: isEditMode ? 'update_question' : 'create_question',
      question_data: JSON.stringify(questionData),
      answers_data: JSON.stringify(validAnswers),
      sources_data: JSON.stringify(validSources)
    };

    // Ajouter l'ID de question pour la modification
    if (isEditMode) {
      finalData.question_id = questionId;
    }

    // Ajouter les médias existants si applicable
    if (existingMedia.length > 0) {
      finalData.existing_media = JSON.stringify(existingMedia.map(media => ({
        id: media.id,
        media_resource_id: media.media_resource_id,
        media_url: media.url,
        media_type: media.type,
        display_order: mediaPreview.indexOf(media) + 1
      })));
    }

    console.log("📤 Données finales préparées:", finalData);
    console.log("📤 Fichiers médias:", newMediaFiles);
    
    return { data: finalData, files: newMediaFiles };
  }, [formData, answers, sources, mediaFiles, mediaPreview, isEditMode, questionId]);

  // ===========================
  // SOUMISSION DU FORMULAIRE - FONCTION CORRIGÉE
  // ===========================
  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    event.stopPropagation();

    // Validation
    const validationErrors = validateQuestionForm(formData, answers);
    if (validationErrors.length > 0) {
      MySwal.fire({
        title: 'Erreurs de validation',
        html: validationErrors.map(error => `<p>• ${error}</p>`).join(''),
        icon: 'error',
        confirmButtonText: 'OK'
      });
      return;
    }

    // Confirmation utilisateur
    const actionText = isEditMode ? 'modifier' : 'créer';
    const confirm = await MySwal.fire({
      title: `Confirmer la ${actionText === 'créer' ? 'création' : 'modification'} de la question ?`,
      text: `Voulez-vous ${actionText} cette question avec ${answers.filter(a => a.content.trim()).length} réponse(s) ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `Oui, ${actionText}`,
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      const { data, files } = prepareSubmissionData();
      console.log("📤 Envoi des données:", data);
      console.log("📤 Envoi des fichiers:", files);

      // Créer un FormData pour l'envoi avec fichiers
      const formDataToSend = new FormData();
      
      // Ajouter toutes les données JSON
      Object.keys(data).forEach(key => {
        formDataToSend.append(key, data[key]);
      });

      // Ajouter les fichiers médias
      files.forEach((file, index) => {
        formDataToSend.append(`media_files[${index}]`, file);
      });

      // Envoi direct avec fetch au lieu d'utiliser usePostData
      const response = await fetch('http://localhost/CRUDPHP/api/questions_api.php', {
        method: 'POST',
        body: formDataToSend
      });

      const responseText = await response.text();
      console.log("📥 Réponse brute:", responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        throw new Error(`Réponse invalide du serveur: ${responseText.substring(0, 200)}...`);
      }

      console.log("📥 Résultat parsé:", result);

      if (result && result.success) {
        const successMessage = isEditMode
          ? `Question modifiée avec succès !`
          : `Question créée avec succès !`;

        toast.success(`✅ ${successMessage}`, {
          position: "top-center"
        });

        if (isEditMode) {
          // Recharger les données après modification
          await loadQuestionData(questionId);
        } else {
          resetFormComplete();
        }
      } else {
        throw new Error(result?.message || result?.error || `Erreur lors de ${actionText === 'créer' ? 'la création' : 'la modification'}`);
      }
    } catch (err) {
      console.error("❌ Erreur lors de la soumission:", err);
      toast.error(`❌ Erreur: ${err.message}`, {
        position: "top-center"
      });
    } finally {
      setLoading(false);
    }
  }, [formData, answers, sources, mediaFiles, resetFormComplete, MySwal, isEditMode, questionId, prepareSubmissionData]);

  // ===========================
  // EFFETS (useEffect)
  // ===========================

  // Chargement initial des données de référence
  useEffect(() => {
    const initializeData = async () => {
      if (!isInitialized) {
        console.log("🔄 Chargement des données de référence...");
        await loadAllReferenceDataLocal();
        
        // Debug: Vérifier les données chargées
        console.log("📊 Données de référence chargées:", {
          domaines: referenceData.domaines?.length || 0,
          sousdomaines: referenceData.sousdomaines?.length || 0,
          typesQuestion: referenceData.typesQuestion?.length || 0,
          difficultes: referenceData.difficultes?.length || 0,
          langues: referenceData.langues?.length || 0
        });
        
        if (!isEditMode) {
          setIsInitialized(true);
        }
      }
    };

    initializeData();
  }, [isInitialized, isEditMode, loadAllReferenceDataLocal]);

  // Chargement des données de la question en mode édition
  useEffect(() => {
    if (isEditMode && questionId && !isInitialized) {
      loadQuestionData(questionId);
    }
  }, [isEditMode, questionId, isInitialized]);

  // Chargement des sous-domaines quand le domaine change
  useEffect(() => {
    if (formData.domain_id) {
      loadSubDomainsLocal(formData.domain_id);
    }
  }, [formData.domain_id, loadSubDomainsLocal]);

  // ===========================
  // AFFICHAGE DU LOADER
  // ===========================
  if (isEditMode && isLoadingQuestion) {
    return (
      <Panel bordered style={{ margin: '20px', textAlign: 'center', padding: '50px' }}>
        <h4>Chargement de la question...</h4>
        <Progress.Circle percent={50} />
      </Panel>
    );
  }

  // ===========================
  // AFFICHAGE DE L'ERREUR
  // ===========================
  if (isEditMode && loadError) {
    return (
      <Panel bordered style={{ margin: '20px' }}>
        <Message type="error" showIcon>
          <strong>Erreur de chargement:</strong> {loadError}
        </Message>
      </Panel>
    );
  }

  // ===========================
  // RENDU DU COMPOSANT
  // ===========================
  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h2>
          {isEditMode ? (
            <>
              <FiEdit style={{ marginRight: '8px' }} />
              Modifier la question #{questionId}
            </>
          ) : (
            <>
              <FiPlus style={{ marginRight: '8px' }} />
              Créer une nouvelle question
            </>
          )}
        </h2>
        <p>
          {isEditMode
            ? 'Modifiez votre question avec réponses, médias et sources'
            : 'Formulaire de création de question avec réponses, médias et sources'
          }
        </p>
      </div>

      {/* Affichage des erreurs */}
      {error && (
        <div className="alert alert-danger mb-4" role="alert">
          <strong>Erreur:</strong> {error}
        </div>
      )}

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} noValidate>

        {/* ===========================
            CONFIGURATION DE LA QUESTION
            =========================== */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FiFileText style={{ marginRight: '8px' }} />
              Configuration de la question
            </div>
          }
          className="chart-panel mb-4"
        >
          <Grid fluid>
            <Row gutter={16}>
              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="required fs-6 form-label fw-bold text-gray-900">
                    Domaine d'activité
                  </label>
                  <SelectPicker
                    data={referenceData.domaines}
                    style={{ width: "100%" }}
                    size="lg"
                    onChange={handleDomainChange}
                    value={formData.domain_id}
                    placeholder="Sélectionnez un domaine"
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Sous-domaine
                  </label>
                  <SelectPicker
                    data={referenceData.sousdomaines}
                    style={{ width: "100%" }}
                    size="lg"
                    onChange={(value) => updateFormField('sub_domain_id', value)}
                    value={formData.sub_domain_id}
                    placeholder="Sélectionnez un sous-domaine"
                    disabled={!formData.domain_id}
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="required fs-6 form-label fw-bold text-gray-900">
                    Type de question
                  </label>
                  <SelectPicker
                    data={referenceData.typesQuestion}
                    style={{ width: "100%" }}
                    size="lg"
                    onChange={(value) => updateFormField('type_id', value)}
                    value={formData.type_id}
                    placeholder="Sélectionnez un type"
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Niveau de difficulté
                  </label>
                  <SelectPicker
                    data={referenceData.difficultes}
                    style={{ width: "100%" }}
                    size="lg"
                    onChange={(value) => updateFormField('difficulty_level', value)}
                    value={formData.difficulty_level}
                    placeholder="Sélectionnez un niveau"
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Langue
                  </label>
                  <SelectPicker
                    data={referenceData.langues}
                    style={{ width: "100%" }}
                    size="lg"
                    onChange={(value) => updateFormField('language_id', value)}
                    value={formData.language_id}
                    placeholder="Sélectionnez une langue"
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Temps limite (secondes)
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="10"
                    value={formData.time_limit || ''}
                    onChange={(e) => updateFormField('time_limit', parseInt(e.target.value) || null)}
                    placeholder="Optionnel"
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="required fs-6 form-label fw-bold text-gray-900">
                    Points
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={formData.points}
                    onChange={(e) => updateFormField('points', parseInt(e.target.value) || 1)}
                    required
                  />
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Tags
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.tags}
                    onChange={(e) => updateFormField('tags', e.target.value)}
                    placeholder="Séparez les tags par des virgules"
                  />
                </div>
              </Col>

              <Col xs={24}>
                <div className="form-group mb-3">
                  <label className="required fs-6 form-label fw-bold text-gray-900">
                    Contenu de la question
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Saisir le contenu de la question"
                    value={formData.content}
                    onChange={(e) => updateFormField('content', e.target.value)}
                    required
                  />
                </div>
              </Col>

              <Col xs={24}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Explication (optionnel)
                  </label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Saisir l'explication de la question"
                    value={formData.explanation}
                    onChange={(e) => updateFormField('explanation', e.target.value)}
                  />
                </div>
              </Col>
            </Row>
          </Grid>
        </Panel>

        {/* ===========================
            GESTION DES RÉPONSES
            =========================== */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <CheckIcon style={{ marginRight: '8px' }} />
              Gestion des réponses
            </div>
          }
          className="chart-panel mb-4"
        >
          <div className="form-group mb-3">
            <label className="required fs-6 form-label fw-bold text-gray-900">
              Réponses (minimum 2 réponses requises)
            </label>
            {answers.map((answer, index) => (
              <div key={index} className="border p-3 mb-3 rounded">
                <div className="row align-items-center">
                  <div className="col-lg-8">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={`Réponse ${index + 1}`}
                      value={answer.content}
                      onChange={(e) => handleAnswerChange(index, 'content', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-lg-2">
                    <div className="d-flex align-items-center">
                      <label className="me-2 small">Correcte:</label>
                      <Toggle
                        size="sm"
                        checked={answer.is_correct}
                        onChange={(checked) => handleAnswerChange(index, 'is_correct', checked)}
                        checkedChildren="✓"
                        unCheckedChildren="✗"
                      />
                    </div>
                    {/* Debug info - à supprimer en production */}
                    <small className="text-muted d-block">
                      État: {answer.is_correct ? '✅ Correcte' : '❌ Incorrecte'}
                    </small>
                  </div>
                  <div className="col-lg-2">
                    {answers.length > 2 && (
                      <Button
                        appearance="ghost"
                        color="red"
                        size="sm"
                        onClick={() => removeAnswer(index)}
                      >
                        <TrashIcon />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="row mt-2">
                  <div className="col-lg-12">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Explication de cette réponse (optionnel)"
                      value={answer.explanation}
                      onChange={(e) => handleAnswerChange(index, 'explanation', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              appearance="ghost"
              onClick={addAnswer}
              className="mt-2"
              startIcon={<PlusIcon />}
            >
              Ajouter une réponse
            </Button>
          </div>
        </Panel>

        {/* ===========================
            RESSOURCES ADDITIONNELLES
            =========================== */}
        <Panel
          header={
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FiImage style={{ marginRight: '8px' }} />
              Ressources additionnelles
            </div>
          }
          className="chart-panel mb-4"
        >
          <Grid fluid>
            <Row gutter={16}>
              <Col xs={24}>
                <div className="form-group mb-4">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Médias (images, documents, etc.)
                  </label>
                  <input
                    type="file"
                    className="form-control"
                    multiple
                    accept="image/*,application/pdf,.doc,.docx,.txt,.mp4,.mp3"
                    onChange={handleMediaUpload}
                  />
                  <small className="form-text text-muted">
                    Formats supportés: JPG, PNG, PDF, DOC, DOCX, TXT, MP4, MP3
                  </small>
                  {mediaPreview.length > 0 && (
                    <div className="row mt-3">
                      {mediaPreview.map((media, index) => (
                        <div key={index} className="col-lg-3 col-md-4 col-sm-6 mb-3">
                          <div className="border p-2 rounded position-relative">
                            {/* Badge pour médias existants */}
                            {media.isExisting && (
                              <span className="position-absolute top-0 start-0 badge bg-info m-1" style={{zIndex: 10}}>
                                Existant
                              </span>
                            )}
                            
                            {media.type === 'image' ? (
                              <img
                                src={media.url}
                                alt="Aperçu"
                                className="img-fluid rounded"
                                style={{ maxHeight: '120px', width: '100%', objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="text-center p-3">
                                <DocPassIcon size="2em" className="text-primary mb-2" />
                                <p className="small mb-0 text-truncate">{media.file.name}</p>
                                <small className="text-muted">
                                  {media.file.size ? `${(media.file.size / 1024).toFixed(1)} KB` : 'Fichier existant'}
                                </small>
                                {media.isExisting && (
                                  <div className="small text-info">
                                    📎 Déjà uploadé
                                  </div>
                                )}
                              </div>
                            )}
                            <Button
                              color="red"
                              appearance="ghost"
                              size="sm"
                              className="position-absolute top-0 end-0 m-1"
                              onClick={() => removeMedia(index)}
                              style={{ padding: '0.25rem 0.5rem', zIndex: 10 }}
                              title={media.isExisting ? "Supprimer ce média existant" : "Supprimer ce nouveau fichier"}
                            >
                              <TrashIcon />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Col>

              <Col xs={24}>
                <div className="form-group mb-3">
                  <label className="fs-6 form-label fw-bold text-gray-900">
                    Sources et références (optionnel)
                  </label>
                  {sources.map((source, index) => (
                    <div key={index} className="border p-3 mb-3 rounded">
                      <div className="row">
                        <div className="col-lg-6">
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Titre de la source"
                            value={source.title}
                            onChange={(e) => handleSourceChange(index, 'title', e.target.value)}
                          />
                        </div>
                        <div className="col-lg-6">
                          <input
                            type="text"
                            className="form-control mb-2"
                            placeholder="Auteur (optionnel)"
                            value={source.author}
                            onChange={(e) => handleSourceChange(index, 'author', e.target.value)}
                          />
                        </div>
                        <div className="col-lg-10">
                          <input
                            type="url"
                            className="form-control mb-2"
                            placeholder="URL de la source (optionnel)"
                            value={source.url}
                            onChange={(e) => handleSourceChange(index, 'url', e.target.value)}
                          />
                        </div>
                        <div className="col-lg-2">
                          {sources.length > 1 && (
                            <Button
                              appearance="ghost"
                              color="red"
                              onClick={() => removeSource(index)}
                              className="w-100"
                            >
                              <TrashIcon />
                            </Button>
                          )}
                        </div>
                        <div className="col-lg-12">
                          <textarea
                            className="form-control"
                            rows="2"
                            placeholder="Description de la source (optionnel)"
                            value={source.description}
                            onChange={(e) => handleSourceChange(index, 'description', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button
                    appearance="ghost"
                    onClick={addSource}
                    className="mt-2"
                    startIcon={<PlusIcon />}
                  >
                    Ajouter une source
                  </Button>
                </div>
              </Col>
            </Row>
          </Grid>
        </Panel>

        {/* ===========================
            BOUTONS D'ACTION
            =========================== */}
        <div className="d-flex justify-content-end gap-3 mt-4">
          <Button
            appearance="subtle"
            onClick={resetFormComplete}
            disabled={loading}
          >
            {isEditMode ? 'Annuler les modifications' : 'Réinitialiser'}
          </Button>
          <Button
            appearance="primary"
            type="submit"
            loading={loading}
            disabled={loading}
            startIcon={<FiSave />}
          >
            {loading
              ? (isEditMode ? 'Modification en cours...' : 'Enregistrement en cours...')
              : (isEditMode ? 'Modifier la question' : 'Enregistrer la question')
            }
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SaveQuestionnaire;