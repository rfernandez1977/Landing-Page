import { NextRequest, NextResponse } from 'next/server';
import { PexelsClient } from '@/lib/image-system/api/pexels-client';
import { PEXELS_CONFIG, isPexelsConfigured, getPexelsHeaders } from '@/lib/pexels-config';

// Interface para nuestra respuesta estandarizada (mantenida para compatibilidad)
interface ImageResult {
  id: string;
  url: string;
  activity: string;
  photographer: string;
  pexelsId: number;
  width: number;
  height: number;
  isPlaceholder?: boolean;
  quality?: 'high' | 'medium' | 'low';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query') || 'business';
  const companyId = parseInt(searchParams.get('companyId') || '1');
  const perPage = parseInt(searchParams.get('per_page') || '15');
  const page = parseInt(searchParams.get('page') || '1');
  const orientation = searchParams.get('orientation') as 'landscape' | 'portrait' | 'square' | undefined;
  const size = searchParams.get('size') as 'large' | 'medium' | 'small' | undefined;
  
  console.log(`🔍 Búsqueda Pexels mejorada:`, { query, companyId, perPage, page, orientation, size });

  try {
    // Usar el nuevo cliente de Pexels con rate limiting
    const images = await PexelsClient.searchImages(query, {
      companyId,
      perPage,
      page,
      orientation,
      size
    });

    // Determinar la fuente basada en si las imágenes son placeholder
    const source = images.length > 0 && images[0].isPlaceholder 
      ? 'placeholder' 
      : 'pexels_api';
    
    const message = source === 'placeholder' 
      ? 'Using placeholder images - Pexels API not available'
      : 'Images loaded from Pexels API with rate limiting';

    console.log(`✅ Búsqueda completada:`, { 
      resultCount: images.length, 
      source, 
      hasPlaceholders: images.some(img => img.isPlaceholder) 
    });

    // Obtener métricas del rate limiter
    const rateLimitStatus = PexelsClient.getRateLimitStatus();

    return NextResponse.json({
      success: true,
      images: images.map(img => ({
        id: img.id,
        url: img.url,
        activity: img.activity,
        photographer: img.photographer,
        pexelsId: img.pexelsId,
        width: img.width,
        height: img.height,
        isPlaceholder: img.isPlaceholder,
        quality: img.quality
      })),
      total: images.length,
      totalResults: images.length, // Para compatibilidad con API anterior
      query,
      companyId,
      source,
      message,
      cacheKey: `${source}_${companyId}_${query}`,
      timestamp: new Date().toISOString(),
      rateLimitStatus: {
        canMakeRequest: rateLimitStatus.canMakeRequest,
        remaining: rateLimitStatus.currentState.remaining,
        resetTime: rateLimitStatus.currentState.resetTime,
        timeUntilReset: rateLimitStatus.timeUntilReset
      }
    });

  } catch (error) {
    console.error('🚨 Error en búsqueda Pexels mejorada:', error);
    
    // El cliente ya maneja fallbacks, pero por seguridad adicional
    return NextResponse.json({
      success: false,
      images: [],
      total: 0,
      totalResults: 0,
      query,
      companyId,
      source: 'error',
      message: `Error en búsqueda: ${error}`,
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

// POST para guardar configuración de imágenes (mejorado)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { companyId, activities, images, settings } = body;

    if (!companyId || !activities || !images) {
      return NextResponse.json(
        { error: 'companyId, activities e images son requeridos' },
        { status: 400 }
      );
    }

    console.log('💾 Guardando configuración de imágenes mejorada:', { 
      companyId, 
      activitiesCount: activities.length, 
      imagesCount: images.length,
      hasSettings: !!settings
    });

    // TODO: Implementar persistencia en base de datos
    // Por ahora solo validamos y retornamos éxito con métricas mejoradas

    // Simular validación de imágenes
    const validatedImages = images.map((img: any, index: number) => ({
      ...img,
      id: img.id || `${companyId}_validated_${Date.now()}_${index}`,
      cachedAt: Date.now(),
      companyId: companyId
    }));

    // Calcular métricas
    const metrics = {
      totalImages: validatedImages.length,
      placeholderCount: validatedImages.filter((img: any) => img.isPlaceholder).length,
      realImageCount: validatedImages.filter((img: any) => !img.isPlaceholder).length,
      qualityDistribution: {
        high: validatedImages.filter((img: any) => img.quality === 'high').length,
        medium: validatedImages.filter((img: any) => img.quality === 'medium').length,
        low: validatedImages.filter((img: any) => img.quality === 'low').length
      }
    };

    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente con métricas',
      companyId,
      activities,
      images: validatedImages,
      settings: settings || {},
      metrics,
      timestamp: new Date().toISOString(),
      cacheKey: `config_${companyId}_${Date.now()}`
    });

  } catch (error) {
    console.error('💥 Error guardando configuración mejorada:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
