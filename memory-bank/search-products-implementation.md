# Implementación de Búsqueda de Productos - DigiPos

## Problema Identificado

### Error Original
Al buscar productos en la página DigiPos (`/digipos`), se producía un error 500 con el siguiente patrón:

```
GET http://localhost:3000/api/proxy?endpoint=/services/common/product&token=61b93157-44f1-4ab1-bc38-f55861b7febb/plan 500 (Internal Server Error)
```

### Causa Raíz
El token se estaba concatenando incorrectamente con el término de búsqueda, resultando en URLs malformadas como:
```
/api/proxy?endpoint=/services/common/product&token=61b93157-44f1-4ab1-bc38-f55861b7febb/plan
```

### Problema Secundario
Después de corregir el error 500, la búsqueda devolvía todos los productos (20) en lugar de filtrar por el término de búsqueda, porque la API de Factura Móvil espera el término de búsqueda al final del path, no como parámetro de consulta.

## Solución Implementada

### 1. Corrección de la Configuración de Endpoints

**Archivo**: `lib/config.ts`

**Antes**:
```typescript
export const API_ENDPOINTS = {
  PRODUCTS: `/api/proxy?endpoint=/services/common/product&token=${API_CONFIG.FACMOV_T}`,
  CLIENTS: `/api/proxy?endpoint=/services/common/client&token=${API_CONFIG.FACMOV_T}`,
  DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/ticket&token=${API_CONFIG.FACMOV_T}`,
  PDF: `${API_CONFIG.BASE_URL}/document/toPdf`
};
```

**Después**:
```typescript
export const API_ENDPOINTS = {
  PRODUCTS: `/api/proxy?endpoint=/services/common/product`,
  CLIENTS: `/api/proxy?endpoint=/services/common/client`,
  DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/ticket`,
  PDF: `${API_CONFIG.BASE_URL}/document/toPdf`
};
```

### 2. Actualización de Llamadas a la API

**Archivo**: `components/sections/digipos-page-section.tsx`

Todas las llamadas a la API se actualizaron para incluir el token como parámetro separado:

```typescript
// Antes
const response = await fetch(API_ENDPOINTS.PRODUCTS, {
  method: 'GET',
  headers: API_HEADERS.DEFAULT
});

// Después
const response = await fetch(`${API_ENDPOINTS.PRODUCTS}&token=${API_CONFIG.FACMOV_T}`, {
  method: 'GET',
  headers: API_HEADERS.DEFAULT
});
```

### 3. Implementación de Búsqueda

**Función de búsqueda**:
```typescript
const searchUrl = `${API_ENDPOINTS.PRODUCTS}&token=${API_CONFIG.FACMOV_T}&search=${encodeURIComponent(searchTerm)}`;
```

### 4. Modificación del Proxy

**Archivo**: `app/api/proxy/route.ts`

El proxy se modificó para manejar el parámetro de búsqueda correctamente:

```typescript
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');
  const token = searchParams.get('token');
  const search = searchParams.get('search');

  if (!endpoint) {
    return NextResponse.json({ error: 'Endpoint parameter is required' }, { status: 400 });
  }

  try {
    const baseUrl = 'http://produccion.facturamovil.cl';
    let url = `${baseUrl}${endpoint}`;
    
    // Agregar término de búsqueda al final del path si está presente
    if (search) {
      url += `/${encodeURIComponent(search)}`;
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Agregar token si está presente
    if (token) {
      headers['FACMOV_T'] = token;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('❌ Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data from external API' }, 
      { status: 500 }
    );
  }
}
```

## Flujo de Funcionamiento

### 1. Carga Inicial
- Se cargan 20 productos genéricos desde la API
- Se muestran 4 productos en pantalla (configurado en `APP_CONFIG.MAX_PRODUCTS_DISPLAY`)

### 2. Búsqueda de Productos
1. Usuario ingresa término de búsqueda (ej: "Wisky")
2. Se construye URL: `/api/proxy?endpoint=/services/common/product&token=61b93157-44f1-4ab1-bc38-f55861b7febb&search=Wisky`
3. Proxy convierte a: `http://produccion.facturamovil.cl/services/common/product/Wisky`
4. API devuelve productos filtrados
5. Se mapean y muestran los resultados

## URLs Resultantes

### Carga Inicial
```
/api/proxy?endpoint=/services/common/product&token=61b93157-44f1-4ab1-bc38-f55861b7febb
→ http://produccion.facturamovil.cl/services/common/product
```

### Búsqueda
```
/api/proxy?endpoint=/services/common/product&token=61b93157-44f1-4ab1-bc38-f55861b7febb&search=Wisky
→ http://produccion.facturamovil.cl/services/common/product/Wisky
```

## Archivos Modificados

1. `lib/config.ts` - Configuración de endpoints
2. `components/sections/digipos-page-section.tsx` - Lógica de búsqueda y llamadas a API
3. `app/api/proxy/route.ts` - Proxy para manejo de parámetros

## Consideraciones Futuras

- La API de Factura Móvil usa el patrón `/<search_term>` para búsquedas
- El token debe enviarse en el header `FACMOV_T`, no en la URL
- Todos los endpoints que requieran autenticación deben incluir el token como parámetro separado
- El proxy maneja la conversión de parámetros y headers automáticamente

## Estado Actual

✅ **Funcionando correctamente**
- Búsqueda de productos filtra correctamente
- No hay errores 500
- Token se maneja correctamente
- Proxy funciona como esperado
