'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette, Sparkles, Camera, Sun, Moon, Zap, Heart, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface VisualTheme {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  colorScheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  imageFilters: {
    brightness: number;
    contrast: number;
    saturation: number;
    hue: number;
  };
  tags: string[];
}

const AVAILABLE_THEMES: VisualTheme[] = [
  {
    id: 'modern',
    name: 'Moderno y Minimalista',
    description: 'Estilo limpio y contemporáneo con colores neutros',
    icon: <Sparkles className="w-5 h-5" />,
    colorScheme: {
      primary: '#3B82F6',
      secondary: '#64748B',
      accent: '#10B981'
    },
    imageFilters: {
      brightness: 1.1,
      contrast: 1.2,
      saturation: 0.9,
      hue: 0
    },
    tags: ['contemporáneo', 'minimalista', 'profesional']
  },
  {
    id: 'vintage',
    name: 'Vintage y Retro',
    description: 'Estilo clásico con tonos cálidos y texturas',
    icon: <Camera className="w-5 h-5" />,
    colorScheme: {
      primary: '#D97706',
      secondary: '#92400E',
      accent: '#DC2626'
    },
    imageFilters: {
      brightness: 0.9,
      contrast: 1.3,
      saturation: 1.1,
      hue: 15
    },
    tags: ['clásico', 'cálido', 'nostálgico']
  },
  {
    id: 'nature',
    name: 'Natural y Orgánico',
    description: 'Inspirado en la naturaleza con colores tierra',
    icon: <Sun className="w-5 h-5" />,
    colorScheme: {
      primary: '#059669',
      secondary: '#65A30D',
      accent: '#D97706'
    },
    imageFilters: {
      brightness: 1.0,
      contrast: 1.1,
      saturation: 1.2,
      hue: 0
    },
    tags: ['natural', 'orgánico', 'tierra']
  },
  {
    id: 'bold',
    name: 'Audaz y Vibrante',
    description: 'Colores intensos y contrastes dramáticos',
    icon: <Zap className="w-5 h-5" />,
    colorScheme: {
      primary: '#DC2626',
      secondary: '#7C3AED',
      accent: '#F59E0B'
    },
    imageFilters: {
      brightness: 1.2,
      contrast: 1.4,
      saturation: 1.3,
      hue: 0
    },
    tags: ['intenso', 'dramático', 'energético']
  },
  {
    id: 'elegant',
    name: 'Elegante y Sofisticado',
    description: 'Estilo refinado con colores oscuros y dorados',
    icon: <Star className="w-5 h-5" />,
    colorScheme: {
      primary: '#1F2937',
      secondary: '#6B7280',
      accent: '#D97706'
    },
    imageFilters: {
      brightness: 0.8,
      contrast: 1.5,
      saturation: 0.8,
      hue: 0
    },
    tags: ['refinado', 'sofisticado', 'lujo']
  },
  {
    id: 'warm',
    name: 'Cálido y Acogedor',
    description: 'Tonos cálidos que transmiten confort',
    icon: <Heart className="w-5 h-5" />,
    colorScheme: {
      primary: '#DC2626',
      secondary: '#EA580C',
      accent: '#D97706'
    },
    imageFilters: {
      brightness: 1.0,
      contrast: 1.1,
      saturation: 1.1,
      hue: 10
    },
    tags: ['cálido', 'acogedor', 'confortable']
  }
];

export const VisualThemeSelector: React.FC = () => {
  const { selectedCompany } = useAuth();
  const [selectedTheme, setSelectedTheme] = useState<string>('modern');
  const [isVisible, setIsVisible] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Cargar tema guardado al montar el componente
  useEffect(() => {
    if (selectedCompany) {
      const savedTheme = localStorage.getItem(`facturaMovil_theme_${selectedCompany.id}`);
      if (savedTheme) {
        setSelectedTheme(savedTheme);
      }
    }
  }, [selectedCompany]);

  // Guardar tema seleccionado
  const saveTheme = (themeId: string) => {
    if (!selectedCompany) return;
    
    setSelectedTheme(themeId);
    localStorage.setItem(`facturaMovil_theme_${selectedCompany.id}`, themeId);
    
    // Aplicar tema a las imágenes existentes (simulado)
    console.log('🎨 Tema aplicado:', themeId);
    
    // Aquí podrías aplicar filtros CSS o transformar imágenes
    document.documentElement.style.setProperty('--theme-primary', AVAILABLE_THEMES.find(t => t.id === themeId)?.colorScheme.primary || '#3B82F6');
    document.documentElement.style.setProperty('--theme-secondary', AVAILABLE_THEMES.find(t => t.id === themeId)?.colorScheme.secondary || '#64748B');
    document.documentElement.style.setProperty('--theme-accent', AVAILABLE_THEMES.find(t => t.id === themeId)?.colorScheme.accent || '#10B981');
  };

  // Obtener tema actual
  const currentTheme = AVAILABLE_THEMES.find(t => t.id === selectedTheme) || AVAILABLE_THEMES[0];

  if (!selectedCompany) {
    return null;
  }

  return (
    <div className="mb-6">
      {/* Botón para mostrar/ocultar selector */}
      <div className="flex justify-center mb-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center space-x-2"
        >
          <Palette className="w-4 h-4" />
          <span>{isVisible ? 'Ocultar' : 'Mostrar'} Temas Visuales</span>
        </button>
      </div>

      {/* Panel de temas */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700 p-6"
          >
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-purple-100 dark:bg-purple-800 rounded-lg">
                <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                  Temas Visuales
                </h4>
                <p className="text-sm text-purple-700 dark:text-purple-300">
                  Personaliza el estilo visual de tus imágenes y productos
                </p>
              </div>
            </div>

            {/* Tema actual */}
            <div className="mb-6">
              <h5 className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-3">
                Tema Actual: {currentTheme.name}
              </h5>
              <div className="flex items-center space-x-4 p-4 bg-white dark:bg-slate-800 rounded-lg border border-purple-200 dark:border-purple-700">
                <div className="p-3 rounded-lg" style={{ backgroundColor: currentTheme.colorScheme.primary }}>
                  {currentTheme.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 dark:text-white">{currentTheme.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{currentTheme.description}</p>
                  <div className="flex space-x-2 mt-2">
                    {currentTheme.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentTheme.colorScheme.primary }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentTheme.colorScheme.secondary }}
                  ></div>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ backgroundColor: currentTheme.colorScheme.accent }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Grid de temas disponibles */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {AVAILABLE_THEMES.map((theme) => (
                <motion.div
                  key={theme.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedTheme === theme.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-600'
                  }`}
                  onClick={() => saveTheme(theme.id)}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: theme.colorScheme.primary }}
                    >
                      {theme.icon}
                    </div>
                    <div>
                      <h6 className="font-medium text-slate-900 dark:text-white">{theme.name}</h6>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{theme.description}</p>
                    </div>
                  </div>
                  
                  {/* Paleta de colores */}
                  <div className="flex space-x-2 mb-3">
                    <div
                      className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600"
                      style={{ backgroundColor: theme.colorScheme.primary }}
                      title="Color primario"
                    ></div>
                    <div
                      className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600"
                      style={{ backgroundColor: theme.colorScheme.secondary }}
                      title="Color secundario"
                    ></div>
                    <div
                      className="w-6 h-6 rounded-full border border-slate-200 dark:border-slate-600"
                      style={{ backgroundColor: theme.colorScheme.accent }}
                      title="Color de acento"
                    ></div>
                  </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1">
                    {theme.tags.slice(0, 2).map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Información adicional */}
            <div className="mt-6 bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-700">
              <div className="flex items-start space-x-3">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-purple-800 dark:text-purple-200">
                  <p className="font-medium mb-1">¿Cómo funciona?</p>
                  <p>
                    Los temas visuales se aplican automáticamente a todas las imágenes configuradas. 
                    Cada tema incluye una paleta de colores específica y filtros de imagen que se adaptan 
                    al estilo visual de tu negocio.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
