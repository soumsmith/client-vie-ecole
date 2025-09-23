import { useState } from "react";
import axios from "axios";
import { rootUrl } from "./urlUtils";

/**
 * Hook générique pour envoyer des données POST
 * @param {string} apiEndPoint - endpoint de l'API (ex: /connexion/se-connecter)
 * @param {'json' | 'form' | 'multipart-form-data'} contentType - format des données à envoyer
 */
const usePostData = (apiEndPoint, contentType = 'json') => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const postData = async (params) => {
    setLoading(true);
    setError(null);
    
    try {
      let dataToSend = params;
      let headers = {};

      if (contentType === 'form') {
        // Encoder en x-www-form-urlencoded
        const formData = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          formData.append(key, value);
        });
        dataToSend = formData;
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        
      } else if (contentType === 'multipart-form-data') {
        // Pour multipart/form-data, on laisse axios gérer le Content-Type automatiquement
        // Ne PAS définir le Content-Type header manuellement !
        // params doit déjà être un objet FormData
        if (!(params instanceof FormData)) {
          console.warn("⚠️ Pour multipart-form-data, les données doivent être un objet FormData");
        }
        dataToSend = params;
        // Pas de header Content-Type défini - axios le gère automatiquement
        
      } else {
        // JSON par défaut
        headers['Content-Type'] = 'application/json';
      }

      console.log("📤 Envoi des données:", {
        endpoint: rootUrl + apiEndPoint,
        contentType,
        dataType: dataToSend.constructor.name,
        headers
      });

      const response = await axios.post(rootUrl + apiEndPoint, dataToSend, { headers });

      console.log("✅ Réponse reçue:", response.data);
      setResponse(response.data);
      return response.data;
      
    } catch (err) {
      console.error("❌ Erreur API POST:", err);
      
      // Gestion d'erreur plus détaillée
      let errorMessage = "Erreur lors de la soumission du formulaire";
      
      if (err.response) {
        // Erreur du serveur (4xx, 5xx)
        errorMessage = `Erreur serveur: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        // Erreur réseau
        errorMessage = "Erreur réseau: Impossible de joindre le serveur";
      } else {
        // Autre erreur
        errorMessage = err.message || errorMessage;
      }
      
      setError(errorMessage);
      return null;
      
    } finally {
      setLoading(false);
    }
  };

  return { 
    postData, 
    loading: loading, 
    error: error, 
    response: response 
  };
};

export default usePostData;