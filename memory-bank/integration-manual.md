# FACTURA MOVIL - MANUAL DE INTEGRACIÓN DE APIs

## 📋 VISIÓN GENERAL

Este manual proporciona una guía paso a paso para integrar con las APIs de Factura Movil, incluyendo autenticación, creación de documentos y consulta de archivos imprimibles.

---

## 🔐 1. AUTENTICACIÓN

### **Proceso de Autenticación**

La autenticación se realiza enviando el nombre de usuario y contraseña en formato JSON convertido a Base64.

#### **Paso 1: Preparar Credenciales**
```json
{
  "login": "[USUARIO]",
  "password": "[CONTRASEÑA]"
}
```

#### **Paso 2: Convertir a Base64**
```javascript
// Ejemplo de conversión
const credentials = {
  "login": "usuario",
  "password": "contraseña"
};

const jsonString = JSON.stringify(credentials);
const base64Credentials = btoa(jsonString);
// Resultado: eyJsb2dpbiI6InVzdWFyaW8iLCJwYXNzd29yZCI6ImNvbnRyYXNlw6FhIn0=
```

#### **Paso 3: Realizar Request**
```http
POST [URL_BASE]/services/common/user/[JSON_BASE64]
```

#### **Respuesta Exitosa**
```json
{
  "id": 123,
  "email": "user@domain.tld",
  "token": "[TOKEN]",
  "companies": [
    {
      "id": "[COMPANY_ID]",
      "name": "Nombre de la Empresa",
      "rut": "12345678-9"
    }
  ]
}
```

#### **Respuesta de Error**
```json
{
  "success": false,
  "details": "[DESCRIPCIÓN DEL ERROR]"
}
```

---

## 🔑 2. CONFIGURACIÓN DE HEADERS

### **Token de Autenticación**

Para todas las consultas que no sean de autenticación, se debe incluir el token del usuario autenticado en el header `FACMOV_T`.

#### **Ejemplo de Header**
```http
FACMOV_T: [TOKEN_OBTENIDO_EN_AUTENTICACION]
```

#### **Headers Completos**
```http
Content-Type: application/json
Accept: application/json
FACMOV_T: [TOKEN]
```

#### **Token de Prueba (Para Desarrollo)**
```http
FACMOV_T: 61b93157-44f1-4ab1-bc38-f55861b7febb
```

---

## 🏢 3. SELECCIÓN DE COMPAÑÍA

### **Identificador de Compañía**

Para la creación de cualquier tipo de documento, se debe indicar para qué compañía se quiere realizar la acción. El identificador de la compañía puede ser cualquiera de las devueltas en la autenticación.

### **Rutas por Tipo de Documento**

#### **Factura Afecta y Factura Exenta**
```http
[URL_BASE]/services/raw/company/[COMPANY_ID]/invoice
```

#### **Nota de Crédito y Nota de Débito**
```http
[URL_BASE]/services/raw/company/[COMPANY_ID]/note
```

#### **Boleta y Boleta Exenta**
```http
[URL_BASE]/services/raw/company/[COMPANY_ID]/ticket
```

#### **Guía de Despacho**
```http
[URL_BASE]/services/raw/company/[COMPANY_ID]/waybill
```

### **ID de Compañía de Prueba (Para Desarrollo)**
```http
COMPANY_ID = 29
```

---

## 📄 4. CREACIÓN DE DOCUMENTOS

### **Proceso General**

Para la creación de un documento se deben enviar los datos en formato JSON. El formato específico de cada documento se encuentra en el Anexo Nº1.

### **Ejemplo: Creación de Factura**

#### **Request**
```http
POST [URL_BASE]/services/raw/company/[COMPANY_ID]/invoice
```

#### **Headers de Ejemplo**
```http
Content-Type: application/json
Accept: application/json
FACMOV_T: 61b93157-44f1-4ab1-bc38-f55861b7febb
```

#### **JSON de Ejemplo**
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

#### **Respuesta Exitosa**
```json
{
  "success": true,
  "id": 12345,
  "assignedFolio": "F-12345",
  "v": "abc123def456"
}
```

#### **Respuesta de Error**
```json
{
  "success": false,
  "code": "ERROR_CODE",
  "details": "Descripción del error"
}
```

---

## 📄 5. CONSULTA DE ARCHIVOS IMPRIMIBLES

### **Acceso a Documentos**

Para obtener el documento en formato imprimible, se debe utilizar el `id` devuelto en la creación del DTE. Existe una versión PDF y una versión HTML.

**Nota**: No es necesario autenticarse para acceder a los documentos, ya que quedan de acceso público. Sin embargo, llevan una validación para que no sean vistos de forma aleatoria mediante la variable `v` devuelta al crear el documento.

### **Rutas de Consulta**

#### **Versión PDF**
```http
GET [URL_BASE]/document/toPdf/[id]?v=[v]
```

#### **Versión HTML**
```http
GET [URL_BASE]/document/visualization/[id]?v=[v]
```

### **Ejemplo de Uso**
```javascript
// Después de crear una factura que devuelve:
// { "id": 12345, "v": "abc123def456" }

// Obtener PDF
const pdfUrl = `${baseUrl}/document/toPdf/12345?v=abc123def456`;

// Obtener HTML
const htmlUrl = `${baseUrl}/document/visualization/12345?v=abc123def456`;
```

---

## 📋 ANEXO Nº1 - FORMATOS DE DOCUMENTOS

### **1. FACTURA AFECTA Y FACTURA EXENTA**

```json
{
  "currency": "USD",
  "hasTaxes": true,
  "client": {
    "municipality": "Providencia",
    "code": "15637715-5",
    "name": "Sebastián Díaz Moreno",
    "line": "Desarrollo e implementación de sistemas informáticos",
    "address": "José Domingo Cañas 1550, depto 507"
  },
  "externalFolio": "OPCIONAL",
  "date": "2013-08-01",
  "details": [
    {
      "position": 1,
      "product": {
        "code": "TEST01",
        "name": "Testing 01",
        "unit": {
          "code": "Unid"
        },
        "price": 5590
      },
      "quantity": 5,
      "description": "Descripción del Testing 01"
    }
  ],
  "references": [
    {
      "position": "1",
      "documentType": {
        "code": "33"
      },
      "referencedFolio": "122334",
      "date": "2013-08-01",
      "description": "Descripción de la referencia"
    }
  ],
  "payments": [
    {
      "position": 1,
      "date": "2013-08-20",
      "amount": 123123,
      "description": "Descripción del pago"
    }
  ]
}
```

#### **Campos Específicos**
- **`currency`**: Código internacional de moneda o null
- **`hasTaxes`**: `true` para Factura afecta, `false` para Factura exenta
- **`externalFolio`**: Folio externo (opcional)
- **`references`**: Documentos referenciados (opcional)
- **`payments`**: Información de pagos (opcional)

---

### **2. NOTA DE CRÉDITO Y NOTA DE DÉBITO**

```json
{
  "currency": "USD",
  "credit": true,
  "noteType": {
    "code": 1
  },
  "client": {
    "municipality": "Providencia",
    "code": "15637715-5",
    "name": "Sebastián Díaz Moreno",
    "line": "Desarrollo e implementación de sistemas informáticos",
    "address": "José Domingo Cañas 1550, depto 507"
  },
  "externalFolio": "OPCIONAL",
  "date": "2013-08-01",
  "details": [
    {
      "position": 1,
      "product": {
        "code": "TEST01",
        "name": "Testing 01",
        "unit": "unidad",
        "price": 5590
      },
      "quantity": 5,
      "description": "Descripción del Testing 01"
    }
  ],
  "references": [
    {
      "position": "1",
      "documentType": {
        "code": "33"
      },
      "referencedFolio": "179",
      "date": "2013-08-01",
      "description": "Descripción de la referencia"
    }
  ]
}
```

#### **Campos Específicos**
- **`credit`**: `true` para Nota de crédito, `false` para Nota de débito
- **`noteType.code`**: 
  - `1`: Anula
  - `2`: Corrige texto
  - `3`: Corrige monto

---

### **3. GUÍA DE DESPACHO**

```json
{
  "transferType": {
    "code": "1"
  },
  "dispatchType": {
    "code": "2"
  },
  "client": {
    "municipality": "Providencia",
    "code": "15637715-5",
    "name": "Sebastián Díaz Moreno",
    "line": "Desarrollo e implementación de sistemas informáticos",
    "address": "José Domingo Cañas 1550, depto 507"
  },
  "externalFolio": "OPCIONAL",
  "date": "2013-08-01",
  "details": [
    {
      "position": 1,
      "product": {
        "code": "TEST01",
        "name": "Testing 01",
        "unit": {
          "code": "Unid"
        },
        "price": 5590
      },
      "quantity": 5,
      "description": "Descripción del Testing 01"
    }
  ],
  "references": [
    {
      "position": "1",
      "documentType": {
        "code": "33"
      },
      "referencedFolio": "122334",
      "date": "2013-08-01",
      "description": "Descripción de la referencia"
    }
  ],
  "payments": [
    {
      "position": 1,
      "date": "2013-08-20",
      "amount": 123123,
      "description": "Descripción del pago"
    }
  ]
}
```

#### **Campos Específicos**
- **`transferType.code`**: Tipo de traslado (1-9)
- **`dispatchType.code`**: Tipo de despacho (1-3, puede ser null)

---

### **4. BOLETA**

```json
{
  "netAmounts": "false",
  "hasTaxes": true,
  "ticketType": {
    "code": "3"
  },
  "externalFolio": "OPCIONAL",
  "date": "2013-08-01",
  "details": [
    {
      "position": 1,
      "product": {
        "code": "TEST01",
        "name": "Testing 01",
        "unit": {
          "code": "Unid"
        },
        "price": 5590
      },
      "quantity": 5,
      "description": "Descripción del Testing 01"
    }
  ],
  "references": [
    {
      "position": "1",
      "documentType": {
        "code": "33"
      },
      "referencedFolio": "122334",
      "date": "2013-08-01",
      "description": "Descripción de la referencia"
    }
  ],
  "payments": [
    {
      "position": 1,
      "date": "2013-08-20",
      "amount": 123123,
      "description": "Descripción del pago"
    }
  ]
}
```

#### **Campos Específicos**
- **`netAmounts`**: `true` solo para empresas autorizadas
- **`hasTaxes`**: `true` para Boleta afecta, `false` para Boleta exenta
- **`ticketType.code`**: Tipo de boleta (1-4)

---

## 🔄 FLUJO COMPLETO DE INTEGRACIÓN

### **Paso 1: Autenticación**
```javascript
// 1. Preparar credenciales
const credentials = {
  login: "usuario",
  password: "contraseña"
};

// 2. Convertir a Base64
const base64Credentials = btoa(JSON.stringify(credentials));

// 3. Realizar autenticación
const authResponse = await fetch(`${baseUrl}/services/common/user/${base64Credentials}`, {
  method: 'POST'
});

const authData = await authResponse.json();
const token = authData.token;
const companyId = authData.companies[0].id;

// NOTA: Para desarrollo, puedes usar directamente:
// const token = '61b93157-44f1-4ab1-bc38-f55861b7febb';
// const companyId = 29;
```

### **Paso 2: Crear Documento**
```javascript
// 4. Crear factura
const invoiceData = {
  hasTaxes: true,
  client: {
    municipality: "Providencia",
    code: "15637715-5",
    name: "Cliente Ejemplo",
    line: "Giro del cliente",
    address: "Dirección del cliente"
  },
  date: "2024-12-01",
  details: [
    {
      position: 1,
      product: {
        code: "PROD001",
        name: "Producto Ejemplo",
        unit: { code: "Unid" },
        price: 10000
      },
      quantity: 2,
      description: "Descripción del producto"
    }
  ]
};

const invoiceResponse = await fetch(`${baseUrl}/services/raw/company/29/invoice`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'FACMOV_T': '61b93157-44f1-4ab1-bc38-f55861b7febb'
  },
  body: JSON.stringify(invoiceData)
});

const invoiceResult = await invoiceResponse.json();
const documentId = invoiceResult.id;
const validationCode = invoiceResult.v;
```

### **Paso 3: Obtener Documento Imprimible**
```javascript
// 5. Obtener PDF
const pdfUrl = `${baseUrl}/document/toPdf/${documentId}?v=${validationCode}`;

// 6. Obtener HTML
const htmlUrl = `${baseUrl}/document/visualization/${documentId}?v=${validationCode}`;
```

---

## 🧪 EJEMPLOS PRÁCTICOS CON DATOS DE PRUEBA

### **Configuración Rápida para Desarrollo**

#### **Datos de Prueba**
```javascript
const TEST_TOKEN = '61b93157-44f1-4ab1-bc38-f55861b7febb';
const TEST_COMPANY_ID = 29;
const BASE_URL = 'http://produccion.facturamovil.cl'; // Ajusta según tu entorno
```

#### **Ejemplo: Crear Factura con Datos de Prueba**
```javascript
// Crear factura usando datos de prueba
const createTestInvoice = async () => {
  const invoiceData = {
    hasTaxes: true,
    client: {
      municipality: "Providencia",
      code: "15637715-5",
      name: "Cliente de Prueba",
      line: "Desarrollo de software",
      address: "Av. Providencia 1234"
    },
    date: "2024-12-01",
    details: [
      {
        position: 1,
        product: {
          code: "TEST001",
          name: "Servicio de Desarrollo",
          unit: { code: "Unid" },
          price: 50000
        },
        quantity: 1,
        description: "Desarrollo de aplicación web"
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/services/raw/company/29/invoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'FACMOV_T': '61b93157-44f1-4ab1-bc38-f55861b7febb'
      },
      body: JSON.stringify(invoiceData)
    });

    const result = await response.json();
    console.log('Factura creada:', result);
    return result;
  } catch (error) {
    console.error('Error al crear factura:', error);
  }
};
```

#### **Ejemplo: Crear Boleta con Datos de Prueba**
```javascript
// Crear boleta usando datos de prueba
const createTestTicket = async () => {
  const ticketData = {
    hasTaxes: true,
    ticketType: {
      code: "3"
    },
    date: "2024-12-01",
    details: [
      {
        position: 1,
        product: {
          code: "PROD001",
          name: "Producto de Prueba",
          unit: { code: "Unid" },
          price: 15000
        },
        quantity: 2,
        description: "Producto de prueba para desarrollo"
      }
    ]
  };

  try {
    const response = await fetch(`${BASE_URL}/services/raw/company/29/ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'FACMOV_T': '61b93157-44f1-4ab1-bc38-f55861b7febb'
      },
      body: JSON.stringify(ticketData)
    });

    const result = await response.json();
    console.log('Boleta creada:', result);
    return result;
  } catch (error) {
    console.error('Error al crear boleta:', error);
  }
};
```

#### **Ejemplo: Obtener Documento Imprimible**
```javascript
// Obtener PDF de un documento creado
const getDocumentPDF = async (documentId, validationCode) => {
  const pdfUrl = `${BASE_URL}/document/toPdf/${documentId}?v=${validationCode}`;
  
  try {
    const response = await fetch(pdfUrl);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `documento-${documentId}.pdf`;
      a.click();
    }
  } catch (error) {
    console.error('Error al obtener PDF:', error);
  }
};

// Uso:
// getDocumentPDF(12345, 'abc123def456');
```

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### **Seguridad**
- El token debe ser manejado de forma segura
- No exponer credenciales en el código cliente
- Usar HTTPS para todas las comunicaciones

### **Manejo de Errores**
- Siempre verificar el campo `success` en las respuestas
- Implementar retry logic para errores temporales
- Validar los datos antes de enviarlos

### **Validaciones**
- Verificar que la compañía existe antes de crear documentos
- Validar formato de fechas (YYYY-MM-DD)
- Asegurar que los códigos de productos y unidades existen

### **Rendimiento**
- Implementar cache para datos maestros
- Usar paginación cuando sea necesario
- Manejar timeouts apropiadamente

---

## 📚 RECURSOS ADICIONALES

### **Códigos de Error Comunes**
- **AUTH_ERROR**: Error de autenticación
- **INVALID_COMPANY**: Compañía no válida
- **INVALID_DOCUMENT**: Documento mal formado
- **SERVER_ERROR**: Error del servidor

### **Herramientas de Testing**
- Postman Collections
- cURL Examples
- Swagger/OpenAPI Documentation

### **Soporte**
- Documentación técnica completa
- Ejemplos de código
- Casos de uso específicos

---

**Última Actualización**: Diciembre 2024
**Versión**: 1.0
**Mantenido por**: Equipo de Desarrollo Factura Movil

---

Este manual complementa la documentación de APIs y proporciona ejemplos prácticos para la integración con el sistema Factura Movil.
