# FACTURA MOVIL - DOCUMENTACIÓN DE APIs

## 📋 VISIÓN GENERAL DEL SISTEMA

**Tecnología Base**: Grails (Java-based framework)
**Patrón de URLs**: `/services/...Rest` (APIs RESTful)
**Funcionalidad Principal**: Gestión de Documentos Tributarios Electrónicos (DTE) en Chile
**Versiones Disponibles**: 
- Legacy (móvil)
- New (móvil)
- Raw (datos sin procesar)
- FM (Factura Movil)

---

## ⚡ CONFIGURACIÓN RÁPIDA PARA DESARROLLO

### **Datos de Prueba**
```javascript
// Token de autenticación para desarrollo
const TEST_TOKEN = '61b93157-44f1-4ab1-bc38-f55861b7febb';

// ID de compañía para desarrollo
const TEST_COMPANY_ID = 29;

// Headers estándar
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'FACMOV_T': '61b93157-44f1-4ab1-bc38-f55861b7febb'
};
```

### **Ejemplo de Uso Rápido**
```javascript
// Crear factura de prueba
const createTestInvoice = async () => {
  const response = await fetch('/services/raw/company/29/invoice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'FACMOV_T': '61b93157-44f1-4ab1-bc38-f55861b7febb'
    },
    body: JSON.stringify({
      hasTaxes: true,
      client: {
        municipality: "Providencia",
        code: "15637715-5",
        name: "Cliente de Prueba",
        line: "Desarrollo de software",
        address: "Av. Providencia 1234"
      },
      date: "2024-12-01",
      details: [{
        position: 1,
        product: {
          code: "TEST001",
          name: "Servicio de Desarrollo",
          unit: { code: "Unid" },
          price: 50000
        },
        quantity: 1,
        description: "Desarrollo de aplicación web"
      }]
    })
  });
  
  return await response.json();
};
```

---

## 🏗️ ARQUITECTURA DE APIs

### **Estructura de Versiones**
```
/services/
├── /mobile/legacy/...     # APIs móvil legacy
├── /mobile/new/...        # APIs móvil nueva versión
├── /raw/...               # APIs para datos sin procesar
├── /fm/...                # APIs específicas de Factura Movil
├── /common/...            # APIs comunes para todas las versiones
└── /load/...              # APIs para carga masiva de datos
```

### **Patrones de Nomenclatura**
- **Documentos**: `/invoice/`, `/ticket/`, `/waybill/`, `/note/`
- **Entidades**: `/client/`, `/product/`, `/company/`, `/user/`
- **Operaciones**: `GET`, `POST`, `PUT`, `DELETE`
- **Parámetros**: `{id}`, `{search}`, `{folio}`, `{period}`

---

## 📄 1. GESTIÓN DE DOCUMENTOS TRIBUTARIOS ELECTRÓNICOS (DTE)

### **1.1 APIs de Facturas (`/services/invoice/...`)**

#### **Endpoints Principales**
```http
GET    /services/invoice/{search}           # Obtener factura por ID o folio
POST   /services/invoice                    # Crear nueva factura
PUT    /services/invoice/{id}               # Actualizar factura
DELETE /services/invoice/{id}               # Eliminar factura
```

#### **Versiones Disponibles**
- `/services/invoice/...`
- `/services/mobile/legacy/invoice/...`
- `/services/mobile/new/invoice/...`
- `/services/raw/invoice/...`
- `/services/fm/invoice/...`

#### **Conceptos Clave**
- **Factura**: Documento tributario electrónico
- **DTE**: Documento Tributario Electrónico
- **Folio**: Número secuencial del documento
- **Cliente**: Receptor del documento
- **Producto**: Items facturados
- **Empresa**: Emisor del documento

#### **Ejemplo de Uso**
```javascript
// Obtener factura por folio
GET /services/invoice/F-12345

// Crear nueva factura
POST /services/invoice
{
  "clientId": 123,
  "products": [...],
  "total": 15000,
  "iva": 2850
}
```

---

### **1.2 APIs de Boletas (`/services/ticket/...`)**

#### **Endpoints Principales**
```http
GET    /services/ticket/{search}            # Obtener boleta por ID o folio
POST   /services/ticket                     # Crear nueva boleta
PUT    /services/ticket/{id}                # Actualizar boleta
DELETE /services/ticket/{id}                # Eliminar boleta
```

#### **Versiones Disponibles**
- `/services/ticket/...`
- `/services/mobile/legacy/ticket/...`
- `/services/mobile/new/ticket/...`
- `/services/raw/ticket/...`
- `/services/fm/ticket/...`

#### **Conceptos Clave**
- **Boleta**: Documento para ventas al consumidor final
- **Folio**: Número secuencial
- **Cliente**: Consumidor final
- **Producto**: Items vendidos

---

### **1.3 APIs de Guías de Despacho (`/services/waybill/...`)**

#### **Endpoints Principales**
```http
GET    /services/waybill/{search}           # Obtener guía por ID o folio
POST   /services/waybill                    # Crear nueva guía
PUT    /services/waybill/{id}               # Actualizar guía
DELETE /services/waybill/{id}               # Eliminar guía
```

#### **Versiones Disponibles**
- `/services/waybill/...`
- `/services/mobile/legacy/waybill/...`
- `/services/mobile/new/waybill/...`
- `/services/raw/waybill/...`
- `/services/fm/waybill/...`

#### **Conceptos Clave**
- **Guía de Despacho**: Documento de traslado de mercancías
- **Folio**: Número secuencial
- **Cliente**: Receptor de la mercancía
- **Producto**: Items despachados

---

### **1.4 APIs de Notas (`/services/noteRaw/...` y `/services/fm/.../note/...`)**

#### **Endpoints Principales**
```http
GET    /services/noteRaw/{search}           # Obtener nota por ID o folio
POST   /services/noteRaw                    # Crear nueva nota
PUT    /services/noteRaw/{id}               # Actualizar nota
DELETE /services/noteRaw/{id}               # Eliminar nota
```

#### **Versiones Disponibles**
- `/services/noteRaw/...`
- `/services/fm/.../note/...`

#### **Conceptos Clave**
- **Nota de Crédito**: Anula o reduce una factura
- **Nota de Débito**: Aumenta el monto de una factura
- **Folio**: Número secuencial
- **Documento Referenciado**: Factura original

---

### **1.5 APIs de Documentos Generales (`/services/document/...`)**

#### **Endpoints Principales**
```http
GET    /services/document/{id}              # Obtener documento por ID
```

#### **Conceptos Clave**
- **Documento**: Cualquier DTE (factura, boleta, guía, nota)
- **ID**: Identificador único del documento

---

### **1.6 APIs Comunes de Documentos (`/services/common/company/{id}/document/...`)**

#### **Endpoints Principales**
```http
GET    /services/common/company/{id}/document/{search}                    # Buscar documentos en empresa
GET    /services/common/company/{id}/lastsales/{search}                   # Últimas ventas
POST   /services/common/company/{id}/document/{documentId}/sendEmail/{email}  # Enviar por email
POST   /services/common/company/{id}/document/{documentId}/sendDTE/       # Enviar DTE
GET    /services/common/company/{id}/document/{documentId}/getStamp       # Obtener timbre
GET    /services/common/company/{id}/document/{documentId}/getBarcode     # Obtener código de barras
GET    /services/common/company/{id}/document/{documentId}/getState       # Obtener estado
GET    /services/common/company/{id}/document/{documentId}/getXml         # Descargar XML
GET    /services/common/company/{id}/document/emitted                     # Documentos emitidos
GET    /services/common/company/{id}/document/rejected/{period}/{page}    # Documentos rechazados
GET    /services/common/company/{companyId}/invoice/{folio}/getInfo       # Info de factura
GET    /services/common/company/{companyId}/note/{folio}/getInfo          # Info de nota
GET    /services/common/company/{companyId}/ticket/{folio}/getInfo        # Info de boleta
GET    /services/common/company/{id}/reception                            # Documentos de recepción
```

#### **Conceptos Clave**
- **Empresa**: Contexto de la empresa
- **Documento**: DTE específico
- **Email**: Dirección de envío
- **XML**: Formato oficial del DTE
- **Código de Barras**: Representación visual del DTE
- **Estado**: Estado de procesamiento del DTE
- **Timbre**: Validación del SII

#### **Ejemplo de Uso**
```javascript
// Obtener información de factura
GET /services/common/company/123/invoice/F-5678/getInfo

// Enviar factura por email
POST /services/common/company/123/document/456/sendEmail/cliente@email.com

// Obtener XML de factura
GET /services/common/company/123/document/456/getXml
```

---

## 🏢 2. GESTIÓN DE DATOS DE LA EMPRESA

### **2.1 APIs de Empresa (`/services/company/...`)**

#### **Endpoints Principales**
```http
GET    /services/company/{id}               # Obtener información de empresa
GET    /services/company/{code}/check       # Verificar existencia por código
GET    /services/company/{id}/paymentMethod # Obtener métodos de pago
```

#### **Sub-APIs de Libros Contables**
```http
GET    /services/company/{id}/ledger/...    # Gestión de libros contables
```

#### **Conceptos Clave**
- **Empresa**: Entidad emisora de documentos
- **Código**: Identificador único de la empresa
- **Métodos de Pago**: Formas de pago aceptadas
- **Libros Contables**: Registros contables

---

## 👥 3. GESTIÓN DE CLIENTES, PRODUCTOS Y PROVEEDORES

### **3.1 APIs de Clientes (`/services/client/...`)**

#### **Endpoints Principales**
```http
GET    /services/client/{id}                # Obtener cliente
POST   /services/client                     # Crear cliente
PUT    /services/client/{id}                # Actualizar cliente
DELETE /services/client/{id}                # Eliminar cliente
```

#### **APIs de Carga Masiva**
```http
POST   /services/load/company/{id}/client   # Guardar lista de clientes
PUT    /services/load/company/{id}/client   # Actualizar lista de clientes
```

#### **APIs Comunes**
```http
GET    /services/common/client/...          # Funciones comunes de clientes
```

#### **Conceptos Clave**
- **Cliente**: Receptor de documentos
- **Datos Personales**: Información del cliente
- **Carga Masiva**: Importación de múltiples clientes

#### **Ejemplo de Uso**
```javascript
// Crear nuevo cliente
POST /services/client
{
  "name": "Juan Pérez",
  "rut": "12345678-9",
  "email": "juan@email.com",
  "address": "Av. Principal 123"
}

// Cargar clientes masivamente
POST /services/load/company/123/client
{
  "clients": [
    {"name": "Cliente 1", "rut": "11111111-1"},
    {"name": "Cliente 2", "rut": "22222222-2"}
  ]
}
```

---

### **3.2 APIs de Productos (`/services/product/...`)**

#### **Endpoints Principales**
```http
GET    /services/product/{id}               # Obtener producto
POST   /services/product                    # Crear producto
PUT    /services/product/{id}               # Actualizar producto
DELETE /services/product/{id}               # Eliminar producto
```

#### **APIs de Carga Masiva**
```http
POST   /services/load/company/{id}/product  # Guardar lista de productos
PUT    /services/load/company/{id}/product  # Actualizar lista de productos
```

#### **APIs Comunes**
```http
GET    /services/common/product/...         # Funciones comunes de productos
```

#### **Conceptos Clave**
- **Producto**: Item vendido o facturado
- **Inventario**: Stock disponible
- **Carga Masiva**: Importación de múltiples productos

---

### **3.3 APIs de Proveedores (`/services/supplier/...`)**

#### **Endpoints Principales**
```http
GET    /services/supplier/{id}              # Obtener proveedor
POST   /services/supplier                   # Crear proveedor
PUT    /services/supplier/{id}              # Actualizar proveedor
DELETE /services/supplier/{id}              # Eliminar proveedor
```

#### **APIs Comunes**
```http
GET    /services/common/supplier/...        # Funciones comunes de proveedores
```

#### **Conceptos Clave**
- **Proveedor**: Entidad que suministra productos/servicios
- **Datos de Contacto**: Información de contacto del proveedor

---

### **3.4 APIs de Stock (`/services/load/company/{id}/stock`)**

#### **Endpoints Principales**
```http
POST   /services/load/company/{id}/stock    # Cargar datos de stock
```

#### **Conceptos Clave**
- **Stock**: Inventario disponible
- **Carga Masiva**: Actualización masiva de inventario

---

## 👤 4. GESTIÓN DE USUARIOS Y AUTENTICACIÓN

### **4.1 APIs de Usuarios (`/services/user/...`)**

#### **Endpoints Principales**
```http
GET    /services/user/{id}                  # Obtener usuario
GET    /services/user/{username}/{password} # Autenticar usuario
```

#### **APIs Comunes**
```http
GET    /services/common/user/loginDemo      # Iniciar sesión demo
```

#### **Conceptos Clave**
- **Usuario**: Persona que accede al sistema
- **Autenticación**: Verificación de credenciales
- **Demo**: Modo de prueba del sistema

#### **Ejemplo de Uso**
```javascript
// Autenticar usuario
GET /services/user/admin/123456

// Login demo
GET /services/common/user/loginDemo
```

---

## 🔧 5. OTROS SERVICIOS

### **5.1 APIs de Datos Maestros**

#### **Categorías de Servicios**
```http
/services/activity/...      # Actividades económicas
/services/bank/...          # Bancos
/services/category/...      # Categorías de productos
/services/dispatchType/...  # Tipos de despacho
/services/municipality/...  # Municipios
/services/transferType/...  # Tipos de transferencia
/services/unit/...          # Unidades de medida
/services/paymentMethod/... # Métodos de pago
/services/service/...       # Servicios
/services/period/...        # Períodos contables
```

#### **Conceptos Clave**
- **Datos Maestros**: Información de referencia del sistema
- **Catálogos**: Listas de valores predefinidos
- **Configuración**: Parámetros del sistema

---

## 📊 6. PATRONES DE INTEGRACIÓN

### **6.1 Estructura de Respuestas**

#### **Respuesta Exitosa**
```json
{
  "success": true,
  "data": {
    // Datos de la respuesta
  },
  "message": "Operación exitosa"
}
```

#### **Respuesta de Error**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descripción del error"
  }
}
```

### **6.2 Headers Comunes**
```http
Content-Type: application/json
Accept: application/json
FACMOV_T: {token}  # Token de autenticación
```

### **6.3 Datos de Prueba para Desarrollo**
```javascript
// Token de prueba
const TEST_TOKEN = '61b93157-44f1-4ab1-bc38-f55861b7febb';

// ID de compañía de prueba
const TEST_COMPANY_ID = 29;

// Headers de ejemplo
const headers = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'FACMOV_T': '61b93157-44f1-4ab1-bc38-f55861b7febb'
};
```

### **6.3 Parámetros de Paginación**
```http
GET /services/endpoint?page=1&size=20&sort=id,desc
```

---

## 🧪 7. EJEMPLOS DE INTEGRACIÓN

### **7.1 Flujo Completo de Facturación**

```javascript
// 1. Obtener información de empresa
GET /services/company/29

// 2. Obtener cliente
GET /services/client/456

// 3. Obtener productos
GET /services/product/789

// 4. Crear factura
POST /services/raw/company/29/invoice
{
  "companyId": 123,
  "clientId": 456,
  "products": [
    {
      "productId": 789,
      "quantity": 2,
      "price": 5000
    }
  ],
  "total": 10000,
  "iva": 1900
}

// 5. Obtener información de la factura creada
GET /services/common/company/29/invoice/F-12345/getInfo

// 6. Enviar factura por email
POST /services/common/company/29/document/999/sendEmail/cliente@email.com

// 7. Obtener XML de la factura
GET /services/common/company/29/document/999/getXml
```

### **7.2 Flujo de Carga Masiva**

```javascript
// 1. Cargar clientes
POST /services/load/company/29/client
{
  "clients": [
    {"name": "Cliente 1", "rut": "11111111-1"},
    {"name": "Cliente 2", "rut": "22222222-2"}
  ]
}

// 2. Cargar productos
POST /services/load/company/29/product
{
  "products": [
    {"name": "Producto 1", "price": 1000},
    {"name": "Producto 2", "price": 2000}
  ]
}

// 3. Cargar stock
POST /services/load/company/29/stock
{
  "stock": [
    {"productId": 1, "quantity": 100},
    {"productId": 2, "quantity": 50}
  ]
}
```

---

## 🔍 8. CASOS DE USO COMUNES

### **8.1 Validación de Documentos**
```javascript
// Validar factura por folio
GET /services/common/company/29/invoice/F-5678/getInfo
```

### **8.2 Envío de Documentos**
```javascript
// Enviar factura por email
POST /services/common/company/29/document/456/sendEmail/cliente@email.com

// Enviar DTE
POST /services/common/company/29/document/456/sendDTE/
```

### **8.3 Consulta de Estados**
```javascript
// Obtener estado de documento
GET /services/common/company/29/document/456/getState

// Obtener documentos rechazados
GET /services/common/company/29/document/rejected/2024/1
```

### **8.4 Descarga de Documentos**
```javascript
// Descargar XML
GET /services/common/company/29/document/456/getXml

// Obtener código de barras
GET /services/common/company/29/document/456/getBarcode
```

---

## ⚠️ 9. CONSIDERACIONES IMPORTANTES

### **9.1 Seguridad**
- Todas las APIs requieren autenticación apropiada
- Los tokens de acceso deben ser manejados de forma segura
- Las credenciales no deben ser expuestas en el código cliente

### **9.2 Rendimiento**
- Usar paginación para listas grandes
- Implementar cache cuando sea apropiado
- Manejar timeouts en las peticiones

### **9.3 Manejo de Errores**
- Siempre verificar el campo `success` en las respuestas
- Implementar retry logic para errores temporales
- Logging apropiado de errores para debugging

### **9.4 Versionado**
- Usar la versión apropiada de las APIs según el contexto
- Legacy para compatibilidad, New para nuevas funcionalidades
- Raw para datos sin procesar, FM para funcionalidades específicas

---

## 📚 10. RECURSOS ADICIONALES

### **10.1 Documentación Técnica**
- Grails Framework Documentation
- REST API Best Practices
- Chilean DTE Standards

### **10.2 Herramientas de Testing**
- Postman Collections
- cURL Examples
- Swagger/OpenAPI Documentation

### **10.3 Monitoreo**
- API Response Times
- Error Rates
- Usage Analytics

---

**Última Actualización**: Diciembre 2024
**Versión**: 1.0
**Mantenido por**: Equipo de Desarrollo Factura Movil

---

Este documento sirve como referencia completa para todas las integraciones con las APIs del sistema Factura Movil. Para preguntas específicas sobre integraciones, consulta las secciones relevantes según el tipo de operación que necesites realizar.
