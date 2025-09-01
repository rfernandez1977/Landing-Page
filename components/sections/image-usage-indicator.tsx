'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Eye, EyeOff, Info, TrendingUp } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ImageCacheService } from '@/lib/image-cache-service';

interface ImageUsageStats {
  totalProducts: number;
  imagesInUse: number;
  cacheHitRate: number;
  unusedImages: number;
  usageBreakdown: {
    activity: string;
    count: number;
    percentage: number;
  }[];
}

export const ImageUsageIndicator: React.FC = () => {
  const { selectedCompany } = useAuth();
  const [usageStats, setUsageStats] = useState<ImageUsageStats | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calcular estadísticas de uso de imágenes
  const calculateUsageStats = () => {
    if (!selectedCompany) return;

    setIsLoading(true);
    
    try {
      // Obtener configuración de imágenes de la empresa
      const imageConfig = ImageCacheService.loadCompanyConfig(selectedCompany.id);
      
      if (!imageConfig || imageConfig.images.length === 0) {
        setUsageStats(null);
        setIsLoading(false);
        return;
      }

      // Simular productos que usan estas imágenes
      // En un sistema real, esto vendría de la base de datos
      const totalProducts = 20; // Simulado
      const imagesInUse = Math.min(imageConfig.images.length, totalProducts);
      const cacheHitRate = (imagesInUse / totalProducts) * 100;
      const unusedImages = Math.max(0, imageConfig.images.length - totalProducts);

      // Calcular desglose por actividad
      const activityCounts: Record<string, number> = {};
      imageConfig.images.forEach(img => {
        activityCounts[img.activity] = (activityCounts[img.activity] || 0) + 1;
      });

      const usageBreakdown = Object.entries(activityCounts).map(([activity, count]) => ({
        activity,
        count,
        percentage: (count / imageConfig.images.length) * 100
      }));

      const stats: ImageUsageStats = {
        totalProducts,
        imagesInUse,
        cacheHitRate: Math.round(cacheHitRate * 100) / 100,
        unusedImages,
        usageBreakdown
      };

      setUsageStats(stats);
      console.log('📊 Estadísticas de uso de imágenes calculadas:', stats);
      
    } catch (error) {
      console.error('❌ Error calculando estadísticas de uso:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCompany && isVisible) {
      calculateUsageStats();
    }
  }, [selectedCompany, isVisible]);

  if (!selectedCompany) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Botón para mostrar/ocultar indicador */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors flex items-center space-x-2"
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{isVisible ? 'Ocultar' : 'Mostrar'} Uso de Imágenes</span>
        </button>
      </div>

      {/* Panel de estadísticas */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg border border-blue-200 dark:border-blue-700 p-6"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                  Uso de Imágenes en Productos
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Estadísticas de cómo se están utilizando las imágenes configuradas
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-blue-600 mt-2">Calculando estadísticas...</p>
              </div>
            ) : usageStats ? (
              <div className="space-y-6">
                {/* Métricas principales */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {usageStats.totalProducts}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Total Productos</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-green-200 dark:border-green-700">
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {usageStats.imagesInUse}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">Imágenes en Uso</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {usageStats.cacheHitRate}%
                    </div>
                    <div className="text-xs text-purple-600 dark:text-purple-400">Tasa de Acierto</div>
                  </div>
                  
                  <div className="text-center p-4 bg-white dark:bg-slate-800 rounded-lg border border-orange-200 dark:border-orange-700">
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                      {usageStats.unusedImages}
                    </div>
                    <div className="text-xs text-orange-600 dark:text-orange-400">Sin Usar</div>
                  </div>
                </div>

                {/* Desglose por actividad */}
                {usageStats.usageBreakdown.length > 0 && (
                  <div>
                    <h5 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-3">
                      Desglose por Actividad
                    </h5>
                    <div className="space-y-2">
                      {usageStats.usageBreakdown.map((item, index) => (
                        <motion.div
                          key={item.activity}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-blue-700"
                        >
                          <div className="flex items-center space-x-2">
                            <ImageIcon className="w-4 h-4 text-blue-500" />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                              {item.activity}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                              {item.count} imágenes
                            </span>
                            <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                              <div
                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                style={{ width: `${item.percentage}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right">
                              {Math.round(item.percentage)}%
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Información adicional */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-200">
                      <p className="font-medium mb-1">¿Cómo funciona?</p>
                      <p>
                        Las imágenes se asignan automáticamente a los productos usando un sistema de rotación inteligente. 
                        Cada producto obtiene una imagen basada en su índice y las actividades configuradas para tu empresa.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-blue-600 dark:text-blue-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay imágenes configuradas para mostrar estadísticas</p>
                <p className="text-sm mt-1">Configura imágenes en la sección de arriba</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
