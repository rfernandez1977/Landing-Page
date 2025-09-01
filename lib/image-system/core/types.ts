// Tipos centralizados para el sistema de imágenes dinámicas

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
  isPlaceholder?: boolean;
  quality?: 'high' | 'medium' | 'low';
  usage?: {
    timesUsed: number;
    lastUsed: number;
    contexts: string[];
  };
}

export interface CompanyImageConfig {
  companyId: number;
  activities: string[];
  images: CachedImage[];
  lastUpdated: number;
  settings?: {
    autoMapCategories: boolean;
    preferHighQuality: boolean;
    maxImagesPerActivity: number;
  };
  metadata?: {
    totalApiCalls: number;
    successfulCalls: number;
    lastApiCall: number;
  };
}

export interface ImageSearchResult {
  id: string;
  url: string;
  activity: string;
  photographer: string;
  pexelsId: number;
  width: number;
  height: number;
  isPlaceholder: boolean;
  quality: 'high' | 'medium' | 'low';
}

export interface RateLimitState {
  remaining: number;
  resetTime: number;
  retryAfter?: number;
  isLimited: boolean;
}

export interface ImageUsageMetrics {
  totalProducts: number;
  imagesInUse: number;
  cacheHitRate: number;
  unusedImages: number;
  usageBreakdown: Array<{
    activity: string;
    count: number;
    percentage: number;
  }>;
  apiMetrics: {
    totalCalls: number;
    successRate: number;
    averageResponseTime: number;
    errorsLast24h: number;
  };
}

export interface DragDropResult {
  sourceIndex: number;
  destinationIndex: number;
  itemId: string;
  context: 'selected-images' | 'search-results' | 'product-grid';
}

export interface BulkAction {
  type: 'apply-to-all' | 'clear-all' | 'delete-unused' | 'refresh-cache';
  scope: 'company' | 'activity' | 'selection';
  targetIds?: string[];
  confirmation?: boolean;
}

export interface CategoryMapping {
  categoryCode: string;
  categoryName: string;
  suggestedActivities: string[];
  businessDomain: 'food' | 'retail' | 'services' | 'health' | 'education' | 'other';
  confidence: number;
}

export interface PexelsApiResponse {
  photos: Array<{
    id: number;
    url: string;
    photographer: string;
    src: {
      medium: string;
      large: string;
      original: string;
    };
    width: number;
    height: number;
  }>;
  total_results: number;
  page: number;
  per_page: number;
  next_page?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  context?: {
    companyId?: number;
    query?: string;
    endpoint?: string;
  };
}

// Estados de UI
export type ImageLoadingState = 'idle' | 'loading' | 'success' | 'error' | 'rate-limited';
export type SearchState = 'idle' | 'searching' | 'results' | 'no-results' | 'error';
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

// Configuración del sistema
export interface ImageSystemConfig {
  cache: {
    ttl: number;
    maxSize: number;
    cleanupInterval: number;
  };
  pexels: {
    apiKey?: string;
    rateLimit: {
      requestsPerHour: number;
      burstLimit: number;
      backoffMultiplier: number;
      maxRetries: number;
    };
  };
  ui: {
    dragDropEnabled: boolean;
    bulkActionsEnabled: boolean;
    autoSaveEnabled: boolean;
    placeholderIndicatorEnabled: boolean;
  };
  persistence: {
    provider: 'localStorage' | 'database' | 'api';
    endpoint?: string;
    encryptionEnabled: boolean;
  };
}
