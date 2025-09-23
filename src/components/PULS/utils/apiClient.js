// src/components/utils/apiClient.js

import axios from 'axios';

const apiClient = axios.create({
    timeout: 10000,
    headers: {
        'Accept': 'application/json',
        "Access-Control-Allow-Origin": "*",
        'Content-Type': 'application/json'
    }
});

apiClient.interceptors.request.use(
    (config) => {
        config.metadata = { startTime: Date.now() };
        console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url} - Démarré`);
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => {
        const duration = Date.now() - response.config.metadata.startTime;
        console.log(`✅ [${response.config.method?.toUpperCase()}] ${response.config.url} - ${duration}ms`);
        return response;
    },
    (error) => {
        const duration = Date.now() - error.config?.metadata?.startTime || 0;
        console.log(`❌ [${error.config?.method?.toUpperCase()}] ${error.config?.url} - ${duration}ms - ${error.message}`);
        return Promise.reject(error);
    }
);

export default apiClient; 