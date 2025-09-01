# Nuevo Esquema Temporal de Facturas - Prueba

## 🧪 Objetivo

Probar un nuevo esquema de facturas temporalmente mientras se mantiene el esquema original congelado. Este nuevo esquema está basado en la estructura proporcionada por el usuario.

## 📋 Esquema Original (Congelado)

```typescript
// ESQUEMA ORIGINAL - CONGELADO
{
  hasTaxes: true,
  client: {
    municipality: string,
    code: string,
    name: string,
    line: string,
    address: string,
    email: string
  },
  date: string,
  externalFolio: string,
  details: [
    {
      position: number,
      product: {
        code: string,
        name: string,
        unit: { code: string },
        price: number
      },
      quantity: number,
      description: string
    }
  ],
  netTotal: number,
  discounts: [],
  exemptTotal: number,
  otherTaxes: number,
  taxes: number,
  total: number
}
```

## 🆕 Nuevo Esquema Temporal (En Prueba)

```typescript
// NUEVO ESQUEMA TEMPORAL - EN PRUEBA
{
  hasTaxes: true,
  ticketType: {
    code: "33" // 1..43
  },
  externalFolio: "OPCIONAL",
  client: {
    id: number,
    address: string,
    email: string,
    name: string,
    municipality: {
      id: number,
      name: string,
      code: string
    },
    line: string,
    code: string,
    additionalAddress: []
  },
  details: [
    {
      product: {
        id: number,
        unit: {
          id: number,
          name: string,
          code: string
        },
        category: {
          id: number,
          otherTax: {
            id: number,
            percent: number,
            name: string,
            code: string
          },
          name: string,
          code: string
        },
        price: number,
        name: string,
        code: string
      },
      quantity: number
    }
  ],
  netTotal: number,
  discounts: [],
  date: string,
  exemptTotal: number,
  otherTaxes: number,
  taxes: number
}
```

## 🔄 Diferencias Clave

### **1. Estructura del Cliente**
| Aspecto | Esquema Original | Nuevo Esquema |
|---------|------------------|---------------|
| **Municipality** | `string` | `object` con `id`, `name`, `code` |
| **ID** | No incluido | `number` requerido |
| **AdditionalAddress** | No incluido | `array` requerido |
| **Line** | String simple | String descriptivo |

### **2. Estructura de Productos**
| Aspecto | Esquema Original | Nuevo Esquema |
|---------|------------------|---------------|
| **Position** | `number` requerido | No incluido |
| **Product ID** | No incluido | `number` requerido |
| **Unit** | `{ code: string }` | `{ id, name, code }` |
| **Category** | No incluido | `object` completo con `otherTax` |
| **Description** | `string` separado | No incluido |

### **3. Campos Adicionales**
| Campo | Esquema Original | Nuevo Esquema |
|-------|------------------|---------------|
| **ticketType** | No incluido | `{ code: "33" }` |
| **total** | Incluido | No incluido |

## 🎯 Ejemplo de Implementación

### **Cliente por Defecto (cuando no hay cliente seleccionado)**
```typescript
{
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
}
```

### **Producto con Impuestos Adicionales**
```typescript
{
  product: {
    id: 121278,
    unit: {
      id: 2,
      name: "Unidad",
      code: "Unid"
    },
    category: {
      id: 1309,
      otherTax: {
        id: 8,
        percent: 12,
        name: "IVA Anticipado harina",
        code: "19"
      },
      name: "Default Category",
      code: "110"
    },
    price: 1000,
    name: "DEMO DEMO DEMO",
    code: "7289317391287"
  },
  quantity: 1
}
```

## 🔍 Logs de Verificación

### **Log de Nuevo Esquema Aplicado**
```
🧪 NUEVO ESQUEMA DE FACTURA APLICADO: {
  ticketType: "33",
  hasClient: true,
  clientName: "FACTURA MOVIL SPA",
  totalItems: 1,
  itemsWithOtherTax: 1
}
```

### **Log de Payload Completo**
```
🧾 PAYLOAD COMPLETO DE FACTURA (NUEVO ESQUEMA): {
  hasTaxes: true,
  ticketType: { code: "33" },
  externalFolio: "OPCIONAL",
  client: {
    id: 80380,
    name: "FACTURA MOVIL SPA",
    code: "76212889-6",
    address: "LAS LOMAS 250 ALTO EL MANZANO",
    email: "",
    municipality: { id: 1, name: "Santiago", code: "13101" },
    line: "Actividad comercial"
  },
  details: [
    {
      product: {
        id: 124932,
        name: "Wisky",
        code: "123456",
        price: 6379,
        hasOtherTax: true
      },
      quantity: 1
    }
  ],
  netTotal: 6379,
  otherTaxes: 1307,
  taxes: 1212,
  date: "2025-08-22",
  exemptTotal: 0
}
```

## ✅ Beneficios del Nuevo Esquema

### **1. Estructura Más Completa**
- ✅ Información completa del cliente con IDs
- ✅ Información completa de productos con IDs
- ✅ Categorías con impuestos adicionales detallados

### **2. Compatibilidad con API**
- ✅ Estructura más cercana a la documentación de Factura Móvil
- ✅ Campos requeridos por la API
- ✅ Información de impuestos más detallada

### **3. Flexibilidad**
- ✅ Cliente por defecto cuando no hay selección
- ✅ Impuestos adicionales por defecto cuando no existen
- ✅ Estructura más robusta

## 🎯 Instrucciones de Prueba

### **Flujo de Prueba**
1. **Agregar productos** al carrito (con o sin impuestos adicionales)
2. **Seleccionar cliente** (opcional - se usará cliente por defecto)
3. **Generar factura** - verificar logs del nuevo esquema
4. **Confirmar** que el payload sigue la nueva estructura

### **Verificaciones**
- ✅ Log `🧪 NUEVO ESQUEMA DE FACTURA APLICADO` aparece
- ✅ Log `🧾 PAYLOAD COMPLETO DE FACTURA (NUEVO ESQUEMA)` muestra la estructura correcta
- ✅ Campo `ticketType: { code: "33" }` está presente
- ✅ Cliente tiene estructura completa con `id`, `municipality`, etc.
- ✅ Productos tienen estructura completa con `id`, `category`, etc.

## 📝 Notas Importantes

- **Temporal**: Este esquema es solo para pruebas
- **Original congelado**: El esquema original se mantiene intacto
- **Reversible**: Se puede volver al esquema original fácilmente
- **Logs detallados**: Se agregaron logs específicos para verificar el funcionamiento

## 🔄 Revertir al Esquema Original

Para volver al esquema original, simplemente reemplazar el payload de facturas con la estructura original que está documentada arriba.
