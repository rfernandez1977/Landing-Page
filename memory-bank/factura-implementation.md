# Implementación de Facturas - Sistema POS Factura Móvil

## Resumen de la Implementación Actual

Basándome en la documentación del memory bank, el sistema ya tiene una implementación básica de facturas que necesita ser mejorada para usar el endpoint correcto y la estructura de datos apropiada.

## Documentación Encontrada en Memory Bank

### 1. **API Documentation** (`api-documentation.md`)
- **Endpoint de Facturas**: `/services/invoice/...`
- **Versiones disponibles**:
  - `/services/invoice/...`
  - `/services/mobile/legacy/invoice/...`
  - `/services/mobile/new/invoice/...`
  - `/services/raw/invoice/...`
  - `/services/fm/invoice/...`

### 2. **Integration Manual** (`integration-manual.md`)
- **Endpoint específico**: `POST [URL_BASE]/services/raw/company/[COMPANY_ID]/invoice`
- **Headers requeridos**:
  ```http
  Content-Type: application/json
  Accept: application/json
  FACMOV_T: [TOKEN]
  ```

## Estructura de Payload para Facturas

### **Payload Según Documentación**
```json
{
  "hasTaxes": true,
  "client": {
    "municipality": "Comuna",
    "code": "88888888-8",
    "name": "Nombre del cliente",
    "line": "Giro del cliente",
    "address": "Dirección del cliente"
  },
  "date": "2013-08-01",
  "details": [
    {
      "position": 1,
      "product": {
        "code": "Código del producto",
        "name": "Nombre del producto",
        "unit": {
          "code": "Unid"
        },
        "price": 5590
      },
      "quantity": 5,
      "description": "Descripción del producto"
    }
  ]
}
```

### **Respuesta Esperada**
```json
{
  "success": true,
  "id": 12345,
  "assignedFolio": "F-12345",
  "v": "abc123def456"
}
```

## Implementación Actual vs. Requerida

### **Estado Actual**
- ✅ Selector de tipo de documento (Boleta/Factura)
- ✅ Formulario de cliente para facturas
- ✅ Validación de cliente requerido para facturas
- ✅ Componente visual de factura
- ❌ Endpoint incorrecto (usa `/ticket` en lugar de `/invoice`)
- ❌ Estructura de payload incorrecta para facturas

### **Mejoras Necesarias**

#### **1. Configuración de Endpoints**
```typescript
// En lib/config.ts
export const API_ENDPOINTS = {
  PRODUCTS: `/api/proxy?endpoint=/services/common/product`,
  CLIENTS: `/api/proxy?endpoint=/services/common/client`,
  DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/ticket`,
  INVOICES: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/invoice`, // NUEVO
  PDF: `${API_CONFIG.BASE_URL}/document/toPdf`
};
```

#### **2. Lógica de Selección de Endpoint**
```typescript
// Determinar el endpoint correcto según el tipo de documento
const endpoint = documentType === 'factura' ? API_ENDPOINTS.INVOICES : API_ENDPOINTS.DOCUMENTS;
```

#### **3. Payload Específico para Facturas**
```typescript
const payload = documentType === 'factura' ? {
  // Payload específico para Facturas
  hasTaxes: true,
  client: savedClientData ? {
    municipality: savedClientData.municipality?.name || "Santiago",
    code: savedClientData.code,
    name: savedClientData.name,
    line: savedClientData.line || "Actividad comercial",
    address: savedClientData.address,
    email: savedClientData.email || ""
  } : undefined,
  date: new Date().toISOString().split('T')[0],
  externalFolio: "OPCIONAL",
  details: cart.map((item, index) => ({
    position: index + 1,
    product: {
      code: originalProduct?.code || item.id.toString(),
      name: item.name,
      unit: { code: originalProduct?.unit?.code || "Unid" },
      price: Math.round(item.price) // Precio neto para facturas
    },
    quantity: item.quantity,
    description: item.name
  }))
} : {
  // Payload para Boletas (existente)
  // ... código actual
};
```

## Diferencias Clave entre Boletas y Facturas

### **Boletas**
- **Endpoint**: `/services/raw/company/[COMPANY_ID]/ticket`
- **Precio**: Con impuestos incluidos
- **Cliente**: No requerido
- **Estructura**: Incluye `ticketType`, `netTotal`, `taxes`, `total`

### **Facturas**
- **Endpoint**: `/services/raw/company/[COMPANY_ID]/invoice`
- **Precio**: Neto (sin impuestos)
- **Cliente**: Requerido
- **Estructura**: Incluye `client`, `details` con `position`

## Flujo de Implementación

### **1. Configuración**
- Agregar endpoint de facturas en `lib/config.ts`
- Actualizar tipos de documento

### **2. Lógica de Generación**
- Modificar función `generateDocument`
- Agregar selección de endpoint según tipo
- Crear payload específico para facturas

### **3. Validaciones**
- Cliente requerido para facturas
- Estructura de datos correcta
- Manejo de errores específicos

### **4. UI/UX**
- Indicadores visuales de tipo de documento
- Formulario de cliente para facturas
- Mensajes de error apropiados

## Beneficios de la Implementación

1. **Separación Clara**: Boletas y facturas usan endpoints diferentes
2. **Estructura Correcta**: Payload específico para cada tipo
3. **Validaciones Apropiadas**: Cliente requerido solo para facturas
4. **Manejo de Errores**: Específico para cada tipo de documento
5. **Escalabilidad**: Fácil agregar otros tipos de documentos

## Notas Técnicas

- **Autenticación**: Header `FACMOV_T` requerido
- **Proxy**: Usar proxy para evitar CORS
- **PDF**: Acceso público con hash de validación
- **Folios**: Manejo de folios agotados
- **Logs**: Logs detallados para debugging

## Implementación Completada ✅

### **Cambios Implementados**

1. ✅ **Endpoint de facturas** agregado en `lib/config.ts`
2. ✅ **Lógica de selección de endpoint** según tipo de documento
3. ✅ **Payload específico para facturas** con estructura correcta
4. ✅ **Validaciones mejoradas** para facturas:
   - Cliente requerido
   - Datos completos del cliente
   - Formato de RUT válido
5. ✅ **Logs específicos** para debugging de facturas
6. ✅ **Mensajes de error informativos** con toasts

### **Funcionalidades Agregadas**

#### **Validación de RUT**
- Función `validateRutFormat()` para validar formato XXXXXXXX-X
- Función `formatRut()` para formatear automáticamente
- Validación en tiempo real

#### **Validación de Cliente**
- Verificación de campos requeridos (nombre, RUT, dirección)
- Mensajes de error específicos
- Toasts informativos para el usuario

#### **Logs Mejorados**
- Logs específicos para facturas vs. boletas
- Información detallada del cliente
- Detalles del payload según tipo de documento

### **Estructura Final**

```typescript
// Endpoint correcto para facturas
const endpoint = documentType === 'factura' ? API_ENDPOINTS.INVOICES : API_ENDPOINTS.DOCUMENTS;

// Payload específico para facturas
const payload = documentType === 'factura' ? {
  hasTaxes: true,
  client: {
    municipality: savedClientData.municipality?.name,
    code: savedClientData.code, // RUT formateado
    name: savedClientData.name,
    line: savedClientData.line,
    address: savedClientData.address,
    email: savedClientData.email
  },
  date: new Date().toISOString().split('T')[0],
  externalFolio: "OPCIONAL",
  details: cart.map((item, index) => ({
    position: index + 1,
    product: {
      code: originalProduct?.code,
      name: item.name,
      unit: { code: originalProduct?.unit?.code },
      price: Math.round(item.price) // Precio neto
    },
    quantity: item.quantity,
    description: item.name
  }))
} : {
  // Payload para boletas (existente)
};
```

## Estado Actual

- ✅ **Configuración completa** de endpoints
- ✅ **Payload específico** para facturas
- ✅ **Validaciones robustas** de cliente y RUT
- ✅ **Logs detallados** para debugging
- ✅ **Manejo de errores** mejorado
- ✅ **Experiencia de usuario** optimizada

## Próximos Pasos

1. **Probar integración** con API de Factura Móvil
2. **Verificar respuesta** de facturas generadas
3. **Validar PDF** de facturas
4. **Documentar casos de uso** específicos
5. **Crear guías de usuario** para facturación
