'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PlaceholderImageIndicatorProps {
  size?: 'sm' | 'md' | 'lg';
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  className?: string;
  context?: 'search' | 'selected' | 'product' | 'grid';
}

export const PlaceholderImageIndicator: React.FC<PlaceholderImageIndicatorProps> = ({ 
  size = 'md', 
  position = 'top-right',
  className = '',
  context = 'search'
}) => {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3', 
    lg: 'w-4 h-4'
  };

  const positionClasses = {
    'top-right': 'top-1 right-1',
    'top-left': 'top-1 left-1',
    'bottom-right': 'bottom-1 right-1',
    'bottom-left': 'bottom-1 left-1'
  };

  // Colores diferentes según el contexto
  const contextColors = {
    search: 'bg-orange-500 border-orange-300',
    selected: 'bg-blue-500 border-blue-300',
    product: 'bg-amber-500 border-amber-300 shadow-lg',
    grid: 'bg-purple-500 border-purple-300'
  };

  const tooltipText = {
    search: 'Imagen de muestra - No hay API key configurada',
    selected: 'Imagen seleccionada de muestra',
    product: 'Producto con imagen de muestra',
    grid: 'Imagen de demostración'
  };

  return (
    <div 
      className={cn(
        'absolute z-10 rounded-full border-2 animate-pulse',
        'cursor-help transition-all duration-200',
        'hover:scale-110 hover:animate-none',
        sizeClasses[size],
        positionClasses[position],
        contextColors[context],
        className
      )}
      title={tooltipText[context]}
      role="img"
      aria-label={tooltipText[context]}
    >
      {/* Punto interno más pequeño para mejor visual */}
      <div className={cn(
        'absolute inset-1 rounded-full bg-white opacity-80',
        'animate-ping'
      )} />
    </div>
  );
};

interface PlaceholderImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  showIndicator?: boolean;
  indicatorSize?: 'sm' | 'md' | 'lg';
  indicatorPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
  context?: 'search' | 'selected' | 'product' | 'grid';
  fallbackSrc?: string;
  onImageError?: (error: any) => void;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({ 
  src,
  alt = '',
  className = '',
  showIndicator = false,
  indicatorSize = 'md',
  indicatorPosition = 'top-right',
  context = 'search',
  fallbackSrc,
  onImageError,
  ...props 
}) => {
  const [imageError, setImageError] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  const handleImageError = (error: any) => {
    console.warn('⚠️ Error cargando imagen:', src, error);
    setImageError(true);
    setIsLoading(false);
    onImageError?.(error);
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    setImageError(false);
  };

  const imageSrc = imageError && fallbackSrc ? fallbackSrc : src;

  return (
    <div className="relative inline-block">
      {/* Loading skeleton */}
      {isLoading && (
        <div className={cn(
          'absolute inset-0 bg-gray-200 dark:bg-gray-700 animate-pulse rounded',
          'flex items-center justify-center',
          className
        )}>
          <div className="text-gray-400 text-xs">Cargando...</div>
        </div>
      )}

      {/* Imagen principal */}
      <img
        src={imageSrc}
        alt={alt}
        className={cn(
          'transition-opacity duration-200',
          isLoading ? 'opacity-0' : 'opacity-100',
          imageError ? 'filter grayscale opacity-50' : '',
          className
        )}
        onLoad={handleImageLoad}
        onError={handleImageError}
        loading="lazy"
        {...props}
      />

      {/* Indicador de placeholder */}
      {showIndicator && (
        <PlaceholderImageIndicator 
          size={indicatorSize}
          position={indicatorPosition}
          context={context}
        />
      )}

      {/* Overlay para productos con placeholder */}
      {showIndicator && context === 'product' && (
        <div className="absolute inset-0 bg-black bg-opacity-10 rounded transition-opacity duration-200 hover:bg-opacity-5" />
      )}

      {/* Badge de estado para contexto product */}
      {context === 'product' && showIndicator && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b">
          <div className="text-xs text-white opacity-80 flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
            Imagen demo
          </div>
        </div>
      )}

      {/* Error fallback */}
      {imageError && !fallbackSrc && (
        <div className={cn(
          'absolute inset-0 bg-gray-100 dark:bg-gray-800 rounded',
          'flex flex-col items-center justify-center text-gray-500 text-xs',
          className
        )}>
          <div className="mb-1">📷</div>
          <div>Sin imagen</div>
        </div>
      )}
    </div>
  );
};

// Hook personalizado para manejar indicadores de placeholder
export const usePlaceholderIndicator = (
  photographer?: string, 
  context: 'search' | 'selected' | 'product' | 'grid' = 'search'
) => {
  const isPlaceholder = React.useMemo(() => {
    return photographer?.includes('Placeholder') || photographer?.includes('placeholder');
  }, [photographer]);

  const indicatorProps = React.useMemo(() => ({
    showIndicator: isPlaceholder,
    context,
    // Tamaño según contexto
    indicatorSize: context === 'product' ? 'lg' as const : 'md' as const,
    // Posición según contexto
    indicatorPosition: context === 'product' ? 'top-right' as const : 'top-right' as const
  }), [isPlaceholder, context]);

  return {
    isPlaceholder,
    indicatorProps
  };
};

// Componente especializado para tarjetas de producto
export const ProductImage: React.FC<PlaceholderImageProps & {
  product?: {
    name: string;
    photographer?: string;
  };
}> = ({ product, ...props }) => {
  const { isPlaceholder, indicatorProps } = usePlaceholderIndicator(
    product?.photographer, 
    'product'
  );

  return (
    <PlaceholderImage
      {...props}
      {...indicatorProps}
      alt={props.alt || product?.name || 'Imagen del producto'}
      onImageError={(error) => {
        console.warn(`⚠️ Error cargando imagen del producto ${product?.name}:`, error);
        props.onImageError?.(error);
      }}
    />
  );
};
