import { RateLimitState, ApiError } from '../core/types';

export class PexelsRateLimiter {
  private static readonly STORAGE_KEY = 'pexels_rate_limit_state';
  private static readonly DEFAULT_RETRY_DELAYS = [1000, 2000, 4000, 8000, 16000]; // Exponential backoff
  private static readonly MAX_RETRIES = 5;
  private static readonly REQUESTS_PER_HOUR = 200; // Pexels free tier limit
  private static readonly BURST_LIMIT = 20; // Conservative burst limit
  // Estado en memoria para entorno servidor (sin localStorage)
  private static memoryState: RateLimitState | null = null;

  private static isClient(): boolean {
    try {
      return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el estado actual del rate limiting
   */
  static getRateLimitState(): RateLimitState {
    try {
      if (this.isClient()) {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
          return this.createDefaultState();
        }
        const state: RateLimitState = JSON.parse(stored);
        if (Date.now() > state.resetTime) {
          return this.createDefaultState();
        }
        return state;
      }
      // Entorno servidor: usar estado en memoria
      if (!this.memoryState || Date.now() > this.memoryState.resetTime) {
        this.memoryState = this.createDefaultState();
      }
      return this.memoryState;
    } catch (error) {
      console.warn('🚨 Error al obtener estado de rate limiting:', error);
      return this.createDefaultState();
    }
  }

  /**
   * Actualiza el estado del rate limiting
   */
  static updateRateLimitState(remaining: number, resetTime?: number): void {
    try {
      const state: RateLimitState = {
        remaining,
        resetTime: resetTime || (Date.now() + (60 * 60 * 1000)), // 1 hora por defecto
        isLimited: remaining <= 0
      };
      if (this.isClient()) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      } else {
        this.memoryState = state;
      }
      console.log('📊 Estado de rate limiting actualizado:', state);
    } catch (error) {
      console.error('🚨 Error al actualizar estado de rate limiting:', error);
    }
  }

  /**
   * Verifica si podemos hacer una request ahora
   */
  static canMakeRequest(): boolean {
    const state = this.getRateLimitState();
    return !state.isLimited && state.remaining > 0;
  }

  /**
   * Ejecuta una operación con retry automático y rate limiting
   */
  static async withRetry<T>(
    operation: () => Promise<Response>,
    context: { query?: string; companyId?: number } = {}
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < this.MAX_RETRIES; attempt++) {
      try {
        // Verificar rate limiting antes del intento
        if (!this.canMakeRequest()) {
          const state = this.getRateLimitState();
          const waitTime = state.resetTime - Date.now();
          
          if (waitTime > 0) {
            throw new Error(`Rate limit excedido. Reintentar en ${Math.ceil(waitTime / 1000)} segundos.`);
          }
        }

        console.log(`🔄 Intento ${attempt + 1}/${this.MAX_RETRIES} para consulta Pexels:`, context.query);
        
        const response = await operation();
        
        // Actualizar rate limiting basado en headers de respuesta
        this.updateRateLimitFromHeaders(response.headers);
        
        if (response.ok) {
          console.log(`✅ Consulta Pexels exitosa en intento ${attempt + 1}`);
          return await response.json();
        }

        // Manejar errores específicos de Pexels
        await this.handlePexelsError(response, attempt);
        
      } catch (error) {
        lastError = error as Error;
        console.warn(`⚠️ Intento ${attempt + 1} falló:`, error);

        // Si es el último intento, lanzar el error
        if (attempt === this.MAX_RETRIES - 1) {
          break;
        }

        // Calcular delay para el próximo intento
        const delay = this.calculateBackoffDelay(attempt, error as Error);
        console.log(`⏳ Esperando ${delay}ms antes del próximo intento...`);
        
        await this.sleep(delay);
      }
    }

    // Si llegamos aquí, todos los intentos fallaron
    const errorMsg = `Falló después de ${this.MAX_RETRIES} intentos. Último error: ${lastError?.message}`;
    console.error('🚨 Rate limiter error final:', errorMsg);
    
    throw new Error(errorMsg);
  }

  /**
   * Maneja errores específicos de la API de Pexels
   */
  private static async handlePexelsError(response: Response, attempt: number): Promise<void> {
    const status = response.status;
    
    switch (status) {
      case 429: // Rate limit excedido
        const retryAfter = response.headers.get('retry-after');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : this.DEFAULT_RETRY_DELAYS[attempt] || 8000;
        
        this.updateRateLimitState(0, Date.now() + waitTime);
        console.warn(`🚨 Rate limit de Pexels excedido. Esperando ${waitTime}ms`);
        
        throw new Error(`Rate limit excedido. Reintentando en ${waitTime / 1000} segundos.`);
        
      case 401: // Unauthorized - API key issue
        console.error('🚨 API key de Pexels inválida o expirada');
        throw new Error('API key de Pexels inválida. Verificar configuración.');
        
      case 403: // Forbidden
        console.error('🚨 Acceso denegado por Pexels');
        throw new Error('Acceso denegado a la API de Pexels.');
        
      case 404: // Not found
        console.warn('⚠️ Búsqueda no retornó resultados');
        throw new Error('No se encontraron imágenes para esta búsqueda.');
        
      case 500:
      case 502:
      case 503:
      case 504: // Server errors
        console.warn(`⚠️ Error del servidor Pexels (${status}). Reintentando...`);
        throw new Error(`Error del servidor Pexels (${status}). Reintentando automáticamente.`);
        
      default:
        const errorText = await response.text();
        console.error(`🚨 Error desconocido de Pexels (${status}):`, errorText);
        throw new Error(`Error de Pexels (${status}): ${errorText}`);
    }
  }

  /**
   * Actualiza el rate limiting basado en los headers de respuesta
   */
  private static updateRateLimitFromHeaders(headers: Headers): void {
    try {
      const remaining = headers.get('x-ratelimit-remaining');
      const reset = headers.get('x-ratelimit-reset');
      
      if (remaining !== null) {
        const remainingRequests = parseInt(remaining);
        const resetTime = reset ? parseInt(reset) * 1000 : Date.now() + (60 * 60 * 1000);
        
        this.updateRateLimitState(remainingRequests, resetTime);
      }
    } catch (error) {
      console.warn('⚠️ Error al leer headers de rate limiting:', error);
    }
  }

  /**
   * Calcula el delay para backoff exponencial
   */
  private static calculateBackoffDelay(attempt: number, error: Error): number {
    // Si es un error de rate limiting, usar un delay más largo
    if (error.message.includes('Rate limit')) {
      return this.DEFAULT_RETRY_DELAYS[Math.min(attempt, this.DEFAULT_RETRY_DELAYS.length - 1)] * 2;
    }
    
    // Para otros errores, usar backoff exponencial normal
    return this.DEFAULT_RETRY_DELAYS[Math.min(attempt, this.DEFAULT_RETRY_DELAYS.length - 1)] || 8000;
  }

  /**
   * Crea un estado por defecto para rate limiting
   */
  private static createDefaultState(): RateLimitState {
    return {
      remaining: this.REQUESTS_PER_HOUR,
      resetTime: Date.now() + (60 * 60 * 1000), // 1 hora
      isLimited: false
    };
  }

  /**
   * Promesa que se resuelve después del delay especificado
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Obtiene métricas del rate limiter para debugging
   */
  static getMetrics(): {
    currentState: RateLimitState;
    canMakeRequest: boolean;
    timeUntilReset: number;
  } {
    const state = this.getRateLimitState();
    return {
      currentState: state,
      canMakeRequest: this.canMakeRequest(),
      timeUntilReset: Math.max(0, state.resetTime - Date.now())
    };
  }

  /**
   * Reinicia el estado del rate limiter (para testing o recuperación)
   */
  static reset(): void {
    if (this.isClient()) {
      localStorage.removeItem(this.STORAGE_KEY);
    } else {
      this.memoryState = null;
    }
    console.log('🔄 Rate limiter reiniciado');
  }
}
