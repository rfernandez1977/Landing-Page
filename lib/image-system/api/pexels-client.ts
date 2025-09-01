import { PexelsRateLimiter } from './rate-limiter';
import { PexelsApiResponse, ImageSearchResult, ApiError } from '../core/types';
import { PEXELS_CONFIG, isPexelsConfigured, getPexelsHeaders } from '@/lib/pexels-config';

export class PexelsClient {
  private static readonly BASE_URL = 'https://api.pexels.com/v1';
  private static readonly DEFAULT_PER_PAGE = 15;
  private static readonly MAX_PER_PAGE = 80;

  /**
   * Busca imágenes en Pexels con rate limiting y retry automático
   */
  static async searchImages(
    query: string,
    options: {
      companyId: number;
      perPage?: number;
      page?: number;
      orientation?: 'landscape' | 'portrait' | 'square';
      size?: 'large' | 'medium' | 'small';
    }
  ): Promise<ImageSearchResult[]> {
    const { companyId, perPage = this.DEFAULT_PER_PAGE, page = 1, orientation, size } = options;

    console.log(`🔍 Buscando imágenes en Pexels:`, { query, companyId, perPage, page });

    // Verificar si Pexels está configurado
    if (!isPexelsConfigured()) {
      console.log('⚠️ API key de Pexels no configurada, usando placeholders');
      return this.generatePlaceholderResults(query, companyId, perPage);
    }

    try {
      // Usar rate limiter para la búsqueda
      const response = await PexelsRateLimiter.withRetry<PexelsApiResponse>(
        () => this.makeSearchRequest(query, { perPage, page, orientation, size }),
        { query, companyId }
      );

      console.log(`✅ Respuesta de Pexels:`, { 
        totalResults: response.total_results, 
        page: response.page, 
        photosCount: response.photos.length 
      });

      // Convertir respuesta de Pexels a nuestro formato
      return this.transformPexelsResponse(response, query, companyId);

    } catch (error) {
      console.error('🚨 Error en búsqueda de Pexels:', error);
      
      // En caso de error, devolver placeholders como fallback
      console.log('🔄 Usando placeholders como fallback tras error');
      return this.generatePlaceholderResults(query, companyId, perPage);
    }
  }

  /**
   * Realiza la request HTTP a Pexels
   */
  private static async makeSearchRequest(
    query: string,
    options: {
      perPage: number;
      page: number;
      orientation?: string;
      size?: string;
    }
  ): Promise<Response> {
    const { perPage, page, orientation, size } = options;
    
    // Construir URL con parámetros
    const url = new URL(`${this.BASE_URL}/search`);
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', Math.min(perPage, this.MAX_PER_PAGE).toString());
    url.searchParams.set('page', page.toString());
    
    if (orientation) {
      url.searchParams.set('orientation', orientation);
    }
    
    if (size) {
      url.searchParams.set('size', size);
    }

    console.log(`📡 Request a Pexels:`, url.toString());

    const headers = getPexelsHeaders();
    
    return fetch(url.toString(), {
      method: 'GET',
      headers,
    });
  }

  /**
   * Transforma la respuesta de Pexels a nuestro formato interno
   */
  private static transformPexelsResponse(
    response: PexelsApiResponse,
    query: string,
    companyId: number
  ): ImageSearchResult[] {
    return response.photos.map((photo, index) => ({
      id: `pexels_${companyId}_${photo.id}_${Date.now()}`,
      url: photo.src.medium,
      activity: query,
      photographer: photo.photographer,
      pexelsId: photo.id,
      width: photo.width,
      height: photo.height,
      isPlaceholder: false,
      quality: this.determineImageQuality(photo.width, photo.height)
    }));
  }

  /**
   * Determina la calidad de la imagen basada en las dimensiones
   */
  private static determineImageQuality(width: number, height: number): 'high' | 'medium' | 'low' {
    const pixels = width * height;
    
    if (pixels >= 1920 * 1080) return 'high';
    if (pixels >= 1280 * 720) return 'medium';
    return 'low';
  }

  /**
   * Genera resultados placeholder cuando Pexels no está disponible
   */
  private static generatePlaceholderResults(
    query: string,
    companyId: number,
    count: number
  ): ImageSearchResult[] {
    const placeholderImages = this.getPlaceholderImagesForActivity(query);
    
    return Array.from({ length: Math.min(count, placeholderImages.length) }, (_, index) => {
      const baseUrl = placeholderImages[index % placeholderImages.length];
      const uniqueUrl = `${baseUrl}&v=${Date.now()}&q=${encodeURIComponent(query)}&i=${index}&c=${companyId}`;
      
      return {
        id: `placeholder_${companyId}_${query}_${index}_${Date.now()}`,
        url: uniqueUrl,
        activity: query,
        photographer: 'Pexels (Placeholder)',
        pexelsId: 0,
        width: 600,
        height: 400,
        isPlaceholder: true,
        quality: 'medium'
      };
    });
  }

  /**
   * Obtiene imágenes placeholder para una actividad específica
   */
  private static getPlaceholderImagesForActivity(activity: string): string[] {
    const placeholderMap: Record<string, string[]> = {
      'restaurante': [
        'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1307698/pexels-photo-1307698.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/2096983/pexels-photo-2096983.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      'café': [
        'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/851555/pexels-photo-851555.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      'bar': [
        'https://images.pexels.com/photos/350478/pexels-photo-350478.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/593965/pexels-photo-593965.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      'supermercado': [
        'https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/4968391/pexels-photo-4968391.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/2292837/pexels-photo-2292837.jpeg?auto=compress&cs=tinysrgb&w=600'
      ],
      'retail': [
        'https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/135620/pexels-photo-135620.jpeg?auto=compress&cs=tinysrgb&w=600',
        'https://images.pexels.com/photos/974911/pexels-photo-974911.jpeg?auto=compress&cs=tinysrgb&w=600'
      ]
    };

    const activityKey = activity.toLowerCase();
    return placeholderMap[activityKey] || placeholderMap['retail'] || [];
  }

  /**
   * Valida una imagen específica de Pexels
   */
  static async validateImage(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      return response.ok && response.headers.get('content-type')?.startsWith('image/');
    } catch (error) {
      console.warn('⚠️ Error validando imagen:', url, error);
      return false;
    }
  }

  /**
   * Obtiene información detallada de una imagen por su ID de Pexels
   */
  static async getImageDetails(pexelsId: number): Promise<ImageSearchResult | null> {
    if (!isPexelsConfigured()) {
      return null;
    }

    try {
      const response = await PexelsRateLimiter.withRetry<any>(
        () => fetch(`${this.BASE_URL}/photos/${pexelsId}`, {
          headers: getPexelsHeaders()
        }),
        { query: `photo_${pexelsId}` }
      );

      return {
        id: `pexels_detail_${pexelsId}_${Date.now()}`,
        url: response.src.medium,
        activity: '',
        photographer: response.photographer,
        pexelsId: response.id,
        width: response.width,
        height: response.height,
        isPlaceholder: false,
        quality: this.determineImageQuality(response.width, response.height)
      };

    } catch (error) {
      console.error('🚨 Error obteniendo detalles de imagen:', error);
      return null;
    }
  }

  /**
   * Obtiene el estado actual del rate limiter
   */
  static getRateLimitStatus() {
    return PexelsRateLimiter.getMetrics();
  }

  /**
   * Reinicia el rate limiter (útil para testing)
   */
  static resetRateLimit() {
    PexelsRateLimiter.reset();
  }
}
