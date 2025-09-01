'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Save, Image as ImageIcon, Tag, Trash2, Plus, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ImageCacheService, type CachedImage, type CompanyImageConfig } from '@/lib/image-cache-service';
import { useImageCacheStats } from '@/hooks/use-image-cache-stats';
import { ImageUsageIndicator } from './image-usage-indicator';
import { VisualThemeSelector } from './visual-theme-selector';
import { PlaceholderImage } from '@/components/ui/placeholder-image-indicator';
import { DragDropImages } from '@/components/ui/drag-drop-images';
import { DragDropResult, BulkAction } from '@/lib/image-system/core/types';

// Interfaces
interface ImageResult {
  id: string;
  url: string;
  activity: string;
  photographer: string;
  pexelsId: number;
  width: number;
  height: number;
}

interface CompanyImageConfig {
  companyId: number;
  activities: string[];
  images: ImageResult[];
  lastUpdated: Date;
}

// Sugerencias de actividades comunes
const COMMON_ACTIVITIES = [
  'restaurante', 'café', 'bar', 'pizzeria', 'panadería',
  'retail', 'tienda', 'supermercado', 'farmacia',
  'servicios', 'consultoría', 'salud', 'educación',
  'hotel', 'spa', 'gimnasio', 'peluquería'
];

export const ImageConfigSection: React.FC = () => {
  const { selectedCompany } = useAuth();
  const { stats, refreshStats, clearCache } = useImageCacheStats();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ImageResult[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedImages, setSelectedImages] = useState<ImageResult[]>([]);
  const [isSaving, setSaving] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isSectionVisible, setSectionVisible] = useState(true);

  // Cargar configuración guardada al montar el componente
  useEffect(() => {
    if (selectedCompany) {
      loadSavedConfig();
    }
  }, [selectedCompany]);

  // Cargar configuración guardada desde servidor y fallback a cache
  const loadSavedConfig = async () => {
    if (!selectedCompany) return;
    
    try {
      const res = await fetch(`/api/image-config?companyId=${selectedCompany.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data?.config) {
          setSelectedActivities(data.config.activities || []);
          setSelectedImages(data.config.images || []);
          // Sincronizar cache local
          ImageCacheService.saveCompanyConfig({
            companyId: selectedCompany.id,
            activities: data.config.activities || [],
            images: data.config.images || [],
            lastUpdated: Date.now()
          } as any);
          console.log('📡 Configuración de imágenes cargada desde servidor:', data.config);
          return;
        }
      }
    } catch (err) {
      console.warn('⚠️ No se pudo cargar desde servidor, usando cache local');
    }

    const config = ImageCacheService.loadCompanyConfig(selectedCompany.id);
    if (config) {
      setSelectedActivities(config.activities || []);
      setSelectedImages(config.images || []);
      console.log('📸 Configuración de imágenes cargada desde cache:', config);
    }
  };

  // Guardar configuración usando el servicio de cache
  const saveConfig = useCallback(async () => {
    if (!selectedCompany || selectedActivities.length === 0) return;
    
    setSaving(true);
    
    try {
      const config: CompanyImageConfig = {
        companyId: selectedCompany.id,
        activities: selectedActivities,
        images: selectedImages.map(img => ({
          ...img,
          companyId: selectedCompany.id
        })),
        lastUpdated: Date.now()
      };

      // Guardar en cache usando el servicio
      ImageCacheService.saveCompanyConfig(config);

      // Guardar en servidor
      await fetch('/api/image-config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      console.log('💾 Configuración guardada en cache y servidor:', config);
      
      // Forzar actualización de productos con nuevas imágenes
      console.log('🔄 Forzando actualización de productos con nuevas imágenes...');
      
      // Disparar evento personalizado para notificar a otros componentes
      window.dispatchEvent(new CustomEvent('imagesConfigUpdated', {
        detail: { companyId: selectedCompany.id, config }
      }));
      
      // Mostrar feedback visual
      setTimeout(() => setSaving(false), 1000);
      
    } catch (error) {
      console.error('❌ Error guardando configuración:', error);
      setSaving(false);
    }
  }, [selectedCompany, selectedActivities, selectedImages]);

  // Buscar imágenes en Pexels con cache inteligente
  const searchImages = useCallback(async (query: string) => {
    if (!query.trim() || !selectedCompany) return;
    
    setSearching(true);
    setSearchResults([]);
    
    try {
      // Primero verificar cache
      const cachedResults = ImageCacheService.loadSearchResults(selectedCompany.id, query);
      
      if (cachedResults && cachedResults.length > 0) {
        console.log('🔍 Usando resultados en cache para:', query);
        setSearchResults(cachedResults);
        setSearching(false);
        return;
      }
      
      // Si no hay cache, buscar en Pexels
      console.log('🔍 Buscando en Pexels API para:', query);
      const response = await fetch(
        `/api/pexels?query=${encodeURIComponent(query)}&companyId=${selectedCompany.id}&per_page=15`
      );
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.images) {
        // Guardar en cache para futuras búsquedas
        const imagesWithCompany = data.images.map((img: any) => ({
          ...img,
          companyId: selectedCompany.id
        }));
        
        ImageCacheService.saveSearchResults(selectedCompany.id, query, imagesWithCompany);
        setSearchResults(imagesWithCompany);
        console.log('🔍 Imágenes encontradas y guardadas en cache:', data.images.length);
      }
      
    } catch (error) {
      console.error('❌ Error buscando imágenes:', error);
    } finally {
      setSearching(false);
    }
  }, [selectedCompany]);

  // Agregar actividad
  const addActivity = (activity: string) => {
    if (selectedActivities.length >= 3) {
      alert('Máximo 3 actividades permitidas');
      return;
    }
    
    if (!selectedActivities.includes(activity)) {
      setSelectedActivities(prev => [...prev, activity]);
      setSearchQuery('');
      setShowSuggestions(false);
      
      // Buscar imágenes para la nueva actividad
      searchImages(activity);
    }
  };

  // Remover actividad
  const removeActivity = (activity: string) => {
    setSelectedActivities(prev => prev.filter(a => a !== activity));
    setSelectedImages(prev => prev.filter(img => img.activity !== activity));
  };

  // Seleccionar imagen
  const selectImage = (image: ImageResult) => {
    if (!selectedImages.find(img => img.id === image.id)) {
      setSelectedImages(prev => [...prev, image]);
    }
  };

  // Remover imagen
  const removeImage = (imageId: string) => {
    setSelectedImages(prev => prev.filter(img => img.id !== imageId));
  };

  // Manejar reordenamiento de imágenes
  const handleImageReorder = (result: DragDropResult) => {
    const { sourceIndex, destinationIndex } = result;
    
    setSelectedImages(prev => {
      const newImages = [...prev];
      const [movedImage] = newImages.splice(sourceIndex, 1);
      newImages.splice(destinationIndex, 0, movedImage);
      
      console.log(`🔄 Imagen reordenada: ${movedImage.activity} de posición ${sourceIndex} a ${destinationIndex}`);
      return newImages;
    });
  };

  // Manejar acciones masivas
  const handleBulkAction = async (action: BulkAction) => {
    console.log('🔄 Ejecutando acción masiva:', action);
    
    try {
      switch (action.type) {
        case 'delete-unused':
          if (action.targetIds) {
            // Eliminar imágenes seleccionadas
            setSelectedImages(prev => prev.filter(img => !action.targetIds!.includes(img.id)));
            console.log(`🗑️ ${action.targetIds.length} imágenes eliminadas`);
          }
          break;
          
        case 'clear-all':
          // Limpiar todas las imágenes
          setSelectedImages([]);
          console.log('🗑️ Todas las imágenes eliminadas');
          break;
          
        case 'apply-to-all':
          // Aplicar configuración (guardar)
          if (selectedCompany) {
            await saveConfig();
            console.log('✅ Configuración aplicada a todos los productos');
          }
          break;
          
        case 'refresh-cache':
          // Refrescar cache de imágenes
          if (selectedCompany) {
            ImageCacheService.cleanupExpiredCache();
            await loadSavedConfig();
            console.log('🔄 Cache refrescado');
          }
          break;
          
        default:
          console.warn('⚠️ Acción no reconocida:', action.type);
      }
    } catch (error) {
      console.error('🚨 Error en acción masiva:', error);
      throw error;
    }
  };

  // Manejar búsqueda
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addActivity(searchQuery.trim());
    }
  };

  // Manejar sugerencias
  const handleSuggestionClick = (suggestion: string) => {
    addActivity(suggestion);
  };

  // Filtrar sugerencias
  const filteredSuggestions = COMMON_ACTIVITIES.filter(
    activity => !selectedActivities.includes(activity) && 
    activity.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!selectedCompany) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6">
        <div className="text-center text-slate-500">
          Selecciona una empresa para configurar imágenes
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <ImageIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Configuración de Imágenes
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Personaliza las imágenes de tu negocio
            </p>
          </div>
        </div>
        
        {/* Botón de estadísticas */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setSectionVisible(!isSectionVisible)}
            className="px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
          >
            {isSectionVisible ? 'Ocultar' : 'Mostrar'} Configuración
          </button>
          <button
            onClick={() => setShowStats(!showStats)}
            className="px-3 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          >
            📊 {showStats ? 'Ocultar' : 'Mostrar'} Stats
          </button>
          <button
            onClick={() => {
              refreshStats();
              setShowStats(true);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            title="Refrescar estadísticas"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      {/* Panel de Estadísticas */}
      <AnimatePresence>
        {showStats && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalKeys}
                </div>
                <div className="text-xs text-slate-500">Entradas en Cache</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.totalSize} KB
                </div>
                <div className="text-xs text-slate-500">Tamaño Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.oldestEntry > 0 ? Math.floor((Date.now() - stats.oldestEntry) / (1000 * 60 * 60)) : 0}
                </div>
                <div className="text-xs text-slate-500">Horas Antigüedad</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.newestEntry > 0 ? Math.floor((Date.now() - stats.newestEntry) / (1000 * 60)) : 0}
                </div>
                <div className="text-xs text-slate-500">Minutos Última</div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-2 mt-3">
              <button
                onClick={() => selectedCompany && clearCache(selectedCompany.id)}
                className="px-3 py-1 text-xs bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                title="Limpiar cache de esta empresa"
              >
                🗑️ Limpiar Cache Empresa
              </button>
              <button
                onClick={() => clearCache()}
                className="px-3 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded hover:bg-orange-200 dark:hover:bg-orange-900/50 transition-colors"
                title="Limpiar todo el cache"
              >
                🧹 Limpiar Todo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Indicador de Uso de Imágenes */}
      <ImageUsageIndicator />

      {/* Selector de Temas Visuales */}
      <VisualThemeSelector />

      {/* Contenido colapsable */}
      <AnimatePresence>
        {isSectionVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
      {/* Buscador de Actividades */}
      <div className="mb-6">
        <form onSubmit={handleSearch} className="relative">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                placeholder="Buscar actividad (ej: restaurante, café, bar)..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                maxLength={50}
              />
              
              {/* Sugerencias */}
              <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                  >
                    {filteredSuggestions.map((suggestion) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full px-4 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button
              type="submit"
              disabled={!searchQuery.trim() || selectedActivities.length >= 3}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </div>
        </form>
        
        <p className="text-xs text-slate-500 mt-2">
          Máximo 3 actividades permitidas • Usa las sugerencias o escribe libremente
        </p>
      </div>

      {/* Actividades Seleccionadas */}
      {selectedActivities.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center">
            <Tag className="w-4 h-4 mr-2" />
            Actividades seleccionadas ({selectedActivities.length}/3)
          </h4>
          
          <div className="flex flex-wrap gap-2">
            {selectedActivities.map((activity) => (
              <motion.div
                key={activity}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-center space-x-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded-lg"
              >
                <span className="text-sm font-medium">{activity}</span>
                <button
                  onClick={() => removeActivity(activity)}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de Búsqueda */}
      {searchResults.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
            Imágenes encontradas para "{searchQuery}"
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {searchResults.map((image) => (
              <motion.div
                key={image.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="relative group cursor-pointer"
                onClick={() => selectImage(image)}
              >
                <PlaceholderImage
                  src={image.url}
                  alt={`${image.activity} - ${image.photographer}`}
                  className="w-full h-24 rounded-lg border-2 border-transparent group-hover:border-blue-500 transition-colors"
                  showIndicator={image.photographer.includes('Placeholder')}
                  size="sm"
                />
                
                {/* Overlay con información */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center pointer-events-none">
                  <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs font-medium">{image.activity}</p>
                    <p className="text-xs opacity-75">por {image.photographer}</p>
                  </div>
                </div>
                
                {/* Indicador de seleccionado */}
                {selectedImages.find(img => img.id === image.id) && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
                    <Plus className="w-3 h-3" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Imágenes Seleccionadas con Drag & Drop */}
      {selectedImages.length > 0 && (
        <div className="mb-6">
          <DragDropImages
            images={selectedImages.map(img => ({
              id: img.id,
              url: img.url,
              activity: img.activity,
              photographer: img.photographer,
              isPlaceholder: img.photographer.includes('Placeholder')
            }))}
            onReorder={handleImageReorder}
            onDelete={removeImage}
            onBulkAction={handleBulkAction}
            isLoading={isSaving}
            title="Imágenes Configuradas"
            showBulkActions={true}
          />
        </div>
      )}

      {/* Botón de Guardar */}
      {selectedActivities.length > 0 && (
        <div className="flex justify-end">
          <button
            onClick={async () => {
              await saveConfig();
              // Auto retraer sección tras guardar
              setSectionVisible(false);
            }}
            disabled={isSaving || selectedImages.length === 0}
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      )}

      {/* Estado vacío */}
      {selectedActivities.length === 0 && (
        <div className="text-center py-8 text-slate-500">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">Comienza agregando actividades para personalizar las imágenes de tu negocio</p>
        </div>
      )}

          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
