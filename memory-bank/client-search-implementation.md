# Implementación de Búsqueda de Clientes por Nombre y RUT

## Problema Identificado

La búsqueda de clientes estaba mostrando una lista precargada en lugar de hacer una nueva búsqueda en la API de Factura Móvil. Los usuarios necesitaban poder buscar clientes por nombre o RUT y obtener resultados filtrados en tiempo real.

## Solución Implementada

### 1. Modificación de la Función de Búsqueda

Se actualizó la función `searchClientsByName` en `components/sections/digipos-page-section.tsx` para incluir el término de búsqueda en la URL:

```typescript
// Construir URL con el término de búsqueda en el path
const searchUrl = `${API_ENDPOINTS.CLIENTS}&token=${API_CONFIG.FACMOV_T}&search=${encodeURIComponent(searchTerm)}`;
console.log('🌐 CONSTRUYENDO URL DE BÚSQUEDA CLIENTES...');
console.log('📡 URL CONSTRUIDA:', searchUrl);
console.log('📤 HEADERS ENVIADOS:', API_HEADERS.DEFAULT);
console.log('🚀 INICIANDO FETCH CLIENTES...');

// Llamada a la API de Factura Movil con el término de búsqueda
const response = await fetch(searchUrl, {
  method: 'GET',
  headers: API_HEADERS.DEFAULT
});
```

### 2. Headers de Autenticación

La API de clientes utiliza el header `FACMOV_T` para autenticación:

```typescript
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// Agregar token si está presente
if (token) {
  headers['FACMOV_T'] = token;
}
```

### 3. Endpoint de la API

La búsqueda de clientes utiliza el endpoint:
```
/services/common/client
```

Con el término de búsqueda agregado al final del path:
```
/services/common/client/<search_term>
```

### 4. Logs Detallados

Se implementaron logs detallados para debugging:

```typescript
console.log('🔍 INICIO BÚSQUEDA CLIENTES:', {
  searchTerm,
  timestamp: new Date().toISOString(),
  searchTermLength: searchTerm.length
});

console.log('📥 RESPUESTA RECIBIDA:', {
  status: response.status,
  statusText: response.statusText,
  ok: response.ok,
  headers: Object.fromEntries(response.headers.entries())
});

console.log('🔍 VALIDANDO ESTRUCTURA DE DATOS...');
console.log('📦 responseData.clients existe:', !!responseData.clients);
console.log('📦 responseData.clients es array:', Array.isArray(responseData.clients));
```

### 5. Manejo de Respuestas

#### **Respuesta Exitosa**
```typescript
if (responseData.clients && Array.isArray(responseData.clients)) {
  console.log('✅ ESTRUCTURA VÁLIDA - Clientes encontrados:', responseData.clients.length);
  setSearchState(prev => ({
    ...prev,
    isSearching: false,
    results: responseData.clients,
    error: null
  }));
  setShowSearchResults(true);
}
```

#### **Respuesta con Error**
```typescript
else {
  console.log('❌ ERROR HTTP:', response.status, response.statusText);
  const errorData = await response.json().catch(() => ({}));
  setSearchState(prev => ({
    ...prev,
    isSearching: false,
    error: errorData.details || `Error ${response.status}: ${response.statusText}`
  }));
}
```

### 6. Proxy Configuration

El proxy en `app/api/proxy/route.ts` ya está configurado para manejar la búsqueda:

```typescript
// Agregar término de búsqueda al final del path si está presente
if (search) {
  url += `/${encodeURIComponent(search)}`;
}
```

## Flujo de Búsqueda

1. **Usuario escribe en el campo de búsqueda** (nombre o RUT)
2. **Debounce de 300ms** para evitar llamadas excesivas
3. **Construcción de URL** con término de búsqueda
4. **Llamada a la API** con headers de autenticación
5. **Procesamiento de respuesta** y validación de estructura
6. **Actualización del estado** con resultados filtrados
7. **Mostrar dropdown** con resultados de búsqueda

## Estructura de Datos Esperada

La API debe devolver una respuesta con la siguiente estructura:

```json
{
  "clients": [
    {
      "id": 53,
      "code": "76058353-7",
      "name": "ELABORADORA, EMBOTELLADORA Y DISTRIBUIDORA WEISSER LTDA",
      "address": "El Roble 688",
      "additionalAddress": [...],
      "email": "diego@cervezaweisser.cl",
      "municipality": {...},
      "activity": {...},
      "line": "..."
    }
  ]
}
```

## Características Implementadas

### **Búsqueda por Nombre y RUT**
- Búsqueda simultánea por nombre de empresa y RUT
- Filtrado en tiempo real con debounce
- Mínimo 2 caracteres para iniciar búsqueda

### **Manejo de Errores**
- Logs detallados para debugging
- Manejo de errores de red
- Fallback a datos de prueba en desarrollo
- Mensajes de error informativos

### **Experiencia de Usuario**
- Indicador de carga durante búsqueda
- Dropdown con resultados filtrados
- Selección de cliente con pre-llenado de formulario
- Cierre automático del dropdown al hacer clic fuera

### **Datos de Prueba**
- Clientes de prueba para desarrollo
- Filtrado local cuando la API no está disponible
- Estructura de datos consistente

## Beneficios de la Implementación

1. **Búsqueda Real**: Ahora se hace una nueva búsqueda en la API cada vez
2. **Filtrado Eficiente**: Solo se muestran clientes que coinciden con el término
3. **Autenticación Correcta**: Uso del header FACMOV_T
4. **Logs Detallados**: Facilita el debugging y monitoreo
5. **Manejo Robusto**: Fallback a datos de prueba en caso de error
6. **Experiencia Mejorada**: Búsqueda en tiempo real con debounce

## Notas Técnicas

- **Debounce**: 300ms para optimizar llamadas a la API
- **Encoding**: URL encoding para términos de búsqueda especiales
- **Headers**: Content-Type y Accept para JSON
- **Token**: FACMOV_T en headers para autenticación
- **Proxy**: Manejo de búsqueda en el endpoint del proxy
- **Fallback**: Datos de prueba para desarrollo continuo
