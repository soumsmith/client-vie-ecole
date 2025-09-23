// src/components/utils/cacheUtils.js

const cache = new Map();

export const getFromCache = (key, duration) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < duration) {
        console.log(`💾 Cache HIT pour ${key}`);
        return cached.data;
    }
    return null;
};

export const setToCache = (key, data) => {
    console.log(`💾 Cache SET pour ${key}`);
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};

export const clearCache = () => {
    cache.clear();
    console.log('🗑️ Cache vidé');
};

export default cache; 