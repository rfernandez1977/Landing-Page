import { useState, useEffect, useCallback } from 'react';
import { ImageCacheService } from '@/lib/image-cache-service';

export interface CacheStats {
  totalKeys: number;
  totalSize: number;
  oldestEntry: number;
  newestEntry: number;
}

export const useImageCacheStats = () => {
  const [stats, setStats] = useState<CacheStats>({
    totalKeys: 0,
    totalSize: 0,
    oldestEntry: 0,
    newestEntry: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const refreshStats = useCallback(() => {
    setIsLoading(true);
    try {
      const newStats = ImageCacheService.getCacheStats();
      setStats(newStats);
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas del cache:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearCache = useCallback((companyId?: number) => {
    try {
      if (companyId) {
        ImageCacheService.clearCompanyConfig(companyId);
        console.log('🗑️ Cache de empresa limpiado:', companyId);
      } else {
        // Limpiar todo el cache
        const keys = Object.keys(localStorage);
        const imageKeys = keys.filter(key => key.startsWith('facturaMovil_images'));
        imageKeys.forEach(key => localStorage.removeItem(key));
        console.log('🗑️ Todo el cache de imágenes limpiado');
      }
      
      // Refrescar estadísticas
      refreshStats();
    } catch (error) {
      console.error('❌ Error limpiando cache:', error);
    }
  }, [refreshStats]);

  useEffect(() => {
    refreshStats();
  }, [refreshStats]);

  return {
    stats,
    isLoading,
    refreshStats,
    clearCache
  };
};
