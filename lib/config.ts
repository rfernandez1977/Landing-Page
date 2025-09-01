/**
 * Configuración centralizada para la aplicación
 * Todas las constantes de API y configuraciones se centralizan aquí
 */

// Configuración de la API de Factura Movil
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://produccion.facturamovil.cl',
  FACMOV_T: process.env.NEXT_PUBLIC_FACMOV_T || '61b93157-44f1-4ab1-bc38-f55861b7febb',
  COMPANY_ID: process.env.NEXT_PUBLIC_COMPANY_ID || '29',
  PDF_FACMOV_T: process.env.NEXT_PUBLIC_PDF_FACMOV_T || '61b93157-44f1-4ab1-bc38-f55861b7febb' // Usar el mismo token por ahora
};

// Endpoints de la API (usando proxy para evitar CORS)
export const API_ENDPOINTS = {
  PRODUCTS: `/api/proxy?endpoint=/services/common/product`,
  CLIENTS: `/api/proxy?endpoint=/services/common/client`,
  DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/ticket`,
  INVOICES: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/invoice`,
  PDF: `${API_CONFIG.BASE_URL}/document/toPdf` // PDF no usa proxy (acceso público)
};

// Headers predefinidos para las llamadas a la API (solo para PDF)
export const API_HEADERS = {
  DEFAULT: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  PDF: {
    'FACMOV_T': API_CONFIG.PDF_FACMOV_T
  }
};

// Sistema de configuración centralizada basada en autenticación
export interface AuthConfig {
  token: string;
  companyId: string;
  baseUrl: string;
}

// Función para obtener configuración de autenticación
export const getAuthConfig = (): AuthConfig => {
  // Intentar obtener datos del localStorage
  const savedUser = localStorage.getItem('facturaMovil_user');
  const savedCompany = localStorage.getItem('facturaMovil_company');
  
  if (savedUser && savedCompany) {
    try {
      const userData = JSON.parse(savedUser);
      const companyData = JSON.parse(savedCompany);
      
      const config = {
        token: userData.token,
        companyId: companyData.id.toString(),
        baseUrl: API_CONFIG.BASE_URL
      };
      
      return config;
    } catch (error) {
      console.error('Error parsing auth config:', error);
    }
  }
  
  // Fallback a configuración de desarrollo
  return {
    token: API_CONFIG.FACMOV_T,
    companyId: API_CONFIG.COMPANY_ID,
    baseUrl: API_CONFIG.BASE_URL
  };
};

// Función para obtener headers dinámicos basados en la autenticación
export const getAuthHeaders = (token?: string) => {
  const authConfig = getAuthConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  };

  // Usar token de autenticación o fallback
  headers['FACMOV_T'] = token || authConfig.token;

  return headers;
};

// Función para obtener endpoints dinámicos basados en la empresa seleccionada
export const getCompanyEndpoints = (companyId?: string) => {
  const authConfig = getAuthConfig();
  const id = companyId || authConfig.companyId;
  
  return {
    PRODUCTS: `/api/proxy?endpoint=/services/common/product`,
    CLIENTS: `/api/proxy?endpoint=/services/common/client`,
    DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${id}/ticket`,
    INVOICES: `/api/proxy?endpoint=/services/raw/company/${id}/invoice`,
    PDF: `${authConfig.baseUrl}/document/toPdf`
  };
};

// Función para obtener configuración completa de API
export const getApiConfig = () => {
  const authConfig = getAuthConfig();
  
  return {
    baseUrl: authConfig.baseUrl,
    token: authConfig.token,
    companyId: authConfig.companyId,
    headers: getAuthHeaders(),
    endpoints: getCompanyEndpoints()
  };
};

// Configuración de la aplicación
export const APP_CONFIG = {
  DEBOUNCE_DELAY: 500, // ms para debounce en búsquedas
  MAX_PRODUCTS_DISPLAY: 4, // Número máximo de productos a mostrar
  CURRENCY: 'CLP', // Moneda chilena
  TAX_RATE: 0.19 // IVA chileno (19%)
};

// Mensajes de error comunes
export const ERROR_MESSAGES = {
  API_ERROR: 'Error al conectar con la API',
  NETWORK_ERROR: 'Error de conexión de red',
  VALIDATION_ERROR: 'Error de validación de datos',
  PDF_ERROR: 'Error al generar el PDF'
};
