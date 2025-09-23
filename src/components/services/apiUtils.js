import {  rootUrl } from "./urlUtils";
import { useEffect, useState } from "react";
import axios from 'axios';

export const fetchData = async (params, url, setData) => {
  try {
    const response = await crudData(params, url);
    setData(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
};

export const fetchCategorieData = async (params, url, setData) => {
  try {
    const response = await crudData(params, url);
    setData(response.data.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
};

export const loadStores = async (
  params,
  url,
  setData,
  keyMapping = {
    valueKey: "LG_LSTID",
    labelKey: "STR_LSTDESCRIPTION",
  }
) => {
  try {
    const response = await crudData(params, url);
    const data = response.data.data;
    const mappedOptions = data.map((item) => ({
      value: item[keyMapping.valueKey],
      label: item[keyMapping.labelKey],
    }));
    setData(mappedOptions);
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error);
  }
};


/**
 * Hook personnalisé pour charger les données avec mapping.
 * @param {Object} params - Les paramètres pour l'appel API.
 * @param {string} url - L'URL de l'API.
 * @param {Object} keyMapping - Les clés pour mapper les options (value et label).
 * @returns {Array} - Les données chargées.
 */
export const useLoadStores = (params, url, keyMapping = { valueKey: "LG_LSTID", labelKey: "STR_LSTDESCRIPTION" }) => {
  const [data, setData] = useState([]);

  useEffect(() => {
    if (!data.length) {
      loadStores(params, url, setData, keyMapping);
    }
  }, [params, url, keyMapping, data.length]);

  return data;
};


export const crudData = (params, apiUrl) => {
  return axios.post(`${rootUrl}${apiUrl}`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};


const doConnexion = (params) => {
  return axios.post(`${rootUrl}Authentification.php`, params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
};

export const handleLogin = async (e, params, setError, navigate, redirectPath) => {
  e.preventDefault(); // Empêche le comportement par défaut du formulaire (rechargement de la page)
  try {
    const response = await doConnexion(params); // Envoi des paramètres de connexion à l'API
    const userData = response.data; // Extraction des données utilisateur de la réponse de l'API

    if (userData.code_statut === "1") { // Vérification si la connexion a réussi
      localStorage.setItem('userConnectedData', JSON.stringify(userData)); // Stockage des données utilisateur dans le localStorage

      console.log(JSON.stringify(userData));

      navigate(redirectPath); // Redirection vers le chemin spécifié
    } else {
      setError(userData.desc_statut); // Affichage du message d'erreur
    }
  } catch (error) {
    setError('Erreur de connexion. Veuillez réessayer.'); // Affichage d'un message d'erreur en cas d'exception
  }
};