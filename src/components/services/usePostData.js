import { useState } from "react";
import axios from "axios";
import { rootUrl } from "./urlUtils";

const usePostData = (apiEndPoint) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [response, setResponse] = useState(null);

  const postData = async (params) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.post(rootUrl + apiEndPoint, params, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      setResponse(response.data);
      return response.data;
    } catch (err) {
      setError("Erreur lors de la soumission du formulaire");
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { postData, loading, error, response };
};

export default usePostData;
