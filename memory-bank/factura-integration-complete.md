# Implementación Completa de Facturas - DigiPos

## 📋 Resumen
Implementación exitosa del sistema de facturas en DigiPos con soporte completo para impuestos adicionales y manejo correcto de clientes desde la API de Factura Móvil.

## ✅ Funcionalidades Implementadas

### 1. Generación de Facturas
- **Endpoint**: `/services/raw/company/{COMPANY_ID}/invoice`
- **Método**: POST
- **Autenticación**: Token `FACMOV_T` en headers
- **Respuesta exitosa**: 
  ```json
  {
    "success": true,
    "id": 9689170,
    "assignedFolio": "2452",
    "validation": "45036c26749b7c014bafa7a757d20f4ec4eb4ab1"
  }
  ```

### 2. Manejo de Clientes
- **Búsqueda por RUT**: `/services/common/client/{RUT}`
- **Búsqueda por nombre**: `/services/common/client/{NOMBRE}`
- **Selección automática**: Al seleccionar cliente del dropdown, se guarda con ID real de la API
- **ID correcto**: Se usa el ID real del sistema de Factura Móvil (ej: `80380`)

### 3. Impuestos Adicionales
- **Cálculo automático**: Se calculan en el carrito y se transfieren al payload
- **Porcentajes dinámicos**: Cada producto puede tener diferentes porcentajes
- **Inclusión en totales**: Se suman al total final de la factura

## 🔧 Estructura del Payload de Factura

```typescript
{
  hasTaxes: true,
  externalFolio: "OPCIONAL",
  client: {
    id: 80380, // ID real del sistema de Factura Móvil
    address: "LAS LOMAS 250 ALTO EL MANZANO",
    email: "rfernandez@facturamovil.cl",
    name: "FACTURA MOVIL SPA",
    municipality: {
      id: 288,
      name: "San Fernando",
      code: "6301"
    },
    line: "DESARROLLO DE SISTEMAS EN GESTION Y SOFTWARE",
    code: "76212889-6",
    additionalAddress: []
  },
  details: [
    {
      product: {
        id: 123,
        unit: { id: 2, name: "Unidad", code: "Unid" },
        category: {
          id: 1309,
          otherTax: {
            id: 8,
            percent: 20.5,
            name: "IVA Anticipado harina",
            code: "19"
          },
          name: "Bebidas Alcohólicas",
          code: "110"
        },
        price: 6379,
        name: "Wisky",
        code: "WISKY001"
      },
      quantity: 1
    }
  ],
  netTotal: 6379.928315412187,
  discounts: [],
  date: "2025-08-22",
  exemptTotal: 0,
  otherTaxes: 1308,
  taxes: 1212
}
```

## 🧮 Cálculos de Impuestos

### Función de Cálculo de Impuestos Adicionales
```typescript
const calculateOtherTaxes = () => {
  return cart.reduce((total, item) => {
    if (item.category?.otherTax) {
      const itemTotal = item.price * item.quantity;
      const otherTaxAmount = itemTotal * (item.category.otherTax.percent / 100);
      return total + otherTaxAmount;
    }
    return total;
  }, 0);
};
```

### Totales Finales
- **Subtotal**: Suma de precios netos × cantidades
- **IVA**: Subtotal × 0.19 (19%)
- **Impuestos Adicionales**: Calculados por producto según porcentaje
- **Total Final**: Subtotal + IVA + Impuestos Adicionales

## 🔄 Flujo de Cliente

### 1. Búsqueda de Cliente
```typescript
// Búsqueda por RUT
const searchUrl = `${API_ENDPOINTS.CLIENTS}&token=${API_CONFIG.FACMOV_T}&search=${encodeURIComponent(rut)}`;

// Búsqueda por nombre
const searchUrl = `${API_ENDPOINTS.CLIENTS}&token=${API_CONFIG.FACMOV_T}&search=${encodeURIComponent(nombre)}`;
```

### 2. Selección de Cliente
```typescript
const handleClientSelection = (client: Client) => {
  // Guardar cliente con ID real de la API
  setSavedClientData(client);
  setClientSaved(true);
  
  // Pre-llenar formulario
  setClientData({
    rut: client.code,
    name: client.name,
    address: client.address,
    selectedAddressIndex: 0
  });
};
```

### 3. Uso en Factura
El cliente guardado se usa automáticamente en el payload de factura con su ID real.

## 🛠️ Configuración de API

### Endpoints
```typescript
// lib/config.ts
export const API_ENDPOINTS = {
  PRODUCTS: `/api/proxy?endpoint=/services/common/product`,
  CLIENTS: `/api/proxy?endpoint=/services/common/client`,
  DOCUMENTS: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/ticket`,
  INVOICES: `/api/proxy?endpoint=/services/raw/company/${API_CONFIG.COMPANY_ID}/invoice`,
  PDF: `${API_CONFIG.BASE_URL}/document/toPdf`
};
```

### Headers
```typescript
export const API_HEADERS = {
  DEFAULT: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'FACMOV_T': API_CONFIG.FACMOV_T
  }
};
```

## 📊 Logs de Debug

### Logs Importantes
- `🧾 PAYLOAD COMPLETO DE FACTURA`: Payload completo enviado
- `👤 DATOS DEL CLIENTE UTILIZADOS EN FACTURA`: Datos del cliente
- `🧾 IMPUESTOS ADICIONALES EN FACTURA`: Cálculos de impuestos
- `💰 TOTAL IMPUESTOS ADICIONALES`: Total calculado

### Ejemplo de Log Exitoso
```
✅ Proxy POST response: {
  status: 200,
  data: {
    success: true,
    id: 9689170,
    assignedFolio: "2452",
    validation: "45036c26749b7c014bafa7a757d20f4ec4eb4ab1"
  }
}
```

## 🚨 Manejo de Errores

### Errores Comunes
1. **"El cliente seleccionado no existe"**: ID de cliente incorrecto
2. **"Error al crear factura"**: Problema en el payload
3. **"No hay suficientes folios disponibles"**: Folios agotados

### Validaciones
- Cliente requerido para facturas
- RUT válido
- Datos completos del cliente
- Productos en el carrito

## 🎯 Puntos Clave de la Implementación

1. **ID de Cliente Real**: Se usa el ID que viene de la API de Factura Móvil
2. **Impuestos Adicionales**: Se calculan y transfieren correctamente
3. **Selección Automática**: Al seleccionar cliente, se guarda automáticamente
4. **Payload Completo**: Incluye todos los campos requeridos
5. **PDF Integration**: Usa el mismo sistema que las boletas

## 📝 Notas Técnicas

- **Esquema Temporal**: Se eliminó el campo `ticketType` como solicitado
- **Compatibilidad**: Mantiene compatibilidad con el sistema existente
- **Performance**: Cálculos optimizados para el carrito
- **UX**: Mensajes de error claros para el usuario

## 🔗 Archivos Modificados

- `components/sections/digipos-page-section.tsx`: Lógica principal
- `lib/config.ts`: Configuración de endpoints
- `app/api/proxy/route.ts`: Proxy para API calls

---

**Fecha de Implementación**: 22 de Agosto, 2025  
**Estado**: ✅ Funcionando correctamente  
**Versión**: 1.0
