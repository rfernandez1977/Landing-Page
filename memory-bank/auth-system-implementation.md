# Sistema de Autenticación - Factura Móvil

## 📋 Resumen
Implementación completa del sistema de autenticación para Factura Móvil, integrando login real con las APIs del sistema y gestión centralizada de datos de usuario y empresa.

## ✅ Funcionalidades Implementadas

### 1. Autenticación Real con APIs de Factura Móvil
- **Esquema Base64**: Implementado según especificación oficial
- **Endpoint real**: `/services/common/user/{JSON_BASE64}`
- **Token dinámico**: Obtenido de la respuesta de autenticación
- **Empresas múltiples**: Soporte para múltiples empresas por usuario

### 2. Configuración Centralizada
- **Sistema unificado**: Todas las APIs usan la misma configuración
- **Token automático**: Se incluye automáticamente en todas las llamadas
- **Empresa dinámica**: Endpoints se ajustan según empresa seleccionada
- **Persistencia**: Datos guardados en localStorage

### 3. Integración Completa con APIs
- **Búsqueda de productos**: Usa token y empresa del usuario
- **Generación de documentos**: Boletas y facturas con datos reales
- **Búsqueda de clientes**: Integrada con autenticación
- **PDF generation**: Con token de usuario autenticado

## 🔧 Arquitectura del Sistema

### **Flujo de Autenticación Real**
```mermaid
graph TD
    A[Usuario ingresa credenciales] --> B[Crear JSON de login]
    B --> C[Convertir a Base64]
    C --> D[Llamada a /services/common/user/{base64}]
    D --> E{¿Login exitoso?}
    E -->|Sí| F[Guardar token y datos de usuario]
    E -->|No| G[Mostrar error]
    F --> H[Redirigir a /digipos]
    G --> I[Permitir reintento]
```

### **Configuración Centralizada**
```mermaid
graph TD
    A[getApiConfig()] --> B[Obtener datos del localStorage]
    B --> C{¿Usuario autenticado?}
    C -->|Sí| D[Usar token y empresa real]
    C -->|No| E[Usar configuración de desarrollo]
    D --> F[Generar headers y endpoints]
    E --> F
    F --> G[Retornar configuración completa]
```

## 🛠️ Implementación Técnica

### **1. Autenticación Real**
```typescript
// contexts/AuthContext.tsx
const login = async (username: string, password: string): Promise<boolean> => {
  // Crear JSON de login según esquema oficial
  const loginData = { login: username, password: password };
  const base64Data = btoa(JSON.stringify(loginData));
  
  // Llamada a API real
  const response = await fetch(`/api/proxy?endpoint=/services/common/user/${base64Data}`);
  const data = await response.json();
  
  if (response.ok && data.token) {
    // Guardar datos reales del usuario
    const userData: User = {
      id: data.id,
      email: data.email,
      name: data.name,
      token: data.token,
      companies: data.companies
    };
    // ... guardar y redirigir
  }
};
```

### **2. Configuración Centralizada**
```typescript
// lib/config.ts
export const getApiConfig = () => {
  const authConfig = getAuthConfig();
  
  return {
    baseUrl: authConfig.baseUrl,
    token: authConfig.token,
    companyId: authConfig.companyId,
    headers: getAuthHeaders(),
    endpoints: getCompanyEndpoints()
  };
};
```

### **3. Uso en APIs**
```typescript
// Ejemplo: Búsqueda de productos
const searchProductsFromAPI = async (searchTerm: string) => {
  const apiConfig = getApiConfig();
  const searchUrl = `${apiConfig.endpoints.PRODUCTS}&token=${apiConfig.token}&search=${searchTerm}`;
  
  const response = await fetch(searchUrl, {
    headers: apiConfig.headers
  });
  // ... procesar respuesta
};
```

## 🔐 Seguridad y Autenticación

### **Esquema de Autenticación**
```json
// JSON de login
{
  "login": "admin4",
  "password": "83559705"
}

// Base64 resultante
eyJsb2dpbiI6ImFkbWluNCIsInBhc3N3b3JkIjoiODM1NTk3MDUifQ==

// Endpoint
GET /services/common/user/eyJsb2dpbiI6ImFkbWluNCIsInBhc3N3b3JkIjoiODM1NTk3MDUifQ==
```

### **Respuesta Exitosa**
```json
{
  "id": 1045,
  "email": "admin4@fm.cl",
  "name": "admin4",
  "token": "5de22b61-733a-457b-9020-9f7f46816319",
  "companies": [
    {
      "id": 37,
      "name": "Factura Móvil",
      "code": "FM-REAL"
    }
  ]
}
```

### **Headers Automáticos**
```typescript
// Se incluyen automáticamente en todas las llamadas
{
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'FACMOV_T': 'token_del_usuario_autenticado'
}
```

## 📱 Experiencia de Usuario

### **Credenciales de Acceso**
- **Usuario**: `admin4`
- **Contraseña**: `83559705`
- **Mostradas en modal**: Para facilitar el acceso

### **Información de Sesión**
- **Usuario**: Nombre del usuario autenticado
- **Email**: Correo electrónico
- **Empresa**: Nombre e ID de la empresa seleccionada
- **Token**: Primeros 8 caracteres del token (por seguridad)
- **Estado**: Indicador de sesión activa

### **Navegación**
- **Login exitoso**: Redirección automática a `/digipos`
- **Logout**: Limpieza completa y redirección a página principal
- **Persistencia**: Sesión mantenida entre recargas

## 🔗 Integración con APIs

### **Endpoints Centralizados**
```typescript
// Todos los endpoints usan la configuración del usuario
const endpoints = {
  PRODUCTS: `/api/proxy?endpoint=/services/common/product`,
  CLIENTS: `/api/proxy?endpoint=/services/common/client`,
  DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${companyId}/ticket`,
  INVOICES: `/api/proxy?endpoint=/services/raw/company/${companyId}/invoice`,
  PDF: `${baseUrl}/document/toPdf`
};
```

### **APIs Integradas**
1. **Autenticación**: `/services/common/user/{base64}`
2. **Productos**: `/services/common/product`
3. **Clientes**: `/services/common/client`
4. **Boletas**: `/services/raw/company/{id}/ticket`
5. **Facturas**: `/services/raw/company/{id}/invoice`
6. **PDFs**: `${baseUrl}/document/toPdf`

## 🎨 Diseño y UI

### **Modal de Login**
- **Esquema Base64**: Implementado según especificación oficial
- **Credenciales visibles**: Para facilitar pruebas
- **Logs detallados**: Para debugging
- **Manejo de errores**: Mensajes específicos de la API

### **Información de Sesión**
- **Datos completos**: Usuario, email, empresa, token
- **ID de empresa**: Visible para debugging
- **Token truncado**: Por seguridad
- **Estado visual**: Indicador de APIs centralizadas

## 🚀 Beneficios de la Implementación

### **Para el Usuario**
- **Login real**: Autenticación con sistema oficial
- **Datos reales**: Información de empresa y usuario
- **Experiencia fluida**: Redirección automática
- **Seguridad**: Token real para todas las operaciones

### **Para el Sistema**
- **APIs unificadas**: Todas usan la misma configuración
- **Escalabilidad**: Fácil agregar más empresas
- **Mantenibilidad**: Código centralizado
- **Debugging**: Logs detallados para troubleshooting

### **Para el Desarrollo**
- **Configuración dinámica**: Se adapta automáticamente
- **Fallbacks**: Configuración de desarrollo si no hay autenticación
- **Logs completos**: Para debugging y monitoreo
- **Flexibilidad**: Fácil cambiar entre usuarios/empresas

## 📝 Próximos Pasos

### **Mejoras Futuras**
1. **Selección de empresa**: Dropdown para cambiar entre empresas
2. **Refresh token**: Renovación automática de tokens
3. **Remember me**: Opción para mantener sesión
4. **2FA**: Autenticación de dos factores
5. **Perfil de usuario**: Edición de datos personales

### **Optimizaciones**
1. **Cache**: Cachear datos de empresa y productos
2. **Offline**: Funcionalidad offline básica
3. **Analytics**: Tracking de uso de autenticación
4. **Testing**: Tests unitarios y de integración

## 🔍 Casos de Uso

### **Flujo Completo de Usuario**
1. **Acceso**: Usuario hace clic en "Ingresar"
2. **Login**: Ingresa credenciales reales
3. **Autenticación**: Sistema valida con API de Factura Móvil
4. **Redirección**: Va automáticamente a `/digipos`
5. **Operaciones**: Todas las APIs usan token real
6. **Información**: Ve datos de su empresa en la interfaz

### **Flujo de Desarrollo**
1. **Configuración**: Sistema usa configuración de desarrollo
2. **Testing**: Pruebas con datos de desarrollo
3. **Producción**: Cambio automático a datos reales
4. **Debugging**: Logs detallados para troubleshooting

## ✅ Estado Actual - INTEGRACIÓN COMPLETADA

### **Funcionalidades Verificadas**
- ✅ **Autenticación real**: Login exitoso con credenciales reales
- ✅ **Token dinámico**: `5de22b61-733a-457b-9020-9f7f46816319` recuperado correctamente
- ✅ **Configuración centralizada**: `getAuthConfig()` funcionando perfectamente
- ✅ **Carga de productos**: 20 productos cargados exitosamente desde API
- ✅ **Búsqueda de productos**: Funcionando con token real
- ✅ **Búsqueda de clientes**: Funcionando con token real
- ✅ **Generación de documentos**: Configurada con token real
- ✅ **Persistencia**: Datos mantenidos en localStorage

### **Logs de Verificación**
```
🔍 getAuthConfig - userData.token: 5de22b61-733a-457b-9020-9f7f46816319
🔍 getAuthConfig - companyData.id: 37
🔧 Configuración centralizada: {token: '5de22b61-733a-457b-9020-9f7f46816319', companyId: '37', baseUrl: 'http://produccion.facturamovil.cl'}
Respuesta de API de productos: {products: Array(20)}
Productos cargados desde API: 20
```

### **APIs Funcionando**
- ✅ **Productos**: Carga exitosa con token real
- ✅ **Clientes**: Búsqueda exitosa con token real
- ✅ **Documentos**: Configurada para usar token real
- ✅ **PDFs**: Acceso público funcionando

---

**Fecha de Implementación**: 22 de Agosto, 2025  
**Estado**: ✅ **INTEGRACIÓN COMPLETADA Y FUNCIONANDO**  
**Versión**: 2.0  
**Próximo**: Optimizaciones y mejoras de UX
