import { CategoryMapping } from '../core/types';

// Mapeos inteligentes de categorías de productos a actividades de búsqueda
export const CATEGORY_MAPPING: Record<string, CategoryMapping> = {
  // Alimentos y Bebidas
  'FOOD': {
    categoryCode: 'FOOD',
    categoryName: 'Alimentos',
    suggestedActivities: ['restaurante', 'comida', 'cocina'],
    businessDomain: 'food',
    confidence: 0.9
  },
  'CAFE': {
    categoryCode: 'CAFE',
    categoryName: 'Café',
    suggestedActivities: ['café', 'coffee', 'cafetería'],
    businessDomain: 'food',
    confidence: 0.95
  },
  'BEBIDAS': {
    categoryCode: 'BEBIDAS',
    categoryName: 'Bebidas',
    suggestedActivities: ['bar', 'bebidas', 'drinks'],
    businessDomain: 'food',
    confidence: 0.85
  },
  'COMIDA': {
    categoryCode: 'COMIDA',
    categoryName: 'Comida',
    suggestedActivities: ['restaurante', 'comida', 'platos'],
    businessDomain: 'food',
    confidence: 0.9
  },

  // Retail y Comercio
  'RETAIL': {
    categoryCode: 'RETAIL',
    categoryName: 'Retail',
    suggestedActivities: ['tienda', 'retail', 'comercio'],
    businessDomain: 'retail',
    confidence: 0.8
  },
  'ROPA': {
    categoryCode: 'ROPA',
    categoryName: 'Ropa y Vestimenta',
    suggestedActivities: ['ropa', 'moda', 'fashion'],
    businessDomain: 'retail',
    confidence: 0.9
  },
  'ELECTRONICA': {
    categoryCode: 'ELECTRONICA',
    categoryName: 'Electrónicos',
    suggestedActivities: ['tecnología', 'electrónicos', 'gadgets'],
    businessDomain: 'retail',
    confidence: 0.85
  },
  'HOGAR': {
    categoryCode: 'HOGAR',
    categoryName: 'Hogar y Decoración',
    suggestedActivities: ['hogar', 'decoración', 'muebles'],
    businessDomain: 'retail',
    confidence: 0.8
  },

  // Servicios
  'SERVICIOS': {
    categoryCode: 'SERVICIOS',
    categoryName: 'Servicios',
    suggestedActivities: ['servicios', 'consultoría', 'profesional'],
    businessDomain: 'services',
    confidence: 0.75
  },
  'BELLEZA': {
    categoryCode: 'BELLEZA',
    categoryName: 'Belleza y Cuidado Personal',
    suggestedActivities: ['peluquería', 'spa', 'belleza'],
    businessDomain: 'services',
    confidence: 0.9
  },
  'FITNESS': {
    categoryCode: 'FITNESS',
    categoryName: 'Fitness y Deportes',
    suggestedActivities: ['gimnasio', 'fitness', 'deportes'],
    businessDomain: 'services',
    confidence: 0.9
  },

  // Salud
  'SALUD': {
    categoryCode: 'SALUD',
    categoryName: 'Salud y Medicina',
    suggestedActivities: ['farmacia', 'salud', 'medicina'],
    businessDomain: 'health',
    confidence: 0.85
  },
  'FARMACIA': {
    categoryCode: 'FARMACIA',
    categoryName: 'Farmacia',
    suggestedActivities: ['farmacia', 'medicamentos', 'salud'],
    businessDomain: 'health',
    confidence: 0.95
  },

  // Educación
  'EDUCACION': {
    categoryCode: 'EDUCACION',
    categoryName: 'Educación',
    suggestedActivities: ['educación', 'escuela', 'aprendizaje'],
    businessDomain: 'education',
    confidence: 0.8
  },
  'LIBROS': {
    categoryCode: 'LIBROS',
    categoryName: 'Libros y Material Educativo',
    suggestedActivities: ['libros', 'educación', 'librería'],
    businessDomain: 'education',
    confidence: 0.85
  }
};

// Mapeo por nombres de categoría (más flexible)
export const CATEGORY_NAME_MAPPING: Record<string, string[]> = {
  // Alimentos
  'café': ['café', 'coffee', 'cafetería'],
  'coffee': ['café', 'coffee', 'cafetería'],
  'comida': ['restaurante', 'comida', 'platos'],
  'food': ['restaurante', 'comida', 'cocina'],
  'bebida': ['bar', 'bebidas', 'drinks'],
  'bebidas': ['bar', 'bebidas', 'drinks'],
  'restaurant': ['restaurante', 'comida', 'gastronomía'],
  'pizzeria': ['pizzeria', 'pizza', 'restaurante'],
  'panadería': ['panadería', 'pan', 'bakery'],
  'bakery': ['panadería', 'pan', 'bakery'],

  // Retail
  'tienda': ['tienda', 'retail', 'comercio'],
  'store': ['tienda', 'retail', 'comercio'],
  'retail': ['tienda', 'retail', 'comercio'],
  'supermercado': ['supermercado', 'grocería', 'alimentos'],
  'supermarket': ['supermercado', 'grocería', 'alimentos'],
  'ropa': ['ropa', 'moda', 'fashion'],
  'fashion': ['ropa', 'moda', 'fashion'],
  'moda': ['ropa', 'moda', 'fashion'],
  'tecnología': ['tecnología', 'electrónicos', 'gadgets'],
  'technology': ['tecnología', 'electrónicos', 'gadgets'],
  'electrónicos': ['tecnología', 'electrónicos', 'gadgets'],

  // Servicios
  'servicios': ['servicios', 'consultoría', 'profesional'],
  'services': ['servicios', 'consultoría', 'profesional'],
  'consultoría': ['servicios', 'consultoría', 'oficina'],
  'consulting': ['servicios', 'consultoría', 'oficina'],
  'peluquería': ['peluquería', 'belleza', 'salon'],
  'salon': ['peluquería', 'belleza', 'salon'],
  'spa': ['spa', 'relajación', 'bienestar'],
  'gimnasio': ['gimnasio', 'fitness', 'ejercicio'],
  'gym': ['gimnasio', 'fitness', 'ejercicio'],
  'fitness': ['gimnasio', 'fitness', 'ejercicio'],

  // Salud
  'farmacia': ['farmacia', 'medicamentos', 'salud'],
  'pharmacy': ['farmacia', 'medicamentos', 'salud'],
  'salud': ['farmacia', 'salud', 'medicina'],
  'health': ['farmacia', 'salud', 'medicina'],
  'medicina': ['farmacia', 'salud', 'medicina'],

  // Educación
  'educación': ['educación', 'escuela', 'aprendizaje'],
  'education': ['educación', 'escuela', 'aprendizaje'],
  'escuela': ['educación', 'escuela', 'niños'],
  'school': ['educación', 'escuela', 'niños'],
  'librería': ['libros', 'educación', 'librería'],
  'bookstore': ['libros', 'educación', 'librería'],

  // Hospitality
  'hotel': ['hotel', 'hospitalidad', 'turismo'],
  'restaurant': ['restaurante', 'comida', 'gastronomía'],
  'bar': ['bar', 'bebidas', 'entretenimiento']
};

/**
 * Mapea una categoría de producto a actividades sugeridas para búsqueda de imágenes
 */
export function mapCategoryToActivities(
  categoryCode?: string, 
  categoryName?: string
): string[] {
  const defaultActivities = ['retail', 'comercio', 'negocio'];
  
  // Buscar por código exacto primero
  if (categoryCode) {
    const upperCode = categoryCode.toUpperCase();
    const mapping = CATEGORY_MAPPING[upperCode];
    if (mapping) {
      return mapping.suggestedActivities;
    }
  }

  // Buscar por nombre de categoría
  if (categoryName) {
    const lowerName = categoryName.toLowerCase().trim();
    
    // Búsqueda exacta
    if (CATEGORY_NAME_MAPPING[lowerName]) {
      return CATEGORY_NAME_MAPPING[lowerName];
    }

    // Búsqueda parcial (contiene)
    for (const [key, activities] of Object.entries(CATEGORY_NAME_MAPPING)) {
      if (lowerName.includes(key) || key.includes(lowerName)) {
        return activities;
      }
    }
  }

  return defaultActivities;
}

/**
 * Obtiene el dominio empresarial de una categoría
 */
export function getCategoryBusinessDomain(
  categoryCode?: string, 
  categoryName?: string
): 'food' | 'retail' | 'services' | 'health' | 'education' | 'other' {
  if (categoryCode) {
    const upperCode = categoryCode.toUpperCase();
    const mapping = CATEGORY_MAPPING[upperCode];
    if (mapping) {
      return mapping.businessDomain;
    }
  }

  if (categoryName) {
    const lowerName = categoryName.toLowerCase().trim();
    
    // Lógica heurística basada en palabras clave
    if (lowerName.includes('comida') || lowerName.includes('café') || lowerName.includes('restaurant')) {
      return 'food';
    }
    if (lowerName.includes('salud') || lowerName.includes('farmacia') || lowerName.includes('medicina')) {
      return 'health';
    }
    if (lowerName.includes('educación') || lowerName.includes('escuela') || lowerName.includes('libro')) {
      return 'education';
    }
    if (lowerName.includes('servicio') || lowerName.includes('consultoría') || lowerName.includes('belleza')) {
      return 'services';
    }
  }

  return 'retail'; // Por defecto
}

/**
 * Sugiere actividades adicionales basadas en el contexto del negocio
 */
export function suggestContextualActivities(
  primaryActivities: string[],
  businessDomain: string,
  companyId?: number
): string[] {
  const contextualSuggestions: Record<string, string[]> = {
    food: ['gastronomía', 'chef', 'platos', 'cocina', 'ingredientes'],
    retail: ['shopping', 'productos', 'tienda', 'compras', 'exhibición'],
    services: ['profesional', 'oficina', 'consulta', 'atención', 'cliente'],
    health: ['wellness', 'cuidado', 'tratamiento', 'consulta', 'bienestar'],
    education: ['estudiantes', 'clase', 'aprendizaje', 'conocimiento', 'enseñanza']
  };

  const suggestions = contextualSuggestions[businessDomain] || [];
  
  // Combinar actividades primarias con sugerencias contextuales (sin duplicados)
  const combined = [...primaryActivities];
  suggestions.forEach(suggestion => {
    if (!combined.includes(suggestion)) {
      combined.push(suggestion);
    }
  });

  return combined.slice(0, 5); // Limitar a 5 sugerencias máximo
}

/**
 * Función principal que combina todo el mapeo inteligente
 */
export function getSmartActivityMapping(
  categoryCode?: string,
  categoryName?: string,
  companyId?: number
): {
  primaryActivities: string[];
  businessDomain: 'food' | 'retail' | 'services' | 'health' | 'education' | 'other';
  allSuggestions: string[];
  confidence: number;
} {
  const primaryActivities = mapCategoryToActivities(categoryCode, categoryName);
  const businessDomain = getCategoryBusinessDomain(categoryCode, categoryName);
  const allSuggestions = suggestContextualActivities(primaryActivities, businessDomain, companyId);
  
  // Calcular confianza basada en qué tan específico fue el mapeo
  let confidence = 0.5; // Base
  
  if (categoryCode && CATEGORY_MAPPING[categoryCode.toUpperCase()]) {
    confidence = CATEGORY_MAPPING[categoryCode.toUpperCase()].confidence;
  } else if (categoryName && CATEGORY_NAME_MAPPING[categoryName.toLowerCase()]) {
    confidence = 0.8;
  } else if (primaryActivities.length > 1) {
    confidence = 0.6;
  }

  return {
    primaryActivities,
    businessDomain,
    allSuggestions,
    confidence
  };
}
