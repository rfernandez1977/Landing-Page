// Servicio para manejar el cache de imágenes de Pexels
export interface CachedImage {
  id: string;
  url: string;
  activity: string;
  photographer: string;
  pexelsId: number;
  width: number;
  height: number;
  cachedAt: number;
  companyId: number;
}

export interface CompanyImageConfig {
  companyId: number;
  activities: string[];
  images: CachedImage[];
  lastUpdated: number;
}

export class ImageCacheService {
  private static readonly CACHE_PREFIX = 'facturaMovil_images';
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos
  private static readonly MAX_CACHE_SIZE = 100; // Máximo número de imágenes en cache

  /**
   * Obtiene la clave de cache para una empresa específica
   */
  private static getCacheKey(companyId: number): string {
    return `${this.CACHE_PREFIX}_${companyId}`;
  }

  /**
   * Obtiene la clave de cache para una búsqueda específica
   */
  private static getSearchCacheKey(companyId: number, query: string): string {
    return `${this.CACHE_PREFIX}_search_${companyId}_${query.toLowerCase().replace(/\s+/g, '_')}`;
  }

  /**
   * Guarda la configuración de imágenes de una empresa
   */
  static saveCompanyConfig(config: CompanyImageConfig): void {
    try {
      const cacheKey = this.getCacheKey(config.companyId);
      const dataToSave = {
        ...config,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(dataToSave));
      console.log('💾 Configuración de imágenes guardada:', { companyId: config.companyId, imagesCount: config.images.length });
    } catch (error) {
      console.error('❌ Error guardando configuración de imágenes:', error);
    }
  }

  /**
   * Carga la configuración de imágenes de una empresa
   */
  static loadCompanyConfig(companyId: number): CompanyImageConfig | null {
    try {
      const cacheKey = this.getCacheKey(companyId);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const config: CompanyImageConfig = JSON.parse(cached);
      
      // Verificar si el cache ha expirado
      if (Date.now() - config.lastUpdated > this.CACHE_TTL) {
        console.log('⏰ Cache de imágenes expirado para empresa:', companyId);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log('📸 Configuración de imágenes cargada desde cache:', { companyId, imagesCount: config.images.length });
      return config;
    } catch (error) {
      console.error('❌ Error cargando configuración de imágenes:', error);
      return null;
    }
  }

  /**
   * Guarda resultados de búsqueda en cache
   */
  static saveSearchResults(companyId: number, query: string, images: CachedImage[]): void {
    try {
      const cacheKey = this.getSearchCacheKey(companyId, query);
      const searchCache = {
        companyId,
        query,
        images: images.map(img => ({
          ...img,
          cachedAt: Date.now(),
          companyId
        })),
        cachedAt: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(searchCache));
      console.log('🔍 Resultados de búsqueda guardados en cache:', { query, imagesCount: images.length });
      
      // Limpiar cache antiguo si es necesario
      this.cleanupOldCache();
    } catch (error) {
      console.error('❌ Error guardando resultados de búsqueda:', error);
    }
  }

  /**
   * Carga resultados de búsqueda desde cache
   */
  static loadSearchResults(companyId: number, query: string): CachedImage[] | null {
    try {
      const cacheKey = this.getSearchCacheKey(companyId, query);
      const cached = localStorage.getItem(cacheKey);
      
      if (!cached) {
        return null;
      }

      const searchCache = JSON.parse(cached);
      
      // Verificar si el cache ha expirado
      if (Date.now() - searchCache.cachedAt > this.CACHE_TTL) {
        console.log('⏰ Cache de búsqueda expirado:', query);
        localStorage.removeItem(cacheKey);
        return null;
      }

      console.log('🔍 Resultados de búsqueda cargados desde cache:', { query, imagesCount: searchCache.images.length });
      return searchCache.images;
    } catch (error) {
      console.error('❌ Error cargando resultados de búsqueda:', error);
      return null;
    }
  }

  /**
   * Obtiene una imagen aleatoria para un producto basada en las actividades configuradas
   */
  static getRandomProductImage(companyId: number, productIndex: number): string | null {
    try {
      const config = this.loadCompanyConfig(companyId);
      
      if (!config || config.images.length === 0) {
        return null;
      }

      // Filtrar imágenes por actividad si el producto tiene categoría
      // Por ahora, usar rotación simple basada en el índice
      const imageIndex = productIndex % config.images.length;
      const selectedImage = config.images[imageIndex];
      
      console.log('🎯 Imagen seleccionada para producto:', { productIndex, imageIndex, activity: selectedImage.activity });
      return selectedImage.url;
    } catch (error) {
      console.error('❌ Error obteniendo imagen de producto:', error);
      return null;
    }
  }

  /**
   * Obtiene imágenes por actividad específica
   */
  static getImagesByActivity(companyId: number, activity: string): CachedImage[] {
    try {
      const config = this.loadCompanyConfig(companyId);
      
      if (!config) {
        return [];
      }

      return config.images.filter(img => 
        img.activity.toLowerCase() === activity.toLowerCase()
      );
    } catch (error) {
      console.error('❌ Error obteniendo imágenes por actividad:', error);
      return [];
    }
  }

  /**
   * Limpia cache antiguo para liberar espacio
   */
  private static cleanupOldCache(): void {
    try {
      const keys = Object.keys(localStorage);
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (imageKeys.length <= this.MAX_CACHE_SIZE) {
        return; // No es necesario limpiar
      }

      // Ordenar por timestamp y eliminar los más antiguos
      const keyTimestamps = imageKeys.map(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          return { key, timestamp: data.cachedAt || 0 };
        } catch {
          return { key, timestamp: 0 };
        }
      });

      keyTimestamps.sort((a, b) => a.timestamp - b.timestamp);
      
      // Eliminar el 20% más antiguo
      const keysToRemove = keyTimestamps.slice(0, Math.ceil(imageKeys.length * 0.2));
      
      keysToRemove.forEach(({ key }) => {
        localStorage.removeItem(key);
        console.log('🧹 Cache limpiado:', key);
      });

      console.log('🧹 Limpieza de cache completada:', { removed: keysToRemove.length, remaining: imageKeys.length - keysToRemove.length });
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
  }

  /**
   * Elimina toda la configuración de una empresa
   */
  static clearCompanyConfig(companyId: number): void {
    try {
      const keys = Object.keys(localStorage);
      const companyKeys = keys.filter(key => key.includes(`_${companyId}_`));
      
      companyKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log('🗑️ Configuración eliminada:', key);
      });
      
      console.log('🗑️ Configuración de empresa eliminada:', { companyId, keysRemoved: companyKeys.length });
    } catch (error) {
      console.error('❌ Error eliminando configuración de empresa:', error);
    }
  }

  /**
   * Obtiene estadísticas del cache
   */
  static getCacheStats(): { totalKeys: number; totalSize: number; oldestEntry: number; newestEntry: number } {
    try {
      const keys = Object.keys(localStorage);
      const imageKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      let totalSize = 0;
      let oldestEntry = Date.now();
      let newestEntry = 0;
      
      imageKeys.forEach(key => {
        try {
          const data = localStorage.getItem(key);
          if (data) {
            totalSize += data.length;
            const parsed = JSON.parse(data);
            const timestamp = parsed.cachedAt || parsed.lastUpdated || 0;
            
            if (timestamp < oldestEntry) oldestEntry = timestamp;
            if (timestamp > newestEntry) newestEntry = timestamp;
          }
        } catch (error) {
          // Ignorar entradas corruptas
        }
      });
      
      return {
        totalKeys: imageKeys.length,
        totalSize: Math.round(totalSize / 1024), // KB
        oldestEntry,
        newestEntry
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del cache:', error);
      return { totalKeys: 0, totalSize: 0, oldestEntry: 0, newestEntry: 0 };
    }
  }
}
