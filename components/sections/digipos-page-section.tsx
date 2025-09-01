"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Search, ShoppingBag, DollarSign, CreditCard, Receipt, BarChart, RefreshCw, Loader2, FileText, CheckCircle2, User, X, ChevronDown, Building2, Mail, Shield } from "lucide-react";
import { ImageConfigSection } from "./image-config-section";
import { useAuth } from "@/contexts/AuthContext";
import CryptoJS from 'crypto-js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// Configuración centralizada
import { API_CONFIG, API_ENDPOINTS, API_HEADERS, APP_CONFIG, ERROR_MESSAGES, getApiConfig, getAuthHeaders, getCompanyEndpoints } from '@/lib/config';
import { ImageCacheService } from '@/lib/image-cache-service';
import { ProductImage, usePlaceholderIndicator } from '@/components/ui/placeholder-image-indicator';
import { getSmartActivityMapping } from '@/lib/image-system/mapping/categories';

// Imágenes por defecto para productos (temporales)
const DEFAULT_IMAGES = [
  "https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/350478/pexels-photo-350478.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?auto=compress&cs=tinysrgb&w=600"
];

// Productos por defecto (fallback)
const DEFAULT_PRODUCTS = [
  { id: 1, name: "Café Americano", price: 3990, image: DEFAULT_IMAGES[0], code: "DEMO001", unit: { id: 1, code: "Un", name: "Unidad" }, category: { id: 1, code: "CAFE", name: "Café" } },
  { id: 2, name: "Cappuccino", price: 4500, image: DEFAULT_IMAGES[1], code: "DEMO002", unit: { id: 1, code: "Un", name: "Unidad" }, category: { id: 1, code: "CAFE", name: "Café" } },
  { id: 3, name: "Croissant", price: 2990, image: DEFAULT_IMAGES[2], code: "DEMO003", unit: { id: 1, code: "Un", name: "Unidad" }, category: { id: 2, code: "COMIDA", name: "Comida" } },
  { id: 4, name: "Sándwich Vegano", price: 7490, image: DEFAULT_IMAGES[3], code: "DEMO004", unit: { id: 1, code: "Un", name: "Unidad" }, category: { id: 2, code: "COMIDA", name: "Comida" } }
];

// Interface para productos de la API
interface Product {
  id: number;
  code: string;
  name: string;
  price: number;
  image: string;
  unit: {
    id: number;
    code: string;
    name: string;
  };
  category: {
    id: number;
    code: string;
    name: string;
    otherTax?: {
      id: number;
      code: string;
      name: string;
      percent: number;
    };
  };
}

type CartItem = {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category?: {
    id: number;
    name: string;
    code: string;
    otherTax?: {
      id: number;
      code: string;
      name: string;
      percent: number;
    };
  };
};

interface Client {
  id: number;
  code: string;
  name: string;
  address: string;
  additionalAddress?: Array<{
    id: number;
    address: string;
    municipality: {
      id: number;
      code: string;
      name: string;
    };
  }>;
  email?: string;
  municipality?: {
    id: number;
    code: string;
    name: string;
  };
  activity?: {
    id: number;
    code: string;
    name: string;
  };
  line?: string;
}

interface SearchState {
  isSearching: boolean;
  results: Client[];
  error: string | null;
  selectedClient: Client | null;
}



export function DigiPosPageSection() {
  const { toast } = useToast();
  const { user, selectedCompany, isAuthenticated } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearchQuery, setProductSearchQuery] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [documentType, setDocumentType] = useState<'boleta' | 'factura'>('boleta');
  const [showClientForm, setShowClientForm] = useState(false);
  const [clientData, setClientData] = useState({
    rut: '',
    name: '',
    address: '',
    email: '',
    selectedAddressIndex: 0
  });
  const [savedClientData, setSavedClientData] = useState<Client | null>(null);
  const [clientSaved, setClientSaved] = useState(false);
  const [searchState, setSearchState] = useState<SearchState>({
    isSearching: false,
    results: [],
    error: null,
    selectedClient: null
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  
  // Estados para productos de la API
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // Estados para búsqueda de productos
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [isSearchingProducts, setIsSearchingProducts] = useState(false);
  const [searchProductsError, setSearchProductsError] = useState<string | null>(null);
  const [searchProductsResults, setSearchProductsResults] = useState<Product[]>([]);
  
  // Debounce para búsqueda de productos
  const [debouncedProductSearch, setDebouncedProductSearch] = useState(productSearchTerm);
  
  // Estados para edición de precios y cantidades en el carrito
  const [editingItem, setEditingItem] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState<string>('');
  const [editingQuantity, setEditingQuantity] = useState<string>('');
  
  // Estados para impresión de documentos
  const [isGeneratingDocument, setIsGeneratingDocument] = useState(false);
  const [documentId, setDocumentId] = useState<number | null>(null);
  const [assignedFolio, setAssignedFolio] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  

  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProductSearch(productSearchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [productSearchTerm]);

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Función para obtener imagen por índice con cache inteligente
  const getProductImage = (index: number): string => {
    if (selectedCompany) {
      const cachedImage = ImageCacheService.getRandomProductImage(selectedCompany.id, index);
      if (cachedImage) return cachedImage;
    }
    return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
  };

  // Normaliza categoría a actividad buscable
  const getActivityFromCategory = (raw?: string | null): string | null => {
    if (!raw) return null;
    const value = String(raw).toLowerCase();
    if (value.includes('café') || value.includes('cafe') || value.includes('coffee')) return 'café';
    if (value.includes('rest') || value.includes('restaurant') || value.includes('restaurante')) return 'restaurante';
    if (value.includes('bar')) return 'bar';
    if (value.includes('piz') || value.includes('pizza')) return 'pizzeria';
    if (value.includes('pan') || value.includes('bakery') || value.includes('panadería') || value.includes('panaderia')) return 'panadería';
    if (value.includes('comida') || value.includes('food')) return 'comida';
    if (value.includes('super') || value.includes('market') || value.includes('mercado')) return 'supermercado';
    if (value.includes('retail') || value.includes('tienda')) return 'retail';
    if (value.includes('farmacia') || value.includes('pharma') || value.includes('drug')) return 'farmacia';
    return value; // fallback: usa el texto como actividad
  };

  // Obtiene imagen preferente por categoría/actividad con mapeo inteligente
  const getProductImageFor = (categoryNameOrCode: string | undefined, index: number, categoryName?: string): string => {
    if (!selectedCompany) {
      return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
    }

    // Usar mapeo inteligente de categorías
    const mapping = getSmartActivityMapping(categoryNameOrCode, categoryName, selectedCompany.id);
    
    console.log(`🎯 Mapeo inteligente para categoria "${categoryNameOrCode}"/"${categoryName}":`, {
      primaryActivities: mapping.primaryActivities,
      businessDomain: mapping.businessDomain,
      confidence: mapping.confidence
    });

    // Intentar con actividades primarias primero
    for (const activity of mapping.primaryActivities) {
      const byActivity = ImageCacheService.getImagesByActivity(selectedCompany.id, activity);
      if (byActivity && byActivity.length > 0) {
        const img = byActivity[index % byActivity.length];
        if (img?.url) {
          console.log(`✅ Imagen encontrada para actividad "${activity}":`, img.url);
          return img.url;
        }
      }
    }

    // Fallback a todas las sugerencias
    for (const activity of mapping.allSuggestions) {
      const byActivity = ImageCacheService.getImagesByActivity(selectedCompany.id, activity);
      if (byActivity && byActivity.length > 0) {
        const img = byActivity[index % byActivity.length];
        if (img?.url) {
          console.log(`✅ Imagen encontrada (fallback) para actividad "${activity}":`, img.url);
          return img.url;
        }
      }
    }

    // Fallback a imagen aleatoria del cache de la empresa
    const random = ImageCacheService.getRandomProductImage(selectedCompany.id, index);
    if (random) {
      console.log(`🔄 Usando imagen aleatoria del cache:`, random);
      return random;
    }

    // Último fallback a imágenes por defecto
    console.log(`⚠️ Usando imagen por defecto para índice ${index}`);
    return DEFAULT_IMAGES[index % DEFAULT_IMAGES.length];
  };

  // Escuchar eventos de actualización de configuración de imágenes
  useEffect(() => {
    const handleImagesConfigUpdated = (event: CustomEvent) => {
      console.log('🔄 Evento de actualización de imágenes recibido:', event.detail);
      
      // Forzar recarga de productos desde API para asegurar actualización completa
      console.log('🌐 Recargando productos desde API tras guardar configuración de imágenes...');
      loadProductsFromAPI();
    };

    window.addEventListener('imagesConfigUpdated', handleImagesConfigUpdated as EventListener);
    
    return () => {
      window.removeEventListener('imagesConfigUpdated', handleImagesConfigUpdated as EventListener);
    };
  }, [products, selectedCompany]);

  // Función para formatear precio de centavos a moneda chilena (números enteros)
  const formatPrice = (priceInCents: number): string => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(priceInCents);
  };

  // Función para validar formato de RUT chileno
  const validateRutFormat = (rut: string): boolean => {
    // Formato básico: XXXXXXXX-X o XXXXXXXX-X
    const rutRegex = /^\d{1,8}-[\dkK]$/;
    return rutRegex.test(rut);
  };

  // Función para formatear RUT automáticamente
  const formatRut = (rut: string): string => {
    // Remover todos los caracteres no numéricos excepto 'k' o 'K'
    const cleanRut = rut.replace(/[^0-9kK]/g, '');
    
    if (cleanRut.length === 0) return '';
    
    // Separar número y dígito verificador
    const number = cleanRut.slice(0, -1);
    const dv = cleanRut.slice(-1).toUpperCase();
    
    // Formatear con guión
    return `${number}-${dv}`;
  };

  // Función para calcular precio con impuestos para visualización en listas
  const calculatePriceWithTaxes = (product: Product): { netPrice: number; totalPrice: number; hasOtherTax: boolean } => {
    const netPrice = product.price;
    let totalPrice = netPrice;
    
    // Agregar IVA (19%)
    const ivaAmount = netPrice * 0.19;
    totalPrice += ivaAmount;
    
    // Agregar impuestos adicionales si existen
    const hasOtherTax = !!product.category?.otherTax;
    if (hasOtherTax) {
      const otherTaxAmount = netPrice * (product.category.otherTax!.percent / 100);
      totalPrice += otherTaxAmount;
    }
    
    return {
      netPrice,
      totalPrice: Math.round(totalPrice),
      hasOtherTax
    };
  };

  // Función para cargar productos desde la API
  const loadProductsFromAPI = async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    
    try {
      // Usar configuración centralizada
      const apiConfig = getApiConfig();
      console.log('Cargando productos desde API:', apiConfig.endpoints.PRODUCTS);
      
      const response = await fetch(`${apiConfig.endpoints.PRODUCTS}&token=${apiConfig.token}`, {
        method: 'GET',
        headers: apiConfig.headers
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Respuesta de API de productos:', data);
      
      if (data.products && Array.isArray(data.products)) {
        console.log('Productos cargados desde API:', data.products.length);
        
        // Mapear productos de la API al formato interno con imágenes
        const mappedProducts = data.products.map((apiProduct: any, index: number) => {
          const mappedProduct: Product = {
            id: apiProduct.id,
            code: apiProduct.code,
            name: apiProduct.name,
            price: apiProduct.price,
            image: getProductImageFor(apiProduct.category?.code, index, apiProduct.category?.name),
            unit: {
              id: apiProduct.unit.id,
              code: apiProduct.unit.code,
              name: apiProduct.unit.name
            },
            category: {
              id: apiProduct.category.id,
              code: apiProduct.category.code,
              name: apiProduct.category.name,
              otherTax: apiProduct.category.otherTax ? {
                id: apiProduct.category.otherTax.id,
                code: apiProduct.category.otherTax.code,
                name: apiProduct.category.otherTax.name,
                percent: apiProduct.category.otherTax.percent
              } : undefined
            }
          };
          
          return mappedProduct;
        });
        
        setProducts(mappedProducts);
        console.log('Productos iniciales mapeados correctamente:', mappedProducts.length);
      } else {
        throw new Error('Formato de respuesta inválido - no se encontró array de productos');
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      setProductsError('Error al cargar productos desde la API');
      // Fallback a productos por defecto
      setProducts(DEFAULT_PRODUCTS);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Función para buscar productos desde la API
  const searchProductsFromAPI = async (searchTerm: string) => {
    console.log('🔍 INICIO BÚSQUEDA:', { 
      searchTerm, 
      timestamp: new Date().toISOString(),
      searchTermLength: searchTerm.length 
    });
    
    if (!searchTerm.trim()) {
      console.log('⚠️ Término de búsqueda vacío, limpiando resultados');
      setSearchProductsResults([]);
      setSearchProductsError(null);
      return;
    }

    setIsSearchingProducts(true);
    setSearchProductsError(null);
    
    try {
      console.log('🌐 CONSTRUYENDO URL DE BÚSQUEDA...');
      
      // Usar configuración centralizada
      const apiConfig = getApiConfig();
      const searchUrl = `${apiConfig.endpoints.PRODUCTS}&token=${apiConfig.token}&search=${encodeURIComponent(searchTerm)}`;
      
      console.log('📡 URL CONSTRUIDA:', searchUrl);
      
      console.log('📤 HEADERS ENVIADOS:', apiConfig.headers);
      
      console.log('🚀 INICIANDO FETCH...');
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: apiConfig.headers
      });

      console.log('📥 RESPUESTA RECIBIDA:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      if (!response.ok) {
        console.error('❌ ERROR HTTP:', response.status, response.statusText);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      console.log('📊 PARSEANDO JSON...');
      const data = await response.json();
      console.log('📋 DATOS PARSEADOS:', data);
      
      console.log('🔍 VALIDANDO ESTRUCTURA DE DATOS...');
      console.log('📦 data.products existe:', !!data.products);
      console.log('📦 data.products es array:', Array.isArray(data.products));
      console.log('📦 Tipo de data.products:', typeof data.products);
      
      if (data.products && Array.isArray(data.products)) {
        console.log('✅ ESTRUCTURA VÁLIDA - Productos encontrados:', data.products.length);
        console.log('📋 PRIMER PRODUCTO EJEMPLO:', data.products[0]);
        
        console.log('🔄 INICIANDO MAPEO DE PRODUCTOS...');
        // Mapear productos de la API al formato interno con imágenes
        const mappedSearchResults = data.products.map((apiProduct: any, index: number) => {
          console.log(`🔄 Mapeando producto ${index + 1}:`, {
            id: apiProduct.id,
            name: apiProduct.name,
            hasUnit: !!apiProduct.unit,
            hasCategory: !!apiProduct.category,
            hasOtherTax: !!apiProduct.category?.otherTax
          });
          
          const mappedProduct: Product = {
            id: apiProduct.id,
            code: apiProduct.code,
            name: apiProduct.name,
            price: apiProduct.price,
            image: getProductImageFor(apiProduct.category?.code, index, apiProduct.category?.name),
            unit: {
              id: apiProduct.unit.id,
              code: apiProduct.unit.code,
              name: apiProduct.unit.name
            },
            category: {
              id: apiProduct.category.id,
              code: apiProduct.category.code,
              name: apiProduct.category.name,
              otherTax: apiProduct.category.otherTax ? {
                id: apiProduct.category.otherTax.id,
                code: apiProduct.category.otherTax.code,
                name: apiProduct.category.otherTax.name,
                percent: apiProduct.category.otherTax.percent
              } : undefined
            }
          };
          
          console.log(`✅ Producto ${index + 1} mapeado exitosamente:`, mappedProduct.name);
          return mappedProduct;
        });
        
        console.log('🎯 ACTUALIZANDO ESTADO CON RESULTADOS...');
        setSearchProductsResults(mappedSearchResults);
        console.log('✅ BÚSQUEDA COMPLETADA - Total de resultados:', mappedSearchResults.length);
      } else {
        console.warn('⚠️ ESTRUCTURA INVÁLIDA - No se encontraron productos o formato incorrecto');
        console.log('📋 ESTRUCTURA RECIBIDA:', data);
        setSearchProductsResults([]);
      }
    } catch (error: any) {
      console.error('💥 ERROR CAPTURADO:', error);
      console.error('💥 TIPO DE ERROR:', error?.constructor?.name || 'Unknown');
      console.error('💥 MENSAJE DE ERROR:', error?.message || 'Error desconocido');
      console.error('💥 STACK TRACE:', error?.stack || 'No disponible');
      
      // Determinar tipo específico de error
      let errorMessage = 'Error al buscar productos';
      if (error?.name === 'TypeError' && error?.message?.includes('fetch')) {
        errorMessage = 'Error de conexión - Verifique su conexión a internet';
      } else if (error?.message?.includes('404')) {
        errorMessage = 'No se encontraron productos con ese término';
      } else if (error?.message?.includes('401') || error?.message?.includes('403')) {
        errorMessage = 'Error de autenticación - Token inválido';
      } else if (error?.message?.includes('500')) {
        errorMessage = 'Error del servidor - Intente más tarde';
      }
      
      console.error('💥 MENSAJE DE ERROR FINAL:', errorMessage);
      setSearchProductsError(errorMessage);
      setSearchProductsResults([]);
    } finally {
      console.log('🏁 FINALIZANDO BÚSQUEDA - Limpiando estado de carga');
      setIsSearchingProducts(false);
    }
  };

  // Cargar productos al montar el componente
  useEffect(() => {
    loadProductsFromAPI();
  }, []);

  // Efecto para búsqueda de productos con debounce
  useEffect(() => {
    if (debouncedProductSearch) {
      searchProductsFromAPI(debouncedProductSearch);
    } else {
      setSearchProductsResults([]);
      setSearchProductsError(null);
    }
  }, [debouncedProductSearch]);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        return prevCart.map(item => 
          item.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Asegurar que se incluya la información de categoría e impuestos adicionales
        const cartItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: 1,
          category: product.category ? {
            id: product.category.id,
            name: product.category.name,
            code: product.category.code,
            otherTax: product.category.otherTax ? {
              id: product.category.otherTax.id,
              code: product.category.otherTax.code,
              name: product.category.otherTax.name,
              percent: product.category.otherTax.percent
            } : undefined
          } : undefined
        };
        
        console.log('🛒 Agregando producto al carrito con impuestos:', {
          productName: product.name,
          hasOtherTax: !!product.category?.otherTax,
          otherTaxInfo: product.category?.otherTax
        });
        
        const newCart = [...prevCart, cartItem];
        console.log('🛒 Estado del carrito después de agregar:', {
          totalItems: newCart.length,
          itemsWithOtherTax: newCart.filter(item => item.category?.otherTax).length,
          otherTaxesTotal: newCart.reduce((total, item) => {
            if (item.category?.otherTax) {
              return total + (item.price * item.quantity * item.category.otherTax.percent / 100);
            }
            return total;
          }, 0)
        });
        
        return newCart;
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === productId);
      
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map(item => 
          item.id === productId 
            ? { ...item, quantity: item.quantity - 1 } 
            : item
        );
      } else {
        return prevCart.filter(item => item.id !== productId);
      }
    });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateOtherTaxes = () => {
    const total = cart.reduce((total, item) => {
      // Usar directamente la información de impuestos del carrito
      if (item.category?.otherTax) {
        const itemTotal = item.price * item.quantity;
        const otherTaxAmount = itemTotal * (item.category.otherTax.percent / 100);
        console.log('💰 Calculando impuesto adicional para', item.name, ':', {
          itemTotal,
          taxPercent: item.category.otherTax.percent,
          taxAmount: otherTaxAmount
        });
        return total + otherTaxAmount;
      }
      return total;
    }, 0);
    
    console.log('💰 TOTAL IMPUESTOS ADICIONALES:', total);
    return total;
  };

  const calculateIVA = () => {
    return calculateTotal() * 0.19; // 19% IVA
  };

  const calculateGrandTotal = () => {
    return calculateTotal() + calculateIVA() + calculateOtherTaxes();
  };

  // Funciones para edición de precios y cantidades
  const startEditing = (itemId: number, currentPrice: number, currentQuantity: number) => {
    setEditingItem(itemId);
    setEditingPrice(currentPrice.toString());
    setEditingQuantity(currentQuantity.toString());
  };

  const saveEdit = (itemId: number) => {
    const newPrice = parseFloat(editingPrice);
    const newQuantity = parseFloat(editingQuantity);
    
    if (isNaN(newPrice) || isNaN(newQuantity) || newPrice < 0 || newQuantity <= 0) {
      // Si los valores no son válidos, cancelar edición
      cancelEdit();
      return;
    }
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === itemId 
          ? { ...item, price: newPrice, quantity: newQuantity }
          : item
      )
    );
    
    cancelEdit();
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditingPrice('');
    setEditingQuantity('');
  };

  const handlePriceChange = (value: string) => {
    // Permitir solo números y punto decimal
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === '') {
      setEditingPrice(value);
    }
  };

  const handleQuantityChange = (value: string) => {
    // Permitir solo números y punto decimal para cantidades
    const regex = /^\d*\.?\d*$/;
    if (regex.test(value) || value === '') {
      setEditingQuantity(value);
    }
  };

  // Funciones para impresión de documentos
  const calculateDocumentHash = (documentId: number, folio: string): string => {
    const concatenated = `${documentId}_${API_CONFIG.COMPANY_ID}_${folio}`;
    console.log('Calculando hash SHA1 para:', concatenated);
    const hash = CryptoJS.SHA1(concatenated).toString();
    console.log('Hash calculado:', hash);
    return hash;
  };

  const generateDocument = async () => {
    if (cart.length === 0) {
      setGenerationError('El carrito está vacío');
      return;
    }

    if (documentType === 'factura' && !savedClientData) {
      const errorMsg = 'Debe seleccionar un cliente para facturas';
      console.log('❌ ERROR DE VALIDACIÓN:', errorMsg);
      setGenerationError(errorMsg);
      
      // Mostrar toast informativo
      toast({
        title: "⚠️ Cliente Requerido",
        description: "Para generar facturas debe seleccionar un cliente",
        variant: "destructive",
        duration: 5000,
      });
      return;
    }

    // Validar datos del cliente para facturas
    if (documentType === 'factura' && savedClientData) {
      const requiredFields = ['name', 'code', 'address'];
      const missingFields = requiredFields.filter(field => !savedClientData[field]);
      
      if (missingFields.length > 0) {
        const errorMsg = `Datos de cliente incompletos: ${missingFields.join(', ')}`;
        console.log('❌ ERROR DE VALIDACIÓN:', errorMsg);
        setGenerationError(errorMsg);
        
        toast({
          title: "⚠️ Datos Incompletos",
          description: `Complete los datos del cliente: ${missingFields.join(', ')}`,
          variant: "destructive",
          duration: 5000,
        });
        return;
      }

      // Validar formato de RUT
      if (savedClientData.code && !validateRutFormat(savedClientData.code)) {
        const errorMsg = 'Formato de RUT inválido. Use formato: XXXXXXXX-X';
        console.log('❌ ERROR DE VALIDACIÓN:', errorMsg);
        setGenerationError(errorMsg);
        
        toast({
          title: "⚠️ RUT Inválido",
          description: "El RUT debe tener formato: XXXXXXXX-X",
          variant: "destructive",
          duration: 5000,
        });
        return;
      }
    }

    setIsGeneratingDocument(true);
    setGenerationError(null);
    setShowPdfPreview(false);

    try {
      console.log('🚀 INICIANDO GENERACIÓN DE DOCUMENTO:', documentType);
      
      // Test de tokens antes de proceder
      console.log('🧪 Verificando tokens...');
      const tokenTest = await testTokens();
      console.log('📊 Resultado del test de tokens:', tokenTest);
      
      if (!tokenTest.mainToken) {
        throw new Error('Token principal inválido - Verifique la configuración');
      }
      
      if (!tokenTest.pdfAccess) {
        console.warn('⚠️ Acceso público a PDF no disponible - Verificar conectividad');
      }

      // Construir payload según el tipo de documento
      const payload = documentType === 'factura' ? {
        // 🧪 NUEVO ESQUEMA TEMPORAL PARA FACTURAS - PRUEBA
        // NOTA: Este esquema es temporal para pruebas. El esquema original está congelado.
        // Estructura basada en el ejemplo proporcionado por el usuario.
        hasTaxes: true,
        externalFolio: "OPCIONAL",
        client: savedClientData ? {
          // Usar el ID correcto del cliente que viene de la API
          id: savedClientData.id,
          address: savedClientData.address,
          email: savedClientData.email || "diego@cervezaweisser.cl",
          name: savedClientData.name,
          municipality: {
            id: savedClientData.municipality?.id || 288,
            name: savedClientData.municipality?.name || "San Fernando",
            code: savedClientData.municipality?.code || "6301"
          },
          line: savedClientData.line || "ELABORACIÓN DE BEBIDAS MALTEADAS, CERVEZ",
          code: savedClientData.code,
          additionalAddress: savedClientData.additionalAddress || []
        } : {
          // Cliente por defecto con ID simple
          id: 53,
          address: "El Roble 688",
          email: "diego@cervezaweisser.cl",
          name: "ELABORADORA, EMBOTELLADORA Y DISTRIBUIDORA WEISSER LTDA",
          municipality: {
            id: 288,
            name: "San Fernando",
            code: "6301"
          },
          line: "ELABORACIÓN DE BEBIDAS MALTEADAS, CERVEZ",
          code: "76058353-7",
          additionalAddress: []
        },
        details: cart.map((item, index) => {
          const originalProduct = products.find(p => p.id === item.id) || 
                                 searchProductsResults.find(p => p.id === item.id);
          
          return {
            product: {
              id: originalProduct?.id || item.id,
              unit: {
                id: originalProduct?.unit?.id || 2,
                name: originalProduct?.unit?.name || "Unidad",
                code: originalProduct?.unit?.code || "Unid"
              },
              category: {
                id: originalProduct?.category?.id || 1309,
                otherTax: originalProduct?.category?.otherTax ? {
                  id: originalProduct.category.otherTax.id,
                  percent: originalProduct.category.otherTax.percent,
                  name: originalProduct.category.otherTax.name,
                  code: originalProduct.category.otherTax.code
                } : {
                  id: 8,
                  percent: 12,
                  name: "IVA Anticipado harina",
                  code: "19"
                },
                name: originalProduct?.category?.name || "Default Category",
                code: originalProduct?.category?.code || "110"
              },
              price: Math.round(item.price),
              name: item.name,
              code: originalProduct?.code || item.id.toString()
            },
            quantity: item.quantity
          };
        }),
        netTotal: calculateTotal(),
        discounts: [],
        date: new Date().toISOString().split('T')[0],
        exemptTotal: 0,
        otherTaxes: Math.round(calculateOtherTaxes()),
        taxes: Math.round(calculateIVA())
      } : {
        // Payload específico para Boletas
        hasTaxes: true,
        ticketType: {
          code: "3" // 3 para boleta
        },
        externalFolio: "OPCIONAL",
        details: cart.map(item => {
          const originalProduct = products.find(p => p.id === item.id) || 
                                 searchProductsResults.find(p => p.id === item.id);
          
          // Calcular el precio con TODOS los impuestos incluidos (IVA + Impuestos Adicionales)
          let priceWithTaxes = item.price;
          const ivaAmount = item.price * 0.19;
          priceWithTaxes += ivaAmount;
          
          if (originalProduct?.category?.otherTax) {
            const otherTaxAmount = item.price * (originalProduct.category.otherTax.percent / 100);
            priceWithTaxes += otherTaxAmount;
          }
          
          return {
            product: {
              id: item.id,
              unit: {
                id: originalProduct?.unit?.id || 2,
                name: originalProduct?.unit?.name || "Unidad",
                code: originalProduct?.unit?.code || "Unid"
              },
              category: {
                id: originalProduct?.category?.id || 1309,
                otherTax: originalProduct?.category?.otherTax ? {
                  id: originalProduct.category.otherTax.id,
                  percent: originalProduct.category.otherTax.percent,
                  name: originalProduct.category.otherTax.name,
                  code: originalProduct.category.otherTax.code
                } : undefined,
                name: originalProduct?.category?.name || "Default Category",
                code: originalProduct?.category?.code || "110"
              },
              price: Math.round(priceWithTaxes), // Precio con impuestos incluidos
              name: item.name,
              code: item.id.toString()
            },
            quantity: item.quantity
          };
        }),
        netTotal: calculateTotal(),
        discounts: [],
        date: new Date().toISOString().split('T')[0],
        exemptTotal: 0,
        otherTaxes: Math.round(calculateOtherTaxes()),
        taxes: Math.round(calculateIVA()),
        total: Math.round(calculateGrandTotal())
      };

      console.log('📦 Payload para generación:', payload);
      
      // Log detallado del payload según tipo de documento
      if (documentType === 'factura') {
        console.log('🧾 PAYLOAD COMPLETO DE FACTURA (NUEVO ESQUEMA):', {
          hasTaxes: payload.hasTaxes,
          externalFolio: payload.externalFolio,
          client: payload.client ? {
            id: payload.client.id,
            name: payload.client.name,
            code: payload.client.code,
            address: payload.client.address,
            email: payload.client.email,
            municipality: payload.client.municipality,
            line: payload.client.line
          } : 'Cliente por defecto',
          details: payload.details.map(detail => ({
            product: {
              id: detail.product.id,
              name: detail.product.name,
              code: detail.product.code,
              price: detail.product.price,
              hasOtherTax: !!detail.product.category?.otherTax
            },
            quantity: detail.quantity
          })),
          netTotal: payload.netTotal,
          otherTaxes: payload.otherTaxes,
          taxes: payload.taxes,
          date: payload.date,
          exemptTotal: payload.exemptTotal
        });
      }
      
      // Logs específicos según el tipo de documento
      if (documentType === 'factura') {
        console.log('🧾 DETALLES DE FACTURA:', {
          hasClient: !!savedClientData,
          clientName: savedClientData?.name,
          clientRut: savedClientData?.code,
          cartItems: cart.length,
          totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
          totalValue: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
        });
        
        // Log específico para confirmar uso de datos del cliente
        if (savedClientData) {
          console.log('👤 DATOS DEL CLIENTE UTILIZADOS EN FACTURA:', {
            nombre: savedClientData.name,
            rut: savedClientData.code,
            direccion: savedClientData.address,
            email: savedClientData.email,
            municipio: savedClientData.municipality?.name,
            actividad: savedClientData.line
          });
        }
        
        // Log específico para impuestos adicionales en factura
        console.log('🧾 IMPUESTOS ADICIONALES EN FACTURA:', {
          netTotal: calculateTotal(),
          otherTaxes: Math.round(calculateOtherTaxes()),
          taxes: Math.round(calculateIVA()),
          total: Math.round(calculateGrandTotal()),
          hasOtherTaxes: calculateOtherTaxes() > 0
        });
        
        // Log específico para el nuevo esquema de factura
        console.log('🧪 NUEVO ESQUEMA DE FACTURA APLICADO:', {
          hasClient: !!savedClientData,
          clientName: savedClientData?.name || "Cliente por defecto",
          totalItems: cart.length,
          itemsWithOtherTax: cart.filter(item => item.category?.otherTax).length
        });
      } else {
        console.log('🎫 DETALLES DE BOLETA:', {
          netTotal: calculateTotal(),
          otherTaxes: Math.round(calculateOtherTaxes()),
          taxes: Math.round(calculateIVA()),
          total: Math.round(calculateGrandTotal()),
          cartItems: cart.length,
          hasOtherTaxes: calculateOtherTaxes() > 0
        });
      }

      // Usar configuración centralizada
      const apiConfig = getApiConfig();
      const endpoint = documentType === 'factura' ? apiConfig.endpoints.INVOICES : apiConfig.endpoints.DOCUMENTS;
      
      console.log('🎯 Usando endpoint para', documentType, ':', endpoint);
      console.log('📋 Tipo de documento:', documentType === 'factura' ? '🧾 FACTURA' : '🎫 BOLETA');
      console.log('🔧 Configuración centralizada:', {
        token: apiConfig.token,
        companyId: apiConfig.companyId,
        baseUrl: apiConfig.baseUrl
      });
      
      // Llamar API de generación de documento
      const response = await fetch(`${endpoint}&token=${apiConfig.token}`, {
        method: 'POST',
        headers: apiConfig.headers,
        body: JSON.stringify(payload)
      });

      console.log('📥 Respuesta de generación:', response.status, response.statusText);

      if (response.ok) {
        const responseData = await response.json();
        console.log('📋 Datos de respuesta:', responseData);

        if (responseData.success && responseData.id && responseData.assignedFolio) {
          console.log('✅ Documento generado exitosamente:', {
            tipo: documentType === 'factura' ? 'FACTURA' : 'BOLETA',
            id: responseData.id,
            folio: responseData.assignedFolio,
            hash: responseData.validation ? 'Presente' : 'Ausente'
          });
          
          setDocumentId(responseData.id);
          setAssignedFolio(responseData.assignedFolio);
          
          // Usar el hash validation que viene del servidor en lugar de calcular nuestro propio hash
          const validationHash = responseData.validation;
          console.log('🔐 Hash validation del servidor:', validationHash);
          
          if (validationHash) {
            // Calcular hash y obtener PDF usando el hash del servidor
            console.log('🔄 Iniciando obtención de PDF para', documentType === 'factura' ? 'FACTURA' : 'BOLETA');
            await fetchDocumentPDF(responseData.id, responseData.assignedFolio, validationHash);
          } else {
            throw new Error('No se recibió hash de validación del servidor');
          }
        } else {
          // Manejar errores específicos de la API
          if (responseData.code === '000' && responseData.details?.includes('folios')) {
            // Mostrar mensaje específico para folios agotados
            toast({
              title: "⚠️ Folios Agotados",
              description: "No hay suficientes folios disponibles para generar documentos. Contacte al administrador del sistema.",
              variant: "destructive",
              duration: 8000, // 8 segundos para que el usuario pueda leer
            });
            throw new Error('Error: No hay folios disponibles para generar documentos. Contacte al administrador del sistema.');
          } else if (responseData.details) {
            // Mostrar otros errores de la API
            toast({
              title: "❌ Error de la API",
              description: responseData.details,
              variant: "destructive",
              duration: 5000,
            });
            throw new Error(`Error de la API: ${responseData.details}`);
          } else {
            // Error genérico
            toast({
              title: "❌ Error",
              description: "Respuesta inválida de la API",
              variant: "destructive",
              duration: 5000,
            });
            throw new Error('Respuesta inválida de la API');
          }
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `Error ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('💥 Error al generar documento:', error);
      setGenerationError((error as Error)?.message || 'Error al generar documento');
      
      // Si no se mostró un toast específico, mostrar uno genérico
      if (!error.message.includes('folios disponibles')) {
        toast({
          title: "❌ Error al Generar Documento",
          description: error.message || "Error desconocido al generar el documento",
          variant: "destructive",
          duration: 5000,
        });
      }
      
      // Para desarrollo, simular generación exitosa
      console.log('🔄 Usando datos de prueba para desarrollo');
      const mockId = 9666311;
      const mockFolio = "2385";
      const mockValidationHash = "3a5e5bda9ab5ddf486733d7570a820229272e31f"; // Hash de ejemplo
      setDocumentId(mockId);
      setAssignedFolio(mockFolio);
      await fetchDocumentPDF(mockId, mockFolio, mockValidationHash);
    } finally {
      setIsGeneratingDocument(false);
    }
  };

  const fetchDocumentPDF = async (id: number, folio: string, validationHash?: string) => {
    try {
      console.log('🔄 INICIANDO OBTENCIÓN DE PDF...');
      console.log('📋 Tipo de documento:', documentType === 'factura' ? '🧾 FACTURA' : '🎫 BOLETA');
      console.log('📋 Parámetros:', { id, folio, companyId: API_CONFIG.COMPANY_ID, validationHash });
      
      // Usar el hash del servidor si está disponible, sino calcular nuestro propio hash
      let hash: string;
      if (validationHash) {
        hash = validationHash;
        console.log('🔐 Usando hash validation del servidor:', hash);
      } else {
        hash = calculateDocumentHash(id, folio);
        console.log('🔐 Hash SHA1 calculado localmente:', hash);
      }

      const pdfUrl = `${API_ENDPOINTS.PDF}/${id}?v=${hash}`;
      console.log('🌐 URL del PDF:', pdfUrl);
      console.log('📤 NOTA: Sin headers - acceso público según documentación');

      // IMPORTANTE: No enviar headers de autenticación - acceso público
      const pdfResponse = await fetch(pdfUrl, {
        method: 'GET'
        // Sin headers - los documentos son de acceso público
      });

      console.log('📥 Respuesta del servidor:', {
        status: pdfResponse.status,
        statusText: pdfResponse.statusText,
        ok: pdfResponse.ok,
        headers: Object.fromEntries(pdfResponse.headers.entries())
      });

      if (pdfResponse.ok) {
        console.log('✅ PDF obtenido exitosamente del servidor para', documentType === 'factura' ? 'FACTURA' : 'BOLETA');
        const pdfBlob = await pdfResponse.blob();
        console.log('📄 Blob creado:', { size: pdfBlob.size, type: pdfBlob.type });
        
        // Verificar si el blob contiene un PDF válido o una página de error
        if (pdfBlob.size < 1000 || pdfBlob.type === 'text/html') {
          // Blob muy pequeño o HTML, probablemente una página de error
          console.warn('⚠️ Blob sospechoso, verificando contenido...');
          const text = await pdfBlob.text();
          if (text.includes('No autorizado') || text.includes('Unauthorized')) {
            console.error('❌ El servidor devolvió una página de error de autorización');
            throw new Error('Error de autorización: Hash inválido o documento no encontrado');
          }
          console.error('❌ El servidor devolvió HTML en lugar de PDF');
          throw new Error('El servidor devolvió HTML en lugar de PDF - Verificar hash');
        }
        
        // Crear URL del blob para mostrar el PDF
        const pdfUrl = URL.createObjectURL(pdfBlob);
        console.log('🔗 URL del blob creada:', pdfUrl);
        
        setPdfUrl(pdfUrl);
        setShowPdfPreview(true);
        console.log('✅ PDF configurado para visualización de', documentType === 'factura' ? 'FACTURA' : 'BOLETA');
      } else {
        console.error('❌ Error del servidor al obtener PDF:', pdfResponse.status, pdfResponse.statusText);
        const errorText = await pdfResponse.text();
        console.error('📄 Contenido del error:', errorText);
        throw new Error(`Error del servidor: ${pdfResponse.status} - ${pdfResponse.statusText}`);
      }
    } catch (error) {
      console.error('💥 Error al obtener PDF:', error);
      console.error('💥 Tipo de error:', error?.constructor?.name);
      console.error('💥 Mensaje:', (error as Error)?.message);
      
      setGenerationError(`Error al obtener el PDF: ${(error as Error)?.message || 'Error desconocido'}`);
      
      // Para desarrollo, crear un PDF de prueba solo si es necesario
      console.log('🔄 Creando PDF de prueba para desarrollo...');
      const mockPdfUrl = 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...'; // PDF base64 de prueba
      setPdfUrl(mockPdfUrl);
      setShowPdfPreview(true);
      console.log('⚠️ PDF de prueba configurado');
    }
  };

  const resetDocument = () => {
    setShowPdfPreview(false);
    setPdfUrl(null);
    setDocumentId(null);
    setAssignedFolio(null);
    setGenerationError(null);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }
  };



  const handlePrint = async () => {
    await generateDocument();
  };

  const resetReceipt = () => {
    setShowReceipt(false);
  };

  const handleDocumentTypeChange = (type: 'boleta' | 'factura') => {
    setDocumentType(type);
    if (type === 'factura') {
      setShowClientForm(true);
    } else {
      setShowClientForm(false);
    }
  };

  const handleClientDataChange = (field: string, value: string) => {
    setClientData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressChange = (addressIndex: number) => {
    if (searchState.selectedClient) {
      const client = searchState.selectedClient;
      let newAddress = client.address;
      
      if (addressIndex === 0) {
        // Dirección principal
        newAddress = client.address;
      } else if (client.additionalAddress && client.additionalAddress[addressIndex - 1]) {
        // Dirección adicional
        const additionalAddr = client.additionalAddress[addressIndex - 1];
        newAddress = `${additionalAddr.address}, ${additionalAddr.municipality.name}`;
      }
      
      setClientData(prev => ({
        ...prev,
        address: newAddress,
        selectedAddressIndex: addressIndex
      }));
    }
  };

  const handleSaveClient = async () => {
          console.log('Iniciando guardado de cliente con datos:', clientData);
      console.log('Cliente seleccionado (si existe):', searchState.selectedClient);
    
    // Validar que los campos requeridos estén completos
    if (!clientData.rut || !clientData.name || !clientData.address) {
      console.error('Campos requeridos faltantes:', {
        rut: clientData.rut,
        name: clientData.name,
        address: clientData.address
      });
      setSearchState(prev => ({
        ...prev,
        error: 'Por favor complete todos los campos requeridos'
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      error: null
    }));

    try {
      // Preparar datos para enviar
      const requestBody = searchState.selectedClient ? {
        id: searchState.selectedClient.id,
        code: searchState.selectedClient.code,
        name: searchState.selectedClient.name,
        address: searchState.selectedClient.address,
        email: searchState.selectedClient.email || '',
        municipality: searchState.selectedClient.municipality,
        activity: searchState.selectedClient.activity,
        line: searchState.selectedClient.line,
        additionalAddress: searchState.selectedClient.additionalAddress
      } : {
        code: clientData.rut,
        name: clientData.name,
        address: clientData.address,
        email: clientData.email || ''
      };
      
      console.log('Datos que se enviarán a la API:', requestBody);
      
      // Crear nuevo cliente en la API de Factura Movil
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/client`, {
        method: 'POST',
        headers: API_HEADERS.DEFAULT,
        body: JSON.stringify(requestBody)
      });

      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Error al parsear respuesta JSON:', parseError);
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: 'Error al procesar respuesta de la API'
        }));
        return;
      }
      console.log('Respuesta completa de la API:', responseData);

      // Verificar que responseData existe
      if (!responseData) {
        console.error('responseData es null o undefined');
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: 'Error: Respuesta inválida de la API'
        }));
        return;
      }

      if (response.ok && responseData.success) {
        console.log('Cliente guardado exitosamente:', responseData.data);
        
        // Verificar que responseData.data existe
        if (!responseData.data) {
          console.warn('responseData.data es null, usando datos del formulario');
        }
        
        // Generar ID seguro
        const clientId = responseData.data?.id || Date.now();
        console.log('ID del cliente generado:', clientId);
        
        // Guardar datos del cliente en memoria para uso posterior
        // Si hay cliente seleccionado, usar sus datos completos
        // Si no, usar los datos del formulario
        const clientToSave: Client = searchState.selectedClient ? {
          ...searchState.selectedClient,
          id: clientId // Usar el ID de la respuesta de la API
        } : {
          id: clientId,
          code: clientData.rut,
          name: clientData.name,
          address: clientData.address,
          email: clientData.email || '',
          municipality: undefined,
          activity: undefined,
          line: undefined,
          additionalAddress: undefined
        };
        
        setSavedClientData(clientToSave);
        setClientSaved(true);
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          selectedClient: clientToSave
        }));
        setShowClientForm(false);
        
        // Log para verificar datos guardados en memoria
        console.log('Cliente guardado en memoria para factura:', clientToSave);
      } else {
        console.error('Error en respuesta de API:', responseData);
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: responseData.details || responseData.message || 'Error al guardar el cliente'
        }));
      }
    } catch (error) {
      console.error('Error al guardar cliente:', error);
      
      // Para desarrollo, simular guardado exitoso cuando la API no esté disponible
      // Usar el ID del cliente seleccionado si existe, sino generar uno
      const clientId = searchState.selectedClient?.id || Date.now();
      
      const savedClient: Client = {
        id: clientId,
        code: clientData.rut,
        name: clientData.name,
        address: clientData.address,
        email: clientData.email || '',
        municipality: {
          id: 1,
          code: '13101',
          name: 'Santiago'
        },
        additionalAddress: searchState.selectedClient?.additionalAddress
      };
      
      setSavedClientData(savedClient);
      setClientSaved(true);
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        selectedClient: savedClient
      }));
      setShowClientForm(false);
      
      console.log('Cliente guardado exitosamente (modo desarrollo):', savedClient);
      console.log('Cliente guardado en memoria para factura:', savedClient);
    }
  };

  const handleCancelClient = () => {
    setShowClientForm(false);
    setClientData({ rut: '', name: '', address: '', selectedAddressIndex: 0 });
    setSearchState({
      isSearching: false,
      results: [],
      error: null,
      selectedClient: null
    });
    setSearchQuery('');
    setShowSearchResults(false);
    setSavedClientData(null);
    setClientSaved(false);
  };

  // Función de debounce para búsqueda
  const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      return () => {
        clearTimeout(handler);
      };
    }, [value, delay]);

    return debouncedValue;
  };

  // Validación básica de RUT chileno
  const validateRUT = (rut: string): boolean => {
    const rutClean = rut.replace(/[.-]/g, '');
    const rutRegex = /^[0-9]{7,8}[0-9kK]$/;
    return rutRegex.test(rutClean);
  };

  // Búsqueda de cliente por RUT
  const searchClientByRUT = async (rut: string) => {
    if (!validateRUT(rut)) {
      setSearchState(prev => ({
        ...prev,
        error: 'Formato de RUT inválido. Use formato: 12345678-9'
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      error: null
    }));

    // NOTA: En modo desarrollo, si la API no está disponible, se usan datos de prueba

    try {
      // Llamada real a la API de Factura Movil usando el nuevo esquema
      const response = await fetch(`${API_ENDPOINTS.CLIENTS}&token=${API_CONFIG.FACMOV_T}`, {
        headers: API_HEADERS.DEFAULT
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Verificar estructura de respuesta de la API según nuevo esquema
        if (responseData.clients && responseData.clients.length > 0) {
          const client = responseData.clients[0];
          setSearchState(prev => ({
            ...prev,
            isSearching: false,
            results: [client]
            // NO establecer selectedClient automáticamente
          }));
          // NO pre-llenar automáticamente - solo mostrar en resultados
        } else {
          setSearchState(prev => ({
            ...prev,
            isSearching: false,
            error: 'Cliente no encontrado'
          }));
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: errorData.details || 'Cliente no encontrado'
        }));
      }
    } catch (error) {
      console.error('Error al buscar cliente por RUT:', error);
      
      // Para desarrollo, usar datos de prueba cuando la API no esté disponible
      const mockClient: Client = {
        id: 1,
        code: rut,
        name: 'Cliente de Prueba',
        address: 'Av. Providencia 1234',
        email: 'cliente@test.com',
        municipality: {
          id: 1,
          code: '13101',
          name: 'Santiago'
        },
        additionalAddress: [
          {
            id: 1,
            address: 'Av. Las Condes 5678',
            municipality: {
              id: 2,
              code: '13102',
              name: 'Las Condes'
            }
          },
          {
            id: 2,
            address: 'Av. Vitacura 9012',
            municipality: {
              id: 3,
              code: '13103',
              name: 'Vitacura'
            }
          }
        ]
      };
      
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: [mockClient]
        // NO establecer selectedClient automáticamente
      }));
      // NO pre-llenar automáticamente - solo mostrar en resultados
    }
  };

  // Búsqueda de clientes por RUT o nombre
  const searchClientsByName = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setSearchState(prev => ({
        ...prev,
        results: [],
        error: null
      }));
      return;
    }

    setSearchState(prev => ({
      ...prev,
      isSearching: true,
      error: null
    }));

    console.log('🔍 INICIO BÚSQUEDA CLIENTES:', {
      searchTerm,
      timestamp: new Date().toISOString(),
      searchTermLength: searchTerm.length
    });

    try {
      // Usar configuración centralizada
      const apiConfig = getApiConfig();
      const searchUrl = `${apiConfig.endpoints.CLIENTS}&token=${apiConfig.token}&search=${encodeURIComponent(searchTerm)}`;
      console.log('🌐 CONSTRUYENDO URL DE BÚSQUEDA CLIENTES...');
      console.log('📡 URL CONSTRUIDA:', searchUrl);
      console.log('📤 HEADERS ENVIADOS:', apiConfig.headers);
      console.log('🚀 INICIANDO FETCH CLIENTES...');

      // Llamada a la API de Factura Movil con el término de búsqueda
      const response = await fetch(searchUrl, {
        method: 'GET',
        headers: apiConfig.headers
      });

      console.log('📥 RESPUESTA RECIBIDA:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (response.ok) {
        console.log('📊 PARSEANDO JSON...');
        const responseData = await response.json();
        console.log('📋 DATOS PARSEADOS:', responseData);
        
        console.log('🔍 VALIDANDO ESTRUCTURA DE DATOS...');
        console.log('📦 responseData.clients existe:', !!responseData.clients);
        console.log('📦 responseData.clients es array:', Array.isArray(responseData.clients));
        console.log('📦 Tipo de responseData.clients:', typeof responseData.clients);
        
        // Verificar estructura de respuesta según el esquema proporcionado
        if (responseData.clients && Array.isArray(responseData.clients)) {
          console.log('✅ ESTRUCTURA VÁLIDA - Clientes encontrados:', responseData.clients.length);
          console.log('📋 PRIMER CLIENTE EJEMPLO:', responseData.clients[0]);
          
          setSearchState(prev => ({
            ...prev,
            isSearching: false,
            results: responseData.clients,
            error: null
          }));
          setShowSearchResults(true);
          console.log('✅ BÚSQUEDA COMPLETADA - Total de resultados:', responseData.clients.length);
        } else {
          console.log('❌ ESTRUCTURA INVÁLIDA - No se encontraron clientes en la respuesta');
          setSearchState(prev => ({
            ...prev,
            isSearching: false,
            results: [],
            error: 'No se encontraron clientes'
          }));
        }
      } else {
        console.log('❌ ERROR HTTP:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({}));
        console.error('📄 DATOS DE ERROR:', errorData);
        setSearchState(prev => ({
          ...prev,
          isSearching: false,
          error: errorData.details || `Error ${response.status}: ${response.statusText}`
        }));
      }
    } catch (error) {
      console.error('💥 ERROR CAPTURADO:', error);
      console.error('💥 TIPO DE ERROR:', error.constructor.name);
      console.error('💥 MENSAJE DE ERROR:', error.message);
      console.error('💥 STACK TRACE:', error.stack);
      
      // Para desarrollo, usar datos de prueba cuando la API no esté disponible
      const mockClients: Client[] = [
        {
          id: 53,
          code: "76058353-7",
          name: "ELABORADORA, EMBOTELLADORA Y DISTRIBUIDORA WEISSER LTDA",
          address: "El Roble 688",
          additionalAddress: [
            {
              id: 4658,
              address: "Direccion 2",
              municipality: {
                id: 1,
                code: "5602",
                name: "Algarrobo"
              }
            }
          ],
          email: "diego@cervezaweisser.cl",
          municipality: {
            id: 288,
            code: "6301",
            name: "San Fernando"
          },
          activity: {
            id: 1444,
            code: "155300",
            name: "ELABORACIÓN DE BEBIDAS MALTEADAS, CERVEZAS Y MALTAS"
          },
          line: "ELABORACIÓN DE BEBIDAS MALTEADAS, CERVEZ"
        },
        {
          id: 54,
          code: "12345678-9",
          name: "EMPRESA DE PRUEBA LTDA",
          address: "Av. Providencia 1234",
          email: "test@empresa.com",
          municipality: {
            id: 1,
            code: "13101",
            name: "Santiago"
          },
          activity: {
            id: 1,
            code: "123456",
            name: "ACTIVIDAD DE PRUEBA"
          },
          line: "LÍNEA DE PRUEBA"
        }
      ].filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.code.toLowerCase().includes(searchTerm.toLowerCase())
      );

      console.log('Usando datos de prueba:', mockClients.length, 'clientes');
      setSearchState(prev => ({
        ...prev,
        isSearching: false,
        results: mockClients,
        error: null
      }));
      setShowSearchResults(true);
      console.log('🔄 Usando datos de prueba para desarrollo');
    }
    
    console.log('🏁 FINALIZANDO BÚSQUEDA CLIENTES - Limpiando estado de carga');
  };

  // Usar debounce para búsqueda por nombre
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Efecto para búsqueda por nombre con debounce
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
      searchClientsByName(debouncedSearchQuery);
    } else {
      setSearchState(prev => ({
        ...prev,
        results: [],
        error: null
      }));
      setShowSearchResults(false);
    }
  }, [debouncedSearchQuery]);

  // Cerrar dropdown cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.search-dropdown')) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Monitorear estado de conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleClientSelection = (client: Client) => {
    setSearchState(prev => ({
      ...prev,
      selectedClient: client
    }));
    setClientData({
      rut: client.code,
      name: client.name,
      address: client.address,
      selectedAddressIndex: 0
    });
    setSearchQuery(client.name);
    setShowSearchResults(false);
    
    // Guardar directamente el cliente seleccionado con su ID correcto
    setSavedClientData(client);
    setClientSaved(true);
    
    console.log('Cliente seleccionado del dropdown - guardado directamente con ID:', client.id);
  };

  const handleSearchInputChange = (value: string) => {
    setSearchQuery(value);
    if (value.length < 2) {
      setShowSearchResults(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchState(prev => ({
      ...prev,
      results: [],
      error: null,
      selectedClient: null
    }));
    setShowSearchResults(false);
  };

  // Función para cargar clientes masivamente (según documentación de APIs)
  const loadClientsBulk = async (clients: Client[]) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/services/load/company/${API_CONFIG.COMPANY_ID}/client`, {
        method: 'POST',
        headers: API_HEADERS.DEFAULT,
        body: JSON.stringify({
          clients: clients.map(client => ({
            code: client.code,
            name: client.name,
            address: client.address,
            email: client.email || ''
          }))
        })
      });

      const responseData = await response.json();
      
      if (response.ok && responseData.success) {
        console.log('Clientes cargados masivamente:', responseData.data);
        return responseData.data;
      } else {
        throw new Error(responseData.details || 'Error al cargar clientes');
      }
    } catch (error) {
      console.error('Error al cargar clientes masivamente:', error);
      throw error;
    }
  };

  // Función para obtener datos del cliente guardado para la factura
  const getClientForInvoice = () => {
    if (!savedClientData) {
      return null;
    }

    return {
      code: savedClientData.code,
      name: savedClientData.name,
      address: savedClientData.address,
      email: savedClientData.email,
      municipality: savedClientData.municipality,
      activity: savedClientData.activity,
      line: savedClientData.line,
      additionalAddress: savedClientData.additionalAddress
    };
  };

  // Filtrar productos por búsqueda
  const allFilteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearchQuery.toLowerCase())
  );
  
  // Limitar a 4 productos para mejor presentación
  const filteredProducts = allFilteredProducts.slice(0, 4);

  const BoletaReceipt = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center flex-1">
          <div className="flex justify-center items-center mb-2">
            <Receipt size={18} className="text-green-600 dark:text-green-400 mr-2" />
            <span className="text-green-800 dark:text-green-300 text-sm font-semibold">Boleta Generada</span>
          </div>
          <p className="text-xs text-green-700 dark:text-green-400">Boleta electrónica #B-5678</p>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="ml-2" 
          onClick={resetReceipt}
        >
          <RefreshCw size={18} />
        </Button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4 flex-1 overflow-auto">
        <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
          <h3 className="font-bold text-sm">FACTURA MOVIL DEMO</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Av. Tecnológica 123, Ciudad Innovación</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 76.543.210-8</p>
          <p className="text-xs font-medium text-green-600 dark:text-green-400 mt-2">BOLETA ELECTRÓNICA</p>
          <p className="text-xs font-bold">N° B-5678</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        
        <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 mb-3">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span>Producto</span>
            <span>Total</span>
          </div>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-xs mb-1">
              <div>
                <span>{item.name}</span>
                <br />
                <span className="text-slate-600 dark:text-slate-400">{item.quantity} x {formatPrice(item.price)}</span>
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>IVA (19%)</span>
            <span>{formatPrice(calculateIVA())}</span>
          </div>
          {calculateOtherTaxes() > 0 && (
            <div className="flex justify-between text-xs mb-1">
              <span>Impuestos Adicionales</span>
              <span>{formatPrice(calculateOtherTaxes())}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold mt-2">
            <span>TOTAL</span>
            <span>{formatPrice(calculateGrandTotal())}</span>
          </div>
        </div>
        
        <div className="text-center text-xs mt-auto">
          <p>GRACIAS POR SU COMPRA</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
        </div>
      </div>
      
      <Button
        className="w-full mt-4 bg-blue-600"
        onClick={resetReceipt}
      >
        Volver
      </Button>
    </div>
  );

  const FacturaReceipt = () => (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <div className="bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3 text-center flex-1">
          <div className="flex justify-center items-center mb-2">
            <FileText size={18} className="text-blue-600 dark:text-blue-400 mr-2" />
            <span className="text-blue-800 dark:text-blue-300 text-sm font-semibold">Factura Generada</span>
          </div>
          <p className="text-xs text-blue-700 dark:text-blue-400">Factura electrónica #F-9876</p>
        </div>
        <Button 
          size="icon" 
          variant="ghost" 
          className="ml-2" 
          onClick={resetReceipt}
        >
          <RefreshCw size={18} />
        </Button>
      </div>
      
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md p-4 flex-1 overflow-auto">
        <div className="text-center border-b border-slate-200 dark:border-slate-700 pb-3 mb-3">
          <h3 className="font-bold text-sm">FACTURA MOVIL DEMO</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">Av. Tecnológica 123, Ciudad Innovación</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 76.543.210-8</p>
          <p className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-2">FACTURA ELECTRÓNICA</p>
          <p className="text-xs font-bold">N° F-9876</p>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {new Date().toLocaleDateString()} {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </p>
        </div>
        
        <div className="mb-3">
          <h4 className="text-xs font-semibold mb-1">CLIENTE:</h4>
          <p className="text-xs">Distribuidora Nacional Ltda.</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">RUT: 77.123.456-7</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Av. Providencia 1234, Providencia</p>
        </div>
        
        <div className="border-t border-b border-slate-200 dark:border-slate-700 py-3 mb-3">
          <div className="flex justify-between text-xs font-semibold mb-2">
            <span>Producto</span>
            <span>Total</span>
          </div>
          {cart.map(item => (
            <div key={item.id} className="flex justify-between text-xs mb-1">
              <div>
                <span>{item.name}</span>
                <br />
                <span className="text-slate-600 dark:text-slate-400">{item.quantity} x {formatPrice(item.price)}</span>
              </div>
              <span>{formatPrice(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        
        <div className="mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span>Subtotal</span>
            <span>{formatPrice(calculateTotal())}</span>
          </div>
          <div className="flex justify-between text-xs mb-1">
            <span>IVA (19%)</span>
            <span>{formatPrice(calculateIVA())}</span>
          </div>
          {calculateOtherTaxes() > 0 && (
            <div className="flex justify-between text-xs mb-1">
              <span>Impuestos Adicionales</span>
              <span>{formatPrice(calculateOtherTaxes())}</span>
            </div>
          )}
          <div className="flex justify-between text-sm font-bold mt-2">
            <span>TOTAL</span>
            <span>{formatPrice(calculateGrandTotal())}</span>
          </div>
        </div>
        
        <div className="text-center text-xs mt-auto">
          <p>GRACIAS POR SU COMPRA</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">www.facturamovil.com</p>
        </div>
      </div>
      
      <Button
        className="w-full mt-4 bg-blue-600"
        onClick={resetReceipt}
      >
        Volver
      </Button>
    </div>
  );

  // Función para verificar si los tokens son válidos
  const testTokens = async () => {
    console.log('🧪 INICIANDO TEST DE TOKENS...');
    
    try {
      // Usar configuración centralizada
      const apiConfig = getApiConfig();
      
      // Test 1: Verificar token principal (necesario para crear documentos) - usando proxy
      console.log('🔑 Probando token principal:', apiConfig.token);
      const testResponse1 = await fetch(`${apiConfig.endpoints.PRODUCTS}&token=${apiConfig.token}`, {
        method: 'GET',
        headers: apiConfig.headers
      });
      console.log('✅ Token principal:', testResponse1.status === 200 ? 'VÁLIDO' : 'INVÁLIDO');
      
      // Test 2: Verificar acceso público a PDF (sin token)
      console.log('🔓 Probando acceso público a PDF (sin autenticación)...');
      const testResponse2 = await fetch(`${apiConfig.baseUrl}/document/toPdf/1?v=test`, {
        method: 'GET'
        // Sin headers - acceso público
      });
      console.log('✅ Acceso público PDF:', testResponse2.status === 200 ? 'FUNCIONA' : 'NO FUNCIONA');
      
      return {
        mainToken: testResponse1.status === 200,
        pdfAccess: testResponse2.status === 200 || testResponse2.status === 404 // 404 es normal para ID inválido
      };
    } catch (error) {
      console.error('💥 Error en test de tokens:', error);
      return {
        mainToken: false,
        pdfAccess: false
      };
    }
  };

  return (
    <section 
      id="digipos" 
      className="py-24 bg-slate-50 dark:bg-slate-900 relative"
      ref={ref}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-transparent bg-clip-text">
            DigiPos
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Solución POS digital tradicional con una interfaz moderna e intuitiva para administrar
            ventas, inventario y reportes desde cualquier dispositivo.
          </p>
        </motion.div>

        <motion.div 
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-700"
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.8 }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Panel - Categories & Products */}
            <div className="lg:col-span-2 border-r border-slate-200 dark:border-slate-700">
              {/* Search & Tabs */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                    <Input 
                      placeholder="Buscar productos..." 
                      className="pl-10"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                    />
                  </div>
                  <Button className="ml-3" variant="outline">
                    <BarChart size={18} className="mr-2" />
                    Reportes
                  </Button>
                </div>
              </div>

              {/* Tabs & Products */}
              <Tabs defaultValue="all" className="p-4">
                <TabsList className="mb-4">
                  <TabsTrigger value="all">Todos</TabsTrigger>
                  <TabsTrigger value="search">Buscar Productos</TabsTrigger>
                  <TabsTrigger value="coffee">Café</TabsTrigger>
                  <TabsTrigger value="food">Comida</TabsTrigger>
                  <TabsTrigger value="merch">Merchandising</TabsTrigger>
                </TabsList>
                
                <TabsContent value="all" className="mt-4 space-y-0">
                  {/* Estado de carga */}
                  {isLoadingProducts && (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-slate-600">Cargando productos...</span>
                    </div>
                  )}

                  {/* Estado de error */}
                  {productsError && !isLoadingProducts && (
                    <div className="text-center p-8">
                      <div className="text-red-500 mb-2">
                        <X className="h-8 w-8 mx-auto mb-2" />
                        {productsError}
                      </div>
                      <Button 
                        onClick={loadProductsFromAPI}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar
                      </Button>
                    </div>
                  )}

                                    {/* Productos cargados */}
                  {!isLoadingProducts && !productsError && (
                    <>
                      <div className="max-h-96 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {filteredProducts.map(product => (
                            <Card key={product.id} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                              <div className="h-32 overflow-hidden relative">
                                <ProductImage 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                  product={{
                                    name: product.name,
                                    photographer: product.image.includes('placeholder') || product.image.includes('pexels.com') ? 'Pexels (Placeholder)' : undefined
                                  }}
                                />
                              </div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                      {product.name}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Valor Neto: {formatPrice(product.price)}
                                      </p>
                                      {(() => {
                                        const { totalPrice, hasOtherTax } = calculatePriceWithTaxes(product);
                                        return (
                                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Valor con Impuestos: {formatPrice(totalPrice)}
                                            {hasOtherTax && (
                                              <span className="ml-1 text-xs text-orange-500">*</span>
                                            )}
                                          </p>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => addToCart(product)}
                                    className="bg-blue-600 hover:bg-blue-700 ml-3"
                                  >
                                    <ShoppingBag size={16} className="mr-1" /> Añadir
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {/* Indicador de total de productos */}
                      <div className="mt-4 text-center space-y-2">
                        <div className="inline-flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                          <span className="mr-2">📦</span>
                          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} disponible{filteredProducts.length !== 1 ? 's' : ''}
                        </div>
                        
                        {/* Leyenda de impuestos */}
                        {filteredProducts.some(product => product.category?.otherTax) && (
                          <div className="inline-flex items-center px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs">
                            <span className="mr-1">*</span>
                            Incluye impuestos adicionales
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="search" className="mt-4 space-y-0">
                  {/* Campo de búsqueda */}
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                      <Input 
                        placeholder="Buscar productos por nombre..." 
                        className="pl-10"
                        value={productSearchTerm}
                        onChange={(e) => setProductSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Estado de búsqueda */}
                  {isSearchingProducts && (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                      <span className="ml-2 text-slate-600">Buscando productos...</span>
                    </div>
                  )}

                  {/* Estado de error */}
                  {searchProductsError && !isSearchingProducts && (
                    <div className="text-center p-8">
                      <div className="text-red-500 mb-2">
                        <X className="h-8 w-8 mx-auto mb-2" />
                        {searchProductsError}
                      </div>
                      <Button 
                        onClick={() => searchProductsFromAPI(productSearchTerm)}
                        variant="outline"
                        size="sm"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Reintentar
                      </Button>
                    </div>
                  )}

                  {/* Sin término de búsqueda */}
                  {!productSearchTerm.trim() && !isSearchingProducts && !searchProductsError && (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                      <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>Escribe en el campo de búsqueda para encontrar productos</p>
                    </div>
                  )}

                  {/* Sin resultados */}
                  {productSearchTerm.trim() && !isSearchingProducts && !searchProductsError && searchProductsResults.length === 0 && (
                    <div className="text-center p-8 text-slate-500 dark:text-slate-400">
                      <X className="h-12 w-12 mx-auto mb-4 opacity-20" />
                      <p>No se encontraron productos para "{productSearchTerm}"</p>
                    </div>
                  )}

                  {/* Resultados de búsqueda */}
                  {!isSearchingProducts && !searchProductsError && searchProductsResults.length > 0 && (
                    <>
                      <div className="max-h-96 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {searchProductsResults.map(product => (
                            <Card key={product.id} className="overflow-hidden border border-slate-200 dark:border-slate-700">
                              <div className="h-32 overflow-hidden relative">
                                <ProductImage 
                                  src={product.image} 
                                  alt={product.name} 
                                  className="w-full h-full object-cover"
                                  product={{
                                    name: product.name,
                                    photographer: product.image.includes('placeholder') || product.image.includes('pexels.com') ? 'Pexels (Placeholder)' : undefined
                                  }}
                                />
                              </div>
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <h3 className="font-medium text-slate-900 dark:text-slate-100">
                                      {product.name}
                                    </h3>
                                    <div className="mt-2 space-y-1">
                                      <p className="text-xs text-slate-500 dark:text-slate-400">
                                        Valor Neto: {formatPrice(product.price)}
                                      </p>
                                      {(() => {
                                        const { totalPrice, hasOtherTax } = calculatePriceWithTaxes(product);
                                        return (
                                          <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                            Valor con Impuestos: {formatPrice(totalPrice)}
                                            {hasOtherTax && (
                                              <span className="ml-1 text-xs text-orange-500">*</span>
                                            )}
                                          </p>
                                        );
                                      })()}
                                    </div>
                                  </div>
                                  <Button 
                                    size="sm" 
                                    onClick={() => addToCart(product)}
                                    className="bg-blue-600 hover:bg-blue-700 ml-3"
                                  >
                                    <ShoppingBag size={16} className="mr-1" /> Añadir
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                      
                      {/* Indicador de total de resultados */}
                      <div className="mt-4 text-center space-y-2">
                        <div className="inline-flex items-center px-3 py-2 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                          <span className="mr-2">📦</span>
                          {searchProductsResults.length} producto{searchProductsResults.length !== 1 ? 's' : ''} encontrado{searchProductsResults.length !== 1 ? 's' : ''}
                        </div>
                        
                        {/* Leyenda de impuestos */}
                        {searchProductsResults.some(product => product.category?.otherTax) && (
                          <div className="inline-flex items-center px-3 py-1 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-xs">
                            <span className="mr-1">*</span>
                            Incluye impuestos adicionales
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="coffee">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Selecciona productos de la categoría Café
                  </div>
                </TabsContent>
                
                <TabsContent value="food">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Selecciona productos de la categoría Comida
                  </div>
                </TabsContent>
                
                <TabsContent value="merch">
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                    Selecciona productos de la categoría Merchandising
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Panel - Cart & Checkout */}
            <div className="flex flex-col bg-white dark:bg-slate-900/50 max-h-screen overflow-hidden">
              {showPdfPreview && pdfUrl ? (
                <div className="p-4 h-full flex flex-col">
                  {/* Header del PDF */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="bg-green-100 dark:bg-green-900/30 rounded-lg p-3 text-center flex-1">
                      <div className="flex justify-center items-center mb-2">
                        <FileText size={18} className="text-green-600 dark:text-green-400 mr-2" />
                        <span className="text-green-800 dark:text-green-300 text-sm font-semibold">
                          {documentType === 'boleta' ? 'Boleta' : 'Factura'} Generada
                        </span>
                      </div>
                      <p className="text-xs text-green-700 dark:text-green-400">
                        {documentType === 'boleta' ? 'Boleta' : 'Factura'} #{assignedFolio || 'N/A'}
                      </p>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      className="ml-2" 
                      onClick={resetDocument}
                    >
                      <RefreshCw size={18} />
                    </Button>
                  </div>
                  
                  {/* Visor de PDF Simplificado */}
                  <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-md overflow-hidden flex flex-col">
                    {/* Contenido del PDF con iframe */}
                    <div className="flex-1 overflow-hidden">
                      <iframe
                        src={pdfUrl}
                        width="100%"
                        height="100%"
                        style={{ border: 'none' }}
                        title="PDF Viewer"
                      />
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="border-t border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800">
                      <div className="flex flex-col space-y-2">
                        <Button 
                          onClick={() => window.open(pdfUrl, '_blank')}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <FileText size={16} className="mr-2" />
                          Ver PDF en Nueva Ventana
                        </Button>
                        <Button 
                          onClick={() => {
                            const link = document.createElement('a');
                            link.href = pdfUrl;
                            link.download = `${documentType === 'boleta' ? 'boleta' : 'factura'}_${assignedFolio || 'documento'}.pdf`;
                            link.click();
                          }}
                          variant="outline"
                        >
                          <FileText size={16} className="mr-2" />
                          Descargar PDF
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : generationError ? (
                <div className="p-4 h-full flex flex-col items-center justify-center">
                  <div className="bg-red-100 dark:bg-red-900/30 rounded-lg p-6 text-center">
                    <div className="flex justify-center items-center mb-4">
                      <X size={24} className="text-red-600 dark:text-red-400 mr-2" />
                      <span className="text-red-800 dark:text-red-300 text-lg font-semibold">Error al Generar Documento</span>
                    </div>
                    <p className="text-red-700 dark:text-red-400 mb-4">{generationError}</p>
                    <Button 
                      onClick={resetDocument}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Reintentar
                    </Button>
                  </div>
                </div>
              ) : showReceipt ? (
                <div className="p-4 h-full">
                  {documentType === 'boleta' ? <BoletaReceipt /> : <FacturaReceipt />}
                </div>
              ) : (
                <>
                  {/* Cart Header */}
                  <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100 flex items-center">
                        <ShoppingBag size={18} className="mr-2" />
                        Carrito de Compra
                      </h3>
                      <Button variant="ghost" size="sm" onClick={() => setCart([])}>
                        Limpiar
                      </Button>
                    </div>
                  </div>

                  {/* Cart Items */}
                  <div className="flex-1 overflow-y-auto p-4">
                    {cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-slate-400">
                        <ShoppingBag size={48} className="mb-4 opacity-20" />
                        <p className="text-center">Tu carrito está vacío</p>
                        <p className="text-sm text-center mt-2">
                          Agrega productos desde el catálogo
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div key={item.id} className="flex items-center p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50">
                            <div className="w-12 h-12 rounded overflow-hidden mr-3">
                              <img 
                                src={item.image} 
                                alt={item.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {item.name}
                              </h4>
                              
                              {editingItem === item.id ? (
                                // Modo edición
                                <div className="mt-2 space-y-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-500">Precio:</span>
                                    <Input
                                      type="text"
                                      value={editingPrice}
                                      onChange={(e) => handlePriceChange(e.target.value)}
                                      className="h-6 text-xs w-20"
                                      placeholder="0"
                                    />
                                    <span className="text-xs text-slate-500">Cantidad:</span>
                                    <Input
                                      type="text"
                                      value={editingQuantity}
                                      onChange={(e) => handleQuantityChange(e.target.value)}
                                      className="h-6 text-xs w-16"
                                      placeholder="1"
                                    />
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={() => saveEdit(item.id)}
                                    >
                                      ✓
                                    </Button>
                                    <Button 
                                      size="sm"
                                      variant="outline"
                                      className="h-6 text-xs"
                                      onClick={cancelEdit}
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                // Modo visualización
                                <div className="flex items-center justify-between mt-1">
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm text-slate-600 dark:text-slate-400">
                                      {formatPrice(item.price)}
                                    </span>
                                    <Button 
                                      size="icon"
                                      variant="ghost"
                                      className="h-4 w-4 text-slate-400 hover:text-slate-600"
                                      onClick={() => startEditing(item.id, item.price, item.quantity)}
                                    >
                                      ✏️
                                    </Button>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Button 
                                      size="icon"
                                      variant="outline"
                                      className="h-6 w-6"
                                      onClick={() => removeFromCart(item.id)}
                                    >
                                      -
                                    </Button>
                                    <span className="text-sm font-medium w-4 text-center">
                                      {item.quantity}
                                    </span>
                                    <Button 
                                      size="icon"
                                      variant="outline"
                                      className="h-6 w-6"
                                      onClick={() => addToCart(item)}
                                    >
                                      +
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="border-t border-slate-200 dark:border-slate-700 p-4 overflow-y-auto">
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                        <span className="font-medium">{formatPrice(calculateTotal())}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500 dark:text-slate-400">IVA (19%)</span>
                        <span className="font-medium">{formatPrice(calculateIVA())}</span>
                      </div>
                      {calculateOtherTaxes() > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Impuestos Adicionales</span>
                          <span className="font-medium">{formatPrice(calculateOtherTaxes())}</span>
                        </div>
                      )}
                      <div className="pt-1.5 mt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                        <span className="font-semibold">Total</span>
                        <span className="font-semibold">{formatPrice(calculateGrandTotal())}</span>
                      </div>
                    </div>

                    {/* Document Type Selection */}
                    <div className="mb-4">
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant={documentType === 'boleta' ? 'default' : 'outline'} 
                          className={documentType === 'boleta' ? 'bg-green-600 hover:bg-green-700' : ''}
                          onClick={() => handleDocumentTypeChange('boleta')}
                        >
                          <Receipt size={16} className="mr-2" /> Boleta
                        </Button>
                        <Button 
                          variant={documentType === 'factura' ? 'default' : 'outline'} 
                          className={documentType === 'factura' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                          onClick={() => handleDocumentTypeChange('factura')}
                        >
                          <FileText size={16} className="mr-2" /> Factura
                        </Button>
                      </div>
                    </div>

                    {/* Client Form for Factura */}
                    {showClientForm && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-xs font-semibold text-blue-800 dark:text-blue-200 flex items-center">
                            <User size={14} className="mr-1" />
                            Datos del Cliente
                          </h4>
                          {!isOnline && (
                            <div className="text-xs text-red-600 dark:text-red-400 flex items-center">
                              <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                              Sin conexión
                            </div>
                          )}
                          <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                            Modo Desarrollo
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-5 w-5 text-blue-600 dark:text-blue-400"
                            onClick={handleCancelClient}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                        
                        <div className="space-y-1">
                          {/* Búsqueda de Cliente */}
                          <div>
                            <label className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5 block">
                              Buscar Cliente
                            </label>
                            <div className="relative search-dropdown">
                              <Input
                                placeholder="Buscar por RUT o nombre..."
                                value={searchQuery}
                                onChange={(e) => handleSearchInputChange(e.target.value)}
                                className="text-xs h-6 pr-8"
                              />
                              {searchQuery && (
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-4 w-4"
                                  onClick={clearSearch}
                                >
                                  <X size={8} />
                                </Button>
                              )}
                              
                              {/* Dropdown de resultados */}
                              {showSearchResults && searchState.results.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute z-50 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-48 overflow-y-auto"
                                >
                                  {searchState.results.map((client) => (
                                    <div
                                      key={client.id}
                                      className="p-2 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer border-b border-slate-100 dark:border-slate-600 last:border-b-0"
                                      onClick={() => handleClientSelection(client)}
                                    >
                                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                        {client.name}
                                      </div>
                                      <div className="text-xs text-slate-500 dark:text-slate-400">
                                        {client.code} • {client.address}
                                        {client.additionalAddress && client.additionalAddress.length > 0 && (
                                          <span className="text-blue-600 dark:text-blue-400 ml-1">
                                            • {client.additionalAddress.length} dir. adicional{client.additionalAddress.length > 1 ? 'es' : ''}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </motion.div>
                              )}
                              
                              {/* Estado de carga */}
                              {searchState.isSearching && (
                                <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                  <Loader2 size={14} className="animate-spin text-blue-600" />
                                </div>
                              )}
                            </div>
                            
                            {/* Mensajes de error */}
                            {searchState.error && (
                              <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                                {searchState.error}
                                {searchState.error.includes('no encontrado') && (
                                  <div className="mt-1">
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-xs"
                                      onClick={() => {
                                        setSearchState(prev => ({ ...prev, error: null }));
                                        setShowSearchResults(false);
                                      }}
                                    >
                                      Crear nuevo cliente
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Botón de búsqueda por RUT */}
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                                                              className="flex-1 text-xs h-6"
                              onClick={() => searchClientByRUT(clientData.rut)}
                              disabled={!clientData.rut || searchState.isSearching}
                            >
                              {searchState.isSearching ? (
                                <Loader2 size={14} className="animate-spin mr-1" />
                              ) : (
                                <Search size={10} className="mr-1" />
                              )}
                              Buscar por RUT
                            </Button>
                          </div>

                          {clientSaved ? (
                            // Mostrar solo el nombre cuando el cliente está guardado
                            <div className="border-t border-blue-200 dark:border-blue-700 pt-2">
                              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <div className="text-sm font-medium text-green-800 dark:text-green-200">
                                      {savedClientData?.name}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-xs h-5 px-2 text-green-600 dark:text-green-400 hover:text-green-700"
                                    onClick={() => {
                                      setClientSaved(false);
                                      setSavedClientData(null);
                                      setSearchState(prev => ({ ...prev, selectedClient: null }));
                                      setClientData({ rut: '', name: '', address: '', selectedAddressIndex: 0 });
                                      setSearchQuery('');
                                    }}
                                  >
                                    Cambiar
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ) : (
                            // Mostrar formulario completo cuando no está guardado
                            <div className="border-t border-blue-200 dark:border-blue-700 pt-3">
                              <h5 className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-2">
                                Datos del Cliente
                                {searchState.selectedClient && (
                                  <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                    Cliente Seleccionado
                                  </span>
                                )}
                              </h5>
                              
                              <div className="space-y-1">
                                <div>
                                                                      <label className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5 block">
                                      RUT
                                    </label>
                                  <Input
                                    placeholder="12345678-9"
                                    value={clientData.rut}
                                    onChange={(e) => handleClientDataChange('rut', e.target.value)}
                                    className="text-xs h-6"
                                  />
                                </div>
                                
                                <div>
                                                                      <label className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5 block">
                                      Nombre
                                    </label>
                                  <Input
                                    placeholder="Nombre del cliente"
                                    value={clientData.name}
                                    onChange={(e) => handleClientDataChange('name', e.target.value)}
                                    className="text-xs h-6"
                                  />
                                </div>
                                
                                <div>
                                                                      <label className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-0.5 block">
                                      Dirección
                                    </label>
                                  
                                  {/* Selector de direcciones si hay múltiples */}
                                  {searchState.selectedClient && 
                                   searchState.selectedClient.additionalAddress && 
                                   searchState.selectedClient.additionalAddress.length > 0 && (
                                    <div className="mb-0.5">
                                      <Select
                                        value={clientData.selectedAddressIndex.toString()}
                                        onValueChange={(value) => handleAddressChange(parseInt(value))}
                                      >
                                        <SelectTrigger className="text-xs h-6">
                                          <SelectValue placeholder="Seleccionar dirección" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          <SelectItem value="0">
                                            <div className="text-xs">
                                              <div className="font-medium">Dirección Principal</div>
                                              <div className="text-slate-500">{searchState.selectedClient.address}</div>
                                            </div>
                                          </SelectItem>
                                          {searchState.selectedClient.additionalAddress.map((addr, index) => (
                                            <SelectItem key={addr.id} value={(index + 1).toString()}>
                                              <div className="text-xs">
                                                <div className="font-medium">Dirección {index + 1}</div>
                                                <div className="text-slate-500">
                                                  {addr.address}, {addr.municipality.name}
                                                </div>
                                              </div>
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  )}
                                  
                                  <Input
                                    placeholder="Dirección del cliente"
                                    value={clientData.address}
                                    onChange={(e) => handleClientDataChange('address', e.target.value)}
                                    className="text-xs h-6"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          
                          {!clientSaved && (clientData.rut || clientData.name || searchState.selectedClient) && (
                            <div className="flex gap-2 pt-0.5">
                              <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white flex-1 text-xs h-6"
                                onClick={handleSaveClient}
                                disabled={searchState.isSearching}
                              >
                                {searchState.isSearching ? (
                                  <>
                                    <Loader2 size={10} className="animate-spin mr-1" />
                                    Guardando...
                                  </>
                                ) : (
                                  'Guardar Cliente'
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 text-xs h-6"
                                onClick={handleCancelClient}
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Payment Options */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <Button className="bg-green-600 hover:bg-green-700">
                        <DollarSign size={16} className="mr-1" /> Efectivo
                      </Button>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <CreditCard size={16} className="mr-1" /> Tarjeta
                      </Button>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handlePrint}
                                                disabled={isGeneratingDocument || cart.length === 0}
                    >
                                              {isGeneratingDocument ? (
                        <>
                                                      <Loader2 size={16} className="mr-2 animate-spin" /> Generando documento...
                        </>
                      ) : (
                        <>
                          <Receipt size={16} className="mr-2" /> Imprimir Factura o Boleta
                        </>
                      )}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </motion.div>
        
        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400 mb-4">
                  <Shield size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                  Información de Sesión
                </h3>
                {isAuthenticated && user ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User size={16} className="text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Usuario:</strong> {user.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className="text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Email:</strong> {user.email}
                      </span>
                    </div>
                    {selectedCompany && (
                      <div className="flex items-center space-x-2">
                        <Building2 size={16} className="text-slate-500" />
                        <span className="text-sm text-slate-600 dark:text-slate-300">
                          <strong>Empresa:</strong> {selectedCompany.name} (ID: {selectedCompany.id})
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Shield size={16} className="text-slate-500" />
                      <span className="text-sm text-slate-600 dark:text-slate-300">
                        <strong>Token:</strong> {user.token.substring(0, 8)}...
                      </span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                        ✓ Sesión activa - APIs centralizadas
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 dark:text-slate-300">
                    Inicia sesión para ver la información de tu cuenta y empresa.
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <ImageConfigSection />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <div className="h-12 w-12 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
                  <ShoppingBag size={24} />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-slate-900 dark:text-white">
                  Gestión desde la Web
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Controla tu inventario sin esfuerzo con actualizaciones automáticas, 
                  alertas de stock bajo y seguimiento detallado de productos y proveedores.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
