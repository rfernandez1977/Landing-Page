# Implementación de Impuestos Adicionales - DigiPos

## Problema Identificado

### Descripción del Problema
El carrito de compras no estaba calculando ni mostrando correctamente los impuestos adicionales (`otherTax`) que vienen en los productos de la API de Factura Móvil.

### Síntomas Observados
1. **En el carrito**: Solo se mostraba IVA (19%) pero no impuestos adicionales
2. **En la generación de documentos**: Se usaba un valor fijo de 12% para `otherTaxes`
3. **En el panel de checkout**: Se mostraba un 7% fijo en lugar de calcular los impuestos reales
4. **En boletas y facturas**: No se mostraban los impuestos adicionales

### Causa Raíz
- No se estaban calculando los impuestos adicionales basándose en los productos reales del carrito
- Se usaban valores hardcodeados en lugar de los porcentajes reales de cada producto
- La función `calculateTotal()` solo calculaba el subtotal, sin considerar impuestos adicionales

## Solución Implementada

### 1. Nuevas Funciones de Cálculo

**Archivo**: `components/sections/digipos-page-section.tsx`

```typescript
// Función original (sin cambios)
const calculateTotal = () => {
  return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
};

// Nueva función para calcular impuestos adicionales
const calculateOtherTaxes = () => {
  return cart.reduce((total, item) => {
    // Buscar el producto original para obtener información de impuestos adicionales
    const originalProduct = products.find(p => p.id === item.id);
    if (originalProduct?.category?.otherTax) {
      const itemTotal = item.price * item.quantity;
      return total + (itemTotal * (originalProduct.category.otherTax.percent / 100));
    }
    return total;
  }, 0);
};

// Nueva función para calcular IVA
const calculateIVA = () => {
  return calculateTotal() * 0.19; // 19% IVA
};

// Nueva función para calcular total general
const calculateGrandTotal = () => {
  return calculateTotal() + calculateIVA() + calculateOtherTaxes();
};
```

### 2. Actualización de la Generación de Documentos

**Antes**:
```typescript
otherTaxes: Math.round(calculateTotal() * 0.12), // 12% otros impuestos
taxes: Math.round(calculateTotal() * 0.19) // 19% IVA
```

**Después**:
```typescript
otherTaxes: Math.round(calculateOtherTaxes()), // Impuestos adicionales calculados
taxes: Math.round(calculateIVA()) // 19% IVA
```

### 3. Actualización de la Interfaz del Carrito

#### Panel de Checkout
**Antes**:
```typescript
<div className="flex justify-between text-sm">
  <span className="text-slate-500 dark:text-slate-400">Impuestos</span>
  <span className="font-medium">{formatPrice(calculateTotal() * 0.07)}</span>
</div>
<div className="pt-1.5 mt-1.5 border-t border-slate-200 dark:border-slate-700 flex justify-between">
  <span className="font-semibold">Total</span>
  <span className="font-semibold">{formatPrice(calculateTotal() * 1.07)}</span>
</div>
```

**Después**:
```typescript
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
```

#### Boletas y Facturas
**Antes**:
```typescript
<div className="flex justify-between text-xs mb-1">
  <span>IVA (19%)</span>
  <span>{formatPrice(calculateTotal() * 0.19)}</span>
</div>
<div className="flex justify-between text-sm font-bold mt-2">
  <span>TOTAL</span>
  <span>{formatPrice(calculateTotal() * 1.19)}</span>
</div>
```

**Después**:
```typescript
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
```

## Estructura de Datos de Productos

### Interface de Producto
```typescript
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
```

### Ejemplo de Producto con Impuestos Adicionales
```typescript
{
  id: 1341,
  code: "01",
  name: "Servicio Mensual Plan Copihue",
  price: 38859.07,
  category: {
    id: 1309,
    code: "110",
    name: "Default Category",
    otherTax: {
      id: 8,
      code: "19",
      name: "IVA Anticipado harina",
      percent: 12
    }
  }
}
```

## Flujo de Cálculo

### 1. Cálculo de Impuestos Adicionales
1. Para cada item en el carrito, buscar el producto original en `products`
2. Si el producto tiene `category.otherTax`, calcular el impuesto adicional
3. Fórmula: `itemTotal * (otherTax.percent / 100)`
4. Sumar todos los impuestos adicionales

### 2. Cálculo de IVA
- Se aplica sobre el subtotal: `subtotal * 0.19`

### 3. Cálculo del Total General
- `subtotal + IVA + impuestosAdicionales`

## Comportamiento de la Interfaz

### Condicional de Visualización
Los impuestos adicionales solo se muestran cuando `calculateOtherTaxes() > 0`, es decir, cuando hay productos en el carrito que tienen impuestos adicionales.

### Ubicaciones Actualizadas
1. **Panel de Checkout**: Muestra IVA e impuestos adicionales por separado
2. **Boletas**: Muestra IVA e impuestos adicionales por separado
3. **Facturas**: Muestra IVA e impuestos adicionales por separado
4. **Generación de Documentos**: Envía los valores calculados correctamente

## Archivos Modificados

1. `components/sections/digipos-page-section.tsx`
   - Nuevas funciones de cálculo
   - Actualización de interfaces
   - Actualización de generación de documentos

## Estado Actual

✅ **Funcionando correctamente**
- Los impuestos adicionales se calculan basándose en los productos reales
- Se muestran correctamente en todas las interfaces
- Se envían correctamente en la generación de documentos
- Solo se muestran cuando existen productos con impuestos adicionales

## Consideraciones Futuras

- Los impuestos adicionales se calculan dinámicamente según los productos en el carrito
- Cada producto puede tener su propio porcentaje de impuesto adicional
- La interfaz se adapta automáticamente según la presencia de impuestos adicionales
- Los cálculos son precisos y se redondean correctamente
