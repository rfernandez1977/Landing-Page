// Configuración de Pexels API
// Para obtener tu API key gratuita:
// 1. Ve a https://www.pexels.com/api/
// 2. Regístrate o inicia sesión
// 3. Crea una nueva aplicación
// 4. Copia tu API key

export const PEXELS_CONFIG = {
  // Reemplaza esto con tu API key real de Pexels
  API_KEY: process.env.PEXELS_API_KEY || 'YOUR_API_KEY_HERE',
  
  // URL base de la API
  BASE_URL: 'https://api.pexels.com/v1',
  
  // Límites de la API gratuita
  RATE_LIMIT: {
    FREE_TIER: 200, // requests por hora
    PAID_TIER: 5000 // requests por hora
  },
  
  // Configuración por defecto
  DEFAULTS: {
    PER_PAGE: 15,
    ORIENTATION: 'landscape' as const,
    SIZE: 'medium' as const
  }
};

// Función para verificar si la API key está configurada
export const isPexelsConfigured = (): boolean => {
  return PEXELS_CONFIG.API_KEY !== 'YOUR_API_KEY_HERE' && 
         PEXELS_CONFIG.API_KEY !== undefined && 
         PEXELS_CONFIG.API_KEY !== '';
};

// Función para obtener headers de autenticación
export const getPexelsHeaders = (): Record<string, string> => {
  if (!isPexelsConfigured()) {
    throw new Error('Pexels API key no está configurada. Configura PEXELS_API_KEY en tu archivo .env.local');
  }
  
  return {
    'Authorization': PEXELS_CONFIG.API_KEY,
    'Content-Type': 'application/json'
  };
};
